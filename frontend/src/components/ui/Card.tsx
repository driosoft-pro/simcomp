import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

function Card({ children }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  )
}

export default Card