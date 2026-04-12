"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, Clock, UserCircle } from "lucide-react";
import { supabase } from "@/app/student/supabase";

export default function Noticeboard() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const uid = localStorage.getItem("campuspulse_uid");
      if (!uid) return;

      // 1. Fetch staff's department_id
      const { data: staff, error: staffError } = await supabase
        .from("staff")
        .select("department_id")
        .eq("suid", uid)
        .single();

      if (staffError) throw staffError;

      if (staff) {
        // Guard against missing department IDs
        if (!staff.department_id) {
          console.warn("Noticeboard: Staff has no department_id assigned.");
          setLoading(false);
          return;
        }

        // 2. Fetch broadcasts meant for this department's staff
        const { data: notices, error: noticesError } = await supabase
          .from("broadcasts")
          .select("*")
          .eq("department_id", String(staff.department_id))
          .in("target_audience", ["all", "staff"])
          .order("created_at", { ascending: false })
          .limit(10); // Show only the latest 10

        if (noticesError) throw noticesError;
        if (notices) setBroadcasts(notices);
      }
    } catch (error: any) {
      console.error("Error fetching broadcasts:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-[#F5F5F0] h-64 rounded-[2rem] border border-white/60 animate-pulse shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)]"></div>;
  }

  return (
    <div className="bg-[#F5F5F0] p-6 md:p-8 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-white/60 flex flex-col max-h-[500px]">
      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-3">
        <Megaphone className="text-[#60A5FA]" size={24} /> 
        Noticeboard
      </h3>
      
      {broadcasts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium p-6 text-center shadow-[inset_4px_4px_8px_rgba(0,0,0,0.03),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-3xl">
          No new notices from your department.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {broadcasts.map((b) => (
            <div key={b.id} className="p-5 bg-[#F5F5F0] rounded-3xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-md font-bold text-slate-800">{b.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1 shrink-0 bg-slate-200/50 px-2 py-1 rounded-full"><Clock size={10} /> {new Date(b.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{b.message}</p>
              <div className="mt-2 pt-3 border-t border-slate-200/50 flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#60A5FA] font-bold"><UserCircle size={14} /> Sent by {b.created_by}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}