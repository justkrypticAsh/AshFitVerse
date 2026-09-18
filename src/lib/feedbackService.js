// src/lib/feedbackService.js
// ─────────────────────────────────────────────────────────────
// Cloud Firestore & Local Service for User Feedback & Ratings
// ─────────────────────────────────────────────────────────────
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const STORAGE_KEY = "ashfitverse_feedback_cache";

function getLocalFeedback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFeedback(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ashfitverse:feedback_updated", { detail: { timestamp: Date.now() } })
      );
    }
  } catch (e) {
    console.warn("Local feedback cache error:", e);
  }
}

/**
 * Submit user rating and feedback.
 */
export async function submitFeedback({
  uid,
  userName = "Athlete",
  userEmail = "",
  rating = 5,
  category = "feature_request",
  area = "Overall App",
  message = "",
}) {
  const localId = "fb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const newEntry = {
    id: localId,
    uid: uid || auth?.currentUser?.uid || "guest",
    userName: userName || "Athlete",
    userEmail: userEmail || auth?.currentUser?.email || "",
    rating: Number(rating) || 5,
    category: category || "feature_request",
    area: area || "Overall App",
    message: (message || "").trim(),
    status: "new", // "new" | "reviewing" | "planned" | "resolved"
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally for 0ms reactivity
  const current = getLocalFeedback();
  const updated = [newEntry, ...current];
  saveLocalFeedback(updated);

  // 2. Persist to Firestore global "feedback" collection in background
  try {
    const docRef = await addDoc(collection(db, "feedback"), {
      ...newEntry,
      createdAt: serverTimestamp(),
    });

    if (docRef?.id) {
      const fresh = getLocalFeedback().map((item) =>
        item.id === localId ? { ...item, id: docRef.id } : item
      );
      saveLocalFeedback(fresh);
      newEntry.id = docRef.id;
    }
  } catch (err) {
    console.warn("Firestore feedback submission saved locally:", err?.message || err);
  }

  return newEntry;
}

/**
 * Real-time listener for Admin Dashboard.
 */
export function listenAdminFeedbacks(callback, { cap = 100 } = {}) {
  // Synchronous initial return from cache
  callback(getLocalFeedback());

  const handleUpdate = () => {
    callback(getLocalFeedback());
  };

  if (typeof window !== "undefined") {
    window.addEventListener("ashfitverse:feedback_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
  }

  let unsub = () => {};
  try {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(cap));
    unsub = onSnapshot(
      q,
      (snap) => {
        const remoteItems = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt:
              data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          };
        });

        // Merge local unsynced with remote
        const remoteIds = new Set(remoteItems.map((r) => r.id));
        const localOnly = getLocalFeedback().filter(
          (l) => typeof l.id === "string" && l.id.startsWith("fb_") && !remoteIds.has(l.id)
        );
        const merged = [...localOnly, ...remoteItems];
        saveLocalFeedback(merged);
        callback(merged);
      },
      (err) => {
        console.warn("Firestore feedback listener error, fallback to local:", err?.message);
        callback(getLocalFeedback());
      }
    );
  } catch (e) {
    console.warn("Could not attach feedback onSnapshot:", e);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("ashfitverse:feedback_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    }
    unsub();
  };
}

/**
 * Update status of a feedback item (Admin only).
 */
export async function updateFeedbackStatus(id, newStatus) {
  const current = getLocalFeedback();
  const updated = current.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  saveLocalFeedback(updated);

  try {
    await updateDoc(doc(db, "feedback", id), { status: newStatus });
  } catch (err) {
    console.warn("Failed to update status in Firestore:", err?.message);
  }
}

/**
 * Delete a feedback item (Admin only).
 */
export async function deleteFeedback(id) {
  const current = getLocalFeedback();
  const updated = current.filter((item) => item.id !== id);
  saveLocalFeedback(updated);

  try {
    await deleteDoc(doc(db, "feedback", id));
  } catch (err) {
    console.warn("Failed to delete from Firestore:", err?.message);
  }
}
