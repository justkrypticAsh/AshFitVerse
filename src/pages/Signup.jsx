// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerWithEmail, loginWithGoogle, loginWithApple } from "../firebase";
import useTheme from "../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../theme";

export default function Signup() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setMessage({ text: "Please fill in all fields.", type: "error" }); return;
    }
    setLoading(true); setMessage({ text: "", type: "" });
    try {
      await registerWithEmail(form.email, form.password);

      // ✅ FIX 1: Save name to localStorage for onboarding pre-fill
      localStorage.setItem("ashfitverse_signup_name", form.name);

      // ✅ FIX 2: Remove any stale onboarding flag so RequireOnboarding works
      localStorage.removeItem("ashfitverse_onboarded");
      localStorage.removeItem("ashfitverse_user");

      setMessage({ text: "Account created! Setting up your profile... 🚀", type: "success" });

      // ✅ FIX 3: Go to ONBOARDING, not dashboard
      setTimeout(() => navigate("/onboarding"), 1000);

    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "This email is already registered. Try signing in.",
        "auth/weak-password":         "Password must be at least 6 characters.",
        "auth/invalid-email":         "Please enter a valid email address.",
      };
      setMessage({ text: msgs[err.code] || "Signup failed. Please try again.", type: "error" });
    } finally { setLoading(false); }
  };

  // ✅ FIX 4: Google/Apple signin → also go to onboarding if not onboarded
  const handleSocialSignin = async (providerFn) => {
    try {
      await providerFn();
      const alreadyOnboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
      navigate(alreadyOnboarded ? "/dashboard" : "/onboarding");
    } catch {
      setMessage({ text: "Sign-in failed. Please try again.", type: "error" });
    }
  };

  const css = generateCSS(T, dark) + `
    .sr{min-height:100vh;display:flex;align-items:center;justify-content:center;
      padding:24px;position:relative;overflow:hidden;background:${T.bg};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .sbg{position:fixed;inset:0;z-index:0;pointer-events:none;}
    .sbg img{width:100%;height:100%;object-fit:cover;
      opacity:${dark?"0.06":"0.08"};
      filter:${dark?"grayscale(80%) blur(2px)":"grayscale(40%) blur(1px)"};}
    .scard{position:relative;z-index:10;width:100%;max-width:1160px;height:860px;
      border-radius:32px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;
      border:1px solid ${T.glassBorder};
      box-shadow:0 60px 160px rgba(0,0,0,${dark?"0.55":"0.14"}),0 0 0 1px ${T.accentSoft};
      opacity:${mounted?1:0};transform:${mounted?"translateY(0)":"translateY(28px)"};
      transition:opacity 0.8s cubic-bezier(0.4,0,0.2,1),transform 0.8s cubic-bezier(0.4,0,0.2,1);}

    .sfp{background:${dark?"rgba(8,10,22,0.97)":"rgba(255,255,255,0.97)"};
      display:flex;flex-direction:column;justify-content:space-between;
      padding:40px 50px;overflow-y:auto;backdrop-filter:blur(40px);}
    .stnav{display:flex;align-items:center;justify-content:space-between;
      animation:fadeDown 0.7s cubic-bezier(0.4,0,0.2,1) 0.3s both;}
    .slgo{font-family:${FONT.display};font-size:22px;font-weight:800;letter-spacing:0.04em;color:${T.text};}
    .slgo span{color:${T.accent};}
    .slsub{font-size:11px;color:${T.textMuted};letter-spacing:0.1em;margin-top:3px;font-family:${FONT.body};}
    .sinlnk{padding:10px 22px;border-radius:99px;border:1.5px solid ${T.glassBorder};
      background:transparent;color:${T.textSub};font-size:13px;font-weight:700;
      font-family:${FONT.body};letter-spacing:0.05em;cursor:pointer;transition:all 0.28s;}
    .sinlnk:hover{border-color:${T.accent};color:${T.accent};box-shadow:0 0 18px ${T.accentGlow}40;}
    .stog{width:50px;height:27px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .stth{width:21px;height:21px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      position:absolute;top:3px;left:${dark?"26px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:11px;}

    .sbdy{flex:1;display:flex;flex-direction:column;justify-content:center;padding:14px 0;}
    .seye{font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;
      color:${T.accent};margin-bottom:12px;font-family:${FONT.body};animation:fadeUp 0.7s ease 0.4s both;}
    .sttl{font-family:${FONT.display};font-size:64px;line-height:0.92;
      letter-spacing:-0.02em;color:${T.text};margin-bottom:14px;animation:fadeUp 0.7s ease 0.45s both;}
    .sttl span{color:${T.accent};display:block;}
    .ssubt{font-size:14px;color:${T.textSub};line-height:1.65;max-width:340px;
      margin-bottom:28px;font-family:${FONT.body};animation:fadeUp 0.7s ease 0.5s both;}
    .sflds{display:flex;flex-direction:column;gap:14px;animation:fadeUp 0.7s ease 0.55s both;}
    .sflbl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
      color:${T.textMuted};display:block;margin-bottom:8px;font-family:${FONT.body};}
    .sinp{width:100%;height:56px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:16px;padding:0 20px;
      font-size:15px;font-family:${FONT.body};font-weight:400;color:${T.text};outline:none;transition:all 0.28s;}
    .sinp::placeholder{color:${T.textMuted};}
    .sinp:focus{border-color:${T.accent};background:${T.accentSoft};box-shadow:0 0 0 4px ${T.accentGlow}25;}

    .msgbox{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:13px;
      font-size:13px;font-weight:600;font-family:${FONT.body};animation:fadeUp 0.4s ease both;}
    .msgbox.success{background:${T.greenSoft};border:1px solid ${T.green}30;color:${T.green};}
    .msgbox.error{background:${T.redSoft};border:1px solid rgba(248,113,113,0.22);color:${T.red};}

    .regbtn{width:100%;height:56px;border-radius:16px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:0 8px 28px ${T.accentGlow};
      display:flex;align-items:center;justify-content:center;gap:10px;}
    .regbtn:hover{transform:translateY(-3px);box-shadow:0 16px 44px ${T.accentGlow};}
    .regbtn:disabled{opacity:0.55;cursor:not-allowed;transform:none;}
    .spinner{width:16px;height:16px;border:2.5px solid rgba(255,255,255,0.3);
      border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;}

    .dvdr{display:flex;align-items:center;gap:14px;}
    .dvdrln{flex:1;height:1px;background:${T.glassBorder};}
    .dvdrtxt{font-size:11px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;font-family:${FONT.body};}
    .sgrd{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
    .sbtnso{height:52px;border-radius:14px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};color:${T.textSub};font-size:13px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all 0.28s;}
    .sbtnso:hover{background:${T.glassHover};border-color:${T.glassBorderHover};color:${T.text};transform:translateY(-2px);}

    .sfoot{font-size:11px;color:${T.textMuted};font-weight:500;letter-spacing:0.12em;
      text-transform:uppercase;font-family:${FONT.body};animation:fadeIn 1s ease 1s both;}

    .sip{position:relative;overflow:hidden;}
    .sip img{width:100%;height:100%;object-fit:cover;transform:scale(1.06);transition:transform 12s ease;}
    .sip:hover img{transform:scale(1.0);}
    .siov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.12) 50%,rgba(0,0,0,0.72) 100%);}
    .sibadge{position:absolute;top:32px;right:32px;display:flex;align-items:center;gap:9px;
      padding:10px 20px;border-radius:99px;background:rgba(255,255,255,0.09);
      border:1px solid rgba(255,255,255,0.16);backdrop-filter:blur(20px);
      animation:fadeDown 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s both;}
    .sibdot{width:8px;height:8px;border-radius:50%;background:${T.accent};
      box-shadow:0 0 10px ${T.accent};animation:pulseGlow 2s ease-in-out infinite;}
    .sibtxt{font-size:12px;font-weight:600;color:rgba(255,255,255,0.92);
      letter-spacing:0.05em;font-family:${FONT.body};}
    .sihl{position:absolute;top:50%;left:32px;right:32px;transform:translateY(-50%);
      animation:fadeUp 0.9s cubic-bezier(0.4,0,0.2,1) 0.5s both;}
    .sihl h2{font-family:${FONT.display};font-size:84px;line-height:0.9;color:#fff;
      letter-spacing:0.02em;text-shadow:0 4px 40px rgba(0,0,0,0.5);}
    .sihl h2 span{color:${T.accent};display:block;text-shadow:0 0 60px ${T.accentGlow};}
    .sihl p{margin-top:18px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.65;
      max-width:340px;font-family:${FONT.body};}
    .sperks{position:absolute;bottom:32px;left:32px;right:32px;
      background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.13);
      border-radius:22px;padding:20px 24px;backdrop-filter:blur(24px);
      animation:fadeUp 0.9s cubic-bezier(0.4,0,0.2,1) 0.7s both;}
    .sptitle{font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;
      color:rgba(255,255,255,0.45);margin-bottom:14px;font-family:${FONT.body};}
    .spgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .spitem{display:flex;align-items:center;gap:10px;}
    .spico{width:32px;height:32px;background:rgba(79,142,247,0.18);
      border:1px solid rgba(79,142,247,0.28);border-radius:10px;
      display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
    .sptxt{font-size:13px;font-weight:600;color:rgba(255,255,255,0.78);font-family:${FONT.body};}

    @media(max-width:900px){
      .scard{grid-template-columns:1fr;height:auto;}
      .sip{height:320px;}
      .sfp{padding:32px 24px;}
      .sttl{font-size:50px;}
      .sihl h2{font-size:58px;}
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sr">
        <div className="sbg"><img src={BG_IMAGES.signup} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        <div className="scard">
          {/* Left: form */}
          <div className="sfp">
            <div className="stnav">
              <div>
                <div className="slgo">AshFit<span>Verse</span></div>
                <div className="slsub">Elevate your fitness lifestyle</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="stog" onClick={toggleTheme}><div className="stth">{dark ? "🌙" : "☀️"}</div></button>
                <button className="sinlnk" onClick={() => navigate("/")}>Sign In</button>
              </div>
            </div>

            <div className="sbdy">
              <p className="seye">— New Member</p>
              <h2 className="sttl">Start<span>Strong.</span></h2>
              <p className="ssubt">Join thousands transforming their physique. Your fitness journey begins right here.</p>

              <form className="sflds" onSubmit={onSubmit}>
                <div>
                  <label className="sflbl">Full Name</label>
                  <input type="text" required placeholder="Enter your name" className="sinp"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="sflbl">Email Address</label>
                  <input type="email" required placeholder="you@example.com" className="sinp"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="sflbl">Password</label>
                  <input type="password" required placeholder="Create a strong password" className="sinp"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>

                {message.text && (
                  <div className={`msgbox ${message.type}`}>
                    {message.type === "success" ? "✓" : "⚠"} {message.text}
                  </div>
                )}

                <button type="submit" className="regbtn" disabled={loading}>
                  {loading && <div className="spinner" />}
                  {loading ? "Creating account..." : "Create Account →"}
                </button>

                <div className="dvdr">
                  <div className="dvdrln" /><span className="dvdrtxt">or continue with</span><div className="dvdrln" />
                </div>

                <div className="sgrd">
                  <button type="button" className="sbtnso"
                    onClick={() => handleSocialSignin(loginWithGoogle)}>
                    🔵 Google
                  </button>
                  <button type="button" className="sbtnso"
                    onClick={() => handleSocialSignin(loginWithApple)}>
                    🍎 Apple
                  </button>
                </div>
              </form>
            </div>

            <div className="sfoot">Built for Discipline · AshFitVerse</div>
          </div>

          {/* Right: image */}
          <div className="sip">
            <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2070&auto=format&fit=crop" alt="Fitness" />
            <div className="siov" />
            <div className="sibadge"><div className="sibdot" /><span className="sibtxt">Free to Join</span></div>
            <div className="sihl">
              <h2>Your Era<span>Starts</span>Now.</h2>
              <p>Build the body and discipline you've always wanted. AshFitVerse gives you the tools. You bring the will.</p>
            </div>
            <div className="sperks">
              <div className="sptitle">What you get</div>
              <div className="spgrid">
                {[
                  { ico: "📊", txt: "Progress Tracking" },
                  { ico: "🏋️", txt: "500+ Workouts" },
                  { ico: "🔥", txt: "Daily Streaks" },
                  { ico: "🤝", txt: "24K Community" },
                ].map((p, i) => (
                  <div key={i} className="spitem">
                    <div className="spico">{p.ico}</div>
                    <span className="sptxt">{p.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}