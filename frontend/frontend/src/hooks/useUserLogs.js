import { useEffect, useMemo, useState } from "react";
import {
  listenDated,
  listenLogs,
  lastNDays,
  todayKey,
  computeStreak,
  getLocalLogs,
  getEffectiveUid,
} from "../lib/userLogs";

function matchesDate(itemDate, targetKey) {
  if (!itemDate) return false;
  if (itemDate === targetKey) return true;
  if (typeof itemDate === "string" && itemDate.slice(0, 10) === targetKey) return true;
  return false;
}

export default function useUserLogs(uid) {
  const effectiveUid = getEffectiveUid(uid);
  const [workouts, setWorkouts] = useState(() => getLocalLogs(effectiveUid, "workouts"));
  const [meals, setMeals] = useState(() => getLocalLogs(effectiveUid, "meals"));
  const [weights, setWeights] = useState(() => getLocalLogs(effectiveUid, "weights"));
  const [sleepLogs, setSleepLogs] = useState(() => getLocalLogs(effectiveUid, "sleepLogs"));
  const [checkins, setCheckins] = useState(() => getLocalLogs(effectiveUid, "dailyCheckins"));
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const activeUid = getEffectiveUid(uid);
    // Instant sync with current local cache
    setWorkouts(getLocalLogs(activeUid, "workouts"));
    setMeals(getLocalLogs(activeUid, "meals"));
    setWeights(getLocalLogs(activeUid, "weights"));
    setSleepLogs(getLocalLogs(activeUid, "sleepLogs"));
    setCheckins(getLocalLogs(activeUid, "dailyCheckins"));
    setReady(true);

    const u1 = listenLogs(activeUid, "workouts", setWorkouts);
    const u2 = listenLogs(activeUid, "meals", setMeals);
    const u3 = listenDated(activeUid, "weights", setWeights);
    const u4 = listenDated(activeUid, "sleepLogs", setSleepLogs);
    const u5 = listenDated(activeUid, "dailyCheckins", setCheckins);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [uid]);

  const today = todayKey();
  const week = lastNDays(7);

  const todayWorkouts = useMemo(
    () => workouts.filter((w) => matchesDate(w.date, today)),
    [workouts, today]
  );
  const todayMeals = useMemo(
    () => meals.filter((m) => matchesDate(m.date, today)),
    [meals, today]
  );

  const todayCalories = useMemo(
    () => todayMeals.reduce((a, m) => a + (Number(m.cal) || 0) * (Number(m.qty) || 1), 0),
    [todayMeals]
  );
  const todayMacros = useMemo(() => {
    return todayMeals.reduce(
      (a, m) => {
        const q = Number(m.qty) || 1;
        return {
          protein: a.protein + (Number(m.protein) || 0) * q,
          carbs: a.carbs + (Number(m.carbs) || 0) * q,
          fats: a.fats + (Number(m.fats) || 0) * q,
        };
      },
      { protein: 0, carbs: 0, fats: 0 }
    );
  }, [todayMeals]);

  const weeklyWeight = useMemo(() => {
    const byDate = {};
    weights.forEach((w) => {
      const d = w.date || w.id;
      if (d) byDate[d] = Number(w.weight);
    });
    let last = null;
    return week.map((d) => {
      if (byDate[d.key] != null) last = byDate[d.key];
      return { day: d.label, weight: last, date: d.key };
    });
  }, [weights, week]);

  const calData = useMemo(() => {
    return week.map((d) => {
      const consumed = meals
        .filter((m) => matchesDate(m.date, d.key))
        .reduce((a, m) => a + (Number(m.cal) || 0) * (Number(m.qty) || 1), 0);
      const burned = workouts
        .filter((w) => matchesDate(w.date, d.key))
        .reduce((a, w) => a + (Number(w.caloriesBurned) || Math.round(((Number(w.duration) || 0) / 60) * 6) || 0), 0);
      const c = Math.round(consumed);
      const b = Math.round(burned);
      const net = Math.max(0, c - b);
      return {
        day: d.label,
        consumed: c,
        burned: b,
        net,
        date: d.key,
      };
    });
  }, [meals, workouts, week]);

  const todayBurned = useMemo(() => {
    return todayWorkouts.reduce(
      (a, w) => a + (Number(w.caloriesBurned) || Math.round(((Number(w.duration) || 0) / 60) * 6) || 0),
      0
    );
  }, [todayWorkouts]);

  const todayNetCalories = useMemo(() => {
    return Math.max(0, todayCalories - todayBurned);
  }, [todayCalories, todayBurned]);

  const volumeHistory = useMemo(() => {
    return week.map((d) => {
      const volume = workouts
        .filter((w) => matchesDate(w.date, d.key))
        .reduce((a, w) => a + (Number(w.volume) || 0), 0);
      return { date: d.label, volume, key: d.key };
    });
  }, [workouts, week]);

  const workoutDates = useMemo(
    () =>
      workouts
        .map((w) => {
          if (!w) return null;
          if (typeof w.date === "string") return w.date.slice(0, 10);
          if (w.date) return todayKey(w.date);
          if (w.createdAt) return todayKey(w.createdAt);
          return null;
        })
        .filter(Boolean),
    [workouts]
  );
  const streak = useMemo(() => computeStreak(workoutDates), [workoutDates]);

  const mealGroups = useMemo(() => {
    const colors = {
      Breakfast: "#4f8ef7",
      Lunch: "#a78bfa",
      Dinner: "#34d399",
      Snack: "#fb923c",
      "Pre-Workout": "#f472b6",
      "Post-Workout": "#fbbf24",
    };
    const order = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];
    return order
      .map((meal) => {
        const items = todayMeals.filter((m) => m.meal === meal);
        const cal = items.reduce((a, m) => a + (Number(m.cal) || 0) * (Number(m.qty) || 1), 0);
        return { meal, items, cal, color: colors[meal] || "#4f8ef7" };
      })
      .filter((g) => g.items.length > 0);
  }, [todayMeals]);

  return {
    ready,
    workouts,
    meals,
    weights,
    sleepLogs,
    checkins,
    today,
    todayWorkouts,
    todayMeals,
    todayCalories,
    todayBurned,
    todayNetCalories,
    todayMacros,
    mealGroups,
    weeklyWeight,
    calData,
    volumeHistory,
    streak,
  };
}
