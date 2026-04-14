"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/student/supabase";
import { Save, ArrowLeft, CheckCircle, Plus, List, Clock, XCircle, Trash2, Calendar } from "lucide-react";
import MultiTagInput from "../components/MultiTagInput";

// Helper function for 15-day date constraints
const getDateConstraints = () => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 15);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 15);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return { min: formatDate(minDate), max: formatDate(maxDate), today: formatDate(today) };
};

// Helper to make dates more compact
const formatShortDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

export default function LogActivityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<{ suid: string; name: string }[]>([]);
  const [studentList, setStudentList] = useState<{ uid: string; name: string }[]>([]);
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { min, max, today } = getDateConstraints();

  const [formData, setFormData] = useState({
    title: "",
    category: "Technical",
    description: "",
    fromDate: today,
    toDate: today,
    fromTime: "",
    toTime: "",
    leave_required: false,
    participantUids: [] as string[],
    mentorSuids: [] as string[],
  });

  // Fetch available staff members to populate the Mentor dropdown
  useEffect(() => {
    // Protect route: Ensure user is actually a Student
    async function verifyStudent() {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) {
        router.replace("/");
        return;
      }
      const { data, error } = await supabase.from("students").select("uid").eq("uid", uid).maybeSingle();
      if (error || !data) {
        router.replace("/"); // Not found in students table
      } else {
        setCurrentUserUid(uid);
      }
    }

    async function fetchStaff() {
      const { data } = await supabase.from("staff").select("suid, name");
      if (data) setStaffList(data);
    }
    async function fetchStudents() {
      const { data } = await supabase.from("students").select("uid, name");
      if (data) setStudentList(data);
    }
    verifyStudent();
    fetchStaff();
    fetchStudents();
  }, [router]);

  const fetchActivities = async () => {
    setLoadingHistory(true);
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) return;

      const { data } = await supabase
        .from("activity_participants")
        .select(`
          status,
          group_activities ( id, title, category, description, start_date, end_date, created_at )
        `)
        .eq("student_uid", uid);

      if (data) {
        const formatted = data.map((d: any) => ({
          id: d.group_activities?.id,
          title: d.group_activities?.title,
          category: d.group_activities?.category,
          description: d.group_activities?.description,
          start_date: d.group_activities?.start_date,
          end_date: d.group_activities?.end_date,
          created_at: d.group_activities?.created_at,
          status: d.status
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivities(formatted);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchActivities();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) {
        router.push("/");
        return;
      }

      // 1. Insert parent activity
      const { data: event, error: eventError } = await supabase.from("group_activities").insert([
        {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          start_date: formData.fromDate,
          end_date: formData.toDate,
          from_time: formData.fromTime,
          to_time: formData.toTime,
          leave_required: formData.leave_required,
          created_by: String(uid)
        }
      ]).select("id").single();

      if (eventError) throw eventError;

      // 2. Bulk insert participants (including the creator)
      const allParticipants = Array.from(new Set([String(uid), ...formData.participantUids]));
      const participantsPayload = allParticipants.map(pUid => ({
        activity_id: event.id,
        student_uid: String(pUid),
        status: "Pending"
      }));
      const { error: partError } = await supabase.from("activity_participants").insert(participantsPayload);
      if (partError) throw partError;

      // 3. Bulk insert mentors
      if (formData.mentorSuids.length > 0) {
        const mentorsPayload = formData.mentorSuids.map(mSuid => ({
          activity_id: event.id,
          staff_suid: String(mSuid)
        }));
        const { error: mentorError } = await supabase.from("activity_mentors").insert(mentorsPayload);
        if (mentorError) throw mentorError;
      }
      
      setShowSuccess(true);
      setFormData({ ...formData, title: "", description: "", participantUids: [], mentorSuids: [] });
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab("history");
      }, 1500);
    } catch (error: any) {
      alert("Error logging activity: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!window.confirm("Are you sure you want to delete this pending activity?")) return;
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      const { error } = await supabase
        .from("activity_participants")
        .delete()
        .match({ activity_id: activityId, student_uid: uid });

      if (error) throw error;
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (error: any) {
      alert("Error deleting activity: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-3 rounded-full bg-[#F5F5F0] shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] text-slate-500 hover:text-[#A78BFA] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Log New Activity</h2>
          <p className="text-slate-500 text-sm mt-1">Submit your activity details for faculty approval.</p>
        </div>
      </div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("new")} className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "new" ? "bg-[#A78BFA] text-white shadow-lg shadow-[#A78BFA]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
          <Plus size={16} /> Log New Activity
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "history" ? "bg-[#A78BFA] text-white shadow-lg shadow-[#A78BFA]/30" : "bg-[#F5F5F0] text-slate-500 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"}`}>
          <List size={16} /> My History
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "new" ? (
          <motion.form 
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 space-y-6 max-w-2xl"
          >
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Activity Title</label>
              <input 
                type="text" required
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                placeholder="e.g. National Hackathon 2026"
              />
            </div>
            
            {/* Category & Mentor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Category</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none appearance-none cursor-pointer"
                >
                  <option>Technical</option>
                  <option>Cultural</option>
                  <option>Sports</option>
                  <option>Workshop/Seminar</option>
                </select>
              </div>
              <MultiTagInput 
                label="Faculty Mentors"
                placeholder="Search mentors..."
                options={staffList.map(s => ({ id: String(s.suid), name: s.name }))}
                selectedIds={formData.mentorSuids}
                onChange={(ids) => setFormData({...formData, mentorSuids: ids})}
                accentColor="#A78BFA"
              />
            </div>

            {/* Team Members (Peers) */}
            <MultiTagInput 
              label="Team Members (Peers)"
              placeholder="Search co-participants..."
              options={studentList.filter(s => String(s.uid) !== String(currentUserUid)).map(s => ({ id: String(s.uid), name: s.name }))}
              selectedIds={formData.participantUids}
              onChange={(ids) => setFormData({...formData, participantUids: ids})}
              accentColor="#A78BFA"
            />

            {/* Input: Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">From Date</label>
                <input 
                  type="date" required
                  min={min} max={max}
                  value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">To Date</label>
                <input 
                  type="date" required
                  min={min} max={max}
                  value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                />
              </div>
            </div>

            {/* Input: Time Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">From Time</label>
                <input 
                  type="time" required
                  value={formData.fromTime} onChange={e => setFormData({...formData, fromTime: e.target.value})}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">To Time</label>
                <input 
                  type="time" required
                  value={formData.toTime} onChange={e => setFormData({...formData, toTime: e.target.value})}
                  className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Description / Outcomes</label>
              <textarea 
                required rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none"
                placeholder="Briefly describe the activity..."
              />
            </div>

            {/* Leave Required Checkbox */}
            <div className="flex items-center gap-3 ml-4 pt-2">
              <input 
                type="checkbox" id="leave"
                checked={formData.leave_required} onChange={e => setFormData({...formData, leave_required: e.target.checked})}
                className="w-5 h-5 accent-[#A78BFA] bg-[#F5F5F0] rounded outline-none cursor-pointer"
              />
              <label htmlFor="leave" className="text-sm font-medium text-slate-600 cursor-pointer">Requires Attendance Leave</label>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-[#A78BFA] text-white font-bold py-4 rounded-full shadow-lg shadow-[#A78BFA]/30 hover:shadow-[#A78BFA]/50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Save size={20} />
              {loading ? "Saving..." : "Submit Activity"}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {loadingHistory ? (
              <div className="text-center py-10"><p className="text-slate-500 font-medium">Loading history...</p></div>
            ) : activities.length === 0 ? (
              <div className="bg-[#F5F5F0] p-12 rounded-[2rem] text-center shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                <p className="text-slate-400 font-medium">You haven't logged any activities yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#A78BFA]/20 ml-4 md:ml-6 space-y-8 py-4">
                {activities.map((activity, i) => (
                  <motion.div 
                    key={activity.id} 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="relative pl-8 md:pl-12"
                  >
                    <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#F5F5F0] bg-[#A78BFA]/10 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                    </div>

                    <div className="bg-[#F5F5F0] p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#A78BFA]/10 text-[#A78BFA]">
                            {activity.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${activity.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : activity.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {activity.status === 'Approved' ? <CheckCircle size={10} /> : activity.status === 'Rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                            {activity.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">{activity.title}</h3>
                        <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold mt-2">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {formatShortDate(activity.start_date)} {activity.start_date !== activity.end_date && `- ${formatShortDate(activity.end_date)}`}</span>
                        </div>
                        {activity.description && (
                          <div className="pt-4 mt-4 border-t border-slate-200/50">
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{activity.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {activity.status === 'Pending' && (
                        <div className="flex flex-col items-end justify-start min-w-[80px] border-t md:border-t-0 md:border-l border-slate-200/50 pt-4 md:pt-0 md:pl-4">
                          <button 
                            onClick={() => handleDelete(activity.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F5F0] shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-slate-400 hover:text-rose-500 transition-all"
                            title="Delete Activity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-[#F5F5F0] text-slate-700 px-6 py-4 rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] border border-white/60 flex items-center gap-3 font-bold z-50"
          >
            <CheckCircle size={24} className="text-emerald-500" />
            Activity logged
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}