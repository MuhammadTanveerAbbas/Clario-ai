"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { BillingSection } from "./billing-section";
import { PreferencesSection, PreferencesData } from "./preferences-section";
import { PrivacySection } from "./privacy-section";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: "free" | "pro";
  subscription_tier?: "free" | "pro" | "enterprise";
  subscription_status?: "active" | "inactive";
}

interface Toast { id: string; type: "success" | "error" | "info"; message: string; }
type TabId = "profile" | "security" | "billing" | "preferences" | "privacy";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "AI Chat", href: "/chat", icon: "chat" },
  { label: "Summarizer", href: "/summarizer", icon: "doc" },
  { label: "Remix Studio", href: "/remix", icon: "remix" },
  { label: "Brand Voice", href: "/brand-voice", icon: "voice" },
  { label: "Calendar", href: "/calendar", icon: "cal", badge: "New" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "security", label: "Security", icon: "lock" },
  { id: "billing", label: "Billing", icon: "card" },
  { id: "preferences", label: "Preferences", icon: "sliders" },
  { id: "privacy", label: "Privacy", icon: "shield" },
];

function NavIcon({ type }: { type: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "grid": return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "chat": return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "doc": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "remix": return <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
    case "voice": return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "cal": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "settings": return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return null;
  }
}

function TabIcon({ type }: { type: string }) {
  const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "user": return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "lock": return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case "card": return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case "sliders": return <svg {...p}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
    case "shield": return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    default: return null;
  }
}

function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--accent)"}`, borderRadius: 10, padding: "11px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "fu .3s ease both", maxWidth: 320, fontFamily: "Geist, system-ui, sans-serif" }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ user, pathname, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, theme, toggleTheme, signOut, router }: {
  user: { full_name?: string; plan?: string } | null;
  pathname: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  theme: string;
  toggleTheme: () => void;
  signOut: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const W = sidebarCollapsed ? 60 : 220;
  return (
    <>
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 40, display: "none" }} className="mobile-overlay" />
      )}
      <aside style={{ width: W, minWidth: W, height: "100vh", background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-b)", display: "flex", flexDirection: "column", position: "sticky", top: 0, transition: "width .2s ease", overflow: "hidden", zIndex: 30, flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? "18px 0" : "18px 16px", borderBottom: "1px solid var(--sidebar-b)", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          {!sidebarCollapsed && <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.05rem", fontWeight: 300, color: "var(--text)", letterSpacing: "-.01em" }}>Clario</span>}
        </div>
        <nav style={{ flex: 1, padding: sidebarCollapsed ? "12px 0" : "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarCollapsed ? "9px 0" : "9px 10px", borderRadius: 8, justifyContent: sidebarCollapsed ? "center" : "flex-start", background: active ? "var(--accent-l)" : "transparent", color: active ? "var(--accent)" : "var(--text3)", textDecoration: "none", fontSize: ".82rem", transition: "all .15s", position: "relative" }}>
                <NavIcon type={item.icon} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge && <span style={{ fontSize: ".6rem", background: "var(--accent)", color: "#fff", borderRadius: 4, padding: "1px 5px" }}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: sidebarCollapsed ? "12px 0" : "12px 10px", borderTop: "1px solid var(--sidebar-b)", display: "flex", flexDirection: "column", gap: 6 }}>
          {!sidebarCollapsed && user?.plan !== "pro" && (
            <Link href="/pricing" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 10px", borderRadius: 8, background: "var(--accent)", color: "#fff", textDecoration: "none", fontSize: ".78rem", fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Upgrade to Pro
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: sidebarCollapsed ? "center" : "space-between" }}>
            <button onClick={toggleTheme} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem" }}>
              {theme === "dark" ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
              {!sidebarCollapsed && (theme === "dark" ? "Light" : "Dark")}
            </button>
            {!sidebarCollapsed && (
              <button onClick={() => { signOut(); router.push("/sign-in"); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "var(--text3)", fontSize: ".75rem" }}>Out</button>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "4px", display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "flex-end" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/></svg>
          </button>
        </div>
      </aside>
    </>
  );
}

const SHARED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Geist:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.sidebar-desktop{display:none!important}.mobile-overlay{display:block!important}}
`;

export default function SettingsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: true, darkMode: theme === "dark", autoSave: true, analytics: false,
  });

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
        setProfile({
          id: authUser.id,
          email: authUser.email || "",
          full_name: data?.name || data?.full_name || authUser.user_metadata?.name || "",
          plan: data?.plan || "free",
          subscription_tier: data?.subscription_tier || "free",
          subscription_status: data?.subscription_status || "inactive",
        });
      } catch {
        addToast("error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser]);

  const handleProfileUpdate = async (name: string) => {
    setProfile(p => p ? { ...p, full_name: name } : p);
    addToast("success", "Profile updated successfully.");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const handlePreferencesChange = (prefs: PreferencesData) => {
    setPreferences(prefs);
    addToast("info", "Preferences saved.");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      <style>{SHARED_CSS}</style>

      <div className="sidebar-desktop">
        <Sidebar
          user={profile ? { full_name: profile.full_name, plan: profile.plan } : null}
          pathname={pathname}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          signOut={signOut}
          router={router}
        />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 56, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, background: "var(--bg)", position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4 }} className="mobile-menu-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.05rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>Settings</span>
          {profile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", color: "#fff", fontWeight: 600 }}>
                {(profile.full_name || profile.email || "U")[0].toUpperCase()}
              </div>
              {!sidebarCollapsed && <span style={{ fontSize: ".8rem", color: "var(--text3)" }}>{profile.full_name || profile.email}</span>}
            </div>
          )}
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 24px", maxWidth: 860, width: "100%" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton h={40} r={10} />
              <Skeleton h={200} r={12} />
              <Skeleton h={160} r={12} />
            </div>
          ) : (
            <div style={{ animation: "fu .3s ease both" }}>
              {/* Page header */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.6rem", fontWeight: 300, color: "var(--text)", marginBottom: 4 }}>Account Settings</h1>
                <p style={{ fontSize: ".85rem", color: "var(--text3)" }}>Manage your profile, security, and preferences</p>
              </div>

              {/* Tab nav */}
              <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border)", paddingBottom: 0, overflowX: "auto" }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 14px", background: "none", border: "none",
                      borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                      color: activeTab === tab.id ? "var(--accent)" : "var(--text3)",
                      cursor: "pointer", fontSize: ".82rem", fontFamily: "var(--sans)",
                      whiteSpace: "nowrap", transition: "color .15s",
                      marginBottom: -1,
                    }}
                  >
                    <TabIcon type={tab.icon} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ animation: "fu .25s ease both" }} key={activeTab}>
                {activeTab === "profile" && profile && (
                  <ProfileSection
                    profile={{ name: profile.full_name || "", email: profile.email }}
                    userId={profile.id}
                    onProfileUpdate={handleProfileUpdate}
                  />
                )}
                {activeTab === "security" && (
                  <SecuritySection userEmail={profile?.email} onSignOut={handleSignOut} />
                )}
                {activeTab === "billing" && (
                  <BillingSection profile={profile ? { subscription_tier: profile.subscription_tier || "free", subscription_status: profile.subscription_status || "inactive" } : undefined} />
                )}
                {activeTab === "preferences" && (
                  <PreferencesSection preferences={preferences} onPreferencesChange={handlePreferencesChange} />
                )}
                {activeTab === "privacy" && (
                  <PrivacySection />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
