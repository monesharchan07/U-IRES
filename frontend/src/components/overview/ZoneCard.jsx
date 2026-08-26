import { useAppStore } from '../../hooks/useAppStore'
import { ZONES } from '../../mock/mockData'
import { DataBadge, StatusBadge, StatusDot } from '../ui/Badges'
import { IconDrop, IconFan, IconThermo, IconUsers, IconWifi, IconZap } from '../icons'

function StatCell({ icon: Icon, label, value, unit, badge, children }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 hover:border-neon/25 transition-colors">
      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1.5 label-cap !text-[8.5px] !tracking-[0.16em]">
          <Icon size={11} style={{ color: '#4fd7ff' }} />
          {label}
        </span>
        {badge}
      </div>
      {value !== '' ? (
        <div className="mt-1 font-mono font-bold tnum text-[17px] text-ink leading-none">
          {value}
          <span className="text-dim text-[10px] ml-1">{unit}</span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

export default function ZoneCard({ zoneId }) {
  const { zones } = useAppStore()
  const meta = ZONES.find((z) => z.id === zoneId)
  const z = zones?.[zoneId]
  if (!z) return null

  const pips = Array.from({ length: Math.min(10, Math.max(z.occupancy, meta.capacity / 2)) })
  const fanOn = z.actuator.fan === 'ON'
  const lightOn = z.actuator.light === 'ON'

  return (
    <section className="glass glass-hover hud-corners relative overflow-hidden h-full">
      <span className="corner-br" />
      <div
        className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${zoneId === 'A' ? 'rgba(61,255,168,.13)' : 'rgba(79,215,255,.12)'} 0%, transparent 70%)` }}
      />
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full" style={{ background: zoneId === 'A' ? '#3dffa8' : '#4fd7ff', boxShadow: `0 0 10px ${zoneId === 'A' ? '#3dffa8' : '#4fd7ff'}` }} />
          <h3 className="font-mono font-bold tracking-[0.2em] text-[15px] text-ink">ZONE {z.id}</h3>
          <StatusDot level={z.connection === 'online' ? 'ok' : 'crit'} size={6} />
        </div>
        <div className="flex items-center gap-2">
          <DataBadge kind="live" dotted={false} />
          <StatusBadge level={z.occupancyLevel} label={`OCC · ${z.occupancyLevel.toUpperCase()}`} />
        </div>
      </header>

      <div className="px-4 pb-4">
        <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 flex items-center justify-between mb-3 relative overflow-hidden">
          <div>
            <div className="label-cap !text-[8.5px] flex items-center gap-1.5">
              <IconUsers size={11} style={{ color: '#4fd7ff' }} /> Occupancy Estimate
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-mono font-bold tnum text-[34px] leading-none text-ink glow-text">{z.occupancy}</span>
              <span className="font-mono text-[9px] text-faint mb-1">/ {meta.capacity} CAP</span>
            </div>
          </div>
          <div className="flex items-end gap-[3px] h-9">
            {pips.map((_, i) => (
              <span
                key={`${i}`}
                className="w-[5px] rounded-sm transition-all duration-500"
                style={{
                  height: i < z.occupancy ? '100%' : '26%',
                  background: i < z.occupancy ? (z.occupancy >= 7 ? '#ffb454' : '#3dffa8') : 'rgba(120,200,170,.18)',
                  boxShadow: i < z.occupancy ? `0 0 6px ${z.occupancy >= 7 ? '#ffb45488' : '#3dffa888'}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatCell icon={IconThermo} label="Temperature" value={z.temperature.toFixed(1)} unit="°C" badge={<DataBadge kind="live" dotted={false} />} />
          <StatCell icon={IconDrop} label="Humidity" value={z.humidity} unit="%" badge={<DataBadge kind="live" dotted={false} />} />
          <StatCell icon={IconWifi} label="Network" value={z.networkHealth} unit="%" badge={<StatusBadge level={z.network} />} />
          <StatCell icon={IconZap} label="Est. Power" value={z.estimatedPower} unit="W" badge={<DataBadge kind="estimated" dotted={false} />} />
          <StatCell
            icon={IconFan}
            label="Actuator"
            value={`FAN ${fanOn ? 'ON' : 'OFF'}`}
            unit=""
            badge={<span className="badge" style={{ color: '#4fd7ff', borderColor: 'rgba(79,215,255,.35)', background: 'rgba(79,215,255,.08)' }}>{lightOn ? 'LIGHT ON' : 'LIGHT OFF'}</span>}
          />
          <StatCell icon={IconUsers} label="Control Mode" value={z.mode} unit="" badge={<StatusBadge level={z.mode} />}>
            <div className="mt-1 font-mono text-[10px] text-faint truncate">{meta.location}</div>
          </StatCell>
        </div>
      </div>
    </section>
  )
}
