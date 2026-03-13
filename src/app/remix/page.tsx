"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, Check, Twitter, Linkedin, Mail, Instagram, Youtube, FileText, Mic, Image as ImageIcon, Video, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REMIX_FORMATS = [
  { id: "twitter", name: "Twitter Thread", icon: Twitter, description: "10-tweet thread with hooks" },
  { id: "linkedin", name: "LinkedIn Post", icon: Linkedin, description: "Professional post with insights" },
  { id: "email", name: "Email Newsletter", icon: Mail, description: "3-section newsletter" },
  { id: "instagram", name: "Instagram Caption", icon: Instagram, description: "5 caption variations" },
  { id: "youtube", name: "YouTube Description", icon: Youtube, description: "Description + timestamps" },
  { id: "blog", name: "Blog Outline", icon: FileText, description: "H2s + bullet points" },
  { id: "podcast", name: "Podcast Notes", icon: Mic, description: "Show notes + timestamps" },
  { id: "quotes", name: "Quote Graphics", icon: ImageIcon, description: "5 pull quotes" },
  { id: "shorts", name: "Short-Form Scripts", icon: Video, description: "3x 60-second scripts" },
  { id: "carousel", name: "LinkedIn Carousel", icon: Zap, description: "10 slides with text" },
];

export default function RemixPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  const handleRemix = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please enter content to remix",
      });
      return;
    }

    setLoading(true);
    setResults({});

    try {
      const response = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to remix content");
      }

      const data = await response.json();
      setResults(data.results);

      toast({
        title: "✅ Content remixed!",
        description: "10 formats generated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remix content",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppNavbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-1.5 tracking-tight">Content Remix Studio</h1>
            <p className="text-[13px] sm:text-[14px] text-white/40">Turn 1 piece of content into 10 formats instantly</p>
          </div>

          <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="content" className="text-[12px] sm:text-[13px] font-medium text-white/70 mb-1.5 sm:mb-2 block">
                  Your Content
                </Label>
                <Textarea
                  id="content"
                  placeholder="Paste your video transcript, article, or any content here..."
                  className="h-[160px] sm:h-[200px] resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-[13px] sm:text-[14px] focus-visible:ring-1 focus-visible:ring-white/20"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <Button
                onClick={handleRemix}
                disabled={loading || !content.trim()}
                className="w-full bg-white text-black hover:bg-white/90 h-10 sm:h-11 text-[13px] sm:text-[14px] font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Remixing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Remix into 10 Formats
                  </>
                )}
              </Button>
            </div>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="space-y-2.5 sm:space-y-3">
              <h2 className="text-sm sm:text-[15px] font-medium text-white">Your Remixed Content</h2>
              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                {REMIX_FORMATS.map((format) => {
                  const result = results[format.id];
                  if (!result) return null;

                  return (
                    <div key={format.id} className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-500/10">
                            <format.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-[13px] sm:text-[14px] font-medium text-white">{format.name}</h3>
                            <p className="text-[10px] sm:text-[11px] text-white/40">{format.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(format.id, result)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white/[0.04] flex-shrink-0"
                        >
                          {copiedId === format.id ? (
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60" />
                          )}
                        </Button>
                      </div>
                      <div className="rounded-lg bg-white/[0.04] p-2.5 sm:p-3 max-h-[180px] sm:max-h-[200px] overflow-y-auto">
                        <p className="text-[12px] sm:text-[13px] text-white/80 whitespace-pre-wrap leading-relaxed">{result}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
