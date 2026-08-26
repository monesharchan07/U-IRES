export function Segmented({ options, value, onChange, size = 'sm' }) {
  return (
    <div className={`seg ${size === 'xs' ? '!p-[2px]' : ''}`}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            className={`seg-btn ${active ? 'active' : ''} ${size === 'xs' ? '!px-2 !text-[8.5px]' : ''}`}
            onClick={() => onChange(val)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ on, onChange, disabled = false, labels = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`toggle-track ${on ? 'on' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      role="switch"
    >
      <span className="toggle-knob" />
      {labels && (
        <span
          className="absolute inset-0 flex items-center justify-between px-2 font-mono text-[7px] tracking-widest pointer-events-none"
          style={{ color: on ? '#052b1d' : '#5c7078' }}
        >
          <span className={on ? 'opacity-0' : ''}>OFF</span>
          <span className={!on ? 'opacity-0' : 'font-bold'}>ON</span>
        </span>
      )}
    </button>
  )
}
