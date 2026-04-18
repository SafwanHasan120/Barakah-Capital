'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Snapshot = {
  id: string
  period_start: string
  period_end: string
  gross_revenue_cents: number
  net_revenue_cents: number
  charge_count: number
  verified_at: string
  campaign_id: string
}

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function FounderRevenuePage() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Check if founder's revenue Stripe account is connected via their profile
        const res = await fetch('/api/wallet/balance') // reuse auth check; we'll check account status separately
        if (!res.ok) return
        // For now derive connection state from URL param set by OAuth callback
        const params = new URLSearchParams(window.location.search)
        if (params.get('connected') === 'true') setConnected(true)
        else if (params.get('connect') === 'error') setConnected(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Revenue Oracle</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your business&apos;s Stripe account so PotLaunch can automatically verify revenue and distribute profits to investors.
        </p>
      </div>

      {/* Connection status */}
      <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Business Stripe account</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Read-only access to your revenue — we never charge your account.
          </p>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Connected
          </span>
        ) : (
          <Link
            href="/api/stripe/revenue-oauth/authorize"
            className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Connect Stripe
          </Link>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800 space-y-1">
        <p className="font-medium">How the Revenue Oracle works</p>
        <ul className="text-xs text-blue-700 space-y-1 mt-2 list-disc list-inside">
          <li>Your Stripe charges are read in real-time via secure webhooks</li>
          <li>At each reporting period, your smart contract calculates investor profit shares</li>
          <li>Distributions are triggered automatically — no manual approval needed</li>
          <li>A Wakalah service fee (2.5%) is deducted before investor distributions</li>
        </ul>
      </div>

      {/* Revenue snapshots */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Revenue snapshots</h2>
        {snapshots.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-center text-sm text-gray-400">
            No revenue snapshots yet. Connect your Stripe account and make your first sale.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {snapshots.map((s) => (
              <div key={s.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(s.period_start).toLocaleDateString()} – {new Date(s.period_end).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.charge_count} charges · Verified {new Date(s.verified_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatUSD(s.gross_revenue_cents)}</p>
                  <p className="text-xs text-gray-400">net {formatUSD(s.net_revenue_cents)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
