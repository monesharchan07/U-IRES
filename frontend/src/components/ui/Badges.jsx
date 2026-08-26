const KINDS = {
  live: { label: 'LIVE', color: '#3dffa8' },
  predicted: { label: 'PREDICTED', color: '#4fd7ff' },
  simulated: { label: 'SIMULATED', color: '#b48cff' },
  estimated: { label: 'ESTIMATED', color: '#8fa8b0' },
}

export function DataBadge({ kind, dotted = true }) {
  const k = KINDS[kind] || KINDS.estimated
  return (
    <span
      className="badge"
      style={{
        color: k.color,
        borderColor: `${k.color}55`,
        background: `${k.color}14`,
        borderStyle: kind === 'simulated' ? 'dashed' : 'solid',
      }}
    >
      {dotted && <span className="w-1 h-1 rounded-full" style={{ background: k.color }} />}
      {k.label}
    </span>
  )
}

const LEVELS = {
  High: { color: '#ffb454', icon: null },
  Low: { color: '#3dffa8' },
  Good: { color: '#3dffa8' },
  Fair: { color: '#ffb454' },
  Weak: { color: '#ff5470' },
  ONLINE: { color: '#3dffa8' },
  OFFLINE: { color: '#ff5470' },
  AUTO: { color: '#4fd7ff' },
  MANUAL: { color: '#ffb454' },
  ok: { color: '#3dffa8' },
  warn: { color: '#ffb454' },
  crit: { color: '#ff5470' },
}

export function StatusBadge({ level, label }) {
  const cfg = LEVELS[level] || { color: '#8fa8b0' }
  return (
    <span
      className="badge"
      style={{ color: cfg.color, borderColor: `${cfg.color}50`, background: `${cfg.color}12` }}
    >
      {label || level}
    </span>
  )
}

export function StatusDot({ level = 'ok', size = 7 }) {
  const cfg = LEVELS[level] || LEVELS.ok
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full pulse-dot"
        style={{ background: cfg.color, color: cfg.color }}
      />
      <span
        className="absolute inset-0 rounded-full ping-ring border"
        style={{ borderColor: cfg.color }}
      />
    </span>
  )
}
