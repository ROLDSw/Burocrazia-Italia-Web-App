'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Scadenza, CategoryType, UrgencyLevel } from '@/data/scadenze'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

export interface NewScadenzaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (scadenza: Scadenza) => void
  defaultCategory?: CategoryType
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

function UpsellDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/40 dark:bg-slate-950/40 backdrop-blur-[32px] rounded-[2.5rem] sm:rounded-[3rem] border-white/40 dark:border-white/10 shadow-2xl p-6 sm:p-10 w-[94vw] sm:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-500" />
            Funzionalità Premium
          </DialogTitle>
          <DialogDescription className="sr-only">
            Abbonati per aggiungere scadenze illimitate e accedere a tutte le funzionalità premium.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Abbonati per aggiungere scadenze</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Parti da €9,90/mese</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Aggiungi scadenze illimitate
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Alert email automatici
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Tutte le categorie sbloccate
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Link
            href="/#pricing"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-4 py-2 text-sm transition shadow-sm"
          >
            Scegli un piano
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewScadenzaModal({ open, onOpenChange, onAdd, defaultCategory = 'mobilita' }: NewScadenzaModalProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CategoryType>(defaultCategory)
  const [subcategory, setSubcategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open) return
    supabase.auth.getUser().then(({ data: { user } }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (user?.app_metadata as any)?.subscription?.status
      setIsSubscribed(status === 'active' || status === 'canceling')
    })
  }, [open])

  const clearError = (field: keyof FormErrors) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!title.trim()) next.title = 'Il titolo è obbligatorio'
    if (!dueDate) next.due_date = 'La data di scadenza è obbligatoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const CATEGORY_LABEL: Record<CategoryType, string> = {
    mobilita: 'Mobilità',
    certificazioni: 'Certificazioni',
    immobili: 'Immobili & Utenze',
    welfare: 'Welfare',
  }

  const handleSave = () => {
    if (!validate()) return

    const { urgency, days_remaining } = calcUrgency(dueDate)

    const newScadenza: Scadenza = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory.trim() || CATEGORY_LABEL[category],
      urgency,
      due_date: new Date(dueDate).toISOString(),
      days_remaining,
      amount: amount ? parseFloat(amount) : undefined,
      currency: amount ? 'EUR' : undefined,
      action_url: actionUrl.trim() || undefined,
      status: 'attiva',
      owner_type: 'business',
    }

    onAdd?.(newScadenza)
    handleClose()
  }

  const handleClose = () => {
    setTitle('')
    setCategory(defaultCategory)
    setSubcategory('')
    setDueDate('')
    setAmount('')
    setDescription('')
    setActionUrl('')
    setErrors({})
    onOpenChange(false)
  }

  // Mostra upsell se non abbonato, nulla se ancora in verifica
  if (open && isSubscribed === null) return null
  if (open && isSubscribed === false) {
    return <UpsellDialog onClose={handleClose} />
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white/40 dark:bg-slate-950/40 backdrop-blur-[32px] rounded-[2.5rem] sm:rounded-[3rem] border-white/40 dark:border-white/10 shadow-2xl p-6 sm:p-10 w-[94vw] sm:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuova Scadenza</DialogTitle>
          <DialogDescription className="sr-only">
            Compila i campi per aggiungere una nuova scadenza al tuo calendario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Titolo */}
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

          {/* Categoria + Sottocategoria */}
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

          {/* Data Scadenza + Importo */}
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

          {/* Descrizione */}
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

          {/* URL Portale */}
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
            Salva Scadenza
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
