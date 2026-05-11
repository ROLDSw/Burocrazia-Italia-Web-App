import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 3 registrazioni per IP ogni ora (anti account bombing)
  // x-real-ip è impostato da Vercel edge e non è spoofable dal client
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'
  const rl = await checkRateLimit(`signup:${ip}`, { limit: 3, windowMs: 60 * 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppi account creati. Riprova più tardi.' },
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
    return NextResponse.json({ error: 'Dati non validi. Controlla email e password.' }, { status: 400 })
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

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    const safeMessage =
      error.status === 422 ? 'Password troppo corta o non valida.' : 'Registrazione non riuscita. Verifica i dati inseriti.'
    return NextResponse.json({ error: safeMessage }, { status: 400 })
  }

  if (!data.session) {
    return NextResponse.json(
      { message: 'Controlla la tua email per confermare la registrazione.' },
      { status: 202 }
    )
  }

  return NextResponse.json({ user: { id: data.user!.id, email: data.user!.email } })
}
