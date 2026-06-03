"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Dumbbell, Bell, BarChart3, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/chat", label: "Chat IA", icon: MessageSquare },
  { href: "/routines", label: "Rutinas", icon: Dumbbell },
  { href: "/reminders", label: "Avisos", icon: Bell },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 flex-1 ${
                active ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? "bg-orange-50" : ""}`}>
                <Icon size={19} />
              </div>
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
