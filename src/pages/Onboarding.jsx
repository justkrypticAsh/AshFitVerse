// src/pages/Onboarding.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import useTheme from "../hooks/useTheme";
import { generateCSS, FONT } from "../theme";

const TOTAL_STEPS = 6;

const GOALS = [
  { id: "muscle",    label: "Muscle Gain",     icon: "💪", color: "#4f8ef7" },
  { id: "fat_loss",  label: "Fat Loss",        icon: "🔥", color: "#f472b6" },
  { id: "strength",  label: "Strength",        icon: "🏋️", color: "#fb923c" },
  { id: "endurance", label: "Endurance",       icon: "🏃", color: "#34d399" },
  { id: "general",   label: "General Fitness", icon: "⚡", color: "#a78bfa" },
  { id: "wellness",  label: "Overall Wellness", icon: "🧘", color: "#fbbf24" },
];

const ACTIVITY = [
  { id: "sedentary",   label: "Sedentary",   sub: "Desk job, little movement",  icon: "🛋️" },
  { id: "light",       label: "Light",       sub: "Walk / light exercise 1-3x", icon: "🚶" },
  { id: "moderate",    label: "Moderate",    sub: "Exercise 3-5 days/week",     icon: "🏃" },
  { id: "active",      label: "Active",      sub: "Hard training 6-7 days",     icon: "⚡" },
  { id: "very_active", label: "Very Active", sub: "Athlete / 2x daily",         icon: "🏆" },
];

const EQUIPMENT = [
  { id: "full_gym",   label: "Full Gym",         icon: "🏋️" },
  { id: "home",       label: "Home / Dumbbells", icon: "🏠" },
  { id: "bodyweight", label: "Bodyweight Only",  icon: "🤸" },
  { id: "resistance", label: "Resistance Bands", icon: "🎗️" },
];

const CYCLE_LENGTH = ["21","22","23","24","25","26","27","28","29","30","31","32","33","34","35+"];

const FEMALE_CONDITIONS = [
  { id: "none",    label: "None",                      icon: "✅" },
  { id: "pcos",    label: "PCOS",                      icon: "🔵" },
  { id: "pcod",    label: "PCOD",                      icon: "🟣" },
  { id: "endo",    label: "Endometriosis",              icon: "🟠" },
  { id: "thyroid", label: "Thyroid (Hypo/Hyper)",       icon: "🟡" },
  { id: "other",   label: "Other / Prefer not to say",  icon: "⚪" },
];

const FEMALE_GOALS = [
  { id: "cycle",     label: "Track my cycle",         icon: "📅" },
  { id: "hormones",  label: "Balance hormones",       icon: "⚖️" },
  { id: "fertility", label: "Fertility awareness",    icon: "🌸" },
  { id: "pcos_mgmt", label: "Manage PCOS/PCOD",       icon: "💊" },
  { id: "menopause", label: "Perimenopause support",  icon: "🌿" },
  { id: "general",   label: "General women's health", icon: "💜" },
];

const MALE_FOCUS = [
  { id: "physical", label: "Physical Performance", icon: "💪", sub: "Strength, muscle, endurance" },
  { id: "mental",   label: "Mental Health",        icon: "🧠", sub: "Stress, mood, focus" },
  { id: "sexual",   label: "Sexual Health",        icon: "❤️", sub: "Performance, libido, wellness" },
  { id: "hormones", label: "Hormone Optimisation", icon: "⚗️", sub: "Testosterone, recovery" },
  { id: "all",      label: "All of the above",     icon: "🎯", sub: "Complete male health" },
];

const MALE_CONCERNS = [
  { id: "none",    label: "No specific concerns",     icon: "✅" },
  { id: "low_t",   label: "Low energy / Low T",        icon: "🔋" },
  { id: "stress",  label: "High stress / Anxiety",     icon: "😰" },
  { id: "sleep",   label: "Poor sleep",                icon: "😴" },
  { id: "ed",      label: "Sexual performance",        icon: "❤️" },
  { id: "other",   label: "Other / Prefer not to say", icon: "⚪" },
];

// ─────────────────────────────────────────────────────────────────
// IMPORTANT: All step components are defined OUTSIDE the main
// Onboarding component. This is the actual fix for the cursor-jump
// bug — previously these were defined INSIDE Onboarding(), which
// meant every keystroke (every setData call) re-created brand new
// function references for Step1, Step2, etc. React then treated
// each one as a completely new component type and threw away the
// old input DOM node + remounted a fresh one, killing focus after
// every character. Defining them at module scope means React
// reuses the same component identity across renders, so inputs
// keep focus naturally.
// ─────────────────────────────────────────────────────────────────

function Step1({ data, update, T }) {
  return (
    <>
      <div className="ob-eyebrow">Step 1 of {TOTAL_STEPS}</div>
      <div className="ob-title">Tell us about yourself</div>
      <div className="ob-sub">Personalise workouts, diet and health features — all for you.</div>

      <div className="ob-field">
        <label className="ob-label">Full Name</label>
        <input
          className="ob-input"
          placeholder="Your name"
          value={data.name}
          onChange={e => update("name", e.target.value)}
          autoComplete="name"
        />
      </div>
      <div className="ob-field">
        <label className="ob-label">Age</label>
        <input
          className="ob-input"
          type="number"
          placeholder="e.g. 24"
          min={16}
          max={80}
          value={data.age}
          onChange={e => update("age", e.target.value)}
        />
      </div>
      <div className="ob-field">
        <label className="ob-label">Biological Sex</label>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
          Used to personalise health features and calorie calculations.
        </p>
        <div className="sex-grid">
          {[
            { id: "male",   label: "Male",              ico: "♂️" },
            { id: "female", label: "Female",            ico: "♀️" },
            { id: "other",  label: "Prefer not to say", ico: "⚪" },
          ].map(s => (
            <button
              key={s.id}
              type="button"
              className={`sex-btn ${data.sex === s.id ? "active" : ""}`}
              style={data.sex === s.id ? { borderColor: T.accent, background: T.accentSoft } : {}}
              onClick={() => update("sex", s.id)}
            >
              <span className="sex-ico">{s.ico}</span>
              <span className="sex-lbl" style={data.sex === s.id ? { color: T.accent } : {}}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Step2({ data, update, T }) {
  const h = parseFloat(data.height);
  const w = parseFloat(data.weight);
  const bmi = h && w ? w / ((h / 100) ** 2) : null;

  return (
    <>
      <div className="ob-eyebrow">Step 2 of {TOTAL_STEPS}</div>
      <div className="ob-title">Your body stats</div>
      <div className="ob-sub">Used for BMI, calorie targets and progress tracking.</div>

      <div className="ob-row ob-field">
        <div>
          <label className="ob-label">Height (cm)</label>
          <input
            className="ob-input"
            type="number"
            placeholder="e.g. 178"
            value={data.height}
            onChange={e => update("height", e.target.value)}
          />
        </div>
        <div>
          <label className="ob-label">Current Weight (kg)</label>
          <input
            className="ob-input"
            type="number"
            placeholder="e.g. 73.5"
            step={0.1}
            value={data.weight}
            onChange={e => update("weight", e.target.value)}
          />
        </div>
      </div>
      <div className="ob-field">
        <label className="ob-label">
          Target Weight (kg)
          <span style={{ color: T.textMuted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> — optional</span>
        </label>
        <input
          className="ob-input"
          type="number"
          placeholder="Goal weight?"
          step={0.1}
          value={data.targetWeight}
          onChange={e => update("targetWeight", e.target.value)}
        />
      </div>

      {bmi && (
        <div style={{ padding: "14px 18px", borderRadius: 13, background: T.accentSoft, border: `1px solid ${T.accent}30`, fontSize: 13, color: T.textSub, marginTop: 4 }}>
          <strong style={{ color: T.accent }}>Your BMI: </strong>
          {bmi.toFixed(1)}
          <span style={{ marginLeft: 8, color: T.textMuted }}>
            ({bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obese"})
          </span>
        </div>
      )}
    </>
  );
}

function Step3({ data, update }) {
  return (
    <>
      <div className="ob-eyebrow">Step 3 of {TOTAL_STEPS}</div>
      <div className="ob-title">What's your primary goal?</div>
      <div className="ob-sub">We'll build everything around this.</div>
      <div className="opt-grid">
        {GOALS.map(g => (
          <button
            key={g.id}
            type="button"
            className={`opt-btn ${data.goal === g.id ? "active" : ""}`}
            style={data.goal === g.id ? { borderColor: g.color, background: `${g.color}14`, boxShadow: `0 0 18px ${g.color}30` } : {}}
            onClick={() => update("goal", g.id)}
          >
            <span className="opt-ico">{g.icon}</span>
            <span className="opt-lbl" style={data.goal === g.id ? { color: g.color } : {}}>{g.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Step4({ data, update, T }) {
  return (
    <>
      <div className="ob-eyebrow">Step 4 of {TOTAL_STEPS}</div>
      <div className="ob-title">Training setup</div>
      <div className="ob-sub">Activity level and equipment access.</div>

      <div className="ob-field">
        <label className="ob-label">Activity Level</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ACTIVITY.map(a => (
            <button
              key={a.id}
              type="button"
              className={`opt-btn-sm ${data.activityLevel === a.id ? "active" : ""}`}
              style={data.activityLevel === a.id ? { borderColor: T.accent, background: T.accentSoft } : {}}
              onClick={() => update("activityLevel", a.id)}
            >
              <span className="opt-sm-ico">{a.icon}</span>
              <div>
                <span className="opt-sm-lbl" style={data.activityLevel === a.id ? { color: T.accent } : {}}>{a.label}</span>
                <span style={{ display: "block", fontSize: 11, color: T.textMuted, marginTop: 2 }}>{a.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="ob-field">
        <label className="ob-label">Equipment</label>
        <div className="opt-grid">
          {EQUIPMENT.map(e => (
            <button
              key={e.id}
              type="button"
              className={`opt-btn ${data.equipment === e.id ? "active" : ""}`}
              style={data.equipment === e.id ? { borderColor: T.green, background: T.greenSoft, boxShadow: `0 0 16px ${T.greenGlow}` } : {}}
              onClick={() => update("equipment", e.id)}
            >
              <span className="opt-ico">{e.icon}</span>
              <span className="opt-lbl" style={data.equipment === e.id ? { color: T.green } : {}}>{e.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Step5Female({ data, update, toggleArr, T }) {
  return (
    <>
      <div className="ob-eyebrow">Step 5 of {TOTAL_STEPS} — Women's Health</div>
      <div className="ob-title">Your health profile</div>
      <div className="ob-sub">Personalises cycle tracking, hormone workouts and recommendations.</div>
      <div className="info-box"><strong>🔒 Private:</strong> Health data is encrypted and never shared.</div>

      <div className="ob-field">
        <label className="ob-label">Average Cycle Length</label>
        <select className="ob-select" value={data.cycleLength} onChange={e => update("cycleLength", e.target.value)}>
          {CYCLE_LENGTH.map(l => <option key={l} value={l}>{l} days</option>)}
        </select>
      </div>
      <div className="ob-field">
        <label className="ob-label">
          Last Period Start Date
          <span style={{ color: T.textMuted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> — optional</span>
        </label>
        <input type="date" className="ob-date" value={data.lastPeriod} onChange={e => update("lastPeriod", e.target.value)} />
      </div>
      <div className="ob-field">
        <label className="ob-label">Any diagnosed conditions?</label>
        <div className="opt-grid">
          {FEMALE_CONDITIONS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`opt-btn-sm ${data.femaleCondition === c.id ? "active" : ""}`}
              style={data.femaleCondition === c.id ? { borderColor: T.purple, background: T.purpleSoft, color: T.purple } : {}}
              onClick={() => update("femaleCondition", c.id)}
            >
              <span className="opt-sm-ico">{c.icon}</span>
              <span className="opt-sm-lbl" style={data.femaleCondition === c.id ? { color: T.purple } : {}}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ob-field">
        <label className="ob-label">What do you want help with?</label>
        <div className="chip-grid">
          {FEMALE_GOALS.map(g => (
            <button
              key={g.id}
              type="button"
              className={`chip ${data.femaleGoals.includes(g.id) ? "active" : ""}`}
              onClick={() => toggleArr("femaleGoals", g.id)}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Step5Male({ data, update, toggleArr, T }) {
  return (
    <>
      <div className="ob-eyebrow">Step 5 of {TOTAL_STEPS} — Men's Health</div>
      <div className="ob-title">Your health focus</div>
      <div className="ob-sub">We'll unlock the right features for you.</div>
      <div className="info-box"><strong>🔒 Private:</strong> Health data is encrypted and never shared.</div>

      <div className="ob-field">
        <label className="ob-label">Primary focus — select all that apply</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {MALE_FOCUS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`opt-btn ${data.maleFocus.includes(f.id) ? "active" : ""}`}
              style={data.maleFocus.includes(f.id) ? { borderColor: T.accent, background: T.accentSoft, boxShadow: `0 0 16px ${T.accentGlow}40` } : {}}
              onClick={() => toggleArr("maleFocus", f.id)}
            >
              <span className="opt-ico">{f.icon}</span>
              <div>
                <span className="opt-lbl" style={data.maleFocus.includes(f.id) ? { color: T.accent } : {}}>{f.label}</span>
                <span className="opt-sub">{f.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="ob-field">
        <label className="ob-label">Any specific concerns?</label>
        <div className="opt-grid">
          {MALE_CONCERNS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`opt-btn-sm ${data.maleConcerns === c.id ? "active" : ""}`}
              style={data.maleConcerns === c.id ? { borderColor: T.accent, background: T.accentSoft } : {}}
              onClick={() => update("maleConcerns", c.id)}
            >
              <span className="opt-sm-ico">{c.icon}</span>
              <span className="opt-sm-lbl" style={data.maleConcerns === c.id ? { color: T.accent } : {}}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Step5Other({ data, toggleArr }) {
  return (
    <>
      <div className="ob-eyebrow">Step 5 of {TOTAL_STEPS}</div>
      <div className="ob-title">Health preferences</div>
      <div className="ob-sub">What health areas matter most?</div>
      <div className="chip-grid">
        {[...FEMALE_GOALS, ...MALE_FOCUS].slice(0, 8).map(g => (
          <button
            key={g.id}
            type="button"
            className={`chip ${data.femaleGoals.includes(g.id) ? "active" : ""}`}
            onClick={() => toggleArr("femaleGoals", g.id)}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>
    </>
  );
}

function Step6({ data, update, T }) {
  return (
    <>
      <div className="ob-eyebrow">Step 6 of {TOTAL_STEPS} — Almost done!</div>
      <div className="ob-title">You're all set, {data.name.split(" ")[0] || "Athlete"} 🎉</div>
      <div className="ob-sub">Your personalised dashboard is ready to launch.</div>

      <div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 18, padding: 20, marginBottom: 20 }}>
        {[
          { k: "Name",      v: data.name || "—" },
          { k: "Goal",      v: GOALS.find(g => g.id === data.goal)?.label || "—" },
          { k: "Age",       v: data.age ? `${data.age} years` : "—" },
          { k: "Height",    v: data.height ? `${data.height} cm` : "—" },
          { k: "Weight",    v: data.weight ? `${data.weight} kg` : "—" },
          { k: "Activity",  v: ACTIVITY.find(a => a.id === data.activityLevel)?.label || "—" },
          { k: "Equipment", v: EQUIPMENT.find(e => e.id === data.equipment)?.label || "—" },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
            <span style={{ color: T.textSub }}>{r.k}</span>
            <span style={{ fontWeight: 700, color: T.text }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div className="agree-box" onClick={() => update("agreeTerms", !data.agreeTerms)}>
        <div className={`agree-check ${data.agreeTerms ? "checked" : ""}`}>
          {data.agreeTerms && "✓"}
        </div>
        <div className="agree-text">
          I confirm I am <strong>18 years or older</strong> and agree to the{" "}
          <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Onboarding component
// ─────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { dark, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState("forward");

  const [data, setData] = useState({
    name: "",
    age: "", sex: "",
    height: "", weight: "", targetWeight: "",
    goal: "",
    activityLevel: "", equipment: "",
    cycleLength: "28", lastPeriod: "", femaleCondition: "", femaleGoals: [],
    maleFocus: [], maleConcerns: "",
    agreeTerms: false,
  });

  useEffect(() => {
    setMounted(true);
    const signupName = localStorage.getItem("ashfitverse_signup_name");
    if (signupName) {
      setData(d => ({ ...d, name: signupName }));
      localStorage.removeItem("ashfitverse_signup_name");
    }
  }, []);

  // Stable callbacks — won't change identity across renders unnecessarily
  const update = (key, val) => setData(d => ({ ...d, [key]: val }));
  const toggleArr = (key, val) => setData(d => ({
    ...d,
    [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val],
  }));

  const canNext = () => {
    if (step === 1) return data.name && data.age && data.sex;
    if (step === 2) return data.height && data.weight;
    if (step === 3) return data.goal;
    if (step === 4) return data.activityLevel && data.equipment;
    if (step === 5) {
      if (data.sex === "female") return data.femaleCondition;
      if (data.sex === "male")   return data.maleFocus.length > 0;
      return true;
    }
    if (step === 6) return data.agreeTerms;
    return true;
  };

  const goNext = () => { setDirection("forward"); setStep(s => s + 1); };
  const goPrev = () => { setDirection("backward"); setStep(s => s - 1); };

  const finish = async () => {
    setSaving(true);
    const profileData = {
      ...data,
      createdAt: new Date().toISOString(),
      streak: 0,
    };

    try {
      localStorage.setItem("ashfitverse_user", JSON.stringify(profileData));
      localStorage.setItem("ashfitverse_onboarded", "true");

      const currentUser = auth.currentUser;
      if (currentUser) {
        await setDoc(doc(db, "users", currentUser.uid), profileData, { merge: true });
        console.log("✅ Profile saved to Firestore:", currentUser.uid);
      } else {
        console.warn("⚠️ No Firebase user found — saved to localStorage only");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Firestore save error:", err);
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const STEP_TITLES = [
    "Basics", "Body Stats", "Your Goal", "Training Setup", "Health Profile", "Review",
  ];

  const css = generateCSS(T, dark) + `
    .ob-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      display:flex;align-items:center;justify-content:center;padding:24px;
      position:relative;overflow:hidden;
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}

    .ob-layout{position:relative;z-index:10;width:100%;max-width:920px;
      display:grid;grid-template-columns:240px 1fr;gap:0;
      animation:scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) both;}

    /* ── Left rail: step list ── */
    .ob-rail{
      background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      border:1px solid ${T.glassBorder};
      border-right:none;
      border-radius:28px 0 0 28px;
      padding:32px 22px;
      display:flex;flex-direction:column;gap:4px;
    }
    .ob-rail-logo{
      font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};
      margin-bottom:28px;padding:0 4px;
    }
    .ob-rail-logo span{color:${T.accent};}
    .ob-rail-item{
      display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:13px;
      font-size:13px;font-weight:600;color:${T.textMuted};transition:all 0.3s;
      position:relative;
    }
    .ob-rail-item.active{
      background:${T.accentSoft};color:${T.accent};
    }
    .ob-rail-item.done{color:${T.textSub};}
    .ob-rail-num{
      width:24px;height:24px;border-radius:50%;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:800;
      border:1.5px solid ${dark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.12)"};
      transition:all 0.3s;
    }
    .ob-rail-item.active .ob-rail-num{
      background:linear-gradient(135deg,${T.accent},${T.purple});
      border-color:transparent;color:#fff;
      box-shadow:0 0 0 4px ${T.accentGlow};
    }
    .ob-rail-item.done .ob-rail-num{
      background:${T.green};border-color:transparent;color:#fff;
    }
    .ob-rail-line{
      position:absolute;left:23px;top:38px;width:1.5px;height:18px;
      background:${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"};
    }

    /* ── Right: card ── */
    .ob-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-left:none;
      border-radius:0 28px 28px 0;
      backdrop-filter:blur(32px);padding:44px 48px;
      box-shadow:0 40px 120px rgba(0,0,0,${dark?"0.5":"0.12"});
      min-height:560px;display:flex;flex-direction:column;
    }

    .ob-prog-wrap{margin-bottom:30px;}
    .ob-prog-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
    .ob-step-label{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${T.textMuted};}
    .ob-step-count{font-size:11px;font-weight:700;color:${T.accent};}
    .ob-prog-track{height:4px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.07)"};border-radius:99px;overflow:hidden;}
    .ob-prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,${T.accent},${T.purple});
      transition:width 0.5s cubic-bezier(0.4,0,0.2,1);}

    .ob-step-content{flex:1;}

    .ob-eyebrow{font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${T.accent};margin-bottom:10px;}
    .ob-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:8px;line-height:1.15;}
    .ob-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:26px;}

    .ob-field{margin-bottom:18px;}
    .ob-label{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${T.textMuted};display:block;margin-bottom:8px;}
    .ob-input{width:100%;height:52px;
      background:${dark?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)"};
      border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;
      font-size:15px;font-family:${FONT.body};font-weight:500;color:${T.text};outline:none;transition:all 0.25s;}
    .ob-input::placeholder{color:${T.textMuted};}
    .ob-input:focus{border-color:${T.accent};background:${T.accentSoft};box-shadow:0 0 0 4px ${T.accentGlow}25;}
    .ob-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .ob-select{width:100%;height:52px;
      background:${dark?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)"};
      border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;
      font-size:14px;font-family:${FONT.body};font-weight:500;color:${T.text};
      outline:none;cursor:pointer;transition:all 0.25s;-webkit-appearance:none;}
    .ob-select:focus{border-color:${T.accent};}

    .sex-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px;}
    .sex-btn{padding:18px 12px;border-radius:16px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.25s;text-align:center;font-family:${FONT.body};}
    .sex-btn:hover{transform:translateY(-2px);}
    .sex-btn.active{transform:translateY(-2px);}
    .sex-ico{font-size:28px;display:block;margin-bottom:8px;}
    .sex-lbl{font-size:13px;font-weight:700;color:${T.text};}

    .opt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:4px;}
    .opt-btn{padding:16px 14px;border-radius:15px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.25s;
      text-align:left;font-family:${FONT.body};display:flex;align-items:flex-start;gap:12px;}
    .opt-btn:hover{transform:translateY(-2px);}
    .opt-btn.active{transform:translateY(-2px);}
    .opt-ico{font-size:22px;flex-shrink:0;margin-top:1px;}
    .opt-lbl{font-size:13px;font-weight:700;color:${T.text};display:block;margin-bottom:2px;}
    .opt-sub{font-size:11px;color:${T.textMuted};line-height:1.4;}

    .opt-btn-sm{padding:12px 14px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.22s;
      font-family:${FONT.body};display:flex;align-items:center;gap:10px;}
    .opt-btn-sm:hover{border-color:${T.glassBorderHover};}
    .opt-sm-ico{font-size:18px;flex-shrink:0;}
    .opt-sm-lbl{font-size:13px;font-weight:700;color:${T.text};}

    .chip-grid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;}
    .chip{padding:9px 16px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.22s;
      font-size:12px;font-weight:700;color:${T.textSub};font-family:${FONT.body};}
    .chip:hover{border-color:${T.glassBorderHover};color:${T.text};}
    .chip.active{color:#fff;border-color:transparent;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      box-shadow:0 4px 14px ${T.accentGlow};}

    .ob-date{width:100%;height:52px;
      background:${dark?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)"};
      border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;
      font-size:15px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.25s;cursor:pointer;}
    .ob-date:focus{border-color:${T.purple};background:${T.purpleSoft};}
    input[type="date"]::-webkit-calendar-picker-indicator{
      filter:${dark?"invert(1) opacity(0.5)":"opacity(0.5)"};cursor:pointer;}

    .agree-box{display:flex;align-items:flex-start;gap:14px;
      padding:18px;border-radius:15px;background:${T.accentSoft};
      border:1px solid ${T.accent}30;margin-bottom:20px;cursor:pointer;}
    .agree-check{width:22px;height:22px;border-radius:7px;flex-shrink:0;
      border:2px solid ${T.glassBorder};background:${T.glass};
      display:flex;align-items:center;justify-content:center;font-size:13px;
      transition:all 0.25s;margin-top:1px;}
    .agree-check.checked{background:${T.accent};border-color:${T.accent};color:#fff;}
    .agree-text{font-size:13px;color:${T.textSub};line-height:1.6;}
    .agree-text strong{color:${T.text};}

    .info-box{padding:16px 18px;border-radius:13px;
      background:${T.purpleSoft};border:1px solid ${T.purple}30;
      font-size:12px;color:${T.textSub};line-height:1.65;margin-bottom:20px;}
    .info-box strong{color:${T.purple};}

    .ob-nav{display:flex;gap:12px;margin-top:24px;padding-top:24px;border-top:1px solid ${T.glassBorder};}
    .ob-prev{flex:1;height:52px;border-radius:14px;border:1px solid ${T.glassBorder};
      background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.25s;}
    .ob-prev:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .ob-next{flex:2;height:52px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 8px 28px ${T.accentGlow};}
    .ob-next:hover{transform:translateY(-2px);box-shadow:0 14px 40px ${T.accentGlow};}
    .ob-next:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
    .ob-finish{background:linear-gradient(135deg,${T.green},${T.accent})!important;
      box-shadow:0 8px 28px ${T.greenGlow}!important;}
    .ob-finish:hover{box-shadow:0 14px 40px ${T.greenGlow}!important;}

    .saving-overlay{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      background:${dark?"rgba(7,8,15,0.92)":"rgba(242,244,252,0.92)"};
      backdrop-filter:blur(20px);}
    .saving-spinner{width:52px;height:52px;border:4px solid ${T.glassBorder};
      border-top-color:${T.accent};border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:20px;}
    .saving-text{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .saving-sub{font-size:13px;color:${T.textSub};}

    @keyframes stepInFwd{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}
    @keyframes stepInBack{from{opacity:0;transform:translateX(-24px);}to{opacity:1;transform:translateX(0);}}
    .step-anim-fwd{animation:stepInFwd 0.35s cubic-bezier(0.4,0,0.2,1) both;}
    .step-anim-back{animation:stepInBack 0.35s cubic-bezier(0.4,0,0.2,1) both;}

    @media(max-width:760px){
      .ob-layout{grid-template-columns:1fr;}
      .ob-rail{border-radius:28px 28px 0 0;border-right:1px solid ${T.glassBorder};border-bottom:none;
        flex-direction:row;overflow-x:auto;padding:18px 16px;gap:8px;}
      .ob-rail-logo{display:none;}
      .ob-rail-line{display:none;}
      .ob-rail-item{flex-shrink:0;padding:8px 10px;}
      .ob-rail-item span:last-child{display:none;}
      .ob-card{border-radius:0 0 28px 28px;border-left:1px solid ${T.glassBorder};border-top:none;padding:28px 22px;}
      .ob-row{grid-template-columns:1fr;}
      .sex-grid{grid-template-columns:1fr 1fr 1fr;}
      .opt-grid{grid-template-columns:1fr;}
      .ob-title{font-size:26px;}
    }
  `;

  // Build props once per render — passed down, not re-created as components
  const stepProps = { data, update, toggleArr, T };

  const renderStep = () => {
    if (step === 1) return <Step1 {...stepProps} />;
    if (step === 2) return <Step2 {...stepProps} />;
    if (step === 3) return <Step3 {...stepProps} />;
    if (step === 4) return <Step4 {...stepProps} />;
    if (step === 5) {
      if (data.sex === "female") return <Step5Female {...stepProps} />;
      if (data.sex === "male")   return <Step5Male {...stepProps} />;
      return <Step5Other {...stepProps} />;
    }
    if (step === 6) return <Step6 {...stepProps} />;
    return null;
  };

  return (
    <>
      <style>{css}</style>

      {saving && (
        <div className="saving-overlay">
          <div className="saving-spinner" />
          <div className="saving-text">Setting up your dashboard...</div>
          <div className="saving-sub">Saving your profile securely ✓</div>
        </div>
      )}

      <div className="ob-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        <div className="ob-layout">
          {/* Left rail — step list */}
          <div className="ob-rail">
            <div className="ob-rail-logo">AshFit<span>Verse</span></div>
            {STEP_TITLES.map((title, i) => {
              const num = i + 1;
              const isActive = num === step;
              const isDone   = num < step;
              return (
                <div key={title} style={{ position: "relative" }}>
                  {i > 0 && <div className="ob-rail-line" />}
                  <div className={`ob-rail-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                    <div className="ob-rail-num">{isDone ? "✓" : num}</div>
                    <span>{title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right card */}
          <div className="ob-card">
            <div className="ob-prog-wrap">
              <div className="ob-prog-header">
                <span className="ob-step-label">Your Profile</span>
                <span className="ob-step-count">{step} / {TOTAL_STEPS}</span>
              </div>
              <div className="ob-prog-track">
                <div className="ob-prog-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div
              key={step}
              className={`ob-step-content ${direction === "forward" ? "step-anim-fwd" : "step-anim-back"}`}
            >
              {renderStep()}
            </div>

            <div className="ob-nav">
              {step > 1 && (
                <button className="ob-prev" onClick={goPrev}>← Back</button>
              )}
              {step < TOTAL_STEPS ? (
                <button className="ob-next" disabled={!canNext()} onClick={goNext}>
                  Continue →
                </button>
              ) : (
                <button className="ob-next ob-finish" disabled={!canNext() || saving} onClick={finish}>
                  {saving ? "Saving..." : "Launch My Dashboard 🚀"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}