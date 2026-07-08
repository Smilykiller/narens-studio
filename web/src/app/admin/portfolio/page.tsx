"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, Eye, EyeOff, FolderPlus } from "lucide-react";
import { 
  getCategories, createCategory, deleteCategory,
  getPhotos, uploadPhoto, deletePhoto, togglePhotoVisibility, addPhotoByUrl, seedSamplePortfolio
} from "@/app/actions/portfolio";

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  
  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, pics] = await Promise.all([getCategories(), getPhotos()]);
      setCategories(cats);
      setPhotos(pics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    await createCategory(name);
    setShowCategoryModal(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Photos inside it will lose their category tag.")) return;
    await deleteCategory(id);
    fetchData();
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (uploadMode === "url") {
        const title = formData.get("title")?.toString() || "Untitled";
        const category_id = formData.get("category_id")?.toString();
        await addPhotoByUrl({ title, url: imageUrlInput, category_id });
      } else {
        await uploadPhoto(formData);
      }
      setShowUploadModal(false);
      setPreviewUrl(null);
      setImageUrlInput("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this photo permanently?")) return;
    await deletePhoto(id, url);
    fetchData();
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    await togglePhotoVisibility(id, !current);
    fetchData();
  };

  const handleSeedPortfolio = async () => {
    setSeeding(true);
    await seedSamplePortfolio(true);
    await fetchData();
    setSeeding(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-sand-border pb-6">
        <div>
          <h2 className="text-3xl font-serif text-sand-text mb-2">Portfolio Management</h2>
          <p className="text-sand-muted">Manage categories and upload high-res images for your public gallery.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedPortfolio}
            disabled={seeding}
            className="flex items-center gap-2 bg-sand-bg border border-sand-border text-sand-text px-4 py-2 rounded-lg font-medium text-sm hover:border-sand-text transition-colors"
            title="Populate showcase sample photos & categories"
          >
            {seeding && <Loader2 className="w-4 h-4 animate-spin" />}
            {seeding ? "Loading..." : "Load Sample Pictures"}
          </button>
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-black/5 text-sand-text px-4 py-2 rounded-lg font-medium text-sm hover:bg-black/10 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> New Category
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-sand-surface text-sand-text px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar: Categories */}
          <div className="w-full lg:w-64 shrink-0 bg-black/5 border border-sand-border rounded-2xl p-6">
            <h3 className="font-serif text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center group p-2 hover:bg-black/5 rounded-lg transition-colors">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-sand-muted">No categories created.</p>}
            </div>
          </div>

          {/* Right Area: Photos Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="group relative aspect-[4/5] bg-sand-surface rounded-xl overflow-hidden border border-sand-border hover:border-white/30 transition-colors">
                <img src={photo.url} alt={photo.title || "Portfolio image"} className="img-theme w-full h-full object-cover" />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${photo.is_public ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-600'}`}>
                      {photo.is_public ? "Public" : "Hidden"}
                    </span>
                    <button onClick={() => handleDeletePhoto(photo.id, photo.url)} className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-sm truncate text-sand-text">{photo.title || "Untitled"}</h4>
                    <p className="text-xs text-sand-muted mb-3">{photo.category?.name || "Uncategorized"}</p>
                    <button 
                      onClick={() => handleToggleVisibility(photo.id, photo.is_public)}
                      className="w-full py-2 bg-black/10 hover:bg-black/20 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-sand-text"
                    >
                      {photo.is_public ? <><EyeOff className="w-3 h-3" /> Hide from Public</> : <><Eye className="w-3 h-3" /> Set Public</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {photos.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-sand-muted border border-dashed border-sand-border rounded-2xl">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>No photos uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-sand-surface border border-sand-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-serif mb-4">New Category</h3>
            <form onSubmit={handleAddCategory}>
              <input required name="name" placeholder="e.g. Weddings" className="w-full bg-sand-bg border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-sand-text mb-6" />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-3 text-sand-muted">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-sand-text text-sand-surface font-bold rounded-xl">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-sand-surface border border-sand-border rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-serif mb-4">Add Photo to Portfolio</h3>
            
            {/* Tab switch */}
            <div className="flex gap-2 mb-6 border-b border-sand-border pb-3">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${uploadMode === "file" ? "bg-sand-text text-sand-surface" : "text-sand-muted"}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${uploadMode === "url" ? "bg-sand-text text-sand-surface" : "text-sand-muted"}`}
              >
                Image URL
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-4">
              {uploadMode === "file" ? (
                <div>
                  <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Image File</label>
                  <input required type="file" name="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-sand-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black/10 file:text-sand-text hover:file:bg-black/20 cursor-pointer" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Direct Image URL</label>
                  <input
                    type="url"
                    required
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-sand-bg border border-sand-border rounded-xl px-4 py-3 text-sand-text text-sm focus:outline-none focus:border-sand-text"
                  />
                </div>
              )}
              
              {previewUrl && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-sand-border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Title / Alt Text</label>
                <input required name="title" placeholder="A beautiful sunset wedding..." className="w-full bg-sand-bg border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-sand-text capitalize" />
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Category (Optional)</label>
                <select name="category_id" className="w-full bg-sand-bg border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-sand-text outline-none">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowUploadModal(false); setPreviewUrl(null); }} className="flex-1 py-3 text-sand-muted" disabled={uploading}>Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-sand-text text-sand-surface font-bold rounded-xl flex items-center justify-center gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />} {uploading ? "Adding..." : "Add Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
