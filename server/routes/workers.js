import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analysisQueue } from '../config/queue.js';

const router = Router();

// ─── GET WORKER / QUEUE STATUS ─────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res, next) => {
  try {
    console.log('[WorkersRoute] Worker status requested by userId:', req.user._id.toString());
    // Get queue counts
    const [waiting, active, completed, failed] = await Promise.all([
      analysisQueue.getWaitingCount(),
      analysisQueue.getActiveCount(),
      analysisQueue.getCompletedCount(),
      analysisQueue.getFailedCount(),
    ]);

    // Get active jobs
    const activeJobs = await analysisQueue.getActive();

    const workers = [
      {
        id: 'w-01',
        status: activeJobs.length > 0 ? 'active' : 'idle',
        load: activeJobs.length > 0 ? Math.min(95, 40 + activeJobs.length * 25) : 5,
        currentTask: activeJobs[0] ? `Analyzing ${activeJobs[0].data.url}` : 'Waiting for jobs',
        region: 'local',
      },
      {
        id: 'w-02',
        status: activeJobs.length > 1 ? 'active' : 'idle',
        load: activeJobs.length > 1 ? Math.min(90, 30 + activeJobs.length * 20) : 3,
        currentTask: activeJobs[1] ? `Analyzing ${activeJobs[1].data.url}` : 'Waiting for jobs',
        region: 'local',
      },
    ];

    res.json({
      queueDepth: waiting,
      activeWorkers: active,
      tokensExtractedToday: completed * 42, // Approximate
      workers,
      logs: [], // Logs come via WebSocket in real-time
    });
  } catch (err) {
    next(err);
  }
});

export default router;
