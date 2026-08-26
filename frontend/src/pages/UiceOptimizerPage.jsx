import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { fetchCandidates } from '../services/optimizerService'
import Panel from '../components/ui/Panel'
import { DataBadge, StatusBadge } from '../components/ui/Badges'
import { Segmented } from '../components/ui/Controls'
import { Bar as MeterBar } from '../components/ui/Gauges'
import { SkeletonBox, IconChip } from '../components/ui/Misc'
import { IconArrowRight, IconCheck, IconCpu, IconTarget } from '../components/icons'

function ImpactChip({ label, value }) {
  const positive = label === 'energy' ? value < 0 : value > 0
  const neutral = value === 0
  const color = neutral ? '#8fa8b0' : positive ? '#3dffa8' : '#ff8a97'
  const sign = value > 0 ? '+' : ''
  return (
    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-[3px] font-mono text-[9px] tracking-wider"
      style={{ color, borderColor: `${color}44`, background: `${color}10` }}
    >
      {label.toUpperCase()} {sign}{value}
    </span>
  )
}

export default function UiceOptimizerPage() {
  const { zones, selectedZone, setSelectedZone, setActivePage, notify } = useAppStore()
  const zoneId = selectedZone === 'all' ? 'A' : selectedZone
  const [candidates, setCandidates] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let alive = true
    setCandidates(null)
    setSelectedId(null)
    const zz = zones?.[zoneId]
    if (zz) {
      fetchCandidates(zones, zoneId).then((c) => alive && setCandidates(c))
    }
    return () => {
      alive = false
    }
  }, [zoneId, zones === null])

  useEffect(() => {
    if (candidates && !selectedId) {
      const best = [...candidates].sort((a, b) => b.score - a.score)[0]
      setSelectedId(best.id)
    }
  }, [candidates, selectedId])

  const best = useMemo(() => (candidates ? [...candidates].sort((a, b) => b.score - a.score)[0] : null), [candidates])
  const selected = useMemo(() => candidates?.find((c) => c.id === selectedId) || best, [candidates, selectedId, best])

  return (
    <div className="space-y-3 rise-in">
      <Panel
        title="UICE Optimizer"
        subtitle="Unified Intelligent Control Engine — candidate action evaluation"
        actions={<Segmented size="xs" value={zoneId} onChange={setSelectedZone} options={[{ value: 'A', label: 'ZONE A' }, { value: 'B', label: 'ZONE B' }]} />}
        corners
      >
        <div className="flex items-center gap-3 rounded-lg border border-neon/25 bg-gradient-to-r from-neon/[0.08] to-transparent px-4 py-3 mb-3">
          <IconChip icon={IconCpu} color="#b48cff" size={38} />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink">Engine cycle complete</div>
            <div className="text-[11px] text-dim mt-0.5">
              Evaluated candidate control actions against live Zone {zoneId} state · policy v0.9-mock · reward-weighted scoring
            </div>
          </div>
          <StatusBadge level="ONLINE" label="ACTIVE" />
        </div>

        {!candidates ? (
          <SkeletonBox className="h-[300px]" />
        ) : (
          <div className="space-y-2.5">
            {candidates.map((c) => {
              const isBest = best && c.id === best.id
              const isSelected = selected && c.id === selected.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all relative overflow-hidden ${
                    isSelected ? 'border-neon/50 bg-neon/[0.06]' : 'border-white/[0.07] bg-black/25 hover:border-neon/25'
                  } ${isBest ? 'glow-ring' : ''}`}
                >
                  {isBest && (
                    <span className="absolute top-0 right-0 badge !rounded-none !rounded-bl-lg" style={{ color: '#04261a', background: 'linear-gradient(135deg,#57ffca,#21d98c)', borderColor: 'transparent' }}>
                      ★ RECOMMENDED
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pr-16">
                    <div className="min-w-[130px]">
                      <div className="font-mono font-bold text-[13px] tracking-wider text-ink">{c.label}</div>
                      <div className="mt-1.5 w-[110px]"><MeterBar value={c.score} max={100} color={isBest ? '#3dffa8' : c.score >= 60 ? '#4fd7ff' : '#8fa8b0'} height={4} /></div>
                    </div>
                    <div className="text-center min-w-[54px]">
                      <div className="font-mono font-bold tnum text-[22px]" style={{ color: isBest ? '#3dffa8' : '#e9f5ef' }}>{c.score}</div>
                      <div className="label-cap !text-[7.5px]">SCORE</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ImpactChip label="energy" value={c.impacts.energy} />
                      <ImpactChip label="occupancy" value={c.impacts.occupancy} />
                      <ImpactChip label="network" value={c.impacts.network} />
                      <ImpactChip label="comfort" value={c.impacts.comfort} />
                    </div>
                    <div className="ml-auto hidden md:flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em]" style={{ color: isSelected ? '#3dffa8' : '#5c7078' }}>
                      {isSelected ? (<><IconCheck size={11} /> SELECTED</>) : 'SELECT'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Panel>

      {best && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <Panel title="Why This Action?" subtitle={`Explanation for Zone ${zoneId}`} className="xl:col-span-7">
            <div className="flex items-start gap-3.5">
              <IconChip icon={IconTarget} color="#3dffa8" size={40} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[15px] text-neon glow-text">{best.label}</span>
                  <DataBadge kind="estimated" dotted={false} />
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-dim">{best.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ImpactChip label="energy" value={best.impacts.energy} />
                  <ImpactChip label="occupancy" value={best.impacts.occupancy} />
                  <ImpactChip label="network" value={best.impacts.network} />
                  <ImpactChip label="comfort" value={best.impacts.comfort} />
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[10.5px] font-tech text-faint leading-relaxed">
              DECISION PATH: sensor snapshot → feature vector → ensemble forecast → reward model → argmax action · latency 63 ms mock
            </div>
          </Panel>

          <Panel title="Dispatch" subtitle="Send the selected action to the Action Center" className="xl:col-span-5">
            <div className="flex items-center gap-3 rounded-lg border border-neon/25 bg-neon/[0.05] px-4 py-3.5">
              <IconArrowRight size={18} style={{ color: '#3dffa8' }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{selected?.label || best.label}</div>
                <div className="text-[10.5px] text-faint mt-0.5">Zone {zoneId} · score {selected?.score ?? best.score}/100</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full mt-3"
              onClick={() => {
                setActivePage('action-center')
                notify({ severity: 'info', title: 'Sent to Action Center', message: `Review and apply "${selected?.label || best.label}" for Zone ${zoneId}.` })
              }}
            >
              OPEN IN ACTION CENTER
            </button>
            <p className="mt-2.5 text-[10px] text-center font-tech text-faint tracking-wide uppercase">
              Actions remain simulated until the Flask control bridge is connected
            </p>
          </Panel>
        </div>
      )}
    </div>
  )
}
