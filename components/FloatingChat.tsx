"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, X, ArrowRight, Minus } from "lucide-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
          <div className="bg-[#0f172a] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Zap size={15} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-sm font-semibold">IA Entrenamiento</p>
                  <span className="bg-orange-500/25 text-orange-400 text-xs font-medium px-1.5 py-0.5 rounded-full border border-orange-500/20">
                    Beta
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-[#0f172a] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={12} className="text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-700 leading-relaxed">
                ¡Hola! Soy tu IA entrenadora y kinesióloga deportiva. Estoy aquí para ayudarte a prevenir lesiones. ¿En qué puedo ayudarte hoy?
              </div>
            </div>
            <p className="text-gray-400 text-[11px] text-right">10:30 AM ✓</p>
          </div>

          <div className="px-4 pb-4">
            <Link
              href="/chat"
              onClick={() => setIsOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Abrir chat <ArrowRight size={14} />
            </Link>
            <p className="text-gray-400 text-[10px] text-center mt-2">
              La IA puede cometer errores. Consulta con un profesional de la salud.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-[#0f172a] text-white rounded-2xl px-4 py-3 shadow-xl hover:bg-[#1e293b] transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">IA Entrenamiento</p>
            <p className="text-xs text-gray-400">Tu asistente inteligente 24/7</p>
          </div>
          <span className="ml-1 bg-orange-500/20 text-orange-400 text-xs font-medium px-1.5 py-0.5 rounded-full border border-orange-500/20">
            Nuevo
          </span>
        </button>
      )}
    </div>
  );
}
