import {
  ArrowRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  BarChart3,
  BookOpen,
  Play,
  Clock,
  ChevronDown,
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

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const exerciseCardBg = [
  "from-[#1a1f3c] via-[#2d1b6b] to-[#0d0d1a]",
  "from-[#0d2137] via-[#1a4a6b] to-[#0a1520]",
  "from-[#142e1f] via-[#1a6b3d] to-[#0a1a10]",
  "from-[#1a0d2e] via-[#4a1a6b] to-[#0d0a1f]",
];

const articles = [
  {
    title: "5 claves para prevenir el dolor lumbar en la oficina",
    desc: "Aprende cómo reducir el riesgo de lesiones al estar sentado muchas horas.",
    time: "5 min de lectura",
    gradient: "from-emerald-500 to-green-600",
    icon: "🪑",
  },
  {
    title: "¿Por qué es importante el descanso?",
    desc: "El descanso es parte del cuidado del cuerpo. Descubre por qué.",
    time: "4 min de lectura",
    gradient: "from-teal-500 to-emerald-600",
    icon: "😴",
  },
];

const footerFeatures = [
  { icon: Shield, title: "Prevención personalizada", desc: "Rutinas adaptadas a ti y a tu trabajo." },
  { icon: BarChart3, title: "Seguimiento constante", desc: "Monitoreamos tu progreso semana a semana." },
  { icon: BookOpen, title: "Educación continua", desc: "Aprende para prevenir y rendir más." },
];

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

  void goals;

  // Weekly stats
  const now = new Date();
  const weeklyStats = dayNames.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - ((now.getDay() - i + 7) % 7));
    const dayStr = d.toISOString().split("T")[0];
    const mins = sessions
      .filter((s) => s.completed_at.startsWith(dayStr))
      .reduce((a, s) => a + s.duration_minutes, 0);
    return { day, minutes: mins };
  });

  const activeDays = weeklyStats.filter((d) => d.minutes > 0).length;
  const weeklyCompliance = Math.round((activeDays / 7) * 100);
  const streak = profile?.streak || 0;
  const riskLevel = streak >= 5 ? "Bajo" : streak >= 2 ? "Moderado" : "Alto";
  const fatigueLevel = activeDays >= 5 ? "Alta" : activeDays >= 3 ? "Moderada" : "Baja";

  const featuredRoutine = homeRoutines[0];

  // Calendar
  const weekDaysAbr = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const todayJS = now.getDay();
  const todayWeekIdx = todayJS === 0 ? 6 : todayJS - 1;
  const weekDates = weekDaysAbr.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - todayWeekIdx + i);
    return { day, num: d.getDate(), isToday: i === todayWeekIdx };
  });

  // Circular SVG progress
  const R = 30;
  const CIRC = 2 * Math.PI * R;
  const complianceOffset = CIRC - (weeklyCompliance / 100) * CIRC;
  const complianceStroke =
    weeklyCompliance >= 70 ? "#16a34a" : weeklyCompliance >= 40 ? "#f97316" : "#ef4444";

  // Pain dots positions on body SVG
  const painDots = [
    { cx: 40, cy: 30, area: "Cuello" },
    { cx: 22, cy: 42, area: "Hombros" },
    { cx: 40, cy: 52, area: "Espalda alta" },
    { cx: 40, cy: 72, area: "Espalda baja" },
    { cx: 12, cy: 86, area: "Muñecas" },
  ];

  // Risk presentation
  const RiskIcon = riskLevel === "Bajo" ? ShieldCheck : ShieldAlert;
  const riskTone =
    riskLevel === "Bajo"
      ? { text: "text-green-600 dark:text-green-400", bar: "bg-green-500", w: "w-3/12", iconBg: "bg-green-50 dark:bg-green-500/10", icon: "text-green-600 dark:text-green-400" }
      : riskLevel === "Moderado"
      ? { text: "text-orange-500 dark:text-orange-400", bar: "bg-orange-500", w: "w-6/12", iconBg: "bg-orange-50 dark:bg-orange-500/10", icon: "text-orange-500 dark:text-orange-400" }
      : { text: "text-red-500 dark:text-red-400", bar: "bg-red-500", w: "w-10/12", iconBg: "bg-red-50 dark:bg-red-500/10", icon: "text-red-500 dark:text-red-400" };

  const fatigueTone =
    fatigueLevel === "Baja"
      ? { text: "text-green-600 dark:text-green-400", bar: "bg-green-500", w: "w-3/12" }
      : fatigueLevel === "Moderada"
      ? { text: "text-orange-500 dark:text-orange-400", bar: "bg-orange-500", w: "w-6/12" }
      : { text: "text-red-500 dark:text-red-400", bar: "bg-red-500", w: "w-10/12" };

  const complianceText =
    weeklyCompliance >= 70
      ? "text-green-600 dark:text-green-400"
      : weeklyCompliance >= 40
      ? "text-orange-500 dark:text-orange-400"
      : "text-red-500 dark:text-red-400";

  const cardClass = "bg-white dark:bg-[#0f172a] dark:border dark:border-slate-800 rounded-2xl shadow-sm";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F8] dark:bg-[#0b1120]">
      <DashboardTopBar formattedDate={formattedDate} />

      <main className="flex-1 px-4 lg:px-6 pb-24 lg:pb-8 space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Vamos a cuidar tu cuerpo para que sigas rindiendo al máximo.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* 3 stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Riesgo de lesión */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Riesgo de lesión</p>
                  <div className={`w-9 h-9 ${riskTone.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                    <RiskIcon size={18} className={riskTone.icon} />
                  </div>
                </div>
                <p className={`font-bold text-2xl ${riskTone.text}`}>{riskLevel}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 leading-snug">
                  {riskLevel === "Bajo"
                    ? "Tu riesgo actual es bajo. ¡Sigue así!"
                    : riskLevel === "Moderado"
                    ? "Mantén tu rutina de ejercicios."
                    : "Intenta ser más constante esta semana."}
                </p>
                <div className="mt-4 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${riskTone.bar} ${riskTone.w}`} />
                </div>
              </div>

              {/* Fatiga */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fatiga</p>
                  <div className="w-9 h-9 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <Activity size={18} className={fatigueTone.text} />
                  </div>
                </div>
                <p className={`font-bold text-2xl ${fatigueTone.text}`}>{fatigueLevel}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 leading-snug">
                  Tu nivel de fatiga es {fatigueLevel.toLowerCase()}. Recuerda descansar bien.
                </p>
                <div className="mt-4 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fatigueTone.bar} ${fatigueTone.w}`} />
                </div>
              </div>

              {/* Cumplimiento semanal */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cumplimiento semanal</p>
                    <p className={`font-bold text-3xl mt-1 ${complianceText}`}>{weeklyCompliance}%</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 leading-snug">
                      {weeklyCompliance >= 70
                        ? "¡Muy buen trabajo! 💪"
                        : weeklyCompliance >= 40
                        ? "Buen progreso, ¡tú puedes!"
                        : "Intenta ser más constante."}
                    </p>
                  </div>
                  <svg width="60" height="60" viewBox="0 0 70 70" className="shrink-0">
                    <circle cx="35" cy="35" r={R} fill="none" className="stroke-gray-200 dark:stroke-slate-700" strokeWidth="7" />
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
                  </svg>
                </div>
              </div>
            </div>

            {/* Rutina de hoy */}
            <div className={`${cardClass} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Rutina de hoy</h2>
                  <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                    {featuredRoutine.exercises.length} ejercicios programados
                  </span>
                </div>
                <Link
                  href="/routines"
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  Ver rutina completa <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {featuredRoutine.exercises.slice(0, 4).map((ex, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${exerciseCardBg[i]}`}
                    style={{ aspectRatio: "3/4" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 70%)",
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                      style={{ filter: "grayscale(100%)" }}
                    >
                      <span style={{ fontSize: "5rem", opacity: 0.08 }}>{ex.icon}</span>
                    </div>
                    <div className="absolute top-3 left-3 text-white/60 text-sm font-bold">{i + 1}.</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                        <Play size={16} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 p-3"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
                    >
                      <p className="text-white font-semibold text-xs leading-tight">
                        {i + 1}. {ex.name}
                      </p>
                      <p className="text-white/55 text-xs mt-0.5">
                        {ex.sets} series × {ex.reps}
                      </p>
                      <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded-lg transition-colors font-medium">
                        Marcar como completado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artículos + Calendario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Artículos recomendados */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900 dark:text-white font-semibold">Artículos recomendados</h2>
                  <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors">
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {articles.map((article, i) => (
                    <div key={i} className="flex gap-3 cursor-pointer group">
                      <div
                        className={`w-20 h-20 rounded-xl bg-gradient-to-br ${article.gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <span className="text-3xl">{article.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-gray-100 text-sm font-semibold leading-tight group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                          {article.title}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 line-clamp-2">{article.desc}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 flex items-center gap-1">
                          <Clock size={11} /> {article.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendario / Microciclo */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900 dark:text-white font-semibold text-sm">Calendario / Microciclo</h2>
                  <Link
                    href="/reminders"
                    className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    Ver calendario completo
                  </Link>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-4">
                  {weekDates.map(({ day, num, isToday }) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-gray-400 dark:text-gray-500 text-[10px]">{day[0]}</span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isToday
                            ? "bg-green-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {todayReminders.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-slate-800"
                    >
                      <span className="text-base shrink-0">{r.icon}</span>
                      <p className="text-gray-700 dark:text-gray-200 text-xs font-medium flex-1 truncate">{r.title}</p>
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-mono shrink-0">{r.time}</span>
                    </div>
                  ))}
                  {todayReminders.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs text-center py-2">No hay eventos para hoy</p>
                  )}
                </div>
                {todayReminders.length > 0 && (
                  <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-3 text-center leading-snug">
                    No olvides registrar tu carga y molestias del día.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            {/* Progress chart */}
            <div className={`${cardClass} p-5`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-900 dark:text-white font-semibold text-sm">Tu progreso</h2>
                <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Esta semana <ChevronDown size={12} className="text-gray-400 dark:text-gray-500" />
                </button>
              </div>
              <WeeklyChart data={weeklyStats} />
            </div>

            {/* Zonas de atención */}
            <div className={`${cardClass} p-5`}>
              <h2 className="text-gray-900 dark:text-white font-semibold text-sm mb-3">Zonas de atención</h2>
              <div className="flex gap-4">
                <div className="shrink-0">
                  <svg viewBox="0 0 80 160" width="70" height="140" fill="none" className="fill-slate-200 stroke-slate-200 dark:fill-slate-700 dark:stroke-slate-700">
                    <ellipse cx="40" cy="14" rx="11" ry="12" />
                    <rect x="36" y="25" width="8" height="7" rx="2" />
                    <path d="M22 34 L16 72 Q18 80 40 80 Q62 80 64 72 L58 34 Z" />
                    <path d="M22 38 Q10 58 13 90" fill="none" strokeWidth="10" strokeLinecap="round" />
                    <path d="M58 38 Q70 58 67 90" fill="none" strokeWidth="10" strokeLinecap="round" />
                    <path d="M33 79 Q30 112 29 140" fill="none" strokeWidth="11" strokeLinecap="round" />
                    <path d="M47 79 Q50 112 51 140" fill="none" strokeWidth="11" strokeLinecap="round" />
                    {painAreas.map((area, idx) => {
                      const dot = painDots[idx];
                      if (!dot) return null;
                      const color =
                        area.level <= 3 ? "#22c55e" : area.level <= 6 ? "#EAB308" : "#ef4444";
                      return (
                        <circle
                          key={area.area}
                          cx={dot.cx}
                          cy={dot.cy}
                          r="4.5"
                          fill={color}
                          className="stroke-white dark:stroke-[#0f172a]"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex-1 space-y-0.5">
                  {painAreas.map((area) => {
                    const label =
                      area.level <= 3 ? "Riesgo bajo" : area.level <= 6 ? "Riesgo moderado" : "Riesgo alto";
                    const dot =
                      area.level <= 3 ? "bg-green-500" : area.level <= 6 ? "bg-yellow-400" : "bg-red-500";
                    return (
                      <div
                        key={area.area}
                        className="flex items-center gap-2 py-1.5 border-b border-gray-50 dark:border-slate-800 last:border-0"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                        <span className="text-gray-700 dark:text-gray-200 text-xs flex-1">{area.area}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] text-right">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="mt-4 w-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Ver recomendaciones
              </button>
            </div>
          </div>
        </div>

        {/* Footer dark band */}
        <div className="bg-[#0f172a] dark:bg-black/30 dark:border dark:border-slate-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {footerFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/15 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FloatingChat defaultOpen />
    </div>
  );
}
