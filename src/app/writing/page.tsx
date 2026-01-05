"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Save, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useSidebar } from "@/contexts/SidebarContext";

export default function WritingPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [improvedContent, setImprovedContent] = useState("");
  const [tone, setTone] = useState("professional");
  const [action, setAction] = useState("improve");
  const [improving, setImproving] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in?redirect=/writing");
    return null;
  }

  const handleImprove = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "No content",
        description: "Please enter some text to improve.",
      });
      return;
    }

    setImproving(true);
    try {
      const response = await fetch("/api/writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          tone,
          action,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setImprovedContent(data.improvedText);

      toast({
        title: "Text Improved",
        description: "Your text has been enhanced successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to improve text.",
      });
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppSidebar />
      <MobileMenuButton />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[256px]"
        } p-4 md:p-8`}
      >
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-rose-500/5 border border-purple-500/20">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              AI Writing Assistant
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Improve your writing with AI powered suggestions and tone
              adjustments.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-white flex items-center text-base md:text-lg">
                <PenTool className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-400" />
                Write & Improve
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Enter your text and let AI help you improve it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-black/50 border-white/20 text-white text-sm">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improve">Improve</SelectItem>
                    <SelectItem value="rewrite">Rewrite</SelectItem>
                    <SelectItem value="expand">Expand</SelectItem>
                    <SelectItem value="summarize">Summarize</SelectItem>
                    <SelectItem value="grammar">Fix Grammar</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-black/50 border-white/20 text-white text-sm">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">
                    Original Text
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing here..."
                    className="min-h-[200px] md:min-h-[300px] bg-black/50 border-white/20 text-white resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">
                    Improved Text
                  </label>
                  <Textarea
                    value={improvedContent}
                    onChange={(e) => setImprovedContent(e.target.value)}
                    placeholder="Improved text will appear here..."
                    className="min-h-[200px] md:min-h-[300px] bg-black/50 border-white/20 text-white resize-none text-sm"
                    readOnly={!improvedContent}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <Button
                  onClick={handleImprove}
                  disabled={!content.trim() || improving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 font-semibold transition-all duration-200 hover:scale-105 text-sm md:text-base"
                >
                  {improving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {action === "improve"
                        ? "Improve"
                        : action === "rewrite"
                        ? "Rewrite"
                        : action === "expand"
                        ? "Expand"
                        : action === "summarize"
                        ? "Summarize"
                        : "Fix Grammar"}{" "}
                      with AI
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (improvedContent) {
                      navigator.clipboard.writeText(improvedContent);
                      toast({
                        title: "Copied!",
                        description: "Improved text copied to clipboard.",
                      });
                    }
                  }}
                  disabled={!improvedContent}
                  className="border-white/20 text-white hover:bg-white/10 text-sm md:text-base"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Copy Result
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setContent("");
                    setImprovedContent("");
                  }}
                  className="border-white/20 text-white hover:bg-white/10 text-sm md:text-base"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
