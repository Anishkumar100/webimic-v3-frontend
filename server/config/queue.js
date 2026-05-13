import { Queue } from 'bullmq';
import { redisConnection } from './redis.js';

export const analysisQueue = new Queue('webimic-analysis', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// Helper to add a job to the queue
export const enqueueAnalysisJob = async ({ jobId, url, scopeMode, maxDepth, devicePreset, userId }) => {
  console.log('[Queue] Enqueue analysis job:', { jobId, url, scopeMode, maxDepth, devicePreset, userId });
  const queueJob = await analysisQueue.add(
    'crawl-and-extract',
    { jobId, url, scopeMode, maxDepth, devicePreset, userId },
    {
      jobId: jobId.toString(), // Use MongoDB _id as BullMQ job ID
      priority: 1,
    }
  );
  console.log('[Queue] Enqueued BullMQ job id:', queueJob.id);
  return queueJob.id;
};
