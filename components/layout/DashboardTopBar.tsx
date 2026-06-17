"use client";

import { Bell, Menu, CalendarDays, ChevronDown } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

interface DashboardTopBarProps {
  formattedDate: string;
}

export default function DashboardTopBar({ formattedDate }: DashboardTopBarProps) {
  const { toggle } = useSidebar();

  return (
    <div className="flex items-center justify-between px-4 lg:px-6 py-4">
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-slate-800 transition-all"
      >
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
        </button>
        <button className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
          <CalendarDays size={17} />
        </button>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
          <span className="text-sm capitalize hidden sm:inline">{formattedDate}</span>
          <span className="text-sm capitalize sm:hidden">Hoy</span>
          <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </button>
      </div>
    </div>
  );
}
