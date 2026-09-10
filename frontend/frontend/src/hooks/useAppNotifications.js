import { useCallback, useEffect, useState } from "react";
import { doc, updateDoc, query, collection, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { addAppNotification, todayKey } from "../lib/userLogs";

export default function useAppNotifications(uid) {
  const [items, setItems] = useState([]);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (!uid) { setItems([]); return; }
    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => setItems([]));
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
    const id = uidArg || uid;
    if (!id) return;
    await addAppNotification(id, payload);
    pushLocal("AshFitVerse", payload.text);
  }, [uid, pushLocal]);

  const markRead = useCallback((id) => {
    if (!uid || !id) return;
    updateDoc(doc(db, "users", uid, "notifications", id), { read: true }).catch(() => {});
  }, [uid]);

  const markAllRead = useCallback(() => {
    items.filter((n) => !n.read).forEach((n) => markRead(n.id));
  }, [items, markRead]);

  // One daily reminder if the user has not trained today
  const maybeDailyReminder = useCallback(async (hasWorkoutToday) => {
    if (!uid || hasWorkoutToday) return;
    const key = `ashfitverse_daily_nudge_${todayKey()}`;
    if (localStorage.getItem(key) === "1") return;
    const hour = new Date().getHours();
    if (hour < 18) return;
    localStorage.setItem(key, "1");
    await notify(uid, {
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
