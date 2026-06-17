"use client";

import { SidebarProvider } from "@/lib/sidebar-context";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export default function DashboardLayout({ children, userName, userEmail }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto mobile-safe-pb lg:pb-0">
          {children}
        </div>
      </div>
      <MobileNav />
    </SidebarProvider>
  );
}
