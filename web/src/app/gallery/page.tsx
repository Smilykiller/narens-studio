"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Info, LayoutGrid, Columns, SquareSplitHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getPublicPhotos, getCategories } from "@/app/actions/portfolio";
import { useInView } from "react-intersection-observer";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid" | "split">("masonry");

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && photos && visibleCount < photos.length) {
      setVisibleCount(prev => prev + 12);
    }
  }, [inView, photos, visibleCount]);

  // Fullscreen Viewer State
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, pics] = await Promise.all([getCategories(), getPublicPhotos()]);
        setCategories(cats);
        setPhotos(pics);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPhotos = photos.filter(
    photo => activeCategory === "All" || (photo.category?.name === activeCategory)
  );

  const visiblePhotos = filteredPhotos.slice(0, visibleCount);

  // Reset infinite scroll when category changes
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-transparent pt-24 px-4 md:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tighter uppercase text-sand-text"
            >
              Gallery
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sand-muted max-w-sm md:text-right text-lg"
          >
            A curated collection of our finest work, spanning cinematic weddings, intimate portraits, and brand shoots.
          </motion.p>
        </div>

        {/* Categories / Tabs */}
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-sand-muted" /></div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-sand-border pb-6">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                    activeCategory === "All" 
                      ? "bg-sand-surface text-sand-text" 
                      : "bg-white/40 border border-sand-border text-sand-muted hover:bg-black/5 hover:text-sand-text"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                      activeCategory === cat.name 
                        ? "bg-sand-surface text-sand-text" 
                        : "bg-white/40 border border-sand-border text-sand-muted hover:bg-black/5 hover:text-sand-text"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              
              {/* Layout Toggles */}
              <div className="flex items-center gap-2 bg-white/40 p-1 rounded-full border border-sand-border self-start lg:self-auto">
                <button onClick={() => setLayoutMode("masonry")} className={`p-2 rounded-full transition-all ${layoutMode === "masonry" ? "bg-sand-surface text-sand-text shadow-sm" : "text-sand-muted hover:text-sand-text"}`} title="Masonry">
                  <Columns className="w-4 h-4" />
                </button>
                <button onClick={() => setLayoutMode("grid")} className={`p-2 rounded-full transition-all ${layoutMode === "grid" ? "bg-sand-surface text-sand-text shadow-sm" : "text-sand-muted hover:text-sand-text"}`} title="Grid">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setLayoutMode("split")} className={`p-2 rounded-full transition-all ${layoutMode === "split" ? "bg-sand-surface text-sand-text shadow-sm" : "text-sand-muted hover:text-sand-text"}`} title="Split Screen">
                  <SquareSplitHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Layout */}
            <motion.div 
              layout 
              className={
                layoutMode === "masonry" ? "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6" :
                layoutMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" :
                "grid grid-cols-1 md:grid-cols-2 gap-0"
              }
            >
              <AnimatePresence>
                {visiblePhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={
                      layoutMode === "masonry" ? "break-inside-avoid" : 
                      layoutMode === "split" ? "h-[60vh] w-full" : 
                      "aspect-square w-full"
                    }
                  >
                    <div 
                      onClick={() => setSelectedPhoto(photo)}
                      className={`group relative cursor-pointer overflow-hidden bg-sand-surface transition-colors w-full h-full ${layoutMode === "split" ? "rounded-none border-b border-sand-border" : "rounded-2xl border border-sand-border hover:border-sand-border shadow-sm"}`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || "Gallery image"}
                        className={`img-theme w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out`}
                        loading="lazy"
                      />
                      {/* Watermark Overlay */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30 select-none">
                        <div className="text-sand-text font-black text-3xl md:text-5xl uppercase tracking-[0.3em] -rotate-45 whitespace-nowrap drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                          Naren's Studio
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 items-center text-center">
                        <span className="text-xs font-bold tracking-widest uppercase text-yellow-500 mb-2">
                          {photo.category?.name || "Uncategorized"}
                        </span>
                        <h3 className="text-xl font-medium text-white capitalize">{photo.title || "Untitled"}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {filteredPhotos.length > visibleCount && (
              <div ref={loadMoreRef} className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sand-muted" />
              </div>
            )}
            
            {filteredPhotos.length === 0 && (
              <div className="text-center py-32 border border-dashed border-sand-border rounded-3xl">
                <Info className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif text-sand-text mb-2">No Photos Found</h3>
                <p className="text-sand-muted">There are no public photos available in this category.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl p-4 md:p-12 cursor-pointer"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-full max-h-full"
            >
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.title || "Gallery image fullscreen"} 
                className="img-theme max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg border border-sand-border"
              />
              {/* Fullscreen Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40 select-none">
                <div className="text-sand-text font-black text-4xl md:text-7xl uppercase tracking-[0.4em] -rotate-45 whitespace-nowrap drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  Naren's Studio
                </div>
              </div>
            </motion.div>
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-10">
              <div>
                <h3 className="text-2xl font-serif text-sand-text drop-shadow-sm">{selectedPhoto.title || "Untitled"}</h3>
                <p className="text-sand-muted mt-2 tracking-widest uppercase text-sm font-bold">
                  {selectedPhoto.category?.name || "Uncategorized"}
                </p>
              </div>
              <button 
                className="pointer-events-auto px-6 py-3 bg-sand-surface text-sand-text font-bold uppercase tracking-widest text-sm rounded-full hover:bg-neutral-800 transition-colors shadow-xl"
                onClick={async (e) => {
                  e.stopPropagation();
                  // Load Razorpay Script if not loaded
                  if (!document.getElementById("razorpay-script")) {
                    const script = document.createElement("script");
                    script.id = "razorpay-script";
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    document.body.appendChild(script);
                    await new Promise(resolve => script.onload = resolve);
                  }

                  const res = await fetch("/api/payment/create-digital", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ photoId: selectedPhoto.id }),
                  });
                  const data = await res.json();
                  if (!data.success) {
                    alert("Failed to initiate purchase.");
                    return;
                  }

                  const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Naren's Studio",
                    description: "High-Res Digital Download",
                    order_id: data.orderId,
                    handler: async function (response: any) {
                      const verifyRes = await fetch("/api/payment/verify-digital", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                        }),
                      });
                      const verifyData = await verifyRes.json();
                      if (verifyData.success) {
                        alert("Purchase successful! You can now download the high-res unwatermarked image.");
                        // In a real app, you'd trigger a download of the un-watermarked high-res asset
                        const a = document.createElement('a');
                        a.href = selectedPhoto.url; // Use original unwatermarked URL
                        a.download = `naren-studio-${selectedPhoto.id}.jpg`;
                        a.click();
                      } else {
                        alert("Payment verification failed.");
                      }
                    },
                    theme: { color: "#000000" },
                  };

                  const rzp1 = new (window as any).Razorpay(options);
                  rzp1.open();
                }}
              >
                Buy High-Res (₹1,000)
              </button>
            </div>
            <button 
              className="absolute top-8 right-8 text-sand-muted hover:text-sand-text font-bold text-xl px-4 py-2 bg-black/5 rounded-full backdrop-blur-md z-20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
