import { useState, useMemo } from 'react'
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Zap,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Table as TableIcon,
  Terminal,
  Activity,
  AlertTriangle,
  Loader2,
  Download,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  Layers,
  MapPin,
  Car,
  FileWarning,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { 
  useDatasets, 
  useUploadDataset, 
  useSparkKpis,
  useSparkPorCiudad,
  useSparkPorEstado,
  useSparkPorTipoSancion,
  useSparkPorValorMulta,
  useSparkTendenciaMensual,
  useSparkPorMarca,
  useSparkPorTipoServicio,
  useSparkPorCategoriaLicencia,
  useSparkPorAnio,
  useSparkSummary,
  useSparkMissing,
  useSparkNumericTop,
  useSparkCorrelationMatrix,
  useSparkRecommendations,
  useSparkNumericStats,
  useSparkPaginatedData
} from '../hooks/useSpark'
import { useToast } from '../context/ToastContext'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', 
  '#10b981', '#06b6d4', '#3b82f6', '#64748b', '#a855f7'
]

type Section = 'simcomp' | 'dataset' | 'general' | 'analysis' | 'table' | 'terminal'

export default function SparkDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('simcomp')
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentLimit, setCurrentLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: datasets, isLoading: datasetsLoading } = useDatasets()
  const uploadMutation = useUploadDataset()
  const { addToast } = useToast()

  // Initialize selected dataset when datasets are loaded
  useMemo(() => {
    if (datasets && datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0])
    }
  }, [datasets, selectedDataset])

  const { data: kpis, isLoading: kpisLoading } = useSparkKpis(selectedDataset)
  const { data: porCiudad } = useSparkPorCiudad(selectedDataset)
  const { data: porEstado } = useSparkPorEstado(selectedDataset)
  const { data: porSancion } = useSparkPorTipoSancion(selectedDataset)
  const { data: porMulta } = useSparkPorValorMulta(selectedDataset)
  const { data: tendencia } = useSparkTendenciaMensual(selectedDataset)
  const { data: porMarca } = useSparkPorMarca(selectedDataset)
  const { data: porServicio } = useSparkPorTipoServicio(selectedDataset)
  const { data: porLicencia } = useSparkPorCategoriaLicencia(selectedDataset)
  const { data: porAnio } = useSparkPorAnio(selectedDataset)
  const { data: summary } = useSparkSummary(selectedDataset)
  const { data: missing } = useSparkMissing(selectedDataset)
  const { data: numericTop } = useSparkNumericTop(selectedDataset)
  const { data: correlation } = useSparkCorrelationMatrix(selectedDataset)
  const { data: recommendations } = useSparkRecommendations(selectedDataset)
  const { data: numericStats } = useSparkNumericStats(selectedDataset)
  const { data: paginatedData } = useSparkPaginatedData(selectedDataset, currentPage, currentLimit)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadMutation.mutateAsync(file)
      addToast(result.message || 'Dataset cargado correctamente', 'success')
      if (result.dataset) setSelectedDataset(result.dataset)
    } catch (err: any) {
      addToast(err.message || 'Error al subir dataset', 'error')
    }
  }

  const formatChartData = (data: any) => {
    if (!data || !data.labels) return []
    return data.labels.map((label: string, i: number) => ({
      name: label,
      value: data.values[i],
    }))
  }

  const isLoading = kpisLoading || uploadMutation.isPending

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Zap size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">SIMCOMP <span className="text-indigo-400">Analytics</span></h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Powered by Apache Spark</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavBtn active={activeSection === 'simcomp'} onClick={() => setActiveSection('simcomp')} icon={LayoutDashboard} label="SIMCOMP" />
            <NavBtn active={activeSection === 'dataset'} onClick={() => setActiveSection('dataset')} icon={Database} label="Dataset" />
            <NavBtn active={activeSection === 'general'} onClick={() => setActiveSection('general')} icon={Activity} label="General" />
            <NavBtn active={activeSection === 'analysis'} onClick={() => setActiveSection('analysis')} icon={Layers} label="Análisis" />
            <NavBtn active={activeSection === 'table'} onClick={() => setActiveSection('table')} icon={TableIcon} label="Tabla" />
            <div className="mx-2 h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1.5 border border-slate-700/50">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400">ENGINE ONLINE</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        {activeSection === 'simcomp' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/10 p-8 shadow-2xl">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Inteligencia de Datos</p>
                <h2 className="mt-2 text-4xl font-black text-white tracking-tight">Dashboard de Comparendos</h2>
                <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">
                  Análisis avanzado de infracciones de tránsito procesado en tiempo real con <span className="text-indigo-300 font-semibold">Apache Spark 4.1</span>. 
                  Visualiza patrones geográficos, tendencias temporales y perfiles de conductores.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                   <div className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 border border-indigo-500/20">
                      <Zap size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-200">Dataset: {selectedDataset || 'Ninguno'}</span>
                   </div>
                   <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 border border-emerald-500/20">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-200">Sincronizado</span>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                label="Total Comparendos" 
                value={kpis?.total} 
                icon={FileText} 
                color="indigo" 
                trend="100%" 
              />
              <KPICard 
                label="Pendientes" 
                value={kpis?.pendientes} 
                icon={Activity} 
                color="amber" 
                trend={`${((kpis?.pendientes / kpis?.total) * 100).toFixed(1)}%`} 
              />
              <KPICard 
                label="Pagados" 
                value={kpis?.pagados} 
                icon={CheckCircle2} 
                color="emerald" 
                trend={`${((kpis?.pagados / kpis?.total) * 100).toFixed(1)}%`} 
              />
              <KPICard 
                label="Anulados" 
                value={kpis?.anulados} 
                icon={XCircle} 
                color="rose" 
                trend={`${((kpis?.anulados / kpis?.total) * 100).toFixed(1)}%`} 
              />
            </div>

            {/* Alerts */}
            {kpis && (kpis.pendientes / kpis.total) > 0.6 && (
              <div className="flex items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20">
                  <AlertTriangle size={20} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">Alerta de Gestión Crítica</p>
                  <p className="text-xs opacity-80">El {((kpis.pendientes / kpis.total) * 100).toFixed(1)}% de los comparendos están pendientes. Se requiere atención inmediata en los procesos de cobro.</p>
                </div>
              </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-7">
              <ChartPanel title="Comparendos por Ciudad" className="lg:col-span-4" icon={MapPin}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={formatChartData(porCiudad)} layout="vertical" margin={{ left: 40, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Bar dataKey="value" fill="url(#indigoGradient)" radius={[0, 4, 4, 0]} />
                    <defs>
                      <linearGradient id="indigoGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Estado de Comparendos" className="lg:col-span-3" icon={PieChart}>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <RePieChart>
                      <Pie
                        data={formatChartData(porEstado)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {formatChartData(porEstado).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
                    {formatChartData(porEstado).map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartPanel>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartPanel title="Tendencia Mensual" icon={LineChartIcon}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formatChartData(tendencia)}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Distribución por Valor Multa" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData(porMulta)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 9 }} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

             {/* Charts Row 3 */}
             <div className="grid gap-6 lg:grid-cols-3">
              <ChartPanel title="Marca del Vehículo" icon={Car} className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData(porMarca)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Tipo de Servicio" icon={PieChart}>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <RePieChart>
                      <Pie
                        data={formatChartData(porServicio)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {formatChartData(porServicio).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {formatChartData(porServicio).map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartPanel>
            </div>
          </div>
        )}

        {activeSection === 'dataset' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center">
                <h2 className="text-3xl font-black text-white">Gestión de Datasets</h2>
                <p className="mt-2 text-slate-400">Sube nuevos archivos o selecciona uno existente para análisis masivo.</p>
             </div>

             <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
                   <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <Upload size={28} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Subir Dataset</h3>
                   <p className="mt-2 text-sm text-slate-400 leading-relaxed">Formatos soportados: CSV, JSON, Parquet. Máximo 500MB.</p>
                   
                   <label className="mt-8 block cursor-pointer">
                      <div className="group relative rounded-2xl border-2 border-dashed border-slate-700 p-12 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5">
                        <div className="flex flex-col items-center">
                           <Zap size={32} className="text-slate-600 transition-colors group-hover:text-indigo-400" />
                           <p className="mt-4 text-sm font-semibold text-slate-400">Seleccionar archivo</p>
                           <p className="mt-1 text-xs text-slate-500">O arrastra y suelta aquí</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.json,.parquet" />
                      </div>
                   </label>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
                   <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                      <FolderOpen size={28} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Dataset Actual</h3>
                   <p className="mt-2 text-sm text-slate-400">Selecciona de los archivos ya disponibles en el clúster.</p>

                   <div className="mt-8 space-y-4">
                      {datasetsLoading ? (
                        <div className="flex h-32 items-center justify-center">
                           <Loader2 className="animate-spin text-slate-600" />
                        </div>
                      ) : (
                        <select 
                          value={selectedDataset || ''} 
                          onChange={(e) => setSelectedDataset(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                           {datasets?.map((d: string) => (
                             <option key={d} value={d}>{d}</option>
                           ))}
                        </select>
                      )}
                      
                      <button 
                        onClick={() => setActiveSection('simcomp')}
                        className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98]"
                      >
                         INICIAR ANÁLISIS SPARK
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeSection === 'general' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                 <MetricBox label="Filas Totales" value={summary?.total_rows} icon={Rows} color="blue" />
                 <MetricBox label="Columnas" value={summary?.total_columns} icon={Columns} color="purple" />
                 <MetricBox label="Numéricas" value={summary?.schema?.filter((s:any) => s.type !== 'string').length} icon={Hash} color="emerald" />
                 <MetricBox label="Categóricas" value={summary?.schema?.filter((s:any) => s.type === 'string').length} icon={Tag} color="amber" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                 <ChartPanel title="Top Métricas Numéricas" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={350}>
                       <BarChart data={numericTop || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="column" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                          <Bar dataKey="mean" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </ChartPanel>

                 <ChartPanel title="Análisis de Valores Nulos" icon={FileWarning}>
                    <div className="overflow-auto max-h-[350px]">
                       <table className="w-full text-left text-sm">
                          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                             <tr>
                                <th className="p-3 text-slate-400 font-bold uppercase text-[10px]">Columna</th>
                                <th className="p-3 text-slate-400 font-bold uppercase text-[10px]">Faltantes</th>
                                <th className="p-3 text-slate-400 font-bold uppercase text-[10px]">% Presencia</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                             {missing?.map((m: any) => (
                               <tr key={m.column} className="hover:bg-slate-800/30">
                                  <td className="p-3 font-semibold text-slate-300">{m.column}</td>
                                  <td className="p-3 text-slate-400">{m.missing.toLocaleString()}</td>
                                  <td className="p-3">
                                     <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                                           <div className={`h-full rounded-full ${m.percentage > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.percentage}%` }} />
                                        </div>
                                        <span className={`text-xs font-bold ${m.percentage > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{m.percentage}%</span>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </ChartPanel>
              </div>
           </div>
        )}

        {activeSection === 'analysis' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid gap-6 lg:grid-cols-2">
                 <ChartPanel title="Esquema e Inferencia de Tipos" icon={Database}>
                    <div className="overflow-auto max-h-[500px]">
                        <table className="w-full text-left text-sm">
                          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                             <tr>
                                <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Columna</th>
                                <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Tipo de Dato Spark</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                             {summary?.schema?.map((c: any) => (
                               <tr key={c.name} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4 font-bold text-slate-200">{c.name}</td>
                                  <td className="p-4">
                                     <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-400 border border-indigo-400/20">
                                        {c.type}
                                     </span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                    </div>
                 </ChartPanel>

                 <ChartPanel title="Recomendaciones de Visualización" icon={Info}>
                    <div className="overflow-auto max-h-[500px]">
                        <table className="w-full text-left text-sm">
                          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                             <tr>
                                <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Columna</th>
                                <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Gráfico Sugerido</th>
                                <th className="p-4 text-slate-400 font-bold uppercase text-[10px]">Justificación</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                             {recommendations?.map((r: any) => (
                               <tr key={r.column} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4 font-bold text-slate-200">{r.column}</td>
                                  <td className="p-4">
                                     <div className="flex items-center gap-2 text-indigo-400">
                                        <BarChart3 size={14} />
                                        <span className="text-xs font-semibold">{r.recommended_visual}</span>
                                     </div>
                                  </td>
                                  <td className="p-4 text-xs text-slate-400 italic">
                                     {r.usage}
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                    </div>
                 </ChartPanel>
              </div>

              <ChartPanel title="Estadísticas Descriptivas (Numéricas)" icon={Activity}>
                 <div className="overflow-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                       <thead className="bg-slate-900 border-b border-slate-800">
                          <tr>
                             {numericStats && numericStats.length > 0 && Object.keys(numericStats[0]).map(key => (
                               <th key={key} className="p-4 text-slate-400 font-bold uppercase tracking-wider">{key}</th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {numericStats?.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-800/30">
                               {Object.values(row).map((val: any, j) => (
                                 <td key={j} className="p-4 text-slate-300">
                                    {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val}
                                 </td>
                               ))}
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </ChartPanel>
           </div>
        )}

        {activeSection === 'table' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                 <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar en el dataset..." 
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>

                 <div className="flex items-center gap-3">
                    <select 
                      value={currentLimit} 
                      onChange={(e) => { setCurrentLimit(Number(e.target.value)); setCurrentPage(1); }}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                    >
                       <option value={10}>10 filas</option>
                       <option value={25}>25 filas</option>
                       <option value={50}>50 filas</option>
                       <option value={100}>100 filas</option>
                    </select>

                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                         disabled={currentPage === 1}
                         className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                       >
                          <ChevronLeft size={20} />
                       </button>
                       <div className="flex h-10 items-center px-4 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20">
                          {currentPage}
                       </div>
                       <button 
                         onClick={() => setCurrentPage(p => p + 1)}
                         className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
                       >
                          <ChevronRight size={20} />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                       <thead className="bg-slate-900 border-b border-slate-800">
                          <tr>
                             {paginatedData?.data && paginatedData.data.length > 0 && Object.keys(paginatedData.data[0]).map(key => (
                               <th key={key} className="p-4 text-slate-500 font-black uppercase tracking-tighter">{key}</th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/50">
                          {paginatedData?.data?.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                               {Object.values(row).map((val: any, j) => (
                                 <td key={j} className="p-4 text-slate-400">
                                    {val === null ? <span className="text-slate-700 italic">null</span> : String(val)}
                                 </td>
                               ))}
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}
      </main>

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <div className="relative h-24 w-24">
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                 <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
                 <Zap className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
              </div>
              <p className="text-lg font-bold text-white tracking-widest uppercase">Procesando con Spark</p>
              <p className="text-xs text-slate-400 animate-pulse">Calculando métricas y distribuciones estadísticas...</p>
           </div>
        </div>
      )}
    </div>
  )
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} />
      {label}
    </button>
  )
}

function KPICard({ label, value, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    indigo: 'from-indigo-500 to-blue-600 text-indigo-400 bg-indigo-500/10',
    amber: 'from-amber-500 to-orange-600 text-amber-400 bg-amber-500/10',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-400 bg-emerald-500/10',
    rose: 'from-rose-500 to-red-600 text-rose-400 bg-rose-500/10',
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl transition-all hover:border-indigo-500/30 hover:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorMap[color].split(' ').slice(2).join(' ')}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-black text-white">
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-black text-white">{value?.toLocaleString() || '0'}</p>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${colorMap[color].split(' ').slice(0, 2).join(' ')} transition-all duration-500 group-hover:w-full`} />
    </div>
  )
}

function MetricBox({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  }
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg">
       <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
             <Icon size={24} />
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
             <p className="text-2xl font-black text-white">{value?.toLocaleString() || '0'}</p>
          </div>
       </div>
    </div>
  )
}

function ChartPanel({ title, children, className = '', icon: Icon }: any) {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Icon size={18} />
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{title}</h3>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
           <Download size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

// Icons for metrics
function Rows(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> }
function Columns(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg> }
function Hash(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg> }
function Tag(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg> }
