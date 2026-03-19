import { Link } from 'react-router-dom'
import { Users, Car, FileWarning, ClipboardList, ArrowRight, UserCog } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'

interface DashboardCard {
  title: string
  description: string
  to: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  gradient: string
  shadow: string
  bg: string
  border: string
  roles: UserRole[]
}

const baseCards: DashboardCard[] = [
  {
    title: 'Personas',
    description: 'Consulta y gestión de ciudadanos registrados.',
    to: '/personas',
    icon: Users,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900/40',
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
  },
  {
    title: 'Automotores',
    description: 'Consulta de automotores y propietarios asociados.',
    to: '/automotores',
    icon: Car,
    gradient: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-500/20',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-200 dark:border-sky-900/40',
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
  },
  {
    title: 'Infracciones',
    description: 'Catálogo de infracciones y valores de multa.',
    to: '/infracciones',
    icon: FileWarning,
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    roles: ['admin', 'agente', 'supervisor'],
  },
  {
    title: 'Comparendos',
    description: 'Registro, consulta y seguimiento de comparendos.',
    to: '/comparendos',
    icon: ClipboardList,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-900/40',
    roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
  },
]

const adminCard: DashboardCard = {
  title: 'Usuarios',
  description: 'Administración de cuentas y roles del sistema.',
  to: '/usuarios',
  icon: UserCog,
  gradient: 'from-rose-500 to-pink-600',
  shadow: 'shadow-rose-500/20',
  bg: 'bg-rose-50 dark:bg-rose-950/20',
  border: 'border-rose-200 dark:border-rose-900/40',
  roles: ['admin', 'agente', 'supervisor', 'ciudadano'],
}

import { DashboardCharts } from '../components/DashboardCharts'

function Dashboard() {
  const { user } = useAuth()
  const allCards = [...baseCards, adminCard]
  const cards = allCards.filter(card => user && card.roles.includes(user.rol))

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
            Panel principal
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard SIMCOMP
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Visualiza el estado del sistema y accede a los módulos de gestión.
          </p>
        </div>
      </div>

      {/* Gráficas Real-time */}
      {user?.rol !== 'ciudadano' && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DashboardCharts />
        </section>
      )}

      {/* Módulos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Módulos del Sistema
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.to}
                className={`group relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${card.shadow}`}
              >
                {/* Icono */}
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>

                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>

                {/* Flecha */}
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  Ir al módulo <ArrowRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard