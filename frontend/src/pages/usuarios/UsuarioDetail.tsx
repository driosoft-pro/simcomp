import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Power } from 'lucide-react'
import { useUsuario, useUpdateUsuario, useCambiarEstado } from '../../hooks/useUsuarios'
import { useAuth } from '../../hooks/useAuth'
import type { UserEstado, UserRole, UpdateUsuarioPayload } from '../../types'
import axios from 'axios'

const ROLES: UserRole[] = ['admin', 'supervisor', 'agente', 'ciudadano']
const ESTADOS: UserEstado[] = ['activo', 'inactivo']

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
  activo:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/40',
  inactivo:
    'bg-slate-100 text-slate-600 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
}

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message
    return typeof msg === 'string' ? msg : 'Error desconocido'
  }
  return err instanceof Error ? err.message : 'Error desconocido'
}

function UsuarioDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: usuario, isLoading, isError, error } = useUsuario(id!)
  const updateMutation = useUpdateUsuario(id!)
  const estadoMutation = useCambiarEstado(id!)

  const [editForm, setEditForm] = useState<UpdateUsuarioPayload>({})
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState<UserEstado | ''>('')
  const [estadoError, setEstadoError] = useState<string | null>(null)
  const [estadoSuccess, setEstadoSuccess] = useState(false)

  useEffect(() => {
    if (usuario) {
      setEditForm({
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
      })
    }
  }, [usuario])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
    )
  }

  if (isError || !usuario) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Error al cargar usuario: {error instanceof Error ? error.message : 'desconocido'}
        </p>
      </div>
    )
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(false)
    try {
      await updateMutation.mutateAsync(editForm)
      setEditSuccess(true)
      setEditForm({})
    } catch (err) {
      setEditError(extractError(err))
    }
  }

  async function handleCambiarEstado(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevoEstado) return
    setEstadoError(null)
    setEstadoSuccess(false)
    try {
      await estadoMutation.mutateAsync(nuevoEstado as UserEstado)
      setEstadoSuccess(true)
      setNuevoEstado('')
    } catch (err) {
      setEstadoError(extractError(err))
    }
  }

  const isAdmin = user?.rol === 'admin'
  const isSupervisor = user?.rol === 'supervisor'
  const canChangeStatus = isAdmin || (isSupervisor && usuario?.rol === 'agente')

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <Link
          to="/usuarios"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
        >
          <ArrowLeft size={14} /> Volver a Usuarios
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
          Administración / Usuarios
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {usuario.username}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">{usuario.email}</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
              estadoBadge[usuario.estado] ?? 'bg-slate-100 text-slate-600'
            }`}
          >
            {usuario.estado}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
              rolBadge[usuario.rol] ?? 'bg-slate-100 text-slate-600'
            }`}
          >
            {usuario.rol}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tarjeta: datos actuales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Datos actuales
          </p>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: 'ID', value: usuario.id },
              { label: 'Username', value: usuario.username },
              { label: 'Email', value: usuario.email },
              { label: 'Rol', value: usuario.rol },
              { label: 'Estado', value: usuario.estado },
              {
                label: 'Creado',
                value: usuario.created_at
                  ? new Date(usuario.created_at).toLocaleString('es-CO')
                  : '—',
              },
              {
                label: 'Actualizado',
                value: usuario.updated_at
                  ? new Date(usuario.updated_at).toLocaleString('es-CO')
                  : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <dt className="w-24 shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                  {label}
                </dt>
                <dd className="break-all font-mono text-slate-700 dark:text-slate-300">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-6">
          {/* Formulario: actualizar datos (PUT) - solo admin */}
          {isAdmin && (
            <form
              onSubmit={handleUpdate}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
              <div className="flex items-center gap-2">
                <Save size={15} className="text-rose-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Actualizar datos
                </p>
              </div>

              {editSuccess && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  ✓ Usuario actualizado correctamente.
                </p>
              )}
              {editError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {editError}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    htmlFor="edit-username"
                  >
                    Username
                  </label>
                  <input
                    id="edit-username"
                    placeholder={usuario.username}
                    value={editForm.username ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, username: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    htmlFor="edit-email"
                  >
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    placeholder={usuario.email}
                    value={editForm.email ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    htmlFor="edit-rol"
                  >
                    Rol
                  </label>
                  <select
                    id="edit-rol"
                    value={editForm.rol ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, rol: e.target.value as UserRole }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                  >
                    <option value="">— sin cambio —</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={
                    updateMutation.isPending ||
                    (!editForm.username && !editForm.email && !editForm.rol)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Formulario: cambiar estado (PATCH) - admin todo, supervisor solo agentes */}
          {canChangeStatus && (
            <form
              onSubmit={handleCambiarEstado}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
              <div className="flex items-center gap-2">
                <Power size={15} className="text-amber-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Cambiar estado
                </p>
              </div>

              {estadoSuccess && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  ✓ Estado actualizado correctamente.
                </p>
              )}
              {estadoError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {estadoError}
                </p>
              )}

              <div className="flex items-end gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <label
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    htmlFor="nuevo-estado"
                  >
                    Nuevo estado
                  </label>
                  <select
                    id="nuevo-estado"
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as UserEstado)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-amber-500 dark:focus:bg-slate-800 dark:focus:ring-amber-500/20"
                  >
                    <option value="">— seleccionar —</option>
                    {ESTADOS.filter((e) => e !== usuario.estado).map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={estadoMutation.isPending || !nuevoEstado}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 hover:shadow disabled:opacity-50"
                >
                  {estadoMutation.isPending ? 'Aplicando…' : 'Aplicar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsuarioDetail
