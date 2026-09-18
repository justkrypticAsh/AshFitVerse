// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  listenAdminFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
} from "../lib/feedbackService";
import { showDonePopup } from "../components/DonePopup";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = listenAdminFeedbacks((items) => {
      setFeedbacks(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute metrics
  const totalCount = feedbacks.length;
  const avgRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const featureReqs = useMemo(
    () => feedbacks.filter((f) => f.category === "feature_request").length,
    [feedbacks]
  );
  const bugReports = useMemo(
    () => feedbacks.filter((f) => f.category === "bug_report").length,
    [feedbacks]
  );
  const dietWorkoutIdeas = useMemo(
    () => feedbacks.filter((f) => f.category === "diet_workout").length,
    [feedbacks]
  );

  // Star breakdown
  const starDist = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      const r = Math.round(Number(f.rating) || 5);
      if (counts[r] != null) counts[r]++;
    });
    return counts;
  }, [feedbacks]);

  // Filtered list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      if (selectedCat !== "all" && item.category !== selectedCat) return false;
      if (selectedRating !== "all") {
        if (selectedRating === "5" && item.rating !== 5) return false;
        if (selectedRating === "4" && item.rating !== 4) return false;
        if (selectedRating === "3-" && item.rating > 3) return false;
      }
      if (selectedStatus !== "all" && (item.status || "new") !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.userName?.toLowerCase().includes(q);
        const matchesEmail = item.userEmail?.toLowerCase().includes(q);
        const matchesMsg = item.message?.toLowerCase().includes(q);
        const matchesArea = item.area?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesMsg && !matchesArea) return false;
      }
      return true;
    });
  }, [feedbacks, selectedCat, selectedRating, selectedStatus, searchQuery]);

  // Status handler
  const handleStatusChange = async (id, newStatus) => {
    await updateFeedbackStatus(id, newStatus);
    showDonePopup({
      title: "Status Updated",
      message: `Feedback marked as ${newStatus.toUpperCase()}`,
      subtext: "Synced in real time",
      color: "#4f8ef7",
    });
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback entry?")) {
      await deleteFeedback(id);
      showDonePopup({
        title: "Entry Removed",
        message: "Feedback deleted from system.",
        subtext: "Synced with Cloud",
        color: "#ef4444",
      });
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (!feedbacks.length) return;
    const headers = ["ID", "Date", "User Name", "Email", "Rating", "Category", "Area", "Status", "Message"];
    const rows = feedbacks.map((f) => [
      `"${f.id}"`,
      `"${f.createdAt || ""}"`,
      `"${(f.userName || "").replace(/"/g, '""')}"`,
      `"${(f.userEmail || "").replace(/"/g, '""')}"`,
      f.rating,
      `"${f.category || ""}"`,
      `"${(f.area || "").replace(/"/g, '""')}"`,
      `"${f.status || "new"}"`,
      `"${(f.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ashfitverse_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "feature_request":
        return { label: "💡 Feature Request", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" };
      case "bug_report":
        return { label: "🐛 Bug Report", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
      case "diet_workout":
        return { label: "🥗 Diet / Workout", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
      case "review":
        return { label: "⭐ Review / Praise", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
      default:
        return { label: "💬 General", color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" };
    }
  };

  const getStatusBadge = (status = "new") => {
    switch (status) {
      case "resolved":
        return { label: "Resolved ✓", color: "#22c55e" };
      case "planned":
        return { label: "Planned 🚀", color: "#a78bfa" };
      case "reviewing":
        return { label: "Reviewing 🔍", color: "#fbbf24" };
      default:
        return { label: "New 🟡", color: "#38bdf8" };
    }
  };

  return (
    <div className="adm-page">
      {/* Top Navigation Bar */}
      <header className="adm-header">
        <div className="adm-header-left">
          <div className="adm-logo-badge">🛡️ ADMIN</div>
          <div>
            <h1 className="adm-title">
              AshFitVerse <span style={{ color: "#4f8ef7" }}>Control Center</span>
            </h1>
            <div className="adm-sub">
              Master Admin: <strong style={{ color: "#fff" }}>ashishkanellis33@gmail.com</strong> · Live User Feedback & Requests
            </div>
          </div>
        </div>

        <div className="adm-header-right">
          <button className="adm-export-btn" onClick={exportToCSV} disabled={!feedbacks.length}>
            📥 Export CSV
          </button>
          <button className="adm-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="adm-main">
        {/* KPI Metrics Row */}
        <section className="adm-kpi-grid">
          <div className="adm-kpi-card">
            <div className="adm-kpi-icon" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>★</div>
            <div>
              <div className="adm-kpi-val" style={{ color: "#fbbf24" }}>
                {avgRating} <span style={{ fontSize: 16, color: "#9ca3af" }}>/ 5.0</span>
              </div>
              <div className="adm-kpi-lbl">Average App Rating</div>
            </div>
          </div>

          <div className="adm-kpi-card">
            <div className="adm-kpi-icon" style={{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" }}>💬</div>
            <div>
              <div className="adm-kpi-val">{totalCount}</div>
              <div className="adm-kpi-lbl">Total Submissions</div>
            </div>
          </div>

          <div className="adm-kpi-card">
            <div className="adm-kpi-icon" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>💡</div>
            <div>
              <div className="adm-kpi-val" style={{ color: "#a78bfa" }}>{featureReqs}</div>
              <div className="adm-kpi-lbl">Feature Requests</div>
            </div>
          </div>

          <div className="adm-kpi-card">
            <div className="adm-kpi-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>🐛</div>
            <div>
              <div className="adm-kpi-val" style={{ color: "#ef4444" }}>{bugReports}</div>
              <div className="adm-kpi-lbl">Bugs Reported</div>
            </div>
          </div>
        </section>

        {/* Rating Breakdown Row */}
        <section className="adm-chart-card">
          <div className="adm-section-title">Rating Distribution</div>
          <div className="adm-dist-grid">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starDist[star] || 0;
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={star} className="adm-dist-row">
                  <span className="adm-dist-star">{star} ★</span>
                  <div className="adm-dist-bar-bg">
                    <div
                      className="adm-dist-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background:
                          star >= 4
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : star === 3
                            ? "linear-gradient(90deg, #fbbf24, #d97706)"
                            : "linear-gradient(90deg, #ef4444, #dc2626)",
                      }}
                    />
                  </div>
                  <span className="adm-dist-count">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filters and Search Toolbar */}
        <section className="adm-toolbar">
          <div className="adm-search-wrap">
            <span className="adm-search-ico">🔍</span>
            <input
              type="text"
              className="adm-search-input"
              placeholder="Search by user, email, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="adm-filters-row">
            {/* Category Pills */}
            <div className="adm-pills-wrap">
              {[
                { id: "all", label: "All Types" },
                { id: "feature_request", label: "💡 Features" },
                { id: "bug_report", label: "🐛 Bugs" },
                { id: "diet_workout", label: "🥗 Ideas" },
                { id: "review", label: "⭐ Reviews" },
              ].map((c) => (
                <button
                  key={c.id}
                  className={`adm-filter-pill ${selectedCat === c.id ? "active" : ""}`}
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Rating Dropdown */}
            <select
              className="adm-select"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3-">3 Stars or less</option>
            </select>

            {/* Status Dropdown */}
            <select
              className="adm-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="planned">Planned</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </section>

        {/* Feedbacks Stream */}
        <section className="adm-feed">
          <div className="adm-feed-header">
            <span>SHOWING {filteredFeedbacks.length} OF {feedbacks.length} ENTRIES</span>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="adm-empty-card">
              <span style={{ fontSize: 44 }}>📬</span>
              <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700 }}>No feedback entries found</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                {searchQuery || selectedCat !== "all"
                  ? "Try resetting your search query or filters."
                  : "User feedback and feature requests will appear here automatically in real time!"}
              </div>
            </div>
          ) : (
            <div className="adm-feed-list">
              {filteredFeedbacks.map((item) => {
                const catInfo = getCategoryBadge(item.category);
                const statusInfo = getStatusBadge(item.status);
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Just now";

                return (
                  <article key={item.id} className="adm-item-card">
                    {/* Item Top Row */}
                    <div className="adm-item-top">
                      <div className="adm-user-info">
                        <div className="adm-avatar">{item.userName?.[0]?.toUpperCase() || "A"}</div>
                        <div>
                          <div className="adm-user-name">{item.userName || "Athlete"}</div>
                          <div className="adm-user-email">
                            {item.userEmail || "Anonymous"} · {dateStr}
                          </div>
                        </div>
                      </div>

                      <div className="adm-item-badges">
                        {/* Rating Stars */}
                        <div className="adm-stars-display" title={`${item.rating} Stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ color: i < item.rating ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Category Badge */}
                        <span
                          className="adm-cat-badge"
                          style={{ color: catInfo.color, background: catInfo.bg, borderColor: `${catInfo.color}40` }}
                        >
                          {catInfo.label}
                        </span>

                        {/* Area Badge */}
                        {item.area && <span className="adm-area-badge">{item.area}</span>}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="adm-item-msg">{item.message}</div>

                    {/* Footer Controls */}
                    <div className="adm-item-footer">
                      <div className="adm-status-control">
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>STATUS:</span>
                        <select
                          className="adm-status-select"
                          style={{ color: statusInfo.color }}
                          value={item.status || "new"}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        >
                          <option value="new">🟡 New</option>
                          <option value="reviewing">🔍 Under Review</option>
                          <option value="planned">🚀 Planned for Update</option>
                          <option value="resolved">✓ Resolved</option>
                        </select>
                      </div>

                      <div className="adm-item-actions">
                        {item.userEmail && item.userEmail !== "Anonymous" && (
                          <a
                            href={`mailto:${item.userEmail}?subject=${encodeURIComponent("Regarding your AshFitVerse feedback")}`}
                            className="adm-reply-btn"
                            title="Reply to user via Email"
                          >
                            ✉️ Reply
                          </a>
                        )}
                        <button
                          className="adm-del-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete entry"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .adm-page {
          min-height: 100vh;
          background: #070913;
          color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          padding-bottom: 60px;
        }
        .adm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          background: rgba(14, 18, 30, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 99;
        }
        .adm-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .adm-logo-badge {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 6px 12px;
          border-radius: 99px;
          background: rgba(79, 142, 247, 0.15);
          color: #4f8ef7;
          border: 1px solid rgba(79, 142, 247, 0.35);
        }
        .adm-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .adm-sub {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 3px;
        }
        .adm-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .adm-export-btn {
          padding: 9px 16px;
          border-radius: 12px;
          font-size: 12.5px;
          font-weight: 700;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.30);
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-export-btn:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.22);
          transform: translateY(-1px);
        }
        .adm-back-btn {
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 12.5px;
          font-weight: 700;
          color: #f3f4f6;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-back-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .adm-main {
          max-width: 1120px;
          margin: 0 auto;
          padding: 28px 24px 0;
        }
        .adm-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .adm-kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(14, 18, 30, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .adm-kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .adm-kpi-val {
          font-size: 28px;
          font-weight: 800;
          line-height: 1;
        }
        .adm-kpi-lbl {
          font-size: 11.5px;
          font-weight: 600;
          color: #9ca3af;
          margin-top: 5px;
        }
        .adm-chart-card {
          background: rgba(14, 18, 30, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .adm-section-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 14px;
        }
        .adm-dist-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .adm-dist-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .adm-dist-star {
          width: 40px;
          font-size: 12px;
          font-weight: 700;
          color: #fbbf24;
        }
        .adm-dist-bar-bg {
          flex: 1;
          height: 8px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }
        .adm-dist-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .adm-dist-count {
          width: 70px;
          font-size: 11.5px;
          color: #9ca3af;
          text-align: right;
        }
        .adm-toolbar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(14, 18, 30, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .adm-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .adm-search-ico {
          position: absolute;
          left: 14px;
          font-size: 14px;
          opacity: 0.6;
        }
        .adm-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px 10px 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f3f4f6;
          font-size: 13px;
          outline: none;
        }
        .adm-search-input:focus {
          border-color: #4f8ef7;
        }
        .adm-filters-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .adm-pills-wrap {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .adm-filter-pill {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #9ca3af;
          transition: all 0.2s;
        }
        .adm-filter-pill.active {
          background: rgba(79, 142, 247, 0.15);
          color: #4f8ef7;
          border-color: rgba(79, 142, 247, 0.4);
          font-weight: 700;
        }
        .adm-select {
          padding: 6px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: #f3f4f6;
          font-size: 12px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .adm-feed-header {
          font-size: 11px;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: #9ca3af;
          margin-bottom: 14px;
        }
        .adm-feed-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .adm-item-card {
          background: rgba(14, 18, 30, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          transition: transform 0.2s, border-color 0.2s;
        }
        .adm-item-card:hover {
          border-color: rgba(79, 142, 247, 0.25);
          transform: translateY(-1px);
        }
        .adm-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .adm-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .adm-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
        }
        .adm-user-name {
          font-size: 14px;
          font-weight: 700;
        }
        .adm-user-email {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .adm-item-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .adm-stars-display {
          font-size: 16px;
          letter-spacing: 2px;
        }
        .adm-cat-badge {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .adm-area-badge {
          padding: 4px 9px;
          border-radius: 8px;
          font-size: 10.5px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #d1d5db;
        }
        .adm-item-msg {
          font-size: 13.5px;
          line-height: 1.6;
          color: #e5e7eb;
          background: rgba(7, 9, 18, 0.5);
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 14px;
          white-space: pre-wrap;
        }
        .adm-item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .adm-status-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .adm-status-select {
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 12px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
        }
        .adm-item-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .adm-reply-btn {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(79, 142, 247, 0.12);
          color: #4f8ef7;
          border: 1px solid rgba(79, 142, 247, 0.3);
          text-decoration: none;
          transition: all 0.15s;
        }
        .adm-reply-btn:hover {
          background: rgba(79, 142, 247, 0.22);
        }
        .adm-del-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.15s;
        }
        .adm-del-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.35);
        }
        .adm-empty-card {
          text-align: center;
          padding: 60px 20px;
          background: rgba(14, 18, 30, 0.5);
          border-radius: 20px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
