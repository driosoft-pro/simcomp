import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  children: ReactNode
  onClose?: () => void
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
}

function Modal({ open, children, onClose, maxWidth }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      <div className={`relative flex flex-col w-full shadow-2xl transition-all duration-300 animate-in zoom-in-95 data-[state=open]:zoom-in-100 ${
        maxWidth ? `max-w-${maxWidth}` : 'max-w-xl'
      }`}>
        {children}
      </div>
    </div>
  )
}

export default Modal