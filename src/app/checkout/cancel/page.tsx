import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 border border-slate-100 dark:border-gray-800 p-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-gray-800 mb-6">
            <XCircle className="h-9 w-9 text-slate-400 dark:text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pagamento annullato
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
            Hai annullato il checkout. Nessun addebito è stato effettuato. Puoi scegliere un piano in qualsiasi momento.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-sm transition shadow-sm shadow-indigo-500/20"
            >
              Scegli un piano
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-semibold py-3 text-sm transition hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
