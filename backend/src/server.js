'use strict'

/**
 * server.js
 * Process entry point.
 * Loads environment variables, starts the HTTP server,
 * and handles clean shutdown signals.
 */

require('dotenv').config()

const app = require('./app')
const { port, nodeEnv } = require('./config')

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[U-IRES] Backend running on http://localhost:${port}  (${nodeEnv})`)
  console.log(`[U-IRES] Health endpoint → http://localhost:${port}/api/health`)
})

server.on('error', (err) => {
  console.error('[U-IRES] Server error:', err)
})

// ── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n[U-IRES] Received ${signal} — shutting down gracefully...`)
  server.close(() => {
    console.log('[U-IRES] HTTP server closed.')
    process.exit(0)
  })

  // Force-exit if the server doesn't close within 10 s
  setTimeout(() => {
    console.error('[U-IRES] Forced exit after timeout.')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
