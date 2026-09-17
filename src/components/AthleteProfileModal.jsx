// src/components/AthleteProfileModal.jsx
import React, { useState, useEffect } from "react";
import { FONT } from "../theme";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";

export default function AthleteProfileModal({
  isOpen,
  athlete,
  onClose,
  onMessage,
  onViewFullProfile,
  onEditProfile,
  currentUid,
  dark = true,
  T = {},
}) {
  const [profileData, setProfileData] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = athlete?.uid || athlete?.id;

  useEffect(() => {
    if (!isOpen || !uid) return;
    let isMounted = true;
    setLoading(true);

    async function fetchAthleteDetails() {
      try {
        // Fetch user profile from Firestore if available
        const userDocRef = doc(db, "users", uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists() && isMounted) {
          setProfileData({ uid, ...snap.data() });
        } else if (isMounted) {
          setProfileData(athlete);
        }

        // Fetch user's latest 3 posts
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", uid),
          limit(3)
        );
        const postsSnap = await getDocs(postsQuery);
        if (isMounted) {
          setRecentPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        if (isMounted) setProfileData(athlete);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAthleteDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, uid, athlete]);

  if (!isOpen || !athlete) return null;

  const userObj = profileData || athlete;
  const name = userObj.name || "Athlete";
  const avatar = userObj.avatar || null;
  const streak = Number(userObj.streak) || 0;
  const goal = userObj.goal ? userObj.goal.replace(/_/g, " ") : "Fitness & Strength";
  const weight = userObj.weight ? `${userObj.weight} kg` : null;
  const isOnline = Boolean(userObj.online);

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
        background: "rgba(0,0,0,0.72)",
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
          maxWidth: 480,
          boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
          color: T.text || (dark ? "#fff" : "#111"),
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: FONT.body,
          animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
          position: "relative",
        }}
      >
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Top Banner with gradient */}
        <div
          style={{
            height: 110,
            borderRadius: "24px 24px 0 0",
            background: `linear-gradient(135deg, ${T.accent || "#0a84ff"}dd, ${T.purple || "#bf5af2"}aa)`,
            position: "relative",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              transition: "transform 0.15s ease",
            }}
          >
            ✕
          </button>
        </div>

        {/* Profile Card Header */}
        <div style={{ padding: "0 24px 24px", position: "relative" }}>
          {/* Avatar floating above banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: -46,
              marginBottom: 14,
            }}
          >
            <div style={{ position: "relative" }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `4px solid ${dark ? "#0a0d18" : "#ffffff"}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.accent || "#0a84ff"}, ${T.purple || "#bf5af2"})`,
                    border: `4px solid ${dark ? "#0a0d18" : "#ffffff"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  {name[0]?.toUpperCase() || "A"}
                </div>
              )}
              {isOnline && (
                <div
                  title="Active Now"
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: `3px solid ${dark ? "#0a0d18" : "#ffffff"}`,
                    boxShadow: "0 0 8px #22c55e",
                  }}
                />
              )}
            </div>

            {/* Action Button: Edit Profile if self, else Direct Message */}
            {Boolean(currentUid && uid === currentUid) || athlete.isCurrentUser || athlete.isMe ? (
              <button
                onClick={() => {
                  onClose();
                  if (onEditProfile) onEditProfile();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 14,
                  border: `1.5px solid ${dark ? "rgba(255,255,255,0.18)" : "#cbd5e1"}`,
                  background: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                  color: dark ? "#fff" : "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.16s ease",
                }}
              >
                <span>⚙️</span> Edit Profile & Handle
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onMessage) onMessage(uid);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 14,
                  border: "none",
                  background: `linear-gradient(135deg, ${T.accent || "#0a84ff"}, ${T.purple || "#bf5af2"})`,
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(10,132,255,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>💬</span> Send Message
              </button>
            )}
          </div>

          {/* Name & Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2
                style={{
                  fontFamily: FONT.display,
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {name}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: userObj.plan === "pro" ? "rgba(191,90,242,0.15)" : "rgba(10,132,255,0.12)",
                  color: userObj.plan === "pro" ? "#bf5af2" : "#0a84ff",
                  border: `1px solid ${userObj.plan === "pro" ? "rgba(191,90,242,0.3)" : "rgba(10,132,255,0.25)"}`,
                  textTransform: "uppercase",
                }}
              >
                {userObj.plan === "pro" ? "⚡ PRO ATHLETE" : "✦ MEMBER"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: T.textSub || "#94a3b8", marginTop: 4 }}>
              @{userObj.username || name.toLowerCase().replace(/\s+/g, "_")}
            </div>
          </div>

          {/* Bio / Motivation */}
          {userObj.bio && (
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: T.textSub || "#cbd5e1",
                margin: "12px 0 16px",
                padding: "10px 14px",
                borderRadius: 12,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.06)"}`,
              }}
            >
              "{userObj.bio}"
            </p>
          )}

          {/* 3 Metric Badges */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              margin: "16px 0",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.2)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Streak
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 800, color: "#f97316", marginTop: 2 }}>
                🔥 {streak}d
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: dark ? "rgba(10,132,255,0.08)" : "rgba(10,132,255,0.05)",
                border: "1px solid rgba(10,132,255,0.2)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Primary Goal
              </div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#38bdf8",
                  marginTop: 4,
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {goal}
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: T.textSub || "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Weight
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: "#22c55e", marginTop: 2 }}>
                {weight || "—"}
              </div>
            </div>
          </div>

          {/* Recent Community Activity */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: T.textMuted || "#64748b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Recent Community Posts ({recentPosts.length})
            </div>

            {loading ? (
              <div style={{ fontSize: 12, color: T.textMuted, padding: "12px 0", textAlign: "center" }}>
                Loading activity…
              </div>
            ) : recentPosts.length === 0 ? (
              <div
                style={{
                  fontSize: 12.5,
                  color: T.textMuted,
                  padding: "16px 14px",
                  borderRadius: 12,
                  background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  border: `1px dashed ${T.glassBorder}`,
                  textAlign: "center",
                }}
              >
                No public posts yet from this athlete.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentPosts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                      {p.content?.length > 90 ? `${p.content.slice(0, 90)}…` : p.content}
                    </div>
                    {p.mediaType && (
                      <div style={{ fontSize: 11, color: T.accent, marginTop: 4, fontWeight: 600 }}>
                        {p.mediaType === "image" ? "📷 Attached Photo" : p.mediaType === "video" ? "🎥 Video Post" : "📝 Article"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button
              onClick={() => {
                onClose();
                if (onViewFullProfile) onViewFullProfile(uid);
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.12)"}`,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: T.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              View Full Profile Page →
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: `1px solid ${T.glassBorder || "rgba(255,255,255,0.1)"}`,
                background: "transparent",
                color: T.textSub,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
