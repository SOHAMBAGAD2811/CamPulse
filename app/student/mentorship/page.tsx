"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building, MessageSquare, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";

// --- Mock Data ---
const mentorInfo = {
  name: "Prof. R. K. Sharma",
  designation: "Senior Assistant Professor",
  department: "Computer Engineering Dept.",
  email: "rk.sharma@campulse.edu",
  phone: "+91 98765 43210"
};

const validationHistory = [
  {
    id: 1,
    activity: "State Level Hackathon 2023",
    status: "Approved",
    date: "Oct 15, 2023",
    comment: "Excellent work! I have approved your CW request for these 2 days. Make sure to submit your participation certificate to the department.",
  },
  {
    id: 2,
    activity: "AI/ML Workshop",
    status: "Rejected",
    date: "Nov 22, 2023",
    comment: "Leave cannot be granted during the mid-semester examination week. Please reschedule or attend outside of college hours.",
  }
];

export default function MentorshipPage() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
          Mentorship <span className="text-[#A78BFA]">Workspace</span>
        </h2>
        <p className="text-slate-500 mt-2">Connect with your faculty mentor and review their feedback.</p>
      </div>

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        
        {/* --- Mentor Profile Card --- */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center border-4 border-white/60">
            <ShieldCheck size={48} className="text-emerald-500/50" />
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3">
              <CheckCircle size={14} /> Assigned Mentor
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-700">{mentorInfo.name}</h3>
            <p className="text-[#A78BFA] font-medium mt-1">{mentorInfo.designation}</p>
            <p className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2 mt-2">
              <Building size={16} /> {mentorInfo.department}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-6">
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] text-slate-600 hover:text-[#A78BFA] transition-colors font-medium text-sm w-full sm:w-auto">
                <Mail size={16} />
                {mentorInfo.email}
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] text-slate-600 hover:text-[#FDBA74] transition-colors font-medium text-sm w-full sm:w-auto">
                <Phone size={16} />
                {mentorInfo.phone}
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- Validation History --- */}
        <motion.div variants={itemVars}>
          <h4 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#FDBA74]" />
            Validation History
          </h4>
          
          <div className="space-y-6">
            {validationHistory.map((item) => (
              <div key={item.id} className="bg-[#F5F5F0] p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h5 className="font-bold text-slate-700 text-lg">{item.activity}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                      <Clock size={14} /> Reviewed on {item.date}
                    </div>
                  </div>
                  
                  {item.status === "Approved" ? (
                    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
                      <CheckCircle size={16} /> Approved
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
                      <XCircle size={16} /> Rejected
                    </div>
                  )}
                </div>

                {/* Inner shadow box for comments */}
                <div className="relative bg-[#F5F5F0] p-5 rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] mt-4">
                  <div className="absolute top-4 left-4 text-slate-300">
                    <MessageSquare size={16} />
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pl-8">
                    <span className="font-bold text-slate-700 mr-2">Mentor Note:</span>
                    {item.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}