'use strict'

/**
 * controllers/healthController.js
 * Handles GET /api/health
 */

function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'u-ires-backend',
  })
}

module.exports = { getHealth }
