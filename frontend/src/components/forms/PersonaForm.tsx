import React, { useState } from 'react'
import { useCreatePersona, useCreateLicencia, useUpdatePersona, useLicenciasByPersona, useUpdateLicencia } from '../../hooks/usePersonas'
import { createUsuario } from '../../api/usuarios.api'
import { Save, Loader2, AlertCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import type { Persona } from '../../types'

interface PersonaFormProps {
  onSuccess?: (persona: Persona) => void
  onCancel?: () => void
  defaultDocumento?: string
  persona?: Persona // If provided, we are in EDIT mode
  requireLicense?: boolean
  submitLabel?: string
}

function PersonaForm({ onSuccess, onCancel, defaultDocumento, persona, requireLicense, submitLabel }: PersonaFormProps) {
  const isEdit = Boolean(persona)
  const { mutateAsync: createPersona, isPending: isCreatingPersona } = useCreatePersona()
  const { mutateAsync: updatePersona, isPending: isUpdatingPersona } = useUpdatePersona()
  const { mutateAsync: createLicencia, isPending: isCreatingLicencia } = useCreateLicencia()
  const { mutateAsync: updateLicencia, isPending: isUpdatingLicencia } = useUpdateLicencia()
  
  // Load licenses if editing
  const { data: licencias, isLoading: isLoadingLicencias } = useLicenciasByPersona(persona?.persona_id || '')
  const firstLicencia = licencias?.[0]

  const [showLicenseForm, setShowLicenseForm] = useState(requireLicense || (isEdit && !!firstLicencia))
  const [error, setError] = useState<string | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Sync documento with licencia logic
  const [docNumber, setDocNumber] = useState(persona?.numero_documento || defaultDocumento || '')
  // Capture the original document to detect if licNumber was auto-set from documento
  const originalDocumento = persona?.numero_documento || defaultDocumento || ''
  const [licNumber, setLicNumber] = useState(firstLicencia?.numero_licencia || defaultDocumento || '')
  const [licManuallyEdited, setLicManuallyEdited] = useState(
    isEdit && !!firstLicencia && firstLicencia.numero_licencia !== originalDocumento
  )

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDocNumber(val)
    // Sync licNumber if:
    // - Not editing (create mode), OR
    // - Editing and licNumber still matches the original documento (not custom)
    if (!licManuallyEdited) {
      setLicNumber(val)
    }
  }

  const handleLicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicNumber(e.target.value)
    setLicManuallyEdited(true)
  }

  const isPending = isCreatingPersona || isUpdatingPersona || isCreatingLicencia || isUpdatingLicencia || isCreatingUser || isLoadingLicencias

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    
    // Extraer datos de persona
    const numero_documento = fd.get('numero_documento') as string
    const email = fd.get('email') as string
    
    const personaData = {
      tipo_documento: fd.get('tipo_documento') as any,
      numero_documento,
      nombres: fd.get('nombres') as string,
      apellidos: fd.get('apellidos') as string,
      fecha_nacimiento: fd.get('fecha_nacimiento') as string,
      genero: fd.get('genero') as any,
      direccion: fd.get('direccion') as string,
      telefono: fd.get('telefono') as string,
      email,
      estado: (fd.get('estado') as any) || 'activo',
    }

    // Extraer datos de licencia (solo si está habilitado)
    let licenciaData = null
    if (showLicenseForm) {
      licenciaData = {
        numero_licencia: fd.get('numero_licencia') as string,
        categoria: fd.get('categoria') as any,
        fecha_expedicion: fd.get('fecha_expedicion') as string,
        fecha_vencimiento: fd.get('fecha_vencimiento') as string,
        estado: (fd.get('estado_licencia') as any).toLowerCase() as any,
      }
    }

    try {
      let resultPersona: Persona
      
      if (isEdit && persona) {
        resultPersona = await updatePersona({ id: persona.persona_id, data: personaData })
        
        // Update or create license (if enabled)
        if (showLicenseForm && licenciaData) {
          if (firstLicencia) {
            await updateLicencia({ id: firstLicencia.licencia_id, data: licenciaData })
          } else {
            await createLicencia({ ...licenciaData, persona_id: persona.persona_id })
          }
        }
      } else {
        resultPersona = await createPersona(personaData)
        
        // Create license for new persona (if enabled)
        if (showLicenseForm && licenciaData) {
          await createLicencia({ ...licenciaData, persona_id: resultPersona.persona_id })
        }
        
        // Auto-create Usuario credentials for logic
        setIsCreatingUser(true)
        try {
          await createUsuario({
            username: numero_documento,
            password: numero_documento, // Password is the cedula by default
            email: email,
            rol: 'ciudadano',
            persona_id: resultPersona.persona_id,
            numero_documento: numero_documento
          })
        } catch (err) {
          console.error('Error al crear usuario ciudadano automáticamente:', err)
        } finally {
          setIsCreatingUser(false)
        }
      }
      
      onSuccess?.(resultPersona)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al procesar persona')
      setIsCreatingUser(false)
    }
  }

  if (isEdit && isLoadingLicencias) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Datos Personales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
          {isEdit ? 'Editar Datos Personales' : 'Datos Personales'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo Documento <span className="text-red-500">*</span></label>
            <select required autoFocus name="tipo_documento" defaultValue={persona?.tipo_documento || 'CC'} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="TI">Tarjeta de Identidad (TI)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número <span className="text-red-500">*</span></label>
            <input required type="text" name="numero_documento" value={docNumber} onChange={handleDocChange} readOnly={!!defaultDocumento} className={`w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:text-slate-200 ${defaultDocumento ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombres <span className="text-red-500">*</span></label>
            <input required type="text" name="nombres" defaultValue={persona?.nombres} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Apellidos <span className="text-red-500">*</span></label>
            <input required type="text" name="apellidos" defaultValue={persona?.apellidos} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Género <span className="text-red-500">*</span></label>
            <select required name="genero" defaultValue={persona?.genero || 'M'} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Nacimiento <span className="text-red-500">*</span></label>
            <input required type="date" name="fecha_nacimiento" defaultValue={persona?.fecha_nacimiento} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teléfono <span className="text-red-500">*</span></label>
            <input required type="tel" name="telefono" defaultValue={persona?.telefono} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></label>
            <input required type="email" name="email" defaultValue={persona?.email} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dirección <span className="text-red-500">*</span></label>
            <input required type="text" name="direccion" defaultValue={persona?.direccion} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
        </div>

        {isEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado <span className="text-red-500">*</span></label>
            <select required name="estado" defaultValue={persona?.estado} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        )}
      </div>

      {/* Datos de Licencia */}
      <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/20">
        <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <ShieldCheck size={16} className="text-emerald-500" />
            {isEdit ? 'Licencia de Conducción' : 'Datos de Licencia'}
          </h3>
          {!requireLicense && (
            <button
              type="button"
              onClick={() => setShowLicenseForm(!showLicenseForm)}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold uppercase transition-colors ${
                showLicenseForm 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400'
              }`}
            >
              {showLicenseForm ? (
                <>
                  <ChevronUp size={14} /> Quitar
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Registrar
                </>
              )}
            </button>
          )}
        </div>
        
        {showLicenseForm ? (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Licencia <span className="text-red-500">*</span></label>
            <input required type="text" name="numero_licencia" value={licNumber} onChange={handleLicChange} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categoría <span className="text-red-500">*</span></label>
            <select required name="categoria" defaultValue={firstLicencia?.categoria} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="B3">B3</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="C3">C3</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Expedición <span className="text-red-500">*</span></label>
            <input required type="date" name="fecha_expedicion" defaultValue={firstLicencia?.fecha_expedicion} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Vencimiento <span className="text-red-500">*</span></label>
            <input required type="date" name="fecha_vencimiento" defaultValue={firstLicencia?.fecha_vencimiento} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
        </div>

        <div className="space-y-1 mt-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado Licencia <span className="text-red-500">*</span></label>
          <select required name="estado_licencia" defaultValue={firstLicencia?.estado || 'vigente'} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <option value="vigente">Vigente</option>
            <option value="suspendida">Suspendida</option>
            <option value="vencida">Vencida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
    ) : (
      <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
        No se registrará licencia para esta persona.
      </p>
    )}
  </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:hover:bg-slate-800">
            Cancelar
          </button>
        )}
        <button disabled={isPending} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-600">
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? 'Guardar Cambios' : (submitLabel || 'Registrar Persona')}
        </button>
      </div>
    </form>
  )
}

export default PersonaForm