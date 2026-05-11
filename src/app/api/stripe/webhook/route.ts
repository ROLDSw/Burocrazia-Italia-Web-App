import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import '@/lib/env'

export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function updateUserSubscription(
  userId: string,
  status: string,
  plan: string,
  customerId: string,
  subscriptionId: string,
  cancelAt?: string | null
) {
  const supabase = getSupabaseAdmin()
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      subscription: {
        status,
        plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        ...(cancelAt !== undefined ? { cancel_at: cancelAt } : {}),
      },
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Firma mancante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Firma webhook non valida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan ?? 'basic'
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (userId) {
          await updateUserSubscription(userId, 'active', plan, customerId, subscriptionId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id
        const customerId = sub.customer as string
        const plan = sub.metadata?.plan ?? ''

        if (userId) {
          let status: string
          if (sub.cancel_at_period_end) {
            status = 'canceling'
          } else if (sub.status === 'active') {
            status = 'active'
          } else {
            status = sub.status
          }

          const cancelAt = sub.cancel_at
            ? new Date(sub.cancel_at * 1000).toISOString()
            : null

          await updateUserSubscription(userId, status, plan, customerId, sub.id, cancelAt)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id
        const customerId = sub.customer as string

        if (userId) {
          await updateUserSubscription(userId, 'canceled', '', customerId, sub.id, null)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        let userId: string | undefined
        let subId: string | undefined
        let subPlan = ''

        // In Stripe v22, subscription ID è accessibile via invoice.parent.subscription_details.subscription
        const subRef = invoice.parent?.type === 'subscription_details'
          ? invoice.parent.subscription_details?.subscription
          : null

        if (subRef) {
          const resolvedSubId = typeof subRef === 'string' ? subRef : subRef.id
          const sub = await stripe.subscriptions.retrieve(resolvedSubId)
          userId = sub.metadata?.user_id
          subId = sub.id
          subPlan = sub.metadata?.plan ?? ''
        }

        if (userId) {
          await updateUserSubscription(
            userId,
            'past_due',
            subPlan,
            invoice.customer as string,
            subId ?? ''
          )
        }
        break
      }
    }
  } catch (err) {
    console.error('Errore webhook Stripe:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
