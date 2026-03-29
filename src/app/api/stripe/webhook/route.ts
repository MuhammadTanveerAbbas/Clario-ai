import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Idempotency check  Stripe may deliver the same event more than once
    const { data: existing } = await supabase
      .from('processed_webhook_events')
      .select('id')
      .eq('id', event.id)
      .single()

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!session.customer) {
          console.error('[Stripe] Missing customer ID in event:', event.id)
          return NextResponse.json({ error: 'Missing customer' }, { status: 400 })
        }

        if (userId) {
          // Fetch subscription to get period end
          let periodEnd: string | undefined
          if (session.subscription) {
            try {
              const sub = await stripe.subscriptions.retrieve(session.subscription as string)
              periodEnd = new Date((sub as any).current_period_end * 1000).toISOString()
            } catch {
              // non-critical
            }
          }

          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'pro',
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              ...(periodEnd ? { current_period_end: periodEnd } : {}),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status === 'active' ? 'active' : 'canceled',
              stripe_subscription_id: subscription.id,
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)
        } else if (subscription.customer) {
          // Fallback: look up by stripe_customer_id
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status === 'active' ? 'active' : 'canceled',
              stripe_subscription_id: subscription.id,
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('stripe_customer_id', subscription.customer as string)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
            })
            .eq('id', userId)
        } else if (subscription.customer) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
            })
            .eq('stripe_customer_id', subscription.customer as string)
        }
        break
      }
    }

    await supabase
      .from('processed_webhook_events')
      .insert({ id: event.id, processed_at: new Date().toISOString() })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

