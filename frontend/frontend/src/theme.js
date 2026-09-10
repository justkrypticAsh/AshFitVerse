// src/theme.js — ASHFITVERSE DESIGN SYSTEM
// Premium Apple-level UI Layout: Inter font, neutral palette, dynamic glassmorphism
// Core Support: Warm cream light mode palette, responsive structural layouts & animations
// ─────────────────────────────────────────────────────────────────────────────

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

// Inter is the closest web font to SF Pro — used by Apple, Linear, and Vercel
export const FONT = {
  display: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

// ── Dark Palette — Apple-inspired (Frosted Slate & visionOS Core) ──────────
export const DARK = {
  // Backgrounds
  bg:               "#0a0a0a",          // Pure near-black
  bgSecondary:      "#111111",
  bgTertiary:       "#1a1a1a",
  sidebar:          "rgba(7,8,15,0.95)",

  // Glass layers
  glass:            "rgba(255,255,255,0.040)",
  glassMid:         "rgba(255,255,255,0.065)",
  glassHover:       "rgba(255,255,255,0.085)",
  glassBorder:      "rgba(255,255,255,0.090)",
  glassBorderHover: "rgba(255,255,255,0.180)",
  glassBorderActive:"rgba(99,102,241,0.50)",

  // Text Hierarchy
  text:             "#f5f5f7",          // Apple headline white
  textSub:          "rgba(245,245,247,0.55)",
  textMuted:        "rgba(245,245,247,0.30)",
  textFaint:        "rgba(245,245,247,0.15)",

  // Accents & Signals
  accent:           "#0a84ff",          // iOS Blue
  accentHover:      "#409cff",
  accentSoft:       "rgba(10,132,255,0.12)",
  accentGlow:       "rgba(10,132,255,0.22)",
  accentGlowStrong: "rgba(10,132,255,0.45)",

  green:            "#30d158",          // Apple Green
  greenSoft:        "rgba(48,209,88,0.12)",
  greenGlow:        "rgba(48,209,88,0.20)",

  purple:           "#bf5af2",          // Apple Purple
  purpleSoft:       "rgba(191,90,242,0.12)",
  purpleGlow:       "rgba(191,90,242,0.20)",

  orange:           "#ff9f0a",          // Apple Orange
  orangeSoft:       "rgba(255,159,10,0.12)",
  orangeGlow:       "rgba(255,159,10,0.20)",

  pink:             "#ff375f",          // Apple Pink
  pinkSoft:         "rgba(255,55,95,0.12)",
  pinkGlow:         "rgba(255,55,95,0.20)",

  teal:             "#5ac8fa",          
  tealSoft:         "rgba(90,200,250,0.12)",

  gold:             "#ffd60a",          
  goldSoft:         "rgba(255,214,10,0.12)",

  red:              "#ff453a",          
  redSoft:          "rgba(255,69,58,0.10)",

  divider:          "rgba(255,255,255,0.07)",
  shadow:           "rgba(0,0,0,0.50)",
  shadowStrong:     "rgba(0,0,0,0.80)",
};

// ── Light Palette — Custom Premium Warm Cream ──────────────────────────────
export const LIGHT = {
  // Backgrounds (Synced exactly with dashboard canvas specs)
  bg:               "#F5F0E8",          // Warm cream canvas
  bgSecondary:      "#EDE7D9",          // Deep cream surface
  bgTertiary:       "#E3DAC9",
  sidebar:          "rgba(250,246,238,0.95)",

  // Glass layers
  glass:            "linear-gradient(160deg, rgba(255,252,245,0.82) 0%, rgba(255,248,235,0.60) 100%)",
  glassMid:         "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,252,245,0.70) 100%)",
  glassHover:       "rgba(255,255,255,1.00)",
  glassBorder:      "rgba(180,160,130,0.18)",
  glassBorderHover: "rgba(180,160,130,0.38)",
  glassBorderActive:"rgba(0,102,204,0.55)",

  // Text Hierarchy
  text:             "#1d1d1f",          // Apple dark gray
  textSub:          "rgba(29,29,31,0.65)",
  textMuted:        "rgba(29,29,31,0.45)",
  textFaint:        "rgba(29,29,31,0.20)",

  // Accents & Signals
  accent:           "#0066cc",          
  accentHover:      "#0077ed",
  accentSoft:       "rgba(0,102,204,0.08)",
  accentGlow:       "rgba(0,102,204,0.15)",
  accentGlowStrong: "rgba(0,102,204,0.35)",

  green:            "#28a745",
  greenSoft:        "rgba(40,167,69,0.09)",
  greenGlow:        "rgba(40,167,69,0.16)",

  purple:           "#7b2dbe",
  purpleSoft:       "rgba(123,45,190,0.09)",
  purpleGlow:       "rgba(123,45,190,0.16)",

  orange:           "#f56300",
  orangeSoft:       "rgba(245,99,0,0.09)",
  orangeGlow:       "rgba(245,99,0,0.16)",

  pink:             "#e8173a",
  pinkSoft:         "rgba(232,23,58,0.09)",
  pinkGlow:         "rgba(232,23,58,0.16)",

  teal:             "#0077b6",
  tealSoft:         "rgba(0,119,182,0.09)",

  gold:             "#b38600",
  goldSoft:         "rgba(179,134,0,0.09)",

  red:              "#d32f2f",
  redSoft:          "rgba(211,47,47,0.07)",

  divider:          "rgba(180,160,130,0.18)",
  shadow:           "rgba(0,0,0,0.06)",
  shadowStrong:     "rgba(0,0,0,0.14)",
};

export const getTheme = (dark) => (dark ? DARK : LIGHT);

// Kept empty for modular backwards compatibility constraints
export const BG_IMAGES = {}; 

// ── Dynamic Canvas Background Generator ────────────────────────────────────
export const generatePageBG = (T, dark, variant = "default") => {
  const currentBg = dark ? DARK.bg : LIGHT.bg;
  const bgs = {
    default: dark
      ? `radial-gradient(ellipse 80% 50% at 20% -10%, rgba(10,132,255,0.08) 0%, transparent 60%),
         radial-gradient(ellipse 60% 40% at 80% 110%, rgba(191,90,242,0.06) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,102,204,0.06) 0%, transparent 60%),
         radial-gradient(ellipse 60% 40% at 80% 110%, rgba(180,150,100,0.06) 0%, transparent 60%),
         ${currentBg}`,

    female: dark
      ? `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(255,55,95,0.08) 0%, transparent 60%),
         radial-gradient(ellipse 50% 40% at 90% 100%, rgba(191,90,242,0.06) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(232,23,58,0.06) 0%, transparent 60%),
         ${currentBg}`,

    male: dark
      ? `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(10,132,255,0.09) 0%, transparent 60%),
         radial-gradient(ellipse 50% 40% at 90% 100%, rgba(48,209,88,0.05) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(0,102,204,0.06) 0%, transparent 60%),
         ${currentBg}`,

    wellness: dark
      ? `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(48,209,88,0.07) 0%, transparent 60%),
         ${currentBg}`
      : `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(40,167,69,0.05) 0%, transparent 60%),
         ${currentBg}`,

    shop: dark
      ? `radial-gradient(ellipse 70% 50% at 80% -10%, rgba(255,159,10,0.07) 0%, transparent 60%),
         ${currentBg}`
      : `${currentBg}`,
  };
  return bgs[variant] || bgs.default;
};

// ── Master CSS Generator (Migrates Dashboard Specs to All Subpages) ───────
export const generateCSS = (T, dark) => {
  const BG = dark ? DARK.bg : LIGHT.bg;
  const SIDEBAR_BG = dark ? "rgba(7,8,15,0.95)" : LIGHT.sidebar;
  const GLASS_BG = dark
    ? "linear-gradient(160deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.04) 100%)"
    : LIGHT.glass;
  const GLASS_BORDER = dark ? DARK.glassBorder : LIGHT.glassBorder;
  const GLASS_BORDER_H = dark ? DARK.glassBorderHover : LIGHT.glassBorderHover;
  const GLASS_INNER_TOP = dark ? "rgba(255,255,255,0.18)" : "rgba(255,252,245,0.90)";

  return `
  @import url('${FONT_URL}');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Thin premium scrollbar alignment */
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${GLASS_BORDER};
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover { background: ${GLASS_BORDER_H}; }

  ::selection { background: ${T.accent}; color: #fff; }
  html { scroll-behavior: smooth; }

  body {
    background: ${BG};
    font-family: ${FONT.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    color: ${T.text};
  }

  /* ── Master Ambient Orbs Setup ── */
  .orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; will-change: transform; }
  .orb-1 {
    top: -25%; left: -15%; width: 900px; height: 900px;
    background: radial-gradient(circle, ${dark ? "rgba(10,132,255,0.07)" : "rgba(180,150,100,0.10)"} 0%, transparent 65%);
    animation: orbMFloat1 28s ease-in-out infinite;
  }
  .orb-2 {
    bottom: -25%; right: -15%; width: 800px; height: 800px;
    background: radial-gradient(circle, ${dark ? "rgba(191,90,242,0.06)" : "rgba(167,139,250,0.05)"} 0%, transparent 65%);
    animation: orbMFloat2 35s ease-in-out infinite;
  }
  .orb-3 {
    top: 35%; left: 30%; width: 600px; height: 600px;
    background: radial-gradient(circle, ${dark ? "rgba(48,209,88,0.04)" : "rgba(40,167,69,0.03)"} 0%, transparent 65%);
    animation: orbMFloat3 22s ease-in-out infinite;
  }

  @keyframes orbMFloat1 { 0%,100%{transform:translate(0,0);} 33%{transform:translate(40px,-35px);} 66%{transform:translate(-20px,40px);} }
  @keyframes orbMFloat2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-50px,-40px);} }
  @keyframes orbMFloat3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(35px,-30px);} }

  /* ── Unified Liquid Glass Cards ── */
  .glass-card, .gc, .composer, .post-card, .mem-card, .ch-card, .chat-win, .side-card, .stat-card {
    background: ${GLASS_BG};
    border: 1px solid ${GLASS_BORDER};
    backdrop-filter: blur(40px) saturate(180%) brightness(${dark ? "1.04" : "1.02"});
    -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(${dark ? "1.04" : "1.02"});
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1.5px 0 ${GLASS_INNER_TOP},
      inset 0 -1px 0 rgba(0,0,0,${dark ? "0.06" : "0.04"}),
      0 4px 24px ${T.shadow};
    transition: border-color 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, transform 0.2s;
  }
  .glass-card::before, .gc::before, .composer::before, .post-card::before, .mem-card::before, .ch-card::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0;
    background: linear-gradient(135deg, rgba(255,255,255,${dark ? "0.06" : "0.55"}) 0%, transparent 45%);
  }
  .glass-card:hover, .gc:hover, .post-card:hover, .mem-card:hover, .ch-card:hover {
    border-color: ${GLASS_BORDER_H};
    box-shadow: inset 0 1px 0 ${dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.95)"}, 0 12px 40px ${T.shadowStrong};
    transform: translateY(-2px);
  }

  /* ── Apple Control Centre Style Popups & Dropdowns ── */
  .cc-popup, .notif-panel {
    background: ${dark ? "rgba(24,24,28,0.85)" : "rgba(250,246,238,0.82)"};
    border: 1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(180,155,120,0.22)"};
    border-radius: 26px;
    backdrop-filter: blur(80px) saturate(220%);
    -webkit-backdrop-filter: blur(80px) saturate(220%);
    box-shadow:
      inset 0 1.5px 0 ${dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.70)"},
      0 16px 48px ${T.shadowStrong};
    animation: masterCCIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes masterCCIn { from{opacity:0;transform:scale(0.92) translateY(-8px);filter:blur(4px);} to{opacity:1;transform:scale(1) translateY(0);filter:blur(0);} }

  /* ── Typography Framework ── */
  .t-display { font-family: ${FONT.display}; font-weight: 800; letter-spacing: -0.025em; color: ${T.text}; }
  .t-headline { font-family: ${FONT.display}; font-size: 22px; font-weight: 700; letter-spacing: -0.018em; color: ${T.text}; }
  .t-title { font-size: 17px; font-weight: 600; color: ${T.text}; }
  .t-body { font-size: 14.5px; font-weight: 400; color: ${T.textSub}; line-height: 1.6; }
  .t-caption { font-size: 12px; color: ${T.textMuted}; }
  .t-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.textMuted}; }
  .t-gradient { background: linear-gradient(135deg, ${T.accent}, ${T.purple}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  /* ── Section Dividers ── */
  .sec-div { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
  .sec-div-line { flex: 1; height: 1px; background: ${GLASS_BORDER}; }
  .sec-div-txt { font-size: 9px; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase; color: ${T.textMuted}; }

  /* ── Premium Buttons ── */
  .btn-primary, .post-btn, .pro-btn, .comment-send, .chat-send {
    height: 46px; padding: 0 24px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, ${T.accent}, ${T.purple}); color: #ffffff;
    font-size: 14px; font-weight: 700; font-family: ${FONT.body}; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 4px 14px ${T.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.25);
  }
  .btn-primary:hover, .post-btn:hover, .pro-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${T.accentGlowStrong}; }
  .btn-primary:active { transform: scale(0.98); }

  .btn-secondary, .act-btn, .chat-back, .comm-cta {
    height: 44px; padding: 0 20px; border-radius: 11px; border: 1px solid ${GLASS_BORDER};
    background: transparent; color: ${T.textSub}; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s ease; font-family: ${FONT.body};
  }
  .btn-secondary:hover, .act-btn:hover, .comm-cta:hover { border-color: ${T.accent}40; color: ${T.accent}; background: ${T.accentSoft}; }

  /* ── Standard Inputs ── */
  .input-field, .comp-inp, .comment-inp, .chat-inp, .cm-search input {
    background: ${dark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.04)"};
    border: 1px solid ${GLASS_BORDER}; border-radius: 12px; padding: 12px 16px;
    font-size: 14.5px; color: ${T.text}; outline: none; transition: all 0.2s ease;
  }
  .input-field:focus, .comp-inp:focus, .comment-inp:focus { border-color: ${T.accent}50; box-shadow: 0 0 0 3px ${T.accentGlow}; }

  /* ── Master Sidebar System ── */
  .sidebar, .cm-sb {
    width: 252px; min-height: 100vh; background: ${SIDEBAR_BG}; border-right: 1px solid ${GLASS_BORDER};
    display: flex; flex-direction: column; padding: 24px 12px 20px; flex-shrink: 0; position: sticky; top: 0;
    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); transition: background 0.5s;
  }

  /* ── Universal Quick Actions Grid ── */
  .qa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .qa-pill {
    padding: 15px 10px 12px; border-radius: 18px; border: 1px solid ${GLASS_BORDER}; background: ${GLASS_BG};
    cursor: pointer; font-family: ${FONT.body}; font-size: 11px; font-weight: 700; color: ${T.textSub}; text-align: center;
    transition: all 0.32s cubic-bezier(0.34,1.56,0.64,1); box-shadow: inset 0 1.5px 0 ${GLASS_INNER_TOP};
  }
  .qa-pill:hover { border-color: ${T.accent}50; color: ${T.accent}; transform: translateY(-5px); box-shadow: 0 14px 32px ${T.accentGlow}35; }

  /* ── Premium Pills/Badges ── */
  .pill, .sb-badge, .cm-tab-badge, .post-tag {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 700;
  }
  .pill-blue, .active, .dm-unread { background: ${T.accentSoft}; color: ${T.accent}; border: 1px solid ${T.accent}25; }
  .pill-green { background: ${T.greenSoft}; color: ${T.green}; }
  .pill-orange { background: ${T.orangeSoft}; color: ${T.orange}; }
  .pill-pink { background: ${T.pinkSoft}; color: ${T.pink}; }

  /* ── Smooth Animations ── */
  @keyframes masterFadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
  .anim-fade-up { animation: masterFadeUp 0.45s cubic-bezier(0.25, 1, 0.5, 1) both; }
  
  .skel { background: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}; border-radius: 9px; animation: masterPulse 1.4s ease infinite; }
  @keyframes masterPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

  /* Responsive layout maps */
  @media(max-width:1200px){ .qa-grid { grid-template-columns: repeat(2, 1fr); } }
  @media(max-width:768px){ .sidebar, .cm-sb { display:none; } }
  `;
};