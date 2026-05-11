-- ============================================================
-- Tabella: scadenze
-- Schema verificato contro il DB di produzione il 2026-05-11.
-- Tutte le scadenze burocratiche degli utenti.
-- RLS abilitata: ogni utente accede solo ai propri record.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scadenze (
  id                    text                     PRIMARY KEY,
  user_id               uuid                     NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title                 text                     NOT NULL,
  description           text                     NOT NULL DEFAULT '',
  category              text                     NOT NULL CHECK (category IN ('mobilita', 'certificazioni', 'immobili', 'welfare')),
  subcategory           text                     NOT NULL DEFAULT '',
  due_date              timestamp with time zone NOT NULL,
  amount                numeric,
  currency              text                              DEFAULT 'EUR' CHECK (currency = 'EUR'),
  renewal_period_months integer,
  notes                 text,
  action_url            text,
  status                text                     NOT NULL DEFAULT 'attiva' CHECK (status IN ('attiva', 'completata', 'archiviata')),
  owner_type            text                              CHECK (owner_type IN ('business', 'personal')),
  created_at            timestamp with time zone NOT NULL DEFAULT now(),
  updated_at            timestamp with time zone NOT NULL DEFAULT now(),
  completed_at          timestamp with time zone
);

-- ── Indici ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS scadenze_user_id_idx       ON public.scadenze (user_id);
CREATE INDEX IF NOT EXISTS scadenze_due_date_idx       ON public.scadenze (due_date);
CREATE INDEX IF NOT EXISTS scadenze_status_idx         ON public.scadenze (status);
CREATE INDEX IF NOT EXISTS scadenze_user_due_date_idx  ON public.scadenze (user_id, due_date);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.scadenze ENABLE ROW LEVEL SECURITY;

-- SELECT: ogni utente vede solo le proprie scadenze
CREATE POLICY "scadenze_select_own"
  ON public.scadenze
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: ogni utente inserisce solo record con il proprio user_id
-- NOTA: policy base — il gate abbonamento è in 20260511000001_rls_subscription_gate.sql
CREATE POLICY "scadenze_insert_own"
  ON public.scadenze
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: ogni utente aggiorna solo le proprie scadenze
CREATE POLICY "scadenze_update_own"
  ON public.scadenze
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: ogni utente elimina solo le proprie scadenze
CREATE POLICY "scadenze_delete_own"
  ON public.scadenze
  FOR DELETE
  USING (auth.uid() = user_id);
