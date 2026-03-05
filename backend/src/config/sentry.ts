import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from './logger';

/**
 * Initialise Sentry for the backend.
 *
 * Sentry is only activated when SENTRY_DSN is present in the environment.
 * In development or CI environments without a DSN the function is a no-op,
 * so the application boots without errors.
 */
export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN'];

  if (!dsn) {
    logger.info('Sentry DSN not configured — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    release: process.env['APP_VERSION'] ?? '1.0.0',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Capture 100 % of transactions in development; tune down in production.
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.2 : 1.0,
    profilesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    // Do not send PII (IP addresses, user agents) by default.
    sendDefaultPii: false,
  });

  logger.info({ environment: process.env['NODE_ENV'] }, 'Sentry error tracking initialised');
}

/**
 * Capture an exception and forward it to Sentry (if configured).
 * Falls back to a logger.error call when Sentry is not active.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const dsn = process.env['SENTRY_DSN'];
  if (dsn) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  } else {
    logger.error({ err: error, context }, 'Captured exception (Sentry not configured)');
  }
}
