import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message?: string | null
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null
  
  return (
    <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
      <AlertCircle size={14} className="text-red-500 shrink-0" />
      <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-none">
        {message}
      </p>
    </div>
  )
}
