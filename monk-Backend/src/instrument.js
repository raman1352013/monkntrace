const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://37f90ff1bb4f79eb1cbd364ff7acb113@o4511823247310848.ingest.us.sentry.io/4511823274180608",
  integrations: [
    nodeProfilingIntegration(),
  ],

  // Send structured logs to Sentry
  enableLogs: true,
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of transactions
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
});

module.exports = Sentry;
