"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Image as ImageIcon, Download, Copy, Share2, Loader2, Square } from "lucide-react";
import Link from "next/link";
import { getSelectionDetails } from "@/app/actions/selections";
import { updateRoomStatus } from "@/app/actions/rooms";

export default function AdminSelectionDetailsPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = async () => {
    const res = await getSelectionDetails(params.id);
    if (res.success) {
      setRoom(res.room);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>;
  }

  if (!room) {
    return <div className="p-20 text-center text-sand-muted">Room not found.</div>;
  }

  const selectedPhotos = room.selections?.filter((s: any) => s.status === 'selected') || [];
  const waitlistPhotos = room.selections?.filter((s: any) => s.status === 'waitlist') || [];
  const trashedPhotos = room.selections?.filter((s: any) => s.status === 'trashed') || [];

  const handleCloseRoom = async () => {
    await updateRoomStatus(room.id, "archived");
    await fetchRoom();
  };

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/selection/${room.id}` : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 text-sm text-sand-muted mb-4">
        <Link href="/admin/selections" className="flex items-center gap-2 hover:text-sand-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Selections
        </Link>
        <span>/</span>
        <span className="text-sand-text">{room.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">{room.name}</h1>
          <p className="text-sand-muted">
            Client: <span className="text-sand-text">{room.client?.full_name || room.client?.email || 'Unknown Client'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(roomUrl);
              alert("Client link copied!");
            }}
            className="flex items-center gap-2 bg-black/10 text-sand-text px-4 py-2 rounded-xl font-medium hover:bg-black/20 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          {room.status === "active" && (
            <button 
              onClick={handleCloseRoom}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
              Close Session
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border border-sand-border">
          <p className="text-sand-muted text-sm mb-2">Total Uploaded</p>
          <p className="text-3xl font-bold">{room.room_photos?.length || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-green-500/30 bg-green-500/5">
          <p className="text-green-400 text-sm mb-2">Selected</p>
          <p className="text-3xl font-bold text-green-500">{selectedPhotos.length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-sm mb-2">Waitlisted</p>
          <p className="text-3xl font-bold text-yellow-500">{waitlistPhotos.length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 text-sm mb-2">Trashed</p>
          <p className="text-3xl font-bold text-red-500">{trashedPhotos.length}</p>
        </div>
      </div>

      {/* Selected Photos Grid */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-medium">Selected Photos</h2>
          {selectedPhotos.length > 0 && (
            <button className="flex items-center gap-2 text-sm bg-sand-surface text-sand-text px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export Selection List
            </button>
          )}
        </div>
        
        {selectedPhotos.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-sand-border text-center text-sand-muted">
            <ImageIcon className="w-8 h-8 mx-auto mb-4 opacity-50" />
            No photos selected yet
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedPhotos.map((selection: any) => (
              <div key={selection.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5">
                <img 
                  src={selection.photo?.url || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop"} 
                  alt="Selected photo"
                  className="img-theme w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 p-1.5 bg-green-500 rounded-full shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-sand-text" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
