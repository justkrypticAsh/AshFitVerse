// src/hooks/useUser.js
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const DEFAULT_USER = {
  name: "Athlete",
  age: "",
  sex: "",
  height: "",
  weight: "",
  targetWeight: "",
  goal: "general",
  activityLevel: "moderate",
  equipment: "full_gym",
  cycleLength: "28",
  lastPeriod: "",
  femaleCondition: "none",
  femaleGoals: [],
  maleFocus: [],
  maleConcerns: "none",
  streak: 0,
  createdAt: null,
};

export default function useUser() {
  const [user, setUser]           = useState(null);  // null until auth resolves
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [uid, setUid]             = useState(null);

  useEffect(() => {
    let unsubDoc = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(DEFAULT_USER);
        setOnboarded(false);
        setLoading(false);
        setUid(null);
        return;
      }

      setUid(firebaseUser.uid);

      const ref = doc(db, "users", firebaseUser.uid);
      unsubDoc = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const merged = { ...DEFAULT_USER, ...data };
          setUser(merged);
          const isOnboarded = !!(data.agreeTerms || (data.name && data.name !== "Athlete" && data.age));
          setOnboarded(isOnboarded);
          localStorage.setItem("ashfitverse_user", JSON.stringify(merged));
          if (isOnboarded) localStorage.setItem("ashfitverse_onboarded", "true");
        } else {
          // No Firestore doc — try localStorage cache
          const saved = localStorage.getItem("ashfitverse_user");
          const localOnboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
          setUser(saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER);
          setOnboarded(localOnboarded);
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore listener error:", err);
        const saved = localStorage.getItem("ashfitverse_user");
        const localOnboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
        setUser(saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER);
        setOnboarded(localOnboarded);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // ── Update user — saves to Firestore + localStorage ──────────────────
  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("ashfitverse_user", JSON.stringify(updated));

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), updated, { merge: true });
      } catch (err) {
        console.error("Firestore updateUser error:", err);
      }
    }
  };

  // ── Log today's data (weight, calories, mood etc.) ──────────────────
  const logToday = async (updates) => {
    const today = new Date().toISOString().split("T")[0];
    const logKey = `logs.${today.replace(/-/g, "_")}`;
    const merged = { ...user, dailyLogs: { ...(user.dailyLogs || {}), [today]: { ...(user.dailyLogs?.[today] || {}), ...updates } } };
    setUser(merged);
    localStorage.setItem("ashfitverse_user", JSON.stringify(merged));

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), merged, { merge: true });
      } catch (err) {
        console.error("Firestore logToday error:", err);
      }
    }
  };

  // ── Clear user — logout ──────────────────────────────────────────────
  const clearUser = () => {
    localStorage.removeItem("ashfitverse_user");
    localStorage.removeItem("ashfitverse_onboarded");
    auth.signOut();
    setUser(DEFAULT_USER);
    setOnboarded(false);
    setUid(null);
  };

  // ── Computed values (safe against null user) ────────────────────────
  const safeUser = user || DEFAULT_USER;
  const isMale   = safeUser.sex === "male";
  const isFemale = safeUser.sex === "female";
  const isOther  = safeUser.sex === "other" || !safeUser.sex;

  const bmi = safeUser.height && safeUser.weight
    ? parseFloat((+safeUser.weight / ((+safeUser.height / 100) ** 2)).toFixed(1))
    : null;

  const bmr = safeUser.height && safeUser.weight && safeUser.age
    ? isFemale
      ? 10 * +safeUser.weight + 6.25 * +safeUser.height - 5 * +safeUser.age - 161
      : 10 * +safeUser.weight + 6.25 * +safeUser.height - 5 * +safeUser.age + 5
    : null;

  const activityMultipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55,
    active: 1.725, very_active: 1.9,
  };
  const tdee = bmr
    ? Math.round(bmr * (activityMultipliers[safeUser.activityLevel] || 1.55))
    : null;

  const goalDeltas = {
    muscle: 300, fat_loss: -500, strength: 100,
    endurance: 0, general: 0, wellness: 0,
  };
  const calorieTarget = tdee ? tdee + (goalDeltas[safeUser.goal] || 0) : null;

  const weightProgress = safeUser.weight && safeUser.targetWeight
    ? Math.min(100, Math.max(0, Math.round(
        Math.abs(+safeUser.weight - +safeUser.targetWeight) /
        Math.max(Math.abs((+safeUser.weight - 5) - +safeUser.targetWeight), 1) * 100
      )))
    : 0;

  const hasPCOS          = safeUser.femaleCondition === "pcos";
  const hasPCOD          = safeUser.femaleCondition === "pcod";
  const hasEndometriosis = safeUser.femaleCondition === "endo";
  const hasThyroid       = safeUser.femaleCondition === "thyroid";

  const hasMentalHealthFocus = safeUser.maleFocus?.includes("mental")   || safeUser.maleFocus?.includes("all");
  const hasSexualHealthFocus = safeUser.maleFocus?.includes("sexual")   || safeUser.maleFocus?.includes("all");
  const hasHormoneFocus      = safeUser.maleFocus?.includes("hormones") || safeUser.maleFocus?.includes("all");

  const getCycleDay = () => {
    if (!safeUser.lastPeriod) return null;
    const diff = Math.floor((Date.now() - new Date(safeUser.lastPeriod).getTime()) / 86400000);
    return (diff % (parseInt(safeUser.cycleLength) || 28)) + 1;
  };

  const getPhaseName = (day) => {
    if (!day) return "Unknown";
    if (day <= 5)  return "Menstrual 🔴";
    if (day <= 13) return "Follicular 🌱";
    if (day <= 16) return "Ovulation ✨";
    return "Luteal 🌙";
  };

  return {
    user: safeUser, updateUser, logToday, clearUser,
    onboarded, loading, uid,
    isMale, isFemale, isOther,
    bmi, tdee, calorieTarget, weightProgress,
    hasMentalHealthFocus, hasSexualHealthFocus, hasHormoneFocus,
    hasPCOS, hasPCOD, hasEndometriosis, hasThyroid,
    getCycleDay, getPhaseName,
  };
}