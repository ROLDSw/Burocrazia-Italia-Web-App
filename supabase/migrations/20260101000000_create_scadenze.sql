-- ============================================================
-- Tabella: scadenze
-- Tutte le scadenze burocratiche degli utenti.
-- RLS abilitata: ogni utente accede solo ai propri record.
-- INSERT limitato agli utenti con abbonamento attivo.
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
  currency              text                              CHECK (currency = 'EUR'),
  renewal_period_months integer,
  notes                 text,
  action_url            text,
  status                text                     NOT NULL DEFAULT 'attiva' CHECK (status IN ('attiva', 'completata', 'archiviata')),
  owner_type            text                              CHECK (owner_type IN ('business', 'personal')),
  created_at            timestamp with time zone NOT NULL DEFAULT now()
);

-- ── Indici ────────────────────────────────────────────────────────────────────

-- Filtraggio per utente (query principale: .eq('user_id', userId))
CREATE INDEX IF NOT EXISTS scadenze_user_id_idx ON public.scadenze (user_id);

-- Ordinamento per data di scadenza (query principale: .order('due_date'))
CREATE INDEX IF NOT EXISTS scadenze_due_date_idx ON public.scadenze (due_date);

-- Filtro per status usato nel cron di cleanup
CREATE INDEX IF NOT EXISTS scadenze_status_idx ON public.scadenze (status);

-- Indice composto per le query più frequenti: utente + data
CREATE INDEX IF NOT EXISTS scadenze_user_due_date_idx ON public.scadenze (user_id, due_date);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.scadenze ENABLE ROW LEVEL SECURITY;

-- SELECT: ogni utente vede solo le proprie scadenze
CREATE POLICY "select_own_scadenze"
  ON public.scadenze
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: solo utenti autenticati con abbonamento attivo o in cancellazione.
-- La verifica avviene su app_metadata (modificabile solo via Admin API,
-- non dall'utente) — fonte di verità affidabile per lo stato abbonamento.
CREATE POLICY "insert_own_scadenze"
  ON public.scadenze
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      auth.jwt() -> 'app_metadata' -> 'subscription' ->> 'status'
      IN ('active', 'canceling')
    )
  );

-- UPDATE: ogni utente aggiorna solo le proprie scadenze
CREATE POLICY "update_own_scadenze"
  ON public.scadenze
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: ogni utente elimina solo le proprie scadenze
CREATE POLICY "delete_own_scadenze"
  ON public.scadenze
  FOR DELETE
  USING (auth.uid() = user_id);
