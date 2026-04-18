import Link from 'next/link'

export default async function LandingPage() {
  // Fetch 3 live campaigns for the featured section
  let featured: {
    id: string
    title: string
    sector: string
    raised_amount_cents: number
    target_amount_cents: number
    profit_share_pct: number
    users: { full_name: string } | null
  }[] = []

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/campaigns?status=live&limit=3`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      featured = data.campaigns?.slice(0, 3) ?? []
    }
  } catch {
    // Featured section is decorative — fail silently
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-700">PotLaunch</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Shariah-Compliant · Blockchain-Backed
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Invest in businesses.<br />Share in their profits.
        </h1>
        <p className="text-lg text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          PotLaunch is a Mudarabah investment platform. Founders raise capital, investors fund them,
          and profits are shared by agreement — no interest, no fixed returns, no Riba.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/register"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start investing
          </Link>
          <Link
            href="/campaigns"
            className="text-gray-700 hover:text-gray-900 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Browse campaigns
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              number="01"
              title="Connect"
              description="Founders list their business and connect their Stripe account. Revenue flows automatically through our oracle — no manual reporting."
            />
            <Step
              number="02"
              title="Pitch"
              description="Investors browse campaigns and submit term proposals. Founders review and accept pitches that suit them. A smart contract is deployed on acceptance."
            />
            <Step
              number="03"
              title="Earn"
              description="As the business generates revenue, the contract automatically calculates and distributes profit shares. Transparent, on-chain, no intermediaries."
            />
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Two types of opportunities</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Whether you&apos;re backing a neighbourhood business or an early-stage startup, every campaign runs under the same Mudarabah principles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-2xl p-8">
            <div className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full mb-4">
              Local Business
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community-rooted ventures</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Restaurants, retail shops, services businesses — geographically specific campaigns where you invest in your community and share in local success.
            </p>
          </div>
          <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-8">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full mb-4">
              Startup / Corporate
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scalable growth companies</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Early-stage startups and established companies seeking scaled capital. Higher growth potential with the same ethical profit-sharing structure.
            </p>
          </div>
        </div>
      </section>

      {/* Featured campaigns */}
      {featured.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Live campaigns</h2>
              <Link href="/campaigns" className="text-sm text-emerald-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((c) => {
                const pct = c.target_amount_cents > 0
                  ? Math.min(100, Math.round((c.raised_amount_cents / c.target_amount_cents) * 100))
                  : 0
                const format = (cents: number) =>
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
                return (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-400 hover:shadow-sm transition-all block"
                  >
                    <p className="text-xs text-gray-400 mb-1">{c.sector} · {c.users?.full_name}</p>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{c.title}</h3>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{format(c.raised_amount_cents)} raised</span>
                      <span>{c.profit_share_pct}% investor share</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to invest ethically?</h2>
          <p className="text-gray-500 mb-8">
            No interest. No Riba. Only real profit from real businesses — shared fairly by agreement.
          </p>
          <Link
            href="/register"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-gray-500">PotLaunch</span>
          <span>Mudarabah-compliant · Blockchain-backed · Stripe-verified</span>
        </div>
      </footer>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}
