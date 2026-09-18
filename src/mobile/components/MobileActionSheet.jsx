// src/mobile/components/MobileActionSheet.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileActionSheet({
  isOpen,
  onClose,
  dark,
  T,
  onQuickWater,
  onOpenWeightModal,
  onCheckInChallenge,
  activeChallengeTitle,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleTileClick = (action) => {
    onClose();
    action();
  };

  const actions = [
    {
      id: "workout",
      icon: "🏋️",
      title: "Log Workout",
      sub: "Sets, reps & weights",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
      action: () => navigate("/workout-logger"),
    },
    {
      id: "meal",
      icon: "🥗",
      title: "Log Meal",
      sub: "Calories & macros",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      action: () => navigate("/diet-logger"),
    },
    {
      id: "water",
      icon: "💧",
      title: "+250ml Water",
      sub: "Instant hydration",
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)",
      action: () => onQuickWater && onQuickWater(),
    },
    {
      id: "weight",
      icon: "⚖️",
      title: "Log Weight",
      sub: "Track body progress",
      color: "#a855f7",
      bg: "rgba(168, 85, 247, 0.12)",
      action: () => onOpenWeightModal && onOpenWeightModal(),
    },
    {
      id: "habit",
      icon: "🔥",
      title: "Habit Check-in",
      sub: activeChallengeTitle ? `Check: ${activeChallengeTitle}` : "Daily consistency",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.12)",
      action: () => onCheckInChallenge && onCheckInChallenge(),
    },
    {
      id: "calc",
      icon: "⚡",
      title: "Calculators",
      sub: "BMI, TDEE & Fat %",
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.12)",
      action: () => navigate("/calorie-calculator"),
    },
  ];

  return (
    <div className="mob-sheet-backdrop" onClick={onClose}>
      <div
        className="mob-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: dark ? "#0d101a" : "#ffffff",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
          boxShadow: `0 -12px 40px ${dark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.15)"}`,
        }}
      >
        <div className="mob-sheet-pill-handle" />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3b82f6" }}>
              Quick Action Center
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--mobile-font-display)", color: dark ? "#f8fafc" : "#0f172a" }}>
              Fast Athlete Entry
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: dark ? "#cbd5e1" : "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        <div className="mob-sheet-grid">
          {actions.map((act) => (
            <div
              key={act.id}
              className="mob-sheet-tile"
              onClick={() => handleTileClick(act.action)}
              style={{
                background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: act.bg,
                  boxShadow: `0 4px 12px ${act.color}25`,
                }}
              >
                {act.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)" }}>
                  {act.title}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: dark ? "rgba(241,245,249,0.55)" : "rgba(15,23,42,0.55)", marginTop: 2 }}>
                  {act.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
