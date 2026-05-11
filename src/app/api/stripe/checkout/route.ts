import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PLANS, type PlanKey } from '@/lib/plans'
import { checkRateLimit } from '@/lib/rate-limit'

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

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  // Rate limiting: 5 checkout per utente per ora (anti-spam Stripe)
  const rl = await checkRateLimit(`checkout:${user.id}`, { limit: 5, windowMs: 60 * 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) } }
    )
  }

  let plan: PlanKey
  try {
    const body = await request.json()
    plan = body?.plan
  } catch {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  if (!plan || !PLANS[plan] || !STRIPE_PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
    })
    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Errore interno. Riprova più tardi.' }, { status: 500 })
  }
}
