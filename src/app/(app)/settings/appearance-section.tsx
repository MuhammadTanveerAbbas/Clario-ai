"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const DENSITIES: { id: DensityOption; label: string; description: string }[] = [
  { id: "compact", label: "Compact", description: "Tighter spacing" },
  { id: "default", label: "Default", description: "Balanced spacing" },
  { id: "comfortable", label: "Comfortable", description: "More breathing room" },
];

export function AppearanceSection() {
  const [appearance, setAppearance] = useState<AppearanceData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("clario-appearance");
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore malformed local settings.
      }
    }
    return { font: "geist", radius: "md", density: "default" };
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  function applyAppearance(data: AppearanceData) {
    const root = document.documentElement;
    const font = FONTS.find((option) => option.id === data.font);
    if (font) root.style.setProperty("--sans", font.stack);
    const radius = RADII.find((option) => option.id === data.radius);
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
    value: AppearanceData[K]
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

  return (
    <div className="space-y-4">
      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">Font</h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Choose the typeface used across the app.
          </p>
        </div>
        <div className="grid gap-2 px-5 py-5 sm:grid-cols-2 sm:px-6">
          {FONTS.map((font) => {
            const active = appearance.font === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => handleChange("font", font.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)]"
                )}
              >
                <span
                  className={cn(
                    "block text-[11px] font-semibold uppercase tracking-[0.08em]",
                    active ? "text-[var(--brand)]" : "text-[var(--ink-3)]"
                  )}
                >
                  {font.label}
                </span>
                <span
                  className="mt-1 block text-[15px] text-[var(--ink-2)]"
                  style={{ fontFamily: font.stack }}
                >
                  {font.sample}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Corner radius
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Set how rounded cards and controls are.
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2 px-5 py-5 sm:px-6">
          {RADII.map((radius) => {
            const active = appearance.radius === radius.id;
            return (
              <button
                key={radius.id}
                type="button"
                onClick={() => handleChange("radius", radius.id)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors",
                  active
                    ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)]"
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 border",
                    active
                      ? "border-[var(--brand)] bg-[var(--accent-m)]"
                      : "border-[var(--line-strong)] bg-[var(--surface-3)]"
                  )}
                  style={{ borderRadius: radius.px > 14 ? 14 : radius.px }}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[10.5px] font-medium",
                    active ? "text-[var(--brand)]" : "text-[var(--ink-3)]"
                  )}
                >
                  {radius.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Density
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Adjust the spacing between elements.
          </p>
        </div>
        <div className="grid gap-2 px-5 py-5 sm:grid-cols-3 sm:px-6">
          {DENSITIES.map((density) => {
            const active = appearance.density === density.id;
            return (
              <button
                key={density.id}
                type="button"
                onClick={() => handleChange("density", density.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border px-3 py-3 text-center transition-colors",
                  active
                    ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)]"
                )}
              >
                <span
                  className={cn(
                    "block text-[12.5px] font-semibold",
                    active ? "text-[var(--brand)]" : "text-[var(--ink-2)]"
                  )}
                >
                  {density.label}
                </span>
                <span className="mt-0.5 block text-[10.5px] text-[var(--ink-3)]">
                  {density.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Button type="button" onClick={handleSave} className="w-full">
        {saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Saved" : "Save appearance"}
      </Button>
    </div>
  );
}
