import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Award, Flame, Dumbbell, CheckCircle2, Circle } from "lucide-react";

function PainBar({ area, level, max }: { area: string; level: number; max: number }) {
  const pct = (level / max) * 100;
  const color = level <= 3 ? "bg-green-400" : level <= 6 ? "bg-orange-400" : "bg-red-500";
  const textColor = level <= 3 ? "text-green-600" : level <= 6 ? "text-orange-600" : "text-red-600";
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-700 text-sm w-28 shrink-0">{area}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-12 text-right ${textColor}`}>{level}/{max}</span>
    </div>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: goalsData }, { data: sessionsData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("training_sessions").select("*").eq("user_id", user.id).order("completed_at", { ascending: true }),
  ]);

  const goals = goalsData || [];
  const sessions = sessionsData || [];
  const completedGoals = goals.filter((g) => g.completed).length;

  // Weekly stats
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const now = new Date();
  const weeklyStats = dayNames.map((day, i) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - ((now.getDay() - i + 7) % 7));
    const dayStr = dayDate.toISOString().split("T")[0];
    const daySessions = sessions.filter((s) => s.completed_at.startsWith(dayStr));
    return {
      day,
      minutes: daySessions.reduce((a, s) => a + s.duration_minutes, 0),
      calories: daySessions.reduce((a, s) => a + s.duration_minutes * 5, 0),
      isToday: i === now.getDay(),
    };
  });

  // Monthly stats (last 6 months)
  const monthlyProgress = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthSessions = sessions.filter((s) => s.completed_at.startsWith(monthStr));
    return {
      month: d.toLocaleString("es-ES", { month: "short" }),
      sessions: monthSessions.length,
    };
  });

  const maxSessions = Math.max(...monthlyProgress.map((m) => m.sessions), 1);
  const weeklyMinutes = weeklyStats.reduce((a, s) => a + s.minutes, 0);
  const weeklyCalories = weeklyStats.reduce((a, s) => a + s.calories, 0);
  const maxMinutes = Math.max(...weeklyStats.map((s) => s.minutes), 1);

  const painAreas = [
    { area: "Cuello", level: 2, max: 10 },
    { area: "Hombros", level: 4, max: 10 },
    { area: "Espalda alta", level: 3, max: 10 },
    { area: "Espalda baja", level: 6, max: 10 },
    { area: "Muñecas", level: 3, max: 10 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Estadísticas" subtitle="Tu progreso y rendimiento a lo largo del tiempo" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Flame, label: "Racha", value: profile?.streak || 0, sub: "días consecutivos" },
            { icon: Dumbbell, label: "Sesiones", value: profile?.total_sessions || 0, sub: "en total" },
            { icon: TrendingUp, label: "Esta semana", value: weeklyMinutes, sub: "minutos activos" },
            { icon: Award, label: "Metas", value: completedGoals, sub: `de ${goals.length} cumplidas` },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-orange-500" />
                <span className="text-gray-500 text-sm">{label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-gray-900 font-semibold">Sesiones por mes</h2>
              <p className="text-gray-400 text-xs mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-end gap-3 h-44">
              {monthlyProgress.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-gray-400 text-xs">{m.sessions > 0 ? m.sessions : ""}</span>
                  <div
                    className="w-full bg-orange-500 hover:bg-orange-600 rounded-t-md transition-colors"
                    style={{ height: `${(m.sessions / maxSessions) * 120}px`, minHeight: "4px" }}
                  />
                  <span className="text-gray-400 text-xs">{m.month}</span>
                </div>
              ))}
            </div>
            {sessions.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-4">Aún no hay sesiones registradas. ¡Comienza una rutina!</p>
            )}
          </div>

          {/* Weekly Detail */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-gray-900 font-semibold">Esta semana</h2>
              <p className="text-gray-400 text-xs mt-0.5">Detalle de actividad diaria</p>
            </div>
            <div className="space-y-3">
              {weeklyStats.map((stat) => (
                <div key={stat.day} className="flex items-center gap-3">
                  <span className={`text-sm w-8 shrink-0 font-medium ${stat.isToday ? "text-orange-500" : "text-gray-500"}`}>{stat.day}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${stat.minutes > 0 ? "bg-orange-500" : "bg-gray-100"}`}
                      style={{ width: `${(stat.minutes / maxMinutes) * 100}%` }} />
                  </div>
                  <span className="text-gray-500 text-sm w-14 text-right shrink-0">{stat.minutes > 0 ? `${stat.minutes}m` : "—"}</span>
                  <span className="text-gray-400 text-xs w-20 text-right shrink-0">{stat.calories > 0 ? `${stat.calories} kcal` : ""}</span>
                </div>
              ))}
            </div>
            {weeklyMinutes > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <div><p className="text-gray-400">Total minutos</p><p className="text-gray-900 font-bold">{weeklyMinutes} min</p></div>
                <div className="text-right"><p className="text-gray-400">Total calorías</p><p className="text-gray-900 font-bold">{weeklyCalories} kcal</p></div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pain Areas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-gray-900 font-semibold">Nivel de molestias</h2>
              <p className="text-gray-400 text-xs mt-0.5">Escala de 0 a 10</p>
            </div>
            <div className="space-y-4">
              {painAreas.map((pa) => <PainBar key={pa.area} {...pa} />)}
            </div>
            <p className="mt-4 text-xs text-gray-400">Próximamente podrás registrar tus niveles de dolor en el chat IA.</p>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 font-semibold">Metas y logros</h2>
                <p className="text-gray-400 text-xs mt-0.5">{completedGoals} de {goals.length} completadas</p>
              </div>
              {goals.length > 0 && (
                <div className="bg-orange-500 text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {Math.round((completedGoals / goals.length) * 100)}%
                </div>
              )}
            </div>
            {goals.length > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(completedGoals / goals.length) * 100}%` }} />
              </div>
            )}
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3">
                  {goal.completed ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className={`text-sm ${goal.completed ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>{goal.title}</p>
                    {goal.completed_date && <p className="text-gray-400 text-xs mt-0.5">{goal.completed_date}</p>}
                  </div>
                  {goal.completed && <Award size={14} className="text-orange-400 shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
