// src/mobile/screens/MobileHomeScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileHomeScreen({
  user,
  dark,
  T,
  displayStreak,
  calorieTarget,
  todayCalories,
  todayBurned,
  todayNetCalories,
  todayMacros,
  weights,
  todayWorkouts,
  todayMeals,
  activeChallenges,
  handleDashboardCheckIn,
  workoutPlan,
  isFemale,
  isMale,
  getCycleDay,
  getPhaseName,
  bmi,
  isPro,
  onOpenStreakModal,
  onOpenWeightModal,
  onOpenActionSheet,
  onQuickWater,
  waterMl,
}) {
  const navigate = useNavigate();

  const calGoal = Number(calorieTarget) || 2000;
  const burned = Number(todayBurned) || 0;
  const consumed = Number(todayCalories) || 0;
  const calProgress = Math.min(Math.round((consumed / calGoal) * 100), 100);

  // Macro calculations
  const pG = Number(todayMacros?.protein) || 0;
  const cG = Number(todayMacros?.carbs) || 0;
  const fG = Number(todayMacros?.fats) || 0;
  const pTarget = Math.round((calGoal * 0.3) / 4);
  const cTarget = Math.round((calGoal * 0.45) / 4);
  const fTarget = Math.round((calGoal * 0.25) / 9);

  // Weight progression
  const recordedWeights = (weights || [])
    .filter((w) => Number.isFinite(Number(w.weight)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latestWeight = recordedWeights.at(-1)?.weight ?? user?.weight ?? null;
  const targetWeight = Number(user?.targetWeight) || null;

  // Hydration goal
  const waterTarget = 3000; // 3 Liters
  const currentWater = Number(waterMl) || 0;
  const waterPct = Math.min(Math.round((currentWater / waterTarget) * 100), 100);

  // Today's primary routine
  const primaryWorkout = Array.isArray(workoutPlan) && workoutPlan.length > 0
    ? workoutPlan[0]
    : { name: "Chest & Triceps", exercises: "Flat Bench · Incline DB · Cable Fly · Dips", tag: "Push Day", color: "#3b82f6", path: "/workout/chest" };

  return (
    <div className="mob-home-screen" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Quick Action Pills (Clean, Understated) ── */}
      <div className="mob-story-scroll">
        <button
          className="mob-story-chip"
          onClick={onQuickWater}
          style={{
            background: dark ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.08)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            color: "#06b6d4",
          }}
        >
          <span>💧</span> +250ml Water
        </button>

        <button
          className="mob-story-chip"
          onClick={() => navigate("/workout-logger")}
          style={{
            background: dark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            color: "#3b82f6",
          }}
        >
          <span>🏋️</span> Log Workout
        </button>

        <button
          className="mob-story-chip"
          onClick={() => navigate("/diet-logger")}
          style={{
            background: dark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#10b981",
          }}
        >
          <span>🥗</span> Log Meal
        </button>

        <button
          className="mob-story-chip"
          onClick={onOpenWeightModal}
          style={{
            background: dark ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            color: "#a855f7",
          }}
        >
          <span>⚖️</span> Weigh In
        </button>

        <button
          className="mob-story-chip"
          onClick={onOpenStreakModal}
          style={{
            background: dark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            color: "#f97316",
          }}
        >
          <span>🔥</span> {displayStreak || 1}d Streak
        </button>
      </div>

      {/* ── Daily Energy & Fuel Card (Apple Fitness Style) ── */}
      <div
        className="mob-card"
        style={{
          background: dark
            ? "linear-gradient(145deg, rgba(17, 24, 39, 0.7) 0%, rgba(11, 15, 26, 0.85) 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)"}`,
          padding: 18,
          margin: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3b82f6" }}>
              Daily Energy
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
              <span style={{ fontFamily: "var(--mobile-font-mono)", fontSize: 26, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a" }}>
                {consumed}
              </span>
              <span style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                / {calGoal} kcal
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316" }}>
              🔥 {burned} kcal
            </span>
            <div style={{ fontSize: 11, color: dark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
              Active Burn
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 7, borderRadius: 99, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>
          <div
            style={{
              height: "100%",
              width: `${calProgress}%`,
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Calm Macro Split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 12, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>Protein</div>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", marginTop: 2 }}>
              {pG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#64748b" : "#94a3b8" }}>Target: {pTarget}g</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>Carbs</div>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", marginTop: 2 }}>
              {cG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#64748b" : "#94a3b8" }}>Target: {cTarget}g</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fb923c" }}>Fats</div>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", marginTop: 2 }}>
              {fG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#64748b" : "#94a3b8" }}>Target: {fTarget}g</div>
          </div>
        </div>
      </div>

      {/* ── Today's Routine Hero Card ── */}
      <div
        className="mob-card"
        style={{
          background: dark
            ? "linear-gradient(145deg, rgba(24, 32, 47, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)"
            : "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
          border: `1px solid ${dark ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 0, 0, 0.08)"}`,
          padding: 18,
          margin: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
            }}
          >
            {primaryWorkout.tag || "Workout Routine"}
          </span>
          <span style={{ fontSize: 18 }}>{primaryWorkout.emoji || "💪"}</span>
        </div>

        <div
          style={{
            fontFamily: "var(--mobile-font-display)",
            fontSize: 18,
            fontWeight: 800,
            color: dark ? "#f8fafc" : "#0f172a",
            marginBottom: 4,
          }}
        >
          {primaryWorkout.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: dark ? "#94a3b8" : "#64748b",
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          {primaryWorkout.exercises}
        </div>

        <button
          onClick={() => navigate(primaryWorkout.path || "/workout-planner")}
          style={{
            width: "100%",
            height: 42,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#ffffff",
            fontFamily: "var(--mobile-font-display)",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>⚡</span> Open Workout Guide →
        </button>
      </div>

      {/* ── 2x2 Telemetry Grid (Honest, Real Data) ── */}
      <div className="mob-grid-2x2">
        {/* Hydration */}
        <div
          className="mob-grid-cell"
          style={{
            background: dark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
            padding: 14,
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#06b6d4" }}>Hydration</span>
            <span className="mob-cell-icon">💧</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {currentWater} <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>ml</span>
            </div>
            <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
              Goal: {waterTarget} ml ({waterPct}%)
            </div>
          </div>
          <button
            onClick={onQuickWater}
            style={{
              marginTop: 8,
              padding: "5px 0",
              borderRadius: 8,
              border: "1px solid rgba(6, 182, 212, 0.25)",
              background: dark ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.08)",
              color: "#06b6d4",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + 250ml Water
          </button>
        </div>

        {/* Weight */}
        <div
          className="mob-grid-cell"
          onClick={onOpenWeightModal}
          style={{
            background: dark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
            padding: 14,
            cursor: "pointer",
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#a855f7" }}>Weight</span>
            <span className="mob-cell-icon">⚖️</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {latestWeight ? `${latestWeight} kg` : "—"}
            </div>
            <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
              {targetWeight ? `Target: ${targetWeight} kg` : "Tap to log weight"}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#a855f7" }}>
            Log check-in →
          </div>
        </div>

        {/* BMI & Metabolic */}
        <div
          className="mob-grid-cell"
          onClick={() => navigate("/bmi-calculator")}
          style={{
            background: dark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
            padding: 14,
            cursor: "pointer",
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#10b981" }}>BMI</span>
            <span className="mob-cell-icon">📊</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {bmi ? Number(bmi).toFixed(1) : "—"}
            </div>
            <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
              {bmi ? (Number(bmi) < 25 ? "Healthy Range ✓" : "Calculated") : "Tap to calculate"}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#10b981" }}>
            Calculator →
          </div>
        </div>

        {/* Wellness Vitals */}
        {isFemale ? (
          <div
            className="mob-grid-cell"
            onClick={() => navigate("/female-health")}
            style={{
              background: dark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
              padding: 14,
              cursor: "pointer",
            }}
          >
            <div className="mob-cell-top">
              <span className="mob-cell-label" style={{ color: "#f43f5e" }}>Cycle</span>
              <span className="mob-cell-icon">🌸</span>
            </div>
            <div>
              <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
                {getCycleDay ? `Day ${getCycleDay()}` : "Track"}
              </div>
              <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
                {getPhaseName ? getPhaseName() : "Women's Health"}
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#f43f5e" }}>
              Cycle Hub →
            </div>
          </div>
        ) : (
          <div
            className="mob-grid-cell"
            onClick={() => navigate("/male-health")}
            style={{
              background: dark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
              padding: 14,
              cursor: "pointer",
            }}
          >
            <div className="mob-cell-top">
              <span className="mob-cell-label" style={{ color: "#3b82f6" }}>Vitals</span>
              <span className="mob-cell-icon">⚡</span>
            </div>
            <div>
              <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
                Active
              </div>
              <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
                Men's Wellness Hub
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#3b82f6" }}>
              Explore Hub →
            </div>
          </div>
        )}
      </div>

      {/* ── Active Habit Challenge (Only shown if genuinely active) ── */}
      {activeChallenges && activeChallenges.length > 0 && (
        <div
          className="mob-card"
          style={{
            background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
            padding: 16,
            margin: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#f97316" }}>
              Active Habit Challenge
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
              Day {activeChallenges[0].daysCompleted} / {activeChallenges[0].totalDays}
            </span>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)", marginBottom: 4 }}>
            {activeChallenges[0].icon} {activeChallenges[0].title}
          </div>

          <div style={{ height: 6, borderRadius: 99, background: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden", margin: "8px 0 12px" }}>
            <div
              style={{
                height: "100%",
                width: `${activeChallenges[0].progressPct || 0}%`,
                background: "linear-gradient(90deg, #f97316, #fb923c)",
                borderRadius: 99,
              }}
            />
          </div>

          <button
            onClick={() => handleDashboardCheckIn(activeChallenges[0].id)}
            style={{
              width: "100%",
              height: 38,
              borderRadius: 10,
              border: "1px solid rgba(249, 115, 22, 0.3)",
              background: dark ? "rgba(249, 115, 22, 0.12)" : "rgba(249, 115, 22, 0.08)",
              color: "#f97316",
              fontWeight: 800,
              fontSize: 12.5,
              fontFamily: "var(--mobile-font-display)",
              cursor: "pointer",
            }}
          >
            🔥 1-Tap Daily Habit Check-in
          </button>
        </div>
      )}
    </div>
  );
}
