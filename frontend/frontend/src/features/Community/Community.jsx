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
import PostCreatorModal from "../../components/PostCreatorModal";
import ArticleReaderModal from "../../components/ArticleReaderModal";

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

const POST_COLORS = {
  workout: { bg: "rgba(10,132,255,0.1)", border: "rgba(10,132,255,0.25)", tag: "#0a84ff", label: "💪 Workout" },
  diet: { bg: "rgba(48,209,88,0.1)", border: "rgba(48,209,88,0.25)", tag: "#30d158", label: "🥗 Nutrition" },
  pr: { bg: "rgba(191,90,242,0.1)", border: "rgba(191,90,242,0.25)", tag: "#bf5af2", label: "🏆 New PR" },
  wellness: { bg: "rgba(255,55,95,0.1)", border: "rgba(255,55,95,0.25)", tag: "#ff375f", label: "🧘 Wellness" },
  milestone: { bg: "rgba(255,159,10,0.1)", border: "rgba(255,159,10,0.25)", tag: "#ff9f0a", label: "🏅 Milestone" },
  discussion: { bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.25)", tag: "#38bdf8", label: "💬 Discussion" },
};

const FORMAT_BADGES = {
  photo: { label: "📸 Photo Post", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
  video: { label: "🎥 Video Clip", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)" },
  blog: { label: "📝 Story & Article", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  pr: { label: "🏆 PR Milestone", color: "#ec4899", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)" },
  quick: { label: "💬 Community Update", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" },
};

function getPostFormatInfo(post) {
  if (!post) return FORMAT_BADGES.quick;
  if (post.mediaType === "blog" || post.blogTitle) return FORMAT_BADGES.blog;
  if (post.mediaType === "video" || post.videoUrl) return FORMAT_BADGES.video;
  if (post.mediaType === "image" || (post.mediaUrl && post.mediaType !== "video" && post.mediaType !== "blog")) return FORMAT_BADGES.photo;
  if (post.type === "pr" || post.category === "pr") return FORMAT_BADGES.pr;
  return FORMAT_BADGES.quick;
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
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Inappropriate content",
  "Harassment or bullying",
  "False health info",
  "Other",
];

const DEFAULT_CHALLENGES = [
  { id: "default_1", title: "30-Day Push-up Challenge", emoji: "💪", color: "#0a84ff", totalDays: 30, daysLeft: 22, description: "Do at least 50 push-ups every day for 30 days. Track your reps and build upper body strength!", createdBy: "AshFitVerse", official: true, participants: [] },
  { id: "default_2", title: "10K Steps Daily", emoji: "🚶", color: "#30d158", totalDays: 14, daysLeft: 9, description: "Walk 10,000 steps every day. Consistency beats intensity!", createdBy: "AshFitVerse", official: true, participants: [] },
  { id: "default_3", title: "Clean Eating Week", emoji: "🥗", color: "#bf5af2", totalDays: 7, daysLeft: 4, description: "No junk food, no sugar, no processed meals for 7 days. Home-cooked only!", createdBy: "AshFitVerse", official: true, participants: [] },
  { id: "default_4", title: "21-Day Plank Challenge", emoji: "🧱", color: "#ff9f0a", totalDays: 21, daysLeft: 18, description: "Hold a plank for at least 60 seconds every day. Build solid core strength!", createdBy: "AshFitVerse", official: true, participants: [] },
  { id: "default_5", title: "5AM Club — 7 Days", emoji: "🌅", color: "#ffd60a", totalDays: 7, daysLeft: 5, description: "Wake up at 5 AM and complete a 30-min morning routine. Discipline starts at dawn!", createdBy: "AshFitVerse", official: true, participants: [] },
  { id: "default_6", title: "3L Water Daily", emoji: "💧", color: "#5ac8fa", totalDays: 14, daysLeft: 11, description: "Drink at least 3 litres of water every day. Stay hydrated and sharp!", createdBy: "AshFitVerse", official: true, participants: [] },
];

const CHALLENGE_STORAGE_KEY = "ashfitverse_challenge_progress";
function loadChallengeProgress() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveChallengeProgress(data) {
  localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(data));
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

function getChallengeStats(c, progress) {
  const prog = progress[c.id];
  if (!prog?.joinedAt) return { joined: false, daysCompleted: 0, daysLeft: c.daysLeft, pct: 0 };
  const elapsed = Math.floor((Date.now() - new Date(prog.joinedAt)) / 86400000);
  const daysCompleted = prog.daysCompleted || Math.min(elapsed + 1, c.totalDays);
  const daysLeft = Math.max(0, c.totalDays - daysCompleted);
  const pct = Math.min(100, Math.round((daysCompleted / Math.max(c.totalDays, 1)) * 100));
  return { joined: true, daysCompleted, daysLeft, pct, lastCheckIn: prog.lastCheckIn };
}

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
  const { user } = useUser();

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
    } else {
      try {
        await updateDoc(doc(db, "challenges", challenge.id), { participants: arrayUnion(myUid) });
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
    if (!challenge?.activated) return;
    const today = todayStr();
    if (challenge.id.startsWith("default_")) {
      const prog = challengeProgress[challenge.id] || {};
      if (prog.lastCheckIn === today) return;
      const daysCompleted = Math.min((prog.daysCompleted || 0) + 1, challenge.totalDays);
      const updated = { ...challengeProgress, [challenge.id]: { ...prog, daysCompleted, lastCheckIn: today } };
      setChallengeProgress(updated);
      saveChallengeProgress(updated);
      const daysLeft = Math.max(0, challenge.totalDays - daysCompleted);
      setActiveChallengeDetail((p) =>
        p ? { ...p, daysCompleted, daysLeft, progressPct: Math.round((daysCompleted / Math.max(challenge.totalDays, 1)) * 100), lastCheckIn: today } : p
      );
    }
  };

  const openChallengeDetail = (challenge) => {
    if (!challenge.activated) return;
    setActiveChallengeDetail(challenge);
  };

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

  // ── CSS ──────────────────────────────────────────────────────────────────
  const css = generateCSS(T, dark) + `
    .cm{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.6s ease,background 0.4s;}

    /* ── STICKY MODERN HEADER ── */
    .cm-hd{
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 32px;
      background:${dark?"rgba(8,11,20,0.88)":"rgba(255,255,255,0.88)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(36px);
      position:sticky;top:0;z-index:40;
    }
    .cm-hd-left{display:flex;align-items:center;gap:14px;}
    .cm-back-btn{
      display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:12px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.textSub};font-size:13px;font-weight:700;cursor:pointer;
      font-family:${FONT.body};transition:all 0.16s;
    }
    .cm-back-btn:hover{color:${T.accent};border-color:${T.accent}40;background:${T.accentSoft};}
    .cm-brand{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};display:flex;align-items:center;gap:8px;}
    .cm-brand span{color:${T.accent};}
    .cm-brand-tag{font-size:10px;font-weight:800;letter-spacing:0.08em;padding:3px 8px;border-radius:6px;background:${T.accentSoft};color:${T.accent};text-transform:uppercase;}

    .cm-hd-right{display:flex;align-items:center;gap:10px;}
    .cm-create-post-btn{
      padding:9px 18px;border-radius:12px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:13px;font-weight:800;cursor:pointer;
      display:flex;align-items:center;gap:6px;box-shadow:0 4px 16px ${T.accent}30;
      transition:transform 0.16s ease,box-shadow 0.16s ease;
    }
    .cm-create-post-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px ${T.accent}45;}

    .cm-online-pill{
      display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;
      background:${dark?"rgba(48,209,88,0.10)":"rgba(48,209,88,0.08)"};
      border:1px solid rgba(48,209,88,0.25);font-size:12px;font-weight:700;color:#30d158;
    }
    .g-dot{width:8px;height:8px;border-radius:50%;background:#30d158;
      box-shadow:0 0 8px #30d158;animation:gpulse 2s ease infinite;}
    @keyframes gpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.85);}}

    .cm-icon-btn{
      width:38px;height:38px;border-radius:12px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:15px;position:relative;transition:all 0.15s;
    }
    .cm-icon-btn:hover{border-color:${T.accent}40;color:${T.accent};}
    .cm-ndot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:#ff375f;}

    /* ── SUB-NAVBAR & TAB SWITCHER ── */
    .sub-nav{
      display:flex;align-items:center;justify-content:space-between;
      padding:12px 32px;
      border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(6,9,16,0.6)":"rgba(250,250,252,0.6)"};
      backdrop-filter:blur(20px);
      gap:16px;flex-wrap:wrap;
    }
    .nav-tabs{display:flex;align-items:center;gap:8px;overflow-x:auto;padding-bottom:2px;}
    .nav-tab-btn{
      padding:8px 16px;border-radius:12px;border:1px solid transparent;
      background:transparent;color:${T.textSub};font-size:13px;font-weight:700;
      cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;
      transition:all 0.18s ease;font-family:${FONT.body};
    }
    .nav-tab-btn:hover{color:${T.text};background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};}
    .nav-tab-btn.act{
      background:${T.accentSoft};color:${T.accent};border-color:${T.accent}40;
    }
    .nav-badge{
      font-size:10px;font-weight:800;padding:2px 6px;border-radius:99px;
      background:${T.accent};color:#fff;margin-left:2px;
    }

    /* ── LAYOUT BODY ── */
    .cm-body{display:grid;grid-template-columns:1fr 340px;gap:26px;max-width:1200px;margin:0 auto;padding:26px 32px 60px;}

    /* ── ACTIVE RICH INLINE COMPOSER ── */
    .inline-composer{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:18px 22px;margin-bottom:22px;backdrop-filter:blur(30px);
      box-shadow:0 10px 32px rgba(0,0,0,0.14);display:flex;flex-direction:column;gap:14px;
      transition:border-color 0.2s ease;
    }
    .inline-composer:focus-within{border-color:${T.accent}60;}
    .ic-format-tabs{display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:2px;}
    .ic-tab-btn{
      padding:8px 13px;border-radius:12px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      color:${T.textSub};font-size:12px;font-weight:700;cursor:pointer;
      display:flex;align-items:center;gap:6px;white-space:nowrap;transition:all 0.18s ease;
    }
    .ic-tab-btn:hover{color:${T.text};border-color:${T.accent}40;}
    .ic-tab-btn.active{
      background:${T.accentSoft};color:${T.accent};border-color:${T.accent};
      box-shadow:0 2px 10px ${T.accent}25;
    }
    .ic-status-bar{
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
      padding:8px 14px;border-radius:12px;
      background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      border:1px solid ${T.glassBorder};
    }
    .ic-status-badge{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:${T.textSub};}
    .ic-cat-pills{display:flex;align-items:center;gap:6px;overflow-x:auto;}
    .ic-cat-pill{
      padding:4px 10px;border-radius:8px;border:1px solid ${T.glassBorder};
      background:transparent;font-size:11px;font-weight:700;cursor:pointer;
      color:${T.textMuted};transition:all 0.15s ease;white-space:nowrap;
    }
    .ic-cat-pill:hover{color:${T.text};border-color:rgba(255,255,255,0.25);}
    .ic-cat-pill.active{
      background:${dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)"};
      color:${T.text};border-color:currentColor;
    }
    .ic-media-zone{display:flex;flex-direction:column;gap:10px;}
    .ic-caption-area{
      width:100%;min-height:80px;border-radius:14px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.01)"};
      padding:12px 14px;color:${T.text};font-size:13.5px;line-height:1.55;
      font-family:${FONT.body};resize:vertical;outline:none;transition:border-color 0.2s ease;
    }
    .ic-caption-area:focus{border-color:${T.accent}80;}
    .ic-bottom{
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
      padding-top:4px;
    }
    .ic-emojis{display:flex;align-items:center;gap:6px;}
    .ic-emoji-btn{background:none;border:none;font-size:16px;cursor:pointer;padding:4px;border-radius:6px;transition:transform 0.12s;}
    .ic-emoji-btn:hover{transform:scale(1.25);}

    /* ── HIGH VISIBILITY FEED FILTER BAR ── */
    .feed-filter-bar{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:14px 18px;margin-bottom:22px;backdrop-filter:blur(24px);
      box-shadow:0 6px 24px rgba(0,0,0,0.12);
    }
    .ff-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .ff-title{
      font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;
      color:${T.textMuted};display:flex;align-items:center;gap:6px;
    }
    .ff-count-tag{font-size:11px;font-weight:700;color:${T.textSub};}
    .ff-chips-row{
      display:flex;align-items:center;gap:8px;overflow-x:auto;padding-bottom:4px;
      scrollbar-width:thin;
    }
    .ff-chip{
      padding:7px 14px;border-radius:11px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      color:${T.textSub};font-size:12px;font-weight:700;cursor:pointer;
      display:inline-flex;align-items:center;gap:6px;white-space:nowrap;transition:all 0.2s ease;
    }
    .ff-chip:hover{
      color:${T.text};border-color:${T.accent}50;
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};
    }
    .ff-chip.active{
      background:${T.accentSoft};border-color:${T.accent};color:${T.accent};
      box-shadow:0 4px 14px ${T.accent}30;
    }
    .ff-chip-count{
      font-size:10px;font-weight:800;padding:2px 6px;border-radius:99px;
      background:${dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)"};color:${T.textSub};
    }
    .ff-chip.active .ff-chip-count{background:${T.accent};color:#fff;}

    /* ── POST CARD ── */
    .post-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:22px;margin-bottom:20px;backdrop-filter:blur(30px);
      box-shadow:0 8px 30px rgba(0,0,0,0.12);transition:all 0.22s ease;
      animation:fadeUp 0.35s ease both;
    }
    .post-card:hover{border-color:${T.glassBorderHover};transform:translateY(-1px);}

    .post-hd{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
    .post-meta{flex:1;min-width:0;}
    .post-name-row{display:flex;align-items:center;gap:8px;}
    .post-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};cursor:pointer;}
    .post-name:hover{color:${T.accent};}
    .post-time{font-size:11.5px;color:${T.textMuted};margin-top:2px;}
    .post-tag{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;letter-spacing:0.04em;}

    .post-body{font-size:14.5px;line-height:1.6;color:${T.text};margin-bottom:14px;white-space:pre-line;}

    /* Media views */
    .post-media-container{border-radius:16px;overflow:hidden;margin-bottom:16px;background:rgba(0,0,0,0.2);position:relative;border:1px solid ${T.glassBorder};}
    .post-media-img{width:100%;max-height:460px;object-fit:cover;display:block;cursor:pointer;}
    .post-media-video{width:100%;max-height:460px;display:block;}

    /* Blog Card View */
    .blog-embed-card{
      border-radius:18px;overflow:hidden;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};
      margin-bottom:16px;cursor:pointer;transition:border-color 0.2s ease;
    }
    .blog-embed-card:hover{border-color:${T.accent}60;}
    .blog-cover-img{width:100%;height:180px;object-fit:cover;display:block;}
    .blog-content-pad{padding:16px 20px;}
    .blog-embed-title{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};margin-bottom:8px;line-height:1.3;}
    .blog-embed-snippet{font-size:13px;color:${T.textSub};line-height:1.5;margin-bottom:12px;}
    .blog-read-btn{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:${T.accent};}

    /* Actions */
    .post-acts{display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid ${T.glassBorder};flex-wrap:wrap;}
    .act-btn{
      display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;
      border:1px solid transparent;background:transparent;color:${T.textSub};
      font-size:12.5px;font-weight:700;cursor:pointer;transition:all 0.16s ease;
      font-family:${FONT.body};
    }
    .act-btn:hover{background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};color:${T.text};}
    .act-btn.liked{color:#ff375f;background:rgba(255,55,95,0.09);border-color:rgba(255,55,95,0.22);}

    /* Comments Drawer */
    .coms-drawer{margin-top:14px;padding-top:14px;border-top:1px solid ${T.glassBorder};}
    .com-row{display:flex;gap:10px;margin-bottom:10px;}
    .com-bubble{flex:1;background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};border:1px solid ${T.glassBorder};border-radius:14px;padding:10px 14px;}
    .com-name{font-size:12px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .com-text{font-size:13px;color:${T.textSub};line-height:1.4;}
    .com-input-box{display:flex;gap:10px;margin-top:12px;}
    .com-input{flex:1;height:40px;border-radius:12px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};color:${T.text};padding:0 14px;font-size:13px;outline:none;}
    .com-send-btn{padding:0 14px;border-radius:12px;border:none;background:${T.accent};color:#fff;font-weight:700;cursor:pointer;}

    /* ── DIRECT MESSAGES ── */
    .chat-container{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:24px;
      overflow:hidden;backdrop-filter:blur(36px);display:flex;flex-direction:column;
      height:680px;box-shadow:0 12px 40px rgba(0,0,0,0.18);
    }
    .chat-topbar{
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 20px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(8,11,20,0.7)":"rgba(255,255,255,0.7)"};
    }
    .chat-messages-scroll{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;}
    .msg-bubble-me{
      align-self:flex-end;max-width:70%;padding:11px 16px;border-radius:16px 16px 4px 16px;
      background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;
      font-size:13.5px;line-height:1.45;word-break:break-word;box-shadow:0 4px 14px ${T.accent}30;
    }
    .msg-bubble-them{
      align-self:flex-start;max-width:70%;padding:11px 16px;border-radius:16px 16px 16px 4px;
      background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)"};color:${T.text};
      border:1px solid ${T.glassBorder};font-size:13.5px;line-height:1.45;word-break:break-word;
    }
    .chat-input-row{
      display:flex;align-items:center;gap:10px;padding:14px 20px;
      border-top:1px solid ${T.glassBorder};background:${dark?"rgba(8,11,20,0.7)":"rgba(255,255,255,0.7)"};
    }
    .chat-input{
      flex:1;height:44px;border-radius:12px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};padding:0 16px;font-size:13.5px;outline:none;
    }
    .chat-send-action{
      width:44px;height:44px;border-radius:12px;border:none;background:${T.accent};
      color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    }

    /* Members Grid */
    .mem-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:16px;}
    .mem-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:20px;backdrop-filter:blur(30px);transition:all 0.22s ease;
      cursor:pointer;
    }
    .mem-card:hover{border-color:${T.glassBorderHover};transform:translateY(-2px);}

    /* Challenges Cards */
    .ch-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:20px;margin-bottom:14px;backdrop-filter:blur(30px);transition:all 0.2s ease;
    }
    .ch-card:hover{border-color:${T.glassBorderHover};}
    .ch-hd{display:flex;align-items:flex-start;gap:14px;}
    .ch-emoji{font-size:32px;}
    .ch-title{font-family:${FONT.display};font-size:17px;font-weight:800;color:${T.text};margin-bottom:4px;}
    .ch-desc{font-size:12.5px;color:${T.textSub};line-height:1.5;margin-top:6px;}
    .ch-prog{height:6px;border-radius:99px;background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};overflow:hidden;margin-top:14px;}
    .ch-fill{height:100%;border-radius:99px;}

    /* Sidebar Cards */
    .side-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:20px;margin-bottom:16px;backdrop-filter:blur(30px);
    }
    .side-title{font-family:${FONT.display};font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}
    .online-user-item{
      display:flex;align-items:center;gap:10px;padding:8px 0;
      border-bottom:1px solid ${T.glassBorder};cursor:pointer;transition:all 0.15s ease;
    }
    .online-user-item:last-child{border-bottom:none;}
    .online-user-item:hover .oui-name{color:${T.accent};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.cm-body{grid-template-columns:1fr;}.cm-body>div:last-child{order:-1;}}
    @media(max-width:600px){.cm-hd{padding:12px 16px;}.sub-nav{padding:10px 16px;}.cm-body{padding:16px 14px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="cm">
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* Share toast */}
        {shareToast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: dark ? "rgba(8,11,20,0.96)" : "#ffffff", border: "1px solid #22c55e", padding: "10px 22px", borderRadius: 99, color: "#22c55e", fontWeight: 700, zIndex: 99999, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>✓ Post link copied to clipboard!</div>}

        {/* ── TOP NAV HEADER ── */}
        <div className="cm-hd">
          <div className="cm-hd-left">
            <button className="cm-back-btn" onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
            <div className="cm-brand">
              Fit<span>Verse</span>
              <span className="cm-brand-tag">Community</span>
            </div>
          </div>

          <div className="cm-hd-right">
            <button className="cm-create-post-btn" onClick={() => setShowPostCreator(true)}>
              <span>＋</span> Create Post
            </button>

            <div className="cm-online-pill">
              <div className="g-dot" />
              {onlineCount + 1} online
            </div>

            <button className="cm-icon-btn" onClick={toggleTheme}>
              {dark ? "🌙" : "☀️"}
            </button>

            <div style={{ cursor: "pointer" }} onClick={() => setSelectedAthlete(user)}>
              <Avatar src={user?.avatar} name={user?.name} size={36} />
            </div>
          </div>
        </div>

        {/* ── SUB-NAVBAR TABS ── */}
        <div className="sub-nav">
          <div className="nav-tabs">
            {[
              { id: "feed", label: "📢 All Feed", icon: "📢" },
              { id: "members", label: "👥 Athletes Directory", icon: "👥" },
              { id: "challenges", label: "⚡ Challenges & Quests", icon: "⚡" },
              { id: "messages", label: "💬 Messages", icon: "💬", badge: unreadDMs },
            ].map((t) => (
              <button
                key={t.id}
                className={`nav-tab-btn ${activeTab === t.id ? "act" : ""}`}
                onClick={() => {
                  setActiveTab(t.id);
                  setSearchParams({ tab: t.id });
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.badge > 0 && <span className="nav-badge">{t.badge}</span>}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 220 }}>
            <input
              type="text"
              placeholder="Search feed, athletes, blogs…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{
                height: 38,
                borderRadius: 10,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: T.text,
                padding: "0 12px",
                fontSize: 12.5,
                outline: "none",
                width: "100%",
              }}
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ("")}
                style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="cm-body">
          {/* Main Content (Left) */}
          <div>
            {/* ════════════ TAB 1: FEED ════════════ */}
            {activeTab === "feed" && (
              <>
                {/* Active Rich Inline Composer */}
                <div className="inline-composer">
                  {/* Top: Athlete info & Format Switcher */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar src={user?.avatar} name={user?.name} size={40} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                          {user?.name || "Athlete"}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>
                          Share updates with community
                        </div>
                      </div>
                    </div>

                    {/* Format Selector Tabs */}
                    <div className="ic-format-tabs">
                      {[
                        { id: "photo", label: "📸 Photo" },
                        { id: "video", label: "🎥 Video" },
                        { id: "blog", label: "📝 Article" },
                        { id: "pr", label: "🏆 New PR" },
                        { id: "quick", label: "💬 Update" },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          className={`ic-tab-btn ${inlineFormat === fmt.id ? "active" : ""}`}
                          onClick={() => {
                            setInlineFormat(fmt.id);
                            if (fmt.id === "pr") setInlineCategory("pr");
                          }}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Banner & Topic Selector */}
                  <div className="ic-status-bar">
                    <div className="ic-status-badge">
                      <span>✨ Drafting:</span>
                      <span
                        style={{
                          background: T.accentSoft,
                          color: T.accent,
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 800,
                        }}
                      >
                        {inlineFormat === "photo" && "📸 Photo Post"}
                        {inlineFormat === "video" && "🎥 Video Clip"}
                        {inlineFormat === "blog" && "📝 Fitness Article"}
                        {inlineFormat === "pr" && "🏆 PR Milestone"}
                        {inlineFormat === "quick" && "💬 Quick Update"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>Topic:</span>
                      <div className="ic-cat-pills">
                        {[
                          { id: "workout", label: "💪 Workout" },
                          { id: "diet", label: "🥗 Nutrition" },
                          { id: "pr", label: "🏆 New PR" },
                          { id: "wellness", label: "🧘 Wellness" },
                          { id: "milestone", label: "🏅 Milestone" },
                          { id: "discussion", label: "💬 Discussion" },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className={`ic-cat-pill ${inlineCategory === cat.id ? "active" : ""}`}
                            onClick={() => setInlineCategory(cat.id)}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Format Inputs */}
                  {/* 1. Photo Mode */}
                  {inlineFormat === "photo" && (
                    <div className="ic-media-zone">
                      <input
                        type="file"
                        ref={inlineFileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleInlineImageFile}
                      />
                      {!inlineImagePreview && !inlineMediaUrl ? (
                        <div
                          onClick={() => inlineFileInputRef.current?.click()}
                          style={{
                            border: `1.5px dashed ${T.accent}50`,
                            borderRadius: 14,
                            padding: "16px 20px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: dark ? "rgba(10,132,255,0.04)" : "rgba(10,132,255,0.02)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                          }}
                        >
                          <span style={{ fontSize: 24 }}>📸</span>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>
                              {inlineUploading ? "Optimizing image…" : "Click to select a photo from your device"}
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted }}>
                              PNG, JPG, WEBP · Auto-compressed for instant loading
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", maxHeight: 220 }}>
                          <img
                            src={inlineImagePreview || inlineMediaUrl}
                            alt="Selected preview"
                            style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setInlineImagePreview("");
                              setInlineMediaUrl("");
                            }}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              padding: "4px 10px",
                              borderRadius: 8,
                              border: "none",
                              background: "rgba(0,0,0,0.7)",
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            ✕ Remove Photo
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Or paste direct image URL (https://...)"
                        value={inlineMediaUrl}
                        onChange={(e) => {
                          setInlineMediaUrl(e.target.value);
                          setInlineImagePreview(e.target.value);
                        }}
                        style={{
                          width: "100%",
                          height: 36,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* 2. Video Mode */}
                  {inlineFormat === "video" && (
                    <div className="ic-media-zone">
                      <input
                        type="text"
                        placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...) or MP4 URL"
                        value={inlineVideoUrl}
                        onChange={(e) => setInlineVideoUrl(e.target.value)}
                        style={{
                          width: "100%",
                          height: 40,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 12.5,
                          outline: "none",
                        }}
                      />
                      {getYouTubeEmbedUrl(inlineVideoUrl) && (
                        <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", maxHeight: 240 }}>
                          <iframe
                            src={getYouTubeEmbedUrl(inlineVideoUrl)}
                            title="Video Preview"
                            style={{ width: "100%", height: "100%", border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Blog Mode */}
                  {inlineFormat === "blog" && (
                    <div className="ic-media-zone">
                      <input
                        type="text"
                        placeholder="Article Headline / Title (e.g. How I Gained 5kg Clean Muscle)"
                        value={inlineBlogTitle}
                        onChange={(e) => setInlineBlogTitle(e.target.value)}
                        style={{
                          width: "100%",
                          height: 42,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 13.5,
                          fontWeight: 700,
                          outline: "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Cover Image URL (optional)"
                        value={inlineMediaUrl}
                        onChange={(e) => setInlineMediaUrl(e.target.value)}
                        style={{
                          width: "100%",
                          height: 36,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* 4. PR Mode */}
                  {inlineFormat === "pr" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input
                        type="text"
                        placeholder="Exercise (e.g. Bench Press / Squat)"
                        value={inlinePrExercise}
                        onChange={(e) => setInlinePrExercise(e.target.value)}
                        style={{
                          height: 40,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 12.5,
                          outline: "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Record Stat (e.g. 140 kg x 3 reps)"
                        value={inlinePrWeight}
                        onChange={(e) => setInlinePrWeight(e.target.value)}
                        style={{
                          height: 40,
                          borderRadius: 10,
                          border: `1px solid ${T.glassBorder}`,
                          background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          color: T.text,
                          padding: "0 12px",
                          fontSize: 12.5,
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Caption Textarea */}
                  <textarea
                    className="ic-caption-area"
                    rows={inlineFormat === "blog" ? 5 : 3}
                    placeholder={
                      inlineFormat === "photo"
                        ? "Add caption or notes for this workout photo…"
                        : inlineFormat === "video"
                        ? "Describe your form, technique, or reps for this clip…"
                        : inlineFormat === "blog"
                        ? "Write your full fitness guide, nutrition advice, or story…"
                        : inlineFormat === "pr"
                        ? "How did you achieve this record? Share your workout breakdown…"
                        : "What's on your fitness mind? Share tips, progress, or motivation with the squad…"
                    }
                    value={inlineCaption}
                    onChange={(e) => setInlineCaption(e.target.value)}
                  />

                  {/* Bottom: Emojis + Actions */}
                  <div className="ic-bottom">
                    <div className="ic-emojis">
                      {["🔥", "💪", "🏋️", "🥗", "🏆", "⚡", "💯"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="ic-emoji-btn"
                          onClick={() => setInlineCaption((c) => c + emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setShowPostCreator(true)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${T.glassBorder}`,
                          color: T.textSub,
                          padding: "7px 14px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ⛶ Fullscreen Modal
                      </button>

                      <button
                        type="button"
                        onClick={handleInlineSubmit}
                        disabled={inlinePosting || inlineUploading}
                        style={{
                          background: `linear-gradient(135deg, ${T.accent}, #0060df)`,
                          border: "none",
                          color: "#fff",
                          padding: "8px 18px",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: inlinePosting ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: `0 4px 14px ${T.accent}40`,
                        }}
                      >
                        {inlinePosting ? (
                          "Publishing…"
                        ) : (
                          <>
                            <span>🚀</span>
                            <span>Publish {inlineFormat === "photo" ? "Photo" : inlineFormat === "video" ? "Video" : inlineFormat === "blog" ? "Article" : inlineFormat === "pr" ? "PR" : "Post"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* High-Visibility Feed Filter Bar */}
                <div className="feed-filter-bar">
                  <div className="ff-header">
                    <div className="ff-title">
                      <span>⚡</span>
                      <span>Filter Community Feed</span>
                    </div>
                    <div className="ff-count-tag">
                      Showing {filteredPosts.length} of {posts.length} posts
                    </div>
                  </div>
                  <div className="ff-chips-row">
                    {[
                      { id: "all", label: "🌟 All Feed", count: filterCounts.all },
                      { id: "photos", label: "📸 Photos", count: filterCounts.photos },
                      { id: "videos", label: "🎥 Videos", count: filterCounts.videos },
                      { id: "blogs", label: "📝 Articles", count: filterCounts.blogs },
                      { id: "workout", label: "💪 Workouts", count: filterCounts.workout },
                      { id: "diet", label: "🥗 Nutrition", count: filterCounts.diet },
                      { id: "pr", label: "🏆 PR Records", count: filterCounts.pr },
                      { id: "wellness", label: "🧘 Wellness", count: filterCounts.wellness },
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
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📢</div>
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
                      ＋ Create First Post
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((p) => {
                    const pc = POST_COLORS[p.type] || POST_COLORS.workout;
                    const formatInfo = getPostFormatInfo(p);
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
                            onClick={() => setSelectedAthlete({ uid: p.uid, name: p.name, avatar: p.avatar })}
                          />
                          <div className="post-meta">
                            <div className="post-name-row">
                              <span
                                className="post-name"
                                onClick={() => setSelectedAthlete({ uid: p.uid, name: p.name, avatar: p.avatar })}
                              >
                                {p.name || "Athlete"}
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
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: "3px 8px",
                                borderRadius: 7,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                              }}
                            >
                              {formatInfo.label}
                            </span>
                            <span
                              className="post-tag"
                              style={{ background: pc.bg, color: pc.tag, border: `1px solid ${pc.border}` }}
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
                                📖 Read Full Article ({p.readTime || "2 min read"}) →
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
                            <span>{isLiked ? "❤️" : "🤍"}</span>
                            <span>{likeCount}</span>
                          </button>

                          <button
                            className="act-btn"
                            onClick={() =>
                              setExpandedComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                            }
                          >
                            <span>💬</span>
                            <span>{commentList.length > 0 ? `${commentList.length} Comments` : "Comment"}</span>
                          </button>

                          {p.uid !== myUid && (
                            <button className="act-btn" onClick={() => openDMWithUser(p.uid)}>
                              <span>✉️</span> Message
                            </button>
                          )}

                          <button className="act-btn" onClick={() => handleShare(p)}>
                            <span>↗</span> Share
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
                            >
                              ⚑
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
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span className="com-name">{c.name || "Athlete"}</span>
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
                            <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: T.text }}>
                              {m.name || "Athlete"}
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
                          <span style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, color: "#f97316" }}>
                            🔥 {m.streak || 0} days
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
                          }}
                        >
                          💬 Send Direct Message
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
                      Community Challenges
                    </h2>
                    <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
                      Join daily habit quests, build accountability, and track your streaks.
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
                    }}
                  >
                    ＋ Create Challenge
                  </button>
                </div>

                {filteredChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="ch-card"
                    onClick={() => c.activated && openChallengeDetail(c)}
                    style={{ cursor: c.activated ? "pointer" : "default" }}
                  >
                    <div className="ch-hd">
                      <span className="ch-emoji">{c.emoji || "⚡"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <div className="ch-title">{c.title}</div>
                          {c.official && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 6,
                                background: `${c.color || T.accent}15`,
                                color: c.color || T.accent,
                                border: `1px solid ${c.color || T.accent}30`,
                              }}
                            >
                              ✦ Official
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                          {c.activated
                            ? `Day ${c.daysCompleted || 1} of ${c.totalDays} · ${c.daysLeft} days remaining`
                            : `${c.totalDays} Days Quest · Join to begin tracking`}
                        </div>
                        {c.description && <div className="ch-desc">{c.description}</div>}
                      </div>

                      <button
                        style={{
                          padding: "8px 16px",
                          borderRadius: 11,
                          border: "none",
                          background: c.activated ? "#22c55e" : `linear-gradient(135deg,${c.color || T.accent},${c.color || T.accent}cc)`,
                          color: "#fff",
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          c.activated ? openChallengeDetail(c) : joinChallenge(c);
                        }}
                      >
                        {c.activated ? "✓ Enrolled" : "Join Quest →"}
                      </button>
                    </div>

                    <div className="ch-prog">
                      <div
                        className="ch-fill"
                        style={{
                          width: `${c.progressPct || 0}%`,
                          background: `linear-gradient(90deg, ${c.color || T.accent}, ${c.color || T.accent}aa)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
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
          <div style={{ position: "sticky", top: 120, height: "fit-content" }}>
            {/* Online Squad */}
            <div className="side-card">
              <div className="side-title">🟢 Active Athletes ({onlineCount})</div>
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
              <div className="side-title">⚡ Daily Quests</div>
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
                    <span>{c.emoji || "⚡"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>{c.title}</div>
                      <div style={{ fontSize: 10.5, color: T.textSub }}>{c.totalDays} Days Quest</div>
                    </div>
                  </div>
                </div>
              ))}
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
          initialFormat={inlineFormat}
          initialCategory={inlineCategory}
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
      </div>
    </>
  );
}