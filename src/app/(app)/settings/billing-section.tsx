"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface BillingData {
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_status: "active" | "inactive" | "canceled";
  current_period_end?: string;
  stripe_customer_id?: string;
}

interface BillingSectionProps {
  profile?: BillingData;
}

const PLANS = {
  free: { requests: 100, label: "Free plan" },
  pro: { requests: 1000, label: "Pro plan" },
  enterprise: { requests: 1000, label: "Enterprise" },
};

export function BillingSection({ profile }: BillingSectionProps) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  const tier = (profile?.subscription_tier || "free") as
    | "free"
    | "pro"
    | "enterprise";
  const plan = PLANS[tier];
  const isPaid = tier !== "free";
  const isActive = profile?.subscription_status === "active";

  const nextBillingDate = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isPaid
      ? "Contact support"
      : "Not applicable";

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to open billing portal.",
        });
      }
    } catch (error) {
      console.error("[Billing] Failed to open portal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open billing portal.",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", billing: "monthly" }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Checkout failed",
          description: data.error || "Could not start checkout.",
        });
      }
    } catch (error) {
      console.error("[Billing] Checkout failed:", error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "Something went wrong. Try again or visit Pricing.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="surface">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--ink)]">
              Current plan
            </h3>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
              Your active subscription details.
            </p>
          </div>
          <span className="app-chip app-chip-accent">{plan.label}</span>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)]">
            <div className="bg-[var(--surface)] p-4">
              <p className="font-serif text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--ink)]">
                {plan.requests.toLocaleString()}
              </p>
              <p className="mt-1.5 text-[11.5px] text-[var(--ink-3)]">
                AI requests per month
              </p>
            </div>
            <div className="bg-[var(--surface)] p-4">
              <p
                className={
                  isActive
                    ? "font-serif text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--success)]"
                    : "font-serif text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--ink-3)]"
                }
              >
                {isPaid ? (isActive ? "Active" : "Canceled") : "Free"}
              </p>
              <p className="mt-1.5 text-[11.5px] text-[var(--ink-3)]">Status</p>
            </div>
          </div>

          {isPaid ? (
            <Button
              type="button"
              className="mt-5"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              <CreditCard className="h-4 w-4" />
              {portalLoading ? "Opening..." : "Manage billing"}
            </Button>
          ) : null}
        </div>
      </section>

      {!isPaid ? (
        <section className="surface">
          <div className="px-5 py-5 sm:px-6">
            <h3 className="text-[15px] font-semibold text-[var(--ink)]">
              Upgrade to Pro
            </h3>
            <p className="mt-1 max-w-prose text-[12.5px] leading-relaxed text-[var(--ink-3)]">
              Unlock more summaries, Remix Studio, AI chat, and brand voice
              tools. The free plan includes {plan.requests} AI requests per
              month.
            </p>
            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              onClick={handleUpgrade}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Starting checkout..." : "Upgrade to Pro"}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      ) : null}

      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Billing details
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Your subscription and billing information.
          </p>
        </div>

        <dl className="divide-y divide-[var(--line)] px-5 sm:px-6">
          {[
            { label: "Next billing date", value: nextBillingDate },
            {
              label: "Subscription status",
              value: isPaid ? (isActive ? "Active" : "Canceled") : "Free tier",
              highlight: isActive && isPaid,
            },
            { label: "Plan", value: plan.label },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <dt className="text-[12.5px] text-[var(--ink-3)]">{row.label}</dt>
              <dd
                className={
                  row.highlight
                    ? "text-right text-[12.5px] font-semibold text-[var(--success)]"
                    : "text-right text-[12.5px] font-medium text-[var(--ink-2)]"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {isPaid ? (
          <p className="border-t border-[var(--line)] px-5 py-4 text-[11.5px] text-[var(--ink-3)] sm:px-6">
            To update your payment method or cancel, use the Manage billing
            button above.
          </p>
        ) : null}
      </section>
    </div>
  );
}
