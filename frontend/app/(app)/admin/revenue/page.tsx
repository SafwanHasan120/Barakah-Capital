'use client'

import { useState, useEffect, useCallback } from 'react'

type Snapshot = {
  id: string
  campaign_id: string
  stripe_account_id: string
  period_start: string
  period_end: string
  gross_revenue_cents: number
  net_revenue_cents: number
  charge_count: number
  verified_at: string
  campaigns: { title: string } | null
}

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminRevenuePage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [barakahLoading, setBarakahLoading] = useState(false)
  const [barakahMsg, setBarakahMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/revenue-snapshots?page=${page}`)
    if (res.ok) {
      const data = await res.json()
      setSnapshots(data.snapshots)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  async function runBarakah() {
    setBarakahLoading(true)
    setBarakahMsg(null)
    const res = await fetch('/api/admin/barakah/compute', { method: 'POST' })
    const data = await res.json()
    setBarakahMsg(`Updated ${data.updated} founder score${data.updated !== 1 ? 's' : ''}`)
    setBarakahLoading(false)
  }

  const totalGross = snapshots.reduce((s, r) => s + r.gross_revenue_cents, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Revenue Oracle</h1>
          <p className="text-sm text-gray-500 mt-1">Verified revenue snapshots from connected founder Stripe accounts.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={runBarakah}
            disabled={barakahLoading}
            className="text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium px-3 py-1.5 rounded-lg"
          >
            {barakahLoading ? 'Computing…' : 'Recompute Barakah scores'}
          </button>
          {barakahMsg && <p className="text-xs text-gray-500">{barakahMsg}</p>}
        </div>
      </div>

      {/* Summary strip */}
      {!loading && snapshots.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex gap-8">
          <div>
            <p className="text-xs text-emerald-600">Page gross revenue</p>
            <p className="text-lg font-semibold text-emerald-800 mt-0.5">{formatUSD(totalGross)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-600">Snapshots shown</p>
            <p className="text-lg font-semibold text-emerald-800 mt-0.5">{snapshots.length} of {total}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : snapshots.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-10 text-center">
          <p className="text-sm text-gray-500">No revenue snapshots yet. Founders must connect their Stripe account.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {snapshots.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.campaigns?.title ?? s.campaign_id}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(s.period_start)} – {formatDate(s.period_end)} · {s.charge_count} charges
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-xs">{s.stripe_account_id}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{formatUSD(s.gross_revenue_cents)}</p>
                <p className="text-xs text-gray-400">gross</p>
                <p className="text-xs text-gray-500">{formatUSD(s.net_revenue_cents)} net</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 self-center">Page {page}</span>
          <button
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
