"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Loader2, User, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getPackages, submitBooking } from "@/app/actions/booking";

type Package = {
  id: string;
  name: string;
  limits: string;
};

export default function BookingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    venue: "",
    notes: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getPackages();
        
        // Map data to our local type and remove any pricing concept.
        const activePackages: Package[] = data.map(p => ({
          id: p.id,
          name: p.name,
          limits: p.limits
        }));

        // Always append a generic Custom Package
        activePackages.push({
          id: "custom",
          name: "Custom Package",
          limits: "A tailored photography or videography plan designed specifically for your unique requirements."
        });

        setPackages(activePackages);
      } catch (err) {
        console.error("Failed to load packages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert("Please select a package first.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Submit the pending booking
      const res = await submitBooking({
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        notes: formData.notes
      });
      
      if (!res.success || !res.booking) {
        alert("Booking failed: " + res.error);
        setSubmitting(false);
        return;
      }

      // 2. Load Razorpay
      const resScript = await loadRazorpay();
      if (!resScript) {
        alert("Razorpay SDK failed to load.");
        setSubmitting(false);
        return;
      }

      // 3. Create Deposit Order
      const orderRes = await fetch("/api/payment/create-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: res.booking.id }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Failed to initiate payment.");
        setSubmitting(false);
        return;
      }

      // 4. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Naren's Studio",
        description: "Booking Deposit",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify-deposit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: res.booking.id,
                invoiceId: orderData.invoiceId
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(true);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            alert("Verification error.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#FF6B00",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      console.error(err);
      alert("Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-transparent text-sand-text flex items-center justify-center p-4">
        <Navbar />
        <div className="bg-sand-surface p-12 rounded-3xl text-center max-w-lg border border-sand-border mt-20 shadow-xl">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-serif mb-4 text-sand-text">Request Received</h2>
          <p className="text-sand-muted mb-8">
            Thank you for choosing Naren's Studio. Our team will review your requested dates and contact you shortly to confirm the booking and tailor your session.
          </p>
          <Link href="/" className="bg-sand-surface text-sand-text px-8 py-3 rounded-full font-bold hover:bg-neutral-800 transition-colors inline-block">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-sand-text pt-24 px-4 md:px-12 pb-24">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sand-muted hover:text-sand-text transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-5xl font-serif mb-2 text-sand-text">Book a Session</h1>
        <p className="text-sand-muted mb-12">Select your desired package and let us know the details of your event.</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Package Selection */}
          <section>
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-sand-text">
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm border border-sand-border">1</span>
              Select Package
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                 <div className="col-span-full py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
              ) : packages.map(pkg => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all border ${
                    selectedPackage?.id === pkg.id 
                      ? "bg-black/5 border-black text-sand-text shadow-sm" 
                      : "bg-sand-surface border-sand-border text-sand-muted hover:border-sand-border"
                  }`}
                >
                  <h3 className={`font-medium mb-2 capitalize lowercase ${selectedPackage?.id === pkg.id ? "text-sand-text" : "text-neutral-700"}`}>{pkg.name}</h3>
                  <p className="text-sm line-clamp-3 capitalize lowercase">{pkg.limits || "customized scope of work"}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Personal Details */}
          <section>
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-sand-text">
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm border border-sand-border">2</span>
              Your Information
            </h2>
            <div className="bg-sand-surface p-8 rounded-3xl border border-sand-border space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Name
                  </label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </label>
                  <input 
                    type="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </label>
                  <input 
                    type="tel" required
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-sand-text">
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm border border-sand-border">3</span>
              Event Details
            </h2>
            <div className="bg-sand-surface p-8 rounded-3xl border border-sand-border space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Date
                  </label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Time
                  </label>
                  <input 
                    type="time" required
                    value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Venue Address
                </label>
                <input 
                  type="text" required placeholder="e.g. Taj West End, Bengaluru"
                  value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}
                  className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-sand-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                  Additional Notes
                </label>
                <textarea 
                  rows={3} placeholder="Any specific requirements, shot lists, or special requests..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-sand-surface border border-sand-border rounded-xl px-4 py-3 text-sand-text focus:border-sand-border outline-none transition-colors resize-none shadow-sm"
                />
              </div>
            </div>
          </section>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={submitting || !selectedPackage}
              className="w-full md:w-auto px-12 py-4 bg-sand-surface text-sand-text rounded-full font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto md:mx-0 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] disabled:shadow-none"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
