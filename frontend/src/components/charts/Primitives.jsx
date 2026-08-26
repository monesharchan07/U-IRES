import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS, tooltipStyle } from '../../utils/chartTheme'

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      style={{
        background: 'rgba(6, 11, 17, 0.95)',
        border: '1px solid rgba(61,255,168,0.3)',
        borderRadius: 10,
        padding: '8px 11px',
        boxShadow: '0 12px 30px -10px rgba(0,0,0,.9)',
      }}
    >
      <div className="font-mono text-[10px] tracking-widest text-dim mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[11px] font-mono tnum">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.stroke }} />
          <span style={{ color: '#93a8b0' }}>{p.name}</span>
          <span className="font-bold ml-auto" style={{ color: '#e9f5ef' }}>
            {p.value === null || p.value === undefined ? '--' : p.value} {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartLegend({ payload }) {
  if (!payload) return null
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap mt-1">
      {payload.map((entry) => (
        <span key={entry.dataKey || entry.value} className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider" style={{ color: '#93a8b0' }}>
          <span className="w-3 h-[3px] rounded-full" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
          {entry.value}
        </span>
      ))}
    </div>
  )
}

export function TrendAreaChart({ data, series, unit = '', height = 220, showLegend = true, xInterval = 'preserveStartEnd' }) {
  const hasAreas = series.some((s) => s.type !== 'line')
  const ChartComp = hasAreas ? AreaChart : LineChart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComp data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'rgba(120,200,170,0.15)' }} interval={xInterval} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={46} domain={['auto', 'auto']} tickCount={5} tickFormatter={(v) => Math.round(v * 10) / 10} />
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: 'rgba(61,255,168,0.25)', strokeWidth: 1 }} isAnimationActive={false} />
        {showLegend && <Legend content={<ChartLegend />} />}
        {series.map((s) =>
          s.type === 'line' ? (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ) : (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ),
        )}
      </ChartComp>
    </ResponsiveContainer>
  )
}

export function CompareBarChart({ data, series, unit = '', height = 220, horizontal = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 12, left: horizontal ? 40 : -14, bottom: 0 }} barGap={5}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} domain={[0, 100]} />
            <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'rgba(120,200,170,0.15)' }} minTickGap={20} />
            <YAxis tickLine={false} axisLine={false} width={46} />
          </>
        )}
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(61,255,168,0.05)' }} isAnimationActive={false} />
        {showLegendIf(series) && <Legend content={<ChartLegend />} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={26} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function showLegendIf(series) {
  return series.length > 1
}

export { tooltipStyle }
