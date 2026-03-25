import { useState } from 'react'
import { apiClient } from '../../api/axios.config'
import { API_URLS } from '../../utils/constants'
import { 
  BarChart3, 
  Download, 
  Upload, 
  FileText, 
  FileJson, 
  Archive, 
  Loader2,
  Users,
  Car,
  FileWarning,
  ClipboardList,
  UserCog
} from 'lucide-react'
import { useStatistics, useExport, useImport, useReportesHealth } from '../../hooks/useReportes'
import { useToast } from '../../context/ToastContext'

const MODULOS = [
  { id: 'personas', name: 'Personas', icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
  { id: 'usuarios', name: 'Usuarios', icon: UserCog, color: 'text-rose-600', bg: 'bg-rose-100' },
  { id: 'automotores', name: 'Automotores', icon: Car, color: 'text-sky-600', bg: 'bg-sky-100' },
  { id: 'infracciones', name: 'Infracciones', icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'comparendos', name: 'Comparendos', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-100' },
]

function Reportes() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useStatistics()
  const { data: health } = useReportesHealth()
  const exportMutation = useExport()
  const importMutation = useImport()
  const { addToast } = useToast()

  const [importingModule, setImportingModule] = useState<string | null>(null)

  const handleExport = async (modulo: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      await exportMutation.mutateAsync({ modulo, format })
      addToast(`Reporte de ${modulo} (${format.toUpperCase()}) descargado`, 'success')
    } catch (err: any) {
      addToast(`Error al exportar: ${err.message}`, 'error')
    }
  }

  const handleExportAll = async (format: 'zip' | 'excel') => {
    try {
      await exportMutation.mutateAsync({ all: true, format })
      addToast(`Dataset completo (${format.toUpperCase()}) descargado`, 'success')
    } catch (err: any) {
      addToast(`Error al exportar: ${err.message}`, 'error')
    }
  }

  const handleImport = async (modulo: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportingModule(modulo)
    try {
      const result = await importMutation.mutateAsync({ modulo, file })
      addToast(`Importación exitosa: ${result.inserted} registros procesados`, 'success')
      if (result.failed > 0) {
        addToast(`Aviso: ${result.failed} filas fallaron`, 'warning')
      }
    } catch (err: any) {
      addToast(`Error en importación: ${err.message}`, 'error')
    } finally {
      setImportingModule(null)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Administración
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Centro de Reportes
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Estadísticas, exportación masiva e importación de datos.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold dark:bg-slate-800">
          <div className={`h-2 w-2 rounded-full ${health?.success ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-600 dark:text-slate-400">
            Servicio: {health?.success ? 'En línea' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))
        ) : statsError ? (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">Error al cargar estadísticas</p>
          </div>
        ) : (
          <>
            <StatCard label="Personas" value={stats?.resumen.totalPersonas} icon={Users} color="violet" />
            <StatCard label="Usuarios" value={stats?.resumen.totalUsuarios} icon={UserCog} color="rose" />
            <StatCard label="Automotores" value={stats?.resumen.totalAutomotores} icon={Car} color="sky" />
            <StatCard label="Infracciones" value={stats?.resumen.totalInfracciones} icon={FileWarning} color="amber" />
            <StatCard label="Comparendos" value={stats?.resumen.totalComparendos} icon={ClipboardList} color="emerald" />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Exportación Global */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Dataset Completo</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Descarga toda la información del sistema consolidada en un solo archivo.
            </p>
            <div className="grid gap-3">
              <button
                onClick={() => handleExportAll('excel')}
                disabled={exportMutation.isPending}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <FileJson className="text-emerald-500" />
                  Excel Consolidado
                </div>
                <Download size={16} />
              </button>
              <button
                onClick={() => handleExportAll('zip')}
                disabled={exportMutation.isPending}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Archive className="text-amber-500" />
                  Paquete ZIP (CSVs)
                </div>
                <Download size={16} />
              </button>
              
              <hr className="my-2 border-slate-100 dark:border-slate-800" />
              
              <button
               onClick={() => {
                 apiClient.get(`${API_URLS.reportes}/estadisticas/pdf`, { responseType: 'blob' })
                   .then(res => {
                     const url = window.URL.createObjectURL(res.data);
                     const link = document.createElement('a');
                     link.href = url;
                     link.setAttribute('download', 'estadisticas_generales.pdf');
                     document.body.appendChild(link);
                     link.click();
                     link.remove();
                   })
                   .catch(() => addToast('Error al exportar PDF de estadísticas', 'error'))
               }}
                className="flex items-center justify-between rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} />
                  Estadísticas (PDF)
                </div>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Gestión por Módulo */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Gestión por Módulo</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Módulo</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 text-center">Exportar</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 text-right">Importar (CSV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MODULOS.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${mod.bg}`}>
                          <mod.icon size={18} className={mod.color} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{mod.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleExport(mod.id, 'csv')}
                          title="CSV"
                          className="p-1.5 text-slate-400 hover:text-emerald-500 transition"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => handleExport(mod.id, 'excel')}
                          title="Excel"
                          className="p-1.5 text-slate-400 hover:text-sky-500 transition"
                        >
                          <FileJson size={18} />
                        </button>
                        <button 
                          onClick={() => handleExport(mod.id, 'pdf')}
                          title="PDF"
                          className="p-1.5 text-slate-400 hover:text-red-500 transition"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <label 
                        className={`inline-flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          importingModule === mod.id 
                            ? 'bg-slate-100 text-slate-400' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400'
                        }`}
                      >
                        {importingModule === mod.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        Subir CSV
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) => handleImport(mod.id, e)}
                          disabled={importingModule !== null}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    violet: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
    rose: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
    sky: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {value?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Reportes
