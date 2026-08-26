import { useEffect, useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { useLiveClock } from '../hooks/useLiveClock'
import { ZONES, expectedOutcomeFor } from '../mock/mockData'
import { timeAgo } from '../utils/format'
import Panel from '../components/ui/Panel'
import { DataBadge, StatusBadge } from '../components/ui/Badges'
import { Segmented } from '../components/ui/Controls'
import { ChartCard } from '../components/charts/ChartCard'
import { HistoryChart, useHistorySeries } from '../components/charts/HistoryChart'
import { TrendAreaChart } from '../components/charts/Primitives'
import { EmptyNote, IconChip } from '../components/ui/Misc'
import { IconBolt, IconCheck } from '../components/icons'

function ThumbsIcon({ down = false, size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={down ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M7 10.5v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zM7 11l4.2-7.3a2 2 0 0 1 3.7 1.1L14 10.5h5.1a2 2 0 0 1 2 2.5l-1.4 6a2 2 0 0 1-2 1.5H7" />
    </svg>
  )
}

function PredictionChart({ zoneId }) {
  const hist = useHistorySeries({ zoneId, metricKey: 'temperature', rangeValue: '6H' })
  const [merged, setMerged] = useState(null)
  useEffect(() => {
    if (!hist) return
    const last = hist[hist.length - 1].value
    const now = Date.now()
    const future = Array.from({ length: 8 }, (_, i) => ({
      t: now + (i + 1) * 1800000,
      label: new Date(now + (i + 1) * 1800000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      value: null,
      pv: Math.round((last + Math.sin(i / 2) * 0.6 + i * 0.08) * 10) / 10,
    }))
    setMerged([...hist.map((p) => ({ ...p, pv: p.value })), ...future])
  }, [hist])
  if (!merged) return <div className="skeleton w-full rounded-lg" style={{ height: 190 }} />
  return (
    <TrendAreaChart
      data={merged}
      series={[
        { key: 'value', label: 'MEASURED', color: '#3dffa8', type: 'line' },
        { key: 'pv', label: 'FORECAST', color: '#b48cff', type: 'line', dashed: true },
      ]}
      unit="°C"
      height={190}
      showLegend
    />
  )
}

export default function ZoneDetailsPage() {
  const { zones, lastActions, notify } = useAppStore()
  const now = useLiveClock(1000)
  const [zoneId, setZoneId] = useState('A')
  const [feedbackSent, setFeedbackSent] = useState(false)

  const z = zones?.[zoneId]
  const action = lastActions.find((a) => a.zoneId === zoneId)
  const outcome = action ? expectedOutcomeFor(action.deviceStates) : null

  if (!z) return null

  const submitFeedback = (positive) => {
    setFeedbackSent(true)
    notify({
      severity: 'success',
      title: 'Feedback recorded',
      message: `Zone ${zoneId} outcome marked as ${positive ? 'effective' : 'ineffective'} — learning loop updated.`,
    })
  }

  return (
    <div className="space-y-3 rise-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={zoneId}
          onChange={(v) => {
            setZoneId(v)
            setFeedbackSent(false)
          }}
          options={ZONES.map((zz) => ({ value: zz.id, label: `ZONE ${zz.id}` }))}
        />
        <span className="font-mono text-[9px] tracking-[0.18em] text-faint">
          LAST UPDATE · <span className="text-dim">{timeAgo(z.lastUpdate, now.getTime())}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <Panel title="Current State" subtitle={`Zone ${zoneId} · ${ZONES.find((zz) => zz.id === zoneId).location}`} className="xl:col-span-4" corners>
          <div className="space-y-2 mt-1">
            {[
              { label: 'Temperature', value: `${z.temperature.toFixed(1)} °C`, kind: 'live' },
              { label: 'Humidity', value: `${z.humidity} %`, kind: 'live' },
              { label: 'Occupancy', value: `${z.occupancy} people`, kind: 'live' },
              { label: 'Network Health', value: `${z.networkHealth} %`, kind: 'live' },
              { label: 'Estimated Power', value: `${z.estimatedPower} W`, kind: 'estimated' },
              { label: 'Fan / Light', value: `${z.actuator.fan} / ${z.actuator.light}`, kind: null },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/25 px-3 py-2 hover:border-neon/25 transition-colors">
                <span className="text-[11px] font-tech uppercase tracking-[0.14em] text-dim">{row.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono font-bold tnum text-[13px] text-ink">{row.value}</span>
                  {row.kind && <DataBadge kind={row.kind} dotted={false} />}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/25 px-3 py-2">
              <span className="text-[11px] font-tech uppercase tracking-[0.14em] text-dim">Control Mode</span>
              <StatusBadge level={z.mode} />
            </div>
          </div>
        </Panel>

        <div className="xl:col-span-8 min-w-0 min-h-[260px]">
          <ChartCard title="Trend — Environment" subtitle={`Zone ${zoneId} · rolling telemetry`} defaultMetric="temperature">
            <HistoryChart zoneId={zoneId} metricKey="temperature" rangeValue="12H" height={230} />
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="min-w-0 min-h-[260px]">
          <ChartCard title="Prediction" subtitle="Solid = measured · dashed = forecast horizon" badge={<DataBadge kind="predicted" dotted={false} />} defaultMetric="temperature">
            <PredictionChart zoneId={zoneId} />
          </ChartCard>
        </div>

        <div className="space-y-3">
          <Panel title="Last Action" subtitle={`Zone ${zoneId} control history`}>
            {action && outcome ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-lg border border-neon/25 bg-neon/[0.05] px-3 py-2.5">
                  <IconChip icon={IconBolt} color="#3dffa8" size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink">{action.label}</div>
                    <div className="font-mono text-[9px] text-faint tracking-widest mt-0.5 uppercase">
                      {timeAgo(action.ts, now.getTime())} · source: {action.source}
                    </div>
                  </div>
                  <StatusBadge level="ONLINE" label="APPLIED" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {outcome.effects.map((e) => (
                    <span key={e} className="badge" style={{ color: '#4fd7ff', borderColor: 'rgba(79,215,255,.35)', background: 'rgba(79,215,255,.07)' }}>{e}</span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyNote>No actions applied to Zone {zoneId} yet.</EmptyNote>
            )}
          </Panel>

          <Panel title="Feedback" subtitle="Rate the observed outcome of the last action">
            {feedbackSent ? (
              <div className="flex items-center gap-3 rounded-lg border border-neon/25 bg-neon/[0.06] px-4 py-3 fade-in">
                <IconCheck size={16} style={{ color: '#3dffa8' }} />
                <span className="text-[12px] text-ink">Recorded — the learning loop will weight this outcome.</span>
              </div>
            ) : action ? (
              <div className="flex items-center gap-2.5">
                <button type="button" className="btn btn-ghost flex-1" onClick={() => submitFeedback(true)}>
                  <ThumbsIcon /> EFFECTIVE
                </button>
                <button type="button" className="btn btn-ghost flex-1" onClick={() => submitFeedback(false)}>
                  <ThumbsIcon down /> INEFFECTIVE
                </button>
              </div>
            ) : (
              <EmptyNote>Apply an action first to rate its outcome.</EmptyNote>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
