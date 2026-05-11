import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KpiWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  variant?: 'default' | 'urgent' | 'warning' | 'success'
  onClick?: () => void
}

const variantStyles = {
  default: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20',
  urgent: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  warning: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  success: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
}

export function KpiWidget({ title, value, subtitle, icon, trend, variant = 'default', onClick }: KpiWidgetProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex flex-col rounded-[2rem] bg-card p-4 sm:p-6 border-none transition-all duration-300 shadow-[var(--shadow-neo)] dark:shadow-[var(--shadow-neo)] hover:-translate-y-1 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 text-left w-full",
        onClick && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      )}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        {icon && (
          <div className={cn('p-1.5 sm:p-2 rounded-lg', variantStyles[variant])}>
            {icon && <span className="w-4 h-4 sm:w-5 sm:h-5 block">{icon}</span>}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {subtitle && (
          <span className="text-sm text-slate-500 dark:text-gray-400">{subtitle}</span>
        )}
      </div>
      {trend && (
        <div className="mt-2 sm:mt-4 flex items-center text-[10px] sm:text-sm">
          <span className={cn(
            'font-medium',
            trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="ml-2 text-slate-500 dark:text-gray-400">{trend.label}</span>
        </div>
      )}
    </Tag>
  )
}
