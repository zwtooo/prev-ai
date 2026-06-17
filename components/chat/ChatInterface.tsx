"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, User, RotateCcw, Lightbulb, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Tengo dolor de cuello después de trabajar. ¿Qué hago?",
  "¿Cuántas pausas activas debo hacer al día?",
  "Mi espalda baja me duele al sentarme mucho. ¿Qué ejercicios me recomiendas?",
  "¿Cómo configuro mi silla para no lesionarme?",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatInterface() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de prevención de lesiones 👋. Estoy aquí para ayudarte con dudas sobre molestias físicas, hábitos saludables, ejercicios de oficina y mucho más. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idCounter = useRef(0);
  const nextId = () => `m${idCounter.current++}`;

  const loadHistory = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data && data.length > 0) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    }
    setLoadingHistory(false);
  }, [supabase]);

  useEffect(() => {
    // Intentional one-time history fetch on mount; setState happens after async I/O.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!loadingHistory) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingHistory]);

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || streamingId) return;

    const userMsg: Message = {
      id: nextId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    await saveMessage("user", text.trim());

    const assistantId = nextId();
    let assistantAdded = false;

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => m.id !== "0")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok || !response.body) throw new Error("Error");

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);
      assistantAdded = true;
      setLoading(false);
      setStreamingId(assistantId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunks.push(chunk);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        );
      }

      setStreamingId(null);
      await saveMessage("assistant", chunks.join(""));
    } catch {
      setStreamingId(null);
      const errContent = "Lo siento, hubo un problema. Por favor inténtalo de nuevo.";
      if (!assistantAdded) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: errContent, timestamp: new Date() },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.content ? { ...m, content: errContent } : m
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([
      {
        id: "0",
        role: "assistant",
        content:
          "¡Hola! Soy tu asistente de prevención de lesiones 👋. ¿En qué puedo ayudarte hoy?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isOnlyWelcome = messages.length === 1 && messages[0].id === "0";
  const isDisabled = loading || !!streamingId;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat Header */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm">Asistente prev.ai</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <p className="text-gray-400 dark:text-gray-500 text-xs">En línea · IA especializada en lesiones</p>
            </div>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Nueva conversación</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 min-h-0">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-green-600 dark:text-green-400 animate-spin" />
          </div>
        ) : (
          <>
            {isOnlyWelcome && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-green-600 dark:text-green-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Preguntas sugeridas</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:border-green-300 hover:bg-green-50 text-sm text-gray-600 dark:text-gray-300 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-green-600" : "bg-gray-900"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Zap size={14} className="text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[78%] flex flex-col gap-1 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                    {msg.id === streamingId && (
                      <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                  {msg.content && (
                    <span className="text-gray-400 dark:text-gray-500 text-xs px-1">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-white" />
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-slate-700 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3 items-end"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta... (Enter para enviar)"
            rows={1}
            disabled={isDisabled}
            className="flex-1 px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-all resize-none overflow-hidden disabled:opacity-50"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isDisabled}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 text-center">
          prev.ai puede cometer errores. Consulta siempre a un profesional de salud para
          diagnósticos.
        </p>
      </div>
    </div>
  );
}
