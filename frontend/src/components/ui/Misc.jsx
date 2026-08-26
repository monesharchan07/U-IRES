export function Spinner({ size = 16, color = '#3dffa8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" style={{ color }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconChip({ icon: Icon, color = '#3dffa8', size = 34 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg border shrink-0"
      style={{
        width: size,
        height: size,
        color,
        borderColor: `${color}33`,
        background: `linear-gradient(140deg, ${color}1f, transparent)`,
        boxShadow: `inset 0 0 12px -6px ${color}88`,
      }}
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  )
}

export function MiniBars({ values, color = '#3dffa8', height = 22 }) {
  if (!values || values.length === 0) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {values.slice(-16).map((v, i) => {
        const pct = 18 + ((v - min) / span) * 82
        return (
          <span
            key={`${i}-${v}`}
            style={{
              width: 3,
              height: `${pct}%`,
              background: color,
              opacity: 0.28 + (i / 16) * 0.62,
              borderRadius: 1,
              boxShadow: `0 0 4px ${color}44`,
            }}
          />
        )
      })}
    </div>
  )
}

export function DeltaText({ delta, unit = '', digits = 1, invertGood = false }) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return <span className="text-faint">—</span>
  const good = invertGood ? delta > 0 : delta < 0
  const neutral = Math.abs(delta) < 0.05
  const color = neutral ? '#8fa8b0' : good ? '#3dffa8' : '#ff8a97'
  const arrow = neutral ? '→' : delta > 0 ? '▲' : '▼'
  const abs = Math.abs(delta)
  return (
    <span className="font-mono text-[10px] font-bold tnum" style={{ color }}>
      {arrow} {abs.toFixed(digits)}{unit}
    </span>
  )
}

export function SkeletonBox({ className = '', height }) {
  return <div className={`skeleton ${className}`} style={height ? { height } : undefined} />
}

export function EmptyNote({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-xs text-faint">
      {children}
    </div>
  )
}
