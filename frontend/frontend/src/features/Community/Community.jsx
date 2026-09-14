// src/features/community/Community.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db, auth } from "../../firebase";
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, arrayUnion, arrayRemove,
  where, serverTimestamp, getDoc, setDoc,
} from "firebase/firestore";

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function getConvId(a, b) { return [a, b].sort().join("_"); }

const POST_COLORS = {
  workout:   { bg:"rgba(10,132,255,0.09)",  border:"rgba(10,132,255,0.22)",  tag:"#0a84ff", label:"💪 Workout"  },
  diet:      { bg:"rgba(48,209,88,0.09)",   border:"rgba(48,209,88,0.22)",   tag:"#30d158", label:"🥗 Nutrition" },
  pr:        { bg:"rgba(191,90,242,0.09)",  border:"rgba(191,90,242,0.22)",  tag:"#bf5af2", label:"🏆 New PR"    },
  wellness:  { bg:"rgba(255,55,95,0.09)",   border:"rgba(255,55,95,0.22)",   tag:"#ff375f", label:"🧘 Wellness"  },
  milestone: { bg:"rgba(255,159,10,0.09)",  border:"rgba(255,159,10,0.22)",  tag:"#ff9f0a", label:"🏅 Milestone" },
};

const REPORT_REASONS = [
  "Spam or misleading", "Inappropriate content",
  "Harassment or bullying", "False health info", "Other",
];

// Default challenges seeded by AshFitVerse
const DEFAULT_CHALLENGES = [
  { id:"default_1", title:"30-Day Push-up Challenge", emoji:"💪", color:"#0a84ff", totalDays:30, daysLeft:22, description:"Do at least 50 push-ups every day for 30 days. Track your reps and build upper body strength!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_2", title:"10K Steps Daily",          emoji:"🚶", color:"#30d158", totalDays:14, daysLeft:9,  description:"Walk 10,000 steps every day. Use any step counter app. Consistency beats intensity!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_3", title:"Clean Eating Week",        emoji:"🥗", color:"#bf5af2", totalDays:7,  daysLeft:4,  description:"No junk food, no sugar, no processed meals for 7 days. Home-cooked only!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_4", title:"21-Day Plank Challenge",   emoji:"🧱", color:"#ff9f0a", totalDays:21, daysLeft:18, description:"Hold a plank for at least 60 seconds every day. Build core strength and stability!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_5", title:"5AM Club — 7 Days",        emoji:"🌅", color:"#ffd60a", totalDays:7,  daysLeft:5,  description:"Wake up at 5 AM and complete a 30-min morning routine. Discipline starts at dawn!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_6", title:"3L Water Daily",           emoji:"💧", color:"#5ac8fa", totalDays:14, daysLeft:11, description:"Drink at least 3 litres of water every day. Stay hydrated, stay sharp!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_7", title:"14-Day Yoga Flow",         emoji:"🧘", color:"#ff375f", totalDays:14, daysLeft:10, description:"Complete a 20-minute yoga session every day. Flexibility, balance, and calm!", createdBy:"AshFitVerse", official:true, participants:[] },
  { id:"default_8", title:"30-Day No Sugar",          emoji:"🚫", color:"#bf5af2", totalDays:30, daysLeft:25, description:"Cut out all added sugar for 30 days. Natural fruits are allowed. Reset your cravings!", createdBy:"AshFitVerse", official:true, participants:[] },
];

const CHALLENGE_STORAGE_KEY = "ashfitverse_challenge_progress";
function loadChallengeProgress() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveChallengeProgress(data) {
  localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(data));
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function getChallengeStats(c, progress) {
  const prog = progress[c.id];
  if (!prog?.joinedAt) return { joined:false, daysCompleted:0, daysLeft:c.daysLeft, pct:0 };
  const elapsed = Math.floor((Date.now() - new Date(prog.joinedAt)) / 86400000);
  const daysCompleted = prog.daysCompleted || Math.min(elapsed + 1, c.totalDays);
  const daysLeft = Math.max(0, c.totalDays - daysCompleted);
  const pct = Math.min(100, Math.round((daysCompleted / Math.max(c.totalDays, 1)) * 100));
  return { joined:true, daysCompleted, daysLeft, pct, lastCheckIn:prog.lastCheckIn };
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 40 }) {
  return src
    ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
    : <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#0a84ff,#bf5af2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:800, color:"#fff", flexShrink:0 }}>
        {name?.[0]?.toUpperCase() || "A"}
      </div>;
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dark, toggleTheme, T } = useTheme();
  const { user, hasPlan } = useUser();
  const canWrite = hasPlan("lite");

  // ── All hooks at top ────────────────────────────────────────────────────
  const [mounted,          setMounted]          = useState(false);
  const [activeTab,        setActiveTab]         = useState("feed");
  const [posts,            setPosts]             = useState([]);
  const [postsLoading,     setPostsLoading]      = useState(true);
  const [members,          setMembers]           = useState([]);
  const [firestoreChallenges, setFirestoreChallenges] = useState([]);
  const [convList,         setConvList]          = useState([]);
  const [activeDM,         setActiveDM]          = useState(null);
  const [activeDMUser,     setActiveDMUser]      = useState(null);
  const [dmMessages,       setDmMessages]        = useState([]);
  const [dmMsg,            setDmMsg]             = useState("");
  const [newPost,          setNewPost]           = useState("");
  const [postType,         setPostType]          = useState("workout");
  const [posting,          setPosting]           = useState(false);
  const [searchQ,          setSearchQ]           = useState("");
  const [notifs,           setNotifs]            = useState([]);
  const [showNotifs,       setShowNotifs]        = useState(false);
  const [expandedComments, setExpandedComments]  = useState({});
  const [commentInputs,    setCommentInputs]     = useState({});
  const [postComments,     setPostComments]      = useState({});
  const [shareToast,       setShareToast]        = useState("");
  const [reportModal,      setReportModal]       = useState(null);
  const [reportReason,     setReportReason]      = useState("");
  const [reportSent,       setReportSent]        = useState(false);
  
  // Add challenge modal
  const [showAddChallenge, setShowAddChallenge]  = useState(false);
  const [newChallenge,     setNewChallenge]      = useState({ title:"", emoji:"⚡", color:"#0a84ff", totalDays:30, description:"" });
  const [addingChallenge,  setAddingChallenge]   = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(() => loadChallengeProgress());
  const [challengeJoinToast, setChallengeJoinToast] = useState(null);
  const [activeChallengeDetail, setActiveChallengeDetail] = useState(null);

  const chatEndRef = useRef(null);
  const myUid      = auth.currentUser?.uid;
  const unreadDMs  = convList.reduce((a, c) => a + (c.unread || 0), 0);
  const unreadN    = notifs.filter(n => !n.read).length;

  // Merge default + Firestore challenges, mark joined / activated
  const challenges = [
    ...DEFAULT_CHALLENGES.map(c => {
      const stats = getChallengeStats(c, challengeProgress);
      return { ...c, joined:stats.joined, activated:stats.joined, daysCompleted:stats.daysCompleted, daysLeft:stats.joined?stats.daysLeft:c.daysLeft, progressPct:stats.pct, lastCheckIn:stats.lastCheckIn };
    }),
    ...firestoreChallenges.map(c => {
      const pct = Math.min(100, Math.round(((c.totalDays - (c.daysLeft||0)) / Math.max(c.totalDays, 1)) * 100));
      return { ...c, activated:c.joined, progressPct:pct };
    }),
  ];

  // ── Effects ─────────────────────────────────────────────────────────────

  // Online presence
  useEffect(() => {
    if (!myUid) return;
    setMounted(true);
    const ref = doc(db, "users", myUid);
    const go  = () => setDoc(ref, { online:true,  lastSeen:serverTimestamp() }, { merge:true }).catch(()=>{});
    const off = () => setDoc(ref, { online:false, lastSeen:serverTimestamp() }, { merge:true }).catch(()=>{});
    go();
    const vis = () => document.visibilityState === "hidden" ? off() : go();
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("beforeunload", off);
    const dm = searchParams.get("dm");
    if (dm) { setActiveTab("messages"); openDMWithUser(dm); }
    return () => { off(); document.removeEventListener("visibilitychange", vis); window.removeEventListener("beforeunload", off); };
  }, [myUid]);

  useEffect(() => { setMounted(true); }, []);

  // Posts
  useEffect(() => {
    setPostsLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(40));
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id:d.id, ...d.data(), liked:(d.data().likes||[]).includes(myUid) })));
      setPostsLoading(false);
    }, () => setPostsLoading(false));
  }, [myUid]);

  // Comments for expanded posts
  useEffect(() => {
    const subs = {};
    Object.keys(expandedComments).forEach(pid => {
      if (!expandedComments[pid] || subs[pid]) return;
      const q = query(collection(db, "posts", pid, "comments"), orderBy("createdAt", "asc"));
      subs[pid] = onSnapshot(q, snap => {
        setPostComments(p => ({ ...p, [pid]: snap.docs.map(d => ({ id:d.id, ...d.data() })) }));
      });
    });
    return () => Object.values(subs).forEach(u => u?.());
  }, [expandedComments]);

  // Members — real-time
  useEffect(() => {
    const q = query(collection(db, "users"), limit(60));
    return onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ uid:d.id, ...d.data() })).filter(u => u.uid !== myUid));
    });
  }, [myUid]);

  // Firestore challenges
  useEffect(() => {
    if (!myUid) return;
    return onSnapshot(collection(db, "challenges"), snap => {
      setFirestoreChallenges(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        joined: (d.data().participants || []).includes(myUid),
      })));
    });
  }, [myUid]);

  // DM conversations
  useEffect(() => {
    if (!myUid) return;
    const q = query(collection(db, "conversations"), where("members", "array-contains", myUid));
    return onSnapshot(q, async snap => {
      const convs = await Promise.all(snap.docs.map(async d => {
        const data = d.data();
        const otherUid = (data.members || []).find(u => u !== myUid);
        let otherUser = { uid:otherUid, name:"User", avatar:null, online:false };
        try { const s = await getDoc(doc(db,"users",otherUid)); if(s.exists()) otherUser={uid:otherUid,...s.data()}; } catch {}
        return { convId:d.id, otherUser, lastMsg:data.lastMessage||"", lastAt:data.lastMessageAt, unread:(data.unreadBy||[]).includes(myUid)?1:0 };
      }));
      convs.sort((a,b) => (b.lastAt?.seconds||0) - (a.lastAt?.seconds||0));
      setConvList(convs);
    });
  }, [myUid]);

  // Active DM messages
  useEffect(() => {
    if (!activeDM || !myUid) return;
    setDmMessages([]);
    const q = query(collection(db, "conversations", activeDM, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setDmMessages(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      updateDoc(doc(db, "conversations", activeDM), { unreadBy:arrayRemove(myUid) }).catch(()=>{});
    }, () => {
      onSnapshot(collection(db, "conversations", activeDM, "messages"), snap => {
        setDmMessages(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0)));
      });
    });
    return () => unsub();
  }, [activeDM, myUid]);

  // Notifications
  useEffect(() => {
    if (!myUid) return;
    const q = query(collection(db,"users",myUid,"notifications"), orderBy("createdAt","desc"), limit(20));
    return onSnapshot(q, snap => setNotifs(snap.docs.map(d=>({id:d.id,...d.data()}))), ()=>{});
  }, [myUid]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [dmMessages]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const handlePost = async () => {
    if (!canWrite) { navigate("/pricing"); return; }
    if (!newPost.trim() || !myUid) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid:myUid, name:user.name||"Athlete",
        avatar:user.avatar||auth.currentUser?.photoURL||null,
        content:newPost.trim(), type:postType,
        likes:[], createdAt:serverTimestamp(),
      });
      setNewPost("");
    } catch(e) { console.error(e); }
    setPosting(false);
  };

  const toggleLike = async (postId, isLiked) => {
    if (!myUid) return;
    setPosts(p => p.map(x => x.id===postId ? {
      ...x, liked:!isLiked,
      likes: isLiked ? (x.likes||[]).filter(u=>u!==myUid) : [...(x.likes||[]),myUid],
    } : x));
    try { await updateDoc(doc(db,"posts",postId), { likes:isLiked?arrayRemove(myUid):arrayUnion(myUid) }); }
    catch(e) { console.error(e); }
  };

  const submitComment = async (postId) => {
    if (!canWrite) { navigate("/pricing"); return; }
    const text = (commentInputs[postId]||"").trim();
    if (!text || !myUid) return;
    setCommentInputs(p => ({ ...p, [postId]:"" }));
    try {
      await addDoc(collection(db,"posts",postId,"comments"), {
        uid:myUid, name:user.name||"Athlete",
        avatar:user.avatar||null, text, createdAt:serverTimestamp(),
      });
    } catch(e) { console.error(e); }
  };

  const joinChallenge = async (challenge) => {
    if (!canWrite) { navigate("/pricing"); return; }
    if (!myUid || challenge.activated) return;
    if (challenge.id.startsWith("default_")) {
      const updated = {
        ...challengeProgress,
        [challenge.id]: { joinedAt:todayStr(), daysCompleted:1, lastCheckIn:todayStr() },
      };
      setChallengeProgress(updated);
      saveChallengeProgress(updated);
    } else {
      try {
        await updateDoc(doc(db, "challenges", challenge.id), { participants:arrayUnion(myUid) });
      } catch(e) { console.error(e); return; }
    }
    setChallengeJoinToast({ title:challenge.title, emoji:challenge.emoji||"⚡" });
    setTimeout(() => setChallengeJoinToast(null), 3500);
    setActiveChallengeDetail({ ...challenge, joined:true, activated:true, daysCompleted:1, daysLeft:challenge.totalDays-1, progressPct:Math.round((1/Math.max(challenge.totalDays,1))*100) });
  };

  const checkInChallenge = (challenge) => {
    if (!challenge?.activated) return;
    const today = todayStr();
    if (challenge.id.startsWith("default_")) {
      const prog = challengeProgress[challenge.id] || {};
      if (prog.lastCheckIn === today) return;
      const daysCompleted = Math.min((prog.daysCompleted||0) + 1, challenge.totalDays);
      const updated = { ...challengeProgress, [challenge.id]: { ...prog, daysCompleted, lastCheckIn:today } };
      setChallengeProgress(updated);
      saveChallengeProgress(updated);
      const daysLeft = Math.max(0, challenge.totalDays - daysCompleted);
      setActiveChallengeDetail(p => p ? { ...p, daysCompleted, daysLeft, progressPct:Math.round((daysCompleted/Math.max(challenge.totalDays,1))*100), lastCheckIn:today } : p);
    }
  };

  const openChallengeDetail = (challenge) => {
    if (!challenge.activated) return;
    setActiveChallengeDetail(challenge);
  };

  const addChallenge = async () => {
    if (!canWrite) { navigate("/pricing"); return; }
    if (!newChallenge.title.trim() || !myUid) return;
    setAddingChallenge(true);
    try {
      await addDoc(collection(db, "challenges"), {
        ...newChallenge,
        title: newChallenge.title.trim(),
        description: newChallenge.description.trim(),
        daysLeft: newChallenge.totalDays,
        participants: [myUid],
        createdBy: user.name||"Athlete",
        createdByUid: myUid,
        official: false,
        createdAt: serverTimestamp(),
      });
      setNewChallenge({ title:"", emoji:"⚡", color:"#0a84ff", totalDays:30, description:"" });
      setShowAddChallenge(false);
    } catch(e) { console.error(e); }
    setAddingChallenge(false);
  };

  const openDMWithUser = async (targetUid) => {
    if (!canWrite) { navigate("/pricing"); return; }
    if (!myUid || targetUid === myUid) return;
    const convId = getConvId(myUid, targetUid);
    try {
      const snap = await getDoc(doc(db,"conversations",convId));
      if (!snap.exists()) {
        await setDoc(doc(db,"conversations",convId), {
          members:[myUid,targetUid], lastMessage:"", lastMessageAt:serverTimestamp(), unreadBy:[],
        });
      }
      let other = { uid:targetUid, name:"User", avatar:null, online:false };
      try { const s=await getDoc(doc(db,"users",targetUid)); if(s.exists()) other={uid:targetUid,...s.data()}; } catch {}
      setActiveDMUser(other);
      setActiveDM(convId);
      setActiveTab("messages");
    } catch(e) { console.error(e); }
  };

  const sendDM = async () => {
    if (!dmMsg.trim() || !activeDM || !myUid) return;
    const text = dmMsg.trim();
    setDmMsg("");
    const temp = { id:`temp_${Date.now()}`, text, senderUid:myUid, senderName:user.name||"Athlete", createdAt:{seconds:Date.now()/1000} };
    setDmMessages(p => [...p, temp]);
    try {
      await addDoc(collection(db,"conversations",activeDM,"messages"), {
        text, senderUid:myUid, senderName:user.name||"Athlete",
        senderAvatar:user.avatar||null, createdAt:serverTimestamp(),
      });
      await updateDoc(doc(db,"conversations",activeDM), {
        lastMessage:text, lastMessageAt:serverTimestamp(), unreadBy:arrayUnion(activeDMUser?.uid),
      });
      setDmMessages(p => p.filter(m => m.id !== temp.id));
    } catch(e) { setDmMessages(p => p.filter(m=>m.id!==temp.id)); setDmMsg(text); }
  };

  const handleReport = async () => {
    if (!reportModal || !reportReason || !myUid) return;
    try {
      await addDoc(collection(db,"reports"), { postId:reportModal, reportedBy:myUid, reason:reportReason, createdAt:serverTimestamp() });
      setReportSent(true);
      setTimeout(() => { setReportModal(null); setReportReason(""); setReportSent(false); }, 2000);
    } catch(e) { console.error(e); }
  };

  const markAllRead = () => notifs.filter(n=>!n.read).forEach(n =>
    updateDoc(doc(db,"users",myUid,"notifications",n.id),{read:true}).catch(()=>{})
  );

  const handleShare = (post) => {
    navigator.clipboard?.writeText(`${window.location.origin}/community`);
    setShareToast(post.id);
    setTimeout(() => setShareToast(""), 2000);
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const filteredPosts = posts.filter(p =>
    !searchQ || p.content?.toLowerCase().includes(searchQ.toLowerCase()) || p.name?.toLowerCase().includes(searchQ.toLowerCase())
  );
  const filteredMembers = members.filter(m =>
    !searchQ || m.name?.toLowerCase().includes(searchQ.toLowerCase()) || m.goal?.toLowerCase().includes(searchQ.toLowerCase())
  );
  const filteredChallenges = challenges.filter(c =>
    !searchQ || c.title?.toLowerCase().includes(searchQ.toLowerCase())
  );
  const onlineCount = members.filter(m => m.online).length;

  // ── CSS ──────────────────────────────────────────────────────────────────
  const css = generateCSS(T, dark) + `
    .cm{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.6s ease,background 0.4s;}

    /* ── TOP HEADER ── */
    .cm-hd{
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 28px;
      background:${dark?"rgba(8,8,14,0.92)":"rgba(255,255,255,0.92)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(40px);
      position:sticky;top:0;z-index:40;
    }
    .cm-hd-left{display:flex;align-items:center;gap:14px;}
    .cm-back-btn{
      display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;
      font-family:${FONT.body};transition:all 0.16s;
    }
    .cm-back-btn:hover{color:${T.accent};border-color:${T.accent}40;background:${T.accentSoft};}
    .cm-brand{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .cm-brand span{color:${T.accent};}
    .cm-hd-right{display:flex;align-items:center;gap:8px;}
    .cm-online-pill{
      display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:99px;
      background:${dark?"rgba(48,209,88,0.10)":"rgba(48,209,88,0.08)"};
      border:1px solid rgba(48,209,88,0.22);font-size:11.5px;font-weight:700;color:#30d158;
    }
    .g-dot{width:7px;height:7px;border-radius:50%;background:#30d158;
      box-shadow:0 0 6px #30d158;animation:gpulse 2s ease infinite;}
    @keyframes gpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.8);}}
    .cm-icon-btn{
      width:36px;height:36px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      display:flex;align-items:center;justify-content:center;
      font-size:15px;cursor:pointer;color:${T.textSub};transition:all 0.16s;position:relative;
    }
    .cm-icon-btn:hover{color:${T.accent};border-color:${T.accent}40;background:${T.accentSoft};}
    .cm-ndot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;
      background:${T.red};border:2px solid ${T.bg};}
    .cm-ava-btn{width:36px;height:36px;border-radius:50%;cursor:pointer;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:800;color:#fff;border:2px solid ${T.accent}40;transition:all 0.2s;}
    .cm-ava-btn:hover{transform:scale(1.08);}
    .ttgl{width:50px;height:27px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};cursor:pointer;position:relative;flex-shrink:0;}
    .ttgl-thumb{position:absolute;top:3px;width:21px;height:21px;border-radius:50%;
      background:${T.accent};display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left 0.25s;left:${dark?"26px":"3px"};}

    /* Notif panel */
    .notif-wrap{position:relative;}
    .notif-panel{position:absolute;top:calc(100%+8px);right:0;width:300px;
      background:${dark?"rgba(8,8,14,0.99)":"rgba(255,255,255,0.99)"};
      border:1px solid ${T.glassBorder};border-radius:16px;backdrop-filter:blur(40px);
      z-index:200;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,${dark?"0.45":"0.12"});
      animation:popIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both;}
    @keyframes popIn{from{opacity:0;transform:scale(0.92) translateY(-6px);}to{opacity:1;transform:scale(1) translateY(0);}}
    .notif-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-bottom:1px solid ${T.glassBorder};}
    .notif-clr{font-size:11px;color:${T.accent};font-weight:700;background:none;border:none;cursor:pointer;font-family:${FONT.body};}
    .notif-item{display:flex;align-items:center;gap:9px;padding:10px 15px;border-bottom:1px solid ${T.glassBorder};cursor:pointer;transition:background 0.14s;}
    .notif-item:last-child{border-bottom:none;}
    .notif-item:hover{background:${T.glass};}
    .notif-item.unread{background:${T.accentSoft};}

    /* ── BODY ── */
    .cm-body{max-width:1100px;margin:0 auto;padding:24px 24px 60px;
      display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start;}

    /* ── SEARCH ── */
    .cm-search{
      display:flex;align-items:center;gap:10px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"};
      border:1px solid ${T.glassBorder};border-radius:13px;
      padding:0 15px;height:44px;margin-bottom:18px;transition:border-color 0.2s;
    }
    .cm-search:focus-within{border-color:${T.accent}50;}
    .cm-search input{flex:1;background:none;border:none;outline:none;
      font-size:13.5px;color:${T.text};font-family:${FONT.body};}
    .cm-search input::placeholder{color:${T.textMuted};}

    /* ── TABS ── */
    .cm-tabs{
      display:flex;gap:4px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:14px;
      padding:4px;margin-bottom:20px;
    }
    .cm-tab{flex:1;padding:9px 6px;border-radius:10px;border:none;background:transparent;
      color:${T.textSub};font-size:11.5px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.18s;position:relative;white-space:nowrap;}
    .cm-tab:hover{color:${T.text};}
    .cm-tab.act{
      background:${dark?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.88)"};
      color:${T.text};
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.9)"},
        0 2px 8px rgba(0,0,0,${dark?"0.20":"0.06"});
    }
    .cm-tab-badge{position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;
      background:${T.red};color:#fff;font-size:8px;font-weight:800;
      display:flex;align-items:center;justify-content:center;}

    /* ── GLASS CARD ── */
    .gc{
      background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(44px) saturate(185%);
      box-shadow:
        inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.92)"},
        0 2px 12px rgba(0,0,0,${dark?"0.18":"0.06"});
      padding:18px;margin-bottom:12px;
      position:relative;overflow:hidden;transition:border-color 0.22s;
    }
    .gc::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(125deg,rgba(255,255,255,${dark?"0.07":"0.42"}) 0%,transparent 35%);
      pointer-events:none;}
    .gc>*{position:relative;z-index:1;}
    .gc:hover{border-color:${T.glassBorderHover};}
    .gc-title{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.textMuted};margin-bottom:13px;}

    /* ── COMPOSER ── */
    .composer{
      background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(44px);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.92)"},
        0 2px 12px rgba(0,0,0,${dark?"0.18":"0.05"});
      padding:18px;margin-bottom:12px;position:relative;overflow:hidden;
    }
    .composer::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.06":"0.40"}) 0%,transparent 40%);pointer-events:none;}
    .composer>*{position:relative;z-index:1;}
    .comp-row{display:flex;gap:11px;align-items:flex-start;}
    .comp-inp{flex:1;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:12px;padding:11px 14px;
      color:${T.text};font-size:13.5px;font-family:${FONT.body};outline:none;resize:none;
      min-height:70px;transition:border-color 0.18s;}
    .comp-inp::placeholder{color:${T.textMuted};}
    .comp-inp:focus{border-color:${T.accent}50;}
    .comp-footer{display:flex;align-items:center;justify-content:space-between;margin-top:11px;flex-wrap:wrap;gap:8px;}
    .comp-types{display:flex;gap:5px;flex-wrap:wrap;}
    .comp-type{padding:5px 11px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:transparent;font-size:10.5px;font-weight:700;cursor:pointer;
      font-family:${FONT.body};color:${T.textSub};transition:all 0.16s;}
    .comp-type:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .comp-type.sel{border-color:${T.accent};background:${T.accentSoft};color:${T.accent};}
    .post-btn{padding:9px 22px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:12.5px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px ${T.accentGlow};}
    .post-btn:hover{transform:translateY(-2px);}
    .post-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

    /* ── POST CARD ── */
    .post-card{
      background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(44px);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.92)"},
        0 2px 10px rgba(0,0,0,${dark?"0.16":"0.05"});
      padding:18px;margin-bottom:10px;
      position:relative;overflow:hidden;
      animation:fadeUp 0.42s ease both;transition:all 0.22s;
    }
    .post-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.05":"0.38"}) 0%,transparent 40%);pointer-events:none;}
    .post-card>*{position:relative;z-index:1;}
    .post-card:hover{border-color:${T.glassBorderHover};}
    .post-hd{display:flex;align-items:center;gap:11px;margin-bottom:12px;}
    .post-name{font-size:13.5px;font-weight:700;color:${T.text};cursor:pointer;}
    .post-name:hover{color:${T.accent};}
    .post-time{font-size:10.5px;color:${T.textMuted};margin-top:2px;}
    .post-tag{margin-left:auto;padding:3px 11px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:0.04em;white-space:nowrap;}
    .post-body{font-size:13.5px;color:${T.textSub};line-height:1.72;margin-bottom:14px;word-break:break-word;}
    .post-acts{display:flex;gap:6px;padding-top:11px;border-top:1px solid ${T.glassBorder};flex-wrap:wrap;}
    .act-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:9px;
      border:1px solid ${T.glassBorder};background:transparent;
      color:${T.textSub};font-size:12px;font-weight:600;cursor:pointer;
      font-family:${FONT.body};transition:all 0.16s;}
    .act-btn:hover{border-color:${T.accent}35;color:${T.accent};background:${T.accentSoft};}
    .act-btn.liked{color:#ff375f;border-color:rgba(255,55,95,0.25);background:rgba(255,55,95,0.07);}
    .act-btn.copied{color:${T.green};border-color:${T.greenSoft};background:${T.greenSoft};}
    .act-btn.rep:hover{color:${T.red};border-color:${T.redSoft};background:${T.redSoft};}

    /* Comments */
    .coms{margin-top:12px;padding-top:12px;border-top:1px solid ${T.glassBorder};}
    .com-item{display:flex;gap:8px;margin-bottom:9px;}
    .com-ava{width:26px;height:26px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;}
    .com-bbl{background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:11px;padding:7px 11px;flex:1;}
    .com-name{font-size:11px;font-weight:700;color:${T.text};margin-bottom:1px;}
    .com-text{font-size:12px;color:${T.textSub};line-height:1.5;word-break:break-word;}
    .com-time{font-size:9px;color:${T.textMuted};margin-top:2px;}
    .com-inp-row{display:flex;gap:7px;margin-top:9px;align-items:flex-start;}
    .com-inp{flex:1;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:9px;padding:7px 11px;
      font-size:12px;font-family:${FONT.body};color:${T.text};outline:none;transition:border-color 0.16s;}
    .com-inp::placeholder{color:${T.textMuted};}
    .com-inp:focus{border-color:${T.accent}50;}
    .com-send{padding:7px 13px;border-radius:9px;border:none;background:${T.accent};
      color:#fff;font-size:11.5px;font-weight:700;cursor:pointer;font-family:${FONT.body};flex-shrink:0;}
    .com-send:hover{filter:brightness(1.1);}

    /* ── MEMBERS ── */
    .mem-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
    .mem-card{
      background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(44px);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.92)"};
      padding:16px;transition:all 0.25s;animation:fadeUp 0.42s ease both;
      position:relative;overflow:hidden;
    }
    .mem-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.05":"0.38"}) 0%,transparent 40%);pointer-events:none;}
    .mem-card>*{position:relative;z-index:1;}
    .mem-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .mem-top{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
    .mem-name{font-size:13px;font-weight:700;color:${T.text};cursor:pointer;}
    .mem-name:hover{color:${T.accent};}
    .mem-goal{font-size:10.5px;color:${T.textSub};margin-top:1px;text-transform:capitalize;}
    .mem-online{font-size:10px;font-weight:700;margin-top:3px;}
    .dm-mini{width:100%;padding:8px;border-radius:10px;border:1px solid ${T.glassBorder};
      background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;font-size:11.5px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};transition:all 0.16s;box-shadow:0 3px 12px ${T.accentGlow};}
    .dm-mini:hover{transform:translateY(-2px);}
    .online-dot{position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;
      background:${T.green};border:2px solid ${T.bg};}

    /* ── CHALLENGES ── */
    .ch-card{
      background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(44px);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.92)"};
      padding:18px;margin-bottom:10px;transition:border-color 0.22s;
      animation:fadeUp 0.42s ease both;position:relative;overflow:hidden;
    }
    .ch-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.05":"0.38"}) 0%,transparent 40%);pointer-events:none;}
    .ch-card>*{position:relative;z-index:1;}
    .ch-card:hover{border-color:${T.glassBorderHover};}
    .ch-hd{display:flex;align-items:flex-start;gap:13px;margin-bottom:10px;}
    .ch-emoji{font-size:32px;flex-shrink:0;}
    .ch-title{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .ch-desc{font-size:12px;color:${T.textSub};line-height:1.55;margin-top:4px;}
    .ch-meta{font-size:11.5px;color:${T.textMuted};}
    .ch-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:99px;
      font-size:9.5px;font-weight:800;margin-bottom:4px;}
    .ch-prog{height:5px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};border-radius:99px;overflow:hidden;margin:11px 0;}
    .ch-fill{height:100%;border-radius:99px;}
    .ch-foot{display:flex;align-items:center;justify-content:space-between;}
    .ch-btn{padding:8px 18px;border-radius:10px;font-size:11.5px;font-weight:800;
      font-family:${FONT.body};cursor:pointer;transition:all 0.2s;}
    .ch-btn.joined{border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};}
    .ch-btn.joined:hover{color:${T.red};border-color:${T.redSoft};}
    .ch-btn.join{border:none;color:#fff;}
    .ch-btn.join:hover{transform:translateY(-2px);}
    .add-ch-btn{
      display:flex;align-items:center;justify-content:center;gap:8px;
      width:100%;padding:13px;border-radius:14px;
      border:1.5px dashed ${T.glassBorder};background:transparent;
      color:${T.textSub};font-size:13px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};transition:all 0.2s;margin-bottom:12px;
    }
    .add-ch-btn:hover{border-color:${T.accent}50;color:${T.accent};background:${T.accentSoft};}
    .ch-card.activated{cursor:pointer;}
    .ch-card.activated:hover{border-color:${T.accent}40;transform:translateY(-2px);}
    .ch-btn.activated{border:1px solid ${T.green}40;background:${T.greenSoft};color:${T.green};}
    .ch-btn.activated:hover{border-color:${T.green};background:${T.greenSoft};transform:none;}
    .ch-join-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:${dark?"rgba(8,8,14,0.97)":"rgba(255,255,255,0.97)"};
      border:1px solid ${T.accent}35;border-radius:18px;
      padding:16px 24px;z-index:9999;backdrop-filter:blur(24px);
      box-shadow:0 12px 40px rgba(0,0,0,0.25);
      animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      display:flex;align-items:center;gap:14px;max-width:90vw;}
    .ch-join-toast-emoji{font-size:32px;}
    .ch-join-toast-title{font-size:14px;font-weight:800;color:${T.text};}
    .ch-join-toast-sub{font-size:12px;color:${T.textSub};margin-top:2px;}
    .ch-detail-ov{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
      z-index:9100;display:flex;align-items:center;justify-content:center;padding:20px;}
    .ch-detail-box{width:440px;max-width:92vw;
      background:${dark?"rgba(8,8,14,0.99)":"rgba(255,255,255,0.99)"};
      border:1px solid ${T.glassBorder};border-radius:22px;padding:28px;
      box-shadow:0 24px 64px rgba(0,0,0,${dark?"0.55":"0.18"});
      animation:fadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;}
    .ch-detail-hd{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px;}
    .ch-detail-emoji{font-size:40px;flex-shrink:0;}
    .ch-detail-title{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};margin-bottom:4px;}
    .ch-detail-desc{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:18px;}
    .ch-detail-stat-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px;}
    .ch-detail-stat{background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:12px;padding:12px;text-align:center;}
    .ch-detail-stat-val{font-size:20px;font-weight:800;color:${T.text};}
    .ch-detail-stat-lbl{font-size:10px;color:${T.textMuted};margin-top:3px;text-transform:uppercase;letter-spacing:0.08em;}
    .ch-detail-prog-lbl{display:flex;justify-content:space-between;font-size:11px;color:${T.textSub};margin-bottom:6px;}
    .ch-detail-prog{height:8px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};border-radius:99px;overflow:hidden;margin-bottom:18px;}
    .ch-detail-fill{height:100%;border-radius:99px;transition:width 0.4s ease;}
    .ch-detail-checkin{width:100%;padding:12px;border-radius:12px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};
      box-shadow:0 4px 14px ${T.accentGlow};transition:all 0.2s;margin-bottom:10px;}
    .ch-detail-checkin:hover{transform:translateY(-2px);}
    .ch-detail-checkin.done{background:${T.greenSoft};color:${T.green};border:1px solid ${T.green}40;box-shadow:none;cursor:default;transform:none;}
    .ch-detail-close{width:100%;padding:11px;border-radius:11px;border:1px solid ${T.glassBorder};
      background:transparent;color:${T.textSub};font-size:13px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};}

    /* Add challenge modal */
    .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
      z-index:9000;display:flex;align-items:center;justify-content:center;}
    .modal-box{width:420px;max-width:92vw;
      background:${dark?"rgba(8,8,14,0.99)":"rgba(255,255,255,0.99)"};
      border:1px solid ${T.glassBorder};border-radius:22px;padding:28px;
      box-shadow:0 24px 64px rgba(0,0,0,${dark?"0.55":"0.18"});
      animation:fadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;}
    .modal-title{font-family:${FONT.display};font-size:19px;font-weight:800;color:${T.text};margin-bottom:5px;}
    .modal-sub{font-size:12.5px;color:${T.textSub};margin-bottom:18px;}
    .modal-field{margin-bottom:14px;}
    .modal-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
      color:${T.textMuted};display:block;margin-bottom:6px;}
    .modal-inp{width:100%;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1.5px solid ${T.glassBorder};border-radius:11px;padding:10px 13px;
      font-size:13.5px;font-family:${FONT.body};color:${T.text};outline:none;transition:border-color 0.18s;}
    .modal-inp::placeholder{color:${T.textMuted};}
    .modal-inp:focus{border-color:${T.accent}50;}
    .modal-row{display:grid;grid-template-columns:80px 1fr 80px;gap:10px;}
    .modal-btns{display:flex;gap:10px;margin-top:20px;}
    .modal-cancel{flex:1;padding:11px;border-radius:11px;border:1px solid ${T.glassBorder};
      background:transparent;color:${T.textSub};font-size:13px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};}
    .modal-submit{flex:2;padding:11px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};
      box-shadow:0 4px 14px ${T.accentGlow};transition:all 0.2s;}
    .modal-submit:hover{transform:translateY(-2px);}
    .modal-submit:disabled{opacity:0.4;cursor:not-allowed;transform:none;}

    /* ── MESSAGES ── */
    .dm-row{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:12px;
      cursor:pointer;transition:all 0.16s;margin-bottom:5px;border:1px solid transparent;}
    .dm-row:hover{background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};border-color:${T.glassBorder};}
    .dm-row.act{background:${T.accentSoft};border-color:${T.accent}22;}
    .dm-name{font-size:13px;font-weight:700;color:${T.text};}
    .dm-last{font-size:10.5px;color:${T.textMuted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;margin-top:2px;}
    .dm-unread{width:16px;height:16px;border-radius:50%;background:${T.accent};color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;}
    .dm-online-dot{width:9px;height:9px;border-radius:50%;background:${T.green};border:2px solid ${T.bg};position:absolute;bottom:0;right:0;}
    .chat-win{
      background:${dark?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))":"linear-gradient(160deg,rgba(255,255,255,0.80),rgba(255,255,255,0.50))"};
      border:1px solid ${T.glassBorder};border-radius:18px;backdrop-filter:blur(44px);
      overflow:hidden;animation:fadeUp 0.35s ease both;
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.92)"};}
    .chat-hd{padding:13px 16px;border-bottom:1px solid ${T.glassBorder};
      display:flex;align-items:center;gap:11px;
      background:${dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.5)"};}
    .chat-back{padding:6px 12px;border-radius:8px;border:1px solid ${T.glassBorder};
      background:transparent;color:${T.textSub};font-size:11.5px;font-weight:600;
      cursor:pointer;font-family:${FONT.body};transition:all 0.16s;}
    .chat-back:hover{color:${T.accent};border-color:${T.accent}35;}
    .chat-cname{font-size:13.5px;font-weight:700;color:${T.text};}
    .chat-status{font-size:10.5px;margin-top:1px;}
    .chat-msgs{height:320px;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:9px;}
    .chat-msgs::-webkit-scrollbar{width:2px;}
    .chat-msgs::-webkit-scrollbar-thumb{background:${T.accent}40;border-radius:99px;}
    .bbl{max-width:70%;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word;}
    .bbl-me{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
    .bbl-them{background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)"};color:${T.text};border:1px solid ${T.glassBorder};align-self:flex-start;border-bottom-left-radius:4px;}
    .bbl-time{font-size:9px;opacity:0.55;margin-top:3px;}
    .chat-inp-row{padding:11px 13px;border-top:1px solid ${T.glassBorder};display:flex;gap:8px;align-items:flex-end;}
    .chat-inp{flex:1;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};border:1px solid ${T.glassBorder};border-radius:11px;padding:9px 13px;font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;resize:none;min-height:40px;max-height:90px;transition:border-color 0.16s;}
    .chat-inp:focus{border-color:${T.accent}50;}
    .chat-inp::placeholder{color:${T.textMuted};}
    .chat-send{width:40px;height:40px;border-radius:11px;border:none;background:${T.accent};color:#fff;font-size:17px;cursor:pointer;transition:all 0.2s;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
    .chat-send:hover{transform:translateY(-2px);box-shadow:0 5px 16px ${T.accentGlow};}

    /* ── SIDE CARDS ── */
    .side-card{
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.70)"};
      border:1px solid ${T.glassBorder};border-radius:16px;
      backdrop-filter:blur(40px);
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.9)"};
      padding:16px;margin-bottom:12px;
    }
    .online-row{display:flex;align-items:center;gap:9px;padding:7px 0;
      border-bottom:1px solid ${T.glassBorder};cursor:pointer;transition:all 0.14s;}
    .online-row:last-child{border-bottom:none;}
    .online-row:hover .online-name{color:${T.accent};}
    .online-name{font-size:12.5px;font-weight:600;color:${T.text};flex:1;transition:color 0.14s;}

    /* Report modal */
    .rep-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:9500;display:flex;align-items:center;justify-content:center;}
    .rep-box{width:330px;background:${dark?"rgba(8,8,14,0.99)":"rgba(255,255,255,0.99)"};border:1px solid ${T.glassBorder};border-radius:20px;padding:26px;backdrop-filter:blur(40px);box-shadow:0 24px 64px rgba(0,0,0,${dark?"0.55":"0.18"});animation:fadeUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;}
    .rep-title{font-family:${FONT.display};font-size:17px;font-weight:800;color:${T.text};margin-bottom:5px;}
    .rep-sub{font-size:12.5px;color:${T.textSub};margin-bottom:14px;}
    .rep-opt{width:100%;padding:9px 13px;border-radius:99px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:12.5px;font-weight:600;cursor:pointer;font-family:${FONT.body};text-align:left;transition:all 0.16s;margin-bottom:6px;}
    .rep-opt:hover,.rep-opt.sel{border-color:${T.red}35;color:${T.red};background:${T.redSoft};}
    .rep-btns{display:flex;gap:9px;margin-top:14px;}
    .rep-cancel{flex:1;padding:10px;border-radius:10px;border:1px solid ${T.glassBorder};background:transparent;color:${T.textSub};font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT.body};}
    .rep-submit{flex:1;padding:10px;border-radius:10px;border:none;background:${T.red};color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT.body};}
    .rep-submit:disabled{opacity:0.4;cursor:not-allowed;}
    .rep-ok{text-align:center;padding:8px 0;color:${T.green};font-size:13px;font-weight:700;}

    /* Toast */
    .share-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:${dark?"rgba(8,8,14,0.97)":"rgba(255,255,255,0.97)"};
      border:1px solid ${T.green}30;border-radius:99px;
      padding:9px 20px;font-size:12.5px;font-weight:700;color:${T.green};
      backdrop-filter:blur(24px);z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,0.22);
      animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

    /* Skeleton */
    .sk{background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};border-radius:99px;animation:skp 1.4s ease infinite;}
    @keyframes skp{0%,100%{opacity:1;}50%{opacity:0.4;}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:1050px){.cm-body{grid-template-columns:1fr;}.mem-grid{grid-template-columns:1fr 1fr;}}
    @media(max-width:640px){.cm-body{padding:16px 14px 40px;}.mem-grid{grid-template-columns:1fr;}.cm-hd{padding:12px 16px;}}
  `;

  const TABS = [
    { id:"feed",       label:"Feed",       icon:"📢" },
    { id:"members",    label:"Athletes",   icon:"👥" },
    { id:"challenges", label:"Challenges", icon:"⚡" },
    { id:"messages",   label:"Messages",   icon:"💬" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="cm">
        <div className="orb orb-1"/><div className="orb orb-2"/>
        {shareToast && <div className="share-toast">✓ Link copied!</div>}
        {challengeJoinToast && (
          <div className="ch-join-toast">
            <span className="ch-join-toast-emoji">{challengeJoinToast.emoji}</span>
            <div>
              <div className="ch-join-toast-title">Challenge Activated! 🎉</div>
              <div className="ch-join-toast-sub">You joined "{challengeJoinToast.title}" — let's go!</div>
            </div>
          </div>
        )}

        {/* Challenge progress modal */}
        {activeChallengeDetail && (
          <div className="ch-detail-ov" onClick={() => setActiveChallengeDetail(null)}>
            <div className="ch-detail-box" onClick={e => e.stopPropagation()}>
              <div className="ch-detail-hd">
                <span className="ch-detail-emoji">{activeChallengeDetail.emoji||"⚡"}</span>
                <div>
                  {activeChallengeDetail.official && (
                    <span className="ch-badge" style={{ background:`${activeChallengeDetail.color||T.accent}15`,color:activeChallengeDetail.color||T.accent,border:`1px solid ${activeChallengeDetail.color||T.accent}30` }}>
                      ✦ Official Challenge
                    </span>
                  )}
                  <div className="ch-detail-title">{activeChallengeDetail.title}</div>
                  <div style={{ fontSize:11.5,color:T.textMuted }}>{(activeChallengeDetail.participants||[]).length} athletes joined</div>
                </div>
              </div>
              {activeChallengeDetail.description && <div className="ch-detail-desc">{activeChallengeDetail.description}</div>}
              <div className="ch-detail-stat-row">
                <div className="ch-detail-stat">
                  <div className="ch-detail-stat-val" style={{ color:activeChallengeDetail.color||T.accent }}>{activeChallengeDetail.daysCompleted||1}</div>
                  <div className="ch-detail-stat-lbl">Days Done</div>
                </div>
                <div className="ch-detail-stat">
                  <div className="ch-detail-stat-val">{activeChallengeDetail.daysLeft??0}</div>
                  <div className="ch-detail-stat-lbl">Days Left</div>
                </div>
                <div className="ch-detail-stat">
                  <div className="ch-detail-stat-val">{activeChallengeDetail.progressPct||0}%</div>
                  <div className="ch-detail-stat-lbl">Progress</div>
                </div>
              </div>
              <div className="ch-detail-prog-lbl">
                <span>Your Progress</span>
                <span>{activeChallengeDetail.progressPct||0}% complete</span>
              </div>
              <div className="ch-detail-prog">
                <div className="ch-detail-fill" style={{ width:`${activeChallengeDetail.progressPct||0}%`,background:`linear-gradient(90deg,${activeChallengeDetail.color||T.accent},${activeChallengeDetail.color||T.accent}88)` }}/>
              </div>
              {activeChallengeDetail.activated && activeChallengeDetail.id?.startsWith("default_") && (
                <button
                  className={`ch-detail-checkin ${activeChallengeDetail.lastCheckIn===todayStr()?"done":""}`}
                  onClick={() => checkInChallenge(activeChallengeDetail)}
                  disabled={activeChallengeDetail.lastCheckIn===todayStr()}>
                  {activeChallengeDetail.lastCheckIn===todayStr() ? "✓ Checked in today!" : "✓ Check in for today"}
                </button>
              )}
              <button className="ch-detail-close" onClick={() => setActiveChallengeDetail(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Report modal */}
        {reportModal && (
          <div className="rep-overlay" onClick={() => { setReportModal(null); setReportReason(""); setReportSent(false); }}>
            <div className="rep-box" onClick={e => e.stopPropagation()}>
              {reportSent
                ? <div className="rep-ok">✓ Report submitted. Thank you!</div>
                : <>
                    <div className="rep-title">Report Post</div>
                    <div className="rep-sub">Why are you reporting this?</div>
                    {REPORT_REASONS.map(r => (
                      <button key={r} className={`rep-opt ${reportReason===r?"sel":""}`} onClick={() => setReportReason(r)}>{r}</button>
                    ))}
                    <div className="rep-btns">
                      <button className="rep-cancel" onClick={() => setReportModal(null)}>Cancel</button>
                      <button className="rep-submit" disabled={!reportReason} onClick={handleReport}>Submit</button>
                    </div>
                  </>
              }
            </div>
          </div>
        )}

        {/* Add Challenge modal */}
        {showAddChallenge && (
          <div className="modal-ov" onClick={() => setShowAddChallenge(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Create a Challenge</div>
              <div className="modal-sub">Challenge the community — anyone can join!</div>
              <div className="modal-field">
                <label className="modal-label">Challenge Title</label>
                <input className="modal-inp" placeholder="e.g. 21-Day Morning Workout"
                  value={newChallenge.title} onChange={e => setNewChallenge(p => ({...p,title:e.target.value}))}/>
              </div>
              <div className="modal-field">
                <label className="modal-label">Description</label>
                <textarea className="modal-inp" placeholder="What should participants do every day?"
                  value={newChallenge.description} onChange={e => setNewChallenge(p => ({...p,description:e.target.value}))}
                  rows={3} style={{ minHeight:80,resize:"none" }}/>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Emoji</label>
                  <input className="modal-inp" style={{ textAlign:"center",fontSize:22 }}
                    value={newChallenge.emoji} onChange={e => setNewChallenge(p => ({...p,emoji:e.target.value}))}/>
                </div>
                <div className="modal-field" style={{ gridColumn:"2" }}>
                  <label className="modal-label">Duration (days)</label>
                  <input className="modal-inp" type="number" min={1} max={365}
                    value={newChallenge.totalDays} onChange={e => setNewChallenge(p => ({...p,totalDays:+e.target.value}))}/>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Color</label>
                  <input type="color" value={newChallenge.color}
                    onChange={e => setNewChallenge(p => ({...p,color:e.target.value}))}
                    style={{ width:"100%",height:44,borderRadius:11,border:`1px solid ${T.glassBorder}`,cursor:"pointer",padding:4,background:T.glass }}/>
                </div>
              </div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setShowAddChallenge(false)}>Cancel</button>
                <button className="modal-submit" disabled={!newChallenge.title.trim()||addingChallenge} onClick={addChallenge}>
                  {addingChallenge ? "Creating…" : "Create Challenge →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="cm-hd">
          <div className="cm-hd-left">
            <button className="cm-back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <div className="cm-brand">Fit<span>Verse</span></div>
          </div>
          <div className="cm-hd-right">
            <div className="cm-online-pill">
              <div className="g-dot"/>
              {onlineCount + 1} online
            </div>
            <div className="notif-wrap">
              <div className="cm-icon-btn" onClick={() => setShowNotifs(v=>!v)}>
                🔔{unreadN > 0 && <div className="cm-ndot"/>}
              </div>
              {showNotifs && (
                <div className="notif-panel">
                  <div className="notif-hd">
                    <span style={{ fontSize:13,fontWeight:700,color:T.text }}>Notifications{unreadN>0&&` (${unreadN})`}</span>
                    <button className="notif-clr" onClick={markAllRead}>Mark all read</button>
                  </div>
                  {notifs.length === 0
                    ? <div style={{ padding:"18px",textAlign:"center",fontSize:12.5,color:T.textMuted }}>No notifications</div>
                    : notifs.map(n => (
                      <div key={n.id} className={`notif-item ${!n.read?"unread":""}`}
                        onClick={() => updateDoc(doc(db,"users",myUid,"notifications",n.id),{read:true}).catch(()=>{})}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:T.glass,border:`1px solid ${T.glassBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>
                          {n.fromAvatar ? <img src={n.fromAvatar} alt="" style={{ width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover" }}/> : "🔔"}
                        </div>
                        <div style={{ fontSize:12.5,color:T.text,flex:1,lineHeight:1.4 }}>{n.text}</div>
                        <div style={{ fontSize:10,color:T.textMuted,flexShrink:0 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <button className="ttgl" onClick={toggleTheme}><div className="ttgl-thumb">{dark?"🌙":"☀️"}</div></button>
            <div className="cm-ava-btn" onClick={() => navigate("/profile")}>{user.name?.[0]?.toUpperCase()||"A"}</div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="cm-body">
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Search */}
            <div className="cm-search">
              <span style={{ color:T.textMuted,fontSize:14 }}>🔍</span>
              <input placeholder={
                activeTab==="feed" ? "Search posts…"
                : activeTab==="members" ? "Search athletes…"
                : activeTab==="challenges" ? "Search challenges…"
                : "Search messages…"
              } value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
              {searchQ && <button onClick={() => setSearchQ("")} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14 }}>✕</button>}
            </div>

            {/* Tabs */}
            <div className="cm-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`cm-tab ${activeTab===t.id?"act":""}`}
                  onClick={() => { setActiveTab(t.id); if(t.id!=="messages") setActiveDM(null); }}>
                  {t.icon} {t.label}
                  {t.id==="messages" && unreadDMs>0 && <span className="cm-tab-badge">{unreadDMs}</span>}
                </button>
              ))}
            </div>

            {/* ── FEED ── */}
            {activeTab==="feed" && (
              <>
                <div className="composer">
                  <div className="comp-row">
                    <Avatar src={user.avatar} name={user.name} size={38}/>
                    <textarea className="comp-inp" rows={3}
                      placeholder="Share a workout, milestone, tip or question..."
                      value={newPost} onChange={e => setNewPost(e.target.value)}/>
                  </div>
                  <div className="comp-footer">
                    <div className="comp-types">
                      {[{k:"workout",l:"💪 Workout"},{k:"diet",l:"🥗 Nutrition"},{k:"pr",l:"🏆 PR"},{k:"wellness",l:"🧘 Wellness"},{k:"milestone",l:"🏅 Milestone"}].map(t => (
                        <button key={t.k} className={`comp-type ${postType===t.k?"sel":""}`} onClick={() => setPostType(t.k)}>{t.l}</button>
                      ))}
                    </div>
                    <button className="post-btn" onClick={handlePost} disabled={!newPost.trim()||posting}>
                      {posting ? "Posting…" : "Post →"}
                    </button>
                  </div>
                </div>

                {postsLoading
                  ? [1,2,3].map(i => (
                    <div key={i} className="post-card">
                      <div style={{ display:"flex",gap:11,marginBottom:13 }}>
                        <div className="sk" style={{ width:40,height:40,borderRadius:"50%",flexShrink:0 }}/>
                        <div style={{ flex:1 }}><div className="sk" style={{ height:13,width:"35%",marginBottom:7 }}/><div className="sk" style={{ height:10,width:"20%" }}/></div>
                      </div>
                      <div className="sk" style={{ height:56,marginBottom:13 }}/>
                      <div style={{ display:"flex",gap:7 }}>{[1,2,3].map(j => <div key={j} className="sk" style={{ height:30,width:70,borderRadius:8 }}/>)}</div>
                    </div>
                  ))
                  : filteredPosts.length === 0
                  ? <div style={{ textAlign:"center",padding:"48px 0",color:T.textMuted }}>
                      <div style={{ fontSize:36,marginBottom:10 }}>📢</div>
                      <div style={{ fontSize:14,fontWeight:700,color:T.text }}>No posts yet</div>
                      <div style={{ fontSize:12,marginTop:5 }}>Be the first to share!</div>
                    </div>
                  : filteredPosts.map((p, i) => {
                    const pc = POST_COLORS[p.type]||POST_COLORS.workout;
                    const comOpen = expandedComments[p.id];
                    const commentCount = (postComments[p.id]||[]).length;
                    return (
                      <div key={p.id} className="post-card" style={{ animationDelay:`${i*0.04}s` }}>
                        <div className="post-hd">
                          <Avatar src={p.avatar} name={p.name} size={40}/>
                          <div>
                            <div className="post-name" onClick={() => navigate(`/user/${p.uid}`)}>{p.name||"Athlete"}</div>
                            <div className="post-time">{timeAgo(p.createdAt)}</div>
                          </div>
                          <span className="post-tag" style={{ background:pc.bg,color:pc.tag,border:`1px solid ${pc.border}` }}>{pc.label}</span>
                        </div>
                        <div className="post-body">{p.content}</div>
                        <div className="post-acts">
                          <button className={`act-btn ${p.liked?"liked":""}`} onClick={() => toggleLike(p.id,p.liked)}>
                            {p.liked?"❤️":"🤍"} {(p.likes||[]).length}
                          </button>
                          <button className="act-btn" onClick={() => setExpandedComments(prev => ({...prev,[p.id]:!prev[p.id]}))}>
                            💬 View ({commentCount}) comments
                          </button>
                          {p.uid !== myUid && <button className="act-btn" onClick={() => openDMWithUser(p.uid)}>✉️ DM</button>}
                          <button className={`act-btn ${shareToast===p.id?"copied":""}`} onClick={() => handleShare(p)}>
                            {shareToast===p.id ? "✓ Copied" : "↗ Share"}
                          </button>
                          {p.uid !== myUid && (
                            <button className="act-btn rep" style={{ marginLeft:"auto" }}
                              onClick={() => { setReportModal(p.id); setReportReason(""); setReportSent(false); }}>
                              ⚑
                            </button>
                          )}
                        </div>
                        {comOpen && (
                          <div className="coms">
                            {commentCount === 0 && <div style={{ fontSize:12,color:T.textMuted,marginBottom:9 }}>No comments yet — be first!</div>}
                            {(postComments[p.id]||[]).map(c => (
                              <div key={c.id} className="com-item">
                                <div className="com-ava">{c.name?.[0]?.toUpperCase()||"A"}</div>
                                <div className="com-bbl">
                                  <div className="com-name">{c.name||"Athlete"}</div>
                                  <div className="com-text">{c.text}</div>
                                  <div className="com-time">{timeAgo(c.createdAt)}</div>
                                </div>
                              </div>
                            ))}
                            <div className="com-inp-row">
                              <div className="com-ava">{user.name?.[0]?.toUpperCase()||"A"}</div>
                              <input className="com-inp" placeholder="Write a comment..."
                                value={commentInputs[p.id]||""}
                                onChange={e => setCommentInputs(prev => ({...prev,[p.id]:e.target.value}))}
                                onKeyDown={e => { if(e.key==="Enter") submitComment(p.id); }}/>
                              <button className="com-send" onClick={() => submitComment(p.id)}>↑</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </>
            )}

            {/* ── ATHLETES ── */}
            {activeTab==="members" && (
              <div className="mem-grid">
                {filteredMembers.length===0
                  ? <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:T.textMuted,fontSize:13 }}>No athletes found</div>
                  : filteredMembers.map((m,i) => {
                    return (
                      <div key={m.uid} className="mem-card" style={{ animationDelay:`${i*0.04}s` }}>
                        <div className="mem-top">
                          <div style={{ position:"relative",flexShrink:0 }} onClick={() => navigate(`/user/${m.uid}`)}>
                            <Avatar src={m.avatar} name={m.name} size={44}/>
                            {m.online && <div className="online-dot"/>}
                          </div>
                          <div style={{ flex:1,minWidth:0 }} onClick={() => navigate(`/user/${m.uid}`)}>
                            <div className="mem-name">{m.name||"Athlete"}</div>
                            <div className="mem-goal">{m.goal?.replace(/_/g," ")||"Fitness"}</div>
                            <div className="mem-online" style={{ color:m.online?T.green:T.textMuted }}>
                              {m.online ? "● Online" : "○ Offline"}
                            </div>
                          </div>
                        </div>
                        {m.streak > 0 && (
                          <div style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:9,background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",border:`1px solid ${T.glassBorder}`,marginBottom:10 }}>
                            <span style={{ fontSize:13 }}>🔥</span>
                            <span style={{ fontSize:12.5,fontWeight:700,color:T.orange }}>{m.streak} day streak</span>
                          </div>
                        )}
                        <button className="dm-mini" onClick={e => { e.stopPropagation(); openDMWithUser(m.uid); }}>
                          💬 Send Message
                        </button>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* ── CHALLENGES ── */}
            {activeTab==="challenges" && (
              <>
                <button className="add-ch-btn" onClick={() => setShowAddChallenge(true)}>
                  ＋ Create a Challenge
                </button>
                {filteredChallenges.length===0
                  ? <div style={{ textAlign:"center",padding:"48px 0",color:T.textMuted,fontSize:13 }}>No challenges found</div>
                  : filteredChallenges.map((c,i) => (
                    <div key={c.id}
                      className={`ch-card ${c.activated?"activated":""}`}
                      style={{ animationDelay:`${i*0.06}s` }}
                      onClick={() => c.activated && openChallengeDetail(c)}>
                      <div className="ch-hd">
                        <span className="ch-emoji">{c.emoji||"⚡"}</span>
                        <div style={{ flex:1,minWidth:0 }}>
                          {c.official && (
                            <span className="ch-badge" style={{ background:`${c.color||T.accent}15`,color:c.color||T.accent,border:`1px solid ${c.color||T.accent}30` }}>
                              ✦ AshFitVerse Official
                            </span>
                          )}
                          {!c.official && c.createdBy && (
                            <span className="ch-badge" style={{ background:T.glass,color:T.textMuted,border:`1px solid ${T.glassBorder}` }}>
                              by {c.createdBy}
                            </span>
                          )}
                          <div className="ch-title">{c.title}</div>
                          <div className="ch-meta">
                            {c.activated
                              ? `${c.daysCompleted||1} days done · ${c.daysLeft} days left`
                              : `${c.daysLeft} days left · ${(c.participants||[]).length} joined`}
                          </div>
                          {c.description && <div className="ch-desc">{c.description}</div>}
                          {c.activated && <div style={{ fontSize:10.5,color:T.accent,marginTop:6,fontWeight:700 }}>Tap to view progress →</div>}
                        </div>
                        <button
                          className={`ch-btn ${c.activated?"activated":"join"}`}
                          style={c.activated ? {} : { background:`linear-gradient(135deg,${c.color||T.accent},${c.color||T.accent}bb)` }}
                          onClick={e => { e.stopPropagation(); c.activated ? openChallengeDetail(c) : joinChallenge(c); }}>
                          {c.activated ? "✓ Activated" : "Join →"}
                        </button>
                      </div>
                      <div className="ch-prog">
                        <div className="ch-fill" style={{ width:`${c.progressPct||((c.totalDays-(c.daysLeft||0))/Math.max(c.totalDays,1))*100}%`,background:`linear-gradient(90deg,${c.color||T.accent},${c.color||T.accent}88)` }}/>
                      </div>
                    </div>
                  ))
                }
              </>
            )}

            {/* ── MESSAGES ── */}
            {activeTab==="messages" && (
              !activeDM
                ? <>
                    <div className="gc">
                      <div className="gc-title">Direct Messages</div>
                      {convList.length===0
                        ? <div style={{ textAlign:"center",padding:"18px 0",fontSize:13,color:T.textMuted }}>
                            No conversations yet. Go to Athletes tab to message someone.
                          </div>
                        : convList.map(c => (
                          <div key={c.convId} className={`dm-row ${activeDM===c.convId?"act":""}`}
                            onClick={() => { setActiveDMUser(c.otherUser); setActiveDM(c.convId); }}>
                            <div style={{ position:"relative",flexShrink:0 }}>
                              <Avatar src={c.otherUser.avatar} name={c.otherUser.name} size={42}/>
                              {c.otherUser.online && <div className="dm-online-dot"/>}
                            </div>
                            <div style={{ flex:1,overflow:"hidden" }}>
                              <div className="dm-name">{c.otherUser.name||"User"}</div>
                              <div className="dm-last">{c.lastMsg||"Say hello!"}</div>
                            </div>
                            <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                              <div style={{ fontSize:10,color:T.textMuted }}>{timeAgo(c.lastAt)}</div>
                              {c.unread>0 && <div className="dm-unread">{c.unread}</div>}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <button onClick={() => setActiveTab("members")}
                      style={{ display:"block",margin:"0 auto",padding:"10px 24px",borderRadius:12,border:`1px solid ${T.accent}35`,background:T.accentSoft,color:T.accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                      + Find People to Message
                    </button>
                  </>
                : <div className="chat-win">
                    <div className="chat-hd">
                      <button className="chat-back" onClick={() => { setActiveDM(null); setActiveDMUser(null); setDmMessages([]); }}>← Back</button>
                      <Avatar src={activeDMUser?.avatar} name={activeDMUser?.name} size={36}/>
                      <div>
                        <div className="chat-cname">{activeDMUser?.name||"User"}</div>
                        <div className="chat-status" style={{ color:activeDMUser?.online?T.green:T.textMuted }}>
                          {activeDMUser?.online ? "🟢 Online" : "⚫ Offline"}
                        </div>
                      </div>
                      <button onClick={() => navigate(`/user/${activeDMUser?.uid}`)}
                        style={{ marginLeft:"auto",padding:"5px 11px",borderRadius:8,border:`1px solid ${T.glassBorder}`,background:T.glass,color:T.textSub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT.body }}>
                        Profile
                      </button>
                    </div>
                    <div className="chat-msgs">
                      {dmMessages.length===0 && <div style={{ textAlign:"center",color:T.textMuted,fontSize:13,margin:"auto" }}>Start the conversation! 👋</div>}
                      {dmMessages.map(msg => {
                        const isMe = msg.senderUid === myUid;
                        return (
                          <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start" }}>
                            {!isMe && <div style={{ fontSize:10,color:T.textMuted,marginBottom:3,paddingLeft:4 }}>{msg.senderName}</div>}
                            <div className={`bbl ${isMe?"bbl-me":"bbl-them"}`}>
                              {msg.text}
                              <div className="bbl-time">{timeAgo(msg.createdAt)}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef}/>
                    </div>
                    <div className="chat-inp-row">
                      <textarea className="chat-inp" placeholder="Type a message…" value={dmMsg}
                        onChange={e => setDmMsg(e.target.value)}
                        onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendDM(); } }} rows={1}/>
                      <button className="chat-send" onClick={sendDM}>↑</button>
                    </div>
                  </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR — sticky ── */}
          <div style={{ position:"sticky", top:80 }}>
            {/* Online now */}
            <div className="side-card">
              <div className="gc-title">🟢 Online Now ({onlineCount})</div>
              {members.filter(m=>m.online).length===0
                ? <div style={{ fontSize:12.5,color:T.textMuted }}>No one online right now</div>
                : members.filter(m=>m.online).slice(0,6).map((m) => (
                  <div key={m.uid} className="online-row" onClick={() => navigate(`/user/${m.uid}`)}>
                    <div style={{ position:"relative",flexShrink:0 }}>
                      <Avatar src={m.avatar} name={m.name} size={30}/>
                      <div style={{ position:"absolute",bottom:0,right:0,width:8,height:8,borderRadius:"50%",background:T.green,border:`2px solid ${T.bg}` }}/>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div className="online-name">{m.name}</div>
                      <div style={{ fontSize:10.5,color:T.textSub,textTransform:"capitalize" }}>{m.goal?.replace(/_/g," ")||"Training"}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); openDMWithUser(m.uid); }}
                      style={{ padding:"4px 9px",borderRadius:7,border:`1px solid ${T.accent}25`,background:T.accentSoft,color:T.accent,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:FONT.body,flexShrink:0 }}>
                      DM
                    </button>
                  </div>
                ))
              }
            </div>

            {/* Active challenges */}
            {challenges.filter(c=>c.activated).length > 0 && (
              <div className="side-card">
                <div className="gc-title">⚡ Your Challenges</div>
                {challenges.filter(c=>c.activated).map((c,i,arr) => (
                  <div key={c.id} style={{ padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.glassBorder}`:"none",cursor:"pointer" }}
                    onClick={() => openChallengeDetail(c)}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                      <span style={{ fontSize:15 }}>{c.emoji||"⚡"}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.title}</div>
                        <div style={{ fontSize:10,color:T.textSub }}>{c.daysCompleted||1}d done · {c.daysLeft}d left</div>
                      </div>
                      <span style={{ fontSize:10,fontWeight:700,color:T.green }}>✓</span>
                    </div>
                    <div style={{ height:3,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:99,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${c.progressPct||0}%`,background:c.color||T.accent,borderRadius:99 }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}