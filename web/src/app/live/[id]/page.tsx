"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { getLiveRoomPhotos, getRoomDetails } from "@/app/actions/live";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LiveRoomClientView() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [justUpdated, setJustUpdated] = useState(false);

  const fetchState = async () => {
    const [roomData, photosData] = await Promise.all([
      getRoomDetails(roomId),
      getLiveRoomPhotos(roomId)
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
  }, [roomId, photoCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-bg flex flex-col items-center justify-center text-sand-text">
        <Loader2 className="w-12 h-12 animate-spin text-sand-muted mb-4" />
        <p className="text-sand-muted">Connecting to session...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-sand-bg flex flex-col items-center justify-center text-sand-text">
        <div className="p-8 bg-black/5 rounded-full mb-6">
          <Camera className="w-16 h-16 text-sand-muted" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Session Not Found</h2>
        <p className="text-sand-muted mb-8 max-w-md text-center">
          This live session room could not be found or has been removed.
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
            <h1 className="font-serif text-lg">{room.name}</h1>
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

      {/* Grid */}
      <div className="pt-24 px-4 pb-24 md:px-8 max-w-[2000px] mx-auto">
        {photos.length === 0 ? (
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
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                  
                  {/* Like Button Overlay */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // In a real app we'd call an action here to update Selection table
                      alert("Added to your shortlists!");
                    }}
                    className="absolute top-4 right-4 p-3 rounded-full bg-white/40 backdrop-blur-md text-sand-text opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/60"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
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
