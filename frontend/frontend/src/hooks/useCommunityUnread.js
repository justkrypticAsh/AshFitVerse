// src/hooks/useCommunityUnread.js
import { useState, useEffect, useRef, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";

// Web Audio API chime synthesizer (zero external sound asset dependencies)
function playMessageChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (pleasant mid chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (higher sweet resolution)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.1, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (e) {
    // AudioContext blocked or not allowed yet
  }
}

export const DEFAULT_COMMUNITY_PREFS = {
  dmAlerts: true,
  dmSound: true,
  likesAlerts: true,
  challengesAlerts: true,
};

export function getCommunityPrefs() {
  try {
    const raw = localStorage.getItem("ashfitverse_community_notif_prefs");
    if (raw) return { ...DEFAULT_COMMUNITY_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_COMMUNITY_PREFS;
}

export function saveCommunityPrefs(prefs) {
  try {
    localStorage.setItem("ashfitverse_community_notif_prefs", JSON.stringify(prefs));
  } catch {}
}

export default function useCommunityUnread(currentUid) {
  const [unreadDMsCount, setUnreadDMsCount] = useState(0);
  const [hasCommunityUpdate, setHasCommunityUpdate] = useState(false);
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);
  const prevLastMsgTimeRef = useRef({});
  const isFirstLoadRef = useRef(true);

  const effectiveUid = currentUid || auth?.currentUser?.uid;

  useEffect(() => {
    if (!effectiveUid || effectiveUid.startsWith("guest_")) {
      setUnreadDMsCount(0);
      setHasCommunityUpdate(false);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", effectiveUid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        let totalUnread = 0;
        let newestIncoming = null;
        const currentMsgTimes = {};

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const unreadList = Array.isArray(data.unreadBy) ? data.unreadBy : [];
          const isUnread = unreadList.includes(effectiveUid);

          if (isUnread) {
            totalUnread += 1;
          }

          const convId = docSnap.id;
          const msgTime = data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : (data.lastMessageAt?.seconds ? data.lastMessageAt.seconds * 1000 : 0);
          currentMsgTimes[convId] = msgTime;

          // Check for genuine new message arriving in real time (not initial snapshot)
          if (!isFirstLoadRef.current && isUnread && data.lastSender !== effectiveUid) {
            const prevTime = prevLastMsgTimeRef.current[convId] || 0;
            if (msgTime > prevTime && data.lastMessage) {
              newestIncoming = {
                convId,
                senderUid: data.lastSender,
                senderName: data.lastSenderName || "Athlete",
                senderAvatar: data.lastSenderAvatar || null,
                text: data.lastMessage,
                timestamp: msgTime || Date.now(),
              };
            }
          }
        });

        prevLastMsgTimeRef.current = currentMsgTimes;
        isFirstLoadRef.current = false;

        setUnreadDMsCount(totalUnread);
        setHasCommunityUpdate(totalUnread > 0);

        if (newestIncoming) {
          const prefs = getCommunityPrefs();
          if (prefs.dmAlerts) {
            setIncomingMessageToast(newestIncoming);
            if (prefs.dmSound) {
              playMessageChime();
            }
          }
        }
      },
      (err) => {
        console.warn("useCommunityUnread subscription error:", err);
      }
    );

    return () => unsub();
  }, [effectiveUid]);

  const dismissToast = useCallback(() => {
    setIncomingMessageToast(null);
  }, []);

  return {
    unreadDMsCount,
    hasCommunityUpdate,
    incomingMessageToast,
    dismissToast,
    playMessageChime,
  };
}
