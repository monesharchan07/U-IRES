'use strict'

const { Router } = require('express')
const zoneController = require('../controllers/zoneController')
const telemetryController = require('../controllers/telemetryController')
const actuatorController = require('../controllers/actuatorController')
const actionController = require('../controllers/actionController')
const { validateZoneId, validateTelemetryHistoryQuery, validateActionHistoryQuery } = require('../middleware/validate')

const router = Router()

router.get('/', zoneController.getAllZones)
router.get('/:zoneId', validateZoneId(), zoneController.getZoneById)
router.get('/:zoneId/devices', validateZoneId(), zoneController.getZoneDevices)
router.get('/:zoneId/telemetry', validateZoneId(), telemetryController.getLatestTelemetry)
router.get('/:zoneId/telemetry/history', validateZoneId(), validateTelemetryHistoryQuery, telemetryController.getTelemetryHistory)
router.get('/:zoneId/actuators', validateZoneId(), actuatorController.getActuators)
router.get('/:zoneId/actions', validateZoneId(), validateActionHistoryQuery, actionController.getActionHistory)
router.post('/:zoneId/resume', validateZoneId(), zoneController.resumeZoneAutomation)

module.exports = router