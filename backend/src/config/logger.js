/**
 * Structured logger with request ID tracking.
 * In production: JSON format for log aggregation (compatible with Cloud Logging).
 * In development: Human-readable format.
 */
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

function formatLog(level, message, meta = {}) {
  if (isProduction) {
    return JSON.stringify({
      severity: level.toUpperCase(), // GCP Cloud Logging format
      level,
      message,
      timestamp: new Date().toISOString(),
      service: 'hostn-backend',
      ...meta,
    });
  }
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  info(message, meta) {
    console.log(formatLog('info', message, meta));
  },
  warn(message, meta) {
    console.warn(formatLog('warn', message, meta));
  },
  error(message, meta) {
    console.error(formatLog('error', message, meta));
  },
  debug(message, meta) {
    if (!isProduction) {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

/**
 * Express middleware: attach requestId and log request/response times.
 */
function requestLogger() {
  return (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.requestId);

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      // Only log non-health requests in production, everything in dev
      if (isProduction && req.path.startsWith('/health')) return;

      const meta = {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      if (res.statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
      } else if (res.statusCode >= 400) {
        logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
      } else if (duration > 2000) {
        logger.warn(`Slow request: ${req.method} ${req.originalUrl}`, meta);
      }
    });

    next();
  };
}

module.exports = logger;
module.exports.requestLogger = requestLogger;
