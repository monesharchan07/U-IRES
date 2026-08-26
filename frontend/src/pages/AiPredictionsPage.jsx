import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { METRICS, METRIC_KEYS } from '../mock/mockData'
import { fetchAllPredictions, fetchModelComparison } from '../services/predictionService'
import Panel from '../components/ui/Panel'
import { DataBadge } from '../components/ui/Badges'
import { Segmented } from '../components/ui/Controls'
import { ChartCard } from '../components/charts/ChartCard'
import { CompareBarChart, TrendAreaChart } from '../components/charts/Primitives'
import { SkeletonBox, IconChip } from '../components/ui/Misc'
import { Bar as MeterBar } from '../components/ui/Gauges'
import { IconInfo } from '../components/icons'
import { IconDrop, IconThermo, IconUsers, IconWifi, IconZap } from '../components/icons'

const ICONS = {
  temperature: IconThermo,
  humidity: IconDrop,
  occupancy: IconUsers,
  power: IconZap,
  network: IconWifi,
}

function PredictionCard({ metricKey, current, predicted, confidence }) {
  const cfg = METRICS[metricKey]
  const delta = predicted - current
  const goodDown = metricKey === 'temperature' || metricKey === 'power'
  const improving = goodDown ? delta < 0 : delta > 0
  const neutral = Math.abs(delta) < 0.15
  const color = neutral ? '#8fa8b0' : improving ? '#3dffa8' : '#ffb454'
  return (
    <div className="glass glass-hover !rounded-xl px-4 py-3.5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="label-cap !text-[9px] flex items-center gap-1.5">
          <IconChip icon={ICONS[metricKey]} color={cfg.key === 'temperature' ? '#ffb454' : '#4fd7ff'} size={26} />
          {cfg.label}
        </span>
        <DataBadge kind="predicted" dotted={false} />
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <div className="text-[9px] font-tech text-faint uppercase tracking-widest">Current</div>
          <div className="font-mono font-bold tnum text-[20px] text-ink leading-tight">{current} <span className="text-[10px] text-dim">{cfg.unit}</span></div>
        </div>
        <svg width="26" height="10" viewBox="0 0 26 10" className="mb-1.5 shrink-0" style={{ color }}>
          <path d="M1 5h20M17 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-right">
          <div className="text-[9px] font-tech text-faint uppercase tracking-widest">Predicted</div>
          <div className="font-mono font-bold tnum text-[20px] leading-tight" style={{ color }}>{predicted} <span className="text-[10px] text-dim">{cfg.unit}</span></div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <MeterBar value={confidence} max={100} color="#4fd7ff" height={3.5} />
        <span className="font-mono text-[8px] text-faint tracking-widest whitespace-nowrap">CONF {confidence}%</span>
      </div>
    </div>
  )
}

export default function AiPredictionsPage() {
  const { zones, selectedZone } = useAppStore()
  const zoneId = selectedZone === 'all' ? 'A' : selectedZone
  const [predictions, setPredictions] = useState(null)
  const [models, setModels] = useState(null)
  const [chartMetric, setChartMetric] = useState('temperature')

  useEffect(() => {
    let alive = true
    const zz = zones?.[zoneId]
    if (!zz) return undefined
    fetchAllPredictions({ zoneId, currentValuesByMetric: {
      temperature: zz.temperature,
      humidity: zz.humidity,
      occupancy: zz.occupancy,
      power: zz.estimatedPower,
      network: zz.networkHealth,
    } }).then((p) => alive && setPredictions(p))
    return () => {
      alive = false
    }
  }, [zoneId, zones === null])

  useEffect(() => {
    let alive = true
    fetchModelComparison().then((m) => alive && setModels(m))
    return () => {
      alive = false
    }
  }, [])

  const chartSeries = useMemo(() => {
    if (!predictions) return []
    return [
      { key: 'value', label: 'ACTUAL', color: '#3dffa8', type: 'line' },
      { key: 'pv', label: 'PREDICTED', color: '#b48cff', type: 'line', dashed: true },
    ]
  }, [predictions])

  return (
    <div className="space-y-3 rise-in">
      <div className="flex items-center gap-2 rounded-lg border border-sim/30 bg-sim/[0.06] px-4 py-2.5">
        <IconInfo size={14} style={{ color: '#b48cff' }} />
        <span className="text-[11px] text-dim leading-snug">
          Demonstration values — predictions and model scores below are mock outputs until the real ML evaluation pipeline is connected.
        </span>
      </div>

      <Panel title={`AI Predictions — Zone ${zoneId}`} subtitle="Live sensor state versus model forecast · XGBoost forecaster">
        {!predictions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
            {[...Array(5)].map((_, i) => <SkeletonBox key={i} className="h-[120px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
            {METRIC_KEYS.map((k) => {
              const p = predictions[k]
              return (
                <PredictionCard
                  key={k}
                  metricKey={k}
                  current={p.current}
                  predicted={p.forecastNext}
                  confidence={p.confidence}
                />
              )
            })}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-7 min-w-0 min-h-[320px]">
          <ChartCard
            title="Actual vs Predicted"
            subtitle={`Zone ${zoneId} · past window + forecast horizon`}
            defaultMetric={chartMetric}
          >
            <div className="px-2 pb-2 pt-1">
              <Segmented
                size="xs"
                value={chartMetric}
                onChange={setChartMetric}
                options={METRIC_KEYS.map((k) => ({ value: k, label: METRICS[k].short }))}
              />
              <div className="mt-2 min-h-[240px]">
                {predictions ? (
                  <TrendAreaChart data={predictions[chartMetric].data} series={chartSeries} unit={METRICS[chartMetric].unit} height={252} showLegend />
                ) : (
                  <SkeletonBox className="w-full" height={252} />
                )}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="xl:col-span-5 min-w-0">
          <Panel title="Model Comparison" subtitle="Hold-out evaluation on historical windows" actions={<DataBadge kind="estimated" dotted={false} />}>
            {!models ? (
              <SkeletonBox className="h-[260px]" />
            ) : (
              <div className="space-y-3 mt-1">
                {models.map((m) => (
                  <div key={m.id} className={`rounded-lg border px-3 py-2.5 transition-colors ${m.id === 'xgb' ? 'border-neon/40 bg-neon/[0.05]' : 'border-white/[0.06] bg-black/25 hover:border-neon/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11.5px] font-bold tracking-wider text-ink">{m.name}</span>
                      <span className="font-mono text-[10px] tnum" style={{ color: m.id === 'xgb' ? '#3dffa8' : '#93a8b0' }}>R² {m.r2.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      {[
                        { k: 'MAE', v: m.mae },
                        { k: 'RMSE', v: m.rmse },
                        { k: 'FIT ms', v: m.trainMs },
                      ].map((s) => (
                        <div key={s.k}>
                          <div className="font-mono tnum text-[13px] text-ink">{s.v}</div>
                          <div className="label-cap !text-[7.5px] mt-0.5">{s.k}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2"><MeterBar value={m.r2 * 100} max={100} color={m.id === 'xgb' ? '#3dffa8' : m.id === 'rf' ? '#4fd7ff' : '#8fa8b0'} height={3.5} /></div>
                    <div className="mt-1.5 text-[9.5px] font-tech text-faint tracking-wide">{m.note}</div>
                  </div>
                ))}
                <CompareBarChart
                  data={models.map((m) => ({ label: m.name.split(' ')[0], accuracy: Math.round(m.r2 * 100) }))}
                  series={[{ key: 'accuracy', label: 'Accuracy (R² %)', color: '#b48cff' }]}
                  horizontal
                  height={110}
                />
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
