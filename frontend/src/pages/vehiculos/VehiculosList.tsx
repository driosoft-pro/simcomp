import { Link } from 'react-router-dom'
import { useVehiculos } from '../../hooks/useVehiculos'
import type { Automotor } from '../../types'

const estadoStyles: Record<Automotor['estado'], string> = {
  LEGAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  REPORTADO_ROBO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  RECUPERADO: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  EMBARGADO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const tipoLabel: Record<string, string> = {
  MOTO: '🏍️ Moto',
  CARRO: '🚗 Carro',
  BUS: '🚌 Bus',
  BUSETA: '🚐 Buseta',
  CAMION: '🚛 Camión',
  TRACTOMULA: '🚚 Tractomula',
  CUATRIMOTO: '🛵 Cuatrimoto',
}

function LoadingRow() {
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  )
}

function VehiculosList() {
  const { data, isLoading, isError, error } = useVehiculos()

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
          Módulo
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Automotores
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Listado general de automotores registrados en el sistema.
        </p>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar automotores:{' '}
            {error instanceof Error ? error.message : 'desconocido'}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Placa</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Marca</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Modelo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Año</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <LoadingRow key={i} />)}
              {data?.map((automotor) => (
                <tr
                  key={automotor.automotor_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {automotor.placa}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {tipoLabel[automotor.tipo] ?? automotor.tipo}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{automotor.marca}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{automotor.modelo}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{automotor.anio}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoStyles[automotor.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                      {automotor.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/automotores/${automotor.automotor_id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40"
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
              <p className="text-sm text-slate-400 dark:text-slate-500">No hay automotores registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VehiculosList