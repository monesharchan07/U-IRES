import { useAppStore } from '../../hooks/useAppStore'
import { getResourceIndicators } from '../../services/campusService'
import { IconNode, IconThermo, IconUsers, IconWifi, IconZap } from '../icons'
import { IconChip } from '../ui/Misc'

export default function DataOverviewPanel() {
  const { zones, buffers, setActivePage } = useAppStore()
  if (!zones) return null
  const ind = getResourceIndicators(zones)
  const online = Object.values(zones).filter((z) => z.connection === 'online').length
  const total = Object.keys(zones).length

  const rows = [
    {
      icon: IconNode, color: '#3dffa8', label: 'Active Nodes', value: `${online} / ${total}`, unit: 'Online',
      bar: (online / total) * 100,
    },
    {
      icon: IconUsers, color: '#4fd7ff', label: 'Average Occupancy', value: ind.avgOccupancy.toFixed(1), unit: 'People',
      bar: Math.min(100, (ind.avgOccupancy / 12) * 100),
    },
    {
      icon: IconThermo, color: '#ffb454', label: 'Average Temperature', value: ind.avgTemp.toFixed(1), unit: '°C',
      bar: Math.min(100, ((ind.avgTemp - 18) / 16) * 100),
      spark: buffers.A?.temperature?.map((p) => p.value) || [],
    },
    {
      icon: IconWifi, color: '#4fd7ff', label: 'Network Health', value: Math.round(ind.netHealth), unit: '%',
      bar: ind.netHealth,
    },
    {
      icon: IconZap, color: '#ffb454', label: 'Estimated Power', value: ind.power, unit: 'W',
      badge: 'EST',
      bar: Math.min(100, ind.power * 2.2),
    },
  ]

  return (
    <section className="glass hud-corners">
      <span className="corner-br" />
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h3 className="label-cap !tracking-[0.24em]">Data Overview</h3>
        <span className="font-mono text-[8px] text-faint tracking-[0.2em]">AGGREGATE</span>
      </header>
      <div className="px-4 pb-4 space-y-2">
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setActivePage('analytics')}
            className="w-full flex items-center gap-3 rounded-lg border border-white/[0.05] bg-black/25 px-3 py-2 text-left hover:border-neon/30 hover:bg-neon/[0.04] transition-all group"
          >
            <IconChip icon={r.icon} color={r.color} size={30} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-tech uppercase tracking-[0.14em] text-dim truncate">{r.label}</div>
              <div className="mt-[5px] h-[3.5px] w-full rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.bar}%`, background: r.color, boxShadow: `0 0 6px ${r.color}66` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono font-bold tnum text-[15px] text-ink">{r.value}</span>
              <span className="text-[9px] text-faint ml-1 font-tech">{r.unit}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
