"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BookOpen, Search, UserCircle, Briefcase, ShieldCheck, ArrowLeft, Mail, Phone, Users, Calendar, MapPin, FileText, Activity, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/student/supabase";

// Helper to make dates more compact
const formatShortDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

const getIconForType = (type: string) => {
  switch (type) {
    case "Expert Session": return <Briefcase size={16} />;
    case "Publication": return <FileText size={16} />;
    default: return <MapPin size={16} />;
  }
};

function HODStaffDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drilldownUid = searchParams.get("id");

  // --- Directory State ---
  const [hodData, setHodData] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Drilldown State ---
  const [activeTab, setActiveTab] = useState<"diary" | "mentees">("diary");
  const [drilldownStaff, setDrilldownStaff] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  useEffect(() => {
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (drilldownUid) {
      fetchDrilldown(drilldownUid);
    }
  }, [drilldownUid, staffList]);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const huid = localStorage.getItem("campuspulse_uid");
      if (!huid) return;

      const { data: hod } = await supabase.from("hods").select("*").eq("huid", huid).single();

      if (hod) {
        setHodData(hod);
        const { data: staffData } = await supabase
          .from("staff")
          .select("*")
          .eq("department_id", String(hod.department_id))
          .order("name", { ascending: true });
          
        setStaffList(staffData || []);
        setFilteredStaff(staffData || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrilldown = async (uid: string) => {
    setLoadingDrilldown(true);
    try {
      const staffMatch = staffList.find(s => s.suid === uid);
      if (staffMatch) {
        setDrilldownStaff(staffMatch);
      } else {
        const { data } = await supabase.from("staff").select("*").eq("suid", uid).single();
        if (data) setDrilldownStaff(data);
      }

      // Fetch Diary
      const { data: myActs } = await supabase.from("staff_activities").select("*").eq("suid", uid);
      const { data: taggedActsData } = await supabase.from("staff_activity_comentors").select("staff_activities(*)").eq("staff_suid", uid);
      
      const taggedActs = taggedActsData?.map((ta: any) => ta.staff_activities).filter(Boolean) || [];
      const allActsMap = new Map();
      [...(myActs || []), ...taggedActs].forEach((a: any) => {
        if (a && a.activity_id) allActsMap.set(a.activity_id, a);
      });
      
      const actData = Array.from(allActsMap.values()).sort((a, b) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime());
      setActivities(actData);

      // Fetch Mentees
      const { data: coords } = await supabase.from("class_coordinators").select("division").eq("suid", uid);
      const divisions = coords?.map(c => c.division) || [];
      
      if (divisions.length > 0) {
        const { data: students } = await supabase.from("students").select("*").in("division", divisions).order("name");
        setMentees(students || []);
      } else {
        setMentees([]);
      }
    } catch (error) {
      console.error("Error loading drilldown:", error);
    } finally {
      setLoadingDrilldown(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staffList);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = staffList.filter(
      (s) => (s.name && s.name.toLowerCase().includes(query)) || (s.suid && s.suid.toLowerCase().includes(query))
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staffList]);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading && !drilldownUid) return <div className="text-slate-500 font-medium">Loading Staff Directory...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {drilldownUid ? (
        /* --- View: Drilldown Dossier --- */
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <button onClick={() => router.push("/hod/staff")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#10B981] transition-colors">
            <ChevronLeft size={16} /> Back to Directory
          </button>

          <div className="bg-[#F5F5F0] p-8 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{drilldownStaff?.name || "Faculty Member"}</h3>
              <p className="text-[#10B981] font-bold tracking-wide mt-1 flex items-center gap-2">
                {drilldownStaff?.role || "Faculty"} <span className="text-slate-300">•</span> {drilldownUid}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 text-sm font-medium text-slate-500">
                {drilldownStaff?.email && <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {drilldownStaff.email}</span>}
                {drilldownStaff?.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {drilldownStaff.phone}</span>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl min-w-[110px]">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Diary Logs</p>
                <p className="text-2xl font-black text-slate-700">{activities.length}</p>
              </div>
              <div className="text-center px-6 py-3 bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl min-w-[110px]">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mentees</p>
                <p className="text-2xl font-black text-slate-700">{mentees.length}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setActiveTab("diary")} className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "diary" ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
              <BookOpen size={16} /> Professional Diary
            </button>
            <button onClick={() => setActiveTab("mentees")} className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "mentees" ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
              <Users size={16} /> Assigned Mentees
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "diary" ? (
              <motion.div key="diary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                {loadingDrilldown ? <p className="text-slate-500">Loading diary...</p> : activities.length === 0 ? (
                  <div className="bg-[#F5F5F0] p-12 rounded-[2rem] text-center shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                    <p className="text-slate-400 font-medium">This staff member has not logged any activities yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[#10B981]/20 ml-4 md:ml-6 space-y-8 py-4">
                    {activities.map((activity) => (
                      <div key={activity.activity_id} className="relative pl-8 md:pl-12">
                        <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#F5F5F0] bg-[#10B981]/10 flex items-center justify-center shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="bg-[#F5F5F0] p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#10B981]/10 text-[#10B981]">
                                  {getIconForType(activity.type)} {activity.type}
                                </span>
                                {activity.suid !== drilldownUid && <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500">Co-Mentored</span>}
                              </div>
                              <h3 className="text-lg font-bold text-slate-700">{activity.activity_name}</h3>
                              <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold mt-2">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {formatShortDate(activity.from_date)} {activity.from_date !== activity.to_date && `- ${formatShortDate(activity.to_date)}`}</span>
                                <span className="flex items-center gap-1 text-amber-500"><MapPin size={12} /> {activity.location || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          {activity.description && (
                            <div className="pt-4 mt-4 border-t border-slate-200/50">
                              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{activity.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="mentees" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentees.length === 0 ? (
                    <div className="col-span-full bg-[#F5F5F0] p-12 rounded-[2rem] text-center shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                      <p className="text-slate-400 font-medium">No students are currently assigned to this faculty member.</p>
                    </div>
                  ) : (
                    mentees.map((student) => (
                      <motion.div variants={itemVars} key={student.uid} className="p-6 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 relative">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-slate-700">{student.name}</h3>
                          <p className="text-sm font-medium text-[#10B981]">{student.uid}</p>
                        </div>
                        <div className="flex gap-2 mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 px-3 py-1 rounded-full">Div {student.division || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/50 text-xs font-medium text-slate-500">
                          {student.email && <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {student.email}</span>}
                          {student.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {student.phone}</span>}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* --- View: Directory Grid --- */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <BookOpen className="text-[#10B981]" size={36} />
                Staff <span className="text-[#10B981]">Directory</span>
              </h2>
              <p className="text-slate-500 mt-2">Viewing all {staffList.length} faculty members in your department.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-80 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></div>
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or SUID..."
                className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 pl-12 pr-5 outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none font-medium"
              />
            </motion.div>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="bg-[#F5F5F0] p-12 rounded-[2rem] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center text-slate-400 font-medium">
              No staff members found matching "{searchQuery}".
            </div>
          ) : (
            <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStaff.map((staff) => (
                <motion.div key={staff.suid} variants={itemVars} className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] mb-4">
                    <UserCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 w-full" title={staff.name}>{staff.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-400 tracking-wider mt-1 mb-4">
                    <ShieldCheck size={12} className="text-[#10B981]" /> {staff.suid}
                  </div>
                  
                  <div className="w-full mt-auto pt-4 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-slate-200/50 text-slate-500 px-3 py-1.5 rounded-full">
                      <Briefcase size={12} /> Faculty
                    </span>
                    <button onClick={() => router.push(`/hod/staff?id=${staff.suid}`)} className="text-xs font-bold text-slate-500 hover:text-[#10B981] transition-colors flex items-center gap-1">
                      <Activity size={14}/> View Dossier
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function HODStaffDirectory() {
  return (
    <Suspense fallback={<div className="text-slate-500 font-medium p-8 text-center">Loading Directory...</div>}>
      <HODStaffDirectoryContent />
    </Suspense>
  );
}