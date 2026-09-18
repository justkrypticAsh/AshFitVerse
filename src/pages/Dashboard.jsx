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
import { todayKey, recordDailyActivity } from "../lib/userLogs";
import { generateCSS, FONT } from "../theme";
import QuickActionsModal from "../components/QuickActionsModal";
import WeightLogModal from "../components/WeightLogModal";
import FeedbackModal from "../components/FeedbackModal";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import StreakModal from "../components/StreakModal";
import { getDefaultQuickActions, QA_THEMES, sanitizeActionsForUser } from "../config/quickActionsCatalog";
import {
  DEFAULT_CHALLENGES,
  loadChallengeProgress,
  saveChallengeProgress,
  todayStr,
  getChallengeStats,
} from "../config/challengesConfig";
import useIsMobile from "../hooks/useIsMobile";
import MobileAppShell from "../mobile/MobileAppShell";

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
  const isMobile  = useIsMobile(840);
  const { dark, toggleTheme, T } = useTheme();
  const { user, authUid, clearUser, loading, isMale, isFemale, bmi, calorieTarget, getCycleDay, getPhaseName, isPro, isAdmin, updateUser } = useUser();
  const { ready: logsReady, weeklyWeight, calData, todayCalories, todayBurned, todayNetCalories, todayMacros, mealGroups, streak: liveStreak, activeDates = [], isTodayActive = false, workouts, weights, todayWorkouts, todayMeals, meals } = useUserLogs(authUid);
  const { items: notifications, unread: unreadNotifications, markRead, markAllRead, requestPermission } = useAppNotifications(authUid);

  const [mounted,     setMounted]     = useState(false);
  const [activeNav,   setActiveNav]   = useState("Dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [selectedWorkoutLog, setSelectedWorkoutLog] = useState(null);
  const displayStreak = Math.max(Number(liveStreak) || 0, Number(user?.streak) || 0);

  // Keep user profile streak synchronized with live computed streak from activities
  useEffect(() => {
    if (liveStreak > 0 && liveStreak !== user?.streak && updateUser) {
      updateUser({ streak: liveStreak, lastWorkoutAt: todayKey() });
    }
  }, [liveStreak, user?.streak, updateUser]);

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

  // Challenge habit progress & sync
  const [challengeProgress, setChallengeProgress] = useState(() => loadChallengeProgress());
  const [challengeToast, setChallengeToast] = useState(null);

  useEffect(() => {
    const syncProg = () => setChallengeProgress(loadChallengeProgress());
    window.addEventListener("storage", syncProg);
    window.addEventListener("focus", syncProg);
    return () => {
      window.removeEventListener("storage", syncProg);
      window.removeEventListener("focus", syncProg);
    };
  }, []);

  const activeChallenges = React.useMemo(() => {
    return DEFAULT_CHALLENGES.map((c) => {
      const stats = getChallengeStats(c, challengeProgress);
      return { ...c, ...stats };
    }).filter((c) => c.joined);
  }, [challengeProgress]);

  const handleDashboardCheckIn = (challengeId) => {
    const today = todayStr();
    const c = DEFAULT_CHALLENGES.find((item) => item.id === challengeId);
    if (!c) return;
    const prog = challengeProgress[challengeId] || {};
    if (prog.lastCheckIn === today) return;
    const daysCompleted = Math.min((prog.daysCompleted || 0) + 1, c.totalDays);
    const updated = {
      ...challengeProgress,
      [challengeId]: {
        ...prog,
        joinedAt: prog.joinedAt || today,
        daysCompleted,
        lastCheckIn: today,
        streak: (prog.streak || daysCompleted - 1) + 1,
      },
    };
    setChallengeProgress(updated);
    saveChallengeProgress(updated);
    recordDailyActivity(authUid, "challenge_checkin", { challengeId, challengeTitle: c.title });
    setChallengeToast({ title: c.title, day: daysCompleted });
    setTimeout(() => setChallengeToast(null), 3500);
  };

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
  const isChecklistComplete = checkDone >= checklist.length;
  const [checklistDismissed, setChecklistDismissed] = useState(() => {
    try {
      return localStorage.getItem("ashfitverse_checklist_dismissed") === "true";
    } catch { return false; }
  });

  useEffect(() => {
    if (isChecklistComplete && !checklistDismissed) {
      setChecklistDismissed(true);
      try { localStorage.setItem("ashfitverse_checklist_dismissed", "true"); } catch {}
    }
  }, [isChecklistComplete, checklistDismissed]);

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
       SIDEBAR — Luxury Executive Architecture
    ══════════════════════════════════════════════ */
    .sb{
      width:252px;min-height:100vh;flex-shrink:0;
      position:sticky;top:0;height:100vh;
      overflow-y:auto;overflow-x:hidden;z-index:30;
      background:${dark ? "#090c15" : "#ffffff"};
      border-right:1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      box-shadow:${dark ? "4px 0 24px rgba(0,0,0,0.35)" : "2px 0 16px rgba(15,23,42,0.04)"};
      display:flex;flex-direction:column;
      padding:0 0 16px;
      transition:background 0.3s, border-color 0.3s;
    }
    .sb::-webkit-scrollbar{width:4px;}
    .sb::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"};border-radius:99px;}

    .sb-top-accent{
      height:3px;width:100%;flex-shrink:0;
      background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899);
    }

    .sb-head{
      padding:18px 16px 14px;
      display:flex;align-items:center;justify-content:space-between;
      border-bottom:1px solid ${dark ? "rgba(255,255,255,0.07)" : "#f1f5f9"};
    }
    .sb-brand-wrap{
      display:flex;align-items:center;gap:10px;cursor:pointer;
    }
    .sb-logo-badge{
      width:34px;height:34px;border-radius:10px;
      background:linear-gradient(135deg,#2563eb,#7c3aed);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:900;font-size:15px;
      box-shadow:0 4px 12px rgba(37,99,235,0.35);
      border:1px solid rgba(255,255,255,0.25);
    }
    .sb-brand-title{
      font-family:${FONT.display};font-size:17.5px;font-weight:900;
      letter-spacing:-0.03em;color:${dark ? "#f8fafc" : "#0f172a"};line-height:1.1;
    }
    .sb-brand-title span{
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    }
    .sb-edition-pill{
      font-size:9px;font-weight:800;letter-spacing:0.06em;
      padding:2px 6px;border-radius:6px;
      background:${dark ? "rgba(59,130,246,0.15)" : "#eff6ff"};
      color:#2563eb;border:1px solid ${dark ? "rgba(59,130,246,0.3)" : "#bfdbfe"};
      text-transform:uppercase;
    }

    /* Athlete Telemetry Card */
    .sb-athlete-card{
      margin:12px 12px 0;
      padding:11px 12px;
      border-radius:16px;
      background:${dark ? "#0f1322" : "#f8fafc"};
      border:1.5px solid ${dark ? "rgba(255,255,255,0.10)" : "#e2e8f0"};
      display:flex;align-items:center;gap:11px;cursor:pointer;
      transition:all 0.2s cubic-bezier(0.2,0,0,1);
      position:relative;
      box-shadow:${dark ? "0 4px 14px rgba(0,0,0,0.25)" : "0 2px 8px rgba(15,23,42,0.04)"};
    }
    .sb-athlete-card:hover{
      transform:translateY(-1.5px);
      border-color:${T.accent}60;
      box-shadow:0 6px 20px ${T.accentGlow}30;
    }
    .sb-ava-wrap{
      position:relative;width:40px;height:40px;flex-shrink:0;
    }
    .sb-ava-img{
      width:40px;height:40px;border-radius:50%;object-fit:cover;
      border:2px solid ${dark ? "rgba(255,255,255,0.16)" : "#ffffff"};
      box-shadow:0 2px 8px rgba(0,0,0,0.18);
    }
    .sb-ava-fallback{
      width:40px;height:40px;border-radius:50%;
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:15px;font-weight:900;
      border:2px solid ${dark ? "rgba(255,255,255,0.16)" : "#ffffff"};
      box-shadow:0 2px 8px rgba(59,130,246,0.3);
    }
    .sb-online-dot{
      position:absolute;bottom:0;right:0;width:10px;height:10px;
      border-radius:50%;background:#10b981;border:2px solid ${dark ? "#0f1322" : "#ffffff"};
    }
    .sb-athlete-details{
      min-width:0;flex:1;overflow:hidden;
    }
    .sb-name-row{
      display:flex;align-items:center;gap:6px;
    }
    .sb-athlete-name{
      font-size:13.5px;font-weight:800;color:${dark ? "#f8fafc" : "#0f172a"};
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      font-family:${FONT.display};
    }
    .sb-athlete-handle{
      font-size:11px;color:${dark ? T.textMuted : "#64748b"};font-weight:600;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .sb-meta-badges{
      display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:nowrap;
    }
    .sb-goal-badge{
      font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;
      background:${dark ? "rgba(59,130,246,0.15)" : "#eff6ff"};
      color:#2563eb;text-transform:capitalize;
      max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .sb-tier-badge{
      font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;
      background:linear-gradient(135deg,#f59e0b,#ea580c);
      color:#fff;letter-spacing:0.04em;
    }

    /* Streak widget */
    .sb-streak-card{
      margin:8px 12px 0;padding:10px 12px;border-radius:14px;
      background:${dark ? "linear-gradient(135deg, rgba(249,115,22,0.14), rgba(234,88,12,0.06))" : "linear-gradient(135deg, #fff7ed, #ffedd5)"};
      border:1px solid ${dark ? "rgba(249,115,22,0.30)" : "#fed7aa"};
      display:flex;align-items:center;gap:9px;
      font-size:12px;font-weight:800;color:${T.orange};
      cursor:pointer;
      transition:all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow:${dark ? "0 4px 14px rgba(249,115,22,0.12)" : "0 2px 8px rgba(249,115,22,0.08)"};
    }
    .sb-streak-card:hover{
      transform:translateY(-1.5px);
      border-color:rgba(249,115,22,0.55);
      box-shadow:${dark ? "0 6px 20px rgba(249,115,22,0.25)" : "0 4px 14px rgba(249,115,22,0.16)"};
    }
    .sb-streak-bar{
      flex:1;height:6px;background:${dark ? "rgba(249,115,22,0.18)" : "#fed7aa"};
      border-radius:99px;overflow:hidden;
    }
    .sb-streak-fill{
      height:100%;background:linear-gradient(90deg,#f97316,#ea580c);border-radius:99px;
      transition:width 0.8s cubic-bezier(0.4,0,0.2,1);
    }

    /* Section titles */
    .sb-nav-section{
      font-size:9.5px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;
      color:${dark ? T.textMuted : "#64748b"};padding:16px 16px 5px;
    }

    /* Nav items */
    .sb-nav-item{
      display:flex;align-items:center;gap:11px;
      margin:2px 8px;padding:9px 12px;border-radius:12px;
      cursor:pointer;font-size:13px;font-weight:600;
      color:${dark ? T.textSub : "#334155"};
      transition:all 0.18s ease;
      border:1px solid transparent;position:relative;
    }
    .sb-nav-item:hover{
      color:${dark ? "#f8fafc" : "#0f172a"};
      background:${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};
      border-color:${dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"};
      transform:translateX(2px);
    }
    .sb-nav-item.active{
      background:${dark ? "rgba(59,130,246,0.12)" : "#eff6ff"};
      color:#2563eb;font-weight:800;
      border-color:${dark ? "rgba(59,130,246,0.3)" : "#bfdbfe"};
    }
    .sb-nav-item.active::before{
      content:'';position:absolute;left:0;top:20%;bottom:20%;
      width:3.5px;background:#2563eb;border-radius:0 3px 3px 0;
    }
    .sb-nav-icon{
      width:20px;height:20px;display:flex;align-items:center;justify-content:center;
      flex-shrink:0;font-size:14px;
    }
    .sb-nav-label{flex:1;white-space:nowrap;}
    .sb-nav-badge{
      padding:2px 7px;border-radius:99px;font-size:9.5px;font-weight:800;
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;
    }

    /* Tool item */
    .sb-tool-item{
      display:flex;align-items:center;gap:10px;
      margin:1px 8px;padding:7.5px 12px;border-radius:10px;
      cursor:pointer;font-size:12.5px;font-weight:600;
      color:${dark ? T.textSub : "#475569"};
      transition:all 0.16s ease;
    }
    .sb-tool-item:hover{
      color:${dark ? "#f8fafc" : "#0f172a"};
      background:${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};
      transform:translateX(2px);
    }
    .sb-tool-icon{
      font-size:13.5px;width:18px;text-align:center;flex-shrink:0;
    }

    .sb-divider{
      height:1px;background:${dark ? "rgba(255,255,255,0.07)" : "#f1f5f9"};
      margin:10px 14px;
    }

    /* Pro Upgrade Box */
    .sb-pro-box{
      margin:10px 12px 6px;
      padding:14px 14px 12px;
      border-radius:16px;
      background:${dark
        ? "linear-gradient(145deg, #111526 0%, #0d101e 100%)"
        : "linear-gradient(145deg, #eff6ff 0%, #faf5ff 100%)"};
      border:1.5px solid ${dark ? "rgba(59,130,246,0.3)" : "#bfdbfe"};
      position:relative;overflow:hidden;
      box-shadow:${dark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 4px 14px rgba(37,99,235,0.08)"};
    }
    .sb-pro-head{
      display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;
    }
    .sb-pro-badge{
      font-size:8.5px;font-weight:900;letter-spacing:0.10em;padding:2px 7px;border-radius:6px;
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;
    }
    .sb-pro-title{
      font-family:${FONT.display};font-size:13.5px;font-weight:900;color:${dark ? "#f8fafc" : "#0f172a"};
      margin-bottom:3px;
    }
    .sb-pro-sub{
      font-size:11px;color:${dark ? T.textSub : "#64748b"};line-height:1.45;margin-bottom:10px;
    }
    .sb-pro-button{
      width:100%;padding:8px 0;border-radius:10px;border:none;
      background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;
      font-size:11.5px;font-weight:800;cursor:pointer;
      box-shadow:0 3px 12px rgba(37,99,235,0.35);
      transition:transform 0.16s ease;
    }
    .sb-pro-button:hover{transform:translateY(-1px);}

    /* Bottom logout / profile dock */
    .sb-dock{
      display:flex;align-items:center;gap:8px;padding:8px 12px 0;margin-top:auto;
    }
    .sb-dock-btn{
      flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
      padding:8px 10px;border-radius:11px;
      border:1px solid ${dark ? "rgba(255,255,255,0.09)" : "#e2e8f0"};
      background:${dark ? "rgba(255,255,255,0.04)" : "#f8fafc"};
      color:${dark ? T.textSub : "#475569"};font-size:12px;font-weight:700;
      cursor:pointer;transition:all 0.16s ease;
    }
    .sb-dock-btn:hover{
      color:${dark ? "#f8fafc" : "#0f172a"};
      background:${dark ? "rgba(255,255,255,0.08)" : "#f1f5f9"};
      border-color:${dark ? "rgba(255,255,255,0.18)" : "#cbd5e1"};
    }

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
    .streak-pill{
      display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 14px;border-radius:99px;box-sizing:border-box;
      background:${dark ? "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(234,88,12,0.08))" : "linear-gradient(135deg, #fff7ed, #ffedd5)"};
      border:1.5px solid ${dark ? "rgba(249,115,22,0.35)" : "#fed7aa"};
      font-size:12px;font-weight:800;color:${dark ? "#fb923c" : "#ea580c"};
      cursor:pointer;
      transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow:${dark ? "0 0 16px rgba(249,115,22,0.2)" : "0 2px 8px rgba(249,115,22,0.12)"};
    }
    .streak-pill:hover{
      transform:scale(1.04);
      box-shadow:0 0 22px rgba(249,115,22,0.38);
      border-color:#f97316;
    }
    .streak-pill.zero{
      display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 14px;border-radius:99px;box-sizing:border-box;
      background:${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"};
      border:1px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"};
      color:${dark ? T.textSub : "#475569"};
      box-shadow:none;
    }
    .streak-flame-icon{
      display:inline-block;animation:flamePulse 2s infinite ease-in-out;
    }
    @keyframes flamePulse{
      0%,100%{transform:scale(1);}
      50%{transform:scale(1.2) rotate(4deg);}
    }
    .streak-active-dot{
      width:14px;height:14px;border-radius:50%;background:#10b981;color:#fff;
      font-size:9px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;
    }
    .streak-pending-dot{
      width:8px;height:8px;border-radius:50%;background:#f97316;display:inline-block;
      box-shadow:0 0 8px #f97316;animation:flamePulse 1.5s infinite;
    }
    .tb-btn{width:38px;height:38px;border-radius:12px;border:1px solid ${GB_BORDER};box-sizing:border-box;
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
    .tb-toggle{width:50px;height:30px;border-radius:99px;border:1px solid ${GB_BORDER};box-sizing:border-box;
      background:${dark?"rgba(255,255,255,0.07)":"rgba(255,252,245,0.80)"};
      cursor:pointer;position:relative;flex-shrink:0;align-self:center;}
    .tb-knob{position:absolute;top:3.5px;left:${dark?"24px":"3px"};width:21px;height:21px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left 0.35s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 2px 8px ${T.accentGlow};}

    .tb-admin-btn{
      display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 14px;border-radius:12px;box-sizing:border-box;
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
      display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;padding:0 14px;border-radius:12px;box-sizing:border-box;
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

    /* ── EXECUTIVE QUICK ACCESS COMMAND BAR ── */
    .qa-bar-head{
      display:flex;align-items:center;justify-content:space-between;
      margin-bottom:14px;
    }
    .qa-tag-title{
      display:flex;align-items:center;gap:8px;
    }
    .qa-title-txt{
      font-family:${FONT.display};font-size:15px;font-weight:900;
      color:${dark ? "#f8fafc" : "#0f172a"};letter-spacing:-0.01em;
    }
    .qa-title-pill{
      font-size:10px;font-weight:800;letter-spacing:0.06em;
      padding:2px 8px;border-radius:99px;
      background:${dark ? "rgba(59,130,246,0.14)" : "#eff6ff"};
      color:#2563eb;border:1px solid ${dark ? "rgba(59,130,246,0.25)" : "#bfdbfe"};
      text-transform:uppercase;
    }
    .qa-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
      gap:12px;
      margin-bottom:28px;
    }
    .qa-card{
      padding:16px 14px;
      border-radius:18px;
      border:1.5px solid ${dark ? "rgba(255,255,255,0.10)" : "#e2e8f0"};
      background:${dark ? "#0f1322" : "#ffffff"};
      cursor:pointer;
      font-family:${FONT.body};
      text-align:left;
      position:relative;
      overflow:hidden;
      box-shadow:${dark ? "0 6px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(15,23,42,0.04)"};
      transition:all 0.22s cubic-bezier(0.2,0,0,1);
      display:flex;
      flex-direction:column;
      justify-content:space-between;
      min-height:105px;
    }
    .qa-card:hover{
      transform:translateY(-4px);
      border-color:var(--qa-color, #3b82f6);
      box-shadow:0 12px 28px var(--qa-glow, rgba(59,130,246,0.25)), 0 2px 6px rgba(0,0,0,0.05);
    }
    .qa-ico-row{
      display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;
    }
    .qa-ico-circle{
      width:38px;height:38px;border-radius:12px;
      background:var(--qa-color-soft, rgba(59,130,246,0.12));
      border:1px solid var(--qa-color-border, rgba(59,130,246,0.25));
      display:flex;align-items:center;justify-content:center;
      font-size:19px;
      transition:transform 0.24s ease;
    }
    .qa-card:hover .qa-ico-circle{
      transform:scale(1.12);
    }
    .qa-arrow{
      font-size:12px;color:${dark ? T.textMuted : "#94a3b8"};
      transition:transform 0.2s ease, color 0.2s ease;
    }
    .qa-card:hover .qa-arrow{
      transform:translateX(2px);
      color:var(--qa-color, #3b82f6);
    }
    .qa-card-lbl{
      font-family:${FONT.display};font-size:12.5px;font-weight:800;
      color:${dark ? "#f8fafc" : "#0f172a"};
      line-height:1.25;margin-bottom:3px;
    }
    .qa-card-desc{
      font-size:10.5px;color:${dark ? T.textMuted : "#64748b"};
      line-height:1.3;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }

    .qa-customize-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;border:1px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"};background:${dark?"rgba(255,255,255,0.06)":"#f8fafc"};color:${dark ? T.textSub : "#334155"};cursor:pointer;transition:all 0.22s cubic-bezier(0.22,1,0.36,1);}
    .qa-customize-btn:hover{border-color:var(--qa-color, ${T.accent});color:var(--qa-color, ${T.accent});background:var(--qa-glow, ${T.accentGlow});transform:scale(1.03);}

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

    /* Mobile Floating Bottom Navigation Dock — Hidden on Desktop */
    .mobile-bottom-dock{display:none !important;}

    @media(max-width:1200px){
      .sg,.wg,.dg{grid-template-columns:repeat(2,1fr);}
      .cr1,.cr2{grid-template-columns:1fr;}
      .qa-grid{grid-template-columns:repeat(3,1fr);}
    }

    @media(max-width:900px){
      .sb{display:none !important;}
      .mn{padding:16px 14px 105px !important;}
      .topbar{
        flex-direction:column !important;
        align-items:stretch !important;
        gap:14px !important;
        padding:16px 14px !important;
      }
      .tb-left{width:100% !important;}
      .tb-title{font-size:24px !important;}
      .tb-right{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        width:100% !important;
        gap:8px !important;
        flex-wrap:wrap !important;
        padding-top:12px !important;
        border-top:1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} !important;
      }
      .streak-pill{font-size:11.5px !important;padding:5px 12px !important;}
      .tb-feedback-btn{font-size:11.5px !important;padding:6px 11px !important;}
      .qa-grid{grid-template-columns:repeat(2,1fr) !important;gap:10px !important;}
      .sg{grid-template-columns:repeat(2,1fr) !important;}
      .wg,.dg{grid-template-columns:1fr !important;}
      .fv-top{flex-direction:column;gap:14px;}
      .fv-bottom{flex-direction:column;gap:14px;}

      /* Mobile Floating Bottom Navigation Dock */
      .mobile-bottom-dock{
        position:fixed;bottom:14px;left:14px;right:14px;z-index:998;
        display:flex !important;align-items:center;justify-content:space-around;
        padding:7px 8px;border-radius:22px;
        background:${dark ? "rgba(15,17,26,0.92)" : "rgba(255,255,255,0.94)"};
        backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
        border:1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"};
        box-shadow:0 12px 36px rgba(0,0,0,${dark ? "0.55" : "0.15"});
      }
      .mbd-item{
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:3px;background:none;border:none;cursor:pointer;
        padding:6px 12px;border-radius:14px;transition:all 0.18s ease;
        color:${dark ? "#94a3b8" : "#64748b"};
        font-family:${FONT.body};
      }
      .mbd-item.active{
        color:${T.accent};
        background:${dark ? "rgba(79,142,247,0.16)" : "rgba(79,142,247,0.10)"};
      }
      .mbd-icon{font-size:18px;line-height:1;}
      .mbd-lbl{font-size:10px;font-weight:750;letter-spacing:0.01em;}
    }

    @media(max-width:480px){
      .mn{padding:14px 10px 100px !important;}
      .tb-title{font-size:22px !important;}
      .qa-grid{grid-template-columns:1fr 1fr !important;gap:8px !important;}
      .qa-card{padding:12px !important;}
      .qa-card-sub{display:none !important;}
      .sg{grid-template-columns:1fr 1fr !important;gap:8px !important;}
      .sg-card{padding:12px !important;}
    }
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

  const CalorieTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    const consumed = data?.consumed || 0;
    const burned = data?.burned || 0;
    const net = Math.max(0, consumed - burned);
    const diff = calGoal - net;
    return (
      <div className="ctt" style={{ minWidth: 175, padding: "12px 14px", backdropFilter: "blur(20px)", background: dark ? "rgba(10,12,24,0.96)" : "rgba(255,255,255,0.98)", border: `1px solid ${T.glassBorder}`, borderRadius: 14 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, marginBottom: 8, borderBottom: `1px solid ${T.glassBorder}`, paddingBottom: 4, color: T.text }}>
          {label} — Balance
        </div>
        <div style={{ color: T.accent, display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span>🍏 Consumed:</span> <b>{consumed.toLocaleString()} kcal</b>
        </div>
        <div style={{ color: "#f97316", display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span>🔥 Burned:</span> <b>-{burned.toLocaleString()} kcal</b>
        </div>
        <div style={{ color: T.green, display: "flex", justifyContent: "space-between", fontSize: 12.5, borderTop: `1px dashed ${T.glassBorder}`, paddingTop: 5, marginTop: 4 }}>
          <span>⚡ Net Balance:</span> <b>{net.toLocaleString()} kcal</b>
        </div>
        <div style={{ fontSize: 10.5, color: diff >= 0 ? T.green : T.red, marginTop: 5, textAlign: "right", fontWeight: 700 }}>
          {diff >= 0 ? `${diff.toLocaleString()} kcal under goal` : `${Math.abs(diff).toLocaleString()} kcal over goal`}
        </div>
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

  if (isMobile) {
    return (
      <MobileAppShell
        user={user}
        authUid={authUid}
        dark={dark}
        toggleTheme={toggleTheme}
        T={T}
        displayStreak={displayStreak}
        calorieTarget={calorieTarget}
        todayCalories={todayCalories}
        todayBurned={todayBurned}
        todayNetCalories={todayNetCalories}
        todayMacros={todayMacros}
        mealGroups={mealGroups}
        weights={weights}
        workouts={workouts}
        todayWorkouts={todayWorkouts}
        todayMeals={todayMeals}
        activeChallenges={activeChallenges}
        handleDashboardCheckIn={handleDashboardCheckIn}
        workoutPlan={getWorkouts(user?.goal, user?.equipment)}
        isFemale={isFemale}
        isMale={isMale}
        getCycleDay={getCycleDay}
        getPhaseName={getPhaseName}
        bmi={bmi}
        isPro={isPro}
        clearUser={clearUser}
      />
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="dr">
        <div className="orb o1"/><div className="orb o2"/>

        {/* ══════════════════════════════════════════════
            SIDEBAR — Redesigned
        ══════════════════════════════════════════════ */}
        <aside className="sb">
          <div className="sb-top-accent" />

          <div className="sb-head">
            <div className="sb-brand-wrap" onClick={() => navigate("/dashboard")}>
              <div className="sb-logo-badge">⚡</div>
              <div>
                <div className="sb-brand-title">
                  AshFit<span>Verse</span>
                </div>
              </div>
            </div>
            <span className="sb-edition-pill">PRO OS</span>
          </div>

          <div className="sb-athlete-card" onClick={() => navigate("/profile")} title="View & Edit Profile">
            <div className="sb-ava-wrap">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="sb-ava-img" />
              ) : (
                <div className="sb-ava-fallback">{user.name?.[0]?.toUpperCase() || "A"}</div>
              )}
              <div className="sb-online-dot" />
            </div>
            <div className="sb-athlete-details">
              <div className="sb-name-row">
                <div className="sb-athlete-name">{user.name || "Athlete"}</div>
              </div>
              <div className="sb-athlete-handle">
                @{user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, "_") : "athlete")}
              </div>
              <div className="sb-meta-badges">
                <span className="sb-goal-badge">{user.goal?.replace(/_/g, " ") || "General"}</span>
                {isPro && <span className="sb-tier-badge">PRO</span>}
              </div>
            </div>
          </div>

          {displayStreak > 0 && (
            <div
              className="sb-streak-card"
              onClick={() => setShowStreakModal(true)}
              title="Click to view streak telemetry and 7-day breakdown"
            >
              <span className="streak-flame-icon" style={{ fontSize: 16 }}>🔥</span>
              <span style={{ flex: 1 }}>{displayStreak}d active streak</span>
              <div className="sb-streak-bar">
                <div className="sb-streak-fill" style={{ width: `${Math.min((displayStreak / 30) * 100, 100)}%` }} />
              </div>
            </div>
          )}

          <div className="sb-nav-section">Core Navigation</div>
          {NAV_MAIN.map((n) => (
            <div
              key={n.label}
              className={`sb-nav-item ${activeNav === n.label ? "active" : ""}`}
              style={activeNav === n.label && n.color ? { color: n.color, borderColor: `${n.color}35`, background: `${n.color}15` } : {}}
              onClick={() => {
                setActiveNav(n.label);
                if (n.path) navigate(n.path);
              }}
            >
              <span className="sb-nav-icon">{n.icon}</span>
              <span className="sb-nav-label">{n.label}</span>
              {n.badge && <span className="sb-nav-badge">{n.badge}</span>}
            </div>
          ))}

          <div className="sb-divider" />

          <div className="sb-nav-section">Tools & Tracking</div>
          {TOOL_SECTIONS.map((sec) => (
            <React.Fragment key={sec.title}>
              {sec.items.map((t) => (
                <div
                  key={t.label}
                  className="sb-tool-item"
                  onClick={() => {
                    if (t.action === "feedback") {
                      setShowFeedbackModal(true);
                    } else if (t.path) {
                      navigate(t.path);
                    }
                  }}
                >
                  <span className="sb-tool-icon">{t.icon}</span>
                  <span style={{ flex: 1 }}>{t.label}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          <div className="sb-divider" />

          {!isPro && (
            <div className="sb-pro-box">
              <div className="sb-pro-head">
                <span className="sb-pro-badge">PRO ACCESS</span>
              </div>
              <div className="sb-pro-title">Unlock Full Potential</div>
              <div className="sb-pro-sub">Hormone AI, custom workout splits & deep metabolic analytics.</div>
              <button className="sb-pro-button" onClick={() => navigate("/pricing")}>
                Upgrade · ₹199/mo
              </button>
            </div>
          )}

          <div className="sb-dock">
            <button className="sb-dock-btn" onClick={() => navigate("/profile")} title="Profile Settings">
              <span>👤</span>
              <span>Profile</span>
            </button>
            <button className="sb-dock-btn" onClick={() => { clearUser(); navigate("/"); }} title="Sign Out">
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

              {displayStreak > 0 ? (
                <button
                  className="streak-pill"
                  title="Click to view streak breakdown & milestone tracker"
                  onClick={() => setShowStreakModal(true)}
                >
                  <span className="streak-flame-icon">🔥</span>
                  <span>{displayStreak}-day streak</span>
                  {isTodayActive ? (
                    <span className="streak-active-dot" title="Active today!">✓</span>
                  ) : (
                    <span className="streak-pending-dot" title="Log activity to maintain today!" />
                  )}
                </button>
              ) : (
                <button
                  className="streak-pill zero"
                  title="Start your streak today!"
                  onClick={() => setShowStreakModal(true)}
                >
                  <span className="streak-flame-icon">⚡</span>
                  <span>Start Streak</span>
                </button>
              )}
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
                          {displayStreak > 0 && <span className="cc-pill">🔥 {displayStreak}d</span>}
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

          {/* Quick Access Command Bar */}
          <Reveal delay={0.05}>
            <div className="qa-bar-head">
              <div className="qa-tag-title">
                <span className="qa-title-txt">Quick Access</span>
                <span className="qa-title-pill">Command Shortcuts</span>
              </div>
              <button
                className="qa-customize-btn"
                style={{
                  "--qa-color": currentQaTheme.color,
                  "--qa-glow": currentQaTheme.glow,
                }}
                onClick={() => setShowQAModal(true)}
                title="Customize your dashboard command shortcuts"
              >
                ⚙️ Customize Shortcuts
              </button>
            </div>
            <div className="qa-grid" style={{
              gridTemplateColumns: `repeat(${Math.min(currentActions.length, 6)}, minmax(0, 1fr))`
            }}>
              {currentActions.map((t, i) => (
                <div
                  key={t.id || i}
                  className="qa-card"
                  style={{
                    "--qa-color": t.color || currentQaTheme.color,
                    "--qa-glow": `${t.color || currentQaTheme.color}35`,
                    "--qa-color-soft": `${t.color || currentQaTheme.color}15`,
                    "--qa-color-border": `${t.color || currentQaTheme.color}30`,
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
                  <div className="qa-ico-row">
                    <div className="qa-ico-circle">{t.icon}</div>
                    <span className="qa-arrow">→</span>
                  </div>
                  <div>
                    <div className="qa-card-lbl">{t.label}</div>
                    <div className="qa-card-desc">{t.desc || "Quick command"}</div>
                  </div>
                </div>
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
              <div className="cc2 gl" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div className="cc2-title" style={{ marginBottom: 2 }}>Calorie Balance — This Week</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Consumed vs Burned vs Net Remaining</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 10.5, fontWeight: 700 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: T.accent }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} /> Consumed
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f97316" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} /> Burned
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: T.green }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} /> Net Left
                    </span>
                  </div>
                </div>

                {/* 3-metric live snapshot */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
                  <div style={{ padding: "7px 8px", borderRadius: 10, background: T.accentSoft, border: `1px solid ${T.accent}20`, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: T.textSub, fontWeight: 700, textTransform: "uppercase" }}>🍏 Consumed</div>
                    <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: T.accent }}>
                      {todayCalories.toLocaleString()} <span style={{ fontSize: 9, fontWeight: 500 }}>kcal</span>
                    </div>
                  </div>
                  <div style={{ padding: "7px 8px", borderRadius: 10, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: T.textSub, fontWeight: 700, textTransform: "uppercase" }}>🔥 Burned</div>
                    <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: "#f97316" }}>
                      {todayBurned.toLocaleString()} <span style={{ fontSize: 9, fontWeight: 500 }}>kcal</span>
                    </div>
                  </div>
                  <div style={{ padding: "7px 8px", borderRadius: 10, background: `${T.green}12`, border: `1px solid ${T.green}25`, textAlign: "center" }}>
                    <div style={{ fontSize: 9.5, color: T.textSub, fontWeight: 700, textTransform: "uppercase" }}>⚡ Net Left</div>
                    <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: T.green }}>
                      {Math.max(0, calGoal - todayNetCalories).toLocaleString()} <span style={{ fontSize: 9, fontWeight: 500 }}>kcal</span>
                    </div>
                  </div>
                </div>

                {!logsReady ? (
                  <div style={{ height: 165, display: "grid", placeItems: "center", fontSize: 12, color: T.textMuted }}>Loading your entries…</div>
                ) : !calData.some(d => d.consumed || d.burned) ? (
                  <div style={{ height: 165, display: "grid", placeItems: "center", textAlign: "center", fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>
                    No nutrition or workout logs this week.<br />Your real balance will appear here.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={165}>
                    <BarChart data={calData} barGap={2} margin={{ top: 5, right: 4, bottom: 0, left: -24 }}>
                      <defs>
                        <linearGradient id="bgConsumed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={T.accent} stopOpacity={1} />
                          <stop offset="100%" stopColor={T.accent} stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="bgBurned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                          <stop offset="100%" stopColor="#ea580c" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="bgNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={T.green} stopOpacity={1} />
                          <stop offset="100%" stopColor={T.green} stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CalorieTooltip />} />
                      <Bar dataKey="consumed" name="Consumed" fill="url(#bgConsumed)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="burned" name="Burned" fill="url(#bgBurned)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net Balance" fill="url(#bgNet)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
              ) : todayWorkouts.map((w,i) => {
                const isSports = w.category === "sports";
                const isIntimacy = w.category === "intimacy";
                const icon = isSports ? (w.sportIcon || "⚽") : isIntimacy ? "❤️" : "🏋️";
                const burned = Number(w.caloriesBurned) || Math.round(((Number(w.duration) || 0) / 60) * 6);
                return (
                  <div
                    key={w.id || i}
                    className="wc gl"
                    style={{ "--wc": isIntimacy ? "#f472b6" : isSports ? "#38bdf8" : T.accent, cursor: "pointer" }}
                    onClick={() => setSelectedWorkoutLog(w)}
                  >
                    <span className="wc-emo">{icon}</span>
                    <div className="wc-name">{w.name || "Workout"}</div>
                    <div className="wc-ex">
                      {isSports
                        ? `${w.sport || "Sport"} · ${w.duration ? `${Math.round(w.duration / 60)} min` : ""} · ${w.intensity || "Active"}`
                        : isIntimacy
                        ? `Intimacy · ${w.duration ? `${Math.round(w.duration / 60)} min` : ""} · ${w.intensity || "Active"}`
                        : `${w.exercises?.length || 0} exercises · ${w.sets || 0} sets · ${w.duration ? `${Math.round(w.duration / 60)} min` : "Completed"}`}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
                      {Number(w.volume) > 0 && (
                        <span className="wc-tag" style={{ background: `${T.green}13`, color: T.green, border: `1px solid ${T.green}25` }}>
                          {Number(w.volume || 0).toLocaleString()} kg
                        </span>
                      )}
                      {burned > 0 && (
                        <span className="wc-tag" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
                          🔥 {burned} kcal
                        </span>
                      )}
                      <span className="wc-tag" style={{ background: isIntimacy ? "rgba(244,114,182,0.12)" : isSports ? "rgba(56,189,248,0.12)" : `${T.accent}12`, color: isIntimacy ? "#f472b6" : isSports ? "#38bdf8" : T.accent, border: `1px solid ${isIntimacy ? "rgba(244,114,182,0.25)" : isSports ? "rgba(56,189,248,0.25)" : `${T.accent}25`}` }}>
                        {isSports ? "Sports" : isIntimacy ? "Intimacy" : "Strength"}
                      </span>
                    </div>
                    <button
                      className="wc-btn"
                      style={{ background: isIntimacy ? "linear-gradient(135deg,#f472b6,#ec4899)" : `linear-gradient(135deg,${T.accent},${T.purple})`, color: "#fff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkoutLog(w);
                      }}
                    >
                      View Log →
                    </button>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Active Challenges & Daily Habit Check-In */}
          <Reveal delay={0.16}>
            <div className="sdiv" style={{ alignItems: "center" }}>
              <div className="sdiv-line" />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sdiv-txt">Active Challenges & Daily Habits 🏆</div>
                <button
                  onClick={() => navigate("/community?tab=challenges")}
                  style={{
                    background: "transparent",
                    border: `1px solid ${T.accent}35`,
                    color: T.accent,
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Browse Quests →
                </button>
              </div>
              <div className="sdiv-line" />
            </div>

            {activeChallenges.length === 0 ? (
              <div
                className="gl"
                style={{
                  padding: "24px 28px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  cursor: "pointer",
                  background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#cbd5e1"}`,
                }}
                onClick={() => navigate("/community?tab=challenges")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 640 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "rgba(59,130,246,0.12)",
                      border: "1.5px solid rgba(59,130,246,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  >
                    🏆
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 4 }}>
                      Start a 30-Day Fitness & Habit Quest
                    </div>
                    <div style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.5 }}>
                      Enroll in Push-up Protocol, 10K Steps, Dawn Discipline, or Core Stability. Build unbroken daily streaks and track your progress here.
                    </div>
                  </div>
                </div>

                <button
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "none",
                    background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/community?tab=challenges");
                  }}
                >
                  Explore Challenges →
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 14,
                }}
              >
                {activeChallenges.map((c) => {
                  const isCheckedInToday = c.lastCheckIn === todayStr();
                  const accentColor = c.color || "#2563eb";
                  return (
                    <div
                      key={c.id}
                      className="gl"
                      style={{
                        padding: "20px 22px",
                        borderRadius: 20,
                        borderLeft: `5px solid ${accentColor}`,
                        background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
                        borderTop: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#cbd5e1"}`,
                        borderRight: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#cbd5e1"}`,
                        borderBottom: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#cbd5e1"}`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 14,
                        boxShadow: dark
                          ? "0 4px 20px rgba(0,0,0,0.25)"
                          : "0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 22 }}>{c.emoji || "⚡"}</span>
                            <div>
                              <div style={{ fontFamily: FONT.display, fontSize: 15.5, fontWeight: 800, color: T.text }}>
                                {c.title}
                              </div>
                              <div style={{ fontSize: 11.5, color: T.textSub, marginTop: 2 }}>
                                Day {c.daysCompleted || 1} of {c.totalDays} · {c.daysLeft}d left
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "3px 9px",
                              borderRadius: 8,
                              background: "rgba(249,115,22,0.12)",
                              color: "#f97316",
                              border: "1px solid rgba(249,115,22,0.25)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            🔥 {c.streak || c.daysCompleted || 1}d streak
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 5 }}>
                            <span>Progress</span>
                            <span style={{ fontWeight: 700, color: accentColor }}>{c.pct || 0}%</span>
                          </div>
                          <div style={{ height: 7, borderRadius: 99, background: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0", overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${c.pct || 0}%`,
                                background: `linear-gradient(90deg, ${accentColor}, #10b981)`,
                                borderRadius: 99,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Check-in Button */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {isCheckedInToday ? (
                          <div
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: 12,
                              background: "rgba(16,185,129,0.12)",
                              border: "1.5px solid rgba(16,185,129,0.35)",
                              color: "#10b981",
                              fontSize: 12.5,
                              fontWeight: 800,
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <span>✓</span>
                            <span>Done Today (Streak Active)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDashboardCheckIn(c.id)}
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: 12,
                              border: "none",
                              background: `linear-gradient(135deg, ${accentColor}, #059669)`,
                              color: "#fff",
                              fontSize: 12.5,
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              boxShadow: "0 3px 12px rgba(16,185,129,0.28)",
                              transition: "transform 0.16s ease",
                            }}
                          >
                            <span>⚡</span>
                            <span>Check In for Today (Day {(c.daysCompleted || 0) + 1})</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/community?tab=challenges&challenge=${c.id}`)}
                          title="View quest roadmap & details in Community"
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                            background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                            color: dark ? T.textSub : "#475569",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

          {/* Checklist — Auto-dismisses when all setups complete */}
          {!isChecklistComplete && !checklistDismissed && (
            <Reveal delay={0.19}>
              <div className="sdiv"><div className="sdiv-line"/><div className="sdiv-txt">Getting Started</div><div className="sdiv-line"/></div>
              <div className="cl gl">
                <div className="cl-hd">
                  <div className="cl-t">Setup Checklist 📋</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="cl-pct">{checkDone}/{checklist.length} · {checkPct}%</div>
                    <button
                      onClick={() => {
                        setChecklistDismissed(true);
                        try { localStorage.setItem("ashfitverse_checklist_dismissed", "true"); } catch {}
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: dark ? T.textMuted : "#64748b",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "2px 6px",
                      }}
                      title="Dismiss checklist"
                    >
                      ✕
                    </button>
                  </div>
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
          )}

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

      <WorkoutDetailModal
        isOpen={Boolean(selectedWorkoutLog)}
        workout={selectedWorkoutLog}
        onClose={() => setSelectedWorkoutLog(null)}
        onViewAll={() => {
          setSelectedWorkoutLog(null);
          navigate("/workout-logger?tab=history");
        }}
        dark={dark}
        T={T}
      />

      {challengeToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: dark ? "#0f172a" : "#ffffff",
            border: "1.5px solid #10b981",
            color: "#10b981",
            padding: "12px 24px",
            borderRadius: 99,
            fontWeight: 800,
            fontSize: 13.5,
            zIndex: 99999,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>⚡</span>
          <span>Checked in for {challengeToast.title} (Day {challengeToast.day})!</span>
        </div>
      )}
      {/* Mobile Floating Bottom Navigation Dock */}
      <div className="mobile-bottom-dock">
        <button
          className="mbd-item active"
          onClick={() => { setActiveNav("Dashboard"); navigate("/dashboard"); }}
          aria-label="Dashboard"
        >
          <span className="mbd-icon">🏠</span>
          <span className="mbd-lbl">Home</span>
        </button>
        <button
          className="mbd-item"
          onClick={() => navigate("/community")}
          aria-label="Community"
        >
          <span className="mbd-icon">👥</span>
          <span className="mbd-lbl">Community</span>
        </button>
        <button
          className="mbd-item"
          onClick={() => navigate("/workout-logger")}
          aria-label="Workouts"
        >
          <span className="mbd-icon">🏋️</span>
          <span className="mbd-lbl">Workouts</span>
        </button>
        <button
          className="mbd-item"
          onClick={() => navigate("/diet-logger")}
          aria-label="Diet"
        >
          <span className="mbd-icon">🥗</span>
          <span className="mbd-lbl">Diet</span>
        </button>
        <button
          className="mbd-item"
          onClick={() => setShowProfile(true)}
          aria-label="Profile"
        >
          <span className="mbd-icon">👤</span>
          <span className="mbd-lbl">Profile</span>
        </button>
      </div>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={displayStreak}
        activeDates={activeDates}
        isTodayActive={isTodayActive}
        totalWorkouts={workouts.length}
        totalMeals={meals.length}
        dark={dark}
        T={T}
      />
    </>
  );
}
