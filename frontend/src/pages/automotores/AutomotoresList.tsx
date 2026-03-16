import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, AlertCircle } from 'lucide-react'
import {
  useAutomotores,
  useCreateAutomotor,
  useUpdateAutomotor,
  useDeleteAutomotor,
  useToggleEstadoAutomotor,
} from '../../hooks/useAutomotores'
import type { Automotor } from '../../types'

const estadoStyles: Record<Automotor['estado'], string> = {
  LEGAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  REPORTADO_ROBO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  RECUPERADO: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  EMBARGADO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const tipoLabel: Record<string, string> = {
  MOTO: '🏍️ Moto',
  CARRO: '🚗 Carro',
  BUS: '🚌 Bus',
  BUSETA: '🚐 Buseta',
  CAMION: '🚛 Camión',
  TRACTOMULA: '🚚 Tractomula',
  CUATRIMOTO: '🛵 Cuatrimoto',
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300'

function LoadingRow() {
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  )
}

function AutomotoresList() {
  const { data, isLoading, isError, error } = useAutomotores()
  const createAutomotor = useCreateAutomotor()
  const updateAutomotor = useUpdateAutomotor()
  const deleteAutomotor = useDeleteAutomotor()
  const toggleEstado = useToggleEstadoAutomotor()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAutomotor, setEditingAutomotor] = useState<Automotor | null>(null)

  const [formData, setFormData] = useState({
    placa: '',
    tipo: 'CARRO' as Automotor['tipo'],
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    cilindraje: 0,
    estado: 'LEGAL' as Automotor['estado'],
    propietario_id: '',
  })

  useEffect(() => {
    if (editingAutomotor) {
      setFormData({
        placa: editingAutomotor.placa,
        tipo: editingAutomotor.tipo,
        marca: editingAutomotor.marca,
        modelo: editingAutomotor.modelo,
        anio: editingAutomotor.anio,
        color: editingAutomotor.color,
        cilindraje: editingAutomotor.cilindraje,
        estado: editingAutomotor.estado,
        propietario_id: editingAutomotor.propietario_id,
      })
    } else {
      setFormData({
        placa: '',
        tipo: 'CARRO',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        color: '',
        cilindraje: 0,
        estado: 'LEGAL',
        propietario_id: '',
      })
    }
  }, [editingAutomotor])

  const handleOpenModal = (automotor?: Automotor) => {
    setEditingAutomotor(automotor || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAutomotor(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAutomotor) {
        await updateAutomotor.mutateAsync({ id: editingAutomotor.automotor_id, data: formData })
      } else {
        await createAutomotor.mutateAsync(formData)
      }
      handleCloseModal()
    } catch (err) {
      console.error('Error saving automotor:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este automotor?')) {
      try {
        await deleteAutomotor.mutateAsync(id)
      } catch (err) {
        console.error('Error deleting automotor:', err)
      }
    }
  }

  const handleToggleEstado = async (id: string) => {
    try {
      await toggleEstado.mutateAsync(id)
    } catch (err) {
      console.error('Error toggling estado:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Módulo
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Automotores
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Listado general de automotores registrados en el sistema.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-sky-500/30"
        >
          <Plus size={18} />
          Nuevo Automotor
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar automotores:{' '}
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Placa</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Marca / Modelo</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Año</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <LoadingRow key={i} />)}
              {data?.map((automotor) => (
                <tr
                  key={automotor.automotor_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {automotor.placa}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {tipoLabel[automotor.tipo] ?? automotor.tipo}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {automotor.marca} {automotor.modelo}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{automotor.anio}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstado(automotor.automotor_id)}
                      disabled={toggleEstado.isPending}
                      className="transition opacity-90 hover:opacity-100 disabled:opacity-50"
                      title="Cambiar estado"
                    >
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-current/10 ${estadoStyles[automotor.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                        {automotor.estado.replace(/_/g, ' ')}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/automotores/${automotor.automotor_id}`}
                        className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleOpenModal(automotor)}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-xs bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(automotor.automotor_id)}
                        disabled={deleteAutomotor.isPending}
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
              <p className="text-sm text-slate-400 dark:text-slate-500">No hay automotores registrados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingAutomotor ? 'Editar Automotor' : 'Nuevo Automotor'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className={labelClass}>Placa</label>
                  <input
                    type="text"
                    name="placa"
                    required
                    value={formData.placa}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.g. ABC123"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className={labelClass}>Tipo</label>
                  <select
                    name="tipo"
                    required
                    value={formData.tipo}
                    onChange={handleFormChange}
                    className={inputClass}
                  >
                    <option value="MOTO">Moto</option>
                    <option value="CARRO">Carro</option>
                    <option value="BUS">Bus</option>
                    <option value="BUSETA">Buseta</option>
                    <option value="CAMION">Camión</option>
                    <option value="TRACTOMULA">Tractomula</option>
                    <option value="CUATRIMOTO">Cuatrimoto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Marca</label>
                  <input
                    type="text"
                    name="marca"
                    required
                    value={formData.marca}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.g. Toyota"
                  />
                </div>
                <div>
                  <label className={labelClass}>Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    required
                    value={formData.modelo}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.g. Corolla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Año</label>
                  <input
                    type="number"
                    name="anio"
                    required
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    value={formData.anio}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Color</label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Cilindraje</label>
                  <input
                    type="number"
                    name="cilindraje"
                    required
                    min={0}
                    value={formData.cilindraje}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Estado</label>
                  <select
                    name="estado"
                    required
                    value={formData.estado}
                    onChange={handleFormChange}
                    className={inputClass}
                  >
                    <option value="LEGAL">Legal</option>
                    <option value="REPORTADO_ROBO">Reportado Robo</option>
                    <option value="RECUPERADO">Recuperado</option>
                    <option value="EMBARGADO">Embargado</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Propietario ID <span className="font-normal text-slate-400 text-xs">(UUID)</span>
                  </label>
                  <input
                    type="text"
                    name="propietario_id"
                    required
                    value={formData.propietario_id}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>

              {(createAutomotor.isError || updateAutomotor.isError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 mt-4">
                  <p className="text-sm font-medium text-red-700">
                    Ocurrió un error al guardar. Verifica los datos e intenta de nuevo.
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAutomotor.isPending || updateAutomotor.isPending}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-sky-500/30 disabled:opacity-50"
                >
                  {createAutomotor.isPending || updateAutomotor.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutomotoresList
