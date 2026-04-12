"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { applyTokens } from "@/lib/design-tokens";

type FontOption = "geist" | "inter" | "fraunces" | "mono";
type RadiusOption = "none" | "sm" | "md" | "lg" | "full";
type DensityOption = "compact" | "default" | "comfortable";

interface AppearanceData {
  font: FontOption;
  radius: RadiusOption;
  density: DensityOption;
}

const FONTS: {
  id: FontOption;
  label: string;
  sample: string;
  stack: string;
}[] = [
  {
    id: "geist",
    label: "Geist",
    sample: "The quick brown fox",
    stack: "'Geist', system-ui, sans-serif",
  },
  {
    id: "inter",
    label: "Inter",
    sample: "The quick brown fox",
    stack: "'Inter', system-ui, sans-serif",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    sample: "The quick brown fox",
    stack: "'Fraunces', Georgia, serif",
  },
  {
    id: "mono",
    label: "Mono",
    sample: "The quick brown fox",
    stack: "'GeistMono', 'Fira Code', monospace",
  },
];

const RADII: { id: RadiusOption; label: string; px: number }[] = [
  { id: "none", label: "None", px: 0 },
  { id: "sm", label: "Small", px: 4 },
  { id: "md", label: "Medium", px: 8 },
  { id: "lg", label: "Large", px: 14 },
  { id: "full", label: "Full", px: 999 },
];

const DENSITIES: { id: DensityOption; label: string; desc: string }[] = [
  { id: "compact", label: "Compact", desc: "Tighter spacing" },
  { id: "default", label: "Default", desc: "Balanced spacing" },
  { id: "comfortable", label: "Comfortable", desc: "More breathing room" },
];

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [appearance, setAppearance] = useState<AppearanceData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("clario-appearance");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { font: "geist", radius: "md", density: "default" };
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyAppearance(appearance);
  }, []);

  function applyAppearance(data: AppearanceData) {
    const root = document.documentElement;
    const font = FONTS.find((f) => f.id === data.font);
    if (font) root.style.setProperty("--sans", font.stack);
    const radius = RADII.find((r) => r.id === data.radius);
    if (radius) root.style.setProperty("--radius-ui", `${radius.px}px`);
    const densityMap: Record<DensityOption, string> = {
      compact: "0.8",
      default: "1",
      comfortable: "1.2",
    };
    root.style.setProperty("--density", densityMap[data.density]);
  }

  function handleChange<K extends keyof AppearanceData>(
    key: K,
    value: AppearanceData[K],
  ) {
    const next = { ...appearance, [key]: value };
    setAppearance(next);
    applyAppearance(next);
  }

  function handleSave() {
    localStorage.setItem("clario-appearance", JSON.stringify(appearance));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const card: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--card-b)",
    borderRadius: 14,
    padding: "22px 24px",
    marginBottom: 16,
  };

  const label: React.CSSProperties = {
    fontSize: ".7rem",
    fontWeight: 600,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "var(--text3)",
    marginBottom: 14,
    display: "block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <style>{`
        .ap-theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .ap-theme-btn{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg2);cursor:pointer;transition:all .18s;font-family:var(--sans);color:var(--text3);font-size:.75rem;font-weight:500}
        .ap-theme-btn:hover{border-color:var(--border2);color:var(--text2);background:var(--bg3)}
        .ap-theme-btn.active{border-color:var(--accent);color:var(--accent);background:var(--accent-l)}
        .ap-theme-preview{width:100%;height:44px;border-radius:8px;border:1px solid var(--border);overflow:hidden;display:flex;gap:3px;padding:5px}
        .ap-font-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        .ap-font-btn{padding:14px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);cursor:pointer;transition:all .18s;text-align:left}
        .ap-font-btn:hover{border-color:var(--border2);background:var(--bg3)}
        .ap-font-btn.active{border-color:var(--accent);background:var(--accent-l)}
        .ap-font-name{font-size:.75rem;font-weight:600;color:var(--text3);margin-bottom:4px}
        .ap-font-btn.active .ap-font-name{color:var(--accent)}
        .ap-font-sample{font-size:.95rem;color:var(--text2);line-height:1.3}
        .ap-radius-row{display:flex;gap:8px;align-items:center}
        .ap-radius-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 8px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);cursor:pointer;transition:all .18s}
        .ap-radius-btn:hover{border-color:var(--border2);background:var(--bg3)}
        .ap-radius-btn.active{border-color:var(--accent);background:var(--accent-l)}
        .ap-radius-box{width:28px;height:28px;background:var(--border2)}
        .ap-radius-lbl{font-size:.68rem;font-weight:500;color:var(--text3)}
        .ap-radius-btn.active .ap-radius-lbl{color:var(--accent)}
        .ap-density-row{display:flex;gap:8px}
        .ap-density-btn{flex:1;padding:12px 10px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);cursor:pointer;transition:all .18s;text-align:center}
        .ap-density-btn:hover{border-color:var(--border2);background:var(--bg3)}
        .ap-density-btn.active{border-color:var(--accent);background:var(--accent-l)}
        .ap-density-title{font-size:.78rem;font-weight:600;color:var(--text2);margin-bottom:2px}
        .ap-density-btn.active .ap-density-title{color:var(--accent)}
        .ap-density-desc{font-size:.68rem;color:var(--text3)}
        .ap-save-btn{width:100%;padding:12px;border-radius:10px;border:none;background:var(--accent);color:#fff;font-family:var(--sans);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .18s;margin-top:4px}
        .ap-save-btn:hover{background:#ea6c0a}
        .ap-save-btn.saved{background:var(--success);color:#fff}
        @media(max-width:640px){
          .ap-theme-grid{grid-template-columns:repeat(3,1fr);gap:8px}
          .ap-theme-btn{padding:12px 8px;font-size:.7rem;gap:6px}
          .ap-theme-preview{height:36px}
          .ap-font-grid{grid-template-columns:repeat(2,1fr);gap:6px}
          .ap-font-btn{padding:12px}
          .ap-font-sample{font-size:.85rem}
          .ap-radius-row{gap:6px}
          .ap-radius-btn{padding:10px 6px}
          .ap-radius-box{width:22px;height:22px}
          .ap-density-row{gap:6px}
          .ap-density-btn{padding:10px 8px}
        }
      `}</style>

      {/* Theme */}
      <div style={card}>
        <span style={label}>Theme</span>
        <div className="ap-theme-grid">
          <button
            className={`ap-theme-btn${theme === "light" ? " active" : ""}`}
            onClick={() => setTheme("light")}
          >
            <div className="ap-theme-preview" style={{ background: "#ffffff" }}>
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  background: "#fafaf9",
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div
                  style={{ height: 6, background: "#e7e5e4", borderRadius: 3 }}
                />
                <div
                  style={{
                    height: 6,
                    background: "#e7e5e4",
                    borderRadius: 3,
                    width: "70%",
                  }}
                />
              </div>
            </div>
            <SunIcon />
            Light
          </button>
          <button
            className={`ap-theme-btn${theme === "dark" ? " active" : ""}`}
            onClick={() => setTheme("dark")}
          >
            <div className="ap-theme-preview" style={{ background: "#0c0a09" }}>
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  background: "#111110",
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div
                  style={{ height: 6, background: "#292524", borderRadius: 3 }}
                />
                <div
                  style={{
                    height: 6,
                    background: "#292524",
                    borderRadius: 3,
                    width: "70%",
                  }}
                />
              </div>
            </div>
            <MoonIcon />
            Dark
          </button>
          <button
            className={`ap-theme-btn`}
            style={{ opacity: 0.5, cursor: "not-allowed" }}
            title="Coming soon"
          >
            <div
              className="ap-theme-preview"
              style={{
                background: "linear-gradient(135deg,#fff 50%,#0c0a09 50%)",
              }}
            >
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  background: "rgba(128,128,128,.3)",
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    height: 6,
                    background: "rgba(128,128,128,.3)",
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: "rgba(128,128,128,.3)",
                    borderRadius: 3,
                    width: "70%",
                  }}
                />
              </div>
            </div>
            <SystemIcon />
            System
          </button>
        </div>
      </div>

      {/* Font */}
      <div style={card}>
        <span style={label}>Font</span>
        <div className="ap-font-grid">
          {FONTS.map((f) => (
            <button
              key={f.id}
              className={`ap-font-btn${appearance.font === f.id ? " active" : ""}`}
              onClick={() => handleChange("font", f.id)}
            >
              <div className="ap-font-name">{f.label}</div>
              <div className="ap-font-sample" style={{ fontFamily: f.stack }}>
                {f.sample}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div style={card}>
        <span style={label}>Border Radius</span>
        <div className="ap-radius-row">
          {RADII.map((r) => (
            <button
              key={r.id}
              className={`ap-radius-btn${appearance.radius === r.id ? " active" : ""}`}
              onClick={() => handleChange("radius", r.id)}
            >
              <div
                className="ap-radius-box"
                style={{ borderRadius: r.px > 14 ? 14 : r.px }}
              />
              <span className="ap-radius-lbl">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div style={card}>
        <span style={label}>Density</span>
        <div className="ap-density-row">
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              className={`ap-density-btn${appearance.density === d.id ? " active" : ""}`}
              onClick={() => handleChange("density", d.id)}
            >
              <div className="ap-density-title">{d.label}</div>
              <div className="ap-density-desc">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        className={`ap-save-btn${saved ? " saved" : ""}`}
        onClick={handleSave}
      >
        {saved ? "✓ Saved" : "Save Appearance"}
      </button>
    </div>
  );
}
