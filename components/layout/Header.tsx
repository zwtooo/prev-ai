"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — only mobile */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-gray-900 dark:text-white text-lg lg:text-xl font-bold truncate">{title}</h1>
            {subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 w-48 transition-all"
            />
          </div>
          <ThemeToggle variant="icon" />
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-600 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            CM
          </div>
        </div>
      </div>
    </header>
  );
}
