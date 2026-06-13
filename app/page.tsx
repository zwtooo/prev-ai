import {
  ArrowRight,
  Shield,
  Activity,
  BarChart3,
  BookOpen,
  Play,
  Clock,
} from "lucide-react";
import { homeRoutines, painAreas } from "@/lib/data";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import WeeklyChart from "@/components/WeeklyChart";
import DashboardTopBar from "@/components/layout/DashboardTopBar";
import FloatingChat from "@/components/FloatingChat";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Goal = Database["public"]["Tables"]["user_goals"]["Row"];
type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
type Session = { completed_at: string; duration_minutes: number };

const cardBg = [
  "from-blue-900 to-indigo-950",
  "from-emerald-900 to-teal-950",
  "from-orange-900 to-red-950",
  "from-purple-900 to-pink-950",
];

const articles = [
  {
    title: "5 claves para prevenir lesiones en isquiotibiales",
    desc: "Aprende cómo reducir el riesgo de lesiones en esta zona tan importante.",
    time: "5 min de lectura",
    gradient: "from-blue-400 to-indigo-500",
    icon: "🦵",
  },
  {
    title: "¿Por qué es importante el descanso?",
    desc: "El descanso es parte del entrenamiento. Descúbrelo por qué.",
    time: "4 min de lectura",
    gradient: "from-emerald-400 to-teal-500",
    icon: "😴",
  },
];

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const formattedDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const todayName = dayNames[new Date().getDay()];

  const [
    { data: profileRaw },
    { data: remindersData },
    { data: goalsData },
    { data: sessionsData },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("reminders").select("*").eq("user_id", user.id).eq("active", true),
    supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at"),
    supabase
      .from("training_sessions")
      .select("completed_at, duration_minutes")
      .eq("user_id", user.id),
  ]);

  const profile = profileRaw as Profile | null;
  const goals: Goal[] = goalsData || [];
  const reminders: Reminder[] = remindersData || [];
  const sessions: Session[] = sessionsData || [];
  const todayReminders = reminders.filter((r) => r.days.includes(todayName));
  const firstName = (profile?.name || user.email || "").split(" ")[0];
  const fullName = profile?.name || user.email || "Usuario";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  // Weekly stats
  const weekDaysOrder = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const now = new Date();
  const weeklyStats = weekDaysOrder.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - ((now.getDay() - i + 7) % 7));
    const dayStr = d.toISOString().split("T")[0];
    const daySessions = sessions.filter((s) => s.completed_at.startsWith(dayStr));
    return { day, minutes: daySessions.reduce((a, s) => a + s.duration_minutes, 0) };
  });

  const activeDays = weeklyStats.filter((d) => d.minutes > 0).length;
  const weeklyCompliance = Math.round((activeDays / 7) * 100);
  const streak = profile?.streak || 0;
  const riskLevel = streak >= 5 ? "Bajo" : streak >= 2 ? "Moderado" : "Alto";
  const fatigueLevel =
    activeDays >= 5 ? "Alta" : activeDays >= 3 ? "Moderada" : "Baja";

  const featuredRoutine = homeRoutines[0];

  // Calendar week
  const weekDaysAbr = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const todayJS = now.getDay();
  const todayWeekIdx = todayJS === 0 ? 6 : todayJS - 1;
  const weekDates = weekDaysAbr.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - todayWeekIdx + i);
    return { day, num: d.getDate(), isToday: i === todayWeekIdx };
  });

  // Circular progress SVG
  const R = 28;
  const CIRC = 2 * Math.PI * R;
  const complianceOffset = CIRC - (weeklyCompliance / 100) * CIRC;
  const complianceStroke =
    weeklyCompliance >= 70 ? "#22c55e" : weeklyCompliance >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8]">
      <DashboardTopBar formattedDate={formattedDate} userInitials={initials} />

      <main className="flex-1 px-4 lg:px-6 pb-8 space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            ¡Hola, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Vamos a cuidar tu cuerpo para que sigas rindiendo al máximo.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* 3 stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Riesgo de lesión */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
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
                <p className="text-gray-500 text-sm font-medium">Riesgo de lesión</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      riskLevel === "Bajo"
                        ? "bg-green-500 w-2/12"
                        : riskLevel === "Moderado"
                        ? "bg-yellow-500 w-5/12"
                        : "bg-red-500 w-9/12"
                    }`}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  {riskLevel === "Bajo"
                    ? "Tu riesgo actual es bajo. ¡Sigue así!"
                    : riskLevel === "Moderado"
                    ? "Mantén tu rutina de ejercicios."
                    : "Intenta ser más constante esta semana."}
                </p>
              </div>

              {/* Fatiga */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
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
                <p className="text-gray-500 text-sm font-medium">Fatiga</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fatigueLevel === "Baja"
                        ? "bg-green-500 w-3/12"
                        : fatigueLevel === "Moderada"
                        ? "bg-orange-500 w-6/12"
                        : "bg-red-500 w-10/12"
                    }`}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Tu nivel de fatiga es {fatigueLevel.toLowerCase()}. Recuerda descansar bien.
                </p>
              </div>

              {/* Cumplimiento semanal */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-500 text-sm font-medium">Cumplimiento semanal</p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      weeklyCompliance >= 70
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {weeklyCompliance >= 70 ? "¡Muy bien!" : "En progreso"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="64" height="64" viewBox="0 0 70 70" className="shrink-0">
                    <circle cx="35" cy="35" r={R} fill="none" stroke="#E5E7EB" strokeWidth="7" />
                    <circle
                      cx="35"
                      cy="35"
                      r={R}
                      fill="none"
                      stroke={complianceStroke}
                      strokeWidth="7"
                      strokeDasharray={CIRC}
                      strokeDashoffset={complianceOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 35 35)"
                    />
                    <text
                      x="35"
                      y="40"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill="#111827"
                    >
                      {weeklyCompliance}%
                    </text>
                  </svg>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{weeklyCompliance}%</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                      {weeklyCompliance >= 70
                        ? "¡Muy buen trabajo! Sigue así 💪"
                        : weeklyCompliance >= 40
                        ? "Buen progreso, ¡tú puedes!"
                        : "Intenta ser más constante."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rutina de hoy */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 font-semibold">Rutina de hoy</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {featuredRoutine.exercises.length} ejercicios programados
                  </p>
                </div>
                <Link
                  href="/routines"
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Ver rutina completa <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {featuredRoutine.exercises.slice(0, 4).map((ex, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${cardBg[i]}`}
                    style={{ aspectRatio: "3/4" }}
                  >
                    {/* Background emoji */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <span className="text-7xl opacity-10">{ex.icon}</span>
                    </div>
                    {/* Number badge */}
                    <div className="absolute top-3 left-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                        <Play size={14} className="text-white ml-0.5" />
                      </div>
                    </div>
                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <p className="text-white font-semibold text-xs leading-tight">
                        {i + 1}. {ex.name}
                      </p>
                      <p className="text-white/60 text-xs mt-0.5">
                        {ex.sets} series × {ex.reps}
                      </p>
                      <button className="mt-2 w-full border border-white/30 text-white text-xs py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        Marcar como completado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artículos recomendados */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 font-semibold">Artículos recomendados</h2>
                <button className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
                  Ver todos
                </button>
              </div>
              <div className="space-y-4">
                {articles.map((article, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className={`w-20 h-20 rounded-xl bg-gradient-to-br ${article.gradient} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-3xl">{article.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-semibold leading-tight">
                        {article.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{article.desc}</p>
                      <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1">
                        <Clock size={11} />
                        {article.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer features */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Prevención personalizada</p>
                    <p className="text-gray-400 text-xs">Rutinas adaptadas a ti y a tu deporte.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Seguimiento constante</p>
                    <p className="text-gray-400 text-xs">Monitoreamos tu rendimiento a la semana.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Educación continua</p>
                    <p className="text-gray-400 text-xs">Aprende para prevenir y rendir más.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Progress chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-gray-900 font-semibold text-sm">Tu progreso</h2>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-gray-400 text-xs">Esta semana</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-500">{weeklyCompliance}%</span>
              </div>
              <WeeklyChart data={weeklyStats} />
            </div>

            {/* Zonas de atención */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-gray-900 font-semibold text-sm mb-4">Zonas de atención</h2>
              <div className="space-y-0.5">
                {painAreas.map((area) => {
                  const label =
                    area.level <= 3
                      ? "Riesgo bajo"
                      : area.level <= 6
                      ? "Riesgo moderado"
                      : "Riesgo alto";
                  const dotColor =
                    area.level <= 3
                      ? "bg-green-500"
                      : area.level <= 6
                      ? "bg-yellow-500"
                      : "bg-red-500";
                  return (
                    <div
                      key={area.area}
                      className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                      <span className="text-gray-700 text-sm flex-1">{area.area}</span>
                      <span className="text-gray-400 text-xs">{label}</span>
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 w-full border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Ver recomendaciones
              </button>
            </div>

            {/* Calendario / Microciclo */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 font-semibold text-sm">Calendario / Microciclo</h2>
                <Link
                  href="/reminders"
                  className="text-orange-500 text-xs font-medium hover:text-orange-600 transition-colors"
                >
                  Ver completo
                </Link>
              </div>
              {/* Week */}
              <div className="grid grid-cols-7 gap-0.5 mb-4">
                {weekDates.map(({ day, num, isToday }) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-gray-400 text-[10px]">{day[0]}</span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isToday
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </div>
                  </div>
                ))}
              </div>
              {/* Events */}
              <div className="space-y-2">
                {todayReminders.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-base shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs font-medium truncate">{r.title}</p>
                    </div>
                    <span className="text-gray-500 text-xs font-mono shrink-0">{r.time}</span>
                  </div>
                ))}
                {todayReminders.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-3">
                    No hay eventos para hoy
                  </p>
                )}
              </div>
              {todayReminders.length > 0 && (
                <p className="text-gray-400 text-[11px] mt-3 text-center leading-snug">
                  No olvides registrar tu carga y molestias del día.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingChat />
    </div>
  );
}
