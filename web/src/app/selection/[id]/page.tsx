"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Check, Heart, X, Clock } from "lucide-react";
import { getSelectionRoom, updatePhotoSelection, finalizeSelection } from "@/app/actions/selection";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function SelectionRoomClientView() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [fullscreenImage, setFullscreenImage] = useState<any | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    getSelectionRoom(roomId).then(data => {
      if (data) {
        setRoom(data.room);
        setPhotos(data.photos);
      }
      setLoading(false);
    });
  }, [roomId]);

  const handleStatusChange = async (photoId: string, status: string, notes?: string) => {
    if (room?.is_finalized || room?.status !== 'active') return;

    // Optimistic update
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, selection_status: status, selection_notes: notes !== undefined ? notes : p.selection_notes } : p));
    if (fullscreenImage && fullscreenImage.id === photoId) {
      setFullscreenImage({ ...fullscreenImage, selection_status: status, selection_notes: notes !== undefined ? notes : fullscreenImage.selection_notes });
    }
    await updatePhotoSelection(roomId, photoId, status, notes);
  };

  const handleNotesSave = () => {
    if (fullscreenImage) {
      handleStatusChange(fullscreenImage.id, fullscreenImage.selection_status, editingNotes);
    }
  };

  const handleFinalize = async () => {
    if (confirm("Are you sure you want to finalize your selections? You won't be able to change them afterwards.")) {
      setIsFinalizing(true);
      const res = await finalizeSelection(roomId);
      if (res.success) {
        alert("Selections finalized successfully! The studio has been notified.");
        router.push("/dashboard");
      } else {
        alert(res.error || "Failed to finalize");
        setIsFinalizing(false);
      }
    }
  };

  const filteredPhotos = photos.filter(p => {
    if (filter === "all") return true;
    return p.selection_status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "liked": return "bg-green-500/20 text-green-500 border-green-500/50";
      case "waitlist": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "trash": return "bg-red-500/20 text-red-500 border-red-500/50";
      default: return "bg-black/10 text-sand-muted border-sand-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "liked": return <Heart className="w-4 h-4 fill-current" />;
      case "waitlist": return <Clock className="w-4 h-4" />;
      case "trash": return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-bg flex items-center justify-center text-sand-text">
        <Loader2 className="w-12 h-12 animate-spin text-sand-muted" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-sand-bg flex flex-col items-center justify-center text-sand-text">
        <h2 className="text-2xl font-serif mb-2">Room Not Found</h2>
        <p className="text-sand-muted mb-8">This selection room does not exist or has been deleted.</p>
        <Link href="/" className="px-8 py-3 bg-sand-surface text-sand-text rounded-full font-medium">Return Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-sand-bg/80 backdrop-blur-md border-b border-sand-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/dashboard" className="text-sand-muted hover:text-sand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl italic">{room.name}</h1>
              <p className="text-xs tracking-[0.2em] uppercase text-sand-muted">Selection Room</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { id: "all", label: `All (${photos.length})` },
              { id: "pending", label: `Pending (${photos.filter(p => p.selection_status === "pending").length})` },
              { id: "liked", label: `Liked (${photos.filter(p => p.selection_status === "liked").length})` },
              { id: "waitlist", label: `Waitlist (${photos.filter(p => p.selection_status === "waitlist").length})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f.id ? "bg-sand-surface text-sand-text" : "bg-black/5 text-sand-muted hover:bg-black/10 hover:text-sand-text"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button 
              onClick={handleFinalize}
              disabled={isFinalizing || room.status !== 'active' || room.is_finalized}
              className={`ml-4 px-6 py-2 text-sand-text rounded-full text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${room.is_finalized ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isFinalizing ? "Finalizing..." : (room.is_finalized ? "Selections Submitted" : (room.status === 'active' ? "Finish Selection" : "Selection Locked"))}
            </button>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-4">
          <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${(photos.filter(p => p.selection_status === 'liked').length / (photos.length || 1)) * 100}%` }} 
            />
          </div>
          <span className="text-sm font-medium text-sand-muted">
            {photos.filter(p => p.selection_status === 'liked').length} / {photos.length} Selected
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center text-sand-muted">
            No photos found for this filter.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredPhotos.map((photo) => (
                <motion.div
                  layout
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative break-inside-avoid"
                >
                  <div 
                    onClick={() => {
                      setFullscreenImage(photo);
                      setEditingNotes(photo.selection_notes || "");
                    }}
                    className={`bg-black/5 rounded-2xl overflow-hidden cursor-pointer border hover:border-sand-border transition-all shadow-sm ${getStatusColor(photo.selection_status)}`}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title || "Selection image"} 
                      className="img-theme w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30 select-none">
                      <div className="text-sand-text font-black text-2xl uppercase tracking-[0.3em] -rotate-45 whitespace-nowrap drop-shadow-lg">
                        Naren's Studio
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    {photo.selection_status !== "pending" && (
                      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 backdrop-blur-md ${getStatusColor(photo.selection_status)}`}>
                        {getStatusIcon(photo.selection_status)}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Actions (Hover) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-sand-border">
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(photo.id, "liked"); }} className="p-2 hover:bg-black/10 rounded-full text-green-500 transition-colors" title="Like">
                      <Heart className={`w-4 h-4 ${photo.selection_status === "liked" ? "fill-current" : ""}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(photo.id, "waitlist"); }} className="p-2 hover:bg-black/10 rounded-full text-yellow-500 transition-colors" title="Waitlist">
                      <Clock className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-black/20 mx-1" />
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(photo.id, "trash"); }} className="p-2 hover:bg-black/10 rounded-full text-red-500 transition-colors" title="Trash">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex justify-between items-center p-4">
              <div className="text-sand-muted">
                {photos.findIndex(p => p.id === fullscreenImage.id) + 1} / {photos.length}
              </div>
              <button 
                onClick={() => setFullscreenImage(null)}
                className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-sand-text hover:bg-black/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              <img
                src={fullscreenImage.url}
                className="img-theme max-w-full max-h-full object-contain rounded-lg"
                alt="Fullscreen"
              />
              {/* Fullscreen Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40 select-none">
                <div className="text-sand-text font-black text-4xl md:text-7xl uppercase tracking-[0.4em] -rotate-45 whitespace-nowrap drop-shadow-2xl">
                  Naren's Studio
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white/60 border-t border-sand-border flex flex-col items-center gap-4">
              
              {/* Feedback Input */}
              <div className="w-full max-w-2xl flex gap-2">
                <input 
                  type="text" 
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add retouching notes for this photo (e.g. Please remove blemish...)"
                  className="flex-1 bg-black/5 border border-sand-border rounded-xl px-4 py-3 text-sm text-sand-text focus:outline-none focus:border-yellow-500 transition-colors"
                />
                <button 
                  onClick={handleNotesSave}
                  className="px-6 py-3 bg-black/10 text-sand-text font-medium rounded-xl hover:bg-black/20 transition-colors"
                >
                  Save Note
                </button>
              </div>

              {/* Status Toggles */}
              <div className="bg-black/10 backdrop-blur-md rounded-full p-2 flex items-center gap-2 border border-sand-border w-fit">
                <button 
                  onClick={() => handleStatusChange(fullscreenImage.id, "liked")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                    fullscreenImage.selection_status === "liked" 
                      ? "bg-green-500 text-sand-text" 
                      : "text-sand-text hover:bg-black/10"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${fullscreenImage.selection_status === "liked" ? "fill-current" : ""}`} />
                  Yes
                </button>
                <div className="w-px h-8 bg-black/20" />
                <button 
                  onClick={() => handleStatusChange(fullscreenImage.id, "waitlist")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                    fullscreenImage.selection_status === "waitlist" 
                      ? "bg-yellow-500 text-sand-text" 
                      : "text-sand-text hover:bg-black/10"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  Maybe
                </button>
                <div className="w-px h-8 bg-black/20" />
                <button 
                  onClick={() => handleStatusChange(fullscreenImage.id, "trash")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                    fullscreenImage.selection_status === "trash" 
                      ? "bg-red-500 text-sand-text" 
                      : "text-sand-text hover:bg-black/10"
                  }`}
                >
                  <X className="w-5 h-5" />
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
