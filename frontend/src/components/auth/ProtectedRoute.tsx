import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        Cargando sesión...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">Acceso denegado</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute