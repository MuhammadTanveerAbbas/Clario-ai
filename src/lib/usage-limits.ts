import { getPlanLimits, type SubscriptionTier } from '@/config/plans'
export type { SubscriptionTier }

export function checkUsageLimit(
  tier: SubscriptionTier,
  currentUsage: number = 0
): { allowed: boolean; remaining: number; limit: number } {
  const { requests: limit } = getPlanLimits(tier)
  const remaining = Math.max(0, limit - currentUsage)

  return {
    allowed: currentUsage < limit,
    remaining,
    limit,
  }
}
