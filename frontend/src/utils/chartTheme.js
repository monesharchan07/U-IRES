export const CHART_COLORS = {
  neon: '#3dffa8',
  ice: '#4fd7ff',
  warn: '#ffb454',
  crit: '#ff5470',
  sim: '#b48cff',
  dim: '#40525c',
  grid: 'rgba(120, 200, 170, 0.09)',
}

export const ZONE_COLORS = {
  A: '#3dffa8',
  B: '#4fd7ff',
  all: '#b48cff',
}

export const axisTick = { fill: '#5c7078', fontSize: 10 }

export function tooltipStyle() {
  return {
    contentStyle: {
      background: 'rgba(7, 12, 19, 0.94)',
      border: '1px solid rgba(61, 255, 168, 0.3)',
      borderRadius: 10,
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.9)',
      fontSize: 11,
      fontFamily: 'Consolas, monospace',
    },
    labelStyle: { color: '#93a8b0', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 },
    itemStyle: { color: '#e9f5ef' },
  }
}
