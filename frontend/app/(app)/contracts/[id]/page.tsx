'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

type ContractEvent = {
  id: string
  event_type: string
  payload: Record<string, unknown>
  tx_hash: string
  emitted_at: string
}

type Contract = {
  id: string
  capital_cents: number
  profit_share_pct: number
  duration_months: number
  blockchain_address: string | null
  status: string
  formed_at: string | null
  completed_at: string | null
  created_at: string
  campaign_id: string
  investor_id: string
  investment_id: string
  campaigns: { title: string; founder_id: string; sector: string } | null
  users: { full_name: string } | null
}

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

const STATUS_BADGE: Record<string, string> = {
  pending_formation: 'bg-gray-100 text-gray-500',
  active:            'bg-emerald-50 text-emerald-700',
  distributing:      'bg-blue-50 text-blue-700',
  completed:         'bg-violet-50 text-violet-700',
  voided:            'bg-red-50 text-red-600',
}

const EVENT_ICONS: Record<string, string> = {
  contract_created:       '📄',
  capital_locked:         '🔒',
  revenue_reported:       '📊',
  profit_calculated:      '🧮',
  distribution_triggered: '💸',
  contract_closed:        '✅',
}

function EventRow({ event }: { event: ContractEvent }) {
  const [open, setOpen] = useState(false)
  const icon = EVENT_ICONS[event.event_type] ?? '⬡'
  const label = event.event_type.replace(/_/g, ' ')

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">
        {icon}
      </div>
      <div className="pb-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-800 capitalize">{label}</p>
          <span className="text-xs text-gray-400">{new Date(event.emitted_at).toLocaleString()}</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-emerald-600 hover:underline mt-0.5"
        >
          {open ? 'Hide details' : 'View details'}
        </button>
        {open && (
          <pre className="mt-2 text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-600 border border-gray-100">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        )}
        <p className="text-xs text-gray-300 font-mono mt-1 truncate max-w-xs" title={event.tx_hash}>
          {event.tx_hash}
        </p>
      </div>
    </div>
  )
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contract, setContract] = useState<Contract | null>(null)
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => {
        if (r.status === 404 || r.status === 403) { setNotFound(true); return null }
        return r.json()
      })
      .then((d) => {
        if (d) { setContract(d.contract); setEvents(d.events ?? []) }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 max-w-3xl space-y-4">
        <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-60 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (notFound || !contract) {
    return (
      <div className="p-8 max-w-xl text-center">
        <p className="text-sm text-gray-500">Contract not found or you don&apos;t have access.</p>
        <Link href="/investor/contracts" className="text-sm text-emerald-600 hover:underline mt-3 inline-block">
          Back to my contracts
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/investor/contracts" className="text-sm text-gray-400 hover:text-gray-600">← My contracts</Link>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {contract.campaigns?.title ?? 'Contract'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{contract.campaigns?.sector}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[contract.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {contract.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Mudarabah Contract Terms</h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-xs text-gray-400">Capital invested</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatUSD(contract.capital_cents)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Investor profit share</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{contract.profit_share_pct}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{contract.duration_months} months</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Formed</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {contract.formed_at ? new Date(contract.formed_at).toLocaleDateString() : '—'}
            </p>
          </div>
          {contract.completed_at && (
            <div>
              <p className="text-xs text-gray-400">Completed</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{new Date(contract.completed_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Simulated blockchain address */}
        <div className="px-5 pb-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-1">Smart contract address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 truncate max-w-xs">
              {contract.blockchain_address ?? '—'}
            </code>
            <span
              className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded px-2 py-0.5 whitespace-nowrap cursor-default"
              title="PotLaunch is running in simulation mode. Real blockchain deployment is in progress."
            >
              Simulation
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real EVM deployment in progress. Contract logic is enforced by PotLaunch until mainnet launch.
          </p>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Contract events</h2>
          <p className="text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="px-5 py-4">
          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No events yet.</p>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3">
              {events.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
