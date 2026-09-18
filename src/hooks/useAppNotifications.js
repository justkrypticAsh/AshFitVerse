import { useCallback, useEffect, useState } from "react";
import { doc, updateDoc, query, collection, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { addAppNotification, todayKey, getEffectiveUid, getLocalLogs, saveLocalLogs } from "../lib/userLogs";

export default function useAppNotifications(uid) {
  const effectiveUid = getEffectiveUid(uid);
  const [items, setItems] = useState(() => getLocalLogs(effectiveUid, "notifications"));
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    const activeUid = getEffectiveUid(uid);
    setItems(getLocalLogs(activeUid, "notifications"));

    const handleUpdate = (e) => {
      if (!e.detail || e.detail.collectionName === "notifications") {
        setItems(getLocalLogs(activeUid, "notifications"));
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ashfitverse:data_updated", handleUpdate);
    }

    let unsub = () => {};
    if (auth?.currentUser && !activeUid.startsWith("athlete_")) {
      try {
        const q = query(
          collection(db, "users", activeUid, "notifications"),
          orderBy("createdAt", "desc"),
          limit(30)
        );
        unsub = onSnapshot(
          q,
          (snap) => {
            const remoteDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            saveLocalLogs(activeUid, "notifications", remoteDocs);
            setItems(remoteDocs);
          },
          () => setItems(getLocalLogs(activeUid, "notifications"))
        );
      } catch {}
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ashfitverse:data_updated", handleUpdate);
      }
      unsub();
    };
  }, [uid]);

  const unread = items.filter((n) => !n.read).length;

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied";
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const pushLocal = useCallback((title, body) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, icon: "/logo.png" });
    } catch {}
  }, []);

  const notify = useCallback(async (uidArg, payload) => {
    const id = getEffectiveUid(uidArg || uid);
    await addAppNotification(id, payload);
    pushLocal("AshFitVerse", payload.text);
  }, [uid, pushLocal]);

  const markRead = useCallback((id) => {
    const activeUid = getEffectiveUid(uid);
    const local = getLocalLogs(activeUid, "notifications");
    const updated = local.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveLocalLogs(activeUid, "notifications", updated);
    setItems(updated);

    if (auth?.currentUser && !activeUid.startsWith("athlete_") && id && !id.startsWith("notif_")) {
      updateDoc(doc(db, "users", activeUid, "notifications", id), { read: true }).catch(() => {});
    }
  }, [uid]);

  const markAllRead = useCallback(() => {
    items.filter((n) => !n.read).forEach((n) => markRead(n.id));
  }, [items, markRead]);

  // One daily reminder if the user has not trained today
  const maybeDailyReminder = useCallback(async (hasWorkoutToday) => {
    const activeUid = getEffectiveUid(uid);
    if (!activeUid || hasWorkoutToday) return;
    const key = `ashfitverse_daily_nudge_${todayKey()}`;
    if (localStorage.getItem(key) === "1") return;
    const hour = new Date().getHours();
    if (hour < 18) return;
    localStorage.setItem(key, "1");
    await notify(activeUid, {
      text: "No workout logged today. A short session still counts — log it when you can.",
      type: "reminder",
      path: "/workout-logger",
    });
  }, [uid, notify]);

  return {
    items, unread, permission,
    requestPermission, notify, markRead, markAllRead, maybeDailyReminder, pushLocal,
  };
}
