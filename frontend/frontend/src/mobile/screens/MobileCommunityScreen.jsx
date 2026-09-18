// src/mobile/screens/MobileCommunityScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MobileCommunityScreen({
  user,
  dark,
  T,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const mockPosts = [
    {
      id: 1,
      athlete: "Vikram R.",
      handle: "@vikram_fit",
      badge: "ELITE",
      badgeColor: "#3b82f6",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      time: "25m ago",
      text: "Hit a brand new PR on Barbell Incline Bench today! 105kg for 4 clean reps. Discipline always beats motivation. 💪🔥",
      stats: "Bench PR · 105kg · 4 Reps",
      likes: 38,
      comments: 7,
    },
    {
      id: 2,
      athlete: "Priya Patel",
      handle: "@priya_wellness",
      badge: "PRO",
      badgeColor: "#8b5cf6",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      time: "2h ago",
      text: "Cycle phase synced leg workout done! Kept weights moderate in the luteal phase and focused on time under tension. Feels incredible! 🌸✨",
      stats: "Leg Day · 45 mins · 380 kcal",
      likes: 54,
      comments: 12,
    },
    {
      id: 3,
      athlete: "Rohan Malhotra",
      handle: "@rohan_lift",
      badge: "PRO",
      badgeColor: "#10b981",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      time: "5h ago",
      text: "Clean macros for 14 straight days! Net deficit locked at -450 kcal and energy levels are sky high. Keep grinding squad! 🥗",
      stats: "14d Streak · 165g Protein",
      likes: 29,
      comments: 4,
    },
  ];

  return (
    <div className="mob-community-screen">
      {/* ── Squad Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3b82f6" }}>
            FitVerse Squad
          </span>
          <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--mobile-font-display)", color: dark ? "#f8fafc" : "#0f172a" }}>
            Live Athlete Feed
          </div>
        </div>
        <button
          onClick={() => navigate("/community")}
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            border: "1px solid rgba(59, 130, 246, 0.35)",
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3b82f6",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Full Hub →
        </button>
      </div>

      {/* ── Create Post Prompt ── */}
      <div
        onClick={() => navigate("/community")}
        className="mob-card"
        style={{
          background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          marginBottom: 14,
          cursor: "pointer",
        }}
      >
        <div className="mob-avatar-wrap" style={{ width: 34, height: 34 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="mob-avatar-img" />
          ) : (
            <div className="mob-avatar-fallback">{user?.name?.[0]?.toUpperCase() || "A"}</div>
          )}
        </div>
        <div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
          Share your workout, PR or gym win...
        </div>
      </div>

      {/* ── Feed Posts ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="mob-card"
            style={{
              margin: 0,
              padding: 16,
              background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)"}`,
            }}
          >
            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={post.avatar}
                  alt=""
                  style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: dark ? "#f8fafc" : "#0f172a" }}>
                      {post.athlete}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: `${post.badgeColor}20`,
                        color: post.badgeColor,
                      }}
                    >
                      {post.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b" }}>
                    {post.handle} · {post.time}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ fontSize: 13, lineHeight: 1.5, color: dark ? "rgba(241,245,249,0.88)" : "#1e293b", marginBottom: 10 }}>
              {post.text}
            </div>

            {/* Stat Pill */}
            {post.stats && (
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                  marginBottom: 12,
                }}
              >
                ⚡ {post.stats}
              </div>
            )}

            {/* Interactions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                paddingTop: 8,
                borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                fontSize: 12,
                fontWeight: 700,
                color: dark ? "#94a3b8" : "#64748b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <span>🔥</span> {post.likes}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <span>💬</span> {post.comments}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
