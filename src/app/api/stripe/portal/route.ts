import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
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
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  // Rate limiting: 10 aperture del portale per utente ogni ora (anti-abuse)
  const rl = await checkRateLimit(`portal:${user.id}`, { limit: 10, windowMs: 60 * 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova più tardi.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) } }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerId = (user.app_metadata as any)?.subscription?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json({ error: 'Nessun abbonamento attivo' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings?tab=billing`,
    })
    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Errore interno. Riprova più tardi.' }, { status: 500 })
  }
}
