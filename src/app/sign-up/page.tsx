"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import {
  HoneypotField,
  useFormRateLimit,
  validateEmailDomain,
} from "@/components/anti-spam";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const { canSubmit } = useFormRateLimit(3, 60000);
  const supabase = createClient();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;
    if (!canSubmit()) {
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: "Please wait a moment before trying again.",
      });
      return;
    }
    if (!validateEmailDomain(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please use a valid email address.",
      });
      return;
    }
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => router.push(redirect), 1000);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || `Failed to sign in with ${provider}.`,
        });
      }
    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to sign in with ${provider}.`,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a1a2e] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <img
            src="/favicon.svg"
            alt="Clario Logo"
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5">
              Clario
            </h1>
            <p className="text-gray-400 text-xs">AI Powered Productivity Platform</p>
          </div>
        </motion.div>

        <Card className="bg-white/[0.05] border-white/10 backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 rounded-2xl">
          <CardHeader className="space-y-1.5 pb-5 px-6 pt-6">
            <CardTitle className="text-xl font-bold text-white text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-400 text-xs">
              Start your productivity journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <HoneypotField />
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="name" className="text-white text-xs font-semibold">
                  Full Name
                </Label>
                <div
                  className={`relative group transition-all duration-300 ${
                    focusedField === "name" ? "ring-2 ring-[#4169E1]/50" : ""
                  } rounded-lg`}
                >
                  <User className="absolute left-4 top-3 h-4 w-4 text-gray-500 group-hover:text-[#4169E1] transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-11 h-10 text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-[#4169E1]/50 transition-all rounded-lg"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Label htmlFor="email" className="text-white text-xs font-semibold">
                  Email Address
                </Label>
                <div
                  className={`relative group transition-all duration-300 ${
                    focusedField === "email" ? "ring-2 ring-[#4169E1]/50" : ""
                  } rounded-lg`}
                >
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-gray-500 group-hover:text-[#4169E1] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-11 h-10 text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-[#4169E1]/50 transition-all rounded-lg"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="password" className="text-white text-xs font-semibold">
                  Password
                </Label>
                <div
                  className={`relative group transition-all duration-300 ${
                    focusedField === "password" ? "ring-2 ring-[#4169E1]/50" : ""
                  } rounded-lg`}
                >
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-gray-500 group-hover:text-[#4169E1] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-11 pr-11 h-10 text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-[#4169E1]/50 transition-all rounded-lg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-[#4169E1] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Label htmlFor="confirmPassword" className="text-white text-xs font-semibold">
                  Confirm Password
                </Label>
                <div
                  className={`relative group transition-all duration-300 ${
                    focusedField === "confirmPassword" ? "ring-2 ring-[#4169E1]/50" : ""
                  } rounded-lg`}
                >
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-gray-500 group-hover:text-[#4169E1] transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-11 pr-11 h-10 text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-[#4169E1]/50 transition-all rounded-lg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-[#4169E1] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-gradient-to-r from-[#4169E1] to-[#5179F1] text-white hover:from-[#3159D1] hover:to-[#4169E1] font-semibold shadow-lg shadow-[#4169E1]/30 transition-all rounded-lg hover:shadow-xl hover:shadow-[#4169E1]/40"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/[0.05] px-3 py-1 text-gray-400 rounded-full">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-lg font-medium"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#4169E1] hover:text-[#5179F1] font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a1a2e]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
