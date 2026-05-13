// Simple structured logger matching Winston-style API
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const colorize = (level) => {
  const colors = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', debug: '\x1b[90m' };
  return `${colors[level] || ''}${level.toUpperCase()}\x1b[0m`;
};

const timestamp = () => new Date().toISOString();

const log = (level, message, meta = {}) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp()}] ${colorize(level)} ${message}${metaStr}`);
};

export const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
