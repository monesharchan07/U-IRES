import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import { Segmented } from '../ui/Controls'
import { SkeletonBox, Spinner } from '../ui/Misc'
import { TrendAreaChart } from './Primitives'
import { fetchMetricHistory } from '../../services/campusService'
import { METRICS, METRIC_KEYS, TIME_RANGES, ZONES } from '../../mock/mockData'

export function ExpandButton({ onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Expand chart"
      className={`btn btn-ghost btn-xs hover:!text-neon ${compact ? '!px-1.5' : ''}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 3.5H3.5V9M15 3.5h5.5V9M9 20.5H3.5V15M15 20.5h5.5V15" />
      </svg>
      {!compact && 'EXPAND'}
    </button>
  )
}

export function ChartExpandModal({ open, onClose, title: titleProp, defaultMetric = 'temperature', allowZones = true }) {
  const [metric, setMetric] = useState(defaultMetric)
  const [zoneId, setZoneId] = useState('all')
  const [rangeValue, setRangeValue] = useState('6H')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setMetric(defaultMetric)
    }
  }, [open, defaultMetric])

  useEffect(() => {
    if (!open) return undefined
    let alive = true
    setLoading(true)
    setData(null)
    const timer = setTimeout(() => {
      const fetchAndCombine = async () => {
        try {
          let result
          if (zoneId === 'all') {
            const [a, b] = await Promise.all([
              fetchMetricHistory({ zoneId: 'A', metricKey: metric, rangeValue }),
              fetchMetricHistory({ zoneId: 'B', metricKey: metric, rangeValue }),
            ])
            const map = new Map()
            for (const pts of [a, b]) {
              for (const p of pts) {
                if (p.value === null || p.value === undefined || Number.isNaN(p.value)) continue
                const existing = map.get(p.t)
                if (existing) {
                  existing.sum += p.value
                  existing.count += 1
                } else {
                  map.set(p.t, { sum: p.value, count: 1, label: p.label, t: p.t })
                }
              }
            }
            result = Array.from(map.values())
              .map((v) => ({ t: v.t, label: v.label, value: v.sum / v.count }))
              .sort((x, y) => x.t - y.t)
          } else {
            result = await fetchMetricHistory({ zoneId, metricKey: metric, rangeValue })
          }
          if (alive) {
            setData(result)
            setLoading(false)
          }
        } catch (err) {
          if (alive) {
            setLoading(false)
          }
        }
      }
      fetchAndCombine()
    }, 260)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [open, zoneId, metric, rangeValue])

  const cfg = METRICS[metric]
  const unit = cfg.unit
  const title = titleProp || `${cfg.label} — Detailed Analysis`

  const series = useMemo(() => {
    if (zoneId === 'all') {
      return [{ key: 'value', label: 'Campus Average', color: '#b48cff', type: 'area' }]
    }
    return [
      { key: 'value', label: `Zone ${zoneId}`, color: zoneId === 'A' ? '#3dffa8' : '#4fd7ff', type: 'area' },
    ]
  }, [zoneId])

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle="Full-resolution historical telemetry · interactive tooltip enabled" size="full">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4">
        {allowZones && (
          <div className="flex items-center gap-2">
            <span className="label-cap !text-[9px]">Zone</span>
            <Segmented
              value={zoneId}
              onChange={setZoneId}
              options={[{ value: 'all', label: 'ALL' }, ...ZONES.map((z) => ({ value: z.id, label: `ZONE ${z.id}` }))]}
            />
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label-cap !text-[9px]">Metric</span>
          <Segmented value={metric} onChange={setMetric} options={METRIC_KEYS.map((k) => ({ value: k, label: METRICS[k].short }))} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="label-cap !text-[9px]">Range</span>
          <Segmented value={rangeValue} onChange={setRangeValue} options={TIME_RANGES.map((r) => r.value)} />
        </div>
      </div>

      <div className="glass !bg-black/30 rounded-xl p-4 min-h-[380px] flex items-center justify-center">
        {loading || !data ? (
          <div className="w-full space-y-3">
            <SkeletonBox className="h-[300px] w-full" />
            <div className="flex items-center justify-center gap-2 text-dim text-xs font-tech">
              <Spinner size={13} /> LOADING TELEMETRY…
            </div>
          </div>
        ) : (
          (() => {
            const rangeCfg = TIME_RANGES.find((r) => r.value === rangeValue)
            const stepMin = Math.max(1, Math.round(((rangeCfg?.hours ?? 6) * 60) / Math.max(1, data.length - 1)))
            return (
              <div className="w-full">
                <TrendAreaChart data={data} series={series} unit={unit} height={360} showLegend />
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-faint tracking-widest">
                  <span>{data.length} SAMPLES · STEP {stepMin >= 60 ? `${Math.round(stepMin / 60)} H` : `${stepMin} MIN`}</span>
                  <span>SOURCE: MOCK TELEMETRY BUS</span>
                </div>
              </div>
            )
          })()
        )}
      </div>
    </Modal>
  )
}

export function ExpandableChart({
  title,
  subtitle,
  data,
  series,
  unit = '',
  height = 200,
  actions = null,
  defaultMetric = 'temperature',
  allowZones = true,
}) {
  const [expanded, setExpanded] = useState(false)
  const close = useCallback(() => setExpanded(false), [])
  return (
    <>
      <section className="glass hud-corners h-full flex flex-col">
        <header className="flex items-center justify-between px-4 pt-3 pb-1">
          <div>
            <h3 className="label-cap !text-[10px] !tracking-[0.22em] text-neon/90">{title}</h3>
            {subtitle && <p className="text-[10px] text-faint font-tech mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <ExpandButton onClick={() => setExpanded(true)} />
          </div>
        </header>
        <div className="px-2 pb-3 pt-1 flex-1 min-h-0">
          {data && data.length ? (
            <TrendAreaChart data={data} series={series} unit={unit} height={height} showLegend={series.length > 1} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <SkeletonBox className="h-full w-full" />
            </div>
          )}
        </div>
      </section>
      <ChartExpandModal open={expanded} onClose={close} title={typeof title === 'string' ? title : 'Detailed Analysis'} defaultMetric={defaultMetric} allowZones={allowZones} />
    </>
  )
}
