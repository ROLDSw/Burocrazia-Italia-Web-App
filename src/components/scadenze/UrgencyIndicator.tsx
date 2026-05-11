import { UrgencyLevel } from '@/data/scadenze'
import { URGENCY_MAPPING } from '@/data/constants'
import { cn } from '@/lib/utils'

interface UrgencyIndicatorProps {
  urgency: UrgencyLevel
  className?: string
  showLabel?: boolean
}

export function UrgencyIndicator({ urgency, className, showLabel = false }: UrgencyIndicatorProps) {
  const { color, label } = URGENCY_MAPPING[urgency]
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('inline-block w-2.5 h-2.5 rounded-full border', color.split(' ').find(c => c.startsWith('bg-')), color.split(' ').find(c => c.startsWith('border-')))} />
      {showLabel && (
        <span className={cn('text-xs font-medium', color.split(' ').find(c => c.startsWith('text-')))}>
          {label}
        </span>
      )}
    </div>
  )
}
