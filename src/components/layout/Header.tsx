'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Search, Menu, PanelLeftClose, PanelLeftOpen, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from './ThemeToggle'
import { Input } from '../ui/Input'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog'
import { mockScadenze, Scadenza } from '@/data/scadenze'
import { CategoryIcon } from '../scadenze/CategoryIcon'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu'

export interface HeaderProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ toggleSidebar, isSidebarOpen = true }: HeaderProps) {
  const router = useRouter()
  const today = new Date().toISOString()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const fetchUser = (user: User | null) => {
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const username = (user.user_metadata as any)?.username as string | undefined
      setUserEmail(username || user.email || '')
      setUserId(user.id)
    }

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchUser(user)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const displayName = userEmail
    ? userEmail.split('@')[0]
    : userId
      ? `Utente ${userId.slice(0, 6)}`
      : 'Caricamento…'
  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U'

  const hour = new Date().getHours()
  const greeting = hour < 18 ? 'Buongiorno' : 'Buona sera'

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'IMU in scadenza a Dicembre', desc: "Ricordati di preparare l'F24 per la seconda rata.", type: 'urgent' },
    { id: 2, title: 'Nuova funzionalità aggiunta', desc: 'Scopri la nuova vista calendario.', type: 'info' }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const searchResults = searchQuery.trim() === '' ? [] : mockScadenze.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const markAllAsRead = () => {
    setNotifications([])
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const [showFeaturesModal, setShowFeaturesModal] = useState(false)

  const handleNotificationClick = (id: number) => {
    if (id === 2) {
      setShowFeaturesModal(true)
    }
    removeNotification(id)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b-2 border-slate-200 dark:border-white/10 bg-transparent px-4 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8 shadow-none">
      <div className="flex flex-1 items-center gap-2 sm:gap-4">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 lg:hidden" />
            <div className="hidden lg:block">
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </div>
          </button>
        )}

        {/* Mobile Logo */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2 mr-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
        </Link>

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[13px] sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {greeting}, {displayName}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-gray-400">{formatDate(today)}</p>
        </div>
      </div>

      <div className="flex items-center gap-x-2 sm:gap-x-6">
        <div className="relative max-w-sm hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-slate-500 dark:text-gray-400 z-10" />
          <Input
            type="search"
            placeholder="Cerca scadenze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-64 lg:w-80 bg-slate-50 pl-9 dark:bg-gray-800 border-slate-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-slate-200 dark:border-gray-800 max-h-96 overflow-y-auto z-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-center text-slate-500 dark:text-gray-400">
                  Nessun risultato trovato per "{searchQuery}"
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {searchResults.map(scadenza => (
                    <button
                      key={scadenza.id}
                      onClick={() => {
                        router.push('/' + scadenza.category)
                        setSearchQuery('')
                        setIsSearchFocused(false)
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <div className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800">
                        <CategoryIcon category={scadenza.category} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{scadenza.title}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                          Scade il {new Date(scadenza.due_date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-500 dark:text-gray-500 dark:hover:text-gray-400">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-gray-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifiche {notifications.length > 0 && `(${notifications.length})`}</h3>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Segna tutte come lette
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-gray-400">
                  Nessuna nuova notifica.
                </div>
              ) : (
                notifications.map(notification => {
                  const content = (
                    <>
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        notification.type === 'urgent' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      )}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{notification.desc}</p>
                      </div>
                    </>
                  );

                  return notification.id === 1 ? (
                    <Link
                      key={notification.id}
                      href="/immobili"
                      onClick={() => removeNotification(notification.id)}
                      className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-slate-100 p-2 text-center dark:border-gray-800">
              <Link href="/dashboard" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white block w-full py-1">
                Vedi tutte le notifiche sulla dashboard
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-gray-800" aria-hidden="true" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-x-3 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
                {avatarLetter}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-slate-900 dark:text-white" aria-hidden="true">
                  {displayName}
                </span>
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=profile" className="w-full">Impostazioni Profilo</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=billing" className="w-full">Fatturazione & Piani</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=notifications" className="w-full">Gestione Notifiche</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                  router.refresh()
                }}
                className="w-full text-left text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
              >
                Esci
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novità: Vista Calendario</DialogTitle>
            <DialogDescription className="sr-only">
              Scopri la nuova funzionalità di visualizzazione calendario per le tue scadenze mensili.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                Ora puoi visualizzare tutte le tue scadenze mensili in un comodo calendario interattivo.
                Questa funzionalità ti permette di avere una panoramica visiva immediata dei giorni più critici del mese.
              </p>
            </div>
            <div className="flex justify-end">
              <Link
                href="/calendario"
                onClick={() => setShowFeaturesModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2"
              >
                Vai al Calendario
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
