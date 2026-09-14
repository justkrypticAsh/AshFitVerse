// src/components/QuickActionsModal.jsx
import React, { useState, useMemo } from "react";
import {
  QA_CATEGORIES,
  QA_THEMES,
  getDefaultQuickActions,
  getActionsForUser,
  sanitizeActionsForUser,
  isActionAllowedForUser,
} from "../config/quickActionsCatalog";
import { showDonePopup } from "./DonePopup";

export default function QuickActionsModal({
  isOpen,
  onClose,
  currentActions = [],
  currentThemeId = "cyan",
  user,
  onSave,
  dark = true,
}) {
  if (!isOpen) return null;

  const sex = (user?.sex || user?.gender || "").toLowerCase();
  const isFemale = sex === "female";
  const isMale = sex === "male";

  // Catalog filtered strictly for this user's gender
  const allowedCatalog = useMemo(() => getActionsForUser(user), [user]);

  const [activeActions, setActiveActions] = useState(() => {
    return sanitizeActionsForUser(currentActions, user);
  });
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId || "cyan");
  const [activeCategory, setActiveCategory] = useState("all");

  const currentTheme =
    QA_THEMES.find((t) => t.id === selectedThemeId) || QA_THEMES[0];

  // Helper to reorder
  const moveAction = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= activeActions.length) return;
    const updated = [...activeActions];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setActiveActions(updated);
  };

  // Helper to remove
  const removeAction = (id) => {
    if (activeActions.length <= 1) return; // Keep at least 1 action
    setActiveActions(activeActions.filter((a) => a.id !== id));
  };

  // Helper to add
  const addAction = (action) => {
    if (!isActionAllowedForUser(action, user)) return;
    if (activeActions.some((a) => a.id === action.id)) return;
    if (activeActions.length >= 8) return; // Max 8 actions
    setActiveActions([...activeActions, action]);
  };

  // Reset to default
  const handleReset = () => {
    const defs = getDefaultQuickActions(user);
    setActiveActions(defs);
    setSelectedThemeId("cyan");
  };

  // Save handler
  const handleSave = () => {
    const sanitized = sanitizeActionsForUser(activeActions, user);
    onSave({
      actions: sanitized,
      themeId: selectedThemeId,
    });
    showDonePopup({
      title: "Done!",
      message: "Quick Actions updated & synced to your Dashboard!",
      subtext: `${sanitized.length} shortcuts active · ${currentTheme.name}`,
      color: currentTheme.color,
    });
    onClose();
  };

  const filteredCatalog = useMemo(() => {
    return allowedCatalog.filter((item) => {
      if (activeCategory === "all") return true;
      return item.category === activeCategory;
    });
  }, [allowedCatalog, activeCategory]);

  return (
    <div className="qa-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="qa-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="qa-modal-header">
          <div>
            <div className="qa-modal-title">
              Customize <span style={{ color: currentTheme.color }}>Quick Actions</span>
            </div>
            <div className="qa-modal-sub">
              Arrange shortcuts, pick your favorite tools, and choose your card accent glow.
              {isFemale && " • Tailored for Women's Health & Wellness"}
              {isMale && " • Tailored for Men's Vitality & Health"}
            </div>
          </div>
          <button className="qa-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Live Preview Section */}
        <div className="qa-preview-box">
          <div className="qa-preview-label">
            <span>LIVE DASHBOARD PREVIEW</span>
            <span style={{ color: currentTheme.color, fontWeight: 700 }}>
              {activeActions.length} of 8 Slots Used
            </span>
          </div>
          <div className="qa-preview-grid">
            {activeActions.map((action, idx) => (
              <div
                key={action.id}
                className="qa-preview-card"
                style={{
                  "--theme-glow": currentTheme.glow,
                  "--theme-color": currentTheme.color,
                }}
              >
                <span className="qa-preview-ico">{action.icon}</span>
                <span className="qa-preview-txt">{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Accent Color Picker */}
        <div className="qa-theme-section">
          <div className="qa-section-heading">Card Accent Glow</div>
          <div className="qa-theme-list">
            {QA_THEMES.map((theme) => {
              const active = theme.id === selectedThemeId;
              return (
                <button
                  key={theme.id}
                  className={`qa-theme-btn ${active ? "active" : ""}`}
                  style={{
                    "--btn-color": theme.color,
                    "--btn-glow": theme.glow,
                  }}
                  onClick={() => setSelectedThemeId(theme.id)}
                >
                  <div className="qa-theme-swatch" style={{ background: theme.color }} />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Actions & Order */}
        <div className="qa-active-section">
          <div className="qa-section-heading">
            Active Shortcuts (Drag or use arrows to reorder)
          </div>
          <div className="qa-active-list">
            {activeActions.map((action, idx) => (
              <div key={action.id} className="qa-active-item">
                <span className="qa-active-ico">{action.icon}</span>
                <span className="qa-active-name">{action.label}</span>
                <div className="qa-active-ctrls">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveAction(idx, -1)}
                    className="qa-arrow-btn"
                    title="Move Left"
                  >
                    ←
                  </button>
                  <button
                    disabled={idx === activeActions.length - 1}
                    onClick={() => moveAction(idx, 1)}
                    className="qa-arrow-btn"
                    title="Move Right"
                  >
                    →
                  </button>
                  <button
                    onClick={() => removeAction(action.id)}
                    className="qa-del-btn"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog Library by Category */}
        <div className="qa-catalog-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="qa-section-heading" style={{ margin: 0 }}>Add from Action Library</div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: isFemale ? "#ec4899" : isMale ? "#4f8ef7" : currentTheme.color,
              background: isFemale ? "rgba(236,72,153,0.12)" : isMale ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.06)",
              padding: "3px 10px",
              borderRadius: 99,
              border: `1px solid ${isFemale ? "rgba(236,72,153,0.3)" : isMale ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}>
              {isFemale ? "♀ Female Features Only" : isMale ? "♂ Male Features Only" : "⚡ Personalized Hub"}
            </span>
          </div>

          <div className="qa-cat-tabs">
            {QA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`qa-cat-pill ${activeCategory === cat.id ? "active" : ""}`}
                style={{
                  "--pill-color": currentTheme.color,
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="qa-catalog-grid">
            {filteredCatalog.map((item) => {
              const isAdded = activeActions.some((a) => a.id === item.id);
              return (
                <div key={item.id} className={`qa-catalog-item ${isAdded ? "added" : ""}`}>
                  <div className="qa-cat-item-left">
                    <span className="qa-cat-ico">{item.icon}</span>
                    <div>
                      <div className="qa-cat-name">{item.label}</div>
                      <div className="qa-cat-desc">{item.desc}</div>
                    </div>
                  </div>
                  {isAdded ? (
                    <button
                      className="qa-added-badge"
                      onClick={() => removeAction(item.id)}
                      title="Click to remove"
                    >
                      ✓ Added
                    </button>
                  ) : (
                    <button
                      className="qa-add-btn"
                      disabled={activeActions.length >= 8}
                      onClick={() => addAction(item)}
                      style={{
                        "--add-color": currentTheme.color,
                      }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="qa-modal-footer">
          <button className="qa-reset-btn" onClick={handleReset}>
            Reset to Default
          </button>
          <div className="qa-footer-actions">
            <button className="qa-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="qa-save-btn"
              onClick={handleSave}
              style={{
                background: `linear-gradient(135deg, ${currentTheme.color}, #8b5cf6)`,
                boxShadow: `0 8px 24px ${currentTheme.glow}`,
              }}
            >
              Save Layout ✓
            </button>
          </div>
        </div>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .qa-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(4, 6, 15, 0.78);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          animation: qaFadeIn 0.22s ease forwards;
        }
        .qa-modal-card {
          width: 100%;
          max-width: 780px;
          max-height: 90vh;
          overflow-y: auto;
          background: ${dark ? "rgba(14, 17, 28, 0.94)" : "rgba(255, 255, 255, 0.96)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          border-radius: 28px;
          padding: 28px;
          color: ${dark ? "#f3f4f6" : "#111827"};
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          animation: qaCardPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          scrollbar-width: thin;
        }
        .qa-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        .qa-modal-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .qa-modal-sub {
          font-size: 13px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-top: 4px;
        }
        .qa-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"};
          color: ${dark ? "#d1d5db" : "#4b5563"};
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .qa-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .qa-preview-box {
          background: ${dark ? "rgba(7, 9, 18, 0.65)" : "rgba(243, 244, 246, 0.75)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
          border-radius: 20px;
          padding: 18px;
          margin-bottom: 22px;
        }
        .qa-preview-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-bottom: 12px;
        }
        .qa-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 10px;
        }
        .qa-preview-card {
          padding: 14px 8px 10px;
          border-radius: 16px;
          background: ${dark ? "rgba(255, 255, 255, 0.05)" : "#ffffff"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
          text-align: center;
          box-shadow: 0 4px 14px var(--theme-glow);
          transition: transform 0.2s;
        }
        .qa-preview-ico {
          font-size: 22px;
          display: block;
          margin-bottom: 6px;
        }
        .qa-preview-txt {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--theme-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .qa-section-heading {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-bottom: 10px;
        }
        .qa-theme-section {
          margin-bottom: 22px;
        }
        .qa-theme-list {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .qa-theme-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)"};
          color: ${dark ? "#d1d5db" : "#374151"};
          transition: all 0.2s;
        }
        .qa-theme-btn.active {
          border-color: var(--btn-color);
          background: var(--btn-glow);
          color: var(--btn-color);
          font-weight: 700;
        }
        .qa-theme-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .qa-active-section {
          margin-bottom: 22px;
        }
        .qa-active-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .qa-active-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-radius: 12px;
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
        }
        .qa-active-ico {
          font-size: 18px;
          margin-right: 10px;
        }
        .qa-active-name {
          font-size: 13px;
          font-weight: 600;
          flex: 1;
        }
        .qa-active-ctrls {
          display: flex;
          gap: 6px;
        }
        .qa-arrow-btn, .qa-del-btn {
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.06)" : "#ffffff"};
          color: ${dark ? "#e5e7eb" : "#374151"};
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.15s;
        }
        .qa-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .qa-del-btn:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }
        .qa-catalog-section {
          margin-bottom: 24px;
        }
        .qa-cat-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .qa-cat-pill {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"};
          color: ${dark ? "#9ca3af" : "#6b7280"};
          cursor: pointer;
          transition: all 0.2s;
        }
        .qa-cat-pill.active {
          border-color: var(--pill-color);
          color: var(--pill-color);
          background: ${dark ? "rgba(255, 255, 255, 0.09)" : "#ffffff"};
        }
        .qa-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .qa-catalog-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 14px;
          background: ${dark ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
          transition: all 0.2s;
        }
        .qa-catalog-item.added {
          border-color: rgba(34, 197, 94, 0.4);
          background: ${dark ? "rgba(34, 197, 94, 0.04)" : "rgba(34, 197, 94, 0.02)"};
        }
        .qa-cat-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .qa-cat-ico {
          font-size: 20px;
        }
        .qa-cat-name {
          font-size: 13px;
          font-weight: 700;
        }
        .qa-cat-desc {
          font-size: 10.5px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
        }
        .qa-add-btn {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--add-color);
          border: 1px solid var(--add-color);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qa-add-btn:hover:not(:disabled) {
          background: var(--add-color);
          color: #ffffff;
        }
        .qa-add-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .qa-added-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          cursor: pointer;
          transition: all 0.2s;
        }
        .qa-added-badge:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .qa-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 18px;
          border-top: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
        }
        .qa-reset-btn {
          font-size: 12px;
          font-weight: 600;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          padding: 6px 0;
        }
        .qa-footer-actions {
          display: flex;
          gap: 10px;
        }
        .qa-cancel-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: transparent;
          color: ${dark ? "#e5e7eb" : "#374151"};
          cursor: pointer;
          transition: all 0.15s;
        }
        .qa-save-btn {
          padding: 10px 22px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qa-save-btn:hover {
          transform: translateY(-1px);
        }

        @keyframes qaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes qaCardPop {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
