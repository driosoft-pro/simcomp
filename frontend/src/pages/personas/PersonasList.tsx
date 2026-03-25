import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { usePersonas } from '../../hooks/usePersonas'
import { useAuth } from '../../hooks/useAuth'
import { useSearch } from '../../hooks/useSearch'
import { usePagination } from '../../hooks/usePagination'
import SearchInput from '../../components/ui/SearchInput'
import DataFilters from '../../components/ui/DataFilters'
import type { FilterOption } from '../../components/ui/DataFilters'
import Pagination from '../../components/ui/Pagination'
import PersonaForm from '../../components/forms/PersonaForm'
import { formatDateShort } from '../../utils/formatters'

const PERSONA_FILTER_OPTIONS: FilterOption[] = [
  { 
    label: 'Tipo Documento', 
    key: 'tipo_documento', 
    type: 'select', 
    options: [
      { label: 'Cédula de Ciudadanía', value: 'CC' },
      { label: 'Cédula de Extranjería', value: 'CE' },
      { label: 'Pasaporte', value: 'PASAPORTE' },
      { label: 'Tarjeta de Identidad', value: 'TI' },
    ] 
  },
  { 
    label: 'Género', 
    key: 'genero', 
    type: 'select', 
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Femenino', value: 'F' },
      { label: 'Otro', value: 'O' },
    ] 
  },
]

const tipoDocBadge: Record<string, string> = {
  CC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  CE: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  PASAPORTE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

function PersonasList() {
  const { data, isLoading, isError, error } = usePersonas()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  const isCiudadano = user?.rol === 'ciudadano'
  let roleFilteredData = isCiudadano
    ? data?.filter((p) => p.numero_documento?.replace('cc.', '') === user?.username?.replace('cc.', ''))
    : data

  // Apply Field Filters
  if (roleFilteredData && Object.keys(filters).length > 0) {
    roleFilteredData = roleFilteredData.filter((item: any) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === '') return true
        return String(item[key]) === String(value)
      })
    })
  }

  const searchedData = useSearch(roleFilteredData, searchTerm, ['nombres', 'apellidos', 'numero_documento', 'email', 'telefono'])

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(searchedData)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            Módulo
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Personas
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Listado general de personas registradas en el sistema.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold dark:bg-slate-800">
            <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : isError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-slate-600 dark:text-slate-400">
              Servicio: {isLoading ? 'Cargando...' : isError ? 'Desconectado' : 'En línea'}
            </span>
          </div>
          {user?.rol !== 'ciudadano' && user?.rol !== 'supervisor' && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              <Plus size={18} />
              Registrar Persona
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchInput value={searchTerm} onChange={(val) => setSearchTerm(val)} placeholder="Buscar por nombre, documento, email..." />
        <DataFilters 
          options={PERSONA_FILTER_OPTIONS} 
          onFilter={(f) => setFilters(f)} 
          onClear={() => setFilters({})} 
        />
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar personas:{' '}
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo doc.</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">N° documento</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Teléfono</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fechas (C: Creado, A: Act.)</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {paginatedItems?.map((persona) => (
                <tr
                  key={persona.persona_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {persona.nombres} {persona.apellidos}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tipoDocBadge[persona.tipo_documento] ?? 'bg-slate-100 text-slate-600'}`}>
                      {persona.tipo_documento}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {persona.numero_documento}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {persona.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {persona.telefono || '—'}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">C:</span> {formatDateShort(persona.created_at)}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">A:</span> {formatDateShort(persona.updated_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/personas/${persona.persona_id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && paginatedItems?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No hay personas registradas.
              </p>
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/80">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Registrar Nueva Persona
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <PersonaForm 
                onSuccess={() => setShowForm(false)} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonasList