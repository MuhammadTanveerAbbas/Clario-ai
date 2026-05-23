export type SubscriptionTier = 'free' | 'pro'

export interface PlanConfig {
  label: string
  requests: number
  priceIds: {
    monthly: string
    annual: string
  }
}

export const PLANS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    label: 'Free Plan',
    requests: 100,
    priceIds: {
      monthly: '',
      annual: '',
    },
  },
  pro: {
    label: 'Pro Plan',
    requests: 1000,
    priceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
    },
  },
}

export function getPlanLimits(tier: SubscriptionTier): { requests: number; label: string } {
  const plan = PLANS[tier] || PLANS.free
  return { requests: plan.requests, label: plan.label }
}

export function getPriceId(billing: 'monthly' | 'annual'): string {
  return billing === 'annual' ? PLANS.pro.priceIds.annual : PLANS.pro.priceIds.monthly
}
