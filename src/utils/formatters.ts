export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no válida'
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsedDate)
}

export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function formatPlate(plate: string): string {
  return plate.trim().toUpperCase()
}