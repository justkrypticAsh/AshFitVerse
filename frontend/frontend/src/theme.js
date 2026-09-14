// src/theme.js — ASHFITVERSE MASTER DESIGN SYSTEM
// Premium Athletic Luxury UI System: Apple Fitness+, Linear & visionOS Architecture
// Ultra-refined typography (Inter + Plus Jakarta Sans + JetBrains Mono), obsidian dark mode,
// warm alabaster executive light mode, layered liquid glassmorphism, and telemetry-grade data display.
// ─────────────────────────────────────────────────────────────────────────────

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

// Typography Stack
// - display: Geometric, confident, high-impact athletic headings
// - body: Precision optical clarity, highest legibility at all scale points
// - mono: Telemetry-grade tabular metrics, timestamps, reps, weights, and timers
export const FONT = {
  display: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  mono:    "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
};

// ── Dark Palette — Deep Obsidian Titanium & visionOS Frosted Layers ────────
export const DARK = {
  // Backgrounds
  bg:               "#08090d",          // Luxury near-black with deep cool undertone
  bgSecondary:      "#0f1118",          // Level 1 surface
  bgTertiary:       "#161924",          // Level 2 elevated surface
  bgElevated:       "#1c2030",          // Level 3 modal / popover surface
  sidebar:          "rgba(8, 9, 14, 0.88)",

  // Ultra-refined Glass layers (Linear / visionOS inspired)
  glass:            "rgba(255, 255, 255, 0.032)",
  glassMid:         "rgba(255, 255, 255, 0.055)",
  glassHover:       "rgba(255, 255, 255, 0.080)",
  glassBorder:      "rgba(255, 255, 255, 0.082)",
  glassBorderHover: "rgba(255, 255, 255, 0.160)",
  glassBorderActive:"rgba(59, 130, 246, 0.550)",
  glassHighlight:   "rgba(255, 255, 255, 0.14)",

  // Text Hierarchy — Crisp optical clarity
  text:             "#f8fafc",          // Slate 50 / pure crisp white
  textSub:          "rgba(241, 245, 249, 0.68)", // Slate 100 68%
  textMuted:        "rgba(241, 245, 249, 0.42)", // Slate 100 42%
  textFaint:        "rgba(241, 245, 249, 0.18)", // Slate 100 18%

  // Accents & Signals — Curated P3/sRGB athletic palette
  accent:           "#3b82f6",          // Electric Royal Blue
  accentHover:      "#60a5fa",
  accentSoft:       "rgba(59, 130, 246, 0.12)",
  accentGlow:       "rgba(59, 130, 246, 0.24)",
  accentGlowStrong: "rgba(59, 130, 246, 0.48)",

  green:            "#10b981",          // Emerald Energy
  greenSoft:        "rgba(16, 185, 129, 0.12)",
  greenGlow:        "rgba(16, 185, 129, 0.24)",

  purple:           "#8b5cf6",          // Electric Amethyst
  purpleSoft:       "rgba(139, 92, 246, 0.12)",
  purpleGlow:       "rgba(139, 92, 246, 0.24)",

  orange:           "#f97316",          // Athletic Blaze Orange
  orangeSoft:       "rgba(249, 115, 22, 0.12)",
  orangeGlow:       "rgba(249, 115, 22, 0.24)",

  pink:             "#f43f5e",          // Rose Vitality
  pinkSoft:         "rgba(244, 63, 94, 0.12)",
  pinkGlow:         "rgba(244, 63, 94, 0.24)",

  teal:             "#06b6d4",          // Cyan Hydration
  tealSoft:         "rgba(6, 182, 212, 0.12)",

  gold:             "#f59e0b",          // Championship Amber / Gold
  goldSoft:         "rgba(245, 158, 11, 0.12)",

  red:              "#ef4444",          // Crimson Alert
  redSoft:          "rgba(239, 68, 68, 0.10)",

  divider:          "rgba(255, 255, 255, 0.07)",
  shadow:           "rgba(0, 0, 0, 0.45)",
  shadowStrong:     "rgba(0, 0, 0, 0.78)",
};

// ── Light Palette — Custom Executive Warm Ivory & Crisp Alabaster ──────────
export const LIGHT = {
  // Backgrounds
  bg:               "#F7F5F0",          // Warm ivory canvas
  bgSecondary:      "#FFFFFF",          // Crisp white surface
  bgTertiary:       "#EFECE5",          // Level 2 surface
  bgElevated:       "#FFFFFF",          // Modal surface
  sidebar:          "rgba(252, 250, 246, 0.92)",

  // Glass layers
  glass:            "linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(250, 247, 242, 0.70) 100%)",
  glassMid:         "linear-gradient(160deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 245, 238, 0.82) 100%)",
  glassHover:       "rgba(255, 255, 255, 1.00)",
  glassBorder:      "rgba(15, 23, 42, 0.08)",
  glassBorderHover: "rgba(15, 23, 42, 0.16)",
  glassBorderActive:"rgba(37, 99, 235, 0.55)",
  glassHighlight:   "rgba(255, 255, 255, 0.85)",

  // Text Hierarchy
  text:             "#0f172a",          // Slate 900
  textSub:          "rgba(15, 23, 42, 0.68)",
  textMuted:        "rgba(15, 23, 42, 0.44)",
  textFaint:        "rgba(15, 23, 42, 0.18)",

  // Accents & Signals
  accent:           "#2563eb",          // Sapphire
  accentHover:      "#1d4ed8",
  accentSoft:       "rgba(37, 99, 235, 0.08)",
  accentGlow:       "rgba(37, 99, 235, 0.16)",
  accentGlowStrong: "rgba(37, 99, 235, 0.32)",

  green:            "#059669",
  greenSoft:        "rgba(5, 150, 105, 0.09)",
  greenGlow:        "rgba(5, 150, 105, 0.16)",

  purple:           "#7c3aed",
  purpleSoft:       "rgba(124, 58, 237, 0.09)",
  purpleGlow:       "rgba(124, 58, 237, 0.16)",

  orange:           "#ea580c",
  orangeSoft:       "rgba(234, 88, 12, 0.09)",
  orangeGlow:       "rgba(234, 88, 12, 0.16)",

  pink:             "#e11d48",
  pinkSoft:         "rgba(225, 29, 72, 0.09)",
  pinkGlow:         "rgba(225, 29, 72, 0.16)",

  teal:             "#0891b2",
  tealSoft:         "rgba(8, 145, 178, 0.09)",

  gold:             "#d97706",
  goldSoft:         "rgba(217, 119, 6, 0.09)",

  red:              "#dc2626",
  redSoft:          "rgba(220, 38, 38, 0.08)",

  divider:          "rgba(15, 23, 42, 0.07)",
  shadow:           "rgba(30, 20, 10, 0.05)",
  shadowStrong:     "rgba(30, 20, 10, 0.12)",
};

export const getTheme = (dark) => (dark ? DARK : LIGHT);

// Backward compatibility export
export const BG_IMAGES = {};

// ── Dynamic Canvas Background Generator ────────────────────────────────────
export const generatePageBG = (T, dark, variant = "default") => {
  const currentBg = dark ? DARK.bg : LIGHT.bg;
  const bgs = {
    default: dark
      ? `radial-gradient(ellipse 85% 55% at 20% -12%, rgba(59,130,246,0.08) 0%, transparent 60%),
         radial-gradient(ellipse 65% 45% at 82% 112%, rgba(139,92,246,0.06) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 85% 55% at 20% -12%, rgba(37,99,235,0.05) 0%, transparent 60%),
         radial-gradient(ellipse 65% 45% at 82% 112%, rgba(140,115,85,0.05) 0%, transparent 60%),
         ${currentBg}`,

    female: dark
      ? `radial-gradient(ellipse 75% 55% at 10% -8%, rgba(244,63,94,0.09) 0%, transparent 60%),
         radial-gradient(ellipse 55% 45% at 90% 102%, rgba(139,92,246,0.06) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 75% 55% at 10% -8%, rgba(225,29,72,0.05) 0%, transparent 60%),
         ${currentBg}`,

    male: dark
      ? `radial-gradient(ellipse 75% 55% at 10% -8%, rgba(59,130,246,0.09) 0%, transparent 60%),
         radial-gradient(ellipse 55% 45% at 90% 102%, rgba(16,185,129,0.05) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 75% 55% at 10% -8%, rgba(37,99,235,0.05) 0%, transparent 60%),
         ${currentBg}`,

    wellness: dark
      ? `radial-gradient(ellipse 75% 55% at 50% -10%, rgba(16,185,129,0.08) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 75% 55% at 50% -10%, rgba(5,150,105,0.05) 0%, transparent 60%),
         ${currentBg}`,

    shop: dark
      ? `radial-gradient(ellipse 75% 55% at 80% -10%, rgba(249,115,22,0.07) 0%, transparent 60%),
         ${currentBg}`
      : `${currentBg}`,
  };
  return bgs[variant] || bgs.default;
};

// ── Master CSS Generator (Executive Design Language) ────────────────────────
export const generateCSS = (T, dark) => {
  const BG = dark ? DARK.bg : LIGHT.bg;
  const SIDEBAR_BG = dark ? DARK.sidebar : LIGHT.sidebar;
  const GLASS_BG = dark
    ? "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.022) 100%)"
    : LIGHT.glass;
  const GLASS_BORDER = dark ? DARK.glassBorder : LIGHT.glassBorder;
  const GLASS_BORDER_H = dark ? DARK.glassBorderHover : LIGHT.glassBorderHover;
  const GLASS_INNER_TOP = dark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.85)";

  return `
  @import url('${FONT_URL}');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Precision Custom Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${GLASS_BORDER};
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  ::-webkit-scrollbar-thumb:hover { background: ${GLASS_BORDER_H}; }

  /* Focus and Selection */
  ::selection { background: ${T.accent}; color: #ffffff; }
  :focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
  html { scroll-behavior: smooth; }

  body {
    background: ${BG};
    font-family: ${FONT.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    color: ${T.text};
    overflow-x: hidden;
  }

  /* ── Master Ambient Illumination Orbs ── */
  .orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    will-change: transform;
  }
  .orb-1 {
    top: -25%; left: -15%; width: 900px; height: 900px;
    background: radial-gradient(circle, ${dark ? "rgba(59,130,246,0.075)" : "rgba(37,99,235,0.05)"} 0%, transparent 68%);
    animation: orbMFloat1 28s ease-in-out infinite;
  }
  .orb-2 {
    bottom: -25%; right: -15%; width: 850px; height: 850px;
    background: radial-gradient(circle, ${dark ? "rgba(139,92,246,0.065)" : "rgba(124,58,237,0.04)"} 0%, transparent 68%);
    animation: orbMFloat2 34s ease-in-out infinite;
  }
  .orb-3 {
    top: 35%; left: 30%; width: 620px; height: 620px;
    background: radial-gradient(circle, ${dark ? "rgba(16,185,129,0.045)" : "rgba(5,150,105,0.03)"} 0%, transparent 68%);
    animation: orbMFloat3 24s ease-in-out infinite;
  }

  @keyframes orbMFloat1 { 0%,100%{transform:translate(0,0);} 33%{transform:translate(40px,-35px);} 66%{transform:translate(-20px,40px);} }
  @keyframes orbMFloat2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-50px,-40px);} }
  @keyframes orbMFloat3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(35px,-30px);} }

  /* ── Unified Liquid Glass Cards ── */
  .glass-card, .gc, .composer, .post-card, .mem-card, .ch-card, .chat-win, .side-card, .stat-card, .glass-panel {
    background: ${GLASS_BG};
    border: 1px solid ${GLASS_BORDER};
    backdrop-filter: blur(40px) saturate(190%) brightness(${dark ? "1.03" : "1.01"});
    -webkit-backdrop-filter: blur(40px) saturate(190%) brightness(${dark ? "1.03" : "1.01"});
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 ${GLASS_INNER_TOP},
      0 1px 2px rgba(0,0,0,${dark ? "0.24" : "0.04"}),
      0 8px 30px -4px ${T.shadow};
    transition: border-color 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1);
  }
  .glass-card::before, .gc::before, .composer::before, .post-card::before, .mem-card::before, .ch-card::before, .stat-card::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0;
    background: linear-gradient(135deg, rgba(255,255,255,${dark ? "0.05" : "0.55"}) 0%, transparent 45%);
  }
  .glass-card:hover, .gc:hover, .post-card:hover, .mem-card:hover, .ch-card:hover, .stat-card:hover {
    border-color: ${GLASS_BORDER_H};
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.95)"},
      0 4px 8px rgba(0,0,0,${dark ? "0.3" : "0.06"}),
      0 18px 48px -6px ${T.shadowStrong};
    transform: translateY(-2px);
  }

  /* ── Apple Control Centre Style Popups & Modals ── */
  .cc-popup, .notif-panel {
    background: ${dark ? "rgba(15, 17, 24, 0.88)" : "rgba(255, 255, 255, 0.90)"};
    border: 1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.10)"};
    border-radius: 26px;
    backdrop-filter: blur(80px) saturate(210%);
    -webkit-backdrop-filter: blur(80px) saturate(210%);
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.95)"},
      0 20px 60px ${T.shadowStrong};
    animation: masterCCIn 0.32s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes masterCCIn {
    from { opacity: 0; transform: scale(0.94) translateY(-10px); filter: blur(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
  }

  /* ── High-Definition Typography Framework ── */
  .t-display {
    font-family: ${FONT.display};
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${T.text};
    line-height: 1.15;
  }
  .t-headline {
    font-family: ${FONT.display};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${T.text};
  }
  .t-title {
    font-family: ${FONT.display};
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${T.text};
  }
  .t-body {
    font-family: ${FONT.body};
    font-size: 14.5px;
    font-weight: 400;
    color: ${T.textSub};
    line-height: 1.62;
  }
  .t-caption {
    font-family: ${FONT.body};
    font-size: 12px;
    color: ${T.textMuted};
  }
  .t-label {
    font-family: ${FONT.display};
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${T.textMuted};
  }
  .t-gradient {
    background: linear-gradient(135deg, ${T.accent}, ${T.purple});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .t-metric, .data-val, .stat-num {
    font-family: ${FONT.mono};
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    font-weight: 700;
  }

  /* ── Section Dividers ── */
  .sec-div { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
  .sec-div-line { flex: 1; height: 1px; background: ${GLASS_BORDER}; }
  .sec-div-txt {
    font-family: ${FONT.display};
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${T.textMuted};
  }

  /* ── Premium Buttons ── */
  .btn-primary, .post-btn, .pro-btn, .comment-send, .chat-send {
    height: 46px;
    padding: 0 24px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, ${T.accent} 0%, ${T.purple} 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    font-family: ${FONT.display};
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px ${T.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.28);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-primary:hover, .post-btn:hover, .pro-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 26px ${T.accentGlowStrong};
  }
  .btn-primary:active { transform: scale(0.98); }

  .btn-secondary, .act-btn, .chat-back, .comm-cta {
    height: 44px;
    padding: 0 20px;
    border-radius: 11px;
    border: 1px solid ${GLASS_BORDER};
    background: ${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"};
    color: ${T.textSub};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: ${FONT.body};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-secondary:hover, .act-btn:hover, .comm-cta:hover {
    border-color: ${T.accent}45;
    color: ${T.accent};
    background: ${T.accentSoft};
  }
  .btn-secondary:active { transform: scale(0.98); }

  .btn-ghost {
    background: transparent;
    border: none;
    color: ${T.textSub};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 10px;
    transition: background 0.18s, color 0.18s;
  }
  .btn-ghost:hover {
    background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"};
    color: ${T.text};
  }

  /* ── Precision Inputs & Form Controls ── */
  .input-field, .comp-inp, .comment-inp, .chat-inp, .cm-search input {
    background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
    border: 1px solid ${GLASS_BORDER};
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14.5px;
    color: ${T.text};
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    font-family: ${FONT.body};
  }
  .input-field::placeholder, .comp-inp::placeholder, .comment-inp::placeholder {
    color: ${T.textMuted};
  }
  .input-field:focus, .comp-inp:focus, .comment-inp:focus, .chat-inp:focus {
    border-color: ${T.accent};
    box-shadow: 0 0 0 3px ${T.accentGlow};
    background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)"};
  }

  /* ── Master Sidebar System ── */
  .sidebar, .cm-sb {
    width: 252px;
    min-height: 100vh;
    background: ${SIDEBAR_BG};
    border-right: 1px solid ${GLASS_BORDER};
    display: flex;
    flex-direction: column;
    padding: 24px 12px 20px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    backdrop-filter: blur(40px) saturate(190%);
    -webkit-backdrop-filter: blur(40px) saturate(190%);
    transition: background 0.5s;
    z-index: 20;
  }

  /* ── Universal Quick Actions Grid ── */
  .qa-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .qa-pill {
    padding: 15px 10px 12px;
    border-radius: 18px;
    border: 1px solid ${GLASS_BORDER};
    background: ${GLASS_BG};
    cursor: pointer;
    font-family: ${FONT.display};
    font-size: 11px;
    font-weight: 700;
    color: ${T.textSub};
    text-align: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: inset 0 1px 0 ${GLASS_INNER_TOP};
    position: relative;
    overflow: hidden;
  }
  .qa-pill:hover {
    border-color: ${T.accent}50;
    color: ${T.accent};
    transform: translateY(-4px);
    box-shadow: 0 14px 32px ${T.accentGlow}35;
  }
  .qa-pill:active { transform: scale(0.97); }

  /* ── Premium Badges & Status Pills ── */
  .pill, .sb-badge, .cm-tab-badge, .post-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    font-family: ${FONT.display};
  }
  .pill-blue, .active, .dm-unread {
    background: ${T.accentSoft};
    color: ${T.accent};
    border: 1px solid ${T.accent}30;
  }
  .pill-green {
    background: ${T.greenSoft};
    color: ${T.green};
    border: 1px solid ${T.green}30;
  }
  .pill-orange {
    background: ${T.orangeSoft};
    color: ${T.orange};
    border: 1px solid ${T.orange}30;
  }
  .pill-pink {
    background: ${T.pinkSoft};
    color: ${T.pink};
    border: 1px solid ${T.pink}30;
  }
  .pill-purple {
    background: ${T.purpleSoft};
    color: ${T.purple};
    border: 1px solid ${T.purple}30;
  }
  .pill-gold {
    background: ${T.goldSoft};
    color: ${T.gold};
    border: 1px solid ${T.gold}30;
  }

  /* ── Live Pulse Indicator ── */
  .live-dot, .live-pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background: ${T.green};
    box-shadow: 0 0 0 0 ${T.greenGlow};
    animation: masterLivePulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }
  @keyframes masterLivePulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }

  /* ── Precision Shimmer Loading Skeleton ── */
  .skel, .skeleton {
    background: linear-gradient(
      90deg,
      ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} 25%,
      ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)"} 50%,
      ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} 75%
    );
    background-size: 200% 100%;
    animation: masterShimmer 1.8s infinite linear;
    border-radius: 10px;
  }
  @keyframes masterShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Smooth Fade Up Entrance ── */
  @keyframes masterFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-fade-up {
    animation: masterFadeUp 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── Reduced Motion Accessibility ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Responsive layout maps */
  @media(max-width:1200px){ .qa-grid { grid-template-columns: repeat(2, 1fr); } }
  @media(max-width:768px){ .sidebar, .cm-sb { display:none; } }
  `;
};