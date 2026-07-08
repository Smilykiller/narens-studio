"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, Video, Save, X, Settings } from "lucide-react";
import { 
  getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct,
  addProductSize, removeProductSize, addProductMedia, removeProductMedia
} from "@/app/actions/adminShop";

export default function AdminShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Active Management States (Sizes & Media)
  const [activeManager, setActiveManager] = useState<{ type: 'sizes' | 'media', product: any } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingProduct) {
      formData.append("is_active", String(editingProduct.is_active));
      await updateAdminProduct(editingProduct.id, formData);
    } else {
      await createAdminProduct(formData);
    }
    
    setIsProductModalOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this frame entirely?")) return;
    await deleteAdminProduct(id);
    fetchProducts();
  };

  const handleAddSize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    
    if (activeManager) {
      await addProductSize(activeManager.product.id, name, price);
      // Optimistic refresh
      fetchProducts();
      // Keep manager open but clear form
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleAddMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (activeManager) {
      formData.append("productId", activeManager.product.id);
      await addProductMedia(formData);
      fetchProducts();
      (e.target as HTMLFormElement).reset();
    }
  };

  // Find updated product for manager to stay current
  const currentManagerProduct = activeManager ? products.find(p => p.id === activeManager.product.id) : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-sand-text mb-1">Frame Shop Management</h2>
          <p className="text-sm text-sand-muted">Manage frames, pricing dimensions, and media galleries.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
          className="flex items-center gap-2 bg-sand-surface text-sand-text px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Frame
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-black/5 border border-sand-border p-6 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              <div className="w-24 h-24 bg-white/60 rounded-lg overflow-hidden shrink-0 border border-sand-border flex items-center justify-center">
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt={product.name} className="img-theme w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-sand-muted" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-sand-text">{product.name}</h3>
                  <span className="text-xs px-2 py-1 bg-black/10 text-gray-700 rounded-md">{product.category}</span>
                  {!product.is_active && <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-md">Draft</span>}
                </div>
                <p className="text-sm text-sand-muted mb-3">{product.description}</p>
                <div className="flex gap-4 text-sm text-sand-muted">
                  <span>{product.sizes.length} Sizes</span>
                  <span>{product.media.length} Media Items</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                  className="w-full md:w-auto px-4 py-2 bg-black/10 hover:bg-black/20 text-sand-text rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Details
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveManager({ type: 'sizes', product })}
                    className="flex-1 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage Sizes
                  </button>
                  <button 
                    onClick={() => setActiveManager({ type: 'media', product })}
                    className="flex-1 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage Media
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Main Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-sand-border rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-sand-border">
              <h3 className="text-xl font-serif">{editingProduct ? "Edit Frame" : "Add New Frame"}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X className="w-5 h-5 text-sand-muted" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Frame Name</label>
                <input required name="name" defaultValue={editingProduct?.name} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30" placeholder="e.g. Classic Wood" />
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Description</label>
                <textarea required name="description" defaultValue={editingProduct?.description} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30 h-24" placeholder="Description of the frame..." />
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Category</label>
                <input required name="category" defaultValue={editingProduct?.category || "WOOD"} className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Thumbnail Image</label>
                <input type="file" name="thumbnail" accept="image/*" className="w-full text-sm text-sand-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black/10 file:text-sand-text hover:file:bg-black/20 cursor-pointer" />
              </div>
              <button type="submit" className="w-full py-3 bg-sand-surface text-sand-text font-bold rounded-xl hover:bg-gray-200 mt-4">
                Save Frame
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sizes / Media Manager Drawer/Modal */}
      {activeManager && currentManagerProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-white/60 backdrop-blur-sm">
          <div className="bg-[#111] border-l border-sand-border h-full w-full max-w-md flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-sand-border shrink-0">
              <div>
                <h3 className="text-xl font-serif">Manage {activeManager.type === 'sizes' ? 'Sizes' : 'Media'}</h3>
                <p className="text-sm text-sand-muted">{currentManagerProduct.name}</p>
              </div>
              <button onClick={() => setActiveManager(null)}><X className="w-6 h-6 text-sand-muted" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {activeManager.type === 'sizes' && (
                <>
                  <form onSubmit={handleAddSize} className="flex gap-2 mb-8">
                    <input required name="name" placeholder="Size (e.g. 8x10)" className="flex-1 bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sm text-sand-text focus:border-white/30" />
                    <input required name="price" type="number" step="0.01" placeholder="Price ($)" className="w-24 bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sm text-sand-text focus:border-white/30" />
                    <button type="submit" className="bg-sand-surface text-sand-text px-4 py-2 rounded-lg font-medium text-sm">Add</button>
                  </form>
                  <div className="space-y-2">
                    {currentManagerProduct.sizes.map((size: any) => (
                      <div key={size.id} className="flex justify-between items-center p-3 bg-black/5 border border-sand-border rounded-lg">
                        <span className="text-sm font-medium">{size.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-sand-muted">${size.price}</span>
                          <button onClick={async () => { await removeProductSize(size.id); fetchProducts(); }} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {currentManagerProduct.sizes.length === 0 && <p className="text-sm text-sand-muted text-center py-4">No sizes defined.</p>}
                  </div>
                </>
              )}

              {activeManager.type === 'media' && (
                <>
                  <form onSubmit={handleAddMedia} className="flex flex-col gap-3 mb-8">
                    <select name="type" className="bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sm text-sand-text focus:border-white/30 outline-none">
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <div className="flex gap-2">
                      <input required type="file" name="file" accept="image/*,video/*" className="flex-1 text-sm text-sand-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black/10 file:text-sand-text hover:file:bg-black/20 cursor-pointer" />
                      <button type="submit" className="bg-sand-surface text-sand-text px-4 py-2 rounded-lg font-medium text-sm">Upload</button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    {currentManagerProduct.media.map((m: any) => (
                      <div key={m.id} className="flex gap-4 items-center p-3 bg-black/5 border border-sand-border rounded-lg">
                        <div className="w-16 h-16 bg-sand-surface rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {m.type === 'image' ? <img src={m.url} className="img-theme w-full h-full object-cover" /> : <Video className="w-6 h-6 text-sand-muted" />}
                        </div>
                        <div className="flex-1 truncate">
                          <span className="text-xs uppercase bg-black/10 px-2 py-0.5 rounded text-gray-700 mb-1 inline-block">{m.type}</span>
                          <p className="text-xs text-sand-muted truncate">{m.url}</p>
                        </div>
                        <button onClick={async () => { await removeProductMedia(m.id); fetchProducts(); }} className="text-red-400 hover:text-red-300 shrink-0 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {currentManagerProduct.media.length === 0 && <p className="text-sm text-sand-muted text-center py-4">No media uploaded.</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
