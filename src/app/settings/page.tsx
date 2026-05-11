'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { User, CreditCard, Bell, Save, ExternalLink, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'

// ── Tipi ──────────────────────────────────────────────────────────────────────

interface Subscription {
  status?: string
  plan?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  cancel_at?: string | null
}

interface NotificationPrefs {
  email: boolean
  push: boolean
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-gray-700'
      )}
    >
      <span className={cn(
        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
        checked ? 'right-1' : 'left-1'
      )} />
    </button>
  )
}

// ── Tab Profilo ────────────────────────────────────────────────────────────────

function ProfileTab() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUsername((user.user_metadata as any)?.username ?? '')
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { username: username.trim() } })
    setSaving(false)
    if (!error) {
      setSaved(true)
      router.refresh()
      savedTimerRef.current = setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-gray-800">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profilo</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Le tue informazioni personali e di accesso.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="settings-username" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Username <span className="text-slate-400 font-normal">— visibile in alto a destra e nei saluti</span>
          </label>
          <input
            id="settings-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="es. mario_rossi"
            className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="settings-email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email</label>
          <input
            id="settings-email"
            type="email"
            disabled
            value={email}
            className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm text-slate-500 dark:text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">L&apos;email non può essere modificata.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !username.trim()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
        >
          {saving ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Salvato!' : 'Salva modifiche'}
        </button>
      </div>
    </div>
  )
}

// ── Tab Fatturazione ───────────────────────────────────────────────────────────

function BillingTab() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const refreshSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSubscription((user?.app_metadata as any)?.subscription ?? null)
  }

  useEffect(() => {
    refreshSubscription().then(() => setLoading(false))
  }, [])

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
      else setPortalLoading(false)
    } catch {
      setPortalLoading(false)
    }
  }

  const cancelSubscription = async () => {
    setCancelLoading(true)
    setShowCancelConfirm(false)
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
      const data = await res.json()
      if (data?.ok) {
        await refreshSubscription()
      }
    } finally {
      setCancelLoading(false)
    }
  }

  const startCheckout = async (plan: string) => {
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
      else setCheckoutLoading(null)
    } catch {
      setCheckoutLoading(null)
    }
  }

  const isActive = subscription?.status === 'active'
  const isCanceling = subscription?.status === 'canceling'
  const hasAccess = isActive || isCanceling
  const currentPlan = subscription?.plan ?? null
  const otherPlan = currentPlan === 'basic' ? 'pro' : currentPlan === 'pro' ? 'basic' : null

  const cancelAtFormatted = subscription?.cancel_at
    ? new Date(subscription.cancel_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (loading) return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-gray-800">
      <div className="h-32 flex items-center justify-center text-slate-400">Caricamento…</div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-gray-800 space-y-5">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Fatturazione & Piani</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Gestisci il tuo abbonamento.</p>
        </div>
      </div>

      {/* Piano corrente */}
      <div className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {hasAccess && currentPlan
              ? `Piano ${PLANS[currentPlan as keyof typeof PLANS]?.name ?? currentPlan}`
              : 'Nessun piano attivo'}
          </p>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {isCanceling && cancelAtFormatted
              ? `Accesso attivo fino al ${cancelAtFormatted}`
              : hasAccess && currentPlan
              ? `${PLANS[currentPlan as keyof typeof PLANS]?.price ?? ''}/mese`
              : 'Scegli un piano per sbloccare tutte le funzionalità'}
          </p>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold',
          isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : isCanceling
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-slate-200 text-slate-600 dark:bg-gray-700 dark:text-gray-400'
        )}>
          {isActive ? 'Attivo' : isCanceling ? 'In cancellazione' : 'Inattivo'}
        </span>
      </div>

      {/* Banner cancellazione in corso */}
      {isCanceling && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Abbonamento in cancellazione.
            {cancelAtFormatted
              ? ` Continuerai ad avere accesso fino al ${cancelAtFormatted}.`
              : ' Continuerai ad avere accesso fino alla fine del periodo corrente.'}
          </p>
        </div>
      )}

      {/* Azioni */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {hasAccess && subscription?.stripe_customer_id && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm"
          >
            {portalLoading
              ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <ExternalLink className="w-4 h-4" />}
            Gestisci abbonamento
          </button>
        )}

        {isActive && otherPlan && (
          <button
            onClick={() => startCheckout(otherPlan)}
            disabled={checkoutLoading === otherPlan}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-sm font-semibold transition"
          >
            {checkoutLoading === otherPlan
              ? <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
              : null}
            Passa a {PLANS[otherPlan as keyof typeof PLANS]?.name}
          </button>
        )}

        {isActive && subscription?.stripe_subscription_id && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold transition"
          >
            <XCircle className="w-4 h-4" />
            Annulla abbonamento
          </button>
        )}

        {!hasAccess && (
          <>
            <button
              onClick={() => startCheckout('basic')}
              disabled={!!checkoutLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-sm font-semibold transition"
            >
              {checkoutLoading === 'basic'
                ? <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                : null}
              Abbonati Basic — €9,90/mese
            </button>
            <button
              onClick={() => startCheckout('pro')}
              disabled={!!checkoutLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm"
            >
              {checkoutLoading === 'pro'
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : null}
              Abbonati Pro — €19,90/mese
            </button>
          </>
        )}
      </div>

      {/* Conferma cancellazione */}
      {showCancelConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Confermi la cancellazione?</p>
          <p className="text-sm text-red-700 dark:text-red-400">
            L&apos;abbonamento verrà cancellato alla fine del periodo corrente. Continuerai ad avere accesso fino alla data di scadenza.
          </p>
          <div className="flex gap-2">
            <button
              onClick={cancelSubscription}
              disabled={cancelLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              {cancelLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
              Sì, cancella
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab Notifiche ──────────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({ email: true, push: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const saved = (user?.user_metadata as any)?.notifications
      if (saved) setPrefs(saved)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { notifications: prefs } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const rows: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: 'email', label: 'Email', desc: 'Ricevi un riepilogo settimanale e alert prima delle scadenze.' },
    { key: 'push', label: 'Push Notifications', desc: 'Ricevi avvisi istantanei nel browser per le scadenze urgenti.' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-gray-800">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preferenze Notifiche</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Scegli come e quando ricevere avvisi sulle tue scadenze.</p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{label}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400">{desc}</p>
            </div>
            <Toggle
              checked={prefs[key]}
              onChange={v => setPrefs(p => ({ ...p, [key]: v }))}
            />
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            {saving ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Salvato!' : 'Salva preferenze'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pagina principale ──────────────────────────────────────────────────────────

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'profile'

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'billing', label: 'Fatturazione', icon: CreditCard },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Impostazioni</h1>
        <p className="text-slate-500 dark:text-gray-400">Gestisci il tuo account, i piani e le preferenze di notifica.</p>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(`/settings?tab=${tab.id}`)}
            className={cn(
              'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
            )}
          >
            <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'profile'       && <ProfileTab />}
        {activeTab === 'billing'       && <BillingTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Caricamento impostazioni…</div>}>
      <SettingsContent />
    </Suspense>
  )
}
