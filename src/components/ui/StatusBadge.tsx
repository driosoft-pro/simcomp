interface Props {
  status:
    | 'CREADO'
    | 'VIGENTE'
    | 'EN_PROCESO_DE_PAGO'
    | 'PAGADO'
    | 'CERRADO'
    | 'EN_COBRO_COACTIVO'
    | 'IMPUGNADO'
    | 'EXONERADO'
    | 'ANULADO'
}

function StatusBadge({ status }: Props) {
  const styles = {
    CREADO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    VIGENTE: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    EN_PROCESO_DE_PAGO:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    PAGADO:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    CERRADO:
      'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    EN_COBRO_COACTIVO:
      'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    IMPUGNADO:
      'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    EXONERADO:
      'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    ANULADO:
      'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

export default StatusBadge