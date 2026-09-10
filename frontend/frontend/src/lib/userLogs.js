import {
  collection, addDoc, setDoc, doc, deleteDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function todayKey(d = new Date()) {
  const x = d instanceof Date ? d : new Date(d);
  return x.toISOString().slice(0, 10);
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

function col(uid, name) {
  return collection(db, "users", uid, name);
}

export async function addLog(uid, collectionName, data) {
  if (!uid) return null;
  return addDoc(col(uid, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function upsertDated(uid, collectionName, date, data) {
  if (!uid || !date) return null;
  return setDoc(
    doc(db, "users", uid, collectionName, date),
    { ...data, date, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function deleteLog(uid, collectionName, id) {
  if (!uid || !id) return;
  return deleteDoc(doc(db, "users", uid, collectionName, id));
}

export function listenLogs(uid, collectionName, cb, { ordered = true, cap = 80 } = {}) {
  if (!uid) {
    cb([]);
    return () => {};
  }
  const q = ordered
    ? query(col(uid, collectionName), orderBy("createdAt", "desc"), limit(cap))
    : query(col(uid, collectionName), limit(cap));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([])
  );
}

export function listenDated(uid, collectionName, cb) {
  if (!uid) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    col(uid, collectionName),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([])
  );
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
  if (!uid || !text) return null;
  return addDoc(col(uid, "notifications"), {
    text,
    type,
    path,
    read: false,
    createdAt: serverTimestamp(),
  });
}
