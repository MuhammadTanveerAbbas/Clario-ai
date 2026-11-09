"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading-page";
import { Page, PageHeader } from "@/components/layout/page";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { BillingSection } from "./billing-section";
import { PreferencesSection, PreferencesData } from "./preferences-section";
import { PrivacySection } from "./privacy-section";
import { AppearanceSection } from "./appearance-section";
import {
  CreditCard,
  LockKeyhole,
  SlidersHorizontal,
  Sun,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: "free" | "pro";
  subscription_tier?: "free" | "pro" | "enterprise";
  subscription_status?: "active" | "inactive" | "canceled";
  current_period_end?: string;
  stripe_customer_id?: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

type TabId =
  | "profile"
  | "security"
  | "billing"
  | "preferences"
  | "appearance"
  | "privacy";

const TABS: { id: TabId; label: string; description: string; icon: LucideIcon }[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Name and account details",
    icon: UserRound,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and sessions",
    icon: LockKeyhole,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan and payment",
    icon: CreditCard,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Notifications and defaults",
    icon: SlidersHorizontal,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Type, shape, and density",
    icon: Sun,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Data and account controls",
    icon: ShieldCheck,
  },
];

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-24 right-4 z-[100] flex max-w-[320px] flex-col gap-2 md:bottom-6 md:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[12.5px] font-medium shadow-[var(--shadow-medium)]",
            toast.type === "success"
              ? "border-[rgba(21,128,61,0.25)] bg-[rgba(21,128,61,0.06)] text-[var(--success)]"
              : toast.type === "error"
                ? "border-[rgba(180,35,24,0.25)] bg-[rgba(180,35,24,0.06)] text-[var(--error)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)]"
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-current opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user: authUser, loading: authLoading, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: true,
    darkMode: false,
    autoSave: true,
    analytics: false,
  });

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((previous) => [...previous, { id, type, message }]);
    window.setTimeout(
      () => setToasts((previous) => previous.filter((item) => item.id !== id)),
      4000
    );
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("profiles")
          .select(
            "id, full_name, avatar_url, subscription_tier, subscription_status, current_period_end, stripe_customer_id, requests_used_this_month, created_at"
          )
          .eq("id", authUser.id)
          .single();
        setProfile({
          id: authUser.id,
          email: authUser.email || "",
          full_name:
            data?.full_name ||
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            "",
          plan: (data?.subscription_tier === "pro" ? "pro" : "free") as
            | "free"
            | "pro",
          subscription_tier: data?.subscription_tier || "free",
          subscription_status: data?.subscription_status || "inactive",
          current_period_end: data?.current_period_end,
          stripe_customer_id: data?.stripe_customer_id,
        });
      } catch (error) {
        console.error("[Settings] Failed to load profile:", error);
        setProfile({
          id: authUser.id,
          email: authUser.email || "",
          full_name:
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            "",
          plan: "free",
          subscription_tier: "free",
          subscription_status: "inactive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser, authLoading, supabase]);

  const handleProfileUpdate = async (name: string) => {
    setProfile((current) =>
      current ? { ...current, full_name: name } : current
    );
    addToast("success", "Profile updated.");
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  const handlePreferencesChange = (nextPreferences: PreferencesData) => {
    setPreferences(nextPreferences);
    addToast("info", "Preferences saved.");
  };

  if (authLoading || !authUser) return <LoadingPage />;

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab);

  return (
    <Page>
      <PageHeader
        title="Account settings"
        description="Manage your profile, security, plan, and workspace preferences."
      />

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="min-w-0">
          <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors lg:w-full",
                    active
                      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[var(--brand)]" : "text-[var(--ink-3)]"
                    )}
                    strokeWidth={1.8}
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 hidden border-t border-[var(--line)] pt-4 lg:block">
            <p className="px-3 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
              Changes are saved per section. You can leave this page at any
              time.
            </p>
          </div>
        </nav>

        <section className="min-w-0">
          <div className="mb-5 border-b border-[var(--line)] pb-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
              {activeTabMeta?.label}
            </h2>
            <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">
              {activeTabMeta?.description}
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="surface animate-pulse h-[104px]" />
              <div className="surface animate-pulse h-[240px]" />
            </div>
          ) : (
            <div key={activeTab}>
              {activeTab === "profile" ? (
                <ProfileSection
                  profile={{
                    name: profile?.full_name || "",
                    email: profile?.email || authUser?.email || "",
                  }}
                  userId={profile?.id || authUser?.id}
                  onProfileUpdate={handleProfileUpdate}
                />
              ) : null}
              {activeTab === "security" ? (
                <SecuritySection
                  userEmail={profile?.email}
                  onSignOut={handleSignOut}
                />
              ) : null}
              {activeTab === "billing" ? (
                <BillingSection
                  profile={
                    profile
                      ? {
                          subscription_tier:
                            profile.subscription_tier || "free",
                          subscription_status: (profile.subscription_status ||
                            "inactive") as "active" | "inactive" | "canceled",
                          current_period_end: profile.current_period_end,
                          stripe_customer_id: profile.stripe_customer_id,
                        }
                      : undefined
                  }
                />
              ) : null}
              {activeTab === "preferences" ? (
                <PreferencesSection
                  preferences={preferences}
                  onPreferencesChange={handlePreferencesChange}
                />
              ) : null}
              {activeTab === "privacy" ? <PrivacySection /> : null}
              {activeTab === "appearance" ? <AppearanceSection /> : null}
            </div>
          )}
        </section>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </Page>
  );
}
