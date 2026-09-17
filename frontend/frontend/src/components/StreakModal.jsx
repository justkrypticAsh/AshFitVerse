// src/components/StreakModal.jsx — Interactive Real-time Streak Center
import React from "react";
import { useNavigate } from "react-router-dom";
import { FONT } from "../theme";
import { todayKey, lastNDays } from "../lib/userLogs";

export default function StreakModal({
  isOpen,
  onClose,
  streak = 0,
  activeDates = [],
  isTodayActive = false,
  totalWorkouts = 0,
  totalMeals = 0,
  dark = true,
  T,
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const today = todayKey();

  // Compute 7 days of the current week (Mon -> Sun or Last 7 days)
  const daysList = lastNDays(7).reverse();

  // Milestone goals
  const MILESTONES = [
    { days: 3, label: "3-Day Spark", icon: "🥉" },
    { days: 7, label: "7-Day Iron Discipline", icon: "🥈" },
    { days: 14, label: "14-Day Consistency Master", icon: "🥇" },
    { days: 30, label: "30-Day Titan of Habit", icon: "👑" },
  ];

  const nextMilestone = MILESTONES.find((m) => m.days > streak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestoneDays = MILESTONES.filter((m) => m.days <= streak).pop()?.days || 0;
  const milestoneRange = Math.max(1, nextMilestone.days - prevMilestoneDays);
  const milestoneProgress = Math.min(100, Math.round(((streak - prevMilestoneDays) / milestoneRange) * 100));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 24,
          background: dark ? "rgba(18, 20, 32, 0.95)" : "#ffffff",
          border: dark ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid rgba(249, 115, 22, 0.25)",
          boxShadow: dark
            ? "0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(249, 115, 22, 0.15)"
            : "0 24px 64px rgba(0, 0, 0, 0.12), 0 0 32px rgba(249, 115, 22, 0.1)",
          overflow: "hidden",
          animation: "modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          color: dark ? "#f8fafc" : "#0f172a",
        }}
      >
        <style>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes flameBob {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(3deg); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            position: "relative",
            padding: "28px 24px 20px",
            textAlign: "center",
            background: dark
              ? "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(249, 115, 22, 0.18) 0%, transparent 80%)"
              : "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 80%)",
            borderBottom: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
              border: "none",
              color: dark ? "#94a3b8" : "#64748b",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            ✕
          </button>

          {/* Animated Flame Badge */}
          <div
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 12px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #facc15 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              boxShadow: "0 0 28px rgba(249, 115, 22, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
              animation: "flameBob 2.5s ease-in-out infinite",
            }}
          >
            🔥
          </div>

          <h2
            style={{
              fontFamily: FONT?.display || "Syne, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {streak} {streak === 1 ? "Day" : "Days"} Streak
          </h2>

          <div style={{ marginTop: 8 }}>
            {isTodayActive ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 99,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#10b981",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>✓</span>
                <span>Active Today · Streak Secured 🔥</span>
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 99,
                  background: "rgba(249, 115, 22, 0.15)",
                  border: "1px solid rgba(249, 115, 22, 0.35)",
                  color: "#f97316",
                  fontSize: 12,
                  fontWeight: 700,
                  animation: "glowPulse 2s infinite ease-in-out",
                }}
              >
                <span>⚡</span>
                <span>Action Needed · Log today to keep streak alive!</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Last 7 Days Activity Matrix */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 700,
                color: dark ? "#94a3b8" : "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>Last 7 Days Telemetry</span>
              <span style={{ color: "#f97316", fontWeight: 800 }}>
                {daysList.filter((d) => activeDates.includes(d.key)).length} of 7 Active
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 6,
              }}
            >
              {daysList.map((d) => {
                const isActive = activeDates.includes(d.key);
                const isCurrentToday = d.key === today;
                return (
                  <div
                    key={d.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 2px",
                      borderRadius: 12,
                      background: isActive
                        ? dark ? "rgba(249, 115, 22, 0.12)" : "rgba(249, 115, 22, 0.08)"
                        : isCurrentToday
                        ? dark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)"
                        : dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                      border: isActive
                        ? "1.5px solid rgba(249, 115, 22, 0.4)"
                        : isCurrentToday
                        ? "1.5px dashed #3b82f6"
                        : `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0"}`,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
                      {d.label}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isActive ? 13 : 11,
                        fontWeight: 800,
                        background: isActive
                          ? "linear-gradient(135deg, #f97316, #ea580c)"
                          : "transparent",
                        color: isActive ? "#ffffff" : isCurrentToday ? "#3b82f6" : dark ? "#475569" : "#94a3b8",
                      }}
                    >
                      {isActive ? "🔥" : isCurrentToday ? "·" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone Target Bar */}
          <div
            style={{
              padding: "16px",
              borderRadius: 16,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800 }}>
                <span>{nextMilestone.icon}</span>
                <span>Next Milestone: {nextMilestone.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f97316" }}>
                {Math.max(0, nextMilestone.days - streak)} days left
              </span>
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 99,
                background: dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${milestoneProgress}%`,
                  background: "linear-gradient(90deg, #f97316, #ea580c)",
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Workouts
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#3b82f6", marginTop: 2 }}>
                {totalWorkouts}
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Meals Logged
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 2 }}>
                {totalMeals}
              </div>
            </div>
          </div>

          {/* Instant Action CTA Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                onClose();
                navigate("/workout-logger");
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                border: "none",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(249, 115, 22, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>🏋️</span>
              <span>Log Workout</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/diet-logger");
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                border: `1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"}`,
                color: dark ? "#f8fafc" : "#1e293b",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>🥗</span>
              <span>Log Meal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
