import { useEffect, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'

const BOOT_LINES = [
  'LINKING EDGE NODES … OK',
  'SYNCING DIGITAL TWIN … OK',
  'LOADING UICE POLICY … OK',
]

function BootOverlay({ onDone }) {
  const [step, setStep] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (step >= BOOT_LINES.length) {
      const t1 = setTimeout(() => setFading(true), 260)
      return () => clearTimeout(t1)
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 340 : 300)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (!fading) return undefined
    const t = setTimeout(onDone, 480)
    return () => clearTimeout(t)
  }, [fading, onDone])

  return (
    <div
      className={`fixed inset-0 z-[200] bg-void flex items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="text-center">
        <div className="font-mono font-bold text-[26px] tracking-[0.3em] text-neon glow-text">U-IRES</div>
        <div className="mt-5 space-y-1.5 min-h-[66px]">
          {BOOT_LINES.slice(0, step).map((line) => (
            <div key={line} className="font-mono text-[10px] tracking-[0.2em] text-dim fade-in">{line}</div>
          ))}
        </div>
        <div className="mt-4 mx-auto w-[160px] h-[3px] rounded-full overflow-hidden bg-white/5">
          <div className="h-full bg-gradient-to-r from-neon/60 to-neon transition-all duration-300" style={{ width: `${(step / BOOT_LINES.length) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const [booting, setBooting] = useState(true)

  return (
    <div className="relative min-h-screen">
      <div className="app-bg" aria-hidden="true">
        <img src="/assets/vit-campus.jpg" alt="" />
      </div>
      {booting && <BootOverlay onDone={() => setBooting(false)} />}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 px-3 sm:px-4 py-3 space-y-3 max-w-[1560px] mx-auto w-full">
          <TopBar />
          {children}
        </main>
      </div>
    </div>
  )
}
