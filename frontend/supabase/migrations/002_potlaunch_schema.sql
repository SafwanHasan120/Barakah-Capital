  -- ============================================================
  -- PotLaunch Migration 002 — Smart Contract Layer + Oracle + Pitches
  -- Run after 001_initial_schema.sql
  -- ============================================================

  -- ────────────────────────────────────────────────────────────
  -- NEW ENUMS
  -- ────────────────────────────────────────────────────────────

  CREATE TYPE public.business_type AS ENUM ('local', 'startup');

  CREATE TYPE public.contract_status AS ENUM (
    'pending_formation', 'active', 'distributing', 'completed', 'voided'
  );

  CREATE TYPE public.pitch_status AS ENUM (
    'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'
  );

  CREATE TYPE public.contract_event_type AS ENUM (
    'contract_created', 'capital_locked', 'revenue_reported',
    'profit_calculated', 'distribution_triggered', 'contract_closed'
  );

  -- Add wakalah_fee to existing tx_type enum
  ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'wakalah_fee';

  -- ────────────────────────────────────────────────────────────
  -- ALTER EXISTING TABLES
  -- ────────────────────────────────────────────────────────────

  ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS business_type public.business_type NOT NULL DEFAULT 'startup';

  ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS revenue_stripe_account_id   TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS revenue_stripe_connected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS barakah_score               NUMERIC(4,2) DEFAULT NULL;

  -- ────────────────────────────────────────────────────────────
  -- CONTRACTS
  -- Mirrors future smart contract state. One row per investment.
  -- ────────────────────────────────────────────────────────────

  CREATE TABLE public.contracts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id         UUID NOT NULL REFERENCES public.campaigns(id),
    investor_id         UUID NOT NULL REFERENCES public.users(id),
    investment_id       UUID NOT NULL REFERENCES public.investments(id),
    -- Terms encoded at formation time (mirrors on-chain constructor args)
    capital_cents       BIGINT NOT NULL CHECK (capital_cents > 0),
    profit_share_pct    NUMERIC(5,2) NOT NULL CHECK (profit_share_pct BETWEEN 1 AND 99),
    duration_months     SMALLINT NOT NULL CHECK (duration_months BETWEEN 1 AND 60),
    -- Simulated blockchain address; NULL until real contracts deployed
    blockchain_address  TEXT UNIQUE,
    status              public.contract_status NOT NULL DEFAULT 'pending_formation',
    formed_at           TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX idx_contracts_campaign   ON public.contracts(campaign_id);
  CREATE INDEX idx_contracts_investor   ON public.contracts(investor_id);
  CREATE INDEX idx_contracts_investment ON public.contracts(investment_id);

  ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "investor_select_own_contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = investor_id);

  CREATE POLICY "founder_select_campaign_contracts" ON public.contracts
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.campaigns
        WHERE campaigns.id = contracts.campaign_id
          AND campaigns.founder_id = auth.uid()
      )
    );

  CREATE POLICY "admin_select_all_contracts" ON public.contracts
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "service_role_all_contracts" ON public.contracts
    FOR ALL USING (auth.role() = 'service_role');

  -- ────────────────────────────────────────────────────────────
  -- CONTRACT EVENTS (immutable append-only — mirrors on-chain event log)
  -- ────────────────────────────────────────────────────────────

  CREATE TABLE public.contract_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id   UUID NOT NULL REFERENCES public.contracts(id),
    event_type    public.contract_event_type NOT NULL,
    payload       JSONB NOT NULL DEFAULT '{}',
    -- Simulated tx hash; replaced with real hash when contracts are deployed
    tx_hash       TEXT NOT NULL,
    block_number  BIGINT,   -- NULL for MVP simulation
    emitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    -- Intentionally no updated_at — this table is immutable
  );

  CREATE INDEX idx_contract_events_contract ON public.contract_events(contract_id);
  CREATE INDEX idx_contract_events_type     ON public.contract_events(event_type);
  CREATE INDEX idx_contract_events_emitted  ON public.contract_events(emitted_at DESC);

  -- Immutability trigger — same pattern as transactions table
  CREATE OR REPLACE FUNCTION public.prevent_contract_event_mutation()
  RETURNS TRIGGER AS $$
  BEGIN
    RAISE EXCEPTION 'contract_events are immutable — insert only';
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_prevent_contract_event_mutation
    BEFORE UPDATE OR DELETE ON public.contract_events
    FOR EACH ROW EXECUTE FUNCTION public.prevent_contract_event_mutation();

  ALTER TABLE public.contract_events ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "investor_select_own_contract_events" ON public.contract_events
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.contracts
        WHERE contracts.id = contract_events.contract_id
          AND contracts.investor_id = auth.uid()
      )
    );

  CREATE POLICY "founder_select_contract_events" ON public.contract_events
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.contracts c
        JOIN public.campaigns camp ON camp.id = c.campaign_id
        WHERE c.id = contract_events.contract_id
          AND camp.founder_id = auth.uid()
      )
    );

  CREATE POLICY "admin_select_all_contract_events" ON public.contract_events
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "service_role_all_contract_events" ON public.contract_events
    FOR ALL USING (auth.role() = 'service_role');

  -- ────────────────────────────────────────────────────────────
  -- REVENUE SNAPSHOTS (Stripe Revenue Oracle data)
  -- ────────────────────────────────────────────────────────────

  CREATE TABLE public.revenue_snapshots (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id           UUID NOT NULL REFERENCES public.campaigns(id),
    stripe_account_id     TEXT NOT NULL,
    period_start          TIMESTAMPTZ NOT NULL,
    period_end            TIMESTAMPTZ NOT NULL,
    gross_revenue_cents   BIGINT NOT NULL CHECK (gross_revenue_cents >= 0),
    net_revenue_cents     BIGINT NOT NULL CHECK (net_revenue_cents >= 0),
    charge_count          INTEGER NOT NULL DEFAULT 0,
    verified_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw_stripe_payload    JSONB,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX idx_revenue_snapshots_campaign ON public.revenue_snapshots(campaign_id);
  CREATE INDEX idx_revenue_snapshots_account  ON public.revenue_snapshots(stripe_account_id);
  CREATE INDEX idx_revenue_snapshots_period   ON public.revenue_snapshots(period_start, period_end);

  ALTER TABLE public.revenue_snapshots ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "founder_select_own_snapshots" ON public.revenue_snapshots
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.campaigns
        WHERE campaigns.id = revenue_snapshots.campaign_id
          AND campaigns.founder_id = auth.uid()
      )
    );

  CREATE POLICY "admin_select_all_snapshots" ON public.revenue_snapshots
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "service_role_all_snapshots" ON public.revenue_snapshots
    FOR ALL USING (auth.role() = 'service_role');

  -- ────────────────────────────────────────────────────────────
  -- PITCHES (investor → campaign term proposals)
  -- ────────────────────────────────────────────────────────────

  CREATE TABLE public.pitches (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id                 UUID NOT NULL REFERENCES public.campaigns(id),
    investor_id                 UUID NOT NULL REFERENCES public.users(id),
    proposed_amount_cents       BIGINT NOT NULL CHECK (proposed_amount_cents > 0),
    proposed_profit_share_pct   NUMERIC(5,2) NOT NULL CHECK (proposed_profit_share_pct BETWEEN 1 AND 99),
    message                     TEXT CHECK (char_length(message) <= 2000),
    status                      public.pitch_status NOT NULL DEFAULT 'submitted',
    founder_response            TEXT,
    responded_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Prevent duplicate open pitches from same investor to same campaign
  CREATE UNIQUE INDEX idx_pitches_no_duplicate_open
    ON public.pitches(campaign_id, investor_id)
    WHERE status NOT IN ('rejected', 'withdrawn');

  CREATE INDEX idx_pitches_campaign ON public.pitches(campaign_id);
  CREATE INDEX idx_pitches_investor ON public.pitches(investor_id);
  CREATE INDEX idx_pitches_status   ON public.pitches(status);

  ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "investor_select_own_pitches" ON public.pitches
    FOR SELECT USING (auth.uid() = investor_id);

  CREATE POLICY "investor_insert_pitches" ON public.pitches
    FOR INSERT WITH CHECK (auth.uid() = investor_id);

  CREATE POLICY "founder_select_campaign_pitches" ON public.pitches
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.campaigns
        WHERE campaigns.id = pitches.campaign_id
          AND campaigns.founder_id = auth.uid()
      )
    );

  CREATE POLICY "admin_select_all_pitches" ON public.pitches
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "service_role_all_pitches" ON public.pitches
    FOR ALL USING (auth.role() = 'service_role');

  -- ────────────────────────────────────────────────────────────
  -- LEDGER STORED PROCEDURE — ledger_contract_distribute
  -- Double-entry for automated oracle-triggered profit distribution
  -- ────────────────────────────────────────────────────────────

  CREATE OR REPLACE FUNCTION public.ledger_contract_distribute(
    p_contract_id         UUID,
    p_escrow_wallet_id    UUID,
    p_investor_wallet_id  UUID,
    p_gross_cents         BIGINT,
    p_wakalah_cents       BIGINT,
    p_snapshot_id         UUID,
    p_actor_id            UUID
  ) RETURNS VOID
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE
    v_net_cents BIGINT := p_gross_cents - p_wakalah_cents;
  BEGIN
    IF v_net_cents <= 0 THEN
      RAISE EXCEPTION 'Net profit after wakalah fee must be positive';
    END IF;

    -- Debit escrow, credit investor (net profit share)
    INSERT INTO public.transactions (wallet_id, direction, tx_type, amount_cents, reference_id, reference_type, memo, created_by)
    VALUES
      (p_escrow_wallet_id,   'debit',  'profit_distribution', v_net_cents,      p_contract_id, 'contract', 'oracle profit distribution', p_actor_id),
      (p_investor_wallet_id, 'credit', 'profit_distribution', v_net_cents,      p_contract_id, 'contract', 'oracle profit distribution', p_actor_id);

    -- Wakalah fee pair (escrow debit + escrow credit — internal platform fee)
    IF p_wakalah_cents > 0 THEN
      INSERT INTO public.transactions (wallet_id, direction, tx_type, amount_cents, reference_id, reference_type, memo, created_by)
      VALUES
        (p_escrow_wallet_id, 'debit',  'wakalah_fee', p_wakalah_cents, p_contract_id, 'contract', 'wakalah service fee', p_actor_id),
        (p_escrow_wallet_id, 'credit', 'wakalah_fee', p_wakalah_cents, p_contract_id, 'contract', 'wakalah service fee', p_actor_id);
    END IF;
  END;
  $$;

  -- ────────────────────────────────────────────────────────────
  -- PLATFORM CONFIG — add wakalah_fee_pct key
  -- ────────────────────────────────────────────────────────────

  INSERT INTO public.platform_config (key, value, description)
  VALUES ('wakalah_fee_pct', '2.5', 'Wakalah service fee % deducted from gross profit before investor distribution')
  ON CONFLICT (key) DO NOTHING;
