"use client";

import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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

interface PreferenceOption {
  key: keyof PreferencesData;
  label: string;
  description: string;
}

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    key: "notifications",
    label: "Email Notifications",
    description: "Receive updates via email",
  },
  {
    key: "autoSave",
    label: "Auto-save Drafts",
    description: "Automatically save your work",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Help improve our service",
  },
];

export function PreferencesSection({
  preferences,
  onPreferencesChange,
}: PreferencesSectionProps) {
  const handleToggle = (key: keyof PreferencesData) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
      <CardHeader>
        <CardTitle className="text-white flex items-center text-base md:text-lg">
          <Bell className="h-4 w-4 md:h-5 md:w-5 mr-2 text-indigo-400" />
          Preferences
        </CardTitle>
        <CardDescription className="text-gray-400 text-xs md:text-sm">
          Customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {PREFERENCE_OPTIONS.map((option, index) => (
          <div key={option.key}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">
                  {option.label}
                </p>
                <p className="text-xs md:text-sm text-gray-400">
                  {option.description}
                </p>
              </div>
              <Switch
                checked={preferences[option.key]}
                onCheckedChange={() => handleToggle(option.key)}
              />
            </div>
            {index < PREFERENCE_OPTIONS.length - 1 && (
              <Separator className="bg-white/10 mt-3 md:mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
