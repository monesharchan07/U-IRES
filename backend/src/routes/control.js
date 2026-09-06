'use strict'

const { Router } = require('express')
const actionController = require('../controllers/actionController')
const { validateZoneId, validateActionPayload, validateActionHistoryQuery } = require('../middleware/validate')

const router = Router()

router.post('/actions', validateActionPayload, actionController.createAction)

module.exports = router