/**
 * Valida le variabili d'ambiente server-side obbligatorie al momento del primo import.
 * Se una variabile manca, l'app fallisce immediatamente con un messaggio chiaro
 * invece di farlo silenziosamente a runtime durante una richiesta utente.
 */

const SERVER_REQUIRED = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ANTHROPIC_API_KEY',
  'CRON_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const

if (typeof window === 'undefined') {
  const missing = SERVER_REQUIRED.filter(k => !process.env[k])
  if (missing.length > 0) {
    throw new Error(
      `[env] Variabili d'ambiente obbligatorie mancanti: ${missing.join(', ')}\n` +
      'Configura queste variabili in .env.local prima di avviare l\'app.'
    )
  }
}
