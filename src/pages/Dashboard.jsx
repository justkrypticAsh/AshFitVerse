// src/pages/Dashboard.jsx — Real user data from Firestore via useUser()
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import useTheme from "../hooks/useTheme";
import useUser from "../hooks/useUser";
import { generateCSS, FONT, generatePageBG } from "../theme";

const WORKOUTS = [
  { name: "Chest Day",  exercises: "Bench Press · Incline Fly · Cable Cross", tag: "Push", color: "#4f8ef7", emoji: "💪", path: "/workout/chest" },
  { name: "Back Day",   exercises: "Deadlift · Pull-ups · Barbell Row",        tag: "Pull", color: "#a78bfa", emoji: "🏋️", path: "/workout/back"  },
  { name: "Leg Day",    exercises: "Squats · Leg Press · Romanian DL",         tag: "Legs", color: "#fb923c", emoji: "🦵", path: "/workout/legs"  },
  { name: "Core & Abs", exercises: "Planks · Dragon Flag · Russian Twist",     tag: "Core", color: "#34d399", emoji: "🔥", path: "/workout/core"  },
];

const ACHIEVEMENTS = [
  { label: "🔥 18-Day Streak", color: "#fb923c" },
  { label: "💪 First PR",      color: "#4f8ef7" },
  { label: "🥗 Clean Week",    color: "#34d399" },
  { label: "🏆 Top 10%",       color: "#fbbf24" },
  { label: "📈 5kg Progress",  color: "#a78bfa" },
  { label: "⚡ 100 Workouts",  color: "#f472b6" },
];

const MACRO_DATA = [
  { name: "Protein", value: 38, fill: "#4f8ef7" },
  { name: "Carbs",   value: 42, fill: "#a78bfa" },
  { name: "Fats",    value: 20, fill: "#fb923c" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const {
    user, clearUser, loading,
    isMale, isFemale,
    bmi, calorieTarget, weightProgress,
    getCycleDay, getPhaseName,
  } = useUser();

  const [mounted, setMounted]     = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => { setMounted(true); }, []);

  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const weeklyWeight = (() => {
    const w = parseFloat(user.weight) || 0;
    if (!w) return weekDays.map(day => ({ day, weight: 0 }));
    const logs = user.dailyLogs || {};
    const entries = Object.entries(logs).sort((a,b) => a[0].localeCompare(b[0])).slice(-7);
    if (entries.length >= 3) {
      return weekDays.map((day, i) => ({ day, weight: entries[i]?.[1]?.weight || w }));
    }
    return weekDays.map((day, i) => ({ day, weight: parseFloat((w + i * 0.05).toFixed(1)) }));
  })();

  const calGoal = calorieTarget || 2400;

  const calData = weekDays.map((day, i) => {
    const logs = user.dailyLogs || {};
    const entries = Object.entries(logs).sort((a,b) => a[0].localeCompare(b[0]));
    const entry = entries[i]?.[1];
    return {
      day,
      consumed: entry?.calories || calGoal + Math.round(Math.sin(i) * 150),
      burned:   entry?.burned   || Math.round(calGoal * 0.9 + Math.sin(i+1) * 100),
    };
  });

  const DIET_LOG = [
    { meal: "Breakfast", items: "Oats · Banana · Whey Protein", cal: 520, color: "#4f8ef7" },
    { meal: "Lunch",     items: "Chicken Rice Bowl · Salad",    cal: 680, color: "#a78bfa" },
    { meal: "Snack",     items: "Mixed Nuts · Greek Yogurt",    cal: 310, color: "#fb923c" },
    { meal: "Dinner",    items: "Salmon · Quinoa · Broccoli",   cal: 590, color: "#34d399" },
  ];

  const cycleDay = isFemale ? getCycleDay() : null;
  const cycleLen = parseInt(user.cycleLength) || 28;
  const bmiColor = !bmi ? T.accent : bmi < 18.5 ? T.accent : bmi < 25 ? T.green : T.orange;
  const bmiLabel = !bmi ? "Complete profile" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy ✓" : bmi < 30 ? "Overweight" : "Obese";

  const NAV_MAIN = [
    { label: "Dashboard", icon: "⊞", path: null },
    { label: "Community", icon: "◎", path: "/community", badge: "3" },
    { label: "Profile",   icon: "◉", path: "/profile" },
    ...(isFemale ? [{ label: "Women's Health", icon: "♀", path: "/female-health", color: "#f472b6" }] : []),
    ...(isMale   ? [{ label: "Men's Health",   icon: "♂", path: "/male-health",   color: "#4f8ef7" }] : []),
  ];

  const TOOLS = [
    { label: "Calorie Calc",    icon: "🔥", path: "/calorie-calculator" },
    { label: "Fat % Calc",      icon: "📊", path: "/fat-calculator"     },
    { label: "BMI Calc",        icon: "📏", path: "/bmi-calculator"     },
    { label: "Workout Planner", icon: "📋", path: "/workout-planner"    },
    { label: "Workout Logger",  icon: "📝", path: "/workout-logger"     },
    { label: "Diet Logger",     icon: "🥗", path: "/diet-logger"        },
    { label: "Diet Plan",       icon: "🍱", path: "/diet-plan"          },
    { label: "Shop",            icon: "🛒", path: "/shop"               },
    ...(isFemale ? [{ label: "Cycle Tracker",   icon: "📅", path: "/cycle-tracker"   }] : []),
    ...(isMale   ? [
      { label: "Sleep Tracker",   icon: "😴", path: "/sleep-tracker"   },
      { label: "Sexual Wellness", icon: "❤️", path: "/sexual-wellness" },
    ] : []),
  ];

  const QUICK_ACTIONS = [
    { label: "Calorie Calc",    icon: "🔥", path: "/calorie-calculator" },
    { label: "Fat % Calc",      icon: "📊", path: "/fat-calculator"     },
    { label: "Workout Planner", icon: "📋", path: "/workout-planner"    },
    { label: "Diet Logger",     icon: "🥗", path: "/diet-logger"        },
    { label: "Shop",            icon: "🛒", path: "/shop"               },
    { label: "Diet Plan",       icon: "🍱", path: "/diet-plan"          },
    ...(isFemale ? [{ label: "Women's Health", icon: "♀", path: "/female-health" }] : []),
    ...(isMale   ? [{ label: "Men's Health",   icon: "♂", path: "/male-health"   }] : []),
  ];

  const css = generateCSS(T, dark) + `
    .dr{min-height:100vh;display:flex;font-family:${FONT.body};background:${T.bg};color:${T.text};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;}
    .dash-bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
    .dash-bg img{width:100%;height:100%;object-fit:cover;opacity:${dark?"0.028":"0.04"};filter:${dark?"grayscale(100%) blur(2px)":"grayscale(50%) blur(1px)"};}
    .o1{top:-18%;left:-10%;width:1000px;height:1000px;background:radial-gradient(circle,${dark?"rgba(79,142,247,0.065)":"rgba(79,142,247,0.05)"} 0%,transparent 65%);animation:orbFloat1 24s ease-in-out infinite;}
    .o2{bottom:-20%;right:-12%;width:900px;height:900px;background:radial-gradient(circle,${dark?"rgba(167,139,250,0.055)":"rgba(167,139,250,0.04)"} 0%,transparent 65%);animation:orbFloat2 30s ease-in-out infinite;}
    .o3{top:30%;left:28%;width:700px;height:700px;background:radial-gradient(circle,${dark?"rgba(52,211,153,0.035)":"rgba(52,211,153,0.025)"} 0%,transparent 65%);animation:orbFloat3 20s ease-in-out infinite;}
    @keyframes orbFloat1{0%,100%{transform:translate(0,0)scale(1);}33%{transform:translate(55px,-45px)scale(1.06);}66%{transform:translate(-28px,55px)scale(0.96);}}
    @keyframes orbFloat2{0%,100%{transform:translate(0,0)scale(1);}50%{transform:translate(-65px,-55px)scale(1.09);}}
    @keyframes orbFloat3{0%,100%{transform:translate(0,0);}50%{transform:translate(45px,-40px);}}
    .sb{width:255px;min-height:100vh;background:${T.sidebar};border-right:1px solid ${T.glassBorder};display:flex;flex-direction:column;padding:28px 15px 22px;flex-shrink:0;position:relative;z-index:20;transition:background 0.5s,border 0.5s;backdrop-filter:blur(40px);}
    .sb::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,${T.accentSoft} 0%,transparent 100%);pointer-events:none;}
    .lg{font-family:${FONT.display};font-size:21px;font-weight:800;letter-spacing:0.04em;color:${T.text};padding:0 8px;margin-bottom:4px;}
    .lg span{color:${T.accent};}
    .lt{font-size:10px;color:${T.textMuted};letter-spacing:0.14em;text-transform:uppercase;font-weight:600;padding:0 8px;margin-bottom:24px;}
    .su{padding:13px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:15px;backdrop-filter:blur(20px);display:flex;align-items:center;gap:11px;cursor:pointer;transition:all 0.25s;margin-bottom:22px;}
    .su:hover{border-color:${T.accent}35;}
    .sa{width:37px;height:37px;border-radius:50%;border:2px solid ${T.accent}40;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;}
    .sn{font-size:13px;font-weight:700;color:${T.text};}
    .sg2{font-size:11px;color:${T.accent};font-weight:500;text-transform:capitalize;}
    .gbdg{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;margin-top:3px;border:1px solid;}
    .nl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};padding:0 8px;margin:16px 0 5px;}
    .ni{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:13px;cursor:pointer;font-size:13.5px;font-weight:500;color:${T.textSub};transition:all 0.22s;margin-bottom:2px;border:1px solid transparent;}
    .ni:hover{color:${T.text};background:${T.glass};border-color:${T.glassBorder};}
    .ni.na{background:linear-gradient(135deg,${T.accentSoft},${T.purpleSoft});color:${T.accent};border-color:${T.accent}24;box-shadow:0 4px 20px ${T.accentGlow}40;font-weight:600;}
    .nn{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
    .nb2{margin-left:auto;padding:2px 7px;background:${T.accent}22;color:${T.accent};border-radius:99px;font-size:10px;font-weight:800;}
    .ti{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};transition:all 0.2s;margin-bottom:1px;}
    .ti:hover{color:${T.text};background:${T.glass};}
    .tic{font-size:14px;width:18px;text-align:center;}
    .lb{width:100%;padding:11px;border-radius:13px;border:1px solid rgba(248,113,113,0.18);background:rgba(248,113,113,0.05);color:${T.red};font-size:13px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;letter-spacing:0.04em;margin-top:auto;}
    .lb:hover{background:rgba(248,113,113,0.12);border-color:${T.red}45;}
    .mn{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}
    .tb{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;animation:fadeUp 0.6s ease both;}
    .tt{font-family:${FONT.display};font-size:27px;font-weight:800;color:${T.text};letter-spacing:-0.02em;}
    .ts{font-size:13px;color:${T.textSub};margin-top:3px;}
    .tr{display:flex;align-items:center;gap:11px;}
    .sp{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);font-size:13px;font-weight:700;color:#fb923c;}
    .gbanner{border-radius:20px;padding:18px 22px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;border:1px solid;cursor:pointer;transition:all 0.3s;}
    .gbanner:hover{transform:translateY(-2px);}
    .qa{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
    .qb{padding:18px 10px 15px;border-radius:18px;border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(24px);cursor:pointer;font-family:${FONT.body};font-size:12px;font-weight:600;color:${T.textSub};transition:all 0.25s cubic-bezier(0.4,0,0.2,1);text-align:center;}
    .qb:hover{border-color:${T.accent}38;color:${T.accent};background:linear-gradient(135deg,${T.accent}10,${T.purple}08);transform:translateY(-4px);box-shadow:0 16px 36px ${T.accentGlow}55;}
    .qi{font-size:24px;display:block;margin-bottom:9px;}
    .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px;}
    .sc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:22px;backdrop-filter:blur(28px);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
    .sc:hover{transform:translateY(-5px);border-color:${T.glassBorderHover};box-shadow:0 28px 70px rgba(0,0,0,${dark?"0.38":"0.12"});}
    .sglow{position:absolute;width:150px;height:150px;border-radius:50%;top:-50px;right:-50px;filter:blur(55px);opacity:0.55;pointer-events:none;}
    .sshim{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,${dark?"0.025":"0.5"}) 50%,transparent 65%);background-size:200% 100%;animation:shimmerAnim 4s ease-in-out infinite;}
    .sl{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${T.textMuted};margin-bottom:10px;}
    .sv{font-family:${FONT.display};font-size:36px;font-weight:800;line-height:1;letter-spacing:-0.02em;animation:countUp 0.9s ease both;}
    .ssub{font-size:12px;color:${T.textSub};margin-top:7px;}
    .pt{height:5px;background:${dark?"rgba(255,255,255,0.055)":"rgba(0,0,0,0.06)"};border-radius:99px;overflow:hidden;margin-top:14px;}
    .pf{height:100%;border-radius:99px;transition:width 1.8s cubic-bezier(0.4,0,0.2,1);}
    .cr{display:grid;grid-template-columns:1.5fr 1fr;gap:14px;margin-bottom:24px;}
    .cr2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:26px;}
    .cc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .cc:hover{border-color:${T.glassBorderHover};}
    .ct{font-family:${FONT.display};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:18px;}
    .gc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:24px;backdrop-filter:blur(28px);}
    .gbr{display:flex;justify-content:space-between;font-size:12px;color:${T.textSub};margin-bottom:10px;}
    .gbt{height:10px;background:${dark?"rgba(255,255,255,0.055)":"rgba(0,0,0,0.06)"};border-radius:99px;overflow:hidden;}
    .gbf{height:100%;border-radius:99px;background:linear-gradient(90deg,${T.accent},${T.purple});transition:width 1.9s cubic-bezier(0.4,0,0.2,1);}
    .gp{font-size:12px;color:${T.accent};margin-top:8px;font-weight:700;}
    .ir{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid ${T.glassBorder};font-size:13px;}
    .ik{color:${T.textSub};}
    .iv{font-weight:700;}
    .st{font-family:${FONT.display};font-size:19px;font-weight:800;color:${T.text};letter-spacing:-0.01em;margin-bottom:16px;}
    .wg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .wc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);cursor:pointer;position:relative;overflow:hidden;}
    .wc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--wc)0a,transparent 55%);pointer-events:none;}
    .wc:hover{transform:translateY(-6px);border-color:var(--wc);box-shadow:0 28px 65px rgba(0,0,0,${dark?"0.32":"0.13"}),0 0 0 1px var(--wc)35;}
    .we{font-size:30px;margin-bottom:13px;display:block;}
    .wn{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};margin-bottom:7px;}
    .wx{font-size:12px;color:${T.textSub};line-height:1.55;margin-bottom:14px;}
    .wt{display:inline-block;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.05em;}
    .ws{width:100%;margin-top:14px;padding:11px;border-radius:12px;border:none;font-size:13px;font-weight:800;font-family:${FONT.body};cursor:pointer;letter-spacing:0.04em;transition:all 0.25s;}
    .ws:hover{transform:translateY(-2px);filter:brightness(1.12);}
    .dg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
    .dc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .dc:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .dm{font-family:${FONT.display};font-size:14px;font-weight:700;color:${T.text};}
    .di{font-size:12px;color:${T.textSub};line-height:1.55;margin:8px 0 12px;}
    .dv{font-family:${FONT.display};font-size:22px;font-weight:800;}
    .dk{font-size:11px;font-weight:500;color:${T.textSub};}
    .ar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px;}
    .ab{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:700;border:1px solid;cursor:default;transition:all 0.25s;}
    .ab:hover{transform:translateY(-3px);}
    .cs{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;padding:22px 28px;backdrop-filter:blur(28px);display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;transition:all 0.3s;}
    .cs:hover{border-color:${T.accent}30;}
    .fa{display:flex;}
    .fav{width:36px;height:36px;border-radius:50%;border:2px solid ${T.bg};margin-left:-10px;}
    .fav:first-child{margin-left:0;}
    .fc{width:36px;height:36px;border-radius:50%;background:${T.accent}20;border:2px solid ${T.accent}40;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${T.accent};margin-left:-10px;}
    .cta{padding:11px 24px;border-radius:13px;border:1px solid ${T.accent}35;background:${T.accent}10;color:${T.accent};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.25s;}
    .cta:hover{background:${T.accent}20;box-shadow:0 0 22px ${T.accentGlow};}
    .incomplete-banner{border-radius:16px;padding:16px 20px;margin-bottom:20px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.22);display:flex;align-items:center;gap:14px;animation:fadeUp 0.6s ease both;}

    /* ── Pro subscription banner ── */
    .pro-banner{
      border-radius:22px;padding:24px 28px;margin-bottom:28px;
      background:linear-gradient(135deg,rgba(79,142,247,0.12) 0%,rgba(167,139,250,0.1) 50%,rgba(251,146,60,0.08) 100%);
      border:1px solid rgba(79,142,247,0.25);
      display:flex;align-items:center;justify-content:space-between;gap:20px;
      position:relative;overflow:hidden;
      animation:fadeUp 0.6s ease both;
      cursor:pointer;transition:all 0.3s;
    }
    .pro-banner:hover{border-color:rgba(79,142,247,0.5);transform:translateY(-2px);box-shadow:0 20px 50px rgba(79,142,247,0.12);}
    .pro-banner::before{
      content:'';position:absolute;top:-30px;right:-30px;
      width:200px;height:200px;border-radius:50%;
      background:radial-gradient(circle,rgba(167,139,250,0.15),transparent 70%);
      pointer-events:none;
    }
    .pro-badge{
      display:inline-flex;align-items:center;gap:6px;
      padding:4px 12px;border-radius:99px;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      font-size:10px;font-weight:800;color:#fff;letter-spacing:0.12em;
      text-transform:uppercase;margin-bottom:8px;
    }
    .pro-title{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};margin-bottom:5px;}
    .pro-sub{font-size:13px;color:${T.textSub};line-height:1.5;}
    .pro-features{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;}
    .pro-feat{display:flex;align-items:center;gap:6px;font-size:12px;color:${T.textSub};font-weight:500;}
    .pro-btn{
      padding:13px 28px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;cursor:pointer;white-space:nowrap;flex-shrink:0;
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 8px 24px ${T.accentGlow};
    }
    .pro-btn:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 16px 36px ${T.accentGlow};}

    /* ── Section divider ── */
    .sec-divider{
      display:flex;align-items:center;gap:14px;margin:8px 0 20px;
    }
    .sec-divider-line{flex:1;height:1px;background:${T.glassBorder};}
    .sec-divider-txt{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};}

    @keyframes shimmerAnim{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes countUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:1200px){.sg,.wg,.dg{grid-template-columns:repeat(2,1fr);}.cr,.cr2{grid-template-columns:1fr;}}
    @media(max-width:768px){.sb{display:none;}.mn{padding:20px 16px;}.qa{grid-template-columns:repeat(2,1fr);}.sg{grid-template-columns:repeat(2,1fr);}.wg,.dg{grid-template-columns:1fr 1fr;}}
  `;

  const CT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: dark?"rgba(7,8,15,0.96)":"rgba(255,255,255,0.97)", border:`1px solid ${T.glassBorder}`, borderRadius:14, padding:"12px 16px", fontSize:12, color:T.text }}>
        <div style={{ fontFamily:FONT.display, fontWeight:700, marginBottom:5 }}>{label}</div>
        {payload.map((p,i) => (
          <div key={i} style={{ color:p.color||p.fill, display:"flex", gap:14, justifyContent:"space-between" }}>
            <span>{p.name}</span><b>{p.value}</b>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:FONT.display, fontSize:22, fontWeight:800, color:T.text, marginBottom:16 }}>
              AshFit<span style={{ color:T.accent }}>Verse</span>
            </div>
            <div style={{ width:36, height:36, border:`3px solid ${T.glassBorder}`, borderTopColor:T.accent, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </>
    );
  }

  const profileIncomplete = !user.weight || !user.height || !user.age;

  return (
    <>
      <style>{css}</style>
      <div className="dr">
        <div className="dash-bg" style={{ background: generatePageBG(T, dark, isFemale ? "female" : isMale ? "male" : "default") }} />
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />

        <aside className="sb">
          <div className="lg">AshFit<span>Verse</span></div>
          <div className="lt">Premium Fitness OS</div>
          <div className="su">
            <div className="sa">{user.name?.[0]?.toUpperCase() || "A"}</div>
            <div>
              <div className="sn">{user.name || "Athlete"}</div>
              <div className="sg2">{user.goal?.replace(/_/g," ") || "Fitness"}</div>
              {isFemale && <div className="gbdg" style={{ color:"#f472b6", borderColor:"rgba(244,114,182,0.28)", background:"rgba(244,114,182,0.1)" }}>♀ Female</div>}
              {isMale   && <div className="gbdg" style={{ color:T.accent, borderColor:`${T.accent}28`, background:T.accentSoft }}>♂ Male</div>}
            </div>
          </div>
          <div className="nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div key={n.label}
              className={`ni ${activeNav===n.label?"na":""}`}
              style={activeNav===n.label&&n.color?{color:n.color,borderColor:`${n.color}25`,background:`${n.color}12`}:{}}
              onClick={() => { setActiveNav(n.label); if(n.path) navigate(n.path); }}>
              <span className="nn">{n.icon}</span><span>{n.label}</span>
              {n.badge && <span className="nb2">{n.badge}</span>}
            </div>
          ))}
          <div className="nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="ti" onClick={() => navigate(t.path)}>
              <span className="tic">{t.icon}</span><span>{t.label}</span>
            </div>
          ))}
          <button className="lb" onClick={clearUser} style={{ marginTop:20 }}>⎋ &nbsp;Logout</button>
        </aside>

        <main className="mn">
          <div className="tb">
            <div>
              <div className="tt">{(() => { const h=new Date().getHours(); return `Good ${h<12?"morning":h<17?"afternoon":"evening"}, ${user.name?.split(" ")[0]||"Athlete"} 👋`; })()}</div>
              <div className="ts">Here's your complete fitness overview for today</div>
            </div>
            <div className="tr">
              {(user.streak||0)>0 && <div className="sp">🔥 {user.streak}-day streak</div>}
              <button style={{ width:42,height:42,borderRadius:13,border:`1px solid ${T.glassBorder}`,background:T.glass,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,cursor:"pointer",color:T.textSub }}>🔔</button>
              <button className="theme-toggle" onClick={toggleTheme}><div className="toggle-thumb">{dark?"🌙":"☀️"}</div></button>
              <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",cursor:"pointer",border:`2px solid ${T.accent}40` }}>
                {user.name?.[0]?.toUpperCase()||"A"}
              </div>
            </div>
          </div>

          {profileIncomplete && (
            <div className="incomplete-banner">
              <span style={{ fontSize:22 }}>⚠️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#fbbf24" }}>Complete your profile</div>
                <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>Add height, weight and age to unlock personalised calorie targets and BMI.</div>
              </div>
              <button onClick={() => navigate("/onboarding")} style={{ padding:"9px 18px",borderRadius:11,border:"1px solid rgba(251,191,36,0.35)",background:"rgba(251,191,36,0.1)",color:"#fbbf24",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT.body,whiteSpace:"nowrap" }}>Complete →</button>
            </div>
          )}

          {isFemale && (
            <div style={{ borderRadius:20,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.22)",cursor:"pointer",animation:"fadeUp 0.6s ease both" }} onClick={() => navigate("/female-health")}>
              <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                <span style={{ fontSize:28 }}>📅</span>
                <div>
                  <div style={{ fontFamily:FONT.display,fontSize:15,fontWeight:800,color:"#f472b6" }}>{cycleDay?`Cycle Day ${cycleDay} — ${getPhaseName(cycleDay)}`:"Set up Cycle Tracking"}</div>
                  <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>{cycleDay?`${cycleLen-cycleDay} days until next period`:"Add your last period date"}</div>
                </div>
              </div>
              <button style={{ padding:"10px 20px",borderRadius:12,border:"1px solid rgba(244,114,182,0.35)",background:"rgba(244,114,182,0.12)",color:"#f472b6",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>Women's Health →</button>
            </div>
          )}

          {isMale && (
            <div className="gbanner" style={{ background:T.accentSoft,borderColor:`${T.accent}30`,animation:"fadeUp 0.6s ease both" }} onClick={() => navigate("/male-health")}>
              <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                <span style={{ fontSize:28 }}>♂</span>
                <div>
                  <div style={{ fontFamily:FONT.display,fontSize:15,fontWeight:800,color:T.accent }}>Men's Health Hub</div>
                  <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>Testosterone · Mental Health · Sexual Wellness · Sleep</div>
                </div>
              </div>
              <button style={{ padding:"10px 20px",borderRadius:12,border:"none",background:T.accent,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:FONT.body }}>Open →</button>
            </div>
          )}

          <div className="qa" style={{ animation:"fadeUp 0.6s ease 0.05s both" }}>
            {QUICK_ACTIONS.map((t,i) => <button key={i} className="qb" onClick={() => navigate(t.path)}><span className="qi">{t.icon}</span>{t.label}</button>)}
          </div>

          {/* ── PRO SUBSCRIPTION BANNER ── */}
          {!user.isPro && (
            <div className="pro-banner" onClick={() => navigate("/pricing")} style={{ animation:"fadeUp 0.6s ease 0.08s both" }}>
              <div style={{ position:"relative",zIndex:1 }}>
                <div className="pro-badge">⚡ AshFitVerse Pro</div>
                <div className="pro-title">Unlock Your Full Potential</div>
                <div className="pro-sub">AI-powered plans, advanced analytics, priority support and exclusive health features — all in one place.</div>
                <div className="pro-features">
                  {["🧬 Hormone-synced AI","📊 Advanced analytics","🔒 Health vault","🏆 Elite community","💊 Supplement AI","📱 Wearable sync"].map((f,i) => (
                    <div key={i} className="pro-feat"><span style={{ color:T.accent }}>✓</span> {f}</div>
                  ))}
                </div>
              </div>
              <div style={{ position:"relative",zIndex:1,textAlign:"center",flexShrink:0 }}>
                <div style={{ fontFamily:FONT.display,fontSize:11,color:T.textMuted,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase" }}>Starting at</div>
                <div style={{ fontFamily:FONT.display,fontSize:36,fontWeight:800,color:T.accent,lineHeight:1 }}>₹299</div>
                <div style={{ fontSize:11,color:T.textMuted,marginBottom:14 }}>/month</div>
                <button className="pro-btn" onClick={e => { e.stopPropagation(); navigate("/pricing"); }}>Go Pro →</button>
                <div style={{ fontSize:10,color:T.textMuted,marginTop:8 }}>Cancel anytime</div>
              </div>
            </div>
          )}

          <div className="sec-divider" style={{ animation:"fadeUp 0.6s ease 0.09s both" }}>
            <div className="sec-divider-line" /><div className="sec-divider-txt">Your Stats</div><div className="sec-divider-line" />
          </div>

          <div className="sg" style={{ animation:"fadeUp 0.6s ease 0.1s both" }}>
            {[
              { label:"Current Weight", val:user.weight?`${user.weight}`:"—", unit:"kg", sub:user.targetWeight?`Goal: ${user.targetWeight} kg`:"Set a goal weight", color:T.accent, glow:T.accentGlow, prog:weightProgress },
              { label:"BMI Index",      val:bmi?`${bmi}`:"—",                 unit:"",   sub:bmiLabel,                                                                  color:bmiColor,  glow:T.greenGlow,   prog:bmi?Math.min((bmi/30)*100,100):0 },
              { label:"Calorie Target", val:calorieTarget?`${calorieTarget}`:"—", unit:"kcal", sub:user.goal?.replace(/_/g," ")||"Set your goal",                    color:T.green,   glow:T.greenGlow,   prog:calorieTarget?72:0 },
              {
                label: isFemale?"Cycle Day":"Height",
                val:   isFemale?(cycleDay?`${cycleDay}`:"—"):(user.height?`${user.height}`:"—"),
                unit:  isFemale?`/ ${cycleLen}`:"cm",
                sub:   isFemale?getPhaseName(cycleDay):(user.age?`Age: ${user.age} yrs`:"Complete profile"),
                color: isFemale?"#f472b6":T.purple, glow:T.purpleGlow,
                prog:  isFemale?(cycleDay?(cycleDay/cycleLen)*100:0):(user.height?100:0),
              },
            ].map((s,i) => (
              <div key={i} className="sc">
                <div className="sshim"/><div className="sglow" style={{ background:s.glow }}/>
                <div className="sl">{s.label}</div>
                <div className="sv" style={{ color:s.color }}>{s.val}<span style={{ fontSize:15,fontWeight:500,color:T.textSub,marginLeft:4 }}>{s.unit}</span></div>
                <div className="ssub">{s.sub}</div>
                <div className="pt"><div className="pf" style={{ width:`${Math.min(s.prog||0,100)}%`,background:`linear-gradient(90deg,${s.color},${s.color}88)` }}/></div>
              </div>
            ))}
          </div>

          <div className="cr" style={{ animation:"fadeUp 0.6s ease 0.15s both" }}>
            <div className="cc">
              <div className="ct">Weight Trend — This Week</div>
              <ResponsiveContainer width="100%" height={215}>
                <AreaChart data={weeklyWeight} margin={{ top:5,right:5,bottom:0,left:-22 }}>
                  <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.28}/><stop offset="100%" stopColor={T.accent} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"}/>
                  <XAxis dataKey="day" tick={{ fill:T.textSub,fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis domain={["auto","auto"]} tick={{ fill:T.textSub,fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke={T.accent} strokeWidth={2.5} fill="url(#wg)" dot={{ fill:T.accent,r:4,strokeWidth:0 }} activeDot={{ r:6,strokeWidth:0,fill:T.accent }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="gc">
              <div className="ct">Your Profile</div>
              <div className="gbr"><span>Start: {user.weight?(+user.weight-5).toFixed(1):"—"} kg</span><span>Target: {user.targetWeight||"—"} kg</span></div>
              <div className="gbt"><div className="gbf" style={{ width:`${weightProgress}%` }}/></div>
              <div className="gp">{weightProgress}% complete</div>
              <div style={{ marginTop:20 }}>
                {[
                  { k:"Activity",  v:user.activityLevel?.replace(/_/g," ")||"—", c:T.green  },
                  { k:"Age",       v:user.age?`${user.age} yrs`:"—",              c:T.purple },
                  { k:"Height",    v:user.height?`${user.height} cm`:"—",         c:T.orange },
                  { k:"Goal",      v:user.goal?.replace(/_/g," ")||"—",            c:T.accent },
                  { k:"Equipment", v:user.equipment?.replace(/_/g," ")||"—",       c:T.textSub },
                  { k:"Sex",       v:user.sex||"—",                                c:user.sex==="female"?"#f472b6":T.accent },
                ].map((r,i,a) => (
                  <div key={i} className="ir" style={{ borderColor:i===a.length-1?"transparent":undefined }}>
                    <span className="ik">{r.k}</span>
                    <span className="iv" style={{ color:r.c,textTransform:"capitalize" }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cr2" style={{ animation:"fadeUp 0.6s ease 0.2s both" }}>
            <div className="cc">
              <div className="ct">Calorie Balance — This Week</div>
              <ResponsiveContainer width="100%" height={215}>
                <BarChart data={calData} barGap={3} margin={{ top:5,right:5,bottom:0,left:-22 }}>
                  <defs>
                    <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={1}/><stop offset="100%" stopColor={T.accent} stopOpacity={0.4}/></linearGradient>
                    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.purple} stopOpacity={1}/><stop offset="100%" stopColor={T.purple} stopOpacity={0.4}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"}/>
                  <XAxis dataKey="day" tick={{ fill:T.textSub,fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:T.textSub,fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CT/>}/>
                  <Legend wrapperStyle={{ fontSize:12,color:T.textSub }}/>
                  <Bar dataKey="consumed" name="Consumed" fill="url(#bg1)" radius={[7,7,0,0]}/>
                  <Bar dataKey="burned"   name="Burned"   fill="url(#bg2)" radius={[7,7,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="cc">
              <div className="ct">Macro Split (Target)</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={MACRO_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {MACRO_DATA.map((m,i) => <Cell key={i} fill={m.fill}/>)}
                  </Pie>
                  <Tooltip content={<CT/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex",justifyContent:"center",gap:22,marginTop:10 }}>
                {MACRO_DATA.map((m,i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:m.fill,margin:"0 auto 5px" }}/>
                    <div style={{ fontSize:11,color:T.textSub,fontWeight:600 }}>{m.name}</div>
                    <div style={{ fontSize:17,fontWeight:800,color:m.fill,fontFamily:FONT.display }}>{m.value}%</div>
                  </div>
                ))}
              </div>
              {calorieTarget && (
                <div style={{ marginTop:16,padding:"12px",borderRadius:12,background:T.accentSoft,border:`1px solid ${T.accent}25`,fontSize:12,color:T.textSub,textAlign:"center" }}>
                  Protein: <b style={{ color:T.accent }}>{Math.round(calorieTarget*0.38/4)}g</b> · Carbs: <b style={{ color:T.purple }}>{Math.round(calorieTarget*0.42/4)}g</b> · Fats: <b style={{ color:T.orange }}>{Math.round(calorieTarget*0.20/9)}g</b>
                </div>
              )}
            </div>
          </div>

          <div className="sec-divider"><div className="sec-divider-line"/><div className="sec-divider-txt">Today's Training</div><div className="sec-divider-line"/></div>
          <div className="st" style={{ animation:"fadeUp 0.6s ease 0.25s both" }}>Today's Workouts</div>
          <div className="wg" style={{ animation:"fadeUp 0.6s ease 0.28s both" }}>
            {WORKOUTS.map((w,i) => (
              <div key={i} className="wc" style={{ "--wc":w.color }} onClick={() => navigate(w.path)}>
                <span className="we">{w.emoji}</span>
                <div className="wn">{w.name}</div>
                <div className="wx">{w.exercises}</div>
                <span className="wt" style={{ background:`${w.color}18`,color:w.color,border:`1px solid ${w.color}30` }}>{w.tag}</span>
                <button className="ws" style={{ background:`linear-gradient(135deg,${w.color},${w.color}cc)`,color:"#000" }}>Start Workout →</button>
              </div>
            ))}
          </div>

          <div className="sec-divider"><div className="sec-divider-line"/><div className="sec-divider-txt">Nutrition</div><div className="sec-divider-line"/></div>
          <div className="st" style={{ animation:"fadeUp 0.6s ease 0.3s both" }}>Today's Diet Log</div>
          <div className="dg" style={{ animation:"fadeUp 0.6s ease 0.33s both" }}>
            {DIET_LOG.map((d,i) => (
              <div key={i} className="dc">
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0 }}/>
                  <div className="dm">{d.meal}</div>
                </div>
                <div className="di">{d.items}</div>
                <div className="dv" style={{ color:d.color }}>{d.cal} <span className="dk">kcal</span></div>
                <div style={{ fontSize:11,color:T.textMuted,marginTop:4 }}>{Math.round((d.cal/calGoal)*100)}% of daily target</div>
                <div className="pt" style={{ marginTop:10 }}><div className="pf" style={{ width:`${Math.min((d.cal/calGoal)*100,100)}%`,background:d.color }}/></div>
              </div>
            ))}
          </div>

          <div className="sec-divider"><div className="sec-divider-line"/><div className="sec-divider-txt">Milestones</div><div className="sec-divider-line"/></div>
          <div className="st" style={{ animation:"fadeUp 0.6s ease 0.35s both" }}>Achievements</div>
          <div className="ar" style={{ animation:"fadeUp 0.6s ease 0.38s both" }}>
            {ACHIEVEMENTS.map((a,i) => <div key={i} className="ab" style={{ color:a.color,borderColor:`${a.color}30`,background:`${a.color}0e` }}>{a.label}</div>)}
          </div>

          <div className="cs" style={{ animation:"fadeUp 0.6s ease 0.4s both" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16 }}>
              <div className="fa">
                {[12,22,33,44,55].map(n => <img key={n} src={`https://i.pravatar.cc/40?img=${n}`} className="fav" alt="" style={{ objectFit:"cover" }}/>)}
                <div className="fc">+34</div>
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:T.text }}>Your Fitness Community</div>
                <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>See what your friends are training today</div>
              </div>
            </div>
            <button className="cta" onClick={() => navigate("/community")}>Community →</button>
          </div>
        </main>
      </div>
    </>
  );
}