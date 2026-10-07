'use strict'

const WEIGHTS = {
  comfort: 0.45,
  energy: 0.30,
  network: 0.15,
  occupancy: 0.10
}

const COMFORT_TARGET_TEMP = 23.5
const COMFORT_TARGET_HUMIDITY = 55

const FAN_TEMP_IMPACT_HOT = -1.8
const FAN_TEMP_IMPACT_NORMAL = -0.5
const FAN_ENERGY_IMPACT = 13
const LIGHT_ENERGY_IMPACT = 4

const TEMP_HOT_THRESHOLD = 26.5

const ACTION_ORDER = ['fan-on', 'fan-off', 'light-on', 'light-off', 'no-action']

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function computeComfort(temperature, humidity, occupancy, fanOn) {
  const tempComfort = 100 - Math.abs(temperature - COMFORT_TARGET_TEMP) * 11
  const humComfort = 100 - Math.abs(humidity - COMFORT_TARGET_HUMIDITY) * 2.4
  const comfortBase = (tempComfort + humComfort) / 2
  const airflowBonus = fanOn ? 6 : 0
  const crowdPenalty = Math.max(0, occupancy - 8) * 2.2
  return clamp(round1(comfortBase + airflowBonus - crowdPenalty), 0, 100)
}

function computeNetworkImpact(currentNetwork, occupancy) {
  const newNetwork = clamp(currentNetwork - occupancy * 0.6, 60, 100)
  return round1(newNetwork - currentNetwork)
}

function computeEnergyScore(power) {
  return clamp(round1(100 - power * 2.4), 0, 100)
}

function estimateFanTempImpact(temperature) {
  return temperature > TEMP_HOT_THRESHOLD ? FAN_TEMP_IMPACT_HOT : FAN_TEMP_IMPACT_NORMAL
}

function buildNoActionCandidate(currentState) {
  const { temperature, humidity, occupancy, networkHealth, estimatedPower, fanState, lightState } = currentState
  const comfort = computeComfort(temperature, humidity, occupancy, fanState === 'ON')
  const energyScore = computeEnergyScore(estimatedPower)
  const networkScore = clamp(networkHealth - occupancy * 0.6, 60, 100)
  const occupancyScore = clamp(round1(100 - occupancy * 10), 0, 100)
  const score = round1(comfort * WEIGHTS.comfort + energyScore * WEIGHTS.energy + networkScore * WEIGHTS.network + occupancyScore * WEIGHTS.occupancy)

  const hot = temperature > TEMP_HOT_THRESHOLD
  return {
    id: 'no-action',
    label: 'No Action',
    deviceStates: [],
    score: clamp(Math.round(score), 0, 100),
    impacts: {
      energy: 0,
      occupancy: 0,
      network: 0,
      comfort: hot ? -8 : 0
    },
    viable: true,
    reason: hot
      ? `Zone is trending warm (${temperature} °C); passive hold lets heat accumulate.`
      : `Conditions are stable and within the comfort envelope.`
  }
}

function buildFanOnCandidate(currentState) {
  const { temperature, humidity, occupancy, networkHealth, estimatedPower, fanState, lightState } = currentState
  if (fanState === 'ON') return null

  const tempImpact = estimateFanTempImpact(temperature)
  const newTemp = round1(temperature + tempImpact)
  const newPower = estimatedPower + FAN_ENERGY_IMPACT
  const newFanOn = true
  const comfort = computeComfort(newTemp, humidity, occupancy, newFanOn)
  const energyScore = computeEnergyScore(newPower)
  const networkImpact = computeNetworkImpact(networkHealth, occupancy)
  const newNetwork = clamp(networkHealth + networkImpact, 60, 100)
  const networkScore = clamp(newNetwork - occupancy * 0.6, 60, 100)
  const occupancyScore = clamp(round1(100 - occupancy * 10), 0, 100)
  const comfortDelta = round1(comfort - computeComfort(temperature, humidity, occupancy, fanState === 'ON'))
  const score = round1(comfort * WEIGHTS.comfort + energyScore * WEIGHTS.energy + networkScore * WEIGHTS.network + occupancyScore * WEIGHTS.occupancy)

  return {
    id: 'fan-on',
    label: 'Fan ON',
    deviceStates: [{ device: 'fan', state: 'ON' }],
    score: clamp(Math.round(score), 0, 100),
    impacts: {
      energy: FAN_ENERGY_IMPACT,
      occupancy: 0,
      network: Math.round(networkImpact),
      comfort: Math.round(comfortDelta)
    },
    viable: true,
    reason: `Temperature ${temperature} °C sits above the ${TEMP_HOT_THRESHOLD} °C comfort threshold. Air circulation lowers perceived temperature ~${Math.abs(tempImpact).toFixed(1)} °C for an estimated ${FAN_ENERGY_IMPACT} W load.`
  }
}

function buildFanOffCandidate(currentState) {
  const { temperature, humidity, occupancy, networkHealth, estimatedPower, fanState, lightState } = currentState
  if (fanState === 'OFF') return null

  const tempImpact = estimateFanTempImpact(temperature)
  const newTemp = round1(temperature - tempImpact)
  const newPower = estimatedPower - FAN_ENERGY_IMPACT
  const newFanOn = false
  const comfort = computeComfort(newTemp, humidity, occupancy, newFanOn)
  const energyScore = computeEnergyScore(newPower)
  const networkImpact = computeNetworkImpact(networkHealth, occupancy)
  const newNetwork = clamp(networkHealth + networkImpact, 60, 100)
  const networkScore = clamp(newNetwork - occupancy * 0.6, 60, 100)
  const occupancyScore = clamp(round1(100 - occupancy * 10), 0, 100)
  const comfortDelta = round1(comfort - computeComfort(temperature, humidity, occupancy, fanState === 'ON'))
  const score = round1(comfort * WEIGHTS.comfort + energyScore * WEIGHTS.energy + networkScore * WEIGHTS.network + occupancyScore * WEIGHTS.occupancy)

  return {
    id: 'fan-off',
    label: 'Fan OFF',
    deviceStates: [{ device: 'fan', state: 'OFF' }],
    score: clamp(Math.round(score), 0, 100),
    impacts: {
      energy: -FAN_ENERGY_IMPACT,
      occupancy: 0,
      network: Math.round(networkImpact),
      comfort: Math.round(comfortDelta)
    },
    viable: true,
    reason: `Fan is currently ON. Turning it off saves an estimated ${FAN_ENERGY_IMPACT} W with a modest comfort trade-off.`
  }
}

function buildLightOnCandidate(currentState) {
  const { temperature, humidity, occupancy, networkHealth, estimatedPower, fanState, lightState } = currentState
  if (lightState === 'ON') return null

  const newPower = estimatedPower + LIGHT_ENERGY_IMPACT
  const comfort = computeComfort(temperature, humidity, occupancy, fanState === 'ON')
  const energyScore = computeEnergyScore(newPower)
  const networkScore = clamp(networkHealth - occupancy * 0.6, 60, 100)
  const occupancyScore = clamp(round1(100 - occupancy * 10), 0, 100)
  const score = round1(comfort * WEIGHTS.comfort + energyScore * WEIGHTS.energy + networkScore * WEIGHTS.network + occupancyScore * WEIGHTS.occupancy)

  return {
    id: 'light-on',
    label: 'Light ON',
    deviceStates: [{ device: 'light', state: 'ON' }],
    score: clamp(Math.round(score), 0, 100),
    impacts: {
      energy: LIGHT_ENERGY_IMPACT,
      occupancy: 0,
      network: 0,
      comfort: 0
    },
    viable: true,
    reason: `Lighting adds an estimated ${LIGHT_ENERGY_IMPACT} W load.`
  }
}

function buildLightOffCandidate(currentState) {
  const { temperature, humidity, occupancy, networkHealth, estimatedPower, fanState, lightState } = currentState
  if (lightState === 'OFF') return null

  const newPower = estimatedPower - LIGHT_ENERGY_IMPACT
  const comfort = computeComfort(temperature, humidity, occupancy, fanState === 'ON')
  const energyScore = computeEnergyScore(newPower)
  const networkScore = clamp(networkHealth - occupancy * 0.6, 60, 100)
  const occupancyScore = clamp(round1(100 - occupancy * 10), 0, 100)
  const score = round1(comfort * WEIGHTS.comfort + energyScore * WEIGHTS.energy + networkScore * WEIGHTS.network + occupancyScore * WEIGHTS.occupancy)

  return {
    id: 'light-off',
    label: 'Light OFF',
    deviceStates: [{ device: 'light', state: 'OFF' }],
    score: clamp(Math.round(score), 0, 100),
    impacts: {
      energy: -LIGHT_ENERGY_IMPACT,
      occupancy: 0,
      network: 0,
      comfort: occupancy >= 6 ? -6 : -2
    },
    viable: true,
    reason: `Lighting contributes an estimated ${LIGHT_ENERGY_IMPACT} W load; switching off saves energy with minor comfort trade-off.`
  }
}

function buildCandidates(currentState) {
  const candidates = [
    buildFanOnCandidate(currentState),
    buildFanOffCandidate(currentState),
    buildLightOnCandidate(currentState),
    buildLightOffCandidate(currentState),
    buildNoActionCandidate(currentState)
  ].filter(Boolean)

  return candidates
}

function pickRecommendation(candidates) {
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return ACTION_ORDER.indexOf(a.id) - ACTION_ORDER.indexOf(b.id)
  })
  return sorted[0]?.id || null
}

function generateOptimizerResult(zoneId, currentState, predictions = null) {
  const candidates = buildCandidates(currentState)
  const recommendedId = pickRecommendation(candidates)

  const modelMeta = {
    type: 'rule_based_v1',
    weights: { ...WEIGHTS },
    inputs: {
      temperature: currentState.temperature,
      humidity: currentState.humidity,
      occupancy: currentState.occupancy,
      networkHealth: currentState.networkHealth,
      estimatedPower: currentState.estimatedPower,
      fanState: currentState.fanState,
      lightState: currentState.lightState
    },
    predictionsRetrieved: !!predictions,
    predictionsInfluencedScoring: false
  }

  if (predictions) {
    modelMeta.predictionHorizonHours = predictions.horizonHours || 6
  }

  return {
    zoneId,
    candidates,
    recommendedId,
    computedAt: new Date().toISOString(),
    modelMeta
  }
}

module.exports = {
  generateOptimizerResult,
  WEIGHTS,
  COMFORT_TARGET_TEMP,
  COMFORT_TARGET_HUMIDITY,
  FAN_TEMP_IMPACT_HOT,
  FAN_TEMP_IMPACT_NORMAL,
  FAN_ENERGY_IMPACT,
  LIGHT_ENERGY_IMPACT,
  TEMP_HOT_THRESHOLD,
  ACTION_ORDER,
  computeComfort,
  computeNetworkImpact,
  computeEnergyScore,
  estimateFanTempImpact,
  buildCandidates,
  pickRecommendation
}