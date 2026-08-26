import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { useLiveClock } from '../../hooks/useLiveClock'
import { timelineStatuses } from '../../mock/mockData'
import { fmtClock, fmtDateLong, timeAgo } from '../../utils/format'
import { IconAlert, IconBell, IconCheck, IconClose, IconCube, IconInfo, IconMenu, IconRefresh } from '../icons'
import { StatusDot } from '../ui/Badges'
import { Segmented } from '../ui/Controls'

const SEV_COLORS = {
  success: '#3dffa8',
  info: '#4fd7ff',
  warn: '#ffb454',
  crit: '#ff5470',
}

function TimelineStrip() {
  const { buffers } = useAppStore()
  const markers = useMemo(
    () => timelineStatuses(buffers.A?.temperature || [], buffers.B?.temperature || []),
    [buffers],
  )
  if (markers.length < 2) return null
  const first = markers[0]
  const lastMark = markers[markers.length - 1]
  return (
    <div className="hidden xl:block flex-1 min-w-0 mx-4">
      <div className="flex items-center justify-between mb-1">
        <span className="label-cap !text-[8px] !tracking-[0.3em]">System Timeline</span>
        <span className="font-mono text-[8px] text-faint tracking-widest">LAST {Math.round((lastMark.t - first.t) / 60000)} MIN</span>
      </div>
      <div className="relative h-[26px]">
        <div className="absolute left-0 right-0 top-[10px] h-px bg-gradient-to-r from-transparent via-neon/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between h-[22px]">
          {markers.map((m) => (
            <div key={m.t} className="relative flex flex-col items-center group mt-[6px]" title={`${m.label} · ${m.level === 'ok' ? 'nominal' : m.level === 'warn' ? 'elevated' : 'critical'}`}>
              <span
                className="w-[7px] h-[7px] rounded-full border transition-transform group-hover:scale-150"
                style={{
                  borderColor: m.level === 'ok' ? '#3dffa8' : m.level === 'warn' ? '#ffb454' : '#ff5470',
                  background: m.level === 'ok' ? 'rgba(61,255,168,.35)' : m.level === 'warn' ? 'rgba(255,180,84,.4)' : 'rgba(255,84,112,.5)',
                  boxShadow: `0 0 6px ${m.level === 'ok' ? '#3dffa855' : m.level === 'warn' ? '#ffb45466' : '#ff547077'}`,
                }}
              />
              <span className="absolute top-[14px] font-mono text-[7.5px] text-faint opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{m.label}</span>
            </div>
          ))}
        </div>
        <span className="absolute left-0 top-[19px] font-mono text-[7.5px] text-faint tracking-wider">{first.label}</span>
        <span className="absolute right-0 top-[19px] font-mono text-[7.5px] text-neon tracking-wider">NOW</span>
      </div>
    </div>
  )
}

function NotificationBell() {
  const { notifications, markAllRead, clearNotifications } = useAppStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`btn btn-ghost btn-xs relative ${open ? '!border-neon/50' : ''}`}
        aria-label="Notifications"
      >
        <IconBell size={14} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-crit text-white text-[8px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,84,112,.8)]">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] glass !rounded-xl z-50 modal-in overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <span className="label-cap">Notifications</span>
            <div className="flex gap-1">
              <button type="button" onClick={markAllRead} className="btn btn-ghost btn-xs" title="Mark all read"><IconCheck size={10} /> READ</button>
              <button type="button" onClick={clearNotifications} className="btn btn-ghost btn-xs" title="Clear all"><IconRefresh size={10} /></button>
            </div>
          </header>
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-faint">No notifications.</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${n.read ? 'opacity-55' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-[3px] w-2 h-2 rounded-full shrink-0 pulse-dot"
                    style={{ background: SEV_COLORS[n.severity] || SEV_COLORS.info, color: SEV_COLORS[n.severity] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-ink truncate">{n.title}</span>
                      <span className="font-mono text-[8.5px] text-faint shrink-0">{timeAgo(n.ts)}</span>
                    </div>
                    <p className="text-[11px] text-dim leading-snug mt-0.5">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ToastStack() {
  const { toasts, dismissToast } = useAppStore()
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[330px] max-w-[calc(100vw-40px)]">
      {toasts.map((t) => {
        const color = SEV_COLORS[t.severity] || SEV_COLORS.info
        const Icon = t.severity === 'warn' || t.severity === 'crit' ? IconAlert : t.severity === 'success' ? IconCheck : IconInfo
        return (
          <div key={t.id} className="toast-in glass !rounded-xl overflow-hidden relative" style={{ borderColor: `${color}44` }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
            <div className="flex items-start gap-3 pl-4 pr-2 py-3">
              <Icon size={16} style={{ color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-ink">{t.title}</div>
                <div className="text-[11px] text-dim leading-snug mt-0.5">{t.message}</div>
              </div>
              <button type="button" onClick={() => dismissToast(t.id)} className="text-faint hover:text-ink transition-colors p-1" aria-label="Dismiss">
                <IconClose size={11} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function TopBar() {
  const now = useLiveClock(1000)
  const { selectedZone, setSelectedZone, setSidebarOpen } = useAppStore()

  return (
    <>
      <header className="glass !rounded-xl sticky top-3 z-30 flex flex-wrap lg:flex-nowrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <button type="button" className="lg:hidden btn btn-ghost btn-xs" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <IconMenu size={14} />
        </button>

        <div className="flex items-center gap-2.5 pr-2 lg:pr-3 lg:border-r lg:border-white/10">
          <div className="relative w-8 h-8 shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full spin-slow opacity-80">
              <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke="#3dffa8" strokeWidth="1.6" strokeDasharray="6 5" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <IconCube size={14} style={{ color: '#3dffa8' }} />
            </div>
          </div>
          <div className="hidden xl:block leading-none">
            <div className="font-mono font-bold text-[14px] tracking-[0.2em] text-ink glow-text">U-IRES</div>
            <div className="text-[6.5px] font-tech text-faint tracking-[0.18em] uppercase mt-[3px]">Digital Twin Control Center</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="label-cap !text-[9px] hidden sm:inline">Select Zone</span>
          <Segmented
            value={selectedZone}
            onChange={setSelectedZone}
            options={[{ value: 'all', label: 'ALL' }, { value: 'A', label: 'ZONE A' }, { value: 'B', label: 'ZONE B' }]}
          />
        </div>

        <TimelineStrip />

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-2 badge !py-[5px]" style={{ color: '#3dffa8', borderColor: 'rgba(61,255,168,.4)', background: 'rgba(61,255,168,.08)' }}>
            <StatusDot level="ok" size={6} />
            SYSTEM LIVE
          </div>
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="font-mono text-[15px] font-bold tnum text-ink tracking-wider glow-text">{fmtClock(now)}</span>
            <span className="font-tech text-[9px] text-faint tracking-[0.16em] uppercase">{fmtDateLong(now)}</span>
          </div>
          <NotificationBell />
        </div>
      </header>
      <ToastStack />
    </>
  )
}
