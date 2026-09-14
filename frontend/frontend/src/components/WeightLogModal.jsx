// src/components/WeightLogModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { todayKey, upsertDated, deleteLog, getEffectiveUid } from "../lib/userLogs";
import { showDonePopup } from "./DonePopup";

export default function WeightLogModal({
  isOpen,
  onClose,
  user = {},
  authUid,
  weights = [],
  updateUser,
  dark = true,
}) {
  if (!isOpen) return null;

  const effectiveUid = authUid || getEffectiveUid();
  const [selectedDate, setSelectedDate] = useState(() => todayKey());
  const [tag, setTag] = useState("Fasted Morning ☀️");
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("log"); // "log" | "history"
  const [saving, setSaving] = useState(false);

  // Find existing weight for selectedDate if present, or user's current weight, or 70
  const existingForDate = useMemo(() => {
    return weights.find((w) => (w.date || w.id) === selectedDate);
  }, [weights, selectedDate]);

  const [weightVal, setWeightVal] = useState(() => {
    if (existingForDate?.weight != null) return String(existingForDate.weight);
    if (user?.weight != null && user?.weight !== "") return String(user.weight);
    return "70.0";
  });

  // When date changes, prefill if already logged for that date
  useEffect(() => {
    const found = weights.find((w) => (w.date || w.id) === selectedDate);
    if (found?.weight != null) {
      setWeightVal(String(found.weight));
      if (found.tag) setTag(found.tag);
      if (found.note) setNote(found.note);
    } else if (user?.weight != null && user?.weight !== "") {
      setWeightVal(String(user.weight));
    }
  }, [selectedDate, weights, user]);

  // Previous recorded weight (prior to selected date)
  const previousEntry = useMemo(() => {
    const sorted = [...weights]
      .filter((w) => w.weight != null && (w.date || w.id) < selectedDate)
      .sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)));
    return sorted[0] || null;
  }, [weights, selectedDate]);

  // Delta calculation
  const currentNum = parseFloat(weightVal) || 0;
  const prevNum = previousEntry?.weight != null ? parseFloat(previousEntry.weight) : null;
  const delta = prevNum != null ? currentNum - prevNum : null;

  // Target difference
  const targetNum = parseFloat(user?.targetWeight) || null;
  const targetDiff = targetNum != null ? Math.abs(currentNum - targetNum).toFixed(1) : null;

  // Adjust steppers
  const adjustWeight = (amount) => {
    const cur = parseFloat(weightVal) || 70;
    const next = Math.max(20, Math.min(300, +(cur + amount).toFixed(1)));
    setWeightVal(next.toFixed(1));
  };

  // Quick tags
  const QUICK_TAGS = [
    "Fasted Morning ☀️",
    "Post-Workout 🏋️",
    "Evening 🌙",
    "Post-Meal 🥗",
  ];

  // Save handler
  const handleSave = async () => {
    const num = parseFloat(weightVal);
    if (!num || isNaN(num) || num <= 0) return;

    setSaving(true);
    try {
      // 1. Save dated weight entry to weights collection
      await upsertDated(effectiveUid, "weights", selectedDate, {
        weight: num,
        tag: tag || "Check-in",
        note: note.trim() || "",
        source: "daily-weight-logger",
      });

      // 2. If logged for today, keep user profile weight in sync
      if (selectedDate === todayKey() && updateUser) {
        await updateUser({ weight: num });
      }

      const diffMsg =
        delta != null
          ? delta === 0
            ? "Steady vs previous"
            : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg vs previous`
          : targetDiff
          ? `${targetDiff} kg to target`
          : "Daily check-in saved";

      showDonePopup({
        title: "Weight Logged!",
        message: `${num} kg recorded for ${selectedDate === todayKey() ? "Today" : selectedDate}`,
        subtext: diffMsg,
        color: "#22c55e",
      });

      onClose();
    } catch (err) {
      console.error("Failed to save weight:", err);
    } finally {
      setSaving(false);
    }
  };

  // Delete an entry from history
  const handleDelete = async (entryId) => {
    if (!entryId) return;
    try {
      await deleteLog(effectiveUid, "weights", entryId);
      showDonePopup({
        title: "Entry Removed",
        message: "Weight log was removed from your history.",
        subtext: "Synced with Dashboard",
        color: "#ef4444",
      });
    } catch (err) {
      console.error("Delete log failed:", err);
    }
  };

  // Sorted history entries
  const sortedHistory = useMemo(() => {
    return [...weights]
      .filter((w) => w.weight != null)
      .sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)));
  }, [weights]);

  const yesterdayDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  }, []);

  return (
    <div className="wl-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="wl-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wl-header">
          <div className="wl-header-left">
            <span className="wl-badge-icon">⚖️</span>
            <div>
              <div className="wl-title">
                Daily <span style={{ color: "#22c55e" }}>Weight Log</span>
              </div>
              <div className="wl-sub">
                Track your morning weigh-in & watch your daily trend unfold.
              </div>
            </div>
          </div>
          <button className="wl-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Tab switch */}
        <div className="wl-tabs">
          <button
            className={`wl-tab ${activeTab === "log" ? "active" : ""}`}
            onClick={() => setActiveTab("log")}
          >
            ✏️ Quick Log
          </button>
          <button
            className={`wl-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📋 History ({sortedHistory.length})
          </button>
        </div>

        {activeTab === "log" ? (
          <div>
            {/* Date Selection Bar */}
            <div className="wl-date-bar">
              <div className="wl-date-label">WEIGH-IN DATE</div>
              <div className="wl-date-btns">
                <button
                  className={`wl-date-pill ${selectedDate === todayKey() ? "active" : ""}`}
                  onClick={() => setSelectedDate(todayKey())}
                >
                  Today
                </button>
                <button
                  className={`wl-date-pill ${selectedDate === yesterdayDate ? "active" : ""}`}
                  onClick={() => setSelectedDate(yesterdayDate)}
                >
                  Yesterday
                </button>
                <input
                  type="date"
                  className="wl-date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={todayKey()}
                />
              </div>
            </div>

            {/* Weight Input Box */}
            <div className="wl-input-box">
              <div className="wl-input-row">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  className="wl-main-input"
                  value={weightVal}
                  onChange={(e) => setWeightVal(e.target.value)}
                  autoFocus
                />
                <span className="wl-unit">kg</span>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="wl-steppers">
                <button className="wl-step-btn" onClick={() => adjustWeight(-1.0)}>-1.0</button>
                <button className="wl-step-btn" onClick={() => adjustWeight(-0.1)}>-0.1</button>
                <button className="wl-step-btn" onClick={() => adjustWeight(0.1)}>+0.1</button>
                <button className="wl-step-btn" onClick={() => adjustWeight(1.0)}>+1.0</button>
              </div>

              {/* Dynamic Insights & Comparison */}
              <div className="wl-insights">
                {prevNum != null && delta != null && (
                  <div className="wl-insight-item">
                    <span className="wl-insight-lbl">Since previous entry ({prevNum} kg):</span>
                    <span
                      className="wl-insight-val"
                      style={{
                        color: delta < 0 ? "#22c55e" : delta > 0 ? "#fb923c" : "#9ca3af",
                      }}
                    >
                      {delta === 0
                        ? "Steady (0.0 kg)"
                        : `${delta > 0 ? "📈 +" : "📉 "}${delta.toFixed(1)} kg`}
                    </span>
                  </div>
                )}
                {targetNum != null && targetDiff != null && (
                  <div className="wl-insight-item">
                    <span className="wl-insight-lbl">Target ({targetNum} kg):</span>
                    <span className="wl-insight-val" style={{ color: "#4f8ef7" }}>
                      🎯 {targetDiff} kg {currentNum > targetNum ? "to lose" : "to gain"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Condition Tag Pills */}
            <div className="wl-section-subheading">Condition / Timing</div>
            <div className="wl-tags-row">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t}
                  className={`wl-tag-pill ${tag === t ? "active" : ""}`}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Optional Note Input */}
            <div className="wl-note-wrap">
              <input
                type="text"
                className="wl-note-input"
                placeholder="Optional notes (e.g. fasted morning, good hydration...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Footer Buttons */}
            <div className="wl-footer">
              <button className="wl-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="wl-save-btn"
                onClick={handleSave}
                disabled={saving || !currentNum}
              >
                {saving ? "Saving..." : "Save Weigh-in ✓"}
              </button>
            </div>
          </div>
        ) : (
          /* History View */
          <div className="wl-history-view">
            {sortedHistory.length === 0 ? (
              <div className="wl-empty-history">
                <span style={{ fontSize: 36 }}>⚖️</span>
                <div style={{ marginTop: 10, fontWeight: 700 }}>No weight logs recorded yet</div>
                <div style={{ fontSize: 12, color: dark ? "#9ca3af" : "#6b7280", marginTop: 4 }}>
                  Log your first weigh-in using the "Quick Log" tab above!
                </div>
              </div>
            ) : (
              <div className="wl-history-list">
                {sortedHistory.map((item, idx) => {
                  const itemDate = item.date || item.id;
                  const prevItem = sortedHistory[idx + 1];
                  const itemDelta =
                    prevItem?.weight != null ? Number(item.weight) - Number(prevItem.weight) : null;

                  return (
                    <div key={item.id || itemDate} className="wl-history-card">
                      <div className="wl-hist-left">
                        <div className="wl-hist-date">
                          {itemDate === todayKey()
                            ? "Today"
                            : itemDate === yesterdayDate
                            ? "Yesterday"
                            : itemDate}
                        </div>
                        <div className="wl-hist-tag">
                          {item.tag || "Check-in"}{item.note ? ` · ${item.note}` : ""}
                        </div>
                      </div>

                      <div className="wl-hist-right">
                        <div className="wl-hist-weight">{Number(item.weight).toFixed(1)} kg</div>
                        {itemDelta != null && (
                          <div
                            className="wl-hist-delta"
                            style={{
                              color: itemDelta < 0 ? "#22c55e" : itemDelta > 0 ? "#fb923c" : "#9ca3af",
                            }}
                          >
                            {itemDelta === 0
                              ? "±0.0"
                              : `${itemDelta > 0 ? "↑ +" : "↓ "}${itemDelta.toFixed(1)}`}
                          </div>
                        )}
                        <button
                          className="wl-hist-del"
                          onClick={() => handleDelete(item.id || itemDate)}
                          title="Delete entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="wl-footer" style={{ marginTop: 18 }}>
              <button className="wl-cancel-btn" onClick={() => setActiveTab("log")}>
                ← Back to Log
              </button>
              <button className="wl-save-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .wl-overlay {
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
          animation: wlFadeIn 0.2s ease forwards;
        }
        .wl-card {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          background: ${dark ? "rgba(14, 18, 30, 0.96)" : "rgba(255, 255, 255, 0.98)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          border-radius: 26px;
          padding: 26px;
          color: ${dark ? "#f3f4f6" : "#111827"};
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          animation: wlPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          scrollbar-width: thin;
        }
        .wl-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .wl-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wl-badge-icon {
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.25);
        }
        .wl-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .wl-sub {
          font-size: 12px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-top: 3px;
        }
        .wl-close-btn {
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
        .wl-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .wl-tabs {
          display: flex;
          gap: 8px;
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"};
          padding: 4px;
          border-radius: 14px;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)"};
          margin-bottom: 20px;
        }
        .wl-tab {
          flex: 1;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          background: transparent;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          transition: all 0.2s;
        }
        .wl-tab.active {
          background: ${dark ? "rgba(255, 255, 255, 0.10)" : "#ffffff"};
          color: ${dark ? "#ffffff" : "#111827"};
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .wl-date-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .wl-date-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: ${dark ? "#9ca3af" : "#6b7280"};
        }
        .wl-date-btns {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wl-date-pill {
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 700;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"};
          color: ${dark ? "#d1d5db" : "#374151"};
          cursor: pointer;
          transition: all 0.15s;
        }
        .wl-date-pill.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.35);
        }
        .wl-date-input {
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff"};
          color: ${dark ? "#d1d5db" : "#374151"};
          outline: none;
        }
        .wl-input-box {
          background: ${dark ? "rgba(7, 9, 18, 0.70)" : "rgba(243, 244, 246, 0.85)"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
          border-radius: 20px;
          padding: 22px 18px 18px;
          text-align: center;
          margin-bottom: 18px;
        }
        .wl-input-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
        }
        .wl-main-input {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          font-size: 52px;
          font-weight: 800;
          color: ${dark ? "#f3f4f6" : "#111827"};
          background: transparent;
          border: none;
          outline: none;
          width: 170px;
          text-align: right;
          letter-spacing: -0.03em;
        }
        .wl-unit {
          font-size: 20px;
          font-weight: 700;
          color: #22c55e;
        }
        .wl-steppers {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 14px;
        }
        .wl-step-btn {
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.06)" : "#ffffff"};
          color: ${dark ? "#f3f4f6" : "#111827"};
          cursor: pointer;
          transition: all 0.15s;
        }
        .wl-step-btn:hover {
          background: rgba(34, 197, 94, 0.18);
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.35);
        }
        .wl-insights {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px dashed ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .wl-insight-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .wl-insight-lbl {
          color: ${dark ? "#9ca3af" : "#6b7280"};
        }
        .wl-insight-val {
          font-weight: 700;
        }
        .wl-section-subheading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          margin-bottom: 8px;
        }
        .wl-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }
        .wl-tag-pill {
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)"};
          color: ${dark ? "#d1d5db" : "#374151"};
          cursor: pointer;
          transition: all 0.15s;
        }
        .wl-tag-pill.active {
          border-color: rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
          font-weight: 700;
        }
        .wl-note-wrap {
          margin-bottom: 20px;
        }
        .wl-note-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12.5px;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.10)"};
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff"};
          color: ${dark ? "#f3f4f6" : "#111827"};
          outline: none;
        }
        .wl-note-input:focus {
          border-color: #22c55e;
        }
        .wl-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
        }
        .wl-cancel-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.10)"};
          background: transparent;
          color: ${dark ? "#e5e7eb" : "#374151"};
          cursor: pointer;
        }
        .wl-save-btn {
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
          cursor: pointer;
          transition: all 0.2s;
        }
        .wl-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.45);
        }
        .wl-save-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* History styles */
        .wl-history-view {
          min-height: 240px;
        }
        .wl-empty-history {
          text-align: center;
          padding: 40px 10px;
        }
        .wl-history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 320px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .wl-history-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 14px;
          background: ${dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff"};
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
        }
        .wl-hist-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .wl-hist-date {
          font-size: 13px;
          font-weight: 700;
        }
        .wl-hist-tag {
          font-size: 11px;
          color: ${dark ? "#9ca3af" : "#6b7280"};
        }
        .wl-hist-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wl-hist-weight {
          font-size: 14px;
          font-weight: 800;
          color: #22c55e;
        }
        .wl-hist-delta {
          font-size: 11px;
          font-weight: 700;
        }
        .wl-hist-del {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid ${dark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"};
          background: transparent;
          color: ${dark ? "#9ca3af" : "#6b7280"};
          cursor: pointer;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .wl-hist-del:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }

        @keyframes wlFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wlPop {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
