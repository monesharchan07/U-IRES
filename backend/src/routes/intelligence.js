'use strict'

const { Router } = require('express')
const intelligenceController = require('../controllers/intelligenceController')

const router = Router()

router.get('/models', intelligenceController.getModels)

router.get('/predict', intelligenceController.validatePredictQuery, intelligenceController.getPrediction)

router.get('/predict-all', intelligenceController.validatePredictAllQuery, intelligenceController.getAllPredictions)

router.get('/optimizer/candidates', intelligenceController.validateOptimizerQuery, intelligenceController.getOptimizerCandidates)

module.exports = router