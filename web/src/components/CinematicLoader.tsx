"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Outfit } from "next/font/google";
import { useEffect, useState } from "react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600", "800"] });

interface CinematicLoaderProps {
  isLoading: boolean;
  text?: string;
}

export default function CinematicLoader({ isLoading }: CinematicLoaderProps) {
  const [show, setShow] = useState(isLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setShow(isLoading);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "brightness(5) blur(10px)", transition: { duration: 0.6, ease: "easeIn" } }}
          className={`fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center pointer-events-none px-4 text-center overflow-hidden ${outfit.className}`}
        >
          {/* Deep Cinematic Vignette & Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.08)_0%,rgba(0,0,0,1)_70%)]" />

          {/* Anamorphic Lens Flare (Sweeping horizontal light) */}
          <motion.div 
            className="absolute top-1/2 left-0 right-0 h-[2px] bg-blue-400/20 mix-blend-screen"
            animate={{ 
              opacity: [0, 0.5, 0],
              scaleX: [0.5, 1.5, 0.5],
              translateY: ["-50%", "-50%"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "blur(4px) drop-shadow(0 0 20px rgba(59,130,246,0.8))" }}
          />

          {/* Floating Dust Particles */}
          {mounted && [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-sand-surface rounded-full opacity-20"
              initial={{ 
                left: Math.random() * 100 + "%", 
                top: Math.random() * 100 + "%",
                scale: Math.random() * 2 
              }}
              animate={{ 
                y: [0, Math.random() * -300],
                x: [0, (Math.random() - 0.5) * 150],
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 4 + Math.random() * 6, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ filter: "blur(2px)" }}
            />
          ))}

          {/* Focus Pull Wrapper */}
          <motion.div 
            initial={{ filter: "blur(20px)", scale: 1.2 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center z-10 w-full"
          >
            
            {/* Viewfinder HUD Reticles (Corners) */}
            <div className="absolute inset-0 w-64 h-64 m-auto pointer-events-none opacity-30">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60" />
            </div>

            {/* Complex Lens Assembly Container */}
            <div className="relative flex items-center justify-center w-48 h-48 mb-8">
              
              {/* Outer Thin Ring (Clockwise) */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-sand-border"
              />

              {/* Middle Dashed Ring (Counter-Clockwise) */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-dashed border-sand-border"
              />

              {/* Inner Glowing Action Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-t-2 border-r-2 border-transparent border-t-[#FF6B00]"
                style={{ filter: "drop-shadow(0 0 15px rgba(255,107,0,0.9))" }}
              />
              
              {/* Core Pulsing Logo */}
              <motion.img 
                src="/assets/logo.png"
                alt="Loading..."
                animate={{ 
                  scale: [0.95, 1.05, 0.95], 
                  opacity: [0.8, 1, 0.8],
                  filter: [
                    "drop-shadow(0 0 10px rgba(255,107,0,0.3))", 
                    "drop-shadow(0 0 30px rgba(255,107,0,0.8))", 
                    "drop-shadow(0 0 10px rgba(255,107,0,0.3))"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-auto relative z-10 rounded-full"
              />
            </div>

            {/* Cinematic Sweeping Text Reveal */}
            <motion.div
              animate={{ letterSpacing: ["0.2em", "0.5em", "0.2em"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <h2 
                className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-white/30 via-white to-white/30"
                style={{
                  backgroundSize: "200% auto",
                  animation: "shine 3s linear infinite",
                  textShadow: "0 0 30px rgba(255,255,255,0.4)"
                }}
              >
                Naren's Studio
              </h2>
            </motion.div>
            
            {/* Minimal Subtext with Blinking Cursor */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-6 flex items-center gap-2 text-[#FF6B00] text-xs font-mono tracking-widest uppercase"
            >
              <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-ping" />
              System Initializing
            </motion.div>

          </motion.div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shine {
              to { background-position: 200% center; }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
