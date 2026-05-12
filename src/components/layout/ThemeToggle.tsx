'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-16 rounded-full bg-slate-100 dark:bg-gray-800 animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        isDark ? 'bg-gray-800' : 'bg-slate-200'
      )}
      title={isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
    >
      <span className="sr-only">Cambia tema</span>
      <span
        className={cn(
          'pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out',
          isDark ? 'translate-x-7' : 'translate-x-0.5'
        )}
      >
        <span
          className={cn(
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-300',
            isDark ? 'opacity-0 ease-out' : 'opacity-100 ease-in'
          )}
          aria-hidden="true"
        >
          <Sun className="h-4 w-4 text-amber-500" />
        </span>
        <span
          className={cn(
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-300',
            isDark ? 'opacity-100 ease-in' : 'opacity-0 ease-out'
          )}
          aria-hidden="true"
        >
          <Moon className="h-4 w-4 text-indigo-600" />
        </span>
      </span>
    </button>
  )
}
