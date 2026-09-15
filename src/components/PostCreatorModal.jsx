// src/components/PostCreatorModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { FONT } from "../theme";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const POST_CATEGORIES = [
  { id: "workout", label: "Workout", color: "#0a84ff" },
  { id: "diet", label: "Nutrition", color: "#30d158" },
  { id: "pr", label: "Personal Record", color: "#bf5af2" },
  { id: "wellness", label: "Wellness", color: "#ff375f" },
  { id: "milestone", label: "Milestone", color: "#ff9f0a" },
  { id: "discussion", label: "Discussion", color: "#38bdf8" },
];

// Client-side fast image compression to ensure lightweight base64 DataURL (<150KB)
export function compressImage(file, maxWidth = 960, quality = 0.75) {
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

export default function PostCreatorModal({
  isOpen,
  onClose,
  user = {},
  myUid,
  onPostSuccess,
  dark = true,
  T = {},
  initialFormat = "photo",
  initialCategory = "workout",
}) {
  const fileInputRef = useRef(null);
  const [postFormat, setPostFormat] = useState(initialFormat || "photo"); // "photo" | "video" | "blog" | "pr" | "quick"
  const [category, setCategory] = useState(initialCategory || "workout");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCover, setBlogCover] = useState("");
  const [prExercise, setPrExercise] = useState("");
  const [prWeight, setPrWeight] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialFormat) setPostFormat(initialFormat);
      if (initialCategory) setCategory(initialCategory);
    }
  }, [isOpen, initialFormat, initialCategory]);

  if (!isOpen) return null;

  // Handle local image file picker
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setMediaUrl(compressed);
    } catch (err) {
      console.error("Image compression error:", err);
      alert("Failed to load image. Try a smaller file or use image link.");
    } finally {
      setUploadingMedia(false);
    }
  };

  // Estimate reading time for blog
  const wordCount = caption.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 180));

  const handleCreatePost = async () => {
    if (!caption.trim() && !mediaUrl && !videoUrl && !blogTitle.trim() && !prExercise.trim()) return;
    setPosting(true);

    const effectiveUid = myUid || auth.currentUser?.uid || "guest_athlete";
    const authorName = user.name || auth.currentUser?.displayName || "Athlete";
    const authorAvatar = user.avatar || auth.currentUser?.photoURL || null;

    let finalMediaType = null;
    let finalMediaUrl = null;

    if (postFormat === "photo" && (imagePreview || mediaUrl)) {
      finalMediaType = "image";
      finalMediaUrl = imagePreview || mediaUrl;
    } else if (postFormat === "video" && videoUrl) {
      finalMediaType = "video";
      finalMediaUrl = videoUrl;
    } else if (postFormat === "blog") {
      finalMediaType = "blog";
      finalMediaUrl = blogCover || null;
    }

    let finalContent = caption.trim();
    if (postFormat === "pr" && prExercise.trim()) {
      const prHeader = `🔥 NEW PERSONAL RECORD!\n🏋️ Exercise: ${prExercise.trim()}\n⚡ Achievement: ${prWeight.trim() || "PR Hit"}\n\n`;
      finalContent = prHeader + (finalContent ? finalContent : "Smashing goals and raising the bar today! 🏆💪");
    }

    const postDoc = {
      uid: effectiveUid,
      name: authorName,
      username: user.username || authorName.toLowerCase().replace(/\s+/g, "_"),
      avatar: authorAvatar,
      content: finalContent,
      type: postFormat === "pr" ? "pr" : category,
      mediaType: finalMediaType,
      mediaUrl: finalMediaUrl,
      blogTitle: postFormat === "blog" ? blogTitle.trim() : null,
      readTime: postFormat === "blog" ? `${estimatedReadTime} min read` : null,
      likes: [],
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "posts"), postDoc);
      if (onPostSuccess) {
        onPostSuccess({ id: docRef.id, ...postDoc, createdAt: new Date() });
      }
      // Reset state
      setCaption("");
      setMediaUrl("");
      setImagePreview("");
      setVideoUrl("");
      setBlogTitle("");
      setBlogCover("");
      setPrExercise("");
      setPrWeight("");
      onClose();
    } catch (err) {
      console.error("Post creation error:", err);
      // Even if Firestore fails (e.g. offline/rules), provide optimistic local post
      if (onPostSuccess) {
        onPostSuccess({
          id: `local_${Date.now()}`,
          ...postDoc,
          createdAt: new Date(),
        });
      }
      onClose();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.76)",
        backdropFilter: "blur(12px)",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: dark ? "#0a0d18" : "#ffffff",
          border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.12)"}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 580,
          boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
          color: T.text || (dark ? "#fff" : "#111"),
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: FONT.body,
          padding: 24,
          animation: "scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            borderBottom: `1px solid ${T.glassBorder || "rgba(255,255,255,0.08)"}`,
            paddingBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>✨</span>
            <div>
              <h2
                style={{
                  fontFamily: FONT.display,
                  fontSize: 18,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Create Community Post
              </h2>
              <div style={{ fontSize: 12, color: T.textSub || "#94a3b8" }}>
                Share your journey, photos, videos, or fitness blogs
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              color: T.textSub || "#94a3b8",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Post Format Selector Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {[
            { id: "photo", label: "Photo" },
            { id: "video", label: "Video" },
            { id: "blog", label: "Article" },
            { id: "pr", label: "Personal Record" },
            { id: "quick", label: "Quick Post" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setPostFormat(f.id);
                if (f.id === "pr") setCategory("pr");
              }}
              style={{
                padding: "9px 6px",
                borderRadius: 10,
                border: `1px solid ${postFormat === f.id ? T.accent || "#0a84ff" : T.glassBorder || "rgba(255,255,255,0.08)"}`,
                background:
                  postFormat === f.id
                    ? dark
                      ? "rgba(10,132,255,0.15)"
                      : "rgba(10,132,255,0.08)"
                    : "transparent",
                color: postFormat === f.id ? T.accent || "#0a84ff" : T.textSub,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Active Post Format & Topic Indicator Banner */}
        <div
          style={{
            padding: "9px 14px",
            borderRadius: 12,
            background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${T.accent || "#0a84ff"}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: T.textSub || "#94a3b8" }}>Format:</span>
            <span
              style={{
                color: T.accent || "#0a84ff",
                background: T.accentSoft || "rgba(10,132,255,0.12)",
                padding: "2px 8px",
                borderRadius: 6,
                fontWeight: 800,
              }}
            >
              {postFormat === "photo" && "Photo Post"}
              {postFormat === "video" && "Video Clip"}
              {postFormat === "blog" && "Fitness Article"}
              {postFormat === "pr" && "Personal Record"}
              {postFormat === "quick" && "Quick Post"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: T.textSub || "#94a3b8" }}>Category:</span>
            <span style={{ color: POST_CATEGORIES.find((c) => c.id === category)?.color || T.accent || "#0a84ff", fontWeight: 800 }}>
              {POST_CATEGORIES.find((c) => c.id === category)?.label || "Workout"}
            </span>
          </div>
        </div>

        {/* ─── FORMAT: PR SPECIFICS ─── */}
        {postFormat === "pr" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.textSub,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Exercise / Challenge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incline Bench Press"
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
                    background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    color: T.text,
                    padding: "0 12px",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.textSub,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  New Record Stat / Lift
                </label>
                <input
                  type="text"
                  placeholder="e.g. 140 kg (315 lbs) x 3 reps"
                  value={prWeight}
                  onChange={(e) => setPrWeight(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
                    background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    color: T.text,
                    padding: "0 12px",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── FORMAT: BLOG / ARTICLE SPECIFICS ─── */}
        {postFormat === "blog" && (
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textSub,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
                display: "block",
              }}
            >
              Article / Blog Title
            </label>
            <input
              type="text"
              placeholder="e.g. How I Lost 12kg in 4 Months: Full Diet & Lifting Breakdown"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                color: T.text,
                padding: "0 14px",
                fontSize: 14,
                fontFamily: FONT.display,
                fontWeight: 700,
                outline: "none",
                marginBottom: 10,
              }}
            />

            <label
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textSub,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
                display: "block",
              }}
            >
              Cover Image URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={blogCover}
              onChange={(e) => setBlogCover(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                borderRadius: 10,
                border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                color: T.text,
                padding: "0 14px",
                fontSize: 12.5,
                outline: "none",
              }}
            />
          </div>
        )}

        {/* ─── FORMAT: PHOTO UPLOADER ─── */}
        {postFormat === "photo" && (
          <div style={{ marginBottom: 14 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!imagePreview && !mediaUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${T.accent || "#0a84ff"}50`,
                  borderRadius: 16,
                  padding: "24px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dark ? "rgba(10,132,255,0.04)" : "rgba(10,132,255,0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${T.accent || "#0a84ff"}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: T.accent || "#0a84ff" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.accent }}>
                  {uploadingMedia ? "Optimizing photo…" : "Click to select a photo from your device"}
                </div>
                <div style={{ fontSize: 11.5, color: T.textSub, marginTop: 4 }}>
                  Supports JPEG, PNG, WEBP · Auto-compressed for instantaneous loading
                </div>
              </div>
            ) : (
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", maxHeight: 240 }}>
                <img
                  src={imagePreview || mediaUrl}
                  alt="Post preview"
                  style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
                />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setMediaUrl("");
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ✕ Remove Photo
                </button>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Or paste direct image URL (https://...)"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                style={{
                  width: "100%",
                  height: 38,
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
          </div>
        )}

        {/* ─── FORMAT: VIDEO UPLOADER / EMBED ─── */}
        {postFormat === "video" && (
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textSub,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
                display: "block",
              }}
            >
              Video URL (YouTube, Vimeo, or Direct MP4 Link)
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                color: T.text,
                padding: "0 14px",
                fontSize: 13,
                outline: "none",
                marginBottom: 8,
              }}
            />
            {videoUrl && (
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#000",
                  marginTop: 6,
                  textAlign: "center",
                  padding: "12px",
                  fontSize: 12,
                  color: "#38bdf8",
                }}
              >
                🎥 Video link linked: <b>{videoUrl}</b>
              </div>
            )}
          </div>
        )}

        {/* Caption / Article Body Textarea */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: T.textSub,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{postFormat === "blog" ? "Article Body & Insights" : "Caption & Details"}</span>
            {postFormat === "blog" && (
              <span style={{ color: T.accent, textTransform: "none" }}>
                📖 ~{estimatedReadTime} min read ({wordCount} words)
              </span>
            )}
          </label>
          <textarea
            rows={postFormat === "blog" ? 7 : 4}
            placeholder={
              postFormat === "blog"
                ? "Write your full fitness story, workout split, diet rules, and lessons learned..."
                : "Share your workout notes, PR stats, training thoughts, or questions..."
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              width: "100%",
              borderRadius: 14,
              border: `1.5px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              color: T.text,
              padding: "14px 16px",
              fontSize: 14,
              fontFamily: FONT.body,
              lineHeight: 1.5,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>



        {/* Category Pills */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: T.textSub,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 8,
              display: "block",
            }}
          >
            Post Category
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {POST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${category === cat.id ? cat.color : T.glassBorder}`,
                  background: category === cat.id ? `${cat.color}18` : "transparent",
                  color: category === cat.id ? cat.color : T.textSub,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleCreatePost}
            disabled={posting || (!caption.trim() && !imagePreview && !videoUrl && !blogTitle.trim())}
            style={{
              flex: 1,
              padding: "13px 20px",
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${T.accent || "#0a84ff"}, ${T.purple || "#bf5af2"})`,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: FONT.body,
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 8px 24px rgba(10,132,255,0.25)",
              opacity: posting || (!caption.trim() && !imagePreview && !videoUrl && !blogTitle.trim()) ? 0.5 : 1,
            }}
          >
            {posting ? "Publishing to Community…" : "Publish Post →"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "13px 18px",
              borderRadius: 14,
              border: `1px solid ${T.glassBorder}`,
              background: "transparent",
              color: T.textSub,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
