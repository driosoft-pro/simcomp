import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

function DataTable({ children }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  )
}

export default DataTable