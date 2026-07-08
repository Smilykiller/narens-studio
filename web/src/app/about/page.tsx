"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Camera, 
  Award, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Eye, 
  Sliders, 
  HeartHandshake, 
  Film, 
  Zap, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Cormorant_Garamond, Outfit } from "next/font/google";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"] 
});

export default function AboutPage() {
  return (
    <main className={`min-h-screen bg-sand-bg text-[#1A1815] selection:bg-amber-400 selection:text-black font-sans overflow-x-hidden ${outfit.className}`}>
      
      {/* ------------------- UNIVERSAL NAVBAR ------------------- */}
      <Navbar />

      {/* =========================================================================
          1. EDITORIAL LIGHT THEME HERO (No dark background, no muddy gradient cuts!)
      ========================================================================= */}
      <section className="pt-36 md:pt-44 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-300 text-xs md:text-sm tracking-[0.25em] uppercase font-bold text-amber-800 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Established 2016 • Exclusive Solo Atelier</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-tight text-[#1A1815] mb-6 leading-[0.9] ${cormorant.className}`}
        >
          The Architecture <br className="hidden sm:inline" />
          <span className="text-amber-800 italic font-normal">of Memory.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl font-light text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-16"
        >
          A dedicated solo atelier where personal craftsmanship, artistic integrity, and museum-grade preservation converge without compromise.
        </motion.p>

        {/* Gallery Exhibition Showcase Piece (Replaces harsh black hero!) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative max-w-6xl mx-auto bg-white p-3 sm:p-6 rounded-[2.5rem] shadow-2xl border border-neutral-300 overflow-hidden group"
        >
          <div className="relative h-[50vh] md:h-[65vh] w-full rounded-3xl overflow-hidden bg-neutral-100">
            <Image 
              src="/assets/real_camera.png" 
              alt="Atelier Camera Exhibition" 
              fill
              priority
              className="object-cover object-center filter sepia-[0.1] contrast-[1.05] group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-left text-white z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-black text-[10px] uppercase font-bold tracking-widest mb-2">
                  Optical Excellence
                </span>
                <h3 className={`text-2xl md:text-4xl font-serif text-white ${cormorant.className}`}>
                  Medium Format Cinema & Stills Arsenal
                </h3>
              </div>
              <p className="text-xs md:text-sm text-neutral-200 max-w-xs font-light">
                Every frame captured with museum-grade glass and calibrated color profiles.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          2. THE SOLO ARTIST ATELIER & FOUNDER BIOGRAPHY
      ========================================================================= */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Founder Portrait Card */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-300 bg-white p-4 group"
            >
              <div className="relative h-[500px] sm:h-[600px] w-full rounded-2xl overflow-hidden bg-neutral-200">
                <Image 
                  src="/assets/cinematic_portrait.png" 
                  alt="Naren - Founder & Solo Master Photographer" 
                  fill
                  className="object-cover object-top filter contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest mb-2">
                    Founder & Director
                  </div>
                  <h3 className={`text-3xl font-serif text-white mb-1 ${cormorant.className}`}>Naren</h3>
                  <p className="text-xs text-neutral-300 uppercase tracking-widest font-medium">Solo Master Photographer</p>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative Studio Seal */}
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center justify-center w-28 h-28 rounded-full bg-amber-600 text-white shadow-xl border-4 border-sand-bg rotate-12">
              <div className="text-center">
                <span className="block text-[10px] font-bold tracking-widest uppercase">Est.</span>
                <span className={`text-2xl font-serif font-bold ${cormorant.className}`}>2016</span>
              </div>
            </div>
          </div>

          {/* Right Column: The Solo Artist Promise */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-300 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>The Solo Artist Promise</span>
            </div>

            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight text-[#1A1815] leading-[1.05] ${cormorant.className}`}>
              "When you commission this studio, you get my undivided craft."
            </h2>

            <div className="space-y-6 text-base sm:text-lg text-neutral-700 font-light leading-relaxed">
              <p>
                In an era dominated by high-volume agencies that outsource shooting to rotating associate photographers and automated editing filters, Naren's Studio was founded on a singular principle: <strong className="font-medium text-[#1A1815]">uncompromising personal authorship</strong>.
              </p>
              <p>
                Every wedding, editorial campaign, and family portrait commissioned through this atelier is personally directed, photographed, and master-graded by Naren himself. There are no second teams, no delegated edits, and no assembly-line shortcuts.
              </p>
              <p className="italic text-neutral-800 font-normal border-l-2 border-amber-600 pl-4 py-1">
                "Photography is not merely about recording visual facts; it is the art of translating emotional atmosphere into permanent, physical artifacts that gain soul and gravity with each passing decade."
              </p>
            </div>

            {/* Solo Milestones Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-300">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm text-center">
                <span className={`block text-3xl md:text-4xl font-serif font-bold text-amber-800 ${cormorant.className}`}>10+</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Years Solo Craft</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm text-center">
                <span className={`block text-3xl md:text-4xl font-serif font-bold text-amber-800 ${cormorant.className}`}>500+</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Commissions</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm text-center">
                <span className={`block text-3xl md:text-4xl font-serif font-bold text-amber-800 ${cormorant.className}`}>100%</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Archival Grade</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm text-center">
                <span className={`block text-3xl md:text-4xl font-serif font-bold text-amber-800 ${cormorant.className}`}>8K RAW</span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mt-1 block">Cinema Quality</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="px-8 py-4 rounded-full bg-[#1A1815] text-white font-medium text-sm tracking-wider uppercase hover:bg-amber-800 transition-all shadow-md flex items-center gap-3 group"
              >
                <span>Explore Commissions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 rounded-full bg-white border border-neutral-300 text-[#1A1815] font-medium text-sm tracking-wider uppercase hover:bg-neutral-100 transition-all shadow-sm"
              >
                View Selected Works
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          3. CREATIVE ETHOS & PHILOSOPHY (Luxury White Cards in Light Theme)
      ========================================================================= */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-neutral-300">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-300 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-sm mb-4">
            <Star className="w-3.5 h-3.5 text-amber-600" />
            <span>The Four Pillars of Craft</span>
          </div>
          <h2 className={`text-4xl sm:text-6xl font-serif tracking-tight text-[#1A1815] mb-6 ${cormorant.className}`}>
            Our Creative Ethos
          </h2>
          <p className="text-neutral-600 text-base md:text-lg font-light leading-relaxed">
            We reject ephemeral trends in favor of timeless editorial beauty. Here is how Naren ensures every commission transcends ordinary photography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-lg hover:shadow-2xl hover:border-amber-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sand-bg border border-neutral-300 flex items-center justify-center text-amber-800 mb-8 shadow-inner">
                <Award className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif text-[#1A1815] mb-4 ${cormorant.className}`}>
                1. Museum-Grade Archival Preservation
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed text-base">
                Your imagery is mastered specifically for physical permanence. We calibrate our digital workflows for 100-year pigment inks on Italian cotton rag paper, ensuring your heirlooms never yellow or fade across generations.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Certified 100-Year Permanence</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-lg hover:shadow-2xl hover:border-amber-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sand-bg border border-neutral-300 flex items-center justify-center text-amber-800 mb-8 shadow-inner">
                <Sun className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif text-[#1A1815] mb-4 ${cormorant.className}`}>
                2. Cinematic Hollywood Lighting Rigs
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed text-base">
                We do not rely solely on unpredictable ambient weather. Naren deploys portable Arri Skypanels and Profoto studio strobes with directional softboxes on location, sculpting dimensional light that emulates Vogue editorial spreads.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Profoto & Arri Lighting Ecosystem</span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-lg hover:shadow-2xl hover:border-amber-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sand-bg border border-neutral-300 flex items-center justify-center text-amber-800 mb-8 shadow-inner">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif text-[#1A1815] mb-4 ${cormorant.className}`}>
                3. Real-Time Tethered Proofing
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed text-base">
                During commercial and editorial sessions, Naren transmits raw captures wirelessly to calibrated iPad Pro monitors in real-time. This invites instantaneous collaboration, allowing you to approve composition and expression on the spot.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Instant Wireless Collaboration</span>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-lg hover:shadow-2xl hover:border-amber-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sand-bg border border-neutral-300 flex items-center justify-center text-amber-800 mb-8 shadow-inner">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif text-[#1A1815] mb-4 ${cormorant.className}`}>
                4. Unobtrusive Grandeur
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed text-base">
                We balance high-fashion editorial direction with documentary grace. Naren guides you through natural, effortless movement without stiff posing, ensuring the genuine atmosphere and spontaneous emotion of your celebration shine through.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Documentary Sensitivity & Elegance</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          4. OPTICAL ARSENAL & SHOWROOM (Styled in Warm Alabaster Light Theme!)
      ========================================================================= */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-neutral-300">
        <div className="bg-[#EAE6DD] rounded-[3rem] p-8 sm:p-14 md:p-20 border border-neutral-300 shadow-xl relative overflow-hidden">
          
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-300 text-xs font-bold uppercase tracking-widest text-amber-800 mb-4 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>World-Class Technology</span>
            </div>
            <h2 className={`text-4xl sm:text-6xl font-serif tracking-tight text-[#1A1815] mb-6 ${cormorant.className}`}>
              The Optical Arsenal
            </h2>
            <p className="text-neutral-600 text-base md:text-lg font-light leading-relaxed">
              We never compromise on equipment. Naren utilizes premier medium-format glass and cinema sensors to capture unrivaled dynamic range and micro-contrast.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-neutral-300 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">01 / Medium Format</span>
              <h4 className={`text-xl font-serif text-[#1A1815] mb-2 ${cormorant.className}`}>Hasselblad & Phase One</h4>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                100-megapixel sensors delivering breathtaking color depth, unmatched skin tones, and razor-sharp clarity for billboard-scale prints.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-300 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">02 / Cinema Motion</span>
              <h4 className={`text-xl font-serif text-[#1A1815] mb-2 ${cormorant.className}`}>Sony Cinema Line & RED</h4>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                8K raw video capture with 16-stop dynamic range, ensuring your wedding films look like theatrical Hollywood productions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-300 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">03 / Studio Lighting</span>
              <h4 className={`text-xl font-serif text-[#1A1815] mb-2 ${cormorant.className}`}>Profoto & Arri Rigs</h4>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Battery-powered studio strobes and continuous Skypanels deployed on location for dimensional, magazine-quality lighting anywhere.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-300 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">04 / Color Science</span>
              <h4 className={`text-xl font-serif text-[#1A1815] mb-2 ${cormorant.className}`}>Custom Log Grading</h4>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Proprietary color LUTs and DaVinci Resolve color pipelines tailored specifically to preserve warm, true-to-life Indian skin tones.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CONSULTATION CALL TO ACTION & LUXURY FOOTER
      ========================================================================= */}
      <section className="py-20 md:py-28 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-10 md:p-16 border border-neutral-300 shadow-2xl relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-3 block">
            Begin Your Legacy
          </span>
          <h2 className={`text-3xl sm:text-5xl font-serif text-[#1A1815] mb-4 ${cormorant.className}`}>
            Commission Naren for Your Celebration
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto mb-8 font-light text-sm sm:text-base">
            Because we operate as an exclusive solo atelier, we accept a strictly limited number of commissions per season to maintain uncompromising artistic quality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="px-8 py-4 rounded-full bg-[#1A1815] text-white font-medium text-sm tracking-wider uppercase hover:bg-amber-800 transition-all shadow-lg flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Check 2026 / 2027 Availability</span>
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 rounded-full bg-sand-bg border border-neutral-300 text-[#1A1815] font-medium text-sm tracking-wider uppercase hover:bg-neutral-200 transition-all"
            >
              Explore Selected Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Minimalist Footer */}
      <footer className="border-t border-neutral-300 py-12 px-6 text-center text-xs text-neutral-500 font-light">
        <p>© {new Date().getFullYear()} Naren's Studio. All rights reserved. • Exclusive Solo Master Atelier</p>
      </footer>

    </main>
  );
}
