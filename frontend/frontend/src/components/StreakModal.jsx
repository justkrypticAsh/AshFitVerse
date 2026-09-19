// src/components/StreakModal.jsx — Interactive Real-Time Streak & Consistency Command Center
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FONT } from "../theme";
import { todayKey } from "../lib/userLogs";

export default function StreakModal({
  isOpen,
  onClose,
  streak = 0,
  activeDates = [],
  isTodayActive = false,
  totalWorkouts = 0,
  totalMeals = 0,
  dark = true,
  T = {},
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const now = new Date();
  const todayStr = todayKey();
  const hoursLeft = 23 - now.getHours();
  const minsLeft = 59 - now.getMinutes();

  // Formatted date string (e.g. Saturday, 19 September 2026)
  const fullDateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentMonthName = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Generate Current Month's Real Calendar Matrix
  const { calendarDays, activeCountThisMonth, daysElapsedThisMonth } = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const startOffset = (firstDayIndex + 6) % 7; // Monday = 0, Sunday = 6
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const todayNum = now.getDate();

    const days = [];
    // Padding before 1st of month
    for (let i = 0; i < startOffset; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    let activeThisMonth = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isActive = activeDates.includes(dateKey);
      const isToday = d === todayNum;
      const isPast = d < todayNum;
      const isFuture = d > todayNum;

      if (isActive && (isPast || isToday)) {
        activeThisMonth++;
      }

      days.push({
        dayNum: d,
        dateKey,
        isActive,
        isToday,
        isPast,
        isFuture,
        empty: false,
      });
    }

    return {
      calendarDays: days,
      activeCountThisMonth: activeThisMonth,
      daysElapsedThisMonth: todayNum,
    };
  }, [activeDates, now]);

  // Milestone goals
  const MILESTONES = [
    { days: 3, label: "3-Day Spark", icon: "🥉" },
    { days: 7, label: "7-Day Iron Discipline", icon: "🥈" },
    { days: 14, label: "14-Day Momentum Master", icon: "🥇" },
    { days: 30, label: "30-Day Titan of Habit", icon: "👑" },
    { days: 60, label: "60-Day Unstoppable", icon: "⚡" },
    { days: 100, label: "100-Day Centurion Legend", icon: "🏆" },
  ];

  const nextMilestone = MILESTONES.find((m) => m.days > streak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestoneDays = MILESTONES.filter((m) => m.days <= streak).pop()?.days || 0;
  const milestoneRange = Math.max(1, nextMilestone.days - prevMilestoneDays);
  const milestoneProgress = Math.min(100, Math.round(((streak - prevMilestoneDays) / milestoneRange) * 100));

  const monthConsistencyPct = Math.round(
    (activeCountThisMonth / Math.max(1, daysElapsedThisMonth)) * 100
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          background: dark ? "rgba(18, 20, 32, 0.98)" : "#ffffff",
          border: dark ? "1.5px solid rgba(249, 115, 22, 0.35)" : "1.5px solid rgba(249, 115, 22, 0.25)",
          boxShadow: dark
            ? "0 28px 72px rgba(0, 0, 0, 0.75), 0 0 36px rgba(249, 115, 22, 0.18)"
            : "0 28px 72px rgba(15, 23, 42, 0.15), 0 0 36px rgba(249, 115, 22, 0.12)",
          overflow: "hidden",
          animation: "modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          color: dark ? "#f8fafc" : "#0f172a",
          margin: "auto",
        }}
      >
        <style>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes flameBob {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.08) rotate(3deg); }
          }
          @keyframes pulseRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
            50% { box-shadow: 0 0 0 5px rgba(249, 115, 22, 0); }
          }
          @keyframes todayDotPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.6; }
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            position: "relative",
            padding: "26px 24px 18px",
            textAlign: "center",
            background: dark
              ? "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(249, 115, 22, 0.22) 0%, transparent 80%)"
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

          {/* Real-time Date Chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 99,
              background: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
              border: dark ? "1px solid rgba(255, 255, 255, 0.10)" : "1px solid rgba(0, 0, 0, 0.08)",
              fontSize: 11,
              fontWeight: 700,
              color: dark ? "#cbd5e1" : "#475569",
              marginBottom: 14,
            }}
          >
            <span>📅</span>
            <span>{fullDateLabel}</span>
          </div>

          {/* Animated Flame Avatar */}
          <div
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 10px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #facc15 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              boxShadow: "0 0 32px rgba(249, 115, 22, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
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
                  fontWeight: 800,
                }}
              >
                <span>✓</span>
                <span>Active Today · Streak Protected 🔥</span>
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
                  fontWeight: 800,
                  animation: "pulseRing 2s infinite ease-in-out",
                }}
              >
                <span>⚡</span>
                <span>
                  Action Needed · {hoursLeft}h {minsLeft}m left to keep streak!
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", maxHeight: "65vh", overflowY: "auto" }}>
          {/* Real-time Month Calendar View */}
          <div
            style={{
              padding: "16px",
              borderRadius: 18,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ fontFamily: FONT?.display || "sans-serif", fontSize: 13.5, fontWeight: 800 }}>
                {currentMonthName} Activity
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316" }}>
                {activeCountThisMonth} of {daysElapsedThisMonth} Days Active ({monthConsistencyPct}%)
              </div>
            </div>

            {/* Day of week headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4,
                textAlign: "center",
                fontSize: 10,
                fontWeight: 800,
                color: dark ? "#64748b" : "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Calendar Days Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4,
              }}
            >
              {calendarDays.map((c) => {
                if (c.empty) {
                  return <div key={c.key} style={{ height: 32 }} />;
                }

                return (
                  <div
                    key={c.dateKey}
                    title={
                      c.isActive
                        ? `${c.dateKey}: Logged Activity 🔥`
                        : c.isToday
                        ? "Today: Log to protect streak"
                        : `${c.dateKey}`
                    }
                    style={{
                      height: 32,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      fontSize: 11,
                      fontWeight: c.isActive || c.isToday ? 800 : 500,
                      background: c.isActive
                        ? "linear-gradient(135deg, rgba(249, 115, 22, 0.28), rgba(234, 88, 12, 0.16))"
                        : c.isToday
                        ? dark
                          ? "rgba(59, 130, 246, 0.18)"
                          : "rgba(59, 130, 246, 0.10)"
                        : dark
                        ? "rgba(255, 255, 255, 0.02)"
                        : "#ffffff",
                      border: c.isActive
                        ? "1.5px solid rgba(249, 115, 22, 0.55)"
                        : c.isToday
                        ? "1.5px dashed #3b82f6"
                        : `1px solid ${dark ? "rgba(255, 255, 255, 0.04)" : "#e2e8f0"}`,
                      color: c.isActive
                        ? "#f97316"
                        : c.isToday
                        ? "#3b82f6"
                        : c.isFuture
                        ? dark
                          ? "#475569"
                          : "#cbd5e1"
                        : dark
                        ? "#94a3b8"
                        : "#64748b",
                    }}
                  >
                    {c.isActive ? (
                      <span style={{ fontSize: 13 }}>🔥</span>
                    ) : (
                      <span>{c.dayNum}</span>
                    )}

                    {c.isToday && !c.isActive && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 2,
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          animation: "todayDotPulse 1.5s infinite",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone Target Bar */}
          <div
            style={{
              padding: "15px 16px",
              borderRadius: 16,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 800 }}>
                <span>{nextMilestone.icon}</span>
                <span>Next Milestone: {nextMilestone.label}</span>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#f97316" }}>
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

          {/* Quick Metrics (Zero Mock Data) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                padding: "10px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 9.5, color: dark ? "#94a3b8" : "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                Workouts
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#3b82f6", marginTop: 2 }}>
                {totalWorkouts}
              </div>
            </div>

            <div
              style={{
                padding: "10px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 9.5, color: dark ? "#94a3b8" : "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                Meals Logged
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#10b981", marginTop: 2 }}>
                {totalMeals}
              </div>
            </div>

            <div
              style={{
                padding: "10px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 9.5, color: dark ? "#94a3b8" : "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                Active Days
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f97316", marginTop: 2 }}>
                {activeDates.length}
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
                fontSize: 12.5,
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
                fontSize: 12.5,
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

            <button
              onClick={() => {
                onClose();
                navigate("/community?tab=challenges");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: dark ? "rgba(59, 130, 246, 0.12)" : "#eff6ff",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#3b82f6",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
              title="Browse 30-day habit quests"
            >
              <span>🏆</span>
              <span>Quests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
