-- ============================================================
-- Security enhancement: gate abbonamento sulla policy INSERT
-- Audit finding #2 (CWE-602) — da applicare al DB di produzione.
--
-- La policy base scadenze_insert_own permette INSERT a qualsiasi
-- utente autenticato. Questa migration la sostituisce limitando
-- l'INSERT agli utenti con abbonamento attivo o in cancellazione,
-- verificato su app_metadata (modificabile solo via Admin API,
-- non dall'utente).
-- ============================================================

-- Rimuove la policy base e la sostituisce con il gate abbonamento
DROP POLICY IF EXISTS "scadenze_insert_own" ON public.scadenze;

CREATE POLICY "scadenze_insert_own"
  ON public.scadenze
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      auth.jwt() -> 'app_metadata' -> 'subscription' ->> 'status'
      IN ('active', 'canceling')
    )
  );
