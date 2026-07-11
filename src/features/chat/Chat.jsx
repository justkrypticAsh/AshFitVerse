// src/features/chat/Chat.jsx
// ─────────────────────────────────────────────────────────────
// Chat page — same design language as Community.jsx
// Sidebar + 2-pane chat (conversations list + active chat window)
// All UI functional with mock data; ready for backend wiring
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const USER = {
  id: "me",
  name: "Ash Kumar",
  avatar: "https://i.pravatar.cc/150?img=11",
  goal: "Muscle Gain",
  streak: 18,
};

const NAV_MAIN = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Community", icon: "◎", path: "/community" },
  { label: "Chat", icon: "💬", badge: "5", path: "/chat" },
  { label: "Profile", icon: "◉", path: "/profile" },
];

const TOOLS = [
  { label: "Calorie Calc", icon: "🔥", path: "/calorie-calculator" },
  { label: "Fat % Calc", icon: "📊", path: "/fat-calculator" },
  { label: "BMI Calc", icon: "📏", path: "/bmi-calculator" },
  { label: "Free Plans", icon: "🏋️", path: "/free-plans" },
  { label: "Workout Planner", icon: "📋", path: "/workout-planner" },
  { label: "Workout Logger", icon: "📝", path: "/workout-logger" },
  { label: "Diet Logger", icon: "🥗", path: "/diet-logger" },
  { label: "Diet Plan", icon: "🍱", path: "/diet-plan" },
];

// ── Mock conversations ──
const CONVERSATIONS = [
  {
    id: 1, type: "dm",
    name: "Priya Singh",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Bro that HIIT session was insane 🔥",
    lastTime: "2 min",
    unread: 2,
    online: true,
    goal: "Tone Up",
  },
  {
    id: 2, type: "group",
    name: "🏋️ Leg Day Warriors",
    avatar: "https://i.pravatar.cc/150?img=60",
    lastMessage: "Karan: Tomorrow 7am squat session who's in?",
    lastTime: "12 min",
    unread: 5,
    online: true,
    members: 8,
  },
  {
    id: 3, type: "dm",
    name: "Ananya Verma",
    avatar: "https://i.pravatar.cc/150?img=44",
    lastMessage: "45-day streak achieved! 🏆",
    lastTime: "1 hr",
    unread: 0,
    online: true,
    goal: "Endurance",
  },
  {
    id: 4, type: "dm",
    name: "Dev Malhotra",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Need your deadlift form check video",
    lastTime: "3 hr",
    unread: 0,
    online: false,
    goal: "Muscle Gain",
  },
  {
    id: 5, type: "group",
    name: "💪 PR Hunters Club",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Dev: NEW PR 140kg deadlift 🔥",
    lastTime: "5 hr",
    unread: 0,
    online: true,
    members: 14,
  },
  {
    id: 6, type: "dm",
    name: "Rohan Sharma",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Meal prep recipe link please",
    lastTime: "Yesterday",
    unread: 0,
    online: false,
    goal: "Fat Loss",
  },
  {
    id: 7, type: "dm",
    name: "Sneha Nair",
    avatar: "https://i.pravatar.cc/150?img=25",
    lastMessage: "Yoga class at 6am tomorrow?",
    lastTime: "Yesterday",
    unread: 0,
    online: false,
    goal: "Flexibility",
  },
  {
    id: 8, type: "group",
    name: "🥗 Clean Eating Crew",
    avatar: "https://i.pravatar.cc/150?img=44",
    lastMessage: "Priya: Posting macro split tomorrow",
    lastTime: "2 days",
    unread: 0,
    online: true,
    members: 23,
  },
];

// ── Mock messages per conversation ──
const MESSAGES_DATA = {
  1: [
    { id: 1, senderId: "priya", text: "Heyyy! Just finished my HIIT session 💪", time: "10:32 AM", read: true },
    { id: 2, senderId: "me", text: "Niceee! How long was it?", time: "10:34 AM", read: true },
    { id: 3, senderId: "priya", text: "45 mins. Heart rate hit 182 bpm at peak 🔥", time: "10:35 AM", read: true },
    { id: 4, senderId: "priya", text: "You should try it tomorrow", time: "10:35 AM", read: true },
    { id: 5, senderId: "me", text: "Bhai I'm on leg day tomorrow 😭 maybe day after", time: "10:38 AM", read: true },
    { id: 6, senderId: "priya", text: "Haha fair fair. Squat goals = 120kg right?", time: "10:40 AM", read: true },
    { id: 7, senderId: "me", text: "Yeah trying to hit it this month", time: "10:41 AM", read: true },
    { id: 8, senderId: "priya", text: "Bro that HIIT session was insane 🔥", time: "Just now", read: false },
    { id: 9, senderId: "priya", text: "Send me your workout plan when you can", time: "Just now", read: false },
  ],
  2: [
    { id: 1, senderId: "karan", senderName: "Karan Mehta", text: "Okay team, who's joining tomorrow's squat session?", time: "9:15 AM", read: true },
    { id: 2, senderId: "dev", senderName: "Dev Malhotra", text: "Count me in 🦵", time: "9:18 AM", read: true },
    { id: 3, senderId: "me", text: "I'm in! What time?", time: "9:20 AM", read: true },
    { id: 4, senderId: "karan", senderName: "Karan Mehta", text: "Tomorrow 7am squat session who's in?", time: "9:25 AM", read: false },
  ],
  3: [
    { id: 1, senderId: "ananya", text: "GUESS WHAT", time: "Yesterday", read: true },
    { id: 2, senderId: "me", text: "What what what 👀", time: "Yesterday", read: true },
    { id: 3, senderId: "ananya", text: "45-day streak achieved! 🏆", time: "Yesterday", read: true },
    { id: 4, senderId: "me", text: "BROOO LEGEND 🔥🔥🔥", time: "Yesterday", read: true },
  ],
  4: [
    { id: 1, senderId: "dev", text: "Need your deadlift form check video", time: "3 hr ago", read: true },
  ],
  5: [
    { id: 1, senderId: "dev", senderName: "Dev Malhotra", text: "NEW PR 140kg deadlift 🔥", time: "5 hr ago", read: true },
    { id: 2, senderId: "priya", senderName: "Priya Singh", text: "GO OFF KING 👑", time: "5 hr ago", read: true },
    { id: 3, senderId: "me", text: "Insane Dev, congrats!", time: "4 hr ago", read: true },
  ],
  6: [
    { id: 1, senderId: "rohan", text: "Meal prep recipe link please", time: "Yesterday", read: true },
  ],
  7: [
    { id: 1, senderId: "sneha", text: "Yoga class at 6am tomorrow?", time: "Yesterday", read: true },
  ],
  8: [
    { id: 1, senderId: "priya", senderName: "Priya Singh", text: "Posting macro split tomorrow", time: "2 days ago", read: true },
  ],
};

export default function Chat() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeId, setActiveId] = useState(1);
  const [messagesMap, setMessagesMap] = useState(MESSAGES_DATA);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | dm | group | unread
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll to bottom on new message / convo change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, messagesMap]);

  // Mark as read when convo opens
  useEffect(() => {
    setConversations(prev => prev.map(c =>
      c.id === activeId ? { ...c, unread: 0 } : c
    ));
  }, [activeId]);

  const activeConvo = conversations.find(c => c.id === activeId);
  const activeMessages = messagesMap[activeId] || [];

  const filteredConvos = conversations
    .filter(c => {
      if (filter === "dm") return c.type === "dm";
      if (filter === "group") return c.type === "group";
      if (filter === "unread") return c.unread > 0;
      return true;
    })
    .filter(c =>
      search === "" || c.name.toLowerCase().includes(search.toLowerCase())
    );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderId: "me",
      text: draft.trim(),
      time: "Just now",
      read: false,
    };
    setMessagesMap(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));
    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, lastMessage: draft.trim(), lastTime: "Just now" }
        : c
    ));
    setDraft("");

    // Simulate typing reply for DMs
    if (activeConvo?.type === "dm") {
      setTimeout(() => setTyping(true), 800);
      setTimeout(() => {
        setTyping(false);
        const reply = {
          id: Date.now() + 1,
          senderId: "other",
          text: "Got it 👍 will reply properly in a bit",
          time: "Just now",
          read: false,
        };
        setMessagesMap(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), reply],
        }));
      }, 2200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const FILTERS = [
    { id: "all", label: "All", count: conversations.length },
    { id: "unread", label: "Unread", count: totalUnread },
    { id: "dm", label: "DMs", count: conversations.filter(c => c.type === "dm").length },
    { id: "group", label: "Groups", count: conversations.filter(c => c.type === "group").length },
  ];

  // ── Chat-specific scoped CSS ──
  const chatCSS = `
    .ch-root {
      min-height: 100vh;
      display: flex;
      font-family: ${FONT.body};
      background: ${T.bg};
      color: ${T.text};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.7s ease, background 0.5s, color 0.5s;
      position: relative;
    }

    /* Sidebar (same as community) */
    .ch-sb {
      width: 255px; min-height: 100vh;
      background: ${T.sidebar};
      border-right: 1px solid ${T.glassBorder};
      display: flex; flex-direction: column;
      padding: 28px 15px 22px;
      flex-shrink: 0; position: relative; z-index: 20;
      transition: background 0.5s, border 0.5s;
      backdrop-filter: blur(40px);
    }
    .ch-sb::after {
      content: ''; position: absolute;
      top: 0; left: 0; right: 0; height: 200px;
      background: linear-gradient(180deg, ${T.accent}08 0%, transparent 100%);
      pointer-events: none;
    }
    .ch-lg {
      font-family: ${FONT.display};
      font-size: 21px; font-weight: 800;
      letter-spacing: 0.04em; color: ${T.text};
      padding: 0 8px; margin-bottom: 4px; cursor: pointer;
    }
    .ch-lg span { color: ${T.accent}; }
    .ch-lt2 {
      font-size: 10px; color: ${T.textMuted};
      letter-spacing: 0.14em; text-transform: uppercase;
      font-weight: 600; padding: 0 8px; margin-bottom: 24px;
    }
    .ch-su {
      padding: 13px;
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      border-radius: 15px;
      backdrop-filter: blur(20px);
      display: flex; align-items: center; gap: 11px;
      cursor: pointer; transition: all 0.25s;
      margin-bottom: 22px;
    }
    .ch-su:hover { border-color: ${T.accent}35; }
    .ch-sa {
      width: 37px; height: 37px; border-radius: 50%;
      border: 2px solid ${T.accent}40; object-fit: cover;
      box-shadow: 0 0 16px ${T.accentGlow};
    }
    .ch-sn { font-size: 13px; font-weight: 700; color: ${T.text}; }
    .ch-sg { font-size: 11px; color: ${T.accent}; font-weight: 500; }
    .ch-nl {
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: ${T.textMuted}; padding: 0 8px; margin: 16px 0 5px;
    }
    .ch-ni {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 12px; border-radius: 13px;
      cursor: pointer; font-size: 13.5px; font-weight: 500;
      color: ${T.textSub};
      transition: all 0.22s;
      margin-bottom: 2px; border: 1px solid transparent;
    }
    .ch-ni:hover {
      color: ${T.text}; background: ${T.glass};
      border-color: ${T.glassBorder};
    }
    .ch-ni.ch-na {
      background: linear-gradient(135deg, ${T.accent}16, ${T.purple}0c);
      color: ${T.accent}; border-color: ${T.accent}24;
      box-shadow: 0 4px 20px ${T.accentGlow};
      font-weight: 600;
    }
    .ch-nn { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
    .ch-nbdg {
      margin-left: auto; padding: 2px 7px;
      background: ${T.accent}22; color: ${T.accent};
      border-radius: 99px; font-size: 10px; font-weight: 800;
    }
    .ch-ti {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 11px;
      cursor: pointer; font-size: 13px; font-weight: 500;
      color: ${T.textSub};
      transition: all 0.2s; margin-bottom: 1px;
    }
    .ch-ti:hover { color: ${T.text}; background: ${T.glass}; }
    .ch-lb {
      width: 100%; padding: 11px; border-radius: 13px;
      border: 1px solid rgba(239,68,68,0.18);
      background: rgba(239,68,68,0.04);
      color: #f87171; font-size: 13px; font-weight: 600;
      font-family: ${FONT.body}; cursor: pointer;
      transition: all 0.25s; letter-spacing: 0.04em;
      margin-top: auto;
    }
    .ch-lb:hover {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.3);
    }

    /* Main area */
    .ch-mn {
      flex: 1;
      display: flex; flex-direction: column;
      position: relative; z-index: 1;
      min-width: 0;
    }

    /* Topbar */
    .ch-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 22px 32px;
      border-bottom: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(7,8,15,0.5)" : "rgba(242,244,252,0.5)"};
      backdrop-filter: blur(30px);
      animation: fadeUp 0.6s ease both;
      flex-shrink: 0;
    }
    .ch-tt {
      font-family: ${FONT.display};
      font-size: 24px; font-weight: 800;
      color: ${T.text}; letter-spacing: -0.02em;
    }
    .ch-ts { font-size: 12px; color: ${T.textSub}; margin-top: 3px; }
    .ch-tr { display: flex; align-items: center; gap: 11px; }
    .ch-av {
      width: 40px; height: 40px; border-radius: 50%;
      border: 2px solid ${T.accent}40; object-fit: cover;
      box-shadow: 0 0 18px ${T.accentGlow};
      cursor: pointer;
    }

    /* 2-pane layout */
    .ch-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 0;
      min-height: 0;
    }

    /* ── LEFT PANE: Conversations list ── */
    .ch-list-pane {
      border-right: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(7,8,15,0.35)" : "rgba(255,255,255,0.35)"};
      backdrop-filter: blur(20px);
      display: flex; flex-direction: column;
      min-height: 0;
    }
    .ch-list-header {
      padding: 18px 18px 12px;
      border-bottom: 1px solid ${T.glassBorder};
      flex-shrink: 0;
    }
    .ch-search-wrap {
      position: relative;
      margin-bottom: 12px;
    }
    .ch-search {
      width: 100%; height: 40px;
      background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1px solid ${T.glassBorder};
      border-radius: 12px;
      padding: 0 16px 0 40px;
      font-size: 13px; font-family: ${FONT.body};
      color: ${T.text}; outline: none;
      transition: all 0.25s;
    }
    .ch-search:focus {
      border-color: ${T.accent}50;
      box-shadow: 0 0 0 3px ${T.accentGlow};
    }
    .ch-search::placeholder { color: ${T.textMuted}; }
    .ch-search-icon {
      position: absolute;
      left: 14px; top: 50%;
      transform: translateY(-50%);
      font-size: 14px; opacity: 0.5;
      pointer-events: none;
    }
    .ch-filters {
      display: flex; gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .ch-filter-btn {
      padding: 6px 12px; border-radius: 9px;
      border: 1px solid ${T.glassBorder};
      background: transparent;
      color: ${T.textSub};
      font-size: 11px; font-weight: 700;
      font-family: ${FONT.body};
      cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .ch-filter-btn:hover { color: ${T.text}; }
    .ch-filter-btn.active {
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      color: #fff; border-color: transparent;
      box-shadow: 0 2px 10px ${T.accentGlow};
    }
    .ch-filter-count {
      margin-left: 5px;
      opacity: 0.7;
      font-weight: 800;
    }

    .ch-list {
      flex: 1; overflow-y: auto;
      padding: 8px 10px;
    }
    .ch-convo {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 12px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      border: 1px solid transparent;
      margin-bottom: 4px;
      position: relative;
    }
    .ch-convo:hover {
      background: ${T.glass};
      border-color: ${T.glassBorder};
    }
    .ch-convo.active {
      background: linear-gradient(135deg, ${T.accent}15, ${T.purple}0a);
      border-color: ${T.accent}28;
      box-shadow: 0 4px 16px ${T.accentGlow};
    }
    .ch-convo-avatar-wrap {
      position: relative; flex-shrink: 0;
    }
    .ch-convo-avatar {
      width: 46px; height: 46px; border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${T.glassBorder};
    }
    .ch-online-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: ${T.green};
      border: 2px solid ${T.bg};
      position: absolute;
      bottom: -1px; right: -1px;
      box-shadow: 0 0 8px ${T.green}80;
    }
    .ch-convo-body {
      flex: 1; min-width: 0;
    }
    .ch-convo-row1 {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 3px;
    }
    .ch-convo-name {
      font-size: 13.5px; font-weight: 700;
      color: ${T.text};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 170px;
    }
    .ch-convo-time {
      font-size: 10px;
      color: ${T.textMuted};
      font-weight: 600;
      flex-shrink: 0;
    }
    .ch-convo-row2 {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px;
    }
    .ch-convo-msg {
      font-size: 12px;
      color: ${T.textSub};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1;
      line-height: 1.4;
    }
    .ch-convo-unread {
      min-width: 20px; height: 20px;
      border-radius: 99px;
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      color: #fff;
      font-size: 10px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      padding: 0 6px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px ${T.accentGlow};
    }
    .ch-convo-type {
      position: absolute;
      top: 8px; left: 42px;
      font-size: 10px;
      background: ${T.bg};
      border: 1px solid ${T.glassBorder};
      border-radius: 99px;
      padding: 1px 6px;
      font-weight: 700;
      color: ${T.textMuted};
    }

    /* ── RIGHT PANE: Active chat window ── */
    .ch-window {
      display: flex; flex-direction: column;
      min-width: 0; min-height: 0;
      background: ${dark ? "rgba(7,8,15,0.2)" : "rgba(255,255,255,0.2)"};
    }
    .ch-window-header {
      padding: 16px 24px;
      border-bottom: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(7,8,15,0.5)" : "rgba(242,244,252,0.5)"};
      backdrop-filter: blur(20px);
      display: flex; align-items: center; gap: 14px;
      flex-shrink: 0;
    }
    .ch-window-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${T.accent}40;
      box-shadow: 0 0 12px ${T.accentGlow};
    }
    .ch-window-name {
      font-family: ${FONT.display};
      font-size: 16px; font-weight: 800;
      color: ${T.text};
    }
    .ch-window-status {
      font-size: 11px;
      color: ${T.green};
      font-weight: 600;
      margin-top: 2px;
      display: flex; align-items: center; gap: 5px;
    }
    .ch-window-status-offline {
      color: ${T.textMuted};
    }
    .ch-window-actions {
      margin-left: auto;
      display: flex; gap: 8px;
    }
    .ch-icon-btn {
      width: 38px; height: 38px;
      border-radius: 11px;
      border: 1px solid ${T.glassBorder};
      background: ${T.glass};
      backdrop-filter: blur(12px);
      color: ${T.textSub};
      font-size: 15px;
      cursor: pointer;
      transition: all 0.22s;
      display: flex; align-items: center; justify-content: center;
    }
    .ch-icon-btn:hover {
      border-color: ${T.accent}40;
      color: ${T.accent};
    }

    /* Messages area */
    .ch-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
      display: flex; flex-direction: column;
      gap: 4px;
    }
    .ch-msg-row {
      display: flex;
      gap: 10px;
      max-width: 70%;
      animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }
    .ch-msg-row.own {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .ch-msg-row.other { align-self: flex-start; }
    .ch-msg-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      object-fit: cover;
      align-self: flex-end;
      flex-shrink: 0;
    }
    .ch-msg-bubble {
      padding: 10px 16px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.5;
      word-wrap: break-word;
      position: relative;
    }
    .ch-msg-row.own .ch-msg-bubble {
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      color: #fff;
      border-bottom-right-radius: 6px;
      box-shadow: 0 4px 16px ${T.accentGlow};
    }
    .ch-msg-row.other .ch-msg-bubble {
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      color: ${T.text};
      backdrop-filter: blur(20px);
      border-bottom-left-radius: 6px;
    }
    .ch-msg-sender {
      font-size: 11px;
      font-weight: 700;
      color: ${T.accent};
      margin-bottom: 3px;
      letter-spacing: 0.02em;
    }
    .ch-msg-meta {
      font-size: 10px;
      color: ${T.textMuted};
      margin-top: 4px;
      display: flex; align-items: center; gap: 4px;
      padding: 0 4px;
    }
    .ch-msg-row.own .ch-msg-meta {
      justify-content: flex-end;
    }
    .ch-read-tick {
      color: ${T.accent};
      font-size: 11px;
    }

    /* Typing indicator */
    .ch-typing {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px;
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      border-radius: 18px;
      border-bottom-left-radius: 6px;
      width: fit-content;
      animation: fadeUp 0.3s ease both;
    }
    .ch-typing-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${T.textSub};
      animation: typingBounce 1.2s ease-in-out infinite;
    }
    .ch-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .ch-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Date divider */
    .ch-date-divider {
      align-self: center;
      padding: 6px 14px;
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      color: ${T.textMuted};
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 12px 0;
    }

    /* Composer */
    .ch-composer {
      padding: 16px 24px 20px;
      border-top: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(7,8,15,0.5)" : "rgba(242,244,252,0.5)"};
      backdrop-filter: blur(20px);
      flex-shrink: 0;
    }
    .ch-composer-inner {
      display: flex; align-items: flex-end; gap: 10px;
      background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1px solid ${T.glassBorder};
      border-radius: 18px;
      padding: 8px 8px 8px 16px;
      transition: all 0.25s;
    }
    .ch-composer-inner:focus-within {
      border-color: ${T.accent}50;
      box-shadow: 0 0 0 3px ${T.accentGlow};
    }
    .ch-attach-btn {
      width: 36px; height: 36px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: ${T.textSub};
      font-size: 17px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ch-attach-btn:hover {
      background: ${T.glass};
      color: ${T.accent};
    }
    .ch-input {
      flex: 1;
      background: transparent;
      border: none; outline: none;
      color: ${T.text};
      font-size: 14px;
      font-family: ${FONT.body};
      resize: none;
      padding: 8px 0;
      min-height: 24px;
      max-height: 120px;
      line-height: 1.5;
    }
    .ch-input::placeholder { color: ${T.textMuted}; }
    .ch-send-btn {
      width: 38px; height: 38px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px ${T.accentGlow};
    }
    .ch-send-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 22px ${T.accentGlow};
    }
    .ch-send-btn:disabled {
      opacity: 0.4; cursor: not-allowed;
      transform: none; box-shadow: none;
    }

    /* Empty state */
    .ch-empty {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 40px;
      color: ${T.textSub};
      text-align: center;
    }
    .ch-empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .ch-empty-title {
      font-family: ${FONT.display};
      font-size: 20px; font-weight: 800;
      color: ${T.text};
      margin-bottom: 8px;
    }

    @media (max-width: 1100px) {
      .ch-layout { grid-template-columns: 280px 1fr; }
      .ch-messages { padding: 20px 20px; }
    }
    @media (max-width: 768px) {
      .ch-sb { display: none; }
      .ch-layout { grid-template-columns: 1fr; }
      .ch-list-pane { display: ${activeId ? "none" : "flex"}; }
      .ch-window { display: ${activeId ? "flex" : "none"}; }
      .ch-topbar { padding: 16px 20px; }
    }
  `;

  return (
    <>
      <style>{generateCSS(T, dark)}</style>
      <style>{chatCSS}</style>

      <div className="ch-root">
        {/* BG image layer */}
        {BG_IMAGES.community && (
          <div className="bg-image-layer">
            <img src={BG_IMAGES.community} alt="" loading="lazy" />
          </div>
        )}

        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* SIDEBAR */}
        <aside className="ch-sb">
          <div className="ch-lg" onClick={() => navigate("/dashboard")}>
            AshFit<span>Verse</span>
          </div>
          <div className="ch-lt2">Premium Fitness OS</div>
          <div className="ch-su" onClick={() => navigate("/profile")}>
            <img src={USER.avatar} className="ch-sa" alt="avatar" />
            <div>
              <div className="ch-sn">{USER.name}</div>
              <div className="ch-sg">{USER.goal}</div>
            </div>
          </div>
          <div className="ch-nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div
              key={n.label}
              className={`ch-ni ${n.path === "/chat" ? "ch-na" : ""}`}
              onClick={() => navigate(n.path)}
            >
              <span className="ch-nn">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="ch-nbdg">{n.badge}</span>}
            </div>
          ))}
          <div className="ch-nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="ch-ti" onClick={() => navigate(t.path)}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <button className="ch-lb" onClick={() => navigate("/")} style={{ marginTop: 20 }}>
            ⎋ &nbsp;Logout
          </button>
        </aside>

        {/* MAIN */}
        <main className="ch-mn">
          {/* Topbar */}
          <div className="ch-topbar">
            <div>
              <div className="ch-tt">Messages 💬</div>
              <div className="ch-ts">
                {totalUnread > 0
                  ? `You have ${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
                  : "All caught up — chat with your fitness tribe"}
              </div>
            </div>
            <div className="ch-tr">
              <button className="ch-icon-btn" title="New chat">✏️</button>
              <button className="ch-icon-btn" title="Notifications">🔔</button>
              <button className="theme-toggle" onClick={toggleTheme}>
                <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
              </button>
              <img src={USER.avatar} className="ch-av" alt="avatar" />
            </div>
          </div>

          {/* 2-pane layout */}
          <div className="ch-layout">
            {/* LEFT: Conversations list */}
            <div className="ch-list-pane">
              <div className="ch-list-header">
                <div className="ch-search-wrap">
                  <span className="ch-search-icon">🔍</span>
                  <input
                    className="ch-search"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="ch-filters">
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      className={`ch-filter-btn ${filter === f.id ? "active" : ""}`}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                      {f.count > 0 && <span className="ch-filter-count">{f.count}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ch-list">
                {filteredConvos.length === 0 ? (
                  <div style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: T.textMuted,
                    fontSize: 13,
                  }}>
                    No conversations found
                  </div>
                ) : (
                  filteredConvos.map(c => (
                    <div
                      key={c.id}
                      className={`ch-convo ${c.id === activeId ? "active" : ""}`}
                      onClick={() => setActiveId(c.id)}
                    >
                      <div className="ch-convo-avatar-wrap">
                        <img src={c.avatar} className="ch-convo-avatar" alt={c.name} />
                        {c.online && <div className="ch-online-dot" />}
                      </div>
                      <div className="ch-convo-body">
                        <div className="ch-convo-row1">
                          <div className="ch-convo-name">{c.name}</div>
                          <div className="ch-convo-time">{c.lastTime}</div>
                        </div>
                        <div className="ch-convo-row2">
                          <div className="ch-convo-msg">{c.lastMessage}</div>
                          {c.unread > 0 && (
                            <div className="ch-convo-unread">{c.unread}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Active chat window */}
            <div className="ch-window">
              {activeConvo ? (
                <>
                  {/* Window header */}
                  <div className="ch-window-header">
                    <img src={activeConvo.avatar} className="ch-window-avatar" alt={activeConvo.name} />
                    <div>
                      <div className="ch-window-name">{activeConvo.name}</div>
                      <div className={`ch-window-status ${!activeConvo.online ? "ch-window-status-offline" : ""}`}>
                        {activeConvo.type === "group" ? (
                          <>👥 {activeConvo.members} members</>
                        ) : activeConvo.online ? (
                          <>● Active now</>
                        ) : (
                          <>○ Offline</>
                        )}
                      </div>
                    </div>
                    <div className="ch-window-actions">
                      <button className="ch-icon-btn" title="Voice call">📞</button>
                      <button className="ch-icon-btn" title="Video call">📹</button>
                      <button className="ch-icon-btn" title="More">⋯</button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="ch-messages">
                    <div className="ch-date-divider">Today</div>
                    {activeMessages.map((m, i) => {
                      const isOwn = m.senderId === "me";
                      const isGroup = activeConvo.type === "group";
                      const prevMsg = activeMessages[i - 1];
                      const showAvatar = !isOwn && (
                        !prevMsg || prevMsg.senderId !== m.senderId
                      );
                      const showSenderName = !isOwn && isGroup && showAvatar;

                      return (
                        <div
                          key={m.id}
                          className={`ch-msg-row ${isOwn ? "own" : "other"}`}
                          style={{ animationDelay: `${i * 0.03}s` }}
                        >
                          {!isOwn && (
                            showAvatar ? (
                              <img
                                src={activeConvo.avatar}
                                className="ch-msg-avatar"
                                alt=""
                              />
                            ) : (
                              <div style={{ width: 30, flexShrink: 0 }} />
                            )
                          )}
                          <div>
                            {showSenderName && (
                              <div className="ch-msg-sender">
                                {m.senderName || activeConvo.name}
                              </div>
                            )}
                            <div className="ch-msg-bubble">{m.text}</div>
                            <div className="ch-msg-meta">
                              <span>{m.time}</span>
                              {isOwn && (
                                <span className="ch-read-tick">
                                  {m.read ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {typing && (
                      <div className="ch-msg-row other" style={{ marginTop: 4 }}>
                        <img src={activeConvo.avatar} className="ch-msg-avatar" alt="" />
                        <div className="ch-typing">
                          <div className="ch-typing-dot" />
                          <div className="ch-typing-dot" />
                          <div className="ch-typing-dot" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="ch-composer">
                    <div className="ch-composer-inner">
                      <button className="ch-attach-btn" title="Attach file">📎</button>
                      <button className="ch-attach-btn" title="Emoji">😊</button>
                      <textarea
                        className="ch-input"
                        placeholder={`Message ${activeConvo.name}...`}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                      />
                      <button
                        className="ch-send-btn"
                        onClick={sendMessage}
                        disabled={!draft.trim()}
                        title="Send"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="ch-empty">
                  <div className="ch-empty-icon">💬</div>
                  <div className="ch-empty-title">Select a conversation</div>
                  <div>Choose a chat from the list to start messaging</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}