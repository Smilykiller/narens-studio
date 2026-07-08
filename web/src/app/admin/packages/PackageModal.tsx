"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createPackage, updatePackage } from "@/app/actions/packages";

export default function PackageModal({ 
  isOpen, 
  onClose, 
  editingPackage 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  editingPackage?: any 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingPackage) {
      result = await updatePackage(editingPackage.id, formData);
    } else {
      result = await createPackage(formData);
    }
    
    setIsSaving(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "An error occurred");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-sand-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-sand-border flex items-center justify-between">
          <h2 className="text-xl font-serif text-sand-text">{editingPackage ? "Edit Package" : "New Package"}</h2>
          <button onClick={onClose} className="text-sand-muted hover:text-sand-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Package Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={editingPackage?.name}
              placeholder="e.g. Basic Wedding"
              className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 focus:outline-none focus:border-yellow-500/50" 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Price (₹) *</label>
              <input 
                type="number" 
                name="price" 
                required 
                min="0"
                step="0.01"
                defaultValue={editingPackage?.price}
                className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 focus:outline-none focus:border-yellow-500/50" 
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Tier Color *</label>
              <select 
                name="tier_color" 
                required
                defaultValue={editingPackage?.tier_color || "blue"}
                className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="blue">Blue (Standard)</option>
                <option value="gold">Gold (Premium)</option>
                <option value="purple">Purple (Luxury)</option>
                <option value="emerald">Emerald (Special)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Limits / Details *</label>
            <textarea 
              name="limits" 
              required
              rows={3}
              defaultValue={editingPackage?.limits}
              placeholder="Max 500 Photos\n2 Photographers\n1 Video Edit"
              className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 focus:outline-none focus:border-yellow-500/50 resize-none" 
            ></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sand-muted hover:text-sand-text transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-sand-surface text-sand-text font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingPackage ? "Save Changes" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
