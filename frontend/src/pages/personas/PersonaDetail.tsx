import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePersona, useLicenciasByPersona } from '../../hooks/usePersonas'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, User, Hash, Phone, Mail, MapPin, CreditCard, IdCard, Calendar, ShieldCheck, Plus, X, Edit, Info } from 'lucide-react'
import type { Persona, LicenciaConduccion } from '../../types'
import LicenciaForm from '../../components/forms/LicenciaForm'
import PersonaForm from '../../components/forms/PersonaForm'

const tipoDocLabel: Record<Persona['tipo_documento'], string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  PASAPORTE: 'Pasaporte',
  TI: 'Tarjeta de Identidad',
}

const licEstado: Record<string, string> = {
  vigente: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspendida: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  vencida: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelada: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
      <span className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-0.5 break-all font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

function PersonaDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const personaId = id ?? ''
  const { data, isLoading, isError, error } = usePersona(personaId)
  const { data: licencias } = useLicenciasByPersona(personaId)
  const [showLicenciaForm, setShowLicenciaForm] = useState(false)
  const [selectedLicencia, setSelectedLicencia] = useState<LicenciaConduccion | undefined>(undefined)
  const [showEditForm, setShowEditForm] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3 h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Error al cargar persona: {error instanceof Error ? error.message : 'desconocido'}
        </p>
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Persona no encontrada.</p>
  }

  const nombreCompleto = `${data.nombres} ${data.apellidos}`

  // Permisos de edición:
  // - Admin, Supervisor o Agente pueden editar cualquier persona.
  // - Ciudadano solo puede editarse a sí mismo (username === numero_documento).
  const canEdit = user?.rol === 'admin' || user?.rol === 'agente'

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/personas"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          <ArrowLeft size={16} />
          Volver a Personas
        </Link>
        {canEdit && (
          <button
            onClick={() => setShowEditForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            <Edit size={16} />
            Editar Datos
          </button>
        )}
      </div>

      {/* Tarjeta principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-5 dark:border-slate-800 dark:from-violet-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {nombreCompleto}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tipoDocLabel[data.tipo_documento]} · {data.numero_documento}
              </p>
            </div>
          </div>
        </div>

        {/* Campos */}
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field icon={<Hash size={15}/>} label="ID" value={data.persona_id} />
            <Field icon={<IdCard size={15}/>} label="Tipo de documento" value={tipoDocLabel[data.tipo_documento]} />
            <Field icon={<CreditCard size={15}/>} label="Número de documento" value={data.numero_documento} />
            <Field icon={<User size={15}/>} label="Género" value={data.genero === 'M' ? 'Masculino' : data.genero === 'F' ? 'Femenino' : 'Otro'} />
            <Field icon={<Calendar size={15}/>} label="Fecha de Nacimiento" value={data.fecha_nacimiento} />
            <Field icon={<Phone size={15}/>} label="Teléfono" value={data.telefono || 'No registrado'} />
            <Field icon={<Mail size={15}/>} label="Correo electrónico" value={data.email || 'No registrado'} />
            <Field icon={<MapPin size={15}/>} label="Dirección" value={data.direccion || 'No registrada'} />
            <Field icon={<Info size={15}/>} label="Estado" value={data.estado.toUpperCase()} />
            {data.created_at && <Field icon={<Calendar size={15}/>} label="Fecha Registro" value={new Date(data.created_at).toLocaleString()} />}
            {data.updated_at && <Field icon={<Calendar size={15}/>} label="Última Actualización" value={new Date(data.updated_at).toLocaleString()} />}
          </div>
        </div>
      </div>

      {/* Licencias de conducción */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Licencias de conducción</h2>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setSelectedLicencia(undefined)
                    setShowLicenciaForm(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                >
                  <Plus size={16} />
                  Añadir Licencia
                </button>
                {licencias && licencias.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedLicencia(licencias[0])
                      setShowLicenciaForm(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                  >
                    <Edit size={16} />
                    Editar Licencia
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {licencias && licencias.length > 0 ? (
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {licencias.map((lic) => (
                <div key={lic.licencia_id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {lic.numero_licencia}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${licEstado[lic.estado] ?? ''}`}>
                        {lic.estado.toUpperCase()}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => {
                            setSelectedLicencia(lic)
                            setShowLicenciaForm(true)
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition dark:hover:bg-slate-700 dark:hover:text-slate-300"
                          title="Editar Licencia"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11}/> Expedición: {lic.fecha_expedicion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11}/> Vence: {lic.fecha_vencimiento}
                    </span>
                    <span>Categoría: <strong>{lic.categoria}</strong></span>
                  </div>
                  {lic.observaciones && (
                    <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Observaciones</p>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 italic">"{lic.observaciones}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Esta persona no tiene licencias registradas.</p>
          </div>
        )}
      </div>

      {/* Modal Licencia */}
      {showLicenciaForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/80">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {selectedLicencia ? 'Editar Licencia' : 'Añadir Licencia'}
              </h3>
              <button
                onClick={() => {
                  setShowLicenciaForm(false)
                  setSelectedLicencia(undefined)
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <LicenciaForm 
                personaId={personaId}
                licencia={selectedLicencia}
                onSuccess={() => {
                  setShowLicenciaForm(false)
                  setSelectedLicencia(undefined)
                }} 
                onCancel={() => {
                  setShowLicenciaForm(false)
                  setSelectedLicencia(undefined)
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Persona */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/80">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Editar Datos Personales
              </h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <PersonaForm 
                persona={data}
                onSuccess={() => setShowEditForm(false)} 
                onCancel={() => setShowEditForm(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonaDetail