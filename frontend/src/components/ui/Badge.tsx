import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

function Badge({ children }: Props) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
      {children}
    </span>
  )
}

export default Badge