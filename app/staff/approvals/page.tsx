"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, MapPin, Calendar, FileText, UserCircle, Send, MessageSquare } from "lucide-react";

// --- Mock Data ---
const initialRequests = [
  {
    id: 1,
    studentName: "Soham Patil",
    uid: "S22CE001",
    title: "State Level Hackathon 2023",
    type: "Technical",
    date: "Oct 12 - Oct 14, 2023",
    location: "Pune University",
    desc: "Requesting 2 days of CW to participate in the 48-hour state-level hackathon. Our team got selected for the final round.",
  },
  {
    id: 2,
    studentName: "Priya Desai",
    uid: "S22CE032",
    title: "Inter-college Debate",
    type: "Extracurricular",
    date: "Oct 15, 2023",
    location: "Main Auditorium",
    desc: "Representing the college debate team in the annual inter-college competition. Need attendance for the morning sessions.",
  },
  {
    id: 3,
    studentName: "Karan Mehta",
    uid: "S22CE061",
    title: "AI/ML Workshop",
    type: "Seminar",
    date: "Oct 18, 2023",
    location: "Tech Hub, Mumbai",
    desc: "Attending an advanced workshop on deep learning architectures organized by industry experts.",
  }
];

export default function PriorityQueuePage() {
  const [requests, setRequests] = useState(initialRequests);
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: string }>({});

  const handleAction = (id: number, action: "approve" | "reject") => {
    // In a real app, this would trigger an API call to update the DB.
    // For now, we simply remove the item from the queue to demonstrate the workflow.
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleFeedbackChange = (id: number, value: string) => {
    setFeedbacks((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Priority <span className="text-[#60A5FA]">Queue</span>
          </h2>
          <p className="text-slate-500 mt-2">Rapid "One-Click" sign-offs for pending mentee requests.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#F5F5F0] px-5 py-3 rounded-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border border-white/60">
          <Clock size={18} className="text-[#FDBA74]" />
          <span className="font-bold text-slate-700">{requests.length} Pending</span>
        </div>
      </div>

      {/* --- Queue List --- */}
      <div className="space-y-8">
        <AnimatePresence>
          {requests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-[#F5F5F0] rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60"
            >
              <div className="w-20 h-20 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-700">All Caught Up!</h3>
              <p className="text-slate-500 mt-2">You have reviewed all pending requests.</p>
            </motion.div>
          ) : (
            requests.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: 100 }}
                transition={{ duration: 0.3 }}
                className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col gap-6"
              >
                
                {/* Card Header: Student Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/50 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-lg">{req.studentName}</h4>
                      <p className="text-xs font-medium text-slate-400">{req.uid}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#FDBA74]/10 text-[#FDBA74] text-xs font-bold uppercase tracking-wider self-start sm:self-auto border border-[#FDBA74]/20">
                    Requires Action
                  </div>
                </div>

                {/* Card Body: Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-700 mb-1">{req.title}</h3>
                    <p className="text-sm font-medium text-[#60A5FA] mb-4">{req.type}</p>
                    
                    <div className="space-y-2 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {req.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        {req.location}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F0] p-5 rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-start gap-3">
                    <FileText size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{req.desc}"
                    </p>
                  </div>
                </div>

                {/* Card Footer: Feedback & Actions */}
                <div className="flex flex-col md:flex-row gap-6 mt-2 pt-6 border-t border-slate-200/50">
                  
                  {/* Feedback Box */}
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-4 text-slate-400">
                      <MessageSquare size={18} />
                    </div>
                    <textarea 
                      rows={2}
                      value={feedbacks[req.id] || ""}
                      onChange={(e) => handleFeedbackChange(req.id, e.target.value)}
                      placeholder="Add an optional note to the student..."
                      className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-300 border-none resize-none text-sm"
                    />
                  </div>

                  {/* Action Pills */}
                  <div className="flex items-center gap-3 shrink-0">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(req.id, "reject")}
                      className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold text-sm border border-white/60"
                    >
                      <XCircle size={18} /> Reject
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(req.id, "approve")}
                      className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all font-bold text-sm"
                    >
                      <CheckCircle size={18} /> Approve
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}