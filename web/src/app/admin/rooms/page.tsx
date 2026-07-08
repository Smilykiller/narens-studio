"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, Link as LinkIcon, Camera, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getStudioLiveRoom, toggleStudioSession } from "@/app/actions/rooms";
import Link from "next/link";

export default function AdminLiveRooms() {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchRoom = async () => {
    const data = await getStudioLiveRoom();
    if (data.success) {
      setRoom(data.room);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const handleToggle = async (action: 'start' | 'pause' | 'end') => {
    if (action === 'end') {
      if (!confirm("Ending the session will mark it as ended, but all photos will remain preserved and accessible via the live link for future client viewing. Proceed?")) return;
    }
    if (action === 'start') {
      if (room?.status === 'archived' || room?.status === 'paused') {
        if (!confirm("Starting a new live session will clear the previous session photos from this live room. Are you sure you want to start a new shoot?")) return;
      }
    }
    
    setToggling(true);
    await toggleStudioSession(action);
    await fetchRoom();
    setToggling(false);
  };

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/live/studio` : '';

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-sand-text mb-1">Studio Live Room</h2>
        <p className="text-sm text-sand-muted">Manage your persistent live shooting session.</p>
        <div className="mt-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider">Future Access Enabled:</span> All session photos are preserved indefinitely. Even when a live session ends or is paused, clients can access the link anytime in the future to view their photos.
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-sand-border flex flex-col lg:flex-row gap-8"
      >
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-medium text-sand-text">{room?.name || "Studio Live Room"}</span>
                {room?.status === 'active' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-red-500/20 text-red-500 animate-pulse">
                    LIVE
                  </span>
                )}
                {room?.status === 'paused' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-yellow-500/20 text-yellow-500">
                    PAUSED
                  </span>
                )}
                {room?.status === 'archived' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-gray-500/20 text-sand-muted">
                    ENDED
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              {room?.status !== 'active' && (
                <button 
                  onClick={() => handleToggle('start')}
                  disabled={toggling}
                  className="px-6 py-3 rounded-full bg-green-500/20 hover:bg-green-500/40 transition-colors text-green-500 flex items-center gap-2 font-medium"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Session
                </button>
              )}
              {room?.status === 'active' && (
                <button 
                  onClick={() => handleToggle('pause')}
                  disabled={toggling}
                  className="px-6 py-3 rounded-full bg-yellow-500/20 hover:bg-yellow-500/40 transition-colors text-yellow-500 flex items-center gap-2 font-medium"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  Pause
                </button>
              )}
              {(room?.status === 'active' || room?.status === 'paused') && (
                <button 
                  onClick={() => handleToggle('end')}
                  disabled={toggling}
                  className="px-6 py-3 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors text-red-500 flex items-center gap-2 font-medium"
                >
                  <Square className="w-5 h-5 fill-current" />
                  End Session
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white/60 rounded-2xl border border-sand-border p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Camera className="w-8 h-8 text-sand-muted mb-4" />
            <p className="text-sand-muted">The local daemon will automatically target this room.</p>
            <code className="mt-4 px-4 py-2 bg-sand-surface rounded-lg text-green-400 border border-green-500/30">
              npm run start:daemon
            </code>
          </div>
        </div>

        {/* Sidebar with QR code */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-sand-surface p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-gray-100 p-4 rounded-xl mb-4">
              <QRCodeSVG 
                value={roomUrl} 
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <h4 className="text-sand-text font-bold mb-1">Persistent Client Access</h4>
            <p className="text-sm text-sand-muted mb-4">Print this single QR for all your shoots.</p>
            
            <button 
              onClick={() => navigator.clipboard.writeText(roomUrl)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-sand-text rounded-xl font-medium transition-colors text-sm"
            >
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </button>
            <Link href={`/live/studio`} target="_blank" className="mt-2 text-sm text-blue-500 hover:underline">
              Open preview
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
