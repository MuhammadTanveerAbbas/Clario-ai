"use client";

import { BarChart3, Bell, Save, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

const OPTIONS: {
  key: keyof PreferencesData;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    key: "notifications",
    label: "Email notifications",
    description: "Receive product updates and tips via email.",
    icon: Bell,
  },
  {
    key: "autoSave",
    label: "Auto-save drafts",
    description: "Automatically save your work as you go.",
    icon: Save,
  },
  {
    key: "analytics",
    label: "Usage analytics",
    description: "Help us improve by sharing anonymous usage data.",
    icon: BarChart3,
  },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full border transition-colors",
        checked
          ? "border-[var(--brand)] bg-[var(--brand)]"
          : "border-[var(--line-strong)] bg-[var(--surface-3)]"
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[20px]" : "translate-x-[3px]"
        )}
        aria-hidden
      />
    </button>
  );
}

export function PreferencesSection({
  preferences,
  onPreferencesChange,
}: PreferencesSectionProps) {
  const toggle = (key: keyof PreferencesData) => {
    onPreferencesChange({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <section className="surface">
      <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">
          Preferences
        </h3>
        <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
          Customize how Clario works for you.
        </p>
      </div>

      <div className="divide-y divide-[var(--line)] px-5 sm:px-6">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.key}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
                    {option.description}
                  </p>
                </div>
              </div>
              <Toggle
                checked={preferences[option.key]}
                onChange={() => toggle(option.key)}
                label={option.label}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
