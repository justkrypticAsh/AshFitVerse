// src/components/ArticleReaderModal.jsx
import React from "react";
import { FONT } from "../theme";

export default function ArticleReaderModal({
  isOpen,
  article,
  onClose,
  onAuthorClick,
  dark = true,
  T = {},
}) {
  if (!isOpen || !article) return null;

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
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(14px)",
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
          maxWidth: 680,
          boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
          color: T.text || (dark ? "#fff" : "#111"),
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: FONT.body,
          animation: "scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
          position: "relative",
        }}
      >
        {/* Cover Image if present */}
        {article.mediaUrl && (
          <div style={{ maxHeight: 280, overflow: "hidden", position: "relative" }}>
            <img
              src={article.mediaUrl}
              alt={article.blogTitle || "Article cover"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(10,13,24,1) 0%, transparent 60%)",
              }}
            />
          </div>
        )}

        <div style={{ padding: "28px 32px 36px" }}>
          {/* Top category & read time */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: "rgba(56,189,248,0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56,189,248,0.3)",
                  textTransform: "uppercase",
                }}
              >
                📝 Fitness Article
              </span>
              {article.readTime && (
                <span style={{ fontSize: 12, color: T.textSub }}>
                  • 📖 {article.readTime}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                color: T.textSub,
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

          {/* Article Title */}
          <h1
            style={{
              fontFamily: FONT.display,
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1.3,
              margin: "0 0 16px",
              color: T.text,
            }}
          >
            {article.blogTitle || "Community Fitness Guide"}
          </h1>

          {/* Author bar */}
          <div
            onClick={() => {
              if (onAuthorClick) onAuthorClick(article.uid);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 14,
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${T.glassBorder}`,
              marginBottom: 24,
              cursor: "pointer",
            }}
          >
            {article.avatar ? (
              <img
                src={article.avatar}
                alt={article.name}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0a84ff, #bf5af2)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {article.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>
                {article.name || "Athlete"}
              </div>
              <div style={{ fontSize: 11.5, color: T.textSub }}>
                Published in AshFitVerse Community
              </div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, color: T.accent, fontWeight: 700 }}>
              View Profile →
            </span>
          </div>

          {/* Article Content */}
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: T.text || "#e2e8f0",
              whiteSpace: "pre-line",
              fontFamily: FONT.body,
            }}
          >
            {article.content}
          </div>

          {/* Close button */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                border: "none",
                background: `linear-gradient(135deg, ${T.accent || "#0a84ff"}, ${T.purple || "#bf5af2"})`,
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done Reading ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
