import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const FAT_CATEGORIES_MALE = [
  { label: "Essential Fat", min: 2, max: 5, color: "#4f8ef7" },
  { label: "Athletic", min: 6, max: 13, color: "#34d399" },
  { label: "Fitness", min: 14, max: 17, color: "#a78bfa" },
  { label: "Average", min: 18, max: 24, color: "#fb923c" },
  { label: "Obese", min: 25, max: 100, color: "#f87171" },
];
const FAT_CATEGORIES_FEMALE = [
  { label: "Essential Fat", min: 10, max: 13, color: "#4f8ef7" },
  { label: "Athletic", min: 14, max: 20, color: "#34d399" },
  { label: "Fitness", min: 21, max: 24, color: "#a78bfa" },
  { label: "Average", min: 25, max: 31, color: "#fb923c" },
  { label: "Obese", min: 32, max: 100, color: "#f87171" },
];

export default function FatCalculator() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ gender: "male", age: 24, weight: 73.5, height: 178, neck: 38, waist: 82, hip: 95 });
  const [result, setResult] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const calculate = () => {
    const { gender, height, neck, waist, hip, weight } = form;
    let fatPct;
    if (gender === "male") {
      fatPct = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      fatPct = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    fatPct = Math.max(3, Math.min(60, parseFloat(fatPct.toFixed(1))));
    const leanMass = parseFloat((weight * (1 - fatPct / 100)).toFixed(1));
    const fatMass = parseFloat((weight - leanMass).toFixed(1));
    const categories = gender === "male" ? FAT_CATEGORIES_MALE : FAT_CATEGORIES_FEMALE;
    const category = categories.find(c => fatPct >= c.min && fatPct <= c.max) || categories[categories.length - 1];
    setResult({ fatPct, leanMass, fatMass, category });
  };

  const categories = form.gender === "male" ? FAT_CATEGORIES_MALE : FAT_CATEGORIES_FEMALE;

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    .header{display:flex;align-items:center;justify-content:space-between;padding:28px 40px;position:relative;z-index:10;border-bottom:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(30px);}
    .h-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}

    .content{max-width:1050px;margin:0 auto;padding:36px 40px;position:relative;z-index:1;}
    .page-title{font-family:${FONT.display};font-size:36px;font-weight:800;letter-spacing:-0.03em;color:${T.text};margin-bottom:6px;}
    .page-title span{background:linear-gradient(135deg,${T.purple},${T.pink});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:15px;color:${T.textSub};margin-bottom:36px;}

    .main-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:20px;}
    .card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:26px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .card:hover{border-color:${T.glassBorderHover};}
    .card-title{font-family:${FONT.display};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:20px;}

    .gender-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
    .gender-btn{padding:13px;border-radius:13px;border:1.5px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;text-align:center;}
    .gender-btn.active{border-color:${T.purple};color:${T.purple};background:${T.purpleSoft};}

    .field{margin-bottom:16px;}
    .label{font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};display:block;margin-bottom:8px;}
    .input{width:100%;height:52px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1.5px solid ${T.glassBorder};border-radius:13px;padding:0 18px;font-size:15px;font-family:${FONT.body};font-weight:500;color:${T.text};outline:none;transition:all 0.25s;}
    .input:focus{border-color:${T.purple};background:${T.purpleSoft};box-shadow:0 0 0 4px ${T.purpleGlow}40;}
    .input::placeholder{color:${T.textMuted};}

    .measure-note{display:flex;gap:10px;background:${T.purpleSoft};border:1px solid ${T.purple}20;border-radius:14px;padding:14px 16px;margin-bottom:16px;}
    .measure-note-icon{font-size:18px;flex-shrink:0;}
    .measure-note-text{font-size:12px;color:${T.textSub};line-height:1.6;}

    .calc-btn{width:100%;height:56px;border-radius:15px;border:none;background:linear-gradient(135deg,${T.purple},${T.pink});color:#fff;font-size:15px;font-weight:800;font-family:${FONT.body};letter-spacing:0.05em;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 28px ${T.purpleGlow};text-transform:uppercase;}
    .calc-btn:hover{transform:translateY(-3px);box-shadow:0 16px 42px ${T.purpleGlow};}

    .fat-gauge{display:flex;flex-direction:column;align-items:center;padding:32px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;backdrop-filter:blur(28px);margin-bottom:16px;position:relative;overflow:hidden;}
    .fat-gauge-glow{position:absolute;width:200px;height:200px;border-radius:50%;top:-60px;left:50%;transform:translateX(-50%);filter:blur(60px);opacity:0.35;pointer-events:none;}
    .fat-pct{font-family:${FONT.display};font-size:72px;font-weight:800;letter-spacing:-0.04em;line-height:1;animation:countUp 0.8s ease both;}
    .fat-unit{font-size:18px;font-weight:500;color:${T.textSub};margin-top:4px;}
    .fat-category{display:inline-block;padding:8px 20px;border-radius:99px;font-size:14px;font-weight:800;letter-spacing:0.06em;margin-top:14px;}

    .body-comp{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
    .comp-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:20px;backdrop-filter:blur(28px);text-align:center;}
    .comp-label{font-size:11px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:${T.textMuted};margin-bottom:8px;}
    .comp-val{font-family:${FONT.display};font-size:30px;font-weight:800;}
    .comp-unit{font-size:12px;color:${T.textSub};margin-top:4px;}

    .cat-grid{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);}
    .cat-row{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid ${T.glassBorder};}
    .cat-row:last-child{border-bottom:none;}
    .cat-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
    .cat-label{font-size:13px;font-weight:600;color:${T.text};flex:1;}
    .cat-range{font-size:12px;color:${T.textSub};}
    .cat-active{font-weight:800;font-size:14px;}

    @keyframes fu{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:860px){.main-grid{grid-template-columns:1fr;}.body-comp{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.calculator} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="content">
          <div className="page-title" style={{ animation: "fu 0.6s ease both" }}>Body Fat <span>Calculator</span></div>
          <div className="page-sub" style={{ animation: "fu 0.6s ease 0.05s both" }}>US Navy method — the most accurate non-imaging body fat estimation</div>

          <div className="main-grid" style={{ animation: "fu 0.6s ease 0.1s both" }}>
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-title">Your Measurements</div>
                <div className="gender-row">
                  {["male", "female"].map(g => (
                    <button key={g} className={`gender-btn ${form.gender === g ? "active" : ""}`} onClick={() => setForm({ ...form, gender: g })}>
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
                <div className="field"><label className="label">Age</label><input className="input" type="number" value={form.age} onChange={e => setForm({ ...form, age: +e.target.value })} /></div>
                <div className="field"><label className="label">Weight (kg)</label><input className="input" type="number" step={0.1} value={form.weight} onChange={e => setForm({ ...form, weight: +e.target.value })} /></div>
                <div className="field"><label className="label">Height (cm)</label><input className="input" type="number" value={form.height} onChange={e => setForm({ ...form, height: +e.target.value })} /></div>
                <div className="field"><label className="label">Neck circumference (cm)</label><input className="input" type="number" step={0.5} value={form.neck} onChange={e => setForm({ ...form, neck: +e.target.value })} placeholder="Measure at narrowest point" /></div>
                <div className="field"><label className="label">Waist circumference (cm)</label><input className="input" type="number" step={0.5} value={form.waist} onChange={e => setForm({ ...form, waist: +e.target.value })} placeholder="Measure at navel" /></div>
                {form.gender === "female" && (
                  <div className="field"><label className="label">Hip circumference (cm)</label><input className="input" type="number" step={0.5} value={form.hip} onChange={e => setForm({ ...form, hip: +e.target.value })} placeholder="Widest point" /></div>
                )}
              </div>
              <div className="measure-note">
                <span className="measure-note-icon">📏</span>
                <div className="measure-note-text"><strong>How to measure:</strong> Use a soft measuring tape. Neck — measure just below the larynx. Waist — at the navel, relax don't suck in. Hip (women) — at the widest point.</div>
              </div>
              <button className="calc-btn" onClick={calculate}>Calculate Body Fat % →</button>
            </div>

            <div>
              {result ? (
                <>
                  <div className="fat-gauge">
                    <div className="fat-gauge-glow" style={{ background: result.category.color }} />
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Body Fat Percentage</div>
                    <div className="fat-pct" style={{ color: result.category.color }}>{result.fatPct}</div>
                    <div className="fat-unit">percent body fat</div>
                    <div className="fat-category" style={{ background: `${result.category.color}18`, color: result.category.color, border: `1px solid ${result.category.color}35` }}>{result.category.label}</div>
                    <div style={{ width: "100%", marginTop: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>
                        <span>3%</span><span>Essential</span><span>Athletic</span><span>Avg</span><span>50%+</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((result.fatPct / 50) * 100, 100)}%`, background: `linear-gradient(90deg,${T.accent},${result.category.color})`, borderRadius: 99, transition: "width 1.6s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    </div>
                  </div>
                  <div className="body-comp">
                    <div className="comp-card">
                      <div className="comp-label">Lean Mass</div>
                      <div className="comp-val" style={{ color: T.green }}>{result.leanMass}</div>
                      <div className="comp-unit">kg muscle, bone & water</div>
                    </div>
                    <div className="comp-card">
                      <div className="comp-label">Fat Mass</div>
                      <div className="comp-val" style={{ color: T.orange }}>{result.fatMass}</div>
                      <div className="comp-unit">kg total body fat</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="fat-gauge" style={{ minHeight: 300, justifyContent: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                  <div style={{ fontSize: 16, color: T.textSub, textAlign: "center" }}>Fill in your measurements<br />and calculate to see results</div>
                </div>
              )}

              <div className="cat-grid" style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>
                  {form.gender === "male" ? "Male" : "Female"} Body Fat Categories
                </div>
                {categories.map((c, i) => (
                  <div key={i} className="cat-row">
                    <div className="cat-dot" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                    <div className={`cat-label ${result?.category.label === c.label ? "cat-active" : ""}`} style={{ color: result?.category.label === c.label ? c.color : T.text }}>{c.label}</div>
                    <div className="cat-range">{c.min}–{c.max === 100 ? "50+" : c.max}%</div>
                    {result?.category.label === c.label && <span style={{ fontSize: 12, color: c.color }}>← You</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}