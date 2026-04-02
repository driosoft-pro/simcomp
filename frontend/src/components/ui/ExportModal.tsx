import { useState } from 'react'
import { X, Download, FileText, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'

interface ExportModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (limit: string) => void
  title: string
  format: string
  isPending?: boolean
}

function ExportModal({ open, onClose, onConfirm, title, format, isPending }: ExportModalProps) {
  const [option, setOption] = useState<'all' | 'limit'>('all')
  const [limit, setLimit] = useState<string>('50')

  const handleConfirm = () => {
    const finalLimit = option === 'all' ? 'all' : limit
    onConfirm(finalLimit)
  }

  const formatLabels: Record<string, string> = {
    csv: 'CSV (Valores separados por coma)',
    excel: 'Excel (Hoja de cálculo)',
    pdf: 'Documento PDF',
    zip: 'Paquete ZIP (CSVs)'
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <div className="overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Exportar {title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Formato: {formatLabels[format] || format.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            Selecciona la cantidad de registros que deseas incluir en el archivo de exportación.
          </p>

          <div className="space-y-4">
            {/* Option: All */}
            <button
              onClick={() => setOption('all')}
              className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                option === 'all'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10'
                  : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  option === 'all' ? 'border-violet-500 bg-violet-500' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {option === 'all' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Todo el dataset</p>
                  <p className="text-xs text-slate-500">Exportar todos los registros disponibles.</p>
                </div>
              </div>
            </button>

            {/* Option: Limit */}
            <div
              className={`rounded-2xl border-2 p-4 transition-all ${
                option === 'limit'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10'
                  : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <button
                onClick={() => setOption('limit')}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    option === 'limit' ? 'border-violet-500 bg-violet-500' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {option === 'limit' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Cantidad específica</p>
                    <p className="text-xs text-slate-500">Limitar el número de registros.</p>
                  </div>
                </div>
              </button>

              {option === 'limit' && (
                <div className="mt-4 animate-in slide-in-from-top-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      min="1"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm font-bold text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Ej: 50"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FileText size={18} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-5 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || (option === 'limit' && !limit)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Procesando...' : (
              <>
                <CheckCircle2 size={18} />
                Comenzar Exportación
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportModal
