'use strict'

/**
 * middleware/notFound.js
 * Catches any request that did not match a registered route
 * and forwards a structured 404 error to the error handler.
 */

module.exports = function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}
