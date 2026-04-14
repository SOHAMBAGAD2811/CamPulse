"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Users, Upload, Plus, Edit, ChevronLeft, Activity, CheckCircle, Clock, XCircle, FileSpreadsheet, X, Search } from "lucide-react";
import { supabase } from "@/app/student/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";

function MenteeManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drilldownUid = searchParams.get("id");

  const [staffData, setStaffData] = useState<any>(null);
  const [myDivisions, setMyDivisions] = useState<string[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({ uid: "", name: "", division: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Drilldown State
  const [studentActivities, setStudentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [drilldownStudent, setDrilldownStudent] = useState<any>(null);

  useEffect(() => {
    fetchMentees();
  }, []);

  useEffect(() => {
    if (drilldownUid) {
      fetchStudentDrilldown(drilldownUid);
    }
  }, [drilldownUid, mentees]);

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const suid = localStorage.getItem("campuspulse_uid");
      if (!suid) return;

      const { data: staff } = await supabase.from("staff").select("*").eq("suid", suid).single();
      if (staff) {
        setStaffData(staff);

        // Fetch divisions this staff coordinates
        const { data: coords } = await supabase.from("class_coordinators").select("division").eq("suid", suid);
        const divisions = coords?.map(c => c.division) || [];
        setMyDivisions(divisions);

        // Fetch students in the same department (staff can view all, but we highlight mentees)
        const { data: students } = await supabase
          .from("students")
          .select("*")
          .eq("department_id", String(staff.department_id))
          .order("name", { ascending: true });
          
        if (students) setMentees(students);
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDrilldown = async (uid: string) => {
    setLoadingActivities(true);
    const student = mentees.find(m => m.uid === uid);
    if (student) setDrilldownStudent(student);

    try {
      const { data: participations } = await supabase
        .from("activity_participants")
        .select(`
          status,
          group_activities ( id, title, description, created_at )
        `)
        .eq("student_uid", uid);
      
      if (participations) {
        const acts = participations.map((p: any) => ({
          id: p.group_activities?.id || Math.random().toString(),
          title: p.group_activities?.title || 'Unknown Activity',
          description: p.group_activities?.description || '',
          status: p.status,
          created_at: p.group_activities?.created_at || new Date().toISOString()
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setStudentActivities(acts);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // --- Manual Add/Edit Logic ---
  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ uid: student.uid, name: student.name, division: student.division || "", email: student.email || "", phone: student.phone || "" });
    } else {
      setEditingStudent(null);
      setFormData({ uid: "", name: "", division: myDivisions[0] || "", email: "", phone: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        department_id: String(staffData.department_id)
      };

      const { error } = await supabase.from("students").upsert([payload]);
      if (error) throw error;

      await fetchMentees();
      setIsModalOpen(false);
    } catch (error: any) {
      alert("Error saving student: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Bulk Import Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const payload = jsonData.map((row: any) => ({
        uid: String(row.UID || row.uid || row.Id || row.ID),
        name: String(row.Name || row.name || row.FullName || ""),
        division: String(row.Division || row.division || myDivisions[0] || "A"),
        department_id: String(staffData.department_id)
      })).filter(s => s.uid && s.uid !== "undefined" && s.name && s.name !== "undefined");

      if (payload.length === 0) {
        alert("No valid rows found. Please ensure your Excel sheet has 'UID', 'Name', and 'Division' columns.");
        return;
      }

      const { error } = await supabase.from("students").upsert(payload);
      if (error) throw error;

      alert(`Successfully imported/updated ${payload.length} students!`);
      fetchMentees();
    } catch (error: any) {
      alert("Error importing file: " + error.message);
    } finally {
      setImporting(false);
      e.target.value = ""; // Reset input
    }
  };

  const filteredMentees = mentees.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="text-slate-500 font-medium">Loading Roster...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* --- View: Drilldown --- */}
      {drilldownUid ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <button 
            onClick={() => router.push("/staff/mentees")}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#60A5FA] transition-colors"
          >
            <ChevronLeft size={16} /> Back to Roster
          </button>

          <div className="bg-[#F5F5F0] p-8 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{drilldownStudent?.name || "Student"}</h2>
              <p className="text-[#60A5FA] font-medium tracking-wide mt-1">{drilldownUid} • Division {drilldownStudent?.division}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Logs</p>
                <p className="text-xl font-bold text-slate-700">{studentActivities.length}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <Activity size={20} className="text-[#60A5FA]" /> Activity Timeline
          </h3>

          {loadingActivities ? (
             <p className="text-slate-500">Loading timeline...</p>
          ) : studentActivities.length === 0 ? (
            <div className="bg-[#F5F5F0] p-12 rounded-[2rem] text-center shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
              <p className="text-slate-400 font-medium">This student has not logged any activities yet.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#60A5FA] before:to-transparent">
              {studentActivities.map((act) => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#F5F5F0] bg-[#60A5FA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {act.status === "Approved" ? <CheckCircle size={16} /> : act.status === "Rejected" ? <XCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#F5F5F0] p-5 rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-700">{act.title}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${act.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : act.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                      <Clock size={12} /> {new Date(act.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        /* --- View: Roster --- */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <Users className="text-[#60A5FA]" size={36} /> Mentee <span className="text-[#60A5FA]">Management</span>
              </h2>
              <p className="text-slate-500 mt-2">Manage your assigned students and track their engagement.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer bg-[#F5F5F0] text-slate-600 px-5 py-3 rounded-full font-semibold shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 hover:text-emerald-500 transition-colors flex items-center gap-2 relative">
                <FileSpreadsheet size={18} />
                {importing ? "Importing..." : "Import .xlsx"}
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
              </label>
              <button 
                onClick={() => handleOpenModal()}
                className="bg-[#60A5FA] text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> Add Mentee
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or UID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-sm text-slate-600 border-none"
            />
          </div>

          {/* Roster Grid */}
          <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentees.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">No students found.</div>
            )}
            {filteredMentees.map((student) => {
              const isMyMentee = myDivisions.includes(student.division);
              return (
                <motion.div 
                  variants={itemVars} key={student.uid}
                  className={`p-6 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 relative group transition-all ${isMyMentee ? 'hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]' : 'opacity-70 grayscale-[0.5]'}`}
                >
                  {!isMyMentee && <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 uppercase">Other Div</span>}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-700">{student.name}</h3>
                    <p className="text-sm font-medium text-[#60A5FA]">{student.uid}</p>
                  </div>
                  
                  <div className="flex gap-2 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 px-3 py-1 rounded-full">Div {student.division || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                    <button onClick={() => router.push(`/staff/mentees?id=${student.uid}`)} className="text-xs font-bold text-slate-500 hover:text-[#60A5FA] transition-colors flex items-center gap-1">
                      <Activity size={14}/> View Logs
                    </button>
                    <button onClick={() => handleOpenModal(student)} className="w-8 h-8 rounded-full bg-[#F5F5F0] shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all">
                      <Edit size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* --- Add/Edit Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#F5F5F0] p-8 rounded-[2.5rem] shadow-2xl border border-white/60 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-800">{editingStudent ? "Edit Student" : "Add Mentee"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">UID</label>
                  <input required disabled={!!editingStudent} type="text" value={formData.uid} onChange={e => setFormData({...formData, uid: e.target.value})} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 disabled:opacity-50 border-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Division</label>
                  <input required type="text" value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-[#60A5FA]/30 transition-all text-slate-600 border-none" />
                  </div>
                </div>
                <motion.button disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-[#60A5FA] text-white font-bold py-4 rounded-full shadow-lg shadow-[#60A5FA]/30 hover:shadow-[#60A5FA]/50 transition-all mt-6">
                  {saving ? "Saving..." : "Save Student"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MenteeManagementPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 font-medium p-8 text-center">Loading Roster...</div>}>
      <MenteeManagementContent />
    </Suspense>
  );
}