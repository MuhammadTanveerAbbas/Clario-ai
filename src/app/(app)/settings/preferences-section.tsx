"use client";

export interface PreferencesData {
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  analytics: boolean;
}

interface PreferencesSectionProps {
  preferences: PreferencesData;
  onPreferencesChange: (preferences: PreferencesData) => void;
}

const OPTIONS: { key: keyof PreferencesData; label: string; desc: string; icon: string }[] = [
  { key: "notifications", label: "Email Notifications", desc: "Receive product updates and tips via email", icon: "🔔" },
  { key: "autoSave", label: "Auto-save Drafts", desc: "Automatically save your work as you go", icon: "💾" },
  { key: "analytics", label: "Usage Analytics", desc: "Help us improve by sharing anonymous usage data", icon: "📊" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: checked ? "var(--accent)" : "var(--border2)",
        position: "relative", transition: "background .2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
      }} />
    </button>
  );
}

export function PreferencesSection({ preferences, onPreferencesChange }: PreferencesSectionProps) {
  const toggle = (key: keyof PreferencesData) => {
    onPreferencesChange({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Preferences</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Customize your Clario experience</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {OPTIONS.map((opt, i) => (
            <div key={opt.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.1rem", width: 28, textAlign: "center" }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: ".85rem", color: "var(--text)", fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: ".78rem", color: "var(--text3)", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
                <Toggle checked={preferences[opt.key]} onChange={() => toggle(opt.key)} />
              </div>
              {i < OPTIONS.length - 1 && <div style={{ height: 1, background: "var(--border)" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
