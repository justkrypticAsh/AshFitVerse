// src/components/ImageLightboxModal.jsx
import React from "react";
import { X, ExternalLink } from "lucide-react";

export default function ImageLightboxModal({ isOpen, imageUrl, altText, onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10010,
        background: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "lightboxFadeIn 0.25s ease both",
      }}
    >
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Top Action Bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(imageUrl, "_blank");
          }}
          title="Open original in new tab"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ExternalLink size={18} />
        </button>

        <button
          onClick={onClose}
          title="Close image preview"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Centered Image */}
      <img
        src={imageUrl}
        alt={altText || "Preview"}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(0,0,0,0.8)",
          animation: "lightboxImgPop 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      />
      <style>{`
        @keyframes lightboxImgPop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
