import { Link, useParams } from 'react-router-dom'
import {
  useAnularComparendo,
  useComparendo,
  usePagarComparendo,
} from '../../hooks/useComparendos'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { Comparendo } from '../../types'

const estadoStyles: Record<Comparendo['estado'], string> = {
  CREADO: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  VIGENTE: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50',
  EN_PROCESO_DE_PAGO: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50',
  PAGADO: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50',
  CERRADO: 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
  EN_COBRO_COACTIVO: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50',
  IMPUGNADO: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50',
  EXONERADO: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-900/50',
  ANULADO: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50',
}

interface FieldProps {
  label: string
  value: string
  mono?: boolean
}

function Field({ label, value, mono = false }: FieldProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`mt-0.5 break-all font-medium text-slate-800 dark:text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function ComparendoDetail() {
  const { id } = useParams()
  const comparendoId = id ?? ''

  const { data, isLoading, isError, error } = useComparendo(comparendoId)
  const pagarMutation = usePagarComparendo()
  const anularMutation = useAnularComparendo()

  const handlePagar = () => {
    if (!data) return
    pagarMutation.mutate(data.comparendo_id)
  }

  const handleAnular = () => {
    if (!data) return
    anularMutation.mutate(data.comparendo_id)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-44 animate-pulse-slow rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3 h-14 animate-pulse-slow rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Error al cargar comparendo:{' '}
          {error instanceof Error ? error.message : 'desconocido'}
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Comparendo no encontrado.</p>
    )
  }

  const estadoClass = estadoStyles[data.estado] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const canPagar = !['PAGADO', 'ANULADO', 'CERRADO', 'EXONERADO'].includes(data.estado)
  const canAnular = !['ANULADO', 'CERRADO'].includes(data.estado)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/comparendos"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={16} />
        Volver a Comparendos
      </Link>

      {/* Tarjeta principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 dark:border-slate-800 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <ClipboardList size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {data.numero_comparendo}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(data.fecha_hora)}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${estadoClass}`}>
              {data.estado.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Campos */}
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="ID comparendo" value={data.comparendo_id} mono />
            <Field label="Número" value={data.numero_comparendo} />
            <Field label="Estado" value={data.estado.replace(/_/g, ' ')} />
            <Field label="Valor multa" value={formatCurrency(data.valor_multa)} />
            <Field label="Persona ID" value={data.persona_id} mono />
            <Field label="Automotor ID" value={data.automotor_id} mono />
            <Field label="Infracción ID" value={data.infraccion_id} mono />
            <Field label="Dirección exacta" value={data.direccion_exacta} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Observaciones" value={data.observaciones || 'Sin observaciones'} />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {canPagar && (
            <button
              type="button"
              onClick={handlePagar}
              disabled={pagarMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              <CheckCircle2 size={16} />
              {pagarMutation.isPending ? 'Procesando...' : 'Registrar pago'}
            </button>
          )}

          {canAnular && (
            <button
              type="button"
              onClick={handleAnular}
              disabled={anularMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              <XCircle size={16} />
              {anularMutation.isPending ? 'Procesando...' : 'Anular comparendo'}
            </button>
          )}

          {(pagarMutation.isError || anularMutation.isError) && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">
                Error al actualizar el comparendo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComparendoDetail