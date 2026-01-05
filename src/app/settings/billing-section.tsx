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
  free: { summaries: 10, messages: 20, documents: 5 },
  pro: { summaries: 100, messages: 500, documents: 50 },
  enterprise: { summaries: Infinity, messages: Infinity, documents: Infinity },
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
  const limits = PLAN_LIMITS[subscriptionTier];

  // Fallback if limits is somehow still undefined
  if (!limits) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>Unable to load billing information. Please refresh the page.</p>
      </div>
    );
  }

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
            <Badge className="bg-gradient-to-r from-[#4169E1] to-[#6B8EFF] text-white border-0 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold uppercase tracking-wide">
              {subscriptionTier} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-black/30 rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                {limits.summaries === Infinity ? "∞" : limits.summaries}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                Summaries/month
              </div>
            </div>
            <div className="p-3 md:p-4 bg-black/30 rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                {limits.messages === Infinity ? "∞" : limits.messages}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                Chat messages/month
              </div>
            </div>
            <div className="p-3 md:p-4 bg-black/30 rounded-lg border border-white/10">
              <div className="text-xl md:text-2xl font-bold text-white mb-1">
                {limits.documents === Infinity ? "∞" : limits.documents}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                Documents/month
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
                {subscriptionTier === "free" ? "N/A" : "Next month"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
              <span className="text-white text-sm md:text-base">
                Payment method
              </span>
              <span className="text-gray-400 text-xs md:text-sm">
                {subscriptionTier === "free" ? "None" : "•••• 4242"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
              <span className="text-white text-sm md:text-base">Status</span>
              <Badge
                className={
                  (profile?.subscription_status || "active") === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }
              >
                {profile?.subscription_status || "active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
