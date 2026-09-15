// src/components/WorkoutDetailModal.jsx
import React from "react";
import { FONT } from "../theme";

export default function WorkoutDetailModal({
  isOpen,
  workout,
  onClose,
  onViewAll,
  dark = true,
  T = {},
}) {
  if (!isOpen || !workout) return null;

  const isSports = workout.category === "sports";
  const isIntimacy = workout.category === "intimacy";
  const isGym = !isSports && !isIntimacy;

  const icon = isSports
    ? workout.sportIcon || "⚽"
    : isIntimacy
    ? "❤️"
    : "🏋️";

  const durationMin = workout.duration
    ? Math.round(Number(workout.duration) / 60)
    : 0;

  const calories =
    Number(workout.caloriesBurned) ||
    Math.round(((Number(workout.duration) || 0) / 60) * 6);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: dark ? "#0b0f19" : "#ffffff",
          border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.12)"}`,
          borderRadius: 24,
          padding: "26px 28px",
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          color: T.text || (dark ? "#fff" : "#111"),
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: FONT.body,
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <style>{`
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
            borderBottom: `1px solid ${T.glassBorder || "rgba(255,255,255,0.08)"}`,
            paddingBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: isIntimacy
                  ? "rgba(244,114,182,0.15)"
                  : isSports
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 20,
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {workout.name || "Workout Session"}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: T.textSub || "#94a3b8",
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>📅 {workout.date || "Logged Today"}</span>
                <span>•</span>
                <span
                  style={{
                    textTransform: "capitalize",
                    color: isIntimacy ? "#f472b6" : isSports ? "#38bdf8" : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {workout.category || "Gym Workout"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: T.textSub || "#94a3b8",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: dark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10.5, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              Duration
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 18,
                fontWeight: 800,
                color: "#38bdf8",
                marginTop: 2,
              }}
            >
              {durationMin > 0 ? `${durationMin} min` : "—"}
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.22)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10.5, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              Calories Burned
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 18,
                fontWeight: 800,
                color: "#f97316",
                marginTop: 2,
              }}
            >
              🔥 {calories} kcal
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: isGym
                ? "rgba(34,197,94,0.08)"
                : "rgba(168,85,247,0.08)",
              border: `1px solid ${isGym ? "rgba(34,197,94,0.2)" : "rgba(168,85,247,0.2)"}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10.5, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              {isGym ? "Total Volume" : "Intensity"}
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 18,
                fontWeight: 800,
                color: isGym ? "#22c55e" : "#c084fc",
                marginTop: 2,
              }}
            >
              {isGym
                ? `${Number(workout.volume || 0).toLocaleString()} kg`
                : workout.intensity || "Moderate"}
            </div>
          </div>
        </div>

        {/* Exercises Breakdown (for Gym workouts) */}
        {isGym && workout.exercises && workout.exercises.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: T.textMuted || "#64748b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Exercises Logged ({workout.exercises.length})
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 220,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {workout.exercises.map((ex, ei) => (
                <div
                  key={ei}
                  style={{
                    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.07)"}`,
                    borderRadius: 14,
                    padding: "11px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <b style={{ fontSize: 14, color: T.text }}>{ex.name}</b>
                    <span style={{ fontSize: 11.5, color: T.textSub }}>
                      {ex.sets?.length || 0} sets
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ex.sets?.map((s, si) => (
                      <span
                        key={si}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 7,
                          background: dark ? "rgba(79,142,247,0.12)" : "rgba(79,142,247,0.08)",
                          color: T.accent || "#4f8ef7",
                          fontWeight: 600,
                        }}
                      >
                        Set {si + 1}: {s.reps} reps × {s.weight} kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sports Details */}
        {isSports && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: dark ? "rgba(56,189,248,0.05)" : "rgba(56,189,248,0.03)",
              border: "1px solid rgba(56,189,248,0.15)",
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: T.textSub }}>Sport Activity:</span>
              <b>{workout.sport || workout.name}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: T.textSub }}>Intensity Level:</span>
              <b>{workout.intensity || "Moderate"}</b>
            </div>
            {workout.notes && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.glassBorder}` }}>
                <span style={{ color: T.textSub }}>Notes:</span> {workout.notes}
              </div>
            )}
          </div>
        )}

        {/* Intimacy Details */}
        {isIntimacy && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: dark ? "rgba(244,114,182,0.05)" : "rgba(244,114,182,0.03)",
              border: "1px solid rgba(244,114,182,0.15)",
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: T.textSub }}>Activity:</span>
              <b>Intimacy & Physical Wellness ❤️</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: T.textSub }}>Pace & Intensity:</span>
              <b>{workout.intensity || "Moderate"}</b>
            </div>
            {workout.notes && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.glassBorder}` }}>
                <span style={{ color: T.textSub }}>Notes:</span> {workout.notes}
              </div>
            )}
          </div>
        )}

        {/* General notes if any */}
        {isGym && workout.notes && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              borderRadius: 12,
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${T.glassBorder}`,
              fontSize: 12.5,
              color: T.textSub,
            }}
          >
            <b style={{ color: T.text }}>Notes:</b> {workout.notes}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            onClick={() => {
              onClose();
              if (onViewAll) onViewAll();
            }}
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${T.accent || "#4f8ef7"}, ${T.purple || "#a78bfa"})`,
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            📋 Open All Workout History & Logs →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.12)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: T.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
