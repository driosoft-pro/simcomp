import { Link } from 'react-router-dom'
import { useComparendos } from '../../hooks/useComparendos'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import type { Comparendo } from '../../types'
import { Plus } from 'lucide-react'

const estadoStyles: Record<Comparendo['estado'], string> = {
  PENDIENTE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  VIGENTE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EN_PROCESO_DE_PAGO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PAGADO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CERRADO: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  EN_COBRO_COACTIVO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  IMPUGNADO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  EXONERADO: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  ANULADO: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

function ComparendosList() {
  const { user } = useAuth()
  const { data: allData, isLoading, isError, error } = useComparendos()

  const isCiudadano = user?.rol === 'ciudadano'
  const data = isCiudadano
    ? allData?.filter((c) => c.ciudadano_documento?.replace('cc.', '') === user?.username?.replace('cc.', ''))
    : allData

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Módulo
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Comparendos
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Consulta del historial de comparendos generados.
          </p>
        </div>
        {user?.rol !== 'ciudadano' && user?.rol !== 'supervisor' && (
          <Link
            to="/comparendos/nuevo"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            <Plus size={16} />
            Nuevo comparendo
          </Link>
        )}
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error: {error instanceof Error ? error.message : 'desconocido'}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">N° Comparendo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Infractor</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lugar</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {data?.map((comparendo) => (
                <tr
                  key={comparendo.comparendo_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {comparendo.numero_comparendo}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {comparendo.ciudadano_nombre}
                    <div className="text-[10px] font-mono text-slate-400">{comparendo.ciudadano_documento}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                    {formatDate(comparendo.fecha_comparendo)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${estadoStyles[comparendo.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                      {comparendo.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[150px] truncate text-slate-600 dark:text-slate-400 text-xs" title={`${comparendo.lugar}, ${comparendo.ciudad}`}>
                    {comparendo.lugar}, {comparendo.ciudad}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/comparendos/${comparendo.comparendo_id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && data?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No hay comparendos registrados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComparendosList