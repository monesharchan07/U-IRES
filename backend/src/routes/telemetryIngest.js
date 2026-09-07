'use strict'

const { Router } = require('express')
const telemetryIngestController = require('../controllers/telemetryIngestController')
const { validateTelemetryIngest } = require('../middleware/validate')

const router = Router()

router.post('/ingest', validateTelemetryIngest, telemetryIngestController.ingest)

module.exports = router