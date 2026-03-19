import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, X } from 'lucide-react'
import { useUsuarios, useCreateUsuario } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'
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

function UsuariosList() {
  const { data, isLoading, isError, error } = useUsuarios()
  const { user } = useAuth()
  const createMutation = useCreateUsuario()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const isCiudadano = user?.rol === 'ciudadano'
  const filteredData = data

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await createMutation.mutateAsync(form)
      setForm(emptyForm)
      setShowForm(false)
    } catch (err) {
      setFormError(extractError(err))
    }
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
        {!isCiudadano && user?.rol !== 'supervisor' && (
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

      {/* Formulario nuevo usuario (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Crear nuevo usuario</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{formError}</p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
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
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
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
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="rol">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-600"
              >
                {createMutation.isPending ? 'Guardando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
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
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {filteredData?.map((usuario) => (
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

          {!isLoading && filteredData?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No hay usuarios registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsuariosList
