import {
  collection, addDoc, setDoc, doc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export function todayKey(d = new Date()) {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function lastNDays(n) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push({ key: todayKey(d), label: labels[d.getDay()], date: d });
  }
  return out;
}

export function getEffectiveUid(passedUid) {
  if (passedUid && typeof passedUid === "string" && passedUid.trim()) {
    try { localStorage.setItem("ashfitverse_uid", passedUid); } catch {}
    return passedUid;
  }
  if (auth?.currentUser?.uid) {
    try { localStorage.setItem("ashfitverse_uid", auth.currentUser.uid); } catch {}
    return auth.currentUser.uid;
  }
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("ashfitverse_uid") : null;
  if (stored) return stored;
  try {
    const cached = localStorage.getItem("ashfitverse_user");
    if (cached) {
      const u = JSON.parse(cached);
      if (u.uid || u.id) {
        localStorage.setItem("ashfitverse_uid", u.uid || u.id);
        return u.uid || u.id;
      }
    }
  } catch {}
  let fallback = typeof localStorage !== "undefined" ? localStorage.getItem("ashfitverse_fallback_uid") : null;
  if (!fallback) {
    fallback = "athlete_" + Math.random().toString(36).slice(2, 9);
    try { localStorage.setItem("ashfitverse_fallback_uid", fallback); } catch {}
  }
  return fallback;
}

function storageKey(uid, collectionName) {
  return `ashfitverse_logs_${collectionName}_${uid}`;
}

export function getLocalLogs(uid, collectionName) {
  const effectiveUid = getEffectiveUid(uid);
  try {
    const raw = localStorage.getItem(storageKey(effectiveUid, collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLogs(uid, collectionName, items) {
  const effectiveUid = getEffectiveUid(uid);
  try {
    localStorage.setItem(storageKey(effectiveUid, collectionName), JSON.stringify(items));
  } catch (e) {
    console.warn("Local storage write error:", e);
  }
}

function notifyChange(uid, collectionName) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ashfitverse:data_updated", {
      detail: { uid, collectionName, timestamp: Date.now() },
    })
  );
}

function col(uid, name) {
  return collection(db, "users", uid, name);
}

export async function addLog(uid, collectionName, data) {
  const effectiveUid = getEffectiveUid(uid);
  const localId = "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const localEntry = {
    id: localId,
    ...data,
    date: data.date || todayKey(),
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately persist to localStorage for 0ms reactivity
  const current = getLocalLogs(effectiveUid, collectionName);
  const updated = [localEntry, ...current];
  saveLocalLogs(effectiveUid, collectionName, updated);
  notifyChange(effectiveUid, collectionName);

  // 2. Cloud sync in background (if online & authenticated)
  try {
    if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
      addDoc(col(effectiveUid, collectionName), {
        ...data,
        date: data.date || todayKey(),
        createdAt: serverTimestamp(),
      }).then((docRef) => {
        if (docRef?.id) {
          const fresh = getLocalLogs(effectiveUid, collectionName).map((item) =>
            item.id === localId ? { ...item, id: docRef.id } : item
          );
          saveLocalLogs(effectiveUid, collectionName, fresh);
        }
      }).catch((err) => {
        console.warn(`Firestore sync for ${collectionName} failed (kept local):`, err?.message || err);
      });
    }
  } catch (err) {
    console.warn(`Firestore background save caught for ${collectionName}:`, err);
  }

  return localEntry;
}

export async function upsertDated(uid, collectionName, date, data) {
  const effectiveUid = getEffectiveUid(uid);
  const d = date || todayKey();
  const current = getLocalLogs(effectiveUid, collectionName);
  const existingIdx = current.findIndex((item) => item.date === d || item.id === d);
  const entry = {
    id: d,
    date: d,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...entry };
  } else {
    updated = [entry, ...current];
  }
  saveLocalLogs(effectiveUid, collectionName, updated);
  notifyChange(effectiveUid, collectionName);

  try {
    if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
      setDoc(
        doc(db, "users", effectiveUid, collectionName, d),
        { ...data, date: d, updatedAt: serverTimestamp() },
        { merge: true }
      ).catch((err) => {
        console.warn(`Firestore upsert for ${collectionName}/${d} failed:`, err?.message || err);
      });
    }
  } catch (err) {
    console.warn(`Firestore upsert caught:`, err);
  }

  return entry;
}

export async function deleteLog(uid, collectionName, id) {
  const effectiveUid = getEffectiveUid(uid);
  const current = getLocalLogs(effectiveUid, collectionName);
  const updated = current.filter((item) => item.id !== id);
  saveLocalLogs(effectiveUid, collectionName, updated);
  notifyChange(effectiveUid, collectionName);

  try {
    if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
      deleteDoc(doc(db, "users", effectiveUid, collectionName, id)).catch(() => {});
    }
  } catch {}
}

export function listenLogs(uid, collectionName, cb, { ordered = true, cap = 80 } = {}) {
  const effectiveUid = getEffectiveUid(uid);

  // Synchronously deliver local logs immediately
  cb(getLocalLogs(effectiveUid, collectionName));

  const handleUpdate = (e) => {
    if (!e.detail || e.detail.collectionName === collectionName) {
      cb(getLocalLogs(effectiveUid, collectionName));
    }
  };
  const handleStorage = (e) => {
    if (e.key === storageKey(effectiveUid, collectionName)) {
      cb(getLocalLogs(effectiveUid, collectionName));
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("ashfitverse:data_updated", handleUpdate);
    window.addEventListener("storage", handleStorage);
  }

  let unsubFirestore = () => {};
  if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
    try {
      const q = ordered
        ? query(col(effectiveUid, collectionName), orderBy("createdAt", "desc"), limit(cap))
        : query(col(effectiveUid, collectionName), limit(cap));
      unsubFirestore = onSnapshot(
        q,
        (snap) => {
          const remoteDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const localDocs = getLocalLogs(effectiveUid, collectionName);
          const remoteIds = new Set(remoteDocs.map((r) => r.id));
          const unsyncedLocal = localDocs.filter(
            (l) => typeof l.id === "string" && l.id.startsWith("log_") && !remoteIds.has(l.id)
          );
          const combined = [...unsyncedLocal, ...remoteDocs];
          saveLocalLogs(effectiveUid, collectionName, combined);
          cb(combined);
        },
        (err) => {
          console.warn(`Firestore onSnapshot fallback for ${collectionName}:`, err?.message || err);
          cb(getLocalLogs(effectiveUid, collectionName));
        }
      );
    } catch (e) {
      console.warn(`Error attaching onSnapshot for ${collectionName}:`, e);
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("ashfitverse:data_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    }
    unsubFirestore();
  };
}

export function listenDated(uid, collectionName, cb) {
  const effectiveUid = getEffectiveUid(uid);

  cb(getLocalLogs(effectiveUid, collectionName));

  const handleUpdate = (e) => {
    if (!e.detail || e.detail.collectionName === collectionName) {
      cb(getLocalLogs(effectiveUid, collectionName));
    }
  };
  const handleStorage = (e) => {
    if (e.key === storageKey(effectiveUid, collectionName)) {
      cb(getLocalLogs(effectiveUid, collectionName));
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("ashfitverse:data_updated", handleUpdate);
    window.addEventListener("storage", handleStorage);
  }

  let unsubFirestore = () => {};
  if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
    try {
      unsubFirestore = onSnapshot(
        col(effectiveUid, collectionName),
        (snap) => {
          const remoteDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const localDocs = getLocalLogs(effectiveUid, collectionName);
          const byDate = {};
          localDocs.forEach((d) => { if (d.date || d.id) byDate[d.date || d.id] = d; });
          remoteDocs.forEach((d) => { if (d.date || d.id) byDate[d.date || d.id] = d; });
          const combined = Object.values(byDate);
          saveLocalLogs(effectiveUid, collectionName, combined);
          cb(combined);
        },
        (err) => {
          console.warn(`Firestore listenDated fallback for ${collectionName}:`, err?.message || err);
          cb(getLocalLogs(effectiveUid, collectionName));
        }
      );
    } catch (e) {
      console.warn(`Error attaching listenDated for ${collectionName}:`, e);
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("ashfitverse:data_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    }
    unsubFirestore();
  };
}

export function computeStreak(dates) {
  const set = new Set((dates || []).filter(Boolean));
  let streak = 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  // Allow streak to continue if today's log is missing but yesterday exists
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export async function addAppNotification(uid, { text, type = "info", path = "/dashboard" }) {
  const effectiveUid = getEffectiveUid(uid);
  if (!text) return null;
  const item = {
    id: "notif_" + Date.now(),
    text,
    type,
    path,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const current = getLocalLogs(effectiveUid, "notifications");
  saveLocalLogs(effectiveUid, "notifications", [item, ...current]);
  notifyChange(effectiveUid, "notifications");

  try {
    if (auth?.currentUser && !effectiveUid.startsWith("athlete_")) {
      addDoc(col(effectiveUid, "notifications"), {
        text,
        type,
        path,
        read: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }
  } catch {}
  return item;
}
