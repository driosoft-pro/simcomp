import React, { useState } from 'react'
import { useCreateLicencia, useUpdateLicencia } from '../../hooks/usePersonas'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import type { UUID, LicenciaConduccion } from '../../types'

interface LicenciaFormProps {
  personaId: UUID
  licencia?: LicenciaConduccion
  onSuccess?: () => void
  onCancel?: () => void
}

function LicenciaForm({ personaId, licencia, onSuccess, onCancel }: LicenciaFormProps) {
  const { mutateAsync: createLicencia, isPending: isCreating } = useCreateLicencia()
  const { mutateAsync: updateLicencia, isPending: isUpdating } = useUpdateLicencia()
  const [error, setError] = useState<string | null>(null)

  const isPending = isCreating || isUpdating
  const isEdit = Boolean(licencia)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    
    const data = {
      persona_id: personaId,
      numero_licencia: fd.get('numero_licencia') as string,
      categoria: fd.get('categoria') as any,
      fecha_expedicion: fd.get('fecha_expedicion') as string,
      fecha_vencimiento: fd.get('fecha_vencimiento') as string,
      estado: (fd.get('estado') as any).toLowerCase(),
    }

    try {
      if (isEdit && licencia) {
        await updateLicencia({ id: licencia.licencia_id, data })
      } else {
        await createLicencia(data)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Error al ${isEdit ? 'actualizar' : 'crear'} licencia`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Licencia <span className="text-red-500">*</span></label>
          <input 
            required 
            type="text" 
            name="numero_licencia" 
            defaultValue={licencia?.numero_licencia}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categoría <span className="text-red-500">*</span></label>
          <select 
            required 
            name="categoria" 
            defaultValue={licencia?.categoria || 'B1'}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
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
          <input 
            required 
            type="date" 
            name="fecha_expedicion" 
            defaultValue={licencia?.fecha_expedicion}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Vencimiento <span className="text-red-500">*</span></label>
          <input 
            required 
            type="date" 
            name="fecha_vencimiento" 
            defaultValue={licencia?.fecha_vencimiento}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" 
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado <span className="text-red-500">*</span></label>
        <select 
          required 
          name="estado" 
          defaultValue={licencia?.estado || 'vigente'} 
          className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="vigente">Vigente</option>
          <option value="suspendida">Suspendida</option>
          <option value="vencida">Vencida</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:hover:bg-slate-800">
            Cancelar
          </button>
        )}
        <button disabled={isPending} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-70 dark:bg-violet-500 dark:hover:bg-violet-600">
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? 'Actualizar Licencia' : 'Guardar Licencia'}
        </button>
      </div>
    </form>
  )
}

export default LicenciaForm
