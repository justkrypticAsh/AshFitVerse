// src/components/DonePopup.jsx
// ─────────────────────────────────────────────────────────────
// Universal Apple-grade "Done!" feedback popup
// Automatically triggered whenever a user logs workouts, meals,
// sleep, mood, cycle, habits, weight, or health metrics.
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";

export function showDonePopup({
  title = "Done!",
  message = "Your data has been logged and synced to your dashboard in real time.",
  subtext = "Real-time sync active ⚡",
  icon = "✓",
  color = "#22c55e",
  duration = 2600,
} = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ashfitverse:done", {
      detail: { title, message, subtext, icon, color, duration },
    })
  );
}

export default function DonePopup() {
  const [popup, setPopup] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timeoutId = null;

    const handleEvent = (e) => {
      const data = e.detail || {};
      setClosing(false);
      setPopup(data);

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        closePopup();
      }, data.duration || 2600);
    };

    window.addEventListener("ashfitverse:done", handleEvent);
    return () => {
      window.removeEventListener("ashfitverse:done", handleEvent);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const closePopup = () => {
    setClosing(true);
    setTimeout(() => {
      setPopup(null);
      setClosing(false);
    }, 280);
  };

  if (!popup) return null;

  const {
    title = "Done!",
    message = "Your data has been logged and synced to your dashboard in real time.",
    subtext = "Real-time sync active ⚡",
    icon = "✓",
    color = "#22c55e",
    duration = 2600,
  } = popup;

  return (
    <div
      className={`done-overlay ${closing ? "closing" : ""}`}
      onClick={closePopup}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        .done-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          animation: doneBackdropFade 0.25s ease forwards;
        }
        .done-overlay.closing {
          animation: doneBackdropFadeOut 0.28s ease forwards;
        }
        .done-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: linear-gradient(145deg, rgba(28, 30, 42, 0.95), rgba(16, 17, 24, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 28px;
          padding: 32px 28px 24px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px ${color}25, inset 0 1px 0 rgba(255, 255, 255, 0.20);
          text-align: center;
          color: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          animation: doneCardPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          overflow: hidden;
        }
        .done-overlay.closing .done-card {
          animation: doneCardPopOut 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .done-icon-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .done-icon-glow {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: radial-gradient(circle, ${color}55 0%, transparent 70%);
          filter: blur(10px);
          animation: doneGlowPulse 1.8s ease-in-out infinite;
        }
        .done-icon-circle {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color}, #16a34a);
          box-shadow: 0 8px 25px ${color}50, inset 0 2px 4px rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
        }
        .done-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .done-msg {
          font-size: 13.5px;
          color: rgba(245, 245, 247, 0.78);
          line-height: 1.55;
          margin-bottom: 16px;
          font-weight: 450;
        }
        .done-subtext {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          font-size: 11px;
          font-weight: 600;
          color: ${color};
          margin-bottom: 22px;
          letter-spacing: 0.02em;
        }
        .done-btn {
          width: 100%;
          padding: 13px 20px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, ${color}, #15803d);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 18px ${color}45;
        }
        .done-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 8px 24px ${color}65;
        }
        .done-btn:active {
          transform: translateY(0);
        }
        .done-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: ${color};
          width: 100%;
          transform-origin: left;
          animation: doneProgress ${duration}ms linear forwards;
        }
        @keyframes doneBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes doneBackdropFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes doneCardPop {
          from {
            opacity: 0;
            transform: scale(0.88) translateY(14px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes doneCardPopOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.92) translateY(10px);
          }
        }
        @keyframes doneGlowPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes doneProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <div className="done-card" onClick={(e) => e.stopPropagation()}>
        <div className="done-icon-wrap">
          <div className="done-icon-glow" />
          <div className="done-icon-circle">{icon}</div>
        </div>
        <div className="done-title">{title}</div>
        <div className="done-msg">{message}</div>
        {subtext && <div className="done-subtext">{subtext}</div>}
        <button className="done-btn" onClick={closePopup}>
          OK
        </button>
        <div className="done-progress-bar" />
      </div>
    </div>
  );
}
