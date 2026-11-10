"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  CalendarClock,
  Edit2,
  Ban,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
  created_at: string;
  equipment_name: string;
  equipment_category: string;
  equipment_image_url: string;
  student_name: string;
  student_email: string;
  student_department: string;
  student_year: string;
}

const STATUS_OPTIONS = ["All", "confirmed", "cancelled"];

function formatDateTime(iso: string) {
  return format(new Date(iso), "dd MMM yyyy, h:mm a");
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === 1) return "1 hour";
  return `${hours.toFixed(1)} hours`;
}

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formStatus, setFormStatus] = useState("confirmed");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      const result = await res.json();
      if (res.ok) {
        setBookings(result.bookings || []);
      } else {
        console.error("Failed to fetch bookings:", result.error);
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchBookings();
  }, []);

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    setFormStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
    setFormEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
    setFormStatus(booking.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSubmitting(true);
    setFormError("");

    const res = await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingBooking.id,
        start_time: new Date(formStartTime).toISOString(),
        end_time: new Date(formEndTime).toISOString(),
        status: formStatus,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setFormError(result.error || "Failed to update booking.");
      setSubmitting(false);
      return;
    }

    setIsModalOpen(false);
    setSubmitting(false);
    await fetchBookings();
  };

  const handleCancel = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? The student will lose their reservation."
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to cancel booking.");
        return;
      }
      await fetchBookings();
    } catch (err: any) {
      alert(err?.message || "Error cancelling booking.");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        b.equipment_name.toLowerCase().includes(query) ||
        b.student_name.toLowerCase().includes(query) ||
        b.student_email.toLowerCase().includes(query) ||
        b.student_department.toLowerCase().includes(query) ||
        b.purpose.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Booking Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, manage, and adjust student equipment reservations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              {confirmedCount} Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1.5">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-xs font-bold text-rose-600">
              {cancelledCount} Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by student, equipment, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table / Mobile List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                      <img
                        src={
                          b.equipment_image_url || "/equipments/3d_printer.png"
                        }
                        alt={b.equipment_name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">
                        {b.equipment_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {b.student_name} &middot; {b.student_department || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${b.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                    >
                      {b.status === "confirmed" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {b.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold">
                        {formatDateTime(b.start_time)} &mdash;{" "}
                        {format(new Date(b.end_time), "h:mm a")}
                      </span>
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                        {formatDuration(b.start_time, b.end_time)}
                      </span>
                    </div>
                    {b.purpose && (
                      <div className="flex items-start gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                        <span className="font-semibold">{b.purpose}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setDetailBooking(b)}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      View Details
                    </button>
                    <div className="flex items-center gap-2">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => openEditModal(b)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                            title="Edit Booking Time"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Cancel Booking"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Purpose</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                            <img
                              src={
                                b.equipment_image_url ||
                                "/equipments/3d_printer.png"
                              }
                              alt={b.equipment_name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {b.equipment_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {b.equipment_category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {b.student_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {b.student_email}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {b.student_department || "N/A"}
                            {b.student_year ? ` · ${b.student_year}` : ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">
                            {format(new Date(b.start_time), "dd MMM yyyy")}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500">
                            {format(new Date(b.start_time), "h:mm a")} &mdash;{" "}
                            {format(new Date(b.end_time), "h:mm a")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                          {formatDuration(b.start_time, b.end_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-600 max-w-[160px] truncate">
                          {b.purpose || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${b.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                            }`}
                        >
                          {b.status === "confirmed" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailBooking(b)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                            title="View Details"
                          >
                            <User className="h-4 w-4" />
                          </button>
                          {b.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => openEditModal(b)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                title="Edit Booking Time"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(b.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="Cancel Booking"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filteredBookings.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-slate-500">
            <ClipboardList className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No bookings found</p>
            <p className="text-xs">
              {searchQuery || statusFilter !== "All"
                ? "Try adjusting your search or filter."
                : "No equipment reservations have been made yet."}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailBooking &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-md my-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Booking Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reservation #{detailBooking.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailBooking(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="h-14 w-14 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200">
                    <img
                      src={
                        detailBooking.equipment_image_url ||
                        "/equipments/3d_printer.png"
                      }
                      alt={detailBooking.equipment_name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {detailBooking.equipment_name}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">
                      {detailBooking.equipment_category}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <DetailRow
                    label="Student Name"
                    value={detailBooking.student_name}
                  />
                  <DetailRow
                    label="Email"
                    value={detailBooking.student_email}
                  />
                  <DetailRow
                    label="Department"
                    value={detailBooking.student_department || "N/A"}
                  />
                  <DetailRow
                    label="Year"
                    value={detailBooking.student_year || "N/A"}
                  />
                  <DetailRow
                    label="Booking Date"
                    value={format(
                      new Date(detailBooking.start_time),
                      "dd MMM yyyy"
                    )}
                  />
                  <DetailRow
                    label="Time Slot"
                    value={`${format(
                      new Date(detailBooking.start_time),
                      "h:mm a"
                    )} — ${format(new Date(detailBooking.end_time), "h:mm a")}`}
                  />
                  <DetailRow
                    label="Duration"
                    value={formatDuration(
                      detailBooking.start_time,
                      detailBooking.end_time
                    )}
                  />
                  <DetailRow
                    label="Purpose"
                    value={detailBooking.purpose || "Not specified"}
                  />
                  <DetailRow
                    label="Status"
                    value={
                      detailBooking.status.charAt(0).toUpperCase() +
                      detailBooking.status.slice(1)
                    }
                  />
                  <DetailRow
                    label="Booked On"
                    value={formatDateTime(detailBooking.created_at)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {detailBooking.status === "confirmed" && (
                  <button
                    onClick={() => {
                      setDetailBooking(null);
                      openEditModal(detailBooking);
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <CalendarClock className="h-4 w-4 text-amber-400" />
                    <span>Edit Time</span>
                  </button>
                )}
                <button
                  onClick={() => setDetailBooking(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Time Modal */}
      {isModalOpen &&
        editingBooking &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Modify Booking Time
                    </h3>
                    <p className="text-xs text-slate-500">
                      Adjust the reservation time for{" "}
                      <span className="font-bold text-slate-700">
                        {editingBooking.student_name}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200">
                    <img
                      src={
                        editingBooking.equipment_image_url ||
                        "/equipments/3d_printer.png"
                      }
                      alt={editingBooking.equipment_name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {editingBooking.equipment_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Current:{" "}
                      {format(
                        new Date(editingBooking.start_time),
                        "dd MMM, h:mm a"
                      )}{" "}
                      —{" "}
                      {format(new Date(editingBooking.end_time), "h:mm a")} (
                      {formatDuration(
                        editingBooking.start_time,
                        editingBooking.end_time
                      )}
                      )
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                {formStartTime && formEndTime && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-bold text-amber-800">
                      New duration:{" "}
                      {formatDuration(
                        new Date(formStartTime).toISOString(),
                        new Date(formEndTime).toISOString()
                      )}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>Update Booking</span>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="text-xs font-semibold text-slate-800 text-right">
        {value}
      </span>
    </div>
  );
}
