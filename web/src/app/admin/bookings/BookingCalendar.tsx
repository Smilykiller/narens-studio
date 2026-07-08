"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, MapPin, Clock, Camera, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { createBooking } from "@/app/actions/bookings";

export default function BookingCalendar({ bookings, resources, clients }: { bookings: any[], resources: any[], clients: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forceOverride, setForceOverride] = useState(false);

  // Calendar Math
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDayOfWeek = startOfMonth.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - startDayOfWeek + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    }
    return null;
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const client_id = formData.get("client_id") as string;
    const title = formData.get("title") as string;
    const event_start = new Date(formData.get("event_start") as string);
    const event_end = new Date(formData.get("event_end") as string);
    const venue_lat = parseFloat(formData.get("venue_lat") as string || "0");
    const venue_lng = parseFloat(formData.get("venue_lng") as string || "0");
    const venue_address = formData.get("venue_address") as string;
    
    // get selected resources
    const resource_ids = Array.from(formData.getAll("resources")) as string[];
    const isForceOverride = formData.get("force_override") === "true";

    const res = await createBooking({
      client_id, title, event_start, event_end, venue_lat, venue_lng, venue_address, resource_ids, forceOverride: isForceOverride
    });

    setIsSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setForceOverride(false);
    } else {
      setErrorMsg(res.error || "Failed to create booking.");
      if (res.error?.includes("Insufficient") || res.error?.includes("overlap")) {
        setForceOverride(true); // show override option
      }
    }
  }

  return (
    <div className="bg-[#111] border border-sand-border rounded-3xl overflow-hidden">
      
      {/* Calendar Header */}
      <div className="p-6 border-b border-sand-border flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-serif min-w-[200px] text-center">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => { setIsModalOpen(true); setErrorMsg(""); setForceOverride(false); }} className="bg-green-500 text-sand-text px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-400 transition-colors">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-b border-sand-border bg-white/40">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-4 text-center text-xs font-bold tracking-widest uppercase text-sand-muted">
            {d}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 bg-[#111]">
        {days.map((date, i) => {
          const isToday = date && date.toDateString() === new Date().toDateString();
          const dayBookings = date ? bookings.filter(b => new Date(b.event_start).toDateString() === date.toDateString()) : [];
          
          return (
            <div key={i} className={`min-h-[120px] p-2 border-r border-b border-sand-border relative ${!date ? 'bg-black/20' : 'hover:bg-black/5'} transition-colors`}>
              {date && (
                <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-green-500 text-sand-text' : 'text-sand-muted'}`}>
                  {date.getDate()}
                </span>
              )}
              
              <div className="space-y-1">
                {dayBookings.map(b => (
                  <div key={b.id} className="bg-black/10 rounded p-1.5 text-xs border-l-2 border-green-500 cursor-pointer hover:bg-black/20 transition-colors" title={b.title}>
                    <div className="font-bold truncate text-sand-text">{b.title}</div>
                    <div className="text-sand-muted truncate flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(b.event_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#111] border border-sand-border rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-sand-muted hover:text-sand-text">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-serif text-sand-text mb-6">Create Geofenced Booking</h2>
            
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Scheduling Conflict</h4>
                  <p className="text-sm mt-1">{errorMsg}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Client</label>
                  <select name="client_id" required className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 outline-none">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Event Title</label>
                  <input name="title" required placeholder="e.g. Smith Wedding" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Start Time</label>
                  <input type="datetime-local" name="event_start" required className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 invert" style={{colorScheme: 'dark'}} />
                </div>
                <div>
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">End Time</label>
                  <input type="datetime-local" name="event_end" required className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1 invert" style={{colorScheme: 'dark'}} />
                </div>
              </div>

              <div className="p-5 border border-sand-border bg-white/60 rounded-2xl">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-sand-text"><MapPin className="w-4 h-4 text-blue-400" /> Venue Geofence</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Full Address</label>
                    <input name="venue_address" required placeholder="123 Event Hall, NY" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Latitude</label>
                      <input name="venue_lat" type="number" step="any" required placeholder="40.7128" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Longitude</label>
                      <input name="venue_lng" type="number" step="any" required placeholder="-74.0060" className="w-full bg-sand-surface border border-sand-border rounded-lg px-4 py-3 text-sand-text mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-sand-border bg-white/60 rounded-2xl">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-sand-text"><Camera className="w-4 h-4 text-yellow-500" /> Allocate Resources</h3>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {resources.map(r => (
                    <label key={r.id} className="flex items-center gap-3 bg-[#111] border border-sand-border p-3 rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
                      <input type="checkbox" name="resources" value={r.id} className="w-4 h-4 accent-green-500" />
                      <div>
                        <div className="text-sm font-bold text-sand-text">{r.name}</div>
                        <div className="text-xs text-sand-muted uppercase">{r.type}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {forceOverride && (
                <label className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 p-4 rounded-xl cursor-pointer hover:bg-red-500/20 transition-colors">
                  <input type="checkbox" name="force_override" value="true" className="w-4 h-4 accent-red-500 mt-1" />
                  <div>
                    <div className="text-sm font-bold text-red-400">Admin Override: Force Assignment</div>
                    <div className="text-xs text-red-400/80 mt-1">Ignore the geofencing conflict and force this booking to go through. Ensure the team member is aware.</div>
                  </div>
                </label>
              )}
            </div>

            <button type="submit" disabled={isSaving} className="w-full mt-8 bg-green-500 text-sand-text px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-400 transition-colors">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {forceOverride ? "Force Save Booking" : "Check & Save Booking"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
