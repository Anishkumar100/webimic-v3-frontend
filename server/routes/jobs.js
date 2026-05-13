import { Router } from 'express';
import { z } from 'zod';
import Job from '../models/Job.js';
import DesignToken from '../models/DesignToken.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { jobSubmitLimiter } from '../middleware/rateLimit.js';
import { analysisQueue, enqueueAnalysisJob } from '../config/queue.js';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

const router = Router();

const PLAN_LIMITS = { free: Infinity, pro: Infinity, enterprise: Infinity };

// ─── CREATE JOB ────────────────────────────────────────────────────────────
const createJobSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().optional(),
  scopeMode: z.enum(['single', 'full']).default('single'),
  // maxDepth is now only meaningful for legacy clients. New clients send scopeMode.
  maxDepth: z.number().int().min(1).max(200).default(1),
  devicePreset: z.enum(['desktop', 'tablet', 'mobile']).default('desktop'),
});

router.post('/', requireAuth, jobSubmitLimiter, validate(createJobSchema), async (req, res, next) => {
  try {
    const { url, name, scopeMode, maxDepth, devicePreset } = req.validated;
    console.log('[JobsRoute] Create job requested by userId:', req.user._id.toString(), 'url:', url, 'scopeMode:', scopeMode);

    // Plan limits are temporarily disabled for MVP testing.

    // Default name to hostname if not provided
    let jobName = name;
    if (!jobName) {
      try { jobName = new URL(url).hostname; } catch { jobName = url; }
    }

    const job = await Job.create({
      userId: req.user._id,
      name: jobName,
      url,
      scopeMode,
      maxDepth,
      devicePreset,
      status: 'queued',
    });

    // Add to BullMQ queue
    const queueJobId = await enqueueAnalysisJob({
      jobId: job._id.toString(),
      url,
      scopeMode,
      maxDepth,
      devicePreset,
      userId: req.user._id.toString(),
    });

    job.queueJobId = queueJobId;
    await job.save();

    // Increment usage
    req.user.jobsUsedThisMonth += 1;
    await req.user.save();

    logger.info(`Job created: ${job._id} → ${url}`);
    console.log('[JobsRoute] Job created:', job._id.toString(), 'queueJobId:', queueJobId);
    res.status(201).json(job.toJSON());
  } catch (err) {
    next(err);
  }
});

// ─── LIST JOBS ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status = 'all', search = '', page = '1', limit = '20' } = req.query;
    console.log('[JobsRoute] List jobs for userId:', req.user._id.toString(), 'status:', status, 'search:', search);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { url: regex }];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs: jobs.map((j) => j.toJSON()),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET JOB DETAIL ────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    console.log('[JobsRoute] Get job detail:', req.params.id, 'userId:', req.user._id.toString());
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      console.log('[JobsRoute] Job not found:', req.params.id);
      return res.status(404).json({ error: 'Job not found' });
    }

    // Populate design tokens
    const designTokenDoc = await DesignToken.findOne({ jobId: job._id });

    const result = job.toJSON();
    result.designTokens = designTokenDoc ? {
      colors: designTokenDoc.colors || [],
      typography: designTokenDoc.typography || [],
      spacing: designTokenDoc.spacing || [],
      animations: designTokenDoc.animations || [],
    } : { colors: [], typography: [], spacing: [], animations: [] };

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── GET JOB STATUS (LIGHTWEIGHT POLL) ─────────────────────────────────────
router.get('/:id/status', requireAuth, async (req, res, next) => {
  try {
    console.log('[JobsRoute] Get job status:', req.params.id, 'userId:', req.user._id.toString());
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id })
      .select('status tokens pageCount completedAt error');
    const fullJob = await Job.findOne({ _id: req.params.id, userId: req.user._id }).select('queueJobId');
    if (!job) {
      console.log('[JobsRoute] Status lookup not found:', req.params.id);
      return res.status(404).json({ error: 'Job not found' });
    }

    let queueState = null;
    let queueAttempts = 0;
    let queueDelay = 0;
    try {
      if (fullJob?.queueJobId) {
        const qJob = await analysisQueue.getJob(fullJob.queueJobId);
        if (qJob) {
          queueState = await qJob.getState();
          queueAttempts = qJob.attemptsMade || 0;
          queueDelay = qJob.delay || 0;
        } else {
          queueState = 'not-found';
        }
      } else {
        queueState = 'no-queue-id';
      }
    } catch (queueErr) {
      queueState = 'queue-check-failed';
      console.log('[JobsRoute] Queue status check failed:', queueErr.message);
    }
    console.log('[JobsRoute] Status payload:', {
      id: req.params.id,
      status: job.status,
      queueState,
      queueAttempts,
      pageCount: job.pageCount,
    });

    res.json({
      id: req.params.id,
      status: job.status,
      tokens: job.tokens,
      pageCount: job.pageCount,
      completedAt: job.completedAt,
      error: job.error,
      queueState,
      queueAttempts,
      queueDelay,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DOWNLOAD PDF (PROXY) ──────────────────────────────────────────────────
// Cloudinary serves raw uploads with Content-Disposition: inline by default,
// and the `fl_attachment` flag does not apply to raw resources the same way
// it does to image/video. We proxy the file ourselves so we can set the
// attachment header and avoid the cross-origin <a download> restriction.
const DOC_FIELD = {
  a: { url: 'docAUrl', publicId: 'docAPublicId' },
  b: { url: 'docBUrl', publicId: 'docBPublicId' },
};
const stripLegacyFlag = (u) => (u || '').replace(/\/upload\/fl_attachment:[^/]+\//, '/upload/');

router.get('/:id/download/:doc', requireAuth, async (req, res, next) => {
  try {
    const docKey = String(req.params.doc || '').toLowerCase();
    const fields = DOC_FIELD[docKey];
    if (!fields) return res.status(400).json({ error: 'doc must be "a" or "b"' });

    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id })
      .select(`${fields.url} ${fields.publicId} name`);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const filename = `webimic-doc-${docKey}-${req.params.id}.pdf`;

    // Build candidate URLs to try in order. Signed URL first — works even when
    // Cloudinary's account-level "Allow PDF delivery" toggle is off, since the
    // signature authorises the fetch. Fallback to the stored unsigned URL with
    // any stale fl_attachment flag scrubbed.
    const candidates = [];
    if (job[fields.publicId]) {
      try {
        const signed = cloudinary.utils.url(job[fields.publicId], {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true,
        });
        if (signed) candidates.push(signed);
      } catch (signErr) {
        console.log('[JobsRoute] PDF signed-URL build failed:', signErr.message);
      }
    }
    const stored = stripLegacyFlag(job[fields.url]);
    if (stored && !candidates.includes(stored)) candidates.push(stored);

    if (!candidates.length) return res.status(404).json({ error: 'PDF not generated for this job' });

    let upstream = null;
    let lastStatus = null;
    for (const candidate of candidates) {
      const resp = await fetch(candidate);
      if (resp.ok) { upstream = resp; break; }
      lastStatus = resp.status;
      console.log('[JobsRoute] PDF candidate failed:', { jobId: req.params.id, docKey, status: resp.status });
    }

    if (!upstream) {
      return res.status(502).json({ error: `PDF asset unreachable (Cloudinary returned ${lastStatus}); re-run the job or enable PDF delivery in Cloudinary settings` });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const len = upstream.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err) {
    next(err);
  }
});

// ─── RETRY JOB ────────────────────────────────────────────────────────────
router.post('/:id/retry', requireAuth, async (req, res, next) => {
  try {
    console.log('[JobsRoute] Retry job requested:', req.params.id, 'userId:', req.user._id.toString());
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      console.log('[JobsRoute] Retry target not found:', req.params.id);
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed jobs can be retried' });
    }

    // Reset job status
    job.status = 'queued';
    job.error = null;
    job.completedAt = null;
    
    // Remove existing job from queue if it exists to allow re-adding
    if (job.queueJobId) {
      try {
        const existingJob = await analysisQueue.getJob(job.queueJobId);
        if (existingJob) {
          await existingJob.remove();
          console.log('[JobsRoute] Removed existing job from queue:', job.queueJobId);
        }
      } catch (queueErr) {
        console.log('[JobsRoute] Failed to remove existing job from queue:', queueErr.message);
      }
    }

    // Add to BullMQ queue again
    const queueJobId = await enqueueAnalysisJob({
      jobId: job._id.toString(),
      url: job.url,
      scopeMode: job.scopeMode,
      maxDepth: job.maxDepth,
      devicePreset: job.devicePreset,
      userId: req.user._id.toString(),
    });

    job.queueJobId = queueJobId;
    await job.save();

    logger.info(`Job retried: ${job._id} → ${job.url}`);
    console.log('[JobsRoute] Job retried:', job._id.toString(), 'queueJobId:', queueJobId);
    res.json(job.toJSON());
  } catch (err) {
    next(err);
  }
});

// ─── DELETE JOB ────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    console.log('[JobsRoute] Delete job requested:', req.params.id, 'userId:', req.user._id.toString());
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      console.log('[JobsRoute] Delete target not found:', req.params.id);
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete Cloudinary assets (non-blocking — don't fail if Cloudinary is down)
    try {
      const folder = `webimic/jobs/${job._id}`;
      await cloudinary.api.delete_resources_by_prefix(folder);
      await cloudinary.api.delete_folder(folder).catch(() => {});
    } catch (e) {
      logger.warn(`Failed to cleanup Cloudinary for job ${job._id}: ${e.message}`);
    }

    // Delete associated design tokens
    await DesignToken.deleteOne({ jobId: job._id });

    // Delete the job itself
    await Job.deleteOne({ _id: job._id });

    logger.info(`Job deleted: ${job._id}`);
    console.log('[JobsRoute] Job deleted:', job._id.toString());
    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
