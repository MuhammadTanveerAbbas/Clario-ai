"use client";

import { useState, useEffect } from "react";
import posthog from 'posthog-js';
import {
  Baby,
  Briefcase,
  Check,
  Flame,
  Gavel,
  Loader2,
  LayoutList,
  ListTodo,
  NotebookPen,
  Quote,
  SmilePlus,
  Sparkles,
  Swords,
  Trash2,
  AlertCircle,
  Youtube,
  FileText,
} from "lucide-react";

import { sanitizeHtml } from "@/lib/sanitize";
import {
  saveToHistory,
  getHistory,
  deleteHistoryEntry,
  type HistoryEntry,
} from "@/lib/history";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SummarizerOutput } from "@/components/summarizer-output";
import { useAuth } from "@/contexts/AuthContext";
import { checkUsageLimit } from "@/lib/usage-limits";

type ModeValue =
  | "Action Items Only"
  | "Decisions Made"
  | "Brutal Roast"
  | "Executive Brief"
  | "Full Breakdown"
  | "Key Quotes"
  | "Sentiment Analysis"
  | "ELI5"
  | "SWOT Analysis"
  | "Meeting Minutes";

interface SummaryMode {
  readonly value: ModeValue;
  readonly helperText: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const SUMMARY_MODES: readonly SummaryMode[] = [
  { value: "Action Items Only", helperText: "Just the to-do list.", icon: ListTodo },
  { value: "Decisions Made", helperText: "Key decisions, nothing else.", icon: Gavel },
  { value: "Brutal Roast", helperText: "Sarcastic critique with fixes.", icon: Flame },
  { value: "Executive Brief", helperText: "High level, formal summary.", icon: Briefcase },
  { value: "Full Breakdown", helperText: "Detailed, structured analysis.", icon: LayoutList },
  { value: "Key Quotes", helperText: "Extract the most impactful quotes.", icon: Quote },
  { value: "Sentiment Analysis", helperText: "Analyze the tone and emotion.", icon: SmilePlus },
  { value: "ELI5", helperText: "Explain it like I'm 5.", icon: Baby },
  { value: "SWOT Analysis", helperText: "Strengths, Weaknesses, etc.", icon: Swords },
  { value: "Meeting Minutes", helperText: "Formal record of a meeting.", icon: NotebookPen },
];

const modeToApiFormat = (mode: ModeValue): string => {
  const mapping: Record<ModeValue, string> = {
    'Action Items Only': 'action-items',
    'Decisions Made': 'decisions',
    'Brutal Roast': 'brutal-roast',
    'Executive Brief': 'executive-brief',
    'Full Breakdown': 'full-breakdown',
    'Key Quotes': 'key-quotes',
    'Sentiment Analysis': 'sentiment',
    'ELI5': 'eli5',
    'SWOT Analysis': 'swot',
    'Meeting Minutes': 'meeting-minutes',
  };
  return mapping[mode] || mode;
};

export function SummarizerTool() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [mode, setMode] = useState<ModeValue>("Full Breakdown");
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usageRemaining, setUsageRemaining] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [activeTab, setActiveTab] = useState("text");

  const { toast } = useToast();

  useEffect(() => {
    const savedText = localStorage.getItem("summarizerText") || "";
    const savedMode = localStorage.getItem("summarizerMode");
    setText(savedText);
    if (savedMode && SUMMARY_MODES.some(m => m.value === savedMode)) {
      setMode(savedMode as ModeValue);
    }
    setHistory(getHistory());
    fetchUsageData();
  }, []);

  useEffect(() => {
    if (text) localStorage.setItem("summarizerText", text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem("summarizerMode", mode);
  }, [mode]);

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        const tier = data.subscription_tier || 'free';
        const currentUsage = data.requests_used || 0;
        const usage = checkUsageLimit(tier, currentUsage);
        setUsageRemaining(usage.remaining);
        setUsageLimit(usage.limit);
      }
    } catch (error) {
      console.warn('Could not fetch usage data:', error);
    }
  };

  const handleFetchTranscript = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        variant: "destructive",
        title: "YouTube URL required",
        description: "Please enter a valid YouTube URL",
      });
      return;
    }

    setIsFetchingTranscript(true);
    setError(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transcript');
      }

      const data = await response.json();
      setText(data.transcript);
      setActiveTab("text");
      
      toast({
        title: "✅ Transcript loaded!",
        description: "YouTube transcript fetched successfully. Ready to summarize.",
      });

      posthog.capture('youtube_transcript_fetched', {
        video_id: data.videoId,
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch transcript",
        description: error.message || "Could not load YouTube transcript",
      });
      setError(error.message);
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Text required",
        description: "Please enter text or fetch a YouTube transcript",
      });
      return;
    }

    posthog.capture('summarize_started', { mode });

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: modeToApiFormat(mode) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate summary');
      }

      const result = await response.json();
      const cleanSummary = sanitizeHtml(result.summary);

      saveToHistory({ text, mode, summary: cleanSummary });
      setHistory(getHistory());
      setSummary(cleanSummary);
      setShowSuccess(true);
      fetchUsageData();

      posthog.capture('summarize_completed', { mode });

      setTimeout(() => setShowSuccess(false), 2000);

    } catch (error: any) {
      const friendly = error.message || "Failed to generate summary";
      setError(friendly);
      posthog.capture('summarize_failed', { mode, error: friendly });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setText(entry.text);
    setMode(entry.mode as ModeValue);
    setSummary(entry.summary);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(getHistory());
  };

  const handleRegenerate = (newMode: ModeValue) => {
    setMode(newMode);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as any);
    }, 100);
  };

  const isSubmitDisabled = isLoading || !text.trim();

  return (
    <div className="mt-0">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/[0.04] p-1 rounded-lg">
            <TabsTrigger 
              value="youtube" 
              className="data-[state=active]:bg-white/[0.08] rounded-md text-[13px] font-medium text-white/60 data-[state=active]:text-white"
            >
              <Youtube className="h-3.5 w-3.5 mr-2" />
              YouTube URL
            </TabsTrigger>
            <TabsTrigger 
              value="text" 
              className="data-[state=active]:bg-white/[0.08] rounded-md text-[13px] font-medium text-white/60 data-[state=active]:text-white"
            >
              <FileText className="h-3.5 w-3.5 mr-2" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url" className="text-[13px] font-medium text-white/70">
                YouTube Video URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-[14px] h-10 focus-visible:ring-1 focus-visible:ring-white/20"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isFetchingTranscript}
                />
                <Button
                  type="button"
                  onClick={handleFetchTranscript}
                  disabled={isFetchingTranscript || !youtubeUrl.trim()}
                  className="bg-white text-black hover:bg-white/90 h-10 text-[13px] font-medium"
                >
                  {isFetchingTranscript ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Youtube className="h-3.5 w-3.5 mr-2" />
                      Fetch
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[12px] text-white/30">
                Paste any YouTube URL to fetch the transcript
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-[13px] font-medium text-white/70">
                Your Text
              </Label>
              <Textarea
                id="text-input"
                placeholder="Paste your transcript, article, or any text here..."
                className="h-[200px] sm:h-[250px] resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-[14px] focus-visible:ring-1 focus-visible:ring-white/20"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-3">
            <Label className="text-[14px] font-medium text-white">
              Summary Mode
            </Label>
            <RadioGroup
              value={mode}
              onValueChange={(value: string) => setMode(value as ModeValue)}
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {SUMMARY_MODES.map((modeOption) => (
                <div key={modeOption.value} className="relative group">
                  <RadioGroupItem
                    value={modeOption.value}
                    id={modeOption.value}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor={modeOption.value}
                    className="flex h-full min-h-[90px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center transition-all duration-150 hover:bg-white/[0.04] hover:border-white/[0.12] peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10"
                  >
                    <modeOption.icon className="h-5 w-5 text-blue-500 transition-transform" />
                    <span className="text-[11px] font-medium text-white leading-tight">
                      {modeOption.value}
                    </span>
                    <p className="text-[10px] text-white/40 leading-tight line-clamp-2">
                      {modeOption.helperText}
                    </p>
                  </Label>
                  <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-blue-500 opacity-0 transition-all duration-150 peer-data-[state=checked]:opacity-100" />
                </div>
              ))}
            </RadioGroup>
          </div>
        </form>

        {usageRemaining <= usageLimit * 0.1 && usageRemaining > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
            <p className="text-[12px] text-white/60">
              <span className="font-medium">{usageRemaining}</span> of {usageLimit} requests remaining
            </p>
          </div>
        )}

        <SummarizerOutput
          result={summary || ""}
          mode={mode}
          isLoading={isLoading}
          error={error || undefined}
          showSuccess={showSuccess}
          onRegenerate={handleRegenerate}
          onRetry={() => handleSubmit({ preventDefault: () => {} } as any)}
          history={history}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onLoadFromHistory={handleLoadFromHistory}
          onDeleteHistory={handleDeleteHistory}
          onSummarize={() => handleSubmit({ preventDefault: () => {} } as any)}
          canSummarize={!isSubmitDisabled}
        />

        {showHistory && history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-white">Recent Summaries</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete all history?')) {
                    localStorage.removeItem('summarizerHistory');
                    setHistory([]);
                    setShowHistory(false);
                  }
                }}
                className="border-white/[0.08] text-white/60 hover:bg-white/[0.04] h-8 text-[12px]"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete All
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-white">{entry.mode}</span>
                        <span className="text-[11px] text-white/30">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[12px] text-white/40 truncate">
                        {entry.text.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadFromHistory(entry)}
                        className="text-white/60 hover:bg-white/[0.04] h-8 text-[12px]"
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHistory(entry.id)}
                        className="text-white/60 hover:bg-white/[0.04] h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
