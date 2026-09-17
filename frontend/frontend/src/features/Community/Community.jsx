// src/features/community/Community.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import AthleteProfileModal from "../../components/AthleteProfileModal";
import EditAthleteModal from "../../components/EditAthleteModal";
import PostCreatorModal from "../../components/PostCreatorModal";
import ArticleReaderModal from "../../components/ArticleReaderModal";
import {
  DEFAULT_CHALLENGES,
  CHALLENGE_STORAGE_KEY,
  loadChallengeProgress,
  saveChallengeProgress,
  todayStr,
  getChallengeStats,
} from "../../config/challengesConfig";
import { recordDailyActivity } from "../../lib/userLogs";
import {
  Activity, Users, Trophy, MessageSquare, Plus, Search,
  Image as ImageIcon, Video, BookOpen, Award, Moon, Sun,
  Heart, Share2, MoreHorizontal, Check, X, Shield, ArrowLeft,
  Send, Filter, Sparkles, MessageCircle, Flame, Dumbbell,
  Zap, Star, TrendingUp
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "just now";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function getConvId(a, b) {
  return [String(a), String(b)].sort().join("_");
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getPostColors(isDark) {
  return {
    workout: {
      bg: isDark ? "rgba(10,132,255,0.12)" : "#eff6ff",
      border: isDark ? "rgba(10,132,255,0.30)" : "#bfdbfe",
      tag: isDark ? "#38bdf8" : "#1d4ed8",
      label: "Workout",
    },
    diet: {
      bg: isDark ? "rgba(48,209,88,0.12)" : "#ecfdf5",
      border: isDark ? "rgba(48,209,88,0.30)" : "#a7f3d0",
      tag: isDark ? "#4ade80" : "#047857",
      label: "Nutrition",
    },
    pr: {
      bg: isDark ? "rgba(191,90,242,0.12)" : "#faf5ff",
      border: isDark ? "rgba(191,90,242,0.30)" : "#ddd6fe",
      tag: isDark ? "#c084fc" : "#6d28d9",
      label: "Personal Record",
    },
    wellness: {
      bg: isDark ? "rgba(255,55,95,0.12)" : "#fff1f2",
      border: isDark ? "rgba(255,55,95,0.30)" : "#fecdd3",
      tag: isDark ? "#fb7185" : "#be123c",
      label: "Wellness",
    },
    milestone: {
      bg: isDark ? "rgba(255,159,10,0.12)" : "#fffbeb",
      border: isDark ? "rgba(255,159,10,0.30)" : "#fde68a",
      tag: isDark ? "#fbbf24" : "#b45309",
      label: "Milestone",
    },
    discussion: {
      bg: isDark ? "rgba(56,189,248,0.12)" : "#f0f9ff",
      border: isDark ? "rgba(56,189,248,0.30)" : "#bae6fd",
      tag: isDark ? "#38bdf8" : "#0369a1",
      label: "Discussion",
    },
  };
}

const POST_COLORS = getPostColors(true);

function getFormatBadges(isDark) {
  return {
    photo: { label: "Photo Post", color: isDark ? "#38bdf8" : "#0369a1", bg: isDark ? "rgba(56,189,248,0.14)" : "#f0f9ff", border: isDark ? "rgba(56,189,248,0.35)" : "#bae6fd" },
    video: { label: "Video Clip", color: isDark ? "#c084fc" : "#6d28d9", bg: isDark ? "rgba(168,85,247,0.14)" : "#faf5ff", border: isDark ? "rgba(168,85,247,0.35)" : "#ddd6fe" },
    blog: { label: "Article & Story", color: isDark ? "#fbbf24" : "#b45309", bg: isDark ? "rgba(245,158,11,0.14)" : "#fffbeb", border: isDark ? "rgba(245,158,11,0.35)" : "#fde68a" },
    pr: { label: "Personal Record", color: isDark ? "#f472b6" : "#be185d", bg: isDark ? "rgba(236,72,153,0.14)" : "#fdf2f8", border: isDark ? "rgba(236,72,153,0.35)" : "#fbcfe8" },
    quick: { label: "Update", color: isDark ? "#22d3ee" : "#0e7490", bg: isDark ? "rgba(6,182,212,0.14)" : "#ecfeff", border: isDark ? "rgba(6,182,212,0.35)" : "#a5f3fc" },
  };
}

function getPostFormatInfo(post, isDark = true) {
  const badges = getFormatBadges(isDark);
  if (!post) return badges.quick;
  if (post.mediaType === "blog" || post.blogTitle) return badges.blog;
  if (post.mediaType === "video" || post.videoUrl) return badges.video;
  if (post.mediaType === "image" || (post.mediaUrl && post.mediaType !== "video" && post.mediaType !== "blog")) return badges.photo;
  if (post.type === "pr" || post.category === "pr") return badges.pr;
  return badges.quick;
}

function getChallengeAccent(color, isDark = true) {
  if (!color) return isDark ? "#3b82f6" : "#2563eb";
  if (!isDark) {
    if (color === "#ffd60a" || color === "#ffd700") return "#d97706";
    if (color === "#5ac8fa") return "#0284c7";
    if (color === "#30d158") return "#059669";
    if (color === "#bf5af2") return "#7c3aed";
    if (color === "#ff9f0a") return "#ea580c";
    if (color === "#0a84ff") return "#2563eb";
  }
  return color;
}

function compressImage(file, maxWidth = 960, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image compress error"));
    };
    reader.onerror = () => reject(new Error("File read error"));
  });
}

const REPORT_REASONS = [
  "Spam or promotion",
  "Inappropriate content",
  "Harassment or bullying",
  "False health info",
  "Other",
];

// ── Avatar Component ────────────────────────────────────────────────────────
function Avatar({ src, name, size = 40, onClick }) {
  return src ? (
    <img
      src={src}
      alt={name}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
        border: "1.5px solid rgba(255,255,255,0.12)",
      }}
    />
  ) : (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#0a84ff,#bf5af2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
        border: "1.5px solid rgba(255,255,255,0.12)",
      }}
    >
      {name?.[0]?.toUpperCase() || "A"}
    </div>
  );
}

// ── Main Community Component ────────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dark, toggleTheme, T } = useTheme();
  const { user, updateUser } = useUser();
  const postColors = useMemo(() => getPostColors(dark), [dark]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "feed");
  const [feedFilter, setFeedFilter] = useState("all"); // "all" | "visuals" | "blogs"
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [firestoreChallenges, setFirestoreChallenges] = useState([]);

  // Direct Messaging State
  const [convList, setConvList] = useState([]);
  const [activeDM, setActiveDM] = useState(null);
  const [activeDMUser, setActiveDMUser] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmMsg, setDmMsg] = useState("");

  // Post & Modals State
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [creatorFormat, setCreatorFormat] = useState("photo");
  const [creatorCategory, setCreatorCategory] = useState("workout");
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({});
  const [shareToast, setShareToast] = useState("");
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  // Active Rich Inline Composer State
  const [inlineFormat, setInlineFormat] = useState("photo"); // "photo" | "video" | "blog" | "pr" | "quick"
  const [inlineCategory, setInlineCategory] = useState("workout");
  const [inlineCaption, setInlineCaption] = useState("");
  const [inlineMediaUrl, setInlineMediaUrl] = useState("");
  const [inlineImagePreview, setInlineImagePreview] = useState("");
  const [inlineVideoUrl, setInlineVideoUrl] = useState("");
  const [inlineBlogTitle, setInlineBlogTitle] = useState("");
  const [inlinePrExercise, setInlinePrExercise] = useState("");
  const [inlinePrWeight, setInlinePrWeight] = useState("");
  const [inlinePosting, setInlinePosting] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const inlineFileInputRef = useRef(null);

  // Challenges State
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: "", emoji: "⚡", color: "#0a84ff", totalDays: 30, description: "" });
  const [addingChallenge, setAddingChallenge] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(() => loadChallengeProgress());
  const [challengeJoinToast, setChallengeJoinToast] = useState(null);
  const [activeChallengeDetail, setActiveChallengeDetail] = useState(null);

  const chatEndRef = useRef(null);
  const myUid = auth.currentUser?.uid || user?.uid || (typeof localStorage !== "undefined" ? localStorage.getItem("ashfitverse_uid") : "guest_athlete");
  const unreadDMs = convList.reduce((a, c) => a + (c.unread || 0), 0);
  const unreadN = notifs.filter((n) => !n.read).length;

  // Challenges list
  const challenges = useMemo(() => [
    ...DEFAULT_CHALLENGES.map((c) => {
      const stats = getChallengeStats(c, challengeProgress);
      return {
        ...c,
        joined: stats.joined,
        activated: stats.joined,
        daysCompleted: stats.daysCompleted,
        daysLeft: stats.joined ? stats.daysLeft : c.daysLeft,
        progressPct: stats.pct,
        lastCheckIn: stats.lastCheckIn,
      };
    }),
    ...firestoreChallenges.map((c) => {
      const pct = Math.min(100, Math.round(((c.totalDays - (c.daysLeft || 0)) / Math.max(c.totalDays, 1)) * 100));
      return { ...c, activated: c.joined, progressPct: pct };
    }),
  ], [challengeProgress, firestoreChallenges]);

  // Online presence & check dm query param
  useEffect(() => {
    setMounted(true);
    if (!myUid || myUid.startsWith("guest_")) return;
    const ref = doc(db, "users", myUid);
    const go = () => setDoc(ref, { online: true, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    const off = () => setDoc(ref, { online: false, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    go();
    const vis = () => (document.visibilityState === "hidden" ? off() : go());
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("beforeunload", off);

    const tabParam = searchParams.get("tab");
    if (tabParam && ["feed", "explore", "challenges", "messages", "leaderboard", "members"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const targetDm = searchParams.get("dm");
    if (targetDm) {
      setActiveTab("messages");
      openDMWithUser(targetDm);
    }

    return () => {
      off();
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("beforeunload", off);
    };
  }, [myUid, searchParams]);

  // Subscribe to Posts
  useEffect(() => {
    setPostsLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(60));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            liked: (d.data().likes || []).includes(myUid),
          }))
        );
        setPostsLoading(false);
      },
      (err) => {
        console.warn("Posts fetch warning:", err);
        setPostsLoading(false);
      }
    );
    return () => unsub();
  }, [myUid]);

  // Comments for expanded posts
  useEffect(() => {
    const subs = {};
    Object.keys(expandedComments).forEach((pid) => {
      if (!expandedComments[pid] || subs[pid]) return;
      const q = query(collection(db, "posts", pid, "comments"), orderBy("createdAt", "asc"));
      subs[pid] = onSnapshot(
        q,
        (snap) => {
          setPostComments((p) => ({
            ...p,
            [pid]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          }));
        },
        () => {}
      );
    });
    return () => Object.values(subs).forEach((u) => u?.());
  }, [expandedComments]);

  // Members list
  useEffect(() => {
    const q = query(collection(db, "users"), limit(60));
    return onSnapshot(
      q,
      (snap) => {
        setMembers(
          snap.docs
            .map((d) => ({ uid: d.id, ...d.data() }))
            .filter((u) => u.uid !== myUid)
        );
      },
      () => {}
    );
  }, [myUid]);

  // Firestore Challenges
  useEffect(() => {
    if (!myUid) return;
    return onSnapshot(
      collection(db, "challenges"),
      (snap) => {
        setFirestoreChallenges(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            joined: (d.data().participants || []).includes(myUid),
          }))
        );
      },
      () => {}
    );
  }, [myUid]);

  // DM Conversations Listener
  useEffect(() => {
    if (!myUid || myUid.startsWith("guest_")) return;
    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", myUid)
    );
    return onSnapshot(
      q,
      async (snap) => {
        try {
          const convs = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data() || {};
              const membersArr = Array.isArray(data.members) ? data.members : [];
              const otherUid = membersArr.find((u) => u !== myUid);
              let otherUser = { uid: otherUid, name: "Athlete", avatar: null, online: false };
              if (otherUid) {
                try {
                  const s = await getDoc(doc(db, "users", otherUid));
                  if (s.exists()) otherUser = { uid: otherUid, ...s.data() };
                } catch {}
              }
              return {
                convId: d.id,
                otherUser,
                lastMsg: data.lastMessage || "",
                lastAt: data.lastMessageAt,
                unread: (data.unreadBy || []).includes(myUid) ? 1 : 0,
              };
            })
          );
          convs.sort((a, b) => (b.lastAt?.seconds || 0) - (a.lastAt?.seconds || 0));
          setConvList(convs);
        } catch (e) {
          console.warn("Conversation parse error:", e);
        }
      },
      (err) => {
        console.warn("Conv subscription error:", err);
      }
    );
  }, [myUid]);

  // Active DM Messages Listener
  useEffect(() => {
    if (!activeDM || !myUid) return;
    setDmMessages([]);

    // Load local cached messages if any
    try {
      const cached = localStorage.getItem(`ashfitverse_chat_${activeDM}`);
      if (cached) setDmMessages(JSON.parse(cached));
    } catch {}

    const q = query(
      collection(db, "conversations", activeDM, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDmMessages(msgs);
        try {
          localStorage.setItem(`ashfitverse_chat_${activeDM}`, JSON.stringify(msgs));
        } catch {}
        updateDoc(doc(db, "conversations", activeDM), { unreadBy: arrayRemove(myUid) }).catch(() => {});
      },
      () => {}
    );
    return () => unsub();
  }, [activeDM, myUid]);

  // Notifications
  useEffect(() => {
    if (!myUid || myUid.startsWith("guest_")) return;
    const q = query(collection(db, "users", myUid, "notifications"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snap) => setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
  }, [myUid]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages]);

  // ── Open DM Handler (Fully bug-fixed & paywall removed) ─────────────────────
  const openDMWithUser = async (targetUid) => {
    if (!targetUid || targetUid === myUid) return;
    const convId = getConvId(myUid, targetUid);

    let other = members.find((m) => m.uid === targetUid) || {
      uid: targetUid,
      name: "Athlete",
      avatar: null,
      online: false,
    };

    try {
      const s = await getDoc(doc(db, "users", targetUid));
      if (s.exists()) other = { uid: targetUid, ...s.data() };
    } catch {}

    setActiveDMUser(other);
    setActiveDM(convId);
    setActiveTab("messages");
    setSearchParams({ tab: "messages", dm: targetUid });

    try {
      const convRef = doc(db, "conversations", convId);
      const snap = await getDoc(convRef);
      if (!snap.exists()) {
        await setDoc(convRef, {
          members: [myUid, targetUid],
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          unreadBy: [],
        });
      }
    } catch (err) {
      console.warn("Conv set error:", err);
    }
  };

  // ── Send DM Handler ────────────────────────────────────────────────────────
  const sendDM = async () => {
    if (!dmMsg.trim() || !activeDM || !myUid) return;
    const text = dmMsg.trim();
    setDmMsg("");

    const temp = {
      id: `temp_${Date.now()}`,
      text,
      senderUid: myUid,
      senderName: user.name || "Athlete",
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    setDmMessages((p) => [...p, temp]);

    try {
      await addDoc(collection(db, "conversations", activeDM, "messages"), {
        text,
        senderUid: myUid,
        senderName: user.name || "Athlete",
        senderAvatar: user.avatar || null,
        createdAt: serverTimestamp(),
      });

      const updates = {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      };
      if (activeDMUser?.uid) {
        updates.unreadBy = arrayUnion(activeDMUser.uid);
      }
      await updateDoc(doc(db, "conversations", activeDM), updates).catch(() => {});
    } catch (e) {
      console.warn("Send DM error, cached locally:", e);
    }
  };

  // ── Like Post Handler ──────────────────────────────────────────────────────
  const toggleLike = async (postId, isLiked) => {
    if (!myUid) return;
    setPosts((p) =>
      p.map((x) =>
        x.id === postId
          ? {
              ...x,
              liked: !isLiked,
              likes: isLiked ? (x.likes || []).filter((u) => u !== myUid) : [...(x.likes || []), myUid],
            }
          : x
      )
    );
    try {
      await updateDoc(doc(db, "posts", postId), {
        likes: isLiked ? arrayRemove(myUid) : arrayUnion(myUid),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Submit Comment Handler ─────────────────────────────────────────────────
  const submitComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text || !myUid) return;
    setCommentInputs((p) => ({ ...p, [postId]: "" }));
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        uid: myUid,
        name: user.name || "Athlete",
        username: user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, "_") : "athlete"),
        avatar: user.avatar || null,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Join Challenge Handler ─────────────────────────────────────────────────
  const joinChallenge = async (challenge) => {
    if (!myUid || challenge.activated) return;
    if (challenge.id.startsWith("default_")) {
      const updated = {
        ...challengeProgress,
        [challenge.id]: { joinedAt: todayStr(), daysCompleted: 1, lastCheckIn: todayStr() },
      };
      setChallengeProgress(updated);
      saveChallengeProgress(updated);
      recordDailyActivity(myUid, "challenge_join", { challengeId: challenge.id, challengeTitle: challenge.title });
    } else {
      try {
        await updateDoc(doc(db, "challenges", challenge.id), { participants: arrayUnion(myUid) });
        recordDailyActivity(myUid, "challenge_join", { challengeId: challenge.id, challengeTitle: challenge.title });
      } catch (e) {
        console.error(e);
        return;
      }
    }
    setChallengeJoinToast({ title: challenge.title, emoji: challenge.emoji || "⚡" });
    setTimeout(() => setChallengeJoinToast(null), 3500);
    setActiveChallengeDetail({
      ...challenge,
      joined: true,
      activated: true,
      daysCompleted: 1,
      daysLeft: challenge.totalDays - 1,
      progressPct: Math.round((1 / Math.max(challenge.totalDays, 1)) * 100),
    });
  };

  const checkInChallenge = (challenge) => {
    if (!challenge) return;
    const today = todayStr();
    if (challenge.id?.startsWith("default_")) {
      const prog = challengeProgress[challenge.id] || {};
      if (prog.lastCheckIn === today) return;
      const daysCompleted = Math.min((prog.daysCompleted || 0) + 1, challenge.totalDays);
      const updated = {
        ...challengeProgress,
        [challenge.id]: {
          ...prog,
          joinedAt: prog.joinedAt || today,
          daysCompleted,
          lastCheckIn: today,
          streak: (prog.streak || daysCompleted - 1) + 1,
        },
      };
      setChallengeProgress(updated);
      saveChallengeProgress(updated);
      recordDailyActivity(myUid, "challenge_checkin", { challengeId: challenge.id, challengeTitle: challenge.title });
      const daysLeft = Math.max(0, challenge.totalDays - daysCompleted);
      const progressPct = Math.round((daysCompleted / Math.max(challenge.totalDays, 1)) * 100);
      setActiveChallengeDetail((p) =>
        p ? { ...p, daysCompleted, daysLeft, progressPct, lastCheckIn: today } : p
      );
    }
  };

  const openChallengeDetail = (challenge) => {
    if (!challenge) return;
    const stats = getChallengeStats(challenge, challengeProgress);
    setActiveChallengeDetail({
      ...challenge,
      ...stats,
      activated: stats.joined,
      joined: stats.joined,
      daysCompleted: stats.daysCompleted || 1,
      daysLeft: stats.daysLeft,
      progressPct: stats.pct,
      lastCheckIn: stats.lastCheckIn,
    });
  };

  // Handle ?challenge= url parameter (e.g. from Dashboard or direct links)
  useEffect(() => {
    const chParam = searchParams.get("challenge");
    if (chParam) {
      setActiveTab("challenges");
      const found = challenges.find((c) => c.id === chParam) || DEFAULT_CHALLENGES.find((c) => c.id === chParam);
      if (found) {
        openChallengeDetail(found);
      }
    }
  }, [searchParams, challenges, challengeProgress]);

  const handleShare = (post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/community`);
    }
    setShareToast(post.id);
    setTimeout(() => setShareToast(""), 2000);
  };

  const handleReport = async () => {
    if (!reportModal || !reportReason || !myUid) return;
    try {
      await addDoc(collection(db, "reports"), {
        postId: reportModal,
        reportedBy: myUid,
        reason: reportReason,
        createdAt: serverTimestamp(),
      });
      setReportSent(true);
      setTimeout(() => {
        setReportModal(null);
        setReportReason("");
        setReportSent(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle local image file for inline composer
  const handleInlineImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInlineUploading(true);
    try {
      const compressed = await compressImage(file);
      setInlineImagePreview(compressed);
      setInlineMediaUrl(compressed);
    } catch (err) {
      console.error("Inline image error:", err);
      alert("Failed to load image. Please select a smaller photo or enter URL.");
    } finally {
      setInlineUploading(false);
    }
  };

  // Submit post directly from inline composer
  const handleInlineSubmit = async () => {
    if (
      !inlineCaption.trim() &&
      !inlineMediaUrl &&
      !inlineImagePreview &&
      !inlineVideoUrl &&
      !inlineBlogTitle.trim() &&
      !inlinePrExercise.trim()
    ) {
      alert("Please write something or attach a photo/video before publishing.");
      return;
    }

    setInlinePosting(true);
    const effectiveUid = myUid || auth.currentUser?.uid || "guest_athlete";
    const authorName = user.name || auth.currentUser?.displayName || "Athlete";
    const authorAvatar = user.avatar || auth.currentUser?.photoURL || null;

    let finalMediaType = null;
    let finalMediaUrl = null;

    if (inlineFormat === "photo" && (inlineImagePreview || inlineMediaUrl)) {
      finalMediaType = "image";
      finalMediaUrl = inlineImagePreview || inlineMediaUrl;
    } else if (inlineFormat === "video" && inlineVideoUrl) {
      finalMediaType = "video";
      finalMediaUrl = inlineVideoUrl;
    } else if (inlineFormat === "blog") {
      finalMediaType = "blog";
      finalMediaUrl = inlineMediaUrl || null;
    }

    let finalContent = inlineCaption.trim();
    if (inlineFormat === "pr" && inlinePrExercise.trim()) {
      const prHeader = `🔥 NEW PERSONAL RECORD!\n🏋️ Exercise: ${inlinePrExercise.trim()}\n⚡ Stat/Lift: ${inlinePrWeight.trim() || "Milestone Hit"}\n\n`;
      finalContent = prHeader + (finalContent ? finalContent : "Smashing goals and setting the bar higher! 🏆💪");
    }

    const wordCount = finalContent.split(/\s+/).filter(Boolean).length;
    const readTime = inlineFormat === "blog" ? `${Math.max(1, Math.ceil(wordCount / 180))} min read` : null;

    const newPostDoc = {
      uid: effectiveUid,
      name: authorName,
      username: user.username || authorName.toLowerCase().replace(/\s+/g, "_"),
      avatar: authorAvatar,
      content: finalContent,
      type: inlineFormat === "pr" ? "pr" : inlineCategory,
      mediaType: finalMediaType,
      mediaUrl: finalMediaUrl,
      blogTitle: inlineFormat === "blog" ? (inlineBlogTitle.trim() || "Fitness Story") : null,
      readTime: readTime,
      likes: [],
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "posts"), newPostDoc);
      setPosts((prev) => [
        { id: docRef.id, ...newPostDoc, createdAt: new Date(), liked: false },
        ...prev,
      ]);
      setInlineCaption("");
      setInlineMediaUrl("");
      setInlineImagePreview("");
      setInlineVideoUrl("");
      setInlineBlogTitle("");
      setInlinePrExercise("");
      setInlinePrWeight("");
      setShareToast("Post published to community successfully! 🎉");
      setTimeout(() => setShareToast(""), 3500);
    } catch (err) {
      console.error("Firestore post publish warning:", err);
      setPosts((prev) => [
        { id: `local_${Date.now()}`, ...newPostDoc, createdAt: new Date(), liked: false },
        ...prev,
      ]);
      setInlineCaption("");
      setInlineMediaUrl("");
      setInlineImagePreview("");
      setInlineVideoUrl("");
      setInlineBlogTitle("");
      setInlinePrExercise("");
      setInlinePrWeight("");
      setShareToast("Post shared to feed! 🎉");
      setTimeout(() => setShareToast(""), 3500);
    } finally {
      setInlinePosting(false);
    }
  };

  // ── Derived Filter Counts ──────────────────────────────────────────────────
  const filterCounts = useMemo(() => {
    return {
      all: posts.length,
      photos: posts.filter((p) => p.mediaType === "image" || (p.mediaUrl && p.mediaType !== "video" && p.mediaType !== "blog")).length,
      videos: posts.filter((p) => p.mediaType === "video" || p.videoUrl).length,
      blogs: posts.filter((p) => p.mediaType === "blog" || p.mediaType === "article" || p.blogTitle).length,
      workout: posts.filter((p) => p.type === "workout" || p.category === "workout").length,
      diet: posts.filter((p) => p.type === "diet" || p.type === "nutrition" || p.category === "diet").length,
      pr: posts.filter((p) => p.type === "pr" || p.category === "pr").length,
      wellness: posts.filter((p) => p.type === "wellness" || p.category === "wellness").length,
    };
  }, [posts]);

  // ── Derived Filtered Items ─────────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (feedFilter === "photos") {
      list = list.filter((p) => p.mediaType === "image" || (p.mediaUrl && p.mediaType !== "video" && p.mediaType !== "blog"));
    } else if (feedFilter === "videos") {
      list = list.filter((p) => p.mediaType === "video" || p.videoUrl);
    } else if (feedFilter === "blogs") {
      list = list.filter((p) => p.mediaType === "blog" || p.mediaType === "article" || p.blogTitle);
    } else if (feedFilter === "workout") {
      list = list.filter((p) => p.type === "workout" || p.category === "workout");
    } else if (feedFilter === "diet") {
      list = list.filter((p) => p.type === "diet" || p.type === "nutrition" || p.category === "diet");
    } else if (feedFilter === "pr") {
      list = list.filter((p) => p.type === "pr" || p.category === "pr");
    } else if (feedFilter === "wellness") {
      list = list.filter((p) => p.type === "wellness" || p.category === "wellness");
    } else if (feedFilter === "visuals") {
      list = list.filter((p) => p.mediaType === "image" || p.mediaType === "video" || p.mediaUrl);
    }

    if (!searchQ) return list;
    const q = searchQ.toLowerCase();
    return list.filter(
      (p) =>
        p.content?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.blogTitle?.toLowerCase().includes(q)
    );
  }, [posts, feedFilter, searchQ]);

  const filteredMembers = useMemo(() => {
    if (!searchQ) return members;
    const q = searchQ.toLowerCase();
    return members.filter(
      (m) => m.name?.toLowerCase().includes(q) || m.goal?.toLowerCase().includes(q)
    );
  }, [members, searchQ]);

  const filteredChallenges = useMemo(() => {
    if (!searchQ) return challenges;
    const q = searchQ.toLowerCase();
    return challenges.filter((c) => c.title?.toLowerCase().includes(q));
  }, [challenges, searchQ]);

  const onlineCount = members.filter((m) => m.online).length;

  const BG = dark ? "#08090d" : "#f1f5f9";
  const GB = dark ? "#0f1322" : "#ffffff";
  const GB_BORDER = dark ? "rgba(255,255,255,0.12)" : "#cbd5e1";
  const GB_TOP = dark ? "rgba(255,255,255,0.18)" : "#ffffff";

  // ── CSS ──────────────────────────────────────────────────────────────────
  const css = generateCSS(T, dark) + `
    .cm{min-height:100vh;background:${BG};color:${T.text};font-family:${FONT.body};position:relative;overflow-x:hidden;
      opacity:${mounted?1:0};transition:opacity 0.6s ease,background 0.4s;}

    /* Ambient Kinetic Atmospheric Orbs (dark mode only to avoid light haze) */
    .o1, .o2, .o3{display:${dark?"block":"none"};}
    .o1{position:fixed;top:-16%;left:-10%;width:850px;height:850px;pointer-events:none;z-index:0;
      background:radial-gradient(circle,rgba(59,130,246,0.13) 0%,transparent 65%);
      animation:oF1 24s ease-in-out infinite;}
    .o2{position:fixed;bottom:-20%;right:-10%;width:800px;height:800px;pointer-events:none;z-index:0;
      background:radial-gradient(circle,rgba(139,92,246,0.11) 0%,transparent 65%);
      animation:oF2 30s ease-in-out infinite;}
    .o3{position:fixed;top:40%;left:25%;width:600px;height:600px;pointer-events:none;z-index:0;
      background:radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 60%);
      animation:oF1 32s ease-in-out infinite reverse;}
    @keyframes oF1{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,-35px);}}
    @keyframes oF2{0%,100%{transform:translate(0,0);}50%{transform:translate(-50px,-40px);}}

    /* Foundation Card Container */
    .gl{background:${GB};border:1.5px solid ${GB_BORDER};
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      box-shadow:${dark?"0 10px 32px rgba(0,0,0,0.36)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
      position:relative;overflow:hidden;}
    .gl::before{display:none;}
    .gl>*{position:relative;z-index:1;}

    /* ── UNIFIED EXECUTIVE HEADER (Centered Symmetric Grid) ── */
    .cm-header{
      position:sticky;top:0;z-index:50;width:100%;
      background:${dark?"rgba(8,9,13,0.92)":"#ffffff"};
      border-bottom:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      backdrop-filter:${dark?"blur(36px) saturate(180%)":"none"};
      -webkit-backdrop-filter:${dark?"blur(36px) saturate(180%)":"none"};
      box-shadow:0 4px 20px rgba(15,23,42,${dark?"0.30":"0.04"});
    }
    .cm-header-inner{
      max-width:1240px;margin:0 auto;width:100%;
      display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
      gap:16px;padding:12px 24px;box-sizing:border-box;
    }
    .cm-header-left{display:flex;align-items:center;gap:14px;justify-self:start;}
    .cm-back-btn{
      display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:11px;
      border:1px solid ${dark?GB_BORDER:"#e2e8f0"};background:${dark?"rgba(255,255,255,0.05)":"#ffffff"};
      color:${dark?T.textSub:"#334155"};font-size:12.5px;font-weight:700;cursor:pointer;
      font-family:${FONT.body};transition:all 0.16s ease;
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.04)"};
    }
    .cm-back-btn:hover{color:${T.accent};border-color:${T.accent}50;background:${dark?T.accentSoft:"#eff6ff"};transform:translateY(-1px);}
    .cm-brand{display:flex;align-items:center;gap:9px;}
    .cm-brand-title{font-family:${FONT.display};font-size:20px;font-weight:900;color:${dark?T.text:"#0f172a"};letter-spacing:-0.03em;}
    .cm-brand-title span{background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .cm-brand-badge{
      font-size:9.5px;font-weight:900;letter-spacing:0.08em;padding:3px 8px;border-radius:6px;
      background:linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.18));
      color:${dark?"#93c5fd":"#2563eb"};border:1px solid rgba(59,130,246,0.30);text-transform:uppercase;
    }

    /* Center Nav Tabs - Mathematically Centered */
    .cm-nav-tabs{
      display:flex;align-items:center;gap:6px;
      background:${dark?"rgba(255,255,255,0.04)":"#f1f5f9"};
      padding:4px;border-radius:14px;border:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      justify-self:center;
    }
    .cm-nav-pill{
      display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:10px;
      border:1px solid transparent;background:transparent;color:${dark?T.textSub:"#64748b"};
      font-size:12.5px;font-weight:700;cursor:pointer;transition:all 0.18s ease;
      white-space:nowrap;font-family:${FONT.body};
    }
    .cm-nav-pill:hover{color:${dark?T.text:"#0f172a"};background:${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.8)"};}
    .cm-nav-pill.active{
      background:linear-gradient(135deg,${T.accent},#1d4ed8);color:#fff;font-weight:800;
      box-shadow:0 3px 14px ${T.accent}45;border-color:rgba(255,255,255,0.15);
    }
    .cm-tab-badge{
      font-size:9.5px;font-weight:800;padding:1px 6px;border-radius:99px;
      background:#ef4444;color:#fff;margin-left:2px;
    }

    /* Right Controls */
    .cm-header-right{display:flex;align-items:center;gap:10px;justify-self:end;}
    .cm-search-wrapper{display:flex;align-items:center;position:relative;}
    .cm-search-icon{position:absolute;left:11px;color:${dark?T.textMuted:"#94a3b8"};pointer-events:none;}
    .cm-search-input{
      height:38px;border-radius:11px;border:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      background:${dark?"rgba(255,255,255,0.05)":"#ffffff"};
      color:${dark?T.text:"#0f172a"};padding:0 30px 0 34px;font-size:12.5px;outline:none;
      width:150px;transition:width 0.22s ease,border-color 0.2s ease,box-shadow 0.2s ease;
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.04)"};
    }
    .cm-search-input:focus{width:190px;border-color:${T.accent}70;box-shadow:0 0 14px ${T.accent}30;}
    .cm-search-clear{position:absolute;right:8px;background:none;border:none;color:${dark?T.textMuted:"#94a3b8"};cursor:pointer;padding:2px;display:flex;align-items:center;}

    .cm-create-post-btn{
      padding:9px 18px;border-radius:12px;border:none;
      background:linear-gradient(135deg,${T.accent},#1e40af);
      color:#fff;font-size:12.5px;font-weight:800;cursor:pointer;
      display:inline-flex;align-items:center;gap:7px;box-shadow:0 4px 16px ${T.accent}45;
      transition:transform 0.16s ease,box-shadow 0.16s ease;white-space:nowrap;
    }
    .cm-create-post-btn:hover{transform:translateY(-1.5px);box-shadow:0 8px 24px ${T.accent}60;}

    .cm-theme-btn{
      width:38px;height:38px;border-radius:11px;border:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      background:${dark?"rgba(255,255,255,0.05)":"#ffffff"};
      color:${dark?T.text:"#334155"};display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all 0.16s ease;
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.04)"};
    }
    .cm-theme-btn:hover{border-color:${T.accent}50;color:${T.accent};transform:translateY(-1px);}

    /* ── LAYOUT BODY (Aligned with 1240px header) ── */
    .cm-body{
      display:grid;grid-template-columns:minmax(0, 1fr) 340px;gap:28px;
      max-width:1240px;margin:0 auto;padding:24px;box-sizing:border-box;width:100%;
      position:relative;z-index:1;
    }

    /* ── EXECUTIVE ATHLETE COMMUNITY HERO ── */
    .cm-hero{
      border-radius:24px;padding:28px 32px;margin-bottom:24px;
      background:${dark?GB:"#ffffff"};
      border:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      backdrop-filter:${dark?"blur(50px) saturate(190%)":"none"};
      -webkit-backdrop-filter:${dark?"blur(50px) saturate(190%)":"none"};
      box-shadow:${dark?"inset 0 1.5px 0 "+GB_TOP+", 0 10px 36px rgba(0,0,0,0.32)":"0 2px 4px rgba(0,0,0,0.02), 0 8px 24px -2px rgba(15,23,42,0.06), 0 0 0 1px #e2e8f0"};
      position:relative;overflow:hidden;
    }
    .cm-hero::before{
      content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
      background:linear-gradient(135deg,rgba(59,130,246,${dark?"0.14":"0.03"}),rgba(139,92,246,${dark?"0.10":"0.02"}));
    }
    .cm-hero-badge{
      display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:99px;
      background:${dark?"rgba(59,130,246,0.18)":"rgba(59,130,246,0.10)"};
      border:1px solid rgba(59,130,246,0.35);color:${dark?"#93c5fd":"#2563eb"};
      font-size:10.5px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;
    }
    .cm-hero-title{
      font-family:${FONT.display};font-size:26px;font-weight:900;color:${dark?T.text:"#0f172a"};
      letter-spacing:-0.03em;margin:0 0 8px;line-height:1.2;
    }
    .cm-hero-title span{
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    }
    .cm-hero-desc{
      font-size:13.5px;color:${dark?T.textSub:"#475569"};line-height:1.55;margin:0 0 20px;max-width:680px;
    }
    .cm-hero-metrics{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
    .cm-hm-item{
      display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:12px;
      background:${dark?"rgba(255,255,255,0.05)":"#f8fafc"};
      border:1px solid ${dark?GB_BORDER:"#e2e8f0"};font-size:12px;font-weight:800;color:${dark?T.text:"#0f172a"};
      box-shadow:${dark?"0 2px 8px rgba(0,0,0,0.12)":"0 1px 2px rgba(15,23,42,0.03)"};
    }
    .cm-hm-item span{color:${dark?T.textSub:"#64748b"};font-weight:600;}

    /* ── CREATE POST TRIGGER CARD ── */
    .cm-composer-trigger{
      background:${dark?GB:"#ffffff"};border:1px solid ${dark?GB_BORDER:"#e2e8f0"};border-radius:22px;
      padding:20px 24px;margin-bottom:24px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      box-shadow:${dark?"0 8px 30px rgba(0,0,0,0.30)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
      transition:border-color 0.22s ease,box-shadow 0.22s ease;
      position:relative;overflow:hidden;
    }
    .cm-composer-trigger:hover{
      border-color:${dark?T.accent+"60":"rgba(59,130,246,0.45)"};
      box-shadow:${dark?"0 12px 38px rgba(59,130,246,0.15)":"0 4px 12px rgba(15,23,42,0.05), 0 12px 28px -4px rgba(37,99,235,0.10)"};
    }
    .cm-ct-top{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
    .cm-ct-input-box{
      flex:1;height:46px;border-radius:13px;border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};
      background:${dark?"rgba(255,255,255,0.04)":"#f8fafc"};
      color:${dark?T.textMuted:"#64748b"};padding:0 16px;font-size:13px;display:flex;
      align-items:center;cursor:pointer;transition:all 0.18s ease;
    }
    .cm-ct-input-box:hover{
      background:${dark?"rgba(255,255,255,0.07)":"#f1f5f9"};
      border-color:${T.accent}65;color:${dark?T.text:"#0f172a"};
    }
    .cm-ct-publish-btn{
      padding:11px 18px;border-radius:13px;border:none;
      background:linear-gradient(135deg,${T.accent},#1d4ed8);color:#fff;
      font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;
      align-items:center;gap:7px;box-shadow:0 3px 14px ${T.accent}40;
      white-space:nowrap;transition:transform 0.16s ease,box-shadow 0.16s ease;
    }
    .cm-ct-publish-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px ${T.accent}55;}

    .cm-ct-shortcuts{
      display:flex;align-items:center;gap:9px;padding-top:12px;
      border-top:1px solid ${dark?GB_BORDER:"#f1f5f9"};flex-wrap:wrap;
    }
    .cm-ct-shortcut-btn{
      padding:7px 14px;border-radius:10px;border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};
      background:${dark?"rgba(255,255,255,0.03)":"#f8fafc"};
      color:${dark?T.textSub:"#334155"};font-size:12px;font-weight:700;cursor:pointer;
      display:inline-flex;align-items:center;gap:7px;transition:all 0.18s ease;
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.04)"};
    }
    .cm-ct-shortcut-btn:hover{
      color:${dark?T.text:"#0f172a"};border-color:${T.accent}50;background:${dark?T.accentSoft:"#eff6ff"};transform:translateY(-1px);
    }

    /* ── HIGH VISIBILITY FEED FILTER BAR ── */
    .feed-filter-bar{
      background:${dark?GB:"#ffffff"};border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};border-radius:20px;
      padding:16px 22px;margin-bottom:22px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      box-shadow:${dark?"0 6px 24px rgba(0,0,0,0.25)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
    }
    .ff-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .ff-title{
      font-size:11.5px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;
      color:${dark?T.textMuted:"#64748b"};display:flex;align-items:center;gap:7px;
    }
    .ff-count-tag{font-size:11.5px;font-weight:800;color:${dark?T.textSub:"#475569"};}
    .ff-chips-row{
      display:flex;align-items:center;gap:8px;overflow-x:auto;padding-bottom:4px;
      scrollbar-width:thin;
    }
    .ff-chip{
      padding:8px 15px;border-radius:11px;border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};
      background:${dark?"rgba(255,255,255,0.04)":"#f8fafc"};
      color:${dark?T.textSub:"#334155"};font-size:12px;font-weight:700;cursor:pointer;
      display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:all 0.18s ease;
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.04)"};
    }
    .ff-chip:hover{
      color:${dark?T.text:"#0f172a"};border-color:${T.accent}60;
      background:${dark?"rgba(255,255,255,0.07)":"#f1f5f9"};
    }
    .ff-chip.active{
      background:linear-gradient(135deg,${T.accent},#1e40af);border-color:${T.accent};color:#fff;
      box-shadow:0 3px 14px ${T.accent}45;
    }
    .ff-chip-count{
      font-size:10px;font-weight:900;padding:2px 7px;border-radius:99px;
      background:${dark?"rgba(255,255,255,0.14)":"#cbd5e1"};color:${dark?T.textSub:"#334155"};
    }
    .ff-chip.active .ff-chip-count{background:rgba(255,255,255,0.25);color:#fff;}

    /* ── POST CARD (Zero haze, solid background, razor-sharp borders) ── */
    .post-card{
      background:${dark ? "#0f1322" : "#ffffff"} !important;
      border:1.5px solid ${dark ? "rgba(255,255,255,0.14)" : "#cbd5e1"} !important;
      border-radius:24px;
      padding:24px 26px;margin-bottom:22px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      filter:none !important;
      opacity:1 !important;
      box-shadow:${dark ? "0 10px 32px rgba(0,0,0,0.36)" : "0 4px 18px -2px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)"};
      transition:transform 0.22s ease,border-color 0.22s ease,box-shadow 0.22s ease;
      animation:fadeUp 0.35s ease both;position:relative;overflow:hidden;
    }
    .post-card::before, .post-card::after,
    .ch-card::before, .ch-card::after,
    .mem-card::before, .mem-card::after,
    .side-card::before, .side-card::after,
    .cm-composer-trigger::before, .cm-composer-trigger::after{
      display:none !important;
      content:none !important;
    }
    .post-card:hover{
      border-color:${dark ? "rgba(255,255,255,0.26)" : "#94a3b8"} !important;
      transform:translateY(-2px);
      box-shadow:${dark ? "0 14px 40px rgba(0,0,0,0.45)" : "0 12px 28px -4px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)"};
    }

    .post-hd{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
    .post-meta{flex:1;min-width:0;}
    .post-name-row{display:flex;align-items:center;gap:8px;}
    .post-name{font-family:${FONT.display};font-size:15.5px;font-weight:800;color:${dark?T.text:"#0f172a"};cursor:pointer;}
    .post-name:hover{color:${T.accent};}
    .post-time{font-size:11.5px;color:${dark?T.textMuted:"#64748b"};margin-top:2px;font-weight:500;}
    .post-tag{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;letter-spacing:0.04em;}

    .post-body{font-size:14.5px;line-height:1.65;color:${dark?T.text:"#0f172a"};margin-bottom:16px;white-space:pre-line;font-weight:500;}

    /* Media views */
    .post-media-container{border-radius:18px;overflow:hidden;margin-bottom:16px;background:rgba(0,0,0,0.25);position:relative;border:1.5px solid ${GB_BORDER};}
    .post-media-img{width:100%;max-height:480px;object-fit:cover;display:block;cursor:pointer;}
    .post-media-video{width:100%;max-height:480px;display:block;}

    /* Blog Card View */
    .blog-embed-card{
      border-radius:20px;overflow:hidden;border:1.5px solid ${GB_BORDER};
      background:${dark?"#131829":"#f8fafc"};
      margin-bottom:16px;cursor:pointer;transition:border-color 0.2s ease,box-shadow 0.2s ease;
    }
    .blog-embed-card:hover{border-color:${T.accent}60;box-shadow:0 8px 26px rgba(59,130,246,0.12);}
    .blog-cover-img{width:100%;height:190px;object-fit:cover;display:block;}
    .blog-content-pad{padding:18px 22px;}
    .blog-embed-title{font-family:${FONT.display};font-size:18px;font-weight:800;color:${dark?T.text:"#0f172a"};margin-bottom:8px;line-height:1.3;}
    .blog-embed-snippet{font-size:13px;color:${dark?T.textSub:"#475569"};line-height:1.55;margin-bottom:12px;}
    .blog-read-btn{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:${T.accent};}

    /* Actions */
    .post-acts{display:flex;align-items:center;gap:10px;padding-top:16px;border-top:1px solid ${dark?GB_BORDER:"#f1f5f9"};flex-wrap:wrap;}
    .act-btn{
      display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:11px;
      border:1.5px solid ${dark?"rgba(255,255,255,0.08)":"#e2e8f0"};
      background:${dark?"rgba(255,255,255,0.04)":"#f8fafc"};
      color:${dark?T.textSub:"#334155"};
      font-size:12.5px;font-weight:700;cursor:pointer;transition:all 0.16s ease;
      font-family:${FONT.body};
      box-shadow:${dark?"none":"0 1px 2px rgba(15,23,42,0.03)"};
    }
    .act-btn:hover{
      background:${dark?"rgba(255,255,255,0.08)":"#f1f5f9"};
      color:${dark?T.text:"#0f172a"};
      border-color:${dark?"rgba(255,255,255,0.20)":"#cbd5e1"};
    }
    .act-btn.liked{
      color:#e11d48;
      background:${dark?"rgba(225,29,72,0.14)":"#fff1f2"};
      border-color:${dark?"rgba(225,29,72,0.35)":"#fecdd3"};
      box-shadow:0 2px 8px rgba(225,29,72,0.15);
    }

    /* Comments Drawer */
    .coms-drawer{margin-top:14px;padding-top:14px;border-top:1px solid ${dark?GB_BORDER:"#f1f5f9"};}
    .com-row{display:flex;gap:10px;margin-bottom:10px;}
    .com-bubble{flex:1;background:${dark?"rgba(255,255,255,0.04)":"#f8fafc"};border:1px solid ${dark?GB_BORDER:"#e2e8f0"};border-radius:14px;padding:10px 14px;}
    .com-name{font-size:12px;font-weight:800;color:${dark?T.text:"#0f172a"};margin-bottom:3px;}
    .com-text{font-size:13px;color:${dark?T.textSub:"#334155"};line-height:1.4;}
    .com-input-box{display:flex;gap:10px;margin-top:12px;}
    .com-input{flex:1;height:42px;border-radius:12px;border:1px solid ${dark?GB_BORDER:"#cbd5e1"};background:${dark?"rgba(255,255,255,0.05)":"#ffffff"};color:${dark?T.text:"#0f172a"};padding:0 14px;font-size:13px;outline:none;}
    .com-send-btn{padding:0 16px;border-radius:12px;border:none;background:linear-gradient(135deg,${T.accent},#1d4ed8);color:#fff;font-weight:800;cursor:pointer;}

    /* ── DIRECT MESSAGES ── */
    .chat-container{
      background:${dark?GB:"#ffffff"};border:1px solid ${dark?GB_BORDER:"#e2e8f0"};border-radius:24px;
      overflow:hidden;
      backdrop-filter:${dark?"blur(50px) saturate(190%)":"none"};
      -webkit-backdrop-filter:${dark?"blur(50px) saturate(190%)":"none"};
      display:flex;flex-direction:column;
      height:680px;box-shadow:${dark?"inset 0 1.5px 0 "+GB_TOP+", 0 14px 44px rgba(0,0,0,0.30)":"0 2px 4px rgba(0,0,0,0.02), 0 10px 30px rgba(15,23,42,0.06), 0 0 0 1px #e2e8f0"};
    }
    .chat-topbar{
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 22px;border-bottom:1px solid ${dark?GB_BORDER:"#e2e8f0"};
      background:${dark?"rgba(8,11,20,0.75)":"#f8fafc"};
    }
    .chat-messages-scroll{flex:1;overflow-y:auto;padding:22px;display:flex;flex-direction:column;gap:12px;}
    .msg-bubble-me{
      align-self:flex-end;max-width:70%;padding:11px 16px;border-radius:16px 16px 4px 16px;
      background:linear-gradient(135deg,${T.accent},#7c3aed);color:#fff;
      font-size:13.5px;line-height:1.45;word-break:break-word;box-shadow:0 4px 14px ${T.accent}35;
    }
    .msg-bubble-them{
      align-self:flex-start;max-width:70%;padding:11px 16px;border-radius:16px 16px 16px 4px;
      background:${dark?"rgba(255,255,255,0.08)":"#f1f5f9"};color:${dark?T.text:"#0f172a"};
      border:1px solid ${dark?GB_BORDER:"#e2e8f0"};font-size:13.5px;line-height:1.45;word-break:break-word;
    }
    .chat-input-row{
      display:flex;align-items:center;gap:10px;padding:14px 20px;
      border-top:1px solid ${dark?GB_BORDER:"#e2e8f0"};background:${dark?"rgba(8,11,20,0.75)":"#f8fafc"};
    }
    .chat-input{
      flex:1;height:44px;border-radius:12px;border:1px solid ${dark?GB_BORDER:"#cbd5e1"};
      background:${dark?"rgba(255,255,255,0.06)":"#ffffff"};
      color:${dark?T.text:"#0f172a"};padding:0 16px;font-size:13.5px;outline:none;
    }
    .chat-send-action{
      width:44px;height:44px;border-radius:12px;border:none;background:linear-gradient(135deg,${T.accent},#1d4ed8);
      color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    }

    /* Members Grid */
    .mem-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:16px;}
    .mem-card{
      background:${dark?GB:"#ffffff"};border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};border-radius:22px;
      padding:22px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      transition:all 0.22s ease;
      cursor:pointer;
      box-shadow:${dark?"0 8px 28px rgba(0,0,0,0.28)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
    }
    .mem-card:hover{border-color:${T.accent}65;transform:translateY(-2px);box-shadow:${dark?"0 12px 34px rgba(59,130,246,0.18)":"0 12px 28px -4px rgba(37,99,235,0.12), 0 0 0 1px #94a3b8"};}

    /* Challenges Cards */
    .ch-card{
      background:${dark?GB:"#ffffff"};border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};border-radius:22px;
      padding:22px;margin-bottom:16px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      transition:all 0.22s ease;
      box-shadow:${dark?"0 8px 28px rgba(0,0,0,0.28)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
    }
    .ch-card:hover{
      border-color:${T.accent}65;transform:translateY(-2px);
      box-shadow:${dark?"0 12px 34px rgba(0,0,0,0.38)":"0 12px 26px -4px rgba(15,23,42,0.10), 0 0 0 1px #94a3b8"};
    }
    .ch-hd{display:flex;align-items:flex-start;gap:14px;}
    .ch-title{font-family:${FONT.display};font-size:17.5px;font-weight:800;color:${dark?T.text:"#0f172a"};margin-bottom:4px;}
    .ch-desc{font-size:12.5px;color:${dark?T.textSub:"#475569"};line-height:1.5;margin-top:6px;}
    .ch-prog{height:8px;border-radius:99px;background:${dark?"rgba(255,255,255,0.08)":"#e2e8f0"};overflow:hidden;margin-top:14px;}
    .ch-fill{height:100%;border-radius:99px;}

    /* Sidebar Cards */
    .side-card{
      background:${dark?GB:"#ffffff"};border:1.5px solid ${dark?GB_BORDER:"#cbd5e1"};border-radius:22px;
      padding:22px;margin-bottom:18px;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
      box-shadow:${dark?"0 8px 28px rgba(0,0,0,0.28)":"0 4px 16px -2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)"};
    }
    .side-title{font-family:${FONT.display};font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${dark?T.textMuted:"#64748b"};margin-bottom:16px;}
    .online-user-item{
      display:flex;align-items:center;gap:11px;padding:9px 0;
      border-bottom:1px solid ${dark?GB_BORDER:"#f1f5f9"};cursor:pointer;transition:all 0.15s ease;
    }
    .online-user-item:last-child{border-bottom:none;}
    .online-user-item:hover .oui-name{color:${T.accent};}

    /* Mobile Floating Bottom Navigation Dock — Hidden on Desktop */
    .mobile-bottom-dock{display:none !important;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    
    @media(max-width:900px){
      .cm-header-inner{
        display:flex !important;
        flex-direction:column !important;
        align-items:stretch !important;
        gap:10px !important;
        padding:12px 14px !important;
      }
      .cm-header-left{
        width:100% !important;
        justify-content:space-between !important;
      }
      .cm-nav-tabs{
        width:100% !important;
        overflow-x:auto !important;
        -webkit-overflow-scrolling:touch !important;
        scrollbar-width:none !important;
        justify-content:flex-start !important;
        padding:4px 6px !important;
      }
      .cm-nav-tabs::-webkit-scrollbar{display:none;}
      .cm-nav-pill{
        flex-shrink:0 !important;
        padding:7px 12px !important;
        font-size:12px !important;
      }
      .cm-header-right{
        width:100% !important;
        justify-content:space-between !important;
        gap:8px !important;
        flex-wrap:wrap !important;
      }
      .cm-search-wrapper{
        flex:1 1 120px !important;
        min-width:100px !important;
      }
      .cm-search-input{
        width:100% !important;
      }
      .cm-search-input:focus{
        width:100% !important;
      }
      .cm-create-post-btn{
        padding:8px 12px !important;
        font-size:11.5px !important;
      }
      .cm-edit-profile-btn{
        padding:6px 10px !important;
        font-size:11.5px !important;
      }
      .cm-ep-label{
        display:none !important;
      }
      .cm-body{
        grid-template-columns:1fr !important;
        padding:16px 14px 110px !important;
        gap:18px !important;
      }
      .cm-body>div:first-child{
        order:1 !important;
      }
      .cm-body>div:last-child{
        order:2 !important;
        margin-top:8px !important;
      }
      .cm-hero{
        padding:20px 16px !important;
        border-radius:18px !important;
      }
      .cm-hero-title{
        font-size:22px !important;
      }
      .post-card{
        padding:18px 16px !important;
        border-radius:18px !important;
      }
      
      /* Mobile Floating Bottom Navigation Dock */
      .mobile-bottom-dock{
        position:fixed;bottom:14px;left:14px;right:14px;z-index:998;
        display:flex !important;align-items:center;justify-content:space-around;
        padding:7px 8px;border-radius:22px;
        background:${dark ? "rgba(15,17,26,0.92)" : "rgba(255,255,255,0.94)"};
        backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
        border:1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"};
        box-shadow:0 12px 36px rgba(0,0,0,${dark ? "0.55" : "0.15"});
      }
      .mbd-item{
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:3px;background:none;border:none;cursor:pointer;
        padding:6px 12px;border-radius:14px;transition:all 0.18s ease;
        color:${dark ? "#94a3b8" : "#64748b"};
        font-family:${FONT.body};
      }
      .mbd-item.active{
        color:${T.accent};
        background:${dark ? "rgba(79,142,247,0.16)" : "rgba(79,142,247,0.10)"};
      }
      .mbd-icon{font-size:18px;line-height:1;}
      .mbd-lbl{font-size:10px;font-weight:750;letter-spacing:0.01em;}
    }

    @media(max-width:480px){
      .cm-header-right{
        gap:6px !important;
      }
      .cm-create-post-btn span{
        display:none !important;
      }
      .cm-create-post-btn{
        padding:8px !important;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="cm">
        <div className="o1" /><div className="o2" /><div className="o3" />

        {/* Share toast */}
        {shareToast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: dark ? "rgba(8,11,20,0.96)" : "#ffffff", border: "1px solid #22c55e", padding: "10px 22px", borderRadius: 99, color: "#22c55e", fontWeight: 700, zIndex: 99999, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>✓ Post link copied to clipboard!</div>}

        {/* ── UNIFIED EXECUTIVE HEADER ── */}
        <header className="cm-header">
          <div className="cm-header-inner">
            {/* Left: Back to Dashboard + Brand */}
            <div className="cm-header-left">
              <button className="cm-back-btn" onClick={() => navigate("/dashboard")} title="Back to Dashboard">
                <ArrowLeft size={15} />
                <span>Dashboard</span>
              </button>
              <div className="cm-brand">
                <div className="cm-brand-title">
                  AshFit<span>Verse</span>
                </div>
                <span className="cm-brand-badge">COMMUNITY</span>
              </div>
            </div>

            {/* Center: Segmented Navigation Switcher */}
            <nav className="cm-nav-tabs">
              {[
                { id: "feed", label: "Feed", icon: Activity },
                { id: "members", label: "Athletes", icon: Users },
                { id: "challenges", label: "Challenges", icon: Trophy },
                { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadDMs },
              ].map((t) => {
                const IconComponent = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    className={`cm-nav-pill ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(t.id);
                      setSearchParams({ tab: t.id });
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{t.label}</span>
                    {t.badge > 0 && <span className="cm-tab-badge">{t.badge}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Right: Search, Live Status, Create Post, Theme Toggle, Avatar */}
            <div className="cm-header-right">
              <div className="cm-search-wrapper">
                <Search size={14} className="cm-search-icon" />
                <input
                  type="text"
                  placeholder="Search community…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="cm-search-input"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} className="cm-search-clear">
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                className="cm-create-post-btn"
                onClick={() => {
                  setCreatorFormat("photo");
                  setCreatorCategory("workout");
                  setShowPostCreator(true);
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create Post</span>
              </button>

              <button
                className="cm-edit-profile-btn"
                onClick={() => setShowEditProfileModal(true)}
                title="Edit Profile Picture & @handle"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 650,
                  cursor: "pointer",
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
                  background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  color: dark ? "#f8fafc" : "#1e293b",
                  transition: "all 0.2s ease",
                }}
              >
                <span>⚙️</span>
                <span className="cm-ep-label">Edit Profile</span>
              </button>

              <button className="cm-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {dark ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              <div
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => setSelectedAthlete(user)}
                title="View your athlete profile"
              >
                <Avatar src={user?.avatar} name={user?.name} size={36} />
              </div>
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="cm-body">
          {/* Main Content (Left) */}
          <div>
            {/* ════════════ TAB 1: FEED ════════════ */}
            {activeTab === "feed" && (
              <>
                {/* ── High-Impact Executive Athlete Community Hero ── */}
                <div className="cm-hero">
                  <div className="cm-hero-badge">
                    <Sparkles size={13} />
                    <span>Global Athlete Community</span>
                  </div>
                  <h1 className="cm-hero-title">
                    Where Ambition Meets <span>Daily Accountability</span>
                  </h1>
                  <p className="cm-hero-desc">
                    Connect with dedicated athletes worldwide. Exchange verified training logs, track personal records, and push through team protocols together.
                  </p>
                  <div className="cm-hero-metrics">
                    <div className="cm-hm-item">
                      <Zap size={14} color="#3b82f6" />
                      <div>1,840+ <span>Workouts Logged</span></div>
                    </div>
                    <div className="cm-hm-item">
                      <Flame size={14} color="#f97316" />
                      <div>340+ <span>Active Streaks</span></div>
                    </div>
                    <div className="cm-hm-item">
                      <span className="cm-pulse-dot" />
                      <div>{onlineCount + 1} <span>Athletes Live Now</span></div>
                    </div>
                    <div className="cm-hm-item">
                      <Trophy size={14} color="#eab308" />
                      <div>{challenges.length} <span>Active Challenges</span></div>
                    </div>
                  </div>
                </div>

                {/* Sleek Create Post Trigger Card */}
                <div className="cm-composer-trigger">
                  <div className="cm-ct-top">
                    <Avatar src={user?.avatar} name={user?.name} size={40} />
                    <div
                      className="cm-ct-input-box"
                      onClick={() => {
                        setCreatorFormat("photo");
                        setCreatorCategory("workout");
                        setShowPostCreator(true);
                      }}
                    >
                      <span>Share a workout, milestone, or fitness insight with the squad…</span>
                    </div>
                    <button
                      className="cm-ct-publish-btn"
                      onClick={() => {
                        setCreatorFormat("photo");
                        setCreatorCategory("workout");
                        setShowPostCreator(true);
                      }}
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Create Post</span>
                    </button>
                  </div>

                  <div className="cm-ct-shortcuts">
                    {[
                      { format: "photo", label: "Photo", icon: ImageIcon, color: "#38bdf8" },
                      { format: "video", label: "Video Clip", icon: Video, color: "#a855f7" },
                      { format: "blog", label: "Article & Guide", icon: BookOpen, color: "#f59e0b" },
                      { format: "pr", label: "Personal Record", icon: Award, color: "#ec4899" },
                    ].map((sc) => {
                      const Icon = sc.icon;
                      return (
                        <button
                          key={sc.format}
                          type="button"
                          className="cm-ct-shortcut-btn"
                          onClick={() => {
                            setCreatorFormat(sc.format);
                            setCreatorCategory(sc.format === "pr" ? "pr" : "workout");
                            setShowPostCreator(true);
                          }}
                        >
                          <Icon size={15} color={sc.color} />
                          <span>{sc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* High-Visibility Feed Filter Bar */}
                <div className="feed-filter-bar">
                  <div className="ff-header">
                    <div className="ff-title">
                      <Filter size={13} />
                      <span>Explore Community Feed</span>
                    </div>
                    <div className="ff-count-tag">
                      Showing {filteredPosts.length} of {posts.length} posts
                    </div>
                  </div>
                  <div className="ff-chips-row">
                    {[
                      { id: "all", label: "All Content", count: filterCounts.all },
                      { id: "photos", label: "Photos", count: filterCounts.photos },
                      { id: "videos", label: "Videos", count: filterCounts.videos },
                      { id: "blogs", label: "Articles", count: filterCounts.blogs },
                      { id: "workout", label: "Workouts", count: filterCounts.workout },
                      { id: "diet", label: "Nutrition", count: filterCounts.diet },
                      { id: "pr", label: "Records", count: filterCounts.pr },
                      { id: "wellness", label: "Wellness", count: filterCounts.wellness },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`ff-chip ${feedFilter === f.id ? "active" : ""}`}
                        onClick={() => setFeedFilter(f.id)}
                      >
                        <span>{f.label}</span>
                        <span className="ff-chip-count">{f.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts Stream */}
                {postsLoading ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted }}>
                    Loading community feed…
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="post-card" style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: T.accent }}>
                      <Activity size={26} />
                    </div>
                    <div style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800 }}>
                      No community posts found
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginTop: 4, marginBottom: 18 }}>
                      Be the first athlete to share a transformation photo, PR video, or training tip!
                    </div>
                    <button
                      className="cm-create-post-btn"
                      style={{ margin: "0 auto" }}
                      onClick={() => setShowPostCreator(true)}
                    >
                      <Plus size={15} strokeWidth={2.5} /> Create First Post
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((p) => {
                    const pc = postColors[p.type] || postColors.workout;
                    const formatInfo = getPostFormatInfo(p, dark);
                    const isLiked = p.liked;
                    const likeCount = (p.likes || []).length;
                    const commentList = postComments[p.id] || [];
                    const isCommentsOpen = Boolean(expandedComments[p.id]);

                    return (
                      <div key={p.id} className="post-card">
                        {/* Header */}
                        <div className="post-hd">
                          <Avatar
                            src={p.avatar}
                            name={p.name}
                            size={44}
                            onClick={() => setSelectedAthlete({ uid: p.uid, name: p.name, avatar: p.avatar, username: p.username })}
                          />
                          <div className="post-meta">
                            <div className="post-name-row">
                              <span
                                className="post-name"
                                onClick={() => setSelectedAthlete({ uid: p.uid, name: p.name, avatar: p.avatar, username: p.username })}
                              >
                                {p.name || "Athlete"}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 650,
                                  color: dark ? "rgba(148, 163, 184, 0.85)" : "#64748b",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                @{p.username || (p.name ? p.name.toLowerCase().replace(/\s+/g, "_") : "athlete")}
                              </span>
                              {p.readTime && (
                                <span style={{ fontSize: 11, color: T.textMuted }}>
                                  • {p.readTime}
                                </span>
                              )}
                            </div>
                            <div className="post-time">{timeAgo(p.createdAt)}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span
                              style={{
                                background: formatInfo.bg,
                                color: formatInfo.color,
                                border: `1px solid ${formatInfo.border}`,
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "4px 10px",
                                borderRadius: 8,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                boxShadow: dark ? "none" : "0 1px 2px rgba(15,23,42,0.04)",
                              }}
                            >
                              {formatInfo.label}
                            </span>
                            <span
                              className="post-tag"
                              style={{
                                background: pc.bg,
                                color: pc.tag,
                                border: `1px solid ${pc.border}`,
                                boxShadow: dark ? "none" : "0 1px 2px rgba(15,23,42,0.04)",
                              }}
                            >
                              {pc.label}
                            </span>
                          </div>
                        </div>

                        {/* If Blog / Article Format */}
                        {(p.mediaType === "blog" || p.blogTitle) ? (
                          <div className="blog-embed-card" onClick={() => setSelectedArticle(p)}>
                            {p.mediaUrl && (
                              <img src={p.mediaUrl} alt={p.blogTitle} className="blog-cover-img" />
                            )}
                            <div className="blog-content-pad">
                              <div className="blog-embed-title">
                                {p.blogTitle || "Fitness Guide"}
                              </div>
                              <div className="blog-embed-snippet">
                                {p.content?.length > 180 ? `${p.content.slice(0, 180)}…` : p.content}
                              </div>
                              <div className="blog-read-btn">
                                <BookOpen size={14} style={{ marginRight: 4 }} />
                                Read Full Article ({p.readTime || "2 min read"}) →
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Standard Post Content */
                          <>
                            {p.content && <div className="post-body">{p.content}</div>}

                            {/* Image Media Preview */}
                            {p.mediaType === "image" && p.mediaUrl && (
                              <div className="post-media-container">
                                <img
                                  src={p.mediaUrl}
                                  alt="Community post media"
                                  className="post-media-img"
                                  loading="lazy"
                                  onClick={() => window.open(p.mediaUrl, "_blank")}
                                />
                              </div>
                            )}

                            {/* Video Media Preview */}
                            {p.mediaType === "video" && p.mediaUrl && (
                              <div className="post-media-container">
                                {getYouTubeEmbedUrl(p.mediaUrl) ? (
                                  <iframe
                                    src={getYouTubeEmbedUrl(p.mediaUrl)}
                                    title="Community video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: "100%", height: 320, border: "none", display: "block" }}
                                  />
                                ) : (
                                  <video
                                    src={p.mediaUrl}
                                    controls
                                    playsInline
                                    className="post-media-video"
                                  />
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Post Action Buttons */}
                        <div className="post-acts">
                          <button
                            className={`act-btn ${isLiked ? "liked" : ""}`}
                            onClick={() => toggleLike(p.id, isLiked)}
                          >
                            <Heart size={15} fill={isLiked ? "#ff375f" : "none"} color={isLiked ? "#ff375f" : "currentColor"} />
                            <span>{likeCount}</span>
                          </button>

                          <button
                            className="act-btn"
                            onClick={() =>
                              setExpandedComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                            }
                          >
                            <MessageCircle size={15} />
                            <span>{commentList.length > 0 ? `${commentList.length} Comments` : "Comment"}</span>
                          </button>

                          {p.uid !== myUid && (
                            <button className="act-btn" onClick={() => openDMWithUser(p.uid)}>
                              <MessageSquare size={14} /> Message
                            </button>
                          )}

                          <button className="act-btn" onClick={() => handleShare(p)}>
                            <Share2 size={14} /> Share
                          </button>

                          {p.uid !== myUid && (
                            <button
                              className="act-btn"
                              style={{ marginLeft: "auto" }}
                              onClick={() => {
                                setReportModal(p.id);
                                setReportReason("");
                                setReportSent(false);
                              }}
                              title="Report post"
                            >
                              <Shield size={13} />
                            </button>
                          )}
                        </div>

                        {/* Comments Drawer */}
                        {isCommentsOpen && (
                          <div className="coms-drawer">
                            {commentList.length === 0 ? (
                              <div style={{ fontSize: 12.5, color: T.textMuted, padding: "8px 0" }}>
                                No comments yet. Be the first to spark the conversation!
                              </div>
                            ) : (
                              commentList.map((c) => (
                                <div key={c.id} className="com-row">
                                  <Avatar src={c.avatar} name={c.name} size={30} />
                                  <div className="com-bubble">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span className="com-name" style={{ marginBottom: 0 }}>{c.name || "Athlete"}</span>
                                        <span style={{ fontSize: 11, color: dark ? "rgba(148, 163, 184, 0.8)" : "#64748b", fontWeight: 600 }}>
                                          @{c.username || (c.name ? c.name.toLowerCase().replace(/\s+/g, "_") : "athlete")}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: 10.5, color: T.textMuted }}>
                                        {timeAgo(c.createdAt)}
                                      </span>
                                    </div>
                                    <div className="com-text">{c.text}</div>
                                  </div>
                                </div>
                              ))
                            )}

                            {/* Comment Input */}
                            <div className="com-input-box">
                              <input
                                className="com-input"
                                placeholder="Add an encouraging comment…"
                                value={commentInputs[p.id] || ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") submitComment(p.id);
                                }}
                              />
                              <button className="com-send-btn" onClick={() => submitComment(p.id)}>
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* ════════════ TAB 2: ATHLETES DIRECTORY ════════════ */}
            {activeTab === "members" && (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, margin: 0 }}>
                    Athletes Directory ({filteredMembers.length})
                  </h2>
                  <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
                    Connect, compare streaks, and message dedicated athletes across the world.
                  </div>
                </div>

                <div className="mem-grid">
                  {filteredMembers.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: T.textMuted }}>
                      No athletes found matching your search.
                    </div>
                  ) : (
                    filteredMembers.map((m) => (
                      <div
                        key={m.uid}
                        className="mem-card"
                        onClick={() => setSelectedAthlete(m)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{ position: "relative" }}>
                            <Avatar src={m.avatar} name={m.name} size={48} />
                            {m.online && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#22c55e",
                                  border: `2px solid ${T.bg}`,
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: T.text }}>
                                {m.name || "Athlete"}
                              </span>
                              <span style={{ fontSize: 12, color: dark ? T.textMuted : "#64748b", fontWeight: 650 }}>
                                @{m.username || (m.name ? m.name.toLowerCase().replace(/\s+/g, "_") : "athlete")}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: T.textSub, textTransform: "capitalize" }}>
                              {m.goal ? m.goal.replace(/_/g, " ") : "Fitness"}
                            </div>
                          </div>
                        </div>

                        {/* Streak Badge */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: `1px solid ${T.glassBorder}`,
                            marginBottom: 12,
                          }}
                        >
                          <span style={{ fontSize: 12, color: T.textSub }}>Current Streak:</span>
                          <span style={{ fontFamily: FONT.display, fontSize: 13, fontWeight: 800, color: "#f97316", display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <Flame size={14} color="#f97316" /> {m.streak || 0} days
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDMWithUser(m.uid);
                          }}
                          style={{
                            width: "100%",
                            padding: "9px",
                            borderRadius: 11,
                            border: `1px solid ${T.accent}30`,
                            background: T.accentSoft,
                            color: T.accent,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <MessageSquare size={14} /> Send Direct Message
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: CHALLENGES & QUESTS ════════════ */}
            {activeTab === "challenges" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, margin: 0 }}>
                      Active Challenges ({filteredChallenges.length})
                    </h2>
                    <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
                      Join daily habit protocols, build accountability, and track your streaks.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddChallenge(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      border: "none",
                      background: `linear-gradient(135deg,${T.accent},${T.purple})`,
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Plus size={15} strokeWidth={2.5} /> Create Challenge
                  </button>
                </div>

                {filteredChallenges.map((c) => {
                  const chColor = getChallengeAccent(c.color, dark);
                  return (
                    <div
                      key={c.id}
                      className="ch-card"
                      title={(c.activated || c.joined) ? "Click to view quest roadmap & daily check-in" : "Click to join this quest"}
                      onClick={() => (c.activated || c.joined) ? openChallengeDetail(c) : joinChallenge(c)}
                      style={{
                        cursor: "pointer",
                        borderLeft: `5px solid ${chColor}`,
                      }}
                    >
                      <div className="ch-hd">
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: dark ? `${chColor}24` : `${chColor}12`,
                            border: `1.5px solid ${chColor}${dark ? "38" : "30"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Trophy size={22} color={chColor} strokeWidth={2.4} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <div className="ch-title">{c.title}</div>
                            {c.official && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: "3px 9px",
                                  borderRadius: 8,
                                  background: dark ? `${chColor}22` : `${chColor}12`,
                                  color: chColor,
                                  border: `1px solid ${chColor}${dark ? "40" : "30"}`,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                ✦ OFFICIAL
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: 8,
                                background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
                                color: dark ? T.textSub : "#334155",
                                border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                              }}
                            >
                              {(c.activated || c.joined)
                                ? `Day ${c.daysCompleted || 1} of ${c.totalDays} · ${c.daysLeft}d left`
                                : `${c.totalDays} Days Quest`}
                            </span>
                          </div>
                          {c.description && <div className="ch-desc" style={{ color: dark ? T.textSub : "#334155" }}>{c.description}</div>}
                        </div>

                        <button
                          style={{
                            padding: "9px 18px",
                            borderRadius: 12,
                            border: "none",
                            background: (c.activated || c.joined)
                              ? "linear-gradient(135deg, #10b981, #059669)"
                              : `linear-gradient(135deg, ${chColor}, ${chColor}dd)`,
                            color: "#fff",
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: (c.activated || c.joined)
                              ? "0 4px 14px rgba(16,185,129,0.35)"
                              : `0 4px 14px ${chColor}45`,
                            transition: "transform 0.16s ease, box-shadow 0.16s ease",
                          }}
                          title={(c.activated || c.joined) ? "Click to view quest progress & milestones" : "Join this quest"}
                          onClick={(e) => {
                            e.stopPropagation();
                            (c.activated || c.joined) ? openChallengeDetail(c) : joinChallenge(c);
                          }}
                        >
                          {(c.activated || c.joined) ? "✓ Enrolled" : "Join Quest →"}
                        </button>
                      </div>

                      <div className="ch-prog">
                        <div
                          className="ch-fill"
                          style={{
                            width: `${c.progressPct || 0}%`,
                            background: `linear-gradient(90deg, ${chColor}, ${chColor}ee)`,
                            boxShadow: `0 2px 8px ${chColor}60`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ════════════ TAB 4: DIRECT MESSAGES ════════════ */}
            {activeTab === "messages" && (
              <div>
                {!activeDM ? (
                  <div className="side-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <h2 style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, margin: 0 }}>
                        Direct Messages
                      </h2>
                      <button
                        onClick={() => setActiveTab("members")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 10,
                          border: `1px solid ${T.accent}30`,
                          background: T.accentSoft,
                          color: T.accent,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        + Message an Athlete
                      </button>
                    </div>

                    {convList.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                        <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: T.text }}>
                          No messages yet
                        </div>
                        <div style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>
                          Connect with trainers, accountability partners, and friends!
                        </div>
                        <button
                          className="cm-create-post-btn"
                          style={{ margin: "0 auto" }}
                          onClick={() => setActiveTab("members")}
                        >
                          Find Athletes to Chat With →
                        </button>
                      </div>
                    ) : (
                      convList.map((c) => (
                        <div
                          key={c.convId}
                          onClick={() => {
                            setActiveDMUser(c.otherUser);
                            setActiveDM(c.convId);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            borderRadius: 14,
                            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: `1px solid ${T.glassBorder}`,
                            marginBottom: 8,
                            cursor: "pointer",
                            transition: "all 0.16s ease",
                          }}
                        >
                          <div style={{ position: "relative" }}>
                            <Avatar src={c.otherUser.avatar} name={c.otherUser.name} size={42} />
                            {c.otherUser.online && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  background: "#22c55e",
                                  border: `2px solid ${T.bg}`,
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: T.text }}>
                              {c.otherUser.name || "Athlete"}
                            </div>
                            <div style={{ fontSize: 12.5, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.lastMsg || "Tap to chat…"}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>
                            {timeAgo(c.lastAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Active Chat Window */
                  <div className="chat-container">
                    <div className="chat-topbar">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                          className="cm-back-btn"
                          style={{ padding: "6px 12px" }}
                          onClick={() => {
                            setActiveDM(null);
                            setActiveDMUser(null);
                            setSearchParams({ tab: "messages" });
                          }}
                        >
                          ← All Chats
                        </button>
                        <Avatar src={activeDMUser?.avatar} name={activeDMUser?.name} size={36} />
                        <div>
                          <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800 }}>
                            {activeDMUser?.name || "Athlete"}
                          </div>
                          <div style={{ fontSize: 11, color: activeDMUser?.online ? "#22c55e" : T.textMuted }}>
                            {activeDMUser?.online ? "● Active Now" : "○ Offline"}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAthlete(activeDMUser)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          color: T.text,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Profile →
                      </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="chat-messages-scroll">
                      {dmMessages.length === 0 ? (
                        <div style={{ margin: "auto", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
                          Say hello to {activeDMUser?.name || "this athlete"}! 👋
                        </div>
                      ) : (
                        dmMessages.map((m) => {
                          const isMe = m.senderUid === myUid;
                          return (
                            <div
                              key={m.id}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isMe ? "flex-end" : "flex-start",
                              }}
                            >
                              <div className={isMe ? "msg-bubble-me" : "msg-bubble-them"}>
                                {m.text}
                              </div>
                              <span style={{ fontSize: 10, color: T.textMuted, marginTop: 2, padding: "0 4px" }}>
                                {timeAgo(m.createdAt)}
                              </span>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="chat-input-row">
                      <input
                        type="text"
                        className="chat-input"
                        placeholder="Write a message… (Enter to send)"
                        value={dmMsg}
                        onChange={(e) => setDmMsg(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendDM();
                          }
                        }}
                      />
                      <button className="chat-send-action" onClick={sendDM}>
                        ↑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
            {/* Athlete Spotlight Card */}
            <div className="side-card" style={{
              background: dark
                ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))"
                : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.04))",
              borderColor: dark ? "rgba(59,130,246,0.30)" : "rgba(59,130,246,0.22)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: dark ? "#93c5fd" : "#2563eb", display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 8px", borderRadius: 6, background: "rgba(59,130,246,0.15)",
                }}>
                  <Star size={11} fill="currentColor" /> SPOTLIGHT ATHLETE
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#f97316", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Flame size={12} /> Top Streak
                </span>
              </div>
              {members.length > 0 ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                  onClick={() => setSelectedAthlete(members[0])}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar src={members[0].avatar} name={members[0].name} size={46} />
                    <div style={{
                      position: "absolute", bottom: -2, right: -2, background: "#f59e0b",
                      borderRadius: "50%", padding: 2, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${dark ? "#08090d" : "#ffffff"}`,
                    }}>
                      <Trophy size={10} color="#ffffff" />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 800, color: T.text }}>
                      {members[0].name || "Elite Athlete"}
                    </div>
                    <div style={{ fontSize: 11.5, color: T.textSub, textTransform: "capitalize", marginTop: 2 }}>
                      {members[0].goal ? members[0].goal.replace(/_/g, " ") : "Power & Hypertrophy"}
                    </div>
                    <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <TrendingUp size={11} /> {members[0].streak || 14}-day active streak
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: T.textMuted }}>Athletes directory active</div>
              )}
            </div>

            {/* Online Squad */}
            <div className="side-card">
              <div className="side-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={14} color={T.accent} />
                <span>ONLINE ATHLETES ({onlineCount})</span>
              </div>
              {members.filter((m) => m.online).length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.textMuted }}>No athletes online right now</div>
              ) : (
                members
                  .filter((m) => m.online)
                  .slice(0, 6)
                  .map((m) => (
                    <div
                      key={m.uid}
                      className="online-user-item"
                      onClick={() => setSelectedAthlete(m)}
                    >
                      <Avatar src={m.avatar} name={m.name} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: T.textSub, textTransform: "capitalize" }}>
                          {m.goal ? m.goal.replace(/_/g, " ") : "Athlete"}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDMWithUser(m.uid);
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: `1px solid ${T.accent}30`,
                          background: T.accentSoft,
                          color: T.accent,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        DM
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Active Quests Preview */}
            <div className="side-card">
              <div className="side-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={14} color={T.accent} />
                <span>ACTIVE CHALLENGES</span>
              </div>
              {challenges.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  style={{ padding: "8px 0", borderBottom: `1px solid ${T.glassBorder}`, cursor: "pointer" }}
                  onClick={() => {
                    setActiveTab("challenges");
                    setSearchParams({ tab: "challenges" });
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Award size={16} color={c.color || T.accent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>{c.title}</div>
                      <div style={{ fontSize: 10.5, color: T.textSub }}>{c.totalDays} Days Quest</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Community Standards Card */}
            <div className="side-card">
              <div className="side-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={14} color={T.accent} />
                <span>COMMUNITY STANDARDS</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>
                <div>• Respect fellow athletes and maintain supportive discourse</div>
                <div>• Evidence-based fitness and health discussions only</div>
                <div>• Celebrate consistency, personal records, and recovery</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODALS ── */}
        {/* 1. Post Creator Modal */}
        <PostCreatorModal
          isOpen={showPostCreator}
          onClose={() => setShowPostCreator(false)}
          user={user}
          myUid={myUid}
          initialFormat={creatorFormat}
          initialCategory={creatorCategory}
          onPostSuccess={(newP) => {
            setPosts((prev) => [newP, ...prev]);
            setActiveTab("feed");
          }}
          dark={dark}
          T={T}
        />

        {/* 2. Athlete Profile Preview Modal */}
        <AthleteProfileModal
          isOpen={Boolean(selectedAthlete)}
          athlete={selectedAthlete}
          onClose={() => setSelectedAthlete(null)}
          onMessage={(targetUid) => openDMWithUser(targetUid)}
          onViewFullProfile={(targetUid) => navigate(`/user/${targetUid}`)}
          currentUid={myUid}
          onEditProfile={() => {
            setSelectedAthlete(null);
            setShowEditProfileModal(true);
          }}
          dark={dark}
          T={T}
        />

        {/* 2b. Edit Athlete Profile & Handle Modal */}
        <EditAthleteModal
          isOpen={showEditProfileModal}
          user={user}
          currentUid={myUid}
          onClose={() => setShowEditProfileModal(false)}
          onSave={async (updatedData) => {
            if (updateUser) {
              await updateUser(updatedData);
            }
          }}
          dark={dark}
          T={T}
        />

        {/* 3. Article / Blog Reader Modal */}
        <ArticleReaderModal
          isOpen={Boolean(selectedArticle)}
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onAuthorClick={(uid) => {
            setSelectedArticle(null);
            setSelectedAthlete({ uid });
          }}
          dark={dark}
          T={T}
        />

        {/* 4. Report Modal */}
        {reportModal && (
          <div
            onClick={() => setReportModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: dark ? "#0a0d18" : "#fff",
                border: `1px solid ${T.glassBorder}`,
                borderRadius: 20,
                padding: 24,
                width: 340,
                color: T.text,
              }}
            >
              {reportSent ? (
                <div style={{ color: "#22c55e", textAlign: "center", fontWeight: 700, padding: 12 }}>
                  ✓ Report submitted. Thank you for keeping our community safe!
                </div>
              ) : (
                <>
                  <h3 style={{ margin: "0 0 8px", fontFamily: FONT.display }}>Report Post</h3>
                  <div style={{ fontSize: 12.5, color: T.textSub, marginBottom: 14 }}>
                    Why are you reporting this post?
                  </div>
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportReason(r)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: `1px solid ${reportReason === r ? "#ef4444" : T.glassBorder}`,
                        background: reportReason === r ? "rgba(239,68,68,0.1)" : "transparent",
                        color: reportReason === r ? "#ef4444" : T.textSub,
                        fontSize: 12.5,
                        fontWeight: 600,
                        textAlign: "left",
                        cursor: "pointer",
                        marginBottom: 6,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => setReportModal(null)}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${T.glassBorder}`, background: "transparent", color: T.textSub, fontWeight: 700, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={!reportReason}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: reportReason ? 1 : 0.5 }}
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 5. Create Challenge Modal */}
        {showAddChallenge && (
          <div
            onClick={() => setShowAddChallenge(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: dark ? "#0a0d18" : "#fff",
                border: `1px solid ${T.glassBorder}`,
                borderRadius: 24,
                padding: 26,
                width: 440,
                color: T.text,
              }}
            >
              <h3 style={{ margin: "0 0 6px", fontFamily: FONT.display, fontSize: 18, fontWeight: 800 }}>
                Create a Community Challenge
              </h3>
              <div style={{ fontSize: 12.5, color: T.textSub, marginBottom: 16 }}>
                Challenge other athletes to a habit or workout quest!
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 4 }}>
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100 Squats a Day for 21 Days"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge((p) => ({ ...p, title: e.target.value }))}
                  style={{ width: "100%", height: 42, borderRadius: 10, border: `1px solid ${T.glassBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: T.text, padding: "0 12px", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  placeholder="What are the daily rules?"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.glassBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: T.text, padding: "10px 12px", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 4 }}>
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newChallenge.emoji}
                    onChange={(e) => setNewChallenge((p) => ({ ...p, emoji: e.target.value }))}
                    style={{ width: "100%", height: 42, borderRadius: 10, border: `1px solid ${T.glassBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: T.text, textAlign: "center", fontSize: 20, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 4 }}>
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={100}
                    value={newChallenge.totalDays}
                    onChange={(e) => setNewChallenge((p) => ({ ...p, totalDays: Number(e.target.value) }))}
                    style={{ width: "100%", height: 42, borderRadius: 10, border: `1px solid ${T.glassBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: T.text, padding: "0 12px", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowAddChallenge(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.glassBorder}`, background: "transparent", color: T.textSub, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  disabled={!newChallenge.title.trim() || addingChallenge}
                  onClick={async () => {
                    if (!newChallenge.title.trim()) return;
                    setAddingChallenge(true);
                    try {
                      await addDoc(collection(db, "challenges"), {
                        ...newChallenge,
                        daysLeft: newChallenge.totalDays,
                        participants: [myUid],
                        createdBy: user.name || "Athlete",
                        createdByUid: myUid,
                        official: false,
                        createdAt: serverTimestamp(),
                      });
                      setShowAddChallenge(false);
                      setNewChallenge({ title: "", emoji: "⚡", color: "#0a84ff", totalDays: 30, description: "" });
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setAddingChallenge(false);
                    }
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},${T.purple})`, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: newChallenge.title.trim() ? 1 : 0.5 }}
                >
                  {addingChallenge ? "Creating…" : "Launch Quest →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Challenge Detail & Progress Tracker Modal */}
        {activeChallengeDetail && (
          <div
            onClick={() => setActiveChallengeDetail(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.78)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: dark ? "#0d111d" : "#ffffff",
                border: `1.5px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                borderRadius: 24,
                padding: "26px 24px",
                width: "100%",
                maxWidth: 520,
                maxHeight: "90vh",
                overflowY: "auto",
                color: dark ? T.text : "#0f172a",
                boxShadow: dark
                  ? "0 24px 60px rgba(0,0,0,0.6)"
                  : "0 20px 48px -8px rgba(15,23,42,0.16)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: dark ? `${activeChallengeDetail.color}25` : `${activeChallengeDetail.color}15`,
                      border: `1.5px solid ${activeChallengeDetail.color}${dark ? "40" : "30"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Trophy size={26} color={activeChallengeDetail.color} strokeWidth={2.4} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontFamily: FONT.display, fontSize: 18, fontWeight: 900, color: dark ? T.text : "#0f172a" }}>
                        {activeChallengeDetail.title}
                      </h3>
                      {activeChallengeDetail.official && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: `${activeChallengeDetail.color}20`,
                            color: activeChallengeDetail.color,
                            border: `1px solid ${activeChallengeDetail.color}40`,
                          }}
                        >
                          ✦ OFFICIAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: dark ? T.textSub : "#64748b", marginTop: 4 }}>
                      Quest Duration: {activeChallengeDetail.totalDays} Days · {activeChallengeDetail.createdBy || "AshFitVerse"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChallengeDetail(null)}
                  style={{
                    background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#cbd5e1"}`,
                    borderRadius: 10,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: dark ? T.textSub : "#475569",
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Description */}
              {activeChallengeDetail.description && (
                <div
                  style={{
                    background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: dark ? T.textSub : "#334155",
                    marginBottom: 18,
                  }}
                >
                  {activeChallengeDetail.description}
                </div>
              )}

              {/* Stats Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
                    borderRadius: 14,
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: dark ? T.textMuted : "#64748b", textTransform: "uppercase" }}>Completed</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: activeChallengeDetail.color, marginTop: 4 }}>
                    Day {activeChallengeDetail.daysCompleted || 1}
                  </div>
                  <div style={{ fontSize: 10.5, color: dark ? T.textSub : "#64748b" }}>of {activeChallengeDetail.totalDays} Days</div>
                </div>

                <div
                  style={{
                    background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
                    borderRadius: 14,
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: dark ? T.textMuted : "#64748b", textTransform: "uppercase" }}>Remaining</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#f97316", marginTop: 4 }}>
                    {activeChallengeDetail.daysLeft}
                  </div>
                  <div style={{ fontSize: 10.5, color: dark ? T.textSub : "#64748b" }}>Days Left</div>
                </div>

                <div
                  style={{
                    background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
                    borderRadius: 14,
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: dark ? T.textMuted : "#64748b", textTransform: "uppercase" }}>Progress</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>
                    {activeChallengeDetail.progressPct || 0}%
                  </div>
                  <div style={{ fontSize: 10.5, color: dark ? T.textSub : "#64748b" }}>Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8, color: dark ? T.textSub : "#475569" }}>
                  <span>Overall Quest Completion</span>
                  <span>{activeChallengeDetail.progressPct || 0}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 99, background: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${activeChallengeDetail.progressPct || 0}%`,
                      background: `linear-gradient(90deg, ${activeChallengeDetail.color}, #10b981)`,
                      borderRadius: 99,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* Daily Check-In Action Button */}
              <div style={{ marginBottom: 22 }}>
                {activeChallengeDetail.lastCheckIn === todayStr() ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px",
                      borderRadius: 14,
                      background: "rgba(16,185,129,0.12)",
                      border: "1.5px solid rgba(16,185,129,0.35)",
                      color: "#10b981",
                      fontWeight: 800,
                      fontSize: 13.5,
                      textAlign: "center",
                    }}
                  >
                    <span>✓</span>
                    <span>You're checked in for today! Streak maintained 🔥</span>
                  </div>
                ) : (
                  <button
                    onClick={() => checkInChallenge(activeChallengeDetail)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 14,
                      border: "none",
                      background: `linear-gradient(135deg, ${activeChallengeDetail.color}, #059669)`,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 18px rgba(16,185,129,0.35)",
                      transition: "transform 0.16s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span>⚡</span>
                    <span>Check In for Today (Day {(activeChallengeDetail.daysCompleted || 0) + 1})</span>
                  </button>
                )}
              </div>

              {/* Habit Milestone Grid */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: dark ? T.textSub : "#64748b", marginBottom: 10, letterSpacing: "0.04em" }}>
                  Daily Milestone Tracker (1 – {activeChallengeDetail.totalDays} Days)
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
                    gap: 7,
                  }}
                >
                  {Array.from({ length: activeChallengeDetail.totalDays }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isCompleted = dayNum <= (activeChallengeDetail.daysCompleted || 0);
                    const isToday = dayNum === (activeChallengeDetail.daysCompleted || 0) + 1 && activeChallengeDetail.lastCheckIn !== todayStr();
                    return (
                      <div
                        key={dayNum}
                        title={`Day ${dayNum}${isCompleted ? " (Completed)" : isToday ? " (Today)" : ""}`}
                        style={{
                          height: 36,
                          borderRadius: 9,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11.5,
                          fontWeight: 800,
                          background: isCompleted
                            ? "#10b981"
                            : isToday
                            ? dark ? "rgba(59,130,246,0.2)" : "#eff6ff"
                            : dark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                          color: isCompleted
                            ? "#ffffff"
                            : isToday
                            ? activeChallengeDetail.color
                            : dark ? T.textMuted : "#94a3b8",
                          border: isCompleted
                            ? "none"
                            : isToday
                            ? `1.5px solid ${activeChallengeDetail.color}`
                            : `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                        }}
                      >
                        {isCompleted ? "✓" : dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Bottom Navigation Dock */}
        <div className="mobile-bottom-dock">
          <button
            className="mbd-item"
            onClick={() => navigate("/dashboard")}
            aria-label="Dashboard"
          >
            <span className="mbd-icon">🏠</span>
            <span className="mbd-lbl">Home</span>
          </button>
          <button
            className="mbd-item active"
            onClick={() => { setActiveTab("feed"); setSearchParams({ tab: "feed" }); }}
            aria-label="Community"
          >
            <span className="mbd-icon">👥</span>
            <span className="mbd-lbl">Community</span>
          </button>
          <button
            className="mbd-item"
            onClick={() => navigate("/workout-logger")}
            aria-label="Workouts"
          >
            <span className="mbd-icon">🏋️</span>
            <span className="mbd-lbl">Workouts</span>
          </button>
          <button
            className="mbd-item"
            onClick={() => navigate("/diet-logger")}
            aria-label="Diet"
          >
            <span className="mbd-icon">🥗</span>
            <span className="mbd-lbl">Diet</span>
          </button>
          <button
            className="mbd-item"
            onClick={() => setSelectedAthlete(user)}
            aria-label="Profile"
          >
            <span className="mbd-icon">👤</span>
            <span className="mbd-lbl">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}