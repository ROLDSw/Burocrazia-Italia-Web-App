import { useState } from 'react'
import { Scadenza } from '@/data/scadenze'
import { URGENCY_MAPPING } from '@/data/constants'
import { CategoryIcon } from './CategoryIcon'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { cn, safeExternalUrl } from '@/lib/utils'
import {
  Dialog,
  DialogTrigger,
} from '../ui/Dialog'
import { ScadenzaCardModalContent } from './ScadenzaCardModalContent'
import { EditScadenzaModal } from './EditScadenzaModal'

interface ScadenzaCardProps {
  scadenza: Scadenza
  onComplete?: (id: string) => void
  onSnooze?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (updated: Scadenza) => void
  compact?: boolean
}

export function ScadenzaCard({ scadenza, onComplete, onSnooze, onDelete, onEdit, compact = false }: ScadenzaCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [scadenzaToEdit, setScadenzaToEdit] = useState<Scadenza>(scadenza)
  const urgencyInfo = URGENCY_MAPPING[scadenza.urgency]
  
  const URGENCY_ACCENT: Record<string, string> = {
    urgente: 'bg-red-500',
    in_scadenza: 'bg-amber-500',
    ok: 'bg-emerald-500',
    scaduta: 'bg-slate-300',
  }
  const accentColor = URGENCY_ACCENT[scadenza.urgency] ?? 'bg-slate-300'

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "relative group overflow-hidden rounded-[2rem] bg-card backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300",
        "shadow-[var(--shadow-neo)] dark:shadow-[var(--shadow-neo)]",
        "hover:-translate-y-1 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-6"
      )}>
        {/* Left Accent Bar */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", accentColor)} />

        <DialogTrigger asChild>
          <button className="flex flex-row gap-3 sm:gap-4 justify-between items-center cursor-pointer w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
            <div className="flex gap-4 items-start flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <CategoryIcon category={scadenza.category} size={18} />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5 flex-1 pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-normal text-xs px-2 py-0.5">
                    {scadenza.subcategory}
                  </Badge>
                  <Badge variant="secondary" className={cn("font-medium text-xs px-2 py-0.5", urgencyInfo.color)}>
                    {urgencyInfo.label}
                  </Badge>
                </div>
                <h3 className={cn("font-semibold text-slate-900 dark:text-white leading-tight break-words", compact ? "text-sm sm:text-base" : "text-base sm:text-lg")}>
                  {scadenza.title}
                </h3>
                {!compact && scadenza.description && (
                  <p className="hidden sm:block sm:line-clamp-2 text-sm text-slate-500 dark:text-gray-400 mt-1">
                    {scadenza.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right side stats */}
            <div className={cn("flex shrink-0 items-center gap-3 sm:gap-4", compact ? "flex-row" : "flex-row sm:flex-col sm:items-end")}>
              <div className="flex flex-col sm:items-end text-left sm:text-right">
                <div className="flex items-end gap-1">
                  <span className={cn(
                    "font-bold tracking-tight",
                    scadenza.urgency === 'scaduta' ? "text-slate-400" : "text-slate-900 dark:text-white",
                    compact ? "text-lg sm:text-xl" : "text-xl sm:text-3xl"
                  )}>
                    {scadenza.days_remaining}
                  </span>
                  <span className="text-[10px] sm:text-sm text-slate-500 font-medium mb-0.5 sm:mb-1 dark:text-gray-400">gg</span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                  Scade il {new Date(scadenza.due_date).toLocaleDateString('it-IT')}
                </p>
              </div>

              {scadenza.amount && (
                <div className={cn("font-semibold text-slate-700 dark:text-gray-200", compact ? "text-xs sm:text-sm" : "text-sm sm:text-lg")}>
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: scadenza.currency || 'EUR' }).format(scadenza.amount)}
                </div>
              )}
            </div>
          </button>
        </DialogTrigger>

        {/* Actions - Rendered outside DialogTrigger so they don't open the modal */}
        {!compact && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 w-full sm:w-auto">
            {scadenza.status !== 'completata' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  onComplete?.(scadenza.id)
                }}
                className="flex-1 sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-[10px] sm:text-sm px-1 sm:px-2 whitespace-nowrap"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate">Completata</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" className="flex-1 sm:w-auto text-[10px] sm:text-sm px-1 sm:px-2 whitespace-nowrap" asChild>
              <a
                href={safeExternalUrl(scadenza.action_url) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!safeExternalUrl(scadenza.action_url)) e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <span className="truncate">Portale</span>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-1.5 flex-shrink-0" />
              </a>
            </Button>
          </div>
        )}

      </div>

      <ScadenzaCardModalContent
        scadenza={scadenza}
        onComplete={onComplete}
        onDelete={onDelete}
        onEdit={(s) => {
          setScadenzaToEdit(s)
          setIsOpen(false)
          setIsEditOpen(true)
        }}
        onClose={() => setIsOpen(false)}
      />
    </Dialog>

    <EditScadenzaModal
      open={isEditOpen}
      onOpenChange={setIsEditOpen}
      scadenza={scadenzaToEdit}
      onSave={(updated) => { onEdit?.(updated) }}
    />
    </>
  )
}
