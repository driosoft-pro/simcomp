import { Link, useParams } from 'react-router-dom'
import { useInfraccion } from '../../hooks/useInfracciones'
import { formatCurrency } from '../../utils/formatters'
import { ArrowLeft, FileWarning, Hash, BookOpen, AlertCircle, DollarSign, Calendar, Info } from 'lucide-react'

const tipoSancionStyles: Record<string, string> = {
  MONETARIA: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50',
  SUSPENSION_LICENCIA: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50',
  INMOVILIZACION: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50',
  MIXTA: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-900/50',
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

function InfraccionDetail() {
  const { id } = useParams()
  const infraccionId = id ?? ''
  const { data, isLoading, isError, error } = useInfraccion(infraccionId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
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
          Error al cargar infracción:{' '}
          {error instanceof Error ? error.message : 'desconocido'}
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Infracción no encontrada.</p>
    )
  }

  const sancionClass = tipoSancionStyles[data.tipo_sancion] ?? 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/infracciones"
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
      >
        <ArrowLeft size={16} />
        Volver a Infracciones
      </Link>

      {/* Tarjeta principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header de la tarjeta */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 dark:border-slate-800 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                <FileWarning size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {data.codigo}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {data.articulo_codigo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${sancionClass}`}>
                {data.tipo_sancion.replace(/_/g, ' ')}
              </span>
              {data.vigente ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Vigente
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Inactiva
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Campos */}
        <div className="p-6 space-y-8">
          {/* Información General */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Detalles de la Infracción</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field icon={<Hash size={16}/>} label="Código" value={data.codigo} />
              <Field icon={<BookOpen size={16}/>} label="Artículo" value={data.articulo_codigo} />
              <Field icon={<AlertCircle size={16}/>} label="Tipo de Sanción" value={data.tipo_sancion} />
              <Field icon={<DollarSign size={16}/>} label="Valor Multa" value={formatCurrency(data.valor_multa)} />
              <Field icon={<Info size={16}/>} label="Aplica Descuento" value={data.aplica_descuento ? 'Sí' : 'No'} />
              {data.dias_suspension && (
                <Field icon={<Calendar size={16}/>} label="Días de Suspensión" value={data.dias_suspension} />
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Descripción Completa</h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.descripcion}
              </p>
            </div>
          </div>

          {/* Metadatos */}
          <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
             <div className="flex flex-wrap gap-6 text-xs text-slate-400">
               <p>ID Sistema: {data.infraccion_id}</p>
               {data.created_at && (
                 <p>Registrado el: {new Date(data.created_at).toLocaleString()}</p>
               )}
               {data.updated_at && (
                 <p>Última actualización: {new Date(data.updated_at).toLocaleString()}</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfraccionDetail
