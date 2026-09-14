// src/features/maleHealth/SleepTracker.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const TABS = ["Log Sleep", "Trends", "Recovery Tips", "Sleep Science"];

const SLEEP_QUALITY = [
  { id: "excellent", icon: "😴", label: "Excellent", color: "#34d399", score: 5 },
  { id: "good",      icon: "😊", label: "Good",      color: "#4f8ef7", score: 4 },
  { id: "okay",      icon: "😐", label: "Okay",      color: "#fbbf24", score: 3 },
  { id: "poor",      icon: "😔", label: "Poor",      color: "#fb923c", score: 2 },
  { id: "terrible",  icon: "😫", label: "Terrible",  color: "#f87171", score: 1 },
];

const FACTORS = [
  { id: "alcohol",    icon: "🍺", label: "Alcohol" },
  { id: "caffeine",   icon: "☕", label: "Late Caffeine" },
  { id: "screen",     icon: "📱", label: "Screen before bed" },
  { id: "stress",     icon: "😰", label: "High Stress" },
  { id: "exercise",   icon: "🏋️", label: "Exercised today" },
  { id: "sunlight",   icon: "☀️", label: "Morning sunlight" },
  { id: "magnesium",  icon: "💊", label: "Took Magnesium" },
  { id: "heavymeal",  icon: "🍕", label: "Late heavy meal" },
  { id: "coldshower", icon: "🚿", label: "Cold shower" },
  { id: "meditation", icon: "🧘", label: "Meditation" },
];

const SAMPLE_WEEK = [
  { day: "Mon", hours: 7.2, quality: 4, recovery: 72 },
  { day: "Tue", hours: 6.5, quality: 3, recovery: 61 },
  { day: "Wed", hours: 8.1, quality: 5, recovery: 88 },
  { day: "Thu", hours: 7.8, quality: 4, recovery: 80 },
  { day: "Fri", hours: 6.0, quality: 2, recovery: 54 },
  { day: "Sat", hours: 8.5, quality: 5, recovery: 91 },
  { day: "Sun", hours: 7.5, quality: 4, recovery: 76 },
];

const RECOVERY_TIPS = [
  {
    title: "Keep a Consistent Wake Time",
    icon: "⏰",
    color: "#fbbf24",
    priority: "Critical",
    detail: "Your wake time anchors your entire circadian rhythm. Varying it by more than 30 minutes — even on weekends — fragments your sleep architecture and reduces deep sleep by up to 30%.",
    actions: [
      "Set one wake time, 7 days a week — including weekends",
      "Your body will naturally adjust sleep onset within 1–2 weeks",
      "Even if you sleep late, wake at the same time — nap if needed",
      "Consistency is more important than total hours",
    ],
  },
  {
    title: "Optimise Your Sleep Environment",
    icon: "🌡️",
    color: "#38bdf8",
    priority: "High",
    detail: "Body temperature must drop 1–2°C to initiate and maintain sleep. Your bedroom temperature, light and sound have a massive impact on sleep quality.",
    actions: [
      "Keep bedroom at 18–19°C (65–67°F) — the optimal sleep temperature",
      "Blackout curtains — even 1% light exposure disrupts melatonin",
      "Silence or white noise — sudden sounds wake you during light sleep stages",
      "Reserve your bed for sleep and sex only — trains your brain",
    ],
  },
  {
    title: "The Light Protocol",
    icon: "☀️",
    color: "#fbbf24",
    priority: "High",
    detail: "Light is the most powerful signal to your circadian clock. Getting it right in the morning and wrong at night is the biggest controllable sleep lever.",
    actions: [
      "Get bright light (outdoors) within 30 min of waking — even on cloudy days",
      "No bright overhead lights after sunset — use lamps at low level",
      "Blue light blocking glasses from 9pm if using screens",
      "Ideally watch the sunset — evening light signals the brain to prepare for sleep",
    ],
  },
  {
    title: "Nutrition for Sleep",
    icon: "🥗",
    color: "#34d399",
    priority: "Moderate",
    detail: "What you eat — and when — significantly affects sleep quality.",
    actions: [
      "No caffeine after 1pm — half-life is 5–7 hours",
      "Last meal 2–3 hours before bed — digestion raises core temperature",
      "Magnesium glycinate 400mg before bed — improves deep sleep quality",
      "Tart cherry juice — natural melatonin precursor",
      "Kiwi fruit before bed — studies show improved sleep onset",
    ],
  },
  {
    title: "Supplements That Work",
    icon: "💊",
    color: "#a78bfa",
    priority: "Moderate",
    detail: "These have clinical evidence for sleep improvement — start with one at a time.",
    actions: [
      "Magnesium Glycinate 400mg — reduces sleep onset time, improves deep sleep",
      "Ashwagandha KSM-66 600mg — reduces cortisol, improves sleep quality",
      "L-Theanine 200mg — calms without sedation, improves sleep architecture",
      "Apigenin 50mg (chamomile extract) — mild sedative, reduces anxiety at bedtime",
      "Avoid melatonin > 0.5mg — higher doses disrupt natural melatonin production",
    ],
  },
  {
    title: "Manage Pre-Sleep Cortisol",
    icon: "🧘",
    color: "#f472b6",
    priority: "High",
    detail: "High cortisol at night is the enemy of sleep onset. The goal is to wind down the stress response 90 minutes before bed.",
    actions: [
      "No intense exercise within 3 hours of bed",
      "No work emails or stressful content from 9pm",
      "10 min journalling — offload thoughts onto paper before bed",
      "Box breathing: 4-4-4-4 for 5 minutes reduces cortisol measurably",
      "Warm shower/bath 60 min before bed — paradoxically cools core temp after",
    ],
  },
];

const SLEEP_SCIENCE = [
  {
    title: "Sleep Architecture",
    icon: "🏗️",
    color: "#4f8ef7",
    content: "Sleep is not uniform — it cycles through stages every 90 minutes.",
    facts: [
      "NREM Stage 1 & 2: Light sleep — body slows down, easy to wake",
      "NREM Stage 3 (Deep/Slow Wave): Physical restoration — growth hormone released, muscles repair",
      "REM: Brain consolidates memories, regulates emotions — testosterone is released",
      "A full night has 4–6 cycles. Cutting sleep short eliminates mostly REM sleep (last cycles)",
      "Alcohol eliminates REM sleep — even if you sleep 8 hours, you miss emotional repair",
    ],
  },
  {
    title: "Sleep & Testosterone",
    icon: "⚡",
    color: "#fb923c",
    content: "The link between sleep and testosterone is direct and measurable.",
    facts: [
      "70–80% of daily testosterone is released during sleep — specifically REM sleep",
      "5 hours sleep = testosterone levels of a man 10–15 years older",
      "Each extra hour of sleep raises testosterone by approximately 15%",
      "Poor sleep raises cortisol which directly suppresses T production",
      "Getting 8 hours instead of 6 can raise T by 25–30%",
    ],
  },
  {
    title: "Sleep & Mental Health",
    icon: "🧠",
    color: "#a78bfa",
    content: "Poor sleep and mental health issues are bidirectionally linked — each worsens the other.",
    facts: [
      "Sleep deprivation amplifies negative emotions by 60% — same brain region as PTSD",
      "REM sleep processes emotional experiences — acts as overnight therapy",
      "Chronic poor sleep is a major risk factor for depression and anxiety",
      "Improving sleep quality is one of the most effective mental health interventions",
      "Sleep before learning: encodes information. Sleep after learning: consolidates memory",
    ],
  },
  {
    title: "Sleep & Physical Performance",
    icon: "🏋️",
    color: "#34d399",
    content: "Sleep is the most underrated performance enhancing 'tool' available.",
    facts: [
      "Roger Federer and LeBron James both sleep 10–12 hours — not a coincidence",
      "One week of sleep restriction reduces bench press by 20% and sprint speed by 11%",
      "Growth hormone is almost entirely released in the first 2 hours of deep sleep",
      "Sleep deprivation reduces glycogen synthesis — depletes muscle fuel",
      "Recovery from injury requires sleep — tissue repair happens in deep sleep only",
    ],
  },
];

export default function SleepTracker() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Log form
  const [bedTime, setBedTime]       = useState("23:00");
  const [wakeTime, setWakeTime]     = useState("07:00");
  const [quality, setQuality]       = useState(null);
  const [factors, setFactorsState]  = useState([]);
  const [notes, setNotes]           = useState("");
  const [saved, setSaved]           = useState(false);

  // Logs
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ashfitverse_sleep_logs") || "[]"); } catch { return []; }
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { localStorage.setItem("ashfitverse_sleep_logs", JSON.stringify(logs)); }, [logs]);

  const toggleFactor = (id) =>
    setFactorsState(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  // Calculate hours slept
  const calcHours = () => {
    if (!bedTime || !wakeTime) return 0;
    const [bh, bm] = bedTime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return parseFloat((mins / 60).toFixed(1));
  };

  const hours = calcHours();

  const getSleepScore = () => {
    let score = 50;
    if (hours >= 7 && hours <= 9) score += 30;
    else if (hours >= 6) score += 15;
    else if (hours < 6) score -= 10;
    if (quality) score += (quality - 1) * 5;
    if (factors.includes("alcohol")) score -= 15;
    if (factors.includes("caffeine")) score -= 10;
    if (factors.includes("screen")) score -= 8;
    if (factors.includes("exercise")) score += 10;
    if (factors.includes("sunlight")) score += 8;
    if (factors.includes("magnesium")) score += 8;
    if (factors.includes("meditation")) score += 7;
    if (factors.includes("coldshower")) score += 5;
    if (factors.includes("heavymeal")) score -= 8;
    if (factors.includes("stress")) score -= 10;
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const handleSave = () => {
    const log = {
      date: new Date().toISOString().split("T")[0],
      bedTime, wakeTime, hours, quality, factors, notes,
      score: quality ? getSleepScore() : null,
    };
    setLogs(l => [log, ...l.slice(0, 29)]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const scoreColor = (s) => s >= 80 ? T.green : s >= 60 ? T.accent : s >= 40 ? T.orange : T.red;
  const scoreLabel = (s) => s >= 80 ? "Excellent 🌟" : s >= 60 ? "Good 👍" : s >= 40 ? "Fair ⚠️" : "Poor 😴";

  const weekData = SAMPLE_WEEK.map((d, i) => ({
    ...d,
    hours: logs[i]?.hours || d.hours,
    quality: logs[i]?.quality || d.quality,
    recovery: logs[i]?.score || d.recovery,
  }));

  const avgHours = (weekData.reduce((a, d) => a + d.hours, 0) / 7).toFixed(1);
  const avgRecovery = Math.round(weekData.reduce((a, d) => a + d.recovery, 0) / 7);

  const css = generateCSS(T, dark) + `
    .st-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .st-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.purple};border-color:${T.purple}40;}
    .st-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .st-logo span{color:${T.purple};}

    .st-content{max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .st-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .st-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    .tab-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;overflow-x:auto;}
    .tab-btn{padding:10px 20px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:13px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .tab-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .tab-btn.active{background:linear-gradient(135deg,${T.purple},${T.accent});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.purpleGlow};}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    .st-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px;}

    /* Time inputs */
    .time-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
    .time-group{display:flex;flex-direction:column;gap:8px;}
    .time-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};}
    .time-input{width:100%;height:52px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;
      font-size:18px;font-family:${FONT.display};font-weight:800;color:${T.text};
      outline:none;transition:all 0.25s;text-align:center;cursor:pointer;}
    .time-input:focus{border-color:${T.purple};background:${T.purpleSoft};}

    /* Hours display */
    .hours-display{text-align:center;padding:20px;background:${T.glass};
      border:1px solid ${T.glassBorder};border-radius:16px;margin-bottom:20px;}
    .hd-num{font-family:${FONT.display};font-size:52px;font-weight:800;line-height:1;}
    .hd-lbl{font-size:12px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    /* Quality */
    .quality-row{display:flex;gap:8px;margin-bottom:20px;}
    .quality-btn{flex:1;padding:14px 6px;border-radius:14px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.25s;text-align:center;font-family:${FONT.body};}
    .quality-btn:hover{transform:translateY(-2px);}
    .quality-btn.active{transform:translateY(-2px);}
    .q-ico{font-size:22px;display:block;margin-bottom:5px;}
    .q-lbl{font-size:11px;font-weight:700;color:${T.textSub};}

    /* Factors */
    .factor-grid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
    .factor-chip{padding:8px 13px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.22s;font-family:${FONT.body};
      display:flex;align-items:center;gap:5px;}
    .factor-chip:hover{border-color:${T.purple}40;color:${T.purple};}
    .factor-chip.active{background:${T.purpleSoft};border-color:${T.purple};color:${T.purple};}

    /* Score ring */
    .score-card{text-align:center;padding:28px;background:${T.glass};
      border:1px solid ${T.glassBorder};border-radius:20px;position:relative;overflow:hidden;}
    .score-num{font-family:${FONT.display};font-size:64px;font-weight:800;line-height:1;}
    .score-lbl{font-size:14px;font-weight:700;margin-top:6px;}
    .score-sub{font-size:12px;color:${T.textMuted};margin-top:4px;}

    /* Notes + save */
    .notes-inp{width:100%;height:72px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:12px 16px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;resize:none;transition:all 0.25s;}
    .notes-inp:focus{border-color:${T.purple};}
    .notes-inp::placeholder{color:${T.textMuted};}
    .save-btn{width:100%;height:52px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.purple},${T.accent});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 8px 24px ${T.purpleGlow};margin-top:12px;}
    .save-btn:hover{transform:translateY(-3px);box-shadow:0 16px 36px ${T.purpleGlow};}
    .save-btn.saved{background:linear-gradient(135deg,${T.green},${T.accent});}

    /* Stats row */
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
    .stat-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;text-align:center;position:relative;overflow:hidden;}
    .stat-glow{position:absolute;width:80px;height:80px;border-radius:50%;
      top:-20px;right:-20px;filter:blur(30px);opacity:0.4;pointer-events:none;}
    .stat-val{font-family:${FONT.display};font-size:26px;font-weight:800;line-height:1;}
    .stat-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:5px;}

    /* Recovery tips */
    .tip-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);margin-bottom:14px;position:relative;overflow:hidden;}
    .tip-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--tc)06,transparent 55%);pointer-events:none;}
    .tip-header{display:flex;align-items:center;gap:14px;margin-bottom:12px;}
    .tip-ico{font-size:26px;}
    .tip-title{font-family:${FONT.display};font-size:17px;font-weight:800;}
    .tip-priority{font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;
      padding:3px 10px;border-radius:99px;border:1px solid;}
    .tip-detail{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:12px;}
    .tip-action{display:flex;gap:9px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};}
    .tip-action:last-child{border-bottom:none;}

    /* Science */
    .sci-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);margin-bottom:14px;transition:all 0.3s;}
    .sci-card:hover{border-color:${T.glassBorderHover};}
    .sci-title{font-family:${FONT.display};font-size:17px;font-weight:800;margin-bottom:6px;}
    .sci-content{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:14px;}
    .sci-fact{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.45;}
    .sci-fact:last-child{border-bottom:none;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.st-layout{grid-template-columns:1fr;}.stats-row{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.st-content{padding:20px 16px;}.st-header{padding:18px 20px;}.time-row{grid-template-columns:1fr 1fr;}.quality-row{gap:5px;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark ? "rgba(7,8,15,0.96)" : "rgba(255,255,255,0.97)", border: `1px solid ${T.glassBorder}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, color: T.text }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.stroke || p.fill }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  const currentScore = quality ? getSleepScore() : null;

  return (
    <>
      <style>{css}</style>
      <div className="st-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.05) 0%,transparent 65%)" }} />

        <div className="st-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/male-health")}>← Men's Health</button>
            <div className="st-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="st-content">
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="st-title">😴 Sleep & Recovery</div>
            <div className="st-sub">
              Sleep is the foundation of testosterone, mental health, physical performance and recovery.
              Track your sleep, identify patterns and optimise your most powerful performance tool.
            </div>
          </div>

          <div className="tab-row" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`}
                onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          <div style={{ animation: "fadeUp 0.5s ease both" }}>

            {/* ── LOG SLEEP ── */}
            {activeTab === 0 && (
              <div className="st-layout">
                <div>
                  <div className="g-card">
                    <div className="g-title">Last Night's Sleep</div>
                    <div className="time-row">
                      <div className="time-group">
                        <span className="time-label">🌙 Bed Time</span>
                        <input type="time" className="time-input" value={bedTime}
                          onChange={e => setBedTime(e.target.value)} />
                      </div>
                      <div className="time-group">
                        <span className="time-label">☀️ Wake Time</span>
                        <input type="time" className="time-input" value={wakeTime}
                          onChange={e => setWakeTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="hours-display">
                      <div className="hd-num" style={{ color: hours >= 7 ? T.green : hours >= 6 ? T.orange : T.red }}>
                        {hours}h
                      </div>
                      <div className="hd-lbl">
                        {hours >= 8 ? "Optimal 🌟" : hours >= 7 ? "Good 👍" : hours >= 6 ? "Fair ⚠️" : "Too Little 😓"}
                      </div>
                    </div>

                    <div className="g-title">Sleep Quality</div>
                    <div className="quality-row">
                      {SLEEP_QUALITY.map(q => (
                        <button key={q.id} className={`quality-btn ${quality === q.id ? "active" : ""}`}
                          style={quality === q.id ? { borderColor: q.color, background: `${q.color}14` } : {}}
                          onClick={() => setQuality(q.id)}>
                          <span className="q-ico">{q.icon}</span>
                          <span className="q-lbl" style={quality === q.id ? { color: q.color } : {}}>{q.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="g-title">Factors (select all that apply)</div>
                    <div className="factor-grid">
                      {FACTORS.map(f => (
                        <button key={f.id} className={`factor-chip ${factors.includes(f.id) ? "active" : ""}`}
                          onClick={() => toggleFactor(f.id)}>
                          {f.icon} {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="g-title" style={{ marginBottom: 8 }}>Notes</div>
                    <textarea className="notes-inp" placeholder="How did you feel when you woke up? Any dreams? Disturbances?"
                      value={notes} onChange={e => setNotes(e.target.value)} />
                    <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
                      {saved ? "✓ Saved!" : "Save Sleep Log"}
                    </button>
                  </div>
                </div>

                <div>
                  {quality && (
                    <div className="score-card" style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>
                        Recovery Score
                      </div>
                      <div className="score-num" style={{ color: scoreColor(currentScore) }}>{currentScore}</div>
                      <div className="score-lbl" style={{ color: scoreColor(currentScore) }}>{scoreLabel(currentScore)}</div>
                      <div className="score-sub">out of 100</div>
                      <div style={{ height: 8, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", borderRadius: 99, overflow: "hidden", marginTop: 16 }}>
                        <div style={{ height: "100%", width: `${currentScore}%`, background: `linear-gradient(90deg,${scoreColor(currentScore)},${scoreColor(currentScore)}aa)`, borderRadius: 99, transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    </div>
                  )}

                  <div className="g-card">
                    <div className="g-title">Sleep Guidelines</div>
                    {[
                      { k: "Optimal for adults", v: "7–9 hours", c: T.green },
                      { k: "Minimum for T production", v: "7 hours", c: T.orange },
                      { k: "Sleep debt danger zone", v: "< 6 hours", c: T.red },
                      { k: "Deep sleep target", v: "15–25% of total", c: T.purple },
                      { k: "REM sleep target", v: "20–25% of total", c: T.accent },
                      { k: "Your average", v: `${avgHours}h this week`, c: T.text },
                    ].map((r, i, a) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
                        borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
                        <span style={{ color: T.textSub }}>{r.k}</span>
                        <span style={{ fontWeight: 800, color: r.c, fontFamily: FONT.display }}>{r.v}</span>
                      </div>
                    ))}
                  </div>

                  {logs.length > 0 && (
                    <div className="g-card">
                      <div className="g-title">Recent Logs</div>
                      {logs.slice(0, 5).map((l, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
                          borderBottom: i < 4 && i < logs.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
                          <span style={{ color: T.textSub }}>{l.date}</span>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ fontWeight: 700, color: l.hours >= 7 ? T.green : T.orange }}>{l.hours}h</span>
                            {l.score && <span style={{ fontWeight: 700, color: scoreColor(l.score), fontFamily: FONT.display }}>{l.score}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TRENDS ── */}
            {activeTab === 1 && (
              <>
                <div className="stats-row" style={{ marginBottom: 24 }}>
                  {[
                    { lbl: "Avg Sleep", val: `${avgHours}h`, sub: "This week", color: T.purple, glow: T.purpleGlow },
                    { lbl: "Avg Recovery", val: `${avgRecovery}`, sub: "out of 100", color: T.green, glow: T.greenGlow },
                    { lbl: "Logs Saved", val: logs.length, sub: "All time", color: T.accent, glow: T.accentGlow },
                    { lbl: "Best Night", val: `${Math.max(...weekData.map(d => d.hours))}h`, sub: "This week", color: T.orange, glow: T.orangeGlow },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-glow" style={{ background: s.glow }} />
                      <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                      <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: T.text, marginTop: 4 }}>{s.lbl}</div>
                      <div className="stat-lbl">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="g-card" style={{ marginBottom: 16 }}>
                  <div className="g-title">Sleep Hours — This Week</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CT />} />
                      <Bar dataKey="hours" name="Hours" radius={[8, 8, 0, 0]}>
                        {weekData.map((d, i) => (
                          <Cell key={i} fill={d.hours >= 7 ? T.purple : d.hours >= 6 ? T.orange : T.red} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="g-card">
                  <div className="g-title">Recovery Score Trend</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <defs>
                        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={T.green} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={T.green} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CT />} />
                      <Area type="monotone" dataKey="recovery" name="Recovery" stroke={T.green} strokeWidth={2.5}
                        fill="url(#rg)" dot={{ fill: T.green, r: 4, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* ── RECOVERY TIPS ── */}
            {activeTab === 2 && RECOVERY_TIPS.map((t, i) => (
              <div key={i} className="tip-card" style={{ "--tc": t.color }}>
                <div className="tip-header">
                  <span className="tip-ico">{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="tip-title" style={{ color: t.color }}>{t.title}</div>
                  </div>
                  <div className="tip-priority" style={{ color: t.color, borderColor: `${t.color}30`, background: `${t.color}12` }}>
                    {t.priority}
                  </div>
                </div>
                <div className="tip-detail">{t.detail}</div>
                {t.actions.map((a, j) => (
                  <div key={j} className="tip-action">
                    <span style={{ color: t.color, flexShrink: 0 }}>✓</span>{a}
                  </div>
                ))}
              </div>
            ))}

            {/* ── SLEEP SCIENCE ── */}
            {activeTab === 3 && SLEEP_SCIENCE.map((s, i) => (
              <div key={i} className="sci-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {s.icon}
                  </div>
                  <div className="sci-title" style={{ color: s.color }}>{s.title}</div>
                </div>
                <div className="sci-content">{s.content}</div>
                {s.facts.map((f, j) => (
                  <div key={j} className="sci-fact">
                    <span style={{ color: s.color, flexShrink: 0 }}>→</span>{f}
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