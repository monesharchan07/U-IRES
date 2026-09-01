import { useAppStore } from '../../hooks/useAppStore'
import { IconCpu, IconNode } from '../icons'

export default function StructureOverviewPanel() {
  const { zones } = useAppStore()

  const za = zones?.A || { networkHealth: 98, estimatedPower: 14, mode: 'AUTO', connection: 'online' }
  const zb = zones?.B || { networkHealth: 96, estimatedPower: 18, mode: 'AUTO', connection: 'online' }
  const avgNet = ((za.networkHealth || 98) + (zb.networkHealth || 96)) / 2

  return (
    <section className="glass hud-corners h-full flex flex-col justify-between">
      <span className="corner-br" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="label-cap !tracking-[0.24em] text-ink">STRUCTURE OVERVIEW</h3>
            <span
              className="font-mono text-[8px] px-1.5 py-0.5 rounded border tracking-[0.16em]"
              style={{ color: '#3dffa8', borderColor: 'rgba(61,255,168,0.35)', background: 'rgba(61,255,168,0.08)' }}
            >
              SYSTEM TOPOLOGY
            </span>
          </div>
          <p className="text-[10px] text-faint font-tech mt-0.5">Real-time Network Structure &amp; Flow</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon pulse-dot" />
          <span className="font-mono text-[9px] text-neon tracking-wider">ALL MESH ACTIVE</span>
        </div>
      </header>

      {/* Main Topology: 3 Horizontal Nodes + Data Flow Connections */}
      <div className="relative px-3 py-2 my-auto">
        {/* Background Connecting Lines for Desktop */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 130">
            {/* Zone A -> Core active flow */}
            <line x1="124" y1="46" x2="148" y2="46" stroke="#3dffa8" strokeWidth="1.5" className="flow-line" />
            <polygon points="152,46 146,42 146,50" fill="#3dffa8" />

            {/* Zone B -> Core active flow */}
            <line x1="276" y1="46" x2="252" y2="46" stroke="#4fd7ff" strokeWidth="1.5" className="flow-line" />
            <polygon points="248,46 254,42 254,50" fill="#4fd7ff" />

            {/* Secondary Redundant Mesh Curve */}
            <path d="M 65 105 C 130 130 270 130 335 105" fill="none" stroke="rgba(180, 140, 255, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 relative z-10">
          {/* Node 1: ZONE A (Left) */}
          <div className="rounded-xl border border-neon/30 bg-black/40 p-2.5 transition-all hover:border-neon/60 hover:bg-neon/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-neon/30 bg-neon/10 text-neon shrink-0">
                <IconNode size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono font-bold text-[12px] text-neon leading-tight">ZONE A</div>
                <div className="text-[8.5px] font-tech text-dim truncate">Edge Node · Wing 1</div>
              </div>
              <span className="badge !px-1.5 !py-0" style={{ color: '#3dffa8', borderColor: 'rgba(61,255,168,0.4)', background: 'rgba(61,255,168,0.08)' }}>
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">LATENCY</span>
                <span className="text-ink font-bold tnum">12 ms</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">NET HEALTH</span>
                <span className="text-neon font-bold tnum">{za.networkHealth}%</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">POWER</span>
                <span className="text-ink font-bold tnum">{za.estimatedPower} W</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">MODE</span>
                <span className="text-neon font-bold">{za.mode}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-neon/90 bg-neon/[0.06] px-2 py-0.5 rounded border border-neon/20">
              <span>DATA FLOW</span>
              <span>→</span>
            </div>
          </div>

          {/* Node 2: U-IRES CORE (Center) */}
          <div className="rounded-xl border border-[#b48cff]/40 bg-black/50 p-2.5 transition-all hover:border-[#b48cff]/70 shadow-[0_0_22px_-6px_rgba(180,140,255,0.25)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative shrink-0">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#b48cff]/40 bg-[#b48cff]/10 text-[#b48cff]">
                  <IconCpu size={14} />
                </span>
                <svg viewBox="0 0 40 40" className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] spin-slow pointer-events-none">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="#b48cff" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="6 8" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono font-bold text-[12px] text-[#b48cff] leading-tight">U-IRES CORE</div>
                <div className="text-[8.5px] font-tech text-dim truncate">Decision Engine</div>
              </div>
              <span className="badge !px-1.5 !py-0" style={{ color: '#b48cff', borderColor: 'rgba(180,140,255,0.4)', background: 'rgba(180,140,255,0.08)' }}>
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">CPU LOAD</span>
                <span className="text-[#b48cff] font-bold tnum">24%</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">MEMORY</span>
                <span className="text-ink font-bold tnum">1.2 GB</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">AI ENGINE</span>
                <span className="text-[#b48cff] font-bold">UICE v2.4</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">UPTIME</span>
                <span className="text-neon font-bold tnum">99.98%</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1 text-[8px] font-mono text-[#b48cff] bg-[#b48cff]/[0.08] px-2 py-0.5 rounded border border-[#b48cff]/30">
              <span>● CORE ENGINE ACTIVE</span>
            </div>
          </div>

          {/* Node 3: ZONE B (Right) */}
          <div className="rounded-xl border border-ice/30 bg-black/40 p-2.5 transition-all hover:border-ice/60 hover:bg-ice/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-ice/30 bg-ice/10 text-ice shrink-0">
                <IconNode size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono font-bold text-[12px] text-ice leading-tight">ZONE B</div>
                <div className="text-[8.5px] font-tech text-dim truncate">Edge Node · Wing 2</div>
              </div>
              <span className="badge !px-1.5 !py-0" style={{ color: '#4fd7ff', borderColor: 'rgba(79,215,255,0.4)', background: 'rgba(79,215,255,0.08)' }}>
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">LATENCY</span>
                <span className="text-ink font-bold tnum">14 ms</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">NET HEALTH</span>
                <span className="text-ice font-bold tnum">{zb.networkHealth}%</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">POWER</span>
                <span className="text-ink font-bold tnum">{zb.estimatedPower} W</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded px-1.5 py-1">
                <span className="text-dim block text-[7.5px]">MODE</span>
                <span className="text-ice font-bold">{zb.mode}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-ice/90 bg-ice/[0.06] px-2 py-0.5 rounded border border-ice/20">
              <span>←</span>
              <span>DATA FLOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Mesh Status Panel (Horizontal 6 Slots) */}
      <div className="mx-3 my-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5">
        <div className="text-[8px] font-mono text-faint tracking-[0.16em] uppercase mb-1 flex items-center justify-between">
          <span>SYSTEM MESH STATUS</span>
          <span className="text-neon text-[7.5px]">TELEMETRY SYNCED</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">NETWORK HEALTH</div>
            <div className="font-mono text-[11px] font-bold text-neon tnum">{Math.round(avgNet)}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">LINK QUALITY</div>
            <div className="font-mono text-[11px] font-bold text-ice tnum">99.4%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">REDUNDANCY</div>
            <div className="font-mono text-[10px] font-bold text-[#b48cff]">DUAL-MESH</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">PACKET LOSS</div>
            <div className="font-mono text-[11px] font-bold text-neon tnum">0.01%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">SYNC STATUS</div>
            <div className="font-mono text-[11px] font-bold text-ice tnum">5 ms</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded p-1">
            <div className="text-[7.5px] font-tech text-dim">SYSTEM ALERTS</div>
            <div className="font-mono text-[11px] font-bold text-neon">0 ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <footer className="px-4 py-2 border-t border-white/[0.05] bg-black/20 flex flex-wrap items-center justify-between gap-2 text-[8px] font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[#3dffa8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3dffa8]" /> ZONE A (Wing 1)
          </span>
          <span className="inline-flex items-center gap-1 text-[#b48cff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b48cff]" /> U-IRES CORE
          </span>
          <span className="inline-flex items-center gap-1 text-[#4fd7ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4fd7ff]" /> ZONE B (Wing 2)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-dim">
            <span className="w-3 h-0.5 bg-[#3dffa8]" /> DATA FLOW
          </span>
          <span className="inline-flex items-center gap-1 text-dim">
            <span className="w-3 border-t border-dashed border-[#b48cff]" /> REDUNDANT LINK
          </span>
        </div>
      </footer>
    </section>
  )
}
