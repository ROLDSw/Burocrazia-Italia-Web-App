import { Scadenza } from '@/data/scadenze'
import { URGENCY_MAPPING } from '@/data/constants'
import { CategoryIcon } from './CategoryIcon'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ExternalLink, CheckCircle2, Calendar, FileText, CreditCard, Trash2, Pencil } from 'lucide-react'
import { cn, safeExternalUrl } from '@/lib/utils'
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog'

interface ScadenzaCardModalContentProps {
  scadenza: Scadenza
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (scadenza: Scadenza) => void
  onClose: () => void
}

export function ScadenzaCardModalContent({ scadenza, onComplete, onDelete, onEdit, onClose }: ScadenzaCardModalContentProps) {
  const urgencyInfo = URGENCY_MAPPING[scadenza.urgency]

  return (
    <DialogContent className="sm:max-w-xl bg-white/40 dark:bg-slate-950/40 backdrop-blur-[32px] rounded-[2.5rem] sm:rounded-[3rem] border-white/40 dark:border-white/10 shadow-2xl p-5 sm:p-8 w-[92vw] sm:w-full overflow-hidden max-h-[92vh] flex flex-col">
      <DialogHeader className="mb-2">
        <div className="flex items-center gap-3">
          <CategoryIcon category={scadenza.category} size={24} className="text-indigo-600 dark:text-indigo-400" />
          <DialogTitle className="text-xl sm:text-2xl">{scadenza.title}</DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          {scadenza.description || `Dettaglio scadenza: ${scadenza.title}`}
        </DialogDescription>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="text-[10px] py-0">{scadenza.subcategory}</Badge>
          <Badge variant="secondary" className={cn("text-[10px] py-0", urgencyInfo.color)}>{urgencyInfo.label}</Badge>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 w-fit mb-2">
                <FileText className="w-3 h-3 text-indigo-500" />
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Descrizione</h4>
              </div>
              <div className="pl-3 border-l-2 border-indigo-500/20">
                <p className="text-sm sm:text-base text-slate-900 dark:text-white leading-snug whitespace-pre-wrap break-words">{scadenza.description || 'Nessuna descrizione.'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 w-fit mb-2">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Scadenza</h4>
              </div>
              <div className="pl-3 border-l-2 border-indigo-500/20">
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  {new Date(scadenza.due_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 shadow-sm", urgencyInfo.color, "bg-white/50 dark:bg-black/20")}>
                  {scadenza.days_remaining < 0
                    ? `Scaduta da ${Math.abs(scadenza.days_remaining)} giorni`
                    : scadenza.days_remaining === 0
                    ? 'Scade oggi'
                    : `Mancano ${scadenza.days_remaining} giorni`}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {scadenza.amount && (
              <div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 w-fit mb-2">
                  <CreditCard className="w-3 h-3 text-indigo-500" />
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Importo Previsto</h4>
                </div>
                <div className="pl-3 border-l-2 border-indigo-500/20">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: scadenza.currency || 'EUR' }).format(scadenza.amount)}
                  </p>
                </div>
              </div>
            )}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm"
            onClick={() => {
              onDelete?.(scadenza.id)
              onClose()
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Elimina
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 sm:flex-none text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 text-xs sm:text-sm"
            onClick={() => { onEdit?.(scadenza); onClose() }}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Modifica
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 order-1 sm:order-2">
          <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto text-xs sm:text-sm">
            <a href={safeExternalUrl(scadenza.action_url) || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!safeExternalUrl(scadenza.action_url)) e.preventDefault() }}>
              Portale <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
          {scadenza.status !== 'completata' && (
            <Button 
              size="sm"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
              onClick={() => {
                onComplete?.(scadenza.id)
                onClose()
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Completa
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  )
}
