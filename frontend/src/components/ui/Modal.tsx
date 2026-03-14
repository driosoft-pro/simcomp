import type { ReactNode } from 'react'

interface Props {
  open: boolean
  children: ReactNode
}

function Modal({ open, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
        {children}
      </div>
    </div>
  )
}

export default Modal