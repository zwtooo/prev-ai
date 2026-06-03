"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Dumbbell,
  Bell,
  BarChart3,
  User,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat IA", icon: MessageSquare },
  { href: "/routines", label: "Rutinas", icon: Dumbbell },
  { href: "/reminders", label: "Recordatorios", icon: Bell },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: User },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            prev<span className="text-orange-500">.ai</span>
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1">Prevención de lesiones</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          General
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={18} />
              {label}
              {label === "Chat IA" && (
                <span className="ml-auto bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
                  IA
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150"
        >
          <Settings size={18} />
          Configuración
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all duration-150"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName || "Usuario"}</p>
            <p className="text-gray-500 text-xs truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
