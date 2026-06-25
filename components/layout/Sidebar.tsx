"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Dumbbell, Activity,
  BookOpen, MessageSquare, CalendarDays, Bot,
  LogOut, X, Leaf,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/lib/sidebar-context";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Mi perfil", icon: User },
  { href: "/routines", label: "Rutinas", icon: Dumbbell },
  { href: "/stats", label: "Seguimiento", icon: Activity },
  { href: "/educacion", label: "Educación", icon: BookOpen },
  { href: "/chat", label: "Mensajes", icon: MessageSquare },
  { href: "/reminders", label: "Calendario", icon: CalendarDays },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isOpen, close } = useSidebar();

  const initials = userName
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    close();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-slate-800 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {/* Logo + close button on mobile */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm shadow-green-600/30">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight leading-none block">
                prev<span className="text-green-600 dark:text-green-400">.ai</span>
              </span>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5">Prevención de lesiones</p>
            </div>
          </div>
          <button
            onClick={close}
            className="lg:hidden text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-white/5 p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <Icon size={18} className={active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* IA promo card */}
        <div className="px-3 pb-3">
          <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/5 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                <Bot size={15} className="text-white" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm font-semibold">IA Entrenamiento</p>
              <span className="ml-auto bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-snug mb-2.5">
              Tu asistente inteligente que te acompaña 24/7.
            </p>
            <Link
              href="/chat"
              onClick={close}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bot size={13} /> Abrir chat
            </Link>
          </div>
        </div>

        {/* User card */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{userName || "Usuario"}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs truncate">{userEmail}</p>
            </div>
          </div>
          <ThemeToggle variant="row" className="mt-2" />
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
