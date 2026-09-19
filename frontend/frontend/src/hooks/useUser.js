// src/hooks/useUser.js
// ─────────────────────────────────────────────────────────────
// Source of truth: Firebase Auth + Firestore
// localStorage = cache only (for faster first render)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { resolveEffectivePlan, hasMinPlan } from "../config/planConfig";
import { getEffectiveUid } from "../lib/userLogs";
import { isUserAdmin } from "../config/authConfig";

export const DEFAULT_USER = {
  name: "Athlete",
  username: "",
  bio: "",
  plan: "free",
  planBilling: "",
  planExpiresAt: null,
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
  points: 0,
  online: false,
  avatar: null,
};

export async function checkUsernameUnique(rawUsername, currentUid) {
  if (!rawUsername) return { valid: false, error: "Username cannot be empty." };
  const username = rawUsername.trim().toLowerCase().replace(/^@/, "");
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    return {
      valid: false,
      error: "Username must be 3–20 characters, containing only lowercase letters, numbers, underscores, or dots.",
    };
  }
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const snap = await getDocs(q);
    const isTakenByOther = snap.docs.some((d) => d.id !== currentUid);
    if (isTakenByOther) {
      return { valid: false, error: `@${username} is already taken by another athlete.` };
    }
    return { valid: true, username };
  } catch (err) {
    console.warn("checkUsernameUnique fallback:", err);
    return { valid: true, username };
  }
}

export default function useUser() {
  const [user,      setUser]      = useState(() => {
    // Fast first render from localStorage cache
    try {
      const cached = localStorage.getItem("ashfitverse_user");
      return cached ? { ...DEFAULT_USER, ...JSON.parse(cached) } : DEFAULT_USER;
    } catch { return DEFAULT_USER; }
  });
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("ashfitverse_onboarded") === "true"
  );
  const [loading,   setLoading]   = useState(() => {
    try {
      return !localStorage.getItem("ashfitverse_user");
    } catch { return false; }
  });
  const [authUid,   setAuthUid]   = useState(() => getEffectiveUid());

  // Safety fallback: never leave UI on a blank loader
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // ── Auth listener ──────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthUid(firebaseUser.uid);
        try { localStorage.setItem("ashfitverse_uid", firebaseUser.uid); } catch {}
      } else {
        const localUid = getEffectiveUid();
        setAuthUid(localUid);
        const cached = localStorage.getItem("ashfitverse_user");
        if (cached) {
          try {
            setUser({ ...DEFAULT_USER, ...JSON.parse(cached) });
            setOnboarded(true);
          } catch {}
        } else {
          setUser(DEFAULT_USER);
          setOnboarded(false);
        }
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // ── Firestore real-time listener ───────────────────────────
  useEffect(() => {
    if (!authUid || authUid.startsWith("athlete_") || !auth.currentUser) return;

    const userRef = doc(db, "users", authUid);
    const unsubSnap = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = { ...DEFAULT_USER, ...snap.data() };
          setUser(data);
          setOnboarded(true);
          // Sync to localStorage as cache
          localStorage.setItem("ashfitverse_user",   JSON.stringify(data));
          localStorage.setItem("ashfitverse_onboarded", "true");
        } else {
          // Doc doesn't exist yet — user hasn't completed onboarding
          setOnboarded(false);
        }
        setLoading(false);
      },
      (err) => {
        // Firestore read failed — fall back to localStorage
        console.warn("Firestore read failed, using localStorage:", err.message);
        const cached = localStorage.getItem("ashfitverse_user");
        if (cached) {
          try { setUser({ ...DEFAULT_USER, ...JSON.parse(cached) }); } catch {}
        }
        setOnboarded(localStorage.getItem("ashfitverse_onboarded") === "true");
        setLoading(false);
      }
    );

    return () => unsubSnap();
  }, [authUid]);

  // ── updateUser — saves to Firestore + localStorage ─────────
  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated); // optimistic
    localStorage.setItem("ashfitverse_user", JSON.stringify(updated));

    const effectiveUid = authUid || getEffectiveUid();
    if (auth.currentUser && !effectiveUid.startsWith("athlete_")) {
      try {
        await setDoc(doc(db, "users", effectiveUid), updated, { merge: true });
      } catch (e) {
        console.warn("updateUser Firestore error:", e);
      }
    }
  };

  // ── clearUser — logout cleanup ─────────────────────────────
  const clearUser = async () => {
    const effectiveUid = authUid || getEffectiveUid();
    if (auth.currentUser && !effectiveUid.startsWith("athlete_")) {
      try {
        await updateDoc(doc(db, "users", effectiveUid), { online: false });
      } catch {}
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signOut error:", e);
    }
    localStorage.removeItem("ashfitverse_user");
    localStorage.removeItem("ashfitverse_onboarded");
    localStorage.removeItem("ashfitverse_uid");
    localStorage.removeItem("ashfitverse_email");
    localStorage.removeItem("ashfitverse_signup_name");
    localStorage.removeItem("ashfitverse_custom_qa");
    setUser(DEFAULT_USER);
    setOnboarded(false);
    setAuthUid(getEffectiveUid());
  };

  // ── Cycle helpers ──────────────────────────────────────────
  const getCycleDay = () => {
    if (!user.lastPeriod) return null;
    const diff = Math.floor((Date.now() - new Date(user.lastPeriod)) / 86400000);
    const len  = parseInt(user.cycleLength) || 28;
    return (diff % len) + 1;
  };

  const getPhaseName = (day) => {
    if (!day) return "Unknown";
    if (day <= 5)  return "Menstrual 🔴";
    if (day <= 13) return "Follicular 🌱";
    if (day <= 16) return "Ovulation ✨";
    return "Luteal 🌙";
  };

  // ── Computed ───────────────────────────────────────────────
  const isMale   = user.sex === "male";
  const isFemale = user.sex === "female";
  const isOther  = !user.sex || user.sex === "other";

  const bmi = user.height && user.weight
    ? parseFloat((+user.weight / ((+user.height / 100) ** 2)).toFixed(1))
    : null;

  const bmr = user.height && user.weight && user.age
    ? isFemale
      ? 10 * +user.weight + 6.25 * +user.height - 5 * +user.age - 161
      : 10 * +user.weight + 6.25 * +user.height - 5 * +user.age + 5
    : null;

  const ACTIVITY_MUL = {
    sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9,
  };
  const tdee = bmr
    ? Math.round(bmr * (ACTIVITY_MUL[user.activityLevel] || 1.55))
    : null;

  const GOAL_DELTA = {
    muscle:300, fat_loss:-500, strength:100, endurance:0, general:0, wellness:0,
  };
  const calorieTarget = tdee
    ? tdee + (GOAL_DELTA[user.goal] || 0)
    : null;

  const weightProgress = user.weight && user.targetWeight
    ? Math.min(100, Math.max(0, Math.round(
        Math.abs(+user.weight - +user.targetWeight) === 0 ? 100
        : (1 - Math.abs(+user.weight - +user.targetWeight) /
            Math.abs((+user.weight - 5) - +user.targetWeight)) * 100
      )))
    : 0;

  // Male flags
  const hasMentalHealthFocus = (user.maleFocus||[]).includes("mental")   || (user.maleFocus||[]).includes("all");
  const hasSexualHealthFocus = (user.maleFocus||[]).includes("sexual")   || (user.maleFocus||[]).includes("all");
  const hasHormoneFocus      = (user.maleFocus||[]).includes("hormones") || (user.maleFocus||[]).includes("all");

  // Female flags
  const hasPCOS          = user.femaleCondition === "pcos";
  const hasPCOD          = user.femaleCondition === "pcod";
  const hasEndometriosis = user.femaleCondition === "endo";
  const hasThyroid       = user.femaleCondition === "thyroid";

  const effectivePlan = resolveEffectivePlan(user);
  const hasPlan = (minPlan) => hasMinPlan(effectivePlan, minPlan);
  const isLite = hasPlan("lite");
  const isPro  = hasPlan("pro");
  const isAdmin = isUserAdmin(user, auth?.currentUser);

  return {
    user, updateUser, clearUser,
    authUid, onboarded, loading,
    isMale, isFemale, isOther,
    isAdmin,
    hasMentalHealthFocus, hasSexualHealthFocus, hasHormoneFocus,
    hasPCOS, hasPCOD, hasEndometriosis, hasThyroid,
    bmi, tdee, calorieTarget, weightProgress,
    getCycleDay, getPhaseName,
    effectivePlan, hasPlan, isLite, isPro,
  };
}

export { useUser };