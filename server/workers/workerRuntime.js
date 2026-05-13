import { Worker } from 'bullmq';
import Job from '../models/Job.js';
import { redisConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';

let workerInstance = null;

export const startAnalysisWorker = ({ broadcast }) => {
  if (workerInstance) {
    console.log('[WorkerRuntime] Worker already running, skipping re-init');
    return workerInstance;
  }

  const broadcastFn = typeof broadcast === 'function'
    ? broadcast
    : (data) => logger.debug(`[Worker Broadcast] ${data.type}: ${data.message || data.status || ''}`);

  workerInstance = new Worker(
    'webimic-analysis',
    async (queueJob) => {
      const { jobId, url, scopeMode = 'single', maxDepth, devicePreset, userId } = queueJob.data;
      console.log('[Worker] Picked queue job:', queueJob.id, 'jobId:', jobId);
      logger.info(`[Worker] Starting job ${jobId} -> ${url}`);

      try {
        await Job.findByIdAndUpdate(jobId, {
          status: 'processing',
          $push: { processingLog: { time: new Date(), message: 'Worker started', level: 'INFO' } },
        });

        broadcastFn({ type: 'JOB_STATUS_UPDATE', jobId, status: 'processing', progress: 5 });

        const { runCrawlAndExtract } = await import('./crawler.js');
        const result = await runCrawlAndExtract({
          jobId, url, scopeMode, maxDepth, devicePreset, userId, queueJob,
          broadcast: broadcastFn,
        });

        await Job.findByIdAndUpdate(jobId, {
          status: 'completed',
          completedAt: new Date(),
          ...result,
        });

        broadcastFn({ type: 'JOB_STATUS_UPDATE', jobId, status: 'completed', progress: 100 });
        console.log('[Worker] Completed processing for jobId:', jobId);
        logger.info(`[Worker] Completed job ${jobId}`);
      } catch (error) {
        console.log('[Worker] Processing failed for jobId:', jobId, 'error:', error.message);
        logger.error(`[Worker] Failed job ${jobId}: ${error.message}`);
        await Job.findByIdAndUpdate(jobId, {
          status: 'failed',
          error: error.message,
        });
        broadcastFn({ type: 'JOB_STATUS_UPDATE', jobId, status: 'failed', progress: 0 });
      }
    },
    {
      connection: redisConnection,
      // One job at a time avoids multiple Chromium/Puppeteer stacks competing on one machine.
      concurrency: 1,
      // Stalled job settings - crawling + PDF generation can take several minutes
      stalledInterval: 60000,    // Check for stalled jobs every 60s (default 30s)
      maxStalledCount: 5,        // Allow up to 5 stalled checks before failing (5 min grace)
    }
  );

  workerInstance.on('completed', (job) => logger.info(`BullMQ: Job ${job.id} completed`));
  workerInstance.on('failed', (job, err) => logger.error(`BullMQ: Job ${job?.id} failed: ${err.message}`));
  logger.info('[Worker] Webimic analysis worker started, waiting for jobs...');

  return workerInstance;
};

