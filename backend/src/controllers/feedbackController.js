'use strict'

const feedbackService = require('../services/feedbackService')
const { validate } = require('../middleware/validate')
const { z } = require('zod')

const actionIdSchema = z.string().cuid()

const historyQuerySchema = z.object({
  zone: z.enum(['A', 'B']),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
})

async function getFeedbackCycle(req, res, next) {
  try {
    const { actionId } = req.validated
    const cycle = await feedbackService.getFeedbackCycle(actionId)
    res.json(cycle)
  } catch (err) {
    next(err)
  }
}

async function getFeedbackHistory(req, res, next) {
  try {
    const { zone, limit, offset } = req.validated
    const result = await feedbackService.getFeedbackHistory(zone, { limit, offset })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function computeFeedback(req, res, next) {
  try {
    const { actionId } = req.validated
    const result = await feedbackService.computeEffectiveness(actionId)
    res.json({
      success: true,
      ...result
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getFeedbackCycle,
  getFeedbackHistory,
  computeFeedback,
  validateFeedbackActionId: validate(z.object({ actionId: actionIdSchema }), 'params'),
  validateFeedbackHistoryQuery: validate(historyQuerySchema, 'query'),
  validateComputeFeedback: validate(z.object({ actionId: actionIdSchema }), 'params')
}