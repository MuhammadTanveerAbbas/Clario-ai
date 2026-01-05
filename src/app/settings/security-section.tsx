"use client";

import { useState } from "react";
import { Lock, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface SecuritySectionProps {
  userEmail?: string;
  onSignOut: () => Promise<void>;
}

export function SecuritySection({
  userEmail,
  onSignOut,
}: SecuritySectionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
        <CardHeader>
          <CardTitle className="text-white flex items-center text-base md:text-lg">
            <Lock className="h-4 w-4 md:h-5 md:w-5 mr-2 text-indigo-400" />
            Change Password
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleChangePassword}
            className="space-y-3 md:space-y-4"
          >
            <div className="space-y-1 md:space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-white text-sm md:text-base"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                className="bg-black/50 border-white/20 text-white text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-white text-sm md:text-base"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                className="bg-black/50 border-white/20 text-white text-sm md:text-base"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white text-sm md:text-base"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="bg-black/50 border-white/20 text-white text-sm md:text-base"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 font-semibold transition-all duration-200 hover:scale-105 text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center text-base md:text-lg">
            <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Account Security
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs md:text-sm">
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
            <div>
              <p className="text-white font-medium text-sm md:text-base">
                Two-Factor Authentication
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                Add an extra layer of security
              </p>
            </div>
            <Button
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs md:text-sm"
            >
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between p-2 md:p-3 bg-black/30 rounded-lg">
            <div>
              <p className="text-white font-medium text-sm md:text-base">
                Login Sessions
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                Manage active sessions
              </p>
            </div>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs md:text-sm"
            >
              View All
            </Button>
          </div>
          <Separator className="bg-white/10" />
          <Button
            variant="destructive"
            onClick={onSignOut}
            className="w-full text-sm md:text-base"
          >
            Sign Out of All Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
