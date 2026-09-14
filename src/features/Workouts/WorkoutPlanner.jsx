import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DT = {
  bg: "#060810", glass: "rgba(255,255,255,0.035)", glassBorder: "rgba(255,255,255,0.075)",
  cardBorderHover: "rgba(255,255,255,0.15)",
  text: "#eef2ff", textSub: "rgba(200,212,255,0.52)", textMuted: "rgba(200,212,255,0.28)",
  accent: "#4f8ef7", accentGlow: "rgba(79,142,247,0.22)",
  green: "#34d399", greenGlow: "rgba(52,211,153,0.18)",
  purple: "#a78bfa", purpleGlow: "rgba(167,139,250,0.18)",
  orange: "#fb923c", orangeGlow: "rgba(251,146,60,0.18)",
};
const LT = {
  bg: "#f3f6ff", glass: "rgba(255,255,255,0.75)", glassBorder: "rgba(0,0,0,0.07)",
  cardBorderHover: "rgba(79,142,247,0.3)",
  text: "#0a0e1f", textSub: "rgba(10,14,31,0.52)", textMuted: "rgba(10,14,31,0.3)",
  accent: "#3b7ef0", accentGlow: "rgba(59,126,240,0.14)",
  green: "#10b981", greenGlow: "rgba(16,185,129,0.14)",
  purple: "#7c3aed", purpleGlow: "rgba(124,58,237,0.14)",
  orange: "#f97316", orangeGlow: "rgba(249,115,22,0.14)",
};

const GOALS = [
  { id: "muscle", label: "Muscle Gain", icon: "💪", color: "#4f8ef7" },
  { id: "fat_loss", label: "Fat Loss", icon: "🔥", color: "#f472b6" },
  { id: "strength", label: "Strength", icon: "🏋️", color: "#fb923c" },
  { id: "endurance", label: "Endurance", icon: "🏃", color: "#34d399" },
  { id: "general", label: "General Fitness", icon: "⚡", color: "#a78bfa" },
];
const LEVELS = [
  { id: "beginner", label: "Beginner", sub: "< 1 year training", icon: "🌱" },
  { id: "intermediate", label: "Intermediate", sub: "1–3 years", icon: "🌿" },
  { id: "advanced", label: "Advanced", sub: "3+ years", icon: "🌳" },
];
const DAYS_OPTIONS = [3, 4, 5, 6];
const EQUIPMENT = [
  { id: "full_gym", label: "Full Gym", icon: "🏋️" },
  { id: "home", label: "Home / Dumbbells", icon: "🏠" },
  { id: "bodyweight", label: "Bodyweight Only", icon: "🤸" },
  { id: "resistance", label: "Resistance Bands", icon: "🎗️" },
];

const PLANS = {
  muscle: {
    3: [
      { day: "Monday", name: "Push", color: "#4f8ef7", exercises: ["Bench Press 4×8", "Incline DB Press 3×10", "Shoulder Press 3×10", "Tricep Dips 3×12", "Cable Fly 3×12"] },
      { day: "Wednesday", name: "Pull", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "Barbell Row 3×10", "Face Pulls 3×15", "Bicep Curl 3×12"] },
      { day: "Friday", name: "Legs", color: "#fb923c", exercises: ["Squat 4×8", "Leg Press 3×12", "Romanian DL 3×10", "Leg Curl 3×12", "Calf Raises 4×15"] },
    ],
    4: [
      { day: "Monday", name: "Chest & Triceps", color: "#4f8ef7", exercises: ["Bench Press 4×8", "Incline Press 3×10", "Cable Fly 3×12", "Tricep Pushdown 3×12", "Skull Crushers 3×10"] },
      { day: "Tuesday", name: "Back & Biceps", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "Seated Row 3×10", "Lat Pulldown 3×12", "Hammer Curl 3×12"] },
      { day: "Thursday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Front Raises 3×12", "Rear Delt Fly 3×15", "Shrugs 3×12"] },
      { day: "Friday", name: "Legs", color: "#fb923c", exercises: ["Squat 4×8", "Leg Press 3×12", "RDL 3×10", "Lunges 3×10", "Calf Raises 4×20"] },
    ],
    5: [
      { day: "Monday", name: "Chest", color: "#4f8ef7", exercises: ["Bench Press 5×5", "Incline DB 4×10", "Cable Fly 3×12", "Push-ups 3×15", "Chest Dip 3×10"] },
      { day: "Tuesday", name: "Back", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "T-Bar Row 3×10", "Lat Pulldown 3×12", "Back Extension 3×15"] },
      { day: "Wednesday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Arnold Press 3×10", "Upright Row 3×12", "Face Pulls 3×15"] },
      { day: "Thursday", name: "Legs", color: "#fb923c", exercises: ["Squat 5×5", "Leg Press 4×10", "Hack Squat 3×10", "Leg Curl 3×12", "Seated Calf 4×15"] },
      { day: "Saturday", name: "Arms", color: "#f472b6", exercises: ["Barbell Curl 4×10", "Skull Crushers 4×10", "Hammer Curl 3×12", "Tricep Dip 3×12", "Concentration Curl 3×15"] },
    ],
    6: [
      { day: "Monday", name: "Chest", color: "#4f8ef7", exercises: ["Bench Press 5×5", "Incline DB 4×10", "Cable Fly 3×12", "Push-ups 3×15"] },
      { day: "Tuesday", name: "Back", color: "#a78bfa", exercises: ["Deadlift 4×5", "Pull-ups 4×8", "T-Bar Row 3×10", "Lat Pulldown 3×12"] },
      { day: "Wednesday", name: "Shoulders", color: "#34d399", exercises: ["OHP 4×8", "Lateral Raises 4×15", "Arnold Press 3×10", "Face Pulls 3×15"] },
      { day: "Thursday", name: "Legs", color: "#fb923c", exercises: ["Squat 5×5", "Leg Press 4×10", "Hack Squat 3×10", "Leg Curl 3×12"] },
      { day: "Friday", name: "Arms", color: "#f472b6", exercises: ["Barbell Curl 4×10", "Skull Crushers 4×10", "Hammer Curl 3×12", "Tricep Dip 3×12"] },
      { day: "Saturday", name: "Full Body", color: "#fbbf24", exercises: ["Power Clean 3×5", "Pull-ups 3×Max", "Dips 3×Max", "Farmer's Walk 3×30m"] },
    ],
  },
  fat_loss: {
    3: [
      { day: "Monday", name: "Full Body + Cardio", color: "#f472b6", exercises: ["Circuit: Squat 4×15", "Push-ups 4×15", "DB Row 4×15", "Jump Rope 10min", "Plank 3×60s"] },
      { day: "Wednesday", name: "HIIT", color: "#fb923c", exercises: ["Sprint Intervals 20min", "Burpees 4×15", "Mountain Climbers 4×30s", "Box Jumps 4×10", "Battle Ropes 4×30s"] },
      { day: "Friday", name: "Strength + Core", color: "#4f8ef7", exercises: ["Deadlift 3×10", "Bench Press 3×10", "OHP 3×10", "Russian Twists 3×20", "Bicycle Crunches 3×20"] },
    ],
    4: [
      { day: "Monday", name: "Upper Body", color: "#4f8ef7", exercises: ["Push-ups 4×15", "DB Row 4×12", "Shoulder Press 3×12", "Tricep Extension 3×15", "Bicep Curl 3×15"] },
      { day: "Tuesday", name: "HIIT Cardio", color: "#f472b6", exercises: ["Sprints 6×30s", "Jump Rope 3×3min", "Burpees 4×10", "High Knees 4×30s", "Mountain Climbers 4×30s"] },
      { day: "Thursday", name: "Lower Body", color: "#fb923c", exercises: ["Goblet Squat 4×15", "Lunges 3×12", "Glute Bridge 4×15", "Step-ups 3×12", "Calf Raises 4×20"] },
      { day: "Friday", name: "Full Body Circuit", color: "#34d399", exercises: ["Deadlift 3×12", "Bench 3×12", "Squat 3×12", "Row 3×12", "Rest 60s between rounds"] },
    ],
    5: [
      { day: "Mon", name: "Push HIIT", color: "#4f8ef7", exercises: ["Bench 3×12", "Push-ups 3×15", "Shoulder Press 3×12", "Cardio HIIT 20min"] },
      { day: "Tue", name: "Pull HIIT", color: "#a78bfa", exercises: ["Pull-ups 4×8", "DB Row 3×12", "Face Pulls 3×15", "Cardio HIIT 20min"] },
      { day: "Wed", name: "Legs", color: "#fb923c", exercises: ["Squat 4×12", "Leg Press 3×15", "Lunges 3×12", "Calf Raises 4×20"] },
      { day: "Thu", name: "Full Body", color: "#34d399", exercises: ["Deadlift 3×10", "OHP 3×10", "Pull-ups 3×8", "Dips 3×10"] },
      { day: "Fri", name: "Cardio & Core", color: "#f472b6", exercises: ["30min Steady State", "Plank 3×60s", "Russian Twist 3×20", "Dragon Flags 3×8"] },
    ],
    6: [
      { day: "Mon", name: "Upper A", color: "#4f8ef7", exercises: ["Bench 4×10", "Row 4×10", "OHP 3×12", "Curl 3×12"] },
      { day: "Tue", name: "Lower A", color: "#fb923c", exercises: ["Squat 4×10", "RDL 3×12", "Lunges 3×10", "Calf 4×15"] },
      { day: "Wed", name: "HIIT", color: "#f472b6", exercises: ["Sprints 8×30s", "Burpees 4×10", "Jump Rope 10min"] },
      { day: "Thu", name: "Upper B", color: "#a78bfa", exercises: ["Incline Press 4×10", "Pull-ups 4×8", "Lateral Raise 4×15"] },
      { day: "Fri", name: "Lower B", color: "#34d399", exercises: ["Deadlift 4×6", "Leg Press 3×15", "Glute Bridge 3×15"] },
      { day: "Sat", name: "Active Recovery", color: "#fbbf24", exercises: ["30min Walk/Jog", "Yoga / Stretching", "Foam Rolling"] },
    ],
  },
  strength: {
    3: [
      { day: "Monday", name: "Squat Day", color: "#fb923c", exercises: ["Back Squat 5×5", "Front Squat 3×5", "Leg Press 3×8", "Core Work 3×"] },
      { day: "Wednesday", name: "Bench Day", color: "#4f8ef7", exercises: ["Bench Press 5×5", "OHP 3×5", "DB Press 3×8", "Tricep Work 3×10"] },
      { day: "Friday", name: "Deadlift Day", color: "#a78bfa", exercises: ["Deadlift 5×5", "Romanian DL 3×6", "Pull-ups 4×Max", "Row 3×8"] },
    ],
    4: [
      { day: "Mon", name: "Squat A", color: "#fb923c", exercises: ["Back Squat 5×3", "Pause Squat 3×3", "Leg Press 4×6", "Abs 3×"] },
      { day: "Tue", name: "Press A", color: "#4f8ef7", exercises: ["Bench 5×3", "Incline 3×5", "OHP 3×5", "Tricep 3×8"] },
      { day: "Thu", name: "Squat B", color: "#34d399", exercises: ["Front Squat 4×4", "Box Squat 3×3", "RDL 3×6", "Core 3×"] },
      { day: "Fri", name: "Pull Day", color: "#a78bfa", exercises: ["Deadlift 5×3", "Rack Pull 3×3", "Pull-ups 5×5", "Row 4×6"] },
    ],
    5: [
      { day: "Mon", name: "Heavy Squat", color: "#fb923c", exercises: ["Back Squat 6×3", "Belt Squat 3×5", "Pause Squat 3×3"] },
      { day: "Tue", name: "Heavy Bench", color: "#4f8ef7", exercises: ["Bench 6×3", "Close Grip 3×5", "Board Press 3×3"] },
      { day: "Wed", name: "Accessory", color: "#34d399", exercises: ["Pull-ups 5×5", "DB Row 4×8", "Face Pulls 4×15", "Curls 3×12"] },
      { day: "Thu", name: "Heavy DL", color: "#a78bfa", exercises: ["Deadlift 6×3", "Trap Bar DL 3×5", "Good Morning 3×8"] },
      { day: "Fri", name: "Heavy OHP", color: "#f472b6", exercises: ["OHP 5×5", "Push Press 3×3", "Lateral Raises 4×15"] },
    ],
    6: [
      { day: "Mon", name: "Max Squat", color: "#fb923c", exercises: ["Squat 6×2", "Pause Squat 3×3", "Belt Squat 3×5"] },
      { day: "Tue", name: "Max Bench", color: "#4f8ef7", exercises: ["Bench 6×2", "Spoto Press 3×3", "CG Bench 3×5"] },
      { day: "Wed", name: "Accessory A", color: "#34d399", exercises: ["Pull-ups 6×5", "DB Row 4×8", "Abs 4×"] },
      { day: "Thu", name: "Max DL", color: "#a78bfa", exercises: ["Deadlift 6×2", "Rack Pull 3×3", "SLDL 3×5"] },
      { day: "Fri", name: "Max OHP", color: "#f472b6", exercises: ["OHP 5×3", "Push Press 3×3", "DB Press 3×8"] },
      { day: "Sat", name: "Accessory B", color: "#fbbf24", exercises: ["Farmer's Walk 4×40m", "Dips 4×Max", "Core Circuit 3×"] },
    ],
  },
  endurance: {
    3: [
      { day: "Monday", name: "Tempo Run", color: "#34d399", exercises: ["Warm-up 10min", "Tempo Run 30min at 80% HR", "Cool-down 10min", "Stretching 10min"] },
      { day: "Wednesday", name: "Intervals", color: "#4f8ef7", exercises: ["Warm-up 10min", "8×400m sprints", "Rest 90s between", "Cool-down 10min"] },
      { day: "Friday", name: "Long Run", color: "#a78bfa", exercises: ["Easy Pace 45–60min", "HR Zone 2 (65% max)", "Hydrate every 15min", "Post-run stretch 15min"] },
    ],
    4: [
      { day: "Mon", name: "Intervals", color: "#4f8ef7", exercises: ["10×200m sprints", "Rest 60s between", "Total ~25min work", "Cool-down"] },
      { day: "Wed", name: "Tempo", color: "#34d399", exercises: ["20min warm-up jog", "25min at 80% HR", "10min cool-down"] },
      { day: "Thu", name: "Strength", color: "#fb923c", exercises: ["Squat 3×12", "Deadlift 3×8", "Lunges 3×12", "Core 3×15"] },
      { day: "Sat", name: "Long Run", color: "#a78bfa", exercises: ["60–90min easy pace", "HR Zone 2", "Fuel at 45min mark"] },
    ],
    5: [
      { day: "Mon", name: "Speed Work", color: "#4f8ef7", exercises: ["10×400m", "Rest 2min", "Pace: 5K race pace"] },
      { day: "Tue", name: "Easy Run", color: "#34d399", exercises: ["30min easy", "HR Zone 2", "Conversational pace"] },
      { day: "Wed", name: "Strength", color: "#fb923c", exercises: ["Squat 3×10", "Deadlift 3×8", "Calf Raises 4×20", "Core 3×"] },
      { day: "Thu", name: "Tempo", color: "#a78bfa", exercises: ["20min easy + 25min tempo + 10min easy"] },
      { day: "Sat", name: "Long Run", color: "#f472b6", exercises: ["75–105min easy pace", "Zone 2 HR", "Proper nutrition"] },
    ],
    6: [
      { day: "Mon", name: "Speed", color: "#4f8ef7", exercises: ["12×400m intervals"] },
      { day: "Tue", name: "Recovery", color: "#34d399", exercises: ["20min easy jog + stretch"] },
      { day: "Wed", name: "Tempo", color: "#a78bfa", exercises: ["30min tempo run"] },
      { day: "Thu", name: "Strength", color: "#fb923c", exercises: ["Full body 45min"] },
      { day: "Fri", name: "Hills", color: "#f472b6", exercises: ["Hill repeats 10×60s"] },
      { day: "Sat", name: "Long Run", color: "#fbbf24", exercises: ["90–120min easy"] },
    ],
  },
  general: {
    3: [
      { day: "Monday", name: "Full Body A", color: "#4f8ef7", exercises: ["Squat 3×10", "Bench Press 3×10", "Bent Row 3×10", "OHP 2×10", "Plank 3×45s"] },
      { day: "Wednesday", name: "Cardio + Core", color: "#34d399", exercises: ["30min Cardio", "Crunches 3×20", "Russian Twists 3×20", "Leg Raises 3×15", "Mountain Climbers 3×30s"] },
      { day: "Friday", name: "Full Body B", color: "#a78bfa", exercises: ["Deadlift 3×8", "Pull-ups 3×8", "Dips 3×10", "Lunges 3×10", "Core Circuit"] },
    ],
    4: [
      { day: "Mon", name: "Upper Body", color: "#4f8ef7", exercises: ["Bench 3×10", "Row 3×10", "OHP 3×10", "Curl 3×12", "Tricep 3×12"] },
      { day: "Tue", name: "Cardio", color: "#34d399", exercises: ["35min Moderate Cardio", "Stretching 10min"] },
      { day: "Thu", name: "Lower Body", color: "#fb923c", exercises: ["Squat 3×10", "Deadlift 3×8", "Lunges 3×10", "Calf 3×15"] },
      { day: "Fri", name: "Full Body", color: "#a78bfa", exercises: ["Circuit training 3 rounds", "8 exercises × 12 reps", "Rest 60s between rounds"] },
    ],
    5: [
      { day: "Mon", name: "Upper A", color: "#4f8ef7", exercises: ["Bench 3×10", "Pull-ups 3×8", "Shoulder 3×10"] },
      { day: "Tue", name: "Lower A", color: "#fb923c", exercises: ["Squat 3×10", "RDL 3×10", "Calf 3×15"] },
      { day: "Wed", name: "Cardio", color: "#34d399", exercises: ["30min Run or Bike"] },
      { day: "Thu", name: "Upper B", color: "#a78bfa", exercises: ["Incline 3×10", "Row 3×10", "Lateral Raise 3×15"] },
      { day: "Fri", name: "Lower B", color: "#f472b6", exercises: ["Deadlift 3×8", "Leg Press 3×12", "Core 3×15"] },
    ],
    6: [
      { day: "Mon", name: "Push", color: "#4f8ef7", exercises: ["Bench 3×10", "OHP 3×10", "Tricep 3×12"] },
      { day: "Tue", name: "Pull", color: "#a78bfa", exercises: ["Pull-ups 3×8", "Row 3×10", "Curl 3×12"] },
      { day: "Wed", name: "Legs", color: "#fb923c", exercises: ["Squat 3×10", "RDL 3×10", "Calf 3×15"] },
      { day: "Thu", name: "Cardio", color: "#34d399", exercises: ["30min Cardio + Core"] },
      { day: "Fri", name: "Full Body", color: "#f472b6", exercises: ["Circuit 3 rounds", "6 exercises × 12 reps"] },
      { day: "Sat", name: "Active Rest", color: "#fbbf24", exercises: ["Walk / Yoga / Swim"] },
    ],
  },
};

export default function WorkoutPlanner() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const T = dark ? DT : LT;

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("muscle");
  const [level, setLevel] = useState("intermediate");
  const [days, setDays] = useState(4);
  const [equipment, setEquipment] = useState("full_gym");
  const [plan, setPlan] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const generatePlan = () => {
    const selectedPlan = PLANS[goal]?.[days] || PLANS["muscle"][4];
    setPlan(selectedPlan);
    setStep(3);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${T.bg};}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${T.accent}40;border-radius:99px;}
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}
    .orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;}
    .o1{top:-15%;left:-8%;width:900px;height:900px;background:radial-gradient(circle,${dark?"rgba(79,142,247,0.07)":"rgba(79,142,247,0.05)"} 0%,transparent 65%);animation:of1 22s ease-in-out infinite;}
    .o2{bottom:-20%;right:-10%;width:800px;height:800px;background:radial-gradient(circle,${dark?"rgba(251,146,60,0.06)":"rgba(251,146,60,0.04)"} 0%,transparent 65%);animation:of2 28s ease-in-out infinite;}
    @keyframes of1{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,-40px);}}
    @keyframes of2{0%,100%{transform:translate(0,0);}50%{transform:translate(-50px,-40px);}}

    .header{display:flex;align-items:center;justify-content:space-between;padding:28px 40px;position:relative;z-index:10;border-bottom:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(30px);}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:'DM Sans',sans-serif;}
    .back-btn:hover{color:${T.accent};border-color:${T.accent}35;}
    .h-logo{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}
    .tt2{width:52px;height:28px;border-radius:99px;border:1px solid ${T.glassBorder};background:${T.glass};cursor:pointer;position:relative;}
    .th{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});position:absolute;top:3px;left:${dark?"27px":"3px"};transition:left 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 2px 8px ${T.accentGlow};}

    .content{max-width:900px;margin:0 auto;padding:40px 40px;position:relative;z-index:1;}

    .page-title{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;letter-spacing:-0.03em;color:${T.text};margin-bottom:6px;}
    .page-title span{background:linear-gradient(135deg,${T.orange},${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:15px;color:${T.textSub};margin-bottom:36px;}

    /* Steps */
    .steps{display:flex;align-items:center;gap:0;margin-bottom:40px;}
    .step-item{display:flex;align-items:center;gap:10px;flex:1;}
    .step-circle{width:36px;height:36px;border-radius:50%;border:2px solid ${T.glassBorder};background:${T.glass};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${T.textMuted};transition:all 0.3s;flex-shrink:0;}
    .step-circle.done{background:linear-gradient(135deg,${T.accent},${T.purple});border-color:transparent;color:#fff;box-shadow:0 4px 16px ${T.accentGlow};}
    .step-circle.active{border-color:${T.accent};color:${T.accent};box-shadow:0 0 16px ${T.accentGlow}40;}
    .step-label{font-size:13px;font-weight:600;color:${T.textMuted};}
    .step-label.active{color:${T.text};}
    .step-line{flex:1;height:1px;background:${T.glassBorder};margin:0 12px;}
    .step-line.done{background:linear-gradient(90deg,${T.accent},${T.purple});}

    .section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${T.text};margin-bottom:20px;}

    .option-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:32px;}
    .option-btn{padding:20px 16px;border-radius:18px;border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);text-align:center;font-family:'DM Sans',sans-serif;}
    .option-btn:hover{transform:translateY(-3px);border-color:${T.cardBorderHover};}
    .option-btn.active{transform:translateY(-3px);}
    .opt-icon{font-size:26px;display:block;margin-bottom:10px;}
    .opt-label{font-size:13px;font-weight:700;color:${T.text};display:block;}
    .opt-sub{font-size:11px;color:${T.textMuted};margin-top:4px;display:block;}

    .days-grid{display:flex;gap:12px;margin-bottom:32px;}
    .day-btn{flex:1;padding:18px;border-radius:16px;border:1.5px solid ${T.glassBorder};background:${T.glass};cursor:pointer;transition:all 0.25s;text-align:center;font-family:'DM Sans',sans-serif;}
    .day-btn:hover{border-color:${T.accent}35;}
    .day-btn.active{border-color:${T.accent};background:${T.accent}12;box-shadow:0 0 20px ${T.accentGlow}30;}
    .day-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:${T.text};}
    .day-lbl{font-size:12px;color:${T.textSub};font-weight:600;margin-top:4px;}

    .nav-btns{display:flex;gap:12px;margin-top:8px;}
    .prev-btn{padding:14px 28px;border-radius:14px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.25s;}
    .prev-btn:hover{color:${T.text};border-color:${T.cardBorderHover};}
    .next-btn{flex:1;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.3s;letter-spacing:0.04em;text-transform:uppercase;box-shadow:0 8px 24px ${T.accentGlow};}
    .next-btn:hover{transform:translateY(-2px);box-shadow:0 14px 36px ${T.accentGlow};}

    /* Plan output */
    .plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:28px;}
    .plan-day{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .plan-day::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--dc)08,transparent 55%);pointer-events:none;}
    .plan-day:hover{transform:translateY(-4px);border-color:var(--dc);box-shadow:0 20px 50px rgba(0,0,0,${dark?"0.3":"0.1"}),0 0 0 1px var(--dc)30;}
    .day-name{font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;}
    .day-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;margin-bottom:14px;}
    .ex-list{list-style:none;display:flex;flex-direction:column;gap:7px;}
    .ex-item{display:flex;align-items:center;gap:8px;font-size:13px;color:${T.textSub};}
    .ex-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

    .plan-summary{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px 28px;backdrop-filter:blur(28px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:20px;}
    .sum-item{text-align:center;}
    .sum-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:${T.accent};}
    .sum-lbl{font-size:11px;color:${T.textMuted};font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    .restart-btn{padding:12px 24px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.25s;}
    .restart-btn:hover{color:${T.text};border-color:${T.cardBorderHover};}

    @keyframes fu{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:700px){.content{padding:24px 16px;}.option-grid{grid-template-columns:repeat(2,1fr);}.days-grid{flex-wrap:wrap;}.plan-grid{grid-template-columns:1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="orb o1" /><div className="orb o2" />

        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="tt2" onClick={() => setDark(!dark)}><div className="th">{dark?"🌙":"☀️"}</div></button>
        </div>

        <div className="content">
          <div className="page-title" style={{animation:"fu 0.6s ease both"}}>Workout <span>Planner</span></div>
          <div className="page-sub" style={{animation:"fu 0.6s ease 0.05s both"}}>Build a personalised workout plan tailored to your goals and schedule</div>

          {/* Steps indicator */}
          <div className="steps" style={{animation:"fu 0.6s ease 0.1s both"}}>
            {["Your Goal", "Schedule", "Your Plan"].map((s, i) => (
              <React.Fragment key={i}>
                <div className="step-item">
                  <div className={`step-circle ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`}>
                    {step > i+1 ? "✓" : i+1}
                  </div>
                  <span className={`step-label ${step === i+1 ? "active" : ""}`}>{s}</span>
                </div>
                {i < 2 && <div className={`step-line ${step > i+1 ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div style={{animation:"fu 0.5s ease both"}}>
              <div className="section-title">What's your primary goal?</div>
              <div className="option-grid">
                {GOALS.map(g => (
                  <button key={g.id} className={`option-btn ${goal === g.id ? "active" : ""}`}
                    onClick={() => setGoal(g.id)}
                    style={goal === g.id ? {borderColor: g.color, background: `${g.color}12`, boxShadow: `0 0 20px ${g.color}30`} : {}}>
                    <span className="opt-icon">{g.icon}</span>
                    <span className="opt-label" style={goal === g.id ? {color: g.color} : {}}>{g.label}</span>
                  </button>
                ))}
              </div>

              <div className="section-title">Experience Level</div>
              <div className="option-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                {LEVELS.map(l => (
                  <button key={l.id} className={`option-btn ${level === l.id ? "active" : ""}`}
                    onClick={() => setLevel(l.id)}
                    style={level === l.id ? {borderColor: T.accent, background: `${T.accent}12`, boxShadow: `0 0 18px ${T.accentGlow}`} : {}}>
                    <span className="opt-icon">{l.icon}</span>
                    <span className="opt-label" style={level === l.id ? {color: T.accent} : {}}>{l.label}</span>
                    <span className="opt-sub">{l.sub}</span>
                  </button>
                ))}
              </div>

              <div className="section-title">Equipment Available</div>
              <div className="option-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
                {EQUIPMENT.map(e => (
                  <button key={e.id} className={`option-btn ${equipment === e.id ? "active" : ""}`}
                    onClick={() => setEquipment(e.id)}
                    style={equipment === e.id ? {borderColor: T.green, background: `${T.green}10`, boxShadow: `0 0 16px ${T.greenGlow}`} : {}}>
                    <span className="opt-icon">{e.icon}</span>
                    <span className="opt-label" style={equipment === e.id ? {color: T.green} : {}}>{e.label}</span>
                  </button>
                ))}
              </div>

              <div className="nav-btns">
                <button className="next-btn" onClick={() => setStep(2)}>Next: Choose Schedule →</button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{animation:"fu 0.5s ease both"}}>
              <div className="section-title">How many days per week?</div>
              <div className="days-grid">
                {DAYS_OPTIONS.map(d => (
                  <button key={d} className={`day-btn ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>
                    <div className="day-num" style={days === d ? {color: T.accent} : {}}>{d}</div>
                    <div className="day-lbl">days/week</div>
                  </button>
                ))}
              </div>

              <div style={{background: T.accent+"08", border: `1px solid ${T.accent}20`, borderRadius: 16, padding: "18px 22px", marginBottom: 28}}>
                <div style={{fontSize: 13, color: T.textSub, lineHeight: 1.65}}>
                  <strong style={{color: T.text, display:"block", marginBottom:8}}>📋 Your Plan Preview</strong>
                  Goal: <strong style={{color: T.accent}}>{GOALS.find(g=>g.id===goal)?.label}</strong> &nbsp;·&nbsp;
                  Level: <strong style={{color: T.purple}}>{LEVELS.find(l=>l.id===level)?.label}</strong> &nbsp;·&nbsp;
                  Equipment: <strong style={{color: T.green}}>{EQUIPMENT.find(e=>e.id===equipment)?.label}</strong> &nbsp;·&nbsp;
                  Days: <strong style={{color: T.orange}}>{days}x/week</strong>
                </div>
              </div>

              <div className="nav-btns">
                <button className="prev-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="next-btn" onClick={generatePlan}>Generate My Plan ⚡</button>
              </div>
            </div>
          )}

          {/* Step 3 — Plan */}
          {step === 3 && plan && (
            <div style={{animation:"fu 0.5s ease both"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
                <div className="section-title" style={{marginBottom:0}}>Your Personalised Plan</div>
                <button className="restart-btn" onClick={() => { setStep(1); setPlan(null); }}>↺ Start Over</button>
              </div>

              <div className="plan-summary">
                {[
                  {val: days, lbl: "Days/Week"},
                  {val: `${days*45}min`, lbl: "Weekly Volume"},
                  {val: GOALS.find(g=>g.id===goal)?.label, lbl: "Goal"},
                  {val: LEVELS.find(l=>l.id===level)?.label, lbl: "Level"},
                ].map((s, i) => (
                  <div key={i} className="sum-item">
                    <div className="sum-val">{s.val}</div>
                    <div className="sum-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="plan-grid">
                {plan.map((d, i) => (
                  <div key={i} className="plan-day" style={{"--dc": d.color}}>
                    <div className="day-name">{d.day}</div>
                    <div className="day-title" style={{color: d.color}}>{d.name}</div>
                    <ul className="ex-list">
                      {d.exercises.map((ex, j) => (
                        <li key={j} className="ex-item">
                          <div className="ex-dot" style={{background: d.color}} />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{display:"flex", gap:12}}>
                <button className="next-btn" onClick={() => navigate("/workout-logger")} style={{flex:1}}>
                  Log a Workout →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}