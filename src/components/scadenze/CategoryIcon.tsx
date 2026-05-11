import { Car, FileText, Home, Heart, LucideIcon } from 'lucide-react'
import { CategoryType } from '@/data/scadenze'
import { cn } from '@/lib/utils'

const iconMap: Record<CategoryType, LucideIcon> = {
  mobilita: Car,
  certificazioni: FileText,
  immobili: Home,
  welfare: Heart
}

interface CategoryIconProps {
  category: CategoryType
  className?: string
  size?: number
}

export function CategoryIcon({ category, className, size = 20 }: CategoryIconProps) {
  const Icon = iconMap[category]
  
  if (!Icon) return null
  
  return <Icon className={cn('text-slate-500 dark:text-gray-400', className)} size={size} />
}
