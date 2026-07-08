"use client";

import { motion } from "framer-motion";
import { Plus, Users, FolderOpen, ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSelectionRooms } from "@/app/actions/selections";
import CreateSelectionRoomModal from "./CreateSelectionRoomModal";

export default function AdminSelectionsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    const res = await getSelectionRooms();
    if (res.success) {
      setRooms(res.rooms || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const pendingCount = rooms.filter(r => r.status === 'pending').length;
  const inProgressCount = rooms.filter(r => r.status === 'in-progress').length;
  const completedCount = rooms.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">Client Selections</h1>
          <p className="text-sand-muted">Manage client photo selection sessions and track their progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sand-surface text-sand-text px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Session
        </button>
      </div>

      <CreateSelectionRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchRooms()} 
      />


      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-sand-border flex items-center gap-4">
          <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sand-muted text-sm">Pending</p>
            <p className="text-2xl font-bold">{loading ? "-" : pendingCount} Sessions</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-sand-border flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sand-muted text-sm">In Progress</p>
            <p className="text-2xl font-bold">{loading ? "-" : inProgressCount} Sessions</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-sand-border flex items-center gap-4">
          <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sand-muted text-sm">Completed</p>
            <p className="text-2xl font-bold">{loading ? "-" : completedCount} Sessions</p>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="glass rounded-2xl border border-sand-border overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
        ) : rooms.length === 0 ? (
          <div className="p-20 text-center text-sand-muted">No selection sessions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-border bg-black/5">
                  <th className="p-6 font-medium text-sand-muted">Client / Event</th>
                  <th className="p-6 font-medium text-sand-muted">Status</th>
                  <th className="p-6 font-medium text-sand-muted">Progress</th>
                  <th className="p-6 font-medium text-sand-muted">Last Active</th>
                  <th className="p-6 font-medium text-sand-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rooms.map((session, i) => (
                  <motion.tr 
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-black/5 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-sand-muted" />
                        </div>
                        <div>
                          <p className="font-bold text-sand-text">{session.clientName}</p>
                          <p className="text-sm text-sand-muted">{session.eventName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {session.status === 'completed' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>}
                      {session.status === 'in-progress' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider"><FolderOpen className="w-3.5 h-3.5" /> In Progress</span>}
                      {session.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-sand-muted">
                          <span>{session.selectedCount} selected</span>
                          <span>{session.totalPhotos} total</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${session.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.max(5, session.totalPhotos > 0 ? (session.selectedCount / session.totalPhotos) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-sand-muted">
                      {session.updatedAt}
                    </td>
                    <td className="p-6">
                      <Link href={`/admin/selections/${session.id}`} className="inline-flex items-center gap-2 text-sm text-sand-text hover:text-gray-700 font-medium">
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
