import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LockKeyhole, UserCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { APP_VERSION } from '../utils/constants'

function Login() {
  const { login, isAuthenticated } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login({ identifier, password })
    } catch {
      setErrorMessage('Credenciales inválidas o servicio no disponible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Orbes de fondo decorativos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl" />
      </div>

      {/* Tarjeta */}
      <div className="animate-fade-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
            SIMCOMP
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sistema de gestión de comparendos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo usuario */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Usuario o correo
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-blue-500/60 focus-within:bg-white/10">
              <UserCircle2 size={18} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                placeholder="admin@simcomp.co"
                required
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-blue-500/60 focus-within:bg-white/10">
              <LockKeyhole size={18} className="shrink-0 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SIMCOMP v{APP_VERSION} · Sistema de Comparendos de Tránsito
        </p>
      </div>
    </div>
  )
}

export default Login