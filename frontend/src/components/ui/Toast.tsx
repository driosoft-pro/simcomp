import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast, type ToastType } from '../../context/ToastContext'

const toastStyles: Record<ToastType, string> = {
  success: 'bg-white border-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-400',
  error: 'bg-white border-red-100 text-red-900 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-400',
  info: 'bg-white border-sky-100 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800/50 dark:text-sky-400',
  warning: 'bg-white border-amber-100 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-400',
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20"><CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>,
  error: <div className="p-1 rounded-full bg-red-100 dark:bg-red-500/20"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" /></div>,
  info: <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-500/20"><Info className="h-5 w-5 text-sky-600 dark:text-sky-400" /></div>,
  warning: <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-500/20"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>,
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none w-full max-w-md"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 animate-slide-in ${
            toastStyles[toast.type]
          } w-[360px] max-w-full group hover:scale-[1.02]`}
        >
          <div className="shrink-0 mt-0.5">
            {toastIcons[toast.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold leading-tight mb-1 capitalize">{toast.type}</p>
            <p className="text-[13px] font-medium opacity-90 leading-relaxed break-words">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-xl p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer