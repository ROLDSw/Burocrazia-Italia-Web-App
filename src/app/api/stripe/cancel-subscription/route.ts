import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const rl = await checkRateLimit(`cancel:${user.id}`, { limit: 5, windowMs: 60 * 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova più tardi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) } }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appMeta = user.app_metadata as any
  const subscriptionId = appMeta?.subscription?.stripe_subscription_id
  const customerId = appMeta?.subscription?.stripe_customer_id
  const plan = appMeta?.subscription?.plan ?? ''

  if (!subscriptionId) {
    return NextResponse.json({ error: 'Nessun abbonamento attivo da cancellare' }, { status: 400 })
  }

  let immediate = false
  try {
    const body = await request.json()
    immediate = Boolean(body?.immediate)
  } catch {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  let cancelAt: string | null = null

  try {
    if (immediate) {
      await stripe.subscriptions.cancel(subscriptionId)
    } else {
      const updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
      if (updated.cancel_at) {
        cancelAt = new Date(updated.cancel_at * 1000).toISOString()
      }
    }
  } catch {
    return NextResponse.json({ error: 'Errore Stripe. Riprova più tardi.' }, { status: 500 })
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        subscription: {
          status: immediate ? 'canceled' : 'canceling',
          plan: immediate ? '' : plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          cancel_at: cancelAt,
        },
      },
    })
  } catch {
    return NextResponse.json({ error: 'Abbonamento aggiornato su Stripe ma errore interno. Contatta il supporto.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: immediate ? 'canceled' : 'canceling', cancel_at: cancelAt })
}
