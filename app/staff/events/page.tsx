"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { CalendarPlus, Send, Clock, FileText, CheckCircle, XCircle, IndianRupee, Trash2 } from "lucide-react";
import { supabase } from "@/app/student/supabase";

// Helper function for 30-day date constraints
const getDateConstraints = () => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 30);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  const toDateTimeLocal = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  return { min: toDateTimeLocal(minDate), max: toDateTimeLocal(maxDate) };
};

export default function StaffEventsPage() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [staffData, setStaffData] = useState<any>(null);
  const [myProposals, setMyProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    event_type: "Workshop",
    club_name: "",
    description: "",
    target_audience: "Department Only",
    expected_footfall: "",
    guest_speaker: "",
    teacher_coordinator: "",
    start_date: "",
    end_date: "",
    venue: "",
    special_requirements: "",
    estimated_budget: "",
    budget_breakdown: ""
  });

  const { min, max } = getDateConstraints();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) return;

      const { data: staff } = await supabase
        .from("staff")
        .select("*")
        .eq("suid", uid)
        .single();

      if (staff) {
        setStaffData(staff);
        
        const { data: proposals } = await supabase
          .from("event_proposals")
          .select("*")
          .eq("organizer_id", uid)
          .order("created_at", { ascending: false });
          
        if (proposals) setMyProposals(proposals);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        organizer_id: staffData.suid,
        department_id: String(staffData.department_id), // Always typecast to String for safety
        expected_footfall: parseInt(formData.expected_footfall) || 0,
        estimated_budget: parseFloat(formData.estimated_budget) || 0,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      const { data, error } = await supabase
        .from("event_proposals")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setMyProposals([data, ...myProposals]);
      alert("Event proposal submitted successfully!");
      setActiveTab("history");
      
      // Reset form
      setFormData({
        title: "", event_type: "Workshop", club_name: "", description: "",
        target_audience: "Department Only", expected_footfall: "", guest_speaker: "",
        teacher_coordinator: "", start_date: "", end_date: "", venue: "",
        special_requirements: "", estimated_budget: "", budget_breakdown: ""
      });

    } catch (error: any) {
      alert("Error submitting proposal: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pending proposal?")) return;
    try {
      const { error } = await supabase.from("event_proposals").delete().eq("id", id);
      if (error) throw error;
      setMyProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      alert("Error deleting proposal: " + error.message);
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

  if (loading) return <div className="text-slate-500 font-medium">Loading Event Center...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      
      {/* --- Header --- */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <CalendarPlus className="text-[#60A5FA]" size={36} />
          Faculty Event <span className="text-[#60A5FA]">Proposals</span>
        </h2>
        <p className="text-slate-500 mt-2">Submit and track departmental event requests requiring HOD approval.</p>
      </motion.div>

      {/* --- Tabs --- */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
        <button onClick={() => setActiveTab("new")} className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${activeTab === "new" ? "bg-[#60A5FA] text-white shadow-lg shadow-[#60A5FA]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
          New Proposal
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${activeTab === "history" ? "bg-[#60A5FA] text-white shadow-lg shadow-[#60A5FA]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
          My Proposals
        </button>
      </motion.div>

      {/* --- Content Area --- */}
      {activeTab === "new" ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#F5F5F0] p-8 md:p-12 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Event Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. AI & Machine Learning Workshop" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Event Type</label>
                <select name="event_type" value={formData.event_type} onChange={handleInputChange} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none cursor-pointer">
                  <option>Seminar</option><option>Workshop</option><option>Hackathon</option><option>Cultural</option><option>Sports</option><option>Guest Lecture</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Club / Committee (Optional)</label>
                <input type="text" name="club_name" value={formData.club_name} onChange={handleInputChange} placeholder="e.g. Coding Club" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none" />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Description / Objective</label>
              <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="What is the purpose of this event?" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl py-4 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-400 resize-none border-none" />
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Start Date & Time</label>
                <input required type="datetime-local" min={min} max={max} name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">End Date & Time</label>
                <input required type="datetime-local" min={min} max={max} name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Requested Venue</label>
                <input required type="text" name="venue" value={formData.venue} onChange={handleInputChange} placeholder="e.g. Main Seminar Hall" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Expected Footfall</label>
                <input required type="number" name="expected_footfall" value={formData.expected_footfall} onChange={handleInputChange} placeholder="e.g. 150" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
            </div>

            {/* Financials & Extra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Estimated Budget (₹)</label>
                <input required type="number" name="estimated_budget" value={formData.estimated_budget} onChange={handleInputChange} placeholder="e.g. 5000" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Teacher Coordinator</label>
                <input type="text" name="teacher_coordinator" value={formData.teacher_coordinator} onChange={handleInputChange} placeholder="e.g. Prof. Smith" className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className="w-full bg-[#60A5FA] text-white font-bold py-4 rounded-full shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
              <Send size={18} /> {submitting ? "Submitting to HOD..." : "Submit Proposal"}
            </motion.button>
          </form>
        </motion.div>
      ) : (
        /* --- My Proposals History --- */
        <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
          {myProposals.length === 0 ? (
            <div className="bg-[#F5F5F0] p-12 rounded-[2rem] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center text-slate-400 font-medium">
              You haven't submitted any event proposals yet.
            </div>
          ) : (
            myProposals.map((p, i) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{p.event_type}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 px-3 py-1 rounded-full flex items-center gap-1"><Clock size={10}/> {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{p.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
                    <span className="flex items-center gap-1"><FileText size={14} className="text-[#60A5FA]"/> Venue: {p.venue}</span>
                    <span className="flex items-center gap-1"><IndianRupee size={14} className="text-emerald-500"/> Budget: ₹{p.estimated_budget}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="min-w-[140px] flex flex-col items-center justify-center p-4 bg-[#F5F5F0] rounded-3xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                  {p.status === "approved" ? (
                    <>
                      <CheckCircle size={28} className="text-emerald-500 mb-2" />
                      <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Approved</span>
                    </>
                  ) : p.status === "rejected" ? (
                    <>
                      <XCircle size={28} className="text-rose-500 mb-2" />
                      <span className="text-rose-500 font-black uppercase tracking-widest text-[10px]">Rejected</span>
                    </>
                  ) : (
                    <>
                      <Clock size={28} className="text-amber-500 mb-2" />
                      <span className="text-amber-500 font-black uppercase tracking-widest text-[10px]">Pending</span>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="mt-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F0] shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-slate-400 hover:text-rose-500 transition-all"
                        title="Delete Proposal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>

              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}