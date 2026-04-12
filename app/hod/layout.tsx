"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, CalendarCheck, Megaphone, LogOut } from "lucide-react";

export default function HODLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const uid = localStorage.getItem("campuspulse_uid");
    if (!uid) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("campuspulse_uid");
    router.push("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/hod", icon: LayoutDashboard },
    { name: "Students", href: "/hod/students", icon: Users },
    { name: "Staff", href: "/hod/staff", icon: BookOpen },
    { name: "Approvals", href: "/hod/approvals", icon: CalendarCheck },
    { name: "Broadcasts", href: "/hod/broadcasts", icon: Megaphone },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* --- Sidebar --- */}
      <aside className="w-full md:w-72 bg-[#F5F5F0] p-6 flex flex-col shadow-[8px_0_16px_rgba(0,0,0,0.02)] z-10 border-r border-white/60">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Cam<span className="text-[#10B981]">Pulse</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-bold">HOD Workspace</p>
        </div>

        <nav className="flex-1 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                onClick={() => router.push(link.href)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold ${
                  isActive
                    ? "bg-[#F5F5F0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-[#10B981]"
                    : "text-slate-500 hover:text-slate-700 hover:shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#10B981]" : "text-slate-400"} />
                {link.name}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 w-full py-4 text-rose-500 font-bold rounded-2xl hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}