import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const supabase = createAdminClient()

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
          let periodEnd: string | undefined
          let subId: string | undefined
          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
              periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString()
              subId = subscription.id
            } catch {
              // non-critical
            }
          }

          await supabase
            .from('profiles')
            .update({
              plan: 'pro',
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              ...(subId ? { stripe_subscription_id: subId } : {}),
            })
            .eq('id', userId)

          if (subId) {
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              stripe_subscription_id: subId,
              stripe_customer_id: session.customer as string,
              stripe_price_id: session.metadata?.priceId || '',
              status: 'active',
              current_period_start: periodEnd ? new Date(new Date(periodEnd).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : null,
              current_period_end: periodEnd || null,
            }, { onConflict: 'stripe_subscription_id' })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        const status = sub.status === 'active' ? 'active' : 'canceled'
        const periodEnd = new Date((sub as any).current_period_end * 1000).toISOString()
        const updateData = {
          subscription_status: status,
          stripe_subscription_id: sub.id,
        }

        if (userId) {
          await supabase.from('profiles').update(updateData).eq('id', userId)
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer as string,
            stripe_price_id: (sub as any).items.data[0]?.price.id || '',
            status: sub.status,
            current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
            current_period_end: periodEnd,
            cancel_at_period_end: (sub as any).cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' })
        } else if (sub.customer) {
          await supabase.from('profiles').update(updateData).eq('stripe_customer_id', sub.customer as string)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase.from('profiles').update({ plan: 'free', subscription_status: 'canceled' }).eq('id', userId)
          await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id)
        } else if (subscription.customer) {
          await supabase.from('profiles').update({ plan: 'free', subscription_status: 'canceled' }).eq('stripe_customer_id', subscription.customer as string)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string | null
        if (subscriptionId && typeof subscriptionId === 'string') {
          const updatedSub = await stripe.subscriptions.retrieve(subscriptionId)
          const periodEnd = new Date((updatedSub as any).current_period_end * 1000).toISOString()
          await supabase.from('subscriptions').update({
            status: updatedSub.status,
            current_period_end: periodEnd,
            cancel_at_period_end: (updatedSub as any).cancel_at_period_end,
          }).eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any
        const subscriptionId = failedInvoice.subscription as string | null
        if (subscriptionId && typeof subscriptionId === 'string') {
          await supabase.from('subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', subscriptionId)
          const custId = failedInvoice.customer as string
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', custId)
            .single()
          if (profile) {
            await supabase.from('profiles').update({
              subscription_status: 'past_due',
            }).eq('id', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        console.log('[Stripe] Trial will end for event:', event.id)
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

