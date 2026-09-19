// src/components/OnboardingModal.jsx — Executive Athlete Onboarding & Profile Setup Modal
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FONT } from "../theme";
import { upsertDated, todayKey } from "../lib/userLogs";

const GOALS = [
  { id: "muscle", label: "Muscle Gain", icon: "💪" },
  { id: "fat_loss", label: "Fat Loss", icon: "🔥" },
  { id: "strength", label: "Strength", icon: "🏋️" },
  { id: "endurance", label: "Endurance", icon: "🏃" },
  { id: "general", label: "General Fitness", icon: "⚡" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
];

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", sub: "Desk job, little movement", mult: 1.2 },
  { id: "light", label: "Light", sub: "Exercise 1–3 days/wk", mult: 1.375 },
  { id: "moderate", label: "Moderate", sub: "Exercise 3–5 days/wk", mult: 1.55 },
  { id: "active", label: "Active", sub: "Hard training 6–7 days/wk", mult: 1.725 },
  { id: "very_active", label: "Elite", sub: "Athlete / 2x daily training", mult: 1.9 },
];

export default function OnboardingModal({
  isOpen,
  onClose,
  user = {},
  authUid,
  updateUser,
  dark = true,
  T = {},
}) {
  const navigate = useNavigate();

  const [sex, setSex] = useState(user.sex || "male");
  const [goal, setGoal] = useState(user.goal || "muscle");
  const [age, setAge] = useState(user.age || "");
  const [height, setHeight] = useState(user.height || "");
  const [weight, setWeight] = useState(user.weight || "");
  const [targetWeight, setTargetWeight] = useState(user.targetWeight || "");
  const [activityLevel, setActivityLevel] = useState(user.activityLevel || "moderate");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const numAge = Number(age) || 0;
  const numHeight = Number(height) || 0;
  const numWeight = Number(weight) || 0;
  const numTargetWeight = Number(targetWeight) || numWeight;

  // Live Dynamic Calculations
  const bmi = useMemo(() => {
    if (numHeight > 50 && numWeight > 20) {
      return parseFloat((numWeight / ((numHeight / 100) ** 2)).toFixed(1));
    }
    return null;
  }, [numHeight, numWeight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "#38bdf8" };
    if (bmi < 25) return { label: "Optimal / Healthy", color: "#10b981" };
    if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
    return { label: "High / Obese", color: "#ef4444" };
  }, [bmi]);

  const liveCalories = useMemo(() => {
    if (numWeight > 20 && numHeight > 50 && numAge > 10) {
      const bmr =
        sex === "female"
          ? 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161
          : 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
      const act = ACTIVITY_LEVELS.find((a) => a.id === activityLevel)?.mult || 1.55;
      const tdee = Math.round(bmr * act);

      let target = tdee;
      if (goal === "fat_loss") target = Math.round(tdee - 450);
      else if (goal === "muscle") target = Math.round(tdee + 300);
      else if (goal === "strength") target = Math.round(tdee + 200);
      else if (goal === "endurance") target = Math.round(tdee + 150);

      return Math.max(1200, target);
    }
    return null;
  }, [sex, goal, numAge, numHeight, numWeight, activityLevel]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("ashfitverse_onboarding_dismissed", "true");
    } catch {}
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!numWeight || numWeight < 20 || numWeight > 300) {
      setError("Please enter a valid weight between 20kg and 300kg.");
      return;
    }
    if (!numHeight || numHeight < 50 || numHeight > 250) {
      setError("Please enter a valid height between 50cm and 250cm.");
      return;
    }
    if (!numAge || numAge < 10 || numAge > 120) {
      setError("Please enter a valid age between 10 and 120.");
      return;
    }

    setSaving(true);
    try {
      const updates = {
        sex,
        goal,
        age: numAge,
        height: numHeight,
        weight: numWeight,
        targetWeight: numTargetWeight || numWeight,
        activityLevel,
        calorieTarget: liveCalories || 2000,
        onboarded: true,
        updatedAt: new Date().toISOString(),
      };

      if (updateUser) {
        await updateUser(updates);
      }

      // Automatically register initial weight entry in user logs
      const today = todayKey();
      await upsertDated(authUid, "weights", today, { weight: numWeight });

      try {
        localStorage.setItem("ashfitverse_onboarded", "true");
        sessionStorage.setItem("ashfitverse_onboarding_dismissed", "true");
      } catch {}

      onClose();
    } catch (err) {
      console.error("Save onboarding error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const firstName = user.name ? user.name.trim().split(" ")[0] : "Athlete";

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
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
          maxWidth: 580,
          borderRadius: 24,
          background: dark ? "rgba(15, 17, 26, 0.98)" : "#ffffff",
          border: dark ? "1.5px solid rgba(59, 130, 246, 0.35)" : "1.5px solid rgba(59, 130, 246, 0.25)",
          boxShadow: dark
            ? "0 28px 72px rgba(0, 0, 0, 0.75), 0 0 36px rgba(59, 130, 246, 0.20)"
            : "0 28px 72px rgba(15, 23, 42, 0.15), 0 0 36px rgba(59, 130, 246, 0.12)",
          overflow: "hidden",
          animation: "modalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          color: dark ? "#f8fafc" : "#0f172a",
          margin: "auto",
        }}
      >
        <style>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.94) translateY(16px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .obm-input {
            width: 100%;
            padding: 11px 14px;
            border-radius: 12px;
            font-size: 13.5px;
            font-weight: 600;
            font-family: inherit;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s ease;
          }
          .obm-input:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            position: "relative",
            padding: "24px 26px 18px",
            background: dark
              ? "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 80%)"
              : "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(59, 130, 246, 0.10) 0%, transparent 80%)",
            borderBottom: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <button
            onClick={handleDismiss}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 18,
              right: 18,
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

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            <span>⚡</span> Athlete Onboarding
          </div>

          <h2
            style={{
              fontFamily: FONT?.display || "Syne, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Welcome, {firstName}! 🚀
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.45 }}>
            Personalize your metrics in 30 seconds to unlock real calorie targets, personalized workout plans, and telemetry.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} style={{ padding: "20px 26px" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Sex / Gender Select */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#64748b", marginBottom: 7 }}>
              Gender
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { id: "male", label: "Male ♂", color: "#3b82f6" },
                { id: "female", label: "Female ♀", color: "#ec4899" },
                { id: "other", label: "Other ⚡", color: "#8b5cf6" },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSex(g.id)}
                  style={{
                    padding: "9px 8px",
                    borderRadius: 12,
                    border: sex === g.id ? `1.5px solid ${g.color}` : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                    background: sex === g.id ? `${g.color}18` : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: sex === g.id ? (dark ? "#f8fafc" : g.color) : dark ? "#94a3b8" : "#64748b",
                    fontSize: 12.5,
                    fontWeight: sex === g.id ? 800 : 600,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Goal */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#64748b", marginBottom: 7 }}>
              Primary Goal
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {GOALS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  style={{
                    padding: "9px 8px",
                    borderRadius: 12,
                    border: goal === g.id ? "1.5px solid #3b82f6" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                    background: goal === g.id ? "rgba(59, 130, 246, 0.15)" : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: goal === g.id ? "#3b82f6" : dark ? "#94a3b8" : "#64748b",
                    fontSize: 11.5,
                    fontWeight: goal === g.id ? 800 : 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    transition: "all 0.18s ease",
                  }}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Numbers Grid: Age, Height, Current Weight, Target Weight */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 5 }}>
                Age
              </label>
              <input
                type="number"
                min="10"
                max="120"
                placeholder="e.g. 24"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="obm-input"
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                  border: `1.5px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "#cbd5e1"}`,
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 5 }}>
                Height (cm)
              </label>
              <input
                type="number"
                min="50"
                max="250"
                placeholder="e.g. 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                className="obm-input"
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                  border: `1.5px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "#cbd5e1"}`,
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 5 }}>
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="e.g. 72"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="obm-input"
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                  border: `1.5px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "#cbd5e1"}`,
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 5 }}>
                Goal (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="e.g. 75"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="obm-input"
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                  border: `1.5px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "#cbd5e1"}`,
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
            </div>
          </div>

          {/* Activity Level Selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#64748b", marginBottom: 7 }}>
              Activity Level
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setActivityLevel(a.id)}
                  title={a.sub}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 10,
                    border: activityLevel === a.id ? "1.5px solid #10b981" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                    background: activityLevel === a.id ? "rgba(16, 185, 129, 0.15)" : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: activityLevel === a.id ? "#10b981" : dark ? "#94a3b8" : "#64748b",
                    fontSize: 11,
                    fontWeight: activityLevel === a.id ? 800 : 600,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.18s ease",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Telemetry Preview Box */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 16,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: dark ? "#94a3b8" : "#64748b" }}>
                  Estimated BMI
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                  <span style={{ fontFamily: FONT?.display || "sans-serif", fontSize: 20, fontWeight: 900, color: bmiCategory?.color || "#3b82f6" }}>
                    {bmi ? bmi : "—"}
                  </span>
                  {bmiCategory && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: `${bmiCategory.color}20`, color: bmiCategory.color }}>
                      {bmiCategory.label}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ width: 1, height: 32, background: dark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: dark ? "#94a3b8" : "#64748b" }}>
                  Target Daily Calories
                </div>
                <div style={{ fontFamily: FONT?.display || "sans-serif", fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 2 }}>
                  {liveCalories ? `${liveCalories.toLocaleString()} kcal` : "—"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleDismiss();
                navigate("/onboarding");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#3b82f6",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Full 6-Step Setup →
            </button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                background: dark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                border: `1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"}`,
                color: dark ? "#94a3b8" : "#475569",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              Explore First
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                border: "none",
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 18px rgba(37, 99, 235, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "transform 0.16s ease",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <span>{saving ? "Configuring OS…" : "Save & Launch Dashboard 🚀"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
