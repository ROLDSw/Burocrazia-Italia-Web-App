import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-gray-800 p-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
            <CheckCircle className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pagamento confermato!
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
            Il tuo abbonamento è ora attivo. Puoi iniziare a gestire tutte le tue scadenze burocratiche.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-sm transition shadow-sm shadow-indigo-500/20"
          >
            Vai alla Dashboard
          </Link>
          <p className="mt-4 text-xs text-slate-400 dark:text-gray-600">
            Riceverai una conferma via email con i dettagli dell&apos;abbonamento.
          </p>
        </div>
      </div>
    </div>
  )
}
