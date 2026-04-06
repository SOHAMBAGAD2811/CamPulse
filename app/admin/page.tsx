"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TEMPORARY LOGIC: Hardcoded Admin bypass
    setTimeout(() => {
      if (adminId === "admin" && password === "admin123") {
        router.push("/admin");
      } else {
        setLoading(false);
        alert("Invalid Admin Credentials.");
      }
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#F5F5F0] p-10 rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 relative">
          
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-[#FDBA74]/20 text-[#FDBA74] rounded-full flex items-center justify-center mb-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-700">Admin Portal</h2>
            <p className="text-slate-400 text-sm mt-2">Restricted System Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Admin ID Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Admin ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Shield size={18} />
                </div>
                <input 
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FDBA74]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="Enter Admin ID"
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
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FDBA74]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-[#FDBA74] text-white font-bold py-4 rounded-full shadow-lg shadow-[#FDBA74]/30 hover:shadow-[#FDBA74]/50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
              <ArrowRight size={20} />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}