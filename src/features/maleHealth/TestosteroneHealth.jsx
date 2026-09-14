// src/features/maleHealth/TestosteroneHealth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const TABS = ["Overview", "Lifestyle", "Nutrition", "Training", "Supplements", "Shop"];

const T_KILLERS = [
  { ico: "😴", label: "Sleep < 6h",         impact: "−15% testosterone per night below 6h" },
  { ico: "😰", label: "Chronic stress",      impact: "Cortisol directly suppresses testosterone production" },
  { ico: "🍺", label: "Alcohol",             impact: "Even moderate drinking reduces T by 6.8% within hours" },
  { ico: "🏪", label: "Ultra-processed food",impact: "Trans fats and seed oils disrupt Leydig cell function" },
  { ico: "📱", label: "Sedentary lifestyle",  impact: "Muscle mass decline reduces testosterone signalling" },
  { ico: "⚖️", label: "Excess body fat",     impact: "Aromatase in fat converts testosterone → oestrogen" },
  { ico: "🥤", label: "BPA / plastics",       impact: "Xenoestrogens in plastics disrupt hormonal signalling" },
  { ico: "😶", label: "Social isolation",     impact: "Low social stimulation reduces oxytocin and T" },
];

const LIFESTYLE = [
  {
    title: "Sleep 7–9 Hours",
    icon: "😴",
    color: "#a78bfa",
    priority: "Critical",
    detail: "Testosterone is primarily released during REM and deep sleep. Going from 8h to 5h sleep reduces T by ~15% — equivalent to ageing 10–15 years.",
    actions: [
      "Set a consistent wake time (±30 min every day including weekends)",
      "Keep bedroom at 18–19°C — optimal for deep sleep and T production",
      "No screens 60 min before bed — blue light suppresses melatonin",
      "Blackout curtains — even small light exposure disrupts sleep architecture",
      "Consider magnesium glycinate 400mg before bed — improves deep sleep",
    ],
  },
  {
    title: "Morning Sunlight",
    icon: "☀️",
    color: "#fbbf24",
    priority: "High",
    detail: "10–15 minutes of direct sunlight within 30 minutes of waking sets your circadian rhythm, boosts cortisol (good morning cortisol drives T production later), and increases Vitamin D.",
    actions: [
      "Walk outside within 30 minutes of waking — no sunglasses",
      "Even on cloudy days, outdoor light is 10–50x more powerful than indoor",
      "Aim for direct sun on skin for Vitamin D synthesis",
      "This one habit improves sleep, energy and testosterone simultaneously",
    ],
  },
  {
    title: "Cold Exposure",
    icon: "🚿",
    color: "#38bdf8",
    priority: "Moderate",
    detail: "Cold water exposure (1–5 minutes at end of shower, or cold immersion) has been shown to increase luteinising hormone (LH) — the signal that tells the testes to produce testosterone.",
    actions: [
      "End your shower with 1–3 minutes of cold water",
      "Progress to full cold showers over 2–3 weeks",
      "Cold immersion (10–15°C for 5–10 min) 2–3x per week for maximum effect",
      "Avoid cold exposure immediately after strength training — reduces anabolic signal",
    ],
  },
  {
    title: "Stress Management",
    icon: "🧘",
    color: "#34d399",
    priority: "Critical",
    detail: "Chronic cortisol is the enemy of testosterone. The body uses the same precursor hormone (pregnenolone) to make both — when cortisol demand is high, testosterone production is sacrificed.",
    actions: [
      "10–20 minutes daily mindfulness or meditation reduces cortisol by 20–30%",
      "Prioritise deep, meaningful social connection — oxytocin raises T",
      "Avoid overtraining — more is not better, recovery is where T is produced",
      "Spend time in nature — forest exposure reduces cortisol measurably",
    ],
  },
  {
    title: "Minimise Xenoestrogens",
    icon: "🚫",
    color: "#f472b6",
    priority: "Moderate",
    detail: "Environmental oestrogens from plastics, pesticides and personal care products can mimic oestrogen in the body and suppress testosterone.",
    actions: [
      "Use glass or stainless steel water bottles — not single-use plastic",
      "Avoid heating food in plastic containers",
      "Choose organic produce where possible to reduce pesticide load",
      "Use natural deodorant and personal care products — check EWG database",
    ],
  },
  {
    title: "Maintain Healthy Weight",
    icon: "⚖️",
    color: "#fb923c",
    priority: "High",
    detail: "Adipose (fat) tissue contains the enzyme aromatase, which converts testosterone into oestrogen. Every kg of excess fat increases this conversion, creating a downward spiral.",
    actions: [
      "Target 10–20% body fat for optimal testosterone levels",
      "Each 10% reduction in body fat can increase T by 10–15%",
      "Compound weight training is the most effective fat loss + T boost combination",
      "Avoid crash dieting — caloric restriction below 20% of TDEE suppresses T",
    ],
  },
];

const NUTRITION = {
  eat: [
    { ico: "🥩", label: "Red meat (grass-fed)", why: "Zinc, saturated fat, creatine — all T precursors" },
    { ico: "🥚", label: "Whole eggs", why: "Cholesterol is the direct precursor to all steroid hormones including T" },
    { ico: "🐟", label: "Fatty fish", why: "Omega-3 reduces SHBG — increases free testosterone" },
    { ico: "🥦", label: "Cruciferous vegetables", why: "DIM compound helps liver clear excess oestrogen" },
    { ico: "🧄", label: "Garlic", why: "Allicin reduces cortisol, allowing T to rise" },
    { ico: "🫐", label: "Berries", why: "Antioxidants protect Leydig cells from oxidative stress" },
    { ico: "🥑", label: "Avocado", why: "Monounsaturated fats and Vitamin E support steroidogenesis" },
    { ico: "🍯", label: "Raw honey", why: "Boron content — clinical doses raise free T in 1 week" },
    { ico: "🌰", label: "Brazil nuts (3–4/day)", why: "Selenium — essential cofactor for testosterone production" },
    { ico: "🫘", label: "Chickpeas / legumes", why: "Zinc + slow carbs for stable insulin (insulin resistance tanks T)" },
  ],
  avoid: [
    { ico: "🍺", label: "Alcohol", why: "Directly toxic to Leydig cells — reduces T production" },
    { ico: "🌽", label: "Soy in excess", why: "Phytoestrogens — genistein can bind oestrogen receptors" },
    { ico: "🍕", label: "Trans fats", why: "Seed oils impair Leydig cell membrane function" },
    { ico: "🧁", label: "Refined sugar", why: "Insulin spikes → insulin resistance → reduced testosterone" },
    { ico: "🥤", label: "Sugary drinks", why: "Liquid fructose is particularly harmful to hormonal health" },
    { ico: "🥛", label: "Excess conventional dairy", why: "Synthetic hormones in non-organic dairy" },
  ],
};

const TRAINING = [
  {
    type: "Heavy Compound Lifting",
    icon: "🏋️",
    color: "#fb923c",
    effect: "+20–25% acute testosterone spike",
    protocol: "3–5 sets, 4–8 reps, 70–85% 1RM",
    exercises: ["Barbell Back Squat", "Conventional Deadlift", "Bench Press", "Weighted Pull-ups", "Overhead Press"],
    why: "Multi-joint movements recruiting large muscle groups produce the strongest anabolic hormone response.",
    frequency: "3–4 days/week with full recovery between sessions",
  },
  {
    type: "Sprint Training",
    icon: "⚡",
    color: "#4f8ef7",
    effect: "+100–150% acute T spike",
    protocol: "6–8 × 30-second sprints, 2–3 min rest",
    exercises: ["Track sprints", "Bike sprints (Assault bike)", "Sled pushes", "Hill sprints"],
    why: "Short maximal sprints produce the highest acute testosterone response of any exercise modality.",
    frequency: "1–2 sessions per week — full recovery required",
  },
  {
    type: "Limit Endurance Cardio",
    icon: "⚠️",
    color: "#f87171",
    effect: "Chronic endurance → reduces T by 40%",
    protocol: "Keep sessions under 45 minutes",
    exercises: ["Zone 2 cardio (walking, cycling at conversational pace)", "Avoid marathon training if T is a priority"],
    why: "Chronic long-duration aerobic exercise significantly suppresses testosterone and raises cortisol chronically.",
    frequency: "Zone 2 max 3x/week. No marathon/ultra training.",
  },
];

const SUPPLEMENTS = [
  {
    name: "Ashwagandha KSM-66",
    dose: "600mg daily",
    benefit: "Reduces cortisol by 27%, increases testosterone by 14–17% in clinical trials. Improves sperm quality, muscle recovery and reduces anxiety.",
    evidence: "⭐⭐⭐⭐⭐ Strong clinical evidence (multiple RCTs)",
    color: "#fb923c",
    timing: "Morning with breakfast or before bed",
    note: null,
  },
  {
    name: "Zinc + Magnesium (ZMA)",
    dose: "Zinc 30mg + Magnesium 450mg + B6 10mg",
    benefit: "Zinc is essential for testosterone production — deficiency directly reduces T. ZMA formula improves sleep quality and testosterone simultaneously.",
    evidence: "⭐⭐⭐⭐ Strong evidence for deficiency correction",
    color: "#4f8ef7",
    timing: "30–60 min before bed on empty stomach",
    note: "Take away from calcium supplements which block zinc absorption",
  },
  {
    name: "Vitamin D3 + K2",
    dose: "3000–5000 IU D3 + 100mcg K2",
    benefit: "Men with sufficient Vitamin D have 25% higher testosterone than deficient men. Over 50% of people in India are deficient.",
    evidence: "⭐⭐⭐⭐⭐ Very strong evidence — T and D are directly correlated",
    color: "#fbbf24",
    timing: "With largest meal of the day (fat aids absorption)",
    note: null,
  },
  {
    name: "Tongkat Ali (Longjack) 200:1",
    dose: "200–400mg standardised extract daily",
    benefit: "Reduces SHBG (Sex Hormone Binding Globulin) — increases free testosterone. Improves libido, sperm quality and reduces stress hormone.",
    evidence: "⭐⭐⭐⭐ Good clinical evidence",
    color: "#34d399",
    timing: "Morning with food",
    note: "Use 5 days on, 2 days off to prevent tolerance",
  },
  {
    name: "Omega-3 Fish Oil",
    dose: "2–3g EPA+DHA daily",
    benefit: "Reduces SHBG, allowing more free testosterone. Anti-inflammatory — reduces oxidative stress on Leydig cells.",
    evidence: "⭐⭐⭐⭐ Good evidence for SHBG reduction",
    color: "#38bdf8",
    timing: "With meals (reduces fishy aftertaste)",
    note: null,
  },
  {
    name: "L-Citrulline",
    dose: "3–6g daily (or 8g citrulline malate)",
    benefit: "Increases nitric oxide production → improves blood flow, pump, and endurance. Reduces muscle soreness. Indirect support for performance.",
    evidence: "⭐⭐⭐⭐ Strong evidence for NO production",
    color: "#a78bfa",
    timing: "30–60 min pre-workout",
    note: null,
  },
  {
    name: "Boron",
    dose: "10mg daily",
    benefit: "Studies show 10mg boron for 7 days increases free testosterone by 28% and reduces oestrogen by 39% in men.",
    evidence: "⭐⭐⭐ Emerging strong evidence",
    color: "#f472b6",
    timing: "With meals",
    note: null,
  },
  {
    name: "Creatine Monohydrate",
    dose: "5g daily (no loading needed)",
    benefit: "Most studied supplement in sports science. Increases DHT (androgen activity), improves strength, muscle mass and cognitive function.",
    evidence: "⭐⭐⭐⭐⭐ Overwhelming evidence",
    color: "#fb923c",
    timing: "Any time — consistency matters more than timing",
    note: null,
  },
];

const SHOP_PRODUCTS = [
  { name: "Ashwagandha KSM-66 600mg",  brand: "Nootropics Depot", price: "₹2,499", color: "#fb923c", badge: "Best for T" },
  { name: "ZMA (Zinc+Mag+B6)",          brand: "HealthKart HK Vitals", price: "₹899",  color: "#4f8ef7", badge: null },
  { name: "Vitamin D3+K2 5000IU",       brand: "Now Foods",       price: "₹1,299", color: "#fbbf24", badge: "Top Rated" },
  { name: "Tongkat Ali 200:1 Extract",  brand: "Double Wood",     price: "₹3,499", color: "#34d399", badge: null },
  { name: "Omega-3 Triple Strength",    brand: "HealthKart",      price: "₹799",   color: "#38bdf8", badge: null },
  { name: "L-Citrulline Malate 2:1",   brand: "Bulk Supplements", price: "₹1,199", color: "#a78bfa", badge: null },
  { name: "Boron Glycinate 10mg",       brand: "Jarrow Formulas", price: "₹1,899", color: "#f472b6", badge: null },
  { name: "Creatine Monohydrate 500g",  brand: "Optimum Nutrition",price: "₹1,499", color: "#fb923c", badge: "#1 Overall" },
];

export default function TestosteroneHealth() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user } = useUser();
  const [mounted, setMounted]       = useState(false);
  const [activeTab, setActiveTab]   = useState(0);
  const [expandedSupp, setExpandedSupp] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const radarData = [
    { factor: "Sleep",     score: 65 },
    { factor: "Nutrition", score: 72 },
    { factor: "Training",  score: 80 },
    { factor: "Stress",    score: 55 },
    { factor: "Supps",     score: 48 },
    { factor: "Recovery",  score: 70 },
  ];

  const css = generateCSS(T, dark) + `
    .th-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .th-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.orange};border-color:${T.orange}40;}
    .th-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .th-logo span{color:${T.orange};}

    .th-content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .th-title{font-family:${FONT.display};font-size:34px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .th-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    .tab-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;overflow-x:auto;}
    .tab-btn{padding:10px 20px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};font-size:13px;font-weight:700;color:${T.textSub};
      cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .tab-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .tab-btn.active{background:linear-gradient(135deg,${T.orange},${T.accent});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.orangeGlow};}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Killer grid */
    .killer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
    .killer-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;
      padding:16px;transition:all 0.25s;}
    .killer-card:hover{transform:translateY(-2px);border-color:${T.glassBorderHover};}
    .killer-ico{font-size:24px;margin-bottom:8px;}
    .killer-lbl{font-size:13px;font-weight:700;color:${T.red};margin-bottom:4px;}
    .killer-impact{font-size:11px;color:${T.textSub};line-height:1.45;}

    /* Lifestyle cards */
    .ls-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);margin-bottom:14px;position:relative;overflow:hidden;}
    .ls-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--lc)06,transparent 55%);pointer-events:none;}
    .ls-header{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
    .ls-ico{font-size:28px;}
    .ls-title{font-family:${FONT.display};font-size:17px;font-weight:800;}
    .ls-priority{font-size:10px;font-weight:800;letter-spacing:0.12em;
      text-transform:uppercase;padding:3px 10px;border-radius:99px;border:1px solid;}
    .ls-detail{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:14px;}
    .ls-action{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.5;}
    .ls-action:last-child{border-bottom:none;}

    /* Nutrition */
    .nut-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    .nut-section{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);}
    .nut-header{font-family:${FONT.display};font-size:16px;font-weight:800;margin-bottom:16px;}
    .nut-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid ${T.glassBorder};}
    .nut-item:last-child{border-bottom:none;}
    .nut-ico{font-size:20px;flex-shrink:0;margin-top:2px;}
    .nut-lbl{font-size:13px;font-weight:700;color:${T.text};margin-bottom:2px;}
    .nut-why{font-size:12px;color:${T.textSub};line-height:1.45;}

    /* Training */
    .training-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
    .tr-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .tr-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--tc)06,transparent 55%);pointer-events:none;}
    .tr-card:hover{transform:translateY(-3px);border-color:var(--tc);}
    .tr-ico{font-size:28px;margin-bottom:10px;}
    .tr-type{font-family:${FONT.display};font-size:16px;font-weight:800;margin-bottom:4px;}
    .tr-effect{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;}
    .tr-protocol{font-size:12px;color:${T.textSub};margin-bottom:10px;
      padding:8px 12px;border-radius:10px;background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"};}
    .tr-why{font-size:13px;color:${T.textSub};line-height:1.55;margin-bottom:12px;}
    .tr-ex{display:flex;gap:8px;align-items:center;font-size:12px;color:${T.textSub};padding:5px 0;}
    .tr-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .tr-freq{font-size:11px;font-weight:700;margin-top:10px;padding:8px 12px;border-radius:10px;border:1px solid;}

    /* Supplement cards */
    .supp-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:12px;overflow:hidden;cursor:pointer;transition:all 0.3s;}
    .supp-header{padding:18px 22px;display:flex;align-items:center;justify-content:space-between;}
    .supp-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
    .supp-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .supp-dose{font-size:12px;color:${T.textSub};margin-top:2px;}
    .supp-body{padding:0 22px 18px;}
    .supp-benefit{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:8px;}
    .supp-evidence{font-size:12px;color:${T.textMuted};margin-bottom:6px;}
    .supp-timing{font-size:12px;font-weight:700;color:${T.orange};}
    .supp-note{padding:10px 13px;border-radius:10px;font-size:12px;color:${T.orange};
      background:${T.orangeSoft};border:1px solid ${T.orange}25;margin-top:10px;line-height:1.5;}

    /* Shop */
    .shop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
    .shop-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;transition:all 0.3s;}
    .shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};}
    .shop-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:800;margin-bottom:10px;}
    .shop-name{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .shop-brand{font-size:11px;color:${T.textMuted};margin-bottom:10px;}
    .shop-price{font-family:${FONT.display};font-size:20px;font-weight:800;margin-bottom:12px;}
    .shop-btn{width:100%;height:40px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.orange},${T.accent});
      color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:${FONT.body};
      transition:all 0.25s;letter-spacing:0.04em;}
    .shop-btn:hover{transform:translateY(-2px);filter:brightness(1.1);}

    .disclaimer{padding:16px 20px;border-radius:14px;background:${T.orangeSoft};
      border:1px solid ${T.orange}25;font-size:12px;color:${T.textSub};line-height:1.65;margin-bottom:24px;}
    .disclaimer strong{color:${T.orange};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:900px){.killer-grid{grid-template-columns:repeat(2,1fr);}.training-grid{grid-template-columns:1fr;}.nut-grid{grid-template-columns:1fr;}.shop-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.th-content{padding:20px 16px;}.th-header{padding:18px 20px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="th-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(251,146,60,0.08) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.05) 0%,transparent 65%)" }} />

        <div className="th-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/male-health")}>← Men's Health</button>
            <div className="th-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="th-content">
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="th-title">⚡ Testosterone Optimisation</div>
            <div className="th-sub">
              Natural, evidence-based strategies to maximise testosterone through lifestyle, nutrition, training and targeted supplementation.
              No steroids, no shortcuts — sustainable peak performance.
            </div>
          </div>

          <div className="disclaimer">
            <strong>⚕️ Note:</strong> This guide covers natural testosterone optimisation only. If you suspect clinically low testosterone (hypogonadism), consult an endocrinologist for proper testing (Total T, Free T, LH, FSH, SHBG).
          </div>

          <div className="tab-row" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          <div style={{ animation: "fadeUp 0.5s ease both" }}>

            {activeTab === 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div className="g-card">
                    <div className="g-title">The T Optimisation Wheel</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} />
                        <PolarAngleAxis dataKey="factor" tick={{ fill: T.textSub, fontSize: 11, fontWeight: 600 }} />
                        <Radar name="Score" dataKey="score" stroke={T.orange} fill={T.orange} fillOpacity={0.18} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="g-card">
                    <div className="g-title">Key Facts</div>
                    {[
                      { stat: "The body's T peaks at age 17–19, then declines ~1% per year after 30.", color: T.orange },
                      { stat: "Lifestyle factors can cause T to vary by 200–500 ng/dL — equivalent to 10–20 years of decline.", color: T.accent },
                      { stat: "Getting sufficient sleep alone can increase T by 15%. It's the single biggest lever.", color: T.green },
                      { stat: "Strength training, specifically compound movements, produces the strongest acute hormonal response.", color: T.purple },
                      { stat: "Chronic stress is one of the most underestimated testosterone killers — cortisol and T are inversely related.", color: T.pink },
                    ].map((f, i, a) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none" }}>
                        <div style={{ width: 6, borderRadius: 3, background: f.color, flexShrink: 0, alignSelf: "stretch" }} />
                        <span style={{ fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>{f.stat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="g-card">
                  <div className="g-title">8 Testosterone Killers</div>
                  <div className="killer-grid">
                    {T_KILLERS.map((k, i) => (
                      <div key={i} className="killer-card">
                        <div className="killer-ico">{k.ico}</div>
                        <div className="killer-lbl">{k.label}</div>
                        <div className="killer-impact">{k.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 1 && LIFESTYLE.map((l, i) => (
              <div key={i} className="ls-card" style={{ "--lc": l.color }}>
                <div className="ls-header">
                  <span className="ls-ico">{l.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="ls-title" style={{ color: l.color }}>{l.title}</div>
                  </div>
                  <div className="ls-priority" style={{ color: l.color, borderColor: `${l.color}35`, background: `${l.color}12` }}>
                    {l.priority}
                  </div>
                </div>
                <div className="ls-detail">{l.detail}</div>
                {l.actions.map((a, j) => (
                  <div key={j} className="ls-action">
                    <span style={{ fontSize: 16, flexShrink: 0 }}>✓</span>{a}
                  </div>
                ))}
              </div>
            ))}

            {activeTab === 2 && (
              <div className="nut-grid">
                <div className="nut-section">
                  <div className="nut-header" style={{ color: T.green }}>✅ Testosterone-Boosting Foods</div>
                  {NUTRITION.eat.map((f, i) => (
                    <div key={i} className="nut-item">
                      <span className="nut-ico">{f.ico}</span>
                      <div><div className="nut-lbl">{f.label}</div><div className="nut-why">{f.why}</div></div>
                    </div>
                  ))}
                </div>
                <div className="nut-section">
                  <div className="nut-header" style={{ color: T.red }}>❌ Avoid or Minimise</div>
                  {NUTRITION.avoid.map((f, i) => (
                    <div key={i} className="nut-item">
                      <span className="nut-ico">{f.ico}</span>
                      <div><div className="nut-lbl">{f.label}</div><div className="nut-why">{f.why}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Training is the most direct way to stimulate testosterone. But type, intensity and frequency matter enormously.
                    <strong style={{ color: T.orange }}> Heavy compound lifting + short sprints</strong> = the highest natural T stimulation protocol.
                  </p>
                </div>
                <div className="training-grid">
                  {TRAINING.map((t, i) => (
                    <div key={i} className="tr-card" style={{ "--tc": t.color }}>
                      <div className="tr-ico">{t.icon}</div>
                      <div className="tr-type" style={{ color: t.color }}>{t.type}</div>
                      <div className="tr-effect" style={{ color: t.color }}>{t.effect}</div>
                      <div className="tr-protocol">{t.protocol}</div>
                      <div className="tr-why">{t.why}</div>
                      {t.exercises.map((ex, j) => (
                        <div key={j} className="tr-ex">
                          <div className="tr-dot" style={{ background: t.color }} />{ex}
                        </div>
                      ))}
                      <div className="tr-freq" style={{ color: t.color, borderColor: `${t.color}30`, background: `${t.color}10` }}>
                        📅 {t.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 4 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Supplements are the smallest lever — lifestyle always comes first.
                    However, for men who've optimised the basics, these have genuine clinical evidence.
                    <strong style={{ color: T.orange }}> Start with Ashwagandha, ZMA and D3 — the highest-impact trio.</strong>
                  </p>
                </div>
                {SUPPLEMENTS.map((s, i) => (
                  <div key={i} className="supp-card"
                    style={expandedSupp === i ? { borderColor: s.color } : {}}
                    onClick={() => setExpandedSupp(expandedSupp === i ? null : i)}>
                    <div className="supp-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="supp-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
                        <div>
                          <div className="supp-name">{s.name}</div>
                          <div className="supp-dose">{s.dose}</div>
                        </div>
                      </div>
                      <span style={{ color: T.textMuted, fontSize: 14, transition: "transform 0.3s", transform: expandedSupp === i ? "rotate(180deg)" : "none" }}>▼</span>
                    </div>
                    {expandedSupp === i && (
                      <div className="supp-body">
                        <div className="supp-benefit">{s.benefit}</div>
                        <div className="supp-evidence">{s.evidence}</div>
                        <div className="supp-timing">⏰ {s.timing}</div>
                        {s.note && <div className="supp-note">⚠️ {s.note}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {activeTab === 5 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <div className="g-title">Men's Wellness Shop</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Curated testosterone and performance supplements with clinical backing, from trusted brands.
                  </p>
                </div>
                <div className="shop-grid">
                  {SHOP_PRODUCTS.map((p, i) => (
                    <div key={i} className="shop-card">
                      {p.badge && (
                        <div className="shop-badge" style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>{p.badge}</div>
                      )}
                      <div className="shop-name">{p.name}</div>
                      <div className="shop-brand">{p.brand}</div>
                      <div className="shop-price" style={{ color: p.color }}>{p.price}</div>
                      <button className="shop-btn">Buy Now ↗</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}