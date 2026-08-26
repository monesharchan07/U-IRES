export const CAMPUS = {
  name: 'VIT Campus',
  system: 'U-IRES',
  fullName: 'Unified Intelligent Resource & Environment System',
}

export const ZONES = [
  {
    id: 'A',
    name: 'Zone A',
    location: 'Tech Block · Wing 1',
    capacity: 14,
    map: { x: 34, y: 42 },
    iso: { x: 88, y: 96 },
  },
  {
    id: 'B',
    name: 'Zone B',
    location: 'Tech Block · Wing 2',
    capacity: 10,
    map: { x: 68, y: 60 },
    iso: { x: 196, y: 128 },
  },
]

export const METRICS = {
  temperature: { key: 'temperature', label: 'Temperature', short: 'TEMP', unit: '°C', digits: 1, icon: 'thermo' },
  humidity: { key: 'humidity', label: 'Humidity', short: 'HUM', unit: '%', digits: 0, icon: 'drop' },
  occupancy: { key: 'occupancy', label: 'Occupancy', short: 'OCC', unit: 'people', digits: 0, icon: 'users' },
  power: { key: 'power', label: 'Estimated Power', short: 'PWR', unit: 'W', digits: 0, icon: 'zap' },
  network: { key: 'network', label: 'Network Health', short: 'NET', unit: '%', digits: 0, icon: 'wifi' },
}

export const METRIC_KEYS = ['temperature', 'humidity', 'occupancy', 'power', 'network']

export const TIME_RANGES = [
  { value: '1H', hours: 1, stepMin: 2, fmt: 'hm' },
  { value: '6H', hours: 6, stepMin: 10, fmt: 'hm' },
  { value: '12H', hours: 12, stepMin: 15, fmt: 'hm' },
  { value: '24H', hours: 24, stepMin: 30, fmt: 'hm' },
  { value: '7D', hours: 168, stepMin: 180, fmt: 'day' },
  { value: '30D', hours: 720, stepMin: 720, fmt: 'day' },
]

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const ZONE_BASELINE = {
  A: { temperature: 27.4, humidity: 62, occupancy: 7, network: 94, fanBias: 0.55 },
  B: { temperature: 24.8, humidity: 54, occupancy: 2, network: 96, fanBias: 0.15 },
}

export function getInitialZones() {
  const nowIso = new Date().toISOString()
  const state = {}
  for (const z of ZONES) {
    const b = ZONE_BASELINE[z.id]
    state[z.id] = {
      id: z.id,
      temperature: b.temperature,
      humidity: b.humidity,
      occupancy: b.occupancy,
      occupancyLevel: b.occupancy >= 5 ? 'High' : 'Low',
      network: 'Good',
      networkHealth: b.network,
      estimatedPower: estimatePower(b.temperature, b.occupancy, false),
      actuator: { fan: 'OFF', light: z.id === 'A' ? 'ON' : 'OFF' },
      mode: 'AUTO',
      connection: 'online',
      lastUpdate: nowIso,
    }
  }
  return state
}

export function estimatePower(temperature, occupancy, fanOn) {
  const coolingLoad = Math.max(0, temperature - 24.5) * 2.1
  const occLoad = occupancy * 0.45
  const fanLoad = fanOn ? 9 + coolingLoad * 0.8 : 0
  return Math.max(3, Math.round(3 + occLoad + coolingLoad * 0.35 + fanLoad))
}

export function nextTick(zone) {
  const jitter = (amp) => (Math.random() - 0.5) * 2 * amp
  const temperature = clampWalk(zone.temperature, jitter(0.22), 22.5, 30.5)
  const humidity = clampWalk(zone.humidity + (temperature - zone.temperature) * -0.35, jitter(0.9), 40, 75)
  let occupancy = zone.occupancy
  if (Math.random() < 0.16) {
    occupancy = Math.max(0, Math.min(16, zone.occupancy + (Math.random() < 0.5 ? -1 : 1)))
  }
  const networkHealth = Math.round(clampWalk(zone.networkHealth, jitter(0.8), 86, 99))
  const fanOn = zone.actuator.fan === 'ON'
  const lightOn = zone.actuator.light === 'ON'
  const estimatedPower = estimatePower(temperature, occupancy, fanOn) + (lightOn ? 4 : 0)
  return {
    ...zone,
    temperature: round1(temperature),
    humidity: Math.round(humidity),
    occupancy,
    occupancyLevel: occupancy >= 5 ? 'High' : 'Low',
    networkHealth,
    network: networkHealth >= 90 ? 'Good' : networkHealth >= 82 ? 'Fair' : 'Weak',
    estimatedPower,
    lastUpdate: new Date().toISOString(),
  }
}

function clampWalk(value, delta, min, max) {
  return Math.min(max, Math.max(min, value + delta))
}

function round1(v) {
  return Math.round(v * 10) / 10
}

function occupancyProfile(hour, weekdayFactor) {
  const morning = Math.exp(-((hour - 9.5) ** 2) / 3.2) * 0.85
  const midday = Math.exp(-((hour - 12.5) ** 2) / 1.6) * 0.35
  const afternoon = Math.exp(-((hour - 15) ** 2) / 4.4) * 1.0
  const evening = Math.exp(-((hour - 18.5) ** 2) / 3.0) * 0.4
  return (morning + midday + afternoon + evening) * weekdayFactor
}

function diurnalTemp(hour, dayShift) {
  const base = 25.2
  const swing = 3.4 * Math.exp(-((hour - 14.2) ** 2) / 14) - 1.1 * Math.exp(-((hour - 4.5) ** 2) / 20)
  return base + swing + dayShift
}

function generatePoint(metricKey, zoneId, tsMs, seedSalt) {
  const d = new Date(tsMs)
  const hour = d.getHours() + d.getMinutes() / 60
  const dow = d.getDay()
  const weekdayFactor = dow === 0 || dow === 6 ? 0.28 : 1
  const bucketMs = seedSalt === 'live' ? 5000 : 60000
  const rng = mulberry32(hashStr(`${zoneId}|${metricKey}|${Math.floor(tsMs / bucketMs)}|${seedSalt}`))
  const base = ZONE_BASELINE[zoneId]
  switch (metricKey) {
    case 'temperature': {
      const v = diurnalTemp(hour, 0.6 * rng() + (zoneId === 'B' ? -1.9 : 0.4))
      return round1(v + (rng() - 0.5) * 0.5)
    }
    case 'humidity': {
      const v = 66 - (diurnalTemp(hour, 0) - 24.6) * 3.4 + (zoneId === 'B' ? -5 : 2)
      return Math.round(Math.min(78, Math.max(38, v + (rng() - 0.5) * 4)))
    }
    case 'occupancy': {
      const v = occupancyProfile(hour, weekdayFactor) * base.occupancy * 1.65
      return Math.round(Math.max(0, v + (rng() - 0.5) * 1.4))
    }
    case 'power': {
      const tempV = diurnalTemp(hour, zoneId === 'B' ? -1.5 : 0.4)
      const occ = occupancyProfile(hour, weekdayFactor) * base.occupancy * 1.65
      const fanDuty = Math.max(0, tempV - 26) > 1 ? base.fanBias : 0.08
      const v = estimatePower(tempV, occ, fanDuty > 0.3) * (0.85 + rng() * 0.3)
      return Math.round(v)
    }
    case 'network': {
      const occ = occupancyProfile(hour, weekdayFactor)
      const v = 98.5 - occ * 3.6 - rng() * 1.6 + (zoneId === 'B' ? 1.4 : 0)
      return Math.round(Math.min(99, Math.max(84, v)))
    }
    default:
      return 0
  }
}

export function getMetricHistory({ zoneId = 'all', metricKey = 'temperature', rangeValue = '6H', anchorValue = null }) {
  const range = TIME_RANGES.find((r) => r.value === rangeValue) || TIME_RANGES[1]
  const targetPoints = 56
  const stepMs = Math.max(60000, (range.hours * 3600000) / targetPoints)
  const roundedStep = Math.round(stepMs / 60000) * 60000
  const now = Date.now()
  const points = []
  const salt = `${rangeValue}`
  const count = Math.min(targetPoints, Math.ceil((range.hours * 3600000) / roundedStep))
  for (let i = count; i >= 1; i -= 1) {
    const ts = now - i * roundedStep
    points.push(buildPoint(zoneId, metricKey, ts, salt, range.fmt))
  }
  const lastTs = now
  const last = buildPoint(zoneId, metricKey, lastTs, salt, range.fmt)
  if (anchorValue !== null && anchorValue !== undefined && !Number.isNaN(anchorValue)) {
    last.value = metricKey === 'occupancy' ? Math.round(anchorValue) : roundN(anchorValue, metricKey === 'network' || metricKey === 'humidity' || metricKey === 'power' ? 0 : 1)
  }
  points.push(last)
  return points
}

function buildPoint(zoneId, metricKey, ts, salt, fmt) {
  let value
  if (zoneId === 'all') {
    const a = generatePoint(metricKey, 'A', ts, salt)
    const b = generatePoint(metricKey, 'B', ts, salt)
    value = roundN((a + b) / 2, metricKey === 'temperature' ? 1 : 0)
  } else {
    value = generatePoint(metricKey, zoneId, ts, salt)
  }
  const d = new Date(ts)
  const label =
    fmt === 'day'
      ? d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
      : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return { t: ts, label, value }
}

function roundN(v, digits) {
  const f = 10 ** digits
  return Math.round(v * f) / f
}

export function getLiveBufferSeed(metricKey, zoneId, length = 48, intervalSec = 5) {
  const now = Date.now()
  const pts = []
  for (let i = length; i >= 1; i -= 1) {
    const ts = now - i * intervalSec * 1000
    const d = new Date(ts)
    pts.push({
      t: ts,
      label: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
      value: generatePoint(metricKey, zoneId, ts, 'live'),
    })
  }
  return pts
}

export const PREDICTION_MODELS = [
  { id: 'lr', name: 'Linear Regression', r2: 0.71, mae: 1.42, rmse: 1.86, trainMs: 12, note: 'Baseline trend model' },
  { id: 'rf', name: 'Random Forest', r2: 0.84, mae: 0.96, rmse: 1.31, trainMs: 46, note: 'Ensemble of 120 trees' },
  { id: 'xgb', name: 'XGBoost', r2: 0.91, mae: 0.71, rmse: 0.98, trainMs: 63, note: 'Gradient boosted, tuned' },
]

export function getPredictionForMetric(zoneId, metricKey, currentValues) {
  const cfg = METRICS[metricKey]
  const history = getMetricHistory({ zoneId, metricKey, rangeValue: '12H' })
  const actual = history.slice(-24).map((p) => ({ ...p }))
  const last = actual[actual.length - 1].value
  const drift = (last - actual[Math.max(0, actual.length - 7)].value) / 6
  const predictedPast = actual.map((p, i) => ({
    ...p,
    pv: roundN(p.value * 0.985 + drift * (i - 12) * 0.06 + (hashStr(`${p.t}${metricKey}`) % 100) / 500, cfg.digits),
  }))
  const future = []
  const now = Date.now()
  const step = 3600000
  let v = last
  for (let i = 1; i <= 6; i += 1) {
    v = v + drift + ((hashStr(`f${i}${zoneId}${metricKey}`) % 100) / 100 - 0.42) * (cfg.digits === 1 ? 0.4 : 1.2)
    const ts = now + i * step
    future.push({
      t: ts,
      label: new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      value: null,
      pv: roundN(v, cfg.digits),
    })
  }
  const bridge = actual[actual.length - 1]
  const combined = [...predictedPast.slice(0, -1), { ...bridge, pv: roundN(bridge.value, cfg.digits) }, ...future]
  return {
    metricKey,
    cfg,
    data: combined,
    current: currentValues !== undefined ? currentValues : last,
    forecastNext: future[future.length - 1].pv,
    confidence: 87 + (hashStr(zoneId + metricKey) % 9),
  }
}

export const SIMULATION_META = {
  disclaimer: 'Virtual scenario only — simulated values never modify live physical state.',
}

export function computeSimulation(inputs, currentState) {
  const { occupancy, temperature, humidity, network, fan, light } = inputs
  const power = estimatePower(temperature, occupancy, fan === 'ON') + (light === 'ON' ? 4 : 0)
  const comfortParts = []
  const tempComfort = 100 - Math.abs(temperature - 23.5) * 11
  const humComfort = 100 - Math.abs(humidity - 55) * 2.4
  comfortParts.push(Math.max(0, tempComfort))
  comfortParts.push(Math.max(0, humComfort))
  const airflowBonus = fan === 'ON' ? 6 : 0
  const crowdPenalty = Math.max(0, occupancy - 8) * 2.2
  const comfort = Math.round(Math.min(100, Math.max(0, avg(comfortParts) + airflowBonus - crowdPenalty)))

  const energyScore = Math.max(0, 100 - power * 2.4)
  const netScore = Math.round(clampN(network - occupancy * 0.6, 60, 100))
  const score = Math.round(comfort * 0.45 + energyScore * 0.3 + netScore * 0.25)

  const impacts = [
    impactRow('Temperature', currentState.temperature, temperature, '°C', true),
    impactRow('Humidity', currentState.humidity, humidity, '%', true),
    impactRow('Occupancy', currentState.occupancy, occupancy, '', true),
    impactRow('Network Health', currentState.networkHealth, netScore, '%', true),
    impactRow('Estimated Power', currentState.estimatedPower, power, 'W', false),
    impactRow('Comfort Index', 62, comfort, '/100', true),
  ]

  const notes = []
  if (fan === 'ON' && temperature > 26) notes.push('Fan assist improves perceived cooling at moderate energy cost.')
  if (fan === 'ON' && temperature <= 25) notes.push('Fan adds energy load with minimal comfort gain at this temperature.')
  if (occupancy >= 8) notes.push('High occupancy raises CO₂ and network contention in this zone.')
  if (humidity > 68) notes.push('Humidity above 68% may feel muggy despite temperature control.')
  if (!notes.length) notes.push('Scenario stays within nominal operating envelope.')

  return {
    simulatedState: {
      temperature: round1(temperature),
      humidity,
      occupancy,
      network: netScore >= 90 ? 'Good' : netScore >= 82 ? 'Fair' : 'Weak',
      networkHealth: netScore,
      estimatedPower: power,
      actuator: { fan, light },
    },
    impacts,
    score,
    comfort,
    energyScore: Math.round(energyScore),
    netScore,
    notes,
  }
}

function avg(list) {
  return list.reduce((a, b) => a + b, 0) / list.length
}

function clampN(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function impactRow(label, before, after, unit, lowerIsBetterWhenDown = true) {
  const delta = after - before
  return { label, before, after, delta, unit, lowerIsBetterWhenDown }
}

export function getOptimizerCandidates(zones, zoneId) {
  const z = zones[zoneId]
  const hot = z.temperature >= 26.5
  const crowded = z.occupancy >= 6
  const otherZone = zones[zoneId === 'A' ? 'B' : 'A']
  const redistributionViable = zoneId === 'A' && crowded && otherZone.occupancy <= 3

  const candidates = [
    {
      id: 'no-action',
      label: 'No Action',
      deviceStates: [],
      score: hot ? 41 : 74,
      impacts: { energy: 0, occupancy: 0, network: 0, comfort: hot ? -8 : 0 },
      viable: true,
      reason: hot
        ? `Zone ${zoneId} is trending warm (${z.temperature} °C); passive hold lets heat accumulate.`
        : `Conditions in Zone ${zoneId} are stable and within the comfort envelope.`,
    },
    {
      id: 'fan-on',
      label: 'Fan ON',
      deviceStates: [{ device: 'fan', state: 'ON' }],
      score: hot ? 92 : 58,
      impacts: { energy: 13, occupancy: 0, network: -1, comfort: hot ? 21 : 7 },
      viable: true,
      reason: `Temperature ${z.temperature} °C sits above the 26.5 °C comfort threshold. Air circulation lowers perceived temperature ~1.8 °C for an estimated 13 W load.`,
    },
    {
      id: 'light-off',
      label: 'Light OFF',
      deviceStates: [{ device: 'light', state: 'OFF' }],
      score: z.actuator.light === 'ON' ? (crowded ? 44 : 61) : 30,
      impacts: { energy: -4, occupancy: 0, network: 0, comfort: crowded ? -6 : -2 },
      viable: z.actuator.light === 'ON',
      reason: 'Lighting contributes a fixed 4 W load; switching off saves energy with minor comfort trade-off.',
    },
    {
      id: 'fan-light',
      label: 'Fan + Light',
      deviceStates: [
        { device: 'fan', state: 'ON' },
        { device: 'light', state: 'OFF' },
      ],
      score: hot && !crowded && z.actuator.light === 'ON' ? 81 : 49,
      impacts: { energy: 9, occupancy: 0, network: -1, comfort: hot ? 17 : 5 },
      viable: true,
      reason: 'Combined action trades lighting watts for airflow, keeping total load nearly flat while improving thermal comfort.',
    },
    {
      id: 'redistribution',
      label: 'Resource Redistribution',
      deviceStates: [],
      score: redistributionViable ? 88 : 22,
      impacts: { energy: -3, occupancy: crowded ? -4 : 0, network: 3, comfort: redistributionViable ? 12 : 0 },
      viable: redistributionViable,
      reason: redistributionViable
        ? `Zone A carries ${z.occupancy} occupants while Zone B holds ${otherZone.occupancy}. Shifting load balances density and relieves network contention.`
        : `Redistribution is not beneficial right now — adjacent zone capacity does not offset current density.`,
    },
  ]
  return candidates.filter((c) => c.viable)
}

export function pickRecommendation(candidates) {
  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  return sorted[0]
}

export function expectedOutcomeFor(deviceStates) {
  const has = (device, state) => deviceStates.some((d) => d.device === device && d.state === state)
  if (has('fan', 'ON')) {
    return { primary: 'Temperature −1.8 °C (est.)', effects: ['Temperature ↓', 'Comfort ↑', 'Estimated Power ↑'] }
  }
  if (has('light', 'OFF')) {
    return { primary: 'Energy −4 W (est.)', effects: ['Estimated Power ↓', 'Comfort →', 'Illuminance ↓'] }
  }
  return { primary: 'Hold current state', effects: ['No physical change', 'Monitoring continues'] }
}

export function buildFeedbackCycle(actionRecord, seedExtra = '') {
  if (!actionRecord) return null
  const predDrop = actionRecord.device === 'fan' ? 1.8 : actionRecord.device === 'light' ? 0.2 : 0
  const eff = mulberry32(hashStr(actionRecord.id + seedExtra))()
  const factor = 0.72 + eff * 0.3
  const actualDrop = round1(predDrop * factor)
  const error = round1(actualDrop - predDrop)
  const effectiveness = predDrop === 0 ? 70 + Math.round(eff * 20) : Math.round(Math.max(40, 100 - Math.abs(error / predDrop) * 90))
  return {
    action: actionRecord,
    predicted: predDrop === 0 ? 'Maintain stability' : `Temperature −${predDrop.toFixed(1)} °C`,
    actual: predDrop === 0 ? 'Stable (±0.2 °C)' : `Temperature −${actualDrop.toFixed(1)} °C`,
    error: predDrop === 0 ? '±0.0' : `${error > 0 ? '+' : ''}${error.toFixed(1)} °C`,
    effectiveness,
    policyDelta: effectiveness >= 75 ? '+0.04 reward weight on airflow actions' : '-0.02 reward weight, explore alternatives',
  }
}

export const FEEDBACK_PIPELINE = [
  { id: 'predict', label: 'Prediction', detail: 'Forecast zone state' },
  { id: 'action', label: 'Action', detail: 'Apply control decision' },
  { id: 'measure', label: 'Actual Measurement', detail: 'Sensor ground truth' },
  { id: 'error', label: 'Error', detail: 'Prediction vs reality' },
  { id: 'policy', label: 'Policy Update', detail: 'Calibrate model weights' },
  { id: 'decision', label: 'Future Decision', detail: 'Improved next cycle' },
]

export function getAnalyticsSummary() {
  return {
    predictionErrorTrend: seriesByDay('predictionError', 30, (i, r) => Math.max(0.32, 1.6 - i * 0.038 + r() * 0.22)),
    actionEffectiveness: [
      { label: 'Mon', value: 78 }, { label: 'Tue', value: 83 }, { label: 'Wed', value: 74 },
      { label: 'Thu', value: 88 }, { label: 'Fri', value: 91 }, { label: 'Sat', value: 64 }, { label: 'Sun', value: 59 },
    ],
    optimizationPerf: seriesByDay('optPerf', 30, (i, r) => Math.min(97, 58 + i * 1.15 + r() * 6)),
    kpis: [
      { label: 'Mean Prediction Error', value: '0.41 °C', trend: 'improving' },
      { label: 'Avg Action Effectiveness', value: '81 %', trend: 'stable' },
      { label: 'Optimization Gain (30d)', value: '+34 %', trend: 'improving' },
      { label: 'System Uptime', value: '99.2 %', trend: 'stable' },
    ],
  }
}

function seriesByDay(salt, days, fn) {
  const out = []
  const now = Date.now()
  for (let i = days; i >= 0; i -= 1) {
    const ts = now - i * 86400000
    const r = mulberry32(hashStr(salt + Math.floor(ts / 86400000)))
    const d = new Date(ts)
    out.push({
      t: ts,
      label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      value: roundN(fn(days - i, r), 2),
    })
  }
  return out
}

export const NOTIFICATION_POOL = [
  { severity: 'warn', title: 'Threshold watch', message: 'Temperature predicted to exceed threshold in Zone A within 40 min.' },
  { severity: 'info', title: 'Occupancy shift', message: 'Zone A occupancy increasing — est. 9 people by next period.' },
  { severity: 'success', title: 'Recommendation ready', message: 'UICE produced a new optimized action set.' },
  { severity: 'info', title: 'Model heartbeat', message: 'XGBoost forecaster refreshed on latest sensor window.' },
  { severity: 'success', title: 'Link stable', message: 'Edge node telemetry nominal across all zones.' },
]

export const INITIAL_NOTIFICATIONS = () => [
  {
    id: 'n-seed-1',
    severity: 'info',
    title: 'Occupancy rising',
    message: 'Zone A occupancy increasing — 7 people detected.',
    ts: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    read: false,
  },
  {
    id: 'n-seed-2',
    severity: 'success',
    title: 'Recommendation ready',
    message: 'Turn Fan ON in Zone A — review it in the Action Center.',
    ts: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    read: false,
  },
  {
    id: 'n-seed-3',
    severity: 'success',
    title: 'Node connection restored',
    message: 'Zone B edge node back online after brief drop.',
    ts: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
    read: true,
  },
]

export function timelineStatuses(bufferA, bufferB) {
  const len = Math.min(bufferA?.length ?? 0, bufferB?.length ?? 0)
  const out = []
  for (let i = 0; i < len; i += 1) {
    const t = bufferA[i].t
    const temp = (bufferA[i].value + bufferB[i].value) / 2
    const level = temp > 28.6 ? 'crit' : temp > 27.2 ? 'warn' : 'ok'
    out.push({ t, label: fmtShortTime(t), level })
  }
  return out
}

function fmtShortTime(ms) {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
