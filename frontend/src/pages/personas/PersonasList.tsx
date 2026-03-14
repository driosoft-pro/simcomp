import { Link } from 'react-router-dom'
import { usePersonas } from '../../hooks/usePersonas'

const tipoDocBadge: Record<string, string> = {
  CC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  CE: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  PAS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

function PersonasList() {
  const { data, isLoading, isError, error } = usePersonas()

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
          Módulo
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Personas
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Listado general de personas registradas en el sistema.
        </p>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al cargar personas:{' '}
            {error instanceof Error ? error.message : 'desconocido'}
          </p>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo doc.</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">N° documento</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Teléfono</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}

              {data?.map((persona) => (
                <tr
                  key={persona.persona_id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {persona.primer_nombre}{' '}
                    {persona.segundo_nombre ? persona.segundo_nombre + ' ' : ''}
                    {persona.primer_apellido}{' '}
                    {persona.segundo_apellido ?? ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tipoDocBadge[persona.tipo_documento] ?? 'bg-slate-100 text-slate-600'}`}>
                      {persona.tipo_documento}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {persona.numero_documento}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {persona.telefono || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/personas/${persona.persona_id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && data?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No hay personas registradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonasList