import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function isSubscribed(user: User | null): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const status = (user?.app_metadata as any)?.subscription?.status
  return status === 'active' || status === 'canceling'
}
