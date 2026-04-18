import Link from 'next/link'

export default async function LandingPage() {
  // Mock static data for the Hackathon Demo
  const featured = [
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

  return (
    <div className="min-h-screen bg-brand relative overflow-hidden">
      {/* Background radial gradient for uniqueness */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-brand-light to-transparent -z-10 pointer-events-none" />

      {/* Floating Nav */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 relative z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <span className="text-2xl font-serif font-semibold tracking-tight text-white">PotLaunch.</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent hover:bg-accent-hover text-brand font-bold px-5 py-2.5 rounded-full transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-widest shadow-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          Shariah-Compliant · Blockchain-Backed
        </div>
        <h1 className="text-6xl md:text-7xl font-serif font-medium text-white leading-[1.1] max-w-4xl mx-auto tracking-tight">
          Invest in businesses.<br />
          <span className="text-accent italic">Share in their profits.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 mt-8 max-w-2xl mx-auto leading-relaxed font-light">
          PotLaunch is a Mudarabah investment platform. Founders raise capital, investors fund them,
          and profits are shared by agreement — no interest or fixed returns.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-brand font-bold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 text-base flex items-center justify-center gap-2"
          >
            Start investing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/campaigns"
            className="w-full sm:w-auto text-white hover:text-accent font-medium px-8 py-4 rounded-full border border-white/20 hover:border-accent/50 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 flex items-center justify-center"
          >
            Browse campaigns
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-light/30 text-white py-28 relative overflow-hidden border-t border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 text-white">How it works</h2>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              A transparent, automated, and ethical approach to business funding.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
      <section className="py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">Two types of opportunities</h2>
          <p className="text-white/90 text-lg font-light leading-relaxed max-w-xl mx-auto">
            Whether you&apos;re backing a neighbourhood business or an early-stage startup, every campaign runs under the same principled structure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.1l6.7 13.9H5.3L12 6.1z"/></svg>
            </div>
            <div className="inline-block bg-white/10 text-white border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
              Local Business
            </div>
            <h3 className="text-3xl font-serif font-medium text-white mb-4">Community-rooted ventures</h3>
            <p className="text-white/80 leading-relaxed font-light text-lg">
              Restaurants, retail shops, services businesses — geographically specific campaigns where you invest in your community and share in local success.
            </p>
          </div>
          
          <div className="bg-accent/10 border border-accent/20 rounded-[2rem] p-10 text-white relative overflow-hidden group hover:bg-accent/20 transition-all">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/40 transition-all"></div>
            <div className="inline-block bg-accent/20 text-accent border border-accent/30 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
              Startup / Corporate
            </div>
            <h3 className="text-3xl font-serif font-medium mb-4 text-white">Scalable growth companies</h3>
            <p className="text-white/80 leading-relaxed font-light text-lg">
              Early-stage startups and established companies seeking scaled capital. Higher growth potential with the same ethical profit-sharing structure.
            </p>
          </div>
        </div>
      </section>

      {/* Featured campaigns */}
      {featured.length > 0 && (
        <section className="bg-brand-light/20 py-28 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">Live campaigns</h2>
                <p className="text-white/80 font-light">Join these active raises before they close.</p>
              </div>
              <Link href="/campaigns" className="text-sm text-accent font-medium hover:text-white transition-colors pb-1 border-b border-transparent hover:border-accent">
                View all campaigns &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    className="bg-white/5 rounded-3xl p-6 shadow-sm border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all block group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-white/70 uppercase tracking-widest">{c.sector}</span>
                      <span className="bg-white/10 text-white/90 text-xs px-2 py-1 rounded border border-white/10">{c.users?.full_name}</span>
                    </div>
                    <h3 className="text-xl font-serif font-medium text-white mb-6 group-hover:text-accent transition-colors">{c.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-medium text-white">{format(c.raised_amount_cents)}</span>
                        <span className="text-sm text-white/70">of {format(c.target_amount_cents)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                      <span className="text-sm text-white/80 font-light">Investor Share</span>
                      <span className="bg-accent/20 border border-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded">{c.profit_share_pct}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand -z-20 border-t border-white/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif font-medium text-white mb-8 leading-tight">Ready to invest ethically?</h2>
          <p className="text-xl text-white/90 mb-12 font-light leading-relaxed">
            No interest. Only real profit from real businesses — shared fairly by agreement.
          </p>
          <Link
            href="/register"
            className="inline-block bg-accent hover:bg-accent-hover text-brand font-bold px-10 py-5 rounded-full transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 text-lg"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/80">
          <span className="font-serif text-xl font-semibold text-white tracking-tight">PotLaunch.</span>
          <span className="font-light tracking-wide text-white/70">Mudarabah-compliant · Blockchain-backed · Stripe-verified</span>
        </div>
      </footer>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative p-8 rounded-3xl border border-white/10 bg-white/5 hover:border-accent/40 hover:bg-white/10 shadow-lg transition-all group">
      <div className="text-5xl font-serif font-medium text-white/10 absolute top-6 right-8 pointer-events-none group-hover:text-accent/20 transition-colors">
        {number}
      </div>
      <h3 className="text-2xl font-serif font-medium mb-4 pr-12 text-white mt-4">{title}</h3>
      <p className="text-white/80 leading-relaxed font-light text-base">{description}</p>
    </div>
  )
}
