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

  const mobTabs = [
    { label: "Home", icon: "⚡", path: "/dashboard" },
    { label: "Train", icon: "🏋️", path: "/workout-planner" },
    { label: "Fuel", icon: "🥗", path: "/diet-logger" },
    { label: "Squad", icon: "👥", path: "/community" },
    { label: "Profile", icon: "👤", path: "/profile" },
  ];

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

        {/* ── Mobile Persistent Bottom Dock ── */}
        {isMobile && (
          <nav
            style={{
              position: "fixed",
              bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
              left: 14,
              right: 14,
              height: 60,
              borderRadius: 28,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 8px",
              boxSizing: "border-box",
              background: dark ? "rgba(13, 16, 26, 0.95)" : "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.08)"}`,
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            {mobTabs.map((t) => {
              const isActive = location.pathname.startsWith(t.path);
              return (
                <button
                  key={t.label}
                  onClick={() => navigate(t.path)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 2px",
                    color: isActive ? "#3b82f6" : dark ? "rgba(241, 245, 249, 0.55)" : "rgba(15, 23, 42, 0.55)",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: FONT.display }}>{t.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}