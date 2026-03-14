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
    roles: ['admin', 'supervisor'],
    color: 'text-blue-400',
  },
  {
    label: 'Personas',
    path: '/personas',
    icon: Users,
    roles: ['admin', 'agente', 'supervisor'],
    color: 'text-violet-400',
  },
  {
    label: 'Automotores',
    path: '/automotores',
    icon: Car,
    roles: ['admin', 'agente', 'supervisor'],
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
    roles: ['admin', 'agente', 'supervisor'],
    color: 'text-emerald-400',
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: UserCog,
    roles: ['admin'],
    color: 'text-rose-400',
  },
]

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const { user } = useAuth()

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.rol) : false,
  )

  return (
    <aside className="flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800">
      {/* Logo / Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              SIMCOMP
            </p>
            <p className="text-sm font-semibold text-slate-200">Tránsito</p>
          </div>
        </div>
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
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menú principal
        </p>
        {filteredItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={isMobile && onClose ? onClose : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/80 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-white' : item.color}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Pie del sidebar */}
      <div className="border-t border-slate-800 px-4 py-3">
        <p className="text-center text-[10px] text-slate-600">
          © 2026 SIMCOMP v1.0
        </p>
      </div>
    </aside>
  )
}

export default Sidebar