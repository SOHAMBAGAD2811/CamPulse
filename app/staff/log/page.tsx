"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, X, MapPin, Calendar, FileText, ChevronDown, ChevronUp, Briefcase, FileDown } from "lucide-react";

// --- Mock Data ---
const mockActivities = [
  {
    id: 1,
    title: "Guest Lecture on Cloud Computing",
    type: "Expert Session",
    date: "Nov 18, 2023",
    location: "MIT College of Engineering",
    desc: "Delivered a 3-hour hands-on session on AWS architecture and deployment strategies for third-year students. Received excellent feedback.",
  },
  {
    id: 2,
    title: "Paper Published in IEEE Xplore",
    type: "Publication",
    date: "Oct 25, 2023",
    location: "International Journal of AI",
    desc: "Co-authored the research paper titled 'Optimizing Neural Networks for Edge Devices'. Presented findings at the virtual global conference.",
  },
  {
    id: 3,
    title: "TCS Industrial Visit Coordinator",
    type: "Industrial Visit",
    date: "Sep 14, 2023",
    location: "TCS Campus, Pune",
    desc: "Led a delegation of 50 final-year students to the TCS campus to understand Agile workflows and enterprise server management.",
  },
];

export default function FacultyLogPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getIconForType = (type: string) => {
    switch (type) {
      case "Expert Session":
        return <Briefcase size={16} />;
      case "Publication":
        return <FileText size={16} />;
      default:
        return <MapPin size={16} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Professional <span className="text-[#60A5FA]">Diary</span>
          </h2>
          <p className="text-slate-500 mt-2">Track your expert sessions, publications, and visits for self-appraisal.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          {/* Export Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#F5F5F0] text-slate-600 px-6 py-3 md:py-3 rounded-full font-semibold shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 hover:text-[#60A5FA] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FileDown size={20} />
            Export Report
          </motion.button>

          {/* Log New Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSheetOpen(true)}
            className="bg-[#60A5FA] text-white px-6 py-3 md:py-3 rounded-full font-semibold shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            Log Activity
          </motion.button>
        </div>
      </div>

      {/* --- Vertical Timeline Feed --- */}
      <div className="relative border-l-2 border-[#60A5FA]/20 ml-4 md:ml-6 space-y-8 pb-12">
        {mockActivities.map((activity) => {
          const isExpanded = expandedId === activity.id;

          return (
            <motion.div 
              layout
              key={activity.id} 
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#F5F5F0] bg-[#60A5FA]/10 flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
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
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-[#60A5FA]/10 text-[#60A5FA]">
                        {getIconForType(activity.type)}
                        {activity.type}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-700">{activity.title}</h3>
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
                  <h2 className="text-2xl font-bold text-slate-800">Add Entry</h2>
                  <button 
                    onClick={() => setIsSheetOpen(false)}
                    className="w-10 h-10 rounded-full bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsSheetOpen(false); }}>
                  
                  {/* Input: Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Activity Title</label>
                    <input 
                      type="text"
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                      placeholder="e.g., AI/ML Guest Lecture"
                    />
                  </div>

                  {/* Input: Type & Date row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Category</label>
                      <select className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none appearance-none cursor-pointer">
                        <option>Expert Session</option>
                        <option>Publication</option>
                        <option>Workshop/FDP</option>
                        <option>Industrial Visit</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Date</label>
                      <input 
                        type="date"
                        className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none"
                      />
                    </div>
                  </div>

                  {/* Input: Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Location / Journal</label>
                    <input 
                      type="text"
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                      placeholder="Where did this happen?"
                    />
                  </div>

                  {/* Input: Proof/Link */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Proof / Link (Optional)</label>
                    <input 
                      type="url"
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Input: Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Description & Impact</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none resize-none"
                      placeholder="Briefly explain your role, target audience, and impact..."
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#60A5FA] text-white font-bold py-4 rounded-full shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all flex items-center justify-center gap-2 mt-8"
                  >
                    Save to Diary
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