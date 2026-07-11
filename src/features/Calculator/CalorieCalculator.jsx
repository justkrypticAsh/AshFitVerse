import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const ACTIVITY_LEVELS = [
  { label: "Sedentary", sub: "Little or no exercise", multiplier: 1.2, icon: "🛋️" },
  { label: "Light", sub: "1–3 days/week", multiplier: 1.375, icon: "🚶" },
  { label: "Moderate", sub: "3–5 days/week", multiplier: 1.55, icon: "🏃" },
  { label: "Active", sub: "6–7 days/week", multiplier: 1.725, icon: "⚡" },
  { label: "Very Active", sub: "Athlete / 2x/day", multiplier: 1.9, icon: "🏆" },
];

const GOALS = [
  { label: "Lose Weight", delta: -500, color: "#f472b6", icon: "📉" },
  { label: "Maintain", delta: 0, color: "#34d399", icon: "⚖️" },
  { label: "Gain Muscle", delta: 300, color: "#4f8ef7", icon: "💪" },
  { label: "Aggressive Bulk", delta: 600, color: "#fb923c", icon: "🔥" },
];

export default function CalorieCalculator() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ age: 24, weight: 73.5, height: 178, gender: "male" });
  const [activity, setActivity] = useState(2);
  const [goal, setGoal] = useState(2);
  const [result, setResult] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const calculate = () => {
    const { age, weight, height, gender } = form;
    const bmr = gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * ACTIVITY_LEVELS[activity].multiplier;
    const target = tdee + GOALS[goal].delta;
    setResult({
      bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target),
      protein: Math.round(weight * 2.2),
      carbs: Math.round((target * 0.45) / 4),
      fats: Math.round((target * 0.25) / 9),
      deficit: GOALS[goal].delta,
    });
  };

  const barData = result ? [
    { name: "BMR", value: result.bmr, color: T.purple },
    { name: "TDEE", value: result.tdee, color: T.accent },
    { name: "Target", value: result.target, color: T.green },
  ] : [];

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark ? "rgba(7,9,26,0.96)" : "rgba(255,255,255,0.98)", border: `1px solid ${T.glassBorder}`, borderRadius: 14, padding: "12px 16px", fontSize: 12, color: T.text, backdropFilter: "blur(20px)" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, marginBottom: 5 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.fill }}><b>{p.value} kcal</b></div>)}
      </div>
    );
  };

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    .header{display:flex;align-items:center;justify-content:space-between;padding:28px 40px;position:relative;z-index:10;border-bottom:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(30px);}
    .h-title{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .h-title span{color:${T.accent};}
    .h-right{display:flex;align-items:center;gap:10px;}

    .content{max-width:1100px;margin:0 auto;padding:36px 40px;position:relative;z-index:1;}
    .page-title{font-family:${FONT.display};font-size:36px;font-weight:800;letter-spacing:-0.03em;color:${T.text};margin-bottom:6px;}
    .page-title span{background:linear-gradient(135deg,${T.accent},${T.purple});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:15px;color:${T.textSub};margin-bottom:36px;}

    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;}

    .card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:26px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .card:hover{border-color:${T.glassBorderHover};}
    .card-title{font-family:${FONT.display};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:20px;}

    .field{margin-bottom:20px;}
    .label{font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};display:block;margin-bottom:9px;}
    .input{width:100%;height:54px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;font-size:15px;font-family:${FONT.body};font-weight:500;color:${T.text};outline:none;transition:all 0.25s;}
    .input::placeholder{color:${T.textMuted};}
    .input:focus{border-color:${T.accent};background:${T.accentSoft};box-shadow:0 0 0 4px ${T.accentGlow}40;}

    .gender-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .gender-btn{padding:14px;border-radius:14px;border:1.5px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;text-align:center;}
    .gender-btn.active{border-color:${T.accent};color:${T.accent};background:${T.accentSoft};box-shadow:0 0 16px ${T.accentGlow}40;}

    .activity-grid{display:flex;flex-direction:column;gap:8px;}
    .act-btn{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;border:1.5px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-family:${FONT.body};cursor:pointer;transition:all 0.25s;text-align:left;}
    .act-btn:hover{border-color:${T.accent}35;color:${T.text};}
    .act-btn.active{border-color:${T.accent};color:${T.accent};background:${T.accentSoft};box-shadow:0 0 18px ${T.accentGlow}30;}
    .act-icon{font-size:20px;flex-shrink:0;}
    .act-label{font-size:13px;font-weight:700;}
    .act-sub{font-size:11px;color:${T.textMuted};margin-top:2px;}

    .goal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .goal-btn{padding:16px;border-radius:14px;border:1.5px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-family:${FONT.body};cursor:pointer;transition:all 0.25s;text-align:center;}
    .goal-btn:hover{color:${T.text};}
    .goal-btn.active{font-weight:700;}
    .goal-icon{font-size:22px;display:block;margin-bottom:7px;}
    .goal-label{font-size:13px;font-weight:700;}

    .calc-btn{width:100%;height:58px;border-radius:16px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:15px;font-weight:800;font-family:${FONT.body};letter-spacing:0.05em;cursor:pointer;margin-top:8px;transition:all 0.3s;box-shadow:0 8px 30px ${T.accentGlow};text-transform:uppercase;}
    .calc-btn:hover{transform:translateY(-3px);box-shadow:0 16px 45px ${T.accentGlow};}
    .calc-btn:active{transform:translateY(0);}

    .result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
    .result-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);text-align:center;transition:all 0.3s;position:relative;overflow:hidden;}
    .result-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};}
    .result-glow{position:absolute;width:120px;height:120px;border-radius:50%;top:-40px;right:-40px;filter:blur(50px);opacity:0.45;pointer-events:none;}
    .result-label{font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:10px;}
    .result-val{font-family:${FONT.display};font-size:38px;font-weight:800;letter-spacing:-0.02em;animation:countUp 0.8s ease both;}
    .result-unit{font-size:13px;color:${T.textSub};margin-top:4px;}

    .macro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
    .macro-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:18px;backdrop-filter:blur(28px);text-align:center;transition:all 0.25s;}
    .macro-card:hover{transform:translateY(-3px);}
    .macro-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:8px;}
    .macro-val{font-family:${FONT.display};font-size:28px;font-weight:800;}
    .macro-unit{font-size:11px;color:${T.textSub};margin-top:3px;}

    .tip-box{background:${T.accentSoft};border:1px solid ${T.accent}20;border-radius:16px;padding:18px 22px;margin-bottom:20px;display:flex;gap:14px;align-items:flex-start;}
    .tip-icon{font-size:20px;flex-shrink:0;margin-top:2px;}
    .tip-text{font-size:13px;color:${T.textSub};line-height:1.65;}
    .tip-text strong{color:${T.text};}

    @keyframes fu{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:900px){.grid2{grid-template-columns:1fr;}.result-grid{grid-template-columns:1fr 1fr;}.macro-grid{grid-template-columns:1fr 1fr 1fr;}}
    @media(max-width:600px){.content{padding:24px 16px;}.result-grid{grid-template-columns:1fr;}.macro-grid{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.calculator} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-title">AshFit<span>Verse</span></div>
          <div className="h-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </div>

        <div className="content">
          <div className="page-title" style={{ animation: "fu 0.6s ease both" }}>Calorie <span>Calculator</span></div>
          <div className="page-sub" style={{ animation: "fu 0.6s ease 0.05s both" }}>Calculate your BMR, TDEE and personalised calorie targets based on your goals</div>

          <div className="grid2" style={{ animation: "fu 0.6s ease 0.1s both" }}>
            <div className="card">
              <div className="card-title">Personal Info</div>
              <div className="field">
                <label className="label">Gender</label>
                <div className="gender-row">
                  {["male", "female"].map(g => (
                    <button key={g} className={`gender-btn ${form.gender === g ? "active" : ""}`} onClick={() => setForm({ ...form, gender: g })}>
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">Age</label>
                <input className="input" type="number" value={form.age} min={10} max={100} onChange={e => setForm({ ...form, age: +e.target.value })} placeholder="Years" />
              </div>
              <div className="field">
                <label className="label">Weight (kg)</label>
                <input className="input" type="number" value={form.weight} min={30} max={300} step={0.1} onChange={e => setForm({ ...form, weight: +e.target.value })} placeholder="kg" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="label">Height (cm)</label>
                <input className="input" type="number" value={form.height} min={100} max={250} onChange={e => setForm({ ...form, height: +e.target.value })} placeholder="cm" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ flex: 1 }}>
                <div className="card-title">Activity Level</div>
                <div className="activity-grid">
                  {ACTIVITY_LEVELS.map((a, i) => (
                    <button key={i} className={`act-btn ${activity === i ? "active" : ""}`} onClick={() => setActivity(i)}>
                      <span className="act-icon">{a.icon}</span>
                      <div><div className="act-label">{a.label}</div><div className="act-sub">{a.sub}</div></div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Your Goal</div>
                <div className="goal-grid">
                  {GOALS.map((g, i) => (
                    <button key={i} className={`goal-btn ${goal === i ? "active" : ""}`} onClick={() => setGoal(i)}
                      style={goal === i ? { borderColor: g.color, color: g.color, background: `${g.color}12`, boxShadow: `0 0 16px ${g.color}30` } : {}}>
                      <span className="goal-icon">{g.icon}</span>
                      <div className="goal-label">{g.label}</div>
                      <div style={{ fontSize: 11, color: goal === i ? g.color : T.textMuted, marginTop: 4, fontWeight: 600 }}>
                        {g.delta === 0 ? "±0 kcal" : `${g.delta > 0 ? "+" : ""}${g.delta} kcal`}
                      </div>
                    </button>
                  ))}
                </div>
                <button className="calc-btn" onClick={calculate}>Calculate My Calories ⚡</button>
              </div>
            </div>
          </div>

          {result && (
            <>
              <div className="result-grid" style={{ animation: "fadeUp 0.6s ease both" }}>
                {[
                  { label: "Basal Metabolic Rate", val: result.bmr, unit: "kcal/day at rest", color: T.purple, glow: T.purpleGlow },
                  { label: "Total Daily Expenditure", val: result.tdee, unit: "kcal/day maintenance", color: T.accent, glow: T.accentGlow },
                  { label: "Your Target Calories", val: result.target, unit: `kcal/day (${GOALS[goal].label})`, color: T.green, glow: T.greenGlow },
                ].map((r, i) => (
                  <div key={i} className="result-card">
                    <div className="result-glow" style={{ background: r.glow }} />
                    <div className="result-label">{r.label}</div>
                    <div className="result-val" style={{ color: r.color }}>{r.val.toLocaleString()}</div>
                    <div className="result-unit">{r.unit}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div className="card-title" style={{ marginBottom: 14, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 700 }}>Recommended Macros</div>
                <div className="macro-grid">
                  {[
                    { label: "Protein", val: result.protein, unit: "g/day", color: T.accent, note: "2.2g per kg body weight" },
                    { label: "Carbohydrates", val: result.carbs, unit: "g/day", color: T.purple, note: "45% of total calories" },
                    { label: "Fats", val: result.fats, unit: "g/day", color: T.orange, note: "25% of total calories" },
                  ].map((m, i) => (
                    <div key={i} className="macro-card">
                      <div className="macro-label">{m.label}</div>
                      <div className="macro-val" style={{ color: m.color }}>{m.val}<span style={{ fontSize: 14, color: T.textSub, fontWeight: 500 }}>g</span></div>
                      <div className="macro-unit">{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 20, animation: "fadeUp 0.6s ease 0.1s both" }}>
                <div className="card-title">Calorie Comparison</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="tip-box">
                <span className="tip-icon">💡</span>
                <div className="tip-text">
                  <strong>Pro Tip: </strong>Your TDEE is <strong>{result.tdee.toLocaleString()} kcal</strong>. To {GOALS[goal].label.toLowerCase()}, aim for <strong>{result.target.toLocaleString()} kcal/day</strong>. Track consistently for 2–4 weeks before adjusting. Prioritise <strong>{result.protein}g protein</strong> daily to preserve muscle mass.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}