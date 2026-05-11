import { useState, useEffect } from 'react'
import { Scadenza } from '@/data/scadenze'
import { ScadenzaCard } from './ScadenzaCard'
import { cn } from '@/lib/utils'

export interface ScadenzaListProps {
  scadenze: Scadenza[]
  compact?: boolean
  modalMode?: boolean
  dashboardMode?: boolean
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (updated: Scadenza) => void
}

export function ScadenzaList({ scadenze: initialScadenze, compact = false, modalMode = false, dashboardMode = false, onComplete, onDelete, onEdit }: ScadenzaListProps) {
  // Use local state to handle optimistic deletes if no onDelete is provided, or rely on parent
  const [localScadenze, setLocalScadenze] = useState(initialScadenze)

  // Sync with prop when it changes
  useEffect(() => {
    setLocalScadenze(initialScadenze)
  }, [initialScadenze])

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id)
    } else {
      setLocalScadenze(prev => prev.filter(s => s.id !== id))
    }
  }

  if (localScadenze.length === 0) {
    return (
      <div className="text-center py-12 bg-card backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nessuna scadenza</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Tutto in regola per ora.</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid gap-5 sm:gap-6 mx-auto",
      modalMode || dashboardMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    )}>
      {localScadenze.map((scadenza) => (
        <ScadenzaCard
          key={scadenza.id}
          scadenza={scadenza}
          compact={compact}
          onComplete={onComplete}
          onDelete={handleDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
