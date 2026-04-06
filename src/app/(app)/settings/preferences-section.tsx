"use client";

function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SaveIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

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

const OPTIONS: { key: keyof PreferencesData; label: string; desc: string; Icon: () => JSX.Element }[] = [
  { key: "notifications", label: "Email Notifications", desc: "Receive product updates and tips via email", Icon: BellIcon },
  { key: "autoSave", label: "Auto-save Drafts", desc: "Automatically save your work as you go", Icon: SaveIcon },
  { key: "analytics", label: "Usage Analytics", desc: "Help us improve by sharing anonymous usage data", Icon: ChartIcon },
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
                  <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg3)", borderRadius: 7, color: "var(--text3)", flexShrink: 0 }}>
                    <opt.Icon />
                  </span>
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
