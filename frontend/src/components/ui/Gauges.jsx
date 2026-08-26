export function Gauge({ value, max = 100, unit = '', label, color = '#3dffa8', size = 108, digits = 0 }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = (size - 14) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(120,200,170,0.12)" strokeWidth="6" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{
              transition: 'stroke-dashoffset 700ms cubic-bezier(.3,.8,.3,1)',
              filter: `drop-shadow(0 0 6px ${color}aa)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold tnum text-ink leading-none" style={{ fontSize: size * 0.19 }}>
            {value.toFixed(digits)}
            <span className="text-dim ml-0.5" style={{ fontSize: size * 0.11 }}>{unit}</span>
          </span>
        </div>
      </div>
      {label && <span className="label-cap !text-[9px]">{label}</span>}
    </div>
  )
}

export function ScoreRing({ score, size = 92, label = 'Score' }) {
  const color = score >= 75 ? '#3dffa8' : score >= 55 ? '#ffb454' : '#ff5470'
  return (
    <Gauge value={score} max={100} unit="%" label={label} color={color} size={size} digits={0} />
  )
}

export function Bar({ value, max = 100, color = '#3dffa8', height = 5 }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100))
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(120,200,170,0.1)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 500ms ease',
        }}
      />
    </div>
  )
}
