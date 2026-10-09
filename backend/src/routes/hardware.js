'use strict'

const { Router } = require('express')
const hardwareController = require('../controllers/hardwareController')
const { validateDevice } = require('../middleware/deviceAuth')
const { z } = require('zod')

const router = Router()

const zoneQuerySchema = z.object({
  zone: z.enum(['A', 'B'])
})

function validateZoneQuery(req, res, next) {
  const result = zoneQuerySchema.safeParse(req.query)
  if (!result.success) {
    const err = new Error('Validation failed')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    err.details = result.error.flatten().fieldErrors
    return next(err)
  }
  req.validated = { ...(req.validated || {}), ...result.data }
  next()
}

router.get('/commands/next', validateZoneQuery, validateDevice, hardwareController.getNextCommand)
router.post('/commands/ack', validateDevice, hardwareController.acknowledgeCommand)
router.post('/reconcile', hardwareController.triggerReconciliation)

module.exports = router