import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'crypto'

// ─── Contract Simulation Layer ────────────────────────────────────────────────
//
// This service mirrors a Solidity smart contract's public interface.
// When real EVM contracts are deployed, callers stay the same —
// only this service's internals swap from Supabase writes to on-chain calls.
//
// Simulated blockchain addresses are generated as 0x + 40 random hex chars.
// Simulated tx hashes are generated as sim_ + 64 random hex chars.
// Contract events are append-only (immutable trigger enforced in DB).

function simulatedAddress(): string {
  return '0x' + randomBytes(20).toString('hex')
}

function simulatedTxHash(): string {
  return 'sim_' + randomBytes(32).toString('hex')
}

async function getWakalahFeePct(): Promise<number> {
  const db = createAdminClient()
  const { data } = await db
    .from('platform_config')
    .select('value')
    .eq('key', 'wakalah_fee_pct')
    .single()
  return parseFloat(data?.value ?? '2.5')
}

async function emitEvent(
  contractId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  const db = createAdminClient()
  const { error } = await db.from('contract_events').insert({
    contract_id: contractId,
    event_type: eventType,
    payload,
    tx_hash: simulatedTxHash(),
  })
  if (error) throw new Error(`Failed to emit contract event ${eventType}: ${error.message}`)
}

// ─── formContract ─────────────────────────────────────────────────────────────
// Called when an investment is captured (payment_intent.succeeded).
// Creates the contracts row and emits contract_created.

export async function formContract(
  investmentId: string,
  campaignId: string,
  investorId: string
): Promise<string> {
  const db = createAdminClient()

  const { data: investment, error: invErr } = await db
    .from('investments')
    .select('amount_cents, profit_share_pct')
    .eq('id', investmentId)
    .single()

  if (invErr || !investment) throw new Error('Investment not found')

  const { data: campaign, error: campErr } = await db
    .from('campaigns')
    .select('duration_months')
    .eq('id', campaignId)
    .single()

  if (campErr || !campaign) throw new Error('Campaign not found')

  const address = simulatedAddress()

  const { data: contract, error } = await db
    .from('contracts')
    .insert({
      campaign_id: campaignId,
      investor_id: investorId,
      investment_id: investmentId,
      capital_cents: investment.amount_cents,
      profit_share_pct: investment.profit_share_pct,
      duration_months: campaign.duration_months,
      blockchain_address: address,
      status: 'pending_formation',
    })
    .select('id')
    .single()

  if (error || !contract) throw new Error(`Failed to form contract: ${error?.message}`)

  await emitEvent(contract.id, 'contract_created', {
    blockchain_address: address,
    capital_cents: investment.amount_cents,
    profit_share_pct: investment.profit_share_pct,
    duration_months: campaign.duration_months,
    investor_id: investorId,
    campaign_id: campaignId,
    investment_id: investmentId,
  })

  return contract.id
}

// ─── lockCapital ──────────────────────────────────────────────────────────────
// Called after payment is confirmed. Sets contract active.

export async function lockCapital(contractId: string): Promise<void> {
  const db = createAdminClient()

  await db
    .from('contracts')
    .update({ status: 'active', formed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', contractId)

  const { data: contract } = await db
    .from('contracts')
    .select('capital_cents, blockchain_address')
    .eq('id', contractId)
    .single()

  await emitEvent(contractId, 'capital_locked', {
    capital_cents: contract?.capital_cents,
    blockchain_address: contract?.blockchain_address,
    locked_at: new Date().toISOString(),
  })
}

// ─── reportRevenue ────────────────────────────────────────────────────────────
// Called by the revenue oracle when a new verified revenue snapshot exists.

export async function reportRevenue(
  contractId: string,
  snapshotId: string
): Promise<void> {
  const db = createAdminClient()

  const { data: snapshot } = await db
    .from('revenue_snapshots')
    .select('gross_revenue_cents, net_revenue_cents, period_start, period_end, charge_count')
    .eq('id', snapshotId)
    .single()

  await emitEvent(contractId, 'revenue_reported', {
    snapshot_id: snapshotId,
    gross_revenue_cents: snapshot?.gross_revenue_cents,
    net_revenue_cents: snapshot?.net_revenue_cents,
    period_start: snapshot?.period_start,
    period_end: snapshot?.period_end,
    charge_count: snapshot?.charge_count,
  })
}

// ─── calculateProfit ──────────────────────────────────────────────────────────
// Computes investor share and wakalah fee from gross revenue.
// Returns { investorShareCents, wakalahCents }.

export async function calculateProfit(
  contractId: string,
  grossRevenueCents: number
): Promise<{ investorShareCents: number; wakalahCents: number }> {
  const db = createAdminClient()

  const { data: contract } = await db
    .from('contracts')
    .select('profit_share_pct')
    .eq('id', contractId)
    .single()

  if (!contract) throw new Error('Contract not found')

  const wakalahPct = await getWakalahFeePct()
  const wakalahCents = Math.floor(grossRevenueCents * (wakalahPct / 100))
  const netRevenue = grossRevenueCents - wakalahCents
  const investorShareCents = Math.floor(netRevenue * (contract.profit_share_pct / 100))

  await emitEvent(contractId, 'profit_calculated', {
    gross_revenue_cents: grossRevenueCents,
    wakalah_pct: wakalahPct,
    wakalah_cents: wakalahCents,
    net_revenue_cents: netRevenue,
    investor_profit_share_pct: contract.profit_share_pct,
    investor_share_cents: investorShareCents,
  })

  return { investorShareCents, wakalahCents }
}

// ─── triggerDistribution ──────────────────────────────────────────────────────
// Moves funds from escrow to investor wallet and records the wakalah fee.

export async function triggerDistribution(
  contractId: string,
  escrowWalletId: string,
  investorWalletId: string,
  grossCents: number,
  wakalahCents: number,
  snapshotId: string,
  actorId: string
): Promise<void> {
  const db = createAdminClient()

  await db
    .from('contracts')
    .update({ status: 'distributing', updated_at: new Date().toISOString() })
    .eq('id', contractId)

  const { error } = await db.rpc('ledger_contract_distribute', {
    p_contract_id:        contractId,
    p_escrow_wallet_id:   escrowWalletId,
    p_investor_wallet_id: investorWalletId,
    p_gross_cents:        grossCents,
    p_wakalah_cents:      wakalahCents,
    p_snapshot_id:        snapshotId,
    p_actor_id:           actorId,
  })

  if (error) throw new Error(`ledger_contract_distribute failed: ${error.message}`)

  await emitEvent(contractId, 'distribution_triggered', {
    gross_cents:   grossCents,
    wakalah_cents: wakalahCents,
    net_cents:     grossCents - wakalahCents,
    snapshot_id:   snapshotId,
  })

  await db
    .from('contracts')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', contractId)
}

// ─── closeContract ────────────────────────────────────────────────────────────

export async function closeContract(contractId: string): Promise<void> {
  const db = createAdminClient()

  await db
    .from('contracts')
    .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', contractId)

  await emitEvent(contractId, 'contract_closed', {
    closed_at: new Date().toISOString(),
  })
}

// ─── getContractByInvestment ──────────────────────────────────────────────────

export async function getContractByInvestment(investmentId: string): Promise<string | null> {
  const db = createAdminClient()
  const { data } = await db
    .from('contracts')
    .select('id')
    .eq('investment_id', investmentId)
    .maybeSingle()
  return data?.id ?? null
}
