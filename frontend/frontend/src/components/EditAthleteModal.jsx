// src/components/EditAthleteModal.jsx
import React, { useState, useEffect } from "react";
import { FONT } from "../theme";
import { checkUsernameUnique } from "../hooks/useUser";

const PRESET_AVATARS = [
  { id: "iron_lifter", label: "Lifter", emoji: "🏋️", c1: "#2563eb", c2: "#1d4ed8" },
  { id: "speed_runner", label: "Runner", emoji: "🏃", c1: "#059669", c2: "#10b981" },
  { id: "mindful_yoga", label: "Yoga", emoji: "🧘", c1: "#7c3aed", c2: "#a855f7" },
  { id: "blaze_power", label: "Power", emoji: "🔥", c1: "#ea580c", c2: "#f97316" },
  { id: "combat_pro", label: "Boxing", emoji: "🥊", c1: "#dc2626", c2: "#ef4444" },
  { id: "titan_gold", label: "Titan", emoji: "🥇", c1: "#d97706", c2: "#f59e0b" },
  { id: "cyber_athlete", label: "Cyber", emoji: "⚡", c1: "#0284c7", c2: "#38bdf8" },
  { id: "biohacker", label: "Bio", emoji: "🧬", c1: "#4f46e5", c2: "#6366f1" },
];

function generateSvgAvatar(preset) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${preset.c1}" />
        <stop offset="100%" stop-color="${preset.c2}" />
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="64" fill="url(#g)" />
    <text x="50%" y="54%" font-size="60" text-anchor="middle" dominant-baseline="central">${preset.emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function EditAthleteModal({
  isOpen,
  user = {},
  currentUid,
  onClose,
  onSave,
  dark = true,
  T = {},
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, valid: true, message: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      const currentHandle = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, "_") : "");
      setUsername(currentHandle);
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setUsernameStatus({ checking: false, valid: true, message: "Current handle" });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setAvatar(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (val) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
    setUsername(cleaned);

    if (!cleaned || cleaned.length < 3) {
      setUsernameStatus({ checking: false, valid: false, message: "Min 3 characters (letters, numbers, _ .)" });
      return;
    }

    if (cleaned === user.username) {
      setUsernameStatus({ checking: false, valid: true, message: "✓ Your current handle" });
      return;
    }

    setUsernameStatus({ checking: true, valid: null, message: "Checking availability…" });
    const res = await checkUsernameUnique(cleaned, currentUid);
    if (res.valid) {
      setUsernameStatus({ checking: false, valid: true, message: `✓ @${cleaned} is available!` });
    } else {
      setUsernameStatus({ checking: false, valid: false, message: res.error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide an athlete name.");
      return;
    }
    if (usernameStatus.valid === false) {
      alert("Please select a unique, valid username before saving.");
      return;
    }

    setSaving(true);
    try {
      const finalUsername = username.trim() || name.toLowerCase().replace(/\s+/g, "_");
      await onSave({
        name: name.trim(),
        username: finalUsername,
        avatar: avatar || null,
        bio: bio.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.76)",
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
          border: `1.5px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          color: dark ? "#f8fafc" : "#0f172a",
          boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
          padding: "26px 24px",
          fontFamily: FONT.body,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: FONT.display, fontSize: 18, fontWeight: 900, color: dark ? "#f8fafc" : "#0f172a" }}>
              Edit Community Profile
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: dark ? "#94a3b8" : "#64748b" }}>
              Set your profile photo and claim your unique @username handle.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`,
              borderRadius: 10,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: dark ? "#94a3b8" : "#475569",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div style={{ marginBottom: 22, textAlign: "center" }}>
            <div style={{ position: "relative", width: 92, height: 92, margin: "0 auto 12px" }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `3px solid ${dark ? "#3b82f6" : "#2563eb"}`,
                    boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: "0 6px 20px rgba(59,130,246,0.25)",
                  }}
                >
                  {name?.[0]?.toUpperCase() || "A"}
                </div>
              )}
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar("")}
                  title="Remove avatar"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: `2px solid ${dark ? "#0a0d18" : "#ffffff"}`,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: `1px solid ${dark ? "rgba(255,255,255,0.16)" : "#cbd5e1"}`,
                  background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
                  fontSize: 12,
                  fontWeight: 700,
                  color: dark ? "#f8fafc" : "#0f172a",
                  cursor: "pointer",
                }}
              >
                <span>📷</span> Upload Photo
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>

            {/* Curated Presets */}
            <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Or Pick an Athletic Avatar
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAvatar(generateSvgAvatar(p))}
                  title={p.label}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: `1.5px solid ${dark ? "rgba(255,255,255,0.14)" : "#cbd5e1"}`,
                    background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`,
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.16s ease",
                  }}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Unique Username Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#475569", marginBottom: 6 }}>
              Unique Handle (@username)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                border: `1.5px solid ${
                  usernameStatus.valid === false
                    ? "#ef4444"
                    : usernameStatus.valid === true
                    ? "#10b981"
                    : dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"
                }`,
                borderRadius: 12,
                padding: "0 12px",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: dark ? "#60a5fa" : "#2563eb", marginRight: 4 }}>@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="athlete_handle"
                style={{
                  flex: 1,
                  height: 42,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontFamily: FONT.body,
                }}
              />
            </div>
            {usernameStatus.message && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginTop: 4,
                  color: usernameStatus.valid === false ? "#ef4444" : usernameStatus.valid === true ? "#10b981" : dark ? "#94a3b8" : "#64748b",
                }}
              >
                {usernameStatus.message}
              </div>
            )}
            <div style={{ fontSize: 10.5, color: dark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
              Differentiates athletes with the same name in posts, comments, and DMs.
            </div>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#475569", marginBottom: 6 }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ashish Sharma"
              style={{
                width: "100%",
                height: 42,
                borderRadius: 12,
                padding: "0 12px",
                background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                border: `1.5px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                outline: "none",
                fontSize: 14,
                fontWeight: 600,
                color: dark ? "#f8fafc" : "#0f172a",
                boxSizing: "border-box",
                fontFamily: FONT.body,
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: dark ? "#94a3b8" : "#475569", marginBottom: 6 }}>
              Bio / Focus
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Calisthenics & 10K Runner | Consistent daily grind"
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "10px 12px",
                background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                border: `1.5px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                outline: "none",
                fontSize: 13,
                color: dark ? "#f8fafc" : "#0f172a",
                boxSizing: "border-box",
                resize: "none",
                fontFamily: FONT.body,
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                color: dark ? "#f8fafc" : "#0f172a",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || usernameStatus.valid === false}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: saving || usernameStatus.valid === false ? "not-allowed" : "pointer",
                opacity: saving || usernameStatus.valid === false ? 0.6 : 1,
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              }}
            >
              {saving ? "Saving Changes…" : "Save Identity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
