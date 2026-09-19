// src/components/CommunityNotificationToast.jsx — Multi-Channel Community Alert Popups
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import { FONT } from "../theme";

export default function CommunityNotificationToast({ toast, onDismiss }) {
  const navigate = useNavigate();
  const { dark } = useTheme();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 6500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const type = toast.type || "message";

  // Visual styling dictionary for each alert channel
  const TYPE_CONFIG = {
    mention: {
      badge: "📣 Mention",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      glow: "rgba(139, 92, 246, 0.35)",
      bgBadge: "rgba(139, 92, 246, 0.16)",
      actionLabel: "View Mention",
      defaultTitle: `@${toast.senderUsername || "athlete"} mentioned you`,
    },
    like: {
      badge: "❤️ Like",
      color: "#f43f5e",
      gradient: "linear-gradient(135deg, #f43f5e, #be123c)",
      glow: "rgba(244, 63, 94, 0.35)",
      bgBadge: "rgba(244, 63, 94, 0.16)",
      actionLabel: "View Post",
      defaultTitle: `${toast.senderName || "Athlete"} liked your post`,
    },
    comment: {
      badge: "💬 Comment",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #047857)",
      glow: "rgba(16, 185, 129, 0.35)",
      bgBadge: "rgba(16, 185, 129, 0.16)",
      actionLabel: "Reply",
      defaultTitle: `${toast.senderName || "Athlete"} commented`,
    },
    message: {
      badge: "⚡ Message",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      glow: "rgba(59, 130, 246, 0.35)",
      bgBadge: "rgba(59, 130, 246, 0.16)",
      actionLabel: "Reply",
      defaultTitle: toast.senderName || "Direct Message",
    },
  };

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.message;

  const handleAction = () => {
    onDismiss?.();
    if (type === "message") {
      navigate(`/community?tab=messages&dm=${toast.senderUid}`);
    } else if (toast.postId) {
      navigate(`/community?tab=feed&post=${toast.postId}`);
    } else {
      navigate(`/community?tab=alerts`);
    }
  };

  return (
    <aside
      aria-label="Community Notification"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 440,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 20,
        background: dark ? "rgba(13, 17, 28, 0.96)" : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(30px) saturate(190%)",
        WebkitBackdropFilter: "blur(30px) saturate(190%)",
        border: dark
          ? `1.5px solid ${cfg.color}45`
          : `1.5px solid ${cfg.color}35`,
        boxShadow: dark
          ? `0 20px 48px rgba(0, 0, 0, 0.65), 0 0 24px ${cfg.glow}`
          : `0 18px 40px rgba(15, 23, 42, 0.14), 0 0 16px ${cfg.glow}`,
        animation: "toastSlideDown 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <style>{`
        @keyframes toastSlideDown {
          from { opacity: 0; transform: translate(-50%, -18px) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>

      {/* Sender Avatar with Type Dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {toast.senderAvatar ? (
          <img
            src={toast.senderAvatar}
            alt={toast.senderName}
            style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: cfg.gradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              fontFamily: FONT.display,
            }}
          >
            {toast.senderName?.[0]?.toUpperCase() || "A"}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: cfg.color,
            border: `2px solid ${dark ? "#0d111c" : "#fff"}`,
            boxShadow: `0 0 8px ${cfg.color}`,
          }}
        />
      </div>

      {/* Message Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: FONT.display,
              fontSize: 13.5,
              fontWeight: 800,
              color: dark ? "#f8fafc" : "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {toast.title || cfg.defaultTitle}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              padding: "1.5px 7px",
              borderRadius: 6,
              background: cfg.bgBadge,
              color: cfg.color,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            {cfg.badge}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: dark ? "#94a3b8" : "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.35,
          }}
        >
          {toast.text || "Tap to view community update"}
        </div>
      </div>

      {/* Action CTA Button */}
      <button
        onClick={handleAction}
        style={{
          padding: "7px 13px",
          borderRadius: 11,
          border: "none",
          background: cfg.gradient,
          color: "#ffffff",
          fontFamily: FONT.display,
          fontSize: 11.5,
          fontWeight: 800,
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: `0 2px 10px ${cfg.glow}`,
          transition: "transform 0.16s ease",
        }}
      >
        {cfg.actionLabel}
      </button>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        aria-label="Close notification"
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "none",
          background: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
          color: dark ? "#94a3b8" : "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          fontSize: 13,
        }}
      >
        ✕
      </button>
    </aside>
  );
}
