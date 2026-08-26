import { useMemo, useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { METRICS, METRIC_KEYS } from '../../mock/mockData'
import { ExpandButton, ChartExpandModal } from '../charts/ExpandableChart'
import { TrendAreaChart } from '../charts/Primitives'
import { Segmented } from '../ui/Controls'

export default function MainTrendPanel() {
  const { buffers, selectedZone } = useAppStore()
  const [metric, setMetric] = useState('temperature')
  const [expanded, setExpanded] = useState(false)

  const cfg = METRICS[metric]

  const data = useMemo(() => {
    const a = buffers.A?.[metric] || []
    const b = buffers.B?.[metric] || []
    if (selectedZone === 'all') {
      const len = Math.min(a.length, b.length)
      return Array.from({ length: len }, (_, i) => ({
        label: a[i].label,
        va: a[i].value,
        vb: b[i].value,
      }))
    }
    const src = selectedZone === 'A' ? a : b
    return src.map((p) => ({ label: p.label, value: p.value }))
  }, [buffers, metric, selectedZone])

  const series = useMemo(() => {
    if (selectedZone === 'all') {
      return [
        { key: 'va', label: 'ZONE A', color: '#3dffa8', type: 'area' },
        { key: 'vb', label: 'ZONE B', color: '#4fd7ff', type: 'line' },
      ]
    }
    return [{ key: 'value', label: `ZONE ${selectedZone}`, color: selectedZone === 'A' ? '#3dffa8' : '#4fd7ff', type: 'area' }]
  }, [selectedZone])

  return (
    <>
      <section className="glass hud-corners h-full flex flex-col">
        <span className="corner-br" />
        <header className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-1">
          <div className="mr-auto">
            <h3 className="label-cap !tracking-[0.24em]">Resource / Environment Trend</h3>
            <p className="text-[10px] text-faint font-tech mt-0.5">{cfg.label} · live window · 5 s resolution</p>
          </div>
          <Segmented
            size="xs"
            value={metric}
            onChange={setMetric}
            options={METRIC_KEYS.map((k) => ({ value: k, label: METRICS[k].short }))}
          />
          <ExpandButton compact onClick={() => setExpanded(true)} />
        </header>
        <div className="px-2 pb-2 flex-1 min-h-[190px]">
          <TrendAreaChart data={data} series={series} unit={cfg.unit} height={205} showLegend />
        </div>
      </section>
      <ChartExpandModal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={`${cfg.label} Trend — Expanded`}
        defaultMetric={metric}
        allowZones
      />
    </>
  )
}
