"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { UserCircle, Lock, Shield, Building, Save } from "lucide-react";
import { supabase } from "@/app/student/supabase";
import { useRouter } from "next/navigation";

export default function StaffProfilePage() {
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        const suid = localStorage.getItem("campuspulse_uid");
        if (!suid) {
          router.replace("/");
          return;
        }

        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .eq("suid", suid)
          .single();

        if (error || !data) {
          router.replace("/"); // Kicks out students trying to access profile
          return;
        }
        if (data) setProfileData(data);
      } catch (error: any) {
        console.error("Error fetching staff profile:", error.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchStaffProfile();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const suid = localStorage.getItem("campuspulse_uid");
      if (!suid) throw new Error("Staff not found");

      const { error } = await supabase
        .from("staff")
        .update({ password: newPassword })
        .eq("suid", suid);

      if (error) throw error;

      alert("Password updated successfully!");
      setNewPassword("");
    } catch (error: any) {
      alert("Error updating password: " + error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
          Profile & <span className="text-[#60A5FA]">Security</span>
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
            <div className="w-14 h-14 rounded-full bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <UserCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700">Faculty Profile</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Pre-seeded Data</p>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium">
                {loadingProfile ? "Loading..." : profileData?.name || "N/A"}
              </div>
            </div>

            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Staff ID (UID)</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium flex items-center justify-between">
                {loadingProfile ? "Loading..." : profileData?.suid || "N/A"}
                <Shield size={16} className="text-[#60A5FA]" />
              </div>
            </div>

            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Designation</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium">
                {loadingProfile ? "Loading..." : profileData?.designation || "N/A"}
              </div>
            </div>

            {/* Read-Only Field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Department</label>
              <div className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-5 md:py-4 md:px-6 text-slate-600 font-medium flex items-center gap-2">
                <Building size={16} className="text-[#60A5FA]" />
                {loadingProfile ? "Loading..." : profileData?.department || "N/A"}
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

            <form className="space-y-5" onSubmit={handlePasswordUpdate}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">New Password</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 md:py-4 md:px-6 outline-none focus:ring-2 focus:ring-[#FDBA74]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                  placeholder="Enter secure password (min 6 chars)"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={updatingPassword}
                type="submit"
                className="w-full bg-[#FDBA74] text-white font-bold py-3 md:py-4 rounded-full shadow-lg shadow-[#FDBA74]/30 hover:shadow-[#FDBA74]/50 transition-all flex items-center justify-center gap-2 mt-6 md:mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={20} /> {updatingPassword ? "Updating..." : "Update Credentials"}
              </motion.button>
            </form>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}