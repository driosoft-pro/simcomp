import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast, type ToastType } from '../../context/ToastContext'

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400',
  info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/30 dark:border-sky-800 dark:text-sky-400',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400',
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-4 sm:px-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
            toastStyles[toast.type]
          } w-full sm:w-auto min-w-[320px] max-w-full`}
        >
          <div className="flex items-center gap-3">
            {toastIcons[toast.type]}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 rounded-full p-1 opacity-60 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Deprecated: Single Toast component (for backward compatibility if needed, but not used in the new system)
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg">
      {message}
    </div>
  )
}

export default Toast