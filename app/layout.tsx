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
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`h-full bg-gray-50 dark:bg-[#0b1120] ${user ? "flex" : ""}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
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
