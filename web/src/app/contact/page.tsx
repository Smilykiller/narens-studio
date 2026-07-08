"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/app/actions/settings";
import { submitContact } from "@/app/actions/contact";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await submitContact(formData);
    
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
    } else {
      alert(res.error || "Failed to send message");
    }
  };

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text pt-24 px-4 md:px-12 pb-24 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sand-muted hover:text-sand-text transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif tracking-tight mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sand-muted text-lg md:text-xl"
          >
            Whether you're inquiring about a wedding, a commercial shoot, or custom frames, our team is ready to assist you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Information & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-2xl font-serif mb-8 text-sand-text">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-black/5 rounded-full">
                    <MapPin className="w-6 h-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-sand-text mb-1">Studio Location</h4>
                    <p className="text-sand-muted whitespace-pre-line">
                      {settings?.address || "123 Photography Lane\nCreative District, New York, NY 10001"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-4 bg-black/5 rounded-full">
                    <Phone className="w-6 h-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-sand-text mb-1">Phone</h4>
                    <p className="text-sand-muted whitespace-pre-line">
                      {settings?.phone || "+1 (555) 123-4567\nMon-Sat, 9AM to 7PM EST"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-4 bg-black/5 rounded-full">
                    <Mail className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-sand-text mb-1">Email</h4>
                    <p className="text-sand-muted whitespace-pre-line lowercase">
                      {settings?.email || "hello@narensstudio.com\nbookings@narensstudio.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-xl font-serif mb-6 text-sand-text">Follow Our Work</h3>
              <div className="flex gap-4">
                <a href="#" className="p-4 glass rounded-2xl border border-sand-border hover:border-yellow-600 hover:text-yellow-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="p-4 glass rounded-2xl border border-sand-border hover:border-yellow-600 hover:text-yellow-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="p-4 glass rounded-2xl border border-sand-border hover:border-yellow-600 hover:text-yellow-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </a>
                <a href="#" className="p-4 glass rounded-2xl border border-sand-border hover:border-yellow-600 hover:text-yellow-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-3xl overflow-hidden border border-sand-border aspect-[16/9] relative bg-black/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528001004!2d-74.14448733246824!3d40.69763123328221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(80%) contrast(110%)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass p-8 md:p-12 rounded-3xl border border-sand-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full" />
              
              <h2 className="text-2xl font-serif mb-8 text-sand-text relative z-10">Send us a message</h2>
              
              {success ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif mb-2 text-sand-text">Message Sent!</h3>
                  <p className="text-sand-muted mb-8">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button onClick={() => setSuccess(false)} className="text-sm font-bold uppercase tracking-widest text-yellow-600 hover:text-sand-text transition-colors">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">First Name</label>
                      <input name="firstName" type="text" required className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Last Name</label>
                      <input name="lastName" type="text" required className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 transition-all outline-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Email Address</label>
                    <input name="email" type="email" required className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 transition-all outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Subject</label>
                    <select name="subject" className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 transition-all outline-none appearance-none">
                      <option value="general">General Inquiry</option>
                      <option value="wedding">Wedding Photography</option>
                      <option value="commercial">Commercial Shoot</option>
                      <option value="support">Frame Shop Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Message</label>
                    <textarea name="message" required rows={5} className="w-full bg-white/60 border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 transition-all outline-none resize-none"></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-sand-surface text-sand-text rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
