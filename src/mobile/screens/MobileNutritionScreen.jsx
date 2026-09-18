// src/mobile/screens/MobileNutritionScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileNutritionScreen({
  dark,
  T,
  calorieTarget,
  todayCalories,
  todayBurned,
  todayNetCalories,
  todayMacros,
  mealGroups = {},
  onQuickWater,
  waterMl,
}) {
  const navigate = useNavigate();

  const calGoal = Number(calorieTarget) || 2000;
  const consumed = Number(todayCalories) || 0;
  const burned = Number(todayBurned) || 0;
  const remaining = Math.max(calGoal - consumed, 0);

  const pG = Number(todayMacros?.protein) || 0;
  const cG = Number(todayMacros?.carbs) || 0;
  const fG = Number(todayMacros?.fats) || 0;

  const pTarget = Math.round((calGoal * 0.3) / 4);
  const cTarget = Math.round((calGoal * 0.45) / 4);
  const fTarget = Math.round((calGoal * 0.25) / 9);

  const mealCategories = [
    { id: "breakfast", name: "Breakfast", icon: "🍳", target: Math.round(calGoal * 0.25) },
    { id: "lunch", name: "Lunch", icon: "🥗", target: Math.round(calGoal * 0.35) },
    { id: "dinner", name: "Dinner", icon: "🍲", target: Math.round(calGoal * 0.3) },
    { id: "snacks", name: "Snacks & Drinks", icon: "🍎", target: Math.round(calGoal * 0.1) },
  ];

  return (
    <div className="mob-nutrition-screen">
      {/* ── Calorie Gauge Card ── */}
      <div
        className="mob-card"
        style={{
          background: dark
            ? "linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(10, 14, 26, 0.95) 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: `1px solid ${dark ? "rgba(16, 185, 129, 0.25)" : "rgba(0,0,0,0.08)"}`,
          padding: 18,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#10b981" }}>
            Energy & Metabolism
          </span>
          <span
            onClick={() => navigate("/diet-logger")}
            style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", cursor: "pointer" }}
          >
            + Log Food →
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>Consumed</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: "#10b981" }}>
              {consumed}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>kcal</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>Burned</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: "#f97316" }}>
              {burned}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>kcal</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>Remaining</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: "#3b82f6" }}>
              {remaining}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>kcal</div>
          </div>
        </div>

        <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min((consumed / (calGoal || 1)) * 100, 100)}%`,
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
              borderRadius: 99,
            }}
          />
        </div>
      </div>

      {/* ── Macro Breakdown ── */}
      <div
        className="mob-card"
        style={{
          background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3b82f6", display: "block", marginBottom: 12 }}>
          Daily Macro Split
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {/* Protein */}
          <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6" }}>Protein</div>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", margin: "4px 0 2px" }}>
              {pG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#94a3b8" : "#64748b" }}>Target: {pTarget}g</div>
          </div>

          {/* Carbs */}
          <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#8b5cf6" }}>Carbs</div>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", margin: "4px 0 2px" }}>
              {cG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#94a3b8" : "#64748b" }}>Target: {cTarget}g</div>
          </div>

          {/* Fats */}
          <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316" }}>Fats</div>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: dark ? "#f8fafc" : "#0f172a", margin: "4px 0 2px" }}>
              {fG}g
            </div>
            <div style={{ fontSize: 10, color: dark ? "#94a3b8" : "#64748b" }}>Target: {fTarget}g</div>
          </div>
        </div>
      </div>

      {/* ── Meal Slots ── */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#10b981" }}>
          Meal Log
        </span>
        <button
          onClick={() => navigate("/diet-plan")}
          style={{
            padding: "4px 10px",
            borderRadius: 8,
            border: "1px solid rgba(59, 130, 246, 0.3)",
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3b82f6",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Generate Diet Plan ✨
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {mealCategories.map((meal) => {
          const items = mealGroups[meal.id] || [];
          const mealCals = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
          return (
            <div
              key={meal.id}
              className="mob-card"
              style={{
                margin: 0,
                padding: 14,
                background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{meal.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a", fontFamily: "var(--mobile-font-display)" }}>
                      {meal.name}
                    </div>
                    <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b" }}>
                      Target: ~{meal.target} kcal
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, fontFamily: "var(--mobile-font-mono)", color: "#10b981" }}>
                    {mealCals > 0 ? `${mealCals} kcal` : "—"}
                  </span>
                  <button
                    onClick={() => navigate("/diet-logger")}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(16, 185, 129, 0.18)",
                      color: "#10b981",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
