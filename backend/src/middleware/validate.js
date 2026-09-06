'use strict'

const { z } = require('zod')

const frontendZoneIdSchema = z.enum(['A', 'B'])

const deviceStateSchema = z.object({
  device: z.enum(['fan', 'light']),
  state: z.enum(['ON', 'OFF'])
})

const actionLogStatusSchema = z.enum(['PENDING', 'SENT', 'ACKNOWLEDGED', 'FAILED'])

const telemetryMetricSchema = z.enum(['temperature', 'humidity', 'occupancy', 'power', 'network'])
const telemetryRangeSchema = z.enum(['1H', '6H', '12H', '24H', '7D', '30D'])
const telemetryReadFilterSchema = z.enum(['true', 'false', 'all'])

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source]
    const result = schema.safeParse(data)
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
}

function validateZoneId(paramName = 'zoneId') {
  return (req, res, next) => {
    const zoneId = req.params[paramName]
    const result = frontendZoneIdSchema.safeParse(zoneId)
    if (!result.success) {
      const err = new Error(`Invalid zone ID: ${zoneId}. Must be 'A' or 'B'`)
      err.code = 'VALIDATION_ERROR'
      err.status = 400
      return next(err)
    }
    req.validated = req.validated || {}
    req.validated.zoneId = result.data
    next()
  }
}

const actionPayloadSchema = z.object({
  zoneId: frontendZoneIdSchema,
  label: z.string().min(1).max(200),
  deviceStates: z.array(deviceStateSchema).min(1),
  source: z.enum(['manual', 'auto', 'uice']).default('manual')
})

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
})

const actionHistoryQuerySchema = paginationSchema.extend({
  status: actionLogStatusSchema.optional()
})

const telemetryHistoryQuerySchema = z.object({
  metric: telemetryMetricSchema,
  range: telemetryRangeSchema,
  anchorValue: z.coerce.number().optional()
})

const notificationQuerySchema = paginationSchema.extend({
  read: telemetryReadFilterSchema.default('all')
})

const markReadSchema = z.object({
  read: z.boolean()
})

module.exports = {
  validate,
  validateZoneId,
  validateActionPayload: validate(actionPayloadSchema),
  validateActionHistoryQuery: validate(actionHistoryQuerySchema, 'query'),
  validateTelemetryHistoryQuery: validate(telemetryHistoryQuerySchema, 'query'),
  validateNotificationQuery: validate(notificationQuerySchema, 'query'),
  validateMarkRead: validate(markReadSchema)
}