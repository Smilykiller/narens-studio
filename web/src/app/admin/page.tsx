"use client";

import { motion } from "framer-motion";
import { Users, Camera, Store, Clock, Loader2, Calendar, PlusCircle, MessageSquare, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboard";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getDashboardStats();
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>;
  }

  const { stats, activity, upcomingBookings, recentEnquiries } = data || { 
    stats: { activeRooms: 0, pendingSelections: 0, totalClients: 0, totalRevenue: 0 }, 
    activity: [], upcomingBookings: [], recentEnquiries: [] 
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/admin/clients" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-black/10 transition-colors border border-sand-border text-sm font-medium text-sand-text">
          <PlusCircle className="w-4 h-4 text-purple-400" /> New Client
        </Link>
        <Link href="/admin/bookings" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-black/10 transition-colors border border-sand-border text-sm font-medium text-sand-text">
          <Calendar className="w-4 h-4 text-blue-400" /> View Calendar
        </Link>
        <Link href="/admin/rooms" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-black/10 transition-colors border border-sand-border text-sm font-medium text-sand-text">
          <Camera className="w-4 h-4 text-green-400" /> Live Room
        </Link>
        <Link href="/admin/shop/enquiries" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-black/10 transition-colors border border-sand-border text-sm font-medium text-sand-text">
          <MessageSquare className="w-4 h-4 text-yellow-400" /> Enquiries
        </Link>
        <Link href="/admin/blog/new" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-black/10 transition-colors border border-sand-border text-sm font-medium text-sand-text">
          <PlusCircle className="w-4 h-4 text-[#FF6B00]" /> New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-400" },
          { label: "Total Clients", value: stats.totalClients, icon: Users, color: "text-blue-400" },
          { label: "Active Live Rooms", value: stats.activeRooms, icon: Camera, color: "text-purple-400" },
          { label: "Pending Selections", value: stats.pendingSelections, icon: Clock, color: "text-yellow-400" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl border border-sand-border relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110 ${stat.color}`} />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-black/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-serif text-sand-text mb-1 relative z-10">{stat.value}</h3>
              <p className="text-sm text-sand-muted font-medium relative z-10">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-sand-border overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-sand-border flex justify-between items-center">
            <h2 className="text-lg font-medium text-sand-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Bookings
            </h2>
            <Link href="/admin/bookings" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="divide-y divide-white/5 flex-1">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center text-sand-muted">No upcoming bookings scheduled.</div>
            ) : (
              upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="p-6 hover:bg-black/5 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sand-text font-medium mb-1">{booking.title}</p>
                    <p className="text-sm text-sand-muted">{booking.client.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">{new Date(booking.event_start).toLocaleDateString()}</p>
                    <p className="text-xs text-sand-muted">{new Date(booking.event_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl border border-sand-border overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-sand-border flex justify-between items-center">
            <h2 className="text-lg font-medium text-sand-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-yellow-400" /> Recent Enquiries
            </h2>
            <Link href="/admin/shop/enquiries" className="text-xs text-yellow-400 hover:text-yellow-300">View All</Link>
          </div>
          <div className="divide-y divide-white/5 flex-1">
            {recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-sand-muted">No recent enquiries.</div>
            ) : (
              recentEnquiries.map((enq: any) => (
                <div key={enq.id} className="p-6 hover:bg-black/5 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sand-text font-medium mb-1">{enq.product.name}</p>
                    <p className="text-sm text-sand-muted">From: {enq.client.full_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${enq.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {enq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

