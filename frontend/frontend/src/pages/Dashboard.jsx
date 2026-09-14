// src/pages/Dashboard.jsx — AshFitVerse v5.1
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import useTheme from "../hooks/usetheme";
import useUser  from "../hooks/useUser";
import useUserLogs from "../hooks/useUserLogs";
import useAppNotifications from "../hooks/useAppNotifications";
import { todayKey } from "../lib/userLogs";
import { generateCSS, FONT } from "../theme";
import QuickActionsModal from "../components/QuickActionsModal";
import WeightLogModal from "../components/WeightLogModal";
import FeedbackModal from "../components/FeedbackModal";
import { getDefaultQuickActions, QA_THEMES, sanitizeActionsForUser } from "../config/quickActionsCatalog";

// ─── Workout plans ────────────────────────────────────────────────────────────
function getWorkouts(goal, equipment) {
  const plans = {
    muscle: {
      full_gym: [
        { name:"Chest & Triceps",  exercises:"Bench Press · Incline DB · Cable Fly · Tricep Dip",  tag:"Push",      color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
        { name:"Back & Biceps",    exercises:"Deadlift · Pull-ups · Barbell Row · Preacher Curl",   tag:"Pull",      color:"#a78bfa", emoji:"🏋️", path:"/workout/back"  },
        { name:"Legs & Glutes",    exercises:"Squat · Leg Press · RDL · Hip Thrust",                tag:"Legs",      color:"#fb923c", emoji:"🦵", path:"/workout/legs"  },
        { name:"Shoulders & Core", exercises:"OHP · Lateral Raise · Face Pull · Plank",             tag:"Shoulders", color:"#34d399", emoji:"🔥", path:"/workout/core"  },
      ],
      home: [
        { name:"Push Power",  exercises:"Push-ups · Pike Push-up · Diamond Push-up", tag:"Push",   color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
        { name:"Pull & Row",  exercises:"Door Rows · Towel Pull · Superman Hold",    tag:"Pull",   color:"#a78bfa", emoji:"🏋️", path:"/workout/back"  },
        { name:"Legs & Core", exercises:"Squat · Lunge · Glute Bridge · Plank",      tag:"Legs",   color:"#fb923c", emoji:"🦵", path:"/workout/legs"  },
        { name:"Full Body",   exercises:"Burpees · Mountain Climber · Jump Squat",   tag:"Cardio", color:"#34d399", emoji:"🔥", path:"/workout/core"  },
      ],
      bodyweight: [
        { name:"Calisthenics A", exercises:"Pull-ups · Dips · L-sit · Ring Row",          tag:"Strength", color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
        { name:"Calisthenics B", exercises:"Pistol Squat · Nordic Curl · Box Jump",        tag:"Legs",     color:"#a78bfa", emoji:"🦵", path:"/workout/legs"  },
        { name:"Core Power",     exercises:"Dragon Flag · Ab Wheel · Hollow Hold",          tag:"Core",     color:"#fb923c", emoji:"🔥", path:"/workout/core"  },
        { name:"Skill Work",     exercises:"Handstand · Planche Progression · Human Flag", tag:"Skill",    color:"#34d399", emoji:"🏆", path:"/workout/chest" },
      ],
    },
    fat_loss: { full_gym: [
      { name:"HIIT Circuit",   exercises:"Burpee · Box Jump · Battle Rope · KB Swing",         tag:"HIIT",  color:"#f472b6", emoji:"🔥", path:"/workout/core"  },
      { name:"Metabolic Push", exercises:"DB Press · Push-up · Overhead Tricep · Dips",        tag:"Push",  color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
      { name:"Metabolic Pull", exercises:"Cable Row · Lat Pull · Curl · Face Pull",            tag:"Pull",  color:"#a78bfa", emoji:"🏋️", path:"/workout/back"  },
      { name:"Lower Burn",     exercises:"Goblet Squat · Step-up · Walking Lunge · Jump Rope", tag:"Legs",  color:"#fb923c", emoji:"🦵", path:"/workout/legs"  },
    ]},
    strength: { full_gym: [
      { name:"Squat Day",    exercises:"Back Squat · Front Squat · Pause Squat · Leg Press", tag:"Squat", color:"#fb923c", emoji:"🏋️", path:"/workout/legs"  },
      { name:"Bench Day",    exercises:"Flat Bench · Close Grip · Board Press · Dips",       tag:"Bench", color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
      { name:"Deadlift Day", exercises:"Conventional DL · Romanian DL · Good Morning",       tag:"Hinge", color:"#a78bfa", emoji:"🦾", path:"/workout/back"  },
      { name:"OHP Day",      exercises:"Overhead Press · Push Press · Lateral Raise",        tag:"Press", color:"#34d399", emoji:"🔥", path:"/workout/chest" },
    ]},
    endurance: { full_gym: [
      { name:"Long Run",      exercises:"45-60 min easy pace · Zone 2 HR",    tag:"Cardio",   color:"#34d399", emoji:"🏃", path:"/workout/legs"  },
      { name:"Tempo Run",     exercises:"20 min at threshold pace",            tag:"Tempo",    color:"#4f8ef7", emoji:"⚡", path:"/workout/legs"  },
      { name:"Cross Train",   exercises:"Cycling · Swimming · Row Machine",    tag:"XT",       color:"#a78bfa", emoji:"🚴", path:"/workout/core"  },
      { name:"Strength Base", exercises:"Squats · Lunges · Hip Thrust · Core", tag:"Strength", color:"#fb923c", emoji:"💪", path:"/workout/legs"  },
    ]},
    wellness: { full_gym: [
      { name:"Mind-Muscle",  exercises:"Slow Bench · Cable Fly · Breathing Squat", tag:"Mind-Muscle", color:"#a78bfa", emoji:"🧘", path:"/workout/chest" },
      { name:"Yoga + Lift",  exercises:"Sun Salutation · KB Swing · Farmer Carry", tag:"Balance",     color:"#34d399", emoji:"🌿", path:"/workout/core"  },
      { name:"Mobility Day", exercises:"Hip Opener · Shoulder Roll · Spine Flow",  tag:"Mobility",    color:"#f472b6", emoji:"🌸", path:"/workout/core"  },
      { name:"Active Rest",  exercises:"Walk · Light Swim · Stretching",           tag:"Recovery",    color:"#fb923c", emoji:"☀️", path:"/workout/legs"  },
    ]},
    general: { full_gym: [
      { name:"Chest Day",  exercises:"Bench Press · Incline Fly · Cable Cross", tag:"Push", color:"#4f8ef7", emoji:"💪", path:"/workout/chest" },
      { name:"Back Day",   exercises:"Deadlift · Pull-ups · Barbell Row",       tag:"Pull", color:"#a78bfa", emoji:"🏋️", path:"/workout/back"  },
      { name:"Leg Day",    exercises:"Squats · Leg Press · Romanian DL",        tag:"Legs", color:"#fb923c", emoji:"🦵", path:"/workout/legs"  },
      { name:"Core & Abs", exercises:"Planks · Dragon Flag · Russian Twist",    tag:"Core", color:"#34d399", emoji:"🔥", path:"/workout/core"  },
    ]},
  };
  const goalPlan = plans[goal] || plans.general;
  return goalPlan[equipment] || goalPlan.full_gym || goalPlan[Object.keys(goalPlan)[0]];
}

function useScrollReveal() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold:0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0 }) {
  const [ref, v] = useScrollReveal();
  return (
    <div ref={ref} style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(24px)", transition:`opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return { text:"Good morning",  period:"Morning",  icon:"🌅" };
  if (hour >= 12 && hour < 17) return { text:"Good afternoon", period:"Afternoon", icon:"☀️" };
  if (hour >= 17 && hour < 21) return { text:"Good evening",   period:"Evening",   icon:"🌆" };
  return { text:"Good night", period:"Night", icon:"🌙" };
}

// ─── Slang motivational lines ─────────────────────────────────────────────────
const SLANGS = [
  "No days off. The squad is watching. 👀",
  "Your future self is counting reps right now. 💀",
  "Cry in the gym. Flex everywhere else. 😤",
  "You didn't come this far to only come this far. 🔥",
  "It's giving gains. Period. 💅",
  "Main character energy — in the gym and out. 🎬",
  "Bro split or no split, just show up. 🏋️",
  "The bar doesn't care about your excuses. It only goes up. ⬆️",
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, authUid, clearUser, loading, isMale, isFemale, bmi, calorieTarget, getCycleDay, getPhaseName, isPro, isAdmin, updateUser } = useUser();
  const { ready: logsReady, weeklyWeight, calData, todayCalories, todayMacros, mealGroups, streak: liveStreak, workouts, weights, todayWorkouts } = useUserLogs(authUid);
  const { items: notifications, unread: unreadNotifications, markRead, markAllRead, requestPermission } = useAppNotifications(authUid);

  const [mounted,     setMounted]     = useState(false);
  const [activeNav,   setActiveNav]   = useState("Dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [customActions, setCustomActions] = useState(() => {
    try {
      const stored = localStorage.getItem("ashfitverse_custom_qa");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  });
  const [qaThemeId, setQaThemeId] = useState(() => {
    return localStorage.getItem("ashfitverse_qa_theme") || "cyan";
  });
  const [slangIdx,    setSlangIdx]    = useState(0);
  const [now,         setNow]         = useState(() => new Date());
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      window.__updateUser = updateUser;
      window.__user = user;
    }
  }, [user, updateUser]);
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);
  useEffect(() => {
    const fn = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  // Rotate slang every 8 seconds
  useEffect(() => {
    const iv = setInterval(() => setSlangIdx(i => (i+1) % SLANGS.length), 8000);
    return () => clearInterval(iv);
  }, []);

  const calGoal    = calorieTarget || 2000;
  const macroTotal = todayMacros.protein + todayMacros.carbs + todayMacros.fats;
  const MACROS = macroTotal ? [
    { name:"Protein", value:Math.round(todayMacros.protein / macroTotal * 100), fill:"#4f8ef7" },
    { name:"Carbs", value:Math.round(todayMacros.carbs / macroTotal * 100), fill:"#a78bfa" },
    { name:"Fats", value:Math.round(todayMacros.fats / macroTotal * 100), fill:"#fb923c" },
  ] : [];
  const recordedWeights = weights.filter((w) => Number.isFinite(Number(w.weight))).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const firstWeight = recordedWeights[0]?.weight;
  const currentWeight = recordedWeights.at(-1)?.weight ?? user.weight;
  const targetWeight = Number(user.targetWeight);
  const startWeight = Number(firstWeight);
  const currentWeightNumber = Number(currentWeight);
  const weightProgress = startWeight && targetWeight && currentWeightNumber
    ? Math.max(0, Math.min(100, Math.round(Math.abs(currentWeightNumber - startWeight) / Math.abs(targetWeight - startWeight || 1) * 100)))
    : 0;
  const cycleDay   = isFemale ? getCycleDay() : null;
  const cycleLen   = parseInt(user.cycleLength) || 28;
  const bmiColor   = !bmi ? T.accent : bmi<18.5 ? T.accent : bmi<25 ? T.green : T.orange;
  const bmiLabel   = !bmi ? "—" : bmi<18.5 ? "Underweight" : bmi<25 ? "Healthy ✓" : bmi<30 ? "Overweight" : "Obese";

  const checklist = [
    { done:!!user.weight&&!!user.height&&!!user.age, text:"Complete body stats",          path:"/profile"        },
    { done:!!user.goal,                              text:"Set primary fitness goal",     path:"/onboarding"     },
    { done:!!user.activityLevel,                     text:"Set activity level",           path:"/profile"        },
    { done:!!user.equipment,                         text:"Choose equipment access",      path:"/profile"        },
    { done:liveStreak>=3,                            text:"Achieve 3-day workout streak", path:"/workout-logger" },
    { done:todayCalories>0,                          text:"Log a meal today",             path:"/diet-logger"    },
    { done:workouts.length>0,                        text:"Complete your first workout",  path:"/workout-logger" },
  ];
  const checkDone = checklist.filter(c=>c.done).length;
  const checkPct  = Math.round((checkDone/checklist.length)*100);

  const greeting   = getGreeting(now.getHours());
  const firstName  = user.name?.split(" ")[0] || "Athlete";
  const dateLabel  = now.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const timeLabel  = now.toLocaleTimeString("en-IN", { hour:"numeric", minute:"2-digit", hour12:true });
  const goalLabel  = user.goal?.replace(/_/g," ") || "General fitness";

  // Sidebar nav — "Community" → "FitVerse"
  const NAV_MAIN = [
    { label:"Dashboard", icon:"⊞", path:null },
    { label:"FitVerse",  icon:"◎", path:"/community", badge:"3" },
    ...(isFemale?[{label:"Women's Health",icon:"♀",path:"/female-health",color:"#f472b6"}]:[]),
    ...(isMale  ?[{label:"Men's Health",  icon:"♂",path:"/male-health",  color:"#4f8ef7"}]:[]),
    ...(isAdmin ?[{label:"Admin Console", icon:"🛡️",path:"/admin", badge:"ADMIN", color:"#38bdf8"}]:[]),
  ];
  const TOOL_SECTIONS = [
    {
      title:"Track",
      items:[
        { label:"Workout Logger", icon:"📝", path:"/workout-logger" },
        { label:"Diet Logger",    icon:"🥗", path:"/diet-logger"    },
      ],
    },
    {
      title:"Plan",
      items:[
        { label:"Workout Planner", icon:"📋", path:"/workout-planner" },
        { label:"Diet Plan",       icon:"🍱", path:"/diet-plan"       },
      ],
    },
    {
      title:"Calculate",
      items:[
        { label:"BMI",      icon:"📏", path:"/bmi-calculator"     },
        { label:"Calories", icon:"🔥", path:"/calorie-calculator" },
        { label:"Body Fat", icon:"📊", path:"/fat-calculator"     },
      ],
    },
    {
      title:"More",
      items:[
        { label:"Shop", icon:"🛒", path: "/shop" },
        { label:"Rate & Feedback", icon:"💬", path: null, action: "feedback" },
      ],
    },
  ];

  const currentActions = sanitizeActionsForUser(customActions, user);
  const currentQaTheme = QA_THEMES.find((t) => t.id === qaThemeId) || QA_THEMES[0];

  const handleSaveQuickActions = ({ actions, themeId }) => {
    const sanitized = sanitizeActionsForUser(actions, user);
    setCustomActions(sanitized);
    setQaThemeId(themeId);
    try {
      localStorage.setItem("ashfitverse_custom_qa", JSON.stringify(sanitized));
      localStorage.setItem("ashfitverse_qa_theme", themeId);
    } catch {}
  };

  const BG        = dark ? T.bg       : "#F5F0E8";
  const SB_BG     = dark ? "rgba(7,8,15,0.97)"   : "rgba(252,248,242,0.98)";
  const GB        = dark ? "linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))" : "linear-gradient(160deg,rgba(255,252,245,0.84),rgba(255,248,235,0.62))";
  const GB_BORDER = dark ? T.glassBorder : "rgba(180,160,130,0.18)";
  const GB_TOP    = dark ? "rgba(255,255,255,0.18)" : "rgba(255,252,245,0.90)";

  const css = generateCSS(T, dark) + `
    .dr{min-height:100vh;display:flex;font-family:${FONT.body};background:${BG};color:${T.text};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s;}

    .o1{top:-18%;left:-10%;width:800px;height:800px;background:radial-gradient(circle,${dark?"rgba(79,142,247,0.07)":"rgba(200,170,120,0.10)"} 0%,transparent 65%);animation:oF1 24s ease-in-out infinite;}
    .o2{bottom:-20%;right:-12%;width:700px;height:700px;background:radial-gradient(circle,${dark?"rgba(167,139,250,0.06)":"rgba(180,145,100,0.08)"} 0%,transparent 65%);animation:oF2 30s ease-in-out infinite;}
    @keyframes oF1{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,-35px);}}
    @keyframes oF2{0%,100%{transform:translate(0,0);}50%{transform:translate(-50px,-40px);}}

    .gl{background:${GB};border:1px solid ${GB_BORDER};
      backdrop-filter:blur(56px) saturate(200%);-webkit-backdrop-filter:blur(56px) saturate(200%);
      box-shadow:inset 0 1.5px 0 ${GB_TOP},inset 0 -1px 0 rgba(0,0,0,${dark?"0.06":"0.03"}),
        0 4px 24px rgba(0,0,0,${dark?"0.22":"0.07"}),0 20px 56px rgba(0,0,0,${dark?"0.32":"0.05"});
      position:relative;overflow:hidden;}
    .gl::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
      background:linear-gradient(128deg,rgba(255,255,255,${dark?"0.09":"0.48"}) 0%,transparent 28%),
                 linear-gradient(308deg,rgba(255,255,255,${dark?"0.04":"0.26"}) 0%,transparent 22%);}
    .gl>*{position:relative;z-index:1;}

    /* ══════════════════════════════════════════════
       SIDEBAR
    ══════════════════════════════════════════════ */
    .sb{
      width:240px;min-height:100vh;flex-shrink:0;
      position:sticky;top:0;height:100vh;
      overflow-y:auto;overflow-x:hidden;z-index:20;
      background:${SB_BG};
      border-right:1px solid ${GB_BORDER};
      backdrop-filter:blur(50px) saturate(180%);
      display:flex;flex-direction:column;
      padding:0 0 18px;
      transition:background 0.5s;
    }
    .sb::-webkit-scrollbar{width:0;}

    .sb-strip{
      height:3px;width:100%;flex-shrink:0;
      background:linear-gradient(90deg,${T.accent},${T.purple},#f472b6);
    }

    .sb-head{
      padding:22px 20px 18px;
      border-bottom:1px solid ${GB_BORDER};
      position:relative;
    }
    .sb-logo{
      font-family:${FONT.display};font-size:21px;font-weight:800;
      letter-spacing:-0.02em;color:${T.text};line-height:1;
    }
    .sb-logo span{color:${T.accent};}
    .sb-tagline{
      font-size:9px;color:${T.textMuted};letter-spacing:0.18em;
      text-transform:uppercase;font-weight:600;margin-top:3px;
    }

    .sb-user-card{
      margin:14px 12px 0;
      padding:12px 13px;
      border-radius:16px;
      background:${dark?"linear-gradient(135deg,rgba(79,142,247,0.10),rgba(167,139,250,0.06))":"linear-gradient(135deg,rgba(79,142,247,0.08),rgba(167,139,250,0.04))"};
      border:1px solid ${T.accent}22;
      display:flex;align-items:center;gap:10px;cursor:pointer;
      transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
      position:relative;
      min-width:0;
    }
    .sb-user-card::before{
      content:'';position:absolute;inset:0;border-radius:16px;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.08":"0.45"}) 0%,transparent 50%);
      pointer-events:none;z-index:0;
    }
    .sb-user-card>*{position:relative;z-index:1;}
    .sb-user-card:hover{
      transform:translateY(-2px);
      border-color:${T.accent}40;
      box-shadow:0 8px 28px ${T.accentGlow}22;
    }
    .sb-ava{
      width:38px;height:38px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:800;color:#fff;
      border:2px solid rgba(255,255,255,${dark?"0.18":"0.60"});
      box-shadow:0 0 0 3px ${T.accentGlow}30,0 4px 14px ${T.accentGlow};
    }
    .sb-user-info{
      min-width:0;flex:1;overflow:hidden;
    }
    .sb-name{
      font-size:13px;font-weight:700;color:${T.text};
      letter-spacing:-0.01em;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .sb-goal-tag{
      display:inline-flex;align-items:center;gap:4px;
      margin-top:4px;padding:2px 8px;border-radius:99px;
      background:${T.accentSoft};font-size:9.5px;font-weight:700;
      color:${T.accent};text-transform:capitalize;
      max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }

    .sb-streak{
      margin:10px 12px 0;
      padding:9px 14px;border-radius:12px;
      background:${dark?"rgba(251,146,60,0.09)":"rgba(200,130,50,0.07)"};
      border:1px solid rgba(251,146,60,0.20);
      display:flex;align-items:center;gap:8px;
      font-size:12px;font-weight:800;color:${T.orange};
    }
    .sb-streak-bar{
      flex:1;height:4px;background:${dark?"rgba(251,146,60,0.15)":"rgba(200,130,50,0.12)"};
      border-radius:99px;overflow:hidden;
    }
    .sb-streak-fill{
      height:100%;background:${T.orange};border-radius:99px;
      transition:width 1.5s cubic-bezier(0.4,0,0.2,1);
    }

    .sb-sec{
      font-size:9px;font-weight:800;letter-spacing:0.20em;text-transform:uppercase;
      color:${T.textMuted};padding:16px 20px 5px;
    }

    .sb-ni{
      display:flex;align-items:center;gap:10px;
      margin:1px 8px;padding:10px 12px;border-radius:13px;
      cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};
      transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      border:1px solid transparent;position:relative;
    }
    .sb-ni:hover{
      color:${T.text};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,252,245,0.80)"};
      border-color:${GB_BORDER};
    }
    .sb-ni.na{
      background:linear-gradient(135deg,${T.accentSoft},${T.purpleSoft});
      color:${T.accent};border-color:${T.accent}25;font-weight:700;
      box-shadow:0 3px 14px ${T.accentGlow}22,inset 0 1px 0 rgba(255,255,255,${dark?"0.14":"0.65"});
    }
    .sb-ni.na::after{
      content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
      width:3px;height:60%;background:${T.accent};border-radius:0 3px 3px 0;
    }
    .sb-ni-ico{font-size:16px;width:20px;text-align:center;flex-shrink:0;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);}
    .sb-ni:hover .sb-ni-ico{transform:scale(1.15);}
    .sb-ni-txt{flex:1;white-space:nowrap;}
    .sb-badge{
      padding:1px 7px;background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;border-radius:99px;font-size:9px;font-weight:800;
    }

    .sb-div{height:1px;background:linear-gradient(90deg,transparent,${GB_BORDER},transparent);margin:8px 12px;}

    .sb-ti{
      display:flex;align-items:center;gap:9px;
      margin:0 8px 1px;padding:8px 12px;border-radius:10px;
      cursor:pointer;font-size:12px;font-weight:500;color:${T.textSub};
      transition:all 0.18s;
    }
    .sb-ti:hover{
      color:${T.text};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,252,245,0.70)"};
    }
    .sb-ti-ico{font-size:13px;width:18px;text-align:center;flex-shrink:0;transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);}
    .sb-ti:hover .sb-ti-ico{transform:scale(1.15);}
    .sb-tool-sec{
      font-size:8.5px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;
      color:${T.textMuted};padding:10px 20px 3px;margin-top:2px;
    }

    .sb-footer{margin-top:auto;padding-top:8px;}
    .sb-pro-card{
      margin:0 12px 10px;
      padding:14px 14px 12px;
      border-radius:16px;
      background:${dark
        ?"linear-gradient(160deg,rgba(79,142,247,0.14),rgba(167,139,250,0.10))"
        :"linear-gradient(160deg,rgba(79,142,247,0.10),rgba(167,139,250,0.07))"};
      border:1px solid ${T.accent}28;
      position:relative;overflow:hidden;
      box-shadow:0 4px 20px ${T.accentGlow}18;
    }
    .sb-pro-card::before{
      content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;
      border-radius:50%;background:radial-gradient(circle,${T.purple}30,transparent 70%);
      pointer-events:none;
    }
    .sb-pro-card::after{
      content:'';position:absolute;inset:0;border-radius:16px;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.06":"0.40"}) 0%,transparent 50%);
      pointer-events:none;
    }
    .sb-pro-card>*{position:relative;z-index:1;}
    .sb-pro-tag{
      display:inline-block;padding:3px 8px;border-radius:6px;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      font-size:8px;font-weight:800;letter-spacing:0.12em;color:#fff;
      margin-bottom:8px;
    }
    .sb-pro-title{
      font-family:${FONT.display};font-size:14px;font-weight:800;
      color:${T.text};line-height:1.2;margin-bottom:4px;
    }
    .sb-pro-desc{
      font-size:10.5px;color:${T.textSub};line-height:1.45;margin-bottom:12px;
    }
    .sb-pro-cta{
      width:100%;padding:10px 0;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:12px;font-weight:800;font-family:${FONT.body};
      cursor:pointer;transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 4px 16px ${T.accentGlow};
      display:block;text-align:center;line-height:1;
    }
    .sb-pro-cta:hover{
      transform:translateY(-2px);
      box-shadow:0 8px 24px ${T.accentGlow};
      filter:brightness(1.06);
    }
    .sb-pro-cta:active{transform:translateY(0);}
    .sb-pro-note{
      margin-top:8px;font-size:9.5px;color:${T.textMuted};
      text-align:center;line-height:1.3;
    }

    .sb-out{
      margin:0 12px;
      padding:10px 14px;border-radius:12px;
      border:1px solid ${dark?"rgba(255,69,58,0.16)":"rgba(220,60,50,0.12)"};
      background:${dark?"rgba(255,69,58,0.06)":"rgba(255,69,58,0.04)"};
      color:${T.red};font-size:12px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.22s;
      display:flex;align-items:center;gap:8px;
    }
    .sb-out:hover{background:${dark?"rgba(255,69,58,0.14)":"rgba(220,60,50,0.10)"};transform:translateY(-2px);border-color:${T.red}35;}

    /* ── MAIN ── */
    .mn{flex:1;overflow-y:auto;padding:32px 36px 60px;position:relative;z-index:1;}

    /* ── TOPBAR — elevated stacking context for absolute popups ── */
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;
      padding:20px 26px;border-radius:22px;margin-bottom:32px;
      background:${GB};border:1px solid ${GB_BORDER};
      backdrop-filter:blur(50px) saturate(180%);
      box-shadow:inset 0 1.5px 0 ${GB_TOP},0 4px 20px rgba(0,0,0,${dark?"0.16":"0.05"});
      animation:fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
      position:relative;z-index:80;overflow:visible;}
    .topbar::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.04":"0.35"}) 0%,transparent 42%);}
    .tb-left{position:relative;z-index:1;min-width:0;flex:1;}
    .tb-meta-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
    .tb-period{
      display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;
      background:${T.accentSoft};border:1px solid ${T.accent}22;
      font-size:10px;font-weight:800;letter-spacing:0.10em;text-transform:uppercase;color:${T.accent};
    }
    .tb-clock{
      font-size:11px;font-weight:700;color:${T.textSub};font-variant-numeric:tabular-nums;
      padding:4px 10px;border-radius:99px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${GB_BORDER};
    }
    .tb-title{font-family:${FONT.display};font-size:24px;font-weight:800;color:${T.text};letter-spacing:-0.03em;line-height:1.15;}
    .tb-title span{color:${T.accent};}
    .tb-sub-row{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap;}
    .tb-sub{font-size:12.5px;color:${T.textSub};font-weight:500;}
    .tb-dot{color:${T.textMuted};font-size:10px;}
    .tb-goal-pill{
      font-size:10.5px;font-weight:700;color:${T.accent};text-transform:capitalize;
      padding:2px 9px;border-radius:99px;background:${T.accentSoft};border:1px solid ${T.accent}18;
    }
    .tb-right{display:flex;align-items:center;gap:10px;position:relative;z-index:2;flex-shrink:0;}
    .streak-pill{display:flex;align-items:center;gap:6px;padding:7px 15px;border-radius:99px;
      background:${dark?"rgba(251,146,60,0.10)":"rgba(200,130,50,0.09)"};
      border:1px solid ${dark?"rgba(251,146,60,0.22)":"rgba(200,130,50,0.20)"};
      font-size:12px;font-weight:800;color:${T.orange};}
    .tb-btn{width:38px;height:38px;border-radius:12px;border:1px solid ${GB_BORDER};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,252,245,0.72)"};
      backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;
      font-size:14px;cursor:pointer;color:${T.textSub};
      transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);}
    .tb-btn:hover{color:${T.accent};border-color:${T.accent}40;transform:scale(1.08);}
    .tb-notif-wrap{position:relative;}
    .tb-notif-dot{position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:${T.red};border:2px solid ${dark?"#12131b":"#fff"};}
    .tb-notif-panel{position:absolute;top:calc(100% + 10px);right:0;width:320px;max-height:360px;overflow:auto;z-index:210;
      background:${dark?"rgba(16,17,25,0.98)":"rgba(255,255,255,0.98)"};border:1px solid ${GB_BORDER};border-radius:17px;
      box-shadow:0 16px 46px rgba(0,0,0,${dark?"0.42":"0.15"});backdrop-filter:blur(36px);}
    .tb-notif-head{display:flex;justify-content:space-between;align-items:center;padding:13px 14px;border-bottom:1px solid ${GB_BORDER};}
    .tb-notif-item{padding:11px 14px;border-bottom:1px solid ${GB_BORDER};cursor:pointer;font-size:12px;color:${T.textSub};line-height:1.45;}
    .tb-notif-item:hover,.tb-notif-item.unread{background:${T.accentSoft};color:${T.text};}
    .tb-toggle{width:50px;height:27px;border-radius:99px;border:1px solid ${GB_BORDER};
      background:${dark?"rgba(255,255,255,0.07)":"rgba(255,252,245,0.80)"};
      cursor:pointer;position:relative;flex-shrink:0;}
    .tb-knob{position:absolute;top:3px;left:${dark?"26px":"3px"};width:21px;height:21px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left 0.35s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 2px 8px ${T.accentGlow};}

    .tb-admin-btn{
      display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:12px;
      background:linear-gradient(135deg,rgba(56,189,248,0.18),rgba(99,102,241,0.22));
      border:1px solid rgba(56,189,248,0.45);
      color:#38bdf8;font-size:12px;font-weight:800;font-family:${FONT.body};
      cursor:pointer;transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 4px 18px rgba(56,189,248,0.25);
    }
    .tb-admin-btn:hover{
      transform:translateY(-2px);
      border-color:#38bdf8;
      box-shadow:0 6px 24px rgba(56,189,248,0.40);
      filter:brightness(1.1);
    }
    .tb-admin-pulse{
      width:7px;height:7px;border-radius:50%;background:#38bdf8;
      box-shadow:0 0 10px #38bdf8;animation:adminPulse 1.8s infinite;
    }
    @keyframes adminPulse{
      0%,100%{transform:scale(1);opacity:0.7;}
      50%{transform:scale(1.4);opacity:1;}
    }
    .tb-feedback-btn{
      display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:12px;
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,252,245,0.85)"};
      border:1px solid ${GB_BORDER};
      color:${T.text};font-size:12px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    }
    .tb-feedback-btn:hover{
      border-color:${T.accent}45;color:${T.accent};
      transform:translateY(-1px);
      box-shadow:0 4px 14px ${T.accentGlow}15;
    }
    .cc-tile.admin-tile{
      background:linear-gradient(135deg,rgba(56,189,248,0.20),rgba(99,102,241,0.22));
      border-color:rgba(56,189,248,0.45);
    }
    .cc-tile.admin-tile .cc-tl{color:#38bdf8;}
    
    /* Profile Popup layer override */
    .pf-wrap{position:relative;z-index:9999;}
    .pf-ava{width:38px;height:38px;border-radius:50%;cursor:pointer;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:800;color:#fff;border:2px solid ${T.accent}45;
      box-shadow:0 0 0 2px ${T.accentGlow}35,0 4px 14px ${T.accentGlow};
      transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);}
    .pf-ava:hover{transform:scale(1.10);}
    .cc{position:absolute;top:calc(100%+12px);right:0;width:290px;
      background:${dark?"rgba(22,22,26,0.96)":"rgba(250,246,238,0.95)"};
      border:1px solid ${dark?"rgba(255,255,255,0.16)":"rgba(180,155,120,0.25)"};
      border-radius:26px;backdrop-filter:blur(80px) saturate(220%);
      -webkit-backdrop-filter:blur(80px) saturate(220%);z-index:99999;overflow:hidden;
      box-shadow:inset 0 1.5px 0 rgba(255,255,255,${dark?"0.16":"0.68"}),0 16px 50px rgba(0,0,0,${dark?"0.65":"0.20"});
      animation:ccIn 0.30s cubic-bezier(0.34,1.56,0.64,1) both;}
    @keyframes ccIn{from{opacity:0;transform:scale(0.84) translateY(-8px);}to{opacity:1;transform:scale(1) translateY(0);}}
    .cc-hd{padding:20px 20px 14px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(255,252,245,0.48)"};
      border-bottom:1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(180,155,120,0.14)"};
      display:flex;align-items:center;gap:13px;}
    .cc-ava{width:50px;height:50px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:19px;font-weight:800;color:#fff;
      box-shadow:0 0 0 3px ${T.accentGlow}35,0 5px 18px ${T.accentGlow};}
    .cc-name{font-size:14.5px;font-weight:800;color:${T.text};}
    .cc-goal{font-size:10.5px;color:${T.accent};font-weight:600;text-transform:capitalize;margin-top:2px;}
    .cc-pills{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap;}
    .cc-pill{padding:2px 9px;border-radius:99px;
      background:${dark?"rgba(255,255,255,0.07)":"rgba(255,252,245,0.80)"};
      border:1px solid ${dark?"rgba(255,255,255,0.10)":"rgba(180,155,120,0.18)"};
      font-size:9.5px;font-weight:700;color:${T.textSub};}
    .cc-pill.pro-tag{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;border-color:transparent;}
    .cc-pill.lite-tag{background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};color:${T.textMuted};}
    .cc-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:13px;}
    .cc-tile{border-radius:17px;padding:13px 12px;cursor:pointer;
      border:1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(180,155,120,0.13)"};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,252,245,0.68)"};
      backdrop-filter:blur(20px);position:relative;overflow:hidden;
      transition:all 0.26s cubic-bezier(0.34,1.56,0.64,1);}
    .cc-tile::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(130deg,rgba(255,255,255,${dark?"0.07":"0.48"}) 0%,transparent 35%);pointer-events:none;}
    .cc-tile:hover{transform:scale(1.04) translateY(-2px);}
    .cc-tile:active{transform:scale(0.97);}
    .cc-tile.acc{background:linear-gradient(135deg,${T.accent}20,${T.purple}13);border-color:${T.accent}28;}
    .cc-tile.dng:hover{background:${dark?"rgba(255,69,58,0.12)":"rgba(220,60,50,0.09)"};border-color:${T.red}30;}
    .cc-tile.dng:hover .cc-tl{color:${T.red};}
    .cc-tico{font-size:21px;margin-bottom:7px;display:block;}
    .cc-tl{font-size:11px;font-weight:700;color:${T.text};}
    .cc-ts{font-size:9px;color:${T.textMuted};margin-top:2px;}

    /* Section dividers */
    .sdiv{display:flex;align-items:center;gap:12px;margin:8px 0 20px;}
    .sdiv-line{flex:1;height:1px;background:${GB_BORDER};}
    .sdiv-txt{font-size:9px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:${T.textMuted};}

    /* Banners */
    .banner-warn{border-radius:16px;padding:14px 20px;margin-bottom:20px;
      background:${dark?"rgba(251,191,36,0.07)":"rgba(220,170,50,0.07)"};
      border:1px solid rgba(251,191,36,0.20);display:flex;align-items:center;gap:13px;}
    .banner-cycle{border-radius:16px;padding:14px 20px;margin-bottom:20px;
      display:flex;align-items:center;justify-content:space-between;
      background:${dark?"rgba(255,55,95,0.07)":"rgba(200,60,80,0.06)"};
      border:1px solid rgba(255,55,95,0.18);cursor:pointer;transition:all 0.25s;}
    .banner-cycle:hover{transform:translateY(-2px);}
    .banner-male{border-radius:16px;padding:14px 20px;margin-bottom:20px;
      display:flex;align-items:center;justify-content:space-between;
      border:1px solid ${T.accent}22;cursor:pointer;transition:all 0.25s;}
    .banner-male:hover{transform:translateY(-2px);}

    /* Quick actions */
    .qa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:28px;}
    .qa-btn{padding:18px 10px 14px;border-radius:18px;border:1px solid ${GB_BORDER};
      background:${GB};backdrop-filter:blur(40px);
      cursor:pointer;font-family:${FONT.body};font-size:11px;font-weight:700;
      color:${T.textSub};text-align:center;position:relative;overflow:hidden;
      transition:all 0.30s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:inset 0 1.5px 0 ${GB_TOP},0 2px 8px rgba(0,0,0,${dark?"0.14":"0.04"});}
    .qa-btn::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(128deg,rgba(255,255,255,${dark?"0.07":"0.42"}) 0%,transparent 30%);pointer-events:none;}
    .qa-btn:hover{border-color:var(--qa-color, ${T.accent});color:var(--qa-color, ${T.accent});
      transform:translateY(-6px) scale(1.03);
      box-shadow:0 16px 38px var(--qa-glow, ${T.accentGlow}38),inset 0 1.5px 0 rgba(255,255,255,${dark?"0.18":"0.78"});}
    .qa-ico{font-size:27px;display:block;margin-bottom:10px;
      transition:transform 0.30s cubic-bezier(0.34,1.56,0.64,1);}
    .qa-btn:hover .qa-ico{transform:scale(1.20) rotate(-6deg);}

    .qa-customize-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"};color:${T.textSub};cursor:pointer;transition:all 0.22s cubic-bezier(0.22,1,0.36,1);}
    .qa-customize-btn:hover{border-color:var(--qa-color, ${T.accent});color:var(--qa-color, ${T.accent});background:var(--qa-glow, ${T.accentGlow});transform:scale(1.04);}

    /* Pro banner */
    .pro-banner{border-radius:22px;padding:26px 30px;margin-bottom:28px;
      background:${dark?"linear-gradient(135deg,rgba(79,142,247,0.10),rgba(167,139,250,0.07),rgba(251,146,60,0.05))":"linear-gradient(135deg,rgba(79,142,247,0.08),rgba(167,139,250,0.05),rgba(200,160,80,0.04))"};
      border:1px solid ${T.accent}25;
      display:flex;align-items:center;justify-content:space-between;gap:20px;
      position:relative;overflow:hidden;cursor:pointer;
      box-shadow:inset 0 1.5px 0 rgba(255,255,255,${dark?"0.11":"0.58"}),0 4px 18px rgba(0,0,0,${dark?"0.14":"0.04"});
      transition:all 0.28s cubic-bezier(0.22,1,0.36,1);}
    .pro-banner:hover{border-color:${T.accent}45;transform:translateY(-3px);}
    .pro-banner::before{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;
      border-radius:50%;background:radial-gradient(circle,${T.purple}16,transparent 65%);pointer-events:none;}
    .pro-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      font-size:8.5px;font-weight:800;color:#fff;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;}
    .pro-title{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};margin-bottom:5px;}
    .pro-sub{font-size:12px;color:${T.textSub};line-height:1.55;}
    .pro-feats{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;}
    .pro-feat{display:flex;align-items:center;gap:4px;font-size:11px;color:${T.textSub};font-weight:600;}
    .pro-cta{padding:11px 22px;border-radius:13px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;
      font-size:12px;font-weight:800;font-family:${FONT.body};cursor:pointer;white-space:nowrap;flex-shrink:0;
      transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 5px 20px ${T.accentGlow},inset 0 1px 0 rgba(255,255,255,0.24);}
    .pro-cta:hover{transform:translateY(-3px) scale(1.04);}

    /* Stats grid */
    .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .sc{border-radius:22px;padding:22px;position:relative;overflow:hidden;
      transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);}
    .sc:hover{transform:translateY(-6px) scale(1.01);}
    .sc-glow{position:absolute;width:140px;height:140px;border-radius:50%;
      top:-55px;right:-45px;filter:blur(52px);opacity:${dark?"0.48":"0.20"};pointer-events:none;}
    .sc-shim{position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(108deg,transparent 30%,rgba(255,255,255,${dark?"0.04":"0.42"}) 50%,transparent 70%);
      background-size:200% 100%;animation:shim 5s ease-in-out infinite;}
    .sc-lbl{font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};margin-bottom:10px;}
    .sc-val{font-family:${FONT.display};font-size:32px;font-weight:800;line-height:1;letter-spacing:-0.02em;}
    .sc-sub{font-size:11px;color:${T.textSub};margin-top:7px;}
    .sc-bar{height:4px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};border-radius:99px;overflow:hidden;margin-top:14px;}
    .sc-fill{height:100%;border-radius:99px;transition:width 2.2s cubic-bezier(0.4,0,0.2,1);}

    /* Charts */
    .cr1{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-bottom:20px;}
    .cr2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px;}
    .cc2{border-radius:22px;padding:22px;}
    .cc2-title{font-size:9.5px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}
    .prow{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid ${GB_BORDER};font-size:12px;}
    .prow:last-child{border-bottom:none;padding-bottom:0;}

    /* Workout grid */
    .wg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .wc{border-radius:20px;padding:20px;cursor:pointer;position:relative;overflow:hidden;
      transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);}
    .wc::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,var(--wc) 0%,transparent 55%);opacity:0.07;pointer-events:none;}
    .wc:hover{transform:translateY(-8px) scale(1.01);border-color:var(--wc)!important;
      box-shadow:0 28px 65px rgba(0,0,0,${dark?"0.32":"0.13"}),0 0 0 1px var(--wc)38!important;}
    .wc-emo{font-size:27px;margin-bottom:12px;display:block;
      transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);}
    .wc:hover .wc-emo{transform:scale(1.22) rotate(-8deg);}
    .wc-name{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};margin-bottom:6px;}
    .wc-ex{font-size:11px;color:${T.textSub};line-height:1.6;margin-bottom:12px;}
    .wc-tag{display:inline-block;padding:3px 10px;border-radius:99px;font-size:9.5px;font-weight:800;letter-spacing:0.05em;}
    .wc-btn{width:100%;margin-top:13px;padding:10px;border-radius:11px;border:none;
      font-size:12px;font-weight:800;font-family:${FONT.body};cursor:pointer;
      transition:all 0.26s cubic-bezier(0.34,1.56,0.64,1);}
    .wc:hover .wc-btn{transform:translateY(-2px);filter:brightness(1.10);}

    /* Diet grid */
    .dg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .dc{border-radius:18px;padding:19px;transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);}
    .dc:hover{transform:translateY(-4px);}
    .dc-meal{font-family:${FONT.display};font-size:13px;font-weight:800;color:${T.text};}
    .dc-items{font-size:11px;color:${T.textSub};line-height:1.6;margin:7px 0 11px;}
    .dc-cal{font-family:${FONT.display};font-size:20px;font-weight:800;}
    .dc-pct{font-size:10px;color:${T.textMuted};margin-top:3px;}
    .dc-bar{height:4px;border-radius:99px;overflow:hidden;
      background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};margin-top:10px;}
    .dc-fill{height:100%;border-radius:99px;}

    /* Checklist */
    .cl{border-radius:22px;padding:26px;margin-bottom:28px;}
    .cl-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
    .cl-t{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .cl-pct{font-family:${FONT.display};font-size:13px;font-weight:800;color:${T.accent};}
    .cl-prog{height:6px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};border-radius:99px;overflow:hidden;margin-bottom:18px;}
    .cl-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,${T.accent},${T.purple});transition:width 1.8s cubic-bezier(0.4,0,0.2,1);}
    .cl-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid ${GB_BORDER};
      cursor:pointer;transition:all 0.20s cubic-bezier(0.34,1.56,0.64,1);}
    .cl-item:last-child{border-bottom:none;}
    .cl-item:hover{padding-left:5px;}
    .cl-ico{width:24px;height:24px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;}
    .cl-ico.dn{background:${T.green};color:#fff;box-shadow:0 2px 8px ${T.greenGlow};}
    .cl-ico.td{background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"};color:${T.textMuted};}
    .cl-txt{font-size:13px;font-weight:500;flex:1;}
    .cl-txt.dn{color:${T.textMuted};text-decoration:line-through;}
    .cl-txt.td{color:${T.text};}

    /* Achievements */
    .ach-row{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:28px;}
    .ach-b{display:flex;align-items:center;gap:6px;padding:7px 15px;border-radius:99px;
      font-size:11px;font-weight:700;border:1px solid;cursor:default;
      transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);}
    .ach-b:hover{transform:translateY(-3px) scale(1.04);}

    /* ── FITVERSE SECTION ── */
    .fv-section{
      border-radius:24px;padding:28px 32px;margin-bottom:28px;
      background:${dark?"linear-gradient(135deg,rgba(79,142,247,0.08),rgba(167,139,250,0.06),rgba(244,114,182,0.04))":"linear-gradient(135deg,rgba(79,142,247,0.07),rgba(167,139,250,0.05),rgba(244,114,182,0.04))"};
      border:1px solid ${T.accent}20;
      position:relative;overflow:hidden;
    }
    .fv-section::before{
      content:'';position:absolute;top:-60px;right:-40px;
      width:220px;height:220px;border-radius:50%;
      background:radial-gradient(circle,${T.purple}14,transparent 65%);
      pointer-events:none;
    }
    .fv-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
    .fv-slang{
      font-family:${FONT.display};font-size:22px;font-weight:800;
      letter-spacing:-0.02em;color:${T.text};max-width:480px;line-height:1.25;
      animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }
    .fv-slang span{
      background:linear-gradient(135deg,${T.accent},${T.purple});
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .fv-action{
      display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;
    }
    .fv-btn{
      padding:12px 24px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13px;font-weight:800;font-family:${FONT.body};
      cursor:pointer;white-space:nowrap;
      transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 6px 20px ${T.accentGlow};
    }
    .fv-btn:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 14px 32px ${T.accentGlow};}
    .fv-online{
      font-size:11px;color:${T.textSub};font-weight:600;
      display:flex;align-items:center;gap:5px;
    }
    .fv-dot{width:7px;height:7px;border-radius:50%;background:${T.green};
      box-shadow:0 0 8px ${T.green};animation:pulse 2s ease-in-out infinite;}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(1.2);}}
    .fv-avatars{display:flex;align-items:center;gap:0;}
    .fv-av{
      width:34px;height:34px;border-radius:50%;
      border:2px solid ${dark?BG:"#F5F0E8"};
      margin-left:-8px;object-fit:cover;
    }
    .fv-av:first-child{margin-left:0;}
    .fv-bottom{
      display:flex;align-items:center;justify-content:space-between;
      padding-top:18px;border-top:1px solid ${GB_BORDER};
    }
    .fv-stats{display:flex;gap:28px;}
    .fv-stat-val{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .fv-stat-lbl{font-size:10px;color:${T.textMuted};font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-top:1px;}

    /* Macro */
    .mn-row{display:flex;justify-content:center;gap:20px;margin-top:11px;}
    .mn-item{text-align:center;}
    .mn-dot{width:7px;height:7px;border-radius:50%;margin:0 auto 4px;}
    .mn-lbl{font-size:10px;color:${T.textSub};font-weight:600;}
    .mn-val{font-size:14px;font-weight:800;font-family:${FONT.display};}

    /* Tooltip */
    .ctt{background:${dark?"rgba(6,7,18,0.96)":"rgba(250,246,238,0.96)"};
      border:1px solid ${GB_BORDER};border-radius:13px;padding:10px 14px;
      font-size:11.5px;color:${T.text};backdrop-filter:blur(20px);
      box-shadow:0 8px 28px rgba(0,0,0,${dark?"0.38":"0.09"});}

    @keyframes shim{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:1200px){.sg,.wg,.dg{grid-template-columns:repeat(2,1fr);}.cr1,.cr2{grid-template-columns:1fr;}.qa-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:768px){.sb{display:none;}.mn{padding:18px 14px 40px;}.sg{grid-template-columns:repeat(2,1fr);}.qa-grid{grid-template-columns:repeat(2,1fr);}.wg,.dg{grid-template-columns:1fr 1fr;}.fv-top{flex-direction:column;gap:14px;}.fv-bottom{flex-direction:column;gap:14px;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div className="ctt">
        <div style={{fontFamily:FONT.display,fontWeight:700,marginBottom:4}}>{label}</div>
        {payload.map((p,i) => (
          <div key={i} style={{color:p.color||p.fill,display:"flex",gap:12,justifyContent:"space-between"}}>
            <span>{p.name}</span><b>{p.value}</b>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:BG}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:FONT.display,fontSize:22,fontWeight:800,color:T.text,marginBottom:16}}>
            AshFit<span style={{color:T.accent}}>Verse</span>
          </div>
          <div style={{width:36,height:36,border:`3px solid ${GB_BORDER}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </>
  );

  const profileIncomplete = !user.weight || !user.height || !user.age;

  return (
    <>
      <style>{css}</style>
      <div className="dr">
        <div className="orb o1"/><div className="orb o2"/>

        {/* ══════════════════════════════════════════════
            SIDEBAR — Redesigned
        ══════════════════════════════════════════════ */}
        <aside className="sb">
          <div className="sb-strip"/>

          <div className="sb-head">
            <div className="sb-logo" onClick={() => navigate("/dashboard")}>
              AshFit<span>Verse</span>
            </div>
            <div className="sb-tagline">Premium Fitness OS</div>
          </div>

          <div className="sb-user-card" onClick={() => navigate("/profile")}>
            <div className="sb-ava">{user.name?.[0]?.toUpperCase()||"A"}</div>
            <div className="sb-user-info">
              <div className="sb-name">{user.name||"Athlete"}</div>
              <div className="sb-goal-tag">
                {user.goal?.replace(/_/g," ")||"Fitness"}
              </div>
            </div>
          </div>

          {(user.streak||0) > 0 && (
            <div className="sb-streak">
              <span>🔥</span>
              <span style={{flex:1}}>{user.streak}d streak</span>
              <div className="sb-streak-bar">
                <div className="sb-streak-fill" style={{width:`${Math.min((user.streak/30)*100,100)}%`}}/>
              </div>
            </div>
          )}

          <div className="sb-sec">Navigate</div>
          {NAV_MAIN.map(n => (
            <div key={n.label}
              className={`sb-ni ${activeNav===n.label?"na":""}`}
              style={activeNav===n.label&&n.color?{color:n.color,borderColor:`${n.color}22`,background:`${n.color}12`}:{}}
              onClick={() => { setActiveNav(n.label); if(n.path) navigate(n.path); }}>
              <span className="sb-ni-ico">{n.icon}</span>
              <span className="sb-ni-txt">{n.label}</span>
              {n.badge && <span className="sb-badge">{n.badge}</span>}
            </div>
          ))}

          <div className="sb-div"/>

          <div className="sb-sec">Tools</div>
          {TOOL_SECTIONS.map(sec => (
            <React.Fragment key={sec.title}>
              <div className="sb-tool-sec">{sec.title}</div>
              {sec.items.map(t => (
                <div key={t.label} className="sb-ti" onClick={() => {
                  if (t.action === "feedback") {
                    setShowFeedbackModal(true);
                  } else if (t.path) {
                    navigate(t.path);
                  }
                }}>
                  <span className="sb-ti-ico">{t.icon}</span>
                  <span>{t.label}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          <div className="sb-div"/>

          <div className="sb-footer">
            {!isPro && (
              <div className="sb-pro-card">
                <div className="sb-pro-tag">PRO</div>
                <div className="sb-pro-title">Unlock Full Access</div>
                <div className="sb-pro-desc">AI workout & diet plans, deep analytics, and premium health tools.</div>
                <button className="sb-pro-cta" onClick={() => navigate("/pricing")}>
                  Upgrade · ₹199/mo
                </button>
                <div className="sb-pro-note">Cancel anytime</div>
              </div>
            )}

            <button className="sb-out" onClick={() => { clearUser(); navigate("/"); }}>
              <span>⎋</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            MAIN
        ══════════════════════════════════════════════ */}
        <main className="mn">

          {/* Topbar */}
          <div className="topbar">
            <div className="tb-left">
              <div className="tb-meta-row">
                <div className="tb-period">{greeting.icon} {greeting.period}</div>
                <div className="tb-clock">{timeLabel}</div>
              </div>
              <div className="tb-title">
                {greeting.text}, <span>{firstName}</span>
              </div>
              <div className="tb-sub-row">
                <span className="tb-sub">{dateLabel}</span>
                <span className="tb-dot">·</span>
                <span className="tb-goal-pill">{goalLabel}</span>
              </div>
            </div>

            <div className="tb-right">
              {/* Master Admin Console Pill — STRICTLY ashishkanellis33@gmail.com */}
              {isAdmin && (
                <button
                  className="tb-admin-btn"
                  title="Master Admin Console"
                  onClick={() => navigate("/admin")}
                >
                  <span style={{ fontSize: 13 }}>🛡️</span>
                  <span>Admin Console</span>
                  <span className="tb-admin-pulse" />
                </button>
              )}

              {/* Feedback & Rating Trigger for all athletes */}
              <button
                className="tb-feedback-btn"
                title="Rate App & Send Feedback"
                onClick={() => setShowFeedbackModal(true)}
              >
                <span>💬</span>
                <span>Feedback</span>
              </button>

              {(user.streak||0) > 0 && <div className="streak-pill">🔥 {user.streak}-day streak</div>}
              <div className="tb-notif-wrap">
                <button className="tb-btn" title="Notifications" onClick={() => setShowNotifications(v => !v)}>
                  🔔{unreadNotifications > 0 && <span className="tb-notif-dot"/>}
                </button>
                {showNotifications && (
                  <div className="tb-notif-panel">
                    <div className="tb-notif-head">
                      <strong style={{fontSize:12,color:T.text}}>Notifications{unreadNotifications ? ` (${unreadNotifications})` : ""}</strong>
                      <div style={{display:"flex",gap:10}}>
                        <button onClick={requestPermission} style={{border:0,background:"none",fontSize:10,fontWeight:700,color:T.accent,cursor:"pointer"}}>Enable alerts</button>
                        {unreadNotifications > 0 && <button onClick={markAllRead} style={{border:0,background:"none",fontSize:10,fontWeight:700,color:T.accent,cursor:"pointer"}}>Read all</button>}
                      </div>
                    </div>
                    {!notifications.length ? <div style={{padding:"20px",textAlign:"center",fontSize:12,color:T.textMuted}}>No notifications yet.</div>
                    : notifications.map(n => <div key={n.id} className={`tb-notif-item ${!n.read?"unread":""}`} onClick={() => { markRead(n.id); if(n.path) navigate(n.path); }}>
                      {n.text}
                    </div>)}
                  </div>
                )}
              </div>
              <button className="tb-toggle" onClick={toggleTheme}>
                <div className="tb-knob">{dark?"🌙":"☀️"}</div>
              </button>

              {/* Profile Wrapper with elevated z-index stack */}
              <div className="pf-wrap" ref={profileRef}>
                <div className="pf-ava" onClick={() => setShowProfile(v=>!v)}>
                  {user.name?.[0]?.toUpperCase()||"A"}
                </div>

                {showProfile && (
                  <div className="cc">
                    <div className="cc-hd">
                      <div className="cc-ava">{user.name?.[0]?.toUpperCase()||"A"}</div>
                      <div>
                        <div className="cc-name">{user.name||"Athlete"}</div>
                        <div className="cc-goal">{user.goal?.replace(/_/g," ")||"Fitness"}</div>
                        <div className="cc-pills">
                          {/* Profile Status Badge: Pro vs Lite */}
                          {isPro ? (
                            <span className="cc-pill pro-tag">⚡ PRO ACTIVE</span>
                          ) : (
                            <span className="cc-pill lite-tag">🌱 LITE PLAN</span>
                          )}
                          {bmi && <span className="cc-pill">BMI {bmi}</span>}
                          {user.streak>0 && <span className="cc-pill">🔥 {user.streak}d</span>}
                          {user.weight && <span className="cc-pill">{user.weight}kg</span>}
                        </div>
                      </div>
                    </div>

                    <div className="cc-grid">
                      <div className="cc-tile acc" onClick={()=>{setShowProfile(false);navigate("/profile");}}>
                        <span className="cc-tico">👤</span>
                        <div className="cc-tl">View Profile</div>
                        <div className="cc-ts">Stats & progress</div>
                      </div>

                      <div className="cc-tile acc" onClick={()=>{setShowProfile(false);navigate("/profile");}}>
                        <span className="cc-tico">✏️</span>
                        <div className="cc-tl">Edit Profile</div>
                        <div className="cc-ts">Update your data</div>
                      </div>

                      {/* Upgrade Tile shown only if user is on Free / Lite plan */}
                      {!isPro ? (
                        <div className="cc-tile" onClick={()=>{setShowProfile(false);navigate("/pricing");}}>
                          <span className="cc-tico">💎</span>
                          <div className="cc-tl">Go Pro</div>
                          <div className="cc-ts">Upgrade from ₹199/mo</div>
                        </div>
                      ) : (
                        <div className="cc-tile" onClick={()=>{setShowProfile(false);navigate("/pricing");}}>
                          <span className="cc-tico">👑</span>
                          <div className="cc-tl">Pro Active</div>
                          <div className="cc-ts">View benefits</div>
                        </div>
                      )}

                      {/* Master Admin Console Tile in profile menu */}
                      {isAdmin && (
                        <div className="cc-tile admin-tile" onClick={()=>{setShowProfile(false);navigate("/admin");}}>
                          <span className="cc-tico">🛡️</span>
                          <div className="cc-tl">Admin Console</div>
                          <div className="cc-ts">Manage feedback & logs</div>
                        </div>
                      )}

                      <div className="cc-tile" onClick={()=>{setShowProfile(false);setShowFeedbackModal(true);}}>
                        <span className="cc-tico">💬</span>
                        <div className="cc-tl">Rate & Feedback</div>
                        <div className="cc-ts">Share your review</div>
                      </div>

                      <div className="cc-tile" onClick={()=>{setShowProfile(false);navigate("/community");}}>
                        <span className="cc-tico">👥</span>
                        <div className="cc-tl">FitVerse</div>
                        <div className="cc-ts">Connect & compete</div>
                      </div>

                      <div className="cc-tile" onClick={()=>{setShowProfile(false);toggleTheme();}}>
                        <span className="cc-tico">{dark?"☀️":"🌙"}</span>
                        <div className="cc-tl">{dark?"Light Mode":"Dark Mode"}</div>
                        <div className="cc-ts">Switch theme</div>
                      </div>

                      <div className="cc-tile dng" onClick={()=>{clearUser();navigate("/");}}>
                        <span className="cc-tico">⎋</span>
                        <div className="cc-tl">Log Out</div>
                        <div className="cc-ts">See you soon</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banners */}
          {profileIncomplete && (
            <Reveal delay={0.02}>
              <div className="banner-warn">
                <span style={{fontSize:20}}>⚠️</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#fbbf24"}}>Complete your profile</div>
                  <div style={{fontSize:11.5,color:T.textSub,marginTop:2}}>Add height, weight and age to unlock calorie targets and BMI.</div>
                </div>
                <button onClick={() => navigate("/onboarding")} style={{padding:"8px 15px",borderRadius:10,border:"1px solid rgba(251,191,36,0.28)",background:"rgba(251,191,36,0.08)",color:"#fbbf24",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT.body,whiteSpace:"nowrap"}}>Complete →</button>
              </div>
            </Reveal>
          )}

          {isFemale && (
            <Reveal delay={0.03}>
              <div className="banner-cycle" onClick={() => navigate("/female-health")}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>📅</span>
                  <div>
                    <div style={{fontFamily:FONT.display,fontSize:13.5,fontWeight:800,color:"#ff375f"}}>{cycleDay?`Cycle Day ${cycleDay} — ${getPhaseName(cycleDay)}`:"Set up Cycle Tracking"}</div>
                    <div style={{fontSize:11.5,color:T.textSub,marginTop:2}}>{cycleDay?`${cycleLen-cycleDay} days until next period`:"Tap to add your last period date"}</div>
                  </div>
                </div>
                <button style={{padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,55,95,0.24)",background:"rgba(255,55,95,0.08)",color:"#ff375f",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT.body}}>Open →</button>
              </div>
            </Reveal>
          )}

          {isMale && (
            <Reveal delay={0.03}>
              <div className="banner-male gl" style={{borderColor:`${T.accent}22`}} onClick={() => navigate("/male-health")}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>♂</span>
                  <div>
                    <div style={{fontFamily:FONT.display,fontSize:13.5,fontWeight:800,color:T.accent}}>Men's Health Hub</div>
                    <div style={{fontSize:11.5,color:T.textSub,marginTop:2}}>Testosterone · Mental Health · Sleep · Performance</div>
                  </div>
                </div>
                <button style={{padding:"8px 16px",borderRadius:10,border:"none",background:T.accent,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:FONT.body}}>Open →</button>
              </div>
            </Reveal>
          )}

          {/* Quick Actions */}
          <Reveal delay={0.05}>
            <div className="sdiv" style={{ alignItems: "center" }}>
              <div className="sdiv-line" />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sdiv-txt">Quick Actions</div>
                <button
                  className="qa-customize-btn"
                  style={{
                    "--qa-color": currentQaTheme.color,
                    "--qa-glow": currentQaTheme.glow,
                  }}
                  onClick={() => setShowQAModal(true)}
                  title="Customize your dashboard shortcuts"
                >
                  ⚙️ Customize
                </button>
              </div>
              <div className="sdiv-line" />
            </div>
            <div className="qa-grid" style={{
              gridTemplateColumns: `repeat(${Math.min(currentActions.length, 6)}, minmax(0, 1fr))`
            }}>
              {currentActions.map((t, i) => (
                <button
                  key={t.id || i}
                  className="qa-btn"
                  style={{
                    "--qa-color": currentQaTheme.color,
                    "--qa-glow": currentQaTheme.glow,
                  }}
                  onClick={() => {
                    if (t.id === "weight-checkin") {
                      setShowWeightModal(true);
                    } else if (t.id === "feedback-modal" || t.path === "#feedback-modal") {
                      setShowFeedbackModal(true);
                    } else {
                      navigate(t.path);
                    }
                  }}
                >
                  <span className="qa-ico">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Pro Banner */}
          {!isPro && (
            <Reveal delay={0.07}>
              <div className="pro-banner" onClick={() => navigate("/pricing")}>
                <div style={{position:"relative",zIndex:1}}>
                  <div className="pro-badge">⚡ AshFitVerse Pro</div>
                  <div className="pro-title">Unlock Your Full Potential</div>
                  <div className="pro-sub">AI-powered plans · advanced analytics · exclusive health vault · priority support</div>
                  <div className="pro-feats">
                    {["🧬 Hormone-synced AI","📊 Deep analytics","🔒 Health vault","🏆 Elite community"].map((f,i) => (
                      <div key={i} className="pro-feat"><span style={{color:T.accent}}>✓</span>{f}</div>
                    ))}
                  </div>
                </div>
                <div style={{position:"relative",zIndex:1,textAlign:"center",flexShrink:0}}>
                  <div style={{fontFamily:FONT.display,fontSize:8.5,color:T.textMuted,marginBottom:2,letterSpacing:"0.12em",textTransform:"uppercase"}}>Starting at</div>
                  <div style={{fontFamily:FONT.display,fontSize:33,fontWeight:800,color:T.accent,lineHeight:1}}>₹199</div>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:13}}>/month</div>
                  <button className="pro-cta" onClick={e=>{e.stopPropagation();navigate("/pricing");}}>Go Pro →</button>
                  <div style={{fontSize:9,color:T.textMuted,marginTop:7}}>Cancel anytime</div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Stats */}
          <Reveal delay={0.09}>
            <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Your Stats</div><div className="sdiv-line"/></div>
            <div className="sg">
              {[
                {label:"Latest Weight",  val:currentWeight?`${currentWeight}`:"—", unit:"kg",  sub:recordedWeights.length?`Logged ${recordedWeights.at(-1)?.date}`:"Log your first weight", color:T.accent, glow:T.accentGlow, prog:weightProgress},
                {label:"BMI",            val:bmi?`${bmi}`:"—",                unit:"",       sub:bmiLabel,                                                              color:bmiColor,  glow:T.greenGlow,  prog:bmi?Math.min((bmi/30)*100,100):0},
                {label:"Logged Today",   val:todayCalories?`${todayCalories}`:"—", unit:"kcal", sub:todayCalories?`Target: ${calGoal} kcal`:"Log a meal to begin", color:T.green, glow:T.greenGlow, prog:todayCalories?Math.min(todayCalories/calGoal*100,100):0},
                {
                  label:isFemale?"Cycle Day":"Height",
                  val:  isFemale?(cycleDay?`${cycleDay}`:"—"):(user.height?`${user.height}`:"—"),
                  unit: isFemale?`/${cycleLen}`:"cm",
                  sub:  isFemale?getPhaseName(cycleDay):(user.age?`Age: ${user.age}`:"—"),
                  color:isFemale?"#ff375f":T.purple, glow:T.purpleGlow,
                  prog: isFemale?(cycleDay?(cycleDay/cycleLen)*100:0):(user.height?100:0),
                },
              ].map((s,i) => (
                <div key={i} className="sc gl">
                  <div className="sc-shim"/><div className="sc-glow" style={{background:s.glow}}/>
                  <div className="sc-lbl">{s.label}</div>
                  <div className="sc-val" style={{color:s.color}}>
                    {s.val}<span style={{fontSize:13,fontWeight:500,color:T.textSub,marginLeft:3}}>{s.unit}</span>
                  </div>
                  <div className="sc-sub">{s.sub}</div>
                  <div className="sc-bar"><div className="sc-fill" style={{width:`${Math.min(s.prog||0,100)}%`,background:`linear-gradient(90deg,${s.color},${s.color}70)`}}/></div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Charts row 1 */}
          <Reveal delay={0.11}>
            <div className="cr1">
              <div className="cc2 gl">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div className="cc2-title" style={{margin:0}}>Weight Trend — This Week</div>
                  <button
                    onClick={() => setShowWeightModal(true)}
                    style={{
                      background:"rgba(34, 197, 94, 0.14)",
                      color:"#22c55e",
                      border:"1px solid rgba(34, 197, 94, 0.35)",
                      padding:"3px 10px",
                      borderRadius:99,
                      fontSize:11,
                      fontWeight:700,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:4,
                      transition:"all 0.2s",
                    }}
                    title="Quick daily weight check-in"
                  >
                    <span>⚖️</span> + Log Weight
                  </button>
                </div>
                {!logsReady ? <div style={{height:210,display:"grid",placeItems:"center",fontSize:12,color:T.textMuted}}>Loading your entries…</div>
                : !weeklyWeight.some(d=>d.weight!=null) ? (
                  <div style={{height:210,display:"grid",placeItems:"center",textAlign:"center",fontSize:12,color:T.textMuted,lineHeight:1.6}}>
                    <div>
                      No weight entries yet.<br/>
                      <button
                        onClick={() => setShowWeightModal(true)}
                        style={{
                          marginTop:8,
                          background:"rgba(34, 197, 94, 0.15)",
                          color:"#22c55e",
                          border:"1px solid rgba(34, 197, 94, 0.4)",
                          borderRadius:10,
                          padding:"6px 14px",
                          fontSize:11.5,
                          fontWeight:700,
                          cursor:"pointer",
                        }}
                      >
                        ⚖️ Log Today's Weigh-in
                      </button>
                    </div>
                  </div>
                )
                : <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={weeklyWeight} margin={{top:5,right:4,bottom:0,left:-24}}>
                    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.30}/><stop offset="100%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"}/>
                    <XAxis dataKey="day" tick={{fill:T.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis domain={["auto","auto"]} tick={{fill:T.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke={T.accent} strokeWidth={2.5} fill="url(#wg)" dot={{fill:T.accent,r:3.5,strokeWidth:0}} activeDot={{r:5.5,strokeWidth:0,fill:T.accent}}/>
                  </AreaChart>
                </ResponsiveContainer>}
              </div>
              <div className="cc2 gl">
                <div className="cc2-title">Your Profile</div>
                <div style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textSub,marginBottom:8}}>
                    <span>Start: {firstWeight||"—"} kg</span>
                    <span>Target: {user.targetWeight||"—"} kg</span>
                  </div>
                  <div style={{height:8,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${weightProgress}%`,background:`linear-gradient(90deg,${T.accent},${T.purple})`,borderRadius:99,transition:"width 2s cubic-bezier(0.4,0,0.2,1)"}}/>
                  </div>
                  <div style={{fontSize:11,color:T.accent,marginTop:5,fontWeight:800}}>{recordedWeights.length ? `${weightProgress}% toward your goal` : "Add entries to track progress"}</div>
                </div>
                {[
                  {k:"Activity",  v:user.activityLevel?.replace(/_/g," ")||"—", c:T.green   },
                  {k:"Age",       v:user.age?`${user.age} yrs`:"—",              c:T.purple  },
                  {k:"Goal",      v:user.goal?.replace(/_/g," ")||"—",            c:T.accent  },
                  {k:"Equipment", v:user.equipment?.replace(/_/g," ")||"—",       c:T.textSub },
                  {k:"Sex",       v:user.sex||"—",                                c:isFemale?"#ff375f":T.accent},
                ].map((r,i,a) => (
                  <div key={i} className="prow" style={{borderColor:i===a.length-1?"transparent":undefined}}>
                    <span style={{color:T.textSub}}>{r.k}</span>
                    <span style={{fontWeight:700,color:r.c,textTransform:"capitalize"}}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Charts row 2 */}
          <Reveal delay={0.13}>
            <div className="cr2">
              <div className="cc2 gl">
                <div className="cc2-title">Calorie Balance — This Week</div>
                {!logsReady ? <div style={{height:210,display:"grid",placeItems:"center",fontSize:12,color:T.textMuted}}>Loading your entries…</div>
                : !calData.some(d=>d.consumed||d.burned) ? <div style={{height:210,display:"grid",placeItems:"center",textAlign:"center",fontSize:12,color:T.textMuted,lineHeight:1.6}}>No nutrition or workout logs this week.<br/>Your real balance will appear here.</div>
                : <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={calData} barGap={3} margin={{top:5,right:4,bottom:0,left:-24}}>
                    <defs>
                      <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={1}/><stop offset="100%" stopColor={T.accent} stopOpacity={0.4}/></linearGradient>
                      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.purple} stopOpacity={1}/><stop offset="100%" stopColor={T.purple} stopOpacity={0.4}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"}/>
                    <XAxis dataKey="day" tick={{fill:T.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:T.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Bar dataKey="consumed" name="Consumed" fill="url(#bg1)" radius={[6,6,0,0]}/>
                    <Bar dataKey="burned"   name="Burned"   fill="url(#bg2)" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>}
              </div>
              <div className="cc2 gl">
                <div className="cc2-title">Today's Macro Split</div>
                {MACROS.length ? <ResponsiveContainer width="100%" height={145}>
                  <PieChart>
                    <Pie data={MACROS} cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {MACROS.map((m,i) => <Cell key={i} fill={m.fill}/>)}
                    </Pie>
                    <Tooltip content={<CT/>}/>
                  </PieChart>
                </ResponsiveContainer> : <div style={{height:145,display:"grid",placeItems:"center",textAlign:"center",fontSize:12,color:T.textMuted,lineHeight:1.6}}>No meals logged today.<br/>Macros will be calculated from your entries.</div>}
                <div className="mn-row">
                  {MACROS.map((m,i) => (
                    <div key={i} className="mn-item">
                      <div className="mn-dot" style={{background:m.fill}}/>
                      <div className="mn-lbl">{m.name}</div>
                      <div className="mn-val" style={{color:m.fill}}>{m.value}%</div>
                    </div>
                  ))}
                </div>
                {MACROS.length > 0 && (
                  <div style={{marginTop:14,padding:"10px 12px",borderRadius:11,background:T.accentSoft,border:`1px solid ${T.accent}18`,fontSize:11,color:T.textSub,textAlign:"center"}}>
                    Protein <b style={{color:T.accent}}>{Math.round(todayMacros.protein)}g</b>
                    {" · "}Carbs <b style={{color:T.purple}}>{Math.round(todayMacros.carbs)}g</b>
                    {" · "}Fats <b style={{color:T.orange}}>{Math.round(todayMacros.fats)}g</b>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* Workouts */}
          <Reveal delay={0.15}>
            <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Today's Logged Training</div><div className="sdiv-line"/></div>
            <div className="wg">
              {!todayWorkouts.length ? (
                <div className="wc gl" style={{gridColumn:"1/-1",textAlign:"center",cursor:"pointer"}} onClick={() => navigate("/workout-logger")}>
                  <span className="wc-emo">🏋️</span>
                  <div className="wc-name">No workout logged today</div>
                  <div className="wc-ex">Start a session and your real workout details, sets, duration, and volume will appear here.</div>
                  <button className="wc-btn" style={{background:`linear-gradient(135deg,${T.accent},${T.purple})`,color:"#fff"}}>Log Workout →</button>
                </div>
              ) : todayWorkouts.map((w,i) => (
                <div key={w.id || i} className="wc gl" style={{"--wc":T.accent}} onClick={() => navigate("/workout-logger")}>
                  <span className="wc-emo">🏋️</span>
                  <div className="wc-name">{w.name || "Workout"}</div>
                  <div className="wc-ex">{w.exercises?.length || 0} exercises · {w.sets || 0} sets · {w.duration ? `${Math.round(w.duration / 60)} min` : "Duration not logged"}</div>
                  <span className="wc-tag" style={{background:`${T.green}13`,color:T.green,border:`1px solid ${T.green}25`}}>{Number(w.volume || 0).toLocaleString()} kg</span>
                  <button className="wc-btn" style={{background:`linear-gradient(135deg,${T.accent},${T.purple})`,color:"#fff"}}>View Log →</button>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Diet */}
          <Reveal delay={0.17}>
            <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Today's Nutrition</div><div className="sdiv-line"/></div>
            <div className="dg">
              {!mealGroups.length ? (
                <div className="dc gl" style={{gridColumn:"1/-1",textAlign:"center",cursor:"pointer"}} onClick={() => navigate("/diet-logger")}>
                  <div className="dc-meal">No meals logged today</div>
                  <div className="dc-items">Add a meal to see your real calories and macro totals here.</div>
                  <button className="wc-btn" style={{background:`linear-gradient(135deg,${T.green},${T.accent})`,color:"#fff"}}>Log a Meal →</button>
                </div>
              ) : mealGroups.map((d,i) => (
                <div key={i} className="dc gl">
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:d.color,boxShadow:`0 0 6px ${d.color}`,flexShrink:0}}/>
                    <div className="dc-meal">{d.meal}</div>
                  </div>
                  <div className="dc-items">{d.items.map(item=>item.food).join(" · ")}</div>
                  <div className="dc-cal" style={{color:d.color}}>{d.cal}<span style={{fontSize:10,fontWeight:500,color:T.textSub,marginLeft:3}}>kcal</span></div>
                  <div className="dc-pct">{Math.round((d.cal/calGoal)*100)}% of daily target</div>
                  <div className="dc-bar"><div className="dc-fill" style={{width:`${Math.min((d.cal/calGoal)*100,100)}%`,background:d.color}}/></div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Checklist */}
          <Reveal delay={0.19}>
            <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Getting Started</div><div className="sdiv-line"/></div>
            <div className="cl gl">
              <div className="cl-hd">
                <div className="cl-t">Setup Checklist 📋</div>
                <div className="cl-pct">{checkDone}/{checklist.length} · {checkPct}%</div>
              </div>
              <div className="cl-prog"><div className="cl-fill" style={{width:`${checkPct}%`}}/></div>
              {checklist.map((c,i) => (
                <div key={i} className="cl-item" onClick={() => !c.done && navigate(c.path)}>
                  <div className={`cl-ico ${c.done?"dn":"td"}`}>{c.done?"✓":"○"}</div>
                  <span className={`cl-txt ${c.done?"dn":"td"}`}>{c.text}</span>
                  {!c.done && <span style={{fontSize:11,color:T.textMuted}}>→</span>}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Achievements */}
          <Reveal delay={0.21}>
            <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Milestones</div><div className="sdiv-line"/></div>
            <div className="ach-row">
              {[
                ...(liveStreak > 0 ? [{label:`🔥 ${liveStreak}-Day Workout Streak`,color:"#fb923c"}] : []),
                ...(workouts.length > 0 ? [{label:`💪 ${workouts.length} Workout${workouts.length===1?"":"s"} Logged`,color:"#4f8ef7"}] : []),
                ...(todayCalories > 0 ? [{label:`🥗 ${todayCalories} kcal Logged Today`,color:"#34d399"}] : []),
                ...(recordedWeights.length > 0 ? [{label:`📈 ${recordedWeights.length} Weight Check-in${recordedWeights.length===1?"":"s"}`,color:"#a78bfa"}] : []),
              ].map((a,i) => (
                <div key={i} className="ach-b" style={{color:a.color,borderColor:`${a.color}24`,background:`${a.color}0a`}}>{a.label}</div>
              ))}
              {!workouts.length && !todayCalories && !recordedWeights.length && <div style={{fontSize:12,color:T.textMuted}}>Your earned milestones will appear here as you log progress.</div>}
            </div>
          </Reveal>

          {/* ── FITVERSE SECTION (Motivational squad hub) ── */}
          <Reveal delay={0.23}>
            <div className="fv-section">
              <div className="fv-top">
                <div>
                  <div className="fv-slang" key={slangIdx}>
                    <span>{SLANGS[slangIdx]}</span>
                  </div>
                  <div style={{fontSize:13,color:T.textSub,marginTop:10,fontWeight:500,lineHeight:1.6}}>
                    Your tribe is out here grinding. Join the conversation, drop your PR, flex your progress.
                  </div>
                  <div style={{fontSize:12,color:T.textSub,fontWeight:600,lineHeight:1.5,marginTop:16}}>
                    Your community activity is shown from real posts and challenges in FitVerse.
                  </div>
                </div>
                <div className="fv-action">
                  <button className="fv-btn" onClick={() => navigate("/community")}>
                    Enter FitVerse →
                  </button>
                  <div style={{fontSize:11,color:T.textMuted,textAlign:"right"}}>
                    Drop your first post. Be the OG. 🏆
                  </div>
                </div>
              </div>

              <div className="fv-bottom">
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{
                    padding:"8px 14px",borderRadius:99,
                    background:`linear-gradient(135deg,${T.accent}18,${T.purple}12)`,
                    border:`1px solid ${T.accent}28`,
                    fontSize:11.5,fontWeight:800,color:T.accent,
                    display:"flex",alignItems:"center",gap:6,
                  }}>
                    🚀 Early Adopter
                  </div>
                  <div style={{fontSize:12,color:T.textSub,fontWeight:500}}>
                    Be among the first to build this community. Your journey starts here.
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["🔥 Trending","🏆 Challenges","💬 Discuss","📸 Transformations"].map((tag,i) => (
                    <div key={i} onClick={() => navigate("/community")} style={{
                      padding:"6px 12px",borderRadius:99,
                      background:T.glass,border:`1px solid ${T.glassBorder}`,
                      fontSize:11,fontWeight:700,color:T.textSub,
                      cursor:"pointer",transition:"all 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent+"40"; e.currentTarget.style.color=T.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=T.glassBorder; e.currentTarget.style.color=T.textSub; }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

        </main>
      </div>

      <QuickActionsModal
        isOpen={showQAModal}
        onClose={() => setShowQAModal(false)}
        currentActions={currentActions}
        currentThemeId={qaThemeId}
        user={user}
        onSave={handleSaveQuickActions}
        dark={dark}
      />

      <WeightLogModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        user={user}
        authUid={authUid}
        weights={weights}
        updateUser={updateUser}
        dark={dark}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
        authUid={authUid}
        dark={dark}
      />
    </>
  );
}
