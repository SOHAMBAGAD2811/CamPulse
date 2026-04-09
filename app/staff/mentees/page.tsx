"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserCircle, Mail, Phone, PieChart, Clock, Award, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/app/student/supabase";

export default function MenteeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentees() {
      setLoading(true);
      const suid = localStorage.getItem("campuspulse_uid");
      if (!suid) return;

      try {
        // 1. Find the divisions this staff coordinates
        const { data: coords } = await supabase.from("class_coordinators").select("division").eq("suid", suid);
        const divisions = coords?.map(c => c.division) || [];

        // 2. Find activities specifically assigned to this staff
        const { data: myActs } = await supabase.from("student_activities").select("uid").eq("suid", suid);
        const assignedUids = myActs?.map(a => a.uid) || [];

        // 3. Fetch ALL students
        const { data: allStudents } = await supabase.from("students").select("*");
        if (!allStudents) return;

        // 4. Filter students who are in coordinated divisions OR have activities assigned to this staff
        const myStudents = allStudents.filter(s => divisions.includes(s.division) || assignedUids.includes(s.uid));

        if (myStudents.length === 0) {
          setMentees([]);
          setLoading(false);
          return;
        }

        // 5. Fetch ALL activities for these mentees to build their profile timeline
        const menteeUids = myStudents.map(s => s.uid);
        const { data: menteeActs } = await supabase.from("student_activities").select("*").in("uid", menteeUids).order("from_date", { ascending: false });

        // 6. Map to UI data structure
        const formattedMentees = myStudents.map(student => {
          const studentActivities = menteeActs?.filter(a => a.uid === student.uid) || [];
          const total = studentActivities.length;

          // Calculate participation analytics percentages
          const technical = total ? Math.round((studentActivities.filter(a => a.type === "Technical").length / total) * 100) : 0;
          const cultural = total ? Math.round((studentActivities.filter(a => a.type === "Cultural").length / total) * 100) : 0;
          const sports = total ? Math.round((studentActivities.filter(a => a.type === "Sports").length / total) * 100) : 0;

          return {
            id: student.uid,
            name: student.name,
            email: `${student.uid.toLowerCase()}@campulse.edu`,
            phone: student.phone || "Not Provided",
            year: student.year ? `${student.year} - Div ${student.division || 'N/A'}` : "Year N/A",
            analytics: { technical, cultural, sports },
            timeline: studentActivities.map(a => ({
              id: a.id,
              title: a.activity_name || a.title || "Untitled Activity",
              type: a.type,
              date: a.from_date,
              status: a.status
            }))
          };
        });

        setMentees(formattedMentees);
        
        // Check if coming from dashboard URL click
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get("id");
        if (queryId && formattedMentees.find(m => m.id === queryId)) setSelectedId(queryId);
        else if (formattedMentees.length > 0) setSelectedId(formattedMentees[0].id);
        
      } catch (error) {
        console.error("Error fetching mentees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMentees();
  }, []);

  const filteredMentees = mentees.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMentee = mentees.find(m => m.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:items-start">
      
      {/* --- Left Pane: Mentee Roster --- */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Mentee <span className="text-[#60A5FA]">Roster</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Select a student to view details.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none text-sm font-medium"
            placeholder="Search by name or UID..."
          />
        </div>

        {/* Roster List */}
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-4 smooth-scroll">
          {loading ? (
            <p className="text-center text-slate-500 font-medium py-10">Loading roster...</p>
          ) : filteredMentees.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">No mentees found.</p>
          ) : filteredMentees.map((mentee) => {
            const isActive = selectedId === mentee.id;
            return (
              <motion.button
                key={mentee.id}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedId(mentee.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                  isActive 
                    ? "bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border border-transparent" 
                    : "bg-[#F5F5F0] shadow-[6px_6px_12px_rgba(0,0,0,0.04),-6px_-6px_12px_rgba(255,255,255,0.8)] border border-white/60 hover:shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.9)]"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#60A5FA]/10 text-[#60A5FA] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]' : 'bg-slate-200/50 text-slate-400'}`}>
                  <UserCircle size={20} />
                </div>
                <div className="overflow-hidden">
                  <h4 className={`font-bold truncate ${isActive ? 'text-[#60A5FA]' : 'text-slate-700'}`}>{mentee.name}</h4>
                  <p className="text-xs text-slate-400 font-medium truncate">{mentee.id}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* --- Right Pane: Dynamic Detail View --- */}
      <div className="w-full lg:w-2/3 lg:sticky lg:top-6">
        {loading ? (
          <div className="bg-[#F5F5F0] p-10 rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-center min-h-[400px]">
            <p className="text-slate-500 font-medium">Loading mentee details...</p>
          </div>
        ) : !activeMentee ? (
          <div className="bg-[#F5F5F0] p-10 rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-center min-h-[400px]">
            <p className="text-slate-500 font-medium">No mentee selected.</p>
          </div>
        ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMentee.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col gap-8"
          >
            
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border-4 border-white/60 flex items-center justify-center shrink-0">
                <UserCircle size={40} className="text-[#60A5FA]/50" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-slate-700">{activeMentee.name}</h3>
                <p className="text-[#60A5FA] font-bold mt-1">{activeMentee.id} <span className="text-slate-400 font-medium ml-2">• {activeMentee.year}</span></p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-slate-500 text-xs font-medium">
                    <Mail size={14} className="text-slate-400" /> {activeMentee.email}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-slate-500 text-xs font-medium">
                    <Phone size={14} className="text-slate-400" /> {activeMentee.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analytics Section */}
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <PieChart size={18} className="text-[#60A5FA]" />
                  Participation Analytics
                </h4>
                
                <div className="bg-[#F5F5F0] p-5 rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] space-y-4">
                  {/* Tech Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500 uppercase tracking-wider">Technical</span>
                      <span className="text-[#60A5FA]">{activeMentee.analytics.technical}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${activeMentee.analytics.technical}%` }} className="h-full bg-[#60A5FA] rounded-full" />
                    </div>
                  </div>
                  {/* Cultural Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500 uppercase tracking-wider">Cultural</span>
                      <span className="text-[#A78BFA]">{activeMentee.analytics.cultural}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${activeMentee.analytics.cultural}%` }} className="h-full bg-[#A78BFA] rounded-full" />
                    </div>
                  </div>
                  {/* Sports Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500 uppercase tracking-wider">Sports</span>
                      <span className="text-[#FDBA74]">{activeMentee.analytics.sports}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${activeMentee.analytics.sports}%` }} className="h-full bg-[#FDBA74] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-5">
                <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Clock size={18} className="text-[#FDBA74]" />
                  Recent Activity
                </h4>
                
                <div className="space-y-4">
                  {activeMentee.timeline.length > 0 ? activeMentee.timeline.map((item) => (
                    <div key={item.id} className="bg-[#F5F5F0] p-4 rounded-2xl shadow-[6px_6px_12px_rgba(0,0,0,0.04),-6px_-6px_12px_rgba(255,255,255,0.8)] border border-white/60">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h5 className="font-bold text-slate-700 text-sm leading-tight">{item.title}</h5>
                        {item.status === "Approved" && <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />}
                        {item.status === "Pending" && <Clock size={14} className="text-[#FDBA74] shrink-0 mt-0.5" />}
                        {item.status === "Rejected" && <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />}
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-[#60A5FA] bg-[#60A5FA]/10 px-2 py-0.5 rounded-md">{item.type}</span>
                        <span className="text-slate-400">{item.date}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-[#F5F5F0] p-6 rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center">
                      <Award size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No recent activities logged.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
        )}
      </div>

    </div>
  );
}