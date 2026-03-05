import * as Sentry from '@sentry/react';

/**
 * Initialise Sentry for the React frontend.
 *
 * Sentry is only activated when VITE_SENTRY_DSN is present in the
 * environment.  When the variable is absent (local dev without a DSN, CI,
 * etc.) the function is a no-op so the application boots without errors.
 *
 * The DSN is injected at build time via Vite's import.meta.env mechanism.
 */
export function initSentry(): void {
  const dsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;

  if (!dsn) {
    // Not an error — just means error tracking is disabled in this environment.
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env['MODE'] ?? 'development',
    release: import.meta.env['VITE_APP_VERSION'] as string | undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and block all media to avoid capturing PII in replays
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Capture 100 % of performance transactions in development
    tracesSampleRate: import.meta.env['MODE'] === 'production' ? 0.2 : 1.0,
    // Capture 10 % of sessions for replay in production
    replaysSessionSampleRate: import.meta.env['MODE'] === 'production' ? 0.1 : 0,
    // Always capture replays for sessions with errors
    replaysOnErrorSampleRate: 1.0,
    // Do not send PII by default
    sendDefaultPii: false,
  });
}

/**
 * Manually capture an exception and send it to Sentry.
 * Safe to call even when Sentry is not initialised.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const dsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;
  if (dsn) {
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    console.error('[Sentry disabled] Captured exception:', error, context);
  }
}
