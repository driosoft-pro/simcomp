import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateComparendo } from '../../hooks/useComparendos'
import { ArrowLeft, AlertCircle } from 'lucide-react'

interface FormData {
  numero_comparendo: string
  fecha_hora: string
  automotor_id: string
  persona_id: string
  infraccion_id: string
  direccion_exacta: string
  observaciones: string
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300'

function NuevoComparendo() {
  const navigate = useNavigate()
  const createComparendo = useCreateComparendo()

  const [formData, setFormData] = useState<FormData>({
    numero_comparendo: '',
    fecha_hora: '',
    automotor_id: '',
    persona_id: '',
    infraccion_id: '',
    direccion_exacta: '',
    observaciones: '',
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const nuevo = await createComparendo.mutateAsync({
        numero_comparendo: formData.numero_comparendo,
        fecha_hora: formData.fecha_hora,
        automotor_id: formData.automotor_id,
        persona_id: formData.persona_id,
        infraccion_id: formData.infraccion_id,
        direccion_exacta: formData.direccion_exacta,
        observaciones: formData.observaciones || undefined,
      })
      navigate(`/comparendos/${nuevo.comparendo_id}`)
    } catch (error) {
      console.error('Error al crear comparendo:', error)
    }
  }

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

      {/* Encabezado */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Registro
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Nuevo comparendo
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Registra un nuevo comparendo de tránsito en el sistema.
        </p>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 dark:border-slate-800 dark:from-emerald-950/20 dark:to-teal-950/20">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Información del comparendo
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* Número comparendo */}
          <div>
            <label htmlFor="numero_comparendo" className={labelClass}>
              Número de comparendo
            </label>
            <input
              id="numero_comparendo"
              name="numero_comparendo"
              type="text"
              value={formData.numero_comparendo}
              onChange={handleChange}
              required
              placeholder="Ej: CMP-2026-001"
              className={inputClass}
            />
          </div>

          {/* Fecha y hora */}
          <div>
            <label htmlFor="fecha_hora" className={labelClass}>
              Fecha y hora
            </label>
            <input
              id="fecha_hora"
              name="fecha_hora"
              type="datetime-local"
              value={formData.fecha_hora}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Persona ID */}
          <div>
            <label htmlFor="persona_id" className={labelClass}>
              Persona ID <span className="font-mono text-xs text-slate-400">(UUID)</span>
            </label>
            <input
              id="persona_id"
              name="persona_id"
              type="text"
              value={formData.persona_id}
              onChange={handleChange}
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={inputClass}
            />
          </div>

          {/* Automotor ID */}
          <div>
            <label htmlFor="automotor_id" className={labelClass}>
              Automotor ID <span className="font-mono text-xs text-slate-400">(UUID)</span>
            </label>
            <input
              id="automotor_id"
              name="automotor_id"
              type="text"
              value={formData.automotor_id}
              onChange={handleChange}
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={inputClass}
            />
          </div>

          {/* Infracción ID */}
          <div>
            <label htmlFor="infraccion_id" className={labelClass}>
              Infracción ID <span className="font-mono text-xs text-slate-400">(UUID)</span>
            </label>
            <input
              id="infraccion_id"
              name="infraccion_id"
              type="text"
              value={formData.infraccion_id}
              onChange={handleChange}
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={inputClass}
            />
          </div>

          {/* Dirección exacta */}
          <div>
            <label htmlFor="direccion_exacta" className={labelClass}>
              Dirección exacta
            </label>
            <input
              id="direccion_exacta"
              name="direccion_exacta"
              type="text"
              value={formData.direccion_exacta}
              onChange={handleChange}
              required
              placeholder="Cra 1 # 2-34, Ciudad"
              className={inputClass}
            />
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label htmlFor="observaciones" className={labelClass}>
              Observaciones <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Detalles adicionales del comparendo..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="submit"
            disabled={createComparendo.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createComparendo.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Guardando...
              </>
            ) : (
              'Crear comparendo'
            )}
          </button>

          <Link
            to="/comparendos"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancelar
          </Link>

          {createComparendo.isError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">
                Ocurrió un error al crear el comparendo.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default NuevoComparendo