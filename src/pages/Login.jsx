// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle, loginWithApple } from "../firebase";
import useTheme from "../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../theme";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const cred = await loginWithEmail(email, password);

      // Fetch user profile from Firestore to decide where to send them
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        localStorage.setItem("ashfitverse_user", JSON.stringify(snap.data()));
        localStorage.setItem("ashfitverse_onboarded", "true");
        navigate("/dashboard");
      } else {
        // First-time login — onboarding not completed yet
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      const msgs = {
        "auth/user-not-found":    "No account found with this email.",
        "auth/wrong-password":    "Incorrect password. Try again.",
        "auth/invalid-credential":"Invalid email or password.",
        "auth/invalid-email":     "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait.",
        "auth/network-request-failed": "Network error. Check your connection.",
      };
      setError(msgs[err.code] || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  const css = generateCSS(T, dark) + `

    /* ── Page root ── */
    .lr {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 24px;
      position: relative; overflow: hidden; background: ${T.bg};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.8s ease, background 0.5s;
    }

    /* ── Background image ── */
    .lbg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
    .lbg img {
      width: 100%; height: 100%; object-fit: cover;
      opacity: ${dark ? "0.055" : "0.07"};
      filter: ${dark ? "grayscale(80%) blur(3px)" : "grayscale(30%) blur(1px)"};
    }

    /* ── Main card ── */
    .lcard {
      position: relative; z-index: 10; width: 100%;
      max-width: 1160px; height: 860px; border-radius: 32px;
      overflow: hidden; display: grid; grid-template-columns: 1fr 1fr;
      border: 1px solid ${T.glassBorder};
      box-shadow:
        0 60px 160px rgba(0,0,0,${dark ? "0.55" : "0.14"}),
        0 0 0 1px ${T.accentSoft},
        inset 0 1px 0 rgba(255,255,255,${dark ? "0.06" : "0.70"});
      opacity: ${mounted ? 1 : 0};
      transform: ${mounted ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)"};
      transition: opacity 0.85s cubic-bezier(0.34,1.56,0.64,1),
                  transform 0.85s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* ── Left image panel ── */
    .lip { position: relative; overflow: hidden; }
    .lip img {
      width: 100%; height: 100%; object-fit: cover;
      transform: scale(1.07);
      transition: transform 14s cubic-bezier(0.4,0,0.2,1);
    }
    .lip:hover img { transform: scale(1.0); }

    /* Overlay — blue gradient (matches site theme) */
    .lov {
      position: absolute; inset: 0;
      background: linear-gradient(
        155deg,
        rgba(5,12,40,0.78) 0%,
        rgba(20,40,100,0.35) 45%,
        rgba(5,12,40,0.82) 100%
      );
    }
    /* Blue prismatic light leak at top */
    .lov::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(
        ellipse 80% 50% at 30% 0%,
        ${T.accent}22 0%, transparent 60%
      );
    }

    /* Badge */
    .lbadge {
      position: absolute; top: 32px; left: 32px;
      display: flex; align-items: center; gap: 9px;
      padding: 10px 20px; border-radius: 99px;
      background: rgba(255,255,255,0.09);
      border: 1px solid rgba(255,255,255,0.16);
      backdrop-filter: blur(24px);
      animation: fadeDown 0.85s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
    }
    .lbltxt {
      font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.92);
      letter-spacing: 0.06em; font-family: ${FONT.body};
    }

    /* Left headline */
    .lhl {
      position: absolute; top: 50%; left: 32px; right: 32px;
      transform: translateY(-50%);
      animation: fadeUp 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.45s both;
    }
    .lhl h2 {
      font-family: ${FONT.display}; font-size: 82px; line-height: 0.9;
      color: #fff; letter-spacing: 0.01em;
      text-shadow: 0 4px 40px rgba(0,0,0,0.5);
    }
    /* Blue accent on span — matches site */
    .lhl h2 span {
      color: ${T.accent}; display: block;
      text-shadow: 0 0 60px ${T.accentGlow};
    }
    .lhl p {
      margin-top: 18px; color: rgba(255,255,255,0.70);
      font-size: 15px; line-height: 1.70; max-width: 340px;
      font-family: ${FONT.body};
    }

    /* Stats bar at bottom */
    .lstats {
      position: absolute; bottom: 32px; left: 32px; right: 32px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 22px; padding: 22px 26px;
      backdrop-filter: blur(28px);
      display: flex; align-items: center; justify-content: space-between;
      animation: fadeUp 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.65s both;
    }
    .sblk { display: flex; flex-direction: column; gap: 4px; }
    .slbl {
      font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.48);
      font-family: ${FONT.body};
    }
    .sval {
      font-family: ${FONT.display}; font-size: 38px;
      color: #fff; line-height: 1;
    }
    /* Blue icon — matches site accent */
    .sico {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      border-radius: 15px; display: flex; align-items: center;
      justify-content: center; font-size: 22px;
      box-shadow: 0 8px 28px ${T.accentGlow};
      animation: floatY 3.5s ease-in-out infinite;
    }

    /* ── Right form panel ── */
    .lfp {
      background: ${dark ? "rgba(7,8,20,0.97)" : "rgba(255,255,255,0.97)"};
      display: flex; flex-direction: column;
      justify-content: space-between; padding: 40px 52px;
      overflow-y: auto; backdrop-filter: blur(48px) saturate(180%);
      position: relative;
    }
    /* Subtle blue top-left glow inside form */
    .lfp::before {
      content: ''; position: absolute; top: -60px; left: -60px;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, ${T.accent}10 0%, transparent 70%);
      pointer-events: none;
    }

    /* Form topnav */
    .ltnav {
      display: flex; align-items: center; justify-content: space-between;
      animation: fadeDown 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
      position: relative; z-index: 1;
    }
    .llgo {
      font-family: ${FONT.display}; font-size: 22px; font-weight: 800;
      letter-spacing: 0.04em; color: ${T.text};
    }
    /* Blue accent on logo — consistent with rest of site */
    .llgo span { color: ${T.accent}; }
    .llsub {
      font-size: 11px; color: ${T.textMuted}; letter-spacing: 0.10em;
      margin-top: 3px; font-family: ${FONT.body};
    }

    /* Join Now button — blue */
    .jbtn {
      padding: 10px 22px; border-radius: 99px;
      border: 1.5px solid ${T.accent}45;
      background: ${T.accentSoft}; color: ${T.accent};
      font-size: 13px; font-weight: 700; font-family: ${FONT.body};
      letter-spacing: 0.05em; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .jbtn:hover {
      background: ${T.accent}; color: #fff;
      box-shadow: 0 0 28px ${T.accentGlow};
      transform: scale(1.05) translateY(-1px);
    }

    /* Mini toggle inside form */
    .ftog {
      width: 50px; height: 27px; border-radius: 99px;
      border: 1px solid ${T.glassBorder}; background: ${T.glass};
      cursor: pointer; position: relative; transition: all 0.3s;
    }
    .ftog:hover { border-color: ${T.accent}40; box-shadow: 0 0 12px ${T.accentGlow}35; }
    .ftth {
      width: 21px; height: 21px; border-radius: 50%;
      background: linear-gradient(135deg, ${T.accent}, ${T.purple});
      position: absolute; top: 3px; left: ${dark ? "26px" : "3px"};
      transition: left 0.38s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; box-shadow: 0 2px 10px ${T.accentGlow};
    }

    /* Form body */
    .fbdy {
      flex: 1; display: flex; flex-direction: column;
      justify-content: center; padding: 12px 0;
      position: relative; z-index: 1;
    }
    /* Eyebrow — blue */
    .feye {
      font-size: 11px; font-weight: 700; letter-spacing: 0.26em;
      text-transform: uppercase; color: ${T.accent};
      margin-bottom: 12px; font-family: ${FONT.body};
      animation: fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.40s both;
    }
    /* Big headline */
    .fttl {
      font-family: ${FONT.display}; font-size: 68px; line-height: 0.92;
      letter-spacing: -0.02em; color: ${T.text}; margin-bottom: 14px;
      animation: fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.46s both;
    }
    /* Blue accent span — NOT green */
    .fttl span { color: ${T.accent}; display: block; }

    .fsub {
      font-size: 14px; color: ${T.textSub}; line-height: 1.68;
      max-width: 340px; margin-bottom: 32px; font-family: ${FONT.body};
      animation: fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.52s both;
    }

    /* Fields */
    .flds {
      display: flex; flex-direction: column; gap: 16px;
      animation: fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.58s both;
    }
    .flbl {
      font-size: 10px; font-weight: 700; letter-spacing: 0.20em;
      text-transform: uppercase; color: ${T.textMuted};
      display: block; margin-bottom: 9px; font-family: ${FONT.body};
    }
    .flblr {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 9px;
    }
    /* Forgot link — blue */
    .fgtlnk {
      font-size: 12px; color: ${T.accent}; font-weight: 600;
      background: none; border: none; cursor: pointer;
      font-family: ${FONT.body}; transition: all 0.2s;
    }
    .fgtlnk:hover { opacity: 0.75; text-decoration: underline; }

    /* Input — blue focus ring */
    .linp {
      width: 100%; height: 58px;
      background: ${dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)"};
      border: 1.5px solid ${T.glassBorder}; border-radius: 16px;
      padding: 0 20px; font-size: 15px; font-family: ${FONT.body};
      font-weight: 400; color: ${T.text}; outline: none;
      transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
      backdrop-filter: blur(8px);
    }
    .linp::placeholder { color: ${T.textMuted}; }
    /* Blue focus — not green */
    .linp:focus {
      border-color: ${T.accent};
      background: ${T.accentSoft};
      box-shadow: 0 0 0 4px ${T.accentGlow}30, 0 4px 20px ${T.accentGlow}18;
    }
    .linp:hover:not(:focus) { border-color: ${T.glassBorderHover}; }

    /* Remember row */
    .actrow { display: flex; align-items: center; justify-content: space-between; }
    .remlbl {
      display: flex; align-items: center; gap: 9px; color: ${T.textSub};
      font-size: 13px; cursor: pointer; font-family: ${FONT.body}; font-weight: 500;
    }
    .remlbl input { width: 15px; height: 15px; accent-color: ${T.accent}; cursor: pointer; }
    .trmbtn {
      font-size: 13px; color: ${T.textMuted}; background: none; border: none;
      cursor: pointer; font-family: ${FONT.body}; transition: color 0.2s;
    }
    .trmbtn:hover { color: ${T.textSub}; }

    /* Error */
    .errbox {
      display: flex; align-items: center; gap: 9px; padding: 13px 17px;
      border-radius: 14px; background: ${T.redSoft};
      border: 1px solid rgba(248,113,113,0.22);
      font-size: 13px; font-weight: 600; color: ${T.red};
      font-family: ${FONT.body};
      animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* CTA button — blue gradient (NOT green) */
    .sinbtn {
      width: 100%; height: 58px; border-radius: 16px; border: none;
      background: linear-gradient(135deg, ${T.accent} 0%, ${T.purple} 100%);
      color: #fff; font-size: 14px; font-weight: 800; font-family: ${FONT.body};
      letter-spacing: 0.07em; text-transform: uppercase; cursor: pointer;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 10px 32px ${T.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.22);
      position: relative; overflow: hidden;
    }
    .sinbtn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.20), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .sinbtn::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg,
        transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }
    .sinbtn:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 20px 52px ${T.accentGlowStrong};
    }
    .sinbtn:hover::before { opacity: 1; }
    .sinbtn:hover::after  { transform: translateX(100%); }
    .sinbtn:active { transform: translateY(-1px) scale(0.99); transition-duration: 0.1s; }
    .sinbtn:disabled { opacity: 0.50; cursor: not-allowed; transform: none; box-shadow: none; }

    /* Divider */
    .dvdr { display: flex; align-items: center; gap: 14px; }
    .dvdrln {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, ${T.glassBorder}, transparent);
    }
    .dvdrtxt {
      font-size: 11px; color: ${T.textMuted}; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase; font-family: ${FONT.body};
    }

    /* Social buttons */
    .sgrd { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
    .sbtn {
      height: 52px; border-radius: 14px;
      border: 1.5px solid ${T.glassBorder};
      background: ${T.glass}; color: ${T.textSub};
      font-size: 13px; font-weight: 700; font-family: ${FONT.body};
      cursor: pointer; letter-spacing: 0.04em;
      transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
      backdrop-filter: blur(12px);
    }
    .sbtn:hover {
      background: ${T.glassHover}; border-color: ${T.glassBorderHover};
      color: ${T.text}; transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(0,0,0,${dark ? "0.22" : "0.07"});
    }

    /* Footer */
    .ffoot {
      font-size: 11px; color: ${T.textMuted}; font-weight: 500;
      letter-spacing: 0.14em; text-transform: uppercase;
      font-family: ${FONT.body};
      animation: fadeIn 1s ease 1s both;
      position: relative; z-index: 1;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .lcard { grid-template-columns: 1fr; height: auto; }
      .lip   { height: 320px; }
      .lfp   { padding: 32px 28px; }
      .fttl  { font-size: 52px; }
      .lhl h2 { font-size: 58px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="lr">
        {/* BG */}
        <div className="lbg"><img src={BG_IMAGES.login} alt="" loading="lazy" /></div>

        {/* Animated orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="lcard">

          {/* ── Left image panel ── */}
          <div className="lip">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
              alt="Fitness"
            />
            <div className="lov" />

            {/* Badge */}
            <div className="lbadge">
              <div className="live-dot" />
              <span className="lbltxt">24K+ Active Members</span>
            </div>

            {/* Headline */}
            <div className="lhl">
              <h2>Break<span>Every</span>Limit.</h2>
              <p>A premium fitness ecosystem built for athletes who refuse to settle. Track. Train. Transform.</p>
            </div>

            {/* Stats */}
            <div className="lstats">
              <div className="sblk">
                <span className="slbl">Active Members</span>
                <span className="sval">24K+</span>
              </div>
              <div className="sblk">
                <span className="slbl">Workouts Logged</span>
                <span className="sval">180K</span>
              </div>
              <div className="sico">↑</div>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="lfp">

            {/* Top nav */}
            <div className="ltnav">
              <div>
                <div className="llgo">AshFit<span>Verse</span></div>
                <div className="llsub">Elevate your fitness lifestyle</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="ftog" onClick={toggleTheme}>
                  <div className="ftth">{dark ? "🌙" : "☀️"}</div>
                </button>
                <button className="jbtn" onClick={() => navigate("/signup")}>
                  Join Now
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="fbdy">
              <p className="feye">— Welcome Back</p>
              <h2 className="fttl">Sign<span>In.</span></h2>
              <p className="fsub">
                Track workouts, monitor progress, and transform your body
                with a modern fitness ecosystem.
              </p>

              <div className="flds">
                <div>
                  <label className="flbl">Email Address</label>
                  <input
                    type="email" placeholder="you@example.com" className="linp"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flblr">
                    <label className="flbl" style={{ marginBottom: 0 }}>Password</label>
                    <button className="fgtlnk">Forgot password?</button>
                  </div>
                  <input
                    type="password" placeholder="••••••••••••" className="linp"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <div className="actrow">
                  <label className="remlbl">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button className="trmbtn">Terms & Privacy</button>
                </div>

                {error && <div className="errbox">⚠ {error}</div>}

                {/* Blue CTA */}
                <button className="sinbtn" onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>

                <div className="dvdr">
                  <div className="dvdrln" />
                  <span className="dvdrtxt">or continue with</span>
                  <div className="dvdrln" />
                </div>

                <div className="sgrd">
                  <button className="sbtn" onClick={async () => {
                    try { await loginWithGoogle(); navigate("/dashboard"); }
                    catch { setError("Google sign-in failed."); }
                  }}>
                    🔵 Google
                  </button>
                  <button className="sbtn" onClick={async () => {
                    try { await loginWithApple(); navigate("/dashboard"); }
                    catch { setError("Apple sign-in failed."); }
                  }}>
                    🍎 Apple
                  </button>
                </div>
              </div>
            </div>

            <div className="ffoot">Built for Discipline · AshFitVerse</div>
          </div>

        </div>
      </div>
    </>
  );
}