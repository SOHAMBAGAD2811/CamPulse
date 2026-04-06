"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, CalendarClock, ShieldCheck, Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  // Mock Data for now
  const studentName = "Soham";
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
    <div className="max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Welcome back, <span className="text-[#A78BFA]">{studentName}</span>
          </h2>
          <p className="text-slate-500 mt-2">Here is your pulse for the current semester.</p>
        </div>

        {/* Quick Action Button */}
        <motion.button 
          onClick={() => router.push('/student/log')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#A78BFA] text-white px-6 py-3 md:py-3 rounded-full font-semibold shadow-lg shadow-[#A78BFA]/30 hover:shadow-[#A78BFA]/50 transition-all flex items-center justify-center md:justify-start gap-2 w-full md:w-auto mt-4 md:mt-0"
        >
          <Plus size={20} />
          Log New Activity
        </motion.button>
      </div>

      {/* Bento Grid */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        
        {/* 1. Activity Count */}
        <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] mb-6">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Activities</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-700">12</h3>
          </div>
        </motion.div>

        {/* 2. CW / Leave Status */}
        <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-[#FDBA74]/10 text-[#FDBA74] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] mb-6">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Leaves</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-700">2 <span className="text-base md:text-lg text-slate-400 font-medium">/ 14 Approved</span></h3>
          </div>
        </motion.div>

        {/* 3. Mentor Snapshot */}
        <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] mb-6">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty Mentor</p>
            <h3 className="text-xl font-bold text-slate-700">Prof. R. K. Sharma</h3>
            <p className="text-sm text-slate-500">Computer Engineering Dept.</p>
          </div>
        </motion.div>

        {/* 4. Engagement Pulse (Spans 2 columns on desktop) */}
        <motion.div variants={itemVars} className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
           <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
            <Activity size={32} />
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Engagement Pulse</p>
              <p className="text-sm font-bold text-[#A78BFA]">75%</p>
            </div>
            {/* Pill shaped progress bar */}
            <div className="w-full h-4 bg-[#F5F5F0] rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#A78BFA] to-[#FDBA74] rounded-full"
              />
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}