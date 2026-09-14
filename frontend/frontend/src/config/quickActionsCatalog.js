// src/config/quickActionsCatalog.js
// ─────────────────────────────────────────────────────────────
// Master catalog of all dashboard quick actions
// Strictly filtered by gender so males and females only see
// features relevant to their biology and goals.
// ─────────────────────────────────────────────────────────────

export const ALL_QUICK_ACTIONS = [
  // ── Workouts (Universal) ──
  {
    id: "workout-logger",
    label: "Workout Logger",
    icon: "🏋️",
    path: "/workout-logger",
    category: "workouts",
    desc: "Log exercises, sets, reps & weight",
    color: "#4f8ef7",
  },
  {
    id: "workout-planner",
    label: "Workout Planner",
    icon: "📋",
    path: "/workout-planner",
    category: "workouts",
    desc: "Personalized split & training plan",
    color: "#a78bfa",
  },
  {
    id: "chest-day",
    label: "Chest Day",
    icon: "💪",
    path: "/workout/chest",
    category: "workouts",
    desc: "Push workout routine & session tracker",
    color: "#60a5fa",
  },
  {
    id: "back-day",
    label: "Back Day",
    icon: "🔙",
    path: "/workout/back",
    category: "workouts",
    desc: "Pull day hypertrophy & strength",
    color: "#818cf8",
  },
  {
    id: "leg-day",
    label: "Leg Day",
    icon: "🦵",
    path: "/workout/legs",
    category: "workouts",
    desc: "Lower body quad & hamstring routine",
    color: "#34d399",
  },
  {
    id: "core-day",
    label: "Core Day",
    icon: "🧘",
    path: "/workout/core",
    category: "workouts",
    desc: "Abs, obliques & rotational stability",
    color: "#fb923c",
  },

  // ── Nutrition (Universal) ──
  {
    id: "diet-logger",
    label: "Diet Logger",
    icon: "🥗",
    path: "/diet-logger",
    category: "nutrition",
    desc: "Log meals, calories, protein & macros",
    color: "#22c55e",
  },
  {
    id: "diet-plan",
    label: "Diet Plan",
    icon: "🍱",
    path: "/diet-plan",
    category: "nutrition",
    desc: "Calorie & macro-tailored meal guide",
    color: "#f59e0b",
  },
  {
    id: "calorie-calc",
    label: "Calorie Calculator",
    icon: "🔥",
    path: "/calorie-calculator",
    category: "nutrition",
    desc: "Calculate TDEE & daily calorie goal",
    color: "#ef4444",
  },

  // ── Health Hubs — Male Exclusive ──
  {
    id: "male-health",
    label: "Men's Health",
    icon: "♂",
    path: "/male-health",
    category: "health",
    desc: "Daily habit check-in & vitality score",
    color: "#3b82f6",
    gender: "male",
  },
  {
    id: "testosterone-guide",
    label: "Testosterone Health",
    icon: "⚡",
    path: "/testosterone-health",
    category: "health",
    desc: "Natural androgen & recovery guide",
    color: "#eab308",
    gender: "male",
  },
  {
    id: "male-mental",
    label: "Men's Mental Health",
    icon: "🧠",
    path: "/male-mental-health",
    category: "health",
    desc: "Mindset, focus & stress tracking",
    color: "#06b6d4",
    gender: "male",
  },
  {
    id: "sexual-wellness",
    label: "Sexual Wellness",
    icon: "🔥",
    path: "/sexual-wellness",
    category: "health",
    desc: "Vitality, stamina & hormonal wellness",
    color: "#f97316",
    gender: "male",
  },

  // ── Health Hubs — Female Exclusive ──
  {
    id: "female-health",
    label: "Women's Health",
    icon: "♀",
    path: "/female-health",
    category: "health",
    desc: "Cycle phase guide & symptoms check-in",
    color: "#ec4899",
    gender: "female",
  },
  {
    id: "cycle-tracker",
    label: "Cycle Tracker",
    icon: "🌸",
    path: "/cycle-tracker",
    category: "health",
    desc: "Period, ovulation & fertility log",
    color: "#f472b6",
    gender: "female",
  },
  {
    id: "female-mental",
    label: "Mental Wellness",
    icon: "🧘‍♀️",
    path: "/female-mental",
    category: "health",
    desc: "Mood, stress & emotional balance log",
    color: "#a855f7",
    gender: "female",
  },
  {
    id: "pcos-guide",
    label: "PCOS Guide",
    icon: "🌿",
    path: "/pcos-guide",
    category: "health",
    desc: "Hormone balance & dietary guidance",
    color: "#10b981",
    gender: "female",
  },
  {
    id: "hormone-nutrition",
    label: "Hormone Nutrition",
    icon: "🥑",
    path: "/hormone-nutrition",
    category: "health",
    desc: "Cycle-synced nutrition & hormone balance",
    color: "#34d399",
    gender: "female",
  },
  {
    id: "pregnancy-guide",
    label: "Pregnancy Guide",
    icon: "🤰",
    path: "/pregnancy-guide",
    category: "health",
    desc: "Trimester fitness & pelvic floor health",
    color: "#fb7185",
    gender: "female",
  },
  {
    id: "contraception-guide",
    label: "Contraception Guide",
    icon: "💊",
    path: "/contraception",
    category: "health",
    desc: "Protection, safety & cycle tracking",
    color: "#c084fc",
    gender: "female",
  },

  // ── Health Hubs — Universal ──
  {
    id: "sleep-tracker",
    label: "Sleep Tracker",
    icon: "😴",
    path: "/sleep-tracker",
    category: "health",
    desc: "Sleep duration, quality & recovery log",
    color: "#8b5cf6",
  },

  // ── Tools & Calculators (Universal) ──
  {
    id: "bmi-calc",
    label: "BMI Calculator",
    icon: "📏",
    path: "/bmi-calculator",
    category: "tools",
    desc: "Body Mass Index & category review",
    color: "#38bdf8",
  },
  {
    id: "fat-calc",
    label: "Body Fat %",
    icon: "📊",
    path: "/fat-calculator",
    category: "tools",
    desc: "Navy-tape body fat percentage estimate",
    color: "#fbbf24",
  },
  {
    id: "weight-checkin",
    label: "Weight Check-in",
    icon: "⚖️",
    path: "#weight-modal",
    category: "tools",
    desc: "1-tap morning weigh-in & trend log",
    color: "#a3e635",
  },
  {
    id: "feedback-modal",
    label: "Rate & Feedback",
    icon: "💬",
    path: "#feedback-modal",
    category: "tools",
    desc: "Send ratings, feature ideas & feedback",
    color: "#38bdf8",
  },

  // ── Shop & Social ──
  {
    id: "shop",
    label: "Store",
    icon: "🛒",
    path: "/shop",
    category: "shop",
    desc: "Supplements, vitamins & training gear",
    color: "#e879f9",
  },
  {
    id: "male-shop",
    label: "Men's Wellness Shop",
    icon: "🛍️",
    path: "/male-shop",
    category: "shop",
    desc: "Male vitality & performance supplements",
    color: "#3b82f6",
    gender: "male",
  },
  {
    id: "female-shop",
    label: "Women's Wellness Shop",
    icon: "🛍️",
    path: "/female-shop",
    category: "shop",
    desc: "Cycle care & female wellness products",
    color: "#ec4899",
    gender: "female",
  },
  {
    id: "community",
    label: "Community Feed",
    icon: "💬",
    path: "/community",
    category: "shop",
    desc: "Athlete discussions & questions",
    color: "#6366f1",
  },
  {
    id: "pricing",
    label: "Pro Upgrade",
    icon: "⭐",
    path: "/pricing",
    category: "shop",
    desc: "Unlock advanced features & plans",
    color: "#f59e0b",
  },
];

export const QA_CATEGORIES = [
  { id: "all", label: "All Actions" },
  { id: "workouts", label: "🏋️ Workouts" },
  { id: "nutrition", label: "🥗 Nutrition" },
  { id: "health", label: "🩺 Health Hubs" },
  { id: "tools", label: "🧮 Tools & Calc" },
  { id: "shop", label: "🛒 Store & Feed" },
];

export const QA_THEMES = [
  { id: "cyan", name: "Electric Cyan", color: "#4f8ef7", glow: "rgba(79,142,247,0.32)" },
  { id: "purple", name: "Cyber Purple", color: "#a78bfa", glow: "rgba(167,139,250,0.32)" },
  { id: "emerald", name: "Emerald Pulse", color: "#34d399", glow: "rgba(52,211,153,0.32)" },
  { id: "sunset", name: "Sunset Blaze", color: "#fb923c", glow: "rgba(251,146,60,0.32)" },
  { id: "sakura", name: "Sakura Pink", color: "#f472b6", glow: "rgba(244,114,182,0.32)" },
];

/**
 * Check whether a single action is valid for a given user.
 * Biological and gender-specific actions are restricted:
 * - Males cannot view or add female health, cycle tracker, PCOS, women's shop, etc.
 * - Females cannot view or add men's health, testosterone, sexual wellness, men's shop, etc.
 */
export function isActionAllowedForUser(action, user) {
  if (!action) return false;
  const sex = (user?.sex || user?.gender || "").toLowerCase();
  const isFemale = sex === "female";
  const isMale = sex === "male";

  // Check canonical definition if available
  const canonical = ALL_QUICK_ACTIONS.find((a) => a.id === action.id) || action;
  const gender = canonical.gender || action.gender;

  if (gender === "male" && !isMale) return false;
  if (gender === "female" && !isFemale) return false;
  return true;
}

/**
 * Filter all actions based on the user's gender.
 * Strictly guarantees males and females only get their relevant options.
 */
export function getActionsForUser(user) {
  return ALL_QUICK_ACTIONS.filter((action) => isActionAllowedForUser(action, user));
}

/**
 * Sanitize an array of actions against user's gender.
 * Removes cross-gender actions and enriches with canonical attributes.
 */
export function sanitizeActionsForUser(actions, user) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return getDefaultQuickActions(user);
  }
  const sanitized = actions
    .filter((action) => isActionAllowedForUser(action, user))
    .map((action) => {
      const canonical = ALL_QUICK_ACTIONS.find((a) => a.id === action.id);
      return canonical ? { ...canonical, ...action } : action;
    });

  return sanitized.length > 0 ? sanitized : getDefaultQuickActions(user);
}

export function getDefaultQuickActions(user) {
  const sex = (user?.sex || user?.gender || "").toLowerCase();
  const isFemale = sex === "female";
  const isMale = sex === "male";

  const defaultIds = [
    "workout-logger",
    "diet-logger",
    "workout-planner",
    "diet-plan",
    ...(isFemale ? ["female-health"] : isMale ? ["male-health"] : ["shop"]),
  ];

  const allowed = getActionsForUser(user);
  return allowed.filter((action) => defaultIds.includes(action.id));
}
