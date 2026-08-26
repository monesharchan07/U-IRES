import { useAppStore } from '../../hooks/useAppStore'

const NODES = [
  { id: 'A', label: 'ZONE A', sub: 'Edge Node · Wing 1' },
  { id: 'CORE', label: 'U-IRES CORE', sub: 'Decision Engine' },
  { id: 'B', label: 'ZONE B', sub: 'Edge Node · Wing 2' },
]

export default function StructureOverviewPanel() {
  const { zones } = useAppStore()

  const nodeVisual = (node, idx) => {
    const isCore = node.id === 'CORE'
    const zoneState = isCore ? null : zones?.[node.id]
    const online = isCore ? true : zoneState?.connection === 'online'
    const color = isCore ? '#b48cff' : node.id === 'A' ? '#3dffa8' : '#4fd7ff'
    return (
      <div key={node.id} className={`flex items-center gap-3 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
        {idx % 2 === 1 && <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />}
        <div
          className={`relative shrink-0 flex flex-col items-center justify-center rounded-xl border transition-all ${isCore ? 'w-[74px] h-[74px]' : 'w-[58px] h-[58px]'}`}
          style={{
            borderColor: `${color}55`,
            background: `radial-gradient(circle at 50% 35%, ${color}22, rgba(5,9,14,.7))`,
            boxShadow: `0 0 22px -6px ${color}88, inset 0 0 14px -6px ${color}66`,
          }}
        >
          {isCore && (
            <svg viewBox="0 0 80 80" className="absolute inset-[-9px] w-[calc(100%+18px)] h-[calc(100%+18px)] spin-slow pointer-events-none">
              <circle cx="40" cy="40" r="37" fill="none" stroke="#b48cff" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="10 14" />
            </svg>
          )}
          <svg width={isCore ? 26 : 20} height={isCore ? 26 : 20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
            {isCore ? (
              <>
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3" />
              </>
            ) : (
              <>
                <path d="M12 21s6.5-5.8 6.5-11a6.5 6.5 0 1 0-13 0c0 5.2 6.5 11 6.5 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </>
            )}
          </svg>
          <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 badge !px-1 !py-0" style={{
            color: online ? '#3dffa8' : '#ff5470',
            borderColor: online ? 'rgba(61,255,168,.4)' : 'rgba(255,84,112,.4)',
            background: 'rgba(4,8,13,.95)',
          }}>
            <span className="w-1 h-1 rounded-full pulse-dot" style={{ background: online ? '#3dffa8' : '#ff5470' }} />
            {online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className={`${idx % 2 === 1 ? 'text-right' : ''}`}>
          <div className="font-mono font-bold text-[12px] tracking-[0.16em]" style={{ color }}>{node.label}</div>
          <div className="text-[9px] font-tech text-faint uppercase tracking-wider mt-0.5">{node.sub}</div>
        </div>
        {idx % 2 === 0 && <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />}
      </div>
    )
  }

  return (
    <section className="glass hud-corners h-full flex flex-col">
      <span className="corner-br" />
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="label-cap !tracking-[0.24em]">Structure Overview</h3>
        <span className="font-mono text-[8px] text-faint tracking-[0.18em]">TOPOLOGY</span>
      </header>
      <div className="flex-1 flex flex-col justify-center gap-0 px-5 py-2">
        {NODES.map((n, i) => (
          <div key={n.id}>
            {i > 0 && (
              <div className="flex justify-center py-0.5">
                <svg width="16" height="26" viewBox="0 0 16 26">
                  <line x1="8" y1="0" x2="8" y2="26" stroke="rgba(61,255,168,0.5)" strokeWidth="1.4" className="flow-line" />
                  <polygon points="8,24 4.6,19 11.4,19" fill="#3dffa8" opacity="0.85" />
                </svg>
              </div>
            )}
            {nodeVisual(n, i)}
          </div>
        ))}
      </div>
      <footer className="px-4 pb-3 pt-1 border-t border-white/5 flex items-center justify-between">
        <span className="label-cap !text-[8px]">Mesh Status</span>
        <span className="font-mono text-[9px]" style={{ color: '#3dffa8' }}>ALL SYSTEMS NOMINAL</span>
      </footer>
    </section>
  )
}
