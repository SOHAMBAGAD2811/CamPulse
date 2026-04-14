"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { FileText, FileSpreadsheet, Download, Filter, Users, Activity, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import { supabase } from "@/app/student/supabase";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to make dates more compact (e.g., "12 Oct 23")
const formatShortDate = (dateVal: Date | string | null | undefined) => {
  if (!dateVal) return "N/A";
  const date = new Date(dateVal);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

export default function DataAndReportsPage() {
  const [filterMode, setFilterMode] = useState<"mentees" | "department">("mentees");
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Raw Data & Date Filter States
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [rawActivities, setRawActivities] = useState<any[]>([]);
  const [myDivisions, setMyDivisions] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      const suid = localStorage.getItem("campuspulse_uid");
      if (!suid) {
        router.replace("/");
        return;
      }

      try {
        // Fetch staff divisions to determine who they mentor
        const { data: coords } = await supabase.from("class_coordinators").select("division").eq("suid", suid);
        const myDivisionsData = coords?.map(c => c.division) || [];
        setMyDivisions(myDivisionsData);

        // Fetch all students and activities
        const { data: students } = await supabase.from("students").select("uid, name, division");
        
        // 1. Fetch Old Singular Activities
        const { data: oldActivities } = await supabase.from("student_activities").select("id, uid, activity_name, status, created_at");

        // 2. Fetch New Group Activities
        const { data: participations } = await supabase
          .from("activity_participants")
          .select(`
            status,
            student_uid,
            group_activities ( id, title, created_at )
          `);

        if (students) {
          const activities: any[] = [];

          if (oldActivities) {
            oldActivities.forEach(a => {
              activities.push({
                id: String(a.id),
                uid: a.uid,
                title: a.activity_name || 'Unknown Activity',
                status: a.status,
                created_at: a.created_at
              });
            });
          }

          if (participations) {
            participations.forEach((p: any) => {
              activities.push({
                id: p.group_activities?.id + '-' + p.student_uid,
                uid: p.student_uid,
                title: p.group_activities?.title || 'Unknown Activity',
                status: p.status,
                created_at: p.group_activities?.created_at
              });
            });
          }

          setRawStudents(students);
          setRawActivities(activities);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [router]);

  // Automatically recalculate report data whenever date filters change
  useEffect(() => {
    if (loading || !rawActivities.length || !rawStudents.length) return;

    const studentMap = new Map(rawStudents.map(s => [s.uid, { name: s.name, division: s.division }]));

    const mappedReports = rawActivities.map(activity => {
      const student = studentMap.get(activity.uid);
      if (!student) return null;

      // Filter by Date Range
      if (startDate && new Date(activity.created_at) < new Date(startDate)) return null;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Inclusive of the end day
        if (new Date(activity.created_at) > end) return null;
      }

      return {
        id: activity.id,
        title: activity.title,
        studentName: student.name,
        studentUid: activity.uid,
        date: new Date(activity.created_at),
        status: activity.status,
        mentoredByMe: myDivisions.includes(student.division),
      };
    }).filter(Boolean) as any[];

    // Sort by date descending
    mappedReports.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    setReportsData(mappedReports);
  }, [rawStudents, rawActivities, myDivisions, startDate, endDate, loading]);

  const displayedData = filterMode === "mentees" 
    ? reportsData.filter(r => r.mentoredByMe) 
    : reportsData;

  // --- PDF Export Logic ---
  const handleExportPDF = () => {
    if (displayedData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Activity Audit Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated by CamPulse`, 14, 30);
    doc.text(`Scope: ${filterMode === "mentees" ? "My Mentees" : "Entire Department"}`, 14, 36);
    doc.text(`Period: ${startDate ? formatShortDate(startDate) : 'All Time'} to ${endDate ? formatShortDate(endDate) : 'Present'}`, 14, 42);
    doc.text(`Generated on: ${formatShortDate(new Date())}`, 14, 48);

    const tableData = displayedData.map(r => [
      r.title,
      r.studentName,
      r.studentUid,
      formatShortDate(r.date),
      r.status
    ]);

    autoTable(doc, {
      startY: 54,
      head: [['Activity Title', 'Student Name', 'Student UID', 'Date', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [96, 165, 250] }, // CampusPulse Blue (#60A5FA)
      styles: { fontSize: 9 },
    });

    doc.save(`CampusPulse_Audit_${filterMode}.pdf`);
  };

  // --- CSV (Excel) Export Logic ---
  const handleExportCSV = () => {
    if (displayedData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ['Activity Title', 'Student Name', 'Student UID', 'Date', 'Status'];
    
    const csvRows = displayedData.map(r => [
      `"${r.title}"`,
      `"${r.studentName}"`,
      `"${r.studentUid}"`,
      `"${formatShortDate(r.date)}"`,
      `"${r.status}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CampusPulse_Analytics_${filterMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* --- Header --- */}
      <div className="mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Data & <span className="text-[#60A5FA]">Reports</span>
          </h2>
          <p className="text-slate-500 mt-2">Generate and export activity audits for HOD meetings.</p>
      </div>

      {/* --- Controls Bar --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        
        {/* Scope Toggle */}
        <div className="flex items-center bg-[#F5F5F0] p-2 rounded-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] w-full lg:w-auto">
          <button 
            onClick={() => setFilterMode("mentees")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === "mentees" ? 'bg-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Filter size={16} /> My Mentees
          </button>
          <button 
            onClick={() => setFilterMode("department")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === "department" ? 'bg-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/30' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> Entire Dept.
          </button>
        </div>

        {/* Date Range Pickers */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-[#F5F5F0] p-2.5 rounded-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] w-full sm:w-auto">
            <Calendar size={16} className="text-[#60A5FA] ml-3 shrink-0" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">From</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 cursor-pointer pr-3 w-full" />
          </div>
          <div className="flex items-center gap-2 bg-[#F5F5F0] p-2.5 rounded-full shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] w-full sm:w-auto">
            <Calendar size={16} className="text-[#60A5FA] ml-3 shrink-0" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">To</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 cursor-pointer pr-3 w-full" />
          </div>
        </div>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8">
        
        {/* --- Export Action Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button 
            variants={itemVars}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-700">Export PDF Report</h4>
                <p className="text-xs text-slate-400 font-medium">Formatted for printing</p>
              </div>
            </div>
            <Download size={20} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
          </motion.button>

          <motion.button 
            variants={itemVars}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="bg-[#F5F5F0] p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                <FileSpreadsheet size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-700">Export to Excel</h4>
                <p className="text-xs text-slate-400 font-medium">Raw data & analytics</p>
              </div>
            </div>
            <Download size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </motion.button>
        </div>

        {/* --- Data Preview List --- */}
        <motion.div variants={itemVars} className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60">
          <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[#60A5FA]" />
            Data Preview 
            {!loading && <span className="text-sm font-medium text-slate-400 font-normal ml-2">({displayedData.length} Records)</span>}
          </h3>
          
          <div className="space-y-4">
            {loading && <p className="text-slate-500 font-medium py-4">Loading department analytics...</p>}
            {!loading && displayedData.length === 0 && <p className="text-slate-400 py-4">No records found.</p>}
            
            {displayedData.map((activity) => (
              <div key={activity.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-700">{activity.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">By: {activity.studentName} ({activity.studentUid})</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div className="text-center min-w-[80px]">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Date</p>
                <p className="font-bold text-slate-700 text-sm">{formatShortDate(activity.date)}</p>
                  </div>
                  {activity.status === 'Approved' && (
                    <div className="text-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Approved</div>
                  )}
                  {activity.status === 'Pending' && (
                    <div className="text-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pending</div>
                  )}
                  {activity.status === 'Rejected' && (
                    <div className="text-center px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Rejected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}