import { Scadenza, mockScadenze } from '@/data/scadenze'

const KEY = 'burocrazia-scadenze'

export function loadScadenze(): Scadenza[] {
  if (typeof window === 'undefined') return mockScadenze
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return JSON.parse(saved) as Scadenza[]
  } catch {}
  return mockScadenze
}

export function saveScadenze(scadenze: Scadenza[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(scadenze))
  } catch {}
}
