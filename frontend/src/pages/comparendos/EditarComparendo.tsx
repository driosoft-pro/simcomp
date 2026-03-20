import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useComparendo, useUpdateComparendo } from '../../hooks/useComparendos'
import { useInfracciones } from '../../hooks/useInfracciones'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300'

interface SelectedInfraction {
  codigo: string
  descripcion: string
  valor_multa: number
}

function EditarComparendo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const { data: comparendo, isLoading: isLoadingComparendo } = useComparendo(id || '')
  const { data: infracciones } = useInfracciones()
  const updateMutation = useUpdateComparendo()

  const [formData, setFormData] = useState({
    placa_vehiculo: '',
    infraccion_codigo: '',
    infraccion_descripcion: '',
    valor_multa: 0,
    fecha_comparendo: '',
    lugar: '',
    ciudad: '',
    observaciones: '',
  })

  const [selectedInfractions, setSelectedInfractions] = useState<SelectedInfraction[]>([])

  useEffect(() => {
    if (comparendo) {
      setFormData({
        placa_vehiculo: comparendo.placa_vehiculo,
        infraccion_codigo: comparendo.infraccion_codigo,
        infraccion_descripcion: comparendo.infraccion_descripcion,
        valor_multa: Number(comparendo.valor_multa),
        fecha_comparendo: comparendo.fecha_comparendo.slice(0, 16),
        lugar: comparendo.lugar,
        ciudad: comparendo.ciudad,
        observaciones: comparendo.observaciones || '',
      })
    }
  }, [comparendo])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'infraccion_codigo') {
      const selected = infracciones?.find(i => i.codigo === value)
      if (selected) {
        setFormData(prev => ({
          ...prev,
          infraccion_descripcion: selected.descripcion,
          valor_multa: Number(selected.valor_multa)
        }))
      }
    }
  }

  const handleAgregarInfraccion = () => {
    if (!formData.infraccion_codigo) return
    
    if (formData.infraccion_codigo === comparendo?.infraccion_codigo) {
        addToast('Esta es la infracción principal que estás editando.', 'info')
        return
    }

    if (selectedInfractions.find(i => i.codigo === formData.infraccion_codigo)) {
      addToast('Esta infracción ya ha sido agregada.', 'warning')
      return
    }

    const infraccion = {
      codigo: formData.infraccion_codigo,
      descripcion: formData.infraccion_descripcion,
      valor_multa: formData.valor_multa
    }

    setSelectedInfractions(prev => [...prev, infraccion])
    
    setFormData(prev => ({
      ...prev,
      infraccion_codigo: comparendo?.infraccion_codigo || '',
      infraccion_descripcion: comparendo?.infraccion_descripcion || '',
      valor_multa: Number(comparendo?.valor_multa) || 0
    }))
  }

  const handleRemoverInfraccion = (codigo: string) => {
    setSelectedInfractions(prev => prev.filter(i => i.codigo !== codigo))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id) return

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          placa_vehiculo: formData.placa_vehiculo,
          infraccion_codigo: formData.infraccion_codigo,
          infraccion_descripcion: formData.infraccion_descripcion,
          valor_multa: formData.valor_multa,
          fecha_comparendo: new Date(formData.fecha_comparendo).toISOString(),
          lugar: formData.lugar,
          ciudad: formData.ciudad,
          observaciones: formData.observaciones,
          infracciones: selectedInfractions
        }
      })
      addToast('Comparendo actualizado y adicionales creados si aplica', 'success')
      navigate(`/comparendos/${id}`)
    } catch (error: any) {
      addToast(error.message || 'Error al actualizar comparendo', 'error')
    }
  }

  if (isLoadingComparendo) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!comparendo) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Comparendo no encontrado.</p>
        <Link to="/comparendos" className="mt-4 text-emerald-600 hover:underline">Volver a la lista</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/comparendos/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={16} />
        Volver al detalle
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Edición
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Editar Comparendo {comparendo.numero_comparendo}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Modifica la información del comparendo seleccionado.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-slate-800 dark:from-blue-950/20 dark:to-indigo-950/20">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Formulario de Edición
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="placa_vehiculo" className={labelClass}>
              Placa del Vehículo
            </label>
            <input
              id="placa_vehiculo"
              name="placa_vehiculo"
              type="text"
              value={formData.placa_vehiculo}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fecha_comparendo" className={labelClass}>
              Fecha y hora
            </label>
            <input
              id="fecha_comparendo"
              name="fecha_comparendo"
              type="datetime-local"
              value={formData.fecha_comparendo}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="infraccion_codigo" className={labelClass}>
              Infracción (Principal)
            </label>
            <div className="flex gap-2">
              <select
                id="infraccion_codigo"
                name="infraccion_codigo"
                value={formData.infraccion_codigo}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Seleccione una infracción</option>
                {infracciones?.map((inf) => (
                  <option key={inf.infraccion_id} value={inf.codigo}>
                    {inf.codigo} - {inf.descripcion.substring(0, 50)}...
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAgregarInfraccion}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sumar otra
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Valor Multa
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 text-slate-500 font-mono">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(formData.valor_multa)}
            </div>
          </div>

          <div>
            <label htmlFor="lugar" className={labelClass}>
              Lugar
            </label>
            <input
              id="lugar"
              name="lugar"
              type="text"
              value={formData.lugar}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="ciudad" className={labelClass}>
              Ciudad
            </label>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              value={formData.ciudad}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

            {selectedInfractions.length > 0 && (
              <div className="md:col-span-2 space-y-3 mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Infracciones Adicionales a Crear ({selectedInfractions.length})
                </p>
                <div className="grid gap-2">
                  {selectedInfractions.map((inf) => (
                    <div 
                      key={inf.codigo}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-600">{inf.codigo}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{inf.descripcion}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoverInfraccion(inf.codigo)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="observaciones" className={labelClass}>
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Guardando...' : <><Save size={16} /> Guardar cambios</>}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/comparendos/${id}`)}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarComparendo
