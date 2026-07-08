"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleAuthAction, verifyOTP } from "@/app/actions/auth";
import CinematicLoader from "@/components/CinematicLoader";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("+91 ");
  const [otpSent, setOtpSent] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "signup") {
      setIsSignUp(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("action", isSignUp ? "register" : "login");

    try {
      const result = await handleAuthAction(formData);
      
      if (result.error) {
        if (result.error.includes("user does not exist")) {
          setError("Account not found. Please create an account below.");
          setIsSignUp(true);
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      if (result.requireOtp) {
        setOtpSent(true);
        setEmailForOtp(result.email!);
        setMessage("Verification code sent to your email.");
        setLoading(false);
        return;
      }



      // Success! Redirect based on URL param or role
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (result.user?.role === "admin") {
        router.push("/admin/portfolio");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("email", emailForOtp);

    try {
      const result = await verifyOTP(formData);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <CinematicLoader isLoading={loading} text="Authenticating..." />
      <main className="min-h-screen bg-transparent text-sand-text flex flex-col md:flex-row font-sans">
      {/* Left Column - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img 
          src="/assets/cinematic_wedding.png" 
          alt="Client Login Background" 
          className="img-theme absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="font-serif text-4xl mb-4 text-sand-text">Your Memories, Secured.</h2>
          <p className="text-neutral-700">Log in to view your private galleries, download high-res files, and select prints.</p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sand-muted hover:text-sand-text transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-6 border border-sand-border">
              <User className="w-6 h-6 text-sand-text" />
            </div>
            
            <div className="flex gap-6 mb-8 border-b border-sand-border pb-4">
              <button 
                type="button"
                onClick={() => { setIsSignUp(false); setError(""); }}
                className={`text-2xl font-serif transition-all relative ${!isSignUp ? "text-sand-text" : "text-neutral-400 hover:text-sand-muted"}`}
              >
                Login
                {!isSignUp && <motion.div layoutId="underline" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-sand-surface" />}
              </button>
              <button 
                type="button"
                onClick={() => { setIsSignUp(true); setError(""); }}
                className={`text-2xl font-serif transition-all relative ${isSignUp ? "text-sand-text" : "text-neutral-400 hover:text-sand-muted"}`}
              >
                Sign Up
                {isSignUp && <motion.div layoutId="underline" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-sand-surface" />}
              </button>
            </div>

            <p className="text-sand-muted mb-8">
              {isSignUp ? "Fill in your details to create your client profile." : "Enter your email and password to access your dashboard."}
            </p>

            {otpSent ? (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Verification Code</label>
                  <input 
                    name="code"
                    required 
                    placeholder="Enter 6-digit code"
                    className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-sand-text focus:border-sand-border transition-colors outline-none font-mono shadow-sm" 
                    maxLength={6}
                  />
                  <p className="text-sand-muted text-sm mt-2">
                    We sent a code to <span className="text-sand-text">{emailForOtp}</span>
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-sand-surface text-sand-text font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Log In
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sand-muted hover:text-sand-text text-sm transition-colors mt-4"
                >
                  Back to Sign Up
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-6">
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Full Name</label>
                      <input name="fullName" required placeholder="John Doe" className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:border-sand-border shadow-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        name="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required 
                        placeholder="+91 9876543210" 
                        className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:border-sand-border shadow-sm outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Address</label>
                        <input name="address" required placeholder="123 Studio Street" className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:border-sand-border shadow-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">City</label>
                        <input name="city" required placeholder="New York" className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:border-sand-border shadow-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Pincode</label>
                        <input name="pincode" required placeholder="10001" className="w-full bg-black/50 border border-sand-border rounded-xl px-4 py-4 text-sand-text focus:border-sand-border shadow-sm outline-none" />
                      </div>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                    <input 
                      type="email" 
                      name="email"
                      required 
                      placeholder="you@example.com"
                      className="w-full bg-black/50 border border-sand-border rounded-xl pl-12 pr-4 py-4 text-sand-text focus:border-sand-border transition-colors outline-none shadow-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-sand-muted uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-muted" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required 
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-sand-border rounded-xl pl-12 pr-12 py-4 text-sand-text focus:border-sand-border transition-colors outline-none shadow-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-sand-surface text-sand-text font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Log In"}
                </button>

                {!isSignUp && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-800">
                    <span className="font-bold">Admin Portal Access:</span><br/>
                    Email: <code className="font-mono bg-amber-500/20 px-1 rounded font-bold">admin@narensstudio.com</code> | Password: <code className="font-mono bg-amber-500/20 px-1 rounded font-bold">admin123</code> (or <code className="font-mono bg-amber-500/20 px-1 rounded font-bold">admin</code>)
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
      </main>
    </>
  );
}
