"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const colorMap: Record<string, { bg: string; text: string }> = {
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
};

export default function RemindersPage() {
  const supabase = createClient();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    time: "09:00",
    days: [] as string[],
    icon: "⏰",
    color: "orange",
  });

  const fetchReminders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setReminders(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const toggleReminder = async (id: string, active: boolean) => {
    await supabase.from("reminders").update({ active: !active }).eq("id", id);
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, active: !active } : r));
  };

  const deleteReminder = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleDay = (day: string) => {
    setNewReminder((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  const addReminder = async () => {
    if (!newReminder.title.trim() || newReminder.days.length === 0) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("reminders").insert({
      user_id: user.id,
      ...newReminder,
      active: true,
    }).select().single();

    if (data) setReminders((prev) => [...prev, data]);
    setNewReminder({ title: "", description: "", time: "09:00", days: [], icon: "⏰", color: "orange" });
    setShowModal(false);
    setSaving(false);
  };

  const activeCount = reminders.filter((r) => r.active).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Recordatorios" subtitle="Mantén tus hábitos saludables con alertas programadas" />

      <main className="flex-1 p-4 lg:p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: reminders.length, color: "text-gray-900" },
            { label: "Activos", value: activeCount, color: "text-green-600" },
            { label: "Inactivos", value: reminders.length - activeCount, color: "text-gray-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-semibold">Mis recordatorios</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Nuevo recordatorio
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const c = colorMap[reminder.color] || colorMap.orange;
              return (
                <div
                  key={reminder.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4 transition-all ${
                    reminder.active ? "border-gray-200" : "border-gray-100 opacity-60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>
                    {reminder.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900 font-medium text-sm">{reminder.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                        {reminder.time}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{reminder.description}</p>
                    <div className="flex gap-1 mt-2">
                      {DAY_LABELS.map((day) => (
                        <span
                          key={day}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            reminder.days.includes(day)
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-300"
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleReminder(reminder.id, reminder.active)} className="text-gray-400 hover:text-orange-500 transition-colors">
                      {reminder.active ? <ToggleRight size={28} className="text-orange-500" /> : <ToggleLeft size={28} />}
                    </button>
                    <button onClick={() => deleteReminder(reminder.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {reminders.length === 0 && (
              <div className="text-center py-16">
                <Bell size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tienes recordatorios</p>
                <p className="text-gray-400 text-sm mt-1">Crea uno para mantener tus hábitos saludables</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-gray-900 font-bold text-lg mb-5">Nuevo recordatorio</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">Título</label>
                <input type="text" value={newReminder.title} onChange={(e) => setNewReminder((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Pausa activa"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">Descripción</label>
                <input type="text" value={newReminder.description} onChange={(e) => setNewReminder((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descripción breve"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1.5">Hora</label>
                  <input type="time" value={newReminder.time} onChange={(e) => setNewReminder((p) => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1.5">Icono</label>
                  <input type="text" value={newReminder.icon} onChange={(e) => setNewReminder((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-2">Color</label>
                <div className="flex gap-2">
                  {Object.keys(colorMap).map((c) => (
                    <button key={c} type="button" onClick={() => setNewReminder((p) => ({ ...p, color: c }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${newReminder.color === c ? "border-orange-500 " + colorMap[c].bg : "border-transparent " + colorMap[c].bg}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-2">Días</label>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        newReminder.days.includes(day) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={addReminder} disabled={!newReminder.title.trim() || newReminder.days.length === 0 || saving}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : "Crear recordatorio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
