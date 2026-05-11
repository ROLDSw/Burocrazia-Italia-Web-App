import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { Persona } from '@/data/persone'
import { Scadenza } from '@/data/scadenze'
import { createClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 30

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface IcebreakerRequest {
  persona: Persona
  scadenzeUrgenti: Scadenza[]
  period: string
}

/** Rimuove caratteri che possono alterare la struttura del prompt */
function sanitizeForPrompt(s: string, maxLen = 100): string {
  return s.slice(0, maxLen).replace(/[`\n\r]/g, ' ').trim()
}

export async function POST(request: Request) {
  // Verifica autenticazione
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Solo utenti con abbonamento attivo possono usare la funzione AI (costa denaro)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subStatus = (user.app_metadata as any)?.subscription?.status
  if (subStatus !== 'active' && subStatus !== 'canceling') {
    return NextResponse.json({ error: 'Abbonamento richiesto' }, { status: 403 })
  }

  // Rate limiting: 5 chiamate/minuto per utente (API a pagamento)
  const rl = await checkRateLimit(`icebreaker:${user.id}`, { limit: 5, windowMs: 60_000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra qualche secondo.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) },
      }
    )
  }

  let body: IcebreakerRequest | null = null

  try {
    body = await request.json()

    if (
      !body ||
      typeof body.persona?.name !== 'string' ||
      !Array.isArray(body.scadenzeUrgenti) ||
      typeof body.period !== 'string'
    ) {
      return NextResponse.json({ error: 'Dati richiesta non validi' }, { status: 400 })
    }

    const { persona, scadenzeUrgenti, period } = body

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }

    // Sanitizzazione anti-prompt-injection: limita lunghezza e rimuove caratteri di controllo
    const safeName       = sanitizeForPrompt(persona.name, 60)
    const safeProfession = sanitizeForPrompt(String(persona.profession), 40)
    const safeCity       = sanitizeForPrompt(persona.city, 40)
    const safePeriod     = sanitizeForPrompt(period, 30)

    const scadenzeList = scadenzeUrgenti
      .slice(0, 5)
      .map(s => `- ${sanitizeForPrompt(s.title, 80)} (Scade il: ${new Date(s.due_date).toLocaleDateString('it-IT')})`)
      .join('\n')

    const prompt = `Sei un assistente burocratico intelligente per professionisti italiani.
Genera un messaggio di benvenuto personalizzato per ${safeName}, ${safeProfession} di ${safeCity}.
Ha ${persona.num_scadenze_attive} scadenze attive, di cui ${persona.urgenti} urgenti per il periodo: ${safePeriod}.
Le più urgenti sono:
${scadenzeList}

Il messaggio deve:
- Essere in italiano, tono professionale ma caldo e incoraggiante.
- Essere conciso (max 3 frasi).
- Nominare esplicitamente la scadenza più urgente con la data.
- Concludere con un invito all'azione specifico.
Non includere saluti iniziali come "Ecco il messaggio:" o simili. Solo il messaggio finale.
`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      temperature: 0.7,
      system: 'Sei un assistente AI proattivo e preciso per una piattaforma B2B di gestione scadenze.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ message: text })

  } catch (error) {
    console.error('Error generating icebreaker:', error)

    if (body) {
      const safeName = sanitizeForPrompt(body.persona.name, 60)
      const safeTitle = sanitizeForPrompt(body.scadenzeUrgenti[0]?.title || 'quelle imminenti', 80)
      const mockMessage = `Buongiorno ${safeName}, hai ${body.persona.urgenti} scadenze urgenti da gestire. Ti consiglio di dare priorità a ${safeTitle}.`
      return NextResponse.json({ message: mockMessage })
    }

    return NextResponse.json({ error: 'Errore interno. Riprova più tardi.' }, { status: 500 })
  }
}
