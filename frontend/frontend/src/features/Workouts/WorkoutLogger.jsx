// src/features/workouts/WorkoutLogger.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import useUserLogs from "../../hooks/useUserLogs";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";
import { addLog, todayKey, addAppNotification, getEffectiveUid } from "../../lib/userLogs";
import { showDonePopup } from "../../components/DonePopup";

const EXERCISE_LIST = [
  "Bench Press", "Squat", "Deadlift", "OHP", "Pull-ups",
  "Barbell Row", "Incline Press", "Leg Press", "RDL", "Dips",
  "Bicep Curl", "Tricep Pushdown", "Lateral Raise", "Face Pulls",
  "Hack Squat", "Leg Curl", "Cable Fly", "Arnold Press",
];

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { authUid, user, updateUser } = useUser();
  const { volumeHistory, todayWorkouts } = useUserLogs(authUid);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExPicker, setShowExPicker] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const addExercise = (name) => {
    setExercises([
      ...exercises,
      { id: Date.now(), name, sets: [{ reps: 10, weight: 20 }] },
    ]);
    setShowExPicker(false);
  };

  const addSet = (exId) => {
    setExercises(exercises.map(ex => ex.id === exId
      ? { ...ex, sets: [...ex.sets, { reps: 10, weight: ex.sets[ex.sets.length - 1]?.weight || 20 }] }
      : ex));
  };

  const removeSet = (exId, setIdx) => {
    setExercises(exercises.map(ex => ex.id === exId
      ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) }
      : ex));
  };

  const updateSet = (exId, setIdx, field, value) => {
    setExercises(exercises.map(ex => ex.id === exId
      ? { ...ex, sets: ex.sets.map((s, i) => i === setIdx ? { ...s, [field]: +value } : s) }
      : ex));
  };

  const removeExercise = (exId) => {
    setExercises(exercises.filter(ex => ex.id !== exId));
  };

  const totalVolume = exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((a, s) => a + (s.reps * s.weight), 0), 0);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const histData = volumeHistory.map((d) =>
    d.key === todayKey() ? { ...d, volume: d.volume + totalVolume } : d);

  const finishWorkout = async () => {
    if (!exercises.length || saving) return;
    setSaving(true);
    setTimerActive(false);
    const duration = timer;
    const effectiveUid = authUid || getEffectiveUid();
    try {
      await addLog(effectiveUid, "workouts", {
        date: todayKey(),
        name: workoutName.trim() || "Workout",
        exercises,
        volume: totalVolume,
        sets: totalSets,
        duration,
        caloriesBurned: Math.round((duration / 60) * 6),
      });
      const nextStreak = (user.streak || 0) < 1 ? 1 : (todayWorkouts.length ? user.streak : (user.streak || 0) + 1);
      try {
        await updateUser({ streak: nextStreak, lastWorkoutAt: todayKey() });
      } catch {}
      try {
        await addAppNotification(effectiveUid, {
          text: `Workout saved: ${workoutName.trim() || "Session"} · ${totalVolume.toLocaleString()} kg volume`,
          type: "workout",
          path: "/workout-logger",
        });
      } catch {}
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification("AshFitVerse", { body: "Workout logged. Great work." }); } catch {}
      }
      setCompleted(true);
      showDonePopup({
        title: "Done!",
        message: `${workoutName.trim() || "Workout"} logged & synced with your Dashboard!`,
        subtext: `${totalSets} sets · ${totalVolume.toLocaleString()} kg volume · ${Math.round(duration / 60)} min`,
        color: "#22c55e",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
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

    .layout{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1200px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}

    /* Left - Logger Elements */
    .workout-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;}
    .workout-name-input{flex:1;height:52px;background:${T.glass};border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;font-size:18px;font-family:${FONT.display};font-weight:800;color:${T.text};outline:none;backdrop-filter:blur(20px);transition:all 0.25s;}
    .workout-name-input:focus{border-color:${T.accent};box-shadow:0 0 0 4px ${T.accent}20;}
    .workout-name-input::placeholder{color:${T.textMuted};}

    .timer-btn{padding:12px 20px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.text};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;display:flex;align-items:center;gap:8px;white-space:nowrap;}
    .timer-btn:hover{border-color:${T.green}35;color:${T.green};}
    .timer-btn.running{border-color:${T.green};color:${T.green};background:${T.green}10;animation:timerPulse 2s ease-in-out infinite;}
    @keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 ${T.green}30;}50%{box-shadow:0 0 0 8px transparent;}}

    .ex-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);margin-bottom:14px;transition:all 0.3s;animation:fu 0.4s ease both;}
    .ex-card:hover{border-color:${T.glassBorderHover};}
    .ex-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
    .ex-name{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};}
    .ex-remove{width:28px;height:28px;border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#f87171;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
    .ex-remove:hover{background:rgba(239,68,68,0.12);}

    .sets-header{display:grid;grid-template-columns:32px 1fr 1fr 32px;gap:8px;margin-bottom:8px;}
    .set-col-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};text-align:center;}
    .set-row{display:grid;grid-template-columns:32px 1fr 1fr 32px;gap:8px;margin-bottom:6px;align-items:center;animation:fu 0.3s ease both;}
    .set-num{width:32px;height:32px;border-radius:8px;background:${T.accent}15;color:${T.accent};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;}
    .set-input{height:36px;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};border:1px solid ${T.glassBorder};border-radius:10px;padding:0 12px;font-size:14px;font-family:${FONT.body};font-weight:600;color:${T.text};outline:none;text-align:center;transition:all 0.2s;width:100%;}
    .set-input:focus{border-color:${T.accent};background:${T.accent}08;}
    .set-remove{width:28px;height:28px;border-radius:8px;border:none;background:transparent;color:${T.textMuted};font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
    .set-remove:hover{color:#f87171;}

    .add-set-btn{width:100%;padding:10px;border-radius:11px;border:1px dashed ${T.glassBorder};background:transparent;color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all 0.22s;margin-top:8px;}
    .add-set-btn:hover{border-color:${T.accent}40;color:${T.accent};}

    .add-ex-btn{width:100%;padding:16px;border-radius:16px;border:1.5px dashed ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;backdrop-filter:blur(20px);}
    .add-ex-btn:hover{border-color:${T.accent}40;color:${T.accent};background:${T.accent}06;}

    /* Exercise picker popup */
    .ex-picker{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);}
    .ex-picker-box{background:${dark?"#0b0f1a":"#ffffff"};border:1px solid ${T.glassBorder};border-radius:24px;padding:28px;width:480px;max-height:70vh;overflow-y:auto;}
    .ex-picker-title{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};margin-bottom:16px;}
    .ex-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .ex-pick-btn{padding:12px 14px;border-radius:12px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all 0.2s;text-align:left;}
    .ex-pick-btn:hover{border-color:${T.accent}35;color:${T.accent};}
    .ex-picker-close{width:100%;margin-top:16px;padding:12px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};}

    /* Finish btn */
    .finish-btn{width:100%;height:56px;border-radius:16px;border:none;background:linear-gradient(135deg,${T.green},${T.accent});color:#fff;font-size:15px;font-weight:800;font-family:${FONT.body};letter-spacing:0.05em;cursor:pointer;transition:all 0.3s;box-shadow:0 8px 28px rgba(16,185,129,0.15);text-transform:uppercase;margin-top:16px;}
    .finish-btn:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(16,185,129,0.25);}

    /* Right sidebar */
    .side-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);margin-bottom:16px;transition:all 0.3s;}
    .side-title{font-family:${FONT.display};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}
    .stat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${T.glassBorder};}
    .stat-row:last-child{border-bottom:none;}
    .stat-key{font-size:13px;color:${T.textSub};}
    .stat-val-s{font-family:${FONT.display};font-size:20px;font-weight:800;}

    /* Success overlay */
    .success-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);}
    .success-box{background:${dark?"#0b0f1a":"#ffffff"};border:1px solid ${T.glassBorder};border-radius:28px;padding:40px;text-align:center;max-width:420px;width:90%;animation:scaleIn 0.5s cubic-bezier(0.4,0,0.2,1) both;}
    .success-icon{font-size:64px;margin-bottom:16px;}
    .success-title{font-family:${FONT.display};font-size:28px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .success-sub{font-size:15px;color:${T.textSub};margin-bottom:28px;}
    .success-btn{width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:${FONT.body};}

    @keyframes fu{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
    @media(max-width:900px){.layout{grid-template-columns:1fr;}.layout>div:last-child{order:-1;}}
    @media(max-width:600px){.layout{padding:20px 16px;}.header{padding:0 16px;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark ? "rgba(7,9,26,0.96)" : "rgba(255,255,255,0.98)", border: `1px solid ${T.glassBorder}`, borderRadius: 14, padding: "12px 16px", fontSize: 12, color: T.text }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ color: T.accent }}><b>{payload[0]?.value?.toLocaleString()} kg</b> volume</div>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.workout} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        {showExPicker && (
          <div className="ex-picker" onClick={() => setShowExPicker(false)}>
            <div className="ex-picker-box" onClick={e => e.stopPropagation()}>
              <div className="ex-picker-title">Add Exercise</div>
              <div className="ex-picker-grid">
                {EXERCISE_LIST.map(e => (
                  <button key={e} className="ex-pick-btn" onClick={() => addExercise(e)}>{e}</button>
                ))}
              </div>
              <button className="ex-picker-close" onClick={() => setShowExPicker(false)}>Cancel</button>
            </div>
          </div>
        )}

        {completed && (
          <div className="success-overlay">
            <div className="success-box">
              <div className="success-icon">🏆</div>
              <div className="success-title">Workout Complete!</div>
              <div className="success-sub">
                You logged <strong>{exercises.length} exercises</strong> and <strong>{totalSets} sets</strong> with a total volume of <strong>{totalVolume.toLocaleString()} kg</strong>. Incredible work!
              </div>
              <button className="success-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard →</button>
            </div>
          </div>
        )}

        {/* HEADER BAR WITH UNIFIED BACK BUTTON */}
        <div className="header">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="layout">
          {/* Left — Logger */}
          <div>
            <div className="workout-header" style={{animation:"fu 0.6s ease both"}}>
              <input className="workout-name-input" value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Workout Name" />
              <button className={`timer-btn ${timerActive?"running":""}`} onClick={() => setTimerActive(!timerActive)}>
                ⏱ {formatTime(timer)}
              </button>
            </div>

            {exercises.length === 0 && (
              <div className="ex-card" style={{ textAlign: "center", color: T.textSub, fontSize: 13 }}>
                No exercises yet. Add your first movement to start logging this session.
              </div>
            )}
            {exercises.map((ex, ei) => (
              <div key={ex.id} className="ex-card" style={{animationDelay:`${ei*0.05}s`}}>
                <div className="ex-header">
                  <div className="ex-name">{ex.name}</div>
                  <button className="ex-remove" onClick={() => removeExercise(ex.id)}>✕</button>
                </div>
                <div className="sets-header">
                  <div className="set-col-label">Set</div>
                  <div className="set-col-label">Reps</div>
                  <div className="set-col-label">Weight (kg)</div>
                  <div />
                </div>
                {ex.sets.map((s, si) => (
                  <div key={si} className="set-row">
                    <div className="set-num">{si + 1}</div>
                    <input className="set-input" type="number" value={s.reps} min={1}
                      onChange={e => updateSet(ex.id, si, "reps", e.target.value)} />
                    <input className="set-input" type="number" value={s.weight} min={0} step={2.5}
                      onChange={e => updateSet(ex.id, si, "weight", e.target.value)} />
                    <button className="set-remove" onClick={() => removeSet(ex.id, si)}>✕</button>
                  </div>
                ))}
                <button className="add-set-btn" onClick={() => addSet(ex.id)}>+ Add Set</button>
              </div>
            ))}

            <button className="add-ex-btn" onClick={() => setShowExPicker(true)} style={{animation:"fu 0.6s ease 0.3s both"}}>
              + Add Exercise
            </button>

            <button className="finish-btn" disabled={!exercises.length || saving} onClick={finishWorkout}>
              {saving ? "Saving…" : "Finish Workout ✓"}
            </button>
          </div>

          {/* Right — Stats */}
          <div style={{animation:"fu 0.6s ease 0.1s both"}}>
            <div className="side-card">
              <div className="side-title">Session Stats</div>
              {[
                { k: "Duration", v: formatTime(timer), c: T.accent },
                { k: "Exercises", v: exercises.length, c: T.purple },
                { k: "Total Sets", v: totalSets, c: T.orange },
                { k: "Total Volume", v: `${totalVolume.toLocaleString()} kg`, c: T.green },
              ].map((s, i) => (
                <div key={i} className="stat-row">
                  <span className="stat-key">{s.k}</span>
                  <span className="stat-val-s" style={{color: s.c}}>{s.v}</span>
                </div>
              ))}
            </div>

            <div className="side-card">
              <div className="side-title">Weekly Volume</div>
              {histData.every(d => !d.volume) && !totalVolume ? (
                <div style={{ fontSize:12, color:T.textMuted, padding:"12px 0" }}>No saved sessions this week yet.</div>
              ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={histData} margin={{top:5,right:5,bottom:0,left:-20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="date" tick={{fill:T.textSub, fontSize:10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:T.textSub, fontSize:10}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="volume" fill={T.accent} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>

            <div className="side-card">
              <div className="side-title">Quick Tips</div>
              {[
                "🔥 Rest 60–90s between sets for hypertrophy",
                "💧 Hydrate — aim for 500ml/hour during training",
                "📈 Progressive overload: add 2.5kg when you hit top rep range",
                "🧘 Don't skip the warm-up sets!",
              ].map((tip, i) => (
                <div key={i} style={{fontSize:12, color:T.textSub, padding:"9px 0", borderBottom: i<3?`1px solid ${T.glassBorder}`:"none", lineHeight:1.5}}>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}