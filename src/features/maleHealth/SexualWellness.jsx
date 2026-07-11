// src/features/maleHealth/SexualWellness.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const TABS = ["Overview", "Performance", "Nutrition", "Supplements", "Products", "Sexual Health"];

const PERFORMANCE_TIPS = [
  {
    title: "Cardiovascular Health = Sexual Health",
    icon: "❤️",
    color: "#f87171",
    content: "Erectile function depends entirely on blood flow. CV fitness directly predicts sexual performance. Men who exercise regularly have 30% lower rates of erectile dysfunction.",
    actions: ["150 min moderate cardio per week", "Zone 2 training for endothelial health", "Reduce sitting time — alternates blood flow", "Quit smoking — #1 cause of ED in young men"],
  },
  {
    title: "Testosterone Optimisation",
    icon: "⚡",
    color: "#fbbf24",
    content: "Testosterone drives libido, performance, confidence and recovery. Natural optimisation through lifestyle can raise levels by 20–40% without medication.",
    actions: ["Heavy compound lifts — squats, deadlifts, bench", "Sleep 7–9 hours — 70% of T is produced during sleep", "Reduce body fat to 10–15% range", "Eliminate chronic stress — cortisol directly suppresses T"],
  },
  {
    title: "Pelvic Floor Training",
    icon: "💪",
    color: "#4f8ef7",
    content: "Kegel exercises for men strengthen the bulbocavernosus and ischiocavernosus muscles — directly improving erection strength, ejaculatory control and orgasm intensity.",
    actions: [
      "Contract the muscle you use to stop urination",
      "Hold for 3–5 seconds, release fully",
      "Do 3 sets of 15 reps, twice daily",
      "Progress to flutter contractions and long holds",
      "Results visible in 4–6 weeks of consistent practice",
    ],
  },
  {
    title: "Stress & Performance Anxiety",
    icon: "🧠",
    color: "#a78bfa",
    content: "Performance anxiety is the #1 cause of situational erectile dysfunction in men under 40. It creates a fear-adrenaline-failure loop that has nothing to do with physical health.",
    actions: [
      "Mindfulness before intimacy — 5 min breathing",
      "Communicate openly with your partner",
      "Remove the pressure to 'perform' — focus on connection",
      "Therapy (CBT) is highly effective for performance anxiety",
      "Avoid pornography — it creates unrealistic expectations and desensitisation",
    ],
  },
];

const NUTRITION = [
  {
    food: "Dark Chocolate (85%+)",
    icon: "🍫",
    color: "#fb923c",
    benefit: "Increases nitric oxide production — improves blood flow and erection quality",
    dose: "1–2 squares daily",
  },
  {
    food: "Watermelon",
    icon: "🍉",
    color: "#f472b6",
    benefit: "Contains L-citrulline which converts to L-arginine — natural vasodilator similar to Viagra mechanism",
    dose: "2 cups daily",
  },
  {
    food: "Oysters",
    icon: "🦪",
    color: "#4f8ef7",
    benefit: "Highest zinc content of any food. Zinc is essential for testosterone production and sperm health",
    dose: "6 oysters weekly or zinc supplement",
  },
  {
    food: "Pomegranate",
    icon: "🟣",
    color: "#a78bfa",
    benefit: "Rich in antioxidants that protect nitric oxide from breakdown. Studies show improved erectile function",
    dose: "1 cup juice or seeds daily",
  },
  {
    food: "Spinach & Leafy Greens",
    icon: "🥬",
    color: "#34d399",
    benefit: "High in folate and nitrates. Folic acid deficiency is linked to erectile dysfunction",
    dose: "2+ cups daily",
  },
  {
    food: "Fatty Fish (Salmon, Mackerel)",
    icon: "🐟",
    color: "#38bdf8",
    benefit: "Omega-3 improves blood flow, reduces inflammation and supports testosterone production",
    dose: "3x weekly minimum",
  },
  {
    food: "Walnuts",
    icon: "🌰",
    color: "#fbbf24",
    benefit: "Arginine, omega-3 and antioxidants improve blood vessel function and sperm quality",
    dose: "Handful (30g) daily",
  },
  {
    food: "Eggs",
    icon: "🥚",
    color: "#fb923c",
    benefit: "Provide cholesterol (testosterone precursor), vitamin D, B vitamins and zinc",
    dose: "2–4 whole eggs daily",
  },
];

const SUPPLEMENTS = [
  {
    name: "L-Citrulline",
    dose: "3–6g daily",
    color: "#f472b6",
    evidence: "⭐⭐⭐⭐",
    benefit: "Converts to L-arginine which boosts nitric oxide. Clinical trials show improvement in mild-moderate ED. Safer and better absorbed than L-arginine directly.",
    timing: "Pre-intimacy or split with meals",
    safe: true,
  },
  {
    name: "Tongkat Ali (Eurycoma Longifolia)",
    dose: "200–400mg extract daily",
    color: "#fbbf24",
    evidence: "⭐⭐⭐⭐",
    benefit: "Reduces SHBG (freeing testosterone), improves sperm quality, libido and reduces cortisol. Multiple human trials.",
    timing: "Morning with food",
    safe: true,
  },
  {
    name: "Ashwagandha (KSM-66)",
    dose: "600mg daily",
    color: "#a78bfa",
    evidence: "⭐⭐⭐⭐⭐",
    benefit: "Reduces cortisol by 30%, increases testosterone by 17%, improves sexual function and sperm count. Most researched adaptogen for male health.",
    timing: "Evening or split AM/PM",
    safe: true,
  },
  {
    name: "Zinc + Magnesium (ZMA)",
    dose: "Zinc 30mg + Magnesium 450mg",
    color: "#34d399",
    evidence: "⭐⭐⭐⭐",
    benefit: "Zinc is essential for testosterone synthesis. Magnesium improves sleep quality. ZMA before bed boosts T and recovery.",
    timing: "Before bed on empty stomach",
    safe: true,
  },
  {
    name: "Maca Root",
    dose: "1.5–3g daily",
    color: "#fb923c",
    evidence: "⭐⭐⭐",
    benefit: "Peruvian root that improves libido, sexual desire and energy without directly raising testosterone. Works through different pathway.",
    timing: "With meals",
    safe: true,
  },
  {
    name: "Fadogia Agrestis",
    dose: "600mg daily",
    color: "#f87171",
    evidence: "⭐⭐ (Limited human data)",
    benefit: "Shown to raise LH and testosterone in animal studies. Gaining popularity but limited human clinical data. Cycle 8 weeks on, 4 weeks off.",
    timing: "Morning",
    safe: false,
    caution: "Limited human safety data. Consult doctor before use.",
  },
  {
    name: "Vitamin D3",
    dose: "3000–5000 IU daily",
    color: "#4f8ef7",
    evidence: "⭐⭐⭐⭐⭐",
    benefit: "Men deficient in Vitamin D have significantly lower testosterone. Supplementing to optimal levels (60–80 ng/mL) consistently raises T.",
    timing: "With fatty meal",
    safe: true,
  },
  {
    name: "Boron",
    dose: "6–10mg daily",
    color: "#38bdf8",
    evidence: "⭐⭐⭐",
    benefit: "Reduces SHBG (binding protein that inactivates testosterone). Studies show 28% increase in free testosterone in one week.",
    timing: "With meals",
    safe: true,
  },
];

const PRODUCTS = [
  { id: 1,  name: "Water-Based Lubricant",           brand: "Durex",          price: "₹349",  color: "#4f8ef7", badge: "Condom-Safe",   tags: ["Lubricant", "pH-Safe"],         desc: "pH-balanced, glycerin-free lubricant. Compatible with all condoms and toys.",              href: "#" },
  { id: 2,  name: "Durex Ultra Thin Condoms (10)",   brand: "Durex",          price: "₹299",  color: "#34d399", badge: "Best Seller",   tags: ["Condom", "Ultra Thin", "STI"],  desc: "0.06mm ultra-thin for maximum sensation. Electronically tested. WHO-approved.",           href: "#" },
  { id: 3,  name: "Skore Dotted Condoms (10)",       brand: "Skore",          price: "₹199",  color: "#fbbf24", badge: null,            tags: ["Textured", "Dotted"],           desc: "Dotted texture for enhanced pleasure. Lubricated with reservoir tip.",                    href: "#" },
  { id: 4,  name: "Delay Spray (Lidocaine)",         brand: "Manforce",       price: "₹449",  color: "#a78bfa", badge: "Popular",       tags: ["PE", "Delay", "Topical"],       desc: "Lidocaine-based spray to desensitise and delay ejaculation. Apply 15 min before.",        href: "#" },
  { id: 5,  name: "Cock Ring (Vibrating)",           brand: "MyMuse",         price: "₹1,299",color: "#fb923c", badge: "Couples",       tags: ["Toy", "Vibrating", "Couples"],  desc: "Stretchy silicone ring with mini vibrator. Maintains erection and stimulates partner.",    href: "#" },
  { id: 6,  name: "Penis Pump (Manual)",             brand: "Bathmate",       price: "₹2,499",color: "#f87171", badge: "Medical Grade", tags: ["ED", "Pump", "Medical"],        desc: "Clinically recommended for mild ED. Creates vacuum to improve blood flow and girth.",       href: "#" },
  { id: 7,  name: "Male Masturbator (Pocket)",       brand: "Tenga",          price: "₹999",  color: "#38bdf8", badge: "Discreet",      tags: ["Solo", "Masturbator"],          desc: "Japanese-engineered internal texture. Disposable, hygienic, discreet packaging.",         href: "#" },
  { id: 8,  name: "Prostate Massager",               brand: "Lelo",           price: "₹4,999",color: "#a78bfa", badge: "Premium",       tags: ["Prostate", "P-spot", "Health"], desc: "Body-safe silicone prostate massager. Prostate massage supports prostate health.",         href: "#" },
  { id: 9,  name: "L-Citrulline 3000mg",            brand: "Bulk Supplements",price:"₹1,299",color: "#f472b6", badge: null,            tags: ["Supplement", "ED", "Blood Flow"],desc: "Pure L-Citrulline powder — no fillers. Natural vasodilator for improved performance.",    href: "#" },
  { id: 10, name: "Tongkat Ali 400mg Extract",      brand: "Momentous",       price: "₹2,499",color: "#fbbf24", badge: "Top Rated",    tags: ["Testosterone", "Libido"],       desc: "100:1 standardised extract. LJ100 — the most researched and effective form.",             href: "#" },
  { id: 11, name: "Ashwagandha KSM-66 600mg",       brand: "Himalaya",        price: "₹549",  color: "#34d399", badge: "Clinical",     tags: ["Testosterone", "Cortisol"],     desc: "KSM-66 — the only ashwagandha extract with 22+ clinical trials behind it.",              href: "#" },
  { id: 12, name: "ZMA (Zinc+Mg+B6)",               brand: "Optimum Nutrition",price:"₹1,199",color: "#4f8ef7", badge: null,           tags: ["Zinc", "Magnesium", "Sleep"],   desc: "Classic ZMA formula. Zinc 30mg + Magnesium 450mg + B6. Take before bed.",               href: "#" },
];

const SEXUAL_HEALTH = [
  {
    topic: "STI Prevention & Testing",
    icon: "🛡️",
    color: "#4f8ef7",
    content: "Regular STI testing is part of being a responsible, sexually active adult — not something to be ashamed of.",
    points: [
      "Use condoms consistently with new or multiple partners",
      "Get tested every 3–6 months if sexually active with multiple partners",
      "Common STIs: HIV, gonorrhoea, chlamydia, syphilis, herpes, HPV",
      "Many STIs have no symptoms — the only way to know is testing",
      "HIV PrEP: highly effective daily pill for HIV prevention — available in India",
      "HIV PEP: emergency treatment within 72 hours of potential exposure — see a doctor immediately",
    ],
  },
  {
    topic: "Erectile Dysfunction (ED)",
    icon: "❤️",
    color: "#f87171",
    content: "ED affects 1 in 10 men of all ages. It is not a permanent condition and is highly treatable.",
    points: [
      "Causes: vascular (most common), hormonal, psychological, medication side effects",
      "Under 40: usually psychological or lifestyle-related (smoking, alcohol, sedentary lifestyle)",
      "First steps: improve sleep, exercise, quit smoking, reduce alcohol, address stress",
      "Medical options: PDE5 inhibitors (Sildenafil/Tadalafil) — highly effective, safe, prescription required",
      "Natural: L-Citrulline, Tongkat Ali, pelvic floor exercises",
      "See a doctor if lifestyle changes don't help after 3 months",
    ],
  },
  {
    topic: "Premature Ejaculation (PE)",
    icon: "⏱️",
    color: "#a78bfa",
    content: "PE affects up to 30% of men at some point. It is the most common male sexual dysfunction and is very treatable.",
    points: [
      "Definition: ejaculation within 1–2 minutes consistently, causing distress",
      "Causes: anxiety, hypersensitivity, early conditioning, relationship stress",
      "Stop-start technique: pause stimulation when near climax, resume when calm",
      "Squeeze technique: squeeze below glans for 30 seconds to reduce arousal",
      "Pelvic floor exercises improve ejaculatory control significantly",
      "Delay sprays (lidocaine/prilocaine): reduce sensitivity — very effective short-term",
      "SSRIs (prescription): Dapoxetine specifically for PE — highly effective",
    ],
  },
  {
    topic: "Sperm Health & Fertility",
    icon: "🌱",
    color: "#34d399",
    content: "Male factor infertility contributes to 50% of all fertility issues. Sperm quality is heavily influenced by lifestyle.",
    points: [
      "Avoid heat exposure to testicles — no laptops on lap, avoid hot tubs regularly",
      "Quit smoking — reduces sperm count, motility and morphology significantly",
      "Limit alcohol — more than 14 units/week reduces sperm quality",
      "Zinc, folate and CoQ10 are most evidence-based supplements for sperm quality",
      "Reduce phone radiation exposure to pockets — use hands-free where possible",
      "Sperm takes 74 days to mature — lifestyle changes take 3 months to show effect",
    ],
  },
];

function StarRow({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 11, color: i <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </div>
  );
}

export default function SexualWellness() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { isMale,loading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSupp, setExpandedSupp] = useState(null);
  const [expandedHealth, setExpandedHealth] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (!loading && !isMale) navigate("/dashboard");
}, [loading, isMale]);

  const toggleWishlist = (id) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const css = generateCSS(T, dark) + `
    .sw-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .sw-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.red};border-color:${T.red}40;}
    .sw-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .sw-logo span{color:${T.red};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.red},${T.orange});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .sw-content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .sw-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .sw-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    /* Adult disclaimer */
    .adult-box{padding:16px 20px;border-radius:16px;background:${T.orangeSoft};
      border:1px solid ${T.orange}30;font-size:12px;color:${T.textSub};
      line-height:1.65;margin-bottom:24px;}
    .adult-box strong{color:${T.orange};}

    /* Tabs */
    .tab-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;overflow-x:auto;}
    .tab-btn{padding:10px 20px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(20px);font-size:13px;font-weight:700;
      color:${T.textSub};cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .tab-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .tab-btn.active{background:linear-gradient(135deg,${T.red}cc,${T.orange});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px rgba(248,113,113,0.3);}

    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Performance */
    .perf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
    .perf-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .perf-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--pc)06,transparent 55%);pointer-events:none;}
    .perf-card:hover{transform:translateY(-3px);border-color:var(--pc);}
    .perf-ico{font-size:26px;margin-bottom:10px;}
    .perf-title{font-family:${FONT.display};font-size:16px;font-weight:800;margin-bottom:8px;}
    .perf-content{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:14px;}
    .perf-action{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:12px;color:${T.textSub};}
    .perf-action:last-child{border-bottom:none;}

    /* Nutrition */
    .nutr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
    .nutr-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .nutr-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    .nutr-ico{font-size:28px;margin-bottom:10px;}
    .nutr-food{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};margin-bottom:5px;}
    .nutr-benefit{font-size:12px;color:${T.textSub};line-height:1.55;margin-bottom:10px;}
    .nutr-dose{font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;}

    /* Supplements */
    .supp-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:10px;overflow:hidden;cursor:pointer;transition:all 0.3s;}
    .supp-header{padding:18px 22px;display:flex;align-items:center;justify-content:space-between;}
    .supp-left{display:flex;align-items:center;gap:14px;}
    .supp-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
    .supp-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .supp-dose{font-size:12px;color:${T.textSub};margin-top:2px;}
    .supp-body{padding:0 22px 18px;}
    .supp-benefit{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:8px;}
    .supp-ev{font-size:12px;color:${T.textMuted};margin-bottom:6px;}
    .supp-timing{font-size:12px;font-weight:700;color:${T.accent};}
    .supp-caution{padding:10px 13px;border-radius:10px;font-size:12px;color:${T.orange};
      background:${T.orangeSoft};border:1px solid ${T.orange}25;margin-top:10px;}

    /* Products */
    .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;}
    .prod-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;backdrop-filter:blur(28px);transition:all 0.3s;display:flex;flex-direction:column;}
    .prod-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};
      box-shadow:0 20px 50px rgba(0,0,0,${dark?"0.3":"0.09"});}
    .prod-badge{display:inline-block;padding:4px 10px;border-radius:99px;font-size:10px;
      font-weight:800;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em;}
    .prod-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px;}
    .prod-tag{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;}
    .prod-name{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .prod-brand{font-size:11px;color:${T.textMuted};margin-bottom:7px;}
    .prod-desc{font-size:12px;color:${T.textSub};line-height:1.55;margin-bottom:10px;flex:1;}
    .prod-price{font-family:${FONT.display};font-size:20px;font-weight:800;margin-bottom:10px;}
    .prod-btns{display:flex;gap:8px;}
    .prod-wish{width:38px;height:38px;border-radius:11px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;display:flex;align-items:center;justify-content:center;
      font-size:16px;transition:all 0.22s;}
    .prod-wish:hover{transform:scale(1.1);}
    .prod-buy{flex:1;height:38px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.red}cc,${T.orange});
      color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:${FONT.body};
      transition:all 0.25s;letter-spacing:0.04em;}
    .prod-buy:hover{filter:brightness(1.1);transform:translateY(-1px);}

    /* Sexual health */
    .sh-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      margin-bottom:12px;overflow:hidden;cursor:pointer;transition:all 0.3s;}
    .sh-header{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;}
    .sh-left{display:flex;align-items:center;gap:14px;}
    .sh-ico{font-size:24px;flex-shrink:0;}
    .sh-topic{font-family:${FONT.display};font-size:17px;font-weight:800;color:${T.text};}
    .sh-body{padding:0 24px 20px;}
    .sh-content{font-size:13px;color:${T.textSub};line-height:1.65;margin-bottom:14px;}
    .sh-point{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.45;}
    .sh-point:last-child{border-bottom:none;}

    .discreet-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;
      border-radius:12px;background:${T.accentSoft};border:1px solid ${T.accent}30;
      font-size:12px;font-weight:700;color:${T.accent};margin-bottom:24px;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.perf-grid,.nutr-grid{grid-template-columns:1fr 1fr;}}
    @media(max-width:600px){.sw-content{padding:20px 16px;}.sw-header{padding:18px 20px;}.nutr-grid{grid-template-columns:1fr 1fr;}.prod-grid{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sw-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(248,113,113,0.07) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(251,146,60,0.05) 0%,transparent 65%)" }} />

        <div className="sw-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/male-health")}>← Men's Health</button>
            <div className="sw-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="sw-content">
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="sw-title">❤️ Sexual Wellness</div>
            <div className="sw-sub">
              Complete, honest information on sexual health, performance, nutrition and products.
              No judgement, no filters — just evidence-based knowledge and quality products.
            </div>
          </div>

          <div className="adult-box" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            <strong>🔒 18+ Content:</strong> This section contains adult health information and product recommendations for sexually active adults.
            All medical information is for educational purposes — consult a healthcare provider for personalised advice.
            Product orders ship in discreet, unmarked packaging.
          </div>

          <div className="discreet-badge" style={{ animation: "fadeUp 0.6s ease 0.08s both" }}>
            📦 All products ship discreetly · No product names on packaging · 100% confidential
          </div>

          {/* Tabs */}
          <div className="tab-row" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`}
                onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          <div style={{ animation: "fadeUp 0.5s ease both" }}>

            {/* OVERVIEW */}
            {activeTab === 0 && (
              <div className="g-card">
                <div className="g-title">Sexual Health is Men's Health</div>
                <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 16 }}>
                  Sexual health is not separate from your overall health — it is a direct reflection of it.
                  Erectile function, libido, sexual confidence and stamina are all downstream effects of cardiovascular health,
                  hormone levels, mental health, sleep and nutrition.
                </p>
                <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 16 }}>
                  This section covers everything openly and factually — from performance optimisation and nutrition to products,
                  sexual health conditions and prevention. No topic is off-limits.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 20 }}>
                  {[
                    { icon: "💪", title: "Performance", desc: "Erectile health, stamina, ejaculatory control" },
                    { icon: "🥗", title: "Nutrition", desc: "Foods that support blood flow and testosterone" },
                    { icon: "💊", title: "Supplements", desc: "Evidence-based supplements for male sexual health" },
                    { icon: "🛍️", title: "Products", desc: "Condoms, lubricants, toys and performance aids" },
                    { icon: "🛡️", title: "STI Prevention", desc: "Testing, condom use, PrEP and PEP" },
                    { icon: "❤️", title: "Common Issues", desc: "ED, PE, low libido — causes and solutions" },
                  ].map((c, i) => (
                    <div key={i} style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 18, transition: "all 0.25s", cursor: "default" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PERFORMANCE */}
            {activeTab === 1 && (
              <>
                <div className="perf-grid">
                  {PERFORMANCE_TIPS.map((p, i) => (
                    <div key={i} className="perf-card" style={{ "--pc": p.color }}>
                      <div className="perf-ico">{p.icon}</div>
                      <div className="perf-title" style={{ color: p.color }}>{p.title}</div>
                      <div className="perf-content">{p.content}</div>
                      {p.actions.map((a, j) => (
                        <div key={j} className="perf-action">
                          <span style={{ color: p.color, flexShrink: 0 }}>→</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* NUTRITION */}
            {activeTab === 2 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <div className="g-title">Foods That Support Sexual Health</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Specific nutrients directly impact nitric oxide production, blood flow, testosterone and sperm health.
                    These foods have genuine clinical evidence behind their sexual health benefits.
                  </p>
                </div>
                <div className="nutr-grid">
                  {NUTRITION.map((n, i) => (
                    <div key={i} className="nutr-card">
                      <div className="nutr-ico">{n.icon}</div>
                      <div className="nutr-food">{n.food}</div>
                      <div className="nutr-benefit">{n.benefit}</div>
                      <span className="nutr-dose" style={{ background: `${n.color}16`, color: n.color, border: `1px solid ${n.color}28` }}>
                        {n.dose}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* SUPPLEMENTS */}
            {activeTab === 3 && (
              <>
                <div className="g-card" style={{ marginBottom: 16 }}>
                  <div className="g-title">Evidence-Based Supplements for Male Sexual Health</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Ranked by strength of evidence. Start with the top 3 for best results.
                    Always check for interactions if on prescription medication.
                  </p>
                </div>
                {SUPPLEMENTS.map((s, i) => (
                  <div key={i} className="supp-card"
                    style={expandedSupp === i ? { borderColor: s.color } : {}}
                    onClick={() => setExpandedSupp(expandedSupp === i ? null : i)}>
                    <div className="supp-header">
                      <div className="supp-left">
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
                        <div className="supp-ev">{s.evidence} Evidence</div>
                        <div className="supp-timing">⏰ {s.timing}</div>
                        {!s.safe && <div className="supp-caution">⚠️ {s.caution}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* PRODUCTS */}
            {activeTab === 4 && (
              <>
                <div className="g-card" style={{ marginBottom: 20 }}>
                  <div className="g-title">Sexual Wellness Products</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Quality products for sexual health, pleasure and performance. All ship in plain, unmarked packaging.
                    Products are curated for safety and quality — body-safe materials only.
                  </p>
                </div>
                <div className="prod-grid">
                  {PRODUCTS.map((p, i) => (
                    <div key={p.id} className="prod-card">
                      {p.badge && (
                        <div className="prod-badge" style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}28` }}>
                          {p.badge}
                        </div>
                      )}
                      <div className="prod-tags">
                        {p.tags.map((t, j) => (
                          <span key={j} className="prod-tag" style={{ background: `${p.color}14`, color: p.color, border: `1px solid ${p.color}25` }}>{t}</span>
                        ))}
                      </div>
                      <div className="prod-name">{p.name}</div>
                      <div className="prod-brand">{p.brand}</div>
                      <div className="prod-desc">{p.desc}</div>
                      <div className="prod-price" style={{ color: p.color }}>{p.price}</div>
                      <div className="prod-btns">
                        <button className="prod-wish" onClick={() => toggleWishlist(p.id)}>
                          {wishlist.includes(p.id) ? "❤️" : "🤍"}
                        </button>
                        <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                          <button className="prod-buy">Buy Discreetly ↗</button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 13, background: T.glass, border: `1px solid ${T.glassBorder}`, fontSize: 11, color: T.textMuted, textAlign: "center", lineHeight: 1.65 }}>
                  🔒 All orders ship in plain packaging · No product names or brand logos visible · Affiliate disclosure: AshFitVerse earns commission at no extra cost to you
                </div>
              </>
            )}

            {/* SEXUAL HEALTH */}
            {activeTab === 5 && (
              <>
                <div className="g-card" style={{ marginBottom: 16 }}>
                  <div className="g-title">Sexual Health Information</div>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
                    Honest, evidence-based information on common sexual health concerns. Click each topic to expand.
                  </p>
                </div>
                {SEXUAL_HEALTH.map((s, i) => (
                  <div key={i} className="sh-card"
                    style={expandedHealth === i ? { borderColor: s.color } : {}}
                    onClick={() => setExpandedHealth(expandedHealth === i ? null : i)}>
                    <div className="sh-header">
                      <div className="sh-left">
                        <span className="sh-ico">{s.icon}</span>
                        <div className="sh-topic" style={expandedHealth === i ? { color: s.color } : {}}>{s.topic}</div>
                      </div>
                      <span style={{ color: T.textMuted, fontSize: 16, transition: "transform 0.3s", transform: expandedHealth === i ? "rotate(180deg)" : "none" }}>▼</span>
                    </div>
                    {expandedHealth === i && (
                      <div className="sh-body">
                        <div className="sh-content">{s.content}</div>
                        {s.points.map((p, j) => (
                          <div key={j} className="sh-point">
                            <span style={{ color: s.color, flexShrink: 0 }}>•</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}