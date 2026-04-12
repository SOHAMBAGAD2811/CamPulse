"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Megaphone, Send, Clock, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "@/app/student/supabase";

export default function BroadcastsPage() {
  const [hodData, setHodData] = useState<any>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const huid = localStorage.getItem("campuspulse_uid");
      if (!huid) return;

      // Fetch HOD details
      const { data: hod } = await supabase
        .from("hods")
        .select("*")
        .eq("huid", huid)
        .single();

      if (hod) {
        setHodData(hod);
        
        // Fetch past broadcasts for this department
        const { data: pastBroadcasts } = await supabase
          .from("broadcasts")
          .select("*")
          .eq("department_id", hod.department_id)
          .order("created_at", { ascending: false });
          
        if (pastBroadcasts) setBroadcasts(pastBroadcasts);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Please fill out both the title and message.");
      return;
    }

    setSending(true);
    try {
      const newBroadcast = {
        title,
        message,
        target_audience: audience,
        department_id: hodData.department_id,
        created_by: hodData.huid,
      };

      const { data, error } = await supabase
        .from("broadcasts")
        .insert([newBroadcast])
        .select()
        .single();

      if (error) throw error;

      // Add new broadcast to the top of the local list
      setBroadcasts([data, ...broadcasts]);
      
      // Reset form
      setTitle("");
      setMessage("");
      setAudience("all");
      alert("Broadcast sent successfully!");
      
    } catch (error: any) {
      alert("Error sending broadcast: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) return <div className="text-slate-500 font-medium">Loading Broadcast Center...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* --- Header --- */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Megaphone className="text-[#10B981]" size={36} />
          Department <span className="text-[#10B981]">Broadcasts</span>
        </h2>
        <p className="text-slate-500 mt-2">Publish official notices and announcements to your department.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- Left Column: Composer --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 space-y-6">
          <div className="bg-[#F5F5F0] p-8 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              Composer <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            </h3>
            
            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Target Audience</label>
                <select 
                  value={audience} 
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all text-slate-600 font-medium appearance-none border-none cursor-pointer"
                >
                  <option value="all">Everyone (Students & Staff)</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Notice Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End Semester Exam Schedule"
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your official notice here..."
                  rows={5}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all text-slate-600 placeholder:text-slate-400 resize-none border-none"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={sending} type="submit"
                className="w-full bg-[#10B981] text-white font-bold py-4 rounded-full shadow-lg shadow-[#10B981]/30 hover:shadow-[#10B981]/50 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send size={18} /> {sending ? "Broadcasting..." : "Send Broadcast"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* --- Right Column: Broadcast History --- */}
        <motion.div variants={containerVars} initial="hidden" animate="show" className="lg:col-span-7 space-y-4">
          <h3 className="text-xl font-bold text-slate-700 mb-6 pl-2">Transmission History</h3>
          
          {broadcasts.length === 0 ? (
             <div className="bg-[#F5F5F0] p-8 rounded-[2rem] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center text-slate-400 font-medium">
               No broadcasts sent yet.
             </div>
          ) : (
            broadcasts.map((b) => (
              <motion.div key={b.id} variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Users size={12} /> Audience: {b.target_audience}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 tracking-wider">
                    <Clock size={12} /> {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-800">{b.title}</h4>
                <p className="text-slate-500 mt-2 whitespace-pre-wrap text-sm leading-relaxed">{b.message}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#10B981] font-bold">
                  <CheckCircle2 size={14} /> Sent by {b.created_by}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

      </div>
    </div>
  );
}