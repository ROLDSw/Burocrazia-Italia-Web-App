'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

import { ThemeToggle } from '@/components/layout/ThemeToggle'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const [verified, setVerified] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => router.push('/dashboard'), 2000)
    return () => clearTimeout(timer)
  }, [done, router])

  // Verifica il token all'arrivo sulla pagina
  useEffect(() => {
    if (!tokenHash || type !== 'recovery') {
      setVerifyError('Link non valido o scaduto. Richiedi un nuovo link dalla pagina di login.')
      return
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setVerifyError('Il link è scaduto o non è valido. Richiedine uno nuovo.')
        } else {
          setVerified(true)
        }
      })
  }, [tokenHash, type])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading) return

    if (password !== confirm) {
      setError('Le password non coincidono')
      return
    }
    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri')
      return
    }

    setIsLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Impossibile aggiornare la password. Riprova o richiedi un nuovo link.')
      setIsLoading(false)
      return
    }

    setDone(true)
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
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Nuova password</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-gray-800 p-8">

          {/* Errore token */}
          {verifyError && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">{verifyError}</p>
              <a
                href="/forgot-password"
                className="inline-block mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Richiedi un nuovo link
              </a>
            </div>
          )}

          {/* Verifica in corso */}
          {!verifyError && !verified && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-gray-400">Verifica del link in corso…</p>
            </div>
          )}

          {/* Successo */}
          {done && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Password aggiornata!</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Stai per essere reindirizzato alla dashboard…
              </p>
            </div>
          )}

          {/* Form nuova password */}
          {verified && !done && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Scegli una nuova password per il tuo account.
              </p>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Nuova password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
  
                    placeholder="Min. 8 caratteri"
                    className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Conferma password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}

                  placeholder="••••••••"
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
                    Salvataggio…
                  </>
                ) : (
                  'Salva nuova password'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-gray-600">
          © {new Date().getFullYear()} Burocrazia — Tutti i diritti riservati
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
