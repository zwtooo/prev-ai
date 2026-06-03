import Header from "@/components/layout/Header";
import { Flame, Target, Dumbbell, Clock, ArrowRight, CheckCircle2, Circle, TrendingUp, Zap } from "lucide-react";
import { homeRoutines } from "@/lib/data";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Goal = Database["public"]["Tables"]["user_goals"]["Row"];
type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
type Session = { completed_at: string; duration_minutes: number };

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = dayNames[new Date().getDay()];

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

  // Weekly activity
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const now = new Date();
  const weeklyStats = weekDays.map((day, i) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - ((now.getDay() - i + 7) % 7));
    const dayStr = dayDate.toISOString().split("T")[0];
    const daySessions = sessions.filter((s) => s.completed_at.startsWith(dayStr));
    return {
      day,
      minutes: daySessions.reduce((a, s) => a + s.duration_minutes, 0),
    };
  });
  const maxMinutes = Math.max(...weeklyStats.map((d) => d.minutes), 1);

  const firstName = (profile?.name || user.email || "").split(" ")[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" subtitle={`Bienvenido de vuelta, ${firstName}. Aquí está tu resumen de hoy.`} />

      <main className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Racha actual</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{profile?.streak || 0}</p>
                <p className="text-gray-400 text-xs mt-0.5">días seguidos</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-green-600 text-xs font-medium">
              <TrendingUp size={12} />
              <span>Sigue así</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sesiones totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{profile?.total_sessions || 0}</p>
                <p className="text-gray-400 text-xs mt-0.5">completadas</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Dumbbell size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-green-600 text-xs font-medium">
              <TrendingUp size={12} />
              <span>{sessions.length > 0 ? `${sessions.length} sesiones registradas` : "Sin sesiones aún"}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Metas cumplidas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {completedGoals}
                  <span className="text-lg text-gray-400">/{goals.length}</span>
                </p>
                <p className="text-gray-400 text-xs mt-0.5">objetivos</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${goals.length > 0 ? (completedGoals / goals.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Recordatorios</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{reminders.length}</p>
                <p className="text-gray-400 text-xs mt-0.5">activos</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-orange-600 text-xs font-medium">
              <Zap size={12} />
              <span>{todayReminders.length} para hoy</span>
            </div>
          </div>
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 font-semibold">Actividad semanal</h2>
                <p className="text-gray-400 text-xs mt-0.5">Minutos de ejercicio por día</p>
              </div>
              <Link href="/stats" className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600">
                Ver más <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex items-end gap-3 h-36">
              {weeklyStats.map((stat) => (
                <div key={stat.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-gray-400 text-xs">{stat.minutes > 0 ? `${stat.minutes}m` : ""}</span>
                  <div
                    className={`w-full rounded-t-md ${stat.day === today ? "bg-orange-500" : stat.minutes > 0 ? "bg-orange-200" : "bg-gray-100"}`}
                    style={{ height: `${(stat.minutes / maxMinutes) * 96}px`, minHeight: stat.minutes > 0 ? "8px" : "4px" }}
                  />
                  <span className={`text-xs font-medium ${stat.day === today ? "text-orange-500" : "text-gray-400"}`}>{stat.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Metas</h2>
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {completedGoals}/{goals.length}
              </span>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-start gap-3">
                  {goal.completed ? (
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${goal.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{goal.title}</p>
                    {goal.completed_date && <p className="text-gray-400 text-xs">{goal.completed_date}</p>}
                  </div>
                </div>
              ))}
              {goals.length === 0 && <p className="text-gray-400 text-sm">Sin metas aún. Ve a tu perfil para añadir.</p>}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommended Routine */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Rutina recomendada hoy</h2>
              <Link href="/routines" className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600">
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
            {homeRoutines[0] && (
              <div className="border border-orange-100 bg-orange-50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-gray-900 font-semibold">{homeRoutines[0].title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{homeRoutines[0].description}</p>
                  </div>
                  <span className="bg-white border border-orange-200 text-orange-600 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap ml-2">
                    {homeRoutines[0].duration}
                  </span>
                </div>
                <div className="space-y-2">
                  {homeRoutines[0].exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{ex.icon}</span>
                      <span>{ex.name}</span>
                      <span className="ml-auto text-gray-400 text-xs">{ex.reps}</span>
                    </div>
                  ))}
                </div>
                <Link href="/routines" className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Zap size={14} /> Comenzar rutina
                </Link>
              </div>
            )}
          </div>

          {/* Today Reminders */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Recordatorios de hoy</h2>
              <Link href="/reminders" className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600">
                Gestionar <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {todayReminders.slice(0, 4).map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-xl">{reminder.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-medium">{reminder.title}</p>
                    <p className="text-gray-400 text-xs">{reminder.description}</p>
                  </div>
                  <span className="text-gray-500 text-sm font-mono shrink-0">{reminder.time}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                </div>
              ))}
              {todayReminders.length === 0 && (
                <p className="text-gray-400 text-sm py-4 text-center">No hay recordatorios para hoy</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">¿Tienes alguna molestia?</h3>
              <p className="text-gray-400 text-sm">Consulta a nuestro asistente IA especializado en prevención de lesiones</p>
            </div>
          </div>
          <Link href="/chat" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0">
            Ir al chat <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
