"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { homeRoutines, gymRoutines } from "@/lib/data";
import { Clock, ChevronDown, ChevronUp, Dumbbell, Home, Zap, BarChart2, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const levelColors: Record<string, string> = {
  Principiante: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  Intermedio: "bg-orange-100 text-orange-700",
  Avanzado: "bg-red-100 text-red-700",
};

function RoutineCard({ routine }: { routine: typeof homeRoutines[0] }) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [done, setDone] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStarting(false); return; }

    const durationMin = parseInt(routine.duration.replace(" min", ""));

    await supabase.from("training_sessions").insert({
      user_id: user.id,
      routine_id: routine.id,
      routine_title: routine.title,
      duration_minutes: durationMin,
      category: routine.category,
    });

    // Update profile counters
    const { data: profile } = await supabase.from("profiles").select("total_sessions, streak").eq("id", user.id).single();
    if (profile) {
      await supabase.from("profiles").update({
        total_sessions: (profile.total_sessions || 0) + 1,
        streak: (profile.streak || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }

    setStarting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-base">{routine.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{routine.description}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap ${levelColors[routine.level] || "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>
            {routine.level}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <Clock size={14} className="text-green-600 dark:text-green-400" />
            <span>{routine.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <BarChart2 size={14} className="text-green-600 dark:text-green-400" />
            <span>{routine.exercises.length} ejercicios</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={starting || done}
            className={`flex-1 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              done ? "bg-green-500" : "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
            }`}
          >
            {starting ? (
              <><Loader2 size={14} className="animate-spin" /> Registrando...</>
            ) : done ? (
              <><CheckCircle2 size={14} /> ¡Sesión guardada!</>
            ) : (
              <><Zap size={14} /> Comenzar</>
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-slate-800 px-5 py-4 bg-gray-50 dark:bg-white/5">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Ejercicios</p>
          <div className="space-y-2.5">
            {routine.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-lg p-3">
                <span className="text-lg w-7 text-center">{ex.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">{ex.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-700 dark:text-green-400 text-xs font-semibold">{ex.sets} serie{ex.sets > 1 ? "s" : ""}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{ex.reps}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoutinesPage() {
  const [tab, setTab] = useState<"hogar" | "gimnasio">("hogar");
  const routines = tab === "hogar" ? homeRoutines : gymRoutines;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Rutinas" subtitle="Programas de ejercicio adaptados para oficinistas" />

      <main className="flex-1 p-4 lg:p-6">
        <div className="flex gap-2 mb-6 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl p-1.5 w-fit shadow-sm">
          <button
            onClick={() => setTab("hogar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "hogar" ? "bg-green-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"}`}
          >
            <Home size={16} /> En casa
          </button>
          <button
            onClick={() => setTab("gimnasio")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "gimnasio" ? "bg-green-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"}`}
          >
            <Dumbbell size={16} /> Gimnasio
          </button>
        </div>

        <div className={`rounded-xl p-4 mb-6 border ${tab === "hogar" ? "bg-green-50 dark:bg-green-500/10 border-green-100" : "bg-gray-900 border-gray-800"}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tab === "hogar" ? "🏠" : "🏋️"}</span>
            <div>
              <h3 className={`font-semibold ${tab === "hogar" ? "text-gray-900 dark:text-white" : "text-white"}`}>
                {tab === "hogar" ? "Rutinas en casa" : "Rutinas de gimnasio"}
              </h3>
              <p className={`text-sm ${tab === "hogar" ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                {tab === "hogar"
                  ? "Sin equipamiento. Al pulsar Comenzar, la sesión queda registrada en tus estadísticas."
                  : "Diseñadas para corregir desequilibrios musculares por trabajo sedentario."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      </main>
    </div>
  );
}
