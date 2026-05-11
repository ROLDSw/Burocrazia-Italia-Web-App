'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Scadenza } from '@/data/scadenze'
import { mockPersona } from '@/data/persone'
import { loadScadenze, updateScadenzaStatus, deleteScadenza, updateScadenza } from '@/lib/scadenze-db'
import { KpiWidget } from '@/components/dashboard/KpiWidget'
import { IcebreakerBanner } from '@/components/dashboard/IcebreakerBanner'
import { ScadenzeImminenti } from '@/components/dashboard/ScadenzeImminenti'
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ScadenzaList } from '@/components/scadenze/ScadenzaList'

type KpiType = 'totali' | 'urgenti' | 'in_scadenza' | 'completate' | null

export default function DashboardPage() {
  const [scadenze, setScadenze] = useState<Scadenza[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedKpi, setSelectedKpi] = useState<KpiType>(null)

  const [userName, setUserName] = useState<string>(mockPersona.name)

  useEffect(() => {
    loadScadenze().then(data => {
      setScadenze(data)
      setIsLoading(false)
    })

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const username = (user.user_metadata as any)?.username
        if (username) setUserName(username)
      }
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const username = (session.user.user_metadata as any)?.username
        if (username) setUserName(username)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleComplete = (id: string) => {
    setScadenze(current => current.map(s => s.id === id ? { ...s, status: 'completata' as const } : s))
    updateScadenzaStatus(id, 'completata').catch(console.error)
  }

  const handleDelete = (id: string) => {
    setScadenze(current => current.filter(s => s.id !== id))
    deleteScadenza(id).catch(console.error)
  }

  const handleEdit = (updated: Scadenza) => {
    setScadenze(current => current.map(s => s.id === updated.id ? updated : s))
    updateScadenza(updated).catch(console.error)
  }

  const urgenti = scadenze
    .filter(s => s.urgency === 'urgente' && s.status !== 'completata')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    
  const inScadenza = scadenze
    .filter(s => s.urgency === 'in_scadenza' && s.status !== 'completata')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    
  const completate = scadenze
    .filter(s => s.status === 'completata')
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())

  const scadenzeAttive = scadenze
    .filter(s => s.status !== 'completata')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const getKpiData = () => {
    switch (selectedKpi) {
      case 'totali': return { title: 'Scadenze Totali', data: scadenzeAttive }
      case 'urgenti': return { title: 'Scadenze Urgenti', data: urgenti }
      case 'in_scadenza': return { title: 'In Scadenza (8-30gg)', data: inScadenza }
      case 'completate': return { title: 'Scadenze Completate', data: completate }
      default: return { title: '', data: [] }
    }
  }

  const kpiData = getKpiData()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <IcebreakerBanner 
        persona={{ ...mockPersona, name: userName, urgenti: urgenti.length, num_scadenze_attive: scadenzeAttive.length }}
        scadenzeUrgenti={urgenti}
        period="maggio 2026"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KpiWidget
          title="Scadenze Totali"
          value={scadenzeAttive.length}
          icon={<Layers className="w-5 h-5" />}
          variant="default"
          onClick={() => setSelectedKpi('totali')}
        />
        <KpiWidget
          title="Urgenti (≤7gg)"
          value={urgenti.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="urgent"
          onClick={() => setSelectedKpi('urgenti')}
        />
        <KpiWidget
          title="In Scadenza (8-30gg)"
          value={inScadenza.length}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
          onClick={() => setSelectedKpi('in_scadenza')}
        />
        <KpiWidget
          title="Completate"
          value={completate.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
          onClick={() => setSelectedKpi('completate')}
        />
      </div>

      <ScadenzeImminenti scadenze={scadenze} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEdit} />

      <Dialog open={selectedKpi !== null} onOpenChange={(open) => !open && setSelectedKpi(null)}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">{kpiData.title}</DialogTitle>
          </DialogHeader>
          <div className="pb-6">
            <ScadenzaList
              scadenze={kpiData.data}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
              modalMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
