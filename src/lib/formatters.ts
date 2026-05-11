export function formatCurrency(amount: number | null | undefined, currency: string = 'EUR'): string {
  if (amount == null) return 'N/A'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('it-IT', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
  } catch {
    return dateString
  }
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return 'N/A'
  return new Intl.NumberFormat('it-IT').format(num)
}
