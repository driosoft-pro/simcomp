import { X, AlertCircle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
}: ConfirmDialogProps) {
  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
    info: 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20',
  }

  return (
    <Modal open={open}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex shrink-0 items-center justify-center rounded-full p-2 ${
              type === 'danger' ? 'bg-red-100 dark:bg-red-950/40 text-red-600' :
              type === 'warning' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
              'bg-sky-100 dark:bg-sky-950/40 text-sky-600'
            }`}>
              <AlertCircle size={24} />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 ${typeStyles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
