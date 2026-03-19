import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  useAnularComparendo,
  useComparendo,
  usePagarComparendo,
  useRevertirComparendo,
  useComparendoHistorial,
} from '../../hooks/useComparendos'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle2, XCircle, RotateCcw, Clock, CreditCard, Receipt, X } from 'lucide-react'
import type { Comparendo } from '../../types'

const estadoStyles: Record<Comparendo['estado'], string> = {
  PENDIENTE: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
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
  const { user } = useAuth()
  const isCiudadano = user?.rol === 'ciudadano'
  const isAdmin = user?.rol === 'admin'
  const isSupervisor = user?.rol === 'supervisor'
  const canManage = isAdmin || isSupervisor // solo admin y supervisor pueden anular/revertir

  const { data, isLoading, isError, error } = useComparendo(comparendoId)
  const { data: historial } = useComparendoHistorial(comparendoId)

  const pagarMutation = usePagarComparendo()
  const anularMutation = useAnularComparendo()
  const revertirMutation = useRevertirComparendo()

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [metodoPago, setMetodoPago] = useState('PSE')

  const handlePagarClick = () => setIsPaymentModalOpen(true)

  const handleConfirmarPago = async () => {
    if (!data) return
    try {
      await pagarMutation.mutateAsync(data.comparendo_id)
      setIsPaymentModalOpen(false)
    } catch (err) {
      console.error('Error al pagar:', err)
    }
  }

  const handleAnular = () => {
    if (!data) return
    if (window.confirm('¿Está seguro de anular este comparendo?')) {
      anularMutation.mutate(data.comparendo_id)
    }
  }

  const handleRevertir = () => {
    if (!data) return
    if (window.confirm('¿Está seguro de revertir este comparendo a estado pendiente?')) {
      revertirMutation.mutate(data.comparendo_id)
    }
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
    return <p className="text-sm text-slate-500 dark:text-slate-400">Comparendo no encontrado.</p>
  }

  const estadoClass = estadoStyles[data.estado] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const canPagar = !['PAGADO', 'ANULADO', 'CERRADO', 'EXONERADO'].includes(data.estado)
  const canAnular = canManage && !['ANULADO', 'CERRADO'].includes(data.estado) // ✅ solo admin/supervisor
  const canRevertir = canManage && ['PAGADO', 'ANULADO'].includes(data.estado)  // ✅ solo admin/supervisor
  const hasReceipt = data.estado === 'PAGADO'

  return (
    <div className="space-y-6">
      <Link
        to="/comparendos"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={16} />
        Volver a Comparendos
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                  {formatDate(data.fecha_comparendo)}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${estadoClass}`}>
              {data.estado.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="N° Comparendo" value={data.numero_comparendo} mono />
            <Field label="Estado" value={data.estado.replace(/_/g, ' ')} />
            <Field label="Valor multa" value={formatCurrency(Number(data.valor_multa))} />
            <Field label="Infractor" value={`${data.ciudadano_nombre} (${data.ciudadano_documento})`} />
            <Field label="Placa Vehículo" value={data.placa_vehiculo} />
            <Field label="Código Infracción" value={data.infraccion_codigo} />
            <Field label="Agente" value={`${data.agente_nombre} (${data.agente_documento})`} />
            <Field label="Lugar" value={data.lugar} />
            <Field label="Ciudad" value={data.ciudad} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Descripción de Infracción" value={data.infraccion_descripcion} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Observaciones" value={data.observaciones || 'Sin observaciones'} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          {canPagar && (
            <button
              type="button"
              onClick={handlePagarClick}
              disabled={pagarMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              <CreditCard size={16} />
              {pagarMutation.isPending ? 'Procesando...' : 'Pagar Comparendo'}
            </button>
          )}

          {hasReceipt && (
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/50"
            >
              <Receipt size={16} />
              Ver Recibo
            </button>
          )}

          {/* ✅ Solo admin y supervisor pueden anular */}
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

          {/* ✅ Solo admin y supervisor pueden revertir */}
          {canRevertir && (
            <button
              type="button"
              onClick={handleRevertir}
              disabled={revertirMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
            >
              <RotateCcw size={16} />
              {revertirMutation.isPending ? 'Procesando...' : 'Revertir estado'}
            </button>
          )}

          {(pagarMutation.isError || anularMutation.isError || revertirMutation.isError) && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">
                Error al actualizar el comparendo.
              </p>
            </div>
          )}
        </div>
      </div>

      {historial && historial.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Historial de Estados</h2>
          </div>
          <div className="space-y-4">
            {historial.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 border-l-2 border-slate-200 pl-4 pb-4 last:border-0 last:pb-0 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.estado_nuevo.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-500">{formatDate(item.fecha_evento)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.observacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <div className="flex items-center gap-2">
                <CreditCard className="text-emerald-600 dark:text-emerald-400" size={20} />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Gestión de Pago</h2>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total a Pagar</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(Number(data.valor_multa))}</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Método de Pago Acordado
                </label>
                <select
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="PSE">Pago en línea (PSE)</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="EFECTIVO_BANCO">Efectivo en Banco</option>
                  <option value="EFECTIVO_TRANSITO">Efectivo en Tránsito</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Comprobante / Referencia <span className="text-xs font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: 9948293"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarPago}
                disabled={pagarMutation.isPending}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {pagarMutation.isPending ? 'Procesando...' : (
                  <>
                    <CheckCircle2 size={16} /> Confirmar Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col font-mono text-xs text-slate-800 border-t-8 border-emerald-600">
            <div className="p-6 flex flex-col items-center border-b border-dashed border-slate-300">
              <Receipt size={32} className="text-slate-400 mb-2" />
              <h2 className="text-base font-bold text-center uppercase">Secretaría de Movilidad</h2>
              <p className="text-center">Recibo Oficial de Caja</p>
              <p className="text-center mt-2 font-bold bg-slate-100 px-3 py-1 rounded inline-block">PAGADO</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500">Comparendo:</span>
                <span className="font-bold">{data.numero_comparendo}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500">Fecha Pago:</span>
                <span className="text-right">{formatDate(new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500">Método:</span>
                <span>{metodoPago.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex flex-col border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500 mb-1">Concepto Infracción:</span>
                <span className="truncate" title={data.infraccion_codigo}>{data.infraccion_codigo} - {data.infraccion_descripcion}</span>
              </div>
              <div className="pt-2 flex justify-between items-end">
                <span className="text-sm font-bold">TOTAL PAGADO</span>
                <span className="text-lg font-bold">{formatCurrency(Number(data.valor_multa))}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-dashed border-slate-300 flex justify-center">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="bg-slate-800 text-white rounded px-6 py-2 text-sm font-sans font-medium hover:bg-slate-700 transition"
              >
                Cerrar Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComparendoDetail