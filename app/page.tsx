import {
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Zap,
  Shield,
  Activity,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { homeRoutines } from "@/lib/data";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import Header from "@/components/layout/Header";
import WeeklyChart from "@/components/WeeklyChart";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Goal = Database["public"]["Tables"]["user_goals"]["Row"];
type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
type Session = { completed_at: string; duration_minutes: number };

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const cardGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-purple-500 to-pink-600",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = dayNames[new Date().getDay()];
  const formattedDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const [{ data: profileRaw }, { data: remindersData }, { data: goalsData }, { data: sessionsData }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("reminders").select("*").eq("user_id", user.id).eq("active", true),
      supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("training_sessions").select("completed_at, duration_minutes").eq("user_id", user.id),
    ]);

  const profile = profileRaw as Profile | null;
  const goals: Goal[] = goalsData || [];
  const reminders: Reminder[] = remindersData || [];
  const sessions: Session[] = sessionsData || [];
  const completedGoals = goals.filter((g) => g.completed).length;
  const todayReminders = reminders.filter((r) => r.days.includes(today));
  const firstName = (profile?.name || user.email || "").split(" ")[0];

  // Weekly activity
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const now = new Date();
  const weeklyStats = weekDays.map((day, i) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - ((now.getDay() - i + 7) % 7));
    const dayStr = dayDate.toISOString().split("T")[0];
    const daySessions = sessions.filter((s) => s.completed_at.startsWith(dayStr));
    return { day, minutes: daySessions.reduce((a, s) => a + s.duration_minutes, 0) };
  });

  // Stats
  const activeDaysThisWeek = weeklyStats.filter((d) => d.minutes > 0).length;
  const weeklyCompliance = Math.round((activeDaysThisWeek / 7) * 100);
  const streak = profile?.streak || 0;
  const riskLevel = streak >= 5 ? "Bajo" : streak >= 2 ? "Moderado" : "Alto";
  const fatigueLevel =
    activeDaysThisWeek >= 5 ? "Alta" : activeDaysThisWeek >= 3 ? "Moderada" : "Baja";

  const featuredRoutine = homeRoutines[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="prev.ai" />

      <main className="flex-1 p-4 lg:p-6 space-y-5">
        {/* Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ¡Hola, {firstName}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Vamos a cuidar tu cuerpo para que sigas rindiendo al máximo.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm shrink-0">
            <CalendarDays size={14} className="text-orange-500" />
            <span className="text-gray-600 text-sm capitalize">{formattedDate}</span>
          </div>
        </div>

        {/* Stats + Progress chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 3 stat cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Riesgo de lesión */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    riskLevel === "Bajo"
                      ? "bg-green-100 text-green-700"
                      : riskLevel === "Moderado"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {riskLevel}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Riesgo de lesión</p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    riskLevel === "Bajo"
                      ? "bg-green-500 w-2/12"
                      : riskLevel === "Moderado"
                      ? "bg-yellow-500 w-6/12"
                      : "bg-red-500 w-10/12"
                  }`}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {riskLevel === "Bajo"
                  ? "¡Sigue así! Tu racha es excelente."
                  : riskLevel === "Moderado"
                  ? "Mantén tu rutina de ejercicios."
                  : "Intenta ser más constante esta semana."}
              </p>
            </div>

            {/* Fatiga */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-orange-500" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    fatigueLevel === "Baja"
                      ? "bg-green-100 text-green-700"
                      : fatigueLevel === "Moderada"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {fatigueLevel}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Fatiga semanal</p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    fatigueLevel === "Baja"
                      ? "bg-green-500 w-3/12"
                      : fatigueLevel === "Moderada"
                      ? "bg-orange-500 w-6/12"
                      : "bg-red-500 w-10/12"
                  }`}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {activeDaysThisWeek > 0
                  ? `${activeDaysThisWeek} día${activeDaysThisWeek !== 1 ? "s" : ""} activo${activeDaysThisWeek !== 1 ? "s" : ""} esta semana.`
                  : "Sin actividad esta semana. ¡Empieza hoy!"}
              </p>
            </div>

            {/* Cumplimiento semanal */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-purple-600" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                  Esta semana
                </span>
              </div>
              <p className="text-gray-500 text-sm">Cumplimiento</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{weeklyCompliance}%</p>
              <p className="text-gray-400 text-xs mt-1">
                {weeklyCompliance >= 70
                  ? "¡Muy buen trabajo! Sigue así 💪"
                  : weeklyCompliance >= 40
                  ? "Buen progreso, ¡tú puedes!"
                  : "Intenta ser más constante."}
              </p>
            </div>
          </div>

          {/* Progress chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-gray-900 font-semibold text-sm">Tu progreso</h2>
                <p className="text-gray-400 text-xs">Actividad esta semana</p>
              </div>
              <span className="text-2xl font-bold text-orange-500">{weeklyCompliance}%</span>
            </div>
            <WeeklyChart data={weeklyStats} />
          </div>
        </div>

        {/* Rutina de hoy */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-gray-900 font-semibold">Rutina de hoy</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {featuredRoutine.title} · {featuredRoutine.duration} ·{" "}
                {featuredRoutine.exercises.length} ejercicios
              </p>
            </div>
            <Link
              href="/routines"
              className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
            >
              Ver rutina <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {featuredRoutine.exercises.slice(0, 4).map((ex, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br ${cardGradients[i]} rounded-2xl p-4 overflow-hidden`}
              >
                <div className="absolute top-3 left-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="mt-6 mb-2">
                  <span className="text-4xl">{ex.icon}</span>
                </div>
                <p className="text-white font-semibold text-sm leading-tight">{ex.name}</p>
                <p className="text-white/70 text-xs mt-0.5">{ex.reps}</p>
                <div className="mt-3">
                  <div className="w-full bg-white/20 text-white text-xs font-medium py-1.5 rounded-lg text-center">
                    {ex.sets} serie{ex.sets > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals + Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Goals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Mis metas</h2>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {completedGoals}/{goals.length}
                </span>
                <Link
                  href="/profile"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            {goals.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Sin metas aún.{" "}
                <Link href="/profile" className="text-orange-500 hover:underline">
                  Añade una
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="flex items-start gap-3">
                    {goal.completed ? (
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />
                    )}
                    <p
                      className={`text-sm flex-1 leading-snug ${
                        goal.completed ? "text-gray-400 line-through" : "text-gray-700"
                      }`}
                    >
                      {goal.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Recordatorios hoy</h2>
              <Link
                href="/reminders"
                className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                Gestionar <ChevronRight size={14} />
              </Link>
            </div>
            {todayReminders.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                No hay recordatorios para hoy
              </p>
            ) : (
              <div className="space-y-3">
                {todayReminders.slice(0, 4).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-xl shrink-0">{reminder.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{reminder.title}</p>
                      <p className="text-gray-400 text-xs truncate">{reminder.description}</p>
                    </div>
                    <span className="text-gray-500 text-sm font-mono shrink-0">{reminder.time}</span>
                    <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Chat Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold text-lg">IA Entrenamiento</h3>
                <span className="bg-orange-500/20 text-orange-400 text-xs font-medium px-2 py-0.5 rounded-full border border-orange-500/30">
                  Beta
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">
                ¿Tienes alguna molestia? Tu asistente inteligente te acompaña 24/7.
              </p>
            </div>
          </div>
          <Link
            href="/chat"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/20"
          >
            Abrir chat <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
