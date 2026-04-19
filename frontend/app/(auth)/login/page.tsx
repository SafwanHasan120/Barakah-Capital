'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-brand font-sans">
      {/* Left side — decorative */}
      <div className="hidden lg:flex w-[45%] p-12 flex-col justify-between relative overflow-hidden border-r border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="text-2xl font-serif font-semibold tracking-tight text-white hover:text-accent transition-colors">
            PotLaunch.
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-block bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide border border-accent/20">
            Welcome Back
          </div>
          <h2 className="text-5xl font-serif font-medium mb-6 leading-[1.1] text-white">Continue your investment journey.</h2>
          <p className="text-white/60 text-lg font-light leading-relaxed">
            Manage your portfolio, submit term proposals, and monitor the automated revenue distribution of your campaigns.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-sm text-white/40">
          <span>No interest. No Riba.</span>
          <span>·</span>
          <span>Mudarabah-native</span>
          <span>·</span>
          <span>Transparent</span>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="lg:hidden text-2xl font-serif font-semibold text-white mb-8 block hover:text-accent transition-colors">
              PotLaunch.
            </Link>
            <h1 className="text-3xl font-serif font-medium text-white">Sign in to your account</h1>
            <p className="text-white/50 font-light">Mudarabah-native investing, powered by community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white/80">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-brand font-bold py-3.5 rounded-xl text-base transition-all hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 mt-4"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 font-light">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent font-medium hover:text-accent-hover transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
