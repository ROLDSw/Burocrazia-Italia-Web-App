'use client'

import { useState, useEffect } from 'react'
import { CategoryType, Scadenza, UrgencyLevel } from '@/data/scadenze'
import { loadScadenze, updateScadenzaStatus, deleteScadenza, insertScadenza, updateScadenza } from '@/lib/scadenze-db'
import { CategoryIcon } from './CategoryIcon'
import { ScadenzaList } from './ScadenzaList'
import { NewScadenzaModal } from './NewScadenzaModal'
import { Button } from '../ui/Button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryPageTemplateProps {
  title: string
  category: CategoryType
}

type FilterType = 'tutte' | UrgencyLevel | 'completate'

const filters: { value: FilterType; label: string }[] = [
  { value: 'tutte', label: 'Tutte' },
  { value: 'urgente', label: 'Urgenti' },
  { value: 'in_scadenza', label: 'In Scadenza' },
  { value: 'ok', label: 'OK' },
  { value: 'completate', label: 'Completate' },
]

export function CategoryPageTemplate({ title, category }: CategoryPageTemplateProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('tutte')
  const [scadenze, setScadenze] = useState<Scadenza[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadScadenze().then(data => {
      setScadenze(data)
      setIsLoading(false)
    })
  }, [])

  const handleComplete = (id: string) => {
    setScadenze(current => current.map(s => s.id === id ? { ...s, status: 'completata' as const } : s))
    updateScadenzaStatus(id, 'completata').catch(console.error)
  }

  const handleDelete = (id: string) => {
    setScadenze(current => current.filter(s => s.id !== id))
    deleteScadenza(id).catch(console.error)
  }

  const handleAdd = (newScadenza: Scadenza) => {
    setScadenze(current => [newScadenza, ...current])
    insertScadenza(newScadenza).catch(console.error)
  }

  const handleEdit = (updated: Scadenza) => {
    setScadenze(current => current.map(s => s.id === updated.id ? updated : s))
    updateScadenza(updated).catch(console.error)
  }

  const categoryScadenze = scadenze.filter(s => s.category === category)
  
  const filteredScadenze = categoryScadenze
    .filter(s => {
      if (activeFilter === 'tutte') return s.status !== 'completata'
      if (activeFilter === 'completate') return s.status === 'completata'
      return s.urgency === activeFilter && s.status !== 'completata'
    })
    .sort((a, b) => a.days_remaining - b.days_remaining)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-16 bg-slate-100 dark:bg-gray-800 rounded-2xl" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-24 bg-slate-100 dark:bg-gray-800 rounded-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-slate-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
            <CategoryIcon category={category} size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 truncate">
              {categoryScadenze.filter(s => s.status !== 'completata').length} scadenze attive
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="sm:hidden bg-indigo-600 hover:bg-indigo-700 text-white p-2 h-10 w-10 rounded-xl">
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Aggiungi scadenza
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border",
              activeFilter === filter.value
                ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-gray-900 dark:border-white"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ScadenzaList scadenze={filteredScadenze} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEdit} />
      <NewScadenzaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAdd}
        defaultCategory={category}
      />
    </div>
  )
}
