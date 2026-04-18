import { stripe } from '@/lib/stripe/client'
import { isEventProcessed, markEventProcessed } from '@/lib/services/ledger.service'
import { processRevenueEvent } from '@/lib/services/revenue-oracle.service'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type Stripe from 'stripe'

// Raw body required for Stripe signature verification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params
  const rawBody  = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_REVENUE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Revenue oracle webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, skipped: 'duplicate' })
  }

  try {
    if (['charge.succeeded', 'payment_intent.succeeded'].includes(event.type)) {
      await processRevenueEvent(event, campaignId)
    }
    await markEventProcessed(event.id, event.type)
  } catch (err) {
    console.error(`Revenue oracle handler failed for ${event.id}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
