// src/mobile/screens/MobileHubScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileHubScreen({
  user,
  dark,
  toggleTheme,
  T,
  isFemale,
  isMale,
  isPro,
  clearUser,
  onOpenFeedbackModal,
}) {
  const navigate = useNavigate();

  const calculators = [
    { name: "BMI Calculator", sub: "Body mass index", icon: "📊", path: "/bmi-calculator", color: "#3b82f6" },
    { name: "Daily Calorie TDEE", sub: "Metabolic expenditure", icon: "🔥", path: "/calorie-calculator", color: "#f97316" },
    { name: "Body Fat %", sub: "Lean mass estimation", icon: "⚖️", path: "/fat-calculator", color: "#10b981" },
  ];

  const femaleHubs = [
    { name: "Cycle Tracker", sub: "Phase forecasting & symptoms", icon: "🌸", path: "/cycle-tracker", color: "#f43f5e" },
    { name: "Hormone Nutrition", sub: "Follicular & luteal food guide", icon: "🥗", path: "/hormone-nutrition", color: "#ec4899" },
    { name: "PCOS Support", sub: "Insulin & symptom management", icon: "🧬", path: "/pcos-guide", color: "#a855f7" },
    { name: "Mental Wellness", sub: "Mind-muscle & stress recovery", icon: "🧠", path: "/female-mental", color: "#3b82f6" },
  ];

  const maleHubs = [
    { name: "Testosterone Health", sub: "Endocrine & vigor protocols", icon: "⚡", path: "/testosterone-health", color: "#3b82f6" },
    { name: "Sleep & Recovery", sub: "Deep delta wave architecture", icon: "🌙", path: "/sleep-tracker", color: "#8b5cf6" },
    { name: "Mental Performance", sub: "Focus, dopamine & discipline", icon: "🧠", path: "/male-mental-health", color: "#10b981" },
    { name: "Sexual Wellness", sub: "Vitality, stamina & bloodflow", icon: "🔥", path: "/sexual-wellness", color: "#f97316" },
  ];

  const activeHubs = isFemale ? femaleHubs : maleHubs;

  return (
    <div className="mob-hub-screen">
      {/* ── Athlete Profile Summary Card ── */}
      <div
        className="mob-card"
        onClick={() => navigate("/profile")}
        style={{
          background: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.09)" : "rgba(0, 0, 0, 0.07)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="mob-avatar-wrap" style={{ width: 50, height: 50 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="mob-avatar-img" />
            ) : (
              <div className="mob-avatar-fallback" style={{ fontSize: 20 }}>
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <div className="mob-avatar-online" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)" }}>
                {user?.name || "Athlete"}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 6,
                  background: isPro ? "rgba(59,130,246,0.2)" : "rgba(100,116,139,0.2)",
                  color: isPro ? "#3b82f6" : "#94a3b8",
                }}
              >
                {isPro ? "PRO OS" : "FREE"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginTop: 2 }}>
              {user?.goal?.replace(/_/g, " ") || "General Fitness"} · {user?.weight || 58} kg
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6" }}>Edit →</div>
      </div>

      {/* ── Health Hub Section ── */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: isFemale ? "#f43f5e" : "#3b82f6" }}>
          {isFemale ? "Women's Health Hub" : "Men's Health Hub"}
        </span>
        <span
          onClick={() => navigate(isFemale ? "/female-health" : "/male-health")}
          style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", cursor: "pointer" }}
        >
          Open Hub →
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {activeHubs.map((hub) => (
          <div
            key={hub.name}
            onClick={() => navigate(hub.path)}
            className="mob-card"
            style={{
              margin: 0,
              padding: 13,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{hub.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)" }}>
              {hub.name}
            </div>
            <div style={{ fontSize: 10.5, color: dark ? "#94a3b8" : "#64748b", marginTop: 2, lineHeight: 1.3 }}>
              {hub.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Telemetry & Calculators ── */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f97316" }}>
          Athletic Calculators
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {calculators.map((calc) => (
          <div
            key={calc.name}
            onClick={() => navigate(calc.path)}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{calc.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a" }}>
                  {calc.name}
                </div>
                <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b" }}>
                  {calc.sub}
                </div>
              </div>
            </div>
            <div style={{ color: calc.color, fontSize: 14, fontWeight: 800 }}>→</div>
          </div>
        ))}
      </div>

      {/* ── Shop & Pricing ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button
          onClick={() => navigate("/shop")}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            color: dark ? "#f8fafc" : "#0f172a",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <span>🛍️</span> Wellness Shop
        </button>

        <button
          onClick={() => navigate("/pricing")}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <span>💎</span> Upgrade Pass
        </button>
      </div>

      {/* ── System & Account Controls ── */}
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: dark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f8fafc" : "#0f172a" }}>
            Theme ({dark ? "Obsidian Dark" : "Executive Light"})
          </span>
          <button
            onClick={toggleTheme}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: dark ? "#ffffff" : "#0f172a",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f8fafc" : "#0f172a" }}>
            Athlete Feedback
          </span>
          <button
            onClick={onOpenFeedbackModal}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "none",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            💬 Send Feedback
          </button>
        </div>

        <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }} />

        <button
          onClick={() => {
            clearUser && clearUser();
            navigate("/");
          }}
          style={{
            width: "100%",
            height: 40,
            borderRadius: 10,
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          Sign Out of AshFitVerse
        </button>
      </div>
    </div>
  );
}
