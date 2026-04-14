"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { CalendarCheck, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/app/student/supabase";

export default function HODDashboard() {
  const [hodData, setHodData] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const huid = localStorage.getItem("campuspulse_uid");
      if (!huid) return;

      // 1. Fetch HOD details
      const { data: hod, error: hodError } = await supabase
        .from("hods")
        .select("*, departments(department_name)")
        .eq("huid", huid)
        .single();

      if (hod) {
        setHodData(hod);
        // 2. Fetch pending event proposals for this HOD's department
        const { data: events } = await supabase
          .from("event_proposals")
          .select("*")
          .eq("department_id", String(hod.department_id))
          .eq("status", "pending")
          .order("created_at", { ascending: false });
          
        if (events) setProposals(events);

        // 3. Fetch total students count
        const { data: sData, error: sError } = await supabase
          .from("students")
          .select("*")
          .eq("department_id", String(hod.department_id));
        
        if (sError) {
          console.error("Student count error:", sError.message);
        } else if (sData) {
          console.log("Dashboard Student Count:", sData.length);
          setStudentCount(sData.length);
        }

        // 4. Fetch approved events count
        const { data: aData, error: aError } = await supabase
          .from("event_proposals")
          .select("id")
          .eq("department_id", String(hod.department_id))
          .eq("status", "approved");
          
        if (aError) console.error("Approved count error:", aError.message);
        if (aData) setApprovedCount(aData.length);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (id: string, newStatus: "approved" | "rejected") => {
    const confirmMsg = newStatus === "approved" ? "Approve this event?" : "Reject this event?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from("event_proposals")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Remove the processed event from the local UI
      setProposals((prev) => prev.filter((p) => p.id !== id));
      // Real-time update to the dashboard metric
      if (newStatus === "approved") {
        setApprovedCount((prev) => prev + 1);
      }
      alert(`Event has been ${newStatus}!`);
    } catch (error: any) {
      alert("Error updating proposal: " + error.message);
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

  if (loading) return <div className="text-slate-500 font-medium">Loading Department Pulse...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* --- Header --- */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Welcome, <span className="text-[#10B981]">{hodData?.name?.split(" ")[0] || "HOD"}</span>
        </h2>
        <p className="text-slate-500 mt-2">
          {hodData?.departments?.department_name || "Department"} • Overview & Pending Actions
        </p>
      </motion.div>

      {/* --- High-Level Metrics --- */}
      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</p>
            <h3 className="text-3xl font-black text-slate-700 mt-1">{proposals.length}</h3>
          </div>
        </motion.div>

        {/* Metric 2 (Placeholders for now) */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
            <h3 className="text-3xl font-black text-slate-700 mt-1">{studentCount}</h3>
          </div>
        </motion.div>
        
        {/* Metric 3 */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Events</p>
            <h3 className="text-3xl font-black text-slate-700 mt-1">{approvedCount}</h3>
          </div>
        </motion.div>
      </motion.div>

      {/* --- Action Center: Pending Event Approvals --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          Action Required <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </h3>

        {proposals.length === 0 ? (
          <div className="bg-[#F5F5F0] p-10 rounded-[2rem] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center text-slate-400 font-medium">
            No pending event proposals. You are all caught up! 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                      {proposal.event_type}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 px-3 py-1 rounded-full">
                      ₹{proposal.estimated_budget}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">{proposal.title}</h4>
                  <p className="text-sm text-slate-500 max-w-2xl line-clamp-2">{proposal.description}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-2">
                    Requested by: {proposal.organizer_id} | Venue: {proposal.venue}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <button onClick={() => handleApprovalAction(proposal.id, "approved")} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#10B981] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#10B981]/30 hover:scale-105 active:scale-95 transition-all">
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button onClick={() => handleApprovalAction(proposal.id, "rejected")} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#F5F5F0] text-rose-500 px-6 py-3 rounded-full font-bold shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all">
                    <XCircle size={18} /> Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}