import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const email: string = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!email) {
    return NextResponse.json({ error: 'Email obbligatoria' }, { status: 400 })
  }

  if (email.length > 254) {
    // Risponde sempre ok per non rivelare se l'email esiste
    return NextResponse.json({ ok: true })
  }

  // Rate limiting: 3 richieste per email ogni ora (anti-spam)
  const rl = await checkRateLimit(`forgot:${email.toLowerCase()}`, { limit: 3, windowMs: 60 * 60_000 })
  if (!rl.success) {
    // Risponde ok comunque per non rivelare informazioni sull'account
    return NextResponse.json({ ok: true })
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

  // Risponde sempre ok per non rivelare se l'email esiste nel database
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  return NextResponse.json({ ok: true })
}
