// src/mobile/screens/MobileCommunityScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

function timeAgo(ts) {
  if (!ts) return "just now";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MobileCommunityScreen({ user, dark, T }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(25));
      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setPosts(list);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore posts error:", err);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  return (
    <div className="mob-community-screen">
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#3b82f6",
            }}
          >
            FitVerse Squad
          </span>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              fontFamily: "var(--mobile-font-display)",
              color: dark ? "#f8fafc" : "#0f172a",
            }}
          >
            Community Feed
          </div>
        </div>
        <button
          onClick={() => navigate("/community")}
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            background: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
            color: dark ? "#f8fafc" : "#0f172a",
            fontSize: 11,
            fontWeight: 700,
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
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          marginBottom: 16,
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
          Share your workout, PR or gym win with the squad...
        </div>
      </div>

      {/* ── Feed Content ── */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: dark ? "#64748b" : "#94a3b8" }}>
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid rgba(59,130,246,0.2)",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 10px",
            }}
          />
          <span style={{ fontSize: 12 }}>Loading squad feed…</span>
        </div>
      ) : posts.length === 0 ? (
        /* Honest, Clean Empty State (No Mock Posts) */
        <div
          className="mob-card"
          style={{
            textAlign: "center",
            padding: "36px 20px",
            background: dark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)",
            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <div
            style={{
              fontFamily: "var(--mobile-font-display)",
              fontSize: 16,
              fontWeight: 800,
              color: dark ? "#f8fafc" : "#0f172a",
              marginBottom: 6,
            }}
          >
            No Community Posts Yet
          </div>
          <p
            style={{
              fontSize: 13,
              color: dark ? "#94a3b8" : "#64748b",
              lineHeight: 1.5,
              maxWidth: 280,
              margin: "0 auto 18px",
            }}
          >
            Be the first athlete to post a workout summary, personal record, or motivational tip!
          </p>
          <button
            onClick={() => navigate("/community")}
            style={{
              padding: "9px 18px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "var(--mobile-font-display)",
              cursor: "pointer",
            }}
          >
            Create First Post +
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post) => {
            const likesCount = Array.isArray(post.likes) ? post.likes.length : Number(post.likes) || 0;
            const commentsCount = Array.isArray(post.comments) ? post.comments.length : Number(post.commentsCount) || 0;

            return (
              <div
                key={post.id}
                className="mob-card"
                style={{
                  margin: 0,
                  padding: 16,
                  background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  border: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
                }}
              >
                {/* Author row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="mob-avatar-wrap" style={{ width: 34, height: 34 }}>
                      {post.authorPhoto || post.avatar ? (
                        <img src={post.authorPhoto || post.avatar} alt="" className="mob-avatar-img" />
                      ) : (
                        <div className="mob-avatar-fallback">
                          {post.authorName?.[0]?.toUpperCase() || post.athlete?.[0]?.toUpperCase() || "A"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 800,
                          color: dark ? "#f8fafc" : "#0f172a",
                          fontFamily: "var(--mobile-font-display)",
                        }}
                      >
                        {post.authorName || post.athlete || "Athlete"}
                      </div>
                      <div style={{ fontSize: 10.5, color: dark ? "#64748b" : "#94a3b8" }}>
                        {timeAgo(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {post.type && (
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: "rgba(59, 130, 246, 0.12)",
                        color: "#3b82f6",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.type}
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: dark ? "#cbd5e1" : "#334155",
                    margin: "0 0 10px 0",
                  }}
                >
                  {post.content || post.text}
                </p>

                {/* Optional Media */}
                {post.image && (
                  <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                    <img
                      src={post.image}
                      alt=""
                      style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                {/* Engagement Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingTop: 8,
                    borderTop: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                  }}
                >
                  <button
                    onClick={() => navigate("/community")}
                    style={{
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      color: dark ? "#94a3b8" : "#64748b",
                      fontSize: 12,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span>❤️</span> {likesCount}
                  </button>
                  <button
                    onClick={() => navigate("/community")}
                    style={{
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      color: dark ? "#94a3b8" : "#64748b",
                      fontSize: 12,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span>💬</span> {commentsCount}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
