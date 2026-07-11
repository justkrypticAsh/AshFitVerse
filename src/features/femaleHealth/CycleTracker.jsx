// src/features/femaleHealth/CycleTracker.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT, BG_IMAGES } from "../../theme";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const SYMPTOMS = [
  "Cramps","Bloating","Headache","Fatigue","Mood swings",
  "Breast tenderness","Acne","Back pain","Cravings","Spotting",
  "Heavy flow","Light flow","Nausea","Insomnia","Anxiety",
];

const FLOW_LEVELS = [
  {id:"none",  label:"None",   icon:"⚪", color:"#888"},
  {id:"spot",  label:"Spotting",icon:"🔸",color:"#fb923c"},
  {id:"light", label:"Light",  icon:"🔴", color:"#fca5a5"},
  {id:"medium",label:"Medium", icon:"🔴", color:"#f87171"},
  {id:"heavy", label:"Heavy",  icon:"🔴", color:"#ef4444"},
];

const MOODS = [
  {id:"happy",   icon:"😊", label:"Happy"},
  {id:"okay",    icon:"😐", label:"Okay"},
  {id:"sad",     icon:"😔", label:"Sad"},
  {id:"irritable",icon:"😤",label:"Irritable"},
  {id:"anxious", icon:"😰", label:"Anxious"},
  {id:"energetic",icon:"⚡",label:"Energetic"},
];

// Compute phase for a given day in cycle
function getPhase(cycleDay, cycleLen=28) {
  if (cycleDay <= 5)                      return { name:"Menstrual",  color:"#f472b6", abbr:"M" };
  if (cycleDay <= Math.round(cycleLen*0.46)) return { name:"Follicular", color:"#4f8ef7", abbr:"F" };
  if (cycleDay <= Math.round(cycleLen*0.57)) return { name:"Ovulation",  color:"#fbbf24", abbr:"O" };
  return                                       { name:"Luteal",     color:"#a78bfa", abbr:"L" };
}

export default function CycleTracker() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isFemale, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(null); // Date object
  const [logs, setLogs]           = useState(() => {
    try { return JSON.parse(localStorage.getItem("ashfitverse_cycle_logs") || "{}"); } catch { return {}; }
  });
  const [logForm, setLogForm] = useState({ flow:"none", mood:"", symptoms:[], notes:"" });

  useEffect(() => { setMounted(true);},[]);useEffect(() => {
  if (!loading && !isFemale) navigate("/dashboard");
}, [loading, isFemale]); 
  useEffect(() => { localStorage.setItem("ashfitverse_cycle_logs", JSON.stringify(logs)); }, [logs]);

  const cycleLen = parseInt(user.cycleLength) || 28;
  const lastPeriod = user.lastPeriod ? new Date(user.lastPeriod) : null;

  // Get cycle day for a date
  const getCycleDay = (date) => {
    if (!lastPeriod) return null;
    const diff = Math.floor((date - lastPeriod) / 86400000);
    if (diff < 0) return null;
    return (diff % cycleLen) + 1;
  };

  // Get predicted period dates for next 6 months
  const getPredictedPeriods = () => {
    if (!lastPeriod) return [];
    const periods = [];
    for (let i = 0; i <= 6; i++) {
      const start = new Date(lastPeriod);
      start.setDate(start.getDate() + i * cycleLen);
      for (let d = 0; d < 5; d++) {
        const pd = new Date(start);
        pd.setDate(pd.getDate() + d);
        periods.push(pd.toDateString());
      }
    }
    return periods;
  };

  // Get predicted ovulation dates
  const getPredictedOvulation = () => {
    if (!lastPeriod) return [];
    const ovDates = [];
    for (let i = 0; i <= 6; i++) {
      const ov = new Date(lastPeriod);
      ov.setDate(ov.getDate() + i * cycleLen + Math.round(cycleLen * 0.5));
      for (let d = -1; d <= 1; d++) {
        const od = new Date(ov);
        od.setDate(od.getDate() + d);
        ovDates.push(od.toDateString());
      }
    }
    return ovDates;
  };

  const predictedPeriods   = getPredictedPeriods();
  const predictedOvulation = getPredictedOvulation();

  // Calendar grid
  const buildCalendar = () => {
    const first = new Date(viewYear, viewMonth, 1);
    const last  = new Date(viewYear, viewMonth + 1, 0);
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  };

  const cells = buildCalendar();
  const dateKey = (d) => d?.toISOString().split("T")[0];
  const selKey  = selected ? dateKey(selected) : null;

  const getDayStyle = (date) => {
    if (!date) return {};
    const ds = date.toDateString();
    const isToday   = ds === today.toDateString();
    const isSel     = ds === selected?.toDateString();
    const isPeriod  = predictedPeriods.includes(ds);
    const isOv      = predictedOvulation.includes(ds);
    const hasLog    = logs[dateKey(date)];
    const cd        = getCycleDay(date);
    const phase     = cd ? getPhase(cd, cycleLen) : null;

    return { isToday, isSel, isPeriod, isOv, hasLog, phase, cd };
  };

  const saveLog = () => {
    if (!selected) return;
    setLogs(l => ({ ...l, [selKey]: { ...logForm, date: selKey } }));
    setLogForm({ flow:"none", mood:"", symptoms:[], notes:"" });
  };

  const toggleSym = (s) =>
    setLogForm(f => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x=>x!==s) : [...f.symptoms, s] }));

  const selLog = selKey ? logs[selKey] : null;

  // Stats
  const allLogs    = Object.values(logs);
  const periodDays = allLogs.filter(l => l.flow && l.flow !== "none").length;
  const heavyDays  = allLogs.filter(l => l.flow === "heavy").length;

  const css = generateCSS(T, dark) + `
    .ct-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .ct-bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
    .ct-bg img{width:100%;height:100%;object-fit:cover;
      opacity:${dark?"0.04":"0.05"};filter:grayscale(60%) blur(2px);}

    .ct-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.pink};border-color:${T.pink}40;}
    .ct-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .ct-logo span{color:${T.pink};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .ct-content{max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .ct-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .ct-sub{font-size:14px;color:${T.textSub};margin-bottom:28px;}

    .ct-layout{display:grid;grid-template-columns:1.3fr 1fr;gap:20px;}

    /* Calendar */
    .cal-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:24px;backdrop-filter:blur(28px);}
    .cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
    .cal-month{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .cal-nav-btn{width:36px;height:36px;border-radius:10px;border:1px solid ${T.glassBorder};
      background:${T.glass};color:${T.textSub};font-size:16px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
    .cal-nav-btn:hover{border-color:${T.pink}40;color:${T.pink};}

    .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
    .cal-day-header{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
      color:${T.textMuted};text-align:center;padding:6px 0;}
    .cal-cell{aspect-ratio:1;border-radius:10px;display:flex;flex-direction:column;
      align-items:center;justify-content:center;cursor:pointer;position:relative;
      transition:all 0.2s;font-size:13px;font-weight:600;color:${T.textSub};}
    .cal-cell:hover{background:${T.glass};color:${T.text};}
    .cal-cell.today{border:2px solid ${T.accent};color:${T.accent};}
    .cal-cell.selected{background:${T.pink};color:#fff!important;border-color:${T.pink};}
    .cal-cell.period{background:${T.pinkSoft};color:${T.pink};}
    .cal-cell.ovulation{background:${T.goldSoft};color:${T.gold};}
    .cal-cell.has-log::after{content:'';position:absolute;bottom:4px;width:4px;height:4px;
      border-radius:50%;background:${T.green};}
    .cal-cell.phase-m{background:rgba(244,114,182,0.1);}
    .cal-cell.phase-f{background:rgba(79,142,247,0.08);}
    .cal-cell.phase-o{background:rgba(251,191,36,0.1);}
    .cal-cell.phase-l{background:rgba(167,139,250,0.08);}

    /* Legend */
    .legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px;padding-top:16px;
      border-top:1px solid ${T.glassBorder};}
    .legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:${T.textMuted};font-weight:600;}
    .legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

    /* Stats row */
    .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;}
    .stat-mini{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:14px;
      padding:14px;text-align:center;backdrop-filter:blur(20px);}
    .sm-val{font-family:${FONT.display};font-size:24px;font-weight:800;}
    .sm-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:3px;}

    /* Right panel */
    .log-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);height:fit-content;}
    .log-title{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};margin-bottom:16px;}
    .log-date{font-size:13px;color:${T.pink};font-weight:700;margin-bottom:20px;}

    .log-section{margin-bottom:18px;}
    .ls-label{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:10px;display:block;}

    .flow-grid{display:flex;gap:7px;flex-wrap:wrap;}
    .flow-btn{padding:8px 12px;border-radius:10px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:12px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.2s;font-family:${FONT.body};}
    .flow-btn.active{border-color:${T.pink};background:${T.pinkSoft};color:${T.pink};}

    .mood-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
    .mood-btn{padding:10px 6px;border-radius:11px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;transition:all 0.2s;text-align:center;font-family:${FONT.body};}
    .mood-btn:hover{transform:translateY(-2px);}
    .mood-btn.active{border-color:${T.purple};background:${T.purpleSoft};}
    .mood-ico{font-size:20px;display:block;margin-bottom:4px;}
    .mood-lbl{font-size:10px;font-weight:700;color:${T.textSub};}

    .sym-grid{display:flex;gap:6px;flex-wrap:wrap;}
    .sym-chip{padding:6px 12px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:11px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.2s;font-family:${FONT.body};}
    .sym-chip.active{background:${T.pinkSoft};border-color:${T.pink};color:${T.pink};}

    .notes-input{width:100%;height:72px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:12px 16px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;resize:none;transition:all 0.25s;}
    .notes-input:focus{border-color:${T.pink};background:${T.pinkSoft};}
    .notes-input::placeholder{color:${T.textMuted};}

    .save-btn{width:100%;height:48px;border-radius:13px;border:none;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      color:#fff;font-size:13px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 6px 20px ${T.pinkGlow};margin-top:4px;}
    .save-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px ${T.pinkGlow};}

    .no-sel{text-align:center;padding:40px 20px;color:${T.textSub};}
    .no-sel-icon{font-size:48px;margin-bottom:12px;}

    /* Predictions */
    .pred-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);margin-top:20px;}
    .pred-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13px;}
    .pred-row:last-child{border-bottom:none;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:900px){.ct-layout{grid-template-columns:1fr;}.stats-row{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:600px){.ct-content{padding:20px 16px;}.ct-header{padding:18px 20px;}.stats-row{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="ct-root">
        <div className="ct-bg"><img src={BG_IMAGES.community} alt="" loading="lazy" /></div>
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 65%)"}} />
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)"}} />

        <div className="ct-header">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button className="back-btn" onClick={() => navigate("/female-health")}>← Women's Health</button>
            <div className="ct-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="ct-content">
          <div className="ct-title" style={{animation:"fadeUp 0.6s ease both"}}>📅 Cycle Tracker</div>
          <div className="ct-sub" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>
            Log your period, track symptoms and predict your next cycle. All data is private and stored on your device.
          </div>

          <div className="ct-layout" style={{animation:"fadeUp 0.6s ease 0.1s both"}}>
            {/* Calendar */}
            <div>
              <div className="cal-card">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => {
                    if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); }
                    else setViewMonth(m=>m-1);
                  }}>‹</button>
                  <div className="cal-month">{MONTHS[viewMonth]} {viewYear}</div>
                  <button className="cal-nav-btn" onClick={() => {
                    if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); }
                    else setViewMonth(m=>m+1);
                  }}>›</button>
                </div>

                <div className="cal-grid">
                  {DAYS_SHORT.map(d => <div key={d} className="cal-day-header">{d}</div>)}
                  {cells.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const { isToday, isSel, isPeriod, isOv, hasLog, phase, cd } = getDayStyle(date);
                    let cls = "cal-cell";
                    if (isToday)   cls += " today";
                    if (isSel)     cls += " selected";
                    else if (isPeriod)   cls += " period";
                    else if (isOv)       cls += " ovulation";
                    else if (phase?.abbr === "M") cls += " phase-m";
                    else if (phase?.abbr === "F") cls += " phase-f";
                    else if (phase?.abbr === "O") cls += " phase-o";
                    else if (phase?.abbr === "L") cls += " phase-l";
                    if (hasLog)    cls += " has-log";

                    return (
                      <div key={i} className={cls} onClick={() => {
                        setSelected(date);
                        const ex = logs[dateKey(date)];
                        if (ex) setLogForm({flow:ex.flow||"none",mood:ex.mood||"",symptoms:ex.symptoms||[],notes:ex.notes||""});
                        else    setLogForm({flow:"none",mood:"",symptoms:[],notes:""});
                      }}>
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>

                <div className="legend">
                  {[
                    {color:T.pink,label:"Period"},
                    {color:T.gold,label:"Ovulation window"},
                    {color:"#4f8ef7",label:"Follicular"},
                    {color:"#a78bfa",label:"Luteal"},
                    {color:T.green,label:"Logged"},
                  ].map((l,i) => (
                    <div key={i} className="legend-item">
                      <div className="legend-dot" style={{background:l.color}} />
                      {l.label}
                    </div>
                  ))}
                </div>

                <div className="stats-row">
                  {[
                    {val:cycleLen,lbl:"Cycle Length",color:T.pink},
                    {val:periodDays,lbl:"Days Logged",color:T.purple},
                    {val:heavyDays,lbl:"Heavy Days",color:T.orange},
                  ].map((s,i) => (
                    <div key={i} className="stat-mini">
                      <div className="sm-val" style={{color:s.color}}>{s.val}</div>
                      <div className="sm-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming predictions */}
              <div className="pred-card">
                <div style={{fontFamily:FONT.display,fontSize:14,fontWeight:700,
                  letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,marginBottom:14}}>
                  Upcoming Predictions
                </div>
                {lastPeriod ? (
                  Array.from({length:3}).map((_,i) => {
                    const nextPeriod = new Date(lastPeriod);
                    nextPeriod.setDate(nextPeriod.getDate() + (i+1)*cycleLen);
                    const nextOv = new Date(lastPeriod);
                    nextOv.setDate(nextOv.getDate() + (i+1)*cycleLen + Math.round(cycleLen*0.5));
                    const daysUntil = Math.floor((nextPeriod - today)/86400000);
                    return (
                      <div key={i} className="pred-row">
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:T.text}}>
                            Cycle {i+1} — Period
                          </div>
                          <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>
                            Ovulation ~{nextOv.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:800,color:T.pink}}>
                            {nextPeriod.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </div>
                          <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>
                            {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? "Today" : `${Math.abs(daysUntil)} days ago`}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{fontSize:13,color:T.textMuted,textAlign:"center",padding:"20px 0"}}>
                    Set your last period date in onboarding to see predictions
                  </div>
                )}
              </div>
            </div>

            {/* Log panel */}
            <div className="log-card">
              {selected ? (
                <>
                  <div className="log-title">Log for {selected.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>

                  {selLog && (
                    <div style={{padding:"10px 14px",borderRadius:12,background:T.greenSoft,
                      border:`1px solid ${T.green}30`,fontSize:12,color:T.green,marginBottom:16,fontWeight:600}}>
                      ✓ Existing log — editing
                    </div>
                  )}

                  <div className="log-section">
                    <span className="ls-label">Flow Level</span>
                    <div className="flow-grid">
                      {FLOW_LEVELS.map(f => (
                        <button key={f.id} className={`flow-btn ${logForm.flow===f.id?"active":""}`}
                          onClick={() => setLogForm(lf=>({...lf,flow:f.id}))}>
                          {f.icon} {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="log-section">
                    <span className="ls-label">Mood</span>
                    <div className="mood-grid">
                      {MOODS.map(m => (
                        <button key={m.id} className={`mood-btn ${logForm.mood===m.id?"active":""}`}
                          onClick={() => setLogForm(lf=>({...lf,mood:m.id}))}>
                          <span className="mood-ico">{m.icon}</span>
                          <span className="mood-lbl">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="log-section">
                    <span className="ls-label">Symptoms</span>
                    <div className="sym-grid">
                      {SYMPTOMS.map(s => (
                        <button key={s} className={`sym-chip ${logForm.symptoms.includes(s)?"active":""}`}
                          onClick={() => toggleSym(s)}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="log-section">
                    <span className="ls-label">Notes</span>
                    <textarea className="notes-input" placeholder="Any notes for today..."
                      value={logForm.notes} onChange={e => setLogForm(lf=>({...lf,notes:e.target.value}))} />
                  </div>

                  <button className="save-btn" onClick={saveLog}>Save Log ✓</button>
                </>
              ) : (
                <div className="no-sel">
                  <div className="no-sel-icon">📅</div>
                  <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:6}}>Select a date</div>
                  <div style={{fontSize:13}}>Tap any date on the calendar to log your symptoms, flow and mood</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}