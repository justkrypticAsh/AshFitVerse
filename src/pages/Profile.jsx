// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import useUser from "../hooks/useUser";
import { todayKey, upsertDated } from "../lib/userLogs";
import { showDonePopup } from "../components/DonePopup";
import { generateCSS, FONT } from "../theme";
import { getUserOrders } from "../features/shop/productCatalog";

const GOALS = [
  { id:"muscle",    label:"Muscle Gain",    icon:"💪" },
  { id:"fat_loss",  label:"Fat Loss",       icon:"🔥" },
  { id:"strength",  label:"Strength",       icon:"🏋️" },
  { id:"endurance", label:"Endurance",      icon:"🏃" },
  { id:"general",   label:"General Fitness",icon:"⚡" },
  { id:"wellness",  label:"Wellness",       icon:"🧘" },
];
const ACTIVITY = [
  { id:"sedentary",   label:"Sedentary",   sub:"Little to no movement"  },
  { id:"light",       label:"Light",       sub:"1–3 days/week"          },
  { id:"moderate",    label:"Moderate",    sub:"3–5 days/week"          },
  { id:"active",      label:"Active",      sub:"6–7 days/week"          },
  { id:"very_active", label:"Very Active", sub:"Twice daily"            },
];
const EQUIPMENT = [
  { id:"full_gym",   label:"Full Gym"          },
  { id:"home",       label:"Home / Dumbbells"  },
  { id:"bodyweight", label:"Bodyweight Only"   },
  { id:"resistance", label:"Resistance Bands"  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const {
    user, authUid, updateUser, clearUser, loading,
    bmi, tdee, calorieTarget, isMale, isFemale,
  } = useUser();

  const [mounted,   setMounted]   = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [form,      setForm]      = useState({});
  const [orders,    setOrders]    = useState([]);

  useEffect(() => {
    setMounted(true);
    setOrders(getUserOrders());
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      setOrders(getUserOrders());
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) setForm({ ...user });
  }, [user]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await updateUser(form);
    const effectiveUid = authUid || getEffectiveUid();
    if (form.weight !== "" && form.weight != null) {
      await upsertDated(effectiveUid, "weights", todayKey(), {
        weight: Number(form.weight),
        source: "profile-checkin",
      });
    }
    setSaving(false);
    setSaved(true);
    setEditing(false);
    showDonePopup({
      title: "Done!",
      message: "Profile updated & weight check-in synced with Dashboard!",
      subtext: form.weight ? `Current weight: ${form.weight} kg` : "Profile saved",
      color: "#22c55e",
    });
    setTimeout(() => setSaved(false), 2500);
  };

  const cancel = () => { setForm({ ...user }); setEditing(false); };

  const bmiLabel = !bmi ? "—" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = !bmi ? T.accent : bmi < 18.5 ? T.accent : bmi < 25 ? T.green : bmi < 30 ? T.orange : T.red;

  // Calculate profile completeness
  const checkFields = [user.name, user.bio, user.goal, user.activityLevel, user.equipment];
  const completedFields = checkFields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / checkFields.length) * 100);

  const css = generateCSS(T, dark) + `
    .pr-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.5s ease,background 0.4s;}

    .pr-hd{display:flex;align-items:center;justify-content:space-between;
      padding:0 32px;height:60px;
      background:${dark?"rgba(8,8,12,0.92)":"rgba(255,255,255,0.92)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(40px);position:sticky;top:0;z-index:50;}
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};font-size:13px;font-weight:600;cursor:pointer;
      transition:all 0.15s;font-family:${FONT.body};}
    .pr-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .pr-logo{font-family:${FONT.display};font-size:18px;font-weight:800;letter-spacing:-0.01em;color:${T.text};}
    .pr-logo span{color:${T.accent};}
    .theme-toggle{width:50px;height:27px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};
      cursor:pointer;position:relative;flex-shrink:0;}
    .toggle-thumb{position:absolute;top:2px;width:21px;height:21px;border-radius:50%;
      background:${T.accent};display:flex;align-items:center;justify-content:center;
      font-size:10px;transition:left 0.24s cubic-bezier(0.4,0,0.2,1);
      left:${dark?"26px":"2px"};}

    .pr-page{max-width:820px;margin:0 auto;padding:28px 20px 60px;}

    .gl{
      background:${dark?"linear-gradient(145deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)":"linear-gradient(145deg,rgba(255,255,255,0.88) 0%,rgba(255,255,255,0.65) 100%)"};
      border:1px solid ${T.glassBorder};
      border-radius:22px;
      backdrop-filter:blur(44px) saturate(180%);
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.92)"},0 8px 32px rgba(0,0,0,${dark?"0.28":"0.05"});
      position:relative;overflow:hidden;
    }
    .gl::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.06":"0.40"}) 0%,transparent 40%);
      pointer-events:none;}
    .gl > *{position:relative;z-index:1;}

    /* Hero Banner Header */
    .hero{padding:28px;margin-bottom:16px;animation:fadeUp 0.4s ease both;}
    .av-wrap{position:relative;flex-shrink:0;}
    .av{width:88px;height:88px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:36px;font-weight:800;color:#fff;
      box-shadow:0 0 0 4px ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.9)"},0 0 0 6px ${T.accentGlow},0 10px 30px ${T.accentGlow};}
    .av-gender{position:absolute;bottom:0;right:0;
      width:26px;height:26px;border-radius:50%;font-size:12px;
      background:${dark?"rgba(16,16,20,0.95)":"#fff"};
      border:2px solid ${T.glassBorder};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.15);}

    /* Action Shortcuts */
    .quick-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;animation:fadeUp 0.4s ease 0.04s both;}
    .q-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:15px;
      border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)"};
      color:${T.text};font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.2s;}
    .q-btn:hover{transform:translateY(-2px);border-color:${T.accent}40;background:${T.accentSoft};color:${T.accent};}

    /* Stat Cards */
    .stat-pills{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px;}
    .stat-pill{display:flex;flex-direction:column;align-items:center;padding:12px 14px;border-radius:16px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1px solid ${T.glassBorder};}
    .sp-val{font-family:${FONT.display};font-size:22px;font-weight:800;}
    .sp-lbl{font-size:9.5px;color:${T.textMuted};font-weight:700;letter-spacing:0.10em;text-transform:uppercase;margin-top:4px;}

    /* Progress bar */
    .compl-bar{height:6px;background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"};border-radius:99px;overflow:hidden;margin-top:10px;}
    .compl-fill{height:100%;background:linear-gradient(90deg,${T.accent},${T.purple});border-radius:99px;transition:width 0.4s ease;}

    /* Edit Button */
    .edit-btn{padding:9px 20px;border-radius:12px;font-size:13px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.18s;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"};
      color:${T.text};}
    .edit-btn:hover{border-color:${T.glassBorderHover};}
    .edit-btn.act{background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.accentGlow};}

    /* Tabs */
    .tabs{display:flex;gap:4px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:15px;padding:4px;margin-bottom:16px;
      animation:fadeUp 0.4s ease 0.08s both;}
    .tab-btn{flex:1;padding:10px 6px;border-radius:11px;border:none;background:transparent;
      font-size:13px;font-weight:600;color:${T.textSub};cursor:pointer;
      font-family:${FONT.body};transition:all 0.15s;}
    .tab-btn:hover{color:${T.text};}
    .tab-btn.act{
      background:${dark?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.92)"};
      color:${T.text};font-weight:700;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.95)"},0 2px 8px rgba(0,0,0,${dark?"0.18":"0.06"});}

    .panel{margin-bottom:16px;animation:fadeUp 0.4s ease 0.12s both;}
    .sect{padding:22px 24px;border-bottom:1px solid ${T.glassBorder};}
    .sect:last-child{border-bottom:none;}
    .sect-title{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}

    /* Inputs */
    .pr-inp{height:42px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:11px;padding:0 14px;
      font-size:14px;font-family:${FONT.body};color:${T.text};outline:none;
      transition:border-color 0.15s;text-align:right;}
    .pr-inp:focus{border-color:${T.accent};}

    .bio-inp{width:100%;min-height:90px;
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:12px;
      padding:12px 14px;font-size:13.5px;font-family:${FONT.body};color:${T.text};
      outline:none;resize:none;line-height:1.6;}
    .bio-inp:focus{border-color:${T.accent};}

    /* Grids */
    .goal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}
    .goal-btn{padding:14px 8px;border-radius:14px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.5)"};
      cursor:pointer;font-family:${FONT.body};font-size:12px;font-weight:700;
      color:${T.textSub};text-align:center;transition:all 0.18s;}
    .goal-btn:hover{border-color:${T.glassBorderHover};color:${T.text};}
    .goal-btn.sel{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}

    .metric-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
    .metric-item{padding:16px;border-radius:16px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1px solid ${T.glassBorder};}
    .metric-val{font-family:${FONT.display};font-size:24px;font-weight:800;line-height:1;}
    .metric-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.10em;text-transform:uppercase;margin-top:6px;}

    .save-bar{display:flex;gap:10px;padding:18px 24px;border-top:1px solid ${T.glassBorder};}
    .save-btn{flex:2;height:46px;border-radius:13px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.15s;box-shadow:0 4px 16px ${T.accentGlow};}
    .save-btn:hover{transform:translateY(-1px);}
    .cancel-btn{flex:1;height:46px;border-radius:13px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};font-size:14px;font-weight:600;
      font-family:${FONT.body};cursor:pointer;}

    /* Settings rows */
    .setting-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;}
    .stgl{width:48px;height:26px;border-radius:99px;flex-shrink:0;cursor:pointer;position:relative;border:none;}
    .stgl.on{background:${T.accent};}
    .stgl.off{background:${dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.14)"};}
    .stgl-t{position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left 0.2s ease;}
    .stgl-t.on{left:25px;}
    .stgl-t.off{left:3px;}

    .danger-wrap{border:1px solid ${dark?"rgba(255,69,58,0.20)":"rgba(211,47,47,0.16)"};
      border-radius:18px;overflow:hidden;margin-top:16px;}
    .danger-hd{padding:12px 18px;background:${dark?"rgba(255,69,58,0.06)":"rgba(211,47,47,0.04)"};
      font-size:10px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:${T.red};}
    .danger-body{padding:14px 18px;}
    .danger-btn{padding:9px 18px;border-radius:11px;
      border:1px solid ${dark?"rgba(255,69,58,0.26)":"rgba(211,47,47,0.20)"};
      background:${dark?"rgba(255,69,58,0.09)":"rgba(211,47,47,0.06)"};
      color:${T.red};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};}

    .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      padding:10px 24px;border-radius:99px;background:${T.green};color:#fff;font-size:13px;font-weight:700;
      box-shadow:0 8px 28px rgba(0,0,0,0.20);z-index:9999;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:640px){
      .pr-page{padding:20px 14px 48px;}
      .quick-actions{grid-template-columns:1fr;}
      .goal-grid{grid-template-columns:repeat(2,1fr);}
    }
  `;

  const [settings, setSettings] = useState({ notifications: true, weeklyReport: true, cycleReminders: isFemale });
  const toggleSetting = k => setSettings(s => ({ ...s, [k]: !s[k] }));

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg }}>
        <div style={{ width:30,height:30,border:`3px solid ${T.glassBorder}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      {saved && <div className="toast">✓ Profile Updated Successfully</div>}

      <div className="pr-root">
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* Header */}
        <div className="pr-hd">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="pr-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="pr-page">

          {/* ── HERO BANNER ── */}
          <div className="gl hero">
            <div style={{ display:"flex",alignItems:"flex-start",gap:20 }}>
              <div className="av-wrap">
                <div className="av">{user.name?.[0]?.toUpperCase()||"A"}</div>
                <div className="av-gender">{isFemale?"♀":isMale?"♂":"◎"}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:FONT.display,fontSize:24,fontWeight:800,letterSpacing:"-0.02em",color:T.text,marginBottom:3 }}>
                  {user.name||"Athlete"}
                </div>
                <div style={{ fontSize:12.5,color:T.textMuted,marginBottom:10,fontWeight:600 }}>
                  {user.goal ? `${GOALS.find(g=>g.id===user.goal)?.icon} ${GOALS.find(g=>g.id===user.goal)?.label}` : "Athlete Profile"}
                  {user.goal && user.activityLevel ? " • " : ""}
                  {user.activityLevel ? ACTIVITY.find(a=>a.id===user.activityLevel)?.label : ""}
                </div>

                {!editing ? (
                  user.bio
                    ? <div style={{ fontSize:13.5,color:T.textSub,lineHeight:1.6,fontStyle:"italic" }}>"{user.bio}"</div>
                    : <div style={{ fontSize:12.5,color:T.accent,cursor:"pointer",fontWeight:600 }} onClick={() => { setEditing(true); setActiveTab("profile"); }}>
                        + Add a bio to your profile
                      </div>
                ) : null}
              </div>
              <button className={`edit-btn ${editing?"act":""}`} onClick={() => editing ? cancel() : setEditing(true)}>
                {editing ? "Cancel" : "✏ Edit"}
              </button>
            </div>

            {/* Profile Completion Indicator */}
            <div style={{ marginTop:20,paddingTop:16,borderTop:`1px solid ${T.glassBorder}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:11.5,fontWeight:700,color:T.textMuted }}>
                <span>PROFILE COMPLETENESS</span>
                <span style={{ color:T.accent }}>{completionPercentage}%</span>
              </div>
              <div className="compl-bar">
                <div className="compl-fill" style={{ width:`${completionPercentage}%` }}/>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="stat-pills">
              <div className="stat-pill">
                <div className="sp-val" style={{ color:T.orange }}>🔥 {user.streak||0}</div>
                <div className="sp-lbl">Day Streak</div>
              </div>
              <div className="stat-pill">
                <div className="sp-val" style={{ color:T.green }}>⚡ {user.points||0}</div>
                <div className="sp-lbl">Total Points</div>
              </div>
              <div className="stat-pill">
                <div className="sp-val" style={{ color:T.purple }}>🏆 {user.level||1}</div>
                <div className="sp-lbl">Current Level</div>
              </div>
            </div>
          </div>

          {/* ── QUICK ACTION SHORTCUTS ── */}
          <div className="quick-actions">
            <button className="q-btn" onClick={() => navigate("/community")}>
              <span>📢</span> Create Post
            </button>
            <button className="q-btn" onClick={() => navigate("/dashboard")}>
              <span>🏋️</span> Start Workout
            </button>
            <button className="q-btn" onClick={() => navigate("/dashboard")}>
              <span>🥗</span> Log Meal
            </button>
          </div>

          {/* ── TABS ── */}
          <div className="tabs">
            {[
              { id:"profile",  label:"Profile & Bio" },
              { id:"fitness",  label:"Health Metrics" },
              { id:"orders",   label:"📦 My Orders" },
              { id:"settings", label:"Settings" },
            ].map(t => (
              <button key={t.id} className={`tab-btn ${activeTab===t.id?"act":""}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="gl panel">
              <div className="sect">
                <div className="sect-title">About You</div>
                {editing ? (
                  <>
                    <textarea className="bio-inp"
                      placeholder="Share your fitness journey, goals, or motivational quotes..."
                      value={form.bio||""}
                      maxLength={180}
                      onChange={e => upd("bio", e.target.value)} />
                    <div style={{ fontSize:11,color:T.textMuted,textAlign:"right",marginTop:4 }}>{(form.bio||"").length}/180</div>
                  </>
                ) : (
                  user.bio
                    ? <div style={{ fontSize:14,color:T.textSub,lineHeight:1.7 }}>"{user.bio}"</div>
                    : <div style={{ fontSize:13,color:T.textMuted }}>No bio added yet.</div>
                )}
              </div>

              <div className="sect">
                <div className="sect-title">Display Name</div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:14,fontWeight:600,color:T.text }}>Name</span>
                  {editing
                    ? <input className="pr-inp" value={form.name||""} placeholder="Your name" onChange={e => upd("name",e.target.value)} />
                    : <span style={{ fontSize:14,color:T.textSub,fontWeight:600 }}>{user.name||"—"}</span>
                  }
                </div>
              </div>

              <div className="sect">
                <div className="sect-title">Equipment Access</div>
                {editing ? (
                  <div className="goal-grid">
                    {EQUIPMENT.map(e => (
                      <button key={e.id} className={`goal-btn ${form.equipment===e.id?"sel":""}`} onClick={() => upd("equipment",e.id)}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize:14,color:T.textSub,fontWeight:600 }}>
                    {EQUIPMENT.find(e=>e.id===user.equipment)?.label||"Not Specified"}
                  </div>
                )}
              </div>

              {editing && (
                <div className="save-bar">
                  <button className="cancel-btn" onClick={cancel}>Cancel</button>
                  <button className="save-btn" onClick={save} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
                </div>
              )}
            </div>
          )}

          {/* ── FITNESS TAB ── */}
          {activeTab === "fitness" && (
            <div className="gl panel">
              <div className="sect">
                <div className="sect-title">Primary Goal</div>
                {editing ? (
                  <div className="goal-grid">
                    {GOALS.map(g => (
                      <button key={g.id} className={`goal-btn ${form.goal===g.id?"sel":""}`} onClick={() => upd("goal",g.id)}>
                        <div style={{ fontSize:20,marginBottom:4 }}>{g.icon}</div>
                        <div>{g.label}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:46,height:46,borderRadius:14,background:T.accentSoft,border:`1px solid ${T.accent}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>
                      {GOALS.find(g=>g.id===user.goal)?.icon||"⚡"}
                    </div>
                    <div>
                      <div style={{ fontSize:15,fontWeight:700,color:T.text }}>{GOALS.find(g=>g.id===user.goal)?.label||"Not Set"}</div>
                      <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>Primary training focus</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sect">
                <div className="sect-title">Health Metrics</div>
                <div className="metric-grid">
                  {[
                    { label:"BMI Status", val:bmi?`${bmi}`:"—", sub:bmiLabel, color:bmiColor },
                    { label:"Daily Target", val:calorieTarget?`${calorieTarget}`:"—", sub:"kcal/day", color:T.green },
                    { label:"Maintenance (TDEE)", val:tdee?`${tdee}`:"—", sub:"kcal/day", color:T.accent },
                    { label:"Activity Level", val:ACTIVITY.find(a=>a.id===user.activityLevel)?.label||"—", sub:"", color:T.purple },
                  ].map((m,i) => (
                    <div key={i} className="metric-item">
                      <div className="metric-val" style={{ color:m.color }}>{m.val}</div>
                      <div className="metric-lbl">{m.label}</div>
                      {m.sub && <div style={{ fontSize:11,color:T.textSub,marginTop:2 }}>{m.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {editing && (
                <div className="save-bar">
                  <button className="cancel-btn" onClick={cancel}>Cancel</button>
                  <button className="save-btn" onClick={save} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
                </div>
              )}
            </div>
          )}


          {/* ── MY ORDERS TAB ── */}
          {activeTab === "orders" && (
            <div className="gl panel">
              <div className="sect">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div className="sect-title" style={{ marginBottom: 2 }}>📦 My Orders & Purchase History</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>
                      Products you ordered or purchased via Amazon Prime through AshFitVerse
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: T.accentSoft, color: T.accent }}>
                    {orders.length} Item{orders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", borderRadius: 16, background: dark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: `1px solid ${T.glassBorder}` }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🛍️</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>No orders tracked yet</div>
                    <div style={{ fontSize: 12.5, color: T.textMuted, maxWidth: 420, margin: "6px auto 18px", lineHeight: 1.5 }}>
                      When you click "Buy on Amazon" for any product across our shops, it will be automatically recorded here for instant re-ordering and authentic review publishing!
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <button className="q-btn" onClick={() => navigate("/shop")}>
                        <span>🛒</span> Common Shop
                      </button>
                      <button className="q-btn" onClick={() => navigate("/male-health")}>
                        <span>⚡</span> Men's Hub
                      </button>
                      <button className="q-btn" onClick={() => navigate("/female-health")}>
                        <span>🌸</span> Women's Hub
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {orders.map((o, idx) => (
                      <div
                        key={o.orderId || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: 16,
                          background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
                          border: `1px solid ${T.glassBorder}`,
                          gap: 14,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 260px" }}>
                          <img
                            src={o.image || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=100&q=80"}
                            alt={o.name}
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: 12,
                              objectFit: "contain",
                              background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                              padding: 4,
                            }}
                          />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase" }}>
                              {o.brand}
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.3, margin: "2px 0 4px" }}>
                              {o.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: T.textMuted }}>
                              <span style={{ fontWeight: 800, color: "#10b981" }}>{o.price}</span>
                              <span>•</span>
                              <span>{o.timestamp ? new Date(o.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</span>
                              <span>•</span>
                              <span style={{ color: "#3b82f6", fontWeight: 700 }}>🚚 Amazon Prime</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                          <button
                            className="q-btn"
                            onClick={() => navigate(`/shop/product/${o.productId}#reviews-section`)}
                            title="Write a verified in-app review"
                            style={{ padding: "7px 12px", fontSize: 12 }}
                          >
                            <span>⭐</span> Write Review
                          </button>
                          <button
                            className="q-btn"
                            onClick={() => navigate(`/shop/product/${o.productId}`)}
                            style={{ padding: "7px 12px", fontSize: 12, background: T.accentSoft, color: T.accent }}
                          >
                            <span>📦</span> Buy Again ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <>
              <div className="gl panel">
                <div className="sect">
                  <div className="sect-title">Preferences</div>
                  <div className="setting-row">
                    <div>
                      <div style={{ fontSize:14,fontWeight:600,color:T.text }}>Dark Mode</div>
                      <div style={{ fontSize:11.5,color:T.textMuted,marginTop:2 }}>Toggle light/dark visual theme</div>
                    </div>
                    <button className={`stgl ${dark?"on":"off"}`} onClick={toggleTheme}>
                      <div className={`stgl-t ${dark?"on":"off"}`}/>
                    </button>
                  </div>
                </div>

                <div className="sect">
                  <div className="sect-title">Notifications</div>
                  {[
                    { k:"notifications", l:"Push Notifications", s:"Workout reminders and streak alerts" },
                    { k:"weeklyReport",  l:"Weekly Reports", s:"Progress summary delivered every Monday" },
                  ].map(item => (
                    <div key={item.k} className="setting-row">
                      <div>
                        <div style={{ fontSize:14,fontWeight:600,color:T.text }}>{item.l}</div>
                        <div style={{ fontSize:11.5,color:T.textMuted,marginTop:2 }}>{item.s}</div>
                      </div>
                      <button className={`stgl ${settings[item.k]?"on":"off"}`} onClick={() => toggleSetting(item.k)}>
                        <div className={`stgl-t ${settings[item.k]?"on":"off"}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="danger-wrap">
                <div className="danger-hd">Account Options</div>
                <div className="danger-body" style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:600,color:T.text }}>Sign Out</div>
                    <div style={{ fontSize:11.5,color:T.textMuted,marginTop:1 }}>Log out of your current session</div>
                  </div>
                  <button className="danger-btn" onClick={() => { clearUser(); navigate("/"); }}>Sign Out</button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
