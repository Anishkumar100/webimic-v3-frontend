import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { connectRedis } from '../config/redis.js';
import { setupCloudinary } from '../config/cloudinary.js';
import { startAnalysisWorker } from './workerRuntime.js';

import { redisConnection } from '../config/redis.js';

await connectDB();
await connectRedis();
setupCloudinary();
console.log('[WorkerBoot] Worker process initialized');
startAnalysisWorker({
  broadcast: (data) => {
    redisConnection.publish('worker-logs', JSON.stringify(data)).catch(() => {});
  }
});
