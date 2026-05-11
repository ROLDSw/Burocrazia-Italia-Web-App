'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Scadenza } from '@/data/scadenze'
import { loadScadenze, updateScadenzaStatus, deleteScadenza, insertScadenza, updateScadenza } from '@/lib/scadenze-db'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { NewScadenzaModal } from '@/components/scadenze/NewScadenzaModal'
import { EditScadenzaModal } from '@/components/scadenze/EditScadenzaModal'
import { Dialog } from '@/components/ui/Dialog'
import { ScadenzaCardModalContent } from '@/components/scadenze/ScadenzaCardModalContent'

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scadenze, setScadenze] = useState<Scadenza[]>([])
  const [selectedScadenza, setSelectedScadenza] = useState<Scadenza | null>(null)
  const [scadenzaToEdit, setScadenzaToEdit] = useState<Scadenza | null>(null)

  useEffect(() => {
    loadScadenze().then(data => setScadenze(data))
  }, [])

  const handleComplete = (id: string) => {
    setScadenze(current => current.map(s => s.id === id ? { ...s, status: 'completata' as const } : s))
    updateScadenzaStatus(id, 'completata').catch(console.error)
  }

  const handleDelete = (id: string) => {
    setScadenze(current => current.filter(s => s.id !== id))
    deleteScadenza(id).catch(console.error)
    setSelectedScadenza(null)
  }

  const handleAdd = (newScadenza: Scadenza) => {
    setScadenze(current => [newScadenza, ...current])
    insertScadenza(newScadenza).catch(console.error)
  }

  const handleEdit = (updated: Scadenza) => {
    setScadenze(current => current.map(s => s.id === updated.id ? updated : s))
    updateScadenza(updated).catch(console.error)
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendario Scadenze</h1>
          <p className="text-slate-500 dark:text-gray-400">Visualizza e organizza i tuoi impegni burocratici.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-gray-800 flex-1 sm:flex-initial justify-between sm:justify-start">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-gray-400" />
            </button>
            <span className="font-semibold text-sm sm:text-base px-2 text-center text-slate-900 dark:text-white whitespace-nowrap">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-gray-400" />
            </button>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
            <span className="text-xs sm:text-sm">Aggiungi</span>
          </Button>
        </div>
      </div>

      <div className="bg-card backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden">
        <div className="w-full">
          <div className="w-full">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day, idx) => (
                <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-sm font-medium text-slate-500 dark:text-gray-400">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{['L', 'M', 'M', 'G', 'V', 'S', 'D'][idx]}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {emptyDays.map(i => (
                <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-slate-100 dark:border-gray-800/50 bg-slate-50/50 dark:bg-gray-900/50" />
              ))}
              {days.map(day => {
                const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayScadenze = scadenze.filter(s => {
                  const d = new Date(s.due_date)
                  return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
                })

                const isToday = currentDayDate.toDateString() === new Date().toDateString()

                return (
                   <div key={day} className={cn(
                    "min-h-[60px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-slate-100 dark:border-gray-800/50 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors relative group",
                    isToday && "bg-indigo-50/30 dark:bg-indigo-900/10"
                  )}>
                    <span className={cn(
                      "inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1",
                      isToday 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    )}>
                      {day}
                    </span>
                    <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
                      {dayScadenze.map(scadenza => (
                        <button 
                          key={scadenza.id} 
                          onClick={() => setSelectedScadenza(scadenza)}
                          className={cn(
                            "w-full text-left text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md truncate font-medium border cursor-pointer hover:opacity-80 transition-opacity",
                            scadenza.status === 'completata' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                              : scadenza.urgency === 'urgente' || scadenza.urgency === 'scaduta'
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30"
                          )}
                          title={scadenza.title}
                        >
                          <span className="sm:inline hidden">{scadenza.title}</span>
                          <span className="sm:hidden block w-full h-1 rounded-full bg-current opacity-60"></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      <NewScadenzaModal open={isModalOpen} onOpenChange={setIsModalOpen} onAdd={handleAdd} />

      {selectedScadenza && (
        <Dialog open={!!selectedScadenza} onOpenChange={(open) => !open && setSelectedScadenza(null)}>
          <ScadenzaCardModalContent
            scadenza={selectedScadenza}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={(s) => { setScadenzaToEdit(s); setSelectedScadenza(null) }}
            onClose={() => setSelectedScadenza(null)}
          />
        </Dialog>
      )}

      <EditScadenzaModal
        open={!!scadenzaToEdit}
        onOpenChange={(open) => { if (!open) setScadenzaToEdit(null) }}
        scadenza={scadenzaToEdit}
        onSave={handleEdit}
      />
    </div>
  )
}
