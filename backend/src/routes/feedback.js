'use strict'

const { Router } = require('express')
const feedbackController = require('../controllers/feedbackController')

const router = Router()

router.get('/feedback/:actionId', feedbackController.validateFeedbackActionId, feedbackController.getFeedbackCycle)
router.get('/feedback/history', feedbackController.validateFeedbackHistoryQuery, feedbackController.getFeedbackHistory)
router.post('/feedback/:actionId/compute', feedbackController.validateComputeFeedback, feedbackController.computeFeedback)

module.exports = router