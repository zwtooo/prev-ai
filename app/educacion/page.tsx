"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default function EducacionPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Educación" subtitle="Artículos y guías para prevenir lesiones y cuidar tu postura" />

      <main className="flex-1 p-4 lg:p-6">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-10 flex flex-col items-center text-center max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={30} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg">Centro de educación próximamente</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
            Pronto encontrarás artículos, videos y guías sobre ergonomía, pausas activas y hábitos
            saludables para tu jornada de oficina.
          </p>
          <Link
            href="/routines"
            className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Ver rutinas disponibles <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
