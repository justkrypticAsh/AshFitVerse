// src/pages/UserProfile.jsx
// Mini Instagram-style public profile page
// Route: /user/:uid
// Shows any user's profile, posts, follow/message options

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import useUser from "../hooks/useUser";
import { generateCSS, FONT } from "../theme";

// ── Firestore imports (uncomment when rules are published) ──────────
import { db, auth } from "../firebase";
import {
  doc, getDoc, collection, query, where,
  orderBy, onSnapshot, updateDoc, arrayUnion,
  arrayRemove, addDoc, serverTimestamp, limit,
} from "firebase/firestore";

// ── Fallback seed data (used when Firestore not ready) ──────────────
const SEED_POSTS = [
  { id:1, text:"Just crushed leg day 🦵 4×8 squats at 120kg. Progressive overload is everything!", type:"workout", likes:[], comments:[], createdAt:{ toDate:()=>new Date(Date.now()-3600000) } },
  { id:2, text:"Meal prep done for the week 🥗 High protein, clean carbs. DM for the recipe!", type:"diet",    likes:[], comments:[], createdAt:{ toDate:()=>new Date(Date.now()-86400000) } },
  { id:3, text:"New PR on bench press today 💪 100kg × 5 reps. 6 months of consistency paying off!", type:"pr",      likes:[], comments:[], createdAt:{ toDate:()=>new Date(Date.now()-172800000) } },
];

const POST_COLORS = {
  workout: { bg:"rgba(79,142,247,0.10)",  border:"rgba(79,142,247,0.25)",  tag:"#4f8ef7",  label:"💪 Workout"  },
  diet:    { bg:"rgba(52,211,153,0.10)",  border:"rgba(52,211,153,0.25)",  tag:"#34d399",  label:"🥗 Nutrition" },
  pr:      { bg:"rgba(167,139,250,0.10)", border:"rgba(167,139,250,0.25)", tag:"#a78bfa",  label:"🏆 New PR"    },
  wellness:{ bg:"rgba(244,114,182,0.10)", border:"rgba(244,114,182,0.25)", tag:"#f472b6",  label:"🧘 Wellness"  },
};

function timeAgo(date) {
  if (!date) return "";
  const d = date?.toDate ? date.toDate() : new Date(date);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)  return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function UserProfile() {
  const navigate  = useNavigate();
  const { uid: profileUid } = useParams();   // whose profile we're viewing
  const { dark, toggleTheme, T } = useTheme();
  const { user: me, isMale, isFemale } = useUser();

  // ── State ────────────────────────────────────────────────────────
  const [mounted,    setMounted]    = useState(false);
  const [profile,    setProfile]    = useState(null);
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [following,  setFollowing]  = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [postCount,  setPostCount]  = useState(0);
  const [activeTab,  setActiveTab]  = useState("posts");
  const [newComment, setNewComment] = useState({});
  const [expandComment, setExpandComment] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [dmSent,     setDmSent]     = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const isOwnProfile = profileUid === auth.currentUser?.uid || !profileUid;
  const targetUid    = profileUid || auth.currentUser?.uid;

  useEffect(() => {
    setMounted(true);
    loadProfile();
  }, [targetUid]);

  // ── Load profile from Firestore ──────────────────────────────────
  const loadProfile = async () => {
    setLoading(true);
    try {
      // 1. Get user doc
      const snap = await getDoc(doc(db, "users", targetUid));
      if (snap.exists()) {
        const data = { uid: snap.id, ...snap.data() };
        setProfile(data);
        setFollowerCount(data.followers?.length || 0);
        setFollowing(data.followers?.includes(auth.currentUser?.uid) || false);
      } else {
        // Fallback: use current user data
        setProfile({ uid: targetUid, ...me, followers:[], following:[] });
      }

      // 2. Load posts (real-time)
      const postsQ = query(
        collection(db, "posts"),
        where("uid", "==", targetUid),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const unsubPosts = onSnapshot(postsQ, snap => {
        const realPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPosts(realPosts.length > 0 ? realPosts : SEED_POSTS);
        setPostCount(snap.docs.length);
        // Track which posts current user liked
        const liked = {};
        snap.docs.forEach(d => {
          liked[d.id] = d.data().likes?.includes(auth.currentUser?.uid);
        });
        setLikedPosts(liked);
      }, () => {
        // Firestore error — use seed data
        setPosts(SEED_POSTS);
        setPostCount(SEED_POSTS.length);
      });

      setLoading(false);
      return () => unsubPosts();
    } catch {
      setProfile({ uid: targetUid, ...me, followers:[], following:[] });
      setPosts(SEED_POSTS);
      setPostCount(SEED_POSTS.length);
      setLoading(false);
    }
  };

  // ── Follow / Unfollow ────────────────────────────────────────────
  const toggleFollow = async () => {
    if (!auth.currentUser || isOwnProfile) return;
    const myUid = auth.currentUser.uid;
    try {
      if (following) {
        await updateDoc(doc(db,"users",targetUid), { followers: arrayRemove(myUid) });
        await updateDoc(doc(db,"users",myUid),     { following: arrayRemove(targetUid) });
        setFollowerCount(c => c - 1);
      } else {
        await updateDoc(doc(db,"users",targetUid), { followers: arrayUnion(myUid) });
        await updateDoc(doc(db,"users",myUid),     { following: arrayUnion(targetUid) });
        setFollowerCount(c => c + 1);
      }
      setFollowing(f => !f);
    } catch (e) {
      console.error("Follow error:", e);
      // Optimistic UI even if Firestore fails
      setFollowing(f => !f);
      setFollowerCount(c => following ? c-1 : c+1);
    }
  };

  // ── Send DM ──────────────────────────────────────────────────────
  const sendDM = async () => {
    if (!auth.currentUser || isOwnProfile) return;
    // Navigate to community messages tab with this user pre-selected
    navigate("/community?dm=" + targetUid);
  };

  // ── Like post ────────────────────────────────────────────────────
  const toggleLike = async (postId) => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;
    const isLiked = likedPosts[postId];
    setLikedPosts(p => ({ ...p, [postId]: !isLiked }));
    setPosts(p => p.map(post => post.id === postId
      ? { ...post, likes: isLiked
          ? (post.likes||[]).filter(u => u !== myUid)
          : [...(post.likes||[]), myUid] }
      : post
    ));
    try {
      await updateDoc(doc(db,"posts",postId), {
        likes: isLiked ? arrayRemove(myUid) : arrayUnion(myUid)
      });
    } catch {}
  };

  // ── Post comment ─────────────────────────────────────────────────
  const submitComment = async (postId) => {
    const text = newComment[postId]?.trim();
    if (!text || !auth.currentUser) return;
    const comment = { uid: auth.currentUser.uid, name: me.name||"Athlete", text, createdAt: new Date() };
    setPosts(p => p.map(post => post.id === postId
      ? { ...post, comments: [...(post.comments||[]), comment] }
      : post
    ));
    setNewComment(n => ({ ...n, [postId]: "" }));
    try {
      await updateDoc(doc(db,"posts",postId), {
        comments: arrayUnion(comment)
      });
    } catch {}
  };

  // ── Share profile ────────────────────────────────────────────────
  const shareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  // ── Derived ─────────────────────────────────────────────────────
  const goalEmojis = { muscle:"💪", fat_loss:"🔥", strength:"🏋️", endurance:"🏃", general:"⚡", wellness:"🧘" };

  const css = generateCSS(T, dark) + `
    .up-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.6s ease;}

    /* ── HEADER ── */
    .up-header{display:flex;align-items:center;justify-content:space-between;
      padding:14px 28px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(255,255,255,0.88)"};
      backdrop-filter:blur(40px);position:sticky;top:0;z-index:50;}
    .up-back{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;
      border:1px solid ${T.glassBorder};background:${T.glass};
      color:${T.text};font-size:14px;font-weight:500;cursor:pointer;
      transition:all 0.15s;font-family:${FONT.body};}
    .up-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .up-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .up-logo span{color:${T.accent};}
    .up-header-right{display:flex;align-items:center;gap:10px;}

    /* ── LAYOUT ── */
    .up-body{max-width:860px;margin:0 auto;padding:32px 20px 60px;}

    /* ── PROFILE CARD ── */
    .up-card{
      background:${dark
        ? "linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        : "linear-gradient(160deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))"};
      border:1px solid ${T.glassBorder};border-radius:28px;
      backdrop-filter:blur(50px) saturate(180%) brightness(1.04);
      box-shadow:
        inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.9)"},
        inset 0 -1px 1px ${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.2)"},
        0 4px 12px rgba(0,0,0,${dark?"0.3":"0.08"}),
        0 20px 60px rgba(0,0,0,${dark?"0.4":"0.1"});
      padding:36px 32px 28px;
      margin-bottom:20px;position:relative;overflow:hidden;
      animation:fadeUp 0.5s ease both;
    }
    .up-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(125deg,rgba(255,255,255,${dark?"0.08":"0.45"}) 0%,transparent 35%),
                 linear-gradient(305deg,rgba(255,255,255,${dark?"0.04":"0.25"}) 0%,transparent 30%);
      pointer-events:none;}
    .up-card-glow{position:absolute;width:300px;height:300px;border-radius:50%;
      top:-100px;right:-80px;filter:blur(80px);opacity:${dark?"0.12":"0.08"};
      background:${T.accent};pointer-events:none;}

    /* Avatar */
    .up-avatar-row{display:flex;align-items:flex-end;gap:20px;margin-bottom:18px;position:relative;z-index:1;}
    .up-avatar{width:96px;height:96px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:38px;font-weight:800;color:#fff;font-family:${FONT.display};
      box-shadow:0 0 0 3px ${T.bg},0 0 0 5px ${T.accent}40,0 8px 28px ${T.accentGlow};}
    .up-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
    .up-online-dot{width:14px;height:14px;border-radius:50%;background:${T.green};
      border:3px solid ${T.bg};position:absolute;bottom:4px;left:74px;}

    /* Info */
    .up-info{flex:1;position:relative;z-index:1;}
    .up-name{font-family:${FONT.display};font-size:24px;font-weight:800;
      color:${T.text};letter-spacing:-0.02em;margin-bottom:3px;}
    .up-handle{font-size:13px;color:${T.textMuted};margin-bottom:10px;}
    .up-bio{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:12px;max-width:500px;}
    .up-tags{display:flex;gap:7px;flex-wrap:wrap;}
    .up-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;
      border-radius:99px;font-size:12px;font-weight:600;
      background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"};
      border:1px solid ${T.glassBorder};color:${T.text};}

    /* Stats row */
    .up-stats{display:flex;gap:28px;padding:18px 0;border-top:1px solid ${T.glassBorder};
      border-bottom:1px solid ${T.glassBorder};margin:20px 0;position:relative;z-index:1;}
    .up-stat{text-align:center;cursor:pointer;}
    .up-stat:hover .up-stat-val{color:${T.accent};}
    .up-stat-val{font-family:${FONT.display};font-size:22px;font-weight:800;
      color:${T.text};letter-spacing:-0.02em;transition:color 0.2s;}
    .up-stat-lbl{font-size:11px;color:${T.textMuted};font-weight:600;
      letter-spacing:0.06em;text-transform:uppercase;margin-top:2px;}

    /* Action buttons */
    .up-actions{display:flex;gap:10px;position:relative;z-index:1;}
    .up-follow-btn{flex:1;height:44px;border-radius:13px;border:none;cursor:pointer;
      font-size:14px;font-weight:700;font-family:${FONT.body};
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);}
    .up-follow-btn.follow{
      background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;
      box-shadow:0 6px 22px ${T.accentGlow},inset 0 1px 0 rgba(255,255,255,0.25);}
    .up-follow-btn.follow:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 10px 32px ${T.accentGlow};}
    .up-follow-btn.following{
      background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub};
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .up-follow-btn.following:hover{border-color:${T.red}40;color:${T.red};}
    .up-msg-btn{height:44px;padding:0 20px;border-radius:13px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.7)"};
      backdrop-filter:blur(20px);
      color:${T.text};font-size:14px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.2s;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.85)"};}
    .up-msg-btn:hover{border-color:${T.accent}40;color:${T.accent};}
    .up-share-btn{width:44px;height:44px;border-radius:13px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"};
      backdrop-filter:blur(20px);
      color:${T.textSub};font-size:16px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      transition:all 0.2s;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .up-share-btn:hover{border-color:${T.accent}40;color:${T.accent};}

    /* Own profile — edit button */
    .up-edit-btn{height:44px;padding:0 24px;border-radius:13px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.7)"};
      backdrop-filter:blur(20px);
      color:${T.text};font-size:14px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.2s;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .up-edit-btn:hover{border-color:${T.accent}40;color:${T.accent};}

    /* ── TABS ── */
    .up-tabs{display:flex;gap:5px;background:${T.glass};border:1px solid ${T.glassBorder};
      border-radius:16px;padding:5px;margin-bottom:20px;backdrop-filter:blur(20px);
      animation:fadeUp 0.5s ease 0.1s both;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.8)"};}
    .up-tab{flex:1;padding:10px;border-radius:11px;border:none;background:transparent;
      color:${T.textSub};font-size:13px;font-weight:600;font-family:${FONT.body};
      cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;}
    .up-tab.active{background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;box-shadow:0 4px 16px ${T.accentGlow};}
    .up-tab-count{font-size:11px;opacity:0.75;}

    /* ── POSTS ── */
    .up-post{
      background:${dark
        ? "linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        : "linear-gradient(160deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))"};
      border:1px solid ${T.glassBorder};border-radius:22px;
      backdrop-filter:blur(50px) saturate(180%);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.85)"},0 4px 20px rgba(0,0,0,${dark?"0.2":"0.06"});
      padding:22px;margin-bottom:14px;transition:all 0.3s;
      animation:fadeUp 0.4s ease both;position:relative;overflow:hidden;}
    .up-post::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(125deg,rgba(255,255,255,${dark?"0.05":"0.4"}) 0%,transparent 30%);
      pointer-events:none;}
    .up-post:hover{border-color:${T.glassBorderHover};transform:translateY(-2px);}
    .up-post > *{position:relative;z-index:1;}

    .up-post-header{display:flex;align-items:center;gap:11px;margin-bottom:14px;}
    .up-post-ava{width:40px;height:40px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:16px;font-weight:800;color:#fff;}
    .up-post-name{font-size:14px;font-weight:700;color:${T.text};}
    .up-post-time{font-size:12px;color:${T.textMuted};margin-top:2px;}
    .up-post-tag{margin-left:auto;padding:4px 12px;border-radius:99px;
      font-size:10px;font-weight:800;letter-spacing:0.05em;}
    .up-post-body{font-size:14px;color:${T.textSub};line-height:1.72;margin-bottom:16px;}

    .up-post-actions{display:flex;gap:8px;padding-top:14px;border-top:1px solid ${T.glassBorder};}
    .up-action{display:flex;align-items:center;gap:6px;padding:7px 14px;
      border-radius:10px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.6)"};
      color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;
      transition:all 0.2s;font-family:${FONT.body};}
    .up-action:hover{border-color:${T.accent}35;color:${T.accent};background:${T.accentSoft};}
    .up-action.liked{color:#f472b6;border-color:rgba(244,114,182,0.3);
      background:rgba(244,114,182,0.08);}

    /* Comments */
    .up-comments{margin-top:14px;padding-top:14px;border-top:1px solid ${T.glassBorder};}
    .up-comment{display:flex;gap:9px;margin-bottom:10px;animation:fadeUp 0.3s ease both;}
    .up-comment-ava{width:28px;height:28px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,${T.purple},${T.accent});
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:800;color:#fff;}
    .up-comment-bubble{background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:12px;padding:8px 12px;flex:1;}
    .up-comment-name{font-size:12px;font-weight:700;color:${T.accent};margin-bottom:2px;}
    .up-comment-text{font-size:13px;color:${T.textSub};line-height:1.5;}
    .up-comment-time{font-size:10px;color:${T.textMuted};margin-top:3px;}
    .up-comment-input-row{display:flex;gap:8px;margin-top:10px;}
    .up-comment-inp{flex:1;background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:10px;padding:8px 12px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.2s;}
    .up-comment-inp:focus{border-color:${T.accent}50;box-shadow:0 0 0 3px ${T.accentGlow};}
    .up-comment-inp::placeholder{color:${T.textMuted};}
    .up-comment-send{width:36px;height:36px;border-radius:9px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
    .up-comment-send:hover{transform:translateY(-2px);box-shadow:0 6px 18px ${T.accentGlow};}

    /* ── EMPTY STATE ── */
    .up-empty{text-align:center;padding:60px 20px;
      color:${T.textMuted};animation:fadeUp 0.4s ease both;}
    .up-empty-ico{font-size:52px;margin-bottom:16px;display:block;opacity:0.5;}
    .up-empty-txt{font-size:15px;font-weight:600;margin-bottom:8px;color:${T.textSub};}
    .up-empty-sub{font-size:13px;}

    /* ── ABOUT TAB ── */
    .up-about-card{background:${dark?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))":"linear-gradient(160deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))"};
      border:1px solid ${T.glassBorder};border-radius:20px;
      backdrop-filter:blur(50px) saturate(180%);
      box-shadow:inset 0 1.5px 1px ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.85)"},0 4px 20px rgba(0,0,0,${dark?"0.2":"0.06"});
      padding:24px;margin-bottom:14px;animation:fadeUp 0.4s ease both;position:relative;overflow:hidden;}
    .up-about-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(125deg,rgba(255,255,255,${dark?"0.05":"0.4"}) 0%,transparent 30%);
      pointer-events:none;}
    .up-about-card > *{position:relative;z-index:1;}
    .up-about-title{font-size:11px;font-weight:700;letter-spacing:0.12em;
      text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}
    .up-about-row{display:flex;align-items:center;gap:12px;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};}
    .up-about-row:last-child{border-bottom:none;}
    .up-about-ico{width:36px;height:36px;border-radius:10px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:16px;}
    .up-about-lbl{font-size:13px;color:${T.textSub};flex:1;}
    .up-about-val{font-size:13px;font-weight:700;color:${T.text};text-align:right;text-transform:capitalize;}

    /* Toast */
    .up-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      padding:12px 24px;border-radius:14px;background:${T.green};
      color:#fff;font-size:13px;font-weight:700;z-index:999;
      animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      box-shadow:0 8px 32px rgba(0,0,0,0.25);}

    /* Loading */
    .up-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${T.bg};}
    .up-spinner{width:36px;height:36px;border:3px solid ${T.glassBorder};
      border-top-color:${T.accent};border-radius:50%;animation:spin 0.8s linear infinite;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @media(max-width:640px){
      .up-body{padding:20px 14px 40px;}
      .up-card{padding:24px 18px 20px;}
      .up-stats{gap:16px;}
      .up-avatar{width:76px;height:76px;font-size:28px;}
      .up-name{font-size:20px;}
    }
  `;

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="up-loading">
          <div className="up-spinner"/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </>
    );
  }

  const p = profile || me;
  const streakDays = p.streak || 0;

  return (
    <>
      <style>{css}</style>
      {shareToast && <div className="up-toast">🔗 Profile link copied!</div>}

      <div className="up-root">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

        {/* Header */}
        <div className="up-header">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="up-back" onClick={() => navigate(-1)}>← Back</button>
            <div className="up-logo">AshFit<span>Verse</span></div>
          </div>
          <div className="up-header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
            </button>
            <div onClick={() => navigate("/profile")}
              style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",cursor:"pointer"}}>
              {me.name?.[0]?.toUpperCase()||"A"}
            </div>
          </div>
        </div>

        <div className="up-body">

          {/* ── PROFILE CARD ── */}
          <div className="up-card">
            <div className="up-card-glow"/>

            <div className="up-avatar-row">
              <div style={{position:"relative"}}>
                <div className="up-avatar">
                  {p.name?.[0]?.toUpperCase()||"A"}
                </div>
                {/* Online dot */}
                <div className="up-online-dot"/>
              </div>
              <div className="up-info">
                <div className="up-name">{p.name||"Athlete"}</div>
                <div className="up-handle">@{p.name?.toLowerCase().replace(/\s/g,"_")||"athlete"} · AshFitVerse</div>
                <div className="up-bio">
                  {goalEmojis[p.goal]||"⚡"} {p.goal?.replace(/_/g," ")||"Fitness"} enthusiast
                  {p.activityLevel ? ` · ${p.activityLevel.replace(/_/g," ")} activity` : ""}
                  {streakDays > 0 ? ` · 🔥 ${streakDays}-day streak` : ""}
                </div>
                <div className="up-tags">
                  {p.goal && <span className="up-tag">{goalEmojis[p.goal]} {p.goal.replace(/_/g," ")}</span>}
                  {p.equipment && <span className="up-tag">🏋️ {p.equipment.replace(/_/g," ")}</span>}
                  {p.sex && <span className="up-tag" style={{color:p.sex==="female"?"#f472b6":T.accent}}>{p.sex==="female"?"♀ Female":"♂ Male"}</span>}
                  {streakDays > 0 && <span className="up-tag" style={{color:"#fb923c"}}>🔥 {streakDays} days</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="up-stats">
              {[
                { val: postCount||posts.length, lbl:"Posts" },
                { val: followerCount,           lbl:"Followers" },
                { val: p.following?.length||0,  lbl:"Following" },
                { val: streakDays > 0 ? `${streakDays}🔥` : "—", lbl:"Streak" },
              ].map((s,i) => (
                <div key={i} className="up-stat">
                  <div className="up-stat-val">{s.val}</div>
                  <div className="up-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="up-actions">
              {isOwnProfile ? (
                <>
                  <button className="up-edit-btn" style={{flex:1}} onClick={() => navigate("/profile")}>✏ Edit Profile</button>
                  <button className="up-share-btn" onClick={shareProfile} title="Share profile">↗</button>
                </>
              ) : (
                <>
                  <button className={`up-follow-btn ${following?"following":"follow"}`} onClick={toggleFollow}>
                    {following ? "✓ Following" : "+ Follow"}
                  </button>
                  <button className="up-msg-btn" onClick={sendDM}>💬 Message</button>
                  <button className="up-share-btn" onClick={shareProfile} title="Share">↗</button>
                </>
              )}
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="up-tabs">
            {[
              { id:"posts",  icon:"📢", label:"Posts",  count: posts.length },
              { id:"about",  icon:"👤", label:"About",  count: null },
            ].map(t => (
              <button key={t.id} className={`up-tab ${activeTab===t.id?"active":""}`}
                onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
                {t.count !== null && <span className="up-tab-count">({t.count})</span>}
              </button>
            ))}
          </div>

          {/* ── POSTS TAB ── */}
          {activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <div className="up-empty">
                  <span className="up-empty-ico">📢</span>
                  <div className="up-empty-txt">No posts yet</div>
                  <div className="up-empty-sub">
                    {isOwnProfile ? "Share your first workout or milestone!" : `${p.name?.split(" ")[0]||"This user"} hasn't posted yet`}
                  </div>
                </div>
              ) : posts.map((post, idx) => {
                const pColor = POST_COLORS[post.type] || POST_COLORS.workout;
                const isLiked = likedPosts[post.id];
                const showComments = expandComment[post.id];
                return (
                  <div key={post.id} className="up-post" style={{animationDelay:`${idx*0.05}s`}}>
                    <div className="up-post-header">
                      <div className="up-post-ava">{p.name?.[0]?.toUpperCase()||"A"}</div>
                      <div>
                        <div className="up-post-name">{p.name||"Athlete"}</div>
                        <div className="up-post-time">{timeAgo(post.createdAt)}</div>
                      </div>
                      <span className="up-post-tag"
                        style={{background:pColor.bg,color:pColor.tag,border:`1px solid ${pColor.border}`}}>
                        {pColor.label}
                      </span>
                    </div>
                    <div className="up-post-body">{post.text}</div>
                    <div className="up-post-actions">
                      <button className={`up-action ${isLiked?"liked":""}`} onClick={() => toggleLike(post.id)}>
                        {isLiked?"❤️":"🤍"} {(post.likes||[]).length}
                      </button>
                      <button className="up-action" onClick={() => setExpandComment(e => ({...e,[post.id]:!e[post.id]}))}>
                        💬 {(post.comments||[]).length}
                      </button>
                      <button className="up-action" onClick={shareProfile}>↗ Share</button>
                    </div>

                    {showComments && (
                      <div className="up-comments">
                        {(post.comments||[]).map((c,ci) => (
                          <div key={ci} className="up-comment" style={{animationDelay:`${ci*0.04}s`}}>
                            <div className="up-comment-ava">{c.name?.[0]?.toUpperCase()||"A"}</div>
                            <div className="up-comment-bubble">
                              <div className="up-comment-name">{c.name||"Athlete"}</div>
                              <div className="up-comment-text">{c.text}</div>
                              <div className="up-comment-time">{timeAgo(c.createdAt)}</div>
                            </div>
                          </div>
                        ))}
                        <div className="up-comment-input-row">
                          <input className="up-comment-inp" placeholder="Add a comment..."
                            value={newComment[post.id]||""} 
                            onChange={e => setNewComment(n => ({...n,[post.id]:e.target.value}))}
                            onKeyDown={e => e.key==="Enter" && submitComment(post.id)} />
                          <button className="up-comment-send" onClick={() => submitComment(post.id)}>↑</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── ABOUT TAB ── */}
          {activeTab === "about" && (
            <>
              <div className="up-about-card">
                <div className="up-about-title">Body Stats</div>
                {[
                  { ico:"⚖️", bg:T.accentSoft,  lbl:"Weight",        val: p.weight ? `${p.weight} kg` : "—" },
                  { ico:"📏", bg:T.purpleSoft,  lbl:"Height",        val: p.height ? `${p.height} cm` : "—" },
                  { ico:"🎂", bg:T.orangeSoft,  lbl:"Age",           val: p.age    ? `${p.age} years`  : "—" },
                  { ico:"🏥", bg:T.greenSoft,   lbl:"Sex",           val: p.sex    || "—" },
                ].map((r,i) => (
                  <div key={i} className="up-about-row">
                    <div className="up-about-ico" style={{background:r.bg}}>{r.ico}</div>
                    <div className="up-about-lbl">{r.lbl}</div>
                    <div className="up-about-val">{r.val}</div>
                  </div>
                ))}
              </div>

              <div className="up-about-card">
                <div className="up-about-title">Training</div>
                {[
                  { ico:"🎯", bg:T.accentSoft,  lbl:"Primary Goal",     val: p.goal?.replace(/_/g," ")          || "—" },
                  { ico:"⚡", bg:T.purpleSoft,  lbl:"Activity Level",   val: p.activityLevel?.replace(/_/g," ") || "—" },
                  { ico:"🏋️", bg:T.orangeSoft,  lbl:"Equipment",        val: p.equipment?.replace(/_/g," ")     || "—" },
                  { ico:"🔥", bg:T.greenSoft,   lbl:"Current Streak",   val: streakDays > 0 ? `${streakDays} days` : "—" },
                ].map((r,i) => (
                  <div key={i} className="up-about-row">
                    <div className="up-about-ico" style={{background:r.bg}}>{r.ico}</div>
                    <div className="up-about-lbl">{r.lbl}</div>
                    <div className="up-about-val">{r.val}</div>
                  </div>
                ))}
              </div>

              {!isOwnProfile && (
                <div style={{display:"flex",gap:10,marginTop:8}}>
                  <button className="up-follow-btn follow" style={{flex:1}} onClick={toggleFollow}>
                    {following ? "✓ Following" : "+ Follow"}
                  </button>
                  <button className="up-msg-btn" onClick={sendDM}>💬 Send Message</button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}