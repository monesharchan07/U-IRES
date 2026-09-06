'use strict'

/**
 * middleware/errorHandler.js
 * Centralized Express error-handling middleware.
 * Must be registered last (after all routes and other middleware).
 */

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500
  const isDev = process.env.NODE_ENV !== 'production'

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || {},
      ...(isDev && { stack: err.stack }),
    },
  })
}
