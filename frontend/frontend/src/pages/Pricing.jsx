// src/pages/Pricing.jsx — AshFitVerse
// Features locked accurately based on what actually exists in the app
// Free: basics only | Lite: tools + community | Pro: health hubs + AI + advanced

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import useTheme from "../hooks/useTheme";
import usePayment from "../hooks/usePayment";
import { generateCSS, FONT } from "../theme";

// ─── Plans — only real features mentioned ────────────────────────────────────
const PLANS = [
  {
    id: "free", name: "Free", tagline: "Just getting started",
    price: { monthly: 0, yearly: 0 },
    color: "#0a84ff", emoji: "🌱", badge: null, cta: "Current Plan",

    // What free users GET (real features)
    included: [
      { icon:"📊", text:"Dashboard overview & basic stats"        },
      { icon:"📏", text:"BMI Calculator"                          },
      { icon:"🔥", text:"Calorie Calculator"                      },
      { icon:"👀", text:"Community feed (read-only)"              },
      { icon:"🏋️",  text:"4 basic workout day pages"               },
    ],

    // What free users DON'T get (real locked features)
    locked: [
      { icon:"📊", text:"Fat % Body Calculator"                   },
      { icon:"📋", text:"Workout Planner"                         },
      { icon:"📝", text:"Workout Logger & history"                },
      { icon:"🥗", text:"Diet Logger"                             },
      { icon:"🍱", text:"Diet Plan Generator"                     },
      { icon:"💬", text:"Post & comment in community"             },
      { icon:"♀",  text:"Women's Health Hub"                      },
      { icon:"♂",  text:"Men's Health Hub"                        },
    ],
  },

  {
    id: "lite", name: "Lite", tagline: "For consistent gym-goers",
    price: { monthly: 199, yearly: 1699 },
    color: "#9d22d6", emoji: "⚡", badge: "Most Popular", cta: "Get Lite",

    included: [
      { icon:"✅", text:"Everything in Free"                      },
      { icon:"📊", text:"Fat % Body Calculator"                   },
      { icon:"📋", text:"Workout Planner"                         },
      { icon:"📝", text:"Workout Logger & full history"           },
      { icon:"🥗", text:"Diet Logger (full history)"              },
      { icon:"🍱", text:"Diet Plan Generator (rule-based)"        },
      { icon:"💬", text:"Post, comment & join community"          },
      { icon:"🏆", text:"Community leaderboard access"            },
    ],

    locked: [
      { icon:"🧬", text:"AI-powered Diet Plan (Claude AI)"        },
      { icon:"♀",  text:"Full Women's Health Hub"                 },
      { icon:"♂",  text:"Full Men's Health Hub"                   },
      { icon:"😴", text:"Sleep Tracker"                           },
      { icon:"❤️", text:"Sexual Wellness module"                  },
      { icon:"💊", text:"Testosterone Health tracker"             },
    ],
  },

  {
    id: "pro", name: "Pro", tagline: "For serious athletes",
    price: { monthly: 499, yearly: 3999 },
    color: "#e67e00", emoji: "🏆", badge: "Best Value", cta: "Go Pro",

    included: [
      { icon:"✅", text:"Everything in Lite"                      },
      { icon:"🧬", text:"AI Diet Plan (Claude AI powered)"        },
      { icon:"♀",  text:"Full Women's Health Hub"                 },
      { icon:"📅", text:"Cycle Tracker & PCOS Guide"              },
      { icon:"♂",  text:"Full Men's Health Hub"                   },
      { icon:"😴", text:"Sleep Tracker"                           },
      { icon:"❤️", text:"Sexual Wellness module"                  },
      { icon:"💊", text:"Testosterone Health tracker"             },
      { icon:"🧘", text:"Mental Wellness (Female & Male)"         },
      { icon:"🌸", text:"Hormone Nutrition & Contraception guide" },
    ],

    locked: [],  // Pro has everything
  },
];

const FAQS = [
  { q:"Can I cancel anytime?",               a:"Yes. Cancel anytime from profile settings. Access continues until billing period ends." },
  { q:"Is there a free trial for Lite/Pro?", a:"Yes! Both Lite and Pro come with a 7-day free trial. No credit card required to start." },
  { q:"What payment methods are accepted?",  a:"UPI, all major credit/debit cards, NetBanking, Paytm and PhonePe — via Razorpay." },
  { q:"Will I lose data if I downgrade?",    a:"Never. All logged workouts, diet entries and progress are always saved regardless of plan." },
  { q:"Can I switch plans mid-cycle?",       a:"Yes. Upgrades are instant. Downgrades take effect at your next billing date." },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { startPayment, loading: payLoading } = usePayment();

  const [mounted,  setMounted]  = useState(false);
  const [billing,  setBilling]  = useState("monthly");
  const [openFaq,  setOpenFaq]  = useState(null);
  const [success,  setSuccess]  = useState(null);
  const [payErr,   setPayErr]   = useState(null);
  const [activeId, setActiveId] = useState(null);

  const [userData, setUserData] = useState({
    plan:"free", name:"", email:"", streak:0, phone:"",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData({
          plan:   d.plan   || "free",
          name:   d.name   || d.displayName || "User",
          email:  d.email  || user.email || "",
          streak: d.streak || 0,
          phone:  d.phone  || "",
        });
      }
    });
    return () => unsub();
  }, []);

  // Canvas BG
  const canvasRef = useRef(null);
  const isDarkRef = useRef(dark);
  useEffect(() => { isDarkRef.current = dark; }, [dark]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const N = 42;
    const pts = Array.from({ length: N }, (_, i) => ({
      x: Math.random()*1.2-.1, y: Math.random()*1.2-.1,
      r: .3+Math.random()*.8, vx:(Math.random()-.5)*.00018, vy:(Math.random()-.5)*.00015,
      a:.04+Math.random()*.07,
      c:["rgba(10,132,255,","rgba(157,34,214,","rgba(48,209,88,","rgba(230,126,0,"][i%4],
    }));
    let raf;
    const draw = () => {
      if (!W||!H) { raf=requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,W,H);
      const d = isDarkRef.current;
      const bg = ctx.createRadialGradient(W*.5,H*.25,0,W*.5,H*.25,W*.85);
      if (d) {
        bg.addColorStop(0,"rgba(10,10,12,1)"); bg.addColorStop(.5,"rgba(8,8,14,1)"); bg.addColorStop(1,"rgba(5,5,8,1)");
      } else {
        bg.addColorStop(0,"rgba(255,255,255,1)"); bg.addColorStop(.5,"rgba(246,247,252,1)"); bg.addColorStop(1,"rgba(235,236,242,1)");
      }
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-.1)p.x=1.1; if(p.x>1.1)p.x=-.1; if(p.y<-.1)p.y=1.1; if(p.y>1.1)p.y=-.1;
        const px=p.x*W, py=p.y*H, pr=p.r*13;
        const al=d?p.a:p.a*.38;
        const grd=ctx.createRadialGradient(px,py,0,px,py,pr);
        grd.addColorStop(0,p.c+al*2+")"); grd.addColorStop(1,p.c+"0)");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize",resize); cancelAnimationFrame(raf); };
  }, [dark]);

  // Payment
  const handleUpgrade = async (plan) => {
    if (plan.id === "free" || plan.id === userData.plan) return;
    setPayErr(null); setActiveId(plan.id);
    await startPayment({
      planId: plan.id, billing, planName: plan.name,
      userEmail: userData.email, userName: userData.name, userPhone: userData.phone||"",
      onSuccess: (planId) => { setSuccess({ planId, planName:plan.name, emoji:plan.emoji }); setActiveId(null); },
      onFailure: (err)    => { if(!err.includes("cancel")) setPayErr(err); setActiveId(null); },
    });
  };

  const savingPct = p => {
    if (!p.price.monthly) return null;
    return Math.round(((p.price.monthly*12 - p.price.yearly)/(p.price.monthly*12))*100);
  };
  const getPlanStatus = planId => {
    if (planId === userData.plan) return "current";
    return ["free","lite","pro"].indexOf(planId) < ["free","lite","pro"].indexOf(userData.plan)
      ? "downgrade" : "upgrade";
  };

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = `
    ${generateCSS(T, dark)}

    .pr-root {
      min-height: 100vh;
      background: ${T.bg};
      color: ${T.text};
      font-family: ${FONT.body};
      opacity: ${mounted ? 1 : 0};
      transition: opacity .5s ease, background .4s;
      position: relative;
    }

    /* Header */
    .pr-hd {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px; height: 60px;
      background: ${dark ? "rgba(8,8,12,0.88)" : "rgba(255,255,255,0.88)"};
      border-bottom: 1px solid ${T.glassBorder};
      backdrop-filter: blur(40px); position: sticky; top: 0; z-index: 50;
    }
    .pr-back {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 10px;
      border: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
      color: ${T.text}; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: ${FONT.body}; transition: all .15s;
    }
    .pr-back:hover { background: ${T.accentSoft}; border-color: ${T.accent}40; color: ${T.accent}; }
    .pr-logo { font-family: ${FONT.display}; font-size: 18px; font-weight: 800; color: ${T.text}; }
    .pr-logo span { color: ${T.accent}; }
    .theme-toggle {
      width: 48px; height: 26px; border-radius: 99px;
      border: 1px solid ${T.glassBorder};
      background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
      cursor: pointer; position: relative;
    }
    .toggle-thumb {
      position: absolute; top: 2px; width: 20px; height: 20px;
      border-radius: 50%; background: ${T.accent};
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; transition: left .2s; left: ${dark?"24px":"2px"};
    }

    /* Page */
    .pr-page { max-width: 1120px; margin: 0 auto; padding: 40px 24px 70px; position: relative; z-index: 1; }

    /* Hero */
    .ph { text-align: center; margin-bottom: 44px; }
    .ph-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 16px; border-radius: 99px;
      background: ${T.accentSoft}; border: 1px solid ${T.accent}30;
      font-size: 11px; font-weight: 800; color: ${T.accent};
      text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px;
    }
    .ph-title {
      font-family: ${FONT.display}; font-size: 42px; font-weight: 800;
      color: ${T.text}; line-height: 1.12; margin-bottom: 12px; letter-spacing: -.025em;
    }
    .ph-title span {
      background: linear-gradient(135deg,${T.accent},${T.purple});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .ph-sub { font-size: 15px; color: ${T.textSub}; max-width: 500px; margin: 0 auto 28px; line-height: 1.65; }

    /* Billing toggle */
    .bill-wrap {
      display: inline-flex;
      background: ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
      border: 1px solid ${T.glassBorder}; border-radius: 14px; padding: 5px; gap: 4px;
    }
    .bill-btn {
      padding: 9px 22px; border-radius: 10px; border: none;
      background: transparent; color: ${T.textSub};
      font-size: 13.5px; font-weight: 700; cursor: pointer;
      font-family: ${FONT.body}; transition: all .22s;
    }
    .bill-btn.on {
      background: linear-gradient(135deg,${T.accent},${T.purple});
      color: #fff; box-shadow: 0 3px 12px ${T.accentGlow};
    }

    /* Plans grid */
    .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; margin-bottom: 52px; }

    /* Plan card */
    .plan-card {
      background: ${dark ? "rgba(16,16,24,0.88)" : "rgba(255,255,255,0.94)"};
      border: 1.5px solid ${T.glassBorder};
      border-radius: 26px; padding: 28px 24px 24px;
      display: flex; flex-direction: column;
      position: relative;
      backdrop-filter: blur(28px);
      transition: transform .32s cubic-bezier(.4,0,.2,1), border-color .28s, box-shadow .28s;
      /* Glass specular */
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.90)"},
        0 4px 20px rgba(0,0,0,${dark?"0.28":"0.07"});
    }
    /* specular shine */
    .plan-card::before {
      content: ''; position: absolute; inset: 0; border-radius: 26px; pointer-events: none;
      background: linear-gradient(135deg,
        rgba(255,255,255,${dark?"0.07":"0.50"}) 0%, transparent 45%);
    }
    .plan-card:hover {
      transform: translateY(-8px);
      border-color: var(--pc);
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.95)"},
        0 0 0 1px var(--pc)30,
        0 24px 56px rgba(0,0,0,${dark?"0.38":"0.14"});
    }
    .plan-card.popular {
      border-color: var(--pc);
      box-shadow:
        inset 0 1px 0 ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.92)"},
        0 0 0 1px var(--pc)35,
        0 18px 48px var(--pc)18;
    }

    .plan-badge {
      position: absolute; top: 18px; right: 18px;
      padding: 4px 12px; border-radius: 99px;
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      background: var(--pc); color: #000; letter-spacing: .04em;
    }
    .plan-curr-tag {
      position: absolute; top: 18px; left: 18px;
      padding: 4px 12px; border-radius: 99px;
      font-size: 10px; font-weight: 800;
      background: ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)"};
      color: ${T.textSub};
    }

    .plan-emoji { font-size: 34px; margin-bottom: 10px; display: block; }
    .plan-name { font-family: ${FONT.display}; font-size: 26px; font-weight: 800; margin-bottom: 3px; }
    .plan-tagline { font-size: 12.5px; color: ${T.textSub}; margin-bottom: 20px; }

    /* Price block */
    .plan-price { margin-bottom: 20px; }
    .price-amt {
      font-family: ${FONT.display}; font-size: 46px; font-weight: 800;
      color: ${T.text}; line-height: 1;
    }
    .price-sym {
      font-size: 20px; font-weight: 600; color: ${T.textSub};
      vertical-align: top; margin-top: 6px; display: inline-block;
    }
    .price-per { font-size: 12px; color: ${T.textMuted}; margin-top: 4px; }
    .price-save { font-size: 11.5px; color: #30d158; font-weight: 700; margin-top: 3px; }

    /* ── Feature lists ── */
    .feat-section { flex: 1; margin-bottom: 22px; }

    /* Section label */
    .feat-label {
      font-size: 9.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
      display: flex; align-items: center; gap: 6px; margin-bottom: 8px; margin-top: 16px;
    }
    .feat-label:first-child { margin-top: 0; }
    .feat-label.incl { color: #30d158; }
    .feat-label.lock { color: ${T.textMuted}; }

    /* Divider between sections */
    .feat-divider {
      height: 1px; margin: 14px 0 10px;
      background: ${T.glassBorder};
    }

    /* Feature row */
    .feat-row {
      display: flex; align-items: flex-start; gap: 9px;
      font-size: 12.5px; padding: 4px 0; line-height: 1.4;
    }
    .feat-ico-wrap {
      width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 900; margin-top: 1px;
    }
    .feat-ico-wrap.incl {
      background: rgba(48,209,88,.14); color: #30d158;
    }
    .feat-ico-wrap.lock {
      background: ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)"};
      color: ${T.textMuted};
    }
    .feat-text.incl { color: ${T.textSub}; }
    .feat-text.lock {
      color: ${T.textMuted}; text-decoration: line-through;
      opacity: .55; font-style: italic;
    }

    /* Shimmer on card */
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .plan-shimmer {
      position: absolute; inset: 0; border-radius: 26px; pointer-events: none;
      background: linear-gradient(108deg,
        transparent 30%, rgba(255,255,255,${dark?".022":".10"}) 50%, transparent 70%);
      background-size: 200% 100%; animation: shimmer 6s ease-in-out infinite;
    }

    /* CTA button */
    .plan-cta {
      width: 100%; height: 50px; border-radius: 14px;
      font-size: 14px; font-weight: 800; font-family: ${FONT.body};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all .25s cubic-bezier(.34,1.56,.64,1);
      position: relative; z-index: 1;
      margin-top: auto;
    }
    .plan-cta.upgrade {
      background: var(--pc);
      color: #fff;
      box-shadow: 0 6px 22px var(--pc)45;
    }
    .plan-cta.upgrade:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 14px 32px var(--pc)55;
      filter: brightness(1.08);
    }
    .plan-cta.upgrade:disabled { opacity: .7; cursor: default; }
    .plan-cta.curr {
      background: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"};
      border: 1px solid ${T.glassBorder};
      color: ${T.textMuted}; cursor: default;
    }
    .plan-cta.downgrade {
      background: transparent;
      border: 1px solid ${T.glassBorder};
      color: ${T.textMuted};
    }
    .btn-spin {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
      border-radius: 50%; animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Trust row */
    .trust-row { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; margin-bottom: 50px; }
    .trust-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${T.textSub}; font-weight: 600; }

    /* Error */
    .pay-err {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,59,48,.10); border: 1px solid rgba(255,59,48,.28);
      color: #ff3b30; padding: 12px 16px; border-radius: 12px;
      font-size: 13px; font-weight: 600; margin-bottom: 22px;
    }

    /* FAQ */
    .faq-wrap { max-width: 720px; margin: 0 auto 40px; }
    .faq-title {
      font-family: ${FONT.display}; font-size: 22px; font-weight: 800;
      color: ${T.text}; text-align: center; margin-bottom: 22px; letter-spacing: -.01em;
    }
    .faq-item {
      background: ${dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"};
      border: 1px solid ${T.glassBorder}; border-radius: 14px;
      margin-bottom: 10px; overflow: hidden; transition: border-color .2s;
    }
    .faq-item:hover { border-color: ${T.glassBorderHover}; }
    .faq-q {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; font-size: 14px; font-weight: 700;
      color: ${T.text}; cursor: pointer;
    }
    .faq-a { padding: 0 20px 16px; font-size: 13px; color: ${T.textSub}; line-height: 1.68; }

    /* Success overlay */
    .success-ov {
      position: fixed; inset: 0; z-index: 900;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.75); backdrop-filter: blur(12px);
    }
    .success-box {
      background: ${dark ? "#111118" : "#ffffff"}; border-radius: 24px;
      padding: 40px; text-align: center; max-width: 400px; width: 90%;
      border: 1px solid ${T.glassBorder};
      box-shadow: 0 40px 80px rgba(0,0,0,.5);
      animation: scaleIn .4s cubic-bezier(.4,0,.2,1) both;
    }
    @keyframes scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
    .success-emoji { font-size: 64px; margin-bottom: 14px; display: block; }
    .success-title { font-family: ${FONT.display}; font-size: 24px; font-weight: 800; color: ${T.text}; margin-bottom: 8px; }
    .success-sub { font-size: 13.5px; color: ${T.textSub}; margin-bottom: 24px; line-height: 1.6; }
    .success-cta {
      width: 100%; padding: 14px; border-radius: 13px; border: none;
      font-size: 14px; font-weight: 800; color: #fff; cursor: pointer;
      font-family: ${FONT.body}; transition: all .22s;
    }
    .success-cta:hover { transform: translateY(-2px); }

    /* "vs" compare row under billing */
    .compare-note {
      font-size: 12px; color: ${T.textMuted}; text-align: center;
      margin-top: 12px; font-weight: 600;
    }
    .compare-note span { color: #30d158; font-weight: 800; }

    @media(max-width:1024px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto 48px; }
    }
    @media(max-width:640px) {
      .pr-page { padding: 24px 14px 60px; }
      .ph-title { font-size: 28px; }
      .pr-hd { padding: 0 14px; }
    }
  `;

  return (
    <div className="pr-root">
      <style>{css}</style>
      <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,width:"100%",height:"100%",pointerEvents:"none" }}/>

      {/* Success overlay */}
      {success && (
        <div className="success-ov">
          <div className="success-box">
            <span className="success-emoji">{success.emoji}</span>
            <div className="success-title">Welcome to {success.planName}! 🎉</div>
            <div className="success-sub">
              Payment successful. Your {success.planName} features are now unlocked. Let's get to work.
            </div>
            <button className="success-cta"
              style={{ background: `linear-gradient(135deg,${PLANS.find(p=>p.id===success.planId)?.color},${PLANS.find(p=>p.id===success.planId)?.color}cc)` }}
              onClick={() => { setSuccess(null); navigate("/dashboard"); }}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pr-hd">
        <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        <div className="pr-logo">AshFit<span>Verse</span></div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
        </button>
      </div>

      <div className="pr-page">

        {/* Error */}
        {payErr && (
          <div className="pay-err">
            <span>⚠️ {payErr}</span>
            <button onClick={() => setPayErr(null)} style={{ background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:16 }}>✕</button>
          </div>
        )}

        {/* Hero */}
        <div className="ph">
          <div className="ph-badge">💎 Membership Plans</div>
          <div className="ph-title">
            Unlock the Tools<br/><span>That Actually Work</span>
          </div>
          <div className="ph-sub">
            Free gets you started. Lite gets you going. Pro gets you everything.
          </div>

          {/* Billing toggle */}
          <div className="bill-wrap">
            <button className={`bill-btn${billing==="monthly"?" on":""}`} onClick={() => setBilling("monthly")}>
              Monthly
            </button>
            <button className={`bill-btn${billing==="yearly"?" on":""}`} onClick={() => setBilling("yearly")}>
              Yearly
            </button>
          </div>
          {billing === "yearly" && (
            <div className="compare-note">
              Yearly saves you <span>30%</span> — Lite ₹{Math.round((199*12-1699)/12)}/mo saved · Pro ₹{Math.round((499*12-3999)/12)}/mo saved
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="plans-grid">
          {PLANS.map((plan) => {
            const status       = getPlanStatus(plan.id);
            const isCurrent    = status === "current";
            const isProcessing = activeId === plan.id && payLoading;

            return (
              <div key={plan.id}
                className={`plan-card${plan.badge ? " popular" : ""}`}
                style={{ "--pc": plan.color }}>

                <div className="plan-shimmer"/>

                {isCurrent && <div className="plan-curr-tag">✓ Current Plan</div>}
                {plan.badge && !isCurrent && <div className="plan-badge">{plan.badge}</div>}

                <span className="plan-emoji">{plan.emoji}</span>
                <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
                <div className="plan-tagline">{plan.tagline}</div>

                {/* Price */}
                <div className="plan-price">
                  {plan.price.monthly === 0 ? (
                    <div>
                      <span className="price-amt" style={{ color: plan.color }}>₹0</span>
                      <div className="price-per">Free forever — no card needed</div>
                    </div>
                  ) : (
                    <div>
                      <span className="price-sym">₹</span>
                      <span className="price-amt" style={{ color: plan.color }}>
                        {billing==="monthly" ? plan.price.monthly : Math.round(plan.price.yearly/12)}
                      </span>
                      <div className="price-per">
                        per month{billing==="yearly" ? ", billed yearly" : ""}
                      </div>
                      {billing==="yearly" && savingPct(plan) && (
                        <div className="price-save">
                          🎉 Save {savingPct(plan)}% — ₹{plan.price.monthly*12 - plan.price.yearly} off per year
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Feature list ── */}
                <div className="feat-section">

                  {/* What's included */}
                  <div className="feat-label incl">
                    <span>✓</span>
                    <span>What you get</span>
                  </div>
                  {plan.included.map((f, i) => (
                    <div key={i} className="feat-row">
                      <div className="feat-ico-wrap incl">✓</div>
                      <span className="feat-text incl">{f.text}</span>
                    </div>
                  ))}

                  {/* What's locked — only show if there are locks */}
                  {plan.locked.length > 0 && (
                    <>
                      <div className="feat-divider"/>
                      <div className="feat-label lock">
                        <span>🔒</span>
                        <span>Locked features</span>
                      </div>
                      {plan.locked.map((f, i) => (
                        <div key={i} className="feat-row">
                          <div className="feat-ico-wrap lock">🔒</div>
                          <span className="feat-text lock">{f.text}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Pro all-clear */}
                  {plan.locked.length === 0 && (
                    <div style={{
                      marginTop:14, padding:"10px 14px", borderRadius:12,
                      background: `${plan.color}14`,
                      border: `1px solid ${plan.color}25`,
                      fontSize:12.5, color:T.textSub, lineHeight:1.55,
                    }}>
                      <span style={{ color:plan.color, fontWeight:800 }}>🏆 Full Access — </span>
                      No features locked. Everything unlocked, always.
                    </div>
                  )}

                </div>

                {/* CTA */}
                <button
                  className={`plan-cta ${isCurrent ? "curr" : status === "downgrade" ? "downgrade" : "upgrade"}`}
                  disabled={isCurrent || isProcessing}
                  onClick={() => handleUpgrade(plan)}>
                  {isProcessing
                    ? <><span className="btn-spin"/> Connecting…</>
                    : isCurrent
                    ? "✓ Active Plan"
                    : status === "downgrade"
                    ? "Downgrade"
                    : `${plan.cta} →`
                  }
                </button>

              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="trust-row">
          {[
            { icon:"🔒", text:"100% Secure via Razorpay" },
            { icon:"🔄", text:"Cancel anytime, no hassle" },
            { icon:"💳", text:"UPI · Cards · NetBanking"  },
            { icon:"🎁", text:"7-day free trial included" },
          ].map((b,i) => (
            <div key={i} className="trust-badge">
              <span style={{ fontSize:18 }}>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="faq-wrap">
          <div className="faq-title">Frequently Asked Questions</div>
          {FAQS.map((f,i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                <span>{f.q}</span>
                <span style={{ fontSize:13, color:T.textMuted }}>{openFaq===i ? "▲" : "▼"}</span>
              </div>
              {openFaq===i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
