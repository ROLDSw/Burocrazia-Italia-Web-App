'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Scadenza } from '@/data/scadenze'
import { ScadenzaList } from '../scadenze/ScadenzaList'

interface ScadenzeImminentiProps {
  scadenze: Scadenza[]
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (updated: Scadenza) => void
}

export function ScadenzeImminenti({ scadenze, onComplete, onDelete, onEdit }: ScadenzeImminentiProps) {
  const [showAll, setShowAll] = useState(false)

  // Filter active scadenze
  const activeScadenze = scadenze
    .filter(s => s.status !== 'completata')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  // Show either 4 or all based on state
  const displayScadenze = showAll ? activeScadenze : activeScadenze.slice(0, 4)

  if (activeScadenze.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Scadenze Imminenti</h2>
        <div className="flex items-center gap-4">
          {activeScadenze.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              aria-expanded={showAll}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              {showAll ? (
                <>Mostra meno <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Vedi tutte ({activeScadenze.length}) <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
      <ScadenzaList scadenze={displayScadenze} dashboardMode={true} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
    </div>
  )
}
