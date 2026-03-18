import { useState, useEffect } from 'react'
import { Plus, X, AlertCircle } from 'lucide-react'
import {
  useInfracciones,
  useCreateInfraccion,
  useUpdateInfraccion,
  useDeleteInfraccion,
  useToggleVigenciaInfraccion,
} from '../../hooks/useInfracciones'
import { formatCurrency } from '../../utils/formatters'
import type { Infraccion } from '../../types'
const tipoSancionStyles: Record<Infraccion['tipo_sancion'], string> = {
  MONETARIA: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SUSPENSION_LICENCIA: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  INMOVILIZACION: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  MIXTA: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300'

function InfraccionesList() {
  const { data, isLoading, isError, error } = useInfracciones()
  const createInfraccion = useCreateInfraccion()
  const updateInfraccion = useUpdateInfraccion()
  const deleteInfraccion = useDeleteInfraccion()
  const toggleVigencia = useToggleVigenciaInfraccion()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInfraccion, setEditingInfraccion] = useState<Infraccion | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    articulo_codigo: '',
    tipo_sancion: 'MONETARIA' as Infraccion['tipo_sancion'],
    valor_multa: 0,
    aplica_descuento: false,
    vigente: true,
  })

  // Set form data when editing an existing infraccion
  useEffect(() => {
    if (editingInfraccion) {
      setFormData({
        codigo: editingInfraccion.codigo,
        descripcion: editingInfraccion.descripcion,
        articulo_codigo: editingInfraccion.articulo_codigo,
        tipo_sancion: editingInfraccion.tipo_sancion,
        valor_multa: editingInfraccion.valor_multa,
        aplica_descuento: editingInfraccion.aplica_descuento,
        vigente: editingInfraccion.vigente,
      })
    } else {
      setFormData({
        codigo: '',
        descripcion: '',
        articulo_codigo: '',
        tipo_sancion: 'MONETARIA',
        valor_multa: 0,
        aplica_descuento: false,
        vigente: true,
      })
    }
  }, [editingInfraccion])

  const handleOpenModal = (infraccion?: Infraccion) => {
    setEditingInfraccion(infraccion || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInfraccion(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingInfraccion) {
        await updateInfraccion.mutateAsync({ id: editingInfraccion.infraccion_id, data: formData })
      } else {
        await createInfraccion.mutateAsync(formData)
      }
      handleCloseModal()
    } catch (err) {
      console.error('Error saving infraccion:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta infracción?')) {
      try {
        await deleteInfraccion.mutateAsync(id)
      } catch (err) {
        console.error('Error deleting:', err)
      }
    }
  }

  const handleToggleVigencia = async (id: string) => {
    try {
      await toggleVigencia.mutateAsync(id)
    } catch (err) {
      console.error('Error toggling vigencia:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            Módulo
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Infracciones
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Catálogo general de infracciones de tránsito registradas.
          </p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-amber-500/30"
        >
          <Plus size={18} />
          Nueva Infracción
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar infracciones:{' '}
            {error instanceof Error ? error.message : 'desconocido'}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Código</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Descripción</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Artículo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo sanción</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor multa</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vigencia</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {data?.map((infraccion) => (
                <tr
                  key={infraccion.infraccion_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {infraccion.codigo}
                  </td>
                  <td className="px-4 py-3 max-w-[240px] text-slate-700 dark:text-slate-300">
                    {infraccion.descripcion}
                    {infraccion.aplica_descuento && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Descuento
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {infraccion.articulo_codigo}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoSancionStyles[infraccion.tipo_sancion] ?? 'bg-slate-100 text-slate-600'}`}>
                      {infraccion.tipo_sancion.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(infraccion.valor_multa)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleVigencia(infraccion.infraccion_id)}
                      disabled={toggleVigencia.isPending}
                      className="transition opacity-90 hover:opacity-100 disabled:opacity-50"
                    >
                      {infraccion.vigente ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                          Vigente
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                          Inactiva
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(infraccion)}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-xs bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(infraccion.infraccion_id)}
                        disabled={deleteInfraccion.isPending}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && data?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No hay infracciones registradas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingInfraccion ? 'Editar Infracción' : 'Nueva Infracción'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Código</label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    value={formData.codigo}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.g. C02"
                  />
                </div>
                <div>
                  <label className={labelClass}>Artículo</label>
                  <input
                    type="text"
                    name="articulo_codigo"
                    required
                    value={formData.articulo_codigo}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.g. Art 131"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  name="descripcion"
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={handleFormChange}
                  className={inputClass}
                  placeholder="Detalle de la infracción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de Sanción</label>
                  <select
                    name="tipo_sancion"
                    required
                    value={formData.tipo_sancion}
                    onChange={handleFormChange}
                    className={inputClass}
                  >
                    <option value="MONETARIA">Monetaria</option>
                    <option value="SUSPENSION_LICENCIA">Suspensión Licencia</option>
                    <option value="INMOVILIZACION">Inmovilización</option>
                    <option value="MIXTA">Mixta</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Valor Multa ($)</label>
                  <input
                    type="number"
                    name="valor_multa"
                    required
                    min={0}
                    value={formData.valor_multa}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="aplica_descuento"
                    checked={formData.aplica_descuento}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-amber-500"
                  />
                  Aplica Descuento
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="vigente"
                    checked={formData.vigente}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-amber-500"
                  />
                  Vigente
                </label>
              </div>

              {(createInfraccion.isError || updateInfraccion.isError) && (
                <div className="rounded border border-red-200 bg-red-50 p-3 mt-4">
                  <p className="text-sm font-medium text-red-700">
                    Ocurrió un error al guardar. Verifica los datos e intenta de nuevo.
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createInfraccion.isPending || updateInfraccion.isPending}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-amber-500/30 disabled:opacity-50"
                >
                  {createInfraccion.isPending || updateInfraccion.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfraccionesList