import React, { useState, useEffect } from 'react'
import { Save, User, Mail, MapPin, Phone, Lock, Hash, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUpdateUsuario } from '../../hooks/useUsuarios'
import { usePersonaByEmail, useUpdatePersona } from '../../hooks/usePersonas'
import type { UpdateUsuarioPayload, UpdatePersonaPayload } from '../../types'
import axios from 'axios'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.response?.data?.error || err.message
  }
  return err instanceof Error ? err.message : 'Error desconocido'
}

function Perfil() {
  // user ya tiene id, email, username, rol desde localStorage — sin llamada a la API
  const { user } = useAuth()

  // Solo necesitamos cargar la persona; el usuario ya lo tenemos en el contexto
  const { data: persona, isLoading: loadingPersona } = usePersonaByEmail(user?.email || '')

  const updateUsuarioMutation = useUpdateUsuario(user?.id || '')
  const updatePersonaMutation = useUpdatePersona()

  const [formUsuario, setFormUsuario] = useState<UpdateUsuarioPayload>({})
  const [formPersona, setFormPersona] = useState<UpdatePersonaPayload>({})
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Inicializar el formulario de usuario desde el contexto (sin esperar API)
  useEffect(() => {
    if (user) {
      setFormUsuario({
        username: user.username,
        email: user.email,
        rol: user.rol,
      })
    }
  }, [user])

  useEffect(() => {
    if (persona) {
      setFormPersona({
        tipo_documento: persona.tipo_documento,
        numero_documento: persona.numero_documento,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        fecha_nacimiento: persona.fecha_nacimiento,
        genero: persona.genero,
        direccion: persona.direccion,
        telefono: persona.telefono,
        email: persona.email,
      })
    }
  }, [persona])

  const rol = user?.rol || 'ciudadano'
  const isAdmin = rol === 'admin'
  const isAgente = rol === 'agente'
  const isSupervisor = rol === 'supervisor'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      // 1. Update User Data
      const userPayload: UpdateUsuarioPayload = { ...formUsuario }
      if (password) userPayload.password = password

      await updateUsuarioMutation.mutateAsync(userPayload)

      // 2. Update Persona Data (solo si existe)
      if (persona?.persona_id) {
        await updatePersonaMutation.mutateAsync({
          id: persona.persona_id,
          data: formPersona
        })
      }

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(extractError(err))
    }
  }

  // Field restrictions logic
  const canEditUsername = isAdmin || isAgente
  const canEditEmail = true
  const canEditAddress = true
  const canEditNames = isAdmin || isAgente || isSupervisor
  const canEditDocument = isAdmin

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Mi Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tu información personal y de cuenta</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          isAdmin ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
          isSupervisor ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          isAgente ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {rol}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 flex items-center gap-3">
            <Shield size={18} />
            <span className="text-sm font-medium">Perfil actualizado correctamente</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 flex items-center gap-3">
            <Shield size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information — siempre disponible desde el contexto */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-blue-500" size={18} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Información de Cuenta</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Usuario</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    disabled={!canEditUsername}
                    value={formUsuario.username || ''}
                    onChange={(e) => setFormUsuario({...formUsuario, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    disabled={!canEditEmail}
                    value={formPersona.email || formUsuario.email || ''}
                    onChange={(e) => {
                      setFormPersona({...formPersona, email: e.target.value})
                      setFormUsuario({...formUsuario, email: e.target.value})
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information — skeleton mientras carga */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-violet-500" size={18} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Información Personal</h2>
              {loadingPersona && (
                <div className="ml-auto animate-spin rounded-full h-4 w-4 border-2 border-violet-300 border-t-violet-600" />
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nombres</label>
                  <input
                    type="text"
                    disabled={!canEditNames || loadingPersona}
                    value={formPersona.nombres || ''}
                    onChange={(e) => setFormPersona({...formPersona, nombres: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Apellidos</label>
                  <input
                    type="text"
                    disabled={!canEditNames || loadingPersona}
                    value={formPersona.apellidos || ''}
                    onChange={(e) => setFormPersona({...formPersona, apellidos: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Dirección</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    disabled={!canEditAddress || loadingPersona}
                    value={formPersona.direccion || ''}
                    onChange={(e) => setFormPersona({...formPersona, direccion: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Teléfono</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    disabled={loadingPersona}
                    value={formPersona.telefono || ''}
                    onChange={(e) => setFormPersona({...formPersona, telefono: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="text-amber-500" size={18} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Seguridad</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Dejar en blanco para no cambiar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Repita la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="text-emerald-500" size={18} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Identificación</h2>
              {loadingPersona && (
                <div className="ml-auto animate-spin rounded-full h-4 w-4 border-2 border-emerald-300 border-t-emerald-600" />
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Tipo</label>
                  <select
                    disabled={!canEditDocument || loadingPersona}
                    value={formPersona.tipo_documento || ''}
                    onChange={(e) => setFormPersona({...formPersona, tipo_documento: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Número</label>
                  <input
                    type="text"
                    disabled={!canEditDocument || loadingPersona}
                    value={formPersona.numero_documento || ''}
                    onChange={(e) => setFormPersona({...formPersona, numero_documento: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic font-medium leading-tight">
                * El cambio de documento requiere autorización administrativa y afecta el nombre de usuario y licencia.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updateUsuarioMutation.isPending || updatePersonaMutation.isPending || loadingPersona}
            className="group relative flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {updateUsuarioMutation.isPending || updatePersonaMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                Guardando...
              </span>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Perfil
