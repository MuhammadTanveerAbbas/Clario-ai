"use client";

import { Shield, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PrivacySection() {
  const handleRequestExport = () => {
    // TODO: Implement data export functionality
    console.log("Request export");
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
      )
    ) {
      return;
    }

    // TODO: Implement account deletion functionality
    console.log("Delete account");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
        <CardHeader>
          <CardTitle className="text-white flex items-center text-base md:text-lg">
            <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2 text-indigo-400" />
            Data & Privacy
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Control your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="p-3 md:p-4 bg-black/30 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <h4 className="text-white font-medium text-sm md:text-base">
                Export Data
              </h4>
              <Download className="h-3 w-3 md:h-4 md:w-4 text-[#4169E1]" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
              Download all your data including summaries, chats, and documents.
            </p>
            <Button
              onClick={handleRequestExport}
              variant="outline"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs md:text-sm"
            >
              Request Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center text-base md:text-lg">
            <Trash2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Permanently delete your account and all data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full text-sm md:text-base"
          >
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
