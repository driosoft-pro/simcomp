import { NavLink } from 'react-router-dom'
import {
  Car,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  Users,
  UserCog,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { APP_VERSION } from '../../utils/constants'
import type { UserRole } from '../../types'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  roles: UserRole[]
  color: string
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
    color: 'text-blue-400',
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: UserCog,
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
    color: 'text-rose-400',
  },
  {
    label: 'Personas',
    path: '/personas',
    icon: Users,
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
    color: 'text-violet-400',
  },
  {
    label: 'Automotores',
    path: '/automotores',
    icon: Car,
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
    color: 'text-sky-400',
  },
  {
    label: 'Infracciones',
    path: '/infracciones',
    icon: FileWarning,
    roles: ['admin', 'agente', 'supervisor'],
    color: 'text-amber-400',
  },
  {
    label: 'Comparendos',
    path: '/comparendos',
    icon: ClipboardList,
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
    color: 'text-emerald-400',
  },
]


interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

function Sidebar({ 
  onClose, 
  isMobile = false, 
  isMinimized = false, 
  onToggleMinimize 
}: SidebarProps) {
  const { user } = useAuth()

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.rol) : false,
  )

  return (
    <aside 
      className={`flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo / Header */}
      <div className={`flex items-center border-b border-slate-800 px-5 py-5 ${isMinimized ? 'justify-center' : 'justify-between'}`}>
        <button 
          onClick={onToggleMinimize}
          className="group flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
          title={isMinimized ? "Expandir" : "Minimizar"}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {!isMinimized && (
            <div className="animate-fade-in whitespace-nowrap overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                SIMCOMP
              </p>
              <p className="text-sm font-semibold text-slate-200 text-left">Tránsito</p>
            </div>
          )}
        </button>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
        {!isMinimized && (
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 animate-fade-in">
            Menú principal
          </p>
        )}
        {filteredItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={isMobile && onClose ? onClose : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isMinimized ? 'justify-center w-12 mx-auto' : 'gap-3'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`
              }
              title={isMinimized ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`${isActive ? 'text-white' : item.color} shrink-0`}
                  />
                  {!isMinimized && (
                    <span className="animate-fade-in whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Pie del sidebar */}
      <div className="border-t border-slate-800 px-4 py-3">
        <p className="text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} SIMCOMP v{APP_VERSION}
        </p>
      </div>
    </aside>
  )
}

export default Sidebar