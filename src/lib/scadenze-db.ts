import { supabase } from './supabase'
import { Scadenza, UrgencyLevel, mockScadenze } from '@/data/scadenze'

async function ensureSession(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user.id
  throw new Error('Utente non autenticato')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeUrgency(dueDate: string): { urgency: UrgencyLevel; days_remaining: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const days_remaining = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  let urgency: UrgencyLevel
  if (days_remaining < 0)       urgency = 'scaduta'
  else if (days_remaining <= 7)  urgency = 'urgente'
  else if (days_remaining <= 30) urgency = 'in_scadenza'
  else                           urgency = 'ok'
  return { urgency, days_remaining }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToScadenza(row: Record<string, any>): Scadenza {
  const { urgency, days_remaining } = computeUrgency(row.due_date as string)
  return {
    id:                    row.id as string,
    title:                 row.title as string,
    description:           row.description as string,
    category:              row.category as Scadenza['category'],
    subcategory:           row.subcategory as string,
    urgency,
    due_date:              row.due_date as string,
    days_remaining,
    amount:                row.amount != null ? Number(row.amount) : undefined,
    currency:              row.currency ?? undefined,
    renewal_period_months: row.renewal_period_months ?? undefined,
    notes:                 row.notes ?? undefined,
    action_url:            row.action_url ?? undefined,
    status:                row.status as Scadenza['status'],
    owner_type:            row.owner_type ?? undefined,
  }
}

function scadenzaToRow(s: Scadenza, userId: string) {
  return {
    id:                    s.id,
    user_id:               userId,
    title:                 s.title,
    description:           s.description,
    category:              s.category,
    subcategory:           s.subcategory,
    due_date:              s.due_date,
    amount:                s.amount ?? null,
    currency:              s.currency ?? null,
    renewal_period_months: s.renewal_period_months ?? null,
    notes:                 s.notes ?? null,
    action_url:            s.action_url ?? null,
    status:                s.status,
    owner_type:            s.owner_type ?? null,
  }
}

// ── Migration da localStorage ─────────────────────────────────────────────────

const LS_KEY = 'burocrazia-scadenze'
const LS_MIGRATED_KEY = 'burocrazia-migrated-to-supabase'

async function migrateFromLocalStorage(userId: string): Promise<void> {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(LS_MIGRATED_KEY) === 'done') return

  const raw = localStorage.getItem(LS_KEY)
  if (!raw) {
    localStorage.setItem(LS_MIGRATED_KEY, 'done')
    return
  }

  try {
    const localScadenze: Scadenza[] = JSON.parse(raw)
    if (localScadenze.length === 0) {
      localStorage.setItem(LS_MIGRATED_KEY, 'done')
      return
    }
    // Deduplica per ID (i mock hanno duplicati)
    const unique = new Map(localScadenze.map(s => [s.id, s]))
    const rows = Array.from(unique.values()).map(s => scadenzaToRow(s, userId))
    const { error } = await supabase.from('scadenze').upsert(rows, { onConflict: 'id' })
    if (!error) localStorage.setItem(LS_MIGRATED_KEY, 'done')
  } catch {
    // Silenzioso — riprova al prossimo caricamento
  }
}

// ── CRUD pubblico ─────────────────────────────────────────────────────────────

function filterCompletateVecchie(scadenze: Scadenza[]): Scadenza[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return scadenze.filter(
    s => !(s.status === 'completata' && new Date(s.due_date) < cutoff)
  )
}

export async function loadScadenze(): Promise<Scadenza[]> {
  try {
    const userId = await ensureSession()
    await migrateFromLocalStorage(userId)

    const { data, error } = await supabase
      .from('scadenze')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) return filterCompletateVecchie(mockScadenze)
    return filterCompletateVecchie(data.map(rowToScadenza))
  } catch {
    console.warn('[scadenze-db] DB non disponibile, uso mock')
    return filterCompletateVecchie(mockScadenze)
  }
}

export async function insertScadenza(scadenza: Scadenza): Promise<void> {
  const userId = await ensureSession()
  const { error } = await supabase.from('scadenze').insert(scadenzaToRow(scadenza, userId))
  if (error) throw error
}

export async function updateScadenzaStatus(id: string, status: Scadenza['status']): Promise<void> {
  const userId = await ensureSession()
  const { error } = await supabase
    .from('scadenze')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function updateScadenza(scadenza: Scadenza): Promise<void> {
  const userId = await ensureSession()
  const row = scadenzaToRow(scadenza, userId)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, user_id: _uid, ...fields } = row
  const { error } = await supabase
    .from('scadenze')
    .update(fields)
    .eq('id', scadenza.id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteScadenza(id: string): Promise<void> {
  const userId = await ensureSession()
  const { error } = await supabase
    .from('scadenze')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}
