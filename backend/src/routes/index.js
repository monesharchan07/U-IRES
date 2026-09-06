'use strict'

/**
 * routes/index.js
 * Root API router — mounts all sub-routers under /api.
 *
 * Future route modules should be added here as the backend grows:
 *
 *   const campusRoutes     = require('./campus')
 *   const zonesRoutes      = require('./zones')
 *   const sensorsRoutes    = require('./sensors')
 *   const telemetryRoutes  = require('./telemetry')
 *   const actuatorsRoutes  = require('./actuators')
 *   const controlRoutes    = require('./control')
 *   const intelligenceRoutes = require('./intelligence')
 *   const analyticsRoutes  = require('./analytics')
 *
 *   router.use('/campus',       campusRoutes)
 *   router.use('/zones',        zonesRoutes)
 *   router.use('/sensors',      sensorsRoutes)
 *   router.use('/telemetry',    telemetryRoutes)
 *   router.use('/actuators',    actuatorsRoutes)
 *   router.use('/control',      controlRoutes)
 *   router.use('/intelligence', intelligenceRoutes)
 *   router.use('/analytics',    analyticsRoutes)
 */

const { Router } = require('express')
const healthRoutes = require('./health')

const router = Router()

// Health check — always available
router.use('/health', healthRoutes)

module.exports = router
