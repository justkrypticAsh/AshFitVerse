import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const FOOD_DB = [
  { name: "Chicken Breast (100g)", cal: 165, protein: 31, carbs: 0, fats: 3.6 },
  { name: "Brown Rice (100g)", cal: 216, protein: 5, carbs: 45, fats: 1.8 },
  { name: "Whole Eggs (1 large)", cal: 78, protein: 6, carbs: 0.6, fats: 5 },
  { name: "Whey Protein (30g)", cal: 120, protein: 24, carbs: 3, fats: 2 },
  { name: "Oats (100g)", cal: 389, protein: 17, carbs: 66, fats: 7 },
  { name: "Banana (1 medium)", cal: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  { name: "Salmon (100g)", cal: 208, protein: 20, carbs: 0, fats: 13 },
  { name: "Sweet Potato (100g)", cal: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  { name: "Greek Yogurt (170g)", cal: 100, protein: 17, carbs: 6, fats: 0.7 },
  { name: "Almonds (30g)", cal: 174, protein: 6, carbs: 6, fats: 15 },
  { name: "Quinoa (100g)", cal: 120, protein: 4.4, carbs: 22, fats: 1.9 },
  { name: "Broccoli (100g)", cal: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  { name: "Avocado (1/2)", cal: 160, protein: 2, carbs: 9, fats: 15 },
  { name: "Cottage Cheese (100g)", cal: 98, protein: 11, carbs: 3.4, fats: 4.3 },
  { name: "Peanut Butter (2 tbsp)", cal: 188, protein: 8, carbs: 6, fats: 16 },
  { name: "Milk 2% (240ml)", cal: 122, protein: 8, carbs: 12, fats: 5 },
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];
const MEAL_COLORS = {
  Breakfast: "#4f8ef7", Lunch: "#a78bfa", Dinner: "#34d399",
  Snack: "#fb923c", "Pre-Workout": "#f472b6", "Post-Workout": "#fbbf24",
};
const CALORIE_GOAL = 2400;
const PROTEIN_GOAL = 160;
const CARBS_GOAL = 270;
const FATS_GOAL = 67;

export default function DietLogger() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [logs, setLogs] = useState([
    { id: 1, meal: "Breakfast", food: "Oats (100g)", cal: 389, protein: 17, carbs: 66, fats: 7, qty: 1 },
    { id: 2, meal: "Breakfast", food: "Whey Protein (30g)", cal: 120, protein: 24, carbs: 3, fats: 2, qty: 1 },
    { id: 3, meal: "Lunch", food: "Chicken Breast (100g)", cal: 165, protein: 31, carbs: 0, fats: 3.6, qty: 2 },
    { id: 4, meal: "Lunch", food: "Brown Rice (100g)", cal: 216, protein: 5, carbs: 45, fats: 1.8, qty: 1 },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("Breakfast");
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const totals = logs.reduce((acc, l) => ({
    cal: acc.cal + l.cal * l.qty, protein: acc.protein + l.protein * l.qty,
    carbs: acc.carbs + l.carbs * l.qty, fats: acc.fats + l.fats * l.qty,
  }), { cal: 0, protein: 0, carbs: 0, fats: 0 });

  const addLog = () => {
    if (!selectedFood) return;
    setLogs([...logs, { id: Date.now(), meal: selectedMeal, food: selectedFood.name, qty, ...selectedFood }]);
    setShowAdd(false); setSearch(""); setSelectedFood(null); setQty(1);
  };
  const removeLog = (id) => setLogs(logs.filter(l => l.id !== id));
  const filteredFoods = FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const mealGroups = MEAL_TYPES.map(m => ({ meal: m, items: logs.filter(l => l.meal === m), color: MEAL_COLORS[m] })).filter(g => g.items.length > 0);
  const macroChartData = [
    { name: "Protein", value: Math.round(totals.protein), fill: "#4f8ef7" },
    { name: "Carbs", value: Math.round(totals.carbs), fill: "#a78bfa" },
    { name: "Fats", value: Math.round(totals.fats), fill: "#fb923c" },
  ];

  const CT = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark ? "rgba(7,9,26,0.96)" : "rgba(255,255,255,0.98)", border: `1px solid ${T.glassBorder}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, color: T.text }}>
        <b style={{ color: payload[0].payload.fill }}>{payload[0].name}: {payload[0].value}g</b>
      </div>
    );
  };

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    .header{display:flex;align-items:center;justify-content:space-between;padding:24px 40px;border-bottom:1px solid ${T.glassBorder};background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};backdrop-filter:blur(30px);position:sticky;top:0;z-index:50;}
    .h-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}

    .layout{max-width:1200px;margin:0 auto;padding:32px 40px;display:grid;grid-template-columns:1fr 340px;gap:24px;position:relative;z-index:1;}
    .page-title{font-family:${FONT.display};font-size:30px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:4px;}
    .page-title span{background:linear-gradient(135deg,${T.green},${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:14px;color:${T.textSub};margin-bottom:24px;}

    .macro-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
    .macro-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:18px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .macro-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .mc-glow{position:absolute;width:100px;height:100px;border-radius:50%;top:-30px;right:-30px;filter:blur(40px);opacity:0.4;pointer-events:none;}
    .mc-label{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:8px;}
    .mc-val{font-family:${FONT.display};font-size:26px;font-weight:800;line-height:1;}
    .mc-goal{font-size:11px;color:${T.textSub};margin-top:5px;}
    .mc-bar{height:4px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};border-radius:99px;overflow:hidden;margin-top:10px;}
    .mc-fill{height:100%;border-radius:99px;transition:width 1.4s cubic-bezier(0.4,0,0.2,1);}

    .add-meal-btn{width:100%;padding:15px;border-radius:16px;border:1.5px dashed ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);color:${T.textSub};font-size:14px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;margin-bottom:20px;}
    .add-meal-btn:hover{border-color:${T.accent}40;color:${T.accent};background:${T.accentSoft};}

    .meal-group{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;backdrop-filter:blur(28px);margin-bottom:14px;overflow:hidden;transition:all 0.3s;animation:fadeUp 0.5s ease both;}
    .meal-group:hover{border-color:${T.glassBorderHover};}
    .mg-header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${T.glassBorder};}
    .mg-title{display:flex;align-items:center;gap:10px;}
    .mg-dot{width:10px;height:10px;border-radius:50%;}
    .mg-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .mg-cal{font-size:12px;color:${T.textSub};font-weight:600;}
    .mg-total{font-family:${FONT.display};font-size:14px;font-weight:800;}

    .food-row{display:flex;align-items:center;padding:13px 20px;border-bottom:1px solid ${T.glassBorder};transition:all 0.2s;}
    .food-row:last-child{border-bottom:none;}
    .food-row:hover{background:${T.glass};}
    .food-name{font-size:13px;font-weight:600;color:${T.text};flex:1;}
    .food-qty{font-size:12px;color:${T.textSub};margin-right:12px;}
    .food-macros{display:flex;gap:12px;margin-right:14px;}
    .macro-chip{font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;}
    .food-remove{width:26px;height:26px;border-radius:8px;border:none;background:rgba(239,68,68,0.08);color:#f87171;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all 0.2s;}
    .food-remove:hover{background:rgba(239,68,68,0.18);}

    .modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(10px);}
    .modal{background:${dark?"#0b0f1a":"#ffffff"};border:1px solid ${T.glassBorder};border-radius:26px;padding:28px;width:520px;max-height:80vh;overflow-y:auto;animation:scaleIn 0.4s cubic-bezier(0.4,0,0.2,1) both;}
    .modal-title{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};margin-bottom:18px;}

    .meal-selector{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
    .meal-sel-btn{padding:8px 14px;border-radius:10px;border:1.5px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:12px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.2s;}
    .meal-sel-btn.active{border-color:${T.accent};color:${T.accent};background:${T.accentSoft};}

    .search-input{width:100%;height:48px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1.5px solid ${T.glassBorder};border-radius:13px;padding:0 18px;font-size:14px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.25s;margin-bottom:14px;}
    .search-input:focus{border-color:${T.accent};box-shadow:0 0 0 4px ${T.accentGlow}40;}
    .search-input::placeholder{color:${T.textMuted};}

    .food-list{display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;margin-bottom:16px;}
    .food-item{padding:12px 14px;border-radius:12px;border:1.5px solid ${T.glassBorder};background:${T.glass};cursor:pointer;transition:all 0.2s;}
    .food-item:hover{border-color:${T.accent}35;background:${T.accentSoft};}
    .food-item.selected{border-color:${T.accent};background:${T.accentSoft};}
    .fi-name{font-size:13px;font-weight:700;color:${T.text};margin-bottom:4px;}
    .fi-macros{display:flex;gap:12px;font-size:11px;color:${T.textSub};}
    .fi-m{font-weight:600;}

    .qty-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
    .qty-label{font-size:13px;color:${T.textSub};font-weight:600;flex-shrink:0;}
    .qty-input{height:44px;width:80px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1.5px solid ${T.glassBorder};border-radius:12px;padding:0 14px;font-size:15px;font-family:${FONT.body};font-weight:700;color:${T.text};outline:none;text-align:center;transition:all 0.2s;}
    .qty-input:focus{border-color:${T.accent};}

    .modal-btns{display:flex;gap:10px;}
    .modal-cancel{flex:1;padding:13px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.2s;}
    .modal-add{flex:2;padding:13px;border-radius:13px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;letter-spacing:0.04em;}
    .modal-add:hover{transform:translateY(-1px);box-shadow:0 8px 22px ${T.accentGlow};}
    .modal-add:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

    .side-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);margin-bottom:16px;}
    .side-title{font-family:${FONT.display};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}
    .tip-item{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid ${T.glassBorder};font-size:12px;color:${T.textSub};line-height:1.55;}
    .tip-item:last-child{border-bottom:none;}

    @keyframes scaleIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}
    @media(max-width:960px){.layout{grid-template-columns:1fr;}.macro-summary{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.layout{padding:20px 16px;}.macro-summary{grid-template-columns:1fr 1fr;}.modal{width:95%;padding:20px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.diet} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Food</div>
              <div className="meal-selector">
                {MEAL_TYPES.map(m => (
                  <button key={m} className={`meal-sel-btn ${selectedMeal === m ? "active" : ""}`} onClick={() => setSelectedMeal(m)}>{m}</button>
                ))}
              </div>
              <input className="search-input" placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
              <div className="food-list">
                {filteredFoods.map((f, i) => (
                  <div key={i} className={`food-item ${selectedFood?.name === f.name ? "selected" : ""}`} onClick={() => setSelectedFood(f)}>
                    <div className="fi-name">{f.name}</div>
                    <div className="fi-macros">
                      <span className="fi-m" style={{ color: T.accent }}>{f.cal} kcal</span>
                      <span className="fi-m" style={{ color: "#4f8ef7" }}>P: {f.protein}g</span>
                      <span className="fi-m" style={{ color: "#a78bfa" }}>C: {f.carbs}g</span>
                      <span className="fi-m" style={{ color: "#fb923c" }}>F: {f.fats}g</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="qty-row">
                <span className="qty-label">Quantity / Servings:</span>
                <input className="qty-input" type="number" value={qty} min={0.5} step={0.5} onChange={e => setQty(+e.target.value)} />
                {selectedFood && <span style={{ fontSize: 12, color: T.textSub }}>= {Math.round(selectedFood.cal * qty)} kcal</span>}
              </div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="modal-add" disabled={!selectedFood} onClick={addLog}>Add to {selectedMeal} +</button>
              </div>
            </div>
          </div>
        )}

        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="layout">
          <div>
            <div className="page-title" style={{ animation: "fadeUp 0.6s ease both" }}>Diet <span>Logger</span></div>
            <div className="page-sub" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>Track every meal and hit your daily nutrition targets</div>

            <div className="macro-summary" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
              {[
                { label: "Calories", val: Math.round(totals.cal), goal: CALORIE_GOAL, unit: "kcal", color: T.accent, glow: T.accentGlow },
                { label: "Protein", val: Math.round(totals.protein), goal: PROTEIN_GOAL, unit: "g", color: "#4f8ef7", glow: "rgba(79,142,247,0.2)" },
                { label: "Carbs", val: Math.round(totals.carbs), goal: CARBS_GOAL, unit: "g", color: T.purple, glow: T.purpleGlow },
                { label: "Fats", val: Math.round(totals.fats), goal: FATS_GOAL, unit: "g", color: T.orange, glow: T.orangeGlow },
              ].map((m, i) => (
                <div key={i} className="macro-card">
                  <div className="mc-glow" style={{ background: m.glow }} />
                  <div className="mc-label">{m.label}</div>
                  <div className="mc-val" style={{ color: m.color }}>{m.val}<span style={{ fontSize: 13, fontWeight: 500, color: T.textSub, marginLeft: 3 }}>{m.unit}</span></div>
                  <div className="mc-goal">Goal: {m.goal}{m.unit} · {Math.round((m.val / m.goal) * 100)}%</div>
                  <div className="mc-bar"><div className="mc-fill" style={{ width: `${Math.min((m.val / m.goal) * 100, 100)}%`, background: m.color }} /></div>
                </div>
              ))}
            </div>

            <button className="add-meal-btn" onClick={() => setShowAdd(true)}>+ Log Food / Meal</button>

            {mealGroups.map((g, gi) => {
              const groupCal = g.items.reduce((a, l) => a + l.cal * l.qty, 0);
              return (
                <div key={gi} className="meal-group" style={{ animationDelay: `${gi * 0.07}s` }}>
                  <div className="mg-header">
                    <div className="mg-title">
                      <div className="mg-dot" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
                      <div className="mg-name">{g.meal}</div>
                      <div className="mg-cal">{g.items.length} items</div>
                    </div>
                    <div className="mg-total" style={{ color: g.color }}>{Math.round(groupCal)} kcal</div>
                  </div>
                  {g.items.map((item, ii) => (
                    <div key={ii} className="food-row">
                      <span className="food-name">{item.food}</span>
                      <span className="food-qty">×{item.qty}</span>
                      <div className="food-macros">
                        <span className="macro-chip" style={{ background: "#4f8ef720", color: "#4f8ef7" }}>P {Math.round(item.protein * item.qty)}g</span>
                        <span className="macro-chip" style={{ background: "#a78bfa20", color: "#a78bfa" }}>C {Math.round(item.carbs * item.qty)}g</span>
                        <span className="macro-chip" style={{ background: "#fb923c20", color: "#fb923c" }}>F {Math.round(item.fats * item.qty)}g</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: g.color, marginRight: 12, minWidth: 60, textAlign: "right" }}>{Math.round(item.cal * item.qty)} kcal</span>
                      <button className="food-remove" onClick={() => removeLog(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              );
            })}

            {mealGroups.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSub }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🥗</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>No meals logged yet</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Click "Log Food / Meal" to start tracking</div>
              </div>
            )}
          </div>

          <div style={{ animation: "fadeUp 0.6s ease 0.12s both" }}>
            <div className="side-card">
              <div className="side-title">Macro Split</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={macroChartData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {macroChartData.map((m, i) => <Cell key={i} fill={m.fill} />)}
                  </Pie>
                  <Tooltip content={<CT />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
                {macroChartData.map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.fill, margin: "0 auto 4px", boxShadow: `0 0 6px ${m.fill}` }} />
                    <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: "0.08em" }}>{m.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: m.fill, fontFamily: FONT.display }}>{m.value}g</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="side-card">
              <div className="side-title">Calorie Balance</div>
              {[
                { k: "Goal", v: `${CALORIE_GOAL} kcal`, c: T.textSub },
                { k: "Consumed", v: `${Math.round(totals.cal)} kcal`, c: T.accent },
                { k: "Remaining", v: `${Math.max(0, CALORIE_GOAL - Math.round(totals.cal))} kcal`, c: T.green },
              ].map((r, i, a) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
                  <span style={{ color: T.textSub }}>{r.k}</span>
                  <span style={{ fontWeight: 800, fontFamily: FONT.display, color: r.c }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="side-card">
              <div className="side-title">Nutrition Tips</div>
              {[
                { icon: "💧", text: "Drink at least 3L water today" },
                { icon: "🥩", text: "Hit 160g protein for muscle retention" },
                { icon: "⏰", text: "Eat within 30min post-workout" },
                { icon: "🥦", text: "Aim for 5+ portions of veg/fruit" },
              ].map((t, i, a) => (
                <div key={i} className="tip-item" style={{ borderColor: i < a.length - 1 ? T.glassBorder : "transparent" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span><span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}