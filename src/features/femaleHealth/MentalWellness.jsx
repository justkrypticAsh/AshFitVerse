// src/features/femaleHealth/MentalWellness.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const MOOD_OPTIONS = [
  { id: "great",     icon: "😄", label: "Great",     score: 5, color: "#34d399" },
  { id: "good",      icon: "😊", label: "Good",      score: 4, color: "#4f8ef7" },
  { id: "okay",      icon: "😐", label: "Okay",      score: 3, color: "#fbbf24" },
  { id: "low",       icon: "😔", label: "Low",       score: 2, color: "#fb923c" },
  { id: "terrible",  icon: "😢", label: "Terrible",  score: 1, color: "#f87171" },
];

const STRESS_LEVELS = [
  { id: "calm",    icon: "🧘", label: "Calm",    score: 1, color: "#34d399" },
  { id: "mild",    icon: "😌", label: "Mild",    score: 2, color: "#4f8ef7" },
  { id: "moderate",icon: "😤", label: "Moderate",score: 3, color: "#fbbf24" },
  { id: "high",    icon: "😰", label: "High",    score: 4, color: "#fb923c" },
  { id: "severe",  icon: "🤯", label: "Severe",  score: 5, color: "#f87171" },
];

const ACTIVITIES = [
  { id: "meditation", icon: "🧘", label: "Meditation" },
  { id: "journalling",icon: "📔", label: "Journalling" },
  { id: "exercise",   icon: "🏃", label: "Exercise" },
  { id: "walk",       icon: "🚶", label: "Walk in nature" },
  { id: "breathwork", icon: "💨", label: "Breathwork" },
  { id: "therapy",    icon: "💬", label: "Therapy/Talk" },
  { id: "creative",   icon: "🎨", label: "Creative hobby" },
  { id: "social",     icon: "👥", label: "Social time" },
  { id: "sleep",      icon: "😴", label: "Rest/Nap" },
  { id: "selfcare",   icon: "🛁", label: "Self-care" },
];

const PHASE_MENTAL_TIPS = {
  Menstrual: {
    color: "#f472b6",
    tips: [
      "Low oestrogen and progesterone can cause low mood — this is hormonal, not a personal failing.",
      "Reduce social obligations. Permission to say no and rest.",
      "Warmth helps — hot water bottles, warm baths, comforting foods.",
      "Journalling or gentle crying releases cortisol — let it out.",
    ],
    affirmation: "I honour my body's need for rest. This too shall pass.",
  },
  Follicular: {
    color: "#4f8ef7",
    tips: [
      "Rising oestrogen boosts serotonin — you naturally feel more optimistic.",
      "Best time to tackle challenging tasks, start new projects or set goals.",
      "Social energy is high — plan meaningful connections.",
      "Channel increased mental clarity into creative work.",
    ],
    affirmation: "I am growing, learning and becoming. Energy flows through me.",
  },
  Ovulation: {
    color: "#fbbf24",
    tips: [
      "Peak confidence — ideal for presentations, difficult conversations, leadership.",
      "High empathy and communication skills — great for relationship deepening.",
      "Testosterone briefly spikes — channel into assertive action.",
      "Be mindful of over-committing due to high energy.",
    ],
    affirmation: "I am at my most radiant. I speak my truth with confidence.",
  },
  Luteal: {
    color: "#a78bfa",
    tips: [
      "Progesterone can increase anxiety — limit caffeine which worsens this.",
      "PMS mood symptoms are real — track them to predict and prepare.",
      "Magnesium and B6 significantly reduce anxiety and irritability.",
      "Reduce social load in the final week. It's okay to be introverted.",
    ],
    affirmation: "I am safe. I am held. My feelings are valid and they will shift.",
  },
};

const BREATHING_EXERCISES = [
  {
    name: "4-7-8 Breathing",
    desc: "Inhale 4s, hold 7s, exhale 8s. Activates parasympathetic nervous system.",
    benefit: "Reduces anxiety in 2–3 cycles. Ideal for panic or PMS anxiety.",
    color: "#a78bfa",
    icon: "💜",
  },
  {
    name: "Box Breathing",
    desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.",
    benefit: "Reduces cortisol. Used by Navy SEALs for stress management.",
    color: "#4f8ef7",
    icon: "🔷",
  },
  {
    name: "Physiological Sigh",
    desc: "Double inhale through nose, long slow exhale through mouth.",
    benefit: "Fastest known method to reduce acute stress — works in one breath.",
    color: "#34d399",
    icon: "💚",
  },
  {
    name: "Alternate Nostril",
    desc: "Block right nostril, inhale left. Block left, exhale right. Repeat.",
    benefit: "Balances left/right brain hemispheres. Reduces PMS-related anxiety.",
    color: "#f472b6",
    icon: "🩷",
  },
];

const JOURNAL_PROMPTS = [
  "What emotion am I carrying the most today, and where do I feel it in my body?",
  "Three things that felt heavy this week, and what they might be telling me.",
  "What does my body need right now that I haven't given it?",
  "A letter to the version of myself who was struggling last month.",
  "What boundaries do I need to reinforce for my peace?",
  "The story I'm telling myself vs. what is actually true.",
  "What would I tell my best friend if she felt exactly as I do today?",
  "Three small moments of beauty I noticed today.",
];

// Generate 7-day mock trend
const generateTrend = () => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return days.map((d, i) => ({
    day: d,
    mood: Math.floor(Math.random() * 3) + 2,
    stress: Math.floor(Math.random() * 3) + 1,
    energy: Math.floor(Math.random() * 3) + 2,
  }));
};

export default function MentalWellness() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isFemale, loading } = useUser();
  const [mounted, setMounted]     = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mood, setMood]           = useState(null);
  const [stress, setStress]       = useState(null);
  const [energy, setEnergy]       = useState(3);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes]         = useState("");
  const [saved, setSaved]         = useState(false);
  const [trendData]               = useState(generateTrend);
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => { setMounted(true);},[]);useEffect(() => {
    if (!loading && !isFemale) navigate("/dashboard");
  }, [loading, isFemale]); 

  // Derive current phase name from cycle day
  const getCurrentPhaseName = () => {
    if (!user.lastPeriod) return "Follicular";
    const cycleLen = parseInt(user.cycleLength) || 28;
    const day = (Math.floor((new Date() - new Date(user.lastPeriod)) / 86400000) % cycleLen) + 1;
    if (day <= 5) return "Menstrual";
    if (day <= 13) return "Follicular";
    if (day <= 16) return "Ovulation";
    return "Luteal";
  };

  const phaseName = getCurrentPhaseName();
  const phaseTips = PHASE_MENTAL_TIPS[phaseName];

  const toggleActivity = (id) =>
    setActivities(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const handleSave = () => {
    const log = { date: new Date().toISOString().split("T")[0], mood, stress, energy, activities, notes };
    const existing = JSON.parse(localStorage.getItem("ashfitverse_mental_logs") || "[]");
    existing.push(log);
    localStorage.setItem("ashfitverse_mental_logs", JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = ["Daily Log", "Trends", "Phase Wellness", "Breathing", "Journal"];

  const css = generateCSS(T, dark) + `
    .mw-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}

    .mw-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.purple};border-color:${T.purple}40;}
    .mw-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .mw-logo span{color:${T.purple};}

    .mw-content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .mw-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .mw-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    .tab-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;overflow-x:auto;}
    .tab-btn{padding:10px 20px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(20px);font-size:13px;font-weight:700;
      color:${T.textSub};cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .tab-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .tab-btn.active{background:linear-gradient(135deg,${T.purple},${T.pink});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.purpleGlow};}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Mood grid */
    .mood-grid{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
    .mood-btn{flex:1;min-width:80px;padding:16px 8px;border-radius:16px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};cursor:pointer;
      transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);text-align:center;font-family:${FONT.body};}
    .mood-btn:hover{transform:translateY(-3px);}
    .mood-btn.active{transform:translateY(-3px);}
    .mood-ico{font-size:28px;display:block;margin-bottom:6px;}
    .mood-lbl{font-size:11px;font-weight:700;color:${T.textSub};}

    /* Energy slider */
    .energy-row{display:flex;gap:8px;margin-bottom:20px;}
    .energy-btn{flex:1;height:44px;border-radius:12px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};
      cursor:pointer;font-size:14px;font-weight:800;color:${T.textMuted};
      transition:all 0.22s;font-family:${FONT.body};}

    /* Activity chips */
    .act-grid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
    .act-chip{padding:9px 14px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.22s;font-family:${FONT.body};
      display:flex;align-items:center;gap:6px;}
    .act-chip:hover{border-color:${T.purple}40;color:${T.purple};}
    .act-chip.active{background:${T.purpleSoft};border-color:${T.purple};color:${T.purple};}

    .notes-inp{width:100%;height:80px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:12px 16px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;
      resize:none;transition:all 0.25s;}
    .notes-inp:focus{border-color:${T.purple};background:${T.purpleSoft};}
    .notes-inp::placeholder{color:${T.textMuted};}

    .save-btn{width:100%;height:52px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.purple},${T.pink});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 8px 24px ${T.purpleGlow};margin-top:8px;}
    .save-btn:hover{transform:translateY(-3px);box-shadow:0 16px 36px ${T.purpleGlow};}
    .save-btn.saved{background:linear-gradient(135deg,${T.green},${T.accent});}

    /* Phase tip card */
    .phase-tip-card{border-radius:20px;padding:22px;margin-bottom:16px;border:1px solid;}
    .pt-phase{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:8px;}
    .pt-affirmation{font-style:italic;font-size:15px;font-weight:600;margin-bottom:16px;line-height:1.6;}
    .pt-tip{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid;font-size:13px;line-height:1.55;}
    .pt-tip:last-child{border-bottom:none;}

    /* Trend chart */
    .trend-layout{display:grid;grid-template-columns:1fr 280px;gap:16px;}
    .trend-stat{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;text-align:center;margin-bottom:12px;}
    .ts-val{font-family:${FONT.display};font-size:28px;font-weight:800;}
    .ts-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    /* Breathing */
    .breath-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
    .breath-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .breath-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .breath-ico{font-size:32px;margin-bottom:10px;}
    .breath-name{font-family:${FONT.display};font-size:17px;font-weight:800;margin-bottom:6px;}
    .breath-desc{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:10px;}
    .breath-benefit{font-size:12px;padding:9px 13px;border-radius:10px;border-left:3px solid;line-height:1.5;}

    /* Journal */
    .journal-prompt{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:28px;backdrop-filter:blur(28px);margin-bottom:16px;text-align:center;}
    .jp-label{font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
      color:${T.purple};margin-bottom:12px;}
    .jp-text{font-family:${FONT.display};font-size:20px;font-weight:700;color:${T.text};
      line-height:1.55;margin-bottom:20px;}
    .jp-btns{display:flex;gap:10px;justify-content:center;}
    .jp-nav{padding:10px 22px;border-radius:12px;border:1px solid ${T.glassBorder};
      background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;
      cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .jp-nav:hover{color:${T.purple};border-color:${T.purple}40;}

    .journal-area{width:100%;min-height:180px;background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      border:1.5px solid ${T.glassBorder};border-radius:16px;padding:18px;
      font-size:14px;font-family:${FONT.body};color:${T.text};outline:none;
      resize:vertical;transition:all 0.25s;line-height:1.7;}
    .journal-area:focus{border-color:${T.purple};background:${T.purpleSoft};}
    .journal-area::placeholder{color:${T.textMuted};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.trend-layout{grid-template-columns:1fr;}.breath-grid{grid-template-columns:1fr;}}
    @media(max-width:600px){.mw-content{padding:20px 16px;}.mw-header{padding:18px 20px;}.mood-btn{min-width:60px;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark ? "rgba(7,8,15,0.96)" : "rgba(255,255,255,0.98)", border: `1px solid ${T.glassBorder}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, color: T.text, backdropFilter: "blur(20px)" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.stroke }}>
          {p.name}: {p.value}/5
        </div>)}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="mw-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(244,114,182,0.05) 0%,transparent 65%)" }} />
        <div className="orb orb-3" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.04) 0%,transparent 65%)" }} />

        <div className="mw-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/female-health")}>← Women's Health</button>
            <div className="mw-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="mw-content">
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="mw-title">🧘 Mental Wellness</div>
            <div className="mw-sub">
              Your mental health is deeply connected to your cycle. Track your mood, stress and energy daily
              to find patterns — and use phase-based tools to support your emotional wellbeing every day of the month.
            </div>
          </div>

          <div className="tab-row" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          <div style={{ animation: "fadeUp 0.5s ease both" }}>

            {/* ── DAILY LOG ── */}
            {activeTab === 0 && (
              <div style={{ maxWidth: 700 }}>
                <div className="g-card">
                  <div className="g-title">How are you feeling today?</div>

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Mood</div>
                  <div className="mood-grid">
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.id} className={`mood-btn ${mood === m.id ? "active" : ""}`}
                        style={mood === m.id ? { borderColor: m.color, background: `${m.color}18` } : {}}
                        onClick={() => setMood(m.id)}>
                        <span className="mood-ico">{m.icon}</span>
                        <span className="mood-lbl">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Stress Level</div>
                  <div className="mood-grid" style={{ marginBottom: 20 }}>
                    {STRESS_LEVELS.map(s => (
                      <button key={s.id} className={`mood-btn ${stress === s.id ? "active" : ""}`}
                        style={stress === s.id ? { borderColor: s.color, background: `${s.color}18` } : {}}
                        onClick={() => setStress(s.id)}>
                        <span className="mood-ico">{s.icon}</span>
                        <span className="mood-lbl">{s.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Energy — {energy}/5</div>
                  <div className="energy-row" style={{ marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} className="energy-btn"
                        style={energy >= n ? { borderColor: T.purple, background: T.purpleSoft, color: T.purple } : {}}
                        onClick={() => setEnergy(n)}>{n}</button>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>What helped today?</div>
                  <div className="act-grid">
                    {ACTIVITIES.map(a => (
                      <button key={a.id} className={`act-chip ${activities.includes(a.id) ? "active" : ""}`}
                        onClick={() => toggleActivity(a.id)}>
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>Notes</div>
                  <textarea className="notes-inp" placeholder="Any thoughts, reflections or patterns you noticed..."
                    value={notes} onChange={e => setNotes(e.target.value)} />

                  <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
                    {saved ? "✓ Saved!" : "Save Today's Check-in"}
                  </button>
                </div>

                {/* Phase-based note */}
                <div className="phase-tip-card" style={{ background: `${phaseTips.color}10`, borderColor: `${phaseTips.color}30` }}>
                  <div className="pt-phase" style={{ color: phaseTips.color }}>💜 {phaseName} Phase — Mental Health Note</div>
                  <div className="pt-affirmation" style={{ color: T.text }}>"{phaseTips.affirmation}"</div>
                  {phaseTips.tips.map((t, i) => (
                    <div key={i} className="pt-tip" style={{ borderColor: `${phaseTips.color}20`, color: T.textSub }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>✨</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TRENDS ── */}
            {activeTab === 1 && (
              <div>
                <div className="trend-layout">
                  <div className="g-card">
                    <div className="g-title">7-Day Mood & Stress Trends</div>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                        <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CT />} />
                        <Line type="monotone" dataKey="mood" name="Mood" stroke={T.purple} strokeWidth={2.5} dot={{ fill: T.purple, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="stress" name="Stress" stroke={T.pink} strokeWidth={2.5} dot={{ fill: T.pink, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="energy" name="Energy" stroke={T.green} strokeWidth={2.5} dot={{ fill: T.green, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
                      {[{ label: "Mood", color: T.purple }, { label: "Stress", color: T.pink }, { label: "Energy", color: T.green }].map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textSub, fontWeight: 600 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    {[
                      { label: "Avg Mood", val: "3.4/5", sub: "This week", color: T.purple },
                      { label: "Avg Stress", val: "2.8/5", sub: "This week", color: T.pink },
                      { label: "Avg Energy", val: "3.1/5", sub: "This week", color: T.green },
                      { label: "Logs Saved", val: "12", sub: "This month", color: T.accent },
                    ].map((s, i) => (
                      <div key={i} className="trend-stat">
                        <div className="ts-val" style={{ color: s.color }}>{s.val}</div>
                        <div style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: T.text, marginTop: 4 }}>{s.label}</div>
                        <div className="ts-lbl">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="g-card">
                  <div className="g-title">Cycle-Mood Correlation</div>
                  <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7 }}>
                    Research shows mood closely tracks hormonal fluctuations across the cycle.
                    Log consistently for 2–3 months to identify <strong style={{ color: T.purple }}>your personal pattern</strong>.
                    This data helps predict difficult days in advance so you can plan, protect and prepare.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                    {Object.entries(PHASE_MENTAL_TIPS).map(([phase, data], i) => (
                      <div key={i} style={{ padding: "8px 16px", borderRadius: 99, background: `${data.color}15`, border: `1px solid ${data.color}30`, color: data.color, fontSize: 12, fontWeight: 700 }}>
                        {phase}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PHASE WELLNESS ── */}
            {activeTab === 2 && (
              <div>
                {Object.entries(PHASE_MENTAL_TIPS).map(([phase, data], i) => (
                  <div key={i} className="g-card" style={{ borderColor: phaseName === phase ? `${data.color}40` : T.glassBorder }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ padding: "5px 14px", borderRadius: 99, background: `${data.color}15`, border: `1px solid ${data.color}30`, color: data.color, fontSize: 12, fontWeight: 700 }}>
                        {phase} Phase
                        {phaseName === phase && <span style={{ marginLeft: 8 }}>← You are here</span>}
                      </div>
                    </div>
                    <div style={{ fontStyle: "italic", fontSize: 15, color: data.color, fontWeight: 600, marginBottom: 14, lineHeight: 1.6 }}>
                      "{data.affirmation}"
                    </div>
                    {data.tips.map((t, j, arr) => (
                      <div key={j} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: j < arr.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>💜</span>{t}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ── BREATHING ── */}
            {activeTab === 3 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <div className="g-title">Why Breathwork Works</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Controlled breathing directly activates the <strong style={{ color: T.purple }}>parasympathetic nervous system</strong>,
                    reducing cortisol and adrenaline. For women with PMS, anxiety or high stress, breathwork is one of the
                    most evidence-backed non-pharmaceutical interventions available.
                  </p>
                </div>
                <div className="breath-grid">
                  {BREATHING_EXERCISES.map((b, i) => (
                    <div key={i} className="breath-card">
                      <div className="breath-ico">{b.icon}</div>
                      <div className="breath-name" style={{ color: b.color }}>{b.name}</div>
                      <div className="breath-desc">{b.desc}</div>
                      <div className="breath-benefit" style={{ borderColor: b.color, background: `${b.color}10`, color: T.textSub }}>
                        ✨ {b.benefit}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── JOURNAL ── */}
            {activeTab === 4 && (
              <div style={{ maxWidth: 700 }}>
                <div className="journal-prompt">
                  <div className="jp-label">✍️ Today's Prompt</div>
                  <div className="jp-text">"{JOURNAL_PROMPTS[promptIdx]}"</div>
                  <div className="jp-btns">
                    <button className="jp-nav" onClick={() => setPromptIdx(i => (i - 1 + JOURNAL_PROMPTS.length) % JOURNAL_PROMPTS.length)}>← Previous</button>
                    <button className="jp-nav" onClick={() => setPromptIdx(i => (i + 1) % JOURNAL_PROMPTS.length)}>Next →</button>
                  </div>
                </div>
                <div className="g-card">
                  <div className="g-title">Write Here</div>
                  <textarea className="journal-area" placeholder="Start writing... there's no right or wrong here. Let your thoughts flow freely." />
                  <button className="save-btn" style={{ marginTop: 14 }}>Save Journal Entry</button>
                </div>
                <div className="g-card">
                  <div className="g-title">Why Journalling Helps</div>
                  {[
                    { ico: "🧠", txt: "Reduces rumination by externalising thoughts — moves worry from brain to paper" },
                    { ico: "📊", txt: "Helps identify emotional patterns across your cycle over time" },
                    { ico: "💜", txt: "Self-compassion practice — writing to yourself like a friend reduces self-criticism" },
                    { ico: "😴", txt: "Evening journalling reduces cortisol and improves sleep onset" },
                  ].map((t, i, a) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{t.ico}</span>{t.txt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}