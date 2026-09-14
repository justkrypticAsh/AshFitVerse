import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DT = {
  bg: "#060810", glass: "rgba(255,255,255,0.035)", glassBorder: "rgba(255,255,255,0.075)",
  cardBorderHover: "rgba(255,255,255,0.15)",
  text: "#eef2ff", textSub: "rgba(200,212,255,0.52)", textMuted: "rgba(200,212,255,0.28)",
  accent: "#4f8ef7", accentGlow: "rgba(79,142,247,0.22)",
  green: "#34d399", greenGlow: "rgba(52,211,153,0.18)",
  purple: "#a78bfa", purpleGlow: "rgba(167,139,250,0.18)",
  orange: "#fb923c",
};
const LT = {
  bg: "#f3f6ff", glass: "rgba(255,255,255,0.75)", glassBorder: "rgba(0,0,0,0.07)",
  cardBorderHover: "rgba(79,142,247,0.3)",
  text: "#0a0e1f", textSub: "rgba(10,14,31,0.52)", textMuted: "rgba(10,14,31,0.3)",
  accent: "#3b7ef0", accentGlow: "rgba(59,126,240,0.14)",
  green: "#10b981", greenGlow: "rgba(16,185,129,0.14)",
  purple: "#7c3aed", purpleGlow: "rgba(124,58,237,0.14)",
  orange: "#f97316",
};

export default function WorkoutDayPage({ config }) {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const T = dark ? DT : LT;

  const [completedSets, setCompletedSets] = useState({});
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [done, setDone] = useState(false);
  const [activeEx, setActiveEx] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let i;
    if (timerActive) i = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(i);
  }, [timerActive]);

  useEffect(() => {
    let i;
    if (restActive && restTimer > 0) {
      i = setInterval(() => setRestTimer(t => {
        if (t <= 1) { setRestActive(false); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(i);
  }, [restActive, restTimer]);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleSet = (exIdx, setIdx) => {
    const key = `${exIdx}-${setIdx}`;
    const wasCompleted = completedSets[key];
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
    if (!wasCompleted) {
      setRestTimer(90);
      setRestActive(true);
    }
  };

  const totalSets = config.exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const completedCount = Object.values(completedSets).filter(Boolean).length;
  const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${T.bg};}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${config.color}50;border-radius:99px;}

    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;}
    .o1{top:-18%;left:-10%;width:1000px;height:1000px;background:radial-gradient(circle,${config.color}10 0%,transparent 65%);animation:of1 22s ease-in-out infinite;}
    .o2{bottom:-20%;right:-12%;width:900px;height:900px;background:radial-gradient(circle,${dark?"rgba(167,139,250,0.05)":"rgba(167,139,250,0.03)"} 0%,transparent 65%);animation:of2 28s ease-in-out infinite;}
    @keyframes of1{0%,100%{transform:translate(0,0);}50%{transform:translate(50px,-40px);}}
    @keyframes of2{0%,100%{transform:translate(0,0);}50%{transform:translate(-40px,-50px);}}

    .header{display:flex;align-items:center;justify-content:space-between;padding:24px 40px;border-bottom:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(30px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:'DM Sans',sans-serif;}
    .back-btn:hover{color:${config.color};border-color:${config.color}40;}
    .h-logo{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${T.text};}
    .h-logo span{color:${config.color};}
    .h-right{display:flex;align-items:center;gap:10px;}
    .tt2{width:52px;height:28px;border-radius:99px;border:1px solid ${T.glassBorder};background:${T.glass};cursor:pointer;position:relative;}
    .th{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,${config.color},${T.purple});position:absolute;top:3px;left:${dark?"27px":"3px"};transition:left 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;font-size:10px;}
    .timer-display{padding:8px 18px;border-radius:99px;background:${config.color}15;border:1px solid ${config.color}30;font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:${config.color};cursor:pointer;transition:all 0.25s;}
    .timer-display:hover{background:${config.color}25;}

    /* Hero */
    .hero{padding:40px 40px 32px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;}
    .hero-tag{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:99px;background:${config.color}15;border:1px solid ${config.color}30;font-size:12px;font-weight:700;color:${config.color};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
    .hero-title{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;letter-spacing:-0.03em;color:${T.text};line-height:1;margin-bottom:12px;}
    .hero-sub{font-size:15px;color:${T.textSub};line-height:1.6;margin-bottom:24px;max-width:480px;}

    /* Progress */
    .progress-wrap{margin-bottom:8px;}
    .progress-header{display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;}
    .progress-label{color:${T.textSub};font-weight:600;}
    .progress-pct{color:${config.color};font-weight:800;font-family:'Syne',sans-serif;}
    .progress-track{height:8px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};border-radius:99px;overflow:hidden;}
    .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,${config.color},${config.color}88);transition:width 0.6s cubic-bezier(0.4,0,0.2,1);}

    /* Stats pills */
    .stats-pills{display:flex;gap:10px;flex-wrap:wrap;}
    .stat-pill{padding:10px 18px;border-radius:12px;background:${T.glass};border:1px solid ${T.glassBorder};backdrop-filter:blur(20px);text-align:center;}
    .sp-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${T.text};}
    .sp-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:3px;}

    /* Rest timer */
    .rest-timer{
      position:fixed;bottom:28px;right:28px;z-index:100;
      background:${dark?"rgba(8,12,24,0.95)":"rgba(255,255,255,0.97)"};
      border:1px solid ${config.color}40;border-radius:20px;
      padding:18px 24px;backdrop-filter:blur(24px);
      box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px ${config.color}20;
      animation:slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
      display:flex;align-items:center;gap:16px;
    }
    @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    .rest-icon{font-size:24px;}
    .rest-label{font-size:11px;color:${T.textMuted};font-weight:700;letter-spacing:0.12em;text-transform:uppercase;}
    .rest-time{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:${config.color};}
    .rest-skip{padding:8px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
    .rest-skip:hover{color:${T.text};}

    /* Main layout */
    .main{max-width:1100px;margin:0 auto;padding:0 40px 40px;display:grid;grid-template-columns:1fr 320px;gap:20px;}

    /* Exercise list */
    .ex-section{margin-bottom:14px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;backdrop-filter:blur(28px);overflow:hidden;transition:all 0.3s;animation:fu 0.5s ease both;}
    .ex-section:hover{border-color:${T.cardBorderHover};}
    .ex-section.active-ex{border-color:${config.color}40;box-shadow:0 0 0 1px ${config.color}20;}
    .ex-section-header{padding:20px 24px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;}
    .ex-info{display:flex;align-items:center;gap:14px;}
    .ex-num{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;flex-shrink:0;}
    .ex-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:${T.text};}
    .ex-meta{font-size:12px;color:${T.textSub};margin-top:3px;}
    .ex-chevron{font-size:14px;color:${T.textMuted};transition:transform 0.3s;}
    .ex-chevron.open{transform:rotate(180deg);}

    .ex-sets{padding:0 24px 20px;}
    .set-row{display:grid;grid-template-columns:36px 1fr 1fr 1fr 44px;gap:10px;align-items:center;margin-bottom:8px;}
    .set-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};text-align:center;}
    .set-num-badge{width:36px;height:36px;border-radius:10px;background:${T.glass};border:1px solid ${T.glassBorder};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${T.textSub};}
    .set-info{background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:10px;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:${T.text};}
    .set-check{width:36px;height:36px;border-radius:10px;border:2px solid ${T.glassBorder};background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.25s;}
    .set-check:hover{border-color:${config.color}60;}
    .set-check.checked{background:${config.color};border-color:${config.color};box-shadow:0 0 14px ${config.color}60;}
    .set-check.checked::after{content:'✓';color:#000;font-weight:800;font-size:14px;}

    .ex-tip{background:${config.color}08;border-radius:12px;padding:12px 14px;margin-top:4px;font-size:12px;color:${T.textSub};line-height:1.6;}
    .ex-tip strong{color:${T.text};}

    /* Right sidebar */
    .side-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);margin-bottom:14px;transition:all 0.3s;}
    .side-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}

    .muscle-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};}
    .muscle-item:last-child{border-bottom:none;}
    .muscle-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
    .muscle-name{font-size:13px;font-weight:600;color:${T.text};flex:1;}
    .muscle-tag{font-size:10px;font-weight:700;padding:3px 9px;border-radius:99px;letter-spacing:0.06em;}

    .finish-btn{width:100%;height:54px;border-radius:15px;border:none;background:linear-gradient(135deg,${config.color},${config.color}bb);color:#000;font-size:14px;font-weight:800;font-family:'DM Sans',sans-serif;letter-spacing:0.05em;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 24px ${config.color}40;text-transform:uppercase;margin-top:4px;}
    .finish-btn:hover{transform:translateY(-2px);box-shadow:0 14px 36px ${config.color}50;}
    .finish-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

    /* Done overlay */
    .done-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(14px);}
    .done-box{background:${dark?"#0b0f1a":"#ffffff"};border:1px solid ${config.color}30;border-radius:28px;padding:44px;text-align:center;max-width:420px;width:90%;animation:scaleIn 0.5s cubic-bezier(0.4,0,0.2,1) both;box-shadow:0 40px 100px rgba(0,0,0,0.5),0 0 0 1px ${config.color}20;}
    .done-emoji{font-size:72px;margin-bottom:16px;display:block;}
    .done-title{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .done-sub{font-size:15px;color:${T.textSub};margin-bottom:28px;line-height:1.6;}
    .done-btn{width:100%;padding:15px;border-radius:15px;border:none;background:linear-gradient(135deg,${config.color},${T.purple});color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 8px 24px ${config.color}40;transition:all 0.25s;}
    .done-btn:hover{transform:translateY(-2px);}

    @keyframes fu{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
    @media(max-width:900px){.hero{grid-template-columns:1fr;}.main{grid-template-columns:1fr;}.main>div:last-child{order:-1;}.header{padding:20px 20px;}.hero{padding:28px 20px;}.main{padding:0 20px 28px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="orb o1" /><div className="orb o2" />

        {done && (
          <div className="done-overlay">
            <div className="done-box">
              <span className="done-emoji">{config.emoji}</span>
              <div className="done-title">{config.name} Complete!</div>
              <div className="done-sub">
                You crushed <strong>{completedCount} sets</strong> in <strong>{formatTime(timer)}</strong>. 
                Recovery begins now — rest well and fuel up!
              </div>
              <button className="done-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard →</button>
            </div>
          </div>
        )}

        {restActive && restTimer > 0 && (
          <div className="rest-timer">
            <span className="rest-icon">😮‍💨</span>
            <div>
              <div className="rest-label">Rest Timer</div>
              <div className="rest-time">{formatTime(restTimer)}</div>
            </div>
            <button className="rest-skip" onClick={() => { setRestActive(false); setRestTimer(0); }}>Skip</button>
          </div>
        )}

        {/* Header */}
        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <div className="h-right">
            <div className="timer-display" onClick={() => setTimerActive(!timerActive)}>
              {timerActive ? "⏸" : "▶"} {formatTime(timer)}
            </div>
            <button className="tt2" onClick={() => setDark(!dark)}><div className="th">{dark?"🌙":"☀️"}</div></button>
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div>
            <div className="hero-tag">{config.emoji} {config.tag}</div>
            <div className="hero-title" style={{color: config.color}}>{config.name}</div>
            <div className="hero-sub">{config.description}</div>
            <div className="progress-wrap">
              <div className="progress-header">
                <span className="progress-label">{completedCount} of {totalSets} sets completed</span>
                <span className="progress-pct">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{width: `${progress}%`}} />
              </div>
            </div>
          </div>
          <div className="stats-pills">
            {[
              {val: config.exercises.length, lbl: "Exercises"},
              {val: totalSets, lbl: "Total Sets"},
              {val: config.duration, lbl: "Est. Time"},
            ].map((s,i) => (
              <div key={i} className="stat-pill">
                <div className="sp-val" style={{color: config.color}}>{s.val}</div>
                <div className="sp-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="main">
          {/* Exercises */}
          <div>
            {config.exercises.map((ex, ei) => (
              <div key={ei} className={`ex-section ${activeEx === ei ? "active-ex" : ""}`}
                style={{animationDelay: `${ei * 0.06}s`}}>
                <div className="ex-section-header" onClick={() => setActiveEx(activeEx === ei ? -1 : ei)}>
                  <div className="ex-info">
                    <div className="ex-num" style={{background: `${config.color}18`, color: config.color}}>
                      {ei + 1}
                    </div>
                    <div>
                      <div className="ex-name">{ex.name}</div>
                      <div className="ex-meta">{ex.sets.length} sets · {ex.reps} · {ex.rest} rest</div>
                    </div>
                  </div>
                  <span className={`ex-chevron ${activeEx === ei ? "open" : ""}`}>▼</span>
                </div>

                {activeEx === ei && (
                  <div className="ex-sets">
                    {/* Header row */}
                    <div className="set-row" style={{marginBottom: 6}}>
                      <div className="set-label">Set</div>
                      <div className="set-label">Target Reps</div>
                      <div className="set-label">Weight</div>
                      <div className="set-label">Rest</div>
                      <div className="set-label">Done</div>
                    </div>
                    {ex.sets.map((s, si) => {
                      const key = `${ei}-${si}`;
                      const checked = completedSets[key];
                      return (
                        <div key={si} className="set-row">
                          <div className="set-num-badge" style={checked ? {background: config.color+"20", color: config.color} : {}}>{si + 1}</div>
                          <div className="set-info">{s.reps}</div>
                          <div className="set-info">{s.weight}</div>
                          <div className="set-info">{ex.rest}</div>
                          <button className={`set-check ${checked ? "checked" : ""}`} onClick={() => toggleSet(ei, si)} />
                        </div>
                      );
                    })}
                    {ex.tip && (
                      <div className="ex-tip">
                        <strong>💡 Form tip: </strong>{ex.tip}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div>
            <div className="side-card">
              <div className="side-title">Muscles Worked</div>
              {config.muscles.map((m, i) => (
                <div key={i} className="muscle-item">
                  <div className="muscle-dot" style={{background: config.color, boxShadow: `0 0 6px ${config.color}60`}} />
                  <span className="muscle-name">{m.name}</span>
                  <span className="muscle-tag" style={{background: `${config.color}18`, color: config.color}}>
                    {m.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="side-card">
              <div className="side-title">Today's Goal</div>
              {config.goals.map((g, i) => (
                <div key={i} style={{display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom: i < config.goals.length-1 ? `1px solid rgba(255,255,255,0.06)` : "none"}}>
                  <span style={{fontSize:16, flexShrink:0}}>{g.icon}</span>
                  <span style={{fontSize:13, color: T.textSub, lineHeight:1.5}}>{g.text}</span>
                </div>
              ))}
            </div>

            <button className="finish-btn"
              disabled={completedCount === 0}
              onClick={() => { setTimerActive(false); setDone(true); }}>
              Finish {config.name} ✓
            </button>
          </div>
        </div>
      </div>
    </>
  );
}