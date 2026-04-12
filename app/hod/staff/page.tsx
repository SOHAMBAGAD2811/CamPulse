"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { BookOpen, Search, UserCircle, Briefcase, ShieldCheck } from "lucide-react";
import { supabase } from "@/app/student/supabase";

export default function HODStaffDirectory() {
  const [hodData, setHodData] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const huid = localStorage.getItem("campuspulse_uid");
      if (!huid) return;

      // 1. Fetch HOD details to get their department_id
      const { data: hod, error: hodError } = await supabase
        .from("hods")
        .select("*")
        .eq("huid", huid)
        .single();

      if (hodError) {
        console.error("Error fetching HOD data:", hodError.message);
      }

      if (hod) {
        setHodData(hod);
        
        // 2. Fetch all staff in this department
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          // Type casting to String to prevent integer/varchar DB mismatch
          .eq("department_id", String(hod.department_id))
          .order("name", { ascending: true });
          
        if (staffError) {
          console.error("Error fetching staff data:", staffError.message);
          alert(`DB Error fetching staff: ${staffError.message}`);
        } else {
          setStaffList(staffData || []);
          setFilteredStaff(staffData || []);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staffList);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = staffList.filter(
      (s) => 
        (s.name && s.name.toLowerCase().includes(query)) || 
        (s.suid && s.suid.toLowerCase().includes(query))
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

  if (loading) return <div className="text-slate-500 font-medium">Loading Staff Directory...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      
      {/* --- Header & Search --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-[#10B981]" size={36} />
            Staff <span className="text-[#10B981]">Directory</span>
          </h2>
          <p className="text-slate-500 mt-2">
            Viewing all {staffList.length} faculty members in your department.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-80 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SUID..."
            className="w-full bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full py-3 pl-12 pr-5 outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all text-slate-600 placeholder:text-slate-400 border-none font-medium"
          />
        </motion.div>
      </div>

      {/* --- Staff Grid --- */}
      {filteredStaff.length === 0 ? (
        <div className="bg-[#F5F5F0] p-12 rounded-[2rem] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-center text-slate-400 font-medium">
          No staff members found matching "{searchQuery}".
        </div>
      ) : (
        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((staff) => (
            <motion.div key={staff.suid} variants={itemVars} className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 cursor-default">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] mb-4">
                <UserCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-1 w-full" title={staff.name}>{staff.name}</h3>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-400 tracking-wider mt-1">
                <ShieldCheck size={12} className="text-[#10B981]" /> {staff.suid}
              </div>
              <div className="mt-5 w-full pt-4 border-t border-slate-200/50 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-slate-200/50 text-slate-500 px-3 py-1.5 rounded-full">
                  <Briefcase size={12} /> Faculty
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}