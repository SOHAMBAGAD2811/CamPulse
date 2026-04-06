"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, Download, Filter, Users, Activity, CheckCircle, Clock, XCircle } from "lucide-react";

// --- Mock Data ---
const mockReports = [
  {
    uid: "S22CE001",
    name: "Soham Patil",
    mentoredByMe: true,
    totalLogs: 12,
    approved: 9,
    pending: 2,
    rejected: 1,
    engagement: "75%",
  },
  {
    uid: "S22CE014",
    name: "Aarav Sharma",
    mentoredByMe: true,
    totalLogs: 8,
    approved: 7,
    pending: 0,
    rejected: 1,
    engagement: "60%",
  },
  {
    uid: "S22CE025",
    name: "Rahul Verma",
    mentoredByMe: false,
    totalLogs: 15,
    approved: 12,
    pending: 1,
    rejected: 2,
    engagement: "85%",
  },
  {
    uid: "S22CE032",
    name: "Priya Desai",
    mentoredByMe: true,
    totalLogs: 5,
    approved: 2,
    pending: 1,
    rejected: 2,
    engagement: "40%",
  },
  {
    uid: "S22CE088",
    name: "Sneha Iyer",
    mentoredByMe: false,
    totalLogs: 22,
    approved: 20,
    pending: 0,
    rejected: 2,
    engagement: "95%",
  }
];

export default function DataAndReportsPage() {
  const [filterMode, setFilterMode] = useState<"mentees" | "department">("mentees");

  const displayedData = filterMode === "mentees" 
    ? mockReports.filter(r => r.mentoredByMe) 
    : mockReports;

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
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Data & <span className="text-[#60A5FA]">Reports</span>
          </h2>
          <p className="text-slate-500 mt-2">Generate and export activity audits for HOD meetings.</p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-[#F5F5F0] p-2 rounded-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] self-start md:self-auto w-full sm:w-auto">
          <button 
            onClick={() => setFilterMode("mentees")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === "mentees" ? 'bg-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Filter size={16} /> My Mentees
          </button>
          <button 
            onClick={() => setFilterMode("department")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === "department" ? 'bg-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> Entire Dept.
          </button>
        </div>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8">
        
        {/* --- Export Action Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button 
            variants={itemVars}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-700">Export PDF Report</h4>
                <p className="text-xs text-slate-400 font-medium">Formatted for printing</p>
              </div>
            </div>
            <Download size={20} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
          </motion.button>

          <motion.button 
            variants={itemVars}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <FileSpreadsheet size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-700">Export to Excel</h4>
                <p className="text-xs text-slate-400 font-medium">Raw data & analytics</p>
              </div>
            </div>
            <Download size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </motion.button>
        </div>

        {/* --- Data Preview List --- */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
          <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[#60A5FA]" />
            Data Preview <span className="text-sm font-medium text-slate-400 font-normal ml-2">({displayedData.length} Records)</span>
          </h3>
          
          <div className="space-y-4">
            {displayedData.map((student) => (
              <div key={student.uid} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-700">{student.name}</h4>
                  <p className="text-xs text-[#60A5FA] font-medium">{student.uid}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Logs</p>
                    <p className="font-bold text-slate-700">{student.totalLogs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center justify-center gap-1"><CheckCircle size={10} className="text-emerald-500"/> Appr.</p>
                    <p className="font-bold text-slate-700">{student.approved}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center justify-center gap-1"><Clock size={10} className="text-[#FDBA74]"/> Pend.</p>
                    <p className="font-bold text-slate-700">{student.pending}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center justify-center gap-1"><XCircle size={10} className="text-rose-500"/> Rej.</p>
                    <p className="font-bold text-slate-700">{student.rejected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}