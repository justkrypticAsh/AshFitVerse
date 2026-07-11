// src/features/maleHealth/MentalHealth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const MOODS = [
  { id: "great",    icon: "😄", label: "Great",     color: "#34d399", score: 5 },
  { id: "good",     icon: "😊", label: "Good",      color: "#4f8ef7", score: 4 },
  { id: "okay",     icon: "😐", label: "Okay",      color: "#fbbf24", score: 3 },
  { id: "low",      icon: "😔", label: "Low",       color: "#fb923c", score: 2 },
  { id: "terrible", icon: "😞", label: "Terrible",  color: "#f87171", score: 1 },
];

const STRESS_TRIGGERS = [
  "Work pressure", "Relationship issues", "Financial stress",
  "Health anxiety", "Social isolation", "Poor sleep",
  "Performance anxiety", "Family conflict", "Uncertainty",
  "Overtraining", "Diet / body image", "Loneliness",
];

const TECHNIQUES = [
  {
    name: "Box Breathing",
    icon: "📦",
    color: "#4f8ef7",
    duration: "5 minutes",
    desc: "Proven technique used by Navy SEALs to control stress and anxiety instantly.",
    steps: [
      "Inhale slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 4 counts",
      "Hold empty for 4 counts",
      "Repeat 4–6 times",
    ],
    benefit: "Activates parasympathetic nervous system. Reduces cortisol within minutes.",
  },
  {
    name: "Progressive Muscle Relaxation",
    icon: "💪",
    color: "#a78bfa",
    duration: "15 minutes",
    desc: "Tense and release each muscle group to release stored physical stress.",
    steps: [
      "Lie down or sit comfortably",
      "Start with your feet — tense for 5 seconds, release",
      "Move up: calves, thighs, abdomen, chest, arms, shoulders",
      "Tense each group fully then completely let go",
      "End with face muscles — scrunch then release",
    ],
    benefit: "Reduces physical tension from chronic stress. Dramatically improves sleep quality.",
  },
  {
    name: "5-4-3-2-1 Grounding",
    icon: "🌍",
    color: "#34d399",
    duration: "3 minutes",
    desc: "Instantly stops anxiety spirals by anchoring you to the present moment.",
    steps: [
      "Name 5 things you can SEE right now",
      "Name 4 things you can TOUCH — feel their texture",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
    ],
    benefit: "Interrupts anxious thought loops. Works within 60 seconds for acute anxiety.",
  },
  {
    name: "Cold Water Exposure",
    icon: "❄️",
    color: "#38bdf8",
    duration: "2–3 minutes",
    desc: "End your shower with 2 minutes of cold water. Scientifically proven mood booster.",
    steps: [
      "Finish your regular warm shower",
      "Turn to cold — start with 30 seconds",
      "Build up to 2–3 minutes over weeks",
      "Focus on breathing through the initial shock",
      "Ideally do it in the morning",
    ],
    benefit: "Boosts norepinephrine by 300%, increases mood, energy and mental resilience.",
  },
];

const RESOURCES = [
  {
    title: "Understanding Depression in Men",
    type: "Guide",
    icon: "📖",
    color: "#4f8ef7",
    desc: "Men experience depression differently — often as anger, irritability or withdrawal rather than sadness.",
    points: [
      "Men are 3x more likely to die by suicide than women",
      "Only 1 in 4 men with depression seek help",
      "Common signs: irritability, aggression, risk-taking, substance use",
      "Physical symptoms often mask emotional ones",
    ],
  },
  {
    title: "Testosterone & Mental Health",
    type: "Science",
    icon: "⚗️",
    color: "#a78bfa",
    desc: "Low testosterone is directly linked to depression, anxiety and poor motivation.",
    points: [
      "Low T → lower dopamine and serotonin production",
      "Symptoms overlap completely with clinical depression",
      "Diet, sleep and exercise can raise T by 20–30%",
      "Get tested if symptoms persist despite lifestyle changes",
    ],
  },
  {
    title: "When to Seek Professional Help",
    type: "Important",
    icon: "⚕️",
    color: "#f87171",
    desc: "There is no weakness in seeking help. It is the strongest thing you can do.",
    points: [
      "Symptoms lasting more than 2 weeks",
      "Thoughts of self-harm or suicide — call iCall: 9152987821",
      "Substance use to cope",
      "Inability to function at work or in relationships",
    ],
  },
];

// Sample mood data for chart
const SAMPLE_MOOD_DATA = [
  { day: "Mon", score: 3 }, { day: "Tue", score: 4 },
  { day: "Wed", score: 2 }, { day: "Thu", score: 4 },
  { day: "Fri", score: 5 }, { day: "Sat", score: 4 },
  { day: "Sun", score: 3 },
];

export default function MentalHealth() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isMale,loading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [stressLevel, setStressLevel] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ashfitverse_mood_logs") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (!loading && !isMale) navigate("/dashboard");
}, [loading, isMale]);

  const today = new Date().toISOString().split("T")[0];

  const toggleTrigger = (t) =>
    setTriggers(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const saveLog = () => {
    const log = { mood: todayMood, stress: stressLevel, triggers, notes, date: today };
    const updated = { ...logs, [today]: log };
    setLogs(updated);
    localStorage.setItem("ashfitverse_mood_logs", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = SAMPLE_MOOD_DATA.map(d => ({
    ...d,
    mood: logs[d.day]?.mood
      ? MOODS.find(m => m.id === logs[d.day].mood)?.score || d.score
      : d.score,
  }));

  const css = generateCSS(T, dark) + `
    .mh-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .mh-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.accent};border-color:${T.accent}40;}
    .mh-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .mh-logo span{color:${T.accent};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .mh-content{max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .mh-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .mh-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    .mh-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .mh-layout-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Mood selector */
    .mood-grid{display:flex;gap:10px;justify-content:space-between;}
    .mood-btn{flex:1;padding:16px 8px;border-radius:16px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
      text-align:center;font-family:${FONT.body};}
    .mood-btn:hover{transform:translateY(-3px);}
    .mood-btn.active{transform:translateY(-3px);}
    .mood-ico{font-size:28px;display:block;margin-bottom:8px;}
    .mood-lbl{font-size:12px;font-weight:700;color:${T.textSub};}

    /* Stress slider */
    .stress-row{display:flex;gap:8px;margin-bottom:8px;}
    .stress-btn{flex:1;height:44px;border-radius:12px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.22s;font-family:${FONT.body};
      font-size:13px;font-weight:800;color:${T.textSub};}
    .stress-btn.active{color:#000;}

    /* Triggers */
    .trigger-grid{display:flex;gap:8px;flex-wrap:wrap;}
    .trigger-chip{padding:8px 14px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.2s;font-family:${FONT.body};}
    .trigger-chip:hover{border-color:${T.accent}40;color:${T.accent};}
    .trigger-chip.active{background:${T.accentSoft};border-color:${T.accent};color:${T.accent};}

    .notes-input{width:100%;height:80px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:12px 16px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;resize:none;transition:all 0.25s;}
    .notes-input:focus{border-color:${T.accent};}
    .notes-input::placeholder{color:${T.textMuted};}

    .save-btn{width:100%;height:50px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 6px 20px ${T.accentGlow};margin-top:16px;}
    .save-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${T.accentGlow};}

    /* Techniques */
    .tech-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:24px;}
    .tech-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .tech-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--tc)06,transparent 55%);pointer-events:none;}
    .tech-card:hover{transform:translateY(-3px);border-color:var(--tc);}
    .tech-ico{font-size:28px;margin-bottom:10px;}
    .tech-name{font-family:${FONT.display};font-size:16px;font-weight:800;margin-bottom:4px;}
    .tech-dur{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:10px;}
    .tech-desc{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:14px;}
    .tech-steps{list-style:none;display:flex;flex-direction:column;gap:7px;}
    .tech-step{display:flex;gap:10px;font-size:12px;color:${T.textSub};line-height:1.45;}
    .step-num{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;color:#fff;}
    .tech-benefit{padding:10px 14px;border-radius:11px;font-size:12px;color:${T.textSub};
      line-height:1.55;margin-top:12px;border-left:3px solid;}

    /* Resources */
    .res-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .res-card:hover{transform:translateY(-2px);border-color:${T.glassBorderHover};}
    .res-type{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;}
    .res-title{font-family:${FONT.display};font-size:17px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .res-desc{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:14px;}
    .res-point{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.45;}
    .res-point:last-child{border-bottom:none;}

    /* Crisis box */
    .crisis-box{padding:20px 24px;border-radius:18px;background:rgba(248,113,113,0.08);
      border:1px solid rgba(248,113,113,0.22);margin-bottom:24px;}
    .crisis-title{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.red};margin-bottom:8px;}
    .crisis-line{font-size:14px;color:${T.textSub};line-height:1.65;}
    .crisis-num{font-weight:800;color:${T.red};font-size:16px;}

    /* Chart tooltip */
    .ctt{background:${dark?"rgba(7,8,15,0.96)":"rgba(255,255,255,0.97)"};border:1px solid ${T.glassBorder};
      border-radius:12px;padding:10px 14px;font-size:12px;color:${T.text};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.mh-layout,.mh-layout-3,.tech-grid{grid-template-columns:1fr;}}
    @media(max-width:600px){.mh-content{padding:20px 16px;}.mh-header{padding:18px 20px;}.mood-grid{gap:6px;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const m = MOODS.find(m => m.score === Math.round(payload[0]?.value));
    return (
      <div className="ctt">
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ color: m?.color || T.accent }}>{m?.icon} {m?.label || payload[0]?.value}</div>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="mh-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)" }} />

        <div className="mh-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/male-health")}>← Men's Health</button>
            <div className="mh-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="mh-content">
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="mh-title">🧠 Mental Health</div>
            <div className="mh-sub">
              Track your mood, manage stress and build mental resilience. Mental strength is just as important as physical strength.
              You're not alone — millions of men struggle silently. This is your space.
            </div>
          </div>

          {/* Crisis line */}
          <div className="crisis-box" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            <div className="crisis-title">🆘 Need immediate help?</div>
            <div className="crisis-line">
              iCall (India): <span className="crisis-num">9152987821</span> &nbsp;·&nbsp;
              Vandrevala Foundation: <span className="crisis-num">1860-2662-345</span> &nbsp;·&nbsp;
              Available 24/7 · Confidential · Free
            </div>
          </div>

          <div className="mh-layout" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
            {/* Today's log */}
            <div>
              <div className="g-card">
                <div className="g-title">How are you feeling today?</div>
                <div className="mood-grid">
                  {MOODS.map(m => (
                    <button key={m.id} className={`mood-btn ${todayMood === m.id ? "active" : ""}`}
                      style={todayMood === m.id ? { borderColor: m.color, background: `${m.color}14`, boxShadow: `0 0 16px ${m.color}30` } : {}}
                      onClick={() => setTodayMood(m.id)}>
                      <span className="mood-ico">{m.icon}</span>
                      <span className="mood-lbl" style={todayMood === m.id ? { color: m.color } : {}}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="g-card">
                <div className="g-title">Stress Level (1–10)</div>
                <div className="stress-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                    const color = n <= 3 ? "#34d399" : n <= 6 ? "#fbbf24" : n <= 8 ? "#fb923c" : "#f87171";
                    return (
                      <button key={n} className={`stress-btn ${stressLevel === n ? "active" : ""}`}
                        style={stressLevel === n ? { background: color, borderColor: color, color: "#000" } : {}}
                        onClick={() => setStressLevel(n)}>{n}</button>
                    );
                  })}
                </div>
                {stressLevel && (
                  <div style={{ fontSize: 12, color: T.textSub, marginTop: 8 }}>
                    {stressLevel <= 3 ? "🟢 Low stress — great day!" : stressLevel <= 6 ? "🟡 Moderate — use a technique below" : "🔴 High stress — prioritise recovery today"}
                  </div>
                )}
              </div>

              <div className="g-card">
                <div className="g-title">What's causing stress? (Select all)</div>
                <div className="trigger-grid">
                  {STRESS_TRIGGERS.map(t => (
                    <button key={t} className={`trigger-chip ${triggers.includes(t) ? "active" : ""}`}
                      onClick={() => toggleTrigger(t)}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="g-card">
                <div className="g-title">Journal — what's on your mind?</div>
                <textarea className="notes-input"
                  placeholder="Write freely. No one else will see this. Getting it out helps..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
                <button className="save-btn" onClick={saveLog}>
                  {saved ? "✓ Saved!" : "Save Today's Check-In"}
                </button>
              </div>
            </div>

            {/* Right: chart + tips */}
            <div>
              <div className="g-card">
                <div className="g-title">Mood This Week</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.accent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Area type="monotone" dataKey="score" stroke={T.accent} strokeWidth={2.5}
                      fill="url(#mg)" dot={{ fill: T.accent, r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="g-card">
                <div className="g-title">Daily Mental Health Habits</div>
                {[
                  { ico: "☀️", txt: "Morning sunlight — 10 min helps regulate serotonin and cortisol" },
                  { ico: "📵", txt: "No phone first 30 min after waking — protect your mental state" },
                  { ico: "🏋️", txt: "Exercise — the most powerful antidepressant with zero side effects" },
                  { ico: "😴", txt: "7–9 hours sleep — sleep deprivation mimics clinical depression" },
                  { ico: "🤝", txt: "Connect with someone today — isolation worsens all mental health" },
                  { ico: "🚫", txt: "Limit alcohol — it's a depressant despite feeling good initially" },
                ].map((h, i, a) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0",
                    borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none",
                    fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{h.ico}</span>
                    <span>{h.txt}</span>
                  </div>
                ))}
              </div>

              <div className="g-card">
                <div className="g-title">Quick Stats</div>
                {[
                  { k: "Logs this month", v: Object.keys(logs).length, c: T.accent },
                  { k: "Today's mood", v: todayMood ? MOODS.find(m => m.id === todayMood)?.label : "Not logged", c: todayMood ? MOODS.find(m => m.id === todayMood)?.color : T.textSub },
                  { k: "Stress level", v: stressLevel ? `${stressLevel}/10` : "Not logged", c: stressLevel > 7 ? T.red : stressLevel > 4 ? T.orange : T.green },
                ].map((r, i, a) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
                    borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
                    <span style={{ color: T.textSub }}>{r.k}</span>
                    <span style={{ fontWeight: 800, color: r.c, fontFamily: FONT.display }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Techniques */}
          <div style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 16, animation: "fadeUp 0.6s ease 0.15s both" }}>
            Stress Management Techniques
          </div>
          <div className="tech-grid" style={{ animation: "fadeUp 0.6s ease 0.18s both" }}>
            {TECHNIQUES.map((t, i) => (
              <div key={i} className="tech-card" style={{ "--tc": t.color }}>
                <div className="tech-ico">{t.icon}</div>
                <div className="tech-name" style={{ color: t.color }}>{t.name}</div>
                <div className="tech-dur">{t.duration}</div>
                <div className="tech-desc">{t.desc}</div>
                <ul className="tech-steps">
                  {t.steps.map((s, j) => (
                    <li key={j} className="tech-step">
                      <div className="step-num" style={{ background: t.color }}>{j + 1}</div>
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="tech-benefit" style={{ borderColor: t.color, background: `${t.color}08`, color: T.textSub }}>
                  💡 {t.benefit}
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 16, animation: "fadeUp 0.6s ease 0.2s both" }}>
            Understanding Men's Mental Health
          </div>
          <div className="mh-layout-3" style={{ animation: "fadeUp 0.6s ease 0.22s both" }}>
            {RESOURCES.map((r, i) => (
              <div key={i} className="res-card">
                <div className="res-type" style={{ color: r.color }}>{r.icon} {r.type}</div>
                <div className="res-title">{r.title}</div>
                <div className="res-desc">{r.desc}</div>
                {r.points.map((p, j) => (
                  <div key={j} className="res-point">
                    <span style={{ color: r.color, flexShrink: 0 }}>•</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}