import { useState } from 'react'
import { useAppStore } from '../hooks/useAppStore'
import { SIMULATION_META } from '../mock/mockData'
import { runSimulation } from '../services/simulationService'
import Panel from '../components/ui/Panel'
import { DataBadge } from '../components/ui/Badges'
import { Segmented, Toggle } from '../components/ui/Controls'
import { ScoreRing } from '../components/ui/Gauges'
import { DeltaText, Spinner, EmptyNote } from '../components/ui/Misc'
import { IconAlert, IconDrop, IconFan, IconBulb, IconThermo, IconUsers, IconWifi } from '../components/icons'

function SliderField({ icon: Icon, label, min, max, step = 1, value, unit, onChange }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 label-cap !text-[9px]">
          <Icon size={12} style={{ color: '#4fd7ff' }} />
          {label}
        </span>
        <span className="font-mono font-bold tnum text-[13px] text-neon">
          {value}
          <span className="text-dim text-[9px] ml-1">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        className="slider"
        style={{ '--fill': `${fill}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between mt-1 font-mono text-[8px] text-faint">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function DeviceRow({ icon: Icon, label, on, onChange, disabled }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 label-cap !text-[9px]">
        <Icon size={12} style={{ color: on ? '#3dffa8' : '#5c7078' }} />
        {label}
      </span>
      <Toggle on={on} onChange={onChange} labels disabled={disabled} />
    </div>
  )
}

function ScenarioBuilder({ zoneId, initial, live, notify }) {
  const [inputs, setInputs] = useState(() => initial)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const set = (patch) => {
    setInputs((prev) => ({ ...prev, ...patch }))
    setResult(null)
  }

  const simulate = async () => {
    setBusy(true)
    const res = await runSimulation(
      {
        occupancy: inputs.occupancy,
        temperature: inputs.temperature,
        humidity: inputs.humidity,
        network: inputs.network,
        fan: inputs.fan ? 'ON' : 'OFF',
        light: inputs.light ? 'ON' : 'OFF',
      },
      live,
    )
    setResult(res)
    setBusy(false)
    notify({ severity: 'info', title: 'Simulation complete', message: `Scenario evaluated for Zone ${zoneId} — score ${res.score}/100.`, toast: true })
  }

  const currentStateRows = [
    { label: 'Temperature', value: `${live.temperature.toFixed(1)} °C` },
    { label: 'Humidity', value: `${live.humidity} %` },
    { label: 'Occupancy', value: `${live.occupancy}` },
    { label: 'Network', value: `${live.networkHealth} % · ${live.network}` },
    { label: 'Est. Power', value: `${live.estimatedPower} W` },
    { label: 'Fan / Light', value: `${live.actuator.fan} / ${live.actuator.light}` },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
      <Panel title={`Scenario Inputs — Zone ${zoneId}`} subtitle="Adjust hypothetical conditions" className="xl:col-span-4" corners>
        <div className="space-y-2.5 mt-1">
          <SliderField icon={IconUsers} label="Occupancy" min={0} max={16} value={inputs.occupancy} unit="" onChange={(v) => set({ occupancy: v })} />
          <SliderField icon={IconThermo} label="Temperature" min={18} max={34} value={inputs.temperature} unit="°C" onChange={(v) => set({ temperature: v })} />
          <SliderField icon={IconDrop} label="Humidity" min={30} max={85} value={inputs.humidity} unit="%" onChange={(v) => set({ humidity: v })} />
          <SliderField icon={IconWifi} label="Network Health" min={60} max={100} value={inputs.network} unit="%" onChange={(v) => set({ network: v })} />
          <DeviceRow icon={IconFan} label="Fan" on={inputs.fan} onChange={(v) => set({ fan: v })} />
          <DeviceRow icon={IconBulb} label="Light" on={inputs.light} onChange={(v) => set({ light: v })} />

          <button type="button" className="btn btn-primary w-full !py-3 mt-1" onClick={simulate} disabled={busy}>
            {busy ? (<><Spinner size={14} color="#04261a" /> EVALUATING…</>) : 'SIMULATE'}
          </button>
        </div>
      </Panel>

      <div className="xl:col-span-8 space-y-3 min-w-0">
        {!result ? (
          <Panel title="Simulation Output" subtitle="Run a scenario to compare states" className="min-h-[420px]">
            <EmptyNote>Set your hypothetical conditions and press SIMULATE — outputs are virtual only.</EmptyNote>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {currentStateRows.slice(0, 3).map((r) => (
                <div key={r.label} className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2 text-center">
                  <div className="label-cap !text-[7.5px]">{r.label}</div>
                  <div className="font-mono font-bold tnum text-[14px] text-ink mt-1">{r.value}</div>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          <>
            <Panel title="Current vs Simulated State" subtitle={`Zone ${zoneId}`} actions={<DataBadge kind="simulated" />}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                <div className="space-y-1.5">
                  <div className="label-cap !text-[9px] mb-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-neon inline-block" /> CURRENT STATE <DataBadge kind="live" dotted={false} /></div>
                  {currentStateRows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between rounded-md border border-white/[0.05] bg-black/25 px-3 py-[7px]">
                      <span className="text-[10px] font-tech uppercase tracking-[0.12em] text-dim">{r.label}</span>
                      <span className="font-mono font-bold tnum text-[12px] text-ink">{r.value}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden md:flex flex-col items-center justify-center px-1 gap-1">
                  <svg width="34" height="24" viewBox="0 0 34 24" style={{ color: '#b48cff' }}>
                    <path d="M2 12h26M22 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
                  </svg>
                  <span className="font-mono text-[7px] tracking-[0.3em]" style={{ color: '#b48cff' }}>VIRTUAL</span>
                </div>

                <div className="space-y-1.5">
                  <div className="label-cap !text-[9px] mb-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sim inline-block" /> SIMULATED STATE <DataBadge kind="simulated" dotted={false} /></div>
                  {[
                    { label: 'Temperature', value: `${result.simulatedState.temperature.toFixed(1)} °C`, delta: result.impacts.find((i) => i.label === 'Temperature').delta },
                    { label: 'Humidity', value: `${result.simulatedState.humidity} %`, delta: result.impacts.find((i) => i.label === 'Humidity').delta },
                    { label: 'Occupancy', value: `${result.simulatedState.occupancy}`, delta: result.impacts.find((i) => i.label === 'Occupancy').delta },
                    { label: 'Network', value: `${result.simulatedState.networkHealth} %`, delta: result.impacts.find((i) => i.label === 'Network Health').delta },
                    { label: 'Est. Power', value: `${result.simulatedState.estimatedPower} W`, delta: result.impacts.find((i) => i.label === 'Estimated Power').delta, invert: true },
                    { label: 'Fan / Light', value: `${result.simulatedState.actuator.fan} / ${result.simulatedState.actuator.light}` },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between rounded-md border border-sim/25 bg-sim/[0.05] px-3 py-[7px]">
                      <span className="text-[10px] font-tech uppercase tracking-[0.12em] text-dim">{r.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono font-bold tnum text-[12px]" style={{ color: '#d9c9ff' }}>{r.value}</span>
                        {r.delta !== undefined && <DeltaText delta={r.delta} invertGood={r.invert} digits={1} />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <Panel title="Scenario Impact" subtitle="Delta versus live state" className="lg:col-span-7">
                <div className="space-y-1.5">
                  {result.impacts.map((imp) => (
                    <div key={imp.label} className="flex items-center gap-3 rounded-md border border-white/[0.05] bg-black/25 px-3 py-2">
                      <span className="text-[10px] font-tech uppercase tracking-[0.12em] text-dim w-[110px] shrink-0">{imp.label}</span>
                      <span className="flex-1 h-[3px] rounded-full bg-white/[0.07] relative overflow-hidden">
                        <span className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                        <span
                          className="absolute inset-y-0 rounded-full"
                          style={{
                            background: imp.delta === 0 ? 'transparent' : imp.label === 'Estimated Power' ? (imp.delta > 0 ? '#ffb454' : '#3dffa8') : (imp.delta > 0 ? '#3dffa8' : '#ff8a97'),
                            width: `${Math.min(50, Math.abs(imp.delta) * 4)}%`,
                            left: imp.delta >= 0 ? '50%' : undefined,
                            right: imp.delta < 0 ? '50%' : undefined,
                          }}
                        />
                      </span>
                      <DeltaText delta={imp.delta} unit={imp.unit} invertGood={imp.label === 'Estimated Power'} digits={1} />
                    </div>
                  ))}
                  <ul className="mt-2 space-y-1">
                    {result.notes.map((n) => (
                      <li key={n} className="text-[11px] text-dim leading-snug flex gap-2"><span style={{ color: '#b48cff' }}>▸</span>{n}</li>
                    ))}
                  </ul>
                </div>
              </Panel>

              <Panel title="Simulation Score" subtitle="Weighted comfort · energy · network" className="lg:col-span-5 flex flex-col items-center justify-center">
                <ScoreRing score={result.score} size={128} label="SIMULATION SCORE" />
                <div className="mt-3 grid grid-cols-3 gap-3 w-full text-center">
                  {[
                    { label: 'Comfort', v: result.comfort },
                    { label: 'Energy', v: result.energyScore },
                    { label: 'Network', v: result.netScore },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="font-mono font-bold tnum text-[16px] text-ink">{s.v}</div>
                      <div className="label-cap !text-[7.5px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function WhatIfSimulationPage() {
  const { zones, selectedZone, setSelectedZone, notify } = useAppStore()
  const zoneId = selectedZone === 'all' ? 'A' : selectedZone
  const z = zones?.[zoneId]

  if (!z) return null

  return (
    <div className="space-y-3 rise-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-sim/30 bg-sim/[0.06] px-4 py-2.5 flex-1 min-w-[280px]">
          <IconAlert size={14} style={{ color: '#b48cff' }} />
          <span className="text-[11px] text-dim leading-snug">{SIMULATION_META.disclaimer}</span>
          <DataBadge kind="simulated" />
        </div>
        <Segmented
          value={zoneId}
          onChange={setSelectedZone}
          options={[{ value: 'A', label: 'ZONE A' }, { value: 'B', label: 'ZONE B' }]}
        />
      </div>

      <ScenarioBuilder
        key={zoneId}
        zoneId={zoneId}
        notify={notify}
        live={z}
        initial={{
          occupancy: z.occupancy,
          temperature: Math.round(z.temperature),
          humidity: z.humidity,
          network: z.networkHealth,
          fan: z.actuator.fan === 'ON',
          light: z.actuator.light === 'ON',
        }}
      />
    </div>
  )
}
