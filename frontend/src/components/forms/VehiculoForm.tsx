import React, { useState } from 'react'
import { Save, Loader2, AlertCircle, Car, ShieldCheck } from 'lucide-react'
import { useCreateAutomotor } from '../../hooks/useAutomotores'
import type { Automotor } from '../../types'

interface VehiculoFormProps {
  onSuccess?: (vehiculo: Automotor) => void
  onCancel?: () => void
  defaultPlaca?: string
  defaultPropietarioDoc?: string
  defaultPropietarioNombre?: string
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

const labelClass = 'text-xs font-semibold text-slate-700 dark:text-slate-300'

function VehiculoForm({ onSuccess, onCancel, defaultPlaca, defaultPropietarioDoc, defaultPropietarioNombre }: VehiculoFormProps) {
  const { mutateAsync: createVehiculo, isPending } = useCreateAutomotor()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    
    const vehiculoData = {
      placa: fd.get('placa') as string,
      vin: fd.get('vin') as string,
      numero_motor: fd.get('numero_motor') as string,
      numero_chasis: fd.get('numero_chasis') as string,
      marca: fd.get('marca') as string,
      linea: fd.get('linea') as string,
      modelo: parseInt(fd.get('modelo') as string, 10),
      color: fd.get('color') as string,
      clase: fd.get('clase') as any,
      servicio: (fd.get('servicio') as any) || 'PARTICULAR',
      propietario_documento: fd.get('propietario_documento') as string,
      propietario_nombre: fd.get('propietario_nombre') as string,
      estado: 'activo' as const,
      condicion: (fd.get('condicion') as any) || 'LEGAL',
    }

    try {
      const result = await createVehiculo(vehiculoData)
      onSuccess?.(result)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar vehículo')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Datos Básicos */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
          <Car size={16} className="text-emerald-500" />
          Especificaciones del Vehículo
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>Placa <span className="text-red-500">*</span></label>
            <input 
              required 
              autoFocus
              type="text" 
              name="placa" 
              defaultValue={defaultPlaca} 
              readOnly={!!defaultPlaca}
              className={`${inputClass} ${defaultPlaca ? 'bg-slate-100 dark:bg-slate-800' : ''}`} 
              placeholder="ABC123"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Marca <span className="text-red-500">*</span></label>
            <input required type="text" name="marca" className={inputClass} placeholder="Ej: Toyota" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>Línea <span className="text-red-500">*</span></label>
            <input required type="text" name="linea" className={inputClass} placeholder="Ej: Corolla" />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Modelo (Año) <span className="text-red-500">*</span></label>
            <input required type="number" name="modelo" className={inputClass} placeholder="Ej: 2022" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>Color <span className="text-red-500">*</span></label>
            <input required type="text" name="color" className={inputClass} placeholder="Ej: Rojo" />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Condición <span className="text-red-500">*</span></label>
            <select required name="condicion" className={inputClass} defaultValue="LEGAL">
              <option value="LEGAL">Legal</option>
              <option value="REPORTADO_ROBO">Reportado Robo</option>
              <option value="RECUPERADO">Recuperado</option>
              <option value="EMBARGADO">Embargado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Clase de Vehículo <span className="text-red-500">*</span></label>
            <select required name="clase" className={inputClass}>
              <option value="AUTOMOVIL">Automóvil</option>
              <option value="MOTOCICLETA">Motocicleta</option>
              <option value="CAMIONETA">Camioneta</option>
              <option value="CAMPERO">Campero</option>
              <option value="BUS">Bus</option>
              <option value="CAMION">Camión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Identificación Técnica */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
          <ShieldCheck size={16} className="text-blue-500" />
          Identificación Técnica
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>NÚMERO VIN <span className="text-red-500">*</span></label>
            <input required type="text" name="vin" className={inputClass} placeholder="Número de serie" />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Número Motor <span className="text-red-500">*</span></label>
            <input required type="text" name="numero_motor" className={inputClass} placeholder="Serial motor" />
          </div>
        </div>
        <div className="space-y-1">
            <label className={labelClass}>Número Chasis <span className="text-red-500">*</span></label>
            <input required type="text" name="numero_chasis" className={inputClass} placeholder="Serial chasis" />
          </div>
      </div>

      {/* Propietario */}
      <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/20">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
          Datos del Propietario
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>Documento Propietario <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              name="propietario_documento" 
              defaultValue={defaultPropietarioDoc} 
              className={inputClass} 
              placeholder="CC o NIT"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Nombre Propietario <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              name="propietario_nombre" 
              defaultValue={defaultPropietarioNombre} 
              className={inputClass} 
              placeholder="Nombre completo"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:hover:bg-slate-800">
            Cancelar
          </button>
        )}
        <button disabled={isPending} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-600">
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Registrar Vehículo
        </button>
      </div>
    </form>
  )
}

export default VehiculoForm