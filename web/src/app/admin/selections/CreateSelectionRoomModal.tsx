"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createSelectionRoom } from "@/app/actions/selections";

export default function CreateSelectionRoomModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    await createSelectionRoom(roomName);
    setRoomName("");
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-sand-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-sand-text">New Selection Session</h2>
          <button onClick={onClose} className="p-2 text-sand-muted hover:text-sand-text rounded-full hover:bg-black/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sand-muted mb-1">Session Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Smith Wedding Selections"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !roomName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-sand-surface text-sand-text py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
