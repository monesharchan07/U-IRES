import { useEffect, useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { fetchAnalytics } from '../services/analyticsService'
import Panel from '../components/ui/Panel'
import { ChartCard } from '../components/charts/ChartCard'
import { CompareBarChart, TrendAreaChart } from '../components/charts/Primitives'
import { useHistorySeries } from '../components/charts/HistoryChart'
import { SkeletonBox, IconChip, DeltaText } from '../components/ui/Misc'
import { METRICS, ZONES } from '../mock/mockData'

function ZoneCompareChart({ metricKey, height = 190 }) {
  const a = useHistorySeries({ zoneId: 'A', metricKey, rangeValue: '24H' })
  const b = useHistorySeries({ zoneId: 'B', metricKey, rangeValue: '24H' })
  if (!a || !b) return <SkeletonBox className="w-full" height={height} />
  const len = Math.min(a.length, b.length)
  const data = Array.from({ length: len }, (_, i) => ({ label: a[i].label, va: a[i].value, vb: b[i].value }))
  return (
    <TrendAreaChart
      data={data}
      series={[
        { key: 'va', label: 'ZONE A', color: '#3dffa8', type: 'area' },
        { key: 'vb', label: 'ZONE B', color: '#4fd7ff', type: 'line' },
      ]}
      unit={METRICS[metricKey].unit}
      height={height}
      showLegend
    />
  )
}

export default function AnalyticsPage() {
  const { setActivePage } = useAppStore()
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    let alive = true
    fetchAnalytics().then((a) => alive && setAnalytics(a))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-3 rise-in">
      <Panel title="Analytics" subtitle="Historical performance across environment, prediction and control dimensions">
        {!analytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => <SkeletonBox key={i} className="h-[74px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {analytics.kpis.map((k, i) => (
              <button
                key={k.label}
                type="button"
                onClick={() => setActivePage('feedback-learning')}
                className="glass glass-hover !rounded-xl px-3.5 py-3 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="label-cap !text-[8px] truncate">{k.label}</span>
                  <IconChip icon={IconChipDot} color={k.trend === 'improving' ? '#3dffa8' : '#4fd7ff'} size={22} />
                </div>
                <div className="mt-1.5 font-mono font-bold tnum text-[19px] text-ink">{k.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <DeltaText delta={k.trend === 'improving' ? -0.12 : 0} unit="%" digits={0} invertGood={false} />
                  <span className="font-mono text-[8px] tracking-widest uppercase" style={{ color: k.trend === 'improving' ? '#3dffa8' : '#8fa8b0' }}>{k.trend}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Occupancy — 24H" subtitle={`Zone comparison · capacity ${ZONES[0].capacity + ZONES[1].capacity}`} defaultMetric="occupancy">
            <ZoneCompareChart metricKey="occupancy" />
          </ChartCard>
        </div>
        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Temperature — 24H" subtitle="Zone comparison" defaultMetric="temperature">
            <ZoneCompareChart metricKey="temperature" />
          </ChartCard>
        </div>
        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Humidity — 24H" subtitle="Zone comparison" defaultMetric="humidity">
            <ZoneCompareChart metricKey="humidity" />
          </ChartCard>
        </div>
        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Network Health — 24H" subtitle="Zone comparison" defaultMetric="network">
            <ZoneCompareChart metricKey="network" />
          </ChartCard>
        </div>
        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Estimated Power — 24H" subtitle="Modeled load · ESTIMATED source" defaultMetric="power">
            <ZoneCompareChart metricKey="power" />
          </ChartCard>
        </div>

        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Prediction Error — 30D" subtitle="Mean absolute error trend · lower is better" defaultMetric="temperature">
            {!analytics ? (
              <SkeletonBox className="w-full" height={190} />
            ) : (
              <TrendAreaChart
                data={analytics.predictionErrorTrend.map((p) => ({ label: p.label, value: p.value }))}
                series={[{ key: 'value', label: 'MAE °C', color: '#ffb454', type: 'area' }]}
                unit="°C"
                height={190}
              />
            )}
          </ChartCard>
        </div>

        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Action Effectiveness" subtitle="Weekly success rate of applied actions" defaultMetric="temperature">
            {!analytics ? (
              <SkeletonBox className="w-full" height={190} />
            ) : (
              <CompareBarChart
                data={analytics.actionEffectiveness}
                series={[{ key: 'value', label: 'Effectiveness %', color: '#3dffa8' }]}
                height={190}
              />
            )}
          </ChartCard>
        </div>

        <div className="min-h-[250px] min-w-0">
          <ChartCard title="Optimization Performance — 30D" subtitle="Composite optimizer score" defaultMetric="temperature">
            {!analytics ? (
              <SkeletonBox className="w-full" height={190} />
            ) : (
              <TrendAreaChart
                data={analytics.optimizationPerf.map((p) => ({ label: p.label, value: p.value }))}
                series={[{ key: 'value', label: 'Score', color: '#b48cff', type: 'area' }]}
                unit="/100"
                height={190}
              />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

function IconChipDot({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="5" opacity="0.9" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.5" />
    </svg>
  )
}
