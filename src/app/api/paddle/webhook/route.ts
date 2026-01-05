import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paddle-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || ''
    const hmac = crypto.createHmac('sha256', webhookSecret)
    hmac.update(body)
    const computedSignature = hmac.digest('hex')

    if (signature !== computedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    const supabase = await createClient()

    // Handle different Paddle events
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated':
        await supabase
          .from('users')
          .update({
            subscription_tier: event.data.plan_id === 'pro' ? 'pro' : 'premium',
            subscription_status: event.data.status,
            paddle_subscription_id: event.data.id,
            paddle_customer_id: event.data.customer_id,
            trial_ends_at: event.data.trial_end ? new Date(event.data.trial_end) : null,
          })
          .eq('email', event.data.customer_email)
        break

      case 'subscription.canceled':
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
          })
          .eq('paddle_subscription_id', event.data.id)
        break

      case 'subscription.payment_succeeded':
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
          })
          .eq('paddle_subscription_id', event.data.subscription_id)
        break

      default:
        console.log('Unhandled event type:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Paddle webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

