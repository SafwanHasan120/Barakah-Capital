import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand/10 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="px-6 py-6 border-b border-brand/5">
          <Link href="/" className="text-2xl font-serif font-semibold text-brand tracking-tight hover:text-accent transition-colors">
            PotLaunch.
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/wallet" label="Wallet" />

          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-semibold text-brand/50 uppercase tracking-widest">Campaigns</p>
          </div>
          <NavLink href="/campaigns" label="Browse Campaigns" />
          <NavLink href="/campaigns/new" label="Launch a Campaign" />

          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-semibold text-brand/50 uppercase tracking-widest">My Activity</p>
          </div>
          <NavLink href="/founder/campaigns" label="My Campaigns" />
          <NavLink href="/investor/pitches" label="My Pitches" />
          <NavLink href="/investor/contracts" label="My Contracts" />
          <NavLink href="/founder/revenue" label="Revenue Oracle" />
        </nav>

        <div className="p-4 border-t border-brand/5 space-y-1 bg-emerald-50/20">
          <NavLink href="/kyc" label="Identity (KYC)" />
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-brand/80 hover:bg-emerald-50 hover:text-brand transition-all group"
    >
      <span className="group-hover:translate-x-1 transition-transform">{label}</span>
    </Link>
  )
}
