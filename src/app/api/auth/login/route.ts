import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 10 tentativi per IP ogni 15 minuti (anti brute-force)
  // x-real-ip è impostato da Vercel edge e non è spoofable dal client
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'
  const rl = await checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppi tentativi di accesso. Riprova tra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) } }
    )
  }

  const body = await request.json()
  const email: string = typeof body?.email === 'string' ? body.email.trim() : ''
  const password: string = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password obbligatori' }, { status: 400 })
  }

  if (email.length > 254 || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 400 })
  }

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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } })
}
