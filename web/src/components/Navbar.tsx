"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthState, logout } from "@/app/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Portfolio" },
  { href: "/shop", label: "Frame Shop" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean, user: any }>({ isAuthenticated: false, user: null });
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch auth state
    getAuthState().then((state) => {
      setAuthState(state);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuthState({ isAuthenticated: false, user: null });
    window.location.reload(); // Refresh to clear any secure states
  };

  const isDarkPage = pathname === "/" || pathname === "/gallery";
  const useDarkTheme = isDarkPage && !scrolled && !mobileMenuOpen;

  return (
    <>
      {/* ------------------- DESKTOP NAVBAR ------------------- */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-sand-surface/95 backdrop-blur-md border-b border-sand-border h-20 shadow-sm" : useDarkTheme ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent h-24" : "bg-transparent h-24"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50">
            <img src="/assets/logo.png" alt="Naren's Studio" className="h-8 w-8 object-cover opacity-90 group-hover:opacity-100 transition-opacity rounded-full shadow-sm" />
            <span className={`font-serif text-lg md:text-xl tracking-widest uppercase transition-colors leading-none ${useDarkTheme ? "text-white drop-shadow-md font-bold" : "text-sand-text"}`}>Naren&apos;s Studio</span>
          </Link>

          {/* Desktop Links */}
          <div className={`hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide transition-colors ${useDarkTheme ? "text-white" : "text-sand-text/80"}`}>
            {NAV_LINKS.map((link) => (
               <Link 
                 key={link.href} 
                 href={link.href} 
                 className={`transition-all py-1 leading-none hover:underline underline-offset-8 decoration-2 ${
                   useDarkTheme 
                     ? "text-white/85 hover:text-white decoration-amber-400 drop-shadow-sm" 
                     : "text-sand-muted hover:text-sand-text decoration-sand-text"
                 }`}
               >
                 {link.label}
               </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            {authState.isAuthenticated ? (
              <>
                <Link href={authState.user?.role === 'admin' ? '/admin' : '/dashboard'} className={`flex items-center gap-1.5 py-1 leading-none text-sm font-medium transition-colors ${useDarkTheme ? "text-amber-300 hover:text-white drop-shadow-sm" : "text-sand-accent hover:text-sand-text"}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={handleLogout} className={`flex items-center gap-1.5 py-1 leading-none text-sm font-medium transition-colors ${useDarkTheme ? "text-white/80 hover:text-white" : "text-sand-muted hover:text-sand-text"}`}>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link href="/login" className={`flex items-center gap-1.5 py-1 leading-none text-sm font-medium transition-colors ${useDarkTheme ? "text-white/85 hover:text-white drop-shadow-sm" : "text-sand-muted hover:text-sand-text"}`}>
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
            <Link href={authState.isAuthenticated ? "/book" : "/login?redirect=/book"} className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center leading-none ${useDarkTheme ? "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105" : "bg-sand-text text-sand-surface hover:opacity-90"}`}>
              <span>Book Session</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden relative z-50 p-2 transition-colors ${useDarkTheme ? "text-white" : "text-sand-text"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ------------------- MOBILE FULLSCREEN MENU ------------------- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-sand-surface flex flex-col pt-32 px-6 pb-10 overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-serif uppercase tracking-widest text-sand-muted hover:text-sand-text"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-full h-px bg-sand-border my-4" />
              
              {authState.isAuthenticated ? (
                <>
                  <Link href={authState.user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-sand-accent hover:text-sand-text flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-xl font-medium text-sand-muted hover:text-sand-text flex items-center justify-center gap-2 mt-4">
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-sand-muted hover:text-sand-text flex items-center justify-center gap-2">
                  <User className="w-5 h-5" /> Login
                </Link>
              )}
              
              <Link href={authState.isAuthenticated ? "/book" : "/login?redirect=/book"} onClick={() => setMobileMenuOpen(false)} className="bg-sand-text text-sand-surface px-8 py-4 rounded-full text-lg font-bold tracking-wide mx-auto mt-4 shadow-md hover:opacity-90 transition-opacity">
                Book Session
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
