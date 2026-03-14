import { Menu, Moon, Sun, UserCircle2, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface TopbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onToggleMobileMenu: () => void
}

const roleColors: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  agente: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  supervisor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

function Topbar({ theme, onToggleTheme, onToggleMobileMenu }: TopbarProps) {
  const { user, logout } = useAuth()

  const rolColor = roleColors[user?.rol ?? ''] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      {/* Izquierda */}
      <div className="flex items-center gap-3">
        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
            Panel administrativo
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Gestión integral del sistema SIMCOMP
          </p>
        </div>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle tema */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span className="hidden sm:inline text-xs">
            {theme === 'light' ? 'Oscuro' : 'Claro'}
          </span>
        </button>

        {/* Usuario */}
        <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-slate-800 dark:bg-slate-800/50">
          <UserCircle2 size={18} className="text-slate-400 dark:text-slate-500" />
          <div className="text-sm leading-tight">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.username ?? 'Usuario'}
            </p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rolColor}`}>
              {user?.rol ?? '—'}
            </span>
          </div>
        </div>

        {/* Salir */}
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:border-red-800 dark:hover:text-red-400"
          aria-label="Cerrar sesión"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline text-xs">Salir</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar