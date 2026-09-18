// src/mobile/screens/MobileWorkoutsScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileWorkoutsScreen({
  dark,
  T,
  workouts = [],
  todayWorkouts = [],
  workoutPlan = [],
}) {
  const navigate = useNavigate();

  const splits = [
    {
      id: "push",
      title: "Chest & Triceps",
      tag: "Push Split",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
      icon: "💪",
      exs: "Bench Press · Incline DB · Cable Fly · Dips",
      path: "/workout/chest",
    },
    {
      id: "pull",
      title: "Back & Biceps",
      tag: "Pull Split",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      icon: "🏋️",
      exs: "Deadlift · Pull-ups · Barbell Row · Preacher Curl",
      path: "/workout/back",
    },
    {
      id: "legs",
      title: "Legs & Glutes",
      tag: "Lower Body",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.12)",
      icon: "🦵",
      exs: "Barbell Squat · Romanian Deadlift · Leg Press",
      path: "/workout/legs",
    },
    {
      id: "core",
      title: "Shoulders & Core",
      tag: "Core & Athletic",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      icon: "🔥",
      exs: "Overhead Press · Lateral Raise · Hanging Leg Raise",
      path: "/workout/core",
    },
  ];

  return (
    <div className="mob-workouts-screen">
      {/* Header & Quick Launchers */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => navigate("/workout-logger")}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "var(--mobile-font-display)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 6px 18px rgba(59,130,246,0.35)",
          }}
        >
          <span>🏋️</span> Start Live Logger
        </button>

        <button
          onClick={() => navigate("/workout-planner")}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            color: dark ? "#f8fafc" : "#0f172a",
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "var(--mobile-font-display)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <span>📋</span> AI Splits Planner
        </button>
      </div>

      {/* Routine Splits Cards */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3b82f6" }}>
          Target Training Splits
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
          4 Day Rotation
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {splits.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(s.path)}
            className="mob-card"
            style={{
              margin: 0,
              padding: 14,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  border: `1px solid ${s.color}35`,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)" }}>
                    {s.title}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: s.bg,
                      color: s.color,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: dark ? "rgba(241,245,249,0.5)" : "rgba(15,23,42,0.5)", marginTop: 3 }}>
                  {s.exs}
                </div>
              </div>
            </div>
            <div style={{ color: s.color, fontSize: 16, fontWeight: 800 }}>→</div>
          </div>
        ))}
      </div>

      {/* Recent Workouts Logged */}
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#10b981" }}>
          Logged Activity ({workouts.length})
        </span>
        <span
          onClick={() => navigate("/workout-logger")}
          style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", cursor: "pointer" }}
        >
          View Full Log →
        </span>
      </div>

      {workouts.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            borderRadius: 16,
            background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            border: `1px dashed ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏋️‍♂️</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a" }}>
            No Workouts Logged Yet
          </div>
          <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", margin: "4px 0 12px" }}>
            Start your first training session today!
          </div>
          <button
            onClick={() => navigate("/workout-logger")}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              background: "#3b82f6",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 12,
              border: "none",
              cursor: "pointer",
            }}
          >
            Log Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {workouts.slice(0, 5).map((w, idx) => (
            <div
              key={w.id || idx}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a" }}>
                  {w.name || w.workoutName || "Workout Routine"}
                </div>
                <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b" }}>
                  {w.date || "Today"} · {w.exercises?.length || 4} exercises
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#3b82f6", fontFamily: "var(--mobile-font-mono)" }}>
                  {w.caloriesBurned || 320} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
