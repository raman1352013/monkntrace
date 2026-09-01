let Sentry = null;

try {
  Sentry = require("@sentry/node");
  let integrations = [];
  try {
    const profiling = require("@sentry/profiling-node");
    if (profiling && profiling.nodeProfilingIntegration) {
      integrations.push(profiling.nodeProfilingIntegration());
    }
  } catch (profErr) {
    // profiling-node native build often fails on Node 20+/Linux, safely ignore
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://37f90ff1bb4f79eb1cbd364ff7acb113@o4511823247310848.ingest.us.sentry.io/4511823274180608",
    integrations,
    enableLogs: true,
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: 'trace',
  });
} catch (err) {
  console.warn('[SENTRY] @sentry/node not loaded or failed:', err.message);
  Sentry = {
    setupExpressErrorHandler: () => {},
    captureException: (e) => console.error('[SentryMock]', e),
    captureMessage: (m) => console.log('[SentryMock]', m),
  };
}

module.exports = Sentry;
