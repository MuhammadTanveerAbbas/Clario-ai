"use client";

import { useState } from "react";
import { User, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  name: string;
  email: string;
}

interface ProfileSectionProps {
  profile: ProfileData;
  userId?: string;
  onProfileUpdate: (name: string) => Promise<void>;
}

export function ProfileSection({
  profile,
  userId,
  onProfileUpdate,
}: ProfileSectionProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name);
  const { toast } = useToast();
  const supabase = createClient();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) throw new Error("User ID not found");

      const { error } = await supabase
        .from("users")
        .update({ name })
        .eq("id", userId);

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { name },
      });

      await onProfileUpdate(name);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
      <CardHeader>
        <CardTitle className="text-white flex items-center text-base md:text-lg">
          <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-indigo-400" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-gray-400 text-xs md:text-sm">
          Update your profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-3 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="name" className="text-white text-sm md:text-base">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/50 border-white/20 text-white text-sm md:text-base"
              disabled={loading}
            />
          </div>
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="email" className="text-white text-sm md:text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-black/50 border-white/20 text-white opacity-50 text-sm md:text-base"
            />
            <p className="text-xs text-gray-400">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 font-semibold transition-all duration-200 hover:scale-105 text-sm md:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
