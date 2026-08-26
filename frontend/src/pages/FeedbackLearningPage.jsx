import { useMemo } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { useLiveClock } from '../hooks/useLiveClock'
import { FEEDBACK_PIPELINE, buildFeedbackCycle } from '../mock/mockData'
import Panel from '../components/ui/Panel'
import { DataBadge } from '../components/ui/Badges'
import { ScoreRing } from '../components/ui/Gauges'
import { EmptyNote } from '../components/ui/Misc'
import { timeAgo } from '../utils/format'
import { IconActivity, IconBrain, IconCheck, IconRefresh, IconTarget } from '../components/icons'

const PIPE_ICONS = [IconBrain, IconBoltLocal, IconTarget, IconActivity, IconRefresh, IconCheck]

function IconBoltLocal({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2.5L4.5 13.5H11l-1 8L19.5 10H13z" />
    </svg>
  )
}

function FcaoFlow() {
  return (
    <div className="relative rounded-2xl border border-neon/25 bg-gradient-to-br from-neon/[0.07] via-transparent to-sim/[0.06] p-5 md:p-7 overflow-hidden">
      <div className="absolute -top-16 left-1/3 w-[420px] h-[220px] rounded-full pointer-events-none opacity-70" style={{ background: 'radial-gradient(ellipse at center, rgba(61,255,168,.1), transparent 70%)' }} />
      <div className="relative flex flex-wrap items-center justify-between gap-y-2 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono font-bold text-xl tracking-[0.28em] text-neon glow-text">F C A O</h2>
            <DataBadge kind="estimated" dotted={false} />
          </div>
          <p className="text-[11px] font-tech uppercase tracking-[0.2em] text-dim mt-1">Feedback-Calibrated Adaptive Optimization</p>
        </div>
        <span className="badge !py-1 !px-2.5" style={{ color: '#b48cff', borderColor: 'rgba(180,140,255,.4)', background: 'rgba(180,140,255,.08)' }}>
          CORE LEARNING LOOP · v0.9 MOCK
        </span>
      </div>

      <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5 lg:gap-0 justify-between">
        {FEEDBACK_PIPELINE.map((node, i) => {
          const Icon = PIPE_ICONS[i]
          const accent = i === 0 || i >= 4 ? '#3dffa8' : i <= 2 ? '#4fd7ff' : '#ffb454'
          return (
            <div key={node.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center text-center group px-1.5">
                <div
                  className="w-[52px] h-[52px] rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    borderColor: `${accent}55`,
                    background: `radial-gradient(circle at 50% 30%, ${accent}20, rgba(5,9,14,.75))`,
                    boxShadow: `0 0 18px -6px ${accent}99`,
                    color: accent,
                  }}
                >
                  <Icon size={21} />
                </div>
                <div className="mt-2 font-mono text-[9px] font-bold tracking-[0.12em]" style={{ color: accent }}>{node.label.toUpperCase()}</div>
                <div className="mt-0.5 text-[8.5px] font-tech text-faint uppercase tracking-wider max-w-[92px] leading-tight">{node.detail}</div>
              </div>
              {i < FEEDBACK_PIPELINE.length - 1 && (
                <>
                  <div className="hidden lg:flex flex-1 items-center mx-1 mb-8">
                    <svg width="100%" height="18" viewBox={`0 0 100 18`} preserveAspectRatio="none" className="overflow-visible">
                      <line x1="0" y1="9" x2="94" y2="9" stroke={`${accent}88`} strokeWidth="1.4" className="flow-line" />
                      <polygon points="96,9 90,5.4 90,12.6" fill={accent} opacity="0.9" />
                    </svg>
                  </div>
                  <div className="lg:hidden self-center px-1" style={{ color: `${accent}` }}>↓</div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <p className="relative mt-6 text-center text-[11px] text-faint leading-relaxed max-w-3xl mx-auto">
        Every control cycle is measured against its own prediction. The observed error recalibrates the policy so future decisions inherit what the system just learned.
      </p>
    </div>
  )
}

export default function FeedbackLearningPage() {
  const { lastActions } = useAppStore()
  const now = useLiveClock(1000)
  const cycle = useMemo(() => buildFeedbackCycle(lastActions[0], 'v1'), [lastActions])

  const steps = [
    'Action completed',
    'Actual outcome measured',
    'Prediction error calculated',
    'Feedback recorded',
    'Optimization policy updated',
  ]

  return (
    <div className="space-y-3 rise-in">
      <Panel title="Feedback & Learning" subtitle="Closed-loop verification of predicted versus actual outcomes">
        <FcaoFlow />
      </Panel>

      {!cycle ? (
        <Panel title="Latest Learning Cycle">
          <EmptyNote>Apply an action from the Action Center or Manual Override to generate a learning cycle.</EmptyNote>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <Panel title="Last Action" className="xl:col-span-4">
            <div className="rounded-lg border border-neon/25 bg-neon/[0.05] px-3.5 py-3">
              <div className="font-mono font-bold text-[15px] text-ink">{cycle.action.label}</div>
              <div className="font-mono text-[9px] tracking-[0.18em] text-faint uppercase mt-1.5">
                ZONE {cycle.action.zoneId} · {timeAgo(cycle.action.ts, now.getTime())} · {cycle.action.source}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Predicted Outcome', value: cycle.predicted, kind: 'predicted' },
                { label: 'Actual Outcome', value: cycle.actual, kind: 'live' },
                { label: 'Prediction Error', value: cycle.error },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/25 px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 label-cap !text-[9px]">{r.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-bold tnum text-[12.5px] text-ink">{r.value}</span>
                    {r.kind && <DataBadge kind={r.kind} dotted={false} />}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Action Effectiveness" subtitle="How closely reality matched the model" className="xl:col-span-4">
            <div className="flex flex-col items-center justify-center py-3">
              <ScoreRing score={cycle.effectiveness} size={150} label="EFFECTIVENESS" />
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/25 px-3.5 py-2.5 w-full">
                <div className="label-cap !text-[8px]">Policy Adjustment</div>
                <div className="font-mono text-[11px] mt-1" style={{ color: '#b48cff' }}>{cycle.policyDelta}</div>
              </div>
            </div>
          </Panel>

          <Panel title="Verification Pipeline" subtitle="Cycle completion status" className="xl:col-span-4">
            <div className="space-y-2 mt-1">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-3 rounded-lg border border-neon/20 bg-neon/[0.04] px-3 py-2.5 rise-in" style={{ animationDelay: `${i * 110}ms` }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(61,255,168,.15)', color: '#3dffa8', boxShadow: '0 0 10px rgba(61,255,168,.35)' }}>
                    <IconCheck size={11} />
                  </span>
                  <span className="text-[12px] text-ink">✓ {s}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
