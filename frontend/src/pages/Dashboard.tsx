import { Link } from 'react-router-dom'
import { 
  Users, Car, FileWarning, ClipboardList, ArrowRight, 
  UserCog, BarChart3, Activity, Gauge, Server, Cpu 
} from 'lucide-react'
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
  isExternal?: boolean
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

const reportesCard: DashboardCard = {
  title: 'Reportes',
  description: 'Estadísticas, exportación masiva e importación de datos.',
  to: '/reportes',
  icon: BarChart3,
  gradient: 'from-indigo-500 to-violet-600',
  shadow: 'shadow-indigo-500/20',
  bg: 'bg-indigo-50 dark:bg-indigo-950/20',
  border: 'border-indigo-200 dark:border-indigo-900/40',
  roles: ['admin', 'supervisor'],
}

const infraCards: DashboardCard[] = [
  {
    title: 'Prometheus',
    description: 'Monitoreo de métricas y alertas del clúster.',
    to: `http://${window.location.hostname}:9090`,
    icon: Activity,
    gradient: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-500/20',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/40',
    roles: ['admin'],
    isExternal: true,
  },
  {
    title: 'Grafana',
    description: 'Visualización de dashboards de infraestructura.',
    to: `http://${window.location.hostname}:3000`,
    icon: Gauge,
    gradient: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/20',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900/40',
    roles: ['admin', 'supervisor'],
    isExternal: true,
  },
  {
    title: 'Spark Master',
    description: 'Gestión de trabajos de análisis distribuido.',
    to: `http://${window.location.hostname}:8010`,
    icon: Server,
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-500/20',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    border: 'border-cyan-200 dark:border-cyan-900/40',
    roles: ['admin', 'supervisor'],
    isExternal: true,
  },
  {
    title: 'Glances',
    description: 'Estado del sistema en tiempo real (agentes).',
    to: `http://${window.location.hostname}:61208`,
    icon: Cpu,
    gradient: 'from-lime-500 to-green-600',
    shadow: 'shadow-lime-500/20',
    bg: 'bg-lime-50 dark:bg-lime-950/20',
    border: 'border-lime-200 dark:border-lime-900/40',
    roles: ['admin', 'supervisor'],
    isExternal: true,
  },
]

import { DashboardCharts } from '../components/DashboardCharts'

function Dashboard() {
  const { user } = useAuth()
  const allCards = [...baseCards, adminCard, reportesCard]
  const cards = allCards.filter(card => user && card.roles.includes(user.rol))
  const filteredInfra = infraCards.filter(card => user && card.roles.includes(user.rol))
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  const CardWrapper = ({ card, children }: { card: DashboardCard; children: React.ReactNode }) => {
    const isDisabled = card.isExternal && isLocal
    if (card.isExternal) {
      return (
        <a
          href={isDisabled ? '#' : card.to}
          target={isDisabled ? undefined : "_blank"}
          rel="noopener noreferrer"
          onClick={(e) => isDisabled && e.preventDefault()}
          className={`group relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${card.shadow} ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
        >
          {children}
          {isDisabled && (
            <div className="absolute top-2 right-2 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              LOCAL
            </div>
          )}
        </a>
      )
    }
    return (
      <Link
        to={card.to}
        className={`group relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${card.shadow}`}
      >
        {children}
      </Link>
    )
  }

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
              <CardWrapper key={card.title} card={card}>
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
                  {card.isExternal ? 'Abrir herramienta' : 'Ir al módulo'} <ArrowRight size={14} />
                </div>
              </CardWrapper>
            )
          })}
        </div>
      </div>

      {/* Infraestructura (Solo Admin/Supervisor) */}
      {filteredInfra.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Infraestructura y Control
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredInfra.map((card) => {
              const Icon = card.icon
              return (
                <CardWrapper key={card.title} card={card}>
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
                    Abrir herramienta <ArrowRight size={14} />
                  </div>
                </CardWrapper>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard