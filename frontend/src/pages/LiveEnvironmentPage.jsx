import { useAppStore } from '../hooks/useAppStore'
import { useLiveClock } from '../hooks/useLiveClock'
import { ZONES } from '../mock/mockData'
import { timeAgo } from '../utils/format'
import Panel from '../components/ui/Panel'
import { DataBadge, StatusBadge, StatusDot } from '../components/ui/Badges'
import { Gauge } from '../components/ui/Gauges'
import { IconBulb, IconFan, IconPin } from '../components/icons'

function ZoneTwin({ zoneId }) {
  const { zones } = useAppStore()
  const now = useLiveClock(1000)
  const meta = ZONES.find((z) => z.id === zoneId)
  const z = zones?.[zoneId]
  if (!z) return null
  const accent = zoneId === 'A' ? '#3dffa8' : '#4fd7ff'
  const fanOn = z.actuator.fan === 'ON'
  const lightOn = z.actuator.light === 'ON'

  return (
    <section className="glass glass-hover hud-corners relative overflow-hidden h-full" style={{ borderColor: `${accent}30` }}>
      <span className="corner-br" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full pointer-events-none opacity-60"
        style={{ background: `radial-gradient(ellipse at center, ${accent}1f 0%, transparent 70%)` }}
      />
      <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.05] relative">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
          <div>
            <h2 className="font-mono font-bold tracking-[0.24em] text-lg text-ink leading-none">ZONE {z.id}</h2>
            <p className="text-[10px] font-tech text-faint uppercase tracking-[0.16em] mt-1 flex items-center gap-1">
              <IconPin size={10} /> {meta.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot level={z.connection === 'online' ? 'ok' : 'crit'} />
          <span className="font-mono text-[9px] tracking-[0.18em]" style={{ color: z.connection === 'online' ? '#3dffa8' : '#ff5470' }}>
            {z.connection === 'online' ? 'CONNECTED' : 'OFFLINE'}
          </span>
          <DataBadge kind="live" />
        </div>
      </header>

      <div className="relative px-5 py-5 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="flex justify-center gap-5">
          <Gauge value={z.temperature} max={35} unit="°C" label="TEMPERATURE" color="#ffb454" size={116} digits={1} />
          <Gauge value={z.humidity} max={100} unit="%" label="HUMIDITY" color="#4fd7ff" size={116} />
        </div>

        <div className="space-y-3 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2.5">
              <div className="label-cap !text-[8px]">Occupancy</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold tnum text-xl text-ink">{z.occupancy}</span>
                <StatusBadge level={z.occupancyLevel} label={z.occupancyLevel.toUpperCase()} />
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2.5">
              <div className="label-cap !text-[8px]">Network</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold tnum text-xl text-ink">{z.networkHealth}%</span>
                <StatusBadge level={z.network} />
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2.5">
              <div className="label-cap !text-[8px]">Est. Power</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold tnum text-xl text-ink">{z.estimatedPower}</span>
                <span className="text-[9px] text-faint font-tech">W</span>
                <DataBadge kind="estimated" dotted={false} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="label-cap !text-[8px] mb-0">Actuators</div>
            <div className="flex items-center gap-2">
              <span className={`badge !py-[4px] !px-2 !text-[9px]`} style={{ color: fanOn ? '#3dffa8' : '#8fa8b0', borderColor: fanOn ? 'rgba(61,255,168,.45)' : 'rgba(140,168,176,.28)', background: fanOn ? 'rgba(61,255,168,.1)' : 'transparent' }}>
                <IconFan size={11} /> FAN {fanOn ? 'ON' : 'OFF'}
              </span>
              <span className={`badge !py-[4px] !px-2 !text-[9px]`} style={{ color: lightOn ? '#ffb454' : '#8fa8b0', borderColor: lightOn ? 'rgba(255,180,84,.45)' : 'rgba(140,168,176,.28)', background: lightOn ? 'rgba(255,180,84,.1)' : 'transparent' }}>
                <IconBulb size={11} /> LIGHT {lightOn ? 'ON' : 'OFF'}
              </span>
              <StatusBadge level={z.mode} />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.14em] text-faint">
            <span>LAST UPDATE · <span className="text-dim">{timeAgo(z.lastUpdate, now.getTime())}</span></span>
            <span>NODE {meta.id}-EDGE-01</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LiveEnvironmentPage() {
  return (
    <div className="space-y-3 rise-in">
      <Panel title="Digital Twin — Live Environment" subtitle="Real-time mirrored state of monitored zones · sensor telemetry stream">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <ZoneTwin zoneId="A" />
          <ZoneTwin zoneId="B" />
        </div>
      </Panel>
    </div>
  )
}
