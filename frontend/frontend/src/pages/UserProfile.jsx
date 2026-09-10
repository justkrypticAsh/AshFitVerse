// src/pages/UserProfile.jsx
// Public profile page — view any user's profile
// Route: /user/:uid
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { generateCSS, FONT } from "../theme";
import { db, auth } from "../firebase";
import {
  doc, onSnapshot, collection, query, orderBy, limit,
} from "firebase/firestore";

const GOALS = [
  { id:"muscle",    label:"Muscle Gain",    icon:"💪" },
  { id:"fat_loss",  label:"Fat Loss",       icon:"🔥" },
  { id:"strength",  label:"Strength",       icon:"🏋️" },
  { id:"endurance", label:"Endurance",      icon:"🏃" },
  { id:"general",   label:"General Fitness",icon:"⚡" },
  { id:"wellness",  label:"Wellness",       icon:"🧘" },
];

const ACTIVITY = [
  { id:"sedentary",   label:"Sedentary"  },
  { id:"light",       label:"Light"      },
  { id:"moderate",    label:"Moderate"   },
  { id:"active",      label:"Active"     },
  { id:"very_active", label:"Very Active"},
];

export default function UserProfile() {
  const { uid: targetUid } = useParams();
  const navigate            = useNavigate();
  const { dark, toggleTheme, T } = useTheme();

  const myUid = auth.currentUser?.uid;

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts,   setPosts]   = useState([]);

  const isMe = myUid === targetUid;

  useEffect(() => { setMounted(true); }, []);

  // Real-time profile listener
  useEffect(() => {
    if (!targetUid) return;
    const unsub = onSnapshot(doc(db, "users", targetUid), snap => {
      if (snap.exists()) {
        setProfile({ uid: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [targetUid]);

  // Real-time posts by this user
  useEffect(() => {
    if (!targetUid) return;
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(12)
    );
    const unsub = onSnapshot(q, snap => {
      setPosts(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.uid === targetUid)
      );
    }, () => {});
    return () => unsub();
  }, [targetUid]);

  const openDM = () => {
    navigate(`/community?dm=${targetUid}`);
  };

  function timeAgo(ts) {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  const POST_TYPE_COLOR = {
    workout:"#0a84ff", diet:"#30d158", pr:"#bf5af2", wellness:"#ff375f", milestone:"#ff9f0a",
  };
  const POST_TYPE_LABEL = {
    workout:"💪 Workout", diet:"🥗 Nutrition", pr:"🏆 PR", wellness:"🧘 Wellness", milestone:"🏅 Milestone",
  };

  const css = generateCSS(T, dark) + `
    .up-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.5s ease,background 0.4s;}

    .up-hd{display:flex;align-items:center;justify-content:space-between;
      padding:0 32px;height:56px;
      background:${dark?"rgba(8,8,12,0.92)":"rgba(255,255,255,0.92)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(40px);position:sticky;top:0;z-index:50;}
    .up-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};font-size:13px;font-weight:500;cursor:pointer;
      font-family:${FONT.body};transition:all 0.15s;}
    .up-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .up-logo{font-family:${FONT.display};font-size:17px;font-weight:800;letter-spacing:-0.01em;color:${T.text};}
    .up-logo span{color:${T.accent};}
    .theme-toggle{width:50px;height:27px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:21px;height:21px;border-radius:50%;
      background:${T.accent};display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left 0.24s cubic-bezier(0.4,0,0.2,1);left:${dark?"26px":"2px"};}

    /* Page */
    .up-page{max-width:700px;margin:0 auto;padding:32px 20px 60px;}

    /* Glass */
    .gl{
      background:${dark?"linear-gradient(145deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)":"linear-gradient(145deg,rgba(255,255,255,0.84) 0%,rgba(255,255,255,0.62) 100%)"};
      border:1px solid ${T.glassBorder};border-radius:20px;
      backdrop-filter:blur(40px) saturate(180%);
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.92)"},0 4px 20px rgba(0,0,0,${dark?"0.22":"0.06"});
      position:relative;overflow:hidden;
    }
    .gl::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.07":"0.40"}) 0%,transparent 40%);
      pointer-events:none;}
    .gl > *{position:relative;z-index:1;}

    /* Hero */
    .hero{padding:28px;margin-bottom:14px;animation:fadeUp 0.4s ease both;}

    /* Avatar */
    .av{width:80px;height:80px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:30px;font-weight:800;color:#fff;
      box-shadow:0 0 0 3px ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.9)"},0 0 0 5px ${T.accentGlow},0 8px 20px ${T.accentGlow};}

    /* Online badge */
    .online-badge{display:inline-flex;align-items:center;gap:5px;
      padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;
      background:${dark?"rgba(48,209,88,0.10)":"rgba(48,209,88,0.08)"};
      border:1px solid rgba(48,209,88,0.22);color:#30d158;}
    .g-dot{width:7px;height:7px;border-radius:50%;background:#30d158;
      box-shadow:0 0 6px #30d158;animation:gpulse 2s ease infinite;}
    @keyframes gpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.85);}}

    /* Stat pills */
    .stat-pills{display:flex;gap:9px;margin-top:16px;flex-wrap:wrap;}
    .stat-pill{display:flex;flex-direction:column;align-items:center;
      padding:9px 16px;border-radius:12px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};min-width:100px;}
    .sp-v{font-family:${FONT.display};font-size:19px;font-weight:800;color:${T.text};}
    .sp-l{font-size:9px;color:${T.textMuted};font-weight:700;letter-spacing:0.10em;text-transform:uppercase;margin-top:3px;}

    /* Action buttons */
    .action-row{display:flex;gap:9px;margin-top:18px;}
    .dm-btn{width:100%;height:42px;border-radius:11px;
      border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13.5px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.15s;
      box-shadow:0 4px 14px ${T.accentGlow};}
    .dm-btn:hover{transform:translateY(-2px);}

    /* Fitness section */
    .section{padding:20px 22px;border-bottom:1px solid ${T.glassBorder};}
    .section:last-child{border-bottom:none;}
    .sect-title{font-size:9.5px;font-weight:700;letter-spacing:0.14em;
      text-transform:uppercase;color:${T.textMuted};margin-bottom:13px;}

    /* Goal card */
    .goal-card{display:flex;align-items:center;gap:12px;padding:12px 14px;
      border-radius:13px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1px solid ${T.glassBorder};}
    .goal-icon{width:42px;height:42px;border-radius:12px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:20px;
      background:${T.accentSoft};border:1px solid ${T.accent}20;}

    /* Chips */
    .chip-row{display:flex;gap:7px;flex-wrap:wrap;}
    .chip{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;
      border-radius:99px;font-size:11.5px;font-weight:700;
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};
      border:1px solid ${T.glassBorder};color:${T.textSub};}

    /* Posts */
    .posts-card{margin-bottom:14px;animation:fadeUp 0.4s ease 0.12s both;}
    .post-item{padding:18px 22px;border-bottom:1px solid ${T.glassBorder};
      transition:background 0.15s;cursor:default;}
    .post-item:last-child{border-bottom:none;}
    .post-item:hover{background:${dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)"}}
    .post-strip{height:2px;width:100%;margin-bottom:12px;border-radius:99px;}
    .post-type-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
      border-radius:99px;font-size:10px;font-weight:800;margin-bottom:9px;}
    .post-text{font-size:13.5px;color:${T.text};line-height:1.72;letter-spacing:-0.006em;margin-bottom:10px;}
    .post-meta{display:flex;align-items:center;gap:14px;font-size:11.5px;color:${T.textMuted};}

    /* Empty */
    .empty{text-align:center;padding:36px 0;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(13px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:600px){.up-page{padding:18px 12px 48px;}.action-row{flex-direction:column;}.stat-pills{gap:6px;}}
  `;

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg }}>
        <div>
          <div style={{ width:28,height:28,border:`3px solid ${T.glassBorder}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px" }}/>
          <div style={{ fontSize:13,color:T.textMuted,textAlign:"center" }}>Loading profile…</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  if (!profile) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,flexDirection:"column",gap:12 }}>
        <div style={{ fontSize:36 }}>🔍</div>
        <div style={{ fontSize:15,fontWeight:700,color:T.text }}>User not found</div>
        <button onClick={() => navigate(-1)} style={{ padding:"8px 18px",borderRadius:10,border:`1px solid ${T.glassBorder}`,background:T.glass,color:T.textSub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT.body }}>
          ← Go back
        </button>
      </div>
    </>
  );

  const goalInfo     = GOALS.find(g => g.id === profile.goal);
  const activityInfo = ACTIVITY.find(a => a.id === profile.activityLevel);

  return (
    <>
      <style>{css}</style>
      <div className="up-root">
        <div className="orb orb-1"/><div className="orb orb-2"/>

        {/* Header */}
        <div className="up-hd">
          <button className="up-back" onClick={() => navigate(-1)}>← Back</button>
          <div className="up-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="up-page">

          {/* ── HERO ── */}
          <div className="gl hero">
            {/* Top row */}
            <div style={{ display:"flex",alignItems:"flex-start",gap:18,marginBottom:14 }}>
              <div className="av">{profile.name?.[0]?.toUpperCase()||"A"}</div>
              <div style={{ flex:1 }}>
                {/* Name */}
                <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4 }}>
                  <div style={{ fontFamily:FONT.display,fontSize:22,fontWeight:800,letterSpacing:"-0.02em",color:T.text }}>
                    {profile.name||"Athlete"}
                  </div>
                  {isMe && (
                    <span style={{ fontSize:10,fontWeight:800,color:T.accent,background:T.accentSoft,padding:"2px 8px",borderRadius:99,border:`1px solid ${T.accent}25` }}>
                      You
                    </span>
                  )}
                </div>

                {/* Online status */}
                {profile.online
                  ? <div className="online-badge"><div className="g-dot"/>Online now</div>
                  : <div style={{ fontSize:11,color:T.textMuted }}>Last seen {timeAgo(profile.lastSeen)}</div>
                }

                {/* Goal + activity chips */}
                <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginTop:9 }}>
                  {goalInfo && (
                    <span className="chip" style={{ color:T.accent,borderColor:`${T.accent}25`,background:T.accentSoft }}>
                      {goalInfo.icon} {goalInfo.label}
                    </span>
                  )}
                  {activityInfo && (
                    <span className="chip">{activityInfo.label} Active</span>
                  )}
                  {profile.sex && (
                    <span className="chip">
                      {profile.sex==="female"?"♀ Female":profile.sex==="male"?"♂ Male":"◎"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div style={{ fontSize:13.5,color:T.textSub,lineHeight:1.7,fontStyle:"italic",
                padding:"12px 14px",borderRadius:12,
                background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",
                border:`1px solid ${T.glassBorder}`,marginBottom:14 }}>
                "{profile.bio}"
              </div>
            )}

            {/* Stats */}
            <div className="stat-pills">
              {[
                { v:profile.streak||0,   l:"Streak 🔥",  c:T.orange  },
                { v:posts.length,         l:"Posts",     c:T.green   },
              ].map((s,i) => (
                <div key={i} className="stat-pill">
                  <div className="sp-v" style={{ color:s.c }}>{s.v}</div>
                  <div className="sp-l">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Direct Message button */}
            {!isMe && (
              <div className="action-row">
                <button className="dm-btn" onClick={openDM}>💬 Send Direct Message</button>
              </div>
            )}

            {/* Edit Profile button */}
            {isMe && (
              <div style={{ marginTop:16 }}>
                <button onClick={() => navigate("/profile")}
                  style={{ width:"100%",padding:"10px",borderRadius:12,
                    border:`1px solid ${T.glassBorder}`,
                    background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
                    color:T.text,fontSize:13.5,fontWeight:700,
                    cursor:"pointer",fontFamily:FONT.body,transition:"all 0.15s" }}>
                  ✏ Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* ── FITNESS INFO ── */}
          <div className="gl" style={{ marginBottom:14,animation:"fadeUp 0.4s ease 0.06s both" }}>
            {/* Goal */}
            <div className="section">
              <div className="sect-title">Fitness Goal</div>
              {goalInfo ? (
                <div className="goal-card">
                  <div className="goal-icon">{goalInfo.icon}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:T.text }}>{goalInfo.label}</div>
                    <div style={{ fontSize:11.5,color:T.textMuted,marginTop:2 }}>Primary goal</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:13,color:T.textMuted }}>No goal set</div>
              )}
            </div>

            {/* Activity */}
            {activityInfo && (
              <div className="section">
                <div className="sect-title">Activity Level</div>
                <div className="goal-card">
                  <div className="goal-icon" style={{ background:T.greenSoft,borderColor:`${T.green}20` }}>⚡</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:T.text }}>{activityInfo.label}</div>
                    <div style={{ fontSize:11.5,color:T.textMuted,marginTop:2 }}>Activity frequency</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── POSTS ── */}
          <div className="gl posts-card">
            <div style={{ padding:"16px 22px",borderBottom:`1px solid ${T.glassBorder}` }}>
              <div style={{ fontFamily:FONT.display,fontSize:15,fontWeight:800,color:T.text }}>
                Posts <span style={{ fontFamily:FONT.body,fontSize:12,fontWeight:600,color:T.textMuted,marginLeft:6 }}>
                  {posts.length}
                </span>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize:32,marginBottom:8 }}>📢</div>
                <div style={{ fontSize:13.5,fontWeight:700,color:T.text }}>No posts yet</div>
                <div style={{ fontSize:12,color:T.textMuted,marginTop:4 }}>
                  {isMe ? "Share your first post in FitVerse!" : `${profile.name?.split(" ")[0]||"This athlete"} hasn't posted yet`}
                </div>
              </div>
            ) : (
              posts.map((p) => {
                const color = POST_TYPE_COLOR[p.type] || "#0a84ff";
                const label = POST_TYPE_LABEL[p.type] || "💪 Workout";
                return (
                  <div key={p.id} className="post-item">
                    <div className="post-strip" style={{ background:`linear-gradient(90deg,${color},${color}55)` }}/>
                    <div className="post-type-pill" style={{ background:`${color}14`,color,border:`1px solid ${color}24` }}>
                      {label}
                    </div>
                    <div className="post-text">{p.content}</div>
                    <div className="post-meta">
                      <span>❤️ {(p.likes||[]).length} likes</span>
                      <span>·</span>
                      <span>{timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
  );
}