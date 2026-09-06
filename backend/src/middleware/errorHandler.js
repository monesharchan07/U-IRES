'use strict'

/**
 * middleware/errorHandler.js
 * Centralized Express error-handling middleware.
 * Must be registered last (after all routes and other middleware).
 */

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500
  const isDev = process.env.NODE_ENV !== 'production'

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
      ...(isDev && { stack: err.stack }),
    },
  })
}
