import { useState, useRef, useEffect } from 'react'
import { Menu, Moon, Sun, UserCircle2, LogOut, ChevronDown } from 'lucide-react'
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const rolColor = roleColors[user?.rol ?? ''] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Toggle tema */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* Dropdown Usuario */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-2 rounded-xl border p-1 pr-3 transition-all duration-200 ${
              isUserMenuOpen 
                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-400">
              <UserCircle2 size={20} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.username ?? 'Usuario'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                {user?.rol ?? '—'}
              </p>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Menu Desplegable */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-scale-in dark:border-slate-800 dark:bg-slate-900">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cuenta</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${rolColor}`}>
                    {user?.rol}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{user?.username}@simcomp</span>
                </div>
              </div>
              
              <button
                onClick={() => void logout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  <LogOut size={16} />
                </div>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar