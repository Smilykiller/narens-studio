"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, MapPin, Building, Hash, Loader2 } from "lucide-react";
// import { handleAuthAction } from "@/app/actions/authActions"; // Will create this

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, title = "Sign In Required", subtitle = "Please sign in or create an account to continue." }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("action", isLogin ? "login" : "register");

    try {
      // Dynamic import to avoid SSR issues if needed, or just normal fetch
      const { handleAuthAction } = await import("@/app/actions/auth");
      const result = await handleAuthAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        onSuccess(result.user);
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111] border border-sand-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-sand-border shrink-0">
                <div>
                  <h2 className="text-2xl font-serif">{title}</h2>
                  <p className="text-sand-muted text-sm mt-1">{subtitle}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-sand-muted" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex gap-2 p-1 bg-black/5 rounded-xl mb-2">
                    <button
                      type="button"
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLogin ? "bg-sand-surface text-sand-text" : "text-sand-muted hover:text-sand-text"}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsLogin(false); setError(null); }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isLogin ? "bg-sand-surface text-sand-text" : "text-sand-muted hover:text-sand-text"}`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {!isLogin && (
                    <>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="Full Name"
                          className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="Phone Number"
                          className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email Address"
                      className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Password"
                      className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 w-5 h-5 text-sand-muted" />
                        <textarea
                          name="address"
                          required
                          placeholder="Delivery Address"
                          rows={2}
                          className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors resize-none"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                          <input
                            type="text"
                            name="city"
                            required
                            placeholder="City"
                            className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>
                        <div className="relative flex-1">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                          <input
                            type="text"
                            name="pincode"
                            required
                            placeholder="Pincode"
                            className="w-full bg-black/5 border border-sand-border rounded-xl py-3 pl-12 pr-4 text-sand-text placeholder:text-sand-muted focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-sand-surface text-sand-text font-semibold rounded-xl mt-4 hover:bg-gray-200 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
