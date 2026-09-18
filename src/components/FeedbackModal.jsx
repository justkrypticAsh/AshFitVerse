// src/components/FeedbackModal.jsx
import React, { useState } from "react";
import { submitFeedback } from "../lib/feedbackService";
import { showDonePopup } from "./DonePopup";

export default function FeedbackModal({
  isOpen,
  onClose,
  user = {},
  authUid,
  dark = true,
}) {
  if (!isOpen) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("feature_request");
  const [area, setArea] = useState("Overall App");
  const [message, setMessage] = useState("");
  const [includeEmail, setIncludeEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const STAR_DESCRIPTIONS = {
    1: "Needs Work 😞",
    2: "Could Be Better 😐",
    3: "Good 🙂",
    4: "Great! 😊",
    5: "Loved it! 🔥",
  };

  const CATEGORIES = [
    { id: "feature_request", label: "💡 Feature Request" },
    { id: "bug_report", label: "🐛 Bug Report" },
    { id: "diet_workout", label: "🥗 Diet / Workout Idea" },
    { id: "review", label: "⭐ Praise & Review" },
    { id: "general", label: "💬 General Experience" },
  ];

  const FOCUS_AREAS = [
    "Overall App",
    "Workouts",
    "Diet & Nutrition",
    "Daily Weight Tracker",
    "Men's / Women's Health",
    "Store & Supplements",
  ];

  const QUICK_SUGGESTIONS = [
    "Add more Indian veg meal plans 🥗",
    "Water intake & hydration tracker 💧",
    "Progress photo side-by-side view 📸",
    "Smartwatch / wearable step sync ⌚",
    "More bodyweight workout routines 🤸",
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        uid: authUid || user?.uid || "athlete",
        userName: user?.name || "Athlete",
        userEmail: includeEmail ? user?.email || localStorage.getItem("ashfitverse_email") || "" : "Anonymous",
        rating,
        category,
        area,
        message: message.trim(),
      });

      showDonePopup({
        title: "Feedback Sent! 🚀",
        message: "Thank you! Your suggestion has been sent directly to the Admin.",
        subtext: `${rating}★ · ${CATEGORIES.find((c) => c.id === category)?.label || "Feedback"}`,
        color: "#4f8ef7",
      });

      setMessage("");
      onClose();
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fb-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fb-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fb-header">
          <div className="fb-header-left">
            <span className="fb-badge-icon">💬</span>
            <div>
              <div className="fb-title">
                Feedback & <span style={{ color: "#4f8ef7" }}>Ratings</span>
              </div>
              <div className="fb-sub">
                Tell us what you want to see next or report any issues.
              </div>
            </div>
          </div>
          <button className="fb-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Star Rating Section */}
        <div className="fb-star-box">
          <div className="fb-star-label">HOW WOULD YOU RATE ASHFITVERSE?</div>
          <div className="fb-stars-row">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  className={`fb-star-btn ${active ? "active" : ""}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              );
            })}
          </div>
          <div className="fb-star-desc">
            {STAR_DESCRIPTIONS[hoverRating || rating]}
          </div>
        </div>

        {/* Category Selection */}
        <div className="fb-section-label">FEEDBACK TYPE</div>
        <div className="fb-cats-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`fb-cat-pill ${category === c.id ? "active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Focus Area Selection */}
        <div className="fb-section-label" style={{ marginTop: 14 }}>
          WHAT FEATURE DOES THIS RELATE TO?
        </div>
        <div className="fb-area-scroll">
          {FOCUS_AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={`fb-area-pill ${area === a ? "active" : ""}`}
              onClick={() => setArea(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <div className="fb-section-label" style={{ marginTop: 14 }}>
          YOUR THOUGHTS & SUGGESTIONS
        </div>
        <textarea
          className="fb-textarea"
          rows="3"
          placeholder="What features should we build for you? What worked well, or what needs improvement?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Quick Suggestion Chips */}
        <div className="fb-chips-row">
          {QUICK_SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="fb-chip-btn"
              onClick={() => {
                setMessage((prev) => (prev ? `${prev}\n• ${chip}` : chip));
              }}
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Include Email Toggle */}
        <div className="fb-email-toggle" onClick={() => setIncludeEmail(!includeEmail)}>
          <input
            type="checkbox"
            checked={includeEmail}
            onChange={() => {}}
            style={{ cursor: "pointer", accentColor: "#4f8ef7" }}
          />
          <span>Include my profile ({user?.name || "Athlete"}) so admin can follow up if needed</span>
        </div>

        {/* Footer Buttons */}
        <div className="fb-footer">
          <button className="fb-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="fb-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
          >
            {submitting ? "Sending..." : "Submit Feedback 🚀"}
          </button>
        </div>
      </div>

      <style>{`
        .fb-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(4, 6, 15, 0.80);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          animation: fbFadeIn 0.2s ease forwards;
        }
        .fb-card {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          background: ${dark ? "rgba(14, 18, 30, 0.96)" : "rgba(255, 255, 255, 0.98)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          border-radius: 26px;
          padding: 26px;
          color: ${dark ? "#f3f4f6" : "#111827"};
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          animation: fbPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          scrollbar-width: thin;
        }
        .fb-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .fb-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .fb-badge-icon {
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(79, 142, 247, 0.12);
          border: 1px solid rgba(79, 142, 247, 0.25);
        }
        .fb-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .fb-sub {
          font-size: 12px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-top: 3px;
        }
        .fb-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
          color: ${dark ? "#d1d5db" : "#4b5563"};
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .fb-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .fb-star-box {
          background: ${dark ? "rgba(7, 9, 18, 0.70)" : "rgba(243, 244, 246, 0.85)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
          border-radius: 18px;
          padding: 18px;
          text-align: center;
          margin-bottom: 18px;
        }
        .fb-star-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-bottom: 8px;
        }
        .fb-stars-row {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .fb-star-btn {
          background: transparent;
          border: none;
          font-size: 38px;
          color: ${dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)"};
          cursor: pointer;
          transition: transform 0.15s, color 0.15s;
          padding: 0 4px;
        }
        .fb-star-btn:hover {
          transform: scale(1.22);
        }
        .fb-star-btn.active {
          color: #fbbf24;
          text-shadow: 0 0 16px rgba(251, 191, 36, 0.45);
        }
        .fb-star-desc {
          font-size: 13px;
          font-weight: 700;
          color: #fbbf24;
          margin-top: 6px;
          min-height: 18px;
        }
        .fb-section-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-bottom: 8px;
        }
        .fb-cats-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .fb-cat-pill {
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)"};
          color: ${dark ? "#d1d5db" : "#374151"};
          transition: all 0.15s;
        }
        .fb-cat-pill.active {
          border-color: rgba(79, 142, 247, 0.45);
          background: rgba(79, 142, 247, 0.15);
          color: #4f8ef7;
          font-weight: 700;
        }
        .fb-area-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 12px;
        }
        .fb-area-pill {
          padding: 5px 11px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
          background: ${dark ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
          color: ${dark ? "#9ca3af" : "#6b7280"};
          transition: all 0.15s;
        }
        .fb-area-pill.active {
          border-color: #22c55e;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.10);
          font-weight: 700;
        }
        .fb-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-family: inherit;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(7, 9, 18, 0.6)" : "#ffffff"};
          color: ${dark ? "#f3f4f6" : "#111827"};
          outline: none;
          resize: vertical;
          min-height: 80px;
        }
        .fb-textarea:focus {
          border-color: #4f8ef7;
        }
        .fb-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
          margin-bottom: 14px;
        }
        .fb-chip-btn {
          font-size: 10.5px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 6px;
          border: 1px dashed ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"};
          background: transparent;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          cursor: pointer;
          transition: all 0.15s;
        }
        .fb-chip-btn:hover {
          color: #4f8ef7;
          border-color: #4f8ef7;
          background: rgba(79, 142, 247, 0.08);
        }
        .fb-email-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          cursor: pointer;
          user-select: none;
          margin-bottom: 18px;
        }
        .fb-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
        }
        .fb-cancel-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: transparent;
          color: ${dark ? "#e5e7eb" : "#374151"};
          cursor: pointer;
        }
        .fb-submit-btn {
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          border: none;
          background: linear-gradient(135deg, #4f8ef7, #3b82f6);
          box-shadow: 0 6px 20px rgba(79, 142, 247, 0.35);
          cursor: pointer;
          transition: all 0.2s;
        }
        .fb-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(79, 142, 247, 0.45);
        }
        .fb-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @keyframes fbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fbPop {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
