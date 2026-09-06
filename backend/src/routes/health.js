'use strict'

/**
 * routes/health.js
 * Mounts the health-check endpoint at GET /health.
 * The /api prefix is added by app.js when this router is registered.
 */

const { Router } = require('express')
const { getHealth } = require('../controllers/healthController')

const router = Router()

router.get('/', getHealth)

module.exports = router
