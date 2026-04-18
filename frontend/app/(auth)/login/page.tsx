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
    <div className="min-h-screen flex bg-background font-sans">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-[45%] bg-brand text-background p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-light/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-serif font-semibold tracking-tight text-background hover:text-accent transition-colors">
            PotLaunch.
          </Link>
        </div>
        
        <div className="relative z-10 max-w-md">
          <div className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
            Welcome Back
          </div>
          <h2 className="text-5xl font-serif font-medium mb-6 leading-[1.1] text-yellow-500">Continue your investment journey.</h2>
          <p className="text-yellow-400/90 text-lg font-light leading-relaxed">
            Manage your portfolio, submit term proposals, and monitor the automated revenue distribution of your campaigns.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="lg:hidden text-2xl font-serif font-semibold text-brand mb-8 block">
              PotLaunch.
            </Link>
            <h1 className="text-3xl font-serif font-medium text-brand">Sign in to your account</h1>
            <p className="text-brand font-light">Mudarabah-native investing, powered by community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-brand">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-brand">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-light disabled:opacity-60 text-white font-medium py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:-translate-y-0.5 mt-4"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-brand font-light">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent font-medium hover:text-accent-hover transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
