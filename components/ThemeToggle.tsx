"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  /** "row" = full-width labelled button (sidebar); "icon" = compact icon button */
  variant?: "row" | "icon";
  className?: string;
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const Icon = dark ? Sun : Moon;
  const label = dark ? "Modo claro" : "Modo oscuro";

  if (variant === "row") {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-150 ${className}`}
      >
        <Icon size={16} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-500 hover:text-gray-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:text-white transition-colors ${className}`}
    >
      <Icon size={17} />
    </button>
  );
}
