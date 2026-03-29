"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface BillingData {
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_status: "active" | "inactive" | "canceled";
  current_period_end?: string;
  stripe_customer_id?: string;
}

interface BillingSectionProps {
  profile?: BillingData;
}

const PLAN_LIMITS = {
  free: { requests: 100, label: "Free Plan", color: "var(--text3)" },
  pro: { requests: 1000, label: "Pro Plan", color: "#f59e0b" },
  enterprise: { requests: 1000, label: "Enterprise", color: "#8b5cf6" },
};

export function BillingSection({ profile }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const tier = (profile?.subscription_tier || "free") as "free" | "pro" | "enterprise";
  const plan = PLAN_LIMITS[tier];
  const isPaid = tier !== "free";
  const isActive = profile?.subscription_status === "active";

  const nextBillingDate = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isPaid ? "Contact support" : "";

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error || "Failed to open billing portal." });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to open billing portal." });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`.billing-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}@media(max-width:380px){.billing-stats{grid-template-columns:1fr}}.billing-actions{display:flex;gap:10px;flex-wrap:wrap}.billing-actions button{flex:1;min-width:120px}`}</style>
      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: isPaid ? "radial-gradient(circle, rgba(245,158,11,.12) 0%, transparent 70%)" : "radial-gradient(circle, rgba(249,115,22,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Your active subscription details</div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: isPaid ? "rgba(245,158,11,.15)" : "var(--bg3)", color: plan.color, border: `1px solid ${isPaid ? "rgba(245,158,11,.3)" : "var(--border)"}`, whiteSpace: "nowrap" }}>
            {plan.label}
          </span>
        </div>

        <div className="billing-stats">
          <div style={{ padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{plan.requests.toLocaleString()}</div>
            <div style={{ fontSize: ".75rem", color: "var(--text3)" }}>AI Requests / month</div>
          </div>
          <div style={{ padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: isActive ? "var(--success)" : "var(--text3)", marginBottom: 4 }}>
              {isPaid ? (isActive ? "Active" : "Canceled") : "Free"}
            </div>
            <div style={{ fontSize: ".75rem", color: "var(--text3)" }}>Status</div>
          </div>
        </div>

        <div className="billing-actions">
          {!isPaid ? (
            <button
              onClick={() => router.push("/pricing")}
              style={{ flex: 1, padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Upgrade to Pro
            </button>
          ) : (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              style={{ flex: 1, padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 600, cursor: portalLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: portalLoading ? 0.7 : 1 }}
            >
              {portalLoading ? "Opening..." : "Manage Billing"}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Billing Details</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Your subscription and billing information</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Next billing date", value: nextBillingDate },
            { label: "Subscription status", value: isPaid ? (isActive ? "Active" : "Canceled") : "Free tier", highlight: isActive && isPaid },
            { label: "Plan", value: plan.label },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9 }}>
              <span style={{ fontSize: ".83rem", color: "var(--text2)" }}>{row.label}</span>
              <span style={{ fontSize: ".83rem", color: row.highlight ? "var(--success)" : "var(--text3)", fontWeight: row.highlight ? 600 : 400 }}>{row.value}</span>
            </div>
          ))}
        </div>
        {isPaid && (
          <p style={{ fontSize: ".75rem", color: "var(--text3)", marginTop: 12 }}>
            To update your payment method or cancel, use the Manage Billing button above.
          </p>
        )}
      </div>
    </div>
  );
}
