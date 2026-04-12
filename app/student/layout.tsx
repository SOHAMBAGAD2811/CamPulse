"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListTodo, Users, UserCircle, LogOut, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/app/student/supabase";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Pulse", path: "/student", icon: LayoutDashboard },
    { name: "The Log", path: "/student/log", icon: ListTodo },
    { name: "Events", path: "/student/events", icon: UserCircle},
    { name: "Mentorship", path: "/student/mentorship", icon: Users },
    { name: "Profile", path: "/student/profile", icon: UserCircle },
  ];
  // Staff specific navigation
  useEffect(() => {
      const titles: Record<string, string> = {
        "/student": "Command Center - CampusPulse",
        "/student/log": "My Log - CampusPulse",
        "/student/mentorship": "Mentorship - CampusPulse",
        "/student/profile": "Profile - CampusPulse",
      };
      
      document.title = titles[pathname] || "CampusPulse Staff";
    }, [pathname]);

  // Role-based security check
  useEffect(() => {
    const checkAuth = async () => {
      const uid = localStorage.getItem('campuspulse_uid');
      if (!uid) {
        router.replace('/');
        return;
      }
      const { data, error } = await supabase
        .from('students')
        .select('uid')
        .eq('uid', uid)
        .single();
      if (error || !data) {
        router.replace('/');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="h-screen bg-[#F5F5F0] flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden">
      
      {/* --- Sidebar (Hidden on mobile, soft-UI on desktop) --- */}
      <aside className={`hidden md:flex flex-col py-6 border-r border-white/60 shadow-[8px_0_16px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 relative ${isCollapsed ? 'w-24 px-4 items-center' : 'w-64 px-6'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 bg-[#F5F5F0] border border-white/60 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.8)] rounded-full p-1.5 text-slate-400 hover:text-[#A78BFA] z-50 transition-transform duration-300"
          style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronLeft size={16} />
        </button>

        <div className={`mb-10 ${isCollapsed ? 'text-center' : 'pl-2'}`}>
          <h1 className="text-2xl font-bold tracking-tight">
            {isCollapsed ? "C" : "Cam"}<span className="text-[#A78BFA]">{isCollapsed ? "P" : "Pulse"}</span>
          </h1>
          {!isCollapsed && <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Student Workspace</p>}
        </div>

        <nav className="flex-1 space-y-4 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className="block w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-[#F5F5F0] text-[#A78BFA] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={20} className={isActive ? "text-[#A78BFA]" : "text-slate-400"} />
                  {!isCollapsed && <span>{item.name}</span>}
                  
                  {/* Notification Ping Placeholder */}
                  {!isCollapsed && item.name === "The Log" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#FDBA74] animate-pulse" />
                  )}
                  {isCollapsed && item.name === "The Log" && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FDBA74] animate-pulse" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 w-full">
          <Link href="/" className="block w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => localStorage.removeItem("campuspulse_uid")}
              className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'gap-2 px-4'} py-3 rounded-2xl text-slate-500 bg-[#F5F5F0] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:text-red-400 transition-colors`}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut size={18} />
              {!isCollapsed && <span className="font-medium">Sign Out</span>}
            </motion.button>
          </Link>
        </div>
      </aside>

      {/* --- Mobile Bottom Bar --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#F5F5F0]/90 backdrop-blur-lg border-t border-white/60 shadow-[0_-8px_16px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-4 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#F5F5F0] text-[#A78BFA] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={22} className={isActive ? "text-[#A78BFA]" : "text-slate-400"} />
                {item.name === "The Log" && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FDBA74] animate-pulse" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* --- Main Content Area --- */}
      {/* Using key={pathname} forces Next.js to replay Framer Motion animations on route changes! */}
      <main key={pathname} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-28 md:pb-10 relative">
        {children}
      </main>
      
    </div>
  );
}