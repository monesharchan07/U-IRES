'use strict'

const { Router } = require('express')
const intelligenceController = require('../controllers/intelligenceController')
const feedbackController = require('../controllers/feedbackController')

const router = Router()

router.get('/models', intelligenceController.getModels)

router.get('/predict', intelligenceController.validatePredictQuery, intelligenceController.getPrediction)

router.get('/predict-all', intelligenceController.validatePredictAllQuery, intelligenceController.getAllPredictions)

router.get('/optimizer/candidates', intelligenceController.validateOptimizerQuery, intelligenceController.getOptimizerCandidates)

router.get('/feedback/history', feedbackController.validateFeedbackHistoryQuery, feedbackController.getFeedbackHistory)
router.get('/feedback/:actionId', feedbackController.validateFeedbackActionId, feedbackController.getFeedbackCycle)
router.post('/feedback/:actionId/compute', feedbackController.validateComputeFeedback, feedbackController.computeFeedback)

module.exports = router