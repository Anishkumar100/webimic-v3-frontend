import { chromium } from 'playwright';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import puppeteer from 'puppeteer';

import { extractColors } from './extractors/colors.js';
import { extractTypography } from './extractors/typography.js';
import { extractSpacing } from './extractors/spacing.js';
import { extractAnimations } from './extractors/animations.js';
import { extractGradients } from './extractors/gradients.js';
import { extractBorderRadius } from './extractors/borderRadius.js';
import { extractLayout } from './extractors/layout.js';
import { extractComponents } from './extractors/components.js';
import { buildDocA } from './generators/docA.js';
import { buildDocB } from './generators/docB.js';
import { buildLLMContext } from './generators/llmContext.js';
import DesignToken from '../models/DesignToken.js';
import Job from '../models/Job.js';
import { logger } from '../utils/logger.js';
import { capturePageWithPlaywright, USER_AGENTS } from './playwrightCapture.js';

const DEVICE_VIEWPORTS = {
  desktop: { width: 1440, height: 600, deviceScaleFactor: 1 },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3 },
};

// Safety cap for scopeMode='full' — prevents a misconfigured sitemap from
// running forever. Tuned to be generous for portfolio / docs sites.
const FULL_SITE_HARD_CAP = 100;

const RETRYABLE_STATUS = new Set([403, 429, 503]);
const isTimeoutError = (err) => err && /timeout/i.test(err.message || '');
const SETTLE_BY_ATTEMPT = [600, 1200, 2000];

// ─── Webimic Agents — named personas for the live log stream ──────────────────
// Each phase of the pipeline is "owned" by an agent; the WS log payload carries
// the agent name so the UI can render distinct badges instead of raw log lines.
const AGENTS = {
  ORCHESTRATOR: 'Orchestrator',
  CAPTURE: 'Capture Agent',
  CRAWL: 'Crawl Agent',
  UPLOAD: 'Upload Agent',
  COLOR: 'Color Agent',
  TOKEN: 'Token Agent',
  PDF: 'PDF Agent',
  LLM: 'LLM Agent',
};

const emit = (broadcast, { agent, level, message, jobId }) => {
  const time = new Date();
  console.log(`[${agent}] [${level}] ${message}`);
  broadcast({
    type: 'LOG',
    agent,
    level,
    message,
    jobId,
    timestamp: time.toISOString(),
  });
  if (jobId) {
    Job.findByIdAndUpdate(jobId, {
      $push: { processingLog: { time, message, level, agent } }
    }).exec().catch(e => console.error('[Log Persistence]', e.message));
  }
};

const captureWithRetry = async ({ url, viewport, browser, broadcast, jobId, pageLabel }) => {
  let lastErr = null;
  let lastStatus = null;

  for (let attempt = 0; attempt < USER_AGENTS.length; attempt++) {
    const settleMs = SETTLE_BY_ATTEMPT[Math.min(attempt, SETTLE_BY_ATTEMPT.length - 1)];
    const t0 = Date.now();
    try {
      const pg = await capturePageWithPlaywright(url, viewport, {
        fullPage: false,
        gotoTimeoutMs: 300000,
        settleMs,
        browser,
        retryIndex: attempt,
      });

      if (pg.httpStatus && RETRYABLE_STATUS.has(pg.httpStatus)) {
        lastStatus = pg.httpStatus;
        emit(broadcast, {
          agent: AGENTS.CAPTURE,
          level: 'WARN',
          jobId,
          message: `${pageLabel}: HTTP ${pg.httpStatus} on attempt ${attempt + 1}/${USER_AGENTS.length} — rotating user-agent`,
        });
        continue;
      }

      console.log('[Crawler] Captured:', {
        jobId, url, attempt: attempt + 1, httpStatus: pg.httpStatus,
        ms: Date.now() - t0, styleRows: pg.rawStyles.length, links: pg.linkCount,
      });
      return { ...pg, attemptsUsed: attempt + 1 };
    } catch (err) {
      lastErr = err;
      const retryable = isTimeoutError(err);
      emit(broadcast, {
        agent: AGENTS.CAPTURE,
        level: 'WARN',
        jobId,
        message: `${pageLabel}: ${retryable ? 'timeout' : 'error'} on attempt ${attempt + 1}/${USER_AGENTS.length} — ${err.message}`,
      });
      if (!retryable) break;
    }
  }

  const detail = lastStatus ? `HTTP ${lastStatus}` : (lastErr?.message || 'unknown error');
  throw new Error(`Page capture failed after ${USER_AGENTS.length} attempts (${detail})`);
};

const withTiming = async ({ broadcast, agent, jobId, label }, fn) => {
  const t0 = Date.now();
  try {
    const result = await fn();
    const elapsedMs = Date.now() - t0;
    emit(broadcast, {
      agent,
      level: 'INFO',
      jobId,
      message: `${label} completed in ${(elapsedMs / 1000).toFixed(2)}s`,
    });
    return result;
  } catch (err) {
    const elapsedMs = Date.now() - t0;
    emit(broadcast, {
      agent,
      level: 'ERROR',
      jobId,
      message: `${label} failed after ${(elapsedMs / 1000).toFixed(2)}s: ${err.message}`,
    });
    throw err;
  }
};

export const runCrawlAndExtract = async ({
  jobId, url, scopeMode = 'single', maxDepth, devicePreset, userId, queueJob, broadcast,
}) => {
  const startedAt = Date.now();
  const viewport = DEVICE_VIEWPORTS[devicePreset];

  // Resolve effective page budget
  const effectiveBudget = scopeMode === 'full'
    ? FULL_SITE_HARD_CAP
    : (scopeMode === 'single' ? 1 : maxDepth);

  console.log('[Crawler] Job started:', {
    jobId, url, scopeMode, effectiveBudget, devicePreset, userId, queueJobId: queueJob?.id,
  });

  broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 5 });
  emit(broadcast, {
    agent: AGENTS.ORCHESTRATOR, level: 'INFO', jobId,
    message: `Booting analysis for ${url} (${scopeMode === 'full' ? 'full site, cap ' + FULL_SITE_HARD_CAP : scopeMode === 'single' ? 'single page' : 'up to ' + maxDepth + ' pages'})`,
  });

  // ─── STAGE 1: SHARED CAPTURE BROWSER ──────────────────────────────────────
  const captureBrowser = await withTiming(
    { broadcast, agent: AGENTS.CAPTURE, jobId, label: 'Launching headless browser' },
    () => chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
  );

  const crawledPages = [];
  let internalLinksFound = 0;

  try {
    const seen = new Set([url]);
    const queue = [url];

    while (queue.length > 0 && crawledPages.length < effectiveBudget) {
      const nextUrl = queue.shift();
      const pageLabel = scopeMode === 'full'
        ? `page ${crawledPages.length + 1} (queue: ${queue.length})`
        : `page ${crawledPages.length + 1}/${effectiveBudget}`;

      emit(broadcast, {
        agent: AGENTS.CRAWL, level: 'INFO', jobId,
        message: `Visiting ${nextUrl}`,
      });

      const pg = await withTiming(
        { broadcast, agent: AGENTS.CAPTURE, jobId, label: `${pageLabel} captured` },
        () => captureWithRetry({
          url: nextUrl, viewport, browser: captureBrowser, broadcast, jobId, pageLabel,
        })
      );

      crawledPages.push({
        url: pg.url,
        title: pg.title,
        screenshotBuffer: pg.screenshotBuffer,
        fullPageBuffer: pg.fullPageBuffer,
        sectionShots: pg.sectionShots,
        rawStyles: pg.rawStyles,
        rawAnimations: pg.rawAnimations,
        rawAssets: pg.rawAssets,
        sectionText: pg.sectionText,
        links: pg.sameDomainLinks || [],
        order: crawledPages.length,
      });
      internalLinksFound += pg.linkCount;

      emit(broadcast, {
        agent: AGENTS.CRAWL, level: 'SUCCESS', jobId,
        message: `Indexed "${pg.title}" — ${pg.rawStyles.length} style nodes, ${pg.linkCount} internal links`,
      });

      // Enqueue same-domain links we haven't visited yet
      if (crawledPages.length < effectiveBudget) {
        let added = 0;
        for (const link of pg.sameDomainLinks || []) {
          const isMedia = /\.(mp3|mp4|wav|aac|ogg|webm|pdf)$/i.test(link);
          if (!seen.has(link) && !isMedia) {
            seen.add(link);
            queue.push(link);
            added++;
          }
        }
        if (added > 0) {
          emit(broadcast, {
            agent: AGENTS.CRAWL, level: 'INFO', jobId,
            message: `Discovered ${added} new same-domain link${added === 1 ? '' : 's'}; queue depth: ${queue.length}`,
          });
        }
      }

      // Live progress update (5 → 35% across the capture stage)
      const captureProgress = Math.min(
        35,
        5 + Math.round((crawledPages.length / Math.min(effectiveBudget, Math.max(crawledPages.length + queue.length, 1))) * 30)
      );
      broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: captureProgress });
    }

    if (crawledPages.length === 0) {
      throw new Error('Capture Agent returned 0 pages');
    }
  } finally {
    await captureBrowser.close().catch(() => {});
    console.log('[Crawler] Capture browser closed');
  }

  broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 38 });
  emit(broadcast, {
    agent: AGENTS.ORCHESTRATOR, level: 'INFO', jobId,
    message: `Capture phase complete — ${crawledPages.length} page${crawledPages.length === 1 ? '' : 's'} ready for upload`,
  });

  // ─── STAGE 2: UPLOAD SCREENSHOTS TO CLOUDINARY ────────────────────────────
  const pageResults = await withTiming(
    { broadcast, agent: AGENTS.UPLOAD, jobId, label: `Uploaded ${crawledPages.length} screenshot${crawledPages.length === 1 ? '' : 's'}` },
    () => Promise.all(
      crawledPages.map(async (pg, i) => {
        const uploadStartedAt = Date.now();
        const pageNum = i + 1;

        // Primary page screenshot
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `webimic/jobs/${jobId}/screenshots`, public_id: `page-${pageNum}`, resource_type: 'image', format: 'jpg' },
            (err, res) => (err ? reject(err) : resolve(res))
          );
          Readable.from(pg.screenshotBuffer).pipe(stream);
        });

        // Section snapshots (one per viewport while scrolling). Uploaded in
        // parallel; failures are logged but don't abort the page.
        const sections = Array.isArray(pg.sectionShots) ? pg.sectionShots : [];
        console.log(`[Crawler] Page ${pageNum}: Found ${sections.length} sections to upload`);
        const sectionUploads = await Promise.all(sections.map(async (sec, idx) => {
          try {
            const res = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: `webimic/jobs/${jobId}/screenshots/page-${pageNum}-sections`,
                  public_id: `section-${sec.index + 1}`,
                  resource_type: 'image',
                  format: 'jpg',
                },
                (e, r) => (e ? reject(e) : resolve(r))
              );
              Readable.from(sec.buffer).pipe(stream);
            });
            console.log(`[Crawler] Section ${idx + 1}/${sections.length} uploaded: ${res.public_id}`);
            return { index: sec.index, scrollY: sec.scrollY, url: res.secure_url, publicId: res.public_id };
          } catch (e) {
            console.log('[Crawler] Section upload failed:', { pageNum, sectionIndex: sec.index, error: e.message });
            return null;
          }
        }));

        const sectionShotUrls = sectionUploads.filter(Boolean);
        console.log(`[Crawler] Page ${pageNum}: Successfully uploaded ${sectionShotUrls.length}/${sections.length} sections`);

        // Stitched full-page screenshot (single tall image of the whole page).
        let fullPageUrl = null;
        if (pg.fullPageBuffer) {
          try {
            const fpRes = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: `webimic/jobs/${jobId}/screenshots`, public_id: `page-${pageNum}-fullpage`, resource_type: 'image', format: 'jpg' },
                (e, r) => (e ? reject(e) : resolve(r))
              );
              Readable.from(pg.fullPageBuffer).pipe(stream);
            });
            fullPageUrl = fpRes.secure_url;
            console.log(`[Crawler] Page ${pageNum}: Full-page screenshot uploaded`);
          } catch (e) {
            console.log('[Crawler] Full-page upload failed:', { pageNum, error: e.message });
          }
        }

        console.log('[Crawler] Page uploaded:', {
          index: pageNum, total: crawledPages.length,
          publicId: uploadResult.public_id, sections: sectionShotUrls.length,
          fullPage: !!fullPageUrl,
          elapsedMs: Date.now() - uploadStartedAt,
        });

        return {
          url: pg.url, title: pg.title,
          screenshotPublicId: uploadResult.public_id,
          screenshotUrl: uploadResult.secure_url,
          screenshotBuffer: pg.screenshotBuffer,
          fullPageBuffer: pg.fullPageBuffer,
          fullPageUrl,
          sectionShotUrls,
          links: pg.links || [],
          rawStyles: pg.rawStyles, rawAnimations: pg.rawAnimations, rawAssets: pg.rawAssets, sectionText: pg.sectionText, pageOrder: i,
        };
      })
    )
  );

  broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 50 });

  // ─── STAGE 3: TOKEN EXTRACTION ────────────────────────────────────────────
  emit(broadcast, {
    agent: AGENTS.COLOR, level: 'INFO', jobId,
    message: 'Sampling pixels and clustering brand palette',
  });
  const colors = await withTiming(
    { broadcast, agent: AGENTS.COLOR, jobId, label: 'Color extraction' },
    () => extractColors(pageResults)
  );
  for (const pr of pageResults) { pr.screenshotBuffer = null; pr.fullPageBuffer = null; }

  emit(broadcast, {
    agent: AGENTS.TOKEN, level: 'INFO', jobId,
    message: 'Analyzing typography, spacing, and motion tokens',
  });
  const [typography, spacing, animations, gradients, borderRadii, layoutSpecs, components] = await withTiming(
    { broadcast, agent: AGENTS.TOKEN, jobId, label: 'Typography / spacing / animation / advanced tokens extraction' },
    () => Promise.all([
      extractTypography(pageResults),
      extractSpacing(pageResults),
      extractAnimations(pageResults),
      extractGradients(pageResults),
      extractBorderRadius(pageResults),
      extractLayout(pageResults),
      extractComponents(pageResults),
    ])
  );

  const assets = { images: [], svgs: [] };
  const textCopy = [];
  pageResults.forEach(p => {
    if (p.rawAssets) {
      assets.images.push(...(p.rawAssets.images || []));
      assets.svgs.push(...(p.rawAssets.svgs || []));
    }
    if (p.sectionText) {
      textCopy.push(...p.sectionText);
    }
  });

  emit(broadcast, {
    agent: AGENTS.TOKEN, level: 'SUCCESS', jobId,
    message: `Extracted ${colors.length} colors, ${typography.length} typography, ${components.length} components, ${gradients.length} gradients`,
  });
  broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 65 });

  const designTokenDoc = await DesignToken.findOneAndUpdate(
    { jobId },
    { jobId, userId, colors, typography, spacing, animations, gradients, borderRadii, layoutSpecs, components, assets: [assets], textCopy },
    { upsert: true, new: true }
  );

  // ─── STAGE 4 & 5: PDFs + LLM CONTEXT ──────────────────────────────────────
  const pdfBrowser = await withTiming(
    { broadcast, agent: AGENTS.PDF, jobId, label: 'Launching PDF rendering engine' },
    () => puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    })
  );

  try {
    emit(broadcast, {
      agent: AGENTS.PDF, level: 'INFO', jobId,
      message: 'Rendering Doc A (observed spec) and Doc B (AI redesign)',
    });

    const [[docAResult, docBResult], llmContextUrl] = await withTiming(
      { broadcast, agent: AGENTS.PDF, jobId, label: 'Document generation' },
      () => Promise.all([
        Promise.all([
          buildDocA({ jobId, pages: pageResults, tokens: { colors, typography, spacing, animations, gradients, borderRadii, layoutSpecs, components, assets, textCopy }, browser: pdfBrowser }),
          buildDocB({ jobId, tokens: { colors, typography, spacing, animations, gradients, borderRadii, layoutSpecs, components, assets, textCopy }, designTokenDocId: designTokenDoc._id, browser: pdfBrowser, pages: pageResults }),
        ]),
        buildLLMContext({ jobId, url, pages: pageResults, tokens: { colors, typography, spacing, animations, gradients, borderRadii, layoutSpecs, components, assets, textCopy } }),
      ])
    );

    broadcast({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 95 });
    emit(broadcast, {
      agent: AGENTS.LLM, level: 'SUCCESS', jobId,
      message: 'LLM context JSON uploaded — ready to paste into any model',
    });

    const totalMs = Date.now() - startedAt;
    emit(broadcast, {
      agent: AGENTS.ORCHESTRATOR, level: 'SUCCESS', jobId,
      message: `Job complete in ${(totalMs / 1000).toFixed(1)}s — ${pageResults.length} page${pageResults.length === 1 ? '' : 's'}, ${internalLinksFound} links scanned`,
    });

    return {
      pages: pageResults.map(({ url: u, title, screenshotPublicId, screenshotUrl, fullPageUrl, sectionShotUrls, links, pageOrder }) => ({
        url: u, title, screenshotPublicId, screenshotUrl,
        fullPageUrl: fullPageUrl || null,
        sectionShotUrls: sectionShotUrls || [],
        links: links || [],
        pageOrder,
      })),
      pageCount: pageResults.length,
      internalLinksFound,
      tokens: { colors: colors.length, typography: typography.length, spacing: spacing.length, animations: animations.length },
      docAPublicId: docAResult.publicId, docAUrl: docAResult.url, docASize: docAResult.size,
      docBPublicId: docBResult.publicId, docBUrl: docBResult.url,
      llmContextUrl,
    };
  } finally {
    await pdfBrowser.close();
    console.log('[Crawler] Shared PDF browser closed');
  }
};
