"use client";

import { useState, useEffect, useRef } from "react";
import posthog from 'posthog-js';
import {
  Baby,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
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
}

// Constants
const STORAGE_KEYS = {
  TEXT: "summarizerText",
  MODE: "summarizerMode",
} as const;

const MIN_TEXT_LENGTH = 10;
const MAX_WORD_COUNT = 10000;
const SUCCESS_DISPLAY_DURATION = 2000;

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

const extractTextContent = (element: HTMLElement): string =>
  element.innerText || element.textContent || "";

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

// Clipboard service
interface ClipboardService {
  copyText(text: string): Promise<void>;
}

const createClipboardService = (
  toast: ReturnType<typeof useToast>["toast"]
): ClipboardService => ({
  copyText: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "The summary has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description:
          "Could not copy to clipboard. Please try selecting and copying manually.",
      });
    }
  },
});

// Summary service
interface SummaryService {
  generateSummary(request: SummaryRequest): Promise<string>;
}

const createSummaryService = (): SummaryService => ({
  generateSummary: async (request: SummaryRequest) => {
    // Use the new API route that includes usage tracking
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || "Failed to generate summary"
      );
    }

    const result = await response.json();
    return sanitizeHtml(result.summary);
  },
});

// Main component
export function SummarizerTool() {
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
  });

  const summaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Services - injected dependencies
  const storageService = createStorageService();
  const clipboardService = createClipboardService(toast);
  const summaryService = createSummaryService();

  // Initialize state from storage and setup keyboard shortcuts
  useEffect(() => {
    const initialState = storageService.loadInitialState();
    const history = getHistory();
    setState((prev) => ({
      ...prev,
      ...initialState,
      history,
      wordCount: countWords(initialState.text),
    }));

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

  const handleExportMarkdown = async (): Promise<void> => {
    if (!summaryRef.current) return;

    // Get clean text content
    let text =
      summaryRef.current.innerText || summaryRef.current.textContent || "";

    // Clean up text thoroughly
    text = text
      .replace(/\s+/g, " ") // Multiple spaces to single
      .replace(/[^\x20-\x7E\n\r]/g, "") // Remove non-printable characters
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    // Create formatted document content
    const content = `# CLARIO SUMMARY REPORT

**Summary Mode:** ${state.mode}
**Generated:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
**Word Count:** ${text.split(" ").length} words

---

## Summary Content

${text}

---

*Generated by Clario Summarizer - Transform text into clear, actionable summaries.*`;

    // Create and download file
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `Clario-Summary-${state.mode.replace(
      /\s+/g,
      "-"
    )}-${timestamp}.md`;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    posthog.capture('summary_exported', { mode: state.mode });

    toast({
      title: "Exported Successfully!",
      description:
        "High-quality Markdown file downloaded with clean formatting.",
    });
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    if (!summaryRef.current) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "No summary content found to copy.",
      });
      return;
    }

    const text = extractTextContent(summaryRef.current);
    await clipboardService.copyText(text);
    posthog.capture('summary_copied', { mode: state.mode });
  };

  const handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (!isSubmitDisabled) {
            handleSubmit(e as any);
          }
          break;
        case "k":
          e.preventDefault();
          if (hasSummary) {
            handleCopyToClipboard();
          }
          break;
        case "s":
          e.preventDefault();
          if (hasSummary) {
            handleExportMarkdown();
          }
          break;
      }
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
      const history = getHistory();

      setState((prev) => ({ ...prev, summary, showSuccess: true, history }));

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

  // Computed values
  const isSubmitDisabled =
    state.isLoading || state.wordCount < 1 || state.wordCount > MAX_WORD_COUNT;
  const hasSummary = Boolean(state.summary);
  const wordLimitColor =
    state.wordCount > MAX_WORD_COUNT
      ? "text-red-500"
      : state.wordCount > MAX_WORD_COUNT * 0.9
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
              <div className="relative">
                <Textarea
                  id="text-input"
                  placeholder="Paste your transcript, meeting notes, article, or any text here..."
                  className="h-[200px] sm:h-[250px] resize-none pr-20 sm:pr-24 bg-black/50 border-white/20 text-white text-sm placeholder:text-gray-500 focus:border-white/40 focus:outline-none focus:ring-0 custom-scrollbar"
                  aria-label="Text to summarize"
                  value={state.text}
                  onChange={(e) => handleTextChange(e.target.value)}
                />
                <div
                  className={cn(
                    "absolute bottom-2 right-2 text-[10px] sm:text-xs font-semibold",
                    wordLimitColor
                  )}
                >
                  {state.wordCount.toLocaleString()} /{" "}
                  {MAX_WORD_COUNT.toLocaleString()} words
                </div>
              </div>
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

            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitDisabled}
                aria-label="Summarize (Ctrl+Enter)"
                className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold disabled:opacity-40 shadow-lg"
              >
                {state.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin text-[#4169E1]" />
                    <span className="text-sm sm:text-base">Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#4169E1]" />
                    <span className="text-sm sm:text-base">Summarize</span>
                  </>
                )}
              </Button>
              {state.history.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showHistory: !prev.showHistory,
                    }))
                  }
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                >
                  <History className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#4169E1]" />
                  <span className="text-sm sm:text-base">
                    History ({state.history.length})
                  </span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  toast({
                    title: "Keyboard Shortcuts",
                    description:
                      "Ctrl+Enter: Summarize • Ctrl+K: Copy • Ctrl+S: Export",
                  });
                }}
                className="w-full sm:w-auto text-white hover:bg-white/10"
              >
                <Keyboard className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#4169E1]" />
                <span className="text-sm sm:text-base">Shortcuts</span>
              </Button>
            </div>
          </form>

          {state.error && (
            <div className="mt-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center">
              <p className="text-sm sm:text-base text-red-400 font-semibold">
                {state.error}
              </p>
            </div>
          )}

          <div className="mt-8">
            {hasSummary ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Your Summary
                    </h3>
                    {state.showSuccess && (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#4169E1] animate-in fade-in zoom-in" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      aria-label="Copy summary to clipboard (Ctrl+K)"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ClipboardCopy className="mr-2 h-4 w-4 flex-shrink-0 text-[#4169E1]" />
                      <span className="truncate">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportMarkdown}
                      aria-label="Export as Markdown (Ctrl+S)"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="mr-2 h-4 w-4 flex-shrink-0 text-[#4169E1]" />
                      <span className="truncate">Export</span>
                    </Button>
                  </div>
                </div>
                <Card className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1]/5 via-transparent to-[#4169E1]/5 pointer-events-none"></div>
                  <CardContent className="p-0 relative z-10">
                    <div
                      id="summary-content"
                      ref={summaryRef}
                      className="summary-prose p-6 sm:p-10 text-sm sm:text-base leading-relaxed text-gray-100"
                      dangerouslySetInnerHTML={{ __html: state.summary }}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              !state.isLoading && (
                <div className="text-center text-gray-400 py-8 sm:py-12">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-[#4169E1]" />
                  <p className="text-sm sm:text-base">
                    Your summary will appear here instantly.
                  </p>
                </div>
              )
            )}
          </div>

          {state.showHistory && state.history.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Summaries
              </h3>
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
