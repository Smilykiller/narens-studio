"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, Mail, KeyRound, Smartphone, Globe, CreditCard, Image as ImageIcon, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getSiteSettings, updateSiteSettings, getHeroImages, addHeroImage, deleteHeroImage } from "@/app/actions/settings";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [settings, setSettings] = useState<any>(null);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    getSiteSettings().then(data => {
      setSettings(data);
    });
    getHeroImages().then(res => {
      if (res.success) setHeroImages(res.images);
      setLoading(false);
    });
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    await updateSiteSettings({
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location_image: settings?.location_image || null,
    });
    
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setSettings({ ...settings, location_image: data.url });
        await updateSiteSettings({ location_image: data.url });
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "hero", name: "Hero Slideshow", icon: ImageIcon },
    { id: "contact", name: "Contact Page", icon: MapPin },
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "billing", name: "Billing & Payouts", icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Settings</h1>
        <p className="text-sand-muted">Manage your studio preferences, security, and billing details.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  activeTab === tab.id 
                    ? "bg-black/10 text-sand-text" 
                    : "text-sand-muted hover:bg-black/5 hover:text-sand-text"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === "hero" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass p-8 rounded-2xl border border-sand-border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium">Hero Slideshow Images</h3>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-sand-text text-sand-surface rounded-xl text-sm font-bold">
                    Upload Image
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSaving(true);
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (data.url) {
                      const result = await addHeroImage(data.url);
                      if (result.success && result.image) {
                        setHeroImages([...heroImages, result.image]);
                      }
                    } else if (data.error) {
                      alert("Upload failed: " + data.error);
                    }
                    setSaving(false);
                  }} />
                </div>
                {saving && <p className="text-sm text-sand-muted mb-4">Uploading...</p>}
                
                {heroImages.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-sand-border rounded-xl">
                    <p className="text-sand-muted">No hero images uploaded. Default image will be shown.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroImages.map(img => (
                      <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border border-sand-border group">
                        <img src={img.url} alt="Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={async () => {
                            if(confirm("Delete this hero image?")) {
                              await deleteHeroImage(img.id);
                              setHeroImages(heroImages.filter(h => h.id !== img.id));
                            }
                          }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-sand-border">
                <h3 className="text-xl font-medium mb-6">Contact Page Setup</h3>
                {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
                ) : (
                  <form onSubmit={handleSaveContact} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Location Image</label>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-32 rounded-xl bg-black/5 overflow-hidden border border-sand-border flex items-center justify-center relative group">
                            {settings?.location_image ? (
                              <img src={settings.location_image} className="img-theme w-full h-full object-cover" alt="Location" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-sand-muted" />
                            )}
                            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium">Change</button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-sand-muted mb-2">Upload a stunning photo of your studio exterior or interior.</p>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-black/10 rounded-lg text-sm font-medium hover:bg-black/20 transition-colors">
                              Upload Image
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Studio Address (Accepts Newlines)</label>
                        <textarea 
                          name="address"
                          rows={3}
                          defaultValue={settings?.address}
                          className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Phone Details</label>
                          <textarea 
                            name="phone"
                            rows={3}
                            defaultValue={settings?.phone}
                            className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Email Details</label>
                          <textarea 
                            name="email"
                            rows={3}
                            defaultValue={settings?.email}
                            className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-sand-border flex justify-end">
                      <button disabled={saving} type="submit" className="px-6 py-3 bg-sand-surface text-sand-text rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Contact Info
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-sand-border">
                <h3 className="text-xl font-medium mb-6">Studio Profile</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-black/10 flex items-center justify-center text-3xl font-serif text-sand-text">
                      N
                    </div>
                    <button className="px-4 py-2 bg-black/10 rounded-lg text-sm font-medium hover:bg-black/20 transition-colors">
                      Change Avatar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Studio Name</label>
                      <input 
                        type="text" 
                        defaultValue="Naren's Studio"
                        className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Support Email</label>
                      <input 
                        type="email" 
                        defaultValue="admin@narensstudio.com"
                        className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-muted" />
                      <input 
                        type="url" 
                        defaultValue="https://narensstudio.com"
                        className="w-full bg-white/60 border border-sand-border rounded-xl pl-12 pr-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-sand-border flex justify-end">
                    <button className="px-6 py-3 bg-sand-surface text-sand-text rounded-xl font-bold hover:bg-gray-200 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-sand-border">
                <h3 className="text-xl font-medium mb-6">Password & Security</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Current Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-muted" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/60 border border-sand-border rounded-xl pl-12 pr-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-sand-border flex justify-end">
                    <button className="px-6 py-3 bg-sand-surface text-sand-text rounded-xl font-bold hover:bg-gray-200 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-sand-border">
                <h3 className="text-xl font-medium mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { title: "New Booking Requests", desc: "Get notified when a client submits a new booking form." },
                    { title: "Client Selections", desc: "Get notified when a client finalizes their photo selections." },
                    { title: "Frame Orders", desc: "Receive alerts for new frame shop purchases." },
                    { title: "Daemon Upload Alerts", desc: "Get warned if the background photo uploader disconnects." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-sand-border last:border-0">
                      <div>
                        <p className="font-medium text-sand-text">{item.title}</p>
                        <p className="text-sm text-sand-muted">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-sand-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-sand-border text-center">
                <CreditCard className="w-12 h-12 text-sand-muted mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Billing & Payouts</h3>
                <p className="text-sand-muted mb-6">Connect your bank account to receive payouts from Client Orders.</p>
                <button className="px-6 py-3 bg-[#6772E5] text-sand-text rounded-xl font-bold hover:bg-[#5469D4] transition-colors inline-flex items-center gap-2">
                  Connect with Stripe
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
