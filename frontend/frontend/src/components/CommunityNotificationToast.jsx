// src/components/CommunityNotificationToast.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import { FONT } from "../theme";

export default function CommunityNotificationToast({ toast, onDismiss }) {
  const navigate = useNavigate();
  const { dark, T } = useTheme();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const handleReply = () => {
    onDismiss?.();
    navigate(`/community?tab=messages&dm=${toast.senderUid}`);
  };

  return (
    <aside
      aria-label="New Message Notification"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 420,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 20,
        background: dark ? "rgba(13, 17, 28, 0.95)" : "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(30px) saturate(190%)",
        WebkitBackdropFilter: "blur(30px) saturate(190%)",
        border: dark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: dark
          ? "0 20px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3)"
          : "0 18px 40px rgba(15, 23, 42, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05)",
        animation: "toastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <style>{`
        @keyframes toastSlideDown {
          from { opacity: 0; transform: translate(-50%, -18px) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>

      {/* Sender Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {toast.senderAvatar ? (
          <img
            src={toast.senderAvatar}
            alt={toast.senderName}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
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
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#22c55e",
            border: `2px solid ${dark ? "#0d111c" : "#fff"}`,
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
            {toast.senderName}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              padding: "1px 6px",
              borderRadius: 6,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Direct Message
          </span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: dark ? "#94a3b8" : "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.35,
          }}
        >
          {toast.text}
        </div>
      </div>

      {/* Reply Action */}
      <button
        onClick={handleReply}
        style={{
          padding: "7px 14px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "#ffffff",
          fontFamily: FONT.display,
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 10px rgba(59, 130, 246, 0.35)",
        }}
      >
        Reply
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
          fontSize: 14,
        }}
      >
        ✕
      </button>
    </aside>
  );
}
