# CLAUDE.md
This file provides guidance to Claude Code when working with code in this repository.

## WHAT
- **Project**: Burocrazia — SaaS per la gestione delle scadenze burocratiche di professionisti e PMI
- **Tech stack**: Next.js 16 App Router, Tailwind CSS v4, Supabase Auth, Stripe (pagamenti), TypeScript
- **Struttura pagine**:
  - `/` — Landing page pubblica (Hero, Value Props, Come funziona, Pricing, Footer)
  - `/login` — Autenticazione email + password (Supabase)
  - `/signup` — Registrazione email + password (Supabase)
  - `/dashboard` — Panoramica scadenze imminenti e metriche aggregate
  - `/mobilita` — Bollo auto, revisione, multe, permessi ZTL, contrassegni
  - `/certificazioni` — Firma digitale, PEC, SPID, certificati medici
  - `/immobili` — Contratti di affitto, volture, IMU, utenze
  - `/welfare` — Bonus, iscrizioni scolastiche, parcheggi residenti
  - `/checkout/success` — Conferma pagamento Stripe
  - `/checkout/cancel` — Annullamento checkout Stripe
  - `/settings` — Impostazioni account e fatturazione

## AUTH — REGOLE FONDAMENTALI

### Middleware (src/middleware.ts)
- Approccio **default-deny**: tutte le route richiedono autenticazione
- **Rotte pubbliche** (accessibili senza login):
  - `/` (landing page)
  - `/login`
  - `/signup`
  - `/api/auth/**` (login, signup, logout — devono essere pubbliche!)
  - `/api/stripe/webhook`
  - `/_next/**` (assets)
  - `/favicon.ico`
- Utente già loggato che accede a `/login` o `/signup` → redirect automatico a `/dashboard`

### Supabase Auth
- Login: `POST /api/auth/login` → `supabase.auth.signInWithPassword()`
- Signup: `POST /api/auth/signup` → `supabase.auth.signUp()`
- Logout: `POST /api/auth/logout` → `supabase.auth.signOut()` + redirect `/login`
- Sessione gestita tramite cookie Supabase SSR

### Layout
- `ClientLayout.tsx` esclude sidebar/header per: `/`, `/login`, `/signup`, `/checkout/*`

## STRIPE — ABBONAMENTI

### Piani
- **Basic**: €9,90/mese (`STRIPE_PRICE_BASIC`)
- **Pro**: €19,90/mese (`STRIPE_PRICE_PRO`)
- Ambiente: **test/sandbox** (carte `4242 4242 4242 4242`)

### Flusso pagamento
1. Utente clicca piano → `POST /api/stripe/checkout` → crea Stripe Checkout Session
2. Redirect a Stripe hosted checkout
3. Pagamento completato → redirect `/checkout/success`
4. Webhook `POST /api/stripe/webhook` riceve `checkout.session.completed`
5. Aggiorna `user.user_metadata.subscription.status = 'active'` via Supabase Admin API

### Feature gating
- `NewScadenzaModal.tsx` controlla `user_metadata.subscription.status === 'active'`
- Se non abbonato → mostra `UpsellDialog` con link a `/#pricing`

## HOW
- **Fase attuale**: UI/UX funzionale con auth reale (Supabase) e pagamenti reali (Stripe test)
- I dati delle scadenze sono ancora mock/statici
- Usare plan mode per qualsiasi task non banale
- Usare lo screenshot loop per il frontend (reference design → rebuild → compare → iterate)

## DO'S
- Progettare componenti riutilizzabili per le card di scadenza (usabili in tutte le sezioni)
- Mantenere una gerarchia visiva chiara: urgente → in scadenza → ok
- Usare dati mock realistici che riflettano casi d'uso reali di professionisti italiani
- Seguire le convenzioni di naming italiane per label e copy dell'interfaccia
- Strutturare i mock data in modo che mappino 1:1 con i futuri campi del backend

## DON'TS
- Non committare API key, token o secret in nessun file — usare variabili d'ambiente
- Non esporre path interni o dettagli infrastruttura nel codice client-facing
- Se esiste un file .env, non leggerne o mostrarne i contenuti — referenziare solo i nomi delle variabili
- Non installare pacchetti senza verifica del nome esatto
- Non usare la chiave `SUPABASE_SERVICE_ROLE_KEY` sul client (solo server-side nelle API routes)
