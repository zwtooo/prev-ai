"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Reportes" subtitle="Resúmenes y exportables de tu progreso y adherencia" />

      <main className="flex-1 p-4 lg:p-6">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-10 flex flex-col items-center text-center max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={30} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg">Reportes próximamente</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
            Aquí podrás generar y descargar reportes de tu adherencia, evolución de molestias y
            cumplimiento semanal. Por ahora puedes revisar tu seguimiento en detalle.
          </p>
          <Link
            href="/stats"
            className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Ir a Seguimiento <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
