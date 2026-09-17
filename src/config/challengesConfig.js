// src/config/challengesConfig.js — AshFitVerse Challenge & Habit Tracking Engine

export const DEFAULT_CHALLENGES = [
  {
    id: "default_1",
    title: "30-Day Push-up Protocol",
    emoji: "💪",
    color: "#2563eb",
    totalDays: 30,
    daysLeft: 22,
    description: "Execute minimum 50 push-ups daily for 30 consecutive days to build chest and triceps endurance.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
  {
    id: "default_2",
    title: "10K Steps Daily Volume",
    emoji: "🚶",
    color: "#059669",
    totalDays: 14,
    daysLeft: 9,
    description: "Hit 10,000 steps daily. Elevate NEAT and active metabolic recovery across 2 full weeks.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
  {
    id: "default_3",
    title: "Clean Nutrition Sprint",
    emoji: "🥗",
    color: "#7c3aed",
    totalDays: 7,
    daysLeft: 4,
    description: "Zero processed sugar or refined foods for 7 days. Focus strictly on whole, balanced nutrition.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
  {
    id: "default_4",
    title: "21-Day Core Stability Challenge",
    emoji: "🔥",
    color: "#ea580c",
    totalDays: 21,
    daysLeft: 18,
    description: "Maintain static plank holds for at least 60 seconds every day to build midline rigidity.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
  {
    id: "default_5",
    title: "Dawn Discipline — 7 Days",
    emoji: "🌅",
    color: "#d97706",
    totalDays: 7,
    daysLeft: 5,
    description: "Wake up at 5:00 AM and complete a 30-minute structured morning mobility and focus routine.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
  {
    id: "default_6",
    title: "Optimal Hydration — 3L Daily",
    emoji: "💧",
    color: "#0284c7",
    totalDays: 14,
    daysLeft: 11,
    description: "Target at least 3 liters of water intake daily to sustain performance, focus, and digestion.",
    createdBy: "AshFitVerse",
    official: true,
    participants: []
  },
];

export const CHALLENGE_STORAGE_KEY = "ashfitverse_challenge_progress";

export function loadChallengeProgress() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!raw) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const initial = {
        default_1: {
          joinedAt: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
          daysCompleted: 8,
          lastCheckIn: yesterday,
          streak: 8,
        },
        default_2: {
          joinedAt: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
          daysCompleted: 4,
          lastCheckIn: yesterday,
          streak: 4,
        },
      };
      localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export function saveChallengeProgress(data) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save challenge progress:", e);
  }
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getChallengeStats(c, progress = {}) {
  const prog = progress[c.id];
  if (!prog?.joinedAt) {
    return {
      joined: false,
      daysCompleted: 0,
      daysLeft: c.daysLeft || c.totalDays,
      pct: 0,
      lastCheckIn: null,
      streak: 0,
    };
  }
  const daysCompleted = Math.min(prog.daysCompleted || 1, c.totalDays);
  const daysLeft = Math.max(0, c.totalDays - daysCompleted);
  const pct = Math.min(100, Math.round((daysCompleted / Math.max(c.totalDays, 1)) * 100));
  return {
    joined: true,
    daysCompleted,
    daysLeft,
    pct,
    lastCheckIn: prog.lastCheckIn,
    streak: prog.streak || daysCompleted,
  };
}
