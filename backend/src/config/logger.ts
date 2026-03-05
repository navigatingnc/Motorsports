import pino from 'pino';

/**
 * Structured logger using Pino.
 *
 * In development (NODE_ENV !== 'production') the output is pretty-printed via
 * pino-pretty so it is human-readable in the terminal.  In production the
 * output is newline-delimited JSON, which is ideal for log-aggregation
 * pipelines (e.g. Loki, CloudWatch, Datadog).
 */
const isDevelopment = process.env['NODE_ENV'] !== 'production';

const logger = pino(
  {
    level: process.env['LOG_LEVEL'] ?? 'info',
    base: {
      pid: process.pid,
      service: 'motorsports-api',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Redact sensitive fields from log output
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
      censor: '[REDACTED]',
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  },
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      })
    : undefined,
);

export default logger;
