// src/hooks/useTheme.js
// ─────────────────────────────────────────────────────────────
// Persistent dark/light mode — survives page changes
// Usage: const { dark, toggleTheme, T } = useTheme();
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { getTheme } from "../theme";

export default function useTheme() {
  const [dark, setDark] = useState(() => {
    // Read from localStorage on first load
    const saved = localStorage.getItem("ashfitverse_theme");
    if (saved !== null) return saved === "dark";
    // Default: dark mode
    return true;
  });

  const T = getTheme(dark);

  const toggleTheme = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("ashfitverse_theme", next ? "dark" : "light");
      return next;
    });
  };

  // Sync html data-theme attribute (for potential CSS var usage)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [dark, T.bg, T.text]);

  return { dark, toggleTheme, T };
}