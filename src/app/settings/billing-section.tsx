"use client";

import { useState } from "react";
import { CreditCard, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface BillingData {
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_status: "active" | "inactive";
}

interface BillingSectionProps {
  profile?: BillingData;
}

const PLAN_LIMITS = {
  free: { requests: 100 },
  pro: { requests: 1000 },
  enterprise: { requests: 1000 },
};

export function BillingSection({ profile }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Ensure we have a valid subscription tier, default to 'free'
  const subscriptionTier = (profile?.subscription_tier || "free") as
    | "free"
    | "pro"
    | "enterprise";
  const limits = PLAN_LIMITS[subscriptionTier] || PLAN_LIMITS.free;

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setLoading(true);
    try {
      toast({
        title: "Subscription cancellation",
        description: "Please contact support to cancel your subscription.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel subscription.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-[#4169E1]/10 via-purple-500/5 to-pink-500/5 border-[#4169E1]/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white flex items-center text-base md:text-lg">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#4169E1]" />
                Current Plan
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1 text-xs md:text-sm">
                Your active subscription details
              </CardDescription>
            </div>
            <Badge className={`border-0 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold uppercase tracking-wide ${
              subscriptionTier === 'pro' || subscriptionTier === 'enterprise'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                : 'bg-gray-600 text-gray-200'
            }`}>
              {subscriptionTier === 'pro' || subscriptionTier === 'enterprise' ? 'Premium Plan' : 'Free Plan'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-black/30 rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                {limits.requests === Infinity ? "∞" : limits.requests}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                AI Requests/month
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 md:gap-3">
            <Button
              onClick={() => router.push("/pricing")}
              className="flex-1 bg-gradient-to-r from-[#4169E1] to-[#6B8EFF] hover:from-[#4169E1]/90 hover:to-[#6B8EFF]/90 text-white border-0 font-semibold text-sm md:text-base"
            >
              {subscriptionTier === "free" ? "Upgrade Plan" : "Change Plan"}
            </Button>
            {subscriptionTier !== "free" && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={loading}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-sm md:text-base"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center text-base md:text-lg">
            <Bell className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#4169E1]" />
            Billing & Usage
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Monitor your usage and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
              <span className="text-white text-sm md:text-base">
                Next billing date
              </span>
              <span className="text-gray-400 text-xs md:text-sm">
                N/A
              </span>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
              <span className="text-white text-sm md:text-base">
                Payment method
              </span>
              <span className="text-gray-400 text-xs md:text-sm">
                None
              </span>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
              <span className="text-white text-sm md:text-base">Status</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {subscriptionTier === "free" ? "Free Plan" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
