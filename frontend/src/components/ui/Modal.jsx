import { useEscapeKey } from '../../hooks/useEscapeKey'
import { IconClose } from '../icons'

const SIZES = {
  md: 'max-w-lg w-full',
  lg: 'max-w-3xl w-full',
  xl: 'max-w-6xl w-full',
  full: 'max-w-[min(1400px,96vw)] w-full',
}

export default function Modal({ open, onClose, title, subtitle, children, size = 'lg' }) {
  useEscapeKey(open, onClose)
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 fade-in"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative modal-in glass !rounded-2xl ${SIZES[size]} max-h-[92vh] flex flex-col glow-ring`}>
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-white/5">
          <div>
            <h3 className="label-cap !text-[11px] text-neon">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-dim font-tech">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-xs" aria-label="Close">
            <IconClose size={12} /> ESC
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
