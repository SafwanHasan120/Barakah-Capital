import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exchangeRevenueOAuthCode } from '@/lib/services/stripe.service'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const code  = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/founder/revenue?connect=denied', request.url))
  }

  if (!code || state !== user.id) {
    return NextResponse.redirect(new URL('/founder/revenue?connect=error', request.url))
  }

  try {
    const stripeAccountId = await exchangeRevenueOAuthCode(code)

    await createAdminClient()
      .from('users')
      .update({
        revenue_stripe_account_id:   stripeAccountId,
        revenue_stripe_connected_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.redirect(new URL('/founder/revenue?connected=true', request.url))
  } catch (err) {
    console.error('Revenue OAuth callback error:', err)
    return NextResponse.redirect(new URL('/founder/revenue?connect=error', request.url))
  }
}
