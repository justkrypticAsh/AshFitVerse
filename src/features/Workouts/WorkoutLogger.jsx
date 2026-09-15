// src/features/workouts/WorkoutLogger.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import useUserLogs from "../../hooks/useUserLogs";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";
import {
  addLog,
  deleteLog,
  todayKey,
  addAppNotification,
  getEffectiveUid,
  computeStreak,
} from "../../lib/userLogs";
import { showDonePopup } from "../../components/DonePopup";

const EXERCISE_LIST = [
  "Bench Press", "Squat", "Deadlift", "OHP", "Pull-ups",
  "Barbell Row", "Incline Press", "Leg Press", "RDL", "Dips",
  "Bicep Curl", "Tricep Pushdown", "Lateral Raise", "Face Pulls",
  "Hack Squat", "Leg Curl", "Cable Fly", "Arnold Press",
];

const SPORTS_LIST = [
  { name: "Football / Soccer", icon: "⚽", met: 8.5, defaultDuration: 60, desc: "High intensity running, sprinting & kicking" },
  { name: "Cricket", icon: "🏏", met: 5.2, defaultDuration: 90, desc: "Batting, bowling, fielding & sprint bursts" },
  { name: "Badminton", icon: "🏸", met: 7.0, defaultDuration: 45, desc: "Fast-paced rallies, jumps & lunges" },
  { name: "Basketball", icon: "🏀", met: 8.0, defaultDuration: 45, desc: "Continuous court running, jumps & defense" },
  { name: "Tennis", icon: "🎾", met: 7.5, defaultDuration: 60, desc: "Agility court movement & explosive strokes" },
  { name: "Running / Jogging", icon: "🏃", met: 9.8, defaultDuration: 30, desc: "Aerobic endurance & cardiovascular stamina" },
  { name: "Swimming", icon: "🏊", met: 8.0, defaultDuration: 40, desc: "Full-body muscular resistance & cardio" },
  { name: "Cycling", icon: "🚴", met: 7.5, defaultDuration: 45, desc: "Quads, glutes & cardiovascular endurance" },
  { name: "Boxing / Sparring", icon: "🥊", met: 9.0, defaultDuration: 30, desc: "Heavy bag, footwork & anaerobic burn" },
  { name: "Yoga / Pilates", icon: "🧘", met: 3.5, defaultDuration: 50, desc: "Core stabilization, flexibility & recovery" },
  { name: "Table Tennis", icon: "🏓", met: 4.2, defaultDuration: 45, desc: "Reflexes, quick lateral hops & coordination" },
  { name: "HIIT / Cross Training", icon: "⚡", met: 9.5, defaultDuration: 30, desc: "Interval functional training & stamina" },
  { name: "Martial Arts / MMA", icon: "🥋", met: 8.8, defaultDuration: 45, desc: "Grappling, kicks, sweeps & core power" },
];

const INTIMACY_INTENSITIES = [
  { level: "Gentle / Foreplay", rate: 3.8, icon: "🌸", desc: "Relaxed pace, low cardiovascular exertion (~3.8 kcal/min)" },
  { level: "Moderate / Active", rate: 6.2, icon: "⚡", desc: "Steady movement, elevated breathing & heart rate (~6.2 kcal/min)" },
  { level: "Vigorous / High Energy", rate: 8.8, icon: "🔥", desc: "High intensity workout, athletic pace (~8.8 kcal/min)" },
];

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dark, toggleTheme, T } = useTheme();
  const { authUid, user, updateUser } = useUser();
  const { volumeHistory, todayWorkouts, workouts = [] } = useUserLogs(authUid);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tab: "log" vs "history"
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get("tab") === "history" ? "history" : "log"
  );

  // When query param changes to ?tab=history, switch to history tab
  useEffect(() => {
    if (searchParams.get("tab") === "history") {
      setActiveTab("history");
    }
  }, [searchParams]);

  // Mode for logging: "gym" | "sports" | "intimacy"
  const [activityMode, setActivityMode] = useState("gym");

  // ─── Gym Mode State ───
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExPicker, setShowExPicker] = useState(false);

  // ─── Sports Mode State ───
  const [selectedSport, setSelectedSport] = useState(SPORTS_LIST[0]);
  const [sportDuration, setSportDuration] = useState(45);
  const [sportIntensity, setSportIntensity] = useState("Moderate");
  const [sportNotes, setSportNotes] = useState("");
  const [customSportCal, setCustomSportCal] = useState("");

  // ─── Intimacy Mode State ───
  const [intimacyDuration, setIntimacyDuration] = useState(30);
  const [intimacyIntensity, setIntimacyIntensity] = useState(INTIMACY_INTENSITIES[1]);
  const [intimacyNotes, setIntimacyNotes] = useState("");
  const [customIntimacyCal, setCustomIntimacyCal] = useState("");

  // ─── History Filter ───
  const [historyFilter, setHistoryFilter] = useState("all"); // "all" | "gym" | "sports" | "intimacy"

  const userWeight = Number(user?.weight) || 70;

  // Calorie calculation formulas
  const sportIntensityMultiplier =
    sportIntensity === "High" ? 1.25 : sportIntensity === "Low" ? 0.8 : 1.0;
  const estimatedSportCalories = Math.round(
    ((selectedSport.met * 3.5 * userWeight) / 200) *
      Number(sportDuration || 0) *
      sportIntensityMultiplier
  );
  const finalSportCalories =
    customSportCal !== "" ? Math.max(0, Number(customSportCal)) : estimatedSportCalories;

  const estimatedIntimacyCalories = Math.round(
    intimacyIntensity.rate * Number(intimacyDuration || 0) * (userWeight / 70)
  );
  const finalIntimacyCalories =
    customIntimacyCal !== ""
      ? Math.max(0, Number(customIntimacyCal))
      : estimatedIntimacyCalories;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Helper to sync streak upon finishing any activity
  const triggerStreakUpdate = async (effectiveUid) => {
    try {
      const existingDates = (workouts || []).map((w) =>
        typeof w.date === "string" ? w.date.slice(0, 10) : todayKey(w.date || w.createdAt)
      );
      const allDates = [todayKey(), ...existingDates];
      const newStreak = computeStreak(allDates);
      if (updateUser) {
        await updateUser({ streak: newStreak, lastWorkoutAt: todayKey() });
      }
      return newStreak;
    } catch (e) {
      console.warn("Streak update error:", e);
      return (user?.streak || 0) + 1;
    }
  };

  // ── Gym Handlers ──
  const addExercise = (name) => {
    setExercises([
      ...exercises,
      { id: Date.now(), name, sets: [{ reps: 10, weight: 20 }] },
    ]);
    setShowExPicker(false);
  };

  const addSet = (exId) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { reps: 10, weight: ex.sets[ex.sets.length - 1]?.weight || 20 },
              ],
            }
          : ex
      )
    );
  };

  const removeSet = (exId, setIdx) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) }
          : ex
      )
    );
  };

  const updateSet = (exId, setIdx, field, value) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIdx ? { ...s, [field]: +value } : s
              ),
            }
          : ex
      )
    );
  };

  const removeExercise = (exId) => {
    setExercises(exercises.filter((ex) => ex.id !== exId));
  };

  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((a, s) => a + s.reps * s.weight, 0),
    0
  );

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const histData = volumeHistory.map((d) =>
    d.key === todayKey() ? { ...d, volume: d.volume + totalVolume } : d
  );

  // ── Save Gym Workout ──
  const finishGymWorkout = async () => {
    if (!exercises.length || saving) return;
    setSaving(true);
    setTimerActive(false);
    const duration = timer || 1800;
    const effectiveUid = authUid || getEffectiveUid();
    const caloriesBurned = Math.round((duration / 60) * 6.5);
    const name = workoutName.trim() || "Strength Training";

    try {
      await addLog(effectiveUid, "workouts", {
        date: todayKey(),
        name,
        category: "gym",
        exercises,
        volume: totalVolume,
        sets: totalSets,
        duration,
        caloriesBurned,
      });

      const updatedStreak = await triggerStreakUpdate(effectiveUid);

      try {
        await addAppNotification(effectiveUid, {
          text: `Workout saved: ${name} · ${totalVolume.toLocaleString()} kg volume · 🔥 ${caloriesBurned} kcal`,
          type: "workout",
          path: "/workout-logger?tab=history",
        });
      } catch {}

      showDonePopup({
        title: "Workout Saved! 🔥",
        message: `${name} logged! Current Streak: ${updatedStreak} days!`,
        subtext: `${totalSets} sets · ${totalVolume.toLocaleString()} kg volume · 🔥 ${caloriesBurned} kcal`,
        color: "#22c55e",
      });

      // Clear & switch to history so user immediately sees their log
      setExercises([]);
      setWorkoutName("");
      setTimer(0);
      setActiveTab("history");
      setSearchParams({ tab: "history" });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Save Sports Activity ──
  const finishSportsWorkout = async () => {
    if (saving) return;
    setSaving(true);
    const durationSec = Number(sportDuration || 45) * 60;
    const effectiveUid = authUid || getEffectiveUid();
    const name = `${selectedSport.name}`;

    try {
      await addLog(effectiveUid, "workouts", {
        date: todayKey(),
        name,
        category: "sports",
        sport: selectedSport.name,
        sportIcon: selectedSport.icon,
        intensity: sportIntensity,
        duration: durationSec,
        caloriesBurned: finalSportCalories,
        notes: sportNotes.trim(),
        volume: 0,
        sets: 0,
      });

      const updatedStreak = await triggerStreakUpdate(effectiveUid);

      try {
        await addAppNotification(effectiveUid, {
          text: `Sport logged: ${selectedSport.icon} ${selectedSport.name} (${sportDuration} min) · 🔥 ${finalSportCalories} kcal`,
          type: "workout",
          path: "/workout-logger?tab=history",
        });
      } catch {}

      showDonePopup({
        title: "Match Logged! ⚽",
        message: `${selectedSport.icon} ${selectedSport.name} saved! Streak: ${updatedStreak} days!`,
        subtext: `${sportDuration} min · 🔥 ${finalSportCalories} kcal burned`,
        color: "#38bdf8",
      });

      setSportNotes("");
      setCustomSportCal("");
      setActiveTab("history");
      setSearchParams({ tab: "history" });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Save Intimacy Session ──
  const finishIntimacyWorkout = async () => {
    if (saving) return;
    setSaving(true);
    const durationSec = Number(intimacyDuration || 30) * 60;
    const effectiveUid = authUid || getEffectiveUid();
    const name = "Intimate Wellness Session";

    try {
      await addLog(effectiveUid, "workouts", {
        date: todayKey(),
        name,
        category: "intimacy",
        intensity: intimacyIntensity.level,
        duration: durationSec,
        caloriesBurned: finalIntimacyCalories,
        notes: intimacyNotes.trim(),
        volume: 0,
        sets: 0,
      });

      const updatedStreak = await triggerStreakUpdate(effectiveUid);

      try {
        await addAppNotification(effectiveUid, {
          text: `Intimacy session logged (${intimacyDuration} min) · 🔥 ${finalIntimacyCalories} kcal`,
          type: "workout",
          path: "/workout-logger?tab=history",
        });
      } catch {}

      showDonePopup({
        title: "Activity Logged! ❤️",
        message: `Intimate session saved! Streak: ${updatedStreak} days!`,
        subtext: `${intimacyDuration} min · 🔥 ${finalIntimacyCalories} kcal burned`,
        color: "#f472b6",
      });

      setIntimacyNotes("");
      setCustomIntimacyCal("");
      setActiveTab("history");
      setSearchParams({ tab: "history" });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Log Handler ──
  const handleDeleteWorkout = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this workout log?")) return;
    const effectiveUid = authUid || getEffectiveUid();
    try {
      await deleteLog(effectiveUid, "workouts", logId);
    } catch (e) {
      console.error("Delete log error:", e);
    }
  };

  // Filtered history
  const filteredWorkouts = useMemo(() => {
    if (historyFilter === "all") return workouts;
    if (historyFilter === "gym") return workouts.filter((w) => w.category === "gym" || (!w.category && w.exercises));
    if (historyFilter === "sports") return workouts.filter((w) => w.category === "sports");
    if (historyFilter === "intimacy") return workouts.filter((w) => w.category === "intimacy");
    return workouts;
  }, [workouts, historyFilter]);

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}
    
    .header{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark?"rgba(8,8,12,0.85)":"rgba(255,255,255,0.85)"};backdrop-filter:blur(40px);}
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};color:${T.text};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all 0.15s ease;}
    .pr-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .h-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}

    .theme-toggle{width:48px;height:26px;border-radius:99px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:${T.accent};display:flex;align-items:center;justify-content:center;font-size:10px;transition:left .2s ease;left:${dark?"24px":"2px"};}

    /* Top Navigation Tabs */
    .top-tabs{display:flex;align-items:center;justify-content:center;gap:10px;max-width:600px;margin:24px auto 8px;padding:0 20px;}
    .tab-btn{flex:1;padding:12px 18px;border-radius:14px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:14px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.25s ease;display:flex;align-items:center;justify-content:center;gap:8px;}
    .tab-btn:hover{color:${T.text};border-color:${T.accent}50;}
    .tab-btn.active{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;border-color:transparent;box-shadow:0 8px 24px ${T.accent}30;}

    .layout{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1200px;margin:0 auto;padding:24px 40px 60px;position:relative;z-index:1;}

    /* Activity Category Switcher */
    .mode-switcher{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
    .mode-btn{padding:14px 12px;border-radius:16px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.25s ease;display:flex;flex-direction:column;align-items:center;gap:6px;backdrop-filter:blur(20px);}
    .mode-btn:hover{color:${T.text};border-color:${T.accent}40;}
    .mode-btn.active{border-color:${T.accent};background:${T.accentSoft};color:${T.accent};box-shadow:0 0 0 2px ${T.accent}20;}

    /* Left - Logger Elements */
    .workout-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
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

    /* Form Fields for Sports & Intimacy */
    .field-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:24px;backdrop-filter:blur(28px);margin-bottom:16px;}
    .field-label{font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${T.textSub};margin-bottom:8px;display:block;}
    .field-select, .field-input{width:100%;height:48px;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:12px;padding:0 16px;font-size:14px;color:${T.text};font-family:${FONT.body};outline:none;transition:all 0.2s;}
    .field-select:focus, .field-input:focus{border-color:${T.accent};box-shadow:0 0 0 3px ${T.accent}20;}
    .field-textarea{width:100%;height:80px;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:12px;padding:12px 16px;font-size:14px;color:${T.text};font-family:${FONT.body};outline:none;resize:vertical;}

    .sports-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));gap:8px;margin-bottom:16px;}
    .sport-choice-btn{padding:12px 10px;border-radius:12px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};color:${T.textSub};font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s;text-align:left;}
    .sport-choice-btn:hover{border-color:${T.accent}50;color:${T.text};}
    .sport-choice-btn.active{border-color:#38bdf8;background:rgba(56,189,248,0.12);color:#38bdf8;font-weight:700;}

    .intensity-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .intensity-btn{padding:12px 8px;border-radius:12px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:12.5px;font-weight:700;cursor:pointer;text-align:center;transition:all 0.2s;}
    .intensity-btn:hover{border-color:${T.accent}40;color:${T.text};}
    .intensity-btn.active{background:${T.accentSoft};border-color:${T.accent};color:${T.accent};}

    .calorie-preview-banner{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-radius:16px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.25);margin-bottom:20px;}
    .cal-badge{font-family:${FONT.display};font-size:22px;font-weight:800;color:#f97316;}

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
    .finish-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    /* History Cards */
    .history-filter-bar{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
    .hf-btn{padding:8px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};font-size:12.5px;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .hf-btn:hover{color:${T.text};border-color:${T.accent}40;}
    .hf-btn.active{background:${T.accentSoft};border-color:${T.accent};color:${T.accent};}

    .history-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:20px;backdrop-filter:blur(24px);margin-bottom:14px;transition:all 0.25s;}
    .history-card:hover{border-color:${T.glassBorderHover};transform:translateY(-1px);}

    /* Right sidebar */
    .side-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);margin-bottom:16px;transition:all 0.3s;}
    .side-title{font-family:${FONT.display};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}
    .stat-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${T.glassBorder};}
    .stat-row:last-child{border-bottom:none;}
    .stat-key{font-size:13px;color:${T.textSub};}
    .stat-val-s{font-family:${FONT.display};font-size:20px;font-weight:800;}

    @keyframes fu{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
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
        <div className="bg-image-layer">
          <img src={BG_IMAGES.workout} alt="" loading="lazy" />
        </div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* Exercise picker popup */}
        {showExPicker && (
          <div className="ex-picker" onClick={() => setShowExPicker(false)}>
            <div className="ex-picker-box" onClick={(e) => e.stopPropagation()}>
              <div className="ex-picker-title">Add Exercise</div>
              <div className="ex-picker-grid">
                {EXERCISE_LIST.map((e) => (
                  <button key={e} className="ex-pick-btn" onClick={() => addExercise(e)}>
                    {e}
                  </button>
                ))}
              </div>
              <button className="ex-picker-close" onClick={() => setShowExPicker(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* HEADER BAR */}
        <div className="header">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        {/* TOP TABS: LOG ACTIVITY vs VIEW LOGS & HISTORY */}
        <div className="top-tabs">
          <button
            className={`tab-btn ${activeTab === "log" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("log");
              setSearchParams({});
            }}
          >
            <span>✍️</span> Log Activity
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("history");
              setSearchParams({ tab: "history" });
            }}
          >
            <span>📋</span> View Workout Logs ({workouts.length})
          </button>
        </div>

        <div className="layout">
          {/* Main Left Content */}
          <div>
            {activeTab === "log" ? (
              <>
                {/* Mode Switcher */}
                <div className="mode-switcher">
                  <button
                    className={`mode-btn ${activityMode === "gym" ? "active" : ""}`}
                    onClick={() => setActivityMode("gym")}
                  >
                    <span style={{ fontSize: 24 }}>🏋️</span>
                    <span>Gym & Weights</span>
                  </button>
                  <button
                    className={`mode-btn ${activityMode === "sports" ? "active" : ""}`}
                    onClick={() => setActivityMode("sports")}
                  >
                    <span style={{ fontSize: 24 }}>⚽</span>
                    <span>Sports & Athletic</span>
                  </button>
                  <button
                    className={`mode-btn ${activityMode === "intimacy" ? "active" : ""}`}
                    onClick={() => setActivityMode("intimacy")}
                  >
                    <span style={{ fontSize: 24 }}>❤️</span>
                    <span>Intimacy & Cardio</span>
                  </button>
                </div>

                {/* ─── MODE 1: GYM & WEIGHTS ─── */}
                {activityMode === "gym" && (
                  <div>
                    <div className="workout-header">
                      <input
                        className="workout-name-input"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        placeholder="Workout Name (e.g. Chest & Triceps)"
                      />
                      <button
                        className={`timer-btn ${timerActive ? "running" : ""}`}
                        onClick={() => setTimerActive(!timerActive)}
                      >
                        ⏱ {formatTime(timer)}
                      </button>
                    </div>

                    {exercises.length === 0 && (
                      <div className="ex-card" style={{ textAlign: "center", color: T.textSub, fontSize: 13, padding: "36px 20px" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>No exercises added yet</div>
                        <div>Click "+ Add Exercise" below to start tracking your sets, reps, and weights.</div>
                      </div>
                    )}

                    {exercises.map((ex, ei) => (
                      <div key={ex.id} className="ex-card" style={{ animationDelay: `${ei * 0.05}s` }}>
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
                            <input
                              className="set-input"
                              type="number"
                              value={s.reps}
                              min={1}
                              onChange={(e) => updateSet(ex.id, si, "reps", e.target.value)}
                            />
                            <input
                              className="set-input"
                              type="number"
                              value={s.weight}
                              min={0}
                              step={2.5}
                              onChange={(e) => updateSet(ex.id, si, "weight", e.target.value)}
                            />
                            <button className="set-remove" onClick={() => removeSet(ex.id, si)}>✕</button>
                          </div>
                        ))}
                        <button className="add-set-btn" onClick={() => addSet(ex.id)}>+ Add Set</button>
                      </div>
                    ))}

                    <button className="add-ex-btn" onClick={() => setShowExPicker(true)}>
                      + Add Exercise
                    </button>

                    <button
                      className="finish-btn"
                      disabled={!exercises.length || saving}
                      onClick={finishGymWorkout}
                    >
                      {saving ? "Saving…" : "Finish & Save Workout ✓"}
                    </button>
                  </div>
                )}

                {/* ─── MODE 2: SPORTS & ATHLETICS ─── */}
                {activityMode === "sports" && (
                  <div className="field-card">
                    <label className="field-label">Select Sport or Outdoor Activity</label>
                    <div className="sports-grid">
                      {SPORTS_LIST.map((sp) => (
                        <button
                          key={sp.name}
                          type="button"
                          className={`sport-choice-btn ${selectedSport.name === sp.name ? "active" : ""}`}
                          onClick={() => {
                            setSelectedSport(sp);
                            setSportDuration(sp.defaultDuration);
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{sp.icon}</span>
                          <span>{sp.name}</span>
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                      <div>
                        <label className="field-label">Duration (Minutes)</label>
                        <input
                          className="field-input"
                          type="number"
                          min={5}
                          max={300}
                          value={sportDuration}
                          onChange={(e) => setSportDuration(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label">Intensity Level</label>
                        <div className="intensity-row" style={{ margin: 0 }}>
                          {["Low", "Moderate", "High"].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              className={`intensity-btn ${sportIntensity === lvl ? "active" : ""}`}
                              onClick={() => setSportIntensity(lvl)}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="calorie-preview-banner">
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textSub }}>
                          Calculated Calorie Burn
                        </div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                          Based on MET {selectedSport.met} · {userWeight}kg bodyweight
                        </div>
                      </div>
                      <div className="cal-badge">🔥 {finalSportCalories} kcal</div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="field-label">Adjust Calorie Override (Optional)</label>
                      <input
                        className="field-input"
                        type="number"
                        placeholder={`Leave blank to use estimated ${estimatedSportCalories} kcal`}
                        value={customSportCal}
                        onChange={(e) => setCustomSportCal(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label className="field-label">Match / Session Notes</label>
                      <textarea
                        className="field-textarea"
                        placeholder="e.g. Won 3-1, played central midfield, high sprint intensity!"
                        value={sportNotes}
                        onChange={(e) => setSportNotes(e.target.value)}
                      />
                    </div>

                    <button
                      className="finish-btn"
                      disabled={saving || !sportDuration}
                      onClick={finishSportsWorkout}
                      style={{ background: "linear-gradient(135deg, #0284c7, #38bdf8)" }}
                    >
                      {saving ? "Saving…" : `Log ${selectedSport.name} ✓`}
                    </button>
                  </div>
                )}

                {/* ─── MODE 3: INTIMACY & WELLNESS ─── */}
                {activityMode === "intimacy" && (
                  <div className="field-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <span style={{ fontSize: 32 }}>❤️</span>
                      <div>
                        <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800 }}>
                          Intimacy & Physical Activity
                        </div>
                        <div style={{ fontSize: 12.5, color: T.textSub }}>
                          Intimacy is real cardiovascular activity that burns calories and boosts heart health.
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="field-label">Session Duration (Minutes)</label>
                      <input
                        className="field-input"
                        type="number"
                        min={5}
                        max={180}
                        value={intimacyDuration}
                        onChange={(e) => setIntimacyDuration(e.target.value)}
                      />
                    </div>

                    <label className="field-label">Pace & Intensity Level</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {INTIMACY_INTENSITIES.map((item) => (
                        <div
                          key={item.level}
                          onClick={() => setIntimacyIntensity(item)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 14,
                            border: `1px solid ${intimacyIntensity.level === item.level ? "#f472b6" : T.glassBorder}`,
                            background: intimacyIntensity.level === item.level ? "rgba(244,114,182,0.12)" : "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <div>
                              <b style={{ fontSize: 13.5, color: intimacyIntensity.level === item.level ? "#f472b6" : T.text }}>
                                {item.level}
                              </b>
                              <div style={{ fontSize: 11.5, color: T.textSub }}>{item.desc}</div>
                            </div>
                          </div>
                          {intimacyIntensity.level === item.level && (
                            <span style={{ color: "#f472b6", fontWeight: 800 }}>✓</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="calorie-preview-banner" style={{ background: "rgba(244,114,182,0.1)", borderColor: "rgba(244,114,182,0.25)" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textSub }}>
                          Estimated Calories Burned
                        </div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                          {intimacyDuration} min · {intimacyIntensity.level}
                        </div>
                      </div>
                      <div className="cal-badge" style={{ color: "#f472b6" }}>
                        🔥 {finalIntimacyCalories} kcal
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="field-label">Manual Calorie Override (Optional)</label>
                      <input
                        className="field-input"
                        type="number"
                        placeholder={`Leave blank to use estimated ${estimatedIntimacyCalories} kcal`}
                        value={customIntimacyCal}
                        onChange={(e) => setCustomIntimacyCal(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label className="field-label">Private Notes (Optional)</label>
                      <textarea
                        className="field-textarea"
                        placeholder="Optional personal fitness or wellness notes..."
                        value={intimacyNotes}
                        onChange={(e) => setIntimacyNotes(e.target.value)}
                      />
                    </div>

                    <button
                      className="finish-btn"
                      disabled={saving || !intimacyDuration}
                      onClick={finishIntimacyWorkout}
                      style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                    >
                      {saving ? "Saving…" : "Log Intimate Session ✓"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ─── TAB 2: VIEW WORKOUT LOGS & HISTORY ─── */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h2 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, margin: 0 }}>
                      Workout Logs & History
                    </h2>
                    <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 2 }}>
                      Review your logged strength sessions, sports matches, and activities.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("log");
                      setSearchParams({});
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: `linear-gradient(135deg,${T.accent},${T.purple})`,
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Log New Session
                  </button>
                </div>

                {/* Sub filter bar */}
                <div className="history-filter-bar">
                  {[
                    { id: "all", label: `All Logs (${workouts.length})` },
                    { id: "gym", label: "🏋️ Gym & Weights" },
                    { id: "sports", label: "⚽ Sports" },
                    { id: "intimacy", label: "❤️ Intimacy" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={`hf-btn ${historyFilter === f.id ? "active" : ""}`}
                      onClick={() => setHistoryFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* List of workout logs */}
                {filteredWorkouts.length === 0 ? (
                  <div className="history-card" style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                    <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                      No workout logs found
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginBottom: 16 }}>
                      {historyFilter !== "all"
                        ? `You haven't logged any ${historyFilter} workouts yet.`
                        : "You haven't logged any workouts yet. Start your first session!"}
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("log");
                        setSearchParams({});
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 12,
                        border: "none",
                        background: `linear-gradient(135deg,${T.accent},${T.purple})`,
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Log a Session Now →
                    </button>
                  </div>
                ) : (
                  filteredWorkouts.map((w) => {
                    const isSports = w.category === "sports";
                    const isIntimacy = w.category === "intimacy";
                    const icon = isSports ? (w.sportIcon || "⚽") : isIntimacy ? "❤️" : "🏋️";
                    const durationMin = w.duration ? Math.round(Number(w.duration) / 60) : 0;
                    const burned =
                      Number(w.caloriesBurned) ||
                      Math.round(((Number(w.duration) || 0) / 60) * 6.5);

                    return (
                      <div key={w.id} className="history-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: isIntimacy
                                  ? "rgba(244,114,182,0.15)"
                                  : isSports
                                  ? "rgba(56,189,248,0.15)"
                                  : "rgba(34,197,94,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                              }}
                            >
                              {icon}
                            </div>
                            <div>
                              <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800 }}>
                                {w.name || "Workout Session"}
                              </div>
                              <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                                📅 {w.date || "Logged Date"} {w.createdAt ? `· ${new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                              </div>
                            </div>
                          </div>

                          <button
                            title="Delete this entry"
                            onClick={() => handleDeleteWorkout(w.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(239,68,68,0.2)",
                              background: "rgba(239,68,68,0.05)",
                              color: "#f87171",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>

                        {/* Badges row */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                          {durationMin > 0 && (
                            <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 8, background: T.accentSoft, color: T.accent, fontWeight: 700 }}>
                              ⏱ {durationMin} min
                            </span>
                          )}
                          {burned > 0 && (
                            <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 8, background: "rgba(249,115,22,0.1)", color: "#f97316", fontWeight: 700, border: "1px solid rgba(249,115,22,0.2)" }}>
                              🔥 {burned} kcal
                            </span>
                          )}
                          {Number(w.volume) > 0 && (
                            <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 8, background: `${T.green}15`, color: T.green, fontWeight: 700, border: `1px solid ${T.green}25` }}>
                              🏋️ {Number(w.volume).toLocaleString()} kg volume
                            </span>
                          )}
                          {w.intensity && (
                            <span style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: T.textSub, fontWeight: 600 }}>
                              ⚡ {w.intensity}
                            </span>
                          )}
                        </div>

                        {/* Gym Exercises Breakdown */}
                        {w.exercises && w.exercises.length > 0 && (
                          <div style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", border: `1px solid ${T.glassBorder}`, borderRadius: 12, padding: "10px 14px", marginTop: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>
                              Exercises ({w.exercises.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {w.exercises.map((ex, ei) => (
                                <div key={ei} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <b>{ex.name}</b>
                                  <span style={{ color: T.textSub }}>
                                    {ex.sets?.map((s) => `${s.reps}×${s.weight}kg`).join(", ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {w.notes && (
                          <div style={{ fontSize: 12, color: T.textSub, marginTop: 8, padding: "8px 12px", background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 8 }}>
                            <b style={{ color: T.text }}>Notes:</b> {w.notes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar — Stats */}
          <div style={{ animation: "fu 0.6s ease 0.1s both" }}>
            <div className="side-card">
              <div className="side-title">Lifetime Stats</div>
              {[
                { k: "Total Sessions", v: workouts.length, c: T.accent },
                { k: "Active Streak", v: `${user?.streak || 0} days`, c: "#fb923c" },
                {
                  k: "Workouts Today",
                  v: todayWorkouts.length,
                  c: T.green,
                },
                {
                  k: "Today's Volume",
                  v: `${todayWorkouts.reduce((a, w) => a + (Number(w.volume) || 0), 0).toLocaleString()} kg`,
                  c: T.purple,
                },
              ].map((s, i) => (
                <div key={i} className="stat-row">
                  <span className="stat-key">{s.k}</span>
                  <span className="stat-val-s" style={{ color: s.c }}>{s.v}</span>
                </div>
              ))}
            </div>

            <div className="side-card">
              <div className="side-title">Weekly Volume Trend</div>
              {histData.every((d) => !d.volume) && !totalVolume ? (
                <div style={{ fontSize: 12, color: T.textMuted, padding: "12px 0" }}>
                  No saved strength sessions this week yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={histData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="date" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="volume" fill={T.accent} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="side-card">
              <div className="side-title">Quick Fitness Advice</div>
              {[
                "🔥 Sports & cardio complement weight training for peak conditioning.",
                "❤️ Intimacy counts as real cardio — celebrate all healthy movement!",
                "💧 Hydrate — drink 500ml of water before intense sessions.",
                "📈 Consistent daily streaks build long-term metabolic health.",
              ].map((tip, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: T.textSub,
                    padding: "9px 0",
                    borderBottom: i < 3 ? `1px solid ${T.glassBorder}` : "none",
                    lineHeight: 1.5,
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}