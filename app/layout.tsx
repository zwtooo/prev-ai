import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "prev.ai — Prevención de Lesiones para Oficinistas",
  description: "Tu asistente inteligente para prevenir lesiones y mantenerte activo en la oficina.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={`h-full bg-gray-50 ${user ? "flex" : ""}`}>
        {user ? (
          <DashboardLayout
            userName={user.user_metadata?.name || user.email || ""}
            userEmail={user.email || ""}
          >
            {children}
          </DashboardLayout>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
