// src/pages/Pricing.jsx — migrated to useTheme + generateCSS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import useUser from "../hooks/useUser";
import { generateCSS, FONT } from "../theme";

const PLANS = [
  {
    id: "free", name: "Free", tagline: "Get started, no card needed",
    price: { monthly: 0, yearly: 0 },
    color: "#4f8ef7", glow: "rgba(79,142,247,0.2)", emoji: "🌱",
    badge: null,
    features: [
      { text: "Dashboard overview",           included: true  },
      { text: "BMI Calculator",               included: true  },
      { text: "Calorie Calculator",           included: true  },
      { text: "4 workout day pages",          included: true  },
      { text: "Basic diet log (today only)",  included: true  },
      { text: "Community feed (read only)",   included: true  },
      { text: "Fat % Calculator",             included: false },
      { text: "Workout Planner & Logger",     included: false },
      { text: "Full Diet Plan Generator",     included: false },
      { text: "AI Meal Suggestions",          included: false },
      { text: "Progress Analytics",           included: false },
      { text: "Priority Support",             included: false },
    ],
    cta: "Current Plan", current: true,
  },
  {
    id: "lite", name: "Lite", tagline: "For consistent gym-goers",
    price: { monthly: 199, yearly: 1699 },
    color: "#a78bfa", glow: "rgba(167,139,250,0.2)", emoji: "⚡",
    badge: "Popular",
    features: [
      { text: "Everything in Free",           included: true  },
      { text: "Fat % Calculator",             included: true  },
      { text: "Workout Planner",              included: true  },
      { text: "Workout Logger (history)",     included: true  },
      { text: "Full Diet Plan Generator",     included: true  },
      { text: "7-day progress charts",        included: true  },
      { text: "Community — post & comment",   included: true  },
      { text: "Leaderboard access",           included: true  },
      { text: "AI Meal Suggestions",          included: false },
      { text: "Custom workout programs",      included: false },
      { text: "1-on-1 Coach Chat",            included: false },
      { text: "Priority Support",             included: false },
    ],
    cta: "Upgrade to Lite", current: false,
  },
  {
    id: "pro", name: "Pro", tagline: "For serious athletes",
    price: { monthly: 499, yearly: 3999 },
    color: "#fb923c", glow: "rgba(251,146,60,0.22)", emoji: "🏆",
    badge: "Best Value",
    features: [
      { text: "Everything in Lite",              included: true },
      { text: "AI Meal Suggestions (daily)",     included: true },
      { text: "Custom workout programs",         included: true },
      { text: "Full progress analytics",         included: true },
      { text: "Body transformation tracker",     included: true },
      { text: "Macro auto-calculator",           included: true },
      { text: "1-on-1 Coach Chat (2x/month)",   included: true },
      { text: "Challenge creation",              included: true },
      { text: "Early access to new features",   included: true },
      { text: "Export data (PDF/CSV)",           included: true },
      { text: "Ad-free experience",             included: true },
      { text: "Priority Support 24/7",          included: true },
    ],
    cta: "Go Pro", current: false,
  },
];

const FAQS = [
  { q: "Can I cancel anytime?",               a: "Yes, absolutely. Cancel your subscription anytime from your profile settings. You'll keep access until the end of your billing period." },
  { q: "Is there a free trial for Lite/Pro?", a: "Yes! Both Lite and Pro come with a 7-day free trial. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "We accept UPI, all major credit/debit cards, NetBanking, and popular wallets like Paytm and PhonePe." },
  { q: "Will I lose my data if I downgrade?", a: "No. All your logged workouts, diet entries, and progress data are always saved — regardless of your plan." },
  { q: "Can I switch plans mid-cycle?",       a: "Yes. Upgrading is instant. If you downgrade, the change takes effect at your next billing date." },
];

const TOOLS = [
  { label: "Calorie Calc",    icon: "🔥", path: "/calorie-calculator" },
  { label: "Fat % Calc",      icon: "📊", path: "/fat-calculator"     },
  { label: "BMI Calc",        icon: "📏", path: "/bmi-calculator"     },
  { label: "Workout Planner", icon: "📋", path: "/workout-planner"    },
  { label: "Workout Logger",  icon: "📝", path: "/workout-logger"     },
  { label: "Diet Logger",     icon: "🥗", path: "/diet-logger"        },
  { label: "Diet Plan",       icon: "🍱", path: "/diet-plan"          },
  { label: "Shop",            icon: "🛒", path: "/shop"               },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isMale, isFemale } = useUser();

  const [mounted,  setMounted]  = useState(false);
  const [billing,  setBilling]  = useState("monthly");
  const [selected, setSelected] = useState(null);
  const [openFaq,  setOpenFaq]  = useState(null);
  const [success,  setSuccess]  = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const handleUpgrade = (plan) => {
    if (plan.current) return;
    setSelected(plan.id);
    setTimeout(() => { setSuccess(plan); setSelected(null); }, 1200);
  };

  const savingPct = (p) => {
    if (p.price.monthly === 0) return null;
    return Math.round(((p.price.monthly * 12 - p.price.yearly) / (p.price.monthly * 12)) * 100);
  };

  const NAV_MAIN = [
    { label: "Dashboard",  icon: "⊞", path: "/dashboard" },
    { label: "Community",  icon: "◎", path: "/community", badge: "3" },
    { label: "Profile",    icon: "◉", path: "/profile" },
    ...(isFemale ? [{ label: "Women's Health", icon: "♀", path: "/female-health", color: "#f472b6" }] : []),
    ...(isMale   ? [{ label: "Men's Health",   icon: "♂", path: "/male-health",   color: "#4f8ef7" }] : []),
  ];

  const css = generateCSS(T, dark) + `
    .pr-root{min-height:100vh;display:flex;font-family:${FONT.body};background:${T.bg};color:${T.text};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;}

    /* Sidebar */
    .sb{width:255px;min-height:100vh;background:${T.sidebar};border-right:1px solid ${T.glassBorder};
      display:flex;flex-direction:column;padding:28px 15px 22px;flex-shrink:0;
      position:relative;z-index:20;backdrop-filter:blur(40px);transition:background 0.5s,border 0.5s;}
    .sb::after{content:'';position:absolute;top:0;left:0;right:0;height:200px;
      background:linear-gradient(180deg,${T.accent}08 0%,transparent 100%);pointer-events:none;}
    .sb-logo{font-family:${FONT.display};font-size:21px;font-weight:800;letter-spacing:0.04em;
      color:${T.text};padding:0 8px;margin-bottom:4px;cursor:pointer;}
    .sb-logo span{color:${T.accent};}
    .sb-sub{font-size:10px;color:${T.textMuted};letter-spacing:0.14em;text-transform:uppercase;
      font-weight:600;padding:0 8px;margin-bottom:24px;}
    .sb-user{padding:13px;background:${T.glass};border:1px solid ${T.glassBorder};border-radius:15px;
      backdrop-filter:blur(20px);display:flex;align-items:center;gap:11px;cursor:pointer;
      transition:all 0.25s;margin-bottom:22px;}
    .sb-user:hover{border-color:${T.accent}35;}
    .sb-ava{width:37px;height:37px;border-radius:50%;border:2px solid ${T.accent}40;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      display:flex;align-items:center;justify-content:center;
      font-size:15px;font-weight:800;color:#fff;flex-shrink:0;}
    .sb-name{font-size:13px;font-weight:700;color:${T.text};}
    .sb-goal{font-size:11px;color:${T.accent};font-weight:500;text-transform:capitalize;}
    .sb-nl{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
      color:${T.textMuted};padding:0 8px;margin:16px 0 5px;}
    .sb-ni{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:13px;
      cursor:pointer;font-size:13.5px;font-weight:500;color:${T.textSub};
      transition:all 0.22s;margin-bottom:2px;border:1px solid transparent;}
    .sb-ni:hover{color:${T.text};background:${T.glass};border-color:${T.glassBorder};}
    .sb-ni.active{background:linear-gradient(135deg,${T.accentSoft},${T.purpleSoft});
      color:${T.accent};border-color:${T.accent}24;font-weight:600;}
    .sb-ico{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
    .sb-badge{margin-left:auto;padding:2px 7px;background:${T.accent}22;color:${T.accent};
      border-radius:99px;font-size:10px;font-weight:800;}
    .sb-tool{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;
      cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};
      transition:all 0.2s;margin-bottom:1px;}
    .sb-tool:hover{color:${T.text};background:${T.glass};}
    .sb-logout{width:100%;padding:11px;border-radius:13px;border:1px solid rgba(248,113,113,0.18);
      background:rgba(248,113,113,0.05);color:${T.red};font-size:13px;font-weight:600;
      font-family:${FONT.body};cursor:pointer;transition:all 0.25s;margin-top:auto;}
    .sb-logout:hover{background:rgba(248,113,113,0.12);}

    /* Main */
    .mn{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:1;}

    /* Topbar */
    .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;animation:fadeUp 0.6s ease both;}
    .topbar-title{font-family:${FONT.display};font-size:27px;font-weight:800;color:${T.text};letter-spacing:-0.02em;}
    .topbar-sub{font-size:13px;color:${T.textSub};margin-top:3px;}
    .topbar-right{display:flex;align-items:center;gap:11px;}
    .streak-pill{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:99px;
      background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);
      font-size:13px;font-weight:700;color:#fb923c;}

    /* Hero */
    .pricing-hero{text-align:center;margin-bottom:36px;animation:fadeUp 0.6s ease 0.05s both;}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:99px;
      background:${T.accentSoft};border:1px solid ${T.accent}25;
      font-size:12px;font-weight:700;color:${T.accent};letter-spacing:0.08em;
      text-transform:uppercase;margin-bottom:18px;}
    .hero-title{font-family:${FONT.display};font-size:42px;font-weight:800;
      letter-spacing:-0.03em;color:${T.text};line-height:1.1;margin-bottom:14px;}
    .hero-title span{background:linear-gradient(135deg,${T.accent},${T.purple});
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .hero-sub{font-size:16px;color:${T.textSub};max-width:520px;margin:0 auto 28px;line-height:1.65;}

    /* Billing toggle */
    .billing-toggle{display:inline-flex;background:${T.glass};border:1px solid ${T.glassBorder};
      border-radius:14px;padding:5px;gap:4px;margin-bottom:36px;backdrop-filter:blur(20px);}
    .bill-btn{padding:10px 24px;border-radius:10px;border:none;background:transparent;
      color:${T.textSub};font-size:13px;font-weight:700;font-family:${FONT.body};
      cursor:pointer;transition:all 0.25s;position:relative;}
    .bill-btn.active{background:linear-gradient(135deg,${T.accent},${T.purple});color:#fff;
      box-shadow:0 4px 16px ${T.accentGlow};}
    .save-tag{position:absolute;top:-10px;right:-8px;background:${T.green};color:#000;
      font-size:9px;font-weight:800;padding:2px 7px;border-radius:99px;letter-spacing:0.06em;}

    /* Plans grid */
    .plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
      margin-bottom:40px;animation:fadeUp 0.6s ease 0.1s both;}

    /* Plan card */
    .plan-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:28px;
      padding:32px 28px;backdrop-filter:blur(28px);position:relative;overflow:hidden;
      transition:all 0.35s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.8)"};}
    .plan-card:hover{transform:translateY(-8px);border-color:var(--pc);
      box-shadow:0 32px 80px rgba(0,0,0,${dark?"0.4":"0.12"}),0 0 0 1px var(--pc)35,
        inset 0 1px 0 ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.8)"};}
    .plan-card.popular{border-color:var(--pc)50;
      box-shadow:0 0 0 1px var(--pc)30,0 20px 60px var(--pc)18,
        inset 0 1px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.8)"};}

    /* Glass specular layers */
    .plan-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.6)"} 0%,transparent 50%);
      pointer-events:none;z-index:0;}
    .plan-card::after{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,${dark?"0.03":"0.15"}) 50%,transparent 65%);
      background-size:200% 100%;animation:shimmer 5s ease-in-out infinite;pointer-events:none;z-index:0;}
    .plan-card > *{position:relative;z-index:1;}

    .plan-glow{position:absolute;width:200px;height:200px;border-radius:50%;top:-80px;right:-60px;
      filter:blur(60px);opacity:${dark?"0.4":"0.2"};pointer-events:none;background:var(--pc);}

    .plan-badge{position:absolute;top:20px;right:20px;padding:5px 14px;border-radius:99px;
      font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;
      background:var(--pc);color:#000;z-index:2;}
    .current-indicator{position:absolute;top:20px;left:20px;padding:4px 12px;border-radius:99px;
      font-size:10px;font-weight:800;letter-spacing:0.06em;
      background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub};z-index:2;}

    .plan-emoji{font-size:40px;margin-bottom:16px;display:block;}
    .plan-name{font-family:${FONT.display};font-size:24px;font-weight:800;margin-bottom:5px;}
    .plan-tagline{font-size:13px;color:${T.textSub};margin-bottom:24px;}

    .plan-price{margin-bottom:24px;}
    .price-amount{font-family:${FONT.display};font-size:48px;font-weight:800;
      letter-spacing:-0.03em;line-height:1;}
    .price-sym{font-size:22px;font-weight:600;color:${T.textSub};vertical-align:top;
      margin-top:10px;display:inline-block;}
    .price-period{font-size:13px;color:${T.textMuted};margin-top:6px;}
    .price-saving{font-size:12px;color:${T.green};font-weight:700;margin-top:4px;}

    .features-list{list-style:none;margin-bottom:28px;flex:1;}
    .feature-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;
      font-size:13px;border-bottom:1px solid ${T.glassBorder};}
    .feature-item:last-child{border-bottom:none;}
    .feature-check{width:20px;height:20px;border-radius:6px;display:flex;align-items:center;
      justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px;font-weight:800;}
    .feature-check.yes{background:var(--pc)20;color:var(--pc);}
    .feature-check.no{background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"};color:${T.textMuted};}
    .feature-text{color:${T.textSub};line-height:1.4;}
    .feature-text.no{color:${T.textMuted};text-decoration:line-through;opacity:0.5;}

    .plan-cta{width:100%;padding:15px;border-radius:16px;font-size:14px;font-weight:800;
      font-family:${FONT.body};cursor:pointer;transition:all 0.3s;letter-spacing:0.04em;border:none;}
    .plan-cta.current{background:${T.glass};border:1px solid ${T.glassBorder};
      color:${T.textSub};cursor:default;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .plan-cta.upgrade{background:linear-gradient(135deg,var(--pc),var(--pc)cc);color:#000;
      box-shadow:0 8px 28px var(--pc)40,inset 0 1px 0 rgba(255,255,255,0.25);}
    .plan-cta.upgrade:hover{transform:translateY(-3px);box-shadow:0 16px 40px var(--pc)50;}
    .plan-cta.loading{opacity:0.7;cursor:wait;}

    /* Trust badges */
    .trust-row{display:flex;justify-content:center;gap:28px;flex-wrap:wrap;
      margin-bottom:40px;animation:fadeUp 0.6s ease 0.15s both;}
    .trust-badge{display:flex;align-items:center;gap:8px;font-size:13px;
      color:${T.textSub};font-weight:600;}

    /* FAQ */
    .faq-section{max-width:700px;margin:0 auto 40px;animation:fadeUp 0.6s ease 0.2s both;}
    .faq-title{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};
      text-align:center;margin-bottom:24px;letter-spacing:-0.01em;}
    .faq-item{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:10px;backdrop-filter:blur(28px);overflow:hidden;transition:all 0.3s;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.8)"};}
    .faq-item:hover{border-color:${T.glassBorderHover};}
    .faq-q{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;
      cursor:pointer;font-size:14px;font-weight:700;color:${T.text};}
    .faq-chevron{font-size:11px;color:${T.textMuted};transition:transform 0.3s;flex-shrink:0;}
    .faq-chevron.open{transform:rotate(180deg);color:${T.accent};}
    .faq-a{padding:0 22px 18px;font-size:13px;color:${T.textSub};line-height:1.7;}

    /* Bottom CTA */
    .bottom-cta{background:linear-gradient(135deg,${T.accentSoft},${T.purpleSoft});
      border:1px solid ${T.accent}25;border-radius:24px;padding:32px 36px;
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;
      animation:fadeUp 0.6s ease 0.25s both;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .bottom-cta-title{font-family:${FONT.display};font-size:20px;font-weight:800;
      color:${T.text};margin-bottom:6px;}
    .bottom-cta-sub{font-size:13px;color:${T.textSub};max-width:480px;line-height:1.6;}
    .continue-btn{padding:13px 28px;border-radius:14px;border:1px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(20px);color:${T.text};
      font-size:14px;font-weight:700;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.8)"};}
    .continue-btn:hover{border-color:${T.accent}50;color:${T.accent};}

    /* Success overlay */
    .success-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;
      justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(16px);}
    .success-box{background:${dark?"#0b0f1a":"#fff"};border-radius:28px;padding:48px;
      text-align:center;max-width:420px;width:90%;
      animation:scaleIn 0.5s cubic-bezier(0.4,0,0.2,1) both;
      box-shadow:0 40px 100px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,${dark?"0.08":"0.9"});}
    .success-emoji{font-size:80px;margin-bottom:16px;display:block;}
    .success-title{font-family:${FONT.display};font-size:28px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .success-sub{font-size:15px;color:${T.textSub};margin-bottom:28px;line-height:1.65;}
    .success-btn{width:100%;padding:15px;border-radius:16px;border:none;font-size:14px;
      font-weight:800;font-family:${FONT.body};cursor:pointer;transition:all 0.25s;}

    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
    @media(max-width:1100px){.plans-grid{grid-template-columns:1fr;max-width:440px;margin:0 auto 40px;}}
    @media(max-width:768px){.sb{display:none;}.mn{padding:20px 16px;}.hero-title{font-size:30px;}.trust-row{gap:16px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="pr-root">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

        {/* Success Overlay */}
        {success && (
          <div className="success-overlay">
            <div className="success-box">
              <span className="success-emoji">{success.emoji}</span>
              <div className="success-title">Welcome to {success.name}! 🎉</div>
              <div className="success-sub">Your plan has been upgraded. All {success.name} features are now unlocked. Time to level up!</div>
              <button className="success-btn"
                style={{ background:`linear-gradient(135deg,${success.color},${success.color}cc)`,color:"#000" }}
                onClick={() => { setSuccess(null); navigate("/dashboard"); }}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo" onClick={() => navigate("/dashboard")}>AshFit<span>Verse</span></div>
          <div className="sb-sub">Premium Fitness OS</div>
          <div className="sb-user" onClick={() => navigate("/profile")}>
            <div className="sb-ava">{user.name?.[0]?.toUpperCase()||"A"}</div>
            <div>
              <div className="sb-name">{user.name||"Athlete"}</div>
              <div className="sb-goal">{user.goal?.replace(/_/g," ")||"Fitness"}</div>
            </div>
          </div>
          <div className="sb-nl">Navigation</div>
          {NAV_MAIN.map(n => (
            <div key={n.label} className="sb-ni" onClick={() => navigate(n.path)}
              style={n.color?{color:n.color}:{}}>
              <span className="sb-ico">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="sb-badge">{n.badge}</span>}
            </div>
          ))}
          <div className="sb-ni active">
            <span className="sb-ico">💎</span>
            <span>Pricing</span>
          </div>
          <div className="sb-nl">Tools</div>
          {TOOLS.map(t => (
            <div key={t.label} className="sb-tool" onClick={() => navigate(t.path)}>
              <span style={{fontSize:14,width:18,textAlign:"center"}}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
          <button className="sb-logout" onClick={() => navigate("/")} style={{marginTop:20}}>⎋ &nbsp;Logout</button>
        </aside>

        {/* MAIN */}
        <main className="mn">
          <div className="topbar">
            <div>
              <div className="topbar-title">Upgrade Your Plan 💎</div>
              <div className="topbar-sub">Choose the plan that matches your fitness ambition</div>
            </div>
            <div className="topbar-right">
              {(user.streak||0) > 0 && <div className="streak-pill">🔥 {user.streak}-day streak</div>}
              <button style={{width:42,height:42,borderRadius:13,border:`1px solid ${T.glassBorder}`,background:T.glass,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,cursor:"pointer",color:T.textSub}}>🔔</button>
              <button className="theme-toggle" onClick={toggleTheme}>
                <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
              </button>
              <div onClick={() => navigate("/profile")}
                style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",cursor:"pointer",border:`2px solid ${T.accent}40`}}>
                {user.name?.[0]?.toUpperCase()||"A"}
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="pricing-hero">
            <div className="hero-badge">💎 AshFitVerse Plans</div>
            <div className="hero-title">Train Smarter,<br/><span>Achieve More</span></div>
            <div className="hero-sub">Unlock advanced tools, AI features, and coach access. Start free, upgrade when you're ready.</div>
            <div className="billing-toggle">
              <button className={`bill-btn ${billing==="monthly"?"active":""}`} onClick={() => setBilling("monthly")}>Monthly</button>
              <button className={`bill-btn ${billing==="yearly"?"active":""}`} onClick={() => setBilling("yearly")} style={{position:"relative"}}>
                Yearly <span className="save-tag">SAVE 30%</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="plans-grid">
            {PLANS.map((plan, idx) => (
              <div key={plan.id}
                className={`plan-card ${plan.badge==="Popular"?"popular":""}`}
                style={{"--pc":plan.color,animationDelay:`${0.1+idx*0.08}s`}}>
                <div className="plan-glow"/>
                {plan.current && <div className="current-indicator">✓ Current</div>}
                {plan.badge && !plan.current && <div className="plan-badge">{plan.badge}</div>}
                <span className="plan-emoji">{plan.emoji}</span>
                <div className="plan-name" style={{color:plan.color}}>{plan.name}</div>
                <div className="plan-tagline">{plan.tagline}</div>
                <div className="plan-price">
                  {plan.price.monthly===0 ? (
                    <>
                      <div><span className="price-amount" style={{color:plan.color}}>₹0</span></div>
                      <div className="price-period">Free forever</div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="price-sym">₹</span>
                        <span className="price-amount" style={{color:plan.color}}>
                          {billing==="monthly" ? plan.price.monthly : Math.round(plan.price.yearly/12)}
                        </span>
                      </div>
                      <div className="price-period">per month{billing==="yearly"?", billed yearly":""}</div>
                      {billing==="yearly" && (
                        <div className="price-saving">🎉 Save {savingPct(plan)}% — ₹{plan.price.monthly*12-plan.price.yearly} off/year</div>
                      )}
                    </>
                  )}
                </div>
                <ul className="features-list">
                  {plan.features.map((f,i) => (
                    <li key={i} className="feature-item">
                      <span className={`feature-check ${f.included?"yes":"no"}`}>{f.included?"✓":"✕"}</span>
                      <span className={`feature-text ${f.included?"":"no"}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`plan-cta ${plan.current?"current":"upgrade"} ${selected===plan.id?"loading":""}`}
                  onClick={() => handleUpgrade(plan)}>
                  {selected===plan.id ? "Processing..." : plan.current ? "✓ "+plan.cta : plan.cta+" →"}
                </button>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="trust-row">
            {[
              {icon:"🔒",text:"Secure payments via Razorpay"},
              {icon:"🔄",text:"Cancel anytime, no questions"},
              {icon:"🎁",text:"7-day free trial on paid plans"},
              {icon:"💳",text:"UPI, Cards & Wallets accepted"},
              {icon:"📦",text:"Data safe on all plans"},
            ].map((b,i) => (
              <div key={i} className="trust-badge">
                <span style={{fontSize:18}}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="faq-title">Frequently Asked Questions</div>
            {FAQS.map((f,i) => (
              <div key={i} className="faq-item">
                <div className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                  <span>{f.q}</span>
                  <span className={`faq-chevron ${openFaq===i?"open":""}`}>▼</span>
                </div>
                {openFaq===i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bottom-cta">
            <div>
              <div className="bottom-cta-title">Still not sure? Start with Free 🌱</div>
              <div className="bottom-cta-sub">No credit card needed. Use the free plan as long as you want and upgrade only when you're ready.</div>
            </div>
            <button className="continue-btn" onClick={() => navigate("/dashboard")}>Continue with Free →</button>
          </div>
        </main>
      </div>
    </>
  );
}