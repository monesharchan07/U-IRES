export function fmtNum(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--'
  return Number(value).toFixed(digits)
}

export function fmtInt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--'
  return Math.round(value).toString()
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function fmtClock(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

export function fmtDateLong(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function fmtHM(ms) {
  const d = new Date(ms)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function fmtDayShort(ms) {
  const d = new Date(ms)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '--'
  const diff = Math.max(0, now - new Date(iso).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function signed(value, digits = 1, unit = '') {
  const n = Number(value)
  if (Number.isNaN(n)) return '--'
  const abs = Math.abs(n).toFixed(digits)
  if (n > 0) return `+${abs}${unit}`
  if (n < 0) return `-${abs}${unit}`
  return `0${unit}`
}

export function avg(list) {
  if (!list.length) return 0
  return list.reduce((a, b) => a + b, 0) / list.length
}
