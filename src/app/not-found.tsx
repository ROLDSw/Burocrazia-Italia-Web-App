import Link from 'next/link'
import { Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-900 px-4">
      <div className="text-center max-w-md w-full">
        {/* 404 number */}
        <div className="relative inline-block mb-6">
          <span className="text-[8rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 select-none">
            404
          </span>
          <div className="absolute inset-0 blur-3xl bg-indigo-400/20 dark:bg-indigo-500/10 -z-10 rounded-full" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-gray-800 p-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Pagina non trovata
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed mb-8">
            Ops! La pagina che stai cercando non esiste o è stata spostata.
            Controlla l&apos;indirizzo oppure torna da dove sei venuto.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-gray-200 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Homepage
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-gray-600">
          © {new Date().getFullYear()} Burocrazia — Tutti i diritti riservati
        </p>
      </div>
    </div>
  )
}
