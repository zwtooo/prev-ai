"use client";

import { Bell, Menu, CalendarDays } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

interface DashboardTopBarProps {
  formattedDate: string;
  userInitials: string;
}

export default function DashboardTopBar({ formattedDate, userInitials }: DashboardTopBarProps) {
  const { toggle } = useSidebar();

  return (
    <div className="flex items-center justify-between px-4 lg:px-6 py-4">
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-white hover:shadow-sm transition-all"
      >
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 mr-1">
          <CalendarDays size={14} className="text-orange-500" />
          <span className="text-gray-600 text-sm capitalize">{formattedDate}</span>
        </div>
        <button className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {userInitials}
        </div>
      </div>
    </div>
  );
}
