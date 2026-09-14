import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const NAV_MAIN = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Community", icon: "◎", badge: "3", path: "/community" },
  { label: "Profile", icon: "◉", path: "/profile" },
];
const TOOLS = [
  { label: "Calorie Calc", icon: "🔥", path: "/calorie-calculator" },
  { label: "Fat % Calc", icon: "📊", path: "/fat-calculator" },
  { label: "Workout Planner", icon: "📋", path: "/workout-planner" },
  { label: "Workout Logger", icon: "📝", path: "/workout-logger" },
  { label: "Diet Logger", icon: "🥗", path: "/diet-logger" },
  { label: "Diet Plan", icon: "🍱", path: "/diet-plan" },
];
const USER = {
  name: "Ash Kumar", avatar: "https://i.pravatar.cc/150?img=11",
  goal: "Muscle Gain", streak: 18,
};

const BMI_RANGES = [
  { label: "Severely Underweight", range: "< 16.0", min: 0, max: 16, color: "#60a5fa", icon: "🫀", tip: "Critical — please consult a doctor immediately." },
  { label: "Underweight", range: "16.0 – 18.4", min: 16, max: 18.5, color: "#4f8ef7", icon: "⚡", tip: "Increase caloric intake with nutrient-dense foods." },
  { label: "Normal Weight", range: "18.5 – 24.9", min: 18.5, max: 25, color: "#34d399", icon: "✅", tip: "Great! Maintain with balanced diet & exercise." },
  { label: "Overweight", range: "25.0 – 29.9", min: 25, max: 30, color: "#fb923c", icon: "⚠️", tip: "Mild deficit diet & cardio can help." },
  { label: "Obese Class I", range: "30.0 – 34.9", min: 30, max: 35, color: "#f87171", icon: "🔴", tip: "Consult a nutritionist for a structured plan." },
  { label: "Obese Class II", range: "35.0 – 39.9", min: 35, max: 40, color: "#ef4444", icon: "🚨", tip: "Medical supervision recommended." },
  { label: "Obese Class III", range: "≥ 40.0", min: 40, max: 99, color: "#dc2626", icon: "🏥", tip: "Immediate medical consultation needed." },
];

function getBMIInfo(bmi) {
  return BMI_RANGES.find(r => bmi >= r.min && bmi < r.max) || BMI_RANGES[BMI_RANGES.length - 1];
}

function getIdealWeight(heightCm, gender) {
  const h = heightCm - 100;
  if (gender === "male") return (h - h * 0.1).toFixed(1);
  return (h - h * 0.15).toFixed(1);
}

export default function BMICalculator() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [activeNav, setActiveNav] = useState("");
  const [mounted, setMounted] = useState(false);

  const [unit, setUnit] = useState("metric");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(24);
  const [heightCm, setHeightCm] = useState(178);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [weightKg, setWeightKg] = useState(73.5);
  const [weightLbs, setWeightLbs] = useState(162);

  const [bmi, setBmi] = useState(null);
  const [animBmi, setAnimBmi] = useState(0);
  const [calculated, setCalculated] = useState(false);
  const animRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const calculate = () => {
    let h, w;
    if (unit === "metric") {
      h = heightCm / 100;
      w = weightKg;
    } else {
      const totalIn = heightFt * 12 + parseFloat(heightIn);
      h = totalIn * 0.0254;
      w = weightLbs * 0.453592;
    }
    const result = parseFloat((w / (h * h)).toFixed(1));
    setBmi(result);
    setCalculated(true);
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimBmi(parseFloat((eased * result).toFixed(1)));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(animRef.current);
    requestAnimationFrame(animate);
  };

  const reset = () => { setBmi(null); setAnimBmi(0); setCalculated(false); };

  const info = bmi ? getBMIInfo(bmi) : null;
  const idealW = bmi ? getIdealWeight(unit === "metric" ? heightCm : (heightFt * 12 + parseFloat(heightIn)) * 2.54, gender) : null;
  const gaugeAngle = bmi ? Math.min(Math.max(((bmi - 10) / 30) * 180 - 90, -90), 90) : -90;

  const sliderStyle = (val, min, max) => ({ "--prog": `${((val - min) / (max - min)) * 100}%` });

  const css = generateCSS(T, dark) + `
    .dr{min-height:100vh;display:flex;font-family:${FONT.body};background:${T.bg};color:${T.text};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;}

    .sb{width:255px;min-height:100vh;background:${T.sidebar};border-right:1px solid ${T.glassBorder};display:flex;flex-direction:column;padding:28px 15px 22px;flex-shrink:0;position:relative;z-index:20;transition:background 0.5s,border 0.5s;backdrop-filter:blur(40px);}
    .sb::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,${T.accent}08 0%,transparent 100%);pointer-events:none;}
    .lg{font-family:${FONT.display};font-size:21px;font-weight:800;letter-spacing:0.04em;color:${T.text};padding:0 8px;margin-bottom:4px;cursor:pointer;}
    .lg span{color:${T.accent};}
    .lt2{font-size:10px;color:${T.textMuted};letter-spacing:0.14em;text-transform:uppercase;font-weight:600;padding:0 8px;margin-bottom:24px;}
    .su{padding:13px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:15px;backdrop-filter:blur(20px);display:flex;align-items:center;gap:11px;cursor:pointer;transition:all 0.25s;margin-bottom:22px;}
    .su:hover{border-color:${T.accent}35;}
    .sa{width:37px;height:37px;border-radius:50%;border:2px solid ${T.accent}40;object-fit:cover;box-shadow:0 0 16px ${T.accentGlow};}
    .sn{font-size:13px;font-weight:700;color:${T.text};}
    .sg{font-size:11px;color:${T.accent};font-weight:500;}
    .nl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};padding:0 8px;margin:16px 0 5px;}
    .ni{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:13px;cursor:pointer;font-size:13.5px;font-weight:500;color:${T.textSub};transition:all 0.22s;margin-bottom:2px;border:1px solid transparent;}
    .ni:hover{color:${T.text};background:${T.glass};border-color:${T.glassBorder};}
    .ni.na{background:linear-gradient(135deg,${T.accent}16,${T.purple}0c);color:${T.accent};border-color:${T.accent}24;box-shadow:0 4px 20px ${T.accentGlow}40;}
    .nn{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
    .nbdg{margin-left:auto;padding:2px 7px;background:${T.accent}22;color:${T.accent};border-radius:99px;font-size:10px;font-weight:800;}
    .ti{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};transition:all 0.2s;margin-bottom:1px;}
    .ti:hover{color:${T.text};background:${T.glass};}
    .ti.ta{color:${T.accent};background:${T.glass};}
    .tic{font-size:14px;width:18px;text-align:center;}

    .mn{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}
    .tb{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;animation:fadeUp 0.6s ease both;}
    .tt{font-family:${FONT.display};font-size:27px;font-weight:800;color:${T.text};letter-spacing:-0.02em;}
    .ts{font-size:13px;color:${T.textSub};margin-top:3px;}
    .tr{display:flex;align-items:center;gap:11px;}
    .sp{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);font-size:13px;font-weight:700;color:#fb923c;}
    .nb2{width:42px;height:42px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;transition:all 0.22s;color:${T.textSub};}
    .nb2:hover{border-color:${T.accent}30;color:${T.accent};}
    .av{width:42px;height:42px;border-radius:50%;border:2px solid ${T.accent}40;object-fit:cover;box-shadow:0 0 18px ${T.accentGlow};cursor:pointer;transition:all 0.3s;}
    .av:hover{border-color:${T.accent};}

    .bc{display:flex;align-items:center;gap:8px;font-size:12px;color:${T.textMuted};margin-bottom:28px;animation:fadeUp 0.5s ease 0.05s both;}
    .bc span{color:${T.accent};cursor:pointer;font-weight:600;}
    .bc span:hover{text-decoration:underline;}

    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}

    .cc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:28px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .cc:hover{border-color:${T.glassBorderHover};}
    .ct2{font-family:${FONT.display};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:22px;}

    .unit-toggle{display:flex;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};border:1px solid ${T.glassBorder};border-radius:14px;padding:4px;gap:4px;margin-bottom:24px;}
    .ut-btn{flex:1;padding:9px;border-radius:10px;border:none;background:transparent;color:${T.textSub};font-size:13px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.22s;}
    .ut-btn.active{background:${T.accent};color:#fff;box-shadow:0 4px 16px ${T.accentGlow};}

    .gender-row{display:flex;gap:10px;margin-bottom:22px;}
    .g-btn{flex:1;padding:14px;border-radius:16px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;text-align:center;}
    .g-btn.active{border-color:${T.accent}50;background:linear-gradient(135deg,${T.accent}18,${T.purple}10);color:${T.accent};}

    .inp-group{margin-bottom:20px;}
    .inp-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:8px;display:block;}
    .inp-row{display:flex;gap:10px;}
    .inp{width:100%;padding:14px 16px;border-radius:14px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};color:${T.text};font-size:16px;font-weight:700;font-family:${FONT.body};outline:none;transition:all 0.25s;-webkit-appearance:none;}
    .inp:focus{border-color:${T.accent}60;background:${dark?"rgba(79,142,247,0.06)":"rgba(59,126,240,0.04)"};box-shadow:0 0 0 3px ${T.accentGlow};}
    .inp-unit{padding:14px 16px;border-radius:14px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textMuted};font-size:13px;font-weight:700;white-space:nowrap;display:flex;align-items:center;}

    .slider-wrap{position:relative;margin-top:6px;}
    input[type=range]{width:100%;height:6px;border-radius:99px;outline:none;cursor:pointer;-webkit-appearance:none;background:linear-gradient(90deg,${T.accent} var(--prog),${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"} var(--prog));}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});box-shadow:0 0 14px ${T.accentGlow};cursor:pointer;transition:transform 0.2s;}
    input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2);}
    .slider-labels{display:flex;justify-content:space-between;font-size:10px;color:${T.textMuted};margin-top:6px;font-weight:600;}

    .calc-btn{width:100%;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:15px;font-weight:800;font-family:${FONT.body};cursor:pointer;transition:all 0.3s;letter-spacing:0.05em;margin-top:8px;box-shadow:0 8px 28px ${T.accentGlow};}
    .calc-btn:hover{transform:translateY(-3px);box-shadow:0 16px 40px ${T.accentGlow};}
    .calc-btn:active{transform:translateY(0);}
    .reset-btn{width:100%;padding:13px;border-radius:16px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:13px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;margin-top:10px;}
    .reset-btn:hover{border-color:${T.glassBorderHover};color:${T.text};}

    .result-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:28px;backdrop-filter:blur(28px);animation:fadeUp 0.6s ease both;}

    .gauge-wrap{display:flex;flex-direction:column;align-items:center;margin:10px 0 24px;}
    .gauge-svg{overflow:visible;}

    .bmi-num{font-family:${FONT.display};font-size:72px;font-weight:800;line-height:1;letter-spacing:-0.04em;text-align:center;margin:8px 0 4px;}
    .bmi-cat{text-align:center;font-size:15px;font-weight:700;padding:6px 20px;border-radius:99px;display:inline-block;margin:0 auto 8px;}
    .bmi-tip{font-size:13px;color:${T.textSub};text-align:center;margin-bottom:24px;line-height:1.6;}

    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
    .info-cell{background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:16px;padding:16px;}
    .info-cell-label{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;}
    .info-cell-val{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};}
    .info-cell-sub{font-size:11px;color:${T.textSub};margin-top:3px;}

    .range-table{display:flex;flex-direction:column;gap:8px;}
    .range-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:13px;border:1px solid transparent;transition:all 0.2s;}
    .range-row.current{border-color:var(--rc)!important;background:linear-gradient(135deg,var(--rc)10,transparent);}
    .range-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
    .range-label{font-size:13px;font-weight:600;color:${T.textSub};flex:1;}
    .range-row.current .range-label{color:${T.text};font-weight:700;}
    .range-val{font-size:12px;color:${T.textMuted};font-weight:600;}

    .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;}
    .empty-icon{font-size:64px;margin-bottom:20px;opacity:0.6;}
    .empty-title{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .empty-sub{font-size:14px;color:${T.textSub};line-height:1.6;}

    @keyframes scaleIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}
    @media(max-width:1100px){.grid2{grid-template-columns:1fr;}.mn{padding:24px 20px;}}
    @media(max-width:768px){.sb{display:none;}.mn{padding:20px 16px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="dr">
        <div className="bg-image-layer"><img src={BG_IMAGES.calculator} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="lg" onClick={() => navigate("/dashboard")}>AshFit<span>Verse</span></div>
          <div className="lt2">Premium Fitness OS</div>
          <div className="su" onClick={() => navigate("/profile")}>
            <img src={USER.avatar} className="sa" alt="avatar" />
            <div><div className="sn">{USER.name}</div><div className="sg">{USER.goal}</div></div>
          </div>
          <div className="nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div key={n.label} className={`ni ${activeNav === n.label ? "na" : ""}`}
              onClick={() => { setActiveNav(n.label); navigate(n.path); }}>
              <span className="nn">{n.icon}</span><span>{n.label}</span>
              {n.badge && <span className="nbdg">{n.badge}</span>}
            </div>
          ))}
          <div className="nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="ti" onClick={() => navigate(t.path)}>
              <span className="tic">{t.icon}</span><span>{t.label}</span>
            </div>
          ))}
          <div className="ti ta" style={{ marginTop: 2 }}>
            <span className="tic">📏</span><span>BMI Calculator</span>
          </div>
          <button className="logout-btn" onClick={() => navigate("/")} style={{ marginTop: 20 }}>⎋ &nbsp;Logout</button>
        </aside>

        {/* MAIN */}
        <main className="mn">
          <div className="tb">
            <div>
              <div className="tt">BMI Calculator 📏</div>
              <div className="ts">Know your Body Mass Index & ideal weight range</div>
            </div>
            <div className="tr">
              <div className="sp">🔥 {USER.streak}-day streak</div>
              <button className="nb2">🔔</button>
              <button className="theme-toggle" onClick={toggleTheme}>
                <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
              </button>
              <img src={USER.avatar} className="av" alt="avatar" />
            </div>
          </div>

          <div className="bc">
            <span onClick={() => navigate("/dashboard")}>Dashboard</span>
            <span style={{ color: "inherit", cursor: "default", fontWeight: 400 }}>›</span>
            <span style={{ color: "inherit", cursor: "default" }}>Calculators</span>
            <span style={{ color: "inherit", cursor: "default", fontWeight: 400 }}>›</span>
            <span style={{ color: T.accent, cursor: "default" }}>BMI Calculator</span>
          </div>

          <div className="grid2">
            <div>
              <div className="cc" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
                <div className="ct2">Your Details</div>
                <div className="unit-toggle">
                  <button className={`ut-btn ${unit === "metric" ? "active" : ""}`} onClick={() => { setUnit("metric"); reset(); }}>Metric (kg / cm)</button>
                  <button className={`ut-btn ${unit === "imperial" ? "active" : ""}`} onClick={() => { setUnit("imperial"); reset(); }}>Imperial (lbs / ft)</button>
                </div>
                <label className="inp-label">Gender</label>
                <div className="gender-row">
                  {[{ v: "male", label: "♂ Male" }, { v: "female", label: "♀ Female" }].map(g => (
                    <button key={g.v} className={`g-btn ${gender === g.v ? "active" : ""}`} onClick={() => { setGender(g.v); reset(); }}>{g.label}</button>
                  ))}
                </div>
                <div className="inp-group">
                  <label className="inp-label">Age — {age} years</label>
                  <div className="slider-wrap">
                    <input type="range" min={10} max={100} value={age} style={sliderStyle(age, 10, 100)} onChange={e => { setAge(parseInt(e.target.value)); reset(); }} />
                    <div className="slider-labels"><span>10</span><span>100</span></div>
                  </div>
                </div>
                <div className="inp-group">
                  {unit === "metric" ? (
                    <>
                      <label className="inp-label">Height — {heightCm} cm</label>
                      <div className="slider-wrap">
                        <input type="range" min={100} max={230} value={heightCm} style={sliderStyle(heightCm, 100, 230)} onChange={e => { setHeightCm(parseInt(e.target.value)); reset(); }} />
                        <div className="slider-labels"><span>100 cm</span><span>230 cm</span></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="inp-label">Height</label>
                      <div className="inp-row">
                        <input className="inp" type="number" placeholder="ft" value={heightFt} min={3} max={8} onChange={e => { setHeightFt(parseInt(e.target.value) || 0); reset(); }} />
                        <div className="inp-unit">ft</div>
                        <input className="inp" type="number" placeholder="in" value={heightIn} min={0} max={11} onChange={e => { setHeightIn(parseInt(e.target.value) || 0); reset(); }} />
                        <div className="inp-unit">in</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="inp-group">
                  {unit === "metric" ? (
                    <>
                      <label className="inp-label">Weight — {weightKg} kg</label>
                      <div className="slider-wrap">
                        <input type="range" min={30} max={200} step={0.5} value={weightKg} style={sliderStyle(weightKg, 30, 200)} onChange={e => { setWeightKg(parseFloat(e.target.value)); reset(); }} />
                        <div className="slider-labels"><span>30 kg</span><span>200 kg</span></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="inp-label">Weight</label>
                      <div className="inp-row">
                        <input className="inp" type="number" placeholder="lbs" value={weightLbs} onChange={e => { setWeightLbs(parseFloat(e.target.value) || 0); reset(); }} />
                        <div className="inp-unit">lbs</div>
                      </div>
                    </>
                  )}
                </div>
                <button className="calc-btn" onClick={calculate}>Calculate BMI →</button>
                {calculated && <button className="reset-btn" onClick={reset}>↺ Reset</button>}
              </div>

              <div className="cc" style={{ marginTop: 20, animation: "fadeUp 0.6s ease 0.2s both" }}>
                <div className="ct2">BMI Classification</div>
                <div className="range-table">
                  {BMI_RANGES.map((r, i) => (
                    <div key={i} className={`range-row ${info && info.label === r.label ? "current" : ""}`} style={{ "--rc": r.color }}>
                      <div className="range-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                      <span className="range-label">{r.icon} {r.label}</span>
                      <span className="range-val">{r.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              {!calculated ? (
                <div className="cc" style={{ animation: "fadeUp 0.6s ease 0.15s both" }}>
                  <div className="empty-state">
                    <div className="empty-icon">📏</div>
                    <div className="empty-title">Ready to Calculate</div>
                    <div className="empty-sub">Fill in your details on the left<br />and hit <b>Calculate BMI</b> to see your results.</div>
                  </div>
                </div>
              ) : (
                <div className="result-card">
                  <div className="ct2">Your BMI Result</div>
                  <div className="gauge-wrap">
                    <svg className="gauge-svg" width="260" height="140" viewBox="0 0 260 140">
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="30%" stopColor="#34d399" />
                          <stop offset="60%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="14" strokeLinecap="round" />
                      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
                      <g style={{ transform: `translate(130px, 130px) rotate(${gaugeAngle}deg)`, transition: "transform 1.2s cubic-bezier(0.4,0,0.2,1)" }}>
                        <line x1="0" y1="0" x2="0" y2="-85" stroke={info?.color || T.accent} strokeWidth="3" strokeLinecap="round" />
                        <circle cx="0" cy="0" r="8" fill={info?.color || T.accent} />
                        <circle cx="0" cy="0" r="4" fill={dark ? "#060810" : "#f3f6ff"} />
                      </g>
                      <text x="22" y="128" fill={T.textMuted} fontSize="10" fontWeight="700">Thin</text>
                      <text x="108" y="38" fill={T.green} fontSize="10" fontWeight="700" textAnchor="middle">Normal</text>
                      <text x="210" y="128" fill="#f87171" fontSize="10" fontWeight="700">Obese</text>
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="bmi-num" style={{ color: info?.color }}>{animBmi}</div>
                    <div className="bmi-cat" style={{ background: `${info?.color}18`, color: info?.color, border: `1px solid ${info?.color}30` }}>{info?.icon} {info?.label}</div>
                    <div className="bmi-tip">{info?.tip}</div>
                  </div>
                  <div className="info-grid">
                    <div className="info-cell">
                      <div className="info-cell-label">Ideal Weight</div>
                      <div className="info-cell-val" style={{ color: T.green }}>{idealW} kg</div>
                      <div className="info-cell-sub">Devine formula</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-cell-label">BMI Prime</div>
                      <div className="info-cell-val" style={{ color: T.accent }}>{(bmi / 25).toFixed(2)}</div>
                      <div className="info-cell-sub">Ratio to upper normal</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-cell-label">Healthy BMI</div>
                      <div className="info-cell-val" style={{ color: T.purple }}>18.5 – 24.9</div>
                      <div className="info-cell-sub">WHO standard</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-cell-label">Weight to Lose</div>
                      <div className="info-cell-val" style={{ color: T.orange }}>
                        {bmi > 25 ? `${(parseFloat((unit === "metric" ? weightKg : weightLbs * 0.453592)) - parseFloat(idealW)).toFixed(1)} kg` : "—"}
                      </div>
                      <div className="info-cell-sub">To reach ideal</div>
                    </div>
                  </div>
                  <button className="calc-btn" style={{ background: `linear-gradient(135deg,${T.green},${T.accent})`, marginTop: 0 }} onClick={() => navigate("/calorie-calculator")}>
                    Calculate Calories Next →
                  </button>
                  <button className="reset-btn" onClick={reset}>↺ Recalculate</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}