import { Link, useParams } from 'react-router-dom'
import { useAutomotor } from '../../hooks/useAutomotores'
import type { Automotor } from '../../types'
import { ArrowLeft, Car, Tag, Palette, Calendar, Gauge, Hash, User } from 'lucide-react'

const estadoStyles: Record<Automotor['estado'], string> = {
  LEGAL: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50',
  REPORTADO_ROBO: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50',
  RECUPERADO: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-900/50',
  EMBARGADO: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50',
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
                  {data.marca} {data.modelo} · {data.anio}
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
            <Field icon={<Hash size={16}/>} label="ID del automotor" value={data.automotor_id} />
            <Field icon={<Tag size={16}/>} label="Tipo" value={data.tipo} />
            <Field icon={<Car size={16}/>} label="Marca" value={data.marca} />
            <Field icon={<Car size={16}/>} label="Modelo" value={data.modelo} />
            <Field icon={<Calendar size={16}/>} label="Año" value={data.anio} />
            <Field icon={<Palette size={16}/>} label="Color" value={data.color} />
            <Field icon={<Gauge size={16}/>} label="Cilindraje" value={`${data.cilindraje} cc`} />
            <Field icon={<User size={16}/>} label="Propietario ID" value={data.propietario_id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomotorDetail