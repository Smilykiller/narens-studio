"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, ArrowLeft, Image as ImageIcon, Pause } from "lucide-react";
import { getLiveRoomPhotos, getRoomDetails } from "@/app/actions/live";
import Link from "next/link";

const STUDIO_ROOM_ID = "studio-live";

export default function StudioLiveRoomClientView() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);

  const fetchState = async () => {
    const [roomData, photosData] = await Promise.all([
      getRoomDetails(STUDIO_ROOM_ID),
      getLiveRoomPhotos(STUDIO_ROOM_ID)
    ]);
    
    if (roomData) setRoom(roomData);
    if (photosData.success) {
      if (photosData.photos.length > photoCount && photoCount > 0) {
        // Trigger ping animation
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 1000);
      }
      setPhotos(photosData.photos);
      setPhotoCount(photosData.photos.length);
    }
    setLoading(false);
  };

  // Poll every 2 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [photoCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-bg flex flex-col items-center justify-center text-sand-text">
        <Loader2 className="w-12 h-12 animate-spin text-sand-muted mb-4" />
        <p className="text-sand-muted">Connecting to session...</p>
      </div>
    );
  }

  // Handle missing room state
  if (!room) {
    return (
      <div className="min-h-screen bg-sand-bg flex flex-col items-center justify-center text-sand-text">
        <div className="p-8 bg-black/5 rounded-full mb-6">
          <Camera className="w-16 h-16 text-sand-muted" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Session Not Found</h2>
        <p className="text-sand-muted mb-8 max-w-md text-center">
          The studio session could not be loaded. Please verify your link.
        </p>
        <Link href="/" className="px-8 py-3 bg-sand-surface text-sand-text rounded-full font-medium hover:bg-gray-200 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-sand-bg/80 backdrop-blur-md border-b border-sand-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sand-muted hover:text-sand-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-lg">{room.name || "Studio Live"}</h1>
            <div className="flex items-center gap-2">
              {room.status === 'active' ? (
                <>
                  <span className={`w-2 h-2 rounded-full ${justUpdated ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-150' : 'bg-red-500 animate-pulse'} transition-all duration-300`} />
                  <span className="text-xs text-red-500 font-medium tracking-widest uppercase">
                    {justUpdated ? <span className="text-green-500">New Photo!</span> : "Live Session"}
                  </span>
                </>
              ) : room.status === 'paused' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs text-yellow-500 font-medium tracking-widest uppercase">
                    Paused
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-blue-500 font-medium tracking-widest uppercase">
                    Archived Gallery (Available Online)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-sand-muted">
          {photos.length} Photos
        </div>
      </div>

      {/* Grid or Paused State */}
      <div className="pt-24 px-4 pb-24 md:px-8 max-w-[2000px] mx-auto">
        {room.status === "paused" && photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Pause className="w-16 h-16 text-yellow-500/50 mb-4" />
            <p className="text-xl font-medium mb-2 text-yellow-500">Session Paused</p>
            <p className="text-sand-muted max-w-md">
              The photographer is currently adjusting the set or taking a break.
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ImageIcon className="w-16 h-16 text-sand-text/20 mb-4" />
            <p className="text-xl font-medium mb-2">Ready to Shoot</p>
            <p className="text-sand-muted max-w-md">
              Waiting for the photographer to take the first photo. It will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.05 }}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in"
                >
                  <img 
                    src={photo.url} 
                    alt="Live Shoot" 
                    onClick={() => setFullscreenImage(photo.url)}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {room.status === "paused" && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
                      <Pause className="w-12 h-12 text-sand-text/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenImage}
              className="max-w-full max-h-full object-contain rounded-xl"
              alt="Fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
