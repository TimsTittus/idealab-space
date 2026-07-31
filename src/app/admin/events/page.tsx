"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  created_at: string;
}

const EVENT_TYPES = ["Workshop", "Bootcamp", "Seminar", "Hackathon", "Open Day"];

export default function AdminEventsPage() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const getInitialDates = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return {
      start_time: format(start, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(end, "yyyy-MM-dd'T'HH:mm"),
    };
  };

  const [formData, setFormData] = useState({
    title: "",
    event_type: "Workshop",
    location: "IDEA Lab, SJCET",
    description: "",
    ...getInitialDates(),
    image_url: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error.message);
      }
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      event_type: "Workshop",
      location: "IDEA Lab, SJCET",
      description: "",
      ...getInitialDates(),
      image_url: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      event_type: ev.event_type || "Workshop",
      location: ev.location || "IDEA Lab, SJCET",
      description: ev.description || "",
      start_time: format(new Date(ev.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(ev.end_time), "yyyy-MM-dd'T'HH:mm"),
      image_url: ev.image_url || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setFormError("Please select valid Start and End times.");
      setSubmitting(false);
      return;
    }

    if (endDate <= startDate) {
      setFormError("End Time must be after Start Time.");
      setSubmitting(false);
      return;
    }

    const isoStartTime = startDate.toISOString();
    const isoEndTime = endDate.toISOString();

    const endpoint = "/api/admin/events";
    const method = editingEvent ? "PUT" : "POST";
    const payload = editingEvent
      ? {
        id: editingEvent.id,
        ...formData,
        start_time: isoStartTime,
        end_time: isoEndTime,
      }
      : {
        ...formData,
        start_time: isoStartTime,
        end_time: isoEndTime,
      };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to save event.");
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setSubmitting(false);
      fetchEvents();
    } catch (err: any) {
      setFormError(err?.message || "Server Error saving event.");
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action will remove it from the database.")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to delete event.");
        return;
      }

      fetchEvents();
    } catch (err: any) {
      alert(err?.message || "Error deleting event.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Event Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule workshops, bootcamps, and innovation seminars for IDEA Lab.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {ev.event_type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(ev)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {ev.description}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      {format(new Date(ev.start_time), "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && events.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No events scheduled</p>
            <p className="text-xs mt-1">
              Click &quot;Create Event&quot; to schedule workshops or bootcamps.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Calendar className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingEvent ? "Update session schedule and details" : "Schedule workshops or bootcamps"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PCB Design Masterclass"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Event Type *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) =>
                      setFormData({ ...formData, event_type: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="IDEA Lab, SJCET"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Start & End Timestamptz Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Event details, topics covered, target audience..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingEvent ? "Save Event" : "Create Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}