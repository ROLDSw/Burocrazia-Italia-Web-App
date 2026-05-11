import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = ""
  switch (variant) {
    case "default":
      variantStyles = "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100/80"
      break
    case "secondary":
      variantStyles = "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-800/80"
      break
    case "destructive":
      variantStyles = "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80"
      break
    case "outline":
      variantStyles = "text-slate-950 dark:text-gray-50 border-slate-200 dark:border-gray-700"
      break
    case "success":
      variantStyles = "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      break
  }

  return (
    <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variantStyles, className)} {...props} />
  )
}

export { Badge }
