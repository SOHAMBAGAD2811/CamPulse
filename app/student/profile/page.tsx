"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Lock, Shield, BookOpen, Save } from "lucide-react";

// --- Mock Data ---
const studentProfile = {
  uid: "S22CE001",
  name: "Soham",
  year: "Third Year (TE)",
  division: "A",
  department: "Computer Engineering",
};

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
          Profile & <span className="text-[#A78BFA]">Security</span>
        </h2>
        <p className="text-slate-500 mt-2">Manage your account credentials and workspace preferences.</p>
      </div>

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
      >
        
        {/* --- Left Column: Profile Overview (Read-Only) --- */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <UserCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700">Academic Profile</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Pre-seeded Data</p>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium">
                {studentProfile.name}
              </div>
            </div>

            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">University ID (UID)</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium flex items-center justify-between">
                {studentProfile.uid}
                <Shield size={16} className="text-emerald-500" />
              </div>
            </div>

            {/* Grid for Year & Division */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Year</label>
                <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium text-center">
                  {studentProfile.year}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Division</label>
                <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium text-center">
                  {studentProfile.division}
                </div>
              </div>
            </div>

            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Department</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium flex items-center gap-2">
                <BookOpen size={16} className="text-[#A78BFA]" />
                {studentProfile.department}
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- Right Column: Security & Preferences --- */}
        <div className="space-y-6 md:space-y-8 flex flex-col h-full">
          
          {/* Security / Password Reset */}
          <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-[#FDBA74]/10 text-[#FDBA74] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <Lock size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-700">Account Security</h3>
                <p className="text-xs text-rose-400 uppercase tracking-widest mt-1">Action Required</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 md:py-4 md:px-6 outline-none focus:ring-2 focus:ring-[#FDBA74]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="Phone number used at registration"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 md:py-4 md:px-6 outline-none focus:ring-2 focus:ring-[#FDBA74]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="Enter secure password"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#FDBA74] text-white font-bold py-3 md:py-4 rounded-full shadow-lg shadow-[#FDBA74]/30 hover:shadow-[#FDBA74]/50 transition-all flex items-center justify-center gap-2 mt-6 md:mt-4"
              >
                <Save size={20} /> Update Credentials
              </motion.button>
            </form>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}