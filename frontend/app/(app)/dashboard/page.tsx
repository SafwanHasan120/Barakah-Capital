import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

const FEATURED_CAMPAIGNS = [
  {
    id: 'saba-roasters-1',
    title: 'Saba Roasters',
    sector: 'Food & Beverage',
    raised_amount_cents: 14500000,
    target_amount_cents: 20000000,
    profit_share_pct: 25,
    users: { full_name: 'Ahmed Y.' }
  },
  {
    id: 'nexus-analytics-2',
    title: 'Nexus Analytics',
    sector: 'Technology',
    raised_amount_cents: 85000000,
    target_amount_cents: 100000000,
    profit_share_pct: 15,
    users: { full_name: 'Sarah M.' }
  },
  {
    id: 'apex-fitness-3',
    title: 'Apex Fitness Hub',
    sector: 'Health & Wellness',
    raised_amount_cents: 3000000,
    target_amount_cents: 5000000,
    profit_share_pct: 35,
    users: { full_name: 'David L.' }
  }
];

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Bypassing infinite recursion RLS by using Admin Client for the `users` table lookup
  const { data: profile } = await createAdminClient()
    .from('users')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12 space-y-12">
      <div>
        <h1 className="text-4xl font-serif font-medium text-brand">
          Hello, {profile?.full_name ?? 'Friend'}.
        </h1>
        <p className="text-lg text-brand/80 mt-2 font-light">Welcome back to your Mudarabah investment dashboard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SummaryCard
          title="Campaigns"
          description="Invest in Shariah-compliant startups via Mudaraba profit-sharing."
          href="/campaigns"
        />
        <SummaryCard
          title="Your Wallet"
          description="View your active balance and complete transaction history."
          href="/wallet"
        />
        <SummaryCard
          title="My Pitches"
          description="Track all investment proposals you have submitted to founders."
          href="/investor/pitches"
        />
        <SummaryCard
          title="My Contracts"
          description="View active and completed Mudarabah contracts and their event logs."
          href="/investor/contracts"
        />
      </div>

      {/* Featured Campaigns Demo Section */}
      <div className="pt-8 border-t border-brand/10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-medium text-brand mb-2">Live Opportunities</h2>
            <p className="text-brand/80 font-light">Trending businesses currently raising capital.</p>
          </div>
          <Link href="/campaigns" className="text-sm text-brand font-medium hover:text-accent transition-colors pb-1 border-b border-transparent hover:border-accent">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_CAMPAIGNS.map((c) => {
            const pct = c.target_amount_cents > 0
              ? Math.min(100, Math.round((c.raised_amount_cents / c.target_amount_cents) * 100))
              : 0
            const format = (cents: number) =>
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
            return (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-brand/5 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all block group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-brand/70 uppercase tracking-widest">{c.sector}</span>
                  <span className="bg-emerald-50 text-brand text-xs font-semibold px-2 py-1 rounded-md border border-brand/10">{c.users?.full_name}</span>
                </div>
                <h3 className="text-xl font-serif font-medium text-brand mb-6 group-hover:text-brand-light transition-colors">{c.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-medium text-brand">{format(c.raised_amount_cents)}</span>
                    <span className="text-xs text-brand/80 font-medium">of {format(c.target_amount_cents)}</span>
                  </div>
                  <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-brand/5 mt-4">
                  <span className="text-sm text-brand font-light">Investor Share</span>
                  <span className="text-accent bg-emerald-50 text-xs font-bold px-2 py-1 rounded-md border border-accent/20">{c.profit_share_pct}%</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block p-8 bg-white rounded-3xl border border-brand/10 hover:border-accent/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all group "
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-serif font-medium text-brand group-hover:text-brand-light transition-colors">{title}</h3>
        <span className="text-accent bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-accent/20">
          Open &rarr;
        </span>
      </div>
      <p className="text-base text-brand/80 font-light leading-relaxed">{description}</p>
    </Link>
  )
}
