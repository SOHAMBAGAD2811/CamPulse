"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/student/supabase";
import { Save, ArrowLeft, CheckCircle } from "lucide-react";

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

export default function LogActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<{ suid: string; name: string }[]>([]);
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
    suid: "",
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
      }
    }

    async function fetchStaff() {
      const { data } = await supabase.from("staff").select("suid, name");
      if (data) setStaffList(data);
    }
    verifyStudent();
    fetchStaff();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) {
        router.push("/");
        return;
      }

      // Insert new activity into Supabase
      const { error } = await supabase.from("student_activities").insert([
        {
          uid,
          activity_name: formData.title,
          type: formData.category,
          desc: formData.description,
          from_date: formData.fromDate,
          to_date: formData.toDate,
          from_time: formData.fromTime,
          to_time: formData.toTime,
          leave_required: formData.leave_required,
          suid: formData.suid || null,
          status: "Pending"
        }
      ]);

      if (error) throw error;
      
      setShowSuccess(true);
      // Wait 1.5s for the toast to be seen before redirecting
      setTimeout(() => {
        router.push("/student");
      }, 1500);
    } catch (error: any) {
      alert("Error logging activity: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
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

      {/* Neumorphic Form */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-[2rem] bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 space-y-6"
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Faculty Mentor</label>
            <select 
              required value={formData.suid} onChange={e => setFormData({...formData, suid: e.target.value})}
              className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#A78BFA]/30 transition-all text-slate-600 border-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Mentor</option>
              {staffList.map(staff => (
                <option key={staff.suid} value={staff.suid}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>

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