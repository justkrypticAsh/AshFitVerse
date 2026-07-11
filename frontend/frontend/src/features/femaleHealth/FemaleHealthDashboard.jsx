// src/features/femaleHealth/FemaleHealthDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT, BG_IMAGES } from "../../theme";

const CYCLE_PHASES = [
  {
    name: "Menstrual",
    days: "Day 1–5",
    color: "#f472b6",
    icon: "🔴",
    workout: "Gentle yoga, walking, rest",
    diet: "Iron-rich foods, warm soups, anti-inflammatory",
    mood: "Low energy — be kind to yourself",
    tip: "Prioritise rest and iron intake. Avoid intense training.",
  },
  {
    name: "Follicular",
    days: "Day 6–13",
    color: "#4f8ef7",
    icon: "🌱",
    workout: "High-intensity training, strength work, new PRs",
    diet: "High protein, complex carbs, lean meats",
    mood: "Rising energy — best time to train hard",
    tip: "Oestrogen peaks here. Your strength and endurance are highest.",
  },
  {
    name: "Ovulation",
    days: "Day 14–16",
    color: "#fbbf24",
    icon: "✨",
    workout: "Peak performance — HIIT, heavy lifts",
    diet: "Antioxidants, fibre, hydration",
    mood: "Peak energy, confidence, social",
    tip: "Testosterone spikes briefly. Ideal for personal records.",
  },
  {
    name: "Luteal",
    days: "Day 17–28",
    color: "#a78bfa",
    icon: "🌙",
    workout: "Moderate training, pilates, swimming",
    diet: "Magnesium-rich, complex carbs, reduce caffeine",
    mood: "PMS possible — prioritise sleep and self-care",
    tip: "Progesterone rises. Reduce intensity in the last week.",
  },
];

const QUICK_LINKS = [
  { label: "Cycle Tracker",        icon: "📅", path: "/cycle-tracker",       color: "#f472b6" },
  { label: "PCOS / PCOD Guide",    icon: "💊", path: "/pcos-guide",          color: "#a78bfa" },
  { label: "Hormone Nutrition",    icon: "🥗", path: "/hormone-nutrition",   color: "#34d399" },
  { label: "Women's Shop",         icon: "🛍️", path: "/shop?cat=female",     color: "#fbbf24" },
  { label: "Mental Wellness",      icon: "🧘", path: "/female-mental",       color: "#4f8ef7" },
  { label: "Contraception Guide",  icon: "❤️", path: "/contraception",       color: "#fb923c" },
];

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue",
  "Mood swings", "Breast tenderness", "Acne", "Back pain",
  "Cravings", "Spotting", "Heavy flow", "Light flow",
];

export default function FemaleHealthDashboard() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isFemale,loading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [moodRating, setMoodRating] = useState(null);
  const [energyRating, setEnergyRating] = useState(null);

  useEffect(() => { setMounted(true);},[]);useEffect(() => {
    if (!loading && !isFemale) navigate("/dashboard");
  }, [loading, isFemale]); 

  // Calculate current cycle day and phase
  const getCycleInfo = () => {
    if (!user.lastPeriod) return { day: null, phase: CYCLE_PHASES[1], daysUntilPeriod: null };
    const last = new Date(user.lastPeriod);
    const today = new Date();
    const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    const cycleLen = parseInt(user.cycleLength) || 28;
    const day = (daysSince % cycleLen) + 1;
    const daysUntilPeriod = cycleLen - day + 1;

    let phase;
    if (day <= 5)          phase = CYCLE_PHASES[0];
    else if (day <= 13)    phase = CYCLE_PHASES[1];
    else if (day <= 16)    phase = CYCLE_PHASES[2];
    else                   phase = CYCLE_PHASES[3];

    return { day, phase, daysUntilPeriod, cycleLen };
  };

  const { day, phase, daysUntilPeriod, cycleLen } = getCycleInfo();
  const toggleSymptom = (s) =>
    setTodaySymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const css = generateCSS(T, dark) + `
    .fh-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .fh-bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
    .fh-bg img{width:100%;height:100%;object-fit:cover;
      opacity:${dark?"0.04":"0.055"};filter:${dark?"grayscale(60%) blur(2px)":"grayscale(30%) blur(1px)"};}

    /* Header */
    .fh-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.pink};border-color:${T.pink}40;}
    .fh-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .fh-logo span{color:${T.pink};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .fh-content{max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}

    /* Hero */
    .fh-hero{margin-bottom:28px;animation:fadeUp 0.6s ease both;}
    .fh-eyebrow{font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
      color:${T.pink};margin-bottom:10px;}
    .fh-title{font-family:${FONT.display};font-size:34px;font-weight:800;
      letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .fh-sub{font-size:14px;color:${T.textSub};line-height:1.6;}

    /* Quick links */
    .ql-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:28px;}
    .ql-btn{padding:18px 10px 15px;border-radius:18px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(24px);cursor:pointer;
      font-family:${FONT.body};font-size:12px;font-weight:700;
      color:${T.textSub};transition:all 0.25s cubic-bezier(0.4,0,0.2,1);text-align:center;}
    .ql-btn:hover{transform:translateY(-4px);color:var(--qc);
      border-color:var(--qc);background:linear-gradient(135deg,var(--qc)10,transparent);}
    .ql-ico{font-size:24px;display:block;margin-bottom:8px;}

    /* Main grid */
    .fh-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;margin-bottom:24px;}
    .fh-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}

    /* Glass card */
    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Cycle ring */
    .cycle-wrap{display:flex;flex-direction:column;align-items:center;padding:8px 0 16px;}
    .cycle-ring{position:relative;width:180px;height:180px;margin-bottom:16px;}
    .cycle-svg{transform:rotate(-90deg);}
    .cycle-center{position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center;}
    .cycle-day-num{font-family:${FONT.display};font-size:48px;font-weight:800;line-height:1;}
    .cycle-day-lbl{font-size:11px;color:${T.textMuted};font-weight:700;
      letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;}
    .cycle-phase-name{font-family:${FONT.display};font-size:18px;font-weight:800;margin-bottom:4px;}
    .cycle-phase-days{font-size:12px;color:${T.textMuted};}

    /* Phase tabs */
    .phase-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
    .phase-tab{padding:7px 14px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .phase-tab.active{color:#fff;border-color:transparent;}

    /* Phase detail */
    .phase-detail-row{display:flex;gap:10px;align-items:flex-start;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13px;}
    .phase-detail-row:last-child{border-bottom:none;}
    .pd-ico{font-size:18px;flex-shrink:0;margin-top:1px;}
    .pd-key{color:${T.textMuted};font-weight:700;font-size:11px;
      letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;}
    .pd-val{color:${T.text};line-height:1.5;}

    /* Countdown pills */
    .countdown-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;}
    .countdown-pill{padding:10px 16px;border-radius:13px;
      background:${T.glass};border:1px solid ${T.glassBorder};text-align:center;}
    .cp-val{font-family:${FONT.display};font-size:22px;font-weight:800;}
    .cp-lbl{font-size:10px;color:${T.textMuted};font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;margin-top:3px;}

    /* Today log */
    .mood-row{display:flex;gap:10px;margin-bottom:18px;}
    .mood-btn{flex:1;padding:14px 8px;border-radius:14px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.22s;text-align:center;
      font-family:${FONT.body};}
    .mood-btn:hover{transform:translateY(-2px);}
    .mood-btn.active{border-color:${T.pink};background:${T.pinkSoft};}
    .mood-ico{font-size:24px;display:block;margin-bottom:6px;}
    .mood-lbl{font-size:11px;font-weight:700;color:${T.textSub};}

    /* Symptoms */
    .sym-grid{display:flex;gap:8px;flex-wrap:wrap;}
    .sym-chip{padding:8px 14px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.2s;font-family:${FONT.body};}
    .sym-chip:hover{border-color:${T.pink}40;color:${T.pink};}
    .sym-chip.active{background:${T.pinkSoft};border-color:${T.pink};color:${T.pink};}

    /* Save btn */
    .save-btn{width:100%;height:48px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      color:#fff;font-size:13px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 6px 20px ${T.pinkGlow};margin-top:18px;}
    .save-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${T.pinkGlow};}

    /* Health metrics */
    .metric-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:20px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .metric-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .metric-glow{position:absolute;width:120px;height:120px;border-radius:50%;
      top:-40px;right:-40px;filter:blur(50px);opacity:0.45;pointer-events:none;}
    .metric-lbl{font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:8px;}
    .metric-val{font-family:${FONT.display};font-size:32px;font-weight:800;line-height:1;}
    .metric-sub{font-size:12px;color:${T.textSub};margin-top:6px;}

    /* Condition badge */
    .cond-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
      border-radius:99px;font-size:12px;font-weight:700;border:1px solid;margin-bottom:16px;}

    /* Tips */
    .tip-item{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.55;}
    .tip-item:last-child{border-bottom:none;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:1100px){.fh-grid{grid-template-columns:1fr;}.fh-grid-3{grid-template-columns:1fr 1fr;}.ql-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:700px){.fh-content{padding:20px 16px;}.ql-grid{grid-template-columns:repeat(2,1fr);}.fh-grid-3{grid-template-columns:1fr;}.fh-header{padding:18px 20px;}}
  `;

  const [activePhase, setActivePhase] = useState(phase ? CYCLE_PHASES.indexOf(phase) : 1);
  const currentPhase = CYCLE_PHASES[activePhase];

  return (
    <>
      <style>{css}</style>
      <div className="fh-root">
        <div className="fh-bg">
          <img src={BG_IMAGES.community} alt="" loading="lazy" />
        </div>
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 65%)"}} />
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 65%)"}} />
        <div className="orb orb-3" style={{background:"radial-gradient(circle,rgba(244,114,182,0.04) 0%,transparent 65%)"}} />

        {/* Header */}
        <div className="fh-header">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <div className="fh-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="fh-content">
          {/* Hero */}
          <div className="fh-hero">
            <div className="fh-eyebrow">♀ Women's Health</div>
            <div className="fh-title">
              Hey {user.name?.split(" ")[0] || "Beautiful"} 💜
            </div>
            <div className="fh-sub">
              Your personalised women's health hub — cycle tracking, hormone-based fitness, and complete wellness support.
              {user.femaleCondition && user.femaleCondition !== "none" && (
                <span> Tailored for <strong style={{color:T.purple}}>{user.femaleCondition.toUpperCase()}</strong> management.</span>
              )}
            </div>
          </div>

          {/* Condition badge */}
          {user.femaleCondition && user.femaleCondition !== "none" && (
            <div className="cond-badge" style={{color:T.purple,borderColor:`${T.purple}35`,background:T.purpleSoft}}>
              💊 {user.femaleCondition.toUpperCase()} Profile Active — personalised recommendations enabled
            </div>
          )}

          {/* Quick links */}
          <div className="ql-grid" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>
            {QUICK_LINKS.map((q,i) => (
              <button key={i} className="ql-btn" style={{"--qc":q.color}}
                onClick={() => navigate(q.path)}>
                <span className="ql-ico">{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>

          {/* Health metrics */}
          <div className="fh-grid-3" style={{animation:"fadeUp 0.6s ease 0.1s both"}}>
            {[
              {lbl:"Cycle Day",val:day?`Day ${day}`:"—",sub:`of ${cycleLen||28} day cycle`,color:T.pink,glow:T.pinkGlow},
              {lbl:"Current Phase",val:phase?.name||"—",sub:phase?.days||"Set last period date",color:T.purple,glow:T.purpleGlow},
              {lbl:"Next Period",val:daysUntilPeriod?`${daysUntilPeriod} days`:"—",sub:"estimated",color:T.orange,glow:T.orangeGlow},
            ].map((m,i) => (
              <div key={i} className="metric-card">
                <div className="metric-glow" style={{background:m.glow}} />
                <div className="metric-lbl">{m.lbl}</div>
                <div className="metric-val" style={{color:m.color}}>{m.val}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Main grid: cycle + today log */}
          <div className="fh-grid" style={{animation:"fadeUp 0.6s ease 0.15s both"}}>

            {/* Cycle phase guide */}
            <div className="g-card">
              <div className="g-title">Cycle Phase Guide</div>

              <div className="phase-tabs">
                {CYCLE_PHASES.map((p,i) => (
                  <button key={i} className={`phase-tab ${activePhase===i?"active":""}`}
                    style={activePhase===i?{background:p.color,borderColor:p.color}:{}}
                    onClick={() => setActivePhase(i)}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>

              {/* Cycle ring */}
              <div className="cycle-wrap">
                <div className="cycle-ring">
                  <svg className="cycle-svg" width="180" height="180" viewBox="0 0 180 180">
                    <circle cx="90" cy="90" r="75" fill="none"
                      stroke={dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.07)"} strokeWidth="10" />
                    <circle cx="90" cy="90" r="75" fill="none"
                      stroke={currentPhase.color} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*75}`}
                      strokeDashoffset={`${2*Math.PI*75*(1-(activePhase+1)/4)}`}
                      style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",filter:`drop-shadow(0 0 8px ${currentPhase.color}60)`}}
                    />
                  </svg>
                  <div className="cycle-center">
                    <div className="cycle-phase-name" style={{color:currentPhase.color,fontSize:15}}>{currentPhase.name}</div>
                    <div className="cycle-phase-days" style={{color:T.textMuted}}>{currentPhase.days}</div>
                  </div>
                </div>
              </div>

              {[
                {ico:"🏋️",key:"Workout",val:currentPhase.workout},
                {ico:"🥗",key:"Diet",val:currentPhase.diet},
                {ico:"💭",key:"Mood",val:currentPhase.mood},
                {ico:"💡",key:"Tip",val:currentPhase.tip},
              ].map((r,i) => (
                <div key={i} className="phase-detail-row">
                  <span className="pd-ico">{r.ico}</span>
                  <div>
                    <div className="pd-key">{r.key}</div>
                    <div className="pd-val">{r.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's log */}
            <div className="g-card">
              <div className="g-title">Today's Health Log</div>

              <div style={{marginBottom:18}}>
                <div style={{fontSize:12,color:T.textMuted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Mood</div>
                <div className="mood-row">
                  {[{ico:"😊",lbl:"Great"},{ico:"😐",lbl:"Okay"},{ico:"😔",lbl:"Low"},{ico:"😤",lbl:"Irritable"}].map((m,i) => (
                    <button key={i} className={`mood-btn ${moodRating===i?"active":""}`}
                      onClick={() => setMoodRating(i)}>
                      <span className="mood-ico">{m.ico}</span>
                      <span className="mood-lbl">{m.lbl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:18}}>
                <div style={{fontSize:12,color:T.textMuted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Energy Level</div>
                <div style={{display:"flex",gap:8}}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setEnergyRating(n)}
                      style={{flex:1,height:40,borderRadius:12,border:`1.5px solid ${energyRating>=n?T.pink:T.glassBorder}`,
                        background:energyRating>=n?T.pinkSoft:T.glass,cursor:"pointer",
                        fontSize:14,color:energyRating>=n?T.pink:T.textMuted,fontWeight:800,
                        transition:"all 0.2s",fontFamily:FONT.body}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{fontSize:12,color:T.textMuted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Symptoms Today</div>
                <div className="sym-grid">
                  {SYMPTOMS.map(s => (
                    <button key={s} className={`sym-chip ${todaySymptoms.includes(s)?"active":""}`}
                      onClick={() => toggleSymptom(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {user.femaleCondition && user.femaleCondition !== "none" && (
                <div style={{marginTop:18,padding:"14px 16px",borderRadius:13,
                  background:T.purpleSoft,border:`1px solid ${T.purple}30`,
                  fontSize:12,color:T.textSub,lineHeight:1.6}}>
                  <strong style={{color:T.purple,display:"block",marginBottom:4}}>
                    💊 {user.femaleCondition.toUpperCase()} Tip Today
                  </strong>
                  {user.femaleCondition === "pcos" && "Keep insulin stable — eat protein with every meal and avoid refined carbs today."}
                  {user.femaleCondition === "pcod" && "Anti-inflammatory focus today — turmeric, berries, leafy greens. Avoid processed foods."}
                  {user.femaleCondition === "endo" && "Reduce prostaglandins — omega-3 rich foods like salmon and walnuts. Light movement only if painful."}
                  {user.femaleCondition === "thyroid" && "Take thyroid medication on an empty stomach. Avoid cruciferous vegetables raw today."}
                </div>
              )}

              <button className="save-btn">Save Today's Log ✓</button>
            </div>
          </div>

          {/* Countdown pills */}
          <div className="g-card" style={{marginBottom:24,animation:"fadeUp 0.6s ease 0.2s both"}}>
            <div className="g-title">Cycle Countdown</div>
            <div className="countdown-row">
              {[
                {val:day||"—",lbl:"Current Day",color:T.pink},
                {val:daysUntilPeriod||"—",lbl:"Days to Period",color:T.purple},
                {val:day&&day>=6&&day<=16?`~Day ${14}`:day&&day>16?"Past":"~Day 14",lbl:"Ovulation",color:T.orange},
                {val:cycleLen||28,lbl:"Cycle Length",color:T.accent},
                {val:user.femaleCondition!=="none"?user.femaleCondition?.toUpperCase()||"None":"None",lbl:"Condition",color:T.green},
              ].map((c,i) => (
                <div key={i} className="countdown-pill">
                  <div className="cp-val" style={{color:c.color}}>{c.val}</div>
                  <div className="cp-lbl">{c.lbl}</div>
                </div>
              ))}
              <button style={{padding:"10px 20px",borderRadius:13,border:`1px solid ${T.pink}35`,
                background:T.pinkSoft,color:T.pink,fontSize:13,fontWeight:700,cursor:"pointer",
                fontFamily:FONT.body,transition:"all 0.25s"}}
                onClick={() => navigate("/cycle-tracker")}>
                Open Tracker →
              </button>
            </div>
          </div>

          {/* Wellness tips */}
          <div className="fh-grid" style={{animation:"fadeUp 0.6s ease 0.25s both"}}>
            <div className="g-card">
              <div className="g-title">Daily Wellness Tips</div>
              {[
                {ico:"💧",txt:`Drink ${phase?.name==="Menstrual"?"3L+":"2.5L"} of water today to support hormonal balance`},
                {ico:"🥩",txt:"Prioritise iron-rich foods: lean red meat, lentils, spinach, tofu"},
                {ico:"😴",txt:"Aim for 7–9 hours sleep — cortisol directly affects oestrogen levels"},
                {ico:"🧘",txt:phase?.workout || "Move your body in a way that feels good today"},
                {ico:"☀️",txt:"Get 15 min of morning sunlight to regulate circadian rhythm and mood"},
              ].map((t,i,a) => (
                <div key={i} className="tip-item" style={{borderColor:i<a.length-1?T.glassBorder:"transparent"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{t.ico}</span>
                  <span>{t.txt}</span>
                </div>
              ))}
            </div>

            <div className="g-card">
              <div className="g-title">Recommended For You</div>
              {[
                {ico:"📅",lbl:"Log your cycle",sub:"Keep your tracker updated for better predictions",path:"/cycle-tracker",color:T.pink},
                {ico:"🥗",lbl:"Hormone nutrition guide",sub:"Phase-based diet plan for hormonal harmony",path:"/hormone-nutrition",color:T.green},
                {ico:"💊",lbl:user.femaleCondition!=="none"?`${(user.femaleCondition||"").toUpperCase()} resources`:"Women's health guides",sub:"Expert-backed information and management tips",path:"/pcos-guide",color:T.purple},
                {ico:"🛍️",lbl:"Women's wellness shop",sub:"Supplements, care products, essentials",path:"/shop?cat=female",color:T.orange},
              ].map((r,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",
                  borderBottom:i<3?`1px solid ${T.glassBorder}`:"none",cursor:"pointer"}}
                  onClick={() => navigate(r.path)}>
                  <div style={{width:40,height:40,borderRadius:12,
                    background:`${r.color}18`,border:`1px solid ${r.color}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>
                    {r.ico}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{r.lbl}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{r.sub}</div>
                  </div>
                  <span style={{color:T.textMuted,fontSize:14}}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}