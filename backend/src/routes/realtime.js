'use strict'

const { Router } = require('express')
const { handleSSE, validateSSEZone } = require('../controllers/realtimeController')

const router = Router()

router.get('/', validateSSEZone, handleSSE)

module.exports = router