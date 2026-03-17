"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Check, Mic2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandVoice {
  id: string;
  name: string;
  examples: string;
  created_at: string;
  is_active: boolean;
}

export default function BrandVoicePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [examples, setExamples] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    } else if (user) {
      loadVoices();
    }
  }, [user, authLoading, router]);

  const loadVoices = async () => {
    try {
      const response = await fetch("/api/brand-voice");
      const data = await response.json();
      if (response.ok) {
        setVoices(data.voices || []);
      }
    } catch (error) {
      console.error("Failed to load voices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !examples.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please provide both name and examples",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, examples }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create voice");
      }

      toast({
        title: "✅ Voice created!",
        description: "Your brand voice has been saved",
      });

      setName("");
      setExamples("");
      setShowForm(false);
      loadVoices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create voice",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this voice?")) return;

    try {
      const response = await fetch(`/api/brand-voice?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to delete voice");
      }

      toast({
        title: "Voice deleted",
        description: "Brand voice removed successfully",
      });

      loadVoices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete voice",
      });
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const response = await fetch("/api/brand-voice/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to activate voice");
      }

      toast({
        title: "Voice activated",
        description: "This voice will be used for all AI outputs",
      });

      loadVoices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to activate voice",
      });
    }
  };

  if (authLoading || loading) {
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
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-1.5 tracking-tight">Brand Voice Library</h1>
              <p className="text-[13px] sm:text-[14px] text-white/40">Train AI to write in your unique style</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-black hover:bg-white/90 h-9 text-[13px] font-medium w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Voice
            </Button>
          </div>

          {showForm && (
            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[12px] sm:text-[13px] font-medium text-white/70 mb-1.5 sm:mb-2 block">
                    Voice Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Professional, Casual, Funny"
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-[13px] sm:text-[14px] h-9 sm:h-10 focus-visible:ring-1 focus-visible:ring-white/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="examples" className="text-[12px] sm:text-[13px] font-medium text-white/70 mb-1.5 sm:mb-2 block">
                    Writing Examples (3-5 samples)
                  </Label>
                  <Textarea
                    id="examples"
                    placeholder="Paste 3-5 examples of your writing style here..."
                    className="h-[160px] sm:h-[200px] resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-[13px] sm:text-[14px] focus-visible:ring-1 focus-visible:ring-white/20"
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                  />
                  <p className="text-[10px] sm:text-[11px] text-white/30 mt-1.5 sm:mt-2">
                    Paste examples of your tweets, posts, or articles. The more examples, the better AI learns your style.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex-1 bg-white text-black hover:bg-white/90 h-9 sm:h-10 text-[13px] font-medium"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Voice"
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="ghost"
                    className="text-white/60 hover:bg-white/[0.04] h-9 sm:h-10 text-[13px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5 sm:space-y-3">
            {voices.length === 0 ? (
              <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10 mx-auto mb-3 sm:mb-4">
                  <Mic2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-medium text-white mb-1.5 sm:mb-2">No voices yet</h3>
                <p className="text-[12px] sm:text-[13px] text-white/40 mb-3 sm:mb-4">Create your first brand voice to get started</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-white text-black hover:bg-white/90 h-9 text-[13px] font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voice
                </Button>
              </div>
            ) : (
              voices.map((voice) => (
                <div
                  key={voice.id}
                  className={`rounded-lg sm:rounded-xl border p-3.5 sm:p-5 transition-all ${
                    voice.is_active
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                        voice.is_active ? "bg-blue-500/20" : "bg-white/[0.06]"
                      }`}>
                        <Mic2 className={`h-4 w-4 sm:h-5 sm:w-5 ${voice.is_active ? "text-blue-500" : "text-white/60"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <h3 className="text-[14px] sm:text-[15px] font-medium text-white truncate">{voice.name}</h3>
                          {voice.is_active && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-blue-500 bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-[12px] text-white/40">
                          Created {new Date(voice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!voice.is_active && (
                        <Button
                          onClick={() => handleSetActive(voice.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:bg-white/[0.04] h-7 sm:h-8 text-[11px] sm:text-[12px] px-2 sm:px-3"
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(voice.id)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:bg-white/[0.04] h-7 sm:h-8 px-1.5 sm:px-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
