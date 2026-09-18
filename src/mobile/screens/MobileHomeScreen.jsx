// src/mobile/screens/MobileHomeScreen.jsx
import React, { useState, useEffect } from "react";
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

  // Slang quotes cycling
  const SLANGS = [
    "No days off. The squad is watching. 👀",
    "Your future self is counting reps right now. 💀",
    "Cry in the gym. Flex everywhere else. 😤",
    "You didn't come this far to only come this far. 🔥",
    "It's giving gains. Period. 💅",
    "Main character energy — in the gym and out. 🎬",
  ];
  const [slangIdx, setSlangIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setSlangIdx((i) => (i + 1) % SLANGS.length), 6500);
    return () => clearInterval(iv);
  }, [SLANGS.length]);

  const calGoal = Number(calorieTarget) || 2000;
  const burned = Number(todayBurned) || 0;
  const consumed = Number(todayCalories) || 0;
  const ringProgress = Math.min(Math.round((burned / (calGoal * 0.4 || 500)) * 100), 100);

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
  const latestWeight = recordedWeights.at(-1)?.weight ?? user?.weight ?? 0;
  const targetWeight = Number(user?.targetWeight) || 0;
  const startWeight = Number(recordedWeights[0]?.weight) || latestWeight;
  const weightProgress =
    startWeight && targetWeight && latestWeight
      ? Math.max(0, Math.min(100, Math.round((Math.abs(latestWeight - startWeight) / (Math.abs(targetWeight - startWeight) || 1)) * 100)))
      : 0;

  // Hydration goal
  const waterTarget = 3000; // 3 Liters
  const waterPct = Math.min(Math.round(((waterMl || 0) / waterTarget) * 100), 100);

  // Today's primary routine
  const primaryWorkout = Array.isArray(workoutPlan) && workoutPlan.length > 0
    ? workoutPlan[0]
    : { name: "Full Body Ignite", exercises: "Push-ups · Squats · Planks · Lunges", tag: "Power", color: "#3b82f6", path: "/workout/chest" };

  return (
    <div className="mob-home-screen">
      {/* ── Story / Quick Pills Carousel ── */}
      <div className="mob-story-scroll">
        <button
          className="mob-story-chip"
          onClick={onQuickWater}
          style={{
            background: "rgba(6, 182, 212, 0.14)",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            color: "#06b6d4",
          }}
        >
          <span>💧</span> +250ml Water
        </button>

        <button
          className="mob-story-chip"
          onClick={() => navigate("/workout-logger")}
          style={{
            background: "rgba(59, 130, 246, 0.14)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            color: "#3b82f6",
          }}
        >
          <span>🏋️</span> Log Workout
        </button>

        <button
          className="mob-story-chip"
          onClick={() => navigate("/diet-logger")}
          style={{
            background: "rgba(16, 185, 129, 0.14)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#10b981",
          }}
        >
          <span>🥗</span> Log Meal
        </button>

        <button
          className="mob-story-chip"
          onClick={onOpenWeightModal}
          style={{
            background: "rgba(168, 85, 247, 0.14)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            color: "#a855f7",
          }}
        >
          <span>⚖️</span> Weigh In
        </button>

        <button
          className="mob-story-chip"
          onClick={onOpenStreakModal}
          style={{
            background: "rgba(249, 115, 22, 0.14)",
            border: "1px solid rgba(249, 115, 22, 0.35)",
            color: "#f97316",
          }}
        >
          <span>🔥</span> {displayStreak}d Streak
        </button>
      </div>

      {/* ── Motivational Athletic Ticker ── */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 14,
          background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div style={{ fontSize: 13, flexShrink: 0 }}>⚡</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: dark ? "rgba(241, 245, 249, 0.82)" : "rgba(15, 23, 42, 0.82)",
            fontFamily: "var(--mobile-font-display)",
            letterSpacing: "-0.01em",
          }}
        >
          {SLANGS[slangIdx]}
        </div>
      </div>

      {/* ── Telemetry Activity Ring Card (Apple Fitness style) ── */}
      <div
        className="mob-card mob-ring-card"
        style={{
          background: dark
            ? "linear-gradient(145deg, rgba(17, 24, 39, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: `1px solid ${dark ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 0, 0, 0.08)"}`,
          boxShadow: dark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 4px 16px rgba(15,23,42,0.06)",
        }}
      >
        {/* Kinetic SVG Ring */}
        <div className="mob-ring-container">
          <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: "rotate(-90deg)" }}>
            {/* Background track */}
            <circle
              cx="54"
              cy="54"
              r="44"
              stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active kinetic burn ring */}
            <circle
              cx="54"
              cy="54"
              r="44"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeDasharray={276.4}
              strokeDashoffset={276.4 - (276.4 * Math.max(ringProgress, 4)) / 100}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="mob-ring-center">
            <span className="mob-ring-value" style={{ color: "#3b82f6" }}>
              {consumed}
            </span>
            <span className="mob-ring-unit" style={{ color: dark ? "rgba(241,245,249,0.5)" : "rgba(15,23,42,0.5)" }}>
              / {calGoal} kcal
            </span>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="mob-ring-stats">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#3b82f6" }}>
              Daily Fuel & Macros
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
              {todayNetCalories >= 0 ? `+${todayNetCalories}` : todayNetCalories} net
            </span>
          </div>

          {/* Protein */}
          <div className="mob-macro-row">
            <div className="mob-macro-header">
              <span style={{ color: "#60a5fa" }}>Protein</span>
              <span style={{ fontFamily: "var(--mobile-font-mono)", color: dark ? "#f1f5f9" : "#0f172a" }}>
                {pG}g <span style={{ opacity: 0.5 }}>/ {pTarget}g</span>
              </span>
            </div>
            <div className="mob-macro-bar-track">
              <div
                className="mob-macro-bar-fill"
                style={{
                  width: `${Math.min((pG / (pTarget || 1)) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="mob-macro-row">
            <div className="mob-macro-header">
              <span style={{ color: "#a78bfa" }}>Carbs</span>
              <span style={{ fontFamily: "var(--mobile-font-mono)", color: dark ? "#f1f5f9" : "#0f172a" }}>
                {cG}g <span style={{ opacity: 0.5 }}>/ {cTarget}g</span>
              </span>
            </div>
            <div className="mob-macro-bar-track">
              <div
                className="mob-macro-bar-fill"
                style={{
                  width: `${Math.min((cG / (cTarget || 1)) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="mob-macro-row">
            <div className="mob-macro-header">
              <span style={{ color: "#fb923c" }}>Fats</span>
              <span style={{ fontFamily: "var(--mobile-font-mono)", color: dark ? "#f1f5f9" : "#0f172a" }}>
                {fG}g <span style={{ opacity: 0.5 }}>/ {fTarget}g</span>
              </span>
            </div>
            <div className="mob-macro-bar-track">
              <div
                className="mob-macro-bar-fill"
                style={{
                  width: `${Math.min((fG / (fTarget || 1)) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #f97316, #fb923c)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Mission Hero Card ── */}
      <div className="mob-mission-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mob-mission-badge">
            <span>⚡</span> TODAY'S MISSION · {primaryWorkout.tag}
          </div>
          <span style={{ fontSize: 18 }}>{primaryWorkout.emoji || "💪"}</span>
        </div>

        <div className="mob-mission-title" style={{ color: "#ffffff" }}>
          {primaryWorkout.name}
        </div>
        <div className="mob-mission-exs" style={{ color: "#cbd5e1" }}>
          {primaryWorkout.exercises}
        </div>

        <button
          className="mob-mission-btn"
          onClick={() => navigate(primaryWorkout.path || "/workout-planner")}
        >
          <span>🔥</span> Start Routine Session →
        </button>
      </div>

      {/* ── 2x2 Telemetry Grid ── */}
      <div className="mob-grid-2x2">
        {/* Cell 1: Hydration */}
        <div
          className="mob-grid-cell"
          style={{
            background: dark ? "rgba(6, 182, 212, 0.08)" : "rgba(6, 182, 212, 0.06)",
            border: `1px solid ${dark ? "rgba(6, 182, 212, 0.22)" : "rgba(6, 182, 212, 0.2)"}`,
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#06b6d4" }}>Hydration</span>
            <span className="mob-cell-icon">💧</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {waterMl || 0} <span style={{ fontSize: 12, fontWeight: 700 }}>ml</span>
            </div>
            <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
              Goal: {waterTarget} ml ({waterPct}%)
            </div>
          </div>
          <button
            onClick={onQuickWater}
            style={{
              marginTop: 6,
              padding: "5px 0",
              borderRadius: 8,
              border: "1px solid rgba(6, 182, 212, 0.3)",
              background: "rgba(6, 182, 212, 0.15)",
              color: "#06b6d4",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + 250ml Quick Add
          </button>
        </div>

        {/* Cell 2: Weight Goal */}
        <div
          className="mob-grid-cell"
          onClick={onOpenWeightModal}
          style={{
            background: dark ? "rgba(168, 85, 247, 0.08)" : "rgba(168, 85, 247, 0.06)",
            border: `1px solid ${dark ? "rgba(168, 85, 247, 0.22)" : "rgba(168, 85, 247, 0.2)"}`,
            cursor: "pointer",
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#a855f7" }}>Weight</span>
            <span className="mob-cell-icon">⚖️</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {latestWeight} <span style={{ fontSize: 12, fontWeight: 700 }}>kg</span>
            </div>
            <div className="mob-cell-sub" style={{ color: dark ? "#94a3b8" : "#64748b" }}>
              Target: {targetWeight || "—"} kg ({weightProgress}%)
            </div>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: "rgba(168, 85, 247, 0.18)",
              overflow: "hidden",
              marginTop: 6,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${weightProgress}%`,
                background: "#a855f7",
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        {/* Cell 3: BMI & Metabolic Score */}
        <div
          className="mob-grid-cell"
          onClick={() => navigate("/bmi-calculator")}
          style={{
            background: dark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.06)",
            border: `1px solid ${dark ? "rgba(16, 185, 129, 0.22)" : "rgba(16, 185, 129, 0.2)"}`,
            cursor: "pointer",
          }}
        >
          <div className="mob-cell-top">
            <span className="mob-cell-label" style={{ color: "#10b981" }}>BMI Score</span>
            <span className="mob-cell-icon">📊</span>
          </div>
          <div>
            <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {bmi || "21.4"}
            </div>
            <div className="mob-cell-sub" style={{ color: "#10b981" }}>
              Healthy Range ✓
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: dark ? "#64748b" : "#94a3b8" }}>
            Tap for detailed TDEE
          </span>
        </div>

        {/* Cell 4: Gender-specific Vitals */}
        {isFemale ? (
          <div
            className="mob-grid-cell"
            onClick={() => navigate("/female-health")}
            style={{
              background: dark ? "rgba(244, 63, 94, 0.08)" : "rgba(244, 63, 94, 0.06)",
              border: `1px solid ${dark ? "rgba(244, 63, 94, 0.22)" : "rgba(244, 63, 94, 0.2)"}`,
              cursor: "pointer",
            }}
          >
            <div className="mob-cell-top">
              <span className="mob-cell-label" style={{ color: "#f43f5e" }}>Cycle Phase</span>
              <span className="mob-cell-icon">🌸</span>
            </div>
            <div>
              <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
                Day {getCycleDay ? getCycleDay() : 15}
              </div>
              <div className="mob-cell-sub" style={{ color: "#f43f5e" }}>
                {getPhaseName ? getPhaseName() : "Ovulation ✨"}
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: dark ? "#64748b" : "#94a3b8" }}>
              Open Women's Hub →
            </span>
          </div>
        ) : (
          <div
            className="mob-grid-cell"
            onClick={() => navigate("/male-health")}
            style={{
              background: dark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.06)",
              border: `1px solid ${dark ? "rgba(59, 130, 246, 0.22)" : "rgba(59, 130, 246, 0.2)"}`,
              cursor: "pointer",
            }}
          >
            <div className="mob-cell-top">
              <span className="mob-cell-label" style={{ color: "#3b82f6" }}>Vitals & Recovery</span>
              <span className="mob-cell-icon">⚡</span>
            </div>
            <div>
              <div className="mob-cell-value" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
                Prime
              </div>
              <div className="mob-cell-sub" style={{ color: "#3b82f6" }}>
                Optimal Training State
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: dark ? "#64748b" : "#94a3b8" }}>
              Open Men's Hub →
            </span>
          </div>
        )}
      </div>

      {/* ── Active Habit Challenges ── */}
      {activeChallenges && activeChallenges.length > 0 && (
        <div
          className="mob-card"
          style={{
            background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#f97316" }}>
              Active Habit Challenge
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
              Day {activeChallenges[0].daysCompleted} / {activeChallenges[0].totalDays}
            </span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)", marginBottom: 4 }}>
            {activeChallenges[0].icon} {activeChallenges[0].title}
          </div>

          <div style={{ height: 6, borderRadius: 99, background: "rgba(255, 255, 255, 0.08)", overflow: "hidden", margin: "8px 0 12px" }}>
            <div
              style={{
                height: "100%",
                width: `${activeChallenges[0].progressPct || 20}%`,
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
              border: "1px solid rgba(249, 115, 22, 0.35)",
              background: "rgba(249, 115, 22, 0.15)",
              color: "#f97316",
              fontWeight: 800,
              fontSize: 13,
              fontFamily: "var(--mobile-font-display)",
              cursor: "pointer",
            }}
          >
            🔥 1-Tap Daily Habit Check-in
          </button>
        </div>
      )}

      {/* ── Pro Membership Upgrade Banner (If not Pro) ── */}
      {!isPro && (
        <div
          className="mob-card"
          onClick={() => navigate("/pricing")}
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(124, 58, 237, 0.18) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase" }}>
              PRO PASS · ₹199/MO
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff", fontFamily: "var(--mobile-font-display)" }}>
              Unlock Custom Splits & AI
            </div>
          </div>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Upgrade →
          </span>
        </div>
      )}
    </div>
  );
}
