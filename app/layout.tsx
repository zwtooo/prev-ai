import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
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

  const isAuthPage = false;

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-gray-50 flex">
        {user && <Sidebar userName={user.user_metadata?.name || user.email || ""} userEmail={user.email || ""} />}
        <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${user ? "ml-64" : ""}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
