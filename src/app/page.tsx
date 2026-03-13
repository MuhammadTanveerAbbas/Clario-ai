"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UniqueLoader } from "@/components/ui/unique-loader";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Sparkles,
  Zap,
  FileText,
  MessageSquare,
  Youtube,
  Twitter,
  Linkedin,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      router.replace("/auth/callback" + window.location.search);
    }
  }, [router]);

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(user ? "/dashboard" : "/sign-up");
  };

  return (
    <>
      {loading && <UniqueLoader />}
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <section className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden text-center px-4 pt-32 pb-20" style={{ backgroundColor: "#000000" }}>
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
              </div>
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
            <div className="container z-10">
              <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30">
                <Youtube className="h-3 w-3 mr-1" />
                Now with YouTube Integration
              </Badge>
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                <span className="text-3xl md:text-5xl">Turn YouTube videos into</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Twitter threads, LinkedIn posts, blog outlines
                </span>
              </h1>
              <p className="mx-auto max-w-3xl text-base md:text-lg text-gray-400 mb-8">
                Paste a YouTube URL → Get instant transcript → Generate content for every platform. Built for content creators who repurpose fast.
              </p>
              <Button onClick={handleCTAClick} size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base">
                <Zap className="mr-2 h-5 w-5 text-[#4169E1]" />
                {user ? "Go to Dashboard" : "Start Free - 100 Requests"}
              </Button>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-[#4169E1]" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-[#4169E1]" /> YouTube integration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-[#4169E1]" /> 10 summary modes
                </span>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-24" style={{ backgroundColor: "#000000" }}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-16">
                <h2 className="text-base font-semibold text-blue-400">How it works</h2>
                <p className="mt-2 text-3xl font-bold text-white">3 steps to repurpose content</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 h-full">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                        <Youtube className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">1. Paste YouTube URL</h3>
                      <p className="text-gray-400">Drop any YouTube link. We fetch the transcript automatically.</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 h-full">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">2. Choose Format</h3>
                      <p className="text-gray-400">Twitter thread, LinkedIn post, blog outline, or 7 other formats.</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 h-full">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">3. Copy & Post</h3>
                      <p className="text-gray-400">Get formatted content ready to paste. No editing needed.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-24" style={{ backgroundColor: "#000000" }}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-16">
                <h2 className="text-base font-semibold text-blue-400">What you can create</h2>
                <p className="mt-2 text-3xl font-bold text-white">One video → 10 pieces of content</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Twitter Threads", desc: "10-tweet threads with hooks and CTAs", icon: Twitter, color: "from-blue-500 to-cyan-500" },
                  { title: "LinkedIn Posts", desc: "Professional posts with insights", icon: Linkedin, color: "from-purple-500 to-pink-500" },
                  { title: "Blog Outlines", desc: "SEO-optimized post structures", icon: BookOpen, color: "from-orange-500 to-red-500" },
                  { title: "YouTube Descriptions", desc: "Timestamps, links, hashtags", icon: Youtube, color: "from-green-500 to-emerald-500" },
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all h-full group">
                      <CardContent className="p-6 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24" style={{ backgroundColor: "#000000" }}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-16">
                <h2 className="text-base font-semibold text-blue-400">Two powerful tools</h2>
                <p className="mt-2 text-3xl font-bold text-white">Everything you need to repurpose content</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Summarizer + YouTube</h3>
                        <p className="text-gray-400 leading-relaxed">
                          Paste YouTube URL or any text. Get 10 different formats: Twitter threads, LinkedIn posts, blog outlines, show notes, and more. Built for creators who repurpose.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">AI Chat</h3>
                        <p className="text-gray-400 leading-relaxed">
                          Ask questions about your content, brainstorm ideas, get feedback. All conversations saved. Faster than ChatGPT, built for content workflows.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-24" style={{ backgroundColor: "#000000" }}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-12">
                <h2 className="text-base font-semibold text-blue-400">Simple Pricing</h2>
                <p className="mt-2 text-3xl font-bold text-white">Start free, upgrade when ready</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                    <div className="text-3xl font-bold text-white mb-4">$0<span className="text-base text-gray-400">/month</span></div>
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> 100 requests/month</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> YouTube integration</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> 10 content formats</li>
                    </ul>
                    <Button onClick={handleCTAClick} className="w-full bg-white text-black hover:bg-white/90">
                      {user ? "Go to Dashboard" : "Start Free"}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 relative">
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">Popular</Badge>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <div className="text-3xl font-bold text-white mb-4">$9<span className="text-base text-gray-400">/month</span></div>
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> 1000 requests/month</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> YouTube integration</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-400" /> Priority support</li>
                    </ul>
                    <Button onClick={handleCTAClick} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600">
                      {user ? "Go to Dashboard" : "Upgrade to Pro"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24" style={{ backgroundColor: "#000000" }}>
            <div className="mx-auto max-w-4xl px-4">
              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Start repurposing content today</h2>
                  <p className="text-gray-400 mb-8">Join creators who turn 1 video into 10 pieces of content</p>
                  <Button onClick={handleCTAClick} size="lg" className="bg-white text-black hover:bg-white/90 px-8">
                    {user ? "Go to Dashboard" : "Start Free →"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
