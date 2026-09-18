// src/features/maleHealth/MaleHealthDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import useUserLogs from "../../hooks/useUserLogs";
import { listenDated, upsertDated, todayKey, addAppNotification, getEffectiveUid } from "../../lib/userLogs";
import { showDonePopup } from "../../components/DonePopup";
import { generateCSS, FONT, BG_IMAGES } from "../../theme";

const QUICK_LINKS = [
  { label: "Testosterone Health", icon: "⚡", path: "/testosterone-health", color: "#fb923c" },
  { label: "Mental Health Log",   icon: "🧠", path: "/male-mental-health",  color: "#4f8ef7" },
  { label: "Sexual Wellness",     icon: "❤️", path: "/sexual-wellness",     color: "#f472b6" },
  { label: "Sleep & Recovery",    icon: "😴", path: "/sleep-tracker",       color: "#a78bfa" },
  { label: "Men's Shop",          icon: "🛒", path: "/male-shop",           color: "#34d399" },
  { label: "Workout Planner",     icon: "🏋️", path: "/workout-planner",    color: "#fbbf24" },
];

const MOODS = [
  { id: "great",    icon: "😄", label: "Great",    score: 95 },
  { id: "good",     icon: "😊", label: "Good",     score: 80 },
  { id: "okay",     icon: "😐", label: "Okay",     score: 60 },
  { id: "low",      icon: "😔", label: "Low",      score: 35 },
  { id: "stressed", icon: "😤", label: "Stressed", score: 25 },
];

const DAILY_HABITS = [
  { id: "sleep8",     icon: "😴", label: "8h Sleep" },
  { id: "sunlight",   icon: "☀️", label: "Morning Sunlight" },
  { id: "workout",    icon: "🏋️", label: "Workout" },
  { id: "protein",    icon: "🥩", label: "High Protein" },
  { id: "zinc",       icon: "💊", label: "Zinc/Supps" },
  { id: "noalcohol",  icon: "🚫", label: "No Alcohol" },
  { id: "meditation", icon: "🧘", label: "Mindfulness" },
  { id: "coldshower", icon: "🚿", label: "Cold Shower" },
];

const DAILY_TIPS = [
  { ico: "🌅", txt: "Get 10–15 minutes of morning sunlight within 30 minutes of waking — sets circadian rhythm and boosts morning testosterone." },
  { ico: "🥩", txt: "Hit your protein target today — 2g per kg of bodyweight minimum for muscle retention and hormonal health." },
  { ico: "🏋️", txt: "Compound lifts (squats, deadlifts, bench) are the most powerful natural testosterone boosters. Train hard today." },
  { ico: "😴", txt: "70–80% of testosterone is released during deep sleep. Protect your 7–9 hours at all costs." },
  { ico: "🧘", txt: "Chronic stress elevates cortisol, which directly suppresses testosterone. 10 minutes of stillness matters." },
];

export default function MaleHealthDashboard() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, authUid } = useUser();
  const { streak: liveStreak, sleepLogs, todayWorkouts } = useUserLogs(authUid);

  const [mounted, setMounted]   = useState(false);
  const [mood, setMood]         = useState(null);
  const [energy, setEnergy]     = useState(3);
  const [habits, setHabits]     = useState([]);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync today's check-in from Firestore in real time
  useEffect(() => {
    if (!authUid) return;
    return listenDated(authUid, "dailyCheckins", (entries) => {
      const today = todayKey();
      const current = entries.find((e) => e.date === today);
      if (current) {
        if (current.mood) setMood(current.mood);
        if (current.energy) setEnergy(current.energy);
        if (Array.isArray(current.habits)) setHabits(current.habits);
      }
    });
  }, [authUid]);

  const toggleHabit = (id) =>
    setHabits((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  // Real-time sleep metrics
  const latestSleep = useMemo(() => {
    if (!sleepLogs || !sleepLogs.length) return null;
    return [...sleepLogs]
      .filter((s) => s && s.date)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  }, [sleepLogs]);

  const sleepScore = latestSleep?.score != null ? Number(latestSleep.score) : null;

  // Real-time recovery calculation
  const recoveryState = useMemo(() => {
    if (sleepScore == null && !energy) {
      return { val: "Not Logged", sub: "Log sleep in tracker", color: T.textMuted, glow: "transparent" };
    }
    const combined = (sleepScore ?? 65) * 0.6 + (energy / 5) * 40;
    if (combined >= 78) {
      return { val: "Optimal", sub: "Peak readiness 🔥", color: T.green, glow: T.greenGlow };
    }
    if (combined >= 58) {
      return { val: "Good", sub: "Ready to train 💪", color: T.accent, glow: T.accentGlow };
    }
    return { val: "Low Recovery", sub: "Prioritise rest & sleep 💤", color: T.orange, glow: T.orangeGlow };
  }, [sleepScore, energy, T]);

  // Real-time calculated health pillar scores
  const testosteroneScore = useMemo(() => {
    let score = 48;
    if (todayWorkouts?.length || habits.includes("workout")) score += 14;
    if (habits.includes("sleep8")) score += 9;
    if (habits.includes("sunlight")) score += 7;
    if (habits.includes("protein")) score += 8;
    if (habits.includes("zinc")) score += 6;
    if (habits.includes("noalcohol")) score += 5;
    if (habits.includes("coldshower")) score += 3;
    if (energy >= 4) score += 5;
    return Math.min(99, Math.max(25, score));
  }, [todayWorkouts, habits, energy]);

  const mentalScore = useMemo(() => {
    let score = 50;
    const moodObj = MOODS.find((m) => m.id === mood);
    if (moodObj) score = Math.round(moodObj.score * 0.75);
    if (habits.includes("meditation")) score += 12;
    if (habits.includes("sunlight")) score += 8;
    if (energy >= 4) score += 5;
    return Math.min(99, Math.max(20, score));
  }, [mood, habits, energy]);

  const sexualScore = useMemo(() => {
    let score = 50;
    if (sleepScore && sleepScore >= 75) score += 14;
    if (habits.includes("noalcohol")) score += 10;
    if (habits.includes("zinc")) score += 10;
    if (habits.includes("workout") || todayWorkouts?.length) score += 10;
    if (energy >= 4) score += 6;
    return Math.min(99, Math.max(25, score));
  }, [sleepScore, habits, todayWorkouts, energy]);

  const sleepPillarScore = useMemo(() => {
    if (sleepScore != null) return sleepScore;
    if (habits.includes("sleep8")) return 80;
    return 55;
  }, [sleepScore, habits]);

  const HEALTH_PILLARS = [
    {
      title: "Testosterone",
      icon: "⚡",
      color: "#fb923c",
      score: testosteroneScore,
      tip: "Natural T optimisation through sleep, zinc, heavy lifting and stress reduction.",
      path: "/testosterone-health",
    },
    {
      title: "Mental Health",
      icon: "🧠",
      color: "#4f8ef7",
      score: mentalScore,
      tip: "Track your mood, manage stress and build emotional resilience.",
      path: "/male-mental-health",
    },
    {
      title: "Sexual Wellness",
      icon: "❤️",
      color: "#f472b6",
      score: sexualScore,
      tip: "Performance, libido and stamina supported by nutrition and lifestyle.",
      path: "/sexual-wellness",
    },
    {
      title: "Sleep & Recovery",
      icon: "😴",
      color: "#a78bfa",
      score: sleepPillarScore,
      tip: "HRV, sleep quality and recovery score — the foundation of everything.",
      path: "/sleep-tracker",
    },
  ];

  const handleSave = async () => {
    const today = todayKey();
    const effectiveUid = authUid || getEffectiveUid();
    const log = { date: today, mood, energy, habits, updatedAt: new Date().toISOString() };
    const ex = JSON.parse(localStorage.getItem("ashfitverse_male_daily") || "[]");
    ex.push(log);
    localStorage.setItem("ashfitverse_male_daily", JSON.stringify(ex));

    await upsertDated(effectiveUid, "dailyCheckins", today, log);
    try {
      await addAppNotification(effectiveUid, {
        text: `Men's health daily check-in saved (${habits.length}/8 habits, ${energy}/5 energy).`,
        type: "health",
        path: "/male-health",
      });
    } catch {}

    setSaved(true);
    showDonePopup({
      title: "Done!",
      message: "Men's health daily check-in saved & synced with your Dashboard!",
      subtext: `${habits.length}/8 habits · ${energy}/5 energy`,
      color: "#fb923c",
    });
    setTimeout(() => setSaved(false), 2500);
  };

  const streakVal = liveStreak ?? user?.streak ?? 0;

  const css = generateCSS(T, dark) + `
    .mh-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .mh-bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
    .mh-bg img{width:100%;height:100%;object-fit:cover;
      opacity:${dark?"0.04":"0.055"};filter:${dark?"grayscale(70%) blur(2px)":"grayscale(40%) blur(1px)"};}

    .mh-header{display:flex;align-items:center;justify-content:space-between;
      padding:0 32px;height:60px;position:sticky;top:0;z-index:50;
      border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(8,8,12,0.85)":"rgba(255,255,255,0.85)"};
      backdrop-filter:blur(40px);}
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};font-size:13px;font-weight:600;cursor:pointer;
      transition:all 0.15s ease;font-family:${FONT.body};}
    .pr-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .mh-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .mh-logo span{color:${T.orange};}

    .mh-content{max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .mh-eyebrow{font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${T.orange};margin-bottom:10px;}
    .mh-title{font-family:${FONT.display};font-size:34px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .mh-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    /* Quick links */
    .ql-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:28px;}
    .ql-btn{padding:18px 10px 15px;border-radius:18px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(24px);cursor:pointer;
      font-family:${FONT.body};font-size:12px;font-weight:700;
      color:${T.textSub};transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);text-align:center;}
    .ql-btn:hover{transform:translateY(-4px);color:var(--qc);
      border-color:var(--qc);background:linear-gradient(135deg,var(--qc)10,transparent);}
    .ql-ico{font-size:24px;display:block;margin-bottom:8px;}

    /* Pillar cards */
    .pillars-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .pillar-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);cursor:pointer;transition:all 0.3s;position:relative;overflow:hidden;}
    .pillar-card:hover{transform:translateY(-4px);border-color:var(--pc);}
    .pillar-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--pc)08,transparent 55%);pointer-events:none;}
    .pillar-ico{font-size:28px;margin-bottom:12px;display:block;}
    .pillar-title{font-family:${FONT.display};font-size:15px;font-weight:800;margin-bottom:8px;}
    .pillar-score-wrap{height:5px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};
      border-radius:99px;overflow:hidden;margin-bottom:8px;}
    .pillar-score-fill{height:100%;border-radius:99px;transition:width 1.6s cubic-bezier(0.34,1.56,0.64,1);}
    .pillar-tip{font-size:12px;color:${T.textSub};line-height:1.5;}

    /* Main grid */
    .mh-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Mood */
    .mood-row{display:flex;gap:8px;margin-bottom:20px;}
    .mood-btn{flex:1;padding:14px 6px;border-radius:14px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.25s;text-align:center;font-family:${FONT.body};}
    .mood-btn:hover{transform:translateY(-2px);}
    .mood-btn.active{border-color:${T.orange};background:${T.orangeSoft};}
    .mood-ico{font-size:24px;display:block;margin-bottom:5px;}
    .mood-lbl{font-size:11px;font-weight:700;color:${T.textSub};}

    /* Energy */
    .energy-row{display:flex;gap:8px;margin-bottom:20px;}
    .energy-btn{flex:1;height:42px;border-radius:11px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};
      cursor:pointer;font-size:14px;font-weight:800;color:${T.textMuted};
      transition:all 0.22s;font-family:${FONT.body};}

    /* Habits */
    .habit-grid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
    .habit-chip{padding:8px 14px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.22s;font-family:${FONT.body};
      display:flex;align-items:center;gap:6px;}
    .habit-chip:hover{border-color:${T.orange}40;color:${T.orange};}
    .habit-chip.active{background:${T.orangeSoft};border-color:${T.orange};color:${T.orange};}

    .save-btn{width:100%;height:50px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.orange},${T.accent});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 8px 24px ${T.orangeGlow};margin-top:8px;}
    .save-btn:hover{transform:translateY(-3px);box-shadow:0 16px 36px ${T.orangeGlow};}
    .save-btn.saved{background:linear-gradient(135deg,${T.green},${T.accent});}

    /* Metric cards */
    .metric-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
    .metric-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;text-align:center;position:relative;overflow:hidden;}
    .metric-glow{position:absolute;width:100px;height:100px;border-radius:50%;
      top:-30px;right:-30px;filter:blur(40px);opacity:0.4;pointer-events:none;}
    .metric-lbl{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;}
    .metric-val{font-family:${FONT.display};font-size:26px;font-weight:800;line-height:1;}
    .metric-sub{font-size:11px;color:${T.textSub};margin-top:4px;}

    /* Tip list */
    .tip-item{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid ${T.glassBorder};font-size:13px;color:${T.textSub};line-height:1.55;}
    .tip-item:last-child{border-bottom:none;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:1100px){.pillars-grid{grid-template-columns:repeat(2,1fr);}.ql-grid{grid-template-columns:repeat(3,1fr);}.mh-grid{grid-template-columns:1fr;}.metric-row{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:700px){.mh-content{padding:20px 16px;}.mh-header{padding:0 16px;}.metric-row{grid-template-columns:1fr 1fr;}.ql-grid{grid-template-columns:repeat(2,1fr);}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="mh-root">
        <div className="mh-bg"><img src={BG_IMAGES.workout} alt="" loading="lazy" /></div>
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.06) 0%,transparent 65%)" }} />
        <div className="orb orb-3" style={{ background: "radial-gradient(circle,rgba(167,139,250,0.04) 0%,transparent 65%)" }} />

        <div className="mh-header">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="mh-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="mh-content">
          {/* Hero */}
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="mh-eyebrow">♂ Men's Health</div>
            <div className="mh-title">Hey {user?.name?.split(" ")[0] || "Champion"} 🔥</div>
            <div className="mh-sub">
              Your complete men's health hub — testosterone optimisation, mental resilience, sexual wellness and recovery tracking.
              Every system working together for peak performance.
            </div>
          </div>

          {/* Quick links */}
          <div className="ql-grid" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            {QUICK_LINKS.map((q, i) => (
              <button key={i} className="ql-btn" style={{ "--qc": q.color }} onClick={() => navigate(q.path)}>
                <span className="ql-ico">{q.icon}</span>{q.label}
              </button>
            ))}
          </div>

          {/* Metric cards — 100% Real-Time User Logged Data */}
          <div className="metric-row" style={{ animation: "fadeUp 0.6s ease 0.08s both" }}>
            {[
              {
                lbl: "Workout Streak",
                val: streakVal > 0 ? `${streakVal} days` : "0 days",
                sub: streakVal > 0 ? "Keep it burning 🔥" : "Log workout to begin",
                color: T.orange,
                glow: T.orangeGlow,
              },
              {
                lbl: "Sleep Score",
                val: sleepScore != null ? `${sleepScore}/100` : "—",
                sub: latestSleep ? `${latestSleep.hours || 0}h logged ${latestSleep.date === todayKey() ? "today" : latestSleep.date}` : "Tap sleep tracker",
                color: T.purple,
                glow: T.purpleGlow,
              },
              {
                lbl: "Recovery",
                val: recoveryState.val,
                sub: recoveryState.sub,
                color: recoveryState.color,
                glow: recoveryState.glow,
              },
              {
                lbl: "Habits Today",
                val: `${habits.length}/8`,
                sub: habits.length ? `${Math.round((habits.length / 8) * 100)}% completed` : "Check habits below",
                color: T.green,
                glow: T.greenGlow,
              },
            ].map((m, i) => (
              <div key={i} className="metric-card">
                <div className="metric-glow" style={{ background: m.glow }} />
                <div className="metric-lbl">{m.lbl}</div>
                <div className="metric-val" style={{ color: m.color }}>{m.val}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Health pillars — Real-Time Synced */}
          <div className="pillars-grid" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
            {HEALTH_PILLARS.map((p, i) => (
              <div key={i} className="pillar-card" style={{ "--pc": p.color }} onClick={() => navigate(p.path)}>
                <span className="pillar-ico">{p.icon}</span>
                <div className="pillar-title" style={{ color: p.color }}>{p.title}</div>
                <div className="pillar-score-wrap">
                  <div className="pillar-score-fill" style={{ width: `${p.score}%`, background: `linear-gradient(90deg,${p.color},${p.color}aa)` }} />
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>{p.score}% optimised</div>
                <div className="pillar-tip">{p.tip}</div>
              </div>
            ))}
          </div>

          {/* Daily check-in + tips */}
          <div className="mh-grid" style={{ animation: "fadeUp 0.6s ease 0.15s both" }}>
            <div className="g-card">
              <div className="g-title">Daily Check-in (Real-Time Sync)</div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Mood</div>
              <div className="mood-row">
                {MOODS.map(m => (
                  <button key={m.id} className={`mood-btn ${mood === m.id ? "active" : ""}`} onClick={() => setMood(m.id)}>
                    <span className="mood-ico">{m.icon}</span>
                    <span className="mood-lbl">{m.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Energy — {energy}/5</div>
              <div className="energy-row" style={{ marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className="energy-btn"
                    style={energy >= n ? { borderColor: T.orange, background: T.orangeSoft, color: T.orange } : {}}
                    onClick={() => setEnergy(n)}>{n}</button>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Habits Completed Today ({habits.length}/8)</div>
              <div className="habit-grid">
                {DAILY_HABITS.map(h => (
                  <button key={h.id} className={`habit-chip ${habits.includes(h.id) ? "active" : ""}`}
                    onClick={() => toggleHabit(h.id)}>
                    {h.icon} {h.label}
                  </button>
                ))}
              </div>

              <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
                {saved ? "✓ Saved & Synced!" : "Save Daily Check-in"}
              </button>
            </div>

            <div className="g-card">
              <div className="g-title">Today's Optimisation Tips</div>
              {DAILY_TIPS.map((t, i, a) => (
                <div key={i} className="tip-item" style={{ borderColor: i < a.length - 1 ? T.glassBorder : "transparent" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{t.ico}</span><span>{t.txt}</span>
                </div>
              ))}

              <div style={{ marginTop: 20, padding: "16px", borderRadius: 14, background: T.orangeSoft, border: `1px solid ${T.orange}25` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.orange, marginBottom: 6 }}>⚡ Today's Focus</div>
                <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
                  Track your habits consistently for 30 days to see measurable changes in energy, mood and performance.
                  Small daily actions compound into significant results.
                </div>
              </div>
            </div>
          </div>

          {/* Quick recs */}
          <div className="g-card" style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
            <div className="g-title">Recommended For You</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {QUICK_LINKS.slice(0, 4).map((r, i) => (
                <div key={i} style={{ padding: "16px", borderRadius: 16, background: `${r.color}10`, border: `1px solid ${r.color}25`, cursor: "pointer", transition: "all 0.25s" }}
                  onClick={() => navigate(r.path)}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>View section →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}