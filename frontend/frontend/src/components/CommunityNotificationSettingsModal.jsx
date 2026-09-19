// src/components/CommunityNotificationSettingsModal.jsx
import React, { useState } from "react";
import { Bell, Volume2, Heart, Trophy, X, Check } from "lucide-react";
import { FONT } from "../theme";
import { getCommunityPrefs, saveCommunityPrefs } from "../hooks/useCommunityUnread";

export default function CommunityNotificationSettingsModal({ isOpen, onClose, onTestChime, dark, T }) {
  const [prefs, setPrefs] = useState(() => getCommunityPrefs());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggle = (key) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveCommunityPrefs(updated);
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const settingsItems = [
    {
      key: "dmAlerts",
      title: "Direct Message Popups",
      desc: "Show a professional floating banner whenever an athlete sends you a message.",
      icon: Bell,
      color: "#3b82f6",
    },
    {
      key: "dmSound",
      title: "Incoming Message Chime",
      desc: "Play an executive audio chime on incoming messages.",
      icon: Volume2,
      color: "#8b5cf6",
      hasTestBtn: true,
    },
    {
      key: "likesAlerts",
      title: "Workout Cheers & Likes",
      desc: "Notify when other athletes like or cheer your training logs.",
      icon: Heart,
      color: "#ff375f",
    },
    {
      key: "challengesAlerts",
      title: "Challenge Quests & Streaks",
      desc: "Alerts when squad challenges progress or team quests launch.",
      icon: Trophy,
      color: "#f59e0b",
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10008,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: dark ? "#0a0d18" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
          borderRadius: 24,
          padding: "24px 22px",
          width: "100%",
          maxWidth: 440,
          maxHeight: "88vh",
          overflowY: "auto",
          color: dark ? "#f8fafc" : "#0f172a",
          boxShadow: dark ? "0 24px 60px rgba(0, 0, 0, 0.6)" : "0 20px 48px rgba(15, 23, 42, 0.12)",
          animation: "notifModalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <style>{`
          @keyframes notifModalPop {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: FONT.display, fontSize: 17, fontWeight: 800 }}>
                Community Notifications
              </h3>
              <div style={{ fontSize: 11.5, color: dark ? "#94a3b8" : "#64748b" }}>
                In-app alerts & sound preferences
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
              color: dark ? "#94a3b8" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {savedSuccess && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(34, 197, 94, 0.12)",
              color: "#22c55e",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            <Check size={14} /> Preferences updated!
          </div>
        )}

        {/* Setting Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isOn = Boolean(prefs[item.key]);
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  border: dark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ display: "flex", gap: 12, flex: 1 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: `${item.color}18`,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 750, color: dark ? "#f8fafc" : "#0f172a" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.4, marginTop: 2 }}>
                      {item.desc}
                    </div>
                    {item.hasTestBtn && isOn && (
                      <button
                        onClick={onTestChime}
                        style={{
                          marginTop: 6,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: `1px solid ${item.color}35`,
                          background: `${item.color}15`,
                          color: item.color,
                          fontSize: 10.5,
                          fontWeight: 750,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>▶</span> Test Chime
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <div
                  onClick={() => toggle(item.key)}
                  role="switch"
                  aria-checked={isOn}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 99,
                    background: isOn ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : (dark ? "rgba(255,255,255,0.15)" : "#cbd5e1"),
                    padding: 2,
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isOn ? "flex-end" : "flex-start",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Done Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 42,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#ffffff",
            fontFamily: FONT.display,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
