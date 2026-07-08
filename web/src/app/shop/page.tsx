"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getProducts } from "@/app/actions/shop";

export default function ShopPage() {
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const { getAuthState } = await import("@/app/actions/auth");
        const auth = await getAuthState();
        setIsAdmin(auth?.user?.role === "admin");
        const data = await getProducts();
        if (data && data.length > 0) {
          setFrames(data.filter((f: any) => f.is_active));
        }
      } catch (err) {
        console.error("Failed to load shop frames", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFrames();
  }, []);

  return (
    <main className="min-h-screen bg-sand-surface text-sand-text pt-24 px-4 md:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif tracking-tight"
            >
              The Frame Shop
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sand-muted max-w-sm md:text-right"
          >
            Museum-quality framing for your most cherished memories. Select a style to view sample galleries and dimensions.
          </motion.p>
        </div>

        {/* Amazon-style Grid (No prices, pure aesthetics) */}
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-sand-muted" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {frames.map((frame, idx) => (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Link href={`/shop/${frame.id}`} className="group block h-full">
                  <div className="bg-[#0a0a0a] border border-sand-border rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                    
                    <div className="aspect-[4/5] bg-white/60 relative overflow-hidden">
                      {frame.thumbnail_url ? (
                        <img 
                          src={frame.thumbnail_url} 
                          alt={frame.name} 
                          className="img-theme w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-sand-muted bg-sand-bg">
                          <span className="font-serif italic text-2xl opacity-30">No Image</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-sand-surface text-sand-text px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-serif capitalize lowercase">{frame.name}</h3>
                          <span className="text-xs uppercase tracking-widest text-sand-muted bg-black/5 px-2 py-1 rounded-sm">{frame.category}</span>
                        </div>
                        <p className="text-sand-muted line-clamp-2 capitalize lowercase">{frame.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {frames.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-sand-border rounded-3xl">
                <Store className="w-16 h-16 text-sand-muted mb-6" />
                {isAdmin ? (
                  <>
                    <h2 className="text-3xl font-serif text-sand-text mb-3">The Shop is Empty</h2>
                    <p className="text-sand-muted max-w-md">No frames have been listed yet. Please visit the Admin Panel to create your first frame product.</p>
                    <Link href="/admin/shop" className="mt-8 bg-sand-surface text-sand-text px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                      Go to Admin Panel
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-serif text-sand-text mb-3">New Collections Coming Soon</h2>
                    <p className="text-sand-muted max-w-md">We are currently curating our newest museum-quality frame collections. Please check back later.</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
