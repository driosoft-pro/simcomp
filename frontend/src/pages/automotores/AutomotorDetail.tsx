import { Link, useParams } from 'react-router-dom'
import { useAutomotor } from '../../hooks/useAutomotores'
import { useComparendosByPlaca } from '../../hooks/useComparendos'
import type { Automotor } from '../../types'
import { ArrowLeft, Car, Tag, Palette, Calendar, Gauge, Hash, User, AlertTriangle, FileText } from 'lucide-react'

const estadoStyles: Record<Automotor['estado'], string> = {
  activo: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50',
  inactivo: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-900/50',
  inmovilizado: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50',
}

const condicionStyles: Record<string, string> = {
  LEGAL: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50',
  REPORTADO_ROBO: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50',
  RECUPERADO: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-900/50',
  EMBARGADO: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50',
}

const comparendoEstadoStyles: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PAGADO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ANULADO: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
      <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

function AutomotorDetail() {
  const { id } = useParams()
  const automotorId = id ?? ''
  const { data, isLoading, isError, error } = useAutomotor(automotorId)
  const { data: comparendos, isLoading: isLoadingComparendos } = useComparendosByPlaca(data?.placa ?? '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 animate-pulse-slow rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse-slow rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Error al cargar automotor:{' '}
          {error instanceof Error ? error.message : 'desconocido'}
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Automotor no encontrado.</p>
    )
  }

  const estadoClass = estadoStyles[data.estado] ?? 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/automotores"
        className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
      >
        <ArrowLeft size={16} />
        Volver a Automotores
      </Link>

      {/* Tarjeta principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header de la tarjeta */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-5 dark:border-slate-800 dark:from-sky-950/20 dark:to-blue-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md">
                <Car size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {data.placa}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {data.marca} {data.linea} · {data.modelo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${condicionStyles[data.condicion] || 'bg-slate-100 text-slate-600'}`}>
                {data.condicion.replace(/_/g, ' ')}
              </span>
              <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${estadoClass}`}>
                {data.estado.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Campos */}
        <div className="p-6 space-y-8">
          {/* Información del Vehículo */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Especificaciones Técnicas</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field icon={<Tag size={16}/>} label="Condición" value={data.condicion} />
              <Field icon={<Tag size={16}/>} label="Clase" value={data.clase} />
              <Field icon={<Hash size={16}/>} label="Servicio" value={data.servicio} />
              <Field icon={<Car size={16}/>} label="VIN" value={data.vin} />
              <Field icon={<Gauge size={16}/>} label="Número Motor" value={data.numero_motor} />
              <Field icon={<Hash size={16}/>} label="Número Chasis" value={data.numero_chasis} />
              <Field icon={<Car size={16}/>} label="Marca" value={data.marca} />
              <Field icon={<Car size={16}/>} label="Línea" value={data.linea} />
              <Field icon={<Calendar size={16}/>} label="Modelo" value={data.modelo} />
              <Field icon={<Palette size={16}/>} label="Color" value={data.color} />
            </div>
          </div>

          {/* Información del Propietario */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Información del Propietario</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={<User size={16}/>} label="Nombre del Propietario" value={data.propietario_nombre} />
              <Field icon={<Hash size={16}/>} label="Documento del Propietario" value={data.propietario_documento} />
            </div>
          </div>

          {/* Infracciones (Comparendos) */}
          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <AlertTriangle size={18} />
              Infracciones Registradas
            </h3>
            
            {isLoadingComparendos ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-sm text-slate-500 animate-pulse">Cargando infracciones...</p>
              </div>
            ) : comparendos && comparendos.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comparendo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Infracción</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {comparendos.map((comp) => (
                      <tr key={comp.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          {new Date(comp.fecha_comparendo).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                          {comp.numero_comparendo}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-semibold">{comp.infraccion_codigo}</span>
                            <span className="truncate max-w-[200px] sm:max-w-[300px]" title={comp.infraccion_descripcion}>
                              {comp.infraccion_descripcion}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${comparendoEstadoStyles[comp.estado] || 'bg-slate-100 text-slate-600'}`}>
                            {comp.estado}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-200">
                          ${Number(comp.valor_multa).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-800/20">
                <FileText size={32} className="text-slate-400 dark:text-slate-500" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sin infracciones</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Este vehículo no registra comparendos.</p>
                </div>
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
             <div className="flex flex-wrap gap-6 text-xs text-slate-400">
               <p>ID Sistema: {data.id}</p>
               {data.created_at && (
                 <p>Registrado el: {new Date(data.created_at).toLocaleString()}</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomotorDetail