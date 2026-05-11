'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Car,
  FileText,
  Heart,
  Settings,
  Building,
  Calendar
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendario', href: '/calendario', icon: Calendar },
  { name: 'Mobilità', href: '/mobilita', icon: Car },
  { name: 'Certificazioni', href: '/certificazioni', icon: FileText },
  { name: 'Immobili & Utenze', href: '/immobili', icon: Building },
  { name: 'Welfare', href: '/welfare', icon: Heart },
]

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-transparent backdrop-blur-md border-r-2 border-slate-200 dark:border-white/10">
      <Link
        href="/dashboard"
        className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-gray-800 hover:opacity-90 transition-opacity group"
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 text-white shadow-sm group-hover:shadow-indigo-500/30 transition-all">
          <FileText className="h-5 w-5" />
        </div>
        <span className="ml-3 text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Burocrazia
        </span>
      </Link>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose?.()
                }}
                className={cn(
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50',
                  'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-slate-200 p-3 dark:border-gray-800">
        <Link
          href="/settings"
          className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
          Impostazioni
        </Link>
      </div>
    </div>
  )
}
