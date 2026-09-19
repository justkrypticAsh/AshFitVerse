// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle, logoutUser, auth, db, getRedirectResultAuth, resetPassword } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import useTheme from "../hooks/usetheme";
import { generateCSS, BG_IMAGES, FONT } from "../theme";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_USER } from "../hooks/useUser";
import { isUserAdmin } from "../config/authConfig";

const formatAuthError = (err) => {
  if (!err) return "Authentication failed. Please try again.";
  const code = err.code || "";
  const msg = err.message || "";

  switch (code) {
    case "auth/unauthorized-domain":
      return "Current domain is not authorized in Firebase Console! Please add this host in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled in your Firebase project. Please enable it in Firebase Console > Authentication > Sign-in method.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site, or try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled because the popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Sign-in request in progress. Please click once and wait.";
    case "auth/user-not-found":
      return "No account found with this email. Click 'Join Now' to register.";
    case "auth/wrong-password":
      return "Incorrect password. Try again or click 'Forgot password?'.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your details.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment before trying again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email using a different sign-in method.";
    default:
      return msg.includes("Firebase:") ? msg.replace(/^Firebase:\s*/, "") : (msg || "Sign-in failed. Please try again.");
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentSessionEmail, setCurrentSessionEmail] = useState("");

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ msg: "", type: "" });
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.email) {
        setCurrentSessionEmail(u.email);
      } else {
        const local = localStorage.getItem("ashfitverse_email");
        if (local) setCurrentSessionEmail(local);
        else setCurrentSessionEmail("");
      }
    });

    // Check if user returned from a redirect sign-in
    getRedirectResultAuth()
      .then(async (result) => {
        if (result && result.user) {
          setLoading(true);
          await establishUserSession(result.user, result.user.email || "");
        }
      })
      .catch((err) => {
        console.error("Redirect login error:", err);
        setError(formatAuthError(err));
      });

    return () => unsub();
  }, []);

  const handleQuickLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    localStorage.removeItem("ashfitverse_user");
    localStorage.removeItem("ashfitverse_onboarded");
    localStorage.removeItem("ashfitverse_uid");
    localStorage.removeItem("ashfitverse_email");
    localStorage.removeItem("ashfitverse_signup_name");
    localStorage.removeItem("ashfitverse_custom_qa");
    setCurrentSessionEmail("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const establishUserSession = async (userObj, fallbackEmail) => {
    const cleanEmail = (userObj?.email || fallbackEmail || "").trim().toLowerCase();
    const uid = userObj?.uid || "athlete";
    localStorage.setItem("ashfitverse_email", cleanEmail);
    localStorage.setItem("ashfitverse_uid", uid);

    try {
      const snap = await getDoc(doc(db, "users", uid));
      let userData = snap.exists() ? snap.data() : null;

      if (!userData) {
        const admin = isUserAdmin(null, userObj);
        userData = {
          ...DEFAULT_USER,
          name: admin ? "Ashish Sharma" : userObj?.displayName || "Athlete",
          email: cleanEmail,
          plan: admin ? "pro" : "free",
          sex: "male",
          goal: "muscle",
          streak: 1,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, "users", uid), userData, { merge: true });
        } catch (e) {
          console.warn("Firestore user sync error:", e);
        }
      }

      localStorage.setItem("ashfitverse_user", JSON.stringify(userData));
    } catch (e) {
      console.warn("User fetch error:", e);
      const admin = isUserAdmin({ email: cleanEmail }, userObj);
      const fallbackData = {
        ...DEFAULT_USER,
        name: admin ? "Ashish Sharma" : "Athlete",
        email: cleanEmail,
        plan: admin ? "pro" : "free",
        sex: "male",
      };
      localStorage.setItem("ashfitverse_user", JSON.stringify(fallbackData));
    }

    localStorage.setItem("ashfitverse_onboarded", "true");
    navigate("/dashboard");
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const cred = await loginWithEmail(email, password);
      await establishUserSession(cred.user, email);
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      setError(formatAuthError(err));
    } finally { setLoading(false); }
  };

  const handleSocial = async (providerFn) => {
    setLoading(true); setError("");
    try {
      const cred = await providerFn();
      if (cred?.user) {
        await establishUserSession(cred.user, cred.user.email || "");
      }
    } catch (err) {
      console.error("Social login error:", err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ msg: "Please enter your registered email address.", type: "error" });
      return;
    }
    setForgotLoading(true);
    setForgotStatus({ msg: "", type: "" });
    try {
      await resetPassword(forgotEmail.trim().toLowerCase());
      setForgotStatus({
        msg: "Password reset link sent to your email! Please check your inbox and spam folder.",
        type: "success",
      });
    } catch (err) {
      console.error("Password reset error:", err);
      setForgotStatus({ msg: formatAuthError(err), type: "error" });
    } finally {
      setForgotLoading(false);
    }
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
      max-width: 1160px; height: min(880px, 92vh); border-radius: 32px;
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

    /* Social buttons — Single full-width Google button */
    .sbtn-google {
      width: 100%; height: 52px; border-radius: 14px;
      border: 1.5px solid ${T.glassBorder};
      background: ${T.glass}; color: ${T.text};
      font-size: 14px; font-weight: 700; font-family: ${FONT.body};
      cursor: pointer; letter-spacing: 0.02em;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
      backdrop-filter: blur(14px);
    }
    .sbtn-google:hover:not(:disabled) {
      background: ${T.glassHover}; border-color: ${T.accent};
      color: ${T.text}; transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(0,0,0,${dark ? "0.26" : "0.08"}), 0 0 20px ${T.accentSoft};
    }
    .sbtn-google:disabled {
      opacity: 0.6; cursor: not-allowed; transform: none;
    }

    /* Password field with toggle */
    .pw-wrap {
      position: relative; display: flex; align-items: center; width: 100%;
    }
    .pw-wrap .linp {
      padding-right: 46px; width: 100%;
    }
    .pw-eye {
      position: absolute; right: 14px; background: none; border: none;
      cursor: pointer; font-size: 16px; color: ${T.textMuted};
      display: flex; align-items: center; justify-content: center;
      transition: color 0.2s; padding: 4px;
    }
    .pw-eye:hover { color: ${T.text}; }

    /* Modal Backdrop */
    .fmodal-ov {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: fadeIn 0.25s ease both;
    }
    .fmodal-box {
      width: 100%; max-width: 440px; border-radius: 24px;
      background: ${dark ? "rgba(14,16,30,0.98)" : "rgba(255,255,255,0.98)"};
      border: 1px solid ${T.glassBorder};
      box-shadow: 0 24px 60px rgba(0,0,0,${dark ? "0.6" : "0.2"}), 0 0 40px ${T.accentSoft};
      padding: 32px 28px; position: relative;
    }
    .fmodal-close {
      position: absolute; top: 18px; right: 18px;
      background: rgba(255,255,255,0.06); border: 1px solid ${T.glassBorder};
      color: ${T.textMuted}; border-radius: 50%; width: 32px; height: 32px;
      cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .fmodal-close:hover { color: ${T.text}; background: rgba(255,255,255,0.12); }

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
      .lr { padding: 16px 14px; min-height: 100vh; }
      .lcard {
        grid-template-columns: 1fr;
        height: auto;
        max-width: 480px;
        border-radius: 26px;
      }
      .lip { display: none; }
      .lfp { padding: 30px 22px; }
      .fttl { font-size: 42px; margin-bottom: 8px; }
      .fsub { font-size: 13px; margin-bottom: 24px; }
      .sinbtn { height: 50px; font-size: 14px; }
      .sbtn-google { height: 50px; font-size: 13.5px; }
      .linp { height: 48px; font-size: 13.5px; }
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
              <span className="lbltxt">Elite Athlete Operating System</span>
            </div>

            {/* Headline */}
            <div className="lhl">
              <h2>Break<span>Every</span>Limit.</h2>
              <p>A science-backed training and nutrition operating system built for athletes who refuse to settle. Track. Train. Transform.</p>
            </div>

            {/* Genuine Platform Highlights */}
            <div className="lstats">
              <div className="sblk">
                <span className="slbl">Exercise Library</span>
                <span className="sval">500+</span>
              </div>
              <div className="sblk">
                <span className="slbl">Health Telemetry</span>
                <span className="sval">23+</span>
              </div>
              <div className="sico">⚡</div>
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

              {/* Active Session Notice if already authed */}
              {currentSessionEmail && (
                <div style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(79,142,247,0.12)",
                  border: "1px solid rgba(79,142,247,0.32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}>
                  <div style={{ fontSize: 12.5, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>👤 Active session:</span>
                    <strong style={{ color: "#4f8ef7" }}>{currentSessionEmail}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "#4f8ef7",
                        color: "#fff",
                        border: "none",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Dashboard →
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickLogout}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.08)",
                        color: T.textSub,
                        border: "1px solid rgba(255,255,255,0.18)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title="Sign out from this session to use another account"
                    >
                      Sign Out ⎋
                    </button>
                  </div>
                </div>
              )}

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
                    <button
                      type="button"
                      className="fgtlnk"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStatus({ msg: "", type: "" });
                        setForgotOpen(true);
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="pw-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="linp"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      className="pw-eye"
                      onClick={() => setShowPassword(p => !p)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
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
                  <button type="button" className="trmbtn">Terms & Privacy</button>
                </div>

                {error && <div className="errbox">⚠ {error}</div>}

                {/* Blue CTA */}
                <button type="button" className="sinbtn" onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>

                <div className="dvdr">
                  <div className="dvdrln" />
                  <span className="dvdrtxt">or continue with</span>
                  <div className="dvdrln" />
                </div>

                <div>
                  <button
                    type="button"
                    className="sbtn-google"
                    onClick={() => handleSocial(loginWithGoogle)}
                    disabled={loading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{loading ? "Connecting to Google…" : "Continue with Google"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="ffoot">Built for Discipline · AshFitVerse</div>
          </div>

        </div>

        {/* Forgot Password Modal */}
        {forgotOpen && (
          <div className="fmodal-ov" onClick={() => setForgotOpen(false)}>
            <div className="fmodal-box" onClick={e => e.stopPropagation()}>
              <button className="fmodal-close" onClick={() => setForgotOpen(false)}>✕</button>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8, fontFamily: FONT.display }}>
                Reset <span style={{ color: T.accent }}>Password</span>
              </h3>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
                Enter the email address registered with your AshFitVerse account. We'll send you an official reset link.
              </p>
              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: 16 }}>
                  <label className="flbl">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="linp"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                {forgotStatus.msg && (
                  <div style={{
                    padding: "11px 14px",
                    borderRadius: 12,
                    fontSize: 12.5,
                    fontWeight: 600,
                    marginBottom: 16,
                    background: forgotStatus.type === "success" ? "rgba(52,211,153,0.12)" : T.redSoft,
                    color: forgotStatus.type === "success" ? "#34d399" : T.red,
                    border: `1px solid ${forgotStatus.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                  }}>
                    {forgotStatus.type === "success" ? "✓ " : "⚠ "} {forgotStatus.msg}
                  </div>
                )}
                <button
                  type="submit"
                  className="sinbtn"
                  style={{ height: 48, fontSize: 13 }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending Link…" : "Send Reset Email →"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}