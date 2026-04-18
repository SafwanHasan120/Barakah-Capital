import { createClient } from '@/lib/supabase/server'
import { createRevenueOAuthUrl } from '@/lib/services/stripe.service'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Use the user ID as a simple CSRF state token
  const url = createRevenueOAuthUrl(user.id)
  return NextResponse.redirect(url)
}
