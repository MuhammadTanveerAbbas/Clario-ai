"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading-page";
import { TopbarUserMenu } from "@/components/layout/topbar-user-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast { id: string; type: "success" | "error" | "info"; message: string; }
interface CalEvent {
  id: string;
  title: string;
  scheduled_at: string;
  platform?: string;
  content_text?: string;
  color?: string;
  status?: string;
}

const PLATFORMS = ["Twitter", "LinkedIn", "Instagram", "YouTube", "Newsletter", "Podcast", "Blog", "TikTok", "Other"];
const COLORS = ["hsl(var(--accent))", "#0ea5e9", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];
const STATUSES = ["Draft", "Scheduled", "Published", "Cancelled"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-[12px] font-medium shadow-lg backdrop-blur-md max-w-[320px]"
            style={{
              background: "hsl(var(--card))",
              borderColor: t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "hsl(var(--accent))",
              color: "var(--text2)",
            }}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="flex h-5 w-5 items-center justify-center rounded opacity-50 hover:opacity-100 transition-opacity"
              style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit" }}
            >
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Event Pill ────────────────────────────────────────────────────────────────
function EventPill({ event, onClick }: { event: CalEvent; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full truncate rounded-md px-2 py-0.5 text-left text-[11px] font-medium text-white transition-opacity hover:opacity-80"
      style={{ background: event.color || "hsl(var(--accent))", border: "none", cursor: "pointer" }}
    >
      {event.title}
    </button>
  );
}

// ── Calendar Day Cell ─────────────────────────────────────────────────────────
function DayCell({
  day,
  dateStr,
  isToday,
  dayEvents,
  onAddClick,
  onEventClick,
}: {
  day: number;
  dateStr: string;
  isToday: boolean;
  dayEvents: CalEvent[];
  onAddClick: (date: Date) => void;
  onEventClick: (event: CalEvent) => void;
}) {
  return (
    <div
      onClick={() => onAddClick(new Date(dateStr + "T12:00:00"))}
      className={cn(
        "group relative min-h-[90px] cursor-pointer rounded-xl border p-2 transition-all duration-150 hover:border-[hsl(var(--accent)/0.5)] hover:bg-[hsl(var(--accent)/0.02)]",
        isToday
          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.04)]"
          : "border-[var(--card-b)] bg-[hsl(var(--card))]"
      )}
    >
      {/* Day number */}
      <div className={cn(
        "mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
        isToday
          ? "bg-[hsl(var(--accent))] text-white"
          : "text-[var(--text3)] group-hover:text-[var(--text2)]"
      )}>
        {day}
      </div>

      {/* Events */}
      <div className="flex flex-col gap-0.5">
        {dayEvents.slice(0, 2).map(event => (
          <EventPill
            key={event.id}
            event={event}
            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
          />
        ))}
        {dayEvents.length > 2 && (
          <span className="px-1 text-[10px] font-medium text-[var(--text3)]">
            +{dayEvents.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text2)]">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-[var(--card-b)] bg-[hsl(var(--input))] px-3 py-2.5 text-[13px] text-[var(--text)] placeholder-[var(--text3)] transition-colors focus:border-[hsl(var(--accent))] focus:outline-none";

// ── Event Modal ───────────────────────────────────────────────────────────────
function EventModal({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  onDelete,
  isEditing,
}: {
  open: boolean;
  onClose: () => void;
  formData: {
    title: string; scheduled_at: string; platform: string;
    content: string; color: string; status: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
  onSave: () => void;
  onDelete?: () => void;
  isEditing: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "var(--bg2)", border: "1px solid var(--card-b)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--card-b)] px-5 py-4">
              <h2 className="font-serif text-[18px] font-light text-[var(--text)]">
                {isEditing ? "Edit event" : "Add event"}
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text3)] transition-colors hover:bg-[var(--bg3)] hover:text-[var(--text)]"
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4">
                <FormField label="Title *">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className={inputClass}
                    placeholder="Event title"
                  />
                </FormField>

                <FormField label="Date & Time *">
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
                    className={inputClass}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Platform">
                    <select
                      value={formData.platform}
                      onChange={e => setFormData(p => ({ ...p, platform: e.target.value }))}
                      className={inputClass}
                    >
                      {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </FormField>

                  <FormField label="Status">
                    <select
                      value={formData.status}
                      onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                      className={inputClass}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Content">
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                    className={cn(inputClass, "min-h-[90px] resize-y")}
                    placeholder="Post content…"
                  />
                </FormField>

                <FormField label="Color">
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(p => ({ ...p, color }))}
                        className="h-8 w-8 rounded-lg transition-transform hover:scale-110"
                        style={{
                          background: color,
                          border: formData.color === color ? "2.5px solid var(--text)" : "2px solid transparent",
                          outline: formData.color === color ? "2px solid hsl(var(--accent)/0.3)" : "none",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </FormField>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-[var(--card-b)] px-5 py-4">
              {isEditing && onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
                  style={{ cursor: "pointer", background: "transparent" }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
              <div className="flex flex-1 justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-[var(--card-b)] px-4 py-2 text-[12px] font-medium text-[var(--text2)] transition-colors hover:bg-[var(--bg3)]"
                  style={{ cursor: "pointer", background: "transparent" }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className="rounded-xl px-5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "hsl(var(--accent))", border: "none", cursor: "pointer" }}
                >
                  {isEditing ? "Update" : "Add event"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPageInner />
    </Suspense>
  );
}

function CalendarPageInner() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const defaultForm = {
    title: "", scheduled_at: "", platform: "Other",
    content: "", color: COLORS[0], status: "Draft",
  };
  const [formData, setFormData] = useState(defaultForm);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    if (authLoading || !user) return;
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, year, month]);

  useEffect(() => {
    const content = searchParams?.get("content");
    const platform = searchParams?.get("platform");
    if (content) {
      setFormData(p => ({ ...p, content: decodeURIComponent(content), platform: platform || "Other" }));
      setModalOpen(true);
    }
  }, [searchParams]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startISO = new Date(year, month, 1).toISOString().split("T")[0];
      const endISO = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, content_text, platform, scheduled_at, color, status")
        .eq("user_id", user.id)
        .gte("scheduled_at", startISO)
        .lte("scheduled_at", endISO)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      setEvents((data || []).map(e => ({
        id: e.id, title: e.title, scheduled_at: e.scheduled_at,
        platform: e.platform, content_text: e.content_text,
        color: e.color, status: e.status,
      })));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load events", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!user || !formData.title || !formData.scheduled_at) {
      showToast("Please fill in required fields", "error");
      return;
    }
    try {
      const payload = {
        title: formData.title,
        scheduled_at: formData.scheduled_at,
        platform: formData.platform?.toLowerCase(),
        content_text: formData.content,
        color: formData.color,
        status: formData.status?.toLowerCase(),
      };
      if (editingEvent) {
        const { error } = await supabase.from("calendar_events")
          .update(payload).eq("id", editingEvent.id).eq("user_id", user.id);
        if (error) throw error;
        showToast("Event updated", "success");
      } else {
        const { error } = await supabase.from("calendar_events")
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
        showToast("Event added", "success");
      }
      setModalOpen(false);
      setEditingEvent(null);
      setFormData(defaultForm);
      fetchEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save event", "error");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?") || !user) return;
    try {
      const { error } = await supabase.from("calendar_events")
        .delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      showToast("Event deleted", "success");
      setModalOpen(false);
      setEditingEvent(null);
      setFormData(defaultForm);
      fetchEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete event", "error");
    }
  };

  const openEditModal = (event: CalEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      scheduled_at: event.scheduled_at,
      platform: event.platform || "Other",
      content: event.content_text || "",
      color: event.color || COLORS[0],
      status: event.status || "Draft",
    });
    setModalOpen(true);
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    const d = date || new Date();
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    const hr = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    setFormData({ ...defaultForm, scheduled_at: `${y}-${mo}-${da}T${hr}:${mi}` });
    setModalOpen(true);
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { const t = new Date(); setYear(t.getFullYear()); setMonth(t.getMonth()); };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (authLoading || !user) return <LoadingPage />;

  // Build calendar grid cells
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      <div className="flex min-h-screen flex-col bg-[var(--bg)]">
        {/* Topbar */}
        <div
          className="sticky top-0 z-40 flex h-[52px] items-center gap-3 border-b px-4 sm:px-6"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderColor: "hsl(var(--border))",
          }}
        >
          <CalendarDays size={15} style={{ color: "hsl(var(--accent))", flexShrink: 0 }} />
          <span className="flex-1 text-[14px] font-semibold text-[var(--text)]">Calendar</span>
          <TopbarUserMenu />
        </div>

        {/* Content */}
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-light text-[var(--text)]">
                {MONTHS[month]}{" "}
                <span className="text-[var(--text3)]">{year}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] text-[var(--text3)] transition-all hover:border-[var(--border2)] hover:text-[var(--text2)]"
                style={{ cursor: "pointer" }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={goToday}
                className="flex h-9 items-center rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] px-3.5 text-[12px] font-medium text-[var(--text2)] transition-all hover:border-[var(--border2)]"
                style={{ cursor: "pointer" }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] text-[var(--text3)] transition-all hover:border-[var(--border2)] hover:text-[var(--text2)]"
                style={{ cursor: "pointer" }}
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => openAddModal()}
                className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "hsl(var(--accent))", border: "none", cursor: "pointer" }}
              >
                <Plus size={14} />
                Add event
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-2">
                {DAYS.map(day => (
                  <div
                    key={day}
                    className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text3)]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Loading skeleton */}
              {loading ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-h-[90px] animate-pulse rounded-xl border border-[var(--card-b)] bg-[var(--bg3)]"
                      style={{ animationDelay: `${(i % 7) * 0.04}s` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[90px]" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayEvents = events.filter(e => e.scheduled_at.startsWith(dateStr));
                    const isToday = dateStr === todayStr;
                    return (
                      <DayCell
                        key={day}
                        day={day}
                        dateStr={dateStr}
                        isToday={isToday}
                        dayEvents={dayEvents}
                        onAddClick={openAddModal}
                        onEventClick={openEditModal}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{ background: "var(--bg3)" }}
              >
                📅
              </div>
              <div>
                <h2 className="font-serif text-xl font-light text-[var(--text)]">
                  Your content schedule, at a glance
                </h2>
                <p className="mt-1 text-[13px] text-[var(--text3)]">
                  Plan and track every post across every platform in one place
                </p>
              </div>
              <button
                onClick={() => openAddModal()}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "hsl(var(--accent))", border: "none", cursor: "pointer" }}
              >
                <Plus size={15} />
                Add your first event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event modal */}
      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); setFormData(defaultForm); }}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        isEditing={!!editingEvent}
      />
    </>
  );
}
