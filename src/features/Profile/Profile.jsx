// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import useUser from "../hooks/useUser";
import { generateCSS, FONT, generatePageBG } from "../theme";

const GOALS = [
  { id: "muscle",    label: "Muscle Gain",    icon: "💪" },
  { id: "fat_loss",  label: "Fat Loss",       icon: "🔥" },
  { id: "strength",  label: "Strength",       icon: "🏋️" },
  { id: "endurance", label: "Endurance",      icon: "🏃" },
  { id: "general",   label: "General Fitness",icon: "⚡" },
  { id: "wellness",  label: "Wellness",       icon: "🧘" },
];

const ACTIVITY = [
  { id: "sedentary",   label: "Sedentary",   sub: "Little to no movement" },
  { id: "light",       label: "Light",       sub: "1–3 days/week" },
  { id: "moderate",    label: "Moderate",    sub: "3–5 days/week" },
  { id: "active",      label: "Active",      sub: "6–7 days/week" },
  { id: "very_active", label: "Very Active", sub: "2x per day" },
];

const EQUIPMENT = [
  { id: "full_gym",   label: "Full Gym" },
  { id: "home",       label: "Home / Dumbbells" },
  { id: "bodyweight", label: "Bodyweight Only" },
  { id: "resistance", label: "Resistance Bands" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, updateUser, clearUser, loading, bmi, tdee, calorieTarget, isMale, isFemale } = useUser();

  const [mounted,  setMounted]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile | health | settings

  // Local edit state — mirrors user
  const [form, setForm] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync form when user loads
  useEffect(() => {
    if (user) setForm({ ...user });
  }, [user]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await updateUser(form);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const cancel = () => {
    setForm({ ...user });
    setEditing(false);
  };

  const bmiLabel = !bmi ? "—"
    : bmi < 18.5 ? "Underweight"
    : bmi < 25   ? "Healthy"
    : bmi < 30   ? "Overweight"
    : "Obese";

  const bmiColor = !bmi ? T.accent
    : bmi < 18.5 ? T.accent
    : bmi < 25   ? T.green
    : bmi < 30   ? T.orange
    : T.red;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const css = generateCSS(T, dark) + `
    .pr-root {
      min-height: 100vh;
      background: ${generatePageBG(T, dark)};
      color: ${T.text};
      font-family: ${FONT.body};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.5s ease, background 0.4s;
    }

    /* Header */
    .pr-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 32px;
      border-bottom: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(10,10,10,0.88)" : "rgba(255,255,255,0.88)"};
      backdrop-filter: blur(40px) saturate(180%);
      position: sticky; top: 0; z-index: 50;
    }
    .pr-header-left { display: flex; align-items: center; gap: 14px; }
    .pr-back {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 10px;
      border: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)"};
      backdrop-filter: blur(16px);
      color: ${T.text}; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.15s ease; font-family: ${FONT.body};
    }
    .pr-back:hover {
      background: ${T.accentSoft}; border-color: ${T.accent}40;
      color: ${T.accent};
    }
    .pr-logo { font-family: ${FONT.display}; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: ${T.text}; }
    .pr-logo span { color: ${T.accent}; }
    .theme-toggle { width: 52px; height: 28px; border-radius: 99px; border: 1px solid ${T.glassBorder}; background: ${dark ? "rgba(255,255,255,0.07)" : T.bgSecondary}; cursor: pointer; position: relative; flex-shrink: 0; }
    .toggle-thumb { width: 22px; height: 22px; border-radius: 50%; background: ${T.accent}; position: absolute; top: 3px; left: ${dark ? "27px" : "3px"}; transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; font-size: 11px; }

    /* Content */
    .pr-content { max-width: 900px; margin: 0 auto; padding: 36px 24px; }

    /* Hero card */
    .pr-hero {
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      border: 1px solid ${T.glassBorder};
      border-radius: 24px;
      backdrop-filter: blur(40px) saturate(180%);
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"},
        0 4px 28px ${T.shadow};
      padding: 32px;
      display: flex; align-items: flex-start; gap: 24px;
      margin-bottom: 20px;
      animation: fadeUp 0.4s ease both;
      position: relative; overflow: hidden;
    }
    .pr-hero::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, ${dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)"} 0%, transparent 50%);
      pointer-events: none;
    }

    /* Avatar */
    .pr-avatar-wrap { position: relative; flex-shrink: 0; }
    .pr-avatar {
      width: 88px; height: 88px; border-radius: 50%;
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      display: flex; align-items: center; justify-content: center;
      font-size: 34px; font-weight: 700; color: #fff;
      font-family: ${FONT.display};
      box-shadow:
        0 0 0 3px ${dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)"},
        0 0 0 5px ${T.accentGlow},
        0 8px 24px ${T.accentGlow};
    }
    .pr-gender-tag {
      position: absolute; bottom: -4px; right: -4px;
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      background: ${dark ? "rgba(18,18,18,0.95)" : "#fff"};
      border: 2px solid ${T.glassBorder};
      box-shadow: 0 2px 8px ${T.shadow};
    }

    .pr-hero-info { flex: 1; position: relative; z-index: 1; }
    .pr-name {
      font-family: ${FONT.display}; font-size: 26px; font-weight: 700;
      letter-spacing: -0.025em; color: ${T.text}; margin-bottom: 4px;
    }
    .pr-meta { font-size: 14px; color: ${T.textSub}; margin-bottom: 16px; }
    .pr-meta span { color: ${T.textMuted}; margin: 0 6px; }

    .pr-tags { display: flex; gap: 8px; flex-wrap: wrap; }
    .pr-tag {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 99px;
      font-size: 12px; font-weight: 600;
      background: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"};
      border: 1px solid ${T.glassBorder};
      color: ${T.text};
    }

    .pr-hero-actions {
      display: flex; flex-direction: column; gap: 8px;
      align-items: flex-end; flex-shrink: 0;
      position: relative; z-index: 1;
    }
    .edit-btn {
      height: 40px; padding: 0 20px; border-radius: 11px;
      border: 1px solid ${T.glassBorder};
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      backdrop-filter: blur(20px);
      color: ${T.text}; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.15s ease; font-family: ${FONT.body};
      box-shadow: inset 0 1px 0 ${dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.8)"};
    }
    .edit-btn:hover { border-color: ${T.glassBorderHover}; transform: scale(1.02); }
    .edit-btn.active {
      background: linear-gradient(145deg, ${T.accentHover} 0%, ${T.accent} 100%);
      color: #fff; border-color: transparent;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px ${T.accentGlow};
    }

    /* Stats row */
    .pr-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      margin-bottom: 20px;
      animation: fadeUp 0.4s ease 0.05s both;
    }
    .stat-card {
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      border: 1px solid ${T.glassBorder};
      border-radius: 18px;
      backdrop-filter: blur(40px) saturate(180%);
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.85)"},
        0 2px 16px ${T.shadow};
      padding: 20px;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute; inset: 0; border-radius: inherit;
      background: linear-gradient(135deg, ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)"} 0%, transparent 50%);
      pointer-events: none;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"}, 0 6px 24px ${T.shadow}; }
    .stat-card-val {
      font-family: ${FONT.display}; font-size: 28px; font-weight: 700;
      letter-spacing: -0.03em; line-height: 1; margin-bottom: 6px;
    }
    .stat-card-lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: ${T.textMuted}; }

    /* Tabs */
    .pr-tabs {
      display: flex; gap: 4px; margin-bottom: 20px;
      padding: 4px;
      background: ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
      border-radius: 13px;
      animation: fadeUp 0.4s ease 0.08s both;
    }
    .pr-tab {
      flex: 1; padding: 10px; border-radius: 10px;
      border: none; background: transparent;
      font-size: 14px; font-weight: 500; color: ${T.textSub};
      cursor: pointer; transition: all 0.15s ease; font-family: ${FONT.body};
      letter-spacing: -0.006em;
    }
    .pr-tab.active {
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      backdrop-filter: blur(20px);
      color: ${T.text}; font-weight: 600;
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.8)"},
        0 2px 8px ${T.shadow};
    }

    /* Main panel */
    .pr-panel {
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      border: 1px solid ${T.glassBorder};
      border-radius: 22px;
      backdrop-filter: blur(40px) saturate(180%);
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.85)"},
        0 4px 24px ${T.shadow};
      overflow: hidden;
      animation: fadeUp 0.4s ease 0.1s both;
      position: relative;
    }
    .pr-panel::before {
      content: '';
      position: absolute; inset: 0; border-radius: inherit;
      background: linear-gradient(135deg, ${dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)"} 0%, transparent 40%);
      pointer-events: none; z-index: 0;
    }

    /* Section inside panel */
    .pr-section { padding: 24px 28px; border-bottom: 1px solid ${T.glassBorder}; position: relative; z-index: 1; }
    .pr-section:last-child { border-bottom: none; }
    .pr-section-title {
      font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: ${T.textMuted}; margin-bottom: 18px;
    }

    /* Row (label + value / input) */
    .pr-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
    }
    .pr-row:last-child { border-bottom: none; padding-bottom: 0; }
    .pr-row-label { font-size: 14px; font-weight: 500; color: ${T.text}; }
    .pr-row-value { font-size: 14px; color: ${T.textSub}; text-align: right; text-transform: capitalize; }

    /* Edit inputs */
    .pr-input {
      height: 40px; width: 200px; text-align: right;
      background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
      border: 1px solid ${T.glassBorder}; border-radius: 10px;
      padding: 0 14px; font-size: 14px; font-family: ${FONT.body};
      color: ${T.text}; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .pr-input:focus {
      border-color: ${T.accent};
      box-shadow: 0 0 0 3px ${T.accentGlow};
    }
    .pr-select {
      height: 40px; padding: 0 14px;
      background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
      border: 1px solid ${T.glassBorder}; border-radius: 10px;
      font-size: 14px; font-family: ${FONT.body};
      color: ${T.text}; outline: none; cursor: pointer;
      -webkit-appearance: none;
      transition: border-color 0.15s;
    }
    .pr-select:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentGlow}; }

    /* Goal grid */
    .goal-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
    .goal-btn {
      padding: 12px 10px; border-radius: 12px;
      border: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)"};
      backdrop-filter: blur(12px);
      cursor: pointer; font-family: ${FONT.body};
      font-size: 12px; font-weight: 600; color: ${T.textSub};
      text-align: center; transition: all 0.15s ease;
    }
    .goal-btn:hover { border-color: ${T.glassBorderHover}; color: ${T.text}; }
    .goal-btn.active {
      background: ${T.accentSoft}; border-color: ${T.accent}40;
      color: ${T.accent}; font-weight: 700;
    }

    /* Activity list */
    .act-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; border-radius: 11px; margin-bottom: 6px;
      border: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)"};
      backdrop-filter: blur(12px);
      cursor: pointer; font-family: ${FONT.body};
      transition: all 0.15s ease;
    }
    .act-btn:hover { border-color: ${T.glassBorderHover}; }
    .act-btn.active { background: ${T.accentSoft}; border-color: ${T.accent}40; }
    .act-label { font-size: 14px; font-weight: 600; color: ${T.text}; }
    .act-sub   { font-size: 12px; color: ${T.textMuted}; margin-top: 1px; }
    .act-check { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 10px;
      background: ${T.accentSoft}; color: ${T.accent}; }

    /* Save/cancel bar */
    .save-bar {
      display: flex; gap: 10px; padding: 20px 28px;
      border-top: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(10,10,10,0.5)" : "rgba(255,255,255,0.5)"};
      position: relative; z-index: 1;
    }
    .save-btn {
      flex: 2; height: 46px; border-radius: 12px; border: none;
      background: linear-gradient(145deg, ${T.accentHover} 0%, ${T.accent} 100%);
      color: #fff; font-size: 15px; font-weight: 600;
      font-family: ${FONT.body}; cursor: pointer; transition: all 0.15s ease;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px ${T.accentGlow};
    }
    .save-btn:hover { transform: scale(1.02); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .cancel-btn {
      flex: 1; height: 46px; border-radius: 12px;
      border: 1px solid ${T.glassBorder};
      background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
      backdrop-filter: blur(16px);
      color: ${T.text}; font-size: 15px; font-weight: 500;
      font-family: ${FONT.body}; cursor: pointer; transition: all 0.15s ease;
      box-shadow: inset 0 1px 0 ${dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)"};
    }
    .cancel-btn:hover { border-color: ${T.glassBorderHover}; }

    /* Health tab specific */
    .health-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
    }
    .health-row:last-child { border-bottom: none; }
    .health-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .health-lbl { font-size: 14px; font-weight: 500; color: ${T.text}; }
    .health-sub { font-size: 12px; color: ${T.textMuted}; margin-top: 2px; }
    .health-val { margin-left: auto; font-size: 14px; font-weight: 600; }

    /* Settings toggle */
    .setting-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
    }
    .setting-row:last-child { border-bottom: none; }
    .setting-label { font-size: 14px; font-weight: 500; color: ${T.text}; }
    .setting-sub   { font-size: 12px; color: ${T.textMuted}; margin-top: 2px; }
    .setting-toggle {
      width: 48px; height: 26px; border-radius: 99px;
      background: ${T.accent}; border: none; cursor: pointer;
      position: relative; transition: background 0.2s;
      flex-shrink: 0;
    }
    .setting-toggle.off { background: ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}; }
    .st-thumb {
      width: 20px; height: 20px; border-radius: 50%; background: #fff;
      position: absolute; top: 3px; transition: left 0.2s ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    .st-thumb.on  { left: 25px; }
    .st-thumb.off { left: 3px; }

    /* Danger zone */
    .danger-zone {
      border: 1px solid ${dark ? "rgba(255,69,58,0.22)" : "rgba(211,47,47,0.18)"};
      border-radius: 18px;
      overflow: hidden; margin-top: 16px;
      animation: fadeUp 0.4s ease 0.14s both;
    }
    .danger-header {
      padding: 14px 20px;
      background: ${dark ? "rgba(255,69,58,0.07)" : "rgba(211,47,47,0.05)"};
      border-bottom: 1px solid ${dark ? "rgba(255,69,58,0.15)" : "rgba(211,47,47,0.12)"};
      font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; color: ${T.red};
    }
    .danger-body { padding: 16px 20px; }
    .danger-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0;
    }
    .danger-label { font-size: 14px; font-weight: 500; color: ${T.text}; }
    .danger-sub   { font-size: 12px; color: ${T.textMuted}; margin-top: 2px; }
    .danger-btn {
      padding: 9px 18px; border-radius: 10px;
      border: 1px solid ${dark ? "rgba(255,69,58,0.28)" : "rgba(211,47,47,0.22)"};
      background: ${dark ? "rgba(255,69,58,0.10)" : "rgba(211,47,47,0.07)"};
      color: ${T.red}; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: ${FONT.body}; transition: all 0.15s ease;
    }
    .danger-btn:hover { background: ${dark ? "rgba(255,69,58,0.18)" : "rgba(211,47,47,0.12)"}; border-color: ${T.red}50; }

    /* Success toast */
    .toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      padding: 13px 24px; border-radius: 14px;
      background: ${T.green};
      color: #fff; font-size: 14px; font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 9999;
      animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(16px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

    @media(max-width:700px) {
      .pr-hero { flex-direction: column; }
      .pr-hero-actions { flex-direction: row; width: 100%; }
      .pr-stats { grid-template-columns: repeat(2,1fr); }
      .goal-grid { grid-template-columns: repeat(2,1fr); }
      .pr-content { padding: 20px 14px; }
      .pr-header { padding: 12px 16px; }
      .pr-section { padding: 18px 18px; }
    }
  `;

  const [settingToggles, setSettingToggles] = useState({
    notifications: true,
    weeklyReport: true,
    cycleReminders: isFemale,
    darkMode: dark,
  });
  const toggleSetting = (k) => setSettingToggles(s => ({ ...s, [k]: !s[k] }));

  return (
    <>
      <style>{css}</style>
      {saved && <div className="toast">✓ Profile saved</div>}

      <div className="pr-root">
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* Header */}
        <div className="pr-header">
          <div className="pr-header-left">
            <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <div className="pr-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="pr-content">

          {/* Hero card */}
          <div className="pr-hero">
            <div className="pr-avatar-wrap">
              <div className="pr-avatar">
                {user.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="pr-gender-tag">
                {isFemale ? "♀" : isMale ? "♂" : "◎"}
              </div>
            </div>

            <div className="pr-hero-info">
              <div className="pr-name">{user.name || "Athlete"}</div>
              <div className="pr-meta">
                {user.age ? `${user.age} yrs` : "—"}
                {user.age && user.height ? <span>·</span> : null}
                {user.height ? `${user.height} cm` : ""}
                {(user.age || user.height) && joinDate !== "—" ? <span>·</span> : null}
                {joinDate !== "—" ? `Joined ${joinDate}` : ""}
              </div>
              <div className="pr-tags">
                {user.goal && (
                  <span className="pr-tag">
                    {GOALS.find(g => g.id === user.goal)?.icon} {GOALS.find(g => g.id === user.goal)?.label || user.goal.replace(/_/g, " ")}
                  </span>
                )}
                {user.activityLevel && (
                  <span className="pr-tag">
                    ⚡ {ACTIVITY.find(a => a.id === user.activityLevel)?.label || user.activityLevel}
                  </span>
                )}
                {user.equipment && (
                  <span className="pr-tag">
                    🏋️ {EQUIPMENT.find(e => e.id === user.equipment)?.label || user.equipment.replace(/_/g, " ")}
                  </span>
                )}
                {user.sex && (
                  <span className="pr-tag" style={{ color: isFemale ? T.pink : T.accent }}>
                    {isFemale ? "♀ Female" : isMale ? "♂ Male" : user.sex}
                  </span>
                )}
              </div>
            </div>

            <div className="pr-hero-actions">
              <button
                className={`edit-btn ${editing ? "active" : ""}`}
                onClick={() => editing ? cancel() : setEditing(true)}
              >
                {editing ? "Cancel" : "✏ Edit Profile"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="pr-stats">
            {[
              { label: "Weight",   val: user.weight   ? `${user.weight} kg`   : "—",                     color: T.accent  },
              { label: "BMI",      val: bmi            ? `${bmi}`               : "—",       sub: bmiLabel, color: bmiColor  },
              { label: "Calories", val: calorieTarget  ? `${calorieTarget}`     : "—",       sub: "kcal/day",color: T.green  },
              { label: "TDEE",     val: tdee           ? `${tdee}`              : "—",       sub: "maintenance",color:T.purple },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-card-lbl">{s.sub || s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="pr-tabs">
            {[
              { id: "profile",  label: "Profile"   },
              { id: "health",   label: "Health"    },
              { id: "settings", label: "Settings"  },
            ].map(t => (
              <button key={t.id} className={`pr-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="pr-panel">
              {/* Personal */}
              <div className="pr-section">
                <div className="pr-section-title">Personal Information</div>
                {[
                  { label: "Full Name", key: "name",         type: "text",   placeholder: "Your name"  },
                  { label: "Age",       key: "age",          type: "number", placeholder: "Years"       },
                  { label: "Height",    key: "height",       type: "number", placeholder: "cm"          },
                  { label: "Weight",    key: "weight",       type: "number", placeholder: "kg"          },
                  { label: "Target Weight", key: "targetWeight", type: "number", placeholder: "kg"     },
                ].map((f, i) => (
                  <div key={i} className="pr-row">
                    <span className="pr-row-label">{f.label}</span>
                    {editing ? (
                      <input
                        type={f.type}
                        className="pr-input"
                        value={form[f.key] || ""}
                        placeholder={f.placeholder}
                        onChange={e => upd(f.key, e.target.value)}
                      />
                    ) : (
                      <span className="pr-row-value">
                        {user[f.key] || <span style={{ color: T.textFaint }}>Not set</span>}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Goal */}
              <div className="pr-section">
                <div className="pr-section-title">Primary Goal</div>
                {editing ? (
                  <div className="goal-grid">
                    {GOALS.map(g => (
                      <button key={g.id}
                        className={`goal-btn ${form.goal === g.id ? "active" : ""}`}
                        onClick={() => upd("goal", g.id)}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{g.icon}</div>
                        <div>{g.label}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="pr-row" style={{ paddingTop: 0 }}>
                    <span className="pr-row-label">Goal</span>
                    <span className="pr-row-value" style={{ color: T.accent }}>
                      {GOALS.find(g => g.id === user.goal)?.icon} {GOALS.find(g => g.id === user.goal)?.label || "Not set"}
                    </span>
                  </div>
                )}
              </div>

              {/* Training */}
              <div className="pr-section">
                <div className="pr-section-title">Training Setup</div>
                {editing ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Activity Level</div>
                      {ACTIVITY.map(a => (
                        <button key={a.id} className={`act-btn ${form.activityLevel === a.id ? "active" : ""}`}
                          onClick={() => upd("activityLevel", a.id)}>
                          <div style={{ textAlign: "left" }}>
                            <div className="act-label" style={{ color: form.activityLevel === a.id ? T.accent : T.text }}>{a.label}</div>
                            <div className="act-sub">{a.sub}</div>
                          </div>
                          {form.activityLevel === a.id && <div className="act-check">✓</div>}
                        </button>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Equipment</div>
                      <div className="goal-grid">
                        {EQUIPMENT.map(e => (
                          <button key={e.id}
                            className={`goal-btn ${form.equipment === e.id ? "active" : ""}`}
                            onClick={() => upd("equipment", e.id)}>
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pr-row">
                      <span className="pr-row-label">Activity Level</span>
                      <span className="pr-row-value">{ACTIVITY.find(a => a.id === user.activityLevel)?.label || "Not set"}</span>
                    </div>
                    <div className="pr-row">
                      <span className="pr-row-label">Equipment</span>
                      <span className="pr-row-value">{EQUIPMENT.find(e => e.id === user.equipment)?.label || "Not set"}</span>
                    </div>
                  </>
                )}
              </div>

              {editing && (
                <div className="save-bar">
                  <button className="cancel-btn" onClick={cancel}>Cancel</button>
                  <button className="save-btn" onClick={save} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── HEALTH TAB ── */}
          {activeTab === "health" && (
            <div className="pr-panel">
              <div className="pr-section">
                <div className="pr-section-title">Body Metrics</div>
                {[
                  { icon: "⚖️", label: "BMI",            val: bmi ? `${bmi}`,               sub: bmiLabel,      color: bmiColor,  bg: `${bmiColor}18`  },
                  { icon: "🔥", label: "TDEE",           val: tdee ? `${tdee} kcal`,         sub: "maintenance", color: T.orange,  bg: T.orangeSoft     },
                  { icon: "🎯", label: "Calorie Target", val: calorieTarget ? `${calorieTarget} kcal` : "—", sub: user.goal?.replace(/_/g," "), color: T.green, bg: T.greenSoft },
                  { icon: "📏", label: "Height",         val: user.height ? `${user.height} cm` : "—",      sub: "",            color: T.accent,  bg: T.accentSoft     },
                  { icon: "🏋️", label: "Weight",         val: user.weight ? `${user.weight} kg` : "—",      sub: "",            color: T.purple,  bg: T.purpleSoft     },
                  { icon: "🎯", label: "Target",         val: user.targetWeight ? `${user.targetWeight} kg` : "—", sub: "goal weight", color: T.teal, bg: T.tealSoft  },
                ].map((h, i) => (
                  <div key={i} className="health-row">
                    <div className="health-icon" style={{ background: h.bg }}>{h.icon}</div>
                    <div>
                      <div className="health-lbl">{h.label}</div>
                      {h.sub && <div className="health-sub">{h.sub}</div>}
                    </div>
                    <div className="health-val" style={{ color: h.color }}>{h.val || "—"}</div>
                  </div>
                ))}
              </div>

              {isFemale && (
                <div className="pr-section">
                  <div className="pr-section-title">Women's Health</div>
                  {[
                    { icon: "📅", label: "Cycle Length",   val: `${user.cycleLength || 28} days` },
                    { icon: "🗓", label: "Last Period",     val: user.lastPeriod ? new Date(user.lastPeriod).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "Not set" },
                    { icon: "💊", label: "Condition",       val: user.femaleCondition?.toUpperCase() || "None" },
                  ].map((h, i) => (
                    <div key={i} className="health-row">
                      <div className="health-icon" style={{ background: T.pinkSoft }}>{h.icon}</div>
                      <div className="health-lbl">{h.label}</div>
                      <div className="health-val" style={{ color: T.pink }}>{h.val}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14 }}>
                    <button onClick={() => navigate("/cycle-tracker")}
                      style={{ width:"100%", height:44, borderRadius:12, border:`1px solid ${T.glassBorder}`,
                        background: `linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%)`,
                        backdropFilter:"blur(16px)", color:T.pink, fontSize:14, fontWeight:600,
                        cursor:"pointer", fontFamily:FONT.body, transition:"all 0.15s ease",
                        boxShadow:`inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"}` }}>
                      Open Cycle Tracker →
                    </button>
                  </div>
                </div>
              )}

              {isMale && (
                <div className="pr-section">
                  <div className="pr-section-title">Men's Health Focus</div>
                  {(user.maleFocus || []).length > 0 ? (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {(user.maleFocus || []).map((f, i) => (
                        <span key={i} style={{ padding:"6px 14px", borderRadius:99, fontSize:13, fontWeight:600,
                          background: T.accentSoft, color: T.accent, border:`1px solid ${T.accent}25` }}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:14, color:T.textMuted }}>Not set — update in profile</div>
                  )}
                  <div style={{ marginTop: 14 }}>
                    <button onClick={() => navigate("/male-health")}
                      style={{ width:"100%", height:44, borderRadius:12, border:`1px solid ${T.glassBorder}`,
                        background:`linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%)`,
                        backdropFilter:"blur(16px)", color:T.accent, fontSize:14, fontWeight:600,
                        cursor:"pointer", fontFamily:FONT.body, transition:"all 0.15s ease",
                        boxShadow:`inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"}` }}>
                      Open Men's Health Hub →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <>
              <div className="pr-panel">
                <div className="pr-section">
                  <div className="pr-section-title">Appearance</div>
                  <div className="setting-row">
                    <div>
                      <div className="setting-label">Dark Mode</div>
                      <div className="setting-sub">Switch between light and dark interface</div>
                    </div>
                    <button className={`setting-toggle ${dark ? "" : "off"}`} onClick={toggleTheme}>
                      <div className={`st-thumb ${dark ? "on" : "off"}`} />
                    </button>
                  </div>
                </div>

                <div className="pr-section">
                  <div className="pr-section-title">Notifications</div>
                  {[
                    { key:"notifications",   label:"Push Notifications",   sub:"Workout reminders and streak alerts" },
                    { key:"weeklyReport",    label:"Weekly Report",        sub:"Summary of your progress every Monday" },
                    ...(isFemale ? [{ key:"cycleReminders", label:"Cycle Reminders", sub:"Period and ovulation window alerts" }] : []),
                  ].map(s => (
                    <div key={s.key} className="setting-row">
                      <div>
                        <div className="setting-label">{s.label}</div>
                        <div className="setting-sub">{s.sub}</div>
                      </div>
                      <button className={`setting-toggle ${settingToggles[s.key] ? "" : "off"}`}
                        onClick={() => toggleSetting(s.key)}>
                        <div className={`st-thumb ${settingToggles[s.key] ? "on" : "off"}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pr-section">
                  <div className="pr-section-title">Account</div>
                  {[
                    { label:"Account Type",    val:"Free Plan",   color:T.textSub },
                    { label:"Member Since",    val:joinDate,      color:T.textSub },
                    { label:"Data Storage",    val:"Firestore",   color:T.green   },
                    { label:"Sync Status",     val:"✓ Live",      color:T.green   },
                  ].map((r, i) => (
                    <div key={i} className="pr-row">
                      <span className="pr-row-label">{r.label}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="danger-zone">
                <div className="danger-header">⚠ Danger Zone</div>
                <div className="danger-body">
                  <div className="danger-row">
                    <div>
                      <div className="danger-label">Sign Out</div>
                      <div className="danger-sub">You'll need to sign in again</div>
                    </div>
                    <button className="danger-btn" onClick={clearUser}>Sign Out</button>
                  </div>
                  <div className="danger-row" style={{ borderTop:`1px solid ${dark?"rgba(255,69,58,0.12)":"rgba(211,47,47,0.10)"}`, paddingTop:14 }}>
                    <div>
                      <div className="danger-label">Delete Account</div>
                      <div className="danger-sub">Permanently delete all your data</div>
                    </div>
                    <button className="danger-btn">Delete</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}