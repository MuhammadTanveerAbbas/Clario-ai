"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, FileText, Zap, ArrowRight } from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppNavbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-[800px] mx-auto">
          {/* Main 404 Card */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#4169E1]/10 mb-6">
              <span className="text-3xl sm:text-4xl">🔍</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              404
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              Page Not Found
            </h2>
            
            <p className="text-sm sm:text-[15px] text-white/40 max-w-md mx-auto mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button className="bg-[#4169E1] text-white hover:bg-[#3159D1] h-10 px-6 w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.04] h-10 px-6 w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <p className="text-xs sm:text-[13px] text-white/40 text-center mb-4">
              Or explore our features
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/chat">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">AI Chat</p>
                      <p className="text-xs text-white/30">Ask anything</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/summarizer">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Summarizer</p>
                      <p className="text-xs text-white/30">Quick summaries</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/remix">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Remix Studio</p>
                      <p className="text-xs text-white/30">Repurpose content</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
