"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  Loader2,
  Sparkles,
  CheckCircle2,
  Users,
  Calendar,
} from "lucide-react";

export default function MeetingNotesPage() {
  const { collapsed } = useSidebar();
  const [title, setTitle] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [structuredNotes, setStructuredNotes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!rawNotes.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, rawNotes }),
      });

      const data = await response.json();
      if (data.structuredNotes) {
        setStructuredNotes(data.structuredNotes);
      }
    } catch (error) {
      console.error("Error generating notes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <AppSidebar />
      <MobileMenuButton />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[256px]"
        } p-4 md:p-8`}
      >
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
              <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-[#4169E1]" />
              Meeting Notes Generator
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Transform raw meeting notes into structured, actionable summaries
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-300/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  Input
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs md:text-sm">
                  Enter your meeting notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <label className="text-xs md:text-sm text-gray-300 mb-2 block">
                    Meeting Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q1 Planning Meeting"
                    className="bg-black/50 border-white/10 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs md:text-sm text-gray-300 mb-2 block">
                    Raw Notes
                  </label>
                  <Textarea
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    placeholder="Paste your meeting transcript or notes here..."
                    className="min-h-[200px] md:min-h-[300px] bg-black/50 border-white/10 text-white placeholder:text-gray-500 resize-none text-sm"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !rawNotes.trim()}
                  className="w-full bg-gradient-to-r from-[#4169E1] to-[#6B8EFF] text-white hover:from-[#6B8EFF] hover:to-[#4169E1] text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Generate Structured Notes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-300/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                  Structured Output
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs md:text-sm">
                  AI organized meeting summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {structuredNotes ? (
                  <div className="space-y-3 md:space-y-4 max-h-[300px] md:max-h-[400px] overflow-auto">
                    {structuredNotes.summary && (
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 md:p-4">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                          <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                          Summary
                        </h3>
                        <p className="text-gray-300 text-xs md:text-sm">
                          {structuredNotes.summary}
                        </p>
                      </div>
                    )}
                    {structuredNotes.actionItems?.length > 0 && (
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 md:p-4">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                          <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                          Action Items
                        </h3>
                        <ul className="space-y-2">
                          {structuredNotes.actionItems.map(
                            (item: string, i: number) => (
                              <li
                                key={i}
                                className="text-gray-300 text-xs md:text-sm flex items-start gap-2"
                              >
                                <span className="text-green-400 mt-1">•</span>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {structuredNotes.keyPoints?.length > 0 && (
                      <div className="bg-black/50 border border-white/10 rounded-lg p-3 md:p-4">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                          Key Points
                        </h3>
                        <ul className="space-y-2">
                          {structuredNotes.keyPoints.map(
                            (point: string, i: number) => (
                              <li
                                key={i}
                                className="text-gray-300 text-xs md:text-sm flex items-start gap-2"
                              >
                                <span className="text-purple-400 mt-1">•</span>
                                {point}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] md:h-[400px] border border-dashed border-white/10 rounded-lg">
                    <div className="text-center text-gray-500">
                      <ClipboardList className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm md:text-base">No notes generated yet</p>
                      <p className="text-xs md:text-sm mt-1">
                        Enter your meeting notes and click Generate
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
