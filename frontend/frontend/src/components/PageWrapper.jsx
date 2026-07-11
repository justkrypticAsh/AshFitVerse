// src/components/PageWrapper.jsx
// ─────────────────────────────────────────────────────────────
// Shared layout used by every inner page
// Handles: orbs, bg image, sticky header, theme toggle, back btn
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../theme";

export default function PageWrapper({
  children,
  bgKey = "dashboard",   // key from BG_IMAGES
  backTo = "/dashboard",
  accentColor,           // optional override for logo span
  showBack = true,
  rightSlot,             // extra elements in header right side
}) {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const color = accentColor || T.accent;
  const css = generateCSS(T, dark);

  return (
    <>
      <style>{css}</style>
      <div
        className="page-root"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease, background 0.4s, color 0.4s" }}
      >
        {/* ── Dynamic BG image ── */}
        {BG_IMAGES[bgKey] && (
          <div className="bg-image-layer">
            <img src={BG_IMAGES[bgKey]} alt="" loading="lazy" />
          </div>
        )}

        {/* ── Ambient orbs ── */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* ── Sticky header ── */}
        <header className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {showBack && (
              <button className="back-btn" onClick={() => navigate(backTo)}>
                ← Back
              </button>
            )}
            <div className="logo-text" style={{ fontFamily: FONT.display }}>
              AshFit<span style={{ color }}>Verse</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {rightSlot}
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}