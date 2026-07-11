// ─────────────────────────────────────────────────────────────
// src/theme.js — ASHFITVERSE DESIGN SYSTEM
// Apple-level: Inter font, neutral palette, refined glassmorphism
// No BG images — dynamic gradient backgrounds only
// ─────────────────────────────────────────────────────────────

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

// Inter is the closest web font to SF Pro — used by Apple, Linear, Vercel, Notion
export const FONT = {
  display: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

// ── Dark palette — Apple-inspired ─────────────────────────
// Reference: Apple.com dark, Linear, Vercel dashboard
export const DARK = {
  // Backgrounds
  bg:               "#0a0a0a",          // Pure near-black like Apple
  bgSecondary:      "#111111",
  bgTertiary:       "#1a1a1a",
  sidebar:          "rgba(10,10,10,0.95)",

  // Glass layers — Apple frosted glass
  glass:            "rgba(255,255,255,0.040)",
  glassMid:         "rgba(255,255,255,0.065)",
  glassHover:       "rgba(255,255,255,0.085)",
  glassBorder:      "rgba(255,255,255,0.090)",
  glassBorderHover: "rgba(255,255,255,0.180)",
  glassBorderActive:"rgba(99,102,241,0.50)",

  // Text — Apple's exact text hierarchy
  text:             "#f5f5f7",          // Apple headline white
  textSub:          "rgba(245,245,247,0.55)",
  textMuted:        "rgba(245,245,247,0.30)",
  textFaint:        "rgba(245,245,247,0.15)",

  // Primary accent — Apple Blue
  accent:           "#0a84ff",          // Apple's iOS blue (exact)
  accentHover:      "#409cff",
  accentSoft:       "rgba(10,132,255,0.12)",
  accentGlow:       "rgba(10,132,255,0.22)",
  accentGlowStrong: "rgba(10,132,255,0.45)",

  // Semantic colours — Apple HIG
  green:            "#30d158",          // Apple green (exact)
  greenSoft:        "rgba(48,209,88,0.12)",
  greenGlow:        "rgba(48,209,88,0.20)",

  purple:           "#bf5af2",          // Apple purple (exact)
  purpleSoft:       "rgba(191,90,242,0.12)",
  purpleGlow:       "rgba(191,90,242,0.20)",

  orange:           "#ff9f0a",          // Apple orange (exact)
  orangeSoft:       "rgba(255,159,10,0.12)",
  orangeGlow:       "rgba(255,159,10,0.20)",

  pink:             "#ff375f",          // Apple pink/red
  pinkSoft:         "rgba(255,55,95,0.12)",
  pinkGlow:         "rgba(255,55,95,0.20)",

  teal:             "#5ac8fa",          // Apple teal
  tealSoft:         "rgba(90,200,250,0.12)",

  gold:             "#ffd60a",          // Apple yellow
  goldSoft:         "rgba(255,214,10,0.12)",

  red:              "#ff453a",          // Apple red (exact)
  redSoft:          "rgba(255,69,58,0.10)",

  // UI surface colours
  divider:          "rgba(255,255,255,0.07)",
  shadow:           "rgba(0,0,0,0.50)",
  shadowStrong:     "rgba(0,0,0,0.80)",
};

// ── Light palette — Apple-inspired ────────────────────────
export const LIGHT = {
  // Backgrounds
  bg:               "#ffffff",
  bgSecondary:      "#f5f5f7",          // Apple's exact light gray
  bgTertiary:       "#e8e8ed",
  sidebar:          "rgba(255,255,255,0.96)",

  // Glass layers
  glass:            "rgba(255,255,255,0.72)",
  glassMid:         "rgba(255,255,255,0.88)",
  glassHover:       "rgba(255,255,255,1.00)",
  glassBorder:      "rgba(0,0,0,0.08)",
  glassBorderHover: "rgba(10,132,255,0.28)",
  glassBorderActive:"rgba(10,132,255,0.55)",

  // Text
  text:             "#1d1d1f",          // Apple's exact dark text
  textSub:          "rgba(29,29,31,0.55)",
  textMuted:        "rgba(29,29,31,0.35)",
  textFaint:        "rgba(29,29,31,0.15)",

  // Primary accent
  accent:           "#0066cc",          // Apple blue — light mode variant
  accentHover:      "#0077ed",
  accentSoft:       "rgba(0,102,204,0.08)",
  accentGlow:       "rgba(0,102,204,0.15)",
  accentGlowStrong: "rgba(0,102,204,0.35)",

  // Semantic
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

  divider:          "rgba(0,0,0,0.08)",
  shadow:           "rgba(0,0,0,0.12)",
  shadowStrong:     "rgba(0,0,0,0.25)",
};

export const getTheme = (dark) => (dark ? DARK : LIGHT);

// ── BG Images — REMOVED ────────────────────────────────────
// Using dynamic gradient backgrounds instead of Unsplash images
// Each page gets its own subtle gradient via generatePageBG()
export const BG_IMAGES = {}; // kept for backwards compat, not used

// ── Dynamic background generator ──────────────────────────
// Returns inline style for a section's background
export const generatePageBG = (T, dark, variant = "default") => {
  const bgs = {
    default: dark
      ? `radial-gradient(ellipse 80% 50% at 20% -10%, rgba(10,132,255,0.08) 0%, transparent 60%),
         radial-gradient(ellipse 60% 40% at 80% 110%, rgba(191,90,242,0.06) 0%, transparent 60%),
         ${T.bg}`
      : `radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,102,204,0.06) 0%, transparent 60%),
         radial-gradient(ellipse 60% 40% at 80% 110%, rgba(123,45,190,0.04) 0%, transparent 60%),
         ${T.bg}`,

    female: dark
      ? `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(255,55,95,0.08) 0%, transparent 60%),
         radial-gradient(ellipse 50% 40% at 90% 100%, rgba(191,90,242,0.06) 0%, transparent 60%),
         ${T.bg}`
      : `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(232,23,58,0.05) 0%, transparent 60%),
         ${T.bg}`,

    male: dark
      ? `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(10,132,255,0.09) 0%, transparent 60%),
         radial-gradient(ellipse 50% 40% at 90% 100%, rgba(48,209,88,0.05) 0%, transparent 60%),
         ${T.bg}`
      : `radial-gradient(ellipse 70% 50% at 10% -5%, rgba(0,102,204,0.06) 0%, transparent 60%),
         ${T.bg}`,

    wellness: dark
      ? `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(48,209,88,0.07) 0%, transparent 60%),
         ${T.bg}`
      : `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(40,167,69,0.05) 0%, transparent 60%),
         ${T.bg}`,

    shop: dark
      ? `radial-gradient(ellipse 70% 50% at 80% -10%, rgba(255,159,10,0.07) 0%, transparent 60%),
         ${T.bg}`
      : `${T.bg}`,
  };
  return bgs[variant] || bgs.default;
};

// ── Master CSS generator ───────────────────────────────────
export const generateCSS = (T, dark) => `
  @import url('${FONT_URL}');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Apple-style scrollbar — ultra thin */
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${T.glassBorder};
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${T.glassBorderHover};
  }

  ::selection {
    background: ${T.accent};
    color: #fff;
  }

  html { scroll-behavior: smooth; }

  body {
    background: ${T.bg};
    font-family: ${FONT.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    color: ${T.text};
  }

  /* ──────────────────────────────
     AMBIENT ORBS
     Subtle, not distracting
  ────────────────────────────── */
  .orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    will-change: transform;
  }
  .orb-1 {
    top: -25%; left: -15%;
    width: 900px; height: 900px;
    background: radial-gradient(circle,
      ${dark ? "rgba(10,132,255,0.07)" : "rgba(0,102,204,0.05)"} 0%,
      transparent 65%);
    animation: orbFloat1 28s ease-in-out infinite;
  }
  .orb-2 {
    bottom: -25%; right: -15%;
    width: 800px; height: 800px;
    background: radial-gradient(circle,
      ${dark ? "rgba(191,90,242,0.06)" : "rgba(123,45,190,0.04)"} 0%,
      transparent 65%);
    animation: orbFloat2 35s ease-in-out infinite;
  }
  .orb-3 {
    top: 35%; left: 30%;
    width: 600px; height: 600px;
    background: radial-gradient(circle,
      ${dark ? "rgba(48,209,88,0.04)" : "rgba(40,167,69,0.03)"} 0%,
      transparent 65%);
    animation: orbFloat3 22s ease-in-out infinite;
  }

  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0); }
    33%       { transform: translate(40px, -35px); }
    66%       { transform: translate(-20px, 40px); }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(-50px, -40px); }
  }
  @keyframes orbFloat3 {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(35px, -30px); }
  }

  /* ──────────────────────────────
     LIQUID GLASS — Apple visionOS style
     Frosted, specular highlight, depth
  ────────────────────────────── */
  .glass-card {
    background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
    border: 1px solid ${T.glassBorder};
    border-radius: 20px;
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.85)"},
      inset 0 -1px 0 ${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"},
      0 4px 24px ${T.shadow};
    transition:
      border-color 0.2s ease,
      box-shadow   0.25s ease,
      transform    0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg,
      ${dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)"} 0%,
      transparent 45%);
    pointer-events: none;
  }
  .glass-card:hover {
    border-color: ${T.glassBorderHover};
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.95)"},
      inset 0 -1px 0 ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"},
      0 12px 40px ${T.shadow};
    transform: translateY(-2px);
  }

  /* ──────────────────────────────
     TYPOGRAPHY — Inter / SF Pro
  ────────────────────────────── */
  .t-display {
    font-family: ${FONT.display};
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.05;
    color: ${T.text};
  }
  .t-headline {
    font-family: ${FONT.display};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.018em;
    color: ${T.text};
  }
  .t-title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.010em;
    color: ${T.text};
  }
  .t-body {
    font-size: 15px;
    font-weight: 400;
    letter-spacing: -0.006em;
    color: ${T.textSub};
    line-height: 1.6;
  }
  .t-caption {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.002em;
    color: ${T.textMuted};
  }
  .t-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${T.textMuted};
  }

  /* Gradient text */
  .t-gradient {
    background: linear-gradient(135deg, ${T.accent}, ${T.purple});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ──────────────────────────────
     BUTTONS — Apple HIG compliant
  ────────────────────────────── */

  /* Primary — liquid glass blue, white text always */
  .btn-primary {
    height: 50px;
    padding: 0 28px;
    border-radius: 13px;
    border: 1px solid ${dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.35)"};
    background: linear-gradient(145deg, ${T.accentHover} 0%, ${T.accent} 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    font-family: ${FONT.body};
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.35),
      inset 0 -1px 0 rgba(0,0,0,0.12),
      0 4px 16px ${T.accentGlow};
  }
  .btn-primary:hover {
    transform: scale(1.02);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.4),
      inset 0 -1px 0 rgba(0,0,0,0.12),
      0 6px 24px ${T.accentGlowStrong};
  }
  .btn-primary:active {
    transform: scale(0.98);
    transition-duration: 0.08s;
  }
  .btn-primary:disabled {
    opacity: 0.40;
    cursor: not-allowed;
    transform: none;
  }

  /* Secondary — liquid glass frosted, theme-aware text */
  .btn-secondary {
    height: 50px;
    padding: 0 28px;
    border-radius: 13px;
    border: 1px solid ${T.glassBorder};
    background: linear-gradient(145deg, ${T.glassMid} 0%, ${T.glass} 100%);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    color: ${T.text};
    font-size: 15px;
    font-weight: 600;
    font-family: ${FONT.body};
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.8)"},
      0 2px 12px ${T.shadow};
  }
  .btn-secondary:hover {
    border-color: ${T.glassBorderHover};
    transform: scale(1.02);
    box-shadow:
      inset 0 1px 0 ${dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.9)"},
      0 4px 18px ${T.shadow};
  }
  .btn-secondary:active { transform: scale(0.98); }

  /* Ghost — liquid glass outline, theme-aware text */
  .btn-ghost {
    height: 44px;
    padding: 0 20px;
    border-radius: 11px;
    border: 1px solid ${T.glassBorder};
    background: ${dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)"};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: ${T.text};
    font-size: 14px;
    font-weight: 500;
    font-family: ${FONT.body};
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-ghost:hover {
    border-color: ${T.glassBorderHover};
    background: ${T.glass};
    transform: scale(1.02);
  }
  .btn-ghost:active { transform: scale(0.98); }

  /* Destructive — liquid glass red, always readable */
  .btn-destructive {
    height: 44px;
    padding: 0 20px;
    border-radius: 11px;
    border: 1px solid ${dark ? "rgba(255,69,58,0.30)" : "rgba(211,47,47,0.25)"};
    background: linear-gradient(145deg, ${dark ? "rgba(255,69,58,0.16)" : "rgba(211,47,47,0.10)"} 0%, ${T.redSoft} 100%);
    backdrop-filter: blur(16px);
    color: ${T.red};
    font-size: 14px;
    font-weight: 600;
    font-family: ${FONT.body};
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-destructive:hover {
    background: ${dark ? "rgba(255,69,58,0.22)" : "rgba(211,47,47,0.16)"};
    border-color: ${T.red}60;
    transform: scale(1.02);
  }
  .btn-destructive:active { transform: scale(0.98); }

  /* ──────────────────────────────
     INPUTS — Apple style
  ────────────────────────────── */
  .input-field {
    width: 100%;
    height: 52px;
    background: ${dark ? "rgba(255,255,255,0.045)" : T.bgSecondary};
    border: 1px solid ${T.glassBorder};
    border-radius: 12px;
    padding: 0 16px;
    font-size: 15px;
    font-family: ${FONT.body};
    font-weight: 400;
    color: ${T.text};
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    letter-spacing: -0.006em;
  }
  .input-field::placeholder {
    color: ${T.textMuted};
    font-weight: 400;
  }
  .input-field:focus {
    border-color: ${T.accent};
    background: ${dark ? "rgba(10,132,255,0.06)" : "rgba(0,102,204,0.04)"};
    box-shadow: 0 0 0 3px ${T.accentGlow};
  }
  .input-field:hover:not(:focus) {
    border-color: ${T.glassBorderHover};
  }

  /* ──────────────────────────────
     THEME TOGGLE
  ────────────────────────────── */
  .theme-toggle {
    width: 52px;
    height: 28px;
    border-radius: 99px;
    border: 1px solid ${T.glassBorder};
    background: ${dark ? "rgba(255,255,255,0.07)" : T.bgSecondary};
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .theme-toggle:hover {
    border-color: ${T.glassBorderHover};
  }
  .toggle-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${T.accent};
    position: absolute;
    top: 3px;
    left: ${dark ? "27px" : "3px"};
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }

  /* ──────────────────────────────
     NAVIGATION / HEADER
  ────────────────────────────── */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 32px;
    border-bottom: 1px solid ${T.glassBorder};
    background: ${dark
      ? "rgba(10,10,10,0.85)"
      : "rgba(255,255,255,0.85)"};
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo-text {
    font-family: ${FONT.display};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${T.text};
  }
  .logo-text span { color: ${T.accent}; }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid ${T.glassBorder};
    background: transparent;
    color: ${T.textSub};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: ${FONT.body};
    letter-spacing: -0.006em;
  }
  .back-btn:hover {
    color: ${T.accent};
    border-color: ${T.accentGlow};
    background: ${T.accentSoft};
  }

  /* ──────────────────────────────
     SIDEBAR
  ────────────────────────────── */
  .sidebar {
    width: 248px;
    min-height: 100vh;
    background: ${dark
      ? "rgba(10,10,10,0.96)"
      : "rgba(255,255,255,0.96)"};
    border-right: 1px solid ${T.glassBorder};
    display: flex;
    flex-direction: column;
    padding: 24px 12px 20px;
    flex-shrink: 0;
    position: relative;
    z-index: 20;
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${T.textSub};
    transition: all 0.15s ease;
    margin-bottom: 1px;
    letter-spacing: -0.006em;
    border: 1px solid transparent;
  }
  .nav-item:hover {
    color: ${T.text};
    background: ${T.glass};
    border-color: ${T.glassBorder};
  }
  .nav-item.active {
    background: ${T.accentSoft};
    color: ${T.accent};
    border-color: ${T.accent}20;
    font-weight: 600;
  }

  /* ──────────────────────────────
     PROGRESS BARS
  ────────────────────────────── */
  .prog-track {
    height: 4px;
    background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"};
    border-radius: 99px;
    overflow: hidden;
  }
  .prog-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ──────────────────────────────
     STAT CARDS
  ────────────────────────────── */
  .stat-number {
    font-family: ${FONT.display};
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.03em;
    color: ${T.text};
  }

  /* ──────────────────────────────
     DIVIDER
  ────────────────────────────── */
  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: ${T.glassBorder};
  }
  .divider-text {
    font-size: 12px;
    color: ${T.textMuted};
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* ──────────────────────────────
     PILLS / BADGES
  ────────────────────────────── */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: -0.002em;
  }
  .pill-blue   { background: ${T.accentSoft};  color: ${T.accent}; }
  .pill-green  { background: ${T.greenSoft};   color: ${T.green};  }
  .pill-purple { background: ${T.purpleSoft};  color: ${T.purple}; }
  .pill-orange { background: ${T.orangeSoft};  color: ${T.orange}; }
  .pill-pink   { background: ${T.pinkSoft};    color: ${T.pink};   }
  .pill-red    { background: ${T.redSoft};     color: ${T.red};    }

  /* ──────────────────────────────
     LIVE DOT
  ────────────────────────────── */
  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${T.green};
    animation: livePulse 2s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }

  /* ──────────────────────────────
     CHART TOOLTIP
  ────────────────────────────── */
  .chart-tooltip {
    background: ${dark ? "rgba(18,18,18,0.97)" : "rgba(255,255,255,0.98)"};
    border: 1px solid ${T.glassBorder};
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 13px;
    color: ${T.text};
    backdrop-filter: blur(24px);
    box-shadow: 0 8px 32px ${T.shadow};
  }

  /* ──────────────────────────────
     SECTION LABEL / TITLE
  ────────────────────────────── */
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${T.textMuted};
  }
  .section-title {
    font-family: ${FONT.display};
    font-size: 18px;
    font-weight: 700;
    color: ${T.text};
    letter-spacing: -0.015em;
    margin-bottom: 14px;
  }

  /* ──────────────────────────────
     LOGOUT BUTTON
  ────────────────────────────── */
  .logout-btn {
    width: 100%;
    padding: 11px;
    border-radius: 11px;
    border: 1px solid ${T.redSoft};
    background: ${T.redSoft};
    color: ${T.red};
    font-size: 13px;
    font-weight: 600;
    font-family: ${FONT.body};
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: -0.006em;
    margin-top: auto;
  }
  .logout-btn:hover {
    background: ${dark ? "rgba(255,69,58,0.16)" : "rgba(211,47,47,0.10)"};
    border-color: ${T.red}45;
  }

  /* ──────────────────────────────
     ANIMATIONS — Apple-style
     Fast, purposeful, tight easing
  ────────────────────────────── */

  /* Page entrance — subtle, not dramatic */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Utility animation classes */
  .anim-fade-up  { animation: fadeUp  0.40s cubic-bezier(0.4, 0, 0.2, 1) both; }
  .anim-fade-in  { animation: fadeIn  0.30s ease both; }
  .anim-scale-in { animation: scaleIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both; }
  .anim-float    { animation: floatY  3.5s ease-in-out infinite; }

  /* Stagger delays — tighter than before */
  .d-1  { animation-delay: 0.04s; }
  .d-2  { animation-delay: 0.08s; }
  .d-3  { animation-delay: 0.12s; }
  .d-4  { animation-delay: 0.16s; }
  .d-5  { animation-delay: 0.20s; }
  .d-6  { animation-delay: 0.24s; }
  .d-7  { animation-delay: 0.28s; }
  .d-8  { animation-delay: 0.32s; }
  .d-9  { animation-delay: 0.36s; }
  .d-10 { animation-delay: 0.40s; }

  /* ──────────────────────────────
     RESPONSIVE
  ────────────────────────────── */
  @media (max-width: 768px) {
    .page-header { padding: 12px 16px; }
    .sidebar { display: none; }
  }
`;