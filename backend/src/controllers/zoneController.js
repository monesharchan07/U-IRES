'use strict'

const zoneService = require('../services/zoneService')

async function getAllZones(req, res, next) {
  try {
    const zones = await zoneService.getAllZones()
    res.json(zones)
  } catch (err) {
    next(err)
  }
}

async function getZoneById(req, res, next) {
  try {
    const { zoneId } = req.validated
    const zone = await zoneService.getZoneByFrontendId(zoneId)
    if (!zone) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }
    res.json(zone)
  } catch (err) {
    next(err)
  }
}

async function getZoneDevices(req, res, next) {
  try {
    const { zoneId } = req.validated
    const devices = await zoneService.getZoneDevices(zoneId)
    if (devices === null) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }
    res.json(devices)
  } catch (err) {
    next(err)
  }
}

async function resumeZoneAutomation(req, res, next) {
  try {
    const { zoneId } = req.validated
    const zone = await zoneService.setZoneControlMode(zoneId, 'AUTO')
    if (!zone) {
      const err = new Error(`Zone not found: ${zoneId}`)
      err.code = 'NOT_FOUND'
      err.status = 404
      return next(err)
    }
    res.json({
      success: true,
      message: `Automation resumed for Zone ${zoneId}`
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllZones,
  getZoneById,
  getZoneDevices,
  resumeZoneAutomation
}