import { useAppStore } from '../../hooks/useAppStore'
import { IconActivity, IconDrop, IconThermo, IconUsers, IconWifi, IconZap } from '../icons'
import { MiniBars } from '../ui/Misc'
import { getResourceIndicators } from '../../services/campusService'

function IndicatorCard({ icon: Icon, label, value, unit, color, spark }) {
  return (
    <div className="glass glass-hover !rounded-lg px-3 py-2.5 flex items-center gap-3 min-w-0">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border shrink-0"
        style={{ color, borderColor: `${color}30`, background: `${color}12` }}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="label-cap !text-[8px] !tracking-[0.18em] whitespace-pre-line leading-tight">{label}</div>
        <div className="font-mono font-bold tnum text-[16px] text-ink leading-tight">
          {value}
          <span className="text-dim text-[9px] ml-1 font-tech">{unit}</span>
        </div>
      </div>
      {spark && spark.length > 2 && <MiniBars values={spark} color={color} height={20} />}
    </div>
  )
}

export default function ResourceIndicatorsPanel() {
  const { zones, buffers } = useAppStore()
  if (!zones) return null
  const ind = getResourceIndicators(zones)

  const cards = [
    { icon: IconUsers, label: 'AVG\nOCCUPANCY', value: ind.avgOccupancy.toFixed(1), unit: 'PEOPLE', color: '#4fd7ff', spark: avgSpark(buffers, 'occupancy') },
    { icon: IconThermo, label: 'AVG\nTEMPERATURE', value: ind.avgTemp.toFixed(1), unit: '°C', color: '#ffb454', spark: avgSpark(buffers, 'temperature') },
    { icon: IconDrop, label: 'AVG\nHUMIDITY', value: Math.round(ind.avgHum), unit: '%', color: '#4fd7ff', spark: avgSpark(buffers, 'humidity') },
    { icon: IconWifi, label: 'NETWORK\nHEALTH', value: Math.round(ind.netHealth), unit: '%', color: '#3dffa8', spark: avgSpark(buffers, 'network') },
    { icon: IconZap, label: 'ESTIMATED\nPOWER', value: ind.power, unit: 'W', color: '#ffb454', spark: avgSpark(buffers, 'power') },
    { icon: IconActivity, label: 'SYSTEM\nEFFICIENCY', value: ind.efficiency, unit: '%', color: '#3dffa8' },
  ]

  return (
    <section className="glass hud-corners h-full flex flex-col">
      <span className="corner-br" />
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="label-cap !tracking-[0.24em]">Resource Indicators</h3>
        <span className="font-mono text-[8px] text-faint tracking-[0.18em]" style={{ color: '#3dffa8' }}>● STREAMING</span>
      </header>
      <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-2 min-w-0 content-start">
        {cards.map((c) => (
          <IndicatorCard key={c.label} {...c} />
        ))}
      </div>
    </section>
  )
}

function avgSpark(buffers, metricKey) {
  const a = buffers.A?.[metricKey]?.slice(-14) || []
  const b = buffers.B?.[metricKey]?.slice(-14) || []
  if (!a.length || !b.length) return []
  return a.map((p, i) => (p.value + (b[i]?.value ?? p.value)) / 2)
}
