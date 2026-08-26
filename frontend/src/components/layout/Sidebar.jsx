import { useAppStore } from '../../hooks/useAppStore'
import {
  IconActivity, IconBolt, IconBrain, IconChart, IconClose, IconCube, IconEye,
  IconFlask, IconGrid, IconLayers, IconSliders, IconTarget,
} from '../icons'

const NAV = [
  { section: 'OVERVIEW', items: [{ id: 'overview', label: 'Overview', icon: IconGrid }] },
  {
    section: 'DIGITAL TWIN',
    items: [
      { id: 'live-environment', label: 'Live Environment', icon: IconEye },
      { id: 'zone-details', label: 'Zone Details', icon: IconLayers },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { id: 'ai-predictions', label: 'AI Predictions', icon: IconBrain },
      { id: 'what-if', label: 'What-if Simulation', icon: IconFlask },
      { id: 'uice-optimizer', label: 'UICE Optimizer', icon: IconTarget },
    ],
  },
  {
    section: 'CONTROL',
    items: [
      { id: 'action-center', label: 'Action Center', icon: IconBolt },
      { id: 'manual-override', label: 'Manual Override', icon: IconSliders },
    ],
  },
  {
    section: 'LEARNING',
    items: [
      { id: 'feedback-learning', label: 'Feedback & Learning', icon: IconActivity },
      { id: 'analytics', label: 'Analytics', icon: IconChart },
    ],
  },
]

export default function Sidebar() {
  const { activePage, setActivePage, sidebarOpen, setSidebarOpen } = useAppStore()

  const go = (id) => {
    setActivePage(id)
    setSidebarOpen(false)
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden fade-in" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[236px] shrink-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full glass !rounded-none !border-y-0 !border-l-0 flex flex-col">
          <div className="flex items-center gap-3 px-4 h-[64px] border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
            <div className="relative w-9 h-9 shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full spin-slow opacity-80">
                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke="#3dffa8" strokeWidth="1.4" strokeDasharray="6 5" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <IconCube size={17} style={{ color: '#3dffa8' }} />
              </div>
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-mono font-bold text-[17px] tracking-[0.18em] text-ink glow-text">U-IRES</div>
              <div className="text-[7.5px] font-tech text-faint tracking-[0.14em] uppercase truncate">
                Intelligent Resource &amp; Environment
              </div>
            </div>
            <button type="button" className="lg:hidden ml-auto btn btn-ghost btn-xs" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <IconClose size={12} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scroll-thin">
            {NAV.map((group) => (
              <div key={group.section}>
                <div className="label-cap !text-[8.5px] !tracking-[0.26em] px-2 mb-1.5">{group.section}</div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = activePage === item.id
                    return (
                      <button key={item.id} type="button" onClick={() => go(item.id)} className={`nav-item ${active ? 'active' : ''}`}>
                        <Icon size={15} style={active ? { color: '#3dffa8' } : undefined} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[8.5px] tracking-[0.18em] text-faint">
              <span>EDGE LINK</span>
              <span className="text-neon">STABLE</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[8.5px] tracking-[0.18em] text-faint">
              <span>CORE</span>
              <span>v0.9 · MOCK BUS</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
