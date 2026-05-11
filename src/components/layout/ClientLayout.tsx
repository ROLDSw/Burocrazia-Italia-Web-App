'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

const FULLSCREEN_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/checkout']

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Apre il sidebar su desktop dopo l'hydration (evita mismatch server/client)
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true)
    }
  }, [])

  const isFullscreen = FULLSCREEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:block transition-all duration-300 ease-in-out flex-shrink-0 h-full overflow-hidden shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-0"
        )}
      >
        <div className="w-64 h-full">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden transition-all duration-300">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
