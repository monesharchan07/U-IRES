'use strict'

/**
 * prisma/seed/index.js
 * Static configuration seed for U-IRES.
 * Creates zones and prototype devices only.
 * Does NOT generate fake telemetry, AI predictions, or optimization results.
 */

const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function main() {
  console.log('[Seed] Starting static configuration seed...')

  // ── Zone A ───────────────────────────────────────────────────────────────────
  const zoneA = await prisma.zone.upsert({
    where: { name: 'Zone A' },
    update: {},
    create: {
      name: 'Zone A',
      location: 'Building A, Floor 1',
      capacity: 50,
      controlMode: 'AUTO',
      mapX: 100,
      mapY: 100,
    },
  })
  console.log('[Seed] Zone A created/updated:', zoneA.id)

  // ── Zone B ───────────────────────────────────────────────────────────────────
  const zoneB = await prisma.zone.upsert({
    where: { name: 'Zone B' },
    update: {},
    create: {
      name: 'Zone B',
      location: 'Building B, Floor 2',
      capacity: 30,
      controlMode: 'AUTO',
      mapX: 300,
      mapY: 200,
    },
  })
  console.log('[Seed] Zone B created/updated:', zoneB.id)

  // ── Sensor Nodes for Zone A ──────────────────────────────────────────────────
  const sensorNodeA1 = await prisma.device.upsert({
    where: { id: 'sensor-node-a-001' },
    update: {},
    create: {
      id: 'sensor-node-a-001',
      zoneId: zoneA.id,
      deviceType: 'SENSOR_NODE',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Sensor Node A1 created/updated:', sensorNodeA1.id)

  const sensorNodeA2 = await prisma.device.upsert({
    where: { id: 'sensor-node-a-002' },
    update: {},
    create: {
      id: 'sensor-node-a-002',
      zoneId: zoneA.id,
      deviceType: 'SENSOR_NODE',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Sensor Node A2 created/updated:', sensorNodeA2.id)

  // ── Sensor Nodes for Zone B ──────────────────────────────────────────────────
  const sensorNodeB1 = await prisma.device.upsert({
    where: { id: 'sensor-node-b-001' },
    update: {},
    create: {
      id: 'sensor-node-b-001',
      zoneId: zoneB.id,
      deviceType: 'SENSOR_NODE',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Sensor Node B1 created/updated:', sensorNodeB1.id)

  const sensorNodeB2 = await prisma.device.upsert({
    where: { id: 'sensor-node-b-002' },
    update: {},
    create: {
      id: 'sensor-node-b-002',
      zoneId: zoneB.id,
      deviceType: 'SENSOR_NODE',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Sensor Node B2 created/updated:', sensorNodeB2.id)

  // ── Fan Actuator for Zone A ──────────────────────────────────────────────────
  const fanA = await prisma.device.upsert({
    where: { id: 'fan-a-001' },
    update: {},
    create: {
      id: 'fan-a-001',
      zoneId: zoneA.id,
      deviceType: 'FAN',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Fan A created/updated:', fanA.id)

  // ── Light Actuator for Zone A ────────────────────────────────────────────────
  const lightA = await prisma.device.upsert({
    where: { id: 'light-a-001' },
    update: {},
    create: {
      id: 'light-a-001',
      zoneId: zoneA.id,
      deviceType: 'LIGHT',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Light A created/updated:', lightA.id)

  // ── Fan Actuator for Zone B ──────────────────────────────────────────────────
  const fanB = await prisma.device.upsert({
    where: { id: 'fan-b-001' },
    update: {},
    create: {
      id: 'fan-b-001',
      zoneId: zoneB.id,
      deviceType: 'FAN',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Fan B created/updated:', fanB.id)

  // ── Light Actuator for Zone B ────────────────────────────────────────────────
  const lightB = await prisma.device.upsert({
    where: { id: 'light-b-001' },
    update: {},
    create: {
      id: 'light-b-001',
      zoneId: zoneB.id,
      deviceType: 'LIGHT',
      status: 'ONLINE',
      lastPingAt: new Date(),
    },
  })
  console.log('[Seed] Light B created/updated:', lightB.id)

  console.log('[Seed] Static configuration seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })