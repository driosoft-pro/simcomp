import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, X, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { useUsuarios, useCreateUsuario } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'
import { useSearch } from '../../hooks/useSearch'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../context/ToastContext'
import SearchInput from '../../components/ui/SearchInput'
import Pagination from '../../components/ui/Pagination'
import type { UserRole } from '../../types'
import axios from 'axios'

const rolBadge: Record<string, string> = {
  admin:
    'bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/40',
  supervisor:
    'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700/40',
  agente:
    'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/40',
  ciudadano:
    'bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700/40',
}

const estadoBadge: Record<string, string> = {
  activo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactivo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const ROLES: UserRole[] = ['admin', 'supervisor', 'agente', 'ciudadano']

interface FormState {
  username: string
  email: string
  password: string
  rol: UserRole
}

const emptyForm: FormState = { username: '', email: '', password: '', rol: 'agente' }

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message
    return typeof msg === 'string' ? msg : 'Error al crear usuario'
  }
  return err instanceof Error ? err.message : 'Error al crear usuario'
}

import { getPersonaByEmail } from '../../api/personas.api'
import PersonaForm from '../../components/forms/PersonaForm'
import { formatDateShort } from '../../utils/formatters'

function UsuariosList() {
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const { user } = useAuth()
  const createMutation = useCreateUsuario()
  const { addToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [showPersonaForm, setShowPersonaForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const isAdmin = user?.rol === 'admin'
  const isSupervisor = user?.rol === 'supervisor'
  const searchedData = useSearch(data, searchTerm, ['username', 'email', 'rol'])

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(searchedData)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'email') {
      setEmailVerified(null)
      setFormError(null)
    }
  }

  async function handleVerifyEmail() {
    if (!form.email || !form.email.includes('@')) {
      setFormError('Por favor ingrese un email válido')
      return
    }

    setIsVerifyingEmail(true)
    setFormError(null)
    try {
      const persona = await getPersonaByEmail(form.email)
      if (persona) {
        setEmailVerified(true)
        setFormError(null)
        // Autofill username and password with persona's document number
        setForm(prev => ({ 
          ...prev, 
          username: persona.numero_documento,
          password: persona.numero_documento 
        }))
      } else {
        setEmailVerified(false)
        setFormError('No se encontró una persona con este email. Puede registrarla primero.')
      }
    } catch (err) {
      setEmailVerified(false)
      setFormError('Error al verificar el email. Intente de nuevo.')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (emailVerified !== true) {
      setFormError('Debe verificar que el email pertenezca a una persona registrada.')
      return
    }

    try {
      await createMutation.mutateAsync(form)
      setForm(emptyForm)
      setEmailVerified(null)
      setShowForm(false)
      addToast('Usuario creado con éxito', 'success')
    } catch (err) {
      setFormError(extractError(err))
      addToast(extractError(err), 'error')
    }
  }

  const handlePersonaSuccess = () => {
    setShowPersonaForm(false)
    setShowForm(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            Administración
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Usuarios
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gestión de cuentas de acceso al sistema.
          </p>
        </div>
        {(isAdmin || isSupervisor) && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={searchTerm} onChange={(val) => setSearchTerm(val)} placeholder="Buscar por username, email, rol..." />
      </div>

      {/* Formulario nuevo usuario (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crear nuevo usuario</p>
                <p className="text-sm text-slate-500 mt-1">El usuario debe estar previamente registrado como persona.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                aria-label="Cerrar formulario"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoFocus
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                        emailVerified === true
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                          : emailVerified === false
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                          : 'border-slate-200 bg-slate-50 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800'
                      }`}
                    />
                    {emailVerified === true && (
                      <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail || !form.email}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    {isVerifyingEmail ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <Search size={16} />
                    )}
                    Validar
                  </button>
                </div>
                
                {emailVerified === true && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-left-1">
                    ✓ Persona encontrada en el sistema
                  </p>
                )}

                {emailVerified === false && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="shrink-0" />
                      <p>La persona no está registrada en el sistema.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPersonaForm(true)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                    >
                      <UserPlus size={14} /> {isSupervisor ? 'Registrar Agente' : 'Registrar Infractor'}
                    </button>
                  </div>
                )}
              </div>

              {formError && emailVerified === null && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm dark:border-red-900/40 dark:bg-red-950/20 animate-in fade-in duration-200">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{formError}</p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="rol">
                    Rol del Usuario
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                    disabled={isSupervisor}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20 disabled:opacity-60"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-700 hover:-translate-y-0.5 disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-600"
              >
                {createMutation.isPending ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal para Crear Persona */}
      {showPersonaForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isSupervisor ? 'Registrar Nuevo Agente' : 'Registrar Nueva Persona'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isSupervisor 
                    ? 'Se creará la persona y automáticamente su cuenta con rol agente.' 
                    : 'Automáticamente se creará un usuario asociado.'}
                </p>
              </div>
              <button
                onClick={() => setShowPersonaForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <PersonaForm 
              onSuccess={handlePersonaSuccess}
              onCancel={() => setShowPersonaForm(false)}
              submitLabel={isSupervisor ? 'Registrar Agente' : 'Registrar Persona'}
            />
          </div>
        </div>
      )}

      {/* Error listado */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar usuarios: {error instanceof Error ? error.message : 'desconocido'}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Username
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Rol
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estado
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fechas (C: Creado, A: Act.)
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {paginatedItems?.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {usuario.username}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        rolBadge[usuario.rol] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        estadoBadge[usuario.estado] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">C:</span> {formatDateShort(usuario.created_at)}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">A:</span> {formatDateShort(usuario.updated_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/usuarios/${usuario.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && paginatedItems?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No hay usuarios registrados.</p>
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
    </div>
  )
}

export default UsuariosList
