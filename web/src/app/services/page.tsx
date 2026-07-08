"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Video,
  Plane,
  Sparkles,
  Award,
  Heart,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getServices } from "@/app/actions/services";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Camera,
  Plane,
  Sparkles,
  Award,
  Video,
  Wand2,
  Image: ImageIcon,
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getServices({ includeInactive: false });
      setServices(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-sand-bg text-sand-text pt-24 px-4 md:px-12 pb-24 font-sans selection:bg-yellow-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.3em] text-sand-muted mb-4 font-bold"
          >
            What We Do
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif tracking-tight mb-6 capitalize lowercase"
          >
            Our Services & Expertise
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sand-muted text-lg md:text-xl capitalize lowercase"
          >
            We combine state-of-the-art cinematic technology with classical artistic sensibilities to produce unforgettable visual art.
          </motion.p>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-black/5 border border-sand-border rounded-3xl p-12 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {services.map((service, idx) => {
              const IconComponent =
                ICON_MAP[service.icon_name] || Sparkles;
              const featureList = (service.features || "")
                .split("\n")
                .map((f: string) => f.trim())
                .filter(Boolean);

              return (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-black/5 border border-sand-border rounded-3xl p-8 md:p-12 hover:border-white/30 transition-all duration-500 backdrop-blur-md relative overflow-hidden group"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                    <div className="lg:max-w-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="p-3 rounded-2xl bg-sand-surface text-sand-text border border-sand-border">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <span className="text-xs uppercase tracking-widest text-sand-muted font-bold px-3 py-1 bg-black/5 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif mb-4 group-hover:text-gray-700 transition-colors capitalize lowercase">
                        {service.title}
                      </h2>
                      <p className="text-sand-muted text-lg leading-relaxed mb-8 capitalize lowercase">
                        {service.description}
                      </p>

                      {featureList.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-sand-muted mb-3">
                            Key Highlights
                          </h3>
                          {featureList.map((feat: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 text-sm md:text-base"
                            >
                              <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" />
                              <span className="capitalize lowercase">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between items-start lg:items-end border-t lg:border-t-0 lg:border-l border-sand-border pt-6 lg:pt-0 lg:pl-12 min-w-[280px]">
                      <div>
                        <span className="text-xs text-sand-muted uppercase tracking-wider block mb-1">
                          Investment
                        </span>
                        <span className="text-2xl font-serif font-bold text-sand-text">
                          {service.price}
                        </span>
                      </div>
                      <Link
                        href="/book"
                        className="mt-8 lg:mt-0 w-full lg:w-auto px-8 py-4 bg-sand-surface text-sand-text rounded-full font-bold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg"
                      >
                        <span>Book This Service</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-24 text-center bg-sand-surface border border-sand-border rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 capitalize lowercase">
            Have a custom project in mind?
          </h2>
          <p className="text-sand-muted max-w-xl mx-auto mb-8 capitalize lowercase">
            We love tackling creative challenges and unconventional assignments. Contact our production team to discuss your custom vision.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg"
            >
              Contact Studio
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 bg-transparent border border-sand-border text-sand-text rounded-full font-bold hover:bg-black/5 transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
