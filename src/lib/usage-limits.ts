export type SubscriptionTier = 'free' | 'pro'

export interface UsageLimits {
  requests: number
}

export const TIER_LIMITS: Record<SubscriptionTier, UsageLimits> = {
  free: {
    requests: 100,
  },
  pro: {
    requests: 1000,
  },
}

export function getTierLimits(tier: SubscriptionTier): UsageLimits {
  return TIER_LIMITS[tier]
}

export function checkUsageLimit(
  tier: SubscriptionTier,
  currentUsage: number
): { allowed: boolean; remaining: number; limit: number } {
  const limits = getTierLimits(tier)
  const limit = limits.requests
  const remaining = Math.max(0, limit - currentUsage)

  return {
    allowed: currentUsage < limit,
    remaining,
    limit,
  }
}
