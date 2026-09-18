// src/components/PageWrapper.jsx
// ─────────────────────────────────────────────────────────────
// Shared layout used by every inner page
// Handles: orbs, bg image, sticky header, theme toggle, back btn
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import useIsMobile from "../hooks/useIsMobile";
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
  const location = useLocation();
  const isMobile = useIsMobile(840);
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
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s ease, background 0.4s, color 0.4s",
          paddingBottom: isMobile ? "calc(88px + env(safe-area-inset-bottom, 0px))" : undefined,
        }}
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
        <header className="page-header" style={{ height: 60, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {showBack && (
              <button className="back-btn" onClick={() => navigate(backTo)}>
                ← Back
              </button>
            )}
            <div
              className="logo-text"
              style={{ fontFamily: FONT.display, cursor: "pointer" }}
              onClick={() => navigate("/dashboard")}
            >
              AshFit<span style={{ color }}>Verse</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {rightSlot}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <div className="toggle-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {dark ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
              </div>
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