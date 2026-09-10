// src/pages/WorkoutPlanner.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

// GET API KEY FROM VITE ENV OR PASTE DIRECTLY FOR LOCAL TESTING
// production me safe rakhne ke liye VITE_CLAUDE_API_KEY use karein .env file me
const OPENROUTER_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "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";

const GOALS = [
  { id: "muscle", label: "Muscle Gain", icon: "💪", color: "#4f8ef7" },
  { id: "fat_loss", label: "Fat Loss", icon: "🔥", color: "#f472b6" },
  { id: "strength", label: "Strength", icon: "🏋️", color: "#fb923c" },
  { id: "endurance", label: "Endurance", icon: "🏃", color: "#34d399" },
  { id: "general", label: "General Fitness", icon: "⚡", color: "#a78bfa" },
];
const LEVELS = [
  { id: "beginner", label: "Beginner", sub: "< 1 year training", icon: "🌱" },
  { id: "intermediate", label: "Intermediate", sub: "1–3 years", icon: "🌿" },
  { id: "advanced", label: "Advanced", sub: "3+ years", icon: "🌳" },
];
const DAYS_OPTIONS = [3, 4, 5, 6];
const EQUIPMENT = [
  { id: "full_gym", label: "Full Gym", icon: "🏋️" },
  { id: "home", label: "Home / Dumbbells", icon: "🏠" },
  { id: "bodyweight", label: "Bodyweight Only", icon: "🤸" },
  { id: "resistance", label: "Resistance Bands", icon: "🎗️" },
];

const PLANS = {
  muscle: {
    3: [
      { day: "Monday", name: "Push", color: "#4f8ef7", exercises: ["Bench Press 4×8", "Incline DB Press 3×10", "Shoulder Press 3×10", "Tricep Dips 3×12", "Cable Fly 3×12"] },
      { day: "Wednesday", name: "Pull", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "Barbell Row 3×10", "Face Pulls 3×15", "Bicep Curl 3×12"] },
      { day: "Friday", name: "Legs", color: "#fb923c", exercises: ["Squat 4×8", "Leg Press 3×12", "Romanian DL 3×10", "Leg Curl 3×12", "Calf Raises 4×15"] },
    ],
    4: [
      { day: "Monday", name: "Chest & Triceps", color: "#4f8ef7", exercises: ["Bench Press 4×8", "Incline Press 3×10", "Cable Fly 3×12", "Tricep Pushdown 3×12", "Skull Crushers 3×10"] },
      { day: "Tuesday", name: "Back & Biceps", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "Seated Row 3×10", "Lat Pulldown 3×12", "Hammer Curl 3×12"] },
      { day: "Thursday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Front Raises 3×12", "Rear Delt Fly 3×15", "Shrugs 3×12"] },
      { day: "Friday", name: "Legs", color: "#fb923c", exercises: ["Squat 4×8", "Leg Press 3×12", "RDL 3×10", "Lunges 3×10", "Calf Raises 4×20"] },
    ],
    5: [
      { day: "Monday", name: "Chest", color: "#4f8ef7", exercises: ["Bench Press 5×5", "Incline DB 4×10", "Cable Fly 3×12", "Push-ups 3×15", "Chest Dip 3×10"] },
      { day: "Tuesday", name: "Back", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "T-Bar Row 3×10", "Lat Pulldown 3×12", "Back Extension 3×15"] },
      { day: "Wednesday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Arnold Press 3×10", "Upright Row 3×12", "Face Pulls 3×15"] },
      { day: "Thursday", name: "Legs", color: "#fb923c", exercises: ["Squat 5×5", "Leg Press 4×10", "Hack Squat 3×10", "Leg Curl 3×12", "Seated Calf 4×15"] },
      { day: "Saturday", name: "Arms", color: "#f472b6", exercises: ["Barbell Curl 4×10", "Skull Crushers 4×10", "Hammer Curl 3×12", "Tricep Dip 3×12", "Concentration Curl 3×15"] },
    ],
    6: [
      { day: "Monday", name: "Chest", color: "#4f8ef7", exercises: ["Bench Press 5×5", "Incline DB 4×10", "Cable Fly 3×12", "Push-ups 3×15"] },
      { day: "Tuesday", name: "Back", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "T-Bar Row 3×10", "Lat Pulldown 3×12"] },
      { day: "Wednesday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Arnold Press 3×10", "Face Pulls 3×15"] },
      { day: "Thursday", name: "Legs", color: "#fb923c", exercises: ["Squat 5×5", "Leg Press 4×10", "Hack Squat 3×10", "Leg Curl 3×12"] },
      { day: "Friday", name: "Arms", color: "#f472b6", exercises: ["Barbell Curl 4×10", "Skull Crushers 4×10", "Hammer Curl 3×12", "Tricep Dip 3×12"] },
      { day: "Saturday", name: "Full Body", color: "#fbbf24", exercises: ["Power Clean 3×5", "Pull-ups 3×Max", "Dips 3×Max", "Farmer's Walk 3×30m"] },
    ],
  },
  fat_loss: {
    3: [
      { day: "Monday", name: "Full Body + Cardio", color: "#f472b6", exercises: ["Circuit: Squat 4×15", "Push-ups 4×15", "DB Row 4×15", "Jump Rope 10min", "Plank 3×60s"] },
      { day: "Wednesday", name: "HIIT", color: "#fb923c", exercises: ["Sprint Intervals 20min", "Burpees 4×15", "Mountain Climbers 4×30s", "Box Jumps 4×10", "Battle Ropes 4×30s"] },
      { day: "Friday", name: "Strength + Core", color: "#4f8ef7", exercises: ["Deadlift 3×10", "Bench Press 3×10", "OHP 3×10", "Russian Twists 3×20", "Bicycle Crunches 3×20"] },
    ],
    4: [
      { day: "Monday", name: "Upper Body", color: "#4f8ef7", exercises: ["Push-ups 4×15", "DB Row 4×12", "Shoulder Press 3×12", "Tricep Extension 3×15", "Bicep Curl 3×15"] },
      { day: "Tuesday", name: "HIIT Cardio", color: "#f472b6", exercises: ["Sprints 6×30s", "Jump Rope 3×3min", "Burpees 4×10", "High Knees 4×30s", "Mountain Climbers 4×30s"] },
      { day: "Thursday", name: "Lower Body", color: "#fb923c", exercises: ["Goblet Squat 4×15", "Lunges 3×12", "Glute Bridge 4×15", "Step-ups 3×12", "Calf Raises 4×20"] },
      { day: "Friday", name: "Full Body Circuit", color: "#34d399", exercises: ["Deadlift 3×12", "Bench 3×12", "Squat 3×12", "Row 3×12", "Rest 60s between rounds"] },
    ],
    5: [
      { day: "Mon", name: "Push HIIT", color: "#4f8ef7", exercises: ["Bench 3×12", "Push-ups 3×15", "Shoulder Press 3×12", "Cardio HIIT 20min"] },
      { day: "Tue", name: "Pull HIIT", color: "#a78bfa", exercises: ["Pull-ups 4×8", "DB Row 3×12", "Face Pulls 3×15", "Cardio HIIT 20min"] },
      { day: "Wed", name: "Legs", color: "#fb923c", exercises: ["Squat 4×12", "Leg Press 3×15", "Lunges 3×12", "Calf Raises 4×20"] },
      { day: "Thu", name: "Full Body", color: "#34d399", exercises: ["Deadlift 3×10", "OHP 3×10", "Pull-ups 3×8", "Dips 3×10"] },
      { day: "Fri", name: "Cardio & Core", color: "#f472b6", exercises: ["30min Steady State", "Plank 3×60s", "Russian Twist 3×20", "Dragon Flags 3×8"] },
    ],
    6: [
      { day: "Mon", name: "Upper A", color: "#4f8ef7", exercises: ["Bench 4×10", "Row 4×10", "OHP 3×12", "Curl 3×12"] },
      { day: "Tue", name: "Lower A", color: "#fb923c", exercises: ["Squat 4×10", "RDL 3×12", "Lunges 3×10", "Calf 4×15"] },
      { day: "Wed", name: "HIIT", color: "#f472b6", exercises: ["Sprints 8×30s", "Burpees 4×10", "Jump Rope 10min"] },
      { day: "Thu", name: "Upper B", color: "#a78bfa", exercises: ["Incline Press 4×10", "Pull-ups 4×8", "Lateral Raise 4×15"] },
      { day: "Fri", name: "Lower B", color: "#34d399", exercises: ["Deadlift 4×6", "Leg Press 3×15", "Glute Bridge 3×15"] },
      { day: "Sat", name: "Active Recovery", color: "#fbbf24", exercises: ["30min Walk/Jog", "Yoga / Stretching", "Foam Rolling"] },
    ],
  },
};

export default function WorkoutPlanner() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("muscle");
  const [level, setLevel] = useState("intermediate");
  const [days, setDays] = useState(4);
  const [equipment, setEquipment] = useState("full_gym");
  
  const [plan, setPlan] = useState(null);
  const [generationMode, setGenerationMode] = useState("rule-based");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const applyLocalFallback = () => {
    const selectedPlan = PLANS[goal]?.[days] || PLANS["muscle"][4];
    setPlan(selectedPlan);
  };

  const generatePlan = async (selectedMode = generationMode) => {
    setLoading(true);
    setStep(3);

    if (selectedMode === "rule-based") {
      applyLocalFallback();
      setLoading(false);
      return;
    }

    try {
      const systemPrompt = `You are the ultimate fitness intelligence matrix for AshFitVerse. 
      Generate a highly personalized workout split. Respond ONLY with a valid JSON array matching the schema:
      [
        { "day": "String", "name": "String", "color": "HexCode", "exercises": ["String"] }
      ]
      No conversational filler, no markdown wrapping.`;

      const userPrompt = `Generate a workout plan for a ${level} with ${equipment} goal: ${goal}, days: ${days}x per week.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const aiData = JSON.parse(cleanJson);

      if (aiData && Array.isArray(aiData)) {
        setPlan(aiData);
      } else {
        applyLocalFallback();
      }
    } catch (err) {
      console.error("Direct OpenRouter Call Failed, engaging local fallback:", err);
      applyLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = (newMode) => {
    setGenerationMode(newMode);
    if (step === 3) {
      generatePlan(newMode);
    }
  };

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    /* UNIFIED HEADER BAR WITH MATCHING NAVIGATION BUTTON */
    .header{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark?"rgba(8,8,12,0.85)":"rgba(255,255,255,0.85)"};backdrop-filter:blur(40px);}
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};color:${T.text};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all 0.15s ease;}
    .pr-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .h-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}

    .theme-toggle{width:48px;height:26px;border-radius:99px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:${T.accent};display:flex;align-items:center;justify-content:center;font-size:10px;transition:left .2s ease;left:${dark?"24px":"2px"};}

    .content{max-width:900px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 16px; }
    
    .mode-toggle { display: inline-flex; background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}; padding: 4px; border-radius: 99px; border: 1px solid ${T.glassBorder}; }
    .mode-btn { background: transparent; border: none; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 700; color: ${T.textSub}; cursor: pointer; transition: all 0.2s; font-family: ${FONT.body};}
    .mode-btn.active { background: ${T.accent}; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

    .page-title{font-family:${FONT.display};font-size:36px;font-weight:800;letter-spacing:-0.03em;color:${T.text};margin:0;}
    .page-title span{background:linear-gradient(135deg,${T.orange},${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:15px;color:${T.textSub};margin-bottom:36px;}

    .steps{display:flex;align-items:center;gap:0;margin-bottom:40px;}
    .step-item{display:flex;align-items:center;gap:10px;flex:1;}
    .step-circle{width:36px;height:36px;border-radius:50%;border:2px solid ${T.glassBorder};background:${T.glass};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${T.textMuted};transition:all 0.3s;flex-shrink:0;}
    .step-circle.done{background:linear-gradient(135deg,${T.accent},${T.purple});border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.1);}
    .step-circle.active{border-color:${T.accent};color:${T.accent};box-shadow:0 0 16px rgba(0,0,0,0.05);}
    .step-label{font-size:13px;font-weight:600;color:${T.textMuted};font-family:${FONT.body};}
    .step-label.active{color:${T.text};}
    .step-line{flex:1;height:1px;background:${T.glassBorder};margin:0 12px;}
    .step-line.done{background:linear-gradient(90deg,${T.accent},${T.purple});}

    .section-title{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};margin-bottom:20px;}

    .option-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:32px;}
    .option-btn{padding:20px 16px;border-radius:18px;border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);text-align:center;font-family:${FONT.body};}
    .option-btn:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .option-btn.active{transform:translateY(-3px);}
    .opt-icon{font-size:26px;display:block;margin-bottom:10px;}
    .opt-label{font-size:13px;font-weight:700;color:${T.text};display:block;}
    .opt-sub{font-size:11px;color:${T.textMuted};margin-top:4px;display:block;}

    .days-grid{display:flex;gap:12px;margin-bottom:32px;}
    .day-btn{flex:1;padding:18px;border-radius:16px;border:1.5px solid ${T.glassBorder};background:${T.glass};cursor:pointer;transition:all 0.25s;text-align:center;font-family:${FONT.body};}
    .day-btn:hover{border-color:${T.accent}35;}
    .day-btn.active{border-color:${T.accent};background:${T.accent}12;box-shadow:0 0 20px rgba(0,0,0,0.05);}
    .day-num{font-family:${FONT.display};font-size:28px;font-weight:800;color:${T.text};}
    .day-lbl{font-size:12px;color:${T.textSub};font-weight:600;margin-top:4px;}

    .nav-btns{display:flex;gap:12px;margin-top:8px;}
    .prev-btn{padding:14px 28px;border-radius:14px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;}
    .prev-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .next-btn{flex:1;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:${FONT.body};transition:all 0.3s;letter-spacing:0.04em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,0.15);}
    .next-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.2);}

    .plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:28px;}
    .plan-day{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .plan-day::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--dc)08,transparent 55%);pointer-events:none;}
    .plan-day:hover{transform:translateY(-4px);border-color:var(--dc);box-shadow:0 12px 30px rgba(0,0,0,${dark?"0.3":"0.05"});}
    .day-name{font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;}
    .day-title{font-family:${FONT.display};font-size:17px;font-weight:800;margin-bottom:14px;}
    .ex-list{list-style:none;display:flex;flex-direction:column;gap:7px;}
    .ex-item{display:flex;align-items:center;gap:8px;font-size:13px;color:${T.textSub};}
    .ex-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

    .plan-summary{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px 28px;backdrop-filter:blur(28px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:20px;}
    .sum-item{text-align:center;}
    .sum-val{font-family:${FONT.display};font-size:26px;font-weight:800;color:${T.accent};}
    .sum-lbl{font-size:11px;color:${T.textMuted};font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    .restart-btn{padding:12px 24px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;}
    .restart-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}

    .mini-loader { font-size: 12px; color: ${T.textSub}; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .spinner { border: 2px solid ${T.glassBorder}; border-top: 2px solid ${T.accent}; border-radius: 50%; width: 12px; height: 12px; animation: spin 0.8s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media(max-width:700px){.content{padding:24px 16px;}.header{padding:0 16px;}.option-grid{grid-template-columns:repeat(2,1fr);}.days-grid{flex-wrap:wrap;}.plan-grid{grid-template-columns:1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.workout || BG_IMAGES.diet} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* HEADER BAR WITH UNIFIED BACK BUTTON */}
        <div className="header">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="content">
          <div className="title-row" style={{animation:"fadeUp 0.6s ease both"}}>
            <div className="page-title">Workout <span>Planner</span></div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {loading && (
                <div className="mini-loader">
                  <div className="spinner" /> Syncing...
                </div>
              )}
              <div className="mode-toggle">
                <button className={`mode-btn ${generationMode === "rule-based" ? "active" : ""}`} onClick={() => handleModeToggle("rule-based")}>Standard</button>
                <button className={`mode-btn ${generationMode === "ai-generated" ? "active" : ""}`} onClick={() => handleModeToggle("ai-generated")}>Smart AI</button>
              </div>
            </div>
          </div>
          
          <div className="page-sub" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>Build a personalised workout plan tailored to your goals and schedule</div>

          <div className="steps" style={{animation:"fadeUp 0.6s ease 0.1s both"}}>
            {["Your Goal", "Schedule", "Your Plan"].map((s, i) => (
              <React.Fragment key={i}>
                <div className="step-item">
                  <div className={`step-circle ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`}>
                    {step > i+1 ? "✓" : i+1}
                  </div>
                  <span className={`step-label ${step === i+1 ? "active" : ""}`}>{s}</span>
                </div>
                {i < 2 && <div className={`step-line ${step > i+1 ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div style={{animation:"fadeUp 0.5s ease both"}}>
              <div className="section-title">What's your primary goal?</div>
              <div className="option-grid">
                {GOALS.map(g => (
                  <button key={g.id} className={`option-btn ${goal === g.id ? "active" : ""}`}
                    onClick={() => setGoal(g.id)}
                    style={goal === g.id ? {borderColor: g.color, background: `${g.color}12`} : {}}>
                    <span className="opt-icon">{g.icon}</span>
                    <span className="opt-label" style={goal === g.id ? {color: g.color} : {}}>{g.label}</span>
                  </button>
                ))}
              </div>

              <div className="section-title">Experience Level</div>
              <div className="option-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                {LEVELS.map(l => (
                  <button key={l.id} className={`option-btn ${level === l.id ? "active" : ""}`}
                    onClick={() => setLevel(l.id)}
                    style={level === l.id ? {borderColor: T.accent, background: `${T.accent}12`} : {}}>
                    <span className="opt-icon">{l.icon}</span>
                    <span className="opt-label" style={level === l.id ? {color: T.accent} : {}}>{l.label}</span>
                    <span className="opt-sub">{l.sub}</span>
                  </button>
                ))}
              </div>

              <div className="section-title">Equipment Available</div>
              <div className="option-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
                {EQUIPMENT.map(e => (
                  <button key={e.id} className={`option-btn ${equipment === e.id ? "active" : ""}`}
                    onClick={() => setEquipment(e.id)}
                    style={equipment === e.id ? {borderColor: T.green, background: `${T.green}10`} : {}}>
                    <span className="opt-icon">{e.icon}</span>
                    <span className="opt-label" style={equipment === e.id ? {color: T.green} : {}}>{e.label}</span>
                  </button>
                ))}
              </div>

              <div className="nav-btns">
                <button className="next-btn" onClick={() => setStep(2)}>Next: Choose Schedule →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{animation:"fadeUp 0.5s ease both"}}>
              <div className="section-title">How many days per week?</div>
              <div className="days-grid">
                {DAYS_OPTIONS.map(d => (
                  <button key={d} className={`day-btn ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>
                    <div className="day-num" style={days === d ? {color: T.accent} : {}}>{d}</div>
                    <div className="day-lbl">days/week</div>
                  </button>
                ))}
              </div>

              <div style={{background: T.accent+"08", border: `1px solid ${T.accent}20`, borderRadius: 16, padding: "18px 22px", marginBottom: 28}}>
                <div style={{fontSize: 13, color: T.textSub, lineHeight: 1.65}}>
                  <strong style={{color: T.text, display:"block", marginBottom:8}}>📋 Your Plan Preview</strong>
                  Goal: <strong style={{color: T.accent}}>{GOALS.find(g=>g.id===goal)?.label}</strong> &nbsp;·&nbsp;
                  Level: <strong style={{color: T.purple}}>{LEVELS.find(l=>l.id===level)?.label}</strong> &nbsp;·&nbsp;
                  Equipment: <strong style={{color: T.green}}>{EQUIPMENT.find(e=>e.id===equipment)?.label}</strong> &nbsp;·&nbsp;
                  Days: <strong style={{color: T.orange}}>{days}x/week</strong>
                </div>
              </div>

              <div className="nav-btns">
                <button className="prev-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="next-btn" onClick={() => generatePlan()}>Generate My Plan ⚡</button>
              </div>
            </div>
          )}

          {step === 3 && plan && (
            <div style={{animation:"fadeUp 0.5s ease both"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:"12px"}}>
                <div className="section-title" style={{marginBottom:0}}>Your Personalised Plan</div>
                <button className="restart-btn" onClick={() => { setStep(1); setPlan(null); }}>↺ Start Over</button>
              </div>

              <div className="plan-summary">
                {[
                  {val: plan.length, lbl: "Days/Week"},
                  {val: `${plan.length * 45}min`, lbl: "Weekly Volume"},
                  {val: GOALS.find(g=>g.id===goal)?.label || "Custom", lbl: "Goal"},
                  {val: LEVELS.find(l=>l.id===level)?.label || "Custom", lbl: "Level"},
                ].map((s, i) => (
                  <div key={i} className="sum-item">
                    <div className="sum-val">{s.val}</div>
                    <div className="sum-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="plan-grid">
                {plan.map((d, i) => (
                  <div key={i} className="plan-day" style={{"--dc": d.color || T.accent}}>
                    <div className="day-name">{d.day}</div>
                    <div className="day-title" style={{color: d.color || T.accent}}>{d.name}</div>
                    <ul className="ex-list">
                      {d.exercises.map((ex, j) => (
                        <li key={j} className="ex-item">
                          <div className="ex-dot" style={{background: d.color || T.accent}} />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{display:"flex", gap:12}}>
                <button className="next-btn" onClick={() => navigate("/workout-logger")} style={{flex:1}}>
                  Log a Workout →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}