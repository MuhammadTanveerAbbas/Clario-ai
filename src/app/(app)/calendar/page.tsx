"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
const COLORS = ["var(--accent)", "#0ea5e9", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];
const STATUSES = ["Draft", "Scheduled", "Published", "Cancelled"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--accent)"}`, borderRadius: 10, padding: "11px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "fu .3s ease both", maxWidth: 320, fontFamily: "var(--sans)" }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user } = useAuth();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState<"month" | "week">("month");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    scheduled_at: "",
    platform: "Other",
    content: "",
    color: COLORS[0],
    status: "Draft"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, year, month]);

  useEffect(() => {
    const content = searchParams?.get("content");
    const platform = searchParams?.get("platform");
    if (content) {
      setFormData(prev => ({ ...prev, content: decodeURIComponent(content), platform: platform || "Other" }));
      setModalOpen(true);
    }
  }, [searchParams]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_at", startDate)
        .lte("scheduled_at", endDate)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error fetching events:", msg);
      showToast("Failed to load events", "error");
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
      if (editingEvent) {
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title: formData.title,
            scheduled_at: formData.scheduled_at,
            platform: formData.platform?.toLowerCase(),
            content_text: formData.content,
            color: formData.color,
            status: formData.status?.toLowerCase()
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        showToast("Event updated", "success");
      } else {
        const { error } = await supabase
          .from("calendar_events")
          .insert({
            user_id: user.id,
            title: formData.title,
            scheduled_at: formData.scheduled_at,
            platform: formData.platform?.toLowerCase(),
            content_text: formData.content,
            color: formData.color,
            status: formData.status?.toLowerCase()
          });

        if (error) throw error;
        showToast("Event added", "success");
      }

      setModalOpen(false);
      setEditingEvent(null);
      setFormData({ title: "", scheduled_at: "", platform: "Other", content: "", color: COLORS[0], status: "Draft" });
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      showToast("Failed to save event", "error");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    
    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("Event deleted", "success");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
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
      status: event.status || "Draft"
    });
    setModalOpen(true);
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    const scheduledDate = date || new Date();
    setFormData({
      title: "",
      scheduled_at: scheduledDate.toISOString().slice(0, 16),
      platform: "Other",
      content: "",
      color: COLORS[0],
      status: "Draft"
    });
    setModalOpen(true);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ minHeight: 90 }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = events.filter(e => e.scheduled_at.startsWith(dateStr));
      const isToday = dateStr === new Date().toISOString().split("T")[0];

      days.push(
        <div
          key={day}
          onClick={() => openAddModal(date)}
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-b)",
            borderRadius: 8,
            minHeight: 90,
            padding: 8,
            cursor: "pointer",
            transition: "all .2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--card-b)"}
        >
          <div style={{ 
            fontSize: ".75rem", 
            color: isToday ? "var(--accent)" : "var(--text3)", 
            fontWeight: isToday ? 600 : 400,
            marginBottom: 4
          }}>
            {day}
          </div>
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event.id}
              onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
              style={{
                background: event.color || "var(--accent)",
                color: "#fff",
                fontSize: ".7rem",
                padding: "2px 6px",
                borderRadius: 4,
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div style={{ fontSize: ".65rem", color: "var(--text3)", marginTop: 2 }}>
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text2)" }}>
        Please sign in to view your calendar
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto", animation: "fu .35s ease both", fontFamily: "var(--sans)" }}>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 300, color: "var(--text)", margin: 0 }}>
          Content Calendar
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}
          >
            ←
          </button>
          <span style={{ fontSize: "1rem", color: "var(--text)", minWidth: 140, textAlign: "center" }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}
          >
            →
          </button>
          <button
            onClick={() => openAddModal()}
            style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
            {DAYS.map(day => (
              <div key={day} style={{ fontSize: ".75rem", color: "var(--text3)", textAlign: "center", fontWeight: 500 }}>
                {day}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {renderMonthView()}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📅</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>
            Your content schedule, at a glance
          </h2>
          <p style={{ color: "var(--text2)", marginBottom: 24 }}>
            Plan and track every post across every platform in one place
          </p>
          <button
            onClick={() => openAddModal()}
            style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", color: "#fff", fontWeight: 500 }}
          >
            Add your first event
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 24,
              maxWidth: 480,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto"
            }}
          >
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 300, color: "var(--text)", marginBottom: 20 }}>
              {editingEvent ? "Edit Event" : "Add Event"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}
                  placeholder="Event title"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem", minHeight: 100, resize: "vertical" }}
                  placeholder="Post content..."
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: color,
                        border: formData.color === color ? "2px solid var(--text)" : "1px solid var(--border)",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "var(--text)", fontWeight: 500 }}
                >
                  Cancel
                </button>
                {editingEvent && (
                  <button
                    onClick={() => { handleDeleteEvent(editingEvent.id); setModalOpen(false); }}
                    style={{ background: "var(--error)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSaveEvent}
                  style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}
                >
                  {editingEvent ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
