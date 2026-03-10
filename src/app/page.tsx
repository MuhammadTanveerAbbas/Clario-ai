"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UniqueLoader } from "@/components/ui/unique-loader";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Sparkles,
  Zap,
  FileText,
  MessageSquare,
  PenTool,
  ClipboardList,
  Shield,
  BarChart3,
  ArrowRight,
  Rocket,
  BookOpen,
  Briefcase,
  Edit3,
  Microscope,
  X,
  DollarSign,
  Users,
  Lock,
  Layers,
  type LucideIcon,
} from "lucide-react";

const coreFeatures = [
  {
    title: "Text Summarizer",
    description:
      "Transform long content into concise summaries with 6 AI powered modes. Perfect for quickly understanding documents, articles, and reports.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI Chat",
    description:
      "Conversational AI powered by Groq's Llama models. Get instant, intelligent responses to your questions and ideas.",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Writing Assistant",
    description:
      "Enhance your writing with AI suggestions, tone adjustment, and style improvements. Write better, faster.",
    icon: PenTool,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Meeting Notes",
    description:
      "Convert meeting transcripts into structured notes with summaries, action items, and key discussion points.",
    icon: ClipboardList,
    color: "from-cyan-500 to-blue-500",
  },
];

const stats = [
  {
    value: "4",
    label: "AI Tools",
    description: "Summarizer, Chat, Writing, Meeting Notes",
  },
  {
    value: "100",
    label: "Free Requests",
    description: "Per month on free plan",
  },
  {
    value: "$9",
    label: "Pro Plan",
    description: "1,000 requests per month",
  },
  {
    value: "41",
    label: "Indie Hackers",
    description: "Using Clario Hub",
  },
];

const faqItems = [
  {
    question: "Does this replace ChatGPT?",
    answer:
      "For most founder workflows — yes. Summarizing, chatting, writing, and meeting notes covers 90% of what founders use ChatGPT for, at a fraction of the cost.",
  },
  {
    question: "What's the difference between Free and Pro?",
    answer:
      "Free gives you 100 AI requests/month — enough to test every tool with real work. Pro ($9/month) gives you 1,000 requests, full chat history, and priority processing.",
  },
  {
    question: "Is my content private?",
    answer:
      "Yes. Your data is stored with row-level security — nobody else can see your summaries, chats, or notes. You can delete everything from settings at any time.",
  },
  {
    question: "Can I export my outputs?",
    answer:
      "Yes. Export summaries, writing, and meeting notes as Markdown files anytime. Your work is always yours.",
  },
  {
    question: "What if the AI is down?",
    answer:
      "Clario runs on Groq (primary) with Gemini as automatic fallback. If one provider has issues, the other takes over with no action needed from you.",
  },
];

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

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const targetRoute = user ? "/dashboard" : "/sign-up";
    router.push(targetRoute);
  };

  return (
    <>
      {loading && <UniqueLoader />}
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section
            id="home"
            className="relative flex min-h-[600px] sm:min-h-[700px] h-dvh w-full flex-col items-center justify-center overflow-hidden text-center px-4 -mt-14 sm:mt-0"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="absolute inset-0 -z-10 h-full w-full">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
              </div>
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
            <div className="container z-10">
              <div className="inline-block mb-4 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm animate-fade-in">
                <span className="text-xs sm:text-sm text-gray-300 flex items-center gap-2 flex-wrap justify-center">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#4169E1]" />
                    <span className="whitespace-nowrap">For indie hackers & solo founders</span>
                  </span>
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white animate-fade-in-up px-4">
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                  Stop paying $60/month
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient leading-tight">
                  for 4 different AI tools
                </span>
              </h1>
              <p
                className="mx-auto mt-4 sm:mt-6 max-w-3xl text-sm sm:text-base md:text-lg text-gray-400 animate-fade-in-up px-4 leading-relaxed"
                style={{ animationDelay: "0.2s" }}
              >
                Clario replaces ChatGPT, Notion AI, Otter, and your writing assistant in one tab.
                Summarize, chat, write, and capture meeting notes all for $9/month.
              </p>
              <div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up px-4"
                style={{ animationDelay: "0.4s" }}
              >
                <Button
                  type="button"
                  size="lg"
                  onClick={handleCTAClick}
                  className="group relative overflow-hidden rounded-full bg-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20 w-full sm:w-auto max-w-xs sm:max-w-none"
                  aria-label="Try the Tool Now"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#4169E1]" />
                    {user ? "Go to Dashboard" : "Start your Productivity"}
                  </span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Button>
              </div>
              <div
                className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-[10px] sm:text-xs text-gray-500 animate-fade-in px-4"
                style={{ animationDelay: "0.6s" }}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#4169E1]" />{" "}
                  Used by 41 indie hackers
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#4169E1]" />{" "}
                  Replaces 4 tools
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#4169E1]" />{" "}
                  $9/month Pro
                </span>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section
            id="how-it-works"
            className="py-24 sm:py-32 relative overflow-hidden"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
              <div className="mx-auto max-w-2xl text-center mb-20">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  How it works
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  3 steps to ship faster
                </p>
              </div>
              <div className="relative">
                {/* Connection Line */}
                <div className="hidden lg:block absolute top-24 left-0 right-0 h-1">
                  <div className="max-w-4xl mx-auto px-32">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full opacity-30"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 max-w-6xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative z-10">
                      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/50">
                        <span className="text-3xl font-bold text-white">1</span>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                        <h3 className="text-2xl font-bold text-white mb-3 text-center">
                          Pick your tool
                        </h3>
                        <p className="text-gray-400 text-center leading-relaxed">
                          Create your account in seconds. No credit card
                          required.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative z-10">
                      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/50">
                        <span className="text-3xl font-bold text-white">2</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                        <h3 className="text-2xl font-bold text-white mb-3 text-center">
                          Choose Feature
                        </h3>
                        <p className="text-gray-400 text-center leading-relaxed">
                          Summarizer, Chat, Writing, or Meeting Notes — based on what you&apos;re doing right now.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative z-10">
                      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/50">
                        <span className="text-3xl font-bold text-white">3</span>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 hover:scale-105">
                        <h3 className="text-2xl font-bold text-white mb-3 text-center">
                          Paste your content
                        </h3>
                        <p className="text-gray-400 text-center leading-relaxed">
                          Text, notes, transcripts, drafts — anything you&apos;d normally paste into ChatGPT or Notion AI.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section
            id="use-cases"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  Built for founders
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Where indie hackers actually use AI
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Founder inbox",
                    desc: "Summarize investor updates, long emails, and support threads.",
                    icon: BookOpen,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    title: "Customer calls",
                    desc: "Turn raw call notes into clean summaries and action lists.",
                    icon: Briefcase,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    title: "Landing pages & copy",
                    desc: "Rewrite, improve, and A/B test copy in minutes.",
                    icon: Edit3,
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    title: "Weekly updates",
                    desc: "Turn messy notes into founder updates and changelogs.",
                    icon: Microscope,
                    color: "from-green-500 to-emerald-500",
                  },
                ].map((useCase, i) => (
                  <motion.div
                    key={useCase.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-white/30 transition-all h-full group">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <useCase.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {useCase.title}
                        </h3>
                        <p className="text-sm text-gray-400">{useCase.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section
            id="stats"
            className="py-16 sm:py-20"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-105"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <p className="relative text-4xl font-bold text-white sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="relative mt-2 text-sm font-semibold text-gray-300">
                      {stat.label}
                    </p>
                    <p className="relative mt-1 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  All 4 tools in one tab
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Summarize, chat, write, and capture notes
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-400">
                  Clario replaces a stack of separate AI subscriptions with one focused workspace.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <Card className="group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                      <CardContent className="relative p-8">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                            <span className="text-2xl">📄</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">
                              Summarizer — 10 modes
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                              Paste any text — article, email, report, transcript. Get an executive brief, action items, SWOT analysis, or ELI5 in seconds. 10 output modes built for how founders actually think.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                      <CardContent className="relative p-8">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-2xl">💬</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">
                              AI Chat — with memory
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                              Your conversations are saved and searchable. Pick up where you left off. Faster than ChatGPT, cheaper than GPT-4, built for founder workflows.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                      <CardContent className="relative p-8">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                            <span className="text-2xl">✍️</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">
                              Writing Assistant — 5 tones
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                              Improve, rewrite, expand, or fix grammar. Switch between professional, casual, and technical tone instantly. For emails, landing pages, cold outreach, and investor updates.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                      <CardContent className="relative p-8">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                            <span className="text-2xl">🎙️</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">
                              Meeting Notes — structured instantly
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                              Paste raw meeting notes or transcripts. Get a clean summary, action items, and key decisions in one click. Never lose a commitment made in a call again.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Preview Section */}
          <section
            id="pricing-preview"
            className="py-16 sm:py-20 md:py-24"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12">
                <h2 className="text-sm sm:text-base font-semibold leading-7 text-blue-400">
                  Simple Pricing
                </h2>
                <p className="mt-2 font-headline text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Choose Your Plan
                </p>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-gray-400 px-4">
                  Start free or upgrade to Pro. Cancel anytime with our 30-day
                  money-back guarantee.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                <Card className="bg-white/5 border-white/10 relative overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-5">
                    <CardTitle className="text-lg sm:text-xl text-white">
                      Free
                    </CardTitle>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1.5">
                      Perfect for getting started
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-5 pb-4 sm:pb-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      $0
                      <span className="text-sm sm:text-base text-gray-400">
                        /month
                      </span>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-300">
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        100 requests/month
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        All 5 AI features
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        Email support
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        No credit card required
                      </li>
                    </ul>
                    <Button
                      type="button"
                      onClick={handleCTAClick}
                      className="w-full bg-white text-black hover:bg-white/90 text-xs sm:text-sm py-4 sm:py-5"
                    >
                      {user ? "Go to Dashboard" : "Start Free"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 relative overflow-hidden">
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1">
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-5">
                    <CardTitle className="text-lg sm:text-xl text-white">
                      Pro
                    </CardTitle>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1.5">
                      For power users
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-5 pb-4 sm:pb-6">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      $9
                      <span className="text-sm sm:text-base text-gray-400">
                        /month
                      </span>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-300">
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        1000 requests/month
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        All 4 AI features
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        Priority support
                      </li>
                      <li className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400 flex-shrink-0" />{" "}
                        Early access
                      </li>
                    </ul>
                    <Button
                      type="button"
                      onClick={handleCTAClick}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 text-xs sm:text-sm py-4 sm:py-5"
                    >
                      {user ? "Go to Dashboard" : "Upgrade to Pro"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center mt-5 sm:mt-6">
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm py-4 sm:py-5"
                  >
                    View Full Pricing{" "}
                    <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Comparison Section */}
          <section
            id="comparison"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  Why Clario?
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Stop juggling 4 different tools
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <X className="h-5 w-5 text-red-400" /> Multiple Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-400">
                    <p className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Pay for ChatGPT, Notion AI, Otter, Grammarly…</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Switch between different platforms</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Manage multiple accounts and logins</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Inconsistent user experience</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Data scattered across platforms</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      Better Value
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" /> Clario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-300">
                    <p className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>One affordable subscription ($9/month or $79/year)</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>All features in one dashboard</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Single login, seamless experience</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Consistent, beautiful interface</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>All your data in one secure place</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Why Choose Clario Section */}
          <section
            id="why-clario"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  Why Choose Clario
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Built for Real Productivity
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Fast & Reliable
                    </h3>
                    <p className="text-gray-400">
                      Powered by Groq and Google Gemini for instant, accurate
                      results.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Enterprise Security
                    </h3>
                    <p className="text-gray-400">
                      Row Level Security, encryption, and GDPR/CCPA compliance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Smart Analytics
                    </h3>
                    <p className="text-gray-400">
                      Track usage, streaks, and trends with comprehensive
                      insights.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Social Proof Section */}
          <section
            id="social-proof"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  What founders say
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Built for indie SaaS
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-300 mb-4">
                      &quot;I cancelled ChatGPT Pro and Notion AI the same week I started using Clario. The summarizer alone saved me 2 hours last week.&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        MK
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Marcus K.</p>
                        <p className="text-xs text-gray-400">SaaS founder, bootstrapped to $4k MRR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-300 mb-4">
                      &quot;The meeting notes feature is the one I use every single day. Client calls, investor chats, team syncs — all structured in 30 seconds.&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                        PS
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Priya S.</p>
                        <p className="text-xs text-gray-400">Indie hacker, 3 products launched</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-300 mb-4">
                      &quot;Finally stopped copy-pasting between 4 tabs. Everything lives in Clario now. The writing assistant alone is worth $9/month.&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm">
                        TR
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Tom R.</p>
                        <p className="text-xs text-gray-400">Solo founder, product builder</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section
            id="faq"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-blue-400">
                  Questions?
                </h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Frequently Asked Questions
                </p>
              </div>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem
                        value={`item-${index}`}
                        key={index}
                        className="border-white/10"
                      >
                        <AccordionTrigger className="py-6 text-left text-lg font-semibold text-white hover:no-underline hover:text-blue-400 transition-colors">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-base text-gray-400 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Transform Your Workflow Section */}
          <section
            id="transform-workflow"
            className="py-24 sm:py-32 relative overflow-hidden"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Work Smarter, Not Harder
                  </Badge>
                  <h2 className="text-base font-semibold leading-7 text-blue-400">
                    Transform Your Workflow
                  </h2>
                  <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Save Hours Every Day
                  </p>
                  <p className="mt-6 text-lg leading-8 text-gray-400">
                    Join thousands who've revolutionized their productivity with
                    AI
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left Card - Time Savings */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/30 h-full group hover:border-blue-500/50 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Lightning Fast
                          </h3>
                          <p className="text-sm text-blue-400 font-semibold">
                            Instant Results
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Get AI powered summaries, chat responses, and writing
                        improvements in seconds. No more spending hours reading
                        lengthy documents or crafting perfect emails.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                          <span>Summarize 10-page docs in 30 seconds</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div
                            className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                          <span>Instant chat responses</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div
                            className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                            style={{ animationDelay: "0.6s" }}
                          ></div>
                          <span>Real-time writing improvements</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Card - Quality */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/30 h-full group hover:border-purple-500/50 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <CardContent className="p-8 relative">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-transform">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Premium Quality
                          </h3>
                          <p className="text-sm text-purple-400 font-semibold">
                            Professional Results
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Enterprise-grade AI delivers accurate summaries,
                        intelligent responses, and polished writing. Perfect for
                        professionals who demand excellence.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                          <span>10 specialized summary modes</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div
                            className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                          <span>Context-aware intelligence</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div
                            className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                            style={{ animationDelay: "0.6s" }}
                          ></div>
                          <span>Professional-grade outputs</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Bottom Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-16 max-w-4xl mx-auto"
              >
                <Card className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div className="space-y-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          5 Hours
                        </div>
                        <p className="text-sm text-gray-400">Saved Per Week</p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          10x
                        </div>
                        <p className="text-sm text-gray-400">
                          Faster Workflows
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          100%
                        </div>
                        <p className="text-sm text-gray-400">
                          Satisfaction Rate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            id="final-cta"
            className="py-24 sm:py-32"
            style={{ backgroundColor: "#000000" }}
          >
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 backdrop-blur-sm p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                <div className="relative">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Your next tool subscription is your last one
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    Join 41 indie hackers who replaced 4 AI tools with one. Free forever plan. No credit card needed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      type="button"
                      onClick={handleCTAClick}
                      className="bg-white text-black hover:bg-white/90 px-8"
                    >
                      {user ? "Go to Dashboard" : "Start using Clario free →"}
                    </Button>
                    <Link href="/pricing">
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 px-8"
                      >
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
