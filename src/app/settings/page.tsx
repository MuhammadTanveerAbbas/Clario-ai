"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import { Loader2, User, Lock, CreditCard, Bell, Shield } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { ProfileSection } from "./profile-section";
import { SecuritySection } from "./security-section";
import { BillingSection } from "./billing-section";
import {
  PreferencesSection,
  type PreferencesData,
} from "./preferences-section";
import { PrivacySection } from "./privacy-section";

const TAB_TRIGGERS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "account", label: "Security", icon: Lock },
  { value: "subscription", label: "Billing", icon: CreditCard },
  { value: "preferences", label: "Preferences", icon: Bell },
  { value: "data", label: "Privacy", icon: Shield },
];

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { profile, loading: profileLoading } = useSettings({
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.user_metadata?.name,
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: true,
    darkMode: true,
    autoSave: true,
    analytics: false,
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in?redirect=/settings");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppNavbar />
      <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="p-4 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-cyan-500/5 border border-indigo-500/20">
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-1 md:mb-2">
              Settings
            </h1>
            <p className="text-xs md:text-base text-gray-400">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
            <TabsList className="bg-white/5 border-white/10 w-full overflow-x-auto flex-nowrap justify-start h-auto p-1">
              {TAB_TRIGGERS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-white/10 text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 whitespace-nowrap"
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <ProfileSection
                profile={profile}
                userId={user?.id}
                onProfileUpdate={() => Promise.resolve()}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="account">
              <SecuritySection userEmail={user?.email} onSignOut={signOut} />
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="subscription">
              <BillingSection profile={profile} />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <PreferencesSection
                preferences={preferences}
                onPreferencesChange={setPreferences}
              />
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="data">
              <PrivacySection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
