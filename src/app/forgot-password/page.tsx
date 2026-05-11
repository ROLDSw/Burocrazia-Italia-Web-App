'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, MailCheck } from 'lucide-react'

import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setIsLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Errore durante l\'invio. Riprova.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Burocrazia</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Reimposta la tua password</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-gray-800 p-8">
          {sent ? (
            /* Stato successo */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
                <MailCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email inviata!</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                Abbiamo inviato un link di reimpostazione a{' '}
                <span className="font-medium text-slate-700 dark:text-gray-300">{email}</span>.
                <br /><br />
                Clicca il link nell&apos;email per scegliere una nuova password.
                Il link è valido per <strong>1 ora</strong>.
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
                Non trovi l&apos;email? Controlla la cartella spam.
              </p>
            </div>
          ) : (
            /* Form email */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">
                  Inserisci l&apos;email del tuo account e ti manderemo un link per reimpostare la password.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}

                  placeholder="nome@studio.it"
                  className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm transition shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Invio in corso…
                  </>
                ) : (
                  'Invia link di reimpostazione'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Torna al login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-gray-600">
          © {new Date().getFullYear()} Burocrazia — Tutti i diritti riservati
        </p>
      </div>
    </div>
  )
}
