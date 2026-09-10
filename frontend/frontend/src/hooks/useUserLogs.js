import { useEffect, useMemo, useState } from "react";
import { listenDated, listenLogs, lastNDays, todayKey, computeStreak } from "../lib/userLogs";

export default function useUserLogs(uid) {
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [ready, setReady] = useState(!uid);

  useEffect(() => {
    if (!uid) {
      setWorkouts([]); setMeals([]); setWeights([]); setSleepLogs([]); setCheckins([]);
      setReady(true);
      return;
    }
    setReady(false);
    const u1 = listenLogs(uid, "workouts", setWorkouts);
    const u2 = listenLogs(uid, "meals", setMeals);
    const u3 = listenDated(uid, "weights", setWeights);
    const u4 = listenDated(uid, "sleepLogs", setSleepLogs);
    const u5 = listenDated(uid, "dailyCheckins", setCheckins);
    const t = setTimeout(() => setReady(true), 600);
    return () => { u1(); u2(); u3(); u4(); u5(); clearTimeout(t); };
  }, [uid]);

  const today = todayKey();
  const week = lastNDays(7);

  const todayWorkouts = useMemo(
    () => workouts.filter((w) => w.date === today),
    [workouts, today]
  );
  const todayMeals = useMemo(
    () => meals.filter((m) => m.date === today),
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
    weights.forEach((w) => { if (w.date) byDate[w.date] = Number(w.weight); });
    let last = null;
    return week.map((d) => {
      if (byDate[d.key] != null) last = byDate[d.key];
      return { day: d.label, weight: last, date: d.key };
    });
  }, [weights, week]);

  const calData = useMemo(() => {
    return week.map((d) => {
      const consumed = meals
        .filter((m) => m.date === d.key)
        .reduce((a, m) => a + (Number(m.cal) || 0) * (Number(m.qty) || 1), 0);
      const burned = workouts
        .filter((w) => w.date === d.key)
        .reduce((a, w) => a + (Number(w.caloriesBurned) || Math.round((Number(w.duration) || 0) / 60 * 6) || 0), 0);
      return { day: d.label, consumed: Math.round(consumed), burned: Math.round(burned), date: d.key };
    });
  }, [meals, workouts, week]);

  const volumeHistory = useMemo(() => {
    return week.map((d) => {
      const volume = workouts
        .filter((w) => w.date === d.key)
        .reduce((a, w) => a + (Number(w.volume) || 0), 0);
      return { date: d.label, volume, key: d.key };
    });
  }, [workouts, week]);

  const workoutDates = useMemo(
    () => workouts.map((w) => w.date).filter(Boolean),
    [workouts]
  );
  const streak = useMemo(() => computeStreak(workoutDates), [workoutDates]);

  const mealGroups = useMemo(() => {
    const colors = {
      Breakfast: "#4f8ef7", Lunch: "#a78bfa", Dinner: "#34d399",
      Snack: "#fb923c", "Pre-Workout": "#f472b6", "Post-Workout": "#fbbf24",
    };
    const order = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];
    return order
      .map((meal) => {
        const items = todayMeals.filter((m) => m.meal === meal);
        const cal = items.reduce((a, m) => a + (Number(m.cal) || 0) * (Number(m.qty) || 1), 0);
        return { meal, items, cal, color: colors[meal] };
      })
      .filter((g) => g.items.length > 0);
  }, [todayMeals]);

  return {
    ready,
    workouts, meals, weights, sleepLogs, checkins,
    today, todayWorkouts, todayMeals, todayCalories, todayMacros, mealGroups,
    weeklyWeight, calData, volumeHistory, streak,
  };
}
