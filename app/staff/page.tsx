"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, Activity, ChevronRight, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Mock Data ---
const staffName = "Prof. Sharma";

const mentees = [
  { id: "S22CE001", name: "Soham Patil", pendingAction: true, lastActive: "2 hrs ago" },
  { id: "S22CE014", name: "Aarav Sharma", pendingAction: false, lastActive: "1 day ago" },
  { id: "S22CE032", name: "Priya Desai", pendingAction: true, lastActive: "5 mins ago" },
  { id: "S22CE045", name: "Rohan Gupta", pendingAction: false, lastActive: "3 days ago" },
  { id: "S22CE058", name: "Neha Verma", pendingAction: false, lastActive: "Just now" },
  { id: "S22CE061", name: "Karan Mehta", pendingAction: true, lastActive: "1 hr ago" },
];

export default function StaffCommandCenter() {
  const router = useRouter();

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
    <div className="max-w-6xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Command <span className="text-[#60A5FA]">Center</span>
          </h2>
          <p className="text-slate-500 mt-2">Welcome back, {staffName}. Here is your mentorship overview.</p>
        </div>

        <motion.button 
          onClick={() => router.push('/staff/approvals')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#60A5FA] text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Clock size={20} />
          View Priority Queue
        </motion.button>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-10">
        
        {/* --- Quick Stats Bento Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Mentees */}
          <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Mentees</p>
              <h3 className="text-3xl font-black text-slate-700">24</h3>
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-[#FDBA74]/10 text-[#FDBA74] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Actions</p>
              <h3 className="text-3xl font-black text-slate-700">5</h3>
            </div>
          </motion.div>

          {/* Recent Pulse (Last 24hrs) */}
          <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Recent Pulse</p>
              <h3 className="text-3xl font-black text-slate-700">12 <span className="text-sm font-medium text-slate-400">logs / 24h</span></h3>
            </div>
          </motion.div>
        </div>

        {/* --- Mentees Overview Grid --- */}
        <motion.div variants={itemVars}>
          <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Users size={20} className="text-[#60A5FA]" />
            Mentees Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.map((student) => (
              <motion.div 
                key={student.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/staff/mentees?id=${student.id}`)}
                className="p-6 rounded-3xl bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Activity Ping */}
                {student.pendingAction && (
                  <div className="absolute top-6 right-6">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FDBA74] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FDBA74]"></span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200/50 text-slate-400 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{student.name}</h4>
                    <p className="text-xs font-medium text-slate-400">{student.id}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                  <p className="text-xs text-slate-400 font-medium">
                    Active: {student.lastActive}
                  </p>
                  <div className="w-8 h-8 rounded-full bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.03),-8px_-8px_16px_rgba(255,255,255,0.8)] flex items-center justify-center text-slate-400 group-hover:text-[#60A5FA] transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}