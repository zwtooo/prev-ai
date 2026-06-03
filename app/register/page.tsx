"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        email,
        goal: "Prevenir lesiones y mejorar mi postura en el trabajo",
        streak: 0,
        total_sessions: 0,
      });

      const defaultGoals = [
        "Completar 7 días seguidos de pausa activa",
        "Terminar 10 sesiones este mes",
        "Eliminar el dolor de espalda baja",
        "Mejorar la postura al sentarme",
      ];
      await supabase.from("user_goals").insert(
        defaultGoals.map((title) => ({ user_id: data.user!.id, title }))
      );

      const defaultReminders = [
        { title: "Pausa activa", description: "Levántate y estira por 5 minutos", time: "10:30", days: ["Lun","Mar","Mié","Jue","Vie"], icon: "🧘", color: "orange" },
        { title: "Hidratación", description: "Bebe un vaso de agua", time: "09:00", days: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"], icon: "💧", color: "blue" },
        { title: "Corrección de postura", description: "Revisa tu postura y ajusta la silla", time: "14:00", days: ["Lun","Mar","Mié","Jue","Vie"], icon: "🪑", color: "green" },
      ];
      await supabase.from("reminders").insert(
        defaultReminders.map((r) => ({ ...r, user_id: data.user!.id }))
      );
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-gray-900 font-bold text-xl mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Revisa tu correo <strong>{email}</strong> y confirma tu cuenta para continuar.
          </p>
          <Link href="/login" className="text-orange-500 font-medium hover:text-orange-600 text-sm">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-gray-900 font-bold text-2xl">
            prev<span className="text-orange-500">.ai</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-gray-900 font-bold text-2xl mb-1">Crea tu cuenta</h1>
          <p className="text-gray-500 text-sm mb-6">Empieza a cuidar tu salud hoy</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-1.5">Nombre completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium block mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium block mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-orange-500 font-medium hover:text-orange-600">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
