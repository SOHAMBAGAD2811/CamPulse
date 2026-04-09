"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/app/student/supabase";

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

      // 1. Check students table first
      const { data: student, error: studentError } = await supabase.from("students").select("uid, password").ilike("uid", normalizedId).maybeSingle();
      if (studentError) {
        console.error("Student query error:", studentError.message);
        alert(`DB Error (students): ${studentError.message}`);
        return;
      }
      
      if (student) {
        if (student.password && student.password !== password) {
          alert("Invalid password! Please try again.");
          return;
        }
        localStorage.setItem("campuspulse_uid", student.uid);
        router.push("/student");
        return;
      }
      
      // 2. If not a student, check staff table
      const { data: staff, error: staffError } = await supabase.from("staff").select("suid").ilike("suid", normalizedId).maybeSingle();
      if (staffError) {
        console.error("Staff query error:", staffError.message);
        alert(`DB Error (staff): ${staffError.message}`);
        return;
      }
      
      if (staff) {
        localStorage.setItem("campuspulse_uid", staff.suid);
        router.push("/staff");
        return;
      }

      alert("User not found! Please ensure your UID/Staff ID exists in the database.");
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during authentication.");
    } finally {
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
          Cam<span className="text-[#A78BFA]">Pulse</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed mx-auto lg:mx-0">
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
            <p className="text-slate-400 text-sm mt-2">Sign in to your pulse account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* UID Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">UID / Staff ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 md:py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="e.g. 322CE001 or E12345"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 md:py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
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
              className="w-full bg-[#A78BFA] text-white font-bold py-3 md:py-4 rounded-full shadow-lg shadow-[#A78BFA]/30 hover:shadow-[#A78BFA]/50 transition-all flex items-center justify-center gap-2 mt-6 md:mt-4"
            >
              {loading ? "Authenticating..." : "Enter Workspace"}
              <ArrowRight size={20} />
            </motion.button>
          </form>

          {/* Soft Footer Info */}
          <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest leading-loose">
            Secured by CamPulse Encryption • v2026
          </p>
        </div>
      </motion.div>
    </main>
  );
}