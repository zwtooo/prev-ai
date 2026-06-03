"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Save, X, User, Target, Award, Calendar, Mail, Briefcase, Loader2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Goal = Database["public"]["Tables"]["user_goals"]["Row"];

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role_job: "",
    age: "",
    height: "",
    weight: "",
    goal: "",
  });

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: profileRaw }, { data: goalsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at"),
    ]);

    const profileData = profileRaw as Profile | null;

    if (profileData) {
      setProfile(profileData);
      setForm({
        name: profileData.name || "",
        email: profileData.email || user.email || "",
        role_job: profileData.role_job || "",
        age: profileData.age?.toString() || "",
        height: profileData.height || "",
        weight: profileData.weight || "",
        goal: profileData.goal || "",
      });
    }
    setGoals(goalsData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({
      name: form.name,
      role_job: form.role_job,
      age: form.age ? parseInt(form.age) : null,
      height: form.height,
      weight: form.weight,
      goal: form.goal,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    setProfile((p) => p ? { ...p, ...form, age: form.age ? parseInt(form.age) : null } : p);
    setEditing(false);
    setSaving(false);
  };

  const toggleGoal = async (goal: Goal) => {
    const newCompleted = !goal.completed;
    await supabase.from("user_goals").update({
      completed: newCompleted,
      completed_date: newCompleted ? new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" }) : null,
    }).eq("id", goal.id);
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, completed: newCompleted, completed_date: newCompleted ? new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" }) : null } : g));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Perfil" subtitle="Tu información personal" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  const completedGoals = goals.filter((g) => g.completed).length;
  const initials = (profile?.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Perfil" subtitle="Tu información personal y configuración" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg shadow-orange-500/30">
                  {initials}
                </div>
                <h2 className="text-gray-900 font-bold text-lg">{profile?.name || "Usuario"}</h2>
                <p className="text-gray-500 text-sm">{profile?.role_job || "Oficinista"}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{profile?.streak || 0}</p>
                  <p className="text-gray-400 text-xs">Racha</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{profile?.total_sessions || 0}</p>
                  <p className="text-gray-400 text-xs">Sesiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
                  <p className="text-gray-400 text-xs">Metas</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4">Logros</h3>
              <div className="space-y-3">
                {[
                  { icon: "💪", label: "Primera rutina completa", earned: (profile?.total_sessions || 0) >= 1 },
                  { icon: "🔥", label: "Racha de 7 días", earned: (profile?.streak || 0) >= 7 },
                  { icon: "🏋️", label: "10 sesiones completadas", earned: (profile?.total_sessions || 0) >= 10 },
                  { icon: "🏆", label: "30 sesiones completadas", earned: (profile?.total_sessions || 0) >= 30 },
                  { icon: "⭐", label: "Racha de 30 días", earned: (profile?.streak || 0) >= 30 },
                ].map((ach, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${ach.earned ? "bg-orange-50" : "bg-gray-50 opacity-50"}`}>
                    <span className="text-xl">{ach.icon}</span>
                    <span className={`text-sm font-medium ${ach.earned ? "text-gray-800" : "text-gray-400"}`}>{ach.label}</span>
                    {ach.earned && <Award size={14} className="text-orange-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold text-base">Información personal</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium">
                    <Edit2 size={14} /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); fetchData(); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg">
                      <X size={14} /> Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg disabled:bg-orange-300">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nombre completo", key: "name", icon: User },
                  { label: "Correo electrónico", key: "email", icon: Mail, readOnly: true },
                  { label: "Puesto de trabajo", key: "role_job", icon: Briefcase },
                  { label: "Edad", key: "age", icon: Calendar },
                  { label: "Estatura", key: "height", icon: User },
                  { label: "Peso", key: "weight", icon: User },
                ].map(({ label, key, icon: Icon, readOnly }) => (
                  <div key={key}>
                    <label className="flex items-center gap-1.5 text-gray-600 text-sm font-medium mb-1.5">
                      <Icon size={13} className="text-orange-500" /> {label}
                    </label>
                    {editing && !readOnly ? (
                      <input type="text" value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                    ) : (
                      <p className="text-gray-900 text-sm px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        {form[key as keyof typeof form] || "—"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-1.5 text-gray-600 text-sm font-medium mb-1.5">
                  <Target size={13} className="text-orange-500" /> Objetivo principal
                </label>
                {editing ? (
                  <textarea value={form.goal} onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))} rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none" />
                ) : (
                  <p className="text-gray-900 text-sm px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">{form.goal || "—"}</p>
                )}
              </div>
            </div>

            {/* Goals */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold">Mis metas</h3>
                <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {completedGoals}/{goals.length}
                </span>
              </div>
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleGoal(goal)}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${goal.completed ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                      {goal.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${goal.completed ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>{goal.title}</p>
                      {goal.completed_date && <p className="text-gray-400 text-xs">{goal.completed_date}</p>}
                    </div>
                    {goal.completed && <Award size={14} className="text-orange-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
