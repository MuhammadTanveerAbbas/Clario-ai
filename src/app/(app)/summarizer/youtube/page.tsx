"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Youtube,
  CheckCircle2,
  Mic,
  AlertTriangle,
  Lightbulb,
  Quote,
  Clock,
  BarChart3,
  List,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const SENTIMENT_CONFIG = {
  positive: { label: "Positive", class: "bg-green-100 text-green-800" },
  negative: { label: "Negative", class: "bg-red-100 text-red-800" },
  neutral: { label: "Neutral", class: "bg-gray-100 text-gray-700" },
  mixed: { label: "Mixed", class: "bg-purple-100 text-purple-800" },
};

const METHOD_CONFIG = {
  captions: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Official Captions",
    class: "bg-green-100 text-green-800",
  },
  audio_transcription: {
    icon: <Mic className="w-3.5 h-3.5" />,
    label: "Audio Transcribed",
    class: "bg-yellow-100 text-yellow-800",
  },
};

const LOADING_STEPS = [
  "Fetching transcript…",
  "Analyzing content…",
  "Building summary…",
  "Generating insights…",
];

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{11}/;

export default function YouTubeAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  function validateUrl(val: string) {
    if (!val) {
      setUrlError("");
      return;
    }
    setUrlError(YT_REGEX.test(val) ? "" : "Please enter a valid YouTube URL");
  }

  async function handleAnalyze() {
    if (!url || urlError) return;
    setError("");
    setResult(null);
    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 4000);

    try {
      const res = await fetch("/api/youtube-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Theme toggle */}
      <div className="flex justify-end">
        <button
          onClick={toggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
          className="w-8 h-8 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center"
        >
          {isDark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Youtube className="text-red-500 w-6 h-6" />
          YouTube Analyzer
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste any YouTube URL  get a structured summary, insights, and topic breakdown.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              validateUrl(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className={urlError ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
        </div>
        <Button onClick={handleAnalyze} disabled={loading || !url || !!urlError}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {loading ? LOADING_STEPS[loadingStep] : "Analyze"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 items-center">
            {result.transcript_method &&
              METHOD_CONFIG[result.transcript_method as keyof typeof METHOD_CONFIG] && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    METHOD_CONFIG[result.transcript_method as keyof typeof METHOD_CONFIG].class
                  }`}
                >
                  {METHOD_CONFIG[result.transcript_method as keyof typeof METHOD_CONFIG].icon}
                  {METHOD_CONFIG[result.transcript_method as keyof typeof METHOD_CONFIG].label}
                </span>
              )}
            {result.content_type && (
              <Badge variant="outline" className="capitalize text-xs">
                {result.content_type}
              </Badge>
            )}
            {result.sentiment &&
              SENTIMENT_CONFIG[result.sentiment as keyof typeof SENTIMENT_CONFIG] && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    SENTIMENT_CONFIG[result.sentiment as keyof typeof SENTIMENT_CONFIG].class
                  }`}
                >
                  {SENTIMENT_CONFIG[result.sentiment as keyof typeof SENTIMENT_CONFIG].label}
                </span>
              )}
            {result.word_count && (
              <span className="text-xs text-muted-foreground">
                {result.word_count.toLocaleString()} words
              </span>
            )}
          </div>

          {/* TL;DR */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                TL;DR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{result.tldr}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Points */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-500" /> Key Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.key_points?.map((p: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-indigo-500 font-bold text-sm mt-0.5 shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Topic Breakdown */}
            {result.topics?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" /> Topic Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={result.topics}
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={35}
                      >
                        {result.topics.map((_: any, i: number) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {result.topics.map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="font-medium">{t.name}</span>
                        <span className="text-muted-foreground ml-auto">
                          {t.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline */}
          {result.timeline?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {result.timeline.map((t: any, i: number) => (
                    <div key={i} className="flex gap-4 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        {i < result.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-muted-foreground">
                            {t.time_range}
                          </span>
                          <span className="text-sm font-semibold">{t.topic}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Insights */}
            {result.insights?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.insights.map((ins: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-2 text-sm bg-yellow-50 border border-yellow-100 rounded-lg p-2.5"
                    >
                      <span className="text-yellow-500 shrink-0">→</span>
                      {ins}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            {result.action_items?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" /> Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.action_items.map((item: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-green-500 font-bold shrink-0">✓</span>
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Key Quotes */}
          {result.key_quotes?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Quote className="w-4 h-4 text-gray-500" /> Key Quotes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.key_quotes.map((q: string, i: number) => (
                  <blockquote
                    key={i}
                    className="border-l-2 border-gray-300 pl-4 italic text-sm text-muted-foreground"
                  >
                    "{q}"
                  </blockquote>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
