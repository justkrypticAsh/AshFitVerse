// src/lib/communityNotifications.js — Real-Time Community Notification Dispatcher
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Sends a notification document to Firestore under users/{targetUid}/notifications
 */
export async function sendCommunityNotification({
  targetUid,
  type, // "mention" | "like" | "comment" | "message"
  senderUid,
  senderName,
  senderUsername,
  senderAvatar,
  title,
  text,
  postId,
  convId,
}) {
  if (!targetUid || targetUid === senderUid || targetUid.startsWith("guest_")) return;

  try {
    await addDoc(collection(db, "users", targetUid, "notifications"), {
      type: type || "mention",
      senderUid: senderUid || "athlete",
      senderName: senderName || "Athlete",
      senderUsername: senderUsername || (senderName ? senderName.toLowerCase().replace(/\s+/g, "_") : "athlete"),
      senderAvatar: senderAvatar || null,
      title: title || "New community alert",
      text: text ? String(text).slice(0, 140) : "",
      postId: postId || null,
      convId: convId || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("sendCommunityNotification warning:", err);
  }
}

/**
 * Parses @username mentions in text and notifies matching athletes
 */
export async function notifyMentions({ text, sender, postId, isComment = false, members = [] }) {
  if (!text || !sender?.uid) return;
  const matches = text.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches || matches.length === 0) return;

  const senderUid = sender.uid;
  const senderName = sender.name || "Athlete";
  const senderUsername = sender.username || (senderName ? senderName.toLowerCase().replace(/\s+/g, "_") : "athlete");
  const senderAvatar = sender.avatar || null;

  // De-duplicate usernames
  const mentionedUsernames = [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];

  for (const rawUsername of mentionedUsernames) {
    // 1. Try in-memory members list first
    let target = members.find(
      (m) =>
        (m.username && m.username.toLowerCase() === rawUsername) ||
        (m.name && m.name.toLowerCase().replace(/\s+/g, "_") === rawUsername)
    );

    // 2. If not found in-memory, query Firestore users
    if (!target) {
      try {
        const q = query(collection(db, "users"), where("username", "==", rawUsername));
        const snap = await getDocs(q);
        if (!snap.empty) {
          target = { uid: snap.docs[0].id, ...snap.docs[0].data() };
        }
      } catch (_) {}
    }

    if (target && target.uid && target.uid !== senderUid) {
      await sendCommunityNotification({
        targetUid: target.uid,
        type: "mention",
        senderUid,
        senderName,
        senderUsername,
        senderAvatar,
        title: `@${senderUsername} mentioned you in a ${isComment ? "comment" : "post"}`,
        text: text,
        postId: postId || null,
      });
    }
  }
}

/**
 * Notifies the author of a post when someone likes it
 */
export async function notifyLike({ post, sender }) {
  if (!post || !post.uid || !sender?.uid || post.uid === sender.uid) return;

  const senderName = sender.name || "Athlete";
  const senderUsername = sender.username || (senderName ? senderName.toLowerCase().replace(/\s+/g, "_") : "athlete");

  await sendCommunityNotification({
    targetUid: post.uid,
    type: "like",
    senderUid: sender.uid,
    senderName,
    senderUsername,
    senderAvatar: sender.avatar || null,
    title: `${senderName} liked your post`,
    text: post.content || post.blogTitle || "Liked your training update",
    postId: post.id,
  });
}

/**
 * Notifies the author of a post when someone comments on it
 */
export async function notifyComment({ post, sender, commentText }) {
  if (!post || !post.uid || !sender?.uid || post.uid === sender.uid) return;

  const senderName = sender.name || "Athlete";
  const senderUsername = sender.username || (senderName ? senderName.toLowerCase().replace(/\s+/g, "_") : "athlete");

  await sendCommunityNotification({
    targetUid: post.uid,
    type: "comment",
    senderUid: sender.uid,
    senderName,
    senderUsername,
    senderAvatar: sender.avatar || null,
    title: `${senderName} commented on your post`,
    text: commentText,
    postId: post.id,
  });
}

/**
 * Notifies recipient when a direct message is sent
 */
export async function notifyMessage({ recipientUid, sender, messageText, convId }) {
  if (!recipientUid || !sender?.uid || recipientUid === sender.uid) return;

  const senderName = sender.name || "Athlete";
  const senderUsername = sender.username || (senderName ? senderName.toLowerCase().replace(/\s+/g, "_") : "athlete");

  await sendCommunityNotification({
    targetUid: recipientUid,
    type: "message",
    senderUid: sender.uid,
    senderName,
    senderUsername,
    senderAvatar: sender.avatar || null,
    title: `New message from ${senderName}`,
    text: messageText,
    convId: convId || null,
  });
}
