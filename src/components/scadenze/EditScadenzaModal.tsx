'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Scadenza, CategoryType, UrgencyLevel } from '@/data/scadenze'
import { cn } from '@/lib/utils'

interface EditScadenzaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scadenza: Scadenza | null
  onSave?: (updated: Scadenza) => void
}

interface FormErrors {
  title?: string
  due_date?: string
}

function calcUrgency(dueDate: string): { urgency: UrgencyLevel; days_remaining: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const days_remaining = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  let urgency: UrgencyLevel
  if (days_remaining < 0) urgency = 'scaduta'
  else if (days_remaining <= 7) urgency = 'urgente'
  else if (days_remaining <= 30) urgency = 'in_scadenza'
  else urgency = 'ok'
  return { urgency, days_remaining }
}

const FIELD_CLASS = "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
const FIELD_ERROR_CLASS = "border-red-400 focus-visible:ring-red-400"

export function EditScadenzaModal({ open, onOpenChange, scadenza, onSave }: EditScadenzaModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CategoryType>('mobilita')
  const [subcategory, setSubcategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open || !scadenza) return
    setTitle(scadenza.title)
    setCategory(scadenza.category)
    setSubcategory(scadenza.subcategory ?? '')
    setDueDate(scadenza.due_date.slice(0, 10))
    setAmount(scadenza.amount != null ? String(scadenza.amount) : '')
    setDescription(scadenza.description ?? '')
    setActionUrl(scadenza.action_url ?? '')
    setErrors({})
  }, [open, scadenza])

  const clearError = (field: keyof FormErrors) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!title.trim()) next.title = 'Il titolo è obbligatorio'
    if (!dueDate) next.due_date = 'La data di scadenza è obbligatoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate() || !scadenza) return
    const { urgency, days_remaining } = calcUrgency(dueDate)
    const updated: Scadenza = {
      ...scadenza,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory.trim() || scadenza.subcategory,
      urgency,
      due_date: new Date(dueDate).toISOString(),
      days_remaining,
      amount: amount ? parseFloat(amount) : undefined,
      currency: amount ? (scadenza.currency ?? 'EUR') : undefined,
      action_url: actionUrl.trim() || undefined,
    }
    onSave?.(updated)
    onOpenChange(false)
  }

  const handleClose = () => {
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white/40 dark:bg-slate-950/40 backdrop-blur-[32px] rounded-[2.5rem] sm:rounded-[3rem] border-white/40 dark:border-white/10 shadow-2xl p-6 sm:p-10 w-[94vw] sm:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>Modifica Scadenza</DialogTitle>
          <DialogDescription className="sr-only">
            Modifica i dettagli della scadenza selezionata.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              Titolo <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={e => { setTitle(e.target.value); clearError('title') }}
              placeholder="Es. Pagamento Bollo Auto"
              className={cn(errors.title && FIELD_ERROR_CLASS)}
            />
            {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className={FIELD_CLASS}
              >
                <option value="mobilita">Mobilità</option>
                <option value="certificazioni">Certificazioni</option>
                <option value="immobili">Immobili e Utenze</option>
                <option value="welfare">Welfare</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Sottocategoria <span className="text-slate-400 font-normal">— opzionale</span>
              </label>
              <Input
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="Es. Bollo Auto, PEC…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Data Scadenza <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => { setDueDate(e.target.value); clearError('due_date') }}
                className={cn(errors.due_date && FIELD_ERROR_CLASS)}
              />
              {errors.due_date && <p className="text-xs text-red-500 mt-0.5">{errors.due_date}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Importo (€) <span className="text-slate-400 font-normal">— opzionale</span>
              </label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              Descrizione <span className="text-slate-400 font-normal">— opzionale</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Note aggiuntive…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              URL Portale <span className="text-slate-400 font-normal">— opzionale</span>
            </label>
            <Input
              type="url"
              value={actionUrl}
              onChange={e => setActionUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700">
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
