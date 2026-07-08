"use client";

import { useEffect, useState } from "react";
import { getClientDashboardData } from "@/app/actions/client";
import { Loader2, Calendar, FileText, IndianRupee, Image as ImageIcon, Camera, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientDashboardData().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-bg flex items-center justify-center text-sand-text">
        <Loader2 className="w-12 h-12 animate-spin text-sand-muted" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text font-sans pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Welcome back, {data.full_name?.split(" ")[0] || "Client"}</h1>
          <p className="text-sand-muted text-lg">Your central hub for bookings, galleries, and studio documents.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bookings */}
            <section className="bg-black/5 border border-sand-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-sand-muted" />
                  Your Sessions
                </h2>
                <Link href="/book" className="text-sm font-bold tracking-widest uppercase hover:text-gray-700 transition-colors flex items-center gap-2">
                  Book New <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {data.bookings.length > 0 ? (
                <div className="space-y-4">
                  {data.bookings.map((booking: any) => (
                    <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/60 border border-sand-border rounded-xl gap-4">
                      <div>
                        <h3 className="font-medium text-lg">{booking.title}</h3>
                        <p className="text-sm text-sand-muted">{new Date(booking.event_start).toLocaleDateString()} at {booking.venue_address}</p>
                      </div>
                      <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full w-fit ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-sand-muted border border-dashed border-sand-border rounded-xl">
                  No upcoming sessions booked.
                </div>
              )}
            </section>

            {/* Galleries & Rooms */}
            <section className="bg-black/5 border border-sand-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-serif flex items-center gap-3 mb-6">
                <ImageIcon className="w-6 h-6 text-sand-muted" />
                Private Galleries
              </h2>
              
              {data.rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.rooms.map((room: any) => (
                    <Link key={room.id} href={room.type === 'live' ? `/live/${room.id}` : `/selection/${room.id}`} className="group relative overflow-hidden rounded-xl border border-sand-border aspect-video flex flex-col justify-end p-6 hover:border-white/30 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-sand-muted mb-1">{room.type} Room</p>
                          <h3 className="text-xl font-serif group-hover:text-gray-700 transition-colors">{room.name}</h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-sand-muted group-hover:text-sand-text transition-colors group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-sand-muted border border-dashed border-sand-border rounded-xl">
                  No private galleries available yet.
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Billing & Documents */}
          <div className="space-y-8">
            
            {/* Invoices */}
            <section className="bg-black/5 border border-sand-border rounded-2xl p-6">
              <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                <IndianRupee className="w-5 h-5 text-sand-muted" />
                Invoices
              </h2>
              {data.invoices.length > 0 ? (
                <div className="space-y-3">
                  {data.invoices.map((inv: any) => (
                    <div key={inv.id} className="p-4 bg-white/60 border border-sand-border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-medium">₹{inv.amount.toLocaleString()}</p>
                        <p className="text-xs text-sand-muted">Due {new Date(inv.due_date).toLocaleDateString()}</p>
                      </div>
                      {inv.status === 'paid' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <button className="px-3 py-1.5 bg-sand-surface text-sand-text text-xs font-bold rounded-lg hover:bg-gray-200">Pay Now</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sand-muted text-sm">No pending invoices.</div>
              )}
            </section>

            {/* Contracts */}
            <section className="bg-black/5 border border-sand-border rounded-2xl p-6">
              <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-sand-muted" />
                Contracts
              </h2>
              {data.contracts.length > 0 ? (
                <div className="space-y-3">
                  {data.contracts.map((contract: any) => (
                    <div key={contract.id} className="p-4 bg-white/60 border border-sand-border rounded-xl">
                      <h3 className="font-medium mb-1 text-sm">{contract.title}</h3>
                      {contract.status === 'signed' ? (
                        <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed</p>
                      ) : (
                        <button className="text-xs text-yellow-500 hover:text-yellow-400 underline">Review & Sign</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sand-muted text-sm">No contracts found.</div>
              )}
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
