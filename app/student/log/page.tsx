"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Clock, X, MapPin, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

// --- Mock Data ---
const mockActivities = [
  {
    id: 1,
    title: "State Level Hackathon 2023",
    type: "Technical",
    date: "Oct 12, 2023",
    location: "Pune University",
    status: "Approved",
    cw: true,
    desc: "Participated in the 48-hour state-level hackathon. Built a campus management application using Next.js and Firebase. Secured 3rd place overall.",
  },
  {
    id: 2,
    title: "Cultural Fest Volunteer",
    type: "Extracurricular",
    date: "Nov 05, 2023",
    location: "Main Auditorium",
    status: "Pending",
    cw: false,
    desc: "Managed the stage and coordinated with the performers for the annual cultural festival.",
  },
  {
    id: 3,
    title: "AI/ML Workshop",
    type: "Seminar",
    date: "Nov 20, 2023",
    location: "Computer Dept. Lab 1",
    status: "Rejected",
    cw: true,
    desc: "Attended the 2-day workshop on Neural Networks and Deep Learning by industry experts.",
  },
];

export default function TheLogPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form State
  const [cwToggle, setCwToggle] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <Check size={16} /> };
      case "Pending":
        return { color: "text-[#FDBA74]", bg: "bg-[#FDBA74]/10", icon: <Clock size={16} /> };
      case "Rejected":
        return { color: "text-rose-500", bg: "bg-rose-500/10", icon: <X size={16} /> };
      default:
        return { color: "text-slate-500", bg: "bg-slate-500/10", icon: <FileText size={16} /> };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Activity <span className="text-[#A78BFA]">Log</span>
          </h2>
          <p className="text-slate-500 mt-2">Track your extracurricular timeline and approvals.</p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSheetOpen(true)}
          className="bg-[#A78BFA] text-white px-6 py-3 md:py-3 rounded-full font-semibold shadow-lg shadow-[#A78BFA]/30 hover:shadow-[#A78BFA]/50 transition-all flex items-center justify-center md:justify-start gap-2 w-full md:w-auto mt-4 md:mt-0"
        >
          <Plus size={20} />
          Log New Activity
        </motion.button>
      </div>

      {/* --- Vertical Timeline Feed --- */}
      <div className="relative border-l-2 border-[#A78BFA]/20 ml-4 md:ml-6 space-y-8 pb-12">
        {mockActivities.map((activity) => {
          const isExpanded = expandedId === activity.id;
          const statusConfig = getStatusConfig(activity.status);

          return (
            <motion.div 
              layout
              key={activity.id} 
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline Dot */}
              <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#F5F5F0] ${statusConfig.bg} flex items-center justify-center shadow-sm`}>
                <div className={`w-2 h-2 rounded-full bg-current ${statusConfig.color}`} />
              </div>

              {/* Neumorphic Card */}
              <motion.div 
                layout
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                className="bg-[#F5F5F0] p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 cursor-pointer hover:shadow-[12px_12px_20px_rgba(0,0,0,0.06),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow"
              >
                <motion.div layout className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {activity.status}
                      </span>
                      {activity.cw && (
                         <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200/50 text-slate-500">
                           CW Requested
                         </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-700">{activity.title}</h3>
                    <p className="text-sm font-medium text-[#A78BFA] mt-1">{activity.type}</p>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {activity.date}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </motion.div>

                {/* Expandable Description */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-6 border-t border-slate-200/50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4 font-medium">
                          <MapPin size={16} className="text-[#FDBA74]" />
                          {activity.location}
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {activity.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* --- Slide-Over Form Sheet --- */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#F5F5F0] shadow-2xl z-50 overflow-y-auto border-l border-white/60"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Log Activity</h2>
                  <button 
                    onClick={() => setIsSheetOpen(false)}
                    className="w-10 h-10 rounded-full bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsSheetOpen(false); }}>
                  
                  {/* Input: Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Activity Name</label>
                    <input 
                      type="text"
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                      placeholder="e.g., TechFest 2024"
                    />
                  </div>

                  {/* Input: Type & Date row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Type</label>
                      <select className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none appearance-none cursor-pointer">
                        <option>Technical</option>
                        <option>Cultural</option>
                        <option>Sports</option>
                        <option>Seminar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Date</label>
                      <input 
                        type="date"
                        className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                      />
                    </div>
                  </div>

                  {/* Input: Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Location</label>
                    <input 
                      type="text"
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                      placeholder="Where did this happen?"
                    />
                  </div>

                  {/* Toggle: CW / Leave Request */}
                  <div className="flex items-center justify-between bg-[#F5F5F0] p-6 rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
                    <div>
                      <p className="font-bold text-slate-700">Request Leave (CW)</p>
                      <p className="text-xs text-slate-400 mt-1">Requires mentor approval</p>
                    </div>
                    {/* Custom Soft Toggle */}
                    <div 
                      onClick={() => setCwToggle(!cwToggle)}
                      className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] ${cwToggle ? 'bg-[#A78BFA]' : 'bg-slate-200'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-6 h-6 bg-white rounded-full shadow-sm"
                        animate={{ x: cwToggle ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  {/* Input: Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Description / Role</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none resize-none"
                      placeholder="Briefly explain your learnings or role..."
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#A78BFA] text-white font-bold py-4 rounded-full shadow-lg shadow-[#A78BFA]/30 hover:shadow-[#A78BFA]/50 transition-all flex items-center justify-center gap-2 mt-8"
                  >
                    Submit for Review
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}