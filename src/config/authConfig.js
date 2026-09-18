// src/config/authConfig.js
// ─────────────────────────────────────────────────────────────
// Master Authentication & Role Configuration
// Strict admin privileges granted to specified master emails.
// ─────────────────────────────────────────────────────────────

export const ADMIN_EMAILS = [
  "ashishkanellis33@gmail.com",
];

/**
 * Check whether a user or auth session has admin privileges.
 * Strictly verifies against canonical ADMIN_EMAILS.
 */
export function isUserAdmin(user, authUser) {
  const emailCandidates = [
    user?.email,
    authUser?.email,
    typeof window !== "undefined" ? localStorage.getItem("ashfitverse_email") : null,
    typeof window !== "undefined" ? (() => {
      try {
        const u = JSON.parse(localStorage.getItem("ashfitverse_user") || "{}");
        return u.email;
      } catch {
        return null;
      }
    })() : null,
  ];

  for (const candidate of emailCandidates) {
    if (candidate && typeof candidate === "string") {
      const clean = candidate.trim().toLowerCase();
      if (ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)) {
        return true;
      }
    }
  }

  return false;
}
