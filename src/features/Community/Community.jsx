// src/features/community/Community.jsx
// Full Firestore Integration — Real users, posts, DMs, follow system
// Route: /community

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

import { db, auth } from "../../firebase";
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, arrayUnion, arrayRemove,
  getDocs, where, serverTimestamp, getDoc, setDoc,
  deleteDoc,
} from "firebase/firestore";

// ── Fallback / skeleton data ──────────────────────────────────────────────────
const POST_COLORS = {
  workout:   { bg:"rgba(79,142,247,0.10)",  border:"rgba(79,142,247,0.25)",  tag:"#4f8ef7",  label:"💪 Workout"   },
  diet:      { bg:"rgba(52,211,153,0.10)",  border:"rgba(52,211,153,0.25)",  tag:"#34d399",  label:"🥗 Nutrition"  },
  pr:        { bg:"rgba(167,139,250,0.10)", border:"rgba(167,139,250,0.25)", tag:"#a78bfa",  label:"🏆 New PR"     },
  wellness:  { bg:"rgba(244,114,182,0.10)", border:"rgba(244,114,182,0.25)", tag:"#f472b6",  label:"🧘 Wellness"   },
  milestone: { bg:"rgba(251,191,36,0.10)",  border:"rgba(251,191,36,0.25)",  tag:"#fbbf24",  label:"🏅 Milestone"  },
};

const TABS = [
  { id:"feed",        label:"Feed",        icon:"📢" },
  { id:"members",     label:"Members",     icon:"👥" },
  { id:"leaderboard", label:"Leaderboard", icon:"🏆" },
  { id:"challenges",  label:"Challenges",  icon:"⚡" },
  { id:"messages",    label:"Messages",    icon:"💬" },
];

const NAV_MAIN = [
  { label:"Dashboard", icon:"⊞", path:"/dashboard"  },
  { label:"Community", icon:"◎", path:"/community", badge:"3" },
  { label:"Profile",   icon:"◉", path:"/profile"    },
];

const TOOLS = [
  { label:"Calorie Calc",    icon:"🔥", path:"/calorie-calculator" },
  { label:"Fat % Calc",      icon:"📊", path:"/fat-calculator"     },
  { label:"BMI Calc",        icon:"📏", path:"/bmi-calculator"     },
  { label:"Workout Planner", icon:"📋", path:"/workout-planner"    },
  { label:"Workout Logger",  icon:"📝", path:"/workout-logger"     },
  { label:"Diet Logger",     icon:"🥗", path:"/diet-logger"        },
  { label:"Shop",            icon:"🛒", path:"/shop"               },
];

function timeAgo(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// Generate a conversation ID that is the same for two users regardless of order
function getConvId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Community() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isMale, isFemale } = useUser();

  const [mounted,        setMounted]        = useState(false);
  const [activeTab,      setActiveTab]      = useState("feed");
  const [posts,          setPosts]          = useState([]);
  const [postsLoading,   setPostsLoading]   = useState(true);
  const [members,        setMembers]        = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [leaderboard,    setLeaderboard]    = useState([]);
  const [challenges,     setChallenges]     = useState([]);
  const [convList,       setConvList]       = useState([]);   // DM conversation list
  const [activeDM,       setActiveDM]       = useState(null); // convId string
  const [activeDMUser,   setActiveDMUser]   = useState(null); // { uid, name, avatar, online }
  const [dmMessages,     setDmMessages]     = useState([]);
  const [dmMsg,          setDmMsg]          = useState("");
  const [newPost,        setNewPost]        = useState("");
  const [postType,       setPostType]       = useState("workout");
  const [posting,        setPosting]        = useState(false);
  const [searchQ,        setSearchQ]        = useState("");
  const [showNotifs,     setShowNotifs]     = useState(false);
  const [notifs,         setNotifs]         = useState([]);
  const [myFollowing,    setMyFollowing]    = useState([]); // uids I follow
  const [communityStats, setCommunityStats] = useState({ members:0, posts:0 });

  const chatEndRef = useRef(null);
  const myUid = auth.currentUser?.uid;
  const unreadDMs = convList.reduce((a, c) => a + (c.unread || 0), 0);
  const unreadNotifs = notifs.filter(n => !n.read).length;

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    // If navigated with ?dm=uid, open that DM
    const dmTarget = searchParams.get("dm");
    if (dmTarget) {
      setActiveTab("messages");
      openDMWithUser(dmTarget);
    }
  }, []);

  // ── Load my following list ─────────────────────────────────────────────────
  useEffect(() => {
    if (!myUid) return;
    const unsub = onSnapshot(doc(db, "users", myUid), snap => {
      if (snap.exists()) {
        setMyFollowing(snap.data().following || []);
      }
    });
    return () => unsub();
  }, [myUid]);

  // ── Real-time: Community Feed Posts ───────────────────────────────────────
  useEffect(() => {
    setPostsLoading(true);
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(q, async snap => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Attach liked state
      const enriched = raw.map(p => ({
        ...p,
        liked: (p.likes || []).includes(myUid),
      }));
      setPosts(enriched);
      setPostsLoading(false);
      setCommunityStats(prev => ({ ...prev, posts: snap.docs.length }));
    }, () => {
      setPostsLoading(false);
    });
    return () => unsub();
  }, [myUid]);

  // ── Real-time: Members ────────────────────────────────────────────────────
  useEffect(() => {
    setMembersLoading(true);
    const q = query(collection(db, "users"), limit(50));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.uid !== myUid); // exclude self
      setMembers(all);
      setMembersLoading(false);
      setCommunityStats(prev => ({ ...prev, members: snap.docs.length }));
    }, () => setMembersLoading(false));
    return () => unsub();
  }, [myUid]);

  // ── Real-time: Leaderboard (top 10 by streak) ────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("streak", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, snap => {
      const rows = snap.docs.map((d, i) => ({
        uid: d.id,
        rank: i + 1,
        ...d.data(),
      }));
      setLeaderboard(rows);
    });
    return () => unsub();
  }, []);

  // ── Real-time: Challenges ─────────────────────────────────────────────────
  useEffect(() => {
    if (!myUid) return;
    const unsub = onSnapshot(collection(db, "challenges"), snap => {
      const all = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        joined: (d.data().participants || []).includes(myUid),
      }));
      setChallenges(all);
    });
    return () => unsub();
  }, [myUid]);

  // ── Real-time: My DM conversation list ───────────────────────────────────
  useEffect(() => {
    if (!myUid) return;
    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", myUid),
      orderBy("lastMessageAt", "desc")
    );
    const unsub = onSnapshot(q, async snap => {
      const convs = await Promise.all(snap.docs.map(async d => {
        const data = d.data();
        // Get the other user's uid
        const otherUid = data.members.find(u => u !== myUid);
        let otherUser = { name: "User", avatar: null, online: false };
        try {
          const uSnap = await getDoc(doc(db, "users", otherUid));
          if (uSnap.exists()) otherUser = { uid: otherUid, ...uSnap.data() };
        } catch {}
        return {
          convId: d.id,
          otherUser,
          lastMsg: data.lastMessage || "",
          lastAt: data.lastMessageAt,
          unread: (data.unreadBy || []).includes(myUid) ? 1 : 0,
        };
      }));
      setConvList(convs);
    });
    return () => unsub();
  }, [myUid]);

  // ── Real-time: Active DM Messages ────────────────────────────────────────
  useEffect(() => {
    if (!activeDM) return;
    const q = query(
      collection(db, "conversations", activeDM, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setDmMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Mark as read
      updateDoc(doc(db, "conversations", activeDM), {
        unreadBy: arrayRemove(myUid),
      }).catch(() => {});
    });
    return () => unsub();
  }, [activeDM, myUid]);

  // ── Real-time: Notifications ──────────────────────────────────────────────
  useEffect(() => {
    if (!myUid) return;
    const q = query(
      collection(db, "users", myUid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [myUid]);

  // ── Scroll chat to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handlePost = async () => {
    if (!newPost.trim() || !myUid) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid:       myUid,
        name:      user.name || "Athlete",
        avatar:    user.avatar || null,
        content:   newPost.trim(),
        type:      postType,
        likes:     [],
        comments:  [],
        createdAt: serverTimestamp(),
      });
      setNewPost("");
    } catch (e) {
      console.error("Post error:", e);
    }
    setPosting(false);
  };

  const toggleLike = async (postId, isLiked) => {
    if (!myUid) return;
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, liked: !isLiked, likes: isLiked
          ? (p.likes||[]).filter(u => u !== myUid)
          : [...(p.likes||[]), myUid] }
      : p
    ));
    try {
      await updateDoc(doc(db, "posts", postId), {
        likes: isLiked ? arrayRemove(myUid) : arrayUnion(myUid),
      });
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const toggleFollow = async (targetUid) => {
    if (!myUid || targetUid === myUid) return;
    const isFollowing = myFollowing.includes(targetUid);
    // Optimistic
    setMyFollowing(prev =>
      isFollowing ? prev.filter(u => u !== targetUid) : [...prev, targetUid]
    );
    try {
      if (isFollowing) {
        await updateDoc(doc(db,"users",myUid),     { following: arrayRemove(targetUid) });
        await updateDoc(doc(db,"users",targetUid), { followers: arrayRemove(myUid) });
      } else {
        await updateDoc(doc(db,"users",myUid),     { following: arrayUnion(targetUid) });
        await updateDoc(doc(db,"users",targetUid), { followers: arrayUnion(myUid) });
        // Send notification
        await addDoc(collection(db,"users",targetUid,"notifications"), {
          type:      "follow",
          text:      `${user.name || "Someone"} started following you`,
          fromUid:   myUid,
          fromName:  user.name || "Athlete",
          fromAvatar:user.avatar || null,
          read:      false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Follow error:", e);
    }
  };

  const toggleChallenge = async (challengeId, isJoined) => {
    if (!myUid) return;
    try {
      await updateDoc(doc(db,"challenges",challengeId), {
        participants: isJoined ? arrayRemove(myUid) : arrayUnion(myUid),
      });
    } catch (e) {
      console.error("Challenge error:", e);
    }
  };

  // Open DM with a user (by their uid) — creates conversation doc if needed
  const openDMWithUser = async (targetUid) => {
    if (!myUid || targetUid === myUid) return;
    const convId = getConvId(myUid, targetUid);
    // Ensure conversation document exists
    const convRef = doc(db, "conversations", convId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) {
      await setDoc(convRef, {
        members:       [myUid, targetUid],
        lastMessage:   "",
        lastMessageAt: serverTimestamp(),
        unreadBy:      [],
      });
    }
    // Get target user info
    try {
      const uSnap = await getDoc(doc(db,"users",targetUid));
      if (uSnap.exists()) {
        setActiveDMUser({ uid: targetUid, ...uSnap.data() });
      }
    } catch {}
    setActiveDM(convId);
    setActiveTab("messages");
  };

  const sendDM = async () => {
    if (!dmMsg.trim() || !activeDM || !myUid) return;
    const text = dmMsg.trim();
    setDmMsg("");
    try {
      await addDoc(collection(db,"conversations",activeDM,"messages"), {
        text,
        senderUid:  myUid,
        senderName: user.name || "Athlete",
        createdAt:  serverTimestamp(),
      });
      // Update conversation meta
      const otherUid = activeDMUser?.uid;
      await updateDoc(doc(db,"conversations",activeDM), {
        lastMessage:   text,
        lastMessageAt: serverTimestamp(),
        unreadBy:      arrayUnion(otherUid),
      });
    } catch (e) {
      console.error("DM error:", e);
    }
  };

  const markAllNotifsRead = async () => {
    if (!myUid) return;
    notifs.filter(n => !n.read).forEach(async n => {
      try {
        await updateDoc(doc(db,"users",myUid,"notifications",n.id), { read: true });
      } catch {}
    });
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredPosts = posts.filter(p =>
    !searchQ ||
    p.content?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredMembers = members.filter(m =>
    !searchQ ||
    m.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    m.goal?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const onlineMembers = members.filter(m => m.online);

  // ── CSS ───────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    .cm-root{min-height:100vh;display:flex;font-family:${FONT.body};background:${T.bg};color:${T.text};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s;}
    .cm-sb{width:255px;min-height:100vh;background:${T.sidebar};border-right:1px solid ${T.glassBorder};display:flex;flex-direction:column;padding:28px 15px 22px;flex-shrink:0;position:relative;z-index:20;backdrop-filter:blur(40px);transition:background 0.5s;}
    .cm-sb::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,${T.accent}08 0%,transparent 100%);pointer-events:none;}
    .cm-lg{font-family:${FONT.display};font-size:21px;font-weight:800;letter-spacing:0.04em;color:${T.text};padding:0 8px;margin-bottom:4px;cursor:pointer;}
    .cm-lg span{color:${T.accent};}
    .cm-lt2{font-size:10px;color:${T.textMuted};letter-spacing:0.14em;text-transform:uppercase;font-weight:600;padding:0 8px;margin-bottom:24px;}
    .cm-su{padding:13px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:15px;backdrop-filter:blur(20px);display:flex;align-items:center;gap:11px;cursor:pointer;transition:all 0.25s;margin-bottom:22px;}
    .cm-su:hover{border-color:${T.accent}35;}
    .cm-sa{width:37px;height:37px;border-radius:50%;border:2px solid ${T.accent}40;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;}
    .cm-sn{font-size:13px;font-weight:700;color:${T.text};}
    .cm-sg{font-size:11px;color:${T.accent};font-weight:500;text-transform:capitalize;}
    .cm-nl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${T.textMuted};padding:0 8px;margin:16px 0 5px;}
    .cm-ni{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:13px;cursor:pointer;font-size:13.5px;font-weight:500;color:${T.textSub};transition:all 0.22s;margin-bottom:2px;border:1px solid transparent;}
    .cm-ni:hover{color:${T.text};background:${T.glass};border-color:${T.glassBorder};}
    .cm-ni.cm-na{background:linear-gradient(135deg,${T.accentSoft},${T.purpleSoft});color:${T.accent};border-color:${T.accent}24;font-weight:600;}
    .cm-nn{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
    .cm-nbdg{margin-left:auto;padding:2px 7px;background:${T.accent}22;color:${T.accent};border-radius:99px;font-size:10px;font-weight:800;}
    .cm-ti{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};transition:all 0.2s;margin-bottom:1px;}
    .cm-ti:hover{color:${T.text};background:${T.glass};}
    .cm-lb-btn{width:100%;padding:11px;border-radius:13px;border:1px solid rgba(248,113,113,0.18);background:rgba(248,113,113,0.05);color:${T.red};font-size:13px;font-weight:600;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;margin-top:auto;}
    .cm-lb-btn:hover{background:rgba(248,113,113,0.12);}

    .cm-mn{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}
    .cm-tb{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;animation:fadeUp 0.6s ease both;}
    .cm-tt{font-family:${FONT.display};font-size:27px;font-weight:800;color:${T.text};letter-spacing:-0.02em;}
    .cm-ts{font-size:13px;color:${T.textSub};margin-top:3px;}
    .cm-tr{display:flex;align-items:center;gap:10px;}
    .cm-streak{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);font-size:13px;font-weight:700;color:#fb923c;}

    .cm-search{display:flex;align-items:center;gap:10px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:14px;padding:0 16px;height:44px;margin-bottom:20px;backdrop-filter:blur(20px);animation:fadeUp 0.6s ease 0.03s both;transition:border-color 0.25s;}
    .cm-search:focus-within{border-color:${T.accent}50;}
    .cm-search-input{flex:1;background:none;border:none;outline:none;font-size:14px;color:${T.text};font-family:${FONT.body};}
    .cm-search-input::placeholder{color:${T.textMuted};}

    .cm-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;animation:fadeUp 0.6s ease 0.05s both;}
    .cm-stat{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;padding:16px;text-align:center;backdrop-filter:blur(20px);transition:all 0.25s;}
    .cm-stat:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .cm-stat-v{font-family:${FONT.display};font-size:24px;font-weight:800;letter-spacing:-0.02em;}
    .cm-stat-l{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

    .cm-tabs{display:flex;gap:6px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;padding:5px;margin-bottom:22px;animation:fadeUp 0.6s ease 0.07s both;backdrop-filter:blur(20px);}
    .cm-tab{flex:1;padding:10px 8px;border-radius:11px;border:none;background:transparent;color:${T.textSub};font-size:12px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.22s;position:relative;}
    .cm-tab:hover{color:${T.text};}
    .cm-tab.active{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;box-shadow:0 4px 16px ${T.accentGlow};}
    .cm-tab-badge{position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;background:${T.red};color:#fff;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;}

    .cm-grid{display:grid;grid-template-columns:1fr 300px;gap:20px;}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:14px;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}

    /* Composer */
    .composer{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);margin-bottom:14px;}
    .composer-row{display:flex;gap:12px;align-items:flex-start;}
    .composer-ava{width:40px;height:40px;border-radius:50%;border:2px solid ${T.accent}40;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden;}
    .composer-inp{flex:1;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:14px;padding:14px 16px;color:${T.text};font-size:14px;font-family:${FONT.body};outline:none;resize:none;transition:all 0.25s;min-height:76px;}
    .composer-inp::placeholder{color:${T.textMuted};}
    .composer-inp:focus{border-color:${T.accent}50;box-shadow:0 0 0 3px ${T.accentGlow};}
    .composer-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;}
    .composer-types{display:flex;gap:8px;flex-wrap:wrap;}
    .composer-type{padding:6px 13px;border-radius:99px;border:1px solid ${T.glassBorder};background:transparent;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:${FONT.body};}
    .composer-type.active-type{border-color:${T.accent};background:${T.accentSoft};color:${T.accent};}
    .composer-type:not(.active-type){color:${T.textSub};}
    .composer-type:hover{border-color:${T.accent}35;color:${T.accent};}
    .post-btn{padding:10px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:13px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;box-shadow:0 4px 16px ${T.accentGlow};}
    .post-btn:hover{transform:translateY(-2px);}
    .post-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    /* Post cards */
    .post-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);margin-bottom:12px;transition:all 0.3s;animation:fadeUp 0.5s ease both;}
    .post-card:hover{border-color:${T.glassBorderHover};}
    .post-header{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
    .post-ava{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid ${T.glassBorder};flex-shrink:0;background:${T.glass};}
    .post-ava-fallback{width:42px;height:42px;border-radius:50%;border:2px solid ${T.glassBorder};background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0;}
    .post-name{font-size:14px;font-weight:700;color:${T.text};cursor:pointer;}
    .post-name:hover{color:${T.accent};}
    .post-time{font-size:11px;color:${T.textMuted};margin-top:2px;}
    .post-tag{margin-left:auto;padding:4px 12px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:0.05em;white-space:nowrap;}
    .post-body{font-size:14px;color:${T.textSub};line-height:1.7;margin-bottom:16px;}
    .post-actions{display:flex;gap:8px;padding-top:12px;border-top:1px solid ${T.glassBorder};}
    .action-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .action-btn:hover{border-color:${T.accent}35;color:${T.accent};background:${T.accentSoft};}
    .action-btn.liked{color:${T.pink};border-color:${T.pink}30;background:rgba(244,114,182,0.08);}

    /* Member cards */
    .members-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .member-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:18px;backdrop-filter:blur(28px);transition:all 0.3s;animation:fadeUp 0.5s ease both;cursor:pointer;}
    .member-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .member-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
    .member-ava{width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid ${T.glassBorder};flex-shrink:0;}
    .member-ava-fb{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0;}
    .member-name{font-size:14px;font-weight:700;color:${T.text};}
    .member-goal{font-size:11px;color:${T.textSub};margin-top:2px;}
    .member-stats{display:flex;gap:7px;margin-bottom:12px;}
    .mstat{flex:1;background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:9px;padding:7px;text-align:center;}
    .mstat-v{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};}
    .mstat-l{font-size:9px;color:${T.textMuted};font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-top:2px;}
    .follow-btn{width:100%;padding:8px;border-radius:10px;font-size:12px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;border:none;}
    .follow-btn.following{border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};}
    .follow-btn.following:hover{border-color:rgba(248,113,113,0.3);color:${T.red};}
    .follow-btn.not-following{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;box-shadow:0 4px 14px ${T.accentGlow};}
    .follow-btn.not-following:hover{transform:translateY(-2px);}
    .online-dot-abs{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:${T.green};border:2px solid ${T.bg};}

    /* Leaderboard */
    .lb-row{display:flex;align-items:center;gap:13px;padding:13px 16px;border-radius:15px;border:1px solid transparent;transition:all 0.25s;margin-bottom:7px;animation:fadeUp 0.5s ease both;cursor:pointer;}
    .lb-row:hover{background:${T.glass};border-color:${T.glassBorder};}
    .lb-row.you{background:linear-gradient(135deg,${T.accent}10,${T.purple}08);border-color:${T.accent}25;}
    .lb-rank{font-family:${FONT.display};font-size:17px;font-weight:800;width:30px;text-align:center;flex-shrink:0;}
    .lb-ava{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid ${T.glassBorder};flex-shrink:0;background:${T.glass};}
    .lb-name{font-size:13px;font-weight:700;color:${T.text};flex:1;}
    .lb-you-tag{font-size:9px;font-weight:800;color:${T.accent};background:${T.accentSoft};padding:2px 7px;border-radius:99px;margin-left:6px;}

    /* Challenge cards */
    .ch-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:20px;backdrop-filter:blur(28px);margin-bottom:12px;transition:all 0.3s;animation:fadeUp 0.5s ease both;}
    .ch-card:hover{border-color:${T.glassBorderHover};}
    .ch-head{display:flex;align-items:center;gap:14px;margin-bottom:12px;}
    .ch-emoji{font-size:34px;}
    .ch-title{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .ch-meta{font-size:12px;color:${T.textSub};}
    .ch-prog{height:6px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};border-radius:99px;overflow:hidden;margin:12px 0;}
    .ch-prog-fill{height:100%;border-radius:99px;}
    .ch-foot{display:flex;align-items:center;justify-content:space-between;}
    .ch-btn{padding:9px 20px;border-radius:11px;font-size:12px;font-weight:800;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;}
    .ch-btn.joined{background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub};}
    .ch-btn.joined:hover{border-color:rgba(248,113,113,0.3);color:${T.red};}
    .ch-btn.join{border:none;color:#000;}
    .ch-btn.join:hover{transform:translateY(-2px);}

    /* DM */
    .dm-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;cursor:pointer;transition:all 0.22s;margin-bottom:6px;border:1px solid transparent;}
    .dm-row:hover{background:${T.glass};border-color:${T.glassBorder};}
    .dm-row.active-dm{background:${T.accentSoft};border-color:${T.accent}30;}
    .dm-ava-wrap{position:relative;flex-shrink:0;}
    .dm-ava{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${T.glassBorder};}
    .dm-ava-fb{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;}
    .dm-online{position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:${T.green};border:2px solid ${T.bg};}
    .dm-name{font-size:13px;font-weight:700;color:${T.text};}
    .dm-last{font-size:11px;color:${T.textMuted};margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;}
    .dm-time{font-size:10px;color:${T.textMuted};margin-left:auto;flex-shrink:0;}
    .dm-unread{width:18px;height:18px;border-radius:50%;background:${T.accent};color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

    /* Chat window */
    .chat-window{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;overflow:hidden;animation:fadeUp 0.4s ease both;}
    .chat-header{padding:16px 20px;border-bottom:1px solid ${T.glassBorder};display:flex;align-items:center;gap:12px;background:${dark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.6)"};}
    .chat-ava{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${T.accent}30;}
    .chat-name{font-size:14px;font-weight:700;color:${T.text};}
    .chat-status{font-size:11px;color:${T.green};}
    .chat-back{padding:6px 12px;border-radius:9px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:12px;font-weight:600;cursor:pointer;font-family:${FONT.body};margin-right:4px;transition:all 0.2s;}
    .chat-back:hover{color:${T.accent};border-color:${T.accent}30;}
    .chat-msgs{height:340px;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;}
    .chat-msgs::-webkit-scrollbar{width:2px;}
    .chat-msgs::-webkit-scrollbar-thumb{background:${T.accent}40;border-radius:99px;}
    .msg-bubble{max-width:70%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;}
    .msg-me{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
    .msg-them{background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)"};color:${T.text};align-self:flex-start;border-bottom-left-radius:4px;border:1px solid ${T.glassBorder};}
    .msg-time{font-size:9px;opacity:0.6;margin-top:4px;}
    .chat-input-row{padding:14px 16px;border-top:1px solid ${T.glassBorder};display:flex;gap:10px;align-items:flex-end;}
    .chat-inp{flex:1;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};border:1px solid ${T.glassBorder};border-radius:12px;padding:10px 14px;font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;resize:none;min-height:42px;max-height:100px;transition:all 0.25s;}
    .chat-inp:focus{border-color:${T.accent}50;}
    .chat-inp::placeholder{color:${T.textMuted};}
    .chat-send{width:42px;height:42px;border-radius:12px;border:none;background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:17px;cursor:pointer;transition:all 0.25s;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
    .chat-send:hover{transform:translateY(-2px);box-shadow:0 8px 20px ${T.accentGlow};}

    /* Notifications */
    .notif-wrapper{position:relative;}
    .notif-btn{width:42px;height:42px;border-radius:13px;border:1px solid ${T.glassBorder};background:${T.glass};display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;transition:all 0.22s;color:${T.textSub};position:relative;}
    .notif-btn:hover{border-color:${T.accent}30;color:${T.accent};}
    .notif-dot{position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:${T.red};border:2px solid ${T.bg};}
    .notif-panel{position:absolute;top:calc(100% + 10px);right:0;width:320px;background:${dark?"rgba(10,12,26,0.98)":"rgba(255,255,255,0.98)"};border:1px solid ${T.glassBorder};border-radius:18px;backdrop-filter:blur(32px);z-index:999;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:fadeUp 0.3s ease both;}
    .notif-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid ${T.glassBorder};}
    .notif-title{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};}
    .notif-clear{font-size:11px;color:${T.accent};font-weight:700;cursor:pointer;background:none;border:none;font-family:${FONT.body};}
    .notif-item{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid ${T.glassBorder};transition:background 0.2s;cursor:pointer;}
    .notif-item:hover{background:${T.glass};}
    .notif-item:last-child{border-bottom:none;}
    .notif-item.unread{background:${T.accentSoft};}
    .notif-ava{width:36px;height:36px;border-radius:50%;border:2px solid ${T.glassBorder};flex-shrink:0;background:${T.glass};display:flex;align-items:center;justify-content:center;font-size:16px;overflow:hidden;}
    .notif-text{font-size:13px;color:${T.text};flex:1;line-height:1.4;}
    .notif-time-t{font-size:10px;color:${T.textMuted};flex-shrink:0;}

    /* Right sidebar */
    .side-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:18px;backdrop-filter:blur(28px);margin-bottom:14px;}
    .online-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};}
    .online-row:last-child{border-bottom:none;}

    .theme-toggle{width:52px;height:28px;border-radius:99px;border:1.5px solid ${T.glassBorder};background:${T.glass};cursor:pointer;position:relative;flex-shrink:0;}
    .toggle-thumb{position:absolute;top:3px;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,${T.accent},${T.purple});display:flex;align-items:center;justify-content:center;font-size:12px;transition:left 0.35s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 12px ${T.accentGlow};left:${dark?"3px":"27px"};}

    .skeleton{background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};border-radius:10px;animation:pulse 1.5s ease infinite;}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:1100px){.cm-grid{grid-template-columns:1fr;}.members-grid{grid-template-columns:1fr 1fr;}.cm-stats{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:768px){.cm-sb{display:none;}.cm-mn{padding:20px 16px;}.members-grid{grid-template-columns:1fr;}.cm-stats{grid-template-columns:repeat(2,1fr);}}
  `;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const Avatar = ({ src, name, size=42, style={} }) =>
    src
      ? <img src={src} alt={name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.glassBorder}`,...style }} />
      : <div style={{ width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:800,color:"#fff",flexShrink:0,...style }}>
          {name?.[0]?.toUpperCase() || "A"}
        </div>;

  const rankBadge = (r) => r===1?"🏆":r===2?"🥈":r===3?"🥉":"⭐";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{generateCSS(T, dark)}</style>
      <style>{css}</style>
      <div className="cm-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        {/* ── SIDEBAR ── */}
        <aside className="cm-sb">
          <div className="cm-lg" onClick={() => navigate("/dashboard")}>AshFit<span>Verse</span></div>
          <div className="cm-lt2">Premium Fitness OS</div>

          <div className="cm-su" onClick={() => navigate("/profile")}>
            <div className="cm-sa">{user.name?.[0]?.toUpperCase() || "A"}</div>
            <div>
              <div className="cm-sn">{user.name || "Athlete"}</div>
              <div className="cm-sg">{user.goal?.replace(/_/g," ") || "Fitness"}</div>
            </div>
          </div>

          <div className="cm-nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div key={n.label} className={`cm-ni ${n.path==="/community"?"cm-na":""}`} onClick={() => navigate(n.path)}>
              <span className="cm-nn">{n.icon}</span><span>{n.label}</span>
              {n.badge && <span className="cm-nbdg">{n.badge}</span>}
            </div>
          ))}
          {isFemale && <div className="cm-ni" onClick={() => navigate("/female-health")}><span className="cm-nn">♀</span><span>Women's Health</span></div>}
          {isMale   && <div className="cm-ni" onClick={() => navigate("/male-health")}><span className="cm-nn">♂</span><span>Men's Health</span></div>}

          <div className="cm-nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="cm-ti" onClick={() => navigate(t.path)}>
              <span style={{ fontSize:14,width:18,textAlign:"center" }}>{t.icon}</span><span>{t.label}</span>
            </div>
          ))}

          <button className="cm-lb-btn" onClick={() => navigate("/")} style={{ marginTop:20 }}>⎋ &nbsp;Logout</button>
        </aside>

        {/* ── MAIN ── */}
        <main className="cm-mn">

          {/* Topbar */}
          <div className="cm-tb">
            <div>
              <div className="cm-tt">Community 👥</div>
              <div className="cm-ts">Connect, compete and grow with your fitness tribe</div>
            </div>
            <div className="cm-tr">
              <div className="cm-streak">🔥 {user.streak || 0}-day streak</div>

              {/* Notifications */}
              <div className="notif-wrapper">
                <button className="notif-btn" onClick={() => setShowNotifs(v => !v)}>
                  🔔
                  {unreadNotifs > 0 && <div className="notif-dot" />}
                </button>
                {showNotifs && (
                  <div className="notif-panel">
                    <div className="notif-head">
                      <span className="notif-title">Notifications {unreadNotifs > 0 && `(${unreadNotifs})`}</span>
                      <button className="notif-clear" onClick={markAllNotifsRead}>Mark all read</button>
                    </div>
                    {notifs.length === 0
                      ? <div style={{ padding:"20px",textAlign:"center",color:T.textMuted,fontSize:13 }}>No notifications yet</div>
                      : notifs.map(n => (
                        <div key={n.id} className={`notif-item ${!n.read?"unread":""}`}
                          onClick={async () => {
                            await updateDoc(doc(db,"users",myUid,"notifications",n.id), { read: true });
                          }}>
                          <div className="notif-ava">
                            {n.fromAvatar
                              ? <img src={n.fromAvatar} alt="" style={{ width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover" }} />
                              : "🔔"}
                          </div>
                          <div className="notif-text">{n.text}</div>
                          <div className="notif-time-t">{timeAgo(n.createdAt)}</div>
                        </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="theme-toggle" onClick={toggleTheme}><div className="toggle-thumb">{dark?"🌙":"☀️"}</div></button>
              <div onClick={() => navigate("/profile")} style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",cursor:"pointer",border:`2px solid ${T.accent}40` }}>
                {user.name?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="cm-search">
            <span style={{ color:T.textMuted,fontSize:16 }}>🔍</span>
            <input className="cm-search-input" placeholder="Search members, posts, challenges..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            {searchQ && <button onClick={() => setSearchQ("")} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:16 }}>✕</button>}
          </div>

          {/* Stats */}
          <div className="cm-stats">
            {[
              { v: communityStats.members || "—", l:"Members",     c:T.accent  },
              { v: myFollowing.length,             l:"Following",   c:T.green   },
              { v: challenges.filter(c=>c.joined).length, l:"Challenges", c:T.purple },
              { v: leaderboard.findIndex(u=>u.uid===myUid) > -1 ? `#${leaderboard.findIndex(u=>u.uid===myUid)+1}` : "—", l:"Your Rank", c:T.orange },
              { v: communityStats.posts || "—",    l:"Total Posts", c:T.pink    },
            ].map((s,i) => (
              <div key={i} className="cm-stat">
                <div className="cm-stat-v" style={{ color:s.c }}>{s.v}</div>
                <div className="cm-stat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="cm-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`cm-tab ${activeTab===t.id?"active":""}`}
                onClick={() => { setActiveTab(t.id); if(t.id!=="messages") setActiveDM(null); }}>
                {t.icon} {t.label}
                {t.id==="messages" && unreadDMs > 0 && <span className="cm-tab-badge">{unreadDMs}</span>}
              </button>
            ))}
          </div>

          <div className="cm-grid">

            {/* ── LEFT / MAIN COLUMN ── */}
            <div>

              {/* ── FEED ── */}
              {activeTab === "feed" && (
                <>
                  {/* Composer */}
                  <div className="composer">
                    <div className="composer-row">
                      <div className="composer-ava">{user.name?.[0]?.toUpperCase()||"A"}</div>
                      <textarea className="composer-inp"
                        placeholder="Share a workout, milestone, tip or question..."
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        rows={3} />
                    </div>
                    <div className="composer-footer">
                      <div className="composer-types">
                        {[
                          { key:"workout",   label:"💪 Workout"  },
                          { key:"diet",      label:"🥗 Nutrition"},
                          { key:"pr",        label:"🏆 PR"       },
                          { key:"wellness",  label:"🧘 Wellness" },
                          { key:"milestone", label:"🏅 Milestone"},
                        ].map(t => (
                          <button key={t.key}
                            className={`composer-type ${postType===t.key?"active-type":""}`}
                            onClick={() => setPostType(t.key)}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <button className="post-btn" onClick={handlePost} disabled={!newPost.trim()||posting}>
                        {posting ? "Posting…" : "Post →"}
                      </button>
                    </div>
                  </div>

                  {/* Posts */}
                  {postsLoading
                    ? [1,2,3].map(i => (
                        <div key={i} className="post-card">
                          <div style={{ display:"flex",gap:12,marginBottom:14 }}>
                            <div className="skeleton" style={{ width:42,height:42,borderRadius:"50%" }} />
                            <div style={{ flex:1 }}>
                              <div className="skeleton" style={{ height:14,width:"40%",marginBottom:8 }} />
                              <div className="skeleton" style={{ height:10,width:"25%" }} />
                            </div>
                          </div>
                          <div className="skeleton" style={{ height:60,marginBottom:14 }} />
                        </div>
                      ))
                    : filteredPosts.map((p, i) => {
                        const pc = POST_COLORS[p.type] || POST_COLORS.workout;
                        return (
                          <div key={p.id} className="post-card" style={{ animationDelay:`${i*0.05}s` }}>
                            <div className="post-header">
                              <Avatar src={p.avatar} name={p.name} size={42} />
                              <div>
                                <div className="post-name" onClick={() => navigate(`/user/${p.uid}`)}>{p.name || "Athlete"}</div>
                                <div className="post-time">{timeAgo(p.createdAt)}</div>
                              </div>
                              <span className="post-tag" style={{ background:pc.bg,color:pc.tag,border:`1px solid ${pc.border}` }}>{pc.label}</span>
                            </div>
                            <div className="post-body">{p.content}</div>
                            <div className="post-actions">
                              <button className={`action-btn ${p.liked?"liked":""}`} onClick={() => toggleLike(p.id, p.liked)}>
                                {p.liked?"❤️":"🤍"} {(p.likes||[]).length}
                              </button>
                              <button className="action-btn">💬 {(p.comments||[]).length}</button>
                              {p.uid !== myUid && (
                                <button className="action-btn" onClick={() => openDMWithUser(p.uid)}>✉️ DM</button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  }
                  {!postsLoading && filteredPosts.length === 0 && (
                    <div style={{ textAlign:"center",padding:"40px 0",color:T.textMuted }}>
                      <div style={{ fontSize:40,marginBottom:12 }}>📢</div>
                      <div style={{ fontSize:15,fontWeight:700 }}>No posts yet</div>
                      <div style={{ fontSize:13,marginTop:6 }}>Be the first to share something!</div>
                    </div>
                  )}
                </>
              )}

              {/* ── MEMBERS ── */}
              {activeTab === "members" && (
                membersLoading
                  ? <div className="members-grid">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="member-card" style={{ cursor:"default" }}>
                          <div style={{ display:"flex",gap:12,marginBottom:12 }}>
                            <div className="skeleton" style={{ width:46,height:46,borderRadius:"50%" }} />
                            <div style={{ flex:1 }}>
                              <div className="skeleton" style={{ height:14,width:"60%",marginBottom:8 }} />
                              <div className="skeleton" style={{ height:10,width:"40%" }} />
                            </div>
                          </div>
                          <div className="skeleton" style={{ height:36,borderRadius:10 }} />
                        </div>
                      ))}
                    </div>
                  : <div className="members-grid">
                      {filteredMembers.map((m, i) => {
                        const isFollowing = myFollowing.includes(m.uid);
                        return (
                          <div key={m.uid} className="member-card" style={{ animationDelay:`${i*0.05}s` }}
                            onClick={() => navigate(`/user/${m.uid}`)}>
                            <div className="member-top">
                              <div style={{ position:"relative" }}>
                                <Avatar src={m.avatar} name={m.name} size={46} />
                                {m.online && <div className="online-dot-abs" />}
                              </div>
                              <div>
                                <div className="member-name">{m.name || "Athlete"}</div>
                                <div className="member-goal">{m.goal?.replace(/_/g," ") || "Fitness"}</div>
                              </div>
                            </div>
                            <div className="member-stats">
                              <div className="mstat">
                                <div className="mstat-v" style={{ color:T.orange }}>{m.streak || 0}</div>
                                <div className="mstat-l">Streak</div>
                              </div>
                              <div className="mstat">
                                <div className="mstat-v" style={{ color:T.accent }}>{m.weight ? `${m.weight}kg` : "—"}</div>
                                <div className="mstat-l">Weight</div>
                              </div>
                              <div className="mstat">
                                <div className="mstat-v" style={{ color:T.purple }}>{(m.followers||[]).length}</div>
                                <div className="mstat-l">Followers</div>
                              </div>
                            </div>
                            <button
                              className={`follow-btn ${isFollowing?"following":"not-following"}`}
                              onClick={e => { e.stopPropagation(); toggleFollow(m.uid); }}>
                              {isFollowing ? "✓ Following" : "+ Follow"}
                            </button>
                            <div style={{ display:"flex",gap:6,marginTop:9 }}>
                              <button onClick={e => { e.stopPropagation(); openDMWithUser(m.uid); }}
                                style={{ flex:1,padding:"6px",borderRadius:9,border:`1px solid ${T.glassBorder}`,background:T.glass,color:T.textSub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                                💬 Message
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {filteredMembers.length === 0 && (
                        <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"40px 0",color:T.textMuted }}>
                          <div style={{ fontSize:14 }}>No members found</div>
                        </div>
                      )}
                    </div>
              )}

              {/* ── LEADERBOARD ── */}
              {activeTab === "leaderboard" && (
                <>
                  <div className="g-card" style={{ padding:"12px 16px",marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.1em",textTransform:"uppercase" }}>
                      <span style={{ width:30 }}>#</span>
                      <span style={{ flex:1,paddingLeft:56 }}>Member</span>
                      <span style={{ marginRight:20 }}>Streak</span>
                      <span>Points</span>
                    </div>
                  </div>
                  {leaderboard.map((l, i) => {
                    const isYou = l.uid === myUid;
                    return (
                      <div key={l.uid} className={`lb-row ${isYou?"you":""}`}
                        style={{ animationDelay:`${i*0.05}s` }}
                        onClick={() => navigate(`/user/${l.uid}`)}>
                        <div className="lb-rank">{rankBadge(l.rank)}</div>
                        <Avatar src={l.avatar} name={l.name} size={42} />
                        <div className="lb-name">
                          {l.name || "Athlete"}
                          {isYou && <span className="lb-you-tag">You</span>}
                        </div>
                        <div style={{ textAlign:"center",marginRight:20 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:T.orange }}>🔥 {l.streak || 0}</div>
                          <div style={{ fontSize:9,color:T.textMuted }}>days</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:FONT.display,fontSize:15,fontWeight:800,color:isYou?T.accent:T.text }}>{(l.points||0).toLocaleString()}</div>
                          <div style={{ fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:"0.08em" }}>pts</div>
                        </div>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <div style={{ textAlign:"center",padding:"40px 0",color:T.textMuted,fontSize:13 }}>No data yet</div>
                  )}
                </>
              )}

              {/* ── CHALLENGES ── */}
              {activeTab === "challenges" && (
                <>
                  {challenges.map((c, i) => (
                    <div key={c.id} className="ch-card" style={{ animationDelay:`${i*0.07}s` }}>
                      <div className="ch-head">
                        <span className="ch-emoji">{c.emoji || "⚡"}</span>
                        <div>
                          <div className="ch-title">{c.title}</div>
                          <div className="ch-meta">{c.daysLeft} days left · {(c.participants||[]).length} participants</div>
                        </div>
                      </div>
                      <div className="ch-prog">
                        <div className="ch-prog-fill" style={{ width:`${((c.totalDays-(c.daysLeft||0))/Math.max(c.totalDays,1))*100}%`,background:`linear-gradient(90deg,${c.color||T.accent},${c.color||T.accent}88)` }} />
                      </div>
                      <div className="ch-foot">
                        <div style={{ display:"flex" }}>
                          {(c.participants||[]).slice(0,4).map((uid,n) => (
                            <div key={n} style={{ width:26,height:26,borderRadius:"50%",background:T.glass,border:`2px solid ${T.bg}`,marginLeft:n===0?0:-8,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center" }}>👤</div>
                          ))}
                          {(c.participants||[]).length > 4 && (
                            <span style={{ fontSize:11,color:T.textSub,marginLeft:8,alignSelf:"center" }}>+{(c.participants||[]).length-4} more</span>
                          )}
                        </div>
                        <button
                          className={`ch-btn ${c.joined?"joined":"join"}`}
                          style={c.joined?{}:{ background:`linear-gradient(135deg,${c.color||T.accent},${c.color||T.accent}bb)` }}
                          onClick={() => toggleChallenge(c.id, c.joined)}>
                          {c.joined ? "✓ Joined" : "Join →"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {challenges.length === 0 && (
                    <div style={{ textAlign:"center",padding:"40px 0",color:T.textMuted,fontSize:13 }}>No challenges yet</div>
                  )}
                </>
              )}

              {/* ── MESSAGES ── */}
              {activeTab === "messages" && (
                <>
                  {!activeDM ? (
                    <>
                      <div className="g-card" style={{ marginBottom:12 }}>
                        <div className="g-title">Direct Messages</div>
                        {convList.length === 0
                          ? <div style={{ textAlign:"center",padding:"20px 0",color:T.textMuted,fontSize:13 }}>No conversations yet</div>
                          : convList.map(c => (
                            <div key={c.convId}
                              className={`dm-row ${activeDM===c.convId?"active-dm":""}`}
                              onClick={async () => {
                                setActiveDMUser(c.otherUser);
                                setActiveDM(c.convId);
                              }}>
                              <div className="dm-ava-wrap">
                                <Avatar src={c.otherUser.avatar} name={c.otherUser.name} size={44} />
                                {c.otherUser.online && <div className="dm-online" />}
                              </div>
                              <div style={{ flex:1,overflow:"hidden" }}>
                                <div className="dm-name">{c.otherUser.name || "User"}</div>
                                <div className="dm-last">{c.lastMsg || "Say hello!"}</div>
                              </div>
                              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5 }}>
                                <div className="dm-time">{timeAgo(c.lastAt)}</div>
                                {c.unread > 0 && <div className="dm-unread">{c.unread}</div>}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      <div style={{ textAlign:"center",padding:"20px 0" }}>
                        <button onClick={() => setActiveTab("members")}
                          style={{ padding:"11px 24px",borderRadius:12,border:`1px solid ${T.accent}35`,background:T.accentSoft,color:T.accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                          + New Conversation
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="chat-window">
                      <div className="chat-header">
                        <button className="chat-back" onClick={() => { setActiveDM(null); setActiveDMUser(null); setDmMessages([]); }}>← Back</button>
                        <Avatar src={activeDMUser?.avatar} name={activeDMUser?.name} size={38} />
                        <div>
                          <div className="chat-name">{activeDMUser?.name || "User"}</div>
                          <div className="chat-status">{activeDMUser?.online ? "🟢 Online" : "⚫ Offline"}</div>
                        </div>
                        <div style={{ marginLeft:"auto" }}>
                          <button onClick={() => navigate(`/user/${activeDMUser?.uid}`)}
                            style={{ padding:"6px 12px",borderRadius:9,border:`1px solid ${T.glassBorder}`,background:T.glass,color:T.textSub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                            View Profile
                          </button>
                        </div>
                      </div>
                      <div className="chat-msgs">
                        {dmMessages.length === 0 && (
                          <div style={{ textAlign:"center",color:T.textMuted,fontSize:13,margin:"auto" }}>
                            Start the conversation! 👋
                          </div>
                        )}
                        {dmMessages.map((msg, i) => {
                          const isMe = msg.senderUid === myUid;
                          return (
                            <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start" }}>
                              <div className={`msg-bubble ${isMe?"msg-me":"msg-them"}`}>
                                {msg.text}
                                <div className="msg-time">{timeAgo(msg.createdAt)}</div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="chat-input-row">
                        <textarea className="chat-inp" placeholder="Type a message…"
                          value={dmMsg}
                          onChange={e => setDmMsg(e.target.value)}
                          onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendDM(); } }}
                          rows={1} />
                        <button className="chat-send" onClick={sendDM}>↑</button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div>

              {/* Online now */}
              <div className="side-card">
                <div className="g-title">🟢 Online Now ({onlineMembers.length})</div>
                {onlineMembers.length === 0
                  ? <div style={{ fontSize:12,color:T.textMuted }}>No one online right now</div>
                  : onlineMembers.slice(0,5).map((m, i) => (
                    <div key={m.uid} className="online-row" style={{ cursor:"pointer" }} onClick={() => navigate(`/user/${m.uid}`)}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <Avatar src={m.avatar} name={m.name} size={34} />
                        <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:T.green,border:`2px solid ${T.bg}` }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:T.text }}>{m.name}</div>
                        <div style={{ fontSize:11,color:T.textSub }}>🏋️ {m.workoutToday || "Training"}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); openDMWithUser(m.uid); }}
                        style={{ padding:"4px 10px",borderRadius:8,border:`1px solid ${T.accent}25`,background:T.accentSoft,color:T.accent,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                        DM
                      </button>
                    </div>
                  ))
                }
              </div>

              {/* Your challenges */}
              <div className="side-card">
                <div className="g-title">⚡ Your Challenges</div>
                {challenges.filter(c=>c.joined).length === 0
                  ? <div style={{ fontSize:12,color:T.textMuted,textAlign:"center",padding:"16px 0" }}>No active challenges</div>
                  : challenges.filter(c=>c.joined).map((c,i,arr) => (
                    <div key={c.id} style={{ padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${T.glassBorder}`:"none" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:6 }}>
                        <span style={{ fontSize:18 }}>{c.emoji||"⚡"}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:700,color:T.text }}>{c.title}</div>
                          <div style={{ fontSize:10,color:T.textSub }}>{c.daysLeft} days left</div>
                        </div>
                      </div>
                      <div style={{ height:3,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:99,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${((c.totalDays-(c.daysLeft||0))/Math.max(c.totalDays,1))*100}%`,background:c.color||T.accent,borderRadius:99 }} />
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Top 3 */}
              <div className="side-card">
                <div className="g-title">🏆 This Week's Top</div>
                {leaderboard.slice(0,3).map((l, i) => (
                  <div key={l.uid} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${T.glassBorder}`:"none",cursor:"pointer" }}
                    onClick={() => navigate(`/user/${l.uid}`)}>
                    <span style={{ fontSize:16,width:22 }}>{rankBadge(l.rank)}</span>
                    <Avatar src={l.avatar} name={l.name} size={30} />
                    <span style={{ fontSize:12,fontWeight:600,color:T.text,flex:1 }}>{l.name}</span>
                    <span style={{ fontSize:12,fontWeight:800,color:T.accent }}>{(l.points||0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Suggested */}
              <div className="side-card">
                <div className="g-title">👤 Suggested for You</div>
                {members.filter(m => !myFollowing.includes(m.uid)).slice(0,3).map((m, i, arr) => (
                  <div key={m.uid} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.glassBorder}`:"none" }}>
                    <div style={{ cursor:"pointer" }} onClick={() => navigate(`/user/${m.uid}`)}>
                      <Avatar src={m.avatar} name={m.name} size={34} />
                    </div>
                    <div style={{ flex:1,cursor:"pointer" }} onClick={() => navigate(`/user/${m.uid}`)}>
                      <div style={{ fontSize:12,fontWeight:700,color:T.text }}>{m.name}</div>
                      <div style={{ fontSize:10,color:T.textSub }}>{m.goal?.replace(/_/g," ")||"Fitness"}</div>
                    </div>
                    <button onClick={() => toggleFollow(m.uid)}
                      style={{ padding:"5px 12px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${T.accent},${T.purple})`,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                      +
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}