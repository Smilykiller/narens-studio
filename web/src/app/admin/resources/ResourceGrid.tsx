"use client";

import { useState } from "react";
import { Camera, Plus, Video, Plane, Box, Check, X, Loader2, Trash2 } from "lucide-react";
import { createResource, toggleResourceStatus, deleteResource } from "@/app/actions/resources";

export default function ResourceGrid({ resources }: { resources: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await createResource(formData);
    setIsSaving(false);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      alert(res.error);
    }
  }

  const icons: any = {
    photographer: <Camera className="w-6 h-6" />,
    videographer: <Video className="w-6 h-6" />,
    drone: <Plane className="w-6 h-6" />,
    equipment: <Box className="w-6 h-6" />
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-sand-text">All Resources</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-sand-surface text-sand-text px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
          <Plus className="w-4 h-4" /> New Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {resources.map(resource => (
          <div key={resource.id} className={`bg-[#111] border rounded-2xl p-5 transition-all ${resource.is_active ? 'border-sand-border hover:border-white/30' : 'border-sand-border opacity-50'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/5 text-sand-text`}>
                {icons[resource.type] || <Box className="w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleResourceStatus(resource.id, !resource.is_active)}
                  className={`text-xs px-2 py-1 rounded font-bold uppercase ${resource.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-sand-muted'}`}
                >
                  {resource.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => {
                  if(confirm("Delete this resource?")) deleteResource(resource.id);
                }} className="text-sand-muted hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-medium text-sand-text mb-1">{resource.name}</h3>
            <p className="text-xs text-sand-muted uppercase tracking-widest">{resource.type}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#111] border border-sand-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-sand-muted hover:text-sand-text">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-serif text-sand-text mb-6">Add Resource</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Resource Name</label>
                <input name="name" required placeholder="e.g. Lead Photographer - John" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1" />
              </div>
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Type</label>
                <select name="type" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 outline-none">
                  <option value="photographer">Photographer</option>
                  <option value="videographer">Videographer</option>
                  <option value="drone">Drone Operator / Drone</option>
                  <option value="equipment">Studio Equipment</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full mt-8 bg-sand-surface text-sand-text px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-200 transition-colors">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Resource
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
