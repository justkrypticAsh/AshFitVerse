// src/features/femaleHealth/PCOSGuide.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const TABS = ["Overview","Diet","Workouts","Supplements","Contraception","Shop"];

const PCOS_SYMPTOMS = [
  {ico:"📅",label:"Irregular periods",desc:"Cycles longer than 35 days or fewer than 8 per year"},
  {ico:"🔬",label:"High androgens",desc:"Excess male hormones causing acne, facial hair, hair thinning"},
  {ico:"🫧",label:"Polycystic ovaries",desc:"12+ small follicles on ovaries visible on ultrasound"},
  {ico:"⚖️",label:"Weight gain",desc:"Especially around the abdomen — insulin resistance driven"},
  {ico:"🧠",label:"Mood changes",desc:"Depression, anxiety and brain fog are very common"},
  {ico:"😴",label:"Fatigue",desc:"Constant tiredness due to hormonal imbalance and poor sleep"},
];

const DIET_FOODS = {
  eat: [
    {ico:"🥦",label:"Cruciferous veg",sub:"Broccoli, cauliflower, kale — support oestrogen detox"},
    {ico:"🐟",label:"Fatty fish",sub:"Salmon, mackerel — omega-3 reduces inflammation and androgens"},
    {ico:"🫐",label:"Berries",sub:"Low GI, high antioxidants — blueberries, strawberries"},
    {ico:"🌾",label:"Whole grains",sub:"Quinoa, oats, brown rice — low GI to stabilise insulin"},
    {ico:"🥑",label:"Healthy fats",sub:"Avocado, olive oil, nuts — hormone building blocks"},
    {ico:"🥩",label:"Lean protein",sub:"Chicken, tofu, lentils — stabilise blood sugar all day"},
    {ico:"🌿",label:"Spearmint tea",sub:"Studies show 2 cups/day reduce androgen levels"},
    {ico:"🫘",label:"Legumes",sub:"Chickpeas, lentils — fibre + protein, low insulin response"},
  ],
  avoid: [
    {ico:"🍞",label:"Refined carbs",sub:"White bread, pasta, rice — spike insulin rapidly"},
    {ico:"🧁",label:"Added sugar",sub:"Candy, cakes, sugary drinks — directly drives insulin resistance"},
    {ico:"🥛",label:"Conventional dairy",sub:"May raise IGF-1 and androgens in some women with PCOS"},
    {ico:"🍺",label:"Alcohol",sub:"Disrupts liver's ability to clear excess oestrogen"},
    {ico:"🌽",label:"Processed soy",sub:"Phytoestrogens may worsen hormonal imbalance"},
    {ico:"🧂",label:"High sodium foods",sub:"Worsens bloating and blood pressure issues"},
  ],
};

const WORKOUTS = [
  {
    type:"Strength Training",icon:"🏋️",color:"#4f8ef7",
    why:"Improves insulin sensitivity, builds muscle which helps regulate glucose uptake",
    frequency:"3–4 days/week",
    exercises:["Squats 3×12","Deadlifts 3×10","Hip thrusts 4×15","Dumbbell press 3×12","Rows 3×12"],
    avoid:"Very high intensity — can spike cortisol and worsen PCOS",
  },
  {
    type:"Low-Intensity Cardio",icon:"🚶",color:"#34d399",
    why:"Reduces insulin resistance without spiking cortisol — key for PCOS management",
    frequency:"4–5 days/week",
    exercises:["30–45min brisk walking","Cycling (moderate pace)","Swimming","Elliptical at Zone 2 HR","Light hiking"],
    avoid:"Long-duration high intensity — can worsen cortisol imbalance",
  },
  {
    type:"Yoga & Pilates",icon:"🧘",color:"#a78bfa",
    why:"Reduces cortisol and stress hormones that drive androgen production",
    frequency:"2–3 days/week",
    exercises:["Yin yoga","Restorative yoga","Core-focused pilates","Breathing exercises (pranayama)","Meditation"],
    avoid:"Hot yoga if you have thyroid issues alongside PCOS",
  },
  {
    type:"HIIT (Modified)",icon:"⚡",color:"#fb923c",
    why:"Short bursts improve insulin sensitivity — but keep sessions short",
    frequency:"1–2 days/week MAX",
    exercises:["20min sessions only","Tabata (20s on/10s off)","Sprint intervals (6×30s)","Circuit training"],
    avoid:"Daily HIIT — overtraining spikes cortisol and worsens PCOS symptoms",
  },
];

const SUPPLEMENTS = [
  {
    name:"Inositol (Myo + D-Chiro 40:1)",
    dose:"4g Myo-Inositol + 100mg D-Chiro daily",
    benefit:"Improves insulin sensitivity, restores ovulation, reduces androgen levels. Most researched PCOS supplement.",
    evidence:"⭐⭐⭐⭐⭐ Strong clinical evidence",
    color:"#a78bfa",
    timing:"Split morning and evening with meals",
  },
  {
    name:"Magnesium Glycinate",
    dose:"300–400mg at night",
    benefit:"Improves insulin sensitivity, reduces cortisol, improves sleep quality and reduces anxiety in PCOS.",
    evidence:"⭐⭐⭐⭐ Good clinical evidence",
    color:"#4f8ef7",
    timing:"30–60 min before bed",
  },
  {
    name:"Spearmint Extract",
    dose:"900mg or 2 cups spearmint tea daily",
    benefit:"Anti-androgenic — reduces testosterone, improves hirsutism (facial hair) and acne.",
    evidence:"⭐⭐⭐ Moderate evidence",
    color:"#34d399",
    timing:"Morning and evening",
  },
  {
    name:"Vitamin D3 + K2",
    dose:"2000–4000 IU D3 + 100mcg K2",
    benefit:"Most women with PCOS are deficient. Improves insulin sensitivity, mood, and menstrual regularity.",
    evidence:"⭐⭐⭐⭐ Strong evidence",
    color:"#fbbf24",
    timing:"With a meal containing fat",
  },
  {
    name:"NAC (N-Acetyl Cysteine)",
    dose:"600mg 3x daily",
    benefit:"Powerful antioxidant. Improves insulin resistance, reduces testosterone, and may help restore ovulation.",
    evidence:"⭐⭐⭐⭐ Good clinical evidence",
    color:"#fb923c",
    timing:"With meals, away from breakfast",
  },
  {
    name:"Omega-3 Fish Oil",
    dose:"2–3g EPA+DHA daily",
    benefit:"Reduces inflammation, lowers triglycerides (often high in PCOS), may reduce androgen levels.",
    evidence:"⭐⭐⭐⭐ Good evidence",
    color:"#38bdf8",
    timing:"With meals",
  },
  {
    name:"Berberine",
    dose:"500mg 2–3x daily",
    benefit:"As effective as Metformin for insulin resistance in some studies. Lowers blood sugar, aids weight management.",
    evidence:"⭐⭐⭐⭐ Strong evidence",
    color:"#f472b6",
    timing:"Before meals",
    note:"Do not combine with Metformin without doctor approval",
  },
  {
    name:"Zinc",
    dose:"25–40mg daily",
    benefit:"Reduces acne, hair loss, and unwanted facial hair. Anti-androgenic effects.",
    evidence:"⭐⭐⭐ Moderate evidence",
    color:"#34d399",
    timing:"With food to avoid nausea",
  },
];

const CONTRACEPTION = [
  {
    name:"Combined Oral Contraceptive Pill (COCP)",
    examples:"Yasmin, Diane-35, Yaz, Drospirenone-based pills",
    pros:["Regulates periods","Reduces acne and hirsutism","Lowers androgen levels","Protects endometrium"],
    cons:["Does not treat underlying insulin resistance","May worsen mood in some","Not suitable if trying to conceive","Blood clot risk (low but real)"],
    pcos_benefit:"First-line treatment for period regulation and androgen symptoms in PCOS",
    color:"#f472b6",
  },
  {
    name:"Progestin-Only Pill (Mini Pill)",
    examples:"Cerazette, Noriday, Micronor",
    pros:["Suitable if oestrogen contraindicated","Can reduce heavy bleeding","Safer for smokers over 35"],
    cons:["May cause irregular spotting","Less effective for androgen symptoms","Must be taken at exact same time daily"],
    pcos_benefit:"Moderate — helps protect uterus but less effect on androgen symptoms",
    color:"#a78bfa",
  },
  {
    name:"Hormonal IUD (Mirena/Kyleena)",
    examples:"Mirena 5yr, Kyleena 5yr, Liletta",
    pros:["99.8% effective","Reduces or stops periods","Local progesterone — less systemic effects","5-year protection"],
    cons:["Insertion can be painful","No effect on androgen symptoms","Initial spotting common"],
    pcos_benefit:"Good for protecting endometrium; does not address hormonal symptoms",
    color:"#4f8ef7",
  },
  {
    name:"Non-Hormonal IUD (Copper)",
    examples:"Copper T, Nova-T",
    pros:["Hormone-free","10-year protection","Immediate fertility return","No hormonal side effects"],
    cons:["Can worsen heavy/painful periods","No PCOS symptom relief","May worsen cramping"],
    pcos_benefit:"No benefit for PCOS symptoms — purely contraceptive",
    color:"#34d399",
  },
  {
    name:"Metformin (off-label for PCOS)",
    examples:"Glucophage, Fortamet",
    pros:["Improves insulin resistance","Can restore ovulation","Weight neutral or slight loss","May regulate periods over time"],
    cons:["GI side effects — nausea, diarrhoea","Not a contraceptive — needs backup method","Prescription required"],
    pcos_benefit:"Excellent — addresses root cause (insulin resistance). Often used alongside COCP.",
    color:"#fb923c",
  },
];

const SHOP_PRODUCTS = [
  {name:"Inositol 40:1 (Myo+D-Chiro)",brand:"Ovaboost",price:"₹1,899",href:"#",color:"#a78bfa",badge:"#1 for PCOS"},
  {name:"Magnesium Glycinate 400mg",brand:"Doctor's Best",price:"₹1,299",href:"#",color:"#4f8ef7",badge:null},
  {name:"Spearmint Tea (100 bags)",brand:"Clipper Organic",price:"₹649",href:"#",color:"#34d399",badge:null},
  {name:"Vitamin D3+K2 4000IU",brand:"Now Foods",price:"₹899",href:"#",color:"#fbbf24",badge:"Top Rated"},
  {name:"NAC 600mg (90 caps)",brand:"Jarrow Formulas",price:"₹1,499",href:"#",color:"#fb923c",badge:null},
  {name:"Omega-3 Triple Strength",brand:"HealthKart",price:"₹799",href:"#",color:"#38bdf8",badge:null},
  {name:"Berberine HCl 500mg",brand:"Thorne",price:"₹2,299",href:"#",color:"#f472b6",badge:"Clinical Grade"},
  {name:"Zinc Picolinate 50mg",brand:"Solgar",price:"₹999",href:"#",color:"#34d399",badge:null},
];

export default function PCOSGuide() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isFemale,loading, hasPCOS, hasPCOD } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSupp, setExpandedSupp] = useState(null);
  const [expandedContra, setExpandedContra] = useState(null);

  useEffect(() => { setMounted(true);},[]);useEffect(() => {
    if (!loading && !isFemale) navigate("/dashboard");
  }, [loading, isFemale]); 

  const condition = hasPCOS ? "PCOS" : hasPCOD ? "PCOD" : "PCOS/PCOD";

  const css = generateCSS(T, dark) + `
    .pg-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .pg-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.purple};border-color:${T.purple}40;}
    .pg-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .pg-logo span{color:${T.purple};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.purple},${T.pink});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .pg-content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .pg-title{font-family:${FONT.display};font-size:34px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .pg-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    /* Tabs */
    .tab-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;
      padding-bottom:2px;overflow-x:auto;}
    .tab-btn{padding:10px 20px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};backdrop-filter:blur(20px);font-size:13px;font-weight:700;
      color:${T.textSub};cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .tab-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .tab-btn.active{background:linear-gradient(135deg,${T.purple},${T.pink});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.purpleGlow};}

    /* Cards */
    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:22px;
      padding:24px;backdrop-filter:blur(28px);transition:all 0.3s;margin-bottom:16px;}
    .g-card:hover{border-color:${T.glassBorderHover};}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:16px;}

    /* Symptom grid */
    .sym-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
    .sym-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;
      padding:16px;transition:all 0.25s;}
    .sym-card:hover{transform:translateY(-2px);border-color:${T.glassBorderHover};}
    .sym-ico{font-size:24px;margin-bottom:8px;}
    .sym-lbl{font-size:13px;font-weight:700;color:${T.text};margin-bottom:4px;}
    .sym-desc{font-size:12px;color:${T.textSub};line-height:1.5;}

    /* Diet */
    .diet-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    .diet-section{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;padding:22px;backdrop-filter:blur(28px);}
    .diet-header{font-family:${FONT.display};font-size:16px;font-weight:800;margin-bottom:16px;}
    .food-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid ${T.glassBorder};}
    .food-item:last-child{border-bottom:none;}
    .food-ico{font-size:20px;flex-shrink:0;margin-top:2px;}
    .food-lbl{font-size:13px;font-weight:700;color:${T.text};margin-bottom:2px;}
    .food-sub{font-size:12px;color:${T.textSub};line-height:1.45;}

    /* Workout cards */
    .wk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
    .wk-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);transition:all 0.3s;position:relative;overflow:hidden;}
    .wk-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--wc)06,transparent 55%);pointer-events:none;}
    .wk-card:hover{transform:translateY(-3px);border-color:var(--wc);}
    .wk-ico{font-size:28px;margin-bottom:10px;}
    .wk-type{font-family:${FONT.display};font-size:17px;font-weight:800;margin-bottom:6px;}
    .wk-freq{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:10px;}
    .wk-why{font-size:13px;color:${T.textSub};line-height:1.55;margin-bottom:14px;}
    .wk-exs{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
    .wk-ex{display:flex;align-items:center;gap:8px;font-size:12px;color:${T.textSub};}
    .wk-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .avoid-box{padding:10px 12px;border-radius:10px;font-size:12px;color:${T.orange};
      background:${T.orangeSoft};border:1px solid ${T.orange}25;line-height:1.5;}

    /* Supplement cards */
    .supp-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:12px;overflow:hidden;transition:all 0.3s;cursor:pointer;}
    .supp-header{padding:18px 22px;display:flex;align-items:center;justify-content:space-between;}
    .supp-left{display:flex;align-items:center;gap:14px;}
    .supp-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
    .supp-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .supp-dose{font-size:12px;color:${T.textSub};margin-top:2px;}
    .supp-chevron{font-size:14px;color:${T.textMuted};transition:transform 0.3s;}
    .supp-chevron.open{transform:rotate(180deg);}
    .supp-body{padding:0 22px 18px;}
    .supp-benefit{font-size:13px;color:${T.textSub};line-height:1.6;margin-bottom:10px;}
    .supp-evidence{font-size:12px;color:${T.textMuted};margin-bottom:6px;}
    .supp-timing{font-size:12px;font-weight:700;color:${T.accent};}
    .supp-note{padding:10px 13px;border-radius:10px;font-size:12px;color:${T.orange};
      background:${T.orangeSoft};border:1px solid ${T.orange}25;margin-top:10px;line-height:1.5;}

    /* Contraception */
    .contra-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:12px;overflow:hidden;cursor:pointer;transition:all 0.3s;}
    .contra-header{padding:20px 22px;display:flex;align-items:center;justify-content:space-between;}
    .contra-name{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};margin-bottom:4px;}
    .contra-examples{font-size:12px;color:${T.textSub};}
    .contra-body{padding:0 22px 20px;}
    .pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;}
    .pc-section{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:13px;padding:14px;}
    .pc-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;}
    .pc-item{display:flex;gap:8px;font-size:12px;color:${T.textSub};margin-bottom:7px;line-height:1.45;}
    .pcos-benefit-box{padding:12px 16px;border-radius:12px;font-size:13px;line-height:1.6;font-weight:600;}

    /* Shop */
    .shop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
    .shop-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      padding:18px;backdrop-filter:blur(28px);transition:all 0.3s;}
    .shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};
      box-shadow:0 20px 50px rgba(0,0,0,${dark?"0.3":"0.09"});}
    .shop-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;
      font-weight:800;margin-bottom:10px;}
    .shop-name{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .shop-brand{font-size:11px;color:${T.textMuted};margin-bottom:10px;}
    .shop-price{font-family:${FONT.display};font-size:20px;font-weight:800;margin-bottom:12px;}
    .shop-btn{width:100%;height:40px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${T.purple},${T.pink});
      color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:${FONT.body};
      transition:all 0.25s;letter-spacing:0.04em;}
    .shop-btn:hover{transform:translateY(-2px);filter:brightness(1.1);}

    /* Disclaimer */
    .disclaimer{padding:16px 20px;border-radius:14px;
      background:${T.orangeSoft};border:1px solid ${T.orange}25;
      font-size:12px;color:${T.textSub};line-height:1.65;margin-bottom:24px;}
    .disclaimer strong{color:${T.orange};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:900px){.sym-grid,.wk-grid,.diet-grid,.shop-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.pg-content{padding:20px 16px;}.pg-header{padding:18px 20px;}.pros-cons{grid-template-columns:1fr;}.shop-grid{grid-template-columns:1fr 1fr;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="pg-root">
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%)"}} />
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(244,114,182,0.05) 0%,transparent 65%)"}} />

        <div className="pg-header">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button className="back-btn" onClick={() => navigate("/female-health")}>← Women's Health</button>
            <div className="pg-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="pg-content">
          <div style={{animation:"fadeUp 0.6s ease both"}}>
            <div className="pg-title">💊 {condition} Complete Guide</div>
            <div className="pg-sub">
              Evidence-based information on managing {condition} through diet, exercise, supplements and medical options.
              Always consult your doctor before starting any new supplement or medication.
            </div>
          </div>

          <div className="disclaimer">
            <strong>⚕️ Medical Disclaimer:</strong> This guide is for educational purposes only and does not constitute medical advice.
            {condition} management should be supervised by a qualified healthcare provider.
            All supplement dosages and contraceptive information are general guidelines — individual needs vary significantly.
          </div>

          {/* Tabs */}
          <div className="tab-row" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>
            {TABS.map((t,i) => (
              <button key={i} className={`tab-btn ${activeTab===i?"active":""}`} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{animation:"fadeUp 0.5s ease both"}}>

            {/* OVERVIEW */}
            {activeTab === 0 && (
              <>
                <div className="g-card">
                  <div className="g-title">What is {condition}?</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.75,marginBottom:16}}>
                    <strong style={{color:T.text}}>Polycystic Ovary Syndrome (PCOS)</strong> is one of the most common hormonal disorders in women of reproductive age, affecting 8–13% of women globally.
                    It is characterised by elevated androgens (male hormones), irregular ovulation, and in many cases, small cysts on the ovaries.
                  </p>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.75,marginBottom:16}}>
                    <strong style={{color:T.text}}>PCOD (Polycystic Ovarian Disease)</strong> is often used interchangeably with PCOS but is considered a less severe form.
                    In PCOD, the ovaries release immature or partially mature eggs, which can eventually form cysts.
                    PCOD is more reversible through lifestyle changes than PCOS.
                  </p>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.75}}>
                    Both conditions share a common driver: <strong style={{color:T.purple}}>insulin resistance</strong> — the body's cells don't respond properly to insulin,
                    causing the pancreas to produce more, which in turn triggers the ovaries to produce excess androgens.
                  </p>
                </div>

                <div className="sym-grid" style={{marginBottom:16}}>
                  {PCOS_SYMPTOMS.map((s,i) => (
                    <div key={i} className="sym-card">
                      <div className="sym-ico">{s.ico}</div>
                      <div className="sym-lbl">{s.label}</div>
                      <div className="sym-desc">{s.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="g-card">
                  <div className="g-title">Root Cause: Insulin Resistance</div>
                  {[
                    {n:"1",txt:"Insulin resistance → Pancreas produces excess insulin"},
                    {n:"2",txt:"High insulin → Ovaries produce excess androgens (testosterone)"},
                    {n:"3",txt:"Excess androgens → Disrupted follicle development → Irregular ovulation"},
                    {n:"4",txt:"Irregular ovulation → Irregular periods, cysts, fertility challenges"},
                    {n:"5",txt:"Solution: Break the cycle by improving insulin sensitivity through diet, exercise and targeted supplements"},
                  ].map((s,i) => (
                    <div key={i} style={{display:"flex",gap:14,padding:"11px 0",
                      borderBottom:i<4?`1px solid ${T.glassBorder}`:"none"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",
                        background:`linear-gradient(135deg,${T.purple},${T.pink})`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:12,fontWeight:800,color:"#fff",flexShrink:0,marginTop:2}}>{s.n}</div>
                      <span style={{fontSize:13,color:T.textSub,lineHeight:1.55}}>{s.txt}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* DIET */}
            {activeTab === 1 && (
              <>
                <div className="g-card" style={{marginBottom:20}}>
                  <div className="g-title">Dietary Approach for {condition}</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7}}>
                    The goal is a <strong style={{color:T.green}}>low glycaemic index (GI) diet</strong> that stabilises blood sugar and reduces insulin spikes.
                    Combine this with adequate protein and anti-inflammatory foods for best results.
                  </p>
                </div>
                <div className="diet-grid">
                  <div className="diet-section">
                    <div className="diet-header" style={{color:T.green}}>✅ Eat More</div>
                    {DIET_FOODS.eat.map((f,i) => (
                      <div key={i} className="food-item">
                        <span className="food-ico">{f.ico}</span>
                        <div><div className="food-lbl">{f.label}</div><div className="food-sub">{f.sub}</div></div>
                      </div>
                    ))}
                  </div>
                  <div className="diet-section">
                    <div className="diet-header" style={{color:T.red}}>❌ Avoid or Reduce</div>
                    {DIET_FOODS.avoid.map((f,i) => (
                      <div key={i} className="food-item">
                        <span className="food-ico">{f.ico}</span>
                        <div><div className="food-lbl">{f.label}</div><div className="food-sub">{f.sub}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* WORKOUTS */}
            {activeTab === 2 && (
              <>
                <div className="g-card" style={{marginBottom:20}}>
                  <div className="g-title">Exercise & {condition}</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7}}>
                    Exercise is one of the most powerful tools for {condition} management. It directly improves insulin sensitivity,
                    reduces androgens and supports mental health. The key is <strong style={{color:T.accent}}>avoiding overtraining</strong> — 
                    excess cortisol from intense exercise can worsen hormonal imbalance.
                  </p>
                </div>
                <div className="wk-grid">
                  {WORKOUTS.map((w,i) => (
                    <div key={i} className="wk-card" style={{"--wc":w.color}}>
                      <div className="wk-ico">{w.icon}</div>
                      <div className="wk-type" style={{color:w.color}}>{w.type}</div>
                      <div className="wk-freq">{w.frequency}</div>
                      <div className="wk-why">{w.why}</div>
                      <ul className="wk-exs">
                        {w.exercises.map((ex,j) => (
                          <li key={j} className="wk-ex">
                            <div className="wk-dot" style={{background:w.color}} />{ex}
                          </li>
                        ))}
                      </ul>
                      <div className="avoid-box">⚠️ Avoid: {w.avoid}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* SUPPLEMENTS */}
            {activeTab === 3 && (
              <>
                <div className="g-card" style={{marginBottom:20}}>
                  <div className="g-title">Supplements for {condition}</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7}}>
                    These supplements have clinical evidence supporting their use in {condition} management.
                    Start with one at a time to gauge tolerance. Always check with your doctor if on prescription medication.
                  </p>
                </div>
                {SUPPLEMENTS.map((s,i) => (
                  <div key={i} className="supp-card" onClick={() => setExpandedSupp(expandedSupp===i?null:i)}
                    style={expandedSupp===i?{borderColor:s.color}:{}}>
                    <div className="supp-header">
                      <div className="supp-left">
                        <div className="supp-dot" style={{background:s.color,boxShadow:`0 0 8px ${s.color}60`}} />
                        <div>
                          <div className="supp-name">{s.name}</div>
                          <div className="supp-dose">{s.dose}</div>
                        </div>
                      </div>
                      <span className={`supp-chevron ${expandedSupp===i?"open":""}`}>▼</span>
                    </div>
                    {expandedSupp === i && (
                      <div className="supp-body">
                        <div className="supp-benefit">{s.benefit}</div>
                        <div className="supp-evidence">{s.evidence}</div>
                        <div className="supp-timing">⏰ Timing: {s.timing}</div>
                        {s.note && <div className="supp-note">⚠️ {s.note}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* CONTRACEPTION */}
            {activeTab === 4 && (
              <>
                <div className="g-card" style={{marginBottom:20}}>
                  <div className="g-title">Contraception & {condition}</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7}}>
                    Choosing the right contraception with {condition} matters — some options treat symptoms while others are purely contraceptive.
                    This guide covers the most relevant options with their specific effects on {condition} symptoms.
                    Always consult a gynaecologist for personalised advice.
                  </p>
                </div>
                {CONTRACEPTION.map((c,i) => (
                  <div key={i} className="contra-card"
                    style={expandedContra===i?{borderColor:c.color}:{}}
                    onClick={() => setExpandedContra(expandedContra===i?null:i)}>
                    <div className="contra-header">
                      <div>
                        <div className="contra-name" style={expandedContra===i?{color:c.color}:{}}>{c.name}</div>
                        <div className="contra-examples">{c.examples}</div>
                      </div>
                      <span style={{color:T.textMuted,fontSize:18,transition:"transform 0.3s",
                        transform:expandedContra===i?"rotate(180deg)":"none"}}>▼</span>
                    </div>
                    {expandedContra === i && (
                      <div className="contra-body">
                        <div className="pros-cons">
                          <div className="pc-section">
                            <div className="pc-title" style={{color:T.green}}>✅ Pros</div>
                            {c.pros.map((p,j) => (
                              <div key={j} className="pc-item"><span>•</span>{p}</div>
                            ))}
                          </div>
                          <div className="pc-section">
                            <div className="pc-title" style={{color:T.red}}>⚠️ Cons</div>
                            {c.cons.map((cn,j) => (
                              <div key={j} className="pc-item"><span>•</span>{cn}</div>
                            ))}
                          </div>
                        </div>
                        <div className="pcos-benefit-box" style={{background:`${c.color}12`,border:`1px solid ${c.color}30`,color:c.color}}>
                          <strong>💊 {condition} Benefit: </strong>{c.pcos_benefit}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* SHOP */}
            {activeTab === 5 && (
              <>
                <div className="g-card" style={{marginBottom:20}}>
                  <div className="g-title">{condition} Supplement Shop</div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7}}>
                    Curated supplements with clinical evidence for {condition} management, sourced from trusted brands via our affiliate partners.
                  </p>
                </div>
                <div className="shop-grid">
                  {SHOP_PRODUCTS.map((p,i) => (
                    <div key={i} className="shop-card">
                      {p.badge && (
                        <div className="shop-badge" style={{background:`${p.color}18`,color:p.color,border:`1px solid ${p.color}30`}}>
                          {p.badge}
                        </div>
                      )}
                      <div className="shop-name">{p.name}</div>
                      <div className="shop-brand">{p.brand}</div>
                      <div className="shop-price" style={{color:p.color}}>{p.price}</div>
                      <a href={p.href} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                        <button className="shop-btn">Buy Now ↗</button>
                      </a>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:20,padding:"14px 18px",borderRadius:13,
                  background:T.glass,border:`1px solid ${T.glassBorder}`,
                  fontSize:11,color:T.textMuted,textAlign:"center",lineHeight:1.65}}>
                  <strong>Affiliate Disclosure:</strong> Links above are affiliate links. AshFitVerse earns a commission at no extra cost to you.
                  Products are selected based on clinical evidence and quality.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}