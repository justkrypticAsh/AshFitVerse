// planConfig.js — mirrors Pricing.jsx tier definitions
// free: basics | lite: tools + community write | pro: health hubs + AI

export const PLAN_RANK = { free: 0, lite: 1, pro: 2 };

export const PLAN_META = {
  free: { name: "Free", color: "#0a84ff", emoji: "🌱", price: "₹0" },
  lite: { name: "Lite", color: "#9d22d6", emoji: "⚡", price: "₹199/mo" },
  pro:  { name: "Pro",  color: "#e67e00", emoji: "🏆", price: "₹499/mo" },
};

/** Minimum plan per route (pathname without query) */
export const ROUTE_MIN_PLAN = {
  "/dashboard":           "free",
  "/profile":             "free",
  "/pricing":             "free",
  "/bmi-calculator":      "free",
  "/calorie-calculator":  "free",
  "/workout/chest":       "free",
  "/workout/back":        "free",
  "/workout/legs":        "free",
  "/workout/core":        "free",
  "/community":           "free", // read-only for free — write gated in Community.jsx
  "/shop":                "free",

  "/fat-calculator":      "lite",
  "/workout-planner":     "lite",
  "/workout-logger":      "lite",
  "/diet-logger":         "lite",
  "/diet-plan":           "lite",

  "/female-health":       "pro",
  "/cycle-tracker":       "pro",
  "/pcos-guide":          "pro",
  "/hormone-nutrition":   "pro",
  "/female-mental":       "pro",
  "/contraception":       "pro",
  "/contraception-guide": "pro",
  "/pregnancy-guide":     "pro",
  "/female-shop":         "pro",

  "/male-health":         "pro",
  "/testosterone-health": "pro",
  "/male-mental-health":  "pro",
  "/sexual-wellness":     "pro",
  "/sleep-tracker":       "pro",
  "/male-shop":           "pro",
};

export const ROUTE_LABELS = {
  "/fat-calculator":      "Fat % Body Calculator",
  "/workout-planner":     "Workout Planner",
  "/workout-logger":      "Workout Logger",
  "/diet-logger":         "Diet Logger",
  "/diet-plan":           "Diet Plan Generator",
  "/female-health":       "Women's Health Hub",
  "/cycle-tracker":       "Cycle Tracker",
  "/pcos-guide":          "PCOS Guide",
  "/hormone-nutrition":   "Hormone Nutrition",
  "/female-mental":       "Mental Wellness",
  "/contraception":       "Contraception Guide",
  "/contraception-guide": "Contraception Guide",
  "/pregnancy-guide":     "Pregnancy Guide",
  "/female-shop":         "Women's Wellness Shop",
  "/male-health":         "Men's Health Hub",
  "/testosterone-health": "Testosterone Health",
  "/male-mental-health":  "Men's Mental Health",
  "/sexual-wellness":     "Sexual Wellness",
  "/sleep-tracker":       "Sleep Tracker",
  "/male-shop":           "Men's Wellness Shop",
};

export function resolveEffectivePlan(user) {
  const raw = user?.plan || "free";
  if (raw === "free") return "free";

  const expires = user?.planExpiresAt;
  let expDate = null;
  if (expires?.toDate) expDate = expires.toDate();
  else if (expires) expDate = new Date(expires);

  if (expDate && expDate < new Date()) return "free";
  if (!PLAN_RANK[raw]) return "free";
  return raw;
}

export function hasMinPlan(effectivePlan, minPlan) {
  return (PLAN_RANK[effectivePlan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0);
}

export function getRouteMinPlan(pathname) {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  if (ROUTE_MIN_PLAN[path]) return ROUTE_MIN_PLAN[path];
  if (path.startsWith("/user/")) return "free";
  return "free";
}
