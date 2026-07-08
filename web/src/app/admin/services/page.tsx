"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  Camera,
  Plane,
  Award,
  Video,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  seedSampleServices,
} from "@/app/actions/services";

const ICON_OPTIONS = [
  { name: "Heart", icon: Heart },
  { name: "Camera", icon: Camera },
  { name: "Plane", icon: Plane },
  { name: "Sparkles", icon: Sparkles },
  { name: "Award", icon: Award },
  { name: "Video", icon: Video },
  { name: "Wand2", icon: Wand2 },
  { name: "Image", icon: ImageIcon },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Camera,
  Plane,
  Sparkles,
  Award,
  Video,
  Wand2,
  Image: ImageIcon,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Signature Collection");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("Custom Quotes Available");
  const [iconName, setIconName] = useState("Sparkles");
  const [features, setFeatures] = useState("");
  const [sortOrder, setSortOrder] = useState("10");
  const [isActive, setIsActive] = useState(true);

  async function loadServices() {
    setLoading(true);
    const data = await getServices({ includeInactive: true });
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  const openNewModal = () => {
    setEditingService(null);
    setTitle("");
    setCategory("Signature Collection");
    setDescription("");
    setPrice("Custom Quotes Available");
    setIconName("Sparkles");
    setFeatures("");
    setSortOrder("10");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingService(s);
    setTitle(s.title || "");
    setCategory(s.category || "Signature Collection");
    setDescription(s.description || "");
    setPrice(s.price || "Custom Quotes Available");
    setIconName(s.icon_name || "Sparkles");
    setFeatures(s.features || "");
    setSortOrder(String(s.sort_order || 10));
    setIsActive(s.is_active !== false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("icon_name", iconName);
    fd.append("features", features);
    fd.append("sort_order", sortOrder);
    fd.append("is_active", String(isActive));

    if (editingService) {
      await updateService(editingService.id, fd);
    } else {
      await createService(fd);
    }

    setSubmitting(false);
    setModalOpen(false);
    await loadServices();
  };

  const handleToggleActive = async (s: any) => {
    const fd = new FormData();
    fd.append("title", s.title);
    fd.append("category", s.category);
    fd.append("description", s.description);
    fd.append("price", s.price);
    fd.append("icon_name", s.icon_name);
    fd.append("features", s.features || "");
    fd.append("sort_order", String(s.sort_order || 10));
    fd.append("is_active", String(!s.is_active));

    await updateService(s.id, fd);
    await loadServices();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    await deleteService(id);
    await loadServices();
  };

  const handleSeedServices = async () => {
    setSeeding(true);
    await seedSampleServices(true);
    await loadServices();
    setSeeding(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Studio Services & Offerings</h1>
          <p className="text-sand-muted text-sm mt-1">
            Customize what appears on the public Services page. Reorder, edit pricing, or add new packages.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedServices}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-3 bg-sand-bg border border-sand-border text-sand-text rounded-xl text-sm font-bold hover:border-sand-text transition-colors"
            title="Restore signature default services"
          >
            {seeding ? "Loading..." : "Load Sample Services"}
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-5 py-3 bg-sand-text text-sand-surface rounded-xl text-sm font-bold hover:bg-black/80 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-sand-surface border border-sand-border rounded-2xl h-60 animate-pulse p-6"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-sand-surface border border-sand-border rounded-2xl">
          <Sparkles className="w-12 h-12 text-sand-muted mx-auto mb-3" />
          <p className="text-sand-muted text-lg">No services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((s) => {
            const IconComp = ICON_MAP[s.icon_name] || Sparkles;
            const featureList = (s.features || "")
              .split("\n")
              .map((f: string) => f.trim())
              .filter(Boolean);

            return (
              <div
                key={s.id}
                className={`bg-sand-surface border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  s.is_active
                    ? "border-sand-border hover:border-black/30"
                    : "border-sand-border/50 opacity-60 bg-sand-bg"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-black/5 text-sand-text">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-widest text-sand-muted font-bold">
                          {s.category}
                        </span>
                        <h3 className="text-xl font-serif font-bold text-sand-text capitalize lowercase">
                          {s.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        s.is_active
                          ? "bg-green-500/10 text-green-700 border border-green-500/20"
                          : "bg-gray-400/10 text-gray-500"
                      }`}
                    >
                      {s.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <p className="text-sand-muted text-sm mb-4 line-clamp-3 capitalize lowercase">
                    {s.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-wider text-sand-muted block">
                      Investment
                    </span>
                    <span className="font-serif font-bold text-lg text-sand-text">
                      {s.price}
                    </span>
                  </div>

                  {featureList.length > 0 && (
                    <div className="space-y-1.5 border-t border-sand-border pt-4 mb-4">
                      {featureList.slice(0, 3).map((f: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-sand-muted"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                          <span className="capitalize lowercase">{f}</span>
                        </div>
                      ))}
                      {featureList.length > 3 && (
                        <span className="text-xs text-sand-muted italic block pl-5">
                          + {featureList.length - 3} more features
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-sand-border pt-4 mt-2">
                  <span className="text-xs text-sand-muted">
                    Order: #{s.sort_order}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(s)}
                      title={s.is_active ? "Hide Service" : "Unhide Service"}
                      className="p-2 rounded-lg text-sand-muted hover:bg-black/5 hover:text-sand-text transition-colors"
                    >
                      {s.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 hover:bg-black/10 text-sand-text transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.title)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-sand-surface border border-sand-border rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-sand-border pb-4">
              <h2 className="text-2xl font-serif">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-sand-muted hover:text-sand-text rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1.5">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wedding Cinematography"
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Signature Collection"
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1.5">
                    Investment / Pricing String
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. Custom Quotes Available"
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1.5">
                    Sort Order (Lower = First)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-2">
                  Icon Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const selected = iconName === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => setIconName(opt.name)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selected
                            ? "bg-sand-text text-sand-surface border-sand-text"
                            : "border-sand-border text-sand-muted hover:border-black/30"
                        }`}
                      >
                        <OptIcon className="w-4 h-4" />
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary paragraph describing the service..."
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sand-muted mb-1">
                  Key Highlights (1 Bullet per line)
                </label>
                <p className="text-xs text-sand-muted mb-2">
                  Separate each checklist item by pressing Enter on a new line.
                </p>
                <textarea
                  rows={5}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Full-day multi-camera coverage&#10;4K cinematic highlight film&#10;Dedicated creative director"
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-border bg-sand-bg text-sm focus:outline-none focus:border-sand-text font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-sand-border"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium">
                  Service is Active & Visible on Public Services Page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-sand-border text-sm font-bold text-sand-muted hover:text-sand-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-sand-text text-sand-surface text-sm font-bold hover:bg-black/80 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
