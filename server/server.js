import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { setupCloudinary } from './config/cloudinary.js';

import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import tokensRouter from './routes/tokens.js';
import workersRouter from './routes/workers.js';
import settingsRouter from './routes/settings.js';

import { generalLimiter } from './middleware/rateLimit.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);

// WebSocket server — used by Pipelines.jsx for live worker status
export const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
  if (process.env.DEBUG_WS === '1') console.log('[WS] Client connected');
  logger.info('WebSocket client connected');
  ws.on('close', () => logger.info('WebSocket client disconnected'));
});

// Broadcast to all connected WS clients (used by worker processor)
export const broadcast = (data) => {
  if (process.env.DEBUG_WS === '1') {
    console.log('[WS] Broadcast event:', data?.type || 'UNKNOWN');
  }
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
};

import { redisConnection } from './config/redis.js';
const pubsubRedis = redisConnection.duplicate();
pubsubRedis.subscribe('worker-logs');
pubsubRedis.on('message', (channel, message) => {
  if (channel === 'worker-logs') {
    try {
      broadcast(JSON.parse(message));
    } catch (e) {}
  }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(generalLimiter);
if (process.env.DEBUG_HTTP === '1') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes — all prefixed with /v1
app.use('/v1/auth', authRouter);
app.use('/v1/jobs', jobsRouter);
app.use('/v1/tokens', tokensRouter);
app.use('/v1/workers', workersRouter);
app.use('/v1/settings', settingsRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 8000;

const start = async () => {
  console.log('[Boot] Starting Webimic API server...');
  await connectDB();
  console.log('[Boot] MongoDB connected');
  await connectRedis();
  console.log('[Boot] Redis connected');
  setupCloudinary();
  console.log('[Boot] Cloudinary configured');

  httpServer.listen(PORT, () => {
    console.log(`[Boot] API listening on port ${PORT}`);
    logger.info(`Webimic API running on port ${PORT}`);
    logger.info(`WebSocket server running on ws://localhost:${PORT}/ws`);

    if (process.env.DISABLE_EMBEDDED_WORKER !== 'true') {
      setImmediate(async () => {
        try {
          const { startAnalysisWorker } = await import('./workers/workerRuntime.js');
          startAnalysisWorker({ broadcast });
          console.log('[Boot] Embedded worker started (lazy). Set DISABLE_EMBEDDED_WORKER=true to disable.');
        } catch (e) {
          console.error('[Boot] Failed to start embedded worker:', e.message);
          logger.error(`Embedded worker failed: ${e.message}`);
        }
      });
    } else {
      console.log('[Boot] Embedded worker disabled by env');
    }
  });
};

start();
