import { useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { ZONES } from '../mock/mockData'
import Panel from '../components/ui/Panel'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { StatusBadge } from '../components/ui/Badges'
import { Toggle } from '../components/ui/Controls'
import { IconBulb, IconFan, IconInfo, IconRefresh } from '../components/icons'

function ZoneOverrideCard({ zoneId }) {
  const { zones, runAction, resumeAutomation, engageManualMode } = useAppStore()
  const z = zones?.[zoneId]
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!z) return null
  const meta = ZONES.find((zz) => zz.id === zoneId)
  const accent = zoneId === 'A' ? '#3dffa8' : '#4fd7ff'

  const requestToggle = (device) => {
    const nextState = z.actuator[device] === 'ON' ? 'OFF' : 'ON'
    setPending({ device, nextState })
  }

  const confirmOverride = async () => {
    if (!pending) return
    setBusy(true)
    engageManualMode(zoneId)
    await runAction({
      zoneId,
      label: `${pending.device === 'fan' ? 'Fan' : 'Light'} ${pending.nextState}`,
      deviceStates: [{ device: pending.device, state: pending.nextState }],
      source: 'manual',
    })
    setBusy(false)
    setPending(null)
  }

  return (
    <section className="glass glass-hover hud-corners h-full relative overflow-hidden" style={{ borderColor: `${accent}2a` }}>
      <span className="corner-br" />
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}14, transparent 70%)` }} />
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <h3 className="font-mono font-bold tracking-[0.2em] text-[15px] text-ink">ZONE {zoneId}</h3>
          <span className="text-[9px] font-tech text-faint uppercase tracking-wider hidden sm:inline">{meta.location}</span>
        </div>
        <StatusBadge level={z.mode} />
      </header>

      <div className="px-4 py-4 space-y-2.5">
        {[
          { device: 'fan', icon: IconFan },
          { device: 'light', icon: IconBulb },
        ].map(({ device, icon: Icon }) => (
          <div key={device} className="rounded-lg border border-white/[0.06] bg-black/25 px-3.5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon size={16} style={{ color: z.actuator[device] === 'ON' ? accent : '#5c7078' }} />
              <div>
                <div className="text-[12px] font-semibold text-ink capitalize">{device}</div>
                <div className="font-mono text-[9px] tracking-widest mt-0.5" style={{ color: z.actuator[device] === 'ON' ? '#3dffa8' : '#8fa8b0' }}>
                  STATE · {z.actuator[device]}
                </div>
              </div>
            </div>
            <Toggle on={z.actuator[device] === 'ON'} onChange={() => requestToggle(device)} labels disabled={busy} />
          </div>
        ))}

        {z.mode === 'MANUAL' && (
          <button type="button" className="btn btn-ghost w-full !text-[10px]" onClick={() => resumeAutomation(zoneId)} disabled={busy}>
            <IconRefresh size={12} /> RESUME AUTOMATION
          </button>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Set Zone ${zoneId} ${pending?.device === 'fan' ? 'Fan' : 'Light'} to ${pending?.nextState}?`}
        message={`This is a manual override. It takes immediate effect on the zone actuator, suspends automated recommendations for this zone, and is recorded in the action log.`}
        confirmLabel="Confirm Override"
        danger
        busy={busy}
        onConfirm={confirmOverride}
        onCancel={() => setPending(null)}
      />
    </section>
  )
}

export default function ManualOverridePage() {
  return (
    <div className="space-y-3 rise-in">
      <div className="flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/[0.07] px-4 py-2.5">
        <IconInfo size={14} style={{ color: '#ffb454' }} />
        <span className="text-[11px] text-dim leading-snug">
          Manual control overrides the current automated recommendation. While a zone is in MANUAL mode, UICE suggestions are suppressed until automation is resumed.
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ZoneOverrideCard zoneId="A" />
        <ZoneOverrideCard zoneId="B" />
      </div>

      <Panel title="Override Semantics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-center">
          {[
            { t: 'Confirmation Required', d: 'Every manual toggle asks for explicit confirmation before dispatch.' },
            { t: 'Automation Suspended', d: 'Switching a device puts the zone into MANUAL mode immediately.' },
            { t: 'Full Restore', d: 'Resume Automation returns control to the UICE decision loop.' },
          ].map((x) => (
            <div key={x.t} className="rounded-lg border border-white/[0.05] bg-black/25 px-3 py-3">
              <div className="label-cap !text-[9px]" style={{ color: '#4fd7ff' }}>{x.t}</div>
              <p className="mt-1.5 text-[11px] text-dim leading-snug">{x.d}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
