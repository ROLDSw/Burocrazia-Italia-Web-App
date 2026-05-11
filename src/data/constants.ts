import { UrgencyLevel } from './scadenze'

export const URGENCY_MAPPING: Record<UrgencyLevel, { color: string, label: string }> = {
  urgente: { color: 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400', label: 'Urgente' },
  in_scadenza: { color: 'text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50 dark:text-amber-400', label: 'In Scadenza' },
  ok: { color: 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50 dark:text-emerald-400', label: 'OK' },
  scaduta: { color: 'text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 line-through', label: 'Scaduta' }
}

export const CATEGORY_ICONS = {
  mobilita: 'Car',
  certificazioni: 'FileText',
  immobili: 'Home',
  welfare: 'Heart'
} as const
