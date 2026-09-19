// src/hooks/useCommunityUnread.js — Real-Time Multi-Channel Community Alerts Engine
import { useState, useEffect, useRef, useCallback } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../firebase";

// Web Audio API chime synthesizer with customized harmonic profiles
export function playAlertChime(type = "message") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === "mention") {
      // Energetic high 3-note sparkle chime
      [
        { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.35 }, // G5
      ].forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(tone.freq, now + tone.time);
        gain.gain.setValueAtTime(0.09, now + tone.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + tone.time + tone.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + tone.time);
        osc.stop(now + tone.time + tone.dur);
      });
    } else if (type === "like") {
      // Warm sweet pop tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === "comment") {
      // Dual-tone mellow bubble chime
      [
        { freq: 440, time: 0.0, dur: 0.18 }, // A4
        { freq: 587.33, time: 0.09, dur: 0.32 }, // D5
      ].forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(tone.freq, now + tone.time);
        gain.gain.setValueAtTime(0.08, now + tone.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + tone.time + tone.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + tone.time);
        osc.stop(now + tone.time + tone.dur);
      });
    } else {
      // Standard Direct Message Two-Tone Chime
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
    }
  } catch (e) {
    // AudioContext blocked or not allowed yet
  }
}

export const DEFAULT_COMMUNITY_PREFS = {
  dmAlerts: true,
  dmSound: true,
  mentionAlerts: true,
  likesAlerts: true,
  commentAlerts: true,
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
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [hasCommunityUpdate, setHasCommunityUpdate] = useState(false);
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);

  const prevLastMsgTimeRef = useRef({});
  const isFirstLoadDMsRef = useRef(true);
  const knownNotifIdsRef = useRef(new Set());
  const isFirstLoadNotifsRef = useRef(true);

  const effectiveUid = currentUid || auth?.currentUser?.uid;

  // 1. Listen to Real-Time Direct Message Conversations
  useEffect(() => {
    if (!effectiveUid || effectiveUid.startsWith("guest_")) {
      setUnreadDMsCount(0);
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
          const msgTime = data.lastMessageAt?.toMillis
            ? data.lastMessageAt.toMillis()
            : data.lastMessageAt?.seconds
            ? data.lastMessageAt.seconds * 1000
            : 0;
          currentMsgTimes[convId] = msgTime;

          // Check for genuine new message arriving in real time (not initial snapshot)
          if (!isFirstLoadDMsRef.current && isUnread && data.lastSender !== effectiveUid) {
            const prevTime = prevLastMsgTimeRef.current[convId] || 0;
            if (msgTime > prevTime && data.lastMessage) {
              newestIncoming = {
                id: `msg_${convId}_${msgTime}`,
                type: "message",
                convId,
                senderUid: data.lastSender,
                senderName: data.lastSenderName || "Athlete",
                senderAvatar: data.lastSenderAvatar || null,
                senderUsername: data.lastSenderUsername || "athlete",
                title: data.lastSenderName || "New message",
                text: data.lastMessage,
                timestamp: msgTime || Date.now(),
              };
            }
          }
        });

        prevLastMsgTimeRef.current = currentMsgTimes;
        isFirstLoadDMsRef.current = false;

        setUnreadDMsCount(totalUnread);

        if (newestIncoming) {
          const prefs = getCommunityPrefs();
          if (prefs.dmAlerts) {
            setIncomingMessageToast(newestIncoming);
            if (prefs.dmSound) {
              playAlertChime("message");
            }
          }
        }
      },
      (err) => {
        console.warn("useCommunityUnread DMs error:", err);
      }
    );

    return () => unsub();
  }, [effectiveUid]);

  // 2. Listen to Real-Time Community Notifications (Mentions, Likes, Comments, System)
  useEffect(() => {
    if (!effectiveUid || effectiveUid.startsWith("guest_")) {
      setUnreadNotifsCount(0);
      return;
    }

    const q = query(
      collection(db, "users", effectiveUid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(25)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        let unreadCount = 0;
        let newestNotif = null;

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const id = docSnap.id;

          if (!data.read) {
            unreadCount += 1;
          }

          if (!isFirstLoadNotifsRef.current && !knownNotifIdsRef.current.has(id) && !data.read) {
            // New incoming notification
            if (data.senderUid !== effectiveUid) {
              newestNotif = {
                id,
                type: data.type || "mention",
                senderUid: data.senderUid,
                senderName: data.senderName || "Athlete",
                senderUsername: data.senderUsername || "athlete",
                senderAvatar: data.senderAvatar || null,
                title: data.title || "Community Alert",
                text: data.text || "",
                postId: data.postId || null,
                convId: data.convId || null,
                timestamp: Date.now(),
              };
            }
          }

          knownNotifIdsRef.current.add(id);
        });

        isFirstLoadNotifsRef.current = false;
        setUnreadNotifsCount(unreadCount);

        if (newestNotif) {
          const prefs = getCommunityPrefs();
          const shouldShow =
            (newestNotif.type === "mention" && prefs.mentionAlerts !== false) ||
            (newestNotif.type === "like" && prefs.likesAlerts !== false) ||
            (newestNotif.type === "comment" && prefs.commentAlerts !== false) ||
            (newestNotif.type === "message" && prefs.dmAlerts !== false);

          if (shouldShow) {
            setIncomingMessageToast(newestNotif);
            if (prefs.dmSound) {
              playAlertChime(newestNotif.type);
            }
          }
        }
      },
      (err) => {
        console.warn("useCommunityUnread notifications error:", err);
      }
    );

    return () => unsub();
  }, [effectiveUid]);

  // Aggregate unread status for FitVerse dot in dashboard
  useEffect(() => {
    setHasCommunityUpdate(unreadDMsCount > 0 || unreadNotifsCount > 0);
  }, [unreadDMsCount, unreadNotifsCount]);

  const dismissToast = useCallback(() => {
    setIncomingMessageToast(null);
  }, []);

  return {
    unreadDMsCount,
    unreadNotifsCount,
    hasCommunityUpdate,
    incomingMessageToast,
    dismissToast,
    playAlertChime,
    playMessageChime: () => playAlertChime("message"),
  };
}
