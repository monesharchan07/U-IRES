'use strict'

/**
 * config/index.js
 * Central configuration loaded from environment variables.
 * All other modules must read configuration from here — never from process.env directly.
 */

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
}
