import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const USER = {
  name: "Ash Kumar", avatar: "https://i.pravatar.cc/150?img=11",
  goal: "Muscle Gain", streak: 18,
};
const NAV_MAIN = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Community", icon: "◎", badge: "3", path: "/community" },
  { label: "Profile", icon: "◉", path: "/profile" },
];
const TOOLS = [
  { label: "Calorie Calc", icon: "🔥", path: "/calorie-calculator" },
  { label: "Fat % Calc", icon: "📊", path: "/fat-calculator" },
  { label: "BMI Calc", icon: "📏", path: "/bmi-calculator" },
  { label: "Workout Planner", icon: "📋", path: "/workout-planner" },
  { label: "Workout Logger", icon: "📝", path: "/workout-logger" },
  { label: "Diet Logger", icon: "🥗", path: "/diet-logger" },
  { label: "Diet Plan", icon: "🍱", path: "/diet-plan" },
];

const CATEGORIES = ["All", "Muscle Gain", "Fat Loss", "Strength", "HIIT", "Calisthenics", "Beginner"];

const TRAINERS = [
  {
    id: 1,
    name: "Jeff Nippard",
    title: "Science-Based Bodybuilding Coach",
    photo: "https://i.pravatar.cc/150?img=68",
    realPhoto: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
    followers: "5.2M",
    platform: "YouTube",
    speciality: "Muscle Gain",
    color: "#4f8ef7",
    rating: 4.9,
    reviews: 12400,
    duration: "12 Weeks",
    level: "Intermediate",
    tag: "Most Popular",
    tagColor: "#4f8ef7",
    about: "Science-backed hypertrophy program built around progressive overload, compound lifts, and evidence-based training volume.",
    plan: {
      frequency: "5 days/week",
      focus: "PPL + Upper/Lower Split",
      equipment: "Full Gym",
      weeks: [
        { label: "Week 1–4", name: "Foundation Phase", desc: "Build base strength with 3–4 sets per exercise at 70–75% 1RM." },
        { label: "Week 5–8", name: "Hypertrophy Phase", desc: "Increase volume to 4–5 sets, 8–12 reps. Add supersets." },
        { label: "Week 9–12", name: "Intensification Phase", desc: "Drop sets, rest-pause, mechanical drop sets for maximum hypertrophy." },
      ],
      exercises: ["Squat", "Bench Press", "Deadlift", "OHP", "Barbell Row", "Romanian DL", "Incline DB Press", "Cable Fly"],
    },
    link: "https://www.youtube.com/@JeffNippard",
  },
  {
    id: 2,
    name: "Kayla Itsines",
    title: "BBG & HIIT Specialist",
    photo: "https://i.pravatar.cc/150?img=47",
    realPhoto: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    followers: "15.8M",
    platform: "Instagram",
    speciality: "Fat Loss",
    color: "#f472b6",
    rating: 4.8,
    reviews: 89000,
    duration: "28 Min/Session",
    level: "Beginner",
    tag: "Most Followed",
    tagColor: "#f472b6",
    about: "The legendary BBG program — 28-minute HIIT circuits designed for women, requiring minimal equipment. Millions transformed worldwide.",
    plan: {
      frequency: "3 days/week",
      focus: "HIIT Circuits",
      equipment: "Minimal / Home",
      weeks: [
        { label: "Phase 1", name: "Foundation (Wk 1–4)", desc: "Body weight circuits: Push-ups, Burpees, Jump Squats, Plank. 2 rounds of 7 minutes." },
        { label: "Phase 2", name: "Resistance (Wk 5–8)", desc: "Add dumbbell work: Goblet Squats, Bent-over rows, Lateral raises." },
        { label: "Phase 3", name: "Endurance (Wk 9–12)", desc: "Combine LISS cardio 3x/week + higher intensity HIIT circuits." },
      ],
      exercises: ["Burpees", "Jump Squats", "Push-ups", "Mountain Climbers", "Tricep Dips", "Box Jumps", "Plank", "Bicycle Crunches"],
    },
    link: "https://www.sweat.com",
  },
  {
    id: 3,
    name: "Chris Heria",
    title: "Calisthenics & Street Workout",
    photo: "https://i.pravatar.cc/150?img=33",
    realPhoto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    followers: "4.8M",
    platform: "YouTube",
    speciality: "Calisthenics",
    color: "#34d399",
    rating: 4.9,
    reviews: 31200,
    duration: "8 Weeks",
    level: "Intermediate",
    tag: "No Gym Needed",
    tagColor: "#34d399",
    about: "Full calisthenics mastery program — from basics to handstands and muscle-ups. Train anywhere, anytime, with just your bodyweight.",
    plan: {
      frequency: "6 days/week",
      focus: "Bodyweight Progressions",
      equipment: "Pull-up Bar",
      weeks: [
        { label: "Week 1–2", name: "Foundation Skills", desc: "Perfect push-ups, pull-ups, dips and hollow body holds. Master form." },
        { label: "Week 3–5", name: "Skill Progressions", desc: "Pike push-ups, L-sit, muscle-up progressions, pistol squat work." },
        { label: "Week 6–8", name: "Advanced Skills", desc: "Handstand work, front lever progressions, planche lean training." },
      ],
      exercises: ["Pull-ups", "Dips", "Muscle-ups", "Handstand Push-ups", "L-sit", "Planche Lean", "Pistol Squats", "Dragon Flag"],
    },
    link: "https://www.youtube.com/@CHRISHERIA",
  },
  {
    id: 4,
    name: "Brad Schoenfeld",
    title: "PhD Exercise Science · Muscle Hypertrophy Expert",
    photo: "https://i.pravatar.cc/150?img=52",
    realPhoto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    followers: "800K",
    platform: "Research + IG",
    speciality: "Strength",
    color: "#a78bfa",
    rating: 5.0,
    reviews: 5200,
    duration: "16 Weeks",
    level: "Advanced",
    tag: "Science-Backed",
    tagColor: "#a78bfa",
    about: "Evidence-based strength & hypertrophy protocol from the world's leading muscle science researcher. Published 300+ peer-reviewed studies.",
    plan: {
      frequency: "4 days/week",
      focus: "Upper/Lower + Volume",
      equipment: "Full Gym",
      weeks: [
        { label: "Block 1 (Wk 1–4)", name: "Accumulation", desc: "High volume, moderate load. 4×12–15. Build work capacity and muscle endurance." },
        { label: "Block 2 (Wk 5–8)", name: "Intensification", desc: "Moderate volume, high load. 4×6–8. Strength focus with compound movements." },
        { label: "Block 3 (Wk 9–12)", name: "Realization", desc: "Low volume, max effort. 3×3–5. Peak strength expression." },
        { label: "Block 4 (Wk 13–16)", name: "Deload + Retest", desc: "Active recovery week, then test 1RMs to track full progress." },
      ],
      exercises: ["Back Squat", "Deadlift", "Bench Press", "Overhead Press", "Barbell Row", "Pull-ups", "Leg Press", "DB Incline"],
    },
    link: "https://www.instagram.com/bradschoenfeld_phd",
  },
  {
    id: 5,
    name: "Jillian Michaels",
    title: "Celebrity Trainer · Fat Loss Authority",
    photo: "https://i.pravatar.cc/150?img=44",
    realPhoto: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
    followers: "3.1M",
    platform: "App + YouTube",
    speciality: "Fat Loss",
    color: "#fb923c",
    rating: 4.7,
    reviews: 42000,
    duration: "30 Days",
    level: "Beginner",
    tag: "Biggest Loser",
    tagColor: "#fb923c",
    about: "30-Day Shred — the iconic fat-loss program. 3-2-1 circuit method: 3 min strength, 2 min cardio, 1 min abs. Burns fat fast.",
    plan: {
      frequency: "Daily",
      focus: "Circuit + HIIT",
      equipment: "Dumbbells + Mat",
      weeks: [
        { label: "Days 1–10", name: "Level 1 — Foundation", desc: "Basic 3-2-1 circuits. Squats, push-ups, bicycle crunches, jumping jacks." },
        { label: "Days 11–20", name: "Level 2 — Intensity", desc: "More complex movements, fewer rest periods. Plank jacks, walking push-ups." },
        { label: "Days 21–30", name: "Level 3 — Shred", desc: "Full intensity. Explosive plyometrics, combo exercises, minimal rest." },
      ],
      exercises: ["Jumping Jacks", "Push-ups", "Squats", "Bicycle Crunches", "Plank Jacks", "Butt Kicks", "Tricep Kicks", "Side Lunges"],
    },
    link: "https://www.jillianmichaels.com",
  },
  {
    id: 6,
    name: "AthleanX (Jeff Cavaliere)",
    title: "Physical Therapist · Strength Coach",
    photo: "https://i.pravatar.cc/150?img=60",
    realPhoto: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80",
    followers: "13.5M",
    platform: "YouTube",
    speciality: "Muscle Gain",
    color: "#f87171",
    rating: 4.9,
    reviews: 67000,
    duration: "90 Days",
    level: "Intermediate",
    tag: "PT Approved",
    tagColor: "#f87171",
    about: "ATHLEAN-X program — train like an athlete. Physical therapy principles meet elite training. Used by MLB, NBA, and NFL players.",
    plan: {
      frequency: "6 days/week",
      focus: "Athletic Performance + Hypertrophy",
      equipment: "Full Gym",
      weeks: [
        { label: "Month 1", name: "Foundation & Mobility", desc: "Corrective exercises + compound lifts. Fix imbalances. Build athletic base." },
        { label: "Month 2", name: "Strength & Power", desc: "Explosive reps, heavy compound, plyometrics integrated into lifting sessions." },
        { label: "Month 3", name: "Peak Performance", desc: "Sport-specific conditioning, max strength testing, metabolic finishers." },
      ],
      exercises: ["Weighted Pull-ups", "Landmine Press", "Bulgarian Split Squat", "Face Pulls", "Nordic Curl", "Trap Bar DL", "Pallof Press", "Cable Row"],
    },
    link: "https://www.youtube.com/@athleanx",
  },
];

const DT = {
  bg: "#060810", sidebar: "#07091a",
  glass: "rgba(255,255,255,0.035)", glassBorder: "rgba(255,255,255,0.075)",
  cardBorderHover: "rgba(255,255,255,0.15)",
  text: "#eef2ff", textSub: "rgba(200,212,255,0.52)", textMuted: "rgba(200,212,255,0.28)",
  accent: "#4f8ef7", accentGlow: "rgba(79,142,247,0.22)",
  green: "#34d399", purple: "#a78bfa", orange: "#fb923c", pink: "#f472b6",
};
const LT = {
  bg: "#f3f6ff", sidebar: "#ffffff",
  glass: "rgba(255,255,255,0.75)", glassBorder: "rgba(0,0,0,0.07)",
  cardBorderHover: "rgba(79,142,247,0.3)",
  text: "#0a0e1f", textSub: "rgba(10,14,31,0.52)", textMuted: "rgba(10,14,31,0.3)",
  accent: "#3b7ef0", accentGlow: "rgba(59,126,240,0.14)",
  green: "#10b981", purple: "#7c3aed", orange: "#f97316", pink: "#ec4899",
};

function StarRating({ rating, color }) {
  return (
    <span style={{ fontSize: 12, color }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ marginLeft: 5, fontWeight: 700 }}>{rating}</span>
    </span>
  );
}

export default function FreeWorkoutPlans() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [saved, setSaved] = useState([]);
  const T = dark ? DT : LT;

  useEffect(() => { setMounted(true); }, []);

  const filtered = TRAINERS.filter(t => {
    const matchCat = activeCategory === "All" || t.speciality === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.speciality.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${T.bg};overflow-x:hidden;}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${T.accent}40;border-radius:99px;}

    .dr{min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;background:${T.bg};color:${T.text};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;}

    .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;}
    .o1{top:-18%;left:-10%;width:1000px;height:1000px;background:radial-gradient(circle,${dark?"rgba(79,142,247,0.065)":"rgba(79,142,247,0.05)"} 0%,transparent 65%);animation:of1 24s ease-in-out infinite;}
    .o2{bottom:-20%;right:-12%;width:900px;height:900px;background:radial-gradient(circle,${dark?"rgba(167,139,250,0.055)":"rgba(167,139,250,0.04)"} 0%,transparent 65%);animation:of2 30s ease-in-out infinite;}
    .o3{top:30%;left:30%;width:700px;height:700px;background:radial-gradient(circle,${dark?"rgba(52,211,153,0.035)":"rgba(52,211,153,0.025)"} 0%,transparent 65%);animation:of3 20s ease-in-out infinite;}
    @keyframes of1{0%,100%{transform:translate(0,0)scale(1);}33%{transform:translate(55px,-45px)scale(1.07);}66%{transform:translate(-30px,55px)scale(0.95);}}
    @keyframes of2{0%,100%{transform:translate(0,0)scale(1);}50%{transform:translate(-65px,-55px)scale(1.1);}}
    @keyframes of3{0%,100%{transform:translate(0,0);}50%{transform:translate(45px,-40px);}}

    /* Sidebar */
    .sb{width:255px;min-height:100vh;background:${T.sidebar};border-right:1px solid ${T.glassBorder};display:flex;flex-direction:column;padding:28px 15px 22px;flex-shrink:0;position:relative;z-index:20;transition:background 0.5s,border 0.5s;backdrop-filter:blur(40px);}
    .sb::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,${T.accent}08 0%,transparent 100%);pointer-events:none;}
    .lg{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;letter-spacing:0.04em;color:${T.text};padding:0 8px;margin-bottom:4px;cursor:pointer;}
    .lg span{color:${T.accent};}
    .lt2{font-size:10px;color:${T.textMuted};letter-spacing:0.14em;text-transform:uppercase;font-weight:600;padding:0 8px;margin-bottom:24px;}
    .su{padding:13px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:15px;backdrop-filter:blur(20px);display:flex;align-items:center;gap:11px;cursor:pointer;transition:all 0.25s;margin-bottom:22px;}
    .su:hover{border-color:${T.accent}35;}
    .sa{width:37px;height:37px;border-radius:50%;border:2px solid ${T.accent}40;object-fit:cover;box-shadow:0 0 16px ${T.accentGlow};}
    .sn{font-size:13px;font-weight:700;color:${T.text};}
    .sg{font-size:11px;color:${T.accent};font-weight:500;}
    .nl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};padding:0 8px;margin:16px 0 5px;}
    .ni{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:13px;cursor:pointer;font-size:13.5px;font-weight:500;color:${T.textSub};transition:all 0.22s;margin-bottom:2px;border:1px solid transparent;}
    .ni:hover{color:${T.text};background:${T.glass};border-color:${T.glassBorder};}
    .ni.na{background:linear-gradient(135deg,${T.accent}16,${T.purple}0c);color:${T.accent};border-color:${T.accent}24;box-shadow:0 4px 20px ${T.accentGlow}40;}
    .nn{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
    .nbdg{margin-left:auto;padding:2px 7px;background:${T.accent}22;color:${T.accent};border-radius:99px;font-size:10px;font-weight:800;}
    .ti{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};transition:all 0.2s;margin-bottom:1px;}
    .ti:hover{color:${T.text};background:${T.glass};}
    .lb{width:100%;padding:11px;border-radius:13px;border:1px solid rgba(239,68,68,0.18);background:rgba(239,68,68,0.04);color:#f87171;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.25s;letter-spacing:0.04em;margin-top:auto;}
    .lb:hover{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);}

    /* Main */
    .mn{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}
    .tb{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;animation:fu 0.6s ease both;}
    .tt{font-family:'Syne',sans-serif;font-size:27px;font-weight:800;color:${T.text};letter-spacing:-0.02em;}
    .ts{font-size:13px;color:${T.textSub};margin-top:3px;}
    .tr{display:flex;align-items:center;gap:11px;}
    .sp{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);font-size:13px;font-weight:700;color:#fb923c;}
    .nb2{width:42px;height:42px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;transition:all 0.22s;color:${T.textSub};}
    .nb2:hover{border-color:${T.accent}30;color:${T.accent};}
    .tt2{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(12px);cursor:pointer;position:relative;transition:all 0.3s;}
    .th{width:23px;height:23px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});position:absolute;top:3px;left:${dark?"28px":"3px"};transition:left 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 8px ${T.accentGlow};}
    .av{width:42px;height:42px;border-radius:50%;border:2px solid ${T.accent}40;object-fit:cover;box-shadow:0 0 18px ${T.accentGlow};cursor:pointer;}

    /* Search + Filter bar */
    .filter-bar{display:flex;align-items:center;gap:12px;margin-bottom:24px;animation:fu 0.6s ease 0.08s both;flex-wrap:wrap;}
    .search-inp{flex:1;min-width:220px;padding:12px 18px;border-radius:14px;border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);color:${T.text};font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.25s;}
    .search-inp::placeholder{color:${T.textMuted};}
    .search-inp:focus{border-color:${T.accent}50;box-shadow:0 0 0 3px ${T.accentGlow};}
    .cat-btn{padding:9px 18px;border-radius:99px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.22s;white-space:nowrap;letter-spacing:0.03em;}
    .cat-btn:hover{border-color:${T.accent}40;color:${T.accent};}
    .cat-btn.active{background:linear-gradient(135deg,${T.accent},${T.purple});border-color:transparent;color:#fff;box-shadow:0 4px 16px ${T.accentGlow};}

    /* Stats bar */
    .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;animation:fu 0.6s ease 0.12s both;}
    .stat-mini{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:18px 20px;backdrop-filter:blur(20px);text-align:center;transition:all 0.3s;}
    .stat-mini:hover{transform:translateY(-3px);border-color:${T.cardBorderHover};}
    .stat-mini-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.02em;}
    .stat-mini-label{font-size:11px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    /* Trainer cards grid */
    .cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:20px;margin-bottom:40px;}

    /* Trainer card */
    .tcard{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:24px;overflow:hidden;backdrop-filter:blur(28px);transition:all 0.35s cubic-bezier(0.4,0,0.2,1);position:relative;animation:fu 0.6s ease both;}
    .tcard:hover{transform:translateY(-6px);border-color:var(--tc);box-shadow:0 28px 70px rgba(0,0,0,${dark?"0.35":"0.1"}),0 0 0 1px var(--tc)25;}

    /* Card header with cover bg */
    .tcard-header{padding:22px 22px 0;position:relative;}
    .tcard-cover{position:absolute;inset:0;background:linear-gradient(135deg,var(--tc)20,var(--tc)05);pointer-events:none;}

    /* Trainer info row */
    .trainer-row{display:flex;align-items:flex-start;gap:16px;position:relative;z-index:1;padding-bottom:20px;}
    .trainer-photo{width:72px;height:72px;border-radius:20px;object-fit:cover;border:3px solid var(--tc);box-shadow:0 0 24px var(--tc)44;flex-shrink:0;}
    .trainer-info{flex:1;min-width:0;}
    .trainer-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${T.text};margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .trainer-title{font-size:12px;color:${T.textSub};font-weight:500;margin-bottom:8px;line-height:1.4;}
    .trainer-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;}
    .trainer-actions{display:flex;gap:8px;align-items:center;margin-top:4px;}
    .save-btn{width:34px;height:34px;border-radius:10px;border:1px solid ${T.glassBorder};background:${T.glass};cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.22s;}
    .save-btn:hover{border-color:${T.accent}40;background:${T.accent}10;}
    .save-btn.saved{background:rgba(251,146,60,0.12);border-color:rgba(251,146,60,0.3);}

    /* Platform + followers */
    .meta-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .meta-pill{padding:4px 10px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:0.05em;background:var(--tc)14;color:var(--tc);border:1px solid var(--tc)25;}

    /* Card body */
    .tcard-body{padding:0 22px 22px;}
    .about-text{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:16px;padding-top:16px;border-top:1px solid ${T.glassBorder};}

    /* Quick stats */
    .qstats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .qstat{background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:12px;padding:10px;text-align:center;}
    .qstat-val{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:${T.text};}
    .qstat-label{font-size:10px;color:${T.textMuted};font-weight:600;margin-top:2px;}

    /* Exercises */
    .exercise-wrap{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
    .ex-pill{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};color:${T.textSub};border:1px solid ${T.glassBorder};}

    /* Expand toggle */
    .expand-btn{width:100%;padding:11px;border-radius:14px;border:1px solid var(--tc)35;background:var(--tc)10;color:var(--tc);font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.25s;letter-spacing:0.03em;margin-bottom:10px;}
    .expand-btn:hover{background:var(--tc)18;}

    /* Expanded plan */
    .plan-section{border-top:1px solid ${T.glassBorder};padding-top:16px;animation:fu 0.4s ease both;}
    .plan-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:${T.text};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;}
    .week-row{display:flex;gap:12px;margin-bottom:10px;padding:12px;border-radius:14px;background:${dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"};border:1px solid ${T.glassBorder};}
    .week-dot{width:6px;height:6px;border-radius:50%;background:var(--tc);flex-shrink:0;margin-top:7px;box-shadow:0 0 8px var(--tc);}
    .week-label{font-size:10px;font-weight:700;color:var(--tc);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:3px;}
    .week-name{font-size:13px;font-weight:700;color:${T.text};margin-bottom:3px;}
    .week-desc{font-size:12px;color:${T.textSub};line-height:1.5;}

    /* CTA button */
    .view-btn{width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,var(--tc),var(--tc)aa);color:#fff;font-size:13px;font-weight:800;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.25s;letter-spacing:0.04em;margin-top:12px;}
    .view-btn:hover{opacity:0.88;transform:translateY(-2px);box-shadow:0 10px 28px var(--tc)44;}

    /* Rating */
    .rating-row{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
    .review-count{font-size:11px;color:${T.textMuted};font-weight:600;}

    /* No results */
    .no-results{grid-column:1/-1;text-align:center;padding:60px 20px;color:${T.textMuted};font-size:15px;}

    @keyframes fu{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:1100px){.mn{padding:24px 20px;}.stats-bar{grid-template-columns:repeat(2,1fr);}.cards-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.sb{display:none;}.mn{padding:20px 16px;}.filter-bar{gap:8px;}.stats-bar{grid-template-columns:repeat(2,1fr);}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="dr">
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="lg" onClick={() => navigate("/dashboard")}>AshFit<span>Verse</span></div>
          <div className="lt2">Premium Fitness OS</div>
          <div className="su" onClick={() => navigate("/profile")}>
            <img src={USER.avatar} className="sa" alt="avatar" />
            <div><div className="sn">{USER.name}</div><div className="sg">{USER.goal}</div></div>
          </div>
          <div className="nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div key={n.label} className={`ni ${activeNav === n.label ? "na" : ""}`}
              onClick={() => { setActiveNav(n.label); navigate(n.path); }}>
              <span className="nn">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="nbdg">{n.badge}</span>}
            </div>
          ))}
          <div className="nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="ti" onClick={() => navigate(t.path)}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <div className="ti na" style={{ marginTop: 2, color: T.accent, background: T.glass }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>🏋️</span>
            <span style={{ fontWeight: 700 }}>Free Plans</span>
          </div>
          <button className="lb" onClick={() => navigate("/")} style={{ marginTop: 20 }}>⎋ &nbsp;Logout</button>
        </aside>

        {/* MAIN */}
        <main className="mn">
          {/* Topbar */}
          <div className="tb">
            <div>
              <div className="tt">Free Workout Plans 🏋️</div>
              <div className="ts">Expert programs from the world's top fitness trainers — completely free</div>
            </div>
            <div className="tr">
              <div className="sp">🔥 {USER.streak}-day streak</div>
              <button className="nb2">🔔</button>
              <button className="tt2" onClick={() => setDark(!dark)}>
                <div className="th">{dark ? "🌙" : "☀️"}</div>
              </button>
              <img src={USER.avatar} className="av" alt="avatar" />
            </div>
          </div>

          {/* Stats bar */}
          <div className="stats-bar">
            {[
              { val: TRAINERS.length, label: "Top Trainers", color: T.accent },
              { val: "100%", label: "Free Forever", color: T.green },
              { val: "250K+", label: "Total Reviews", color: T.purple },
              { val: saved.length, label: "Plans Saved", color: T.orange },
            ].map((s, i) => (
              <div key={i} className="stat-mini">
                <div className="stat-mini-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-mini-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="filter-bar">
            <input
              className="search-inp"
              placeholder="🔍  Search trainers, specialities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {CATEGORIES.map(c => (
              <button key={c} className={`cat-btn ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="no-results">No trainers found for "{search}" 🤷‍♂️</div>
            )}
            {filtered.map((trainer, idx) => (
              <div key={trainer.id} className="tcard"
                style={{ "--tc": trainer.color, animationDelay: `${0.1 + idx * 0.07}s` }}>

                {/* Header */}
                <div className="tcard-header">
                  <div className="tcard-cover" />
                  <div className="trainer-row">
                    <img
                      src={trainer.realPhoto}
                      className="trainer-photo"
                      alt={trainer.name}
                      onError={e => { e.target.src = trainer.photo; }}
                    />
                    <div className="trainer-info">
                      <div className="trainer-name">{trainer.name}</div>
                      <div className="trainer-title">{trainer.title}</div>
                      <div className="meta-row">
                        <span className="trainer-tag"
                          style={{ background: `${trainer.color}18`, color: trainer.color, border: `1px solid ${trainer.color}30` }}>
                          ⭐ {trainer.tag}
                        </span>
                        <span className="meta-pill">{trainer.platform}</span>
                        <span className="meta-pill">{trainer.followers}</span>
                      </div>
                    </div>
                    <button
                      className={`save-btn ${saved.includes(trainer.id) ? "saved" : ""}`}
                      onClick={() => toggleSave(trainer.id)}
                      title={saved.includes(trainer.id) ? "Remove" : "Save Plan"}
                    >
                      {saved.includes(trainer.id) ? "🔖" : "🤍"}
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="tcard-body">
                  {/* Rating */}
                  <div className="rating-row">
                    <StarRating rating={trainer.rating} color={trainer.color} />
                    <span className="review-count">({trainer.reviews.toLocaleString()} reviews)</span>
                  </div>

                  <div className="about-text">{trainer.about}</div>

                  {/* Quick stats */}
                  <div className="qstats">
                    {[
                      { val: trainer.duration, label: "Duration" },
                      { val: trainer.plan.frequency, label: "Frequency" },
                      { val: trainer.level, label: "Level" },
                    ].map((q, i) => (
                      <div key={i} className="qstat">
                        <div className="qstat-val" style={{ color: trainer.color }}>{q.val}</div>
                        <div className="qstat-label">{q.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Key exercises */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Key Exercises</div>
                  <div className="exercise-wrap">
                    {trainer.plan.exercises.slice(0, 6).map((ex, i) => (
                      <span key={i} className="ex-pill">{ex}</span>
                    ))}
                    {trainer.plan.exercises.length > 6 && (
                      <span className="ex-pill" style={{ color: trainer.color }}>+{trainer.plan.exercises.length - 6} more</span>
                    )}
                  </div>

                  {/* Extra info row */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: T.textSub, background: T.glass, border: `1px solid ${T.glassBorder}`, padding: "4px 10px", borderRadius: 8 }}>
                      📋 {trainer.plan.focus}
                    </span>
                    <span style={{ fontSize: 11, color: T.textSub, background: T.glass, border: `1px solid ${T.glassBorder}`, padding: "4px 10px", borderRadius: 8 }}>
                      🏋️ {trainer.plan.equipment}
                    </span>
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: `${trainer.color}12`, color: trainer.color, border: `1px solid ${trainer.color}25` }}>
                      💪 {trainer.speciality}
                    </span>
                  </div>

                  {/* Expand plan button */}
                  <button className="expand-btn"
                    onClick={() => setExpanded(expanded === trainer.id ? null : trainer.id)}>
                    {expanded === trainer.id ? "▲ Hide Full Plan" : "▼ View Full Program Breakdown"}
                  </button>

                  {/* Expanded plan */}
                  {expanded === trainer.id && (
                    <div className="plan-section">
                      <div className="plan-title">Program Breakdown</div>
                      {trainer.plan.weeks.map((w, i) => (
                        <div key={i} className="week-row">
                          <div className="week-dot" />
                          <div>
                            <div className="week-label">{w.label}</div>
                            <div className="week-name">{w.name}</div>
                            <div className="week-desc">{w.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <button className="view-btn" onClick={() => window.open(trainer.link, "_blank")}>
                    View Full Program on {trainer.platform} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA banner */}
          <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 24,
            padding: "28px 32px", backdropFilter: "blur(28px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 20, animation: "fu 0.6s ease 0.5s both", flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 6 }}>
                Want a Personalised Plan? 🎯
              </div>
              <div style={{ fontSize: 13, color: T.textSub, maxWidth: 480, lineHeight: 1.6 }}>
                Use the Workout Planner to build a custom program based on your goals, equipment, and schedule — tailored just for you.
              </div>
            </div>
            <button style={{
              padding: "14px 28px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg,${T.accent},${T.purple})`,
              color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer", boxShadow: `0 8px 28px ${T.accentGlow}`, whiteSpace: "nowrap",
              transition: "all 0.25s",
            }}
              onClick={() => navigate("/workout-planner")}
              onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.target.style.transform = "translateY(0)"}
            >
              Build My Plan →
            </button>
          </div>

        </main>
      </div>
    </>
  );
}