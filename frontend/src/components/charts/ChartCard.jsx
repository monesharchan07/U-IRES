import { useCallback, useState } from 'react'
import { ExpandButton, ChartExpandModal } from './ExpandableChart'

export function ChartCard({ title, subtitle, badge = null, children, defaultMetric = 'temperature', allowZones = true, actions = null }) {
  const [expanded, setExpanded] = useState(false)
  const close = useCallback(() => setExpanded(false), [])
  return (
    <>      <section className="glass hud-corners h-full flex flex-col">
        <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
          <div className="min-w-0">
            <h3 className="label-cap !text-[10px] !tracking-[0.22em] text-neon/90">{title}</h3>
            {subtitle && <p className="text-[10px] text-faint font-tech mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge}
            {actions}
            <ExpandButton onClick={() => setExpanded(true)} />
          </div>
        </header>
        <div className="px-2 pb-3 pt-1 flex-1 min-h-0">{children}</div>
      </section>
      <ChartExpandModal
        open={expanded}
        onClose={close}
        title={typeof title === 'string' ? `${title} — Expanded` : 'Detailed Analysis'}
        defaultMetric={defaultMetric}
        allowZones={allowZones}
      />
    </>
  )
}
