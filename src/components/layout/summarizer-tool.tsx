"use client";

import { useState, useEffect } from "react";
import posthog from 'posthog-js';
import {
  Baby,
  Briefcase,
  Check,
  Flame,
  Gavel,
  History,
  Keyboard,
  LayoutList,
  ListTodo,
  Loader2,
  NotebookPen,
  Quote,
  SmilePlus,
  Sparkles,
  Swords,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { sanitizeHtml } from "@/lib/sanitize";
import {
  saveToHistory,
  getHistory,
  deleteHistoryEntry,
  type HistoryEntry,
} from "@/lib/history";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SummarizerOutput } from "@/components/summarizer-output";
import { useAuth } from "@/contexts/AuthContext";
import { checkUsageLimit } from "@/lib/usage-limits";

// Types
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

interface SummaryRequest {
  readonly text: string;
  readonly mode: ModeValue;
}

interface SummaryState {
  text: string;
  mode: ModeValue;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  showSuccess: boolean;
  showHistory: boolean;
  history: HistoryEntry[];
  wordCount: number;
  usageRemaining: number;
  usageLimit: number;
}

// Constants
const STORAGE_KEYS = {
  TEXT: "summarizerText",
  MODE: "summarizerMode",
} as const;

const MIN_TEXT_LENGTH = 10;
const MAX_WORD_COUNT = 10000;
const SUCCESS_DISPLAY_DURATION = 2000;
const API_TIMEOUT = 30000;
const MAX_HISTORY_ITEMS = 50;

/**
 * Counts words in a text string
 * @param text - Input text
 * @returns Number of words
 */
const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

const SUMMARY_MODES: readonly SummaryMode[] = [
  {
    value: "Action Items Only",
    helperText: "Just the to-do list.",
    icon: ListTodo,
  },
  {
    value: "Decisions Made",
    helperText: "Key decisions, nothing else.",
    icon: Gavel,
  },
  {
    value: "Brutal Roast",
    helperText: "Sarcastic critique with fixes.",
    icon: Flame,
  },
  {
    value: "Executive Brief",
    helperText: "High level, formal summary.",
    icon: Briefcase,
  },
  {
    value: "Full Breakdown",
    helperText: "Detailed, structured analysis.",
    icon: LayoutList,
  },
  {
    value: "Key Quotes",
    helperText: "Extract the most impactful quotes.",
    icon: Quote,
  },
  {
    value: "Sentiment Analysis",
    helperText: "Analyze the tone and emotion.",
    icon: SmilePlus,
  },
  {
    value: "ELI5",
    helperText: "Explain it like I'm 5.",
    icon: Baby,
  },
  {
    value: "SWOT Analysis",
    helperText: "Strengths, Weaknesses, etc.",
    icon: Swords,
  },
  {
    value: "Meeting Minutes",
    helperText: "Formal record of a meeting.",
    icon: NotebookPen,
  },
] as const;

// Pure utility functions
const isValidMode = (mode: string): mode is ModeValue =>
  SUMMARY_MODES.some((m) => m.value === mode);

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
const getStorageValue = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read from local storage for key: ${key}`, error);
    return null;
  }
};

const setStorageValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Could not write to local storage for key: ${key}`, error);
  }
};

// Storage service
interface StorageService {
  loadInitialState(): Pick<SummaryState, "text" | "mode">;
  saveText(text: string): void;
  saveMode(mode: ModeValue): void;
}

const createStorageService = (): StorageService => ({
  loadInitialState: () => {
    const savedText = getStorageValue(STORAGE_KEYS.TEXT) || "";
    const savedMode = getStorageValue(STORAGE_KEYS.MODE);
    const mode: ModeValue =
      savedMode && isValidMode(savedMode) ? savedMode : "Full Breakdown";

    return { text: savedText, mode };
  },

  saveText: (text: string) => setStorageValue(STORAGE_KEYS.TEXT, text),
  saveMode: (mode: ModeValue) => setStorageValue(STORAGE_KEYS.MODE, mode),
});

// Summary service
interface SummaryService {
  generateSummary(request: SummaryRequest): Promise<string>;
}

const createSummaryService = (): SummaryService => ({
  generateSummary: async (request: SummaryRequest) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: request.text,
          mode: modeToApiFormat(request.mode),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Failed to generate summary"
        );
      }

      const result = await response.json();
      return sanitizeHtml(result.summary);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  },
});

// Main component
export function SummarizerTool() {
  const { user } = useAuth();
  const [state, setState] = useState<SummaryState>({
    text: "",
    mode: "Full Breakdown",
    summary: null,
    isLoading: false,
    error: null,
    showSuccess: false,
    showHistory: false,
    history: [],
    wordCount: 0,
    usageRemaining: 0,
    usageLimit: 100,
  });

  const { toast } = useToast();

  // Services - injected dependencies
  const storageService = createStorageService();
  const summaryService = createSummaryService();

  // Initialize state from storage and setup keyboard shortcuts
  useEffect(() => {
    const initialState = storageService.loadInitialState();
    let history = getHistory();
    
    // Limit history to MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem('summarizerHistory', JSON.stringify(history));
    }

    setState((prev) => ({
      ...prev,
      ...initialState,
      history,
      wordCount: countWords(initialState.text),
    }));

    // Fetch usage data
    fetchUsageData();

    // Add keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () =>
      document.removeEventListener("keydown", handleKeyboardShortcuts);
  }, []);

  // Persist text changes
  useEffect(() => {
    if (state.text) {
      storageService.saveText(state.text);
    }
  }, [state.text]);

  // Persist mode changes
  useEffect(() => {
    storageService.saveMode(state.mode);
  }, [state.mode]);

  // Event handlers
  const handleTextChange = (text: string): void => {
    const wordCount = countWords(text);

    if (wordCount > MAX_WORD_COUNT) {
      toast({
        variant: "destructive",
        title: "Word Limit Exceeded!",
        description: `Maximum ${MAX_WORD_COUNT.toLocaleString()} words allowed. You have ${wordCount.toLocaleString()} words.`,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      text,
      error: null,
      wordCount,
    }));
  };

  const handleModeChange = (mode: ModeValue): void => {
    setState((prev) => ({ ...prev, mode }));
  };



  const handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitDisabled) {
          handleSubmit(e as any);
        }
      } else if (e.key === "k" && state.summary) {
        e.preventDefault();
        handleCopyFromKeyboard();
      } else if (e.key === "s" && state.summary) {
        e.preventDefault();
        // Trigger download - handled by SummarizerOutput
      }
    }
  };

  const handleCopyFromKeyboard = async () => {
    if (state.summary) {
      try {
        await navigator.clipboard.writeText(state.summary);
        toast({
          title: "Copied to clipboard!",
          description: "The summary has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Could not copy to clipboard.",
        });
      }
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        const tier = data.subscription_tier || 'free';
        const currentUsage = data.requests_used || 0;
        const usage = checkUsageLimit(tier, currentUsage);
        setState((prev) => ({
          ...prev,
          usageRemaining: usage.remaining,
          usageLimit: usage.limit,
        }));
      }
    } catch (error) {
      console.warn('Could not fetch usage data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    posthog.capture('summarize_started', {
      mode: state.mode,
      word_count: state.wordCount,
    });

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      summary: null,
      showSuccess: false,
    }));

    try {
      const summary = await summaryService.generateSummary({
        text: state.text,
        mode: state.mode,
      });

      saveToHistory({ text: state.text, mode: state.mode, summary });
      let history = getHistory();
      
      // Limit history
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem('summarizerHistory', JSON.stringify(history));
      }

      setState((prev) => ({ ...prev, summary, showSuccess: true, history }));

      // Refresh usage data
      fetchUsageData();

      posthog.capture('summarize_completed', {
        mode: state.mode,
        word_count: state.wordCount,
      });

      // Hide success indicator after delay
      setTimeout(() => {
        setState((prev) => ({ ...prev, showSuccess: false }));
      }, SUCCESS_DISPLAY_DURATION);
    } catch (error: any) {
      // Surface a friendly message in the UI but avoid noisy console stack traces.
      const friendly =
        (error && (error.message || String(error))) ||
        "An error occurred while generating the summary. Please try again.";

      console.warn("Summary generation failed:", friendly);

      posthog.capture('summarize_failed', {
        mode: state.mode,
        error: friendly,
      });

      setState((prev) => ({ ...prev, error: friendly }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleLoadFromHistory = (entry: HistoryEntry): void => {
    setState((prev) => ({
      ...prev,
      text: entry.text,
      mode: entry.mode as ModeValue,
      summary: entry.summary,
      showHistory: false,
      wordCount: countWords(entry.text),
    }));
  };

  const handleDeleteHistory = (id: string): void => {
    deleteHistoryEntry(id);
    setState((prev) => ({ ...prev, history: getHistory() }));
  };

  const handleRegenerate = (newMode: ModeValue): void => {
    setState((prev) => ({ ...prev, mode: newMode }));
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as any);
    }, 100);
  };

  const handleRetry = (): void => {
    handleSubmit({ preventDefault: () => {} } as any);
  };

  // Computed values
  const isSubmitDisabled =
    state.isLoading || state.wordCount < 1 || state.wordCount > MAX_WORD_COUNT;
  const wordLimitColor =
    state.wordCount > MAX_WORD_COUNT
      ? "text-red-500"
      : state.wordCount > MAX_WORD_COUNT * 0.9
      ? "text-yellow-500"
      : "text-gray-400";
  
  const usageWarningColor =
    state.usageRemaining === 0
      ? "text-red-500"
      : state.usageRemaining < state.usageLimit * 0.1
      ? "text-yellow-500"
      : "text-gray-400";

  return (
    <div className="mt-0">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="text-input"
                className="text-sm font-semibold text-white sm:text-base"
              >
                Your Text
              </Label>
              <Textarea
                id="text-input"
                placeholder="Paste your transcript, meeting notes, article, or any text here..."
                className="h-[200px] sm:h-[250px] resize-none bg-black/50 border-white/20 text-white text-sm placeholder:text-gray-500 focus:border-white/40 focus:outline-none focus:ring-0 text-justify"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                aria-label="Text to summarize"
                value={state.text}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">
                Choose Summary Mode
              </Label>
              <RadioGroup
                value={state.mode}
                onValueChange={(value: string) =>
                  handleModeChange(value as ModeValue)
                }
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                aria-label="Summary mode selection"
              >
                {SUMMARY_MODES.map((modeOption) => (
                  <div key={modeOption.value} className="relative group">
                    <RadioGroupItem
                      value={modeOption.value}
                      id={modeOption.value}
                      className="sr-only peer"
                      aria-label={`${modeOption.value}: ${modeOption.helperText}`}
                    />
                    <Label
                      htmlFor={modeOption.value}
                      className="flex h-full min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/10 bg-black/30 p-3 text-center transition-all duration-200 hover:bg-white/10 hover:border-white/30 hover:scale-105 peer-data-[state=checked]:border-[#4169E1] peer-data-[state=checked]:bg-white/10 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-[#4169E1]/20"
                    >
                      <modeOption.icon
                        className="h-6 w-6 text-[#4169E1] transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-bold text-white leading-tight">
                        {modeOption.value}
                      </span>
                      <p className="text-[10px] text-gray-400 leading-tight line-clamp-2">
                        {modeOption.helperText}
                      </p>
                    </Label>
                    <Check
                      className="absolute top-2 right-2 h-4 w-4 text-[#4169E1] opacity-0 transition-all duration-200 peer-data-[state=checked]:opacity-100 peer-data-[state=checked]:scale-110"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>
          </form>

          {/* Usage Warning */}
          {state.usageRemaining <= state.usageLimit * 0.1 && state.usageRemaining > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <p className={`text-sm ${usageWarningColor}`}>
                <span>
                  <span className="font-semibold">{state.usageRemaining}</span> of {state.usageLimit} requests remaining this month.
                </span>
              </p>
            </div>
          )}

          <SummarizerOutput
            result={state.summary || ""}
            mode={state.mode}
            isLoading={state.isLoading}
            error={state.error || undefined}
            showSuccess={state.showSuccess}
            onRegenerate={handleRegenerate}
            onRetry={handleRetry}
            history={state.history}
            showHistory={state.showHistory}
            onToggleHistory={() =>
              setState((prev) => ({
                ...prev,
                showHistory: !prev.showHistory,
              }))
            }
            onLoadFromHistory={handleLoadFromHistory}
            onDeleteHistory={handleDeleteHistory}
            onSummarize={() => handleSubmit({ preventDefault: () => {} } as any)}
            canSummarize={!isSubmitDisabled}
          />

          {state.showHistory && state.history.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Recent Summaries
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete all history? This cannot be undone.')) {
                      localStorage.removeItem('summarizerHistory');
                      setState((prev) => ({ ...prev, history: [], showHistory: false }));
                    }
                  }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete All
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {state.history.map((entry) => (
                  <Card
                    key={entry.id}
                    className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">
                              {entry.mode}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {entry.text.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadFromHistory(entry)}
                            className="text-white hover:bg-white/10"
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHistory(entry.id)}
                            className="text-white hover:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4 text-[#4169E1]" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
