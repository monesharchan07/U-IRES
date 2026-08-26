import { useEffect, useState } from 'react'
import { fetchMetricHistory } from '../../services/campusService'
import { METRICS } from '../../mock/mockData'
import { TrendAreaChart } from './Primitives'
import { SkeletonBox } from '../ui/Misc'

export function useHistorySeries({ zoneId, metricKey, rangeValue = '12H', anchorValue = null }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let alive = true
    setData(null)
    fetchMetricHistory({ zoneId, metricKey, rangeValue, anchorValue }).then((pts) => {
      if (alive) setData(pts)
    })
    return () => {
      alive = false
    }
  }, [zoneId, metricKey, rangeValue, anchorValue])
  return data
}

export function HistoryChart({ zoneId, metricKey, rangeValue = '12H', height = 190, color }) {
  const data = useHistorySeries({ zoneId, metricKey, rangeValue })
  const stroke = color || (zoneId === 'A' ? '#3dffa8' : '#4fd7ff')
  if (!data) return <SkeletonBox className="w-full" height={height} />
  return (
    <TrendAreaChart
      data={data}
      series={[{ key: 'value', label: `${METRICS[metricKey].short} · ZONE ${zoneId}`, color: stroke, type: 'area' }]}
      unit={METRICS[metricKey].unit}
      height={height}
      showLegend={false}
    />
  )
}
