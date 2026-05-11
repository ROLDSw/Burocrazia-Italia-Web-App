import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { error, count } = await supabase
    .from('scadenze')
    .delete({ count: 'exact' })
    .eq('status', 'completata')
    .lt('due_date', thirtyDaysAgo.toISOString())

  if (error) {
    console.error('[cleanup] Errore eliminazione scadenze:', error)
    return NextResponse.json({ error: 'Errore durante il cleanup' }, { status: 500 })
  }

  console.log(`[cleanup] Eliminate ${count ?? 0} scadenze completate (due_date < ${thirtyDaysAgo.toISOString().slice(0, 10)})`)
  return NextResponse.json({ deleted: count ?? 0 })
}
