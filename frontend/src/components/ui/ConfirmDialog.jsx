import Modal from './Modal'
import { IconAlert } from '../icons'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title="Confirmation Required" size="md">
      <div className="flex gap-4">
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border"
          style={{
            color: danger ? '#ff5470' : '#ffb454',
            borderColor: danger ? 'rgba(255,84,112,.35)' : 'rgba(255,180,84,.35)',
            background: danger ? 'rgba(255,84,112,.1)' : 'rgba(255,180,84,.1)',
          }}
        >
          <IconAlert size={20} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Applying…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
