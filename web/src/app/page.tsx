"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import { ArrowRight, Camera, Image as ImageIcon, Store, Star, Sparkles, Sliders, Eye, ChevronLeft, ChevronRight, CheckCircle2, Award, Play, Pause, Maximize2, Minimize2, Film } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { getHomeData } from "@/app/actions/home";

const outfit = Outfit({ subsets: ["latin"], weight: ["200", "300", "400", "500", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["italic", "normal"] });

// Sample fallback images if admin hasn't uploaded enough
const FALLBACK_HEROES = [
  {
    id: "h1",
    url: "https://images.unsplash.com/photo-1511899750625-54050d07fa81?w=1600&q=80",
    title: "The Royal Symphony",
    category: "Wedding Documentary",
    exif: "Phase One IQ4 150MP • 80mm f/1.4 • ISO 64 • 1/2000s"
  },
  {
    id: "h2",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=80",
    title: "Vogue & Velvet",
    category: "High-Fashion Editorial",
    exif: "Hasselblad H6D-100c • 100mm f/2.2 • ISO 100 • 1/1250s"
  },
  {
    id: "h3",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80",
    title: "Shadows of Elegance",
    category: "Commercial Portraiture",
    exif: "Leica S3 • 70mm f/2.5 • ISO 50 • 1/800s"
  },
  {
    id: "h4",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&q=80",
    title: "Golden Hour Glow",
    category: "Fine Art Cinematography",
    exif: "Arri Alexa Mini LF • 35mm T1.5 • ISO 800 • 24fps"
  }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [data, setData] = useState<any>({ packages: [], showcasePhotos: [], heroImages: [] });
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive Retouching Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHomeData().then(res => {
      if (res.success) setData(res as any);
    });
  }, []);

  const activeHeroes = data.heroImages && data.heroImages.length > 0
    ? data.heroImages.map((img: any, i: number) => ({
        id: img.id || `custom-${i}`,
        url: img.url,
        title: img.title || FALLBACK_HEROES[i % FALLBACK_HEROES.length].title,
        category: img.category || FALLBACK_HEROES[i % FALLBACK_HEROES.length].category,
        exif: FALLBACK_HEROES[i % FALLBACK_HEROES.length].exif
      }))
    : FALLBACK_HEROES;

  useEffect(() => {
    if (activeHeroes.length > 1 && isPlaying && !isFullscreen) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % activeHeroes.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [activeHeroes.length, isPlaying, isFullscreen]);

  const handleNextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % activeHeroes.length);
  };

  const handlePrevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + activeHeroes.length) % activeHeroes.length);
  };

  // Slider dragging logic
  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  return (
    <main className="min-h-screen bg-[#F5F2EB] text-[#1A1815] selection:bg-[#1A1815] selection:text-[#F5F2EB] font-sans overflow-x-hidden">
      <Navbar />

      {/* =========================================================================
          1. THE AWESOME CINEMATIC HERO SECTION
      ========================================================================= */}
      <section className="group relative min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden bg-[#0D0C0A] text-white">
        
        {/* Fullscreen Hero Background with Ken Burns Zoom & Smooth Crossfade */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeHeroes[currentHeroIndex].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeHeroes[currentHeroIndex].url}
                alt="Studio Masterpiece"
                className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.1]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Luxury Gradient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C0A] via-[#0D0C0A]/40 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(13,12,10,0.8)_100%)] pointer-events-none" />
        </div>

        {/* Center Hero Content (All elements in normal document flow so they can never overlap!) */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 w-full flex flex-col items-start justify-center">
          
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center gap-3 md:gap-4 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-widest uppercase font-semibold text-amber-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Studio Active — 2026 / 2027 Open</span>
            </div>
            
            <span className="hidden sm:inline text-white/30">•</span>

            <div className="flex items-center gap-2 text-xs sm:text-sm tracking-[0.25em] uppercase font-bold text-neutral-200">
              <span className="h-[1px] w-8 bg-amber-400" />
              <span className="text-amber-300">{activeHeroes[currentHeroIndex].category}</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-tight leading-[0.9] text-white mb-6 drop-shadow-2xl ${cormorant.className}`}
          >
            Naren&apos;s Studio
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="max-w-3xl mb-12 space-y-6"
          >
            {/* Magazine Editorial Statement Layout */}
            <div className="relative pl-5 sm:pl-6 border-l-2 border-amber-400/80 space-y-2">
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-white leading-snug drop-shadow-lg">
                Where high-fashion direction meets <span className={`font-serif italic font-normal text-amber-300 ${cormorant.className}`}>documentary soul.</span>
              </p>
              <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-light tracking-wide leading-relaxed max-w-2xl">
                An exclusive solo atelier preserving life&apos;s most transcendent celebrations through cinematic motion, architectural symmetry, and museum-grade archival prints.
              </p>
            </div>

            {/* Interactive Atelier Capabilities Micro-Grid */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
              <div className="group px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition-all text-[11px] tracking-wider uppercase text-neutral-300 hover:text-amber-300 flex items-center gap-2 shadow-sm cursor-default">
                <Film className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>8K Cinema Motion</span>
              </div>
              <div className="group px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition-all text-[11px] tracking-wider uppercase text-neutral-300 hover:text-amber-300 flex items-center gap-2 shadow-sm cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>100-Year Pigment Inks</span>
              </div>
              <div className="group px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition-all text-[11px] tracking-wider uppercase text-neutral-300 hover:text-amber-300 flex items-center gap-2 shadow-sm cursor-default">
                <Sliders className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Master Log Grading</span>
              </div>
              <div className="group px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition-all text-[11px] tracking-wider uppercase text-neutral-300 hover:text-amber-300 flex items-center gap-2 shadow-sm cursor-default">
                <Award className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Solo Authorship</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto"
          >
            <Link 
              href="/book" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-[0.2em] uppercase transition-all bg-amber-400 text-black rounded-full overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:bg-amber-300 hover:scale-105"
            >
              <span>Reserve Studio Date</span>
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/gallery" 
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-[0.2em] uppercase transition-all bg-white/10 text-white border border-white/30 rounded-full backdrop-blur-md hover:bg-white hover:text-black"
            >
              Explore Portfolio
            </Link>
          </motion.div>
        </div>

        {/* Left Edge Hover Carousel Control */}
        <button
          onClick={handlePrevHero}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3.5 sm:p-4 bg-black/40 hover:bg-amber-400 text-white hover:text-black border border-white/20 hover:border-amber-400 rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 shadow-2xl pointer-events-auto cursor-pointer"
          aria-label="Previous Hero Image"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Right Edge Hover Carousel Control */}
        <button
          onClick={handleNextHero}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3.5 sm:p-4 bg-black/40 hover:bg-amber-400 text-white hover:text-black border border-white/20 hover:border-amber-400 rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 shadow-2xl pointer-events-auto cursor-pointer"
          aria-label="Next Hero Image"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </section>

      {/* =========================================================================
          2. THE MASTER'S TOUCH: INTERACTIVE BEFORE/AFTER RETOUCHING SLIDER
      ========================================================================= */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-widest text-amber-700 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Post-Production Mastery</span>
          </div>
          <h2 className={`text-4xl md:text-6xl font-serif tracking-tight mb-4 text-[#1A1815] ${cormorant.className}`}>
            The Art of Color & Light
          </h2>
          <p className="text-neutral-600 text-base md:text-lg">
            We don't just take photographs; we sculpt them. Drag the slider below to compare raw cinema log footage against our master museum-grade color calibration.
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div 
          ref={sliderRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl cursor-ew-resize select-none border-4 border-white"
        >
          {/* AFTER IMAGE (Full width background) */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=80"
            alt="Master Retouched"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute top-6 right-6 z-10 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 pointer-events-none whitespace-nowrap w-max flex items-center gap-1.5 shadow-md">
            <span>✨ Master Graded & Retouched</span>
          </div>

          {/* BEFORE IMAGE (Clipped on top) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=80"
              alt="Raw Capture"
              className="absolute inset-0 w-full h-full object-cover filter grayscale-[40%] contrast-75 brightness-90 max-w-none"
              style={{ width: sliderRef.current ? sliderRef.current.clientWidth : '100vw' }}
            />
            <div className="absolute top-6 left-6 z-10 bg-black/70 backdrop-blur-md text-gray-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 whitespace-nowrap w-max flex items-center gap-1.5 shadow-md">
              <span>📷 Raw Studio Log Profile</span>
            </div>
          </div>

          {/* THE DRAGGER BAR */}
          <div
            className="absolute inset-y-0 w-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg border-2 border-white">
              <Sliders className="w-5 h-5 rotate-90" />
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-xs font-mono uppercase tracking-widest text-neutral-500">
          ← Drag horizontally to inspect frequency separation and color grading →
        </div>
      </section>

      {/* =========================================================================
          3. CURATED WORKS (MASONRY GRID PREVIEW)
      ========================================================================= */}
      <section className="py-20 bg-[#0F0E0C] text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-2">Portfolio Showcase</div>
              <h2 className={`text-4xl md:text-6xl font-serif tracking-tight ${cormorant.className}`}>
                Selected Masterpieces
              </h2>
            </div>
            <Link 
              href="/gallery" 
              className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-amber-300 hover:text-white transition-colors group"
            >
              <span>View Full Archive (500+ Shoots)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data.showcasePhotos && data.showcasePhotos.length > 0 
              ? data.showcasePhotos.slice(0, 6) 
              : FALLBACK_HEROES
            ).map((photo: any, i: number) => (
              <motion.div
                key={photo.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 ${
                  i === 0 ? "md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto" : "aspect-[4/5]"
                }`}
              >
                <img
                  src={photo.url}
                  alt="Curated Work"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <span className="text-xs uppercase tracking-widest font-mono text-amber-300 mb-1">
                    {photo.category || "Signature Collection"}
                  </span>
                  <h3 className={`text-2xl md:text-3xl font-serif text-white ${cormorant.className}`}>
                    {photo.title || `Editorial Series #${i + 1}`}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. THE LIVE TETHERED STUDIO EXPERIENCE
      ========================================================================= */}
      <section className="py-24 md:py-36 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5">
            <div className="text-xs font-bold tracking-[0.3em] uppercase text-amber-700 mb-4">Innovation in Art</div>
            <h2 className={`text-4xl md:text-6xl font-serif tracking-tight text-[#1A1815] mb-6 ${cormorant.className}`}>
              Real-Time Tethered Proofing
            </h2>
            <p className="text-neutral-600 leading-relaxed text-lg mb-8">
              Experience the future of studio photography. As our shutters click on set, high-resolution watermarked proofs are instantly transmitted wirelessly to your iPad or smartphone.
            </p>
            <div className="space-y-4 mb-10">
              {[
                "Instant QR code guest gallery access at live events",
                "Interactive Yes / Maybe / No photo selection room",
                "Direct retouching instruction notes attached to individual pixels"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[#1A1815] font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-4 bg-[#1A1815] text-white rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all shadow-lg"
            >
              Test Client Portal Demo
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl flex flex-col justify-between aspect-square hover:border-amber-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-[#1A1815] mb-2">Phase One & Arri Tech</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  We deploy 150-megapixel medium format cameras and cinema-grade lighting rigs for uncompromised fidelity.
                </p>
              </div>
            </div>

            <div className="bg-[#1A1815] text-white p-8 rounded-3xl border border-neutral-800 shadow-xl flex flex-col justify-between aspect-square sm:translate-y-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">The Selection Room</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Curate your final album from the comfort of your home with our bespoke interactive feedback portal.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. INVESTMENT COLLECTIONS (WITH STRICT CAPITALIZE LOWERCASE)
      ========================================================================= */}
      <section className="py-24 md:py-32 bg-[#EBE7DF] border-y border-neutral-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="text-xs font-bold tracking-[0.3em] uppercase text-amber-800 mb-3">Transparent Investment</div>
            <h2 className={`text-4xl md:text-6xl font-serif tracking-tight text-[#1A1815] ${cormorant.className}`}>
              Curated Studio Packages
            </h2>
            <p className="text-neutral-600 mt-4">
              Select an option below to initiate a booking reservation or request a tailored scope of work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.packages && data.packages.length > 0 ? data.packages.map((pkg: any, i: number) => (
              <motion.div 
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`p-10 rounded-3xl flex flex-col justify-between transition-all duration-500 relative ${
                  i === 1 
                    ? "bg-[#1A1815] text-white shadow-2xl scale-105 border-2 border-amber-500/50" 
                    : "bg-white text-[#1A1815] border border-neutral-200 hover:shadow-xl"
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-4 right-8 bg-amber-400 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Requested
                  </div>
                )}
                
                <div>
                  <div className={`text-xs uppercase tracking-widest font-mono mb-2 ${i === 1 ? "text-amber-400" : "text-amber-700"}`}>
                    Collection 0{i + 1}
                  </div>
                  <h3 className={`text-3xl font-serif mb-6 capitalize lowercase ${i === 1 ? "text-white" : "text-[#1A1815]"} ${cormorant.className}`}>
                    {pkg.name}
                  </h3>
                  <div className="text-4xl sm:text-5xl font-light mb-8 font-serif">
                    ₹{pkg.price?.toLocaleString()}
                  </div>
                  
                  <div className={`border-t pt-8 mb-10 ${i === 1 ? "border-white/15" : "border-neutral-200"}`}>
                    <p className={`text-sm whitespace-pre-line leading-relaxed capitalize lowercase ${i === 1 ? "text-neutral-300" : "text-neutral-600"}`}>
                      {pkg.limits || "customized scope of work"}
                    </p>
                  </div>
                </div>
                
                <Link 
                  href="/book" 
                  className={`w-full py-4 rounded-xl font-bold text-xs tracking-[0.2em] uppercase text-center transition-all flex items-center justify-center gap-2 ${
                    i === 1 
                      ? "bg-amber-400 text-black hover:bg-amber-300 shadow-lg" 
                      : "bg-[#1A1815] text-white hover:bg-neutral-800"
                  }`}
                >
                  <span>Inquire For This Package</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-neutral-200 text-neutral-500">
                Studio packages are being updated. Contact us directly for rates.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. GRAND EDITORIAL FOOTER & CALL TO ACTION
      ========================================================================= */}
      <footer className="bg-[#0D0C0A] text-white pt-24 md:pt-36 pb-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-b border-white/15 pb-20">
            
            <div className="lg:col-span-7">
              <div className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-6">Let&apos;s Create Something Immortal</div>
              <h2 className={`text-5xl sm:text-7xl md:text-8xl font-serif tracking-tight leading-none mb-10 ${cormorant.className}`}>
                Ready to Tell Your Story?
              </h2>
              <Link 
                href="/book" 
                className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-5 rounded-full hover:bg-amber-400 hover:scale-105 transition-all shadow-xl"
              >
                <span>Initiate Booking Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="lg:col-span-2 lg:col-start-9">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-6">Navigation</h4>
              <ul className="space-y-4 text-sm text-neutral-300 font-light">
                <li><Link href="/gallery" className="hover:text-amber-300 transition-colors">Portfolio Archive</Link></li>
                <li><Link href="/services" className="hover:text-amber-300 transition-colors">Our Services</Link></li>
                <li><Link href="/shop" className="hover:text-amber-300 transition-colors">Frame Shop</Link></li>
                <li><Link href="/about" className="hover:text-amber-300 transition-colors">The Artist</Link></li>
                <li><Link href="/login" className="hover:text-amber-300 transition-colors">Client Portal Login</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 text-sm text-neutral-300 font-light">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-6">Studio Location</h4>
              <p className="mb-4 leading-relaxed">Naren&apos;s Studio Atelier<br/>123 Photography Lane<br/>Creative District, 10001</p>
              <p className="mb-2 font-mono text-white">+1 (555) 123-4567</p>
              <p className="text-amber-300 font-mono">hello@narensstudio.com</p>
            </div>

          </div>

          <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-neutral-500 uppercase tracking-[0.2em]">
            <p>&copy; {new Date().getFullYear()} Naren&apos;s Studio. All Rights Reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Vimeo Cinema</a>
              <a href="#" className="hover:text-white transition-colors">Behance</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}
