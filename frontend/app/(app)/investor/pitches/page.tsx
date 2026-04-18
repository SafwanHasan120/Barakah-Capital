'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Pitch = {
  id: string
  proposed_amount_cents: number
  proposed_profit_share_pct: number
  message: string | null
  status: string
  founder_response: string | null
  responded_at: string | null
  created_at: string
  campaign_id: string
  campaigns: { title: string; status: string } | null
}

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

const STATUS_BADGE: Record<string, string> = {
  submitted:    'bg-blue-50 text-blue-700',
  under_review: 'bg-amber-50 text-amber-700',
  accepted:     'bg-emerald-50 text-emerald-700',
  rejected:     'bg-red-50 text-red-600',
  withdrawn:    'bg-gray-100 text-gray-500',
}

export default function InvestorPitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/pitches')
      .then((r) => r.json())
      .then((d) => setPitches(d.pitches ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-3xl space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My pitches</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of all your investment proposals.</p>
      </div>

      {pitches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No pitches yet</p>
          <p className="text-xs text-gray-400 mt-1">Browse campaigns and submit your first pitch.</p>
          <Link href="/campaigns" className="inline-block mt-4 text-sm text-emerald-600 hover:underline font-medium">
            Browse campaigns →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {pitches.map((p) => (
            <div key={p.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/campaigns/${p.campaign_id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                  >
                    {p.campaigns?.title ?? 'Unknown campaign'}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatUSD(p.proposed_amount_cents)} · {p.proposed_profit_share_pct}% investor share
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Submitted {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              {p.message && (
                <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
                  &ldquo;{p.message}&rdquo;
                </p>
              )}

              {p.founder_response && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                  <span className="font-medium">Founder response: </span>{p.founder_response}
                </div>
              )}

              {p.status === 'under_review' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  Your pitch was accepted — complete your payment to activate the Mudarabah contract.
                  {/* Payment confirmation UI added when Stripe.js integration is complete */}
                </div>
              )}

              {p.status === 'submitted' && (
                <button
                  onClick={async () => {
                    await fetch(`/api/campaigns/${p.campaign_id}/pitches/${p.id}`, { method: 'DELETE' })
                    setPitches((prev) => prev.map((x) => x.id === p.id ? { ...x, status: 'withdrawn' } : x))
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Withdraw pitch
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
