"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, X, Minus, Send, Check, CheckCheck } from "lucide-react";

const quickReplies = ["Sí, ajustar rutina", "¿Es grave?", "Más consejos"];

const recommendations = [
  "Realizar estiramientos suaves de lumbar",
  "Aplicar pausas activas cada 45 min",
  "Revisar la altura de tu silla y pantalla",
  "Evitar cargar peso de forma brusca",
];

export default function FloatingChat({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const router = useRouter();
  const goToChat = () => router.push("/chat");

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl px-4 py-3 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Bot size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">IA Entrenamiento</p>
            <p className="text-xs text-gray-400 dark:text-gray-400">Tu asistente inteligente 24/7</p>
          </div>
          <span className="ml-1 bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
            Nuevo
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30 w-[calc(100vw-2rem)] sm:w-[340px]">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-gray-900 dark:text-white text-sm font-semibold">IA Entrenamiento</p>
              <span className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Minimizar chat"
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-white/5 p-1 rounded-lg transition-colors"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-white/5 p-1 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gray-50/50 dark:bg-slate-900/40">
          {/* Assistant greeting */}
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div>
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 dark:text-gray-200 leading-relaxed shadow-sm">
                ¡Hola! 👋 Soy tu IA de prevención y ergonomía. Estoy aquí para ayudarte a cuidar tu
                postura y prevenir lesiones en la oficina. ¿En qué puedo ayudarte hoy?
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1 ml-1">10:30 AM</p>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed">
                Siento una molestia en la espalda baja después de estar sentado todo el día. ¿Qué
                puedo hacer?
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1 mr-1 flex items-center justify-end gap-0.5">
                10:31 AM <CheckCheck size={11} className="text-green-500" />
              </p>
            </div>
          </div>

          {/* Assistant reply */}
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div>
              <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 dark:text-gray-200 leading-relaxed shadow-sm">
                <p className="mb-1.5">Puede ser sobrecarga lumbar por estar mucho tiempo sentado. Te recomiendo:</p>
                <ul className="space-y-1">
                  {recommendations.map((r) => (
                    <li key={r} className="flex items-start gap-1.5">
                      <Check size={12} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5">¿Quieres que ajuste tu rutina de prevención de hoy?</p>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1 ml-1">10:31 AM</p>
            </div>
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5 pl-8">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={goToChat}
                className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-100 hover:bg-green-100 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20 dark:hover:bg-green-500/20 px-2.5 py-1 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje…"
              onFocus={goToChat}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              className="w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] text-center mt-2 leading-snug">
            La IA puede cometer errores. Consulta siempre con un profesional de la salud.
          </p>
        </div>
      </div>
    </div>
  );
}
