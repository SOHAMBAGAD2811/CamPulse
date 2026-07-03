"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";

export default function LandingPage() {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Set browser tab title for the login page
  useEffect(() => {
    document.title = "Welcome - CamPulse";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedId = uid.trim().toUpperCase();

      const result = await signIn("credentials", {
        uid: normalizedId,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        alert(result.error);
        setLoading(false);
        return;
      }

      // Securely fetch the session to determine the route
      const session = await getSession();
      if (session?.user) {
        const role = (session.user as any).role;
        if (role === "student") router.push("/student");
        else if (role === "staff") router.push("/staff");
        else if (role === "hod") router.push("/hod");
        else router.push("/");
      } else {
        alert("Session creation failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F5F5F0] flex flex-col lg:flex-row items-center justify-center p-6 lg:p-24 overflow-hidden">
      
      {/* --- College Logo --- */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-50">
        <Image 
          src="/kkw.png" 
          alt="KKW College Logo" 
          width={180} 
          height={80} 
          className="w-auto h-12 lg:h-16 object-contain"
          priority
        />
      </div>

      {/* --- Left Side: Hero Text --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="lg:w-1/2 space-y-6 mb-12 lg:mb-0 text-center lg:text-left"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 tracking-tight">
          Cam<span className="text-[#7C3AED]">Pulse</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-md leading-relaxed mx-auto lg:mx-0">
          The seamless platform for students and staff to coordinate extracurriculars, manage campus events, and sync college life.
        </p>
        
      </motion.div>

      {/* --- Right Side: Neumorphic Sign-In Card --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#F5F5F0]/80 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 relative">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-700">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">Sign in to your pulse account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* UID Input */}
            <div className="space-y-2">
              <label htmlFor="uid-input" className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-4">UID / Staff ID / HOD ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={18} aria-hidden="true" />
                </div>
                <input 
                  id="uid-input"
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 md:py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all text-slate-700 placeholder:text-slate-500 border-none"
                  placeholder="e.g. 322CE001 or E12345"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password-input" className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} aria-hidden="true" />
                </div>
                <input 
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 md:py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all text-slate-700 placeholder:text-slate-500 border-none"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              aria-label="Submit login form"
              className="w-full bg-[#7C3AED] text-white font-bold py-3 md:py-4 rounded-full shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#7C3AED]/50 transition-all flex items-center justify-center gap-2 mt-6 md:mt-4"
            >
              {loading ? "Authenticating..." : "Enter Workspace"}
              <ArrowRight size={20} aria-hidden="true" />
            </motion.button>
          </form>

          {/* Soft Footer Info */}
          <p className="text-center text-[10px] text-slate-500 mt-8 uppercase tracking-widest leading-loose">
            Secured by CamPulse Encryption • v2026
          </p>
        </div>
      </motion.div>
    </main>
  );
}