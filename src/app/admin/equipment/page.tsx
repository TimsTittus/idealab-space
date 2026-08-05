"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  AlertCircle,
  Filter,
  Upload,
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  price?: number | string;
  is_available: boolean;
  created_at: string;
}

const DEFAULT_CATEGORIES = [
  "3D Printing",
  "Laser Cutting",
  "CNC Routing",
  "Electronics",
  "Embedded Systems",
  "General",
];

export default function AdminEquipmentPage() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "3D Printing",
    description: "",
    image_url: "/equipments/3d_printer.png",
    price: "0",
    is_available: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError("");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `equipment/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("equipment-images")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: publicUrlData } = supabase.storage
        .from("equipment-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        image_url: publicUrlData.publicUrl,
      }));
    } catch (err: any) {
      console.error("Storage upload error:", err);
      setUploadError(
        err?.message ||
        "Upload failed. Ensure bucket 'equipment-images' is created in Supabase."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    setEquipmentList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchEquipment();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "3D Printing",
      description: "",
      image_url: "/equipments/3d_printer.png",
      price: "0",
      is_available: true,
    });
    setFormError("");
    setUploadError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || "General",
      description: item.description || "",
      image_url: item.image_url || "/equipments/3d_printer.png",
      price: item.price !== undefined && item.price !== null ? String(item.price) : "0",
      is_available: item.is_available,
    });
    setFormError("");
    setUploadError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const endpoint = "/api/admin/equipment";
    const method = editingItem ? "PUT" : "POST";
    const payload = editingItem ? { id: editingItem.id, ...formData } : formData;

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      setFormError(result.error || "Failed to save equipment.");
      setSubmitting(false);
      return;
    }

    setIsModalOpen(false);
    setSubmitting(false);
    fetchEquipment();
  };

  const handleToggleStatus = async (item: Equipment) => {
    try {
      const res = await fetch("/api/admin/equipment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          is_available: !item.is_available,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to update equipment status.");
        return;
      }
      fetchEquipment();
    } catch (err: any) {
      alert(err?.message || "Error updating status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this equipment? This action will remove it from the database.")) return;

    try {
      const res = await fetch(`/api/admin/equipment?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to delete equipment.");
        return;
      }
      fetchEquipment();
    } catch (err: any) {
      alert(err?.message || "Error deleting equipment.");
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [equipmentList, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Equipment Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add, update, or manage machinery availability across the lab.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search equipment by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none"
          >
            <option value="All">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table / Mobile List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                      <img
                        src={item.image_url || "/equipments/3d_printer.png"}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                        <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          {item.price !== undefined && item.price !== null && Number(item.price) > 0 ? `₹${item.price}` : "Free"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${item.is_available
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                    >
                      {item.is_available ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {item.is_available ? "Available" : "Maintenance"}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Edit Equipment"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete Equipment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEquipment.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200">
                            <img
                              src={item.image_url || "/equipments/3d_printer.png"}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {item.price !== undefined && item.price !== null && Number(item.price) > 0
                            ? `₹${item.price}`
                            : "Free"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${item.is_available
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                            }`}
                        >
                          {item.is_available ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Available</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Maintenance</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            title="Edit Equipment"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Equipment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filteredEquipment.length === 0 && !loading && (
          <div className="px-6 py-12 text-center text-slate-500">
            <Wrench className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">
              No equipment records found
            </p>
            <p className="text-xs">
              Try modifying your search or click &quot;Add Equipment&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Wrench className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {editingItem ? "Edit Equipment" : "Add New Equipment"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem ? "Modify machine details and availability status" : "Register new machinery in SJCET IDEA Lab"}
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
                  Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creality Ender 3 V3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price (per hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0 for Free"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Availability Status *
                  </label>
                  <select
                    value={formData.is_available ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_available: e.target.value === "true",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Maintenance / Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Equipment Image
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="/equipments/3d_printer.png or https://..."
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <label className="relative flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 text-xs cursor-pointer shadow-sm active:scale-95 transition-all shrink-0">
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      ) : (
                        <Upload className="h-4 w-4 text-amber-400" />
                      )}
                      <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs font-semibold text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Live Image Preview */}
                  {formData.image_url && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="h-12 w-12 rounded-lg bg-white p-1 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 truncate">Image Preview</p>
                        <p className="text-[11px] text-slate-400 truncate">{formData.image_url}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, build volume, and capabilities..."
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
                  <span>{editingItem ? "Save Changes" : "Add Equipment"}</span>
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