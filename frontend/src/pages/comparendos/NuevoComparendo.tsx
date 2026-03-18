import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateComparendo, useComparendos } from '../../hooks/useComparendos'
import { getPersonaByDocumento } from '../../api/personas.api'
import { getAutomotoresByPropietario, searchAutomotorByPlaca } from '../../api/automotores.api'
import { useInfracciones } from '../../hooks/useInfracciones'
import { ArrowLeft, AlertCircle, Search, CheckCircle2, UserPlus, X, Car } from 'lucide-react'
import PersonaForm from '../../components/forms/PersonaForm'
import VehiculoForm from '../../components/forms/VehiculoForm'

import { useAuth } from '../../hooks/useAuth'

interface FormData {
  numero_comparendo: string
  fecha_comparendo: string
  ciudadano_documento: string
  ciudadano_nombre: string
  agente_documento: string
  agente_nombre: string
  placa_vehiculo: string
  tipo_vehiculo: string
  infraccion_codigo: string
  infraccion_descripcion: string
  valor_multa: number
  lugar: string
  ciudad: string
  observaciones: string
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300'

function NuevoComparendo() {
  const navigate = useNavigate()
  const createComparendo = useCreateComparendo()
  const { data: infracciones } = useInfracciones()
  const { data: comparendos } = useComparendos()

  const { user } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    numero_comparendo: '',
    fecha_comparendo: new Date().toISOString(),
    ciudadano_documento: '',
    ciudadano_nombre: '',
    agente_documento: user?.username || '',
    agente_nombre: user?.username || '',
    placa_vehiculo: '',
    tipo_vehiculo: '',
    infraccion_codigo: '',
    infraccion_descripcion: '',
    valor_multa: 0,
    lugar: '',
    ciudad: 'Cali',
    observaciones: '',
  })

  useEffect(() => {
    if (comparendos && !formData.numero_comparendo) {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 0)
      const diff = now.getTime() - start.getTime()
      const oneDay = 1000 * 60 * 60 * 24
      const dayOfYear = Math.floor(diff / oneDay).toString().padStart(3, '0')
      const year = now.getFullYear()
      const prefix = `COMP-${year}-${dayOfYear}-`

      const todayComparendos = comparendos.filter(c => c.numero_comparendo.startsWith(prefix))
      const maxSeq = todayComparendos.reduce((max, c) => {
        const parts = c.numero_comparendo.split('-')
        if (parts.length >= 4) {
          const seq = parseInt(parts[3], 10)
          return isNaN(seq) ? max : Math.max(max, seq)
        }
        return max
      }, 0)

      const newSeq = (maxSeq + 1).toString().padStart(3, '0')
      setFormData(prev => ({ ...prev, numero_comparendo: `${prefix}${newSeq}` }))
    }
  }, [comparendos, formData.numero_comparendo])
  
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Validation State
  const [isValidatingPersona, setIsValidatingPersona] = useState(false)
  const [personaValida, setPersonaValida] = useState<boolean | null>(null)
  const [personaWarning, setPersonaWarning] = useState<string | null>(null)
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false)

  // Vehicle Validation State
  const [isValidatingVehiculo, setIsValidatingVehiculo] = useState(false)
  const [vehiculoValido, setVehiculoValido] = useState<boolean | null>(null)
  const [vehiculoWarning, setVehiculoWarning] = useState<string | null>(null)
  const [isVehiculoModalOpen, setIsVehiculoModalOpen] = useState(false)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'ciudadano_documento') {
      setPersonaValida(null)
      setPersonaWarning(null)
    }
    if (name === 'placa_vehiculo') {
      setVehiculoValido(null)
      setVehiculoWarning(null)
    }
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

  const handleValidarInfractor = async () => {
    if (!formData.ciudadano_documento.trim()) {
      setPersonaWarning('Ingrese un documento para validar.')
      return
    }

    setIsValidatingPersona(true)
    setPersonaWarning(null)
    setPersonaValida(null)

    try {
      const persona = await getPersonaByDocumento(formData.ciudadano_documento)
      if (persona) {
        setPersonaValida(true)
        setFormData(prev => ({
          ...prev,
          ciudadano_nombre: `${persona.nombres} ${persona.apellidos}`
        }))
        try {
          const automotores = await getAutomotoresByPropietario(persona.persona_id)
          if (automotores && automotores.length > 0) {
            setFormData(prev => ({
              ...prev,
              placa_vehiculo: automotores[0].placa,
              tipo_vehiculo: automotores[0].clase
            }))
          }
        } catch (e) {
          // No hace nada si no tiene
        }
      } else {
        setPersonaValida(false)
      }
    } catch (error) {
      setPersonaValida(false)
      setPersonaWarning('La persona no está registrada en el sistema.')
    } finally {
      setIsValidatingPersona(false)
    }
  }

  const handlePersonaCreated = (nuevaPersona: any) => {
    setIsPersonaModalOpen(false)
    setFormData(prev => ({
      ...prev,
      ciudadano_documento: nuevaPersona.numero_documento,
      ciudadano_nombre: `${nuevaPersona.nombres} ${nuevaPersona.apellidos}`
    }))
    setPersonaValida(true)
    setPersonaWarning(null)
  }

  const handleValidarVehiculo = async () => {
    if (!formData.placa_vehiculo.trim()) {
      setVehiculoWarning('Ingrese una placa para validar.')
      return
    }

    setIsValidatingVehiculo(true)
    setVehiculoWarning(null)
    setVehiculoValido(null)

    try {
      const vehiculo = await searchAutomotorByPlaca(formData.placa_vehiculo.toUpperCase())
      if (vehiculo) {
        setVehiculoValido(true)
        setFormData(prev => ({
          ...prev,
          tipo_vehiculo: vehiculo.clase,
          placa_vehiculo: vehiculo.placa
        }))
      } else {
        setVehiculoValido(false)
        setVehiculoWarning('El vehículo no está registrado en el sistema.')
      }
    } catch (error) {
      setVehiculoValido(false)
      setVehiculoWarning('El vehículo no está registrado en el sistema.')
    } finally {
      setIsValidatingVehiculo(false)
    }
  }

  const handleVehiculoCreated = (nuevoVehiculo: any) => {
    setIsVehiculoModalOpen(false)
    setFormData(prev => ({
      ...prev,
      placa_vehiculo: nuevoVehiculo.placa,
      tipo_vehiculo: nuevoVehiculo.clase
    }))
    setVehiculoValido(true)
    setVehiculoWarning(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)
    
    try {
      const nuevo = await createComparendo.mutateAsync({
        numero_comparendo: formData.numero_comparendo,
        fecha_comparendo: formData.fecha_comparendo,
        ciudadano_documento: formData.ciudadano_documento,
        ciudadano_nombre: formData.ciudadano_nombre,
        agente_documento: formData.agente_documento,
        agente_nombre: formData.agente_nombre,
        placa_vehiculo: formData.placa_vehiculo,
        clase_vehiculo: formData.tipo_vehiculo,
        infraccion_codigo: formData.infraccion_codigo,
        infraccion_descripcion: formData.infraccion_descripcion,
        valor_multa: formData.valor_multa,
        lugar: formData.lugar,
        ciudad: formData.ciudad,
        observaciones: formData.observaciones || undefined,
      })
      navigate(`/comparendos/${nuevo.comparendo_id}`)
    } catch (error: any) {
      console.error('Error al crear comparendo:', error)
      setSubmitError(error.message || 'Error desconocido al crear comparendo')
    } finally {
      setIsSubmitting(false)
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
              readOnly
              className={`${inputClass} bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500`}
            />
          </div>

          {/* Fecha y hora */}
          <div>
            <label htmlFor="fecha_comparendo" className={labelClass}>
              Fecha y hora
            </label>
            <input
              id="fecha_comparendo"
              name="fecha_comparendo"
              type="datetime-local"
              value={formData.fecha_comparendo.slice(0, 16)}
              onChange={(e) => {
                const date = new Date(e.target.value).toISOString()
                setFormData(prev => ({ ...prev, fecha_comparendo: date }))
              }}
              required
              className={inputClass}
            />
          </div>

          {/* Documento Persona with Validation */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="ciudadano_documento" className={labelClass}>
                  Documento del Infractor <span className="font-mono text-xs text-slate-400">(PERSONA ID)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      id="ciudadano_documento"
                      name="ciudadano_documento"
                      type="text"
                      value={formData.ciudadano_documento}
                      onChange={handleChange}
                      required
                      placeholder="Ej: 123456789"
                      className={`${inputClass} ${personaValida === true ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : personaValida === false ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    />
                    {personaValida && (
                      <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleValidarInfractor}
                    disabled={isValidatingPersona || !formData.ciudadano_documento}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {isValidatingPersona ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <Search size={16} />
                    )}
                    Validar Infractor
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="ciudadano_nombre" className={labelClass}>
                  Nombre del Infractor
                </label>
                <input
                  id="ciudadano_nombre"
                  name="ciudadano_nombre"
                  type="text"
                  value={formData.ciudadano_nombre}
                  readOnly
                  placeholder="Se llena al validar"
                  className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                />
              </div>
            </div>
            
            {personaWarning && (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{personaWarning}</p>
                </div>
                {personaValida === false && (
                  <button
                    type="button"
                    onClick={() => setIsPersonaModalOpen(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    <UserPlus size={14} /> Registrar Infractor
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Placa y Tipo de Vehículo */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="placa_vehiculo" className={labelClass}>
                  Placa del Vehículo <span className="font-mono text-xs text-slate-400">(AUTOMOTOR ID)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      id="placa_vehiculo"
                      name="placa_vehiculo"
                      type="text"
                      value={formData.placa_vehiculo}
                      onChange={handleChange}
                      required
                      placeholder="Ej: ABC123"
                      className={`${inputClass} ${vehiculoValido === true ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : vehiculoValido === false ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    />
                    {vehiculoValido && (
                      <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleValidarVehiculo}
                    disabled={isValidatingVehiculo || !formData.placa_vehiculo}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {isValidatingVehiculo ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <Search size={16} />
                    )}
                    Validar Vehículo
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="tipo_vehiculo" className={labelClass}>
                  Tipo de Vehículo
                </label>
                <input
                  id="tipo_vehiculo"
                  name="tipo_vehiculo"
                  type="text"
                  value={formData.tipo_vehiculo}
                  readOnly
                  placeholder="Se llena al validar"
                  className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                />
              </div>
            </div>

            {vehiculoWarning && (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{vehiculoWarning}</p>
                </div>
                {vehiculoValido === false && (
                  <button
                    type="button"
                    onClick={() => setIsVehiculoModalOpen(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    <Car size={14} /> Registrar Vehículo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Agente */}
          <div className="grid gap-5 md:grid-cols-2 md:col-span-2">
            <div>
              <label htmlFor="agente_documento" className={labelClass}>
                Documento del Guarda
              </label>
              <input
                id="agente_documento"
                name="agente_documento"
                type="text"
                value={formData.agente_documento}
                readOnly
                className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
              />
            </div>
            <div>
              <label htmlFor="agente_nombre" className={labelClass}>
                Nombre del Guarda
              </label>
              <input
                id="agente_nombre"
                name="agente_nombre"
                type="text"
                value={formData.agente_nombre}
                readOnly
                className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
              />
            </div>
          </div>

          {/* Código Infracción */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="infraccion_codigo" className={labelClass}>
                  Código de Infracción <span className="font-mono text-xs text-slate-400">(C03)</span>
                </label>
                <div className="flex gap-3">
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
                        {inf.codigo}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                        const inf = infracciones?.find(i => i.codigo === formData.infraccion_codigo)
                        if (inf) alert(`Descripción: ${inf.descripcion}`)
                    }}
                    disabled={!formData.infraccion_codigo}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Ver Descripción
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="valor_multa" className={labelClass}>
                  Valor Multa
                </label>
                <input
                  id="valor_multa"
                  name="valor_multa"
                  type="text"
                  value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(formData.valor_multa)}
                  readOnly
                  className={`${inputClass} bg-slate-100 dark:bg-slate-800 font-mono`}
                />
              </div>
            </div>
            {formData.infraccion_descripcion && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Descripción de la Infracción</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{formData.infraccion_descripcion}</p>
                </div>
            )}
          </div>

          {/* Lugar y Ciudad */}
          <div className="grid gap-5 md:grid-cols-2 md:col-span-2">
            <div>
              <label htmlFor="lugar" className={labelClass}>
                Lugar de la Infracción
              </label>
              <input
                id="lugar"
                name="lugar"
                type="text"
                value={formData.lugar}
                onChange={handleChange}
                required
                placeholder="Ej: Av. 3N con Calle 44"
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
                placeholder="Ej: Cali"
                className={inputClass}
              />
            </div>
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
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

          {(submitError || createComparendo.isError) && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 w-full dark:border-red-900/40 dark:bg-red-950/20">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {submitError || 'Ocurrió un error al crear el comparendo.'}
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Persona Creation Modal */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <UserPlus size={20} className="text-emerald-500" /> Registrar Nuevo Infractor
                </h2>
                <p className="text-xs text-slate-500 mt-1">Complete los datos para generar la persona, licencia y cuenta de usuario.</p>
              </div>
              <button
                onClick={() => setIsPersonaModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <PersonaForm 
                onSuccess={handlePersonaCreated} 
                onCancel={() => setIsPersonaModalOpen(false)}
                defaultDocumento={formData.ciudadano_documento}
              />
            </div>
          </div>
        </div>
      )}
      {/* Vehiculo Creation Modal */}
      {isVehiculoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Car size={20} className="text-emerald-500" /> Registrar Nuevo Vehículo
                </h2>
                <p className="text-xs text-slate-500 mt-1">Coloque los datos del automotor para asociarlo al comparendo.</p>
              </div>
              <button
                onClick={() => setIsVehiculoModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <VehiculoForm 
                onSuccess={handleVehiculoCreated} 
                onCancel={() => setIsVehiculoModalOpen(false)}
                defaultPlaca={formData.placa_vehiculo.toUpperCase()}
                defaultPropietarioDoc={formData.ciudadano_documento}
                defaultPropietarioNombre={formData.ciudadano_nombre}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NuevoComparendo