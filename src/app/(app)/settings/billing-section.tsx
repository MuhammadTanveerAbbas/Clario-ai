"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface BillingData {
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_status: "active" | "inactive";
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
  const router = useRouter();
  const { toast } = useToast();

  const tier = (profile?.subscription_tier || "free") as "free" | "pro" | "enterprise";
  const plan = PLAN_LIMITS[tier];
  const isPaid = tier !== "free";

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      toast({ title: "Subscription cancellation", description: "Please contact support to cancel your subscription." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to cancel subscription." });
    } finally {
      setLoading(false);
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
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{plan.requests}</div>
            <div style={{ fontSize: ".75rem", color: "var(--text3)" }}>AI Requests / month</div>
          </div>
          <div style={{ padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: isPaid ? "var(--success)" : "var(--text3)", marginBottom: 4 }}>{isPaid ? "Active" : "Free"}</div>
            <div style={{ fontSize: ".75rem", color: "var(--text3)" }}>Status</div>
          </div>
        </div>

        <div className="billing-actions">
          <button
            onClick={() => router.push("/pricing")}
            style={{ flex: 1, padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            {isPaid ? "Change Plan" : "Upgrade to Pro"}
          </button>
          {isPaid && (
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{ padding: "10px 16px", background: "none", border: "1px solid rgba(248,113,113,.3)", borderRadius: 9, color: "var(--error)", fontSize: ".84rem", cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Billing & Usage</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Monitor your usage and billing information</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Next billing date", value: "N/A" },
            { label: "Payment method", value: "None on file" },
            { label: "Subscription status", value: isPaid ? "Active" : "Free tier", highlight: isPaid },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 9 }}>
              <span style={{ fontSize: ".83rem", color: "var(--text2)" }}>{row.label}</span>
              <span style={{ fontSize: ".83rem", color: row.highlight ? "var(--success)" : "var(--text3)", fontWeight: row.highlight ? 600 : 400 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
