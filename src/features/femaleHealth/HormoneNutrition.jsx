// src/features/femaleHealth/HormoneNutrition.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const PHASES = [
  {
    name: "Menstrual Phase",
    days: "Day 1–5",
    icon: "🔴",
    color: "#f472b6",
    hormone: "Oestrogen & Progesterone both LOW",
    hormoneDetail: "The uterine lining sheds. Energy is lowest here — your body needs nourishment and rest.",
    keyNutrients: ["Iron","Vitamin C","Magnesium","Omega-3","Zinc"],
    meals: [
      {
        time: "Breakfast",
        icon: "🌅",
        name: "Iron-Rich Warm Bowl",
        items: ["Oats with dark molasses","Handful of pumpkin seeds","Sliced banana","Warm turmeric milk"],
        macros: {cal:480, protein:18, carbs:72, fats:14},
        why: "Molasses and pumpkin seeds replace iron lost during bleeding. Turmeric reduces period cramps.",
      },
      {
        time: "Lunch",
        icon: "☀️",
        name: "Warming Lentil Soup",
        items: ["Red lentil dal","Brown rice (small portion)","Sautéed spinach with garlic","Lemon juice (Vit C for iron absorption)"],
        macros: {cal:520, protein:26, carbs:68, fats:10},
        why: "Lentils provide plant iron. Lemon dramatically increases iron absorption. Warm food eases cramps.",
      },
      {
        time: "Snack",
        icon: "🍫",
        name: "Dark Chocolate + Nuts",
        items: ["2 squares 85% dark chocolate","Handful of cashews","Herbal raspberry leaf tea"],
        macros: {cal:290, protein:8, carbs:22, fats:18},
        why: "Dark chocolate provides magnesium which relaxes uterine muscles. Raspberry leaf tea may ease flow.",
      },
      {
        time: "Dinner",
        icon: "🌙",
        name: "Salmon & Greens",
        items: ["Grilled salmon fillet 150g","Steamed kale and broccoli","Sweet potato mash","Ginger-lemon dressing"],
        macros: {cal:520, protein:38, carbs:42, fats:22},
        why: "Salmon omega-3 is anti-inflammatory and reduces prostaglandins that cause cramps. Ginger reduces nausea.",
      },
    ],
    avoid: ["Caffeine (worsens cramps)","Alcohol (increases inflammation)","Salty processed foods (worsens bloating)","Red meat in excess (increases prostaglandins)"],
    supplements: ["Magnesium glycinate 400mg","Iron with Vitamin C","Evening primrose oil","Omega-3 2g"],
    workouts: "Rest, gentle yoga, slow walking only",
    hydration: "3L+ warm water with electrolytes. Avoid ice-cold drinks.",
    selfCare: ["Heat pad on abdomen","Gentle stretching","Early bedtime","Castor oil pack on lower abdomen"],
  },
  {
    name: "Follicular Phase",
    days: "Day 6–13",
    icon: "🌱",
    color: "#4f8ef7",
    hormone: "Oestrogen RISING",
    hormoneDetail: "FSH stimulates follicle growth. Oestrogen rises and with it your energy, mood and metabolism.",
    keyNutrients: ["Lean protein","Fermented foods","Zinc","B vitamins","Fibre"],
    meals: [
      {
        time: "Breakfast",
        icon: "🌅",
        name: "High-Protein Power Bowl",
        items: ["3 scrambled eggs","Sourdough toast (1 slice)","Avocado half","Cherry tomatoes","Green tea"],
        macros: {cal:580, protein:32, carbs:42, fats:28},
        why: "Oestrogen is rising — this is the best time for high protein to build muscle. Eggs provide all B vitamins.",
      },
      {
        time: "Lunch",
        icon: "☀️",
        name: "Lean Chicken Quinoa Bowl",
        items: ["200g grilled chicken breast","Quinoa 100g","Mixed salad greens","Kimchi or sauerkraut 50g","Olive oil dressing"],
        macros: {cal:620, protein:55, carbs:58, fats:16},
        why: "Peak time for protein synthesis. Fermented foods support oestrogen metabolism through the gut microbiome.",
      },
      {
        time: "Snack",
        icon: "🥜",
        name: "Seed Cycling Snack",
        items: ["1 tbsp flaxseeds","1 tbsp pumpkin seeds","Greek yogurt 170g","Berries"],
        macros: {cal:310, protein:20, carbs:28, fats:12},
        why: "Follicular phase seed cycling — flax and pumpkin seeds support healthy oestrogen levels.",
      },
      {
        time: "Dinner",
        icon: "🌙",
        name: "Stir-Fry Tofu & Veg",
        items: ["200g firm tofu","Broccoli, peppers, snap peas","Brown rice 100g","Ginger-soy sauce","Sesame seeds"],
        macros: {cal:540, protein:30, carbs:62, fats:16},
        why: "Cruciferous veg (broccoli) contain DIM which helps the liver process oestrogen efficiently.",
      },
    ],
    avoid: ["Processed foods","Excess sugar","Heavy alcohol"],
    supplements: ["B-complex","Zinc 25mg","Flaxseed (seed cycling)","Probiotic"],
    workouts: "High intensity training, strength, new PRs — your peak performance window",
    hydration: "2.5L minimum. Can add electrolytes pre-workout.",
    selfCare: ["New challenges and goals","Social activities","Creative projects","Start new habits — habit formation is easiest here"],
  },
  {
    name: "Ovulation Phase",
    days: "Day 14–16",
    icon: "✨",
    color: "#fbbf24",
    hormone: "Oestrogen PEAK + brief Testosterone spike",
    hormoneDetail: "LH surge triggers egg release. You are at peak energy, libido, confidence and strength.",
    keyNutrients: ["Antioxidants","Fibre","Light meals","Glutathione-rich foods","Hydration"],
    meals: [
      {
        time: "Breakfast",
        icon: "🌅",
        name: "Antioxidant Smoothie Bowl",
        items: ["Mixed berries 150g","Spinach handful","Banana","Whey protein 30g","Granola topping","Chia seeds"],
        macros: {cal:520, protein:32, carbs:65, fats:10},
        why: "Peak metabolic rate — antioxidants protect the egg during ovulation. Fibre supports oestrogen clearance.",
      },
      {
        time: "Lunch",
        icon: "☀️",
        name: "Light Salmon Salad",
        items: ["150g grilled salmon","Large mixed salad","Avocado","Cucumber","Lemon-tahini dressing"],
        macros: {cal:560, protein:38, carbs:22, fats:32},
        why: "Omega-3 supports egg quality. Light meals prevent bloating during the ovulatory window.",
      },
      {
        time: "Snack",
        icon: "🍊",
        name: "Vitamin C Boost",
        items: ["Orange or grapefruit","Almonds 30g","Green smoothie (spinach + apple + ginger)"],
        macros: {cal:270, protein:8, carbs:35, fats:11},
        why: "Vitamin C is concentrated in the follicle and crucial for ovulation. Ginger reduces inflammation.",
      },
      {
        time: "Dinner",
        icon: "🌙",
        name: "Turkey & Roasted Veg",
        items: ["200g turkey breast","Roasted asparagus and courgette","New potatoes 100g","Garlic and herb dressing"],
        macros: {cal:490, protein:48, carbs:38, fats:14},
        why: "Turkey provides zinc which is essential for egg maturation. Asparagus is rich in folate.",
      },
    ],
    avoid: ["Heavy red meat","Processed carbs","Excess dairy","Alcohol"],
    supplements: ["Vitamin C 1000mg","CoQ10 (supports egg quality)","Folate/Folic acid","NAC"],
    workouts: "Absolute peak — HIIT, heavy lifts, personal records, competitive activities",
    hydration: "3L — cervical mucus production increases water demand",
    selfCare: ["High energy social activities","Public speaking, presentations","Important decisions","Intimacy — peak libido window"],
  },
  {
    name: "Luteal Phase",
    days: "Day 17–28",
    icon: "🌙",
    color: "#a78bfa",
    hormone: "Progesterone RISING, Oestrogen drops mid-phase",
    hormoneDetail: "The corpus luteum produces progesterone. Metabolism rises by 100–300 kcal. PMS symptoms appear in the second half.",
    keyNutrients: ["Magnesium","Vitamin B6","Complex carbs","Calcium","Tryptophan (serotonin precursor)"],
    meals: [
      {
        time: "Breakfast",
        icon: "🌅",
        name: "Comfort Oat Bowl",
        items: ["Oats 80g with almond milk","Sliced banana (tryptophan)","Almond butter 2 tbsp","Cinnamon","Chamomile tea"],
        macros: {cal:580, protein:18, carbs:78, fats:20},
        why: "Oats boost serotonin via tryptophan. Complex carbs stabilise mood. Almond butter provides magnesium.",
      },
      {
        time: "Lunch",
        icon: "☀️",
        name: "Balanced Grain Bowl",
        items: ["Chicken thigh 150g","Roasted sweet potato","Chickpeas","Tahini-lemon dressing","Pomegranate seeds"],
        macros: {cal:640, protein:42, carbs:68, fats:20},
        why: "Sweet potato and chickpeas help stabilise blood sugar — crucial to prevent PMS mood swings.",
      },
      {
        time: "Snack",
        icon: "🍫",
        name: "Magnesium Snack",
        items: ["2 squares dark chocolate (85%)","Brazil nuts (3–4)","Peppermint tea"],
        macros: {cal:260, protein:5, carbs:18, fats:18},
        why: "Magnesium deficiency drives PMS symptoms. Dark chocolate + Brazil nuts provide 40% of daily magnesium.",
      },
      {
        time: "Dinner",
        icon: "🌙",
        name: "Hormone-Balancing Meal",
        items: ["Baked salmon or chicken","Steamed broccoli and Brussels sprouts","Quinoa or brown rice","Sesame ginger sauce"],
        macros: {cal:560, protein:44, carbs:52, fats:18},
        why: "Cruciferous veg help the liver clear excess oestrogen — reduces bloating and mood symptoms in late luteal.",
      },
    ],
    avoid: ["Caffeine (worsens anxiety and breast tenderness)","Alcohol (depletes B6 and magnesium)","Refined sugar (blood sugar crashes → mood swings)","Excess salt (causes water retention)"],
    supplements: ["Magnesium glycinate 400mg at night","Vitamin B6 50mg","Calcium 600mg","Chasteberry (vitex) if approved by doctor","Evening primrose oil"],
    workouts: "Reduce intensity in final week. Pilates, yoga, swimming, walks. Listen to your body.",
    hydration: "3L — progesterone can cause mild dehydration. Add electrolytes.",
    selfCare: ["Journalling and reflection","Reduce social commitments","Prioritise sleep — progesterone is sleep-promoting","Heat therapy for cramps","Castor oil packs","Epsom salt baths"],
  },
];

const SEED_CYCLING = {
  follicular: {
    phase: "Follicular (Day 1–14)",
    seeds: ["1 tbsp Flaxseeds", "1 tbsp Pumpkin seeds"],
    why: "Lignans in flax seeds support oestrogen metabolism. Pumpkin seeds provide zinc for progesterone production.",
    color: "#4f8ef7",
  },
  luteal: {
    phase: "Luteal (Day 15–28)",
    seeds: ["1 tbsp Sesame seeds", "1 tbsp Sunflower seeds"],
    why: "Sesame contains lignans that modulate excess oestrogen. Sunflower seeds provide Vitamin E and selenium for progesterone.",
    color: "#a78bfa",
  },
};

export default function HormoneNutrition() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isFemale } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (!loading && !isFemale) navigate("/dashboard");
    
    // Auto-select current phase logic
    if (user && user.lastPeriod) {
      const last = new Date(user.lastPeriod);
      const cycleLen = parseInt(user.cycleLength) || 28;
      const day = (Math.floor((new Date() - last) / 86400000) % cycleLen) + 1;
      if (day <= 5) setActivePhase(0);
      else if (day <= 13) setActivePhase(1);
      else if (day <= 16) setActivePhase(2);
      else setActivePhase(3);
    }
  }, [loading, isFemale, user, navigate]);

  const phase = PHASES[activePhase];

  const css = generateCSS(T, dark) + `
    .hn-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .hn-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.green};border-color:${T.green}40;}
    .hn-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .hn-logo span{color:${T.green};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.green},${T.accent});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    .hn-content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .hn-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .hn-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:28px;}

    /* Phase selector */
    .phase-sel{display:flex;gap:10px;margin-bottom:28px;overflow-x:auto;padding-bottom:4px;}
    .phase-btn{display:flex;align-items:center;gap:9px;padding:13px 20px;border-radius:16px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);
      cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);white-space:nowrap;
      font-family:${FONT.body};}
    .phase-btn:hover{transform:translateY(-2px);border-color:${T.glassBorderHover};}
    .phase-btn.active{transform:translateY(-2px);}
    .pb-icon{font-size:18px;}
    .pb-name{font-size:13px;font-weight:700;color:${T.text};}
    .pb-days{font-size:11px;color:${T.textMuted};margin-top:2px;}

    /* Hormone banner */
    .hormone-banner{border-radius:20px;padding:22px 26px;margin-bottom:24px;
      display:flex;align-items:flex-start;gap:16px;border:1px solid;}
    .hb-icon{font-size:32px;flex-shrink:0;}
    .hb-hormone{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;}
    .hb-detail{font-size:14px;line-height:1.65;}

    /* Main layout */
    .hn-layout{display:grid;grid-template-columns:1.3fr 1fr;gap:20px;margin-bottom:24px;}

    /* Meal cards */
    .meal-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;
      margin-bottom:12px;overflow:hidden;cursor:pointer;transition:all 0.3s;}
    .meal-card:hover{border-color:${T.glassBorderHover};}
    .meal-header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
    .meal-left{display:flex;align-items:center;gap:12px;}
    .meal-ico{font-size:20px;}
    .meal-time{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:3px;}
    .meal-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .meal-cal{font-size:13px;font-weight:800;font-family:${FONT.display};}
    .meal-body{padding:0 20px 16px;}
    .meal-items{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
    .meal-item{display:flex;align-items:center;gap:8px;font-size:13px;color:${T.textSub};}
    .meal-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .meal-macros{display:flex;gap:10px;margin-bottom:10px;}
    .macro-chip{padding:4px 11px;border-radius:99px;font-size:11px;font-weight:700;}
    .meal-why{font-size:12px;color:${T.textSub};line-height:1.6;padding:10px 14px;
      border-radius:11px;border-left:3px solid;}

    /* Side panel */
    .g-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:22px;backdrop-filter:blur(28px);margin-bottom:16px;}
    .g-title{font-family:${FONT.display};font-size:12px;font-weight:700;
      letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}

    .key-nutrient{display:inline-flex;align-items:center;padding:6px 14px;border-radius:99px;
      font-size:12px;font-weight:700;margin:0 6px 6px 0;border:1px solid;}

    .avoid-item{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};line-height:1.5;}
    .avoid-item:last-child{border-bottom:none;}

    .supp-item{display:flex;align-items:center;gap:10px;padding:9px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13px;color:${T.textSub};}
    .supp-item:last-child{border-bottom:none;}
    .supp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

    .self-care-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid ${T.glassBorder};
      font-size:13px;color:${T.textSub};}
    .self-care-item:last-child{border-bottom:none;}

    /* Seed cycling */
    .seed-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;}
    .seed-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:20px;backdrop-filter:blur(28px);}
    .seed-phase{font-family:${FONT.display};font-size:15px;font-weight:800;margin-bottom:12px;}
    .seed-item{display:flex;align-items:center;gap:10px;padding:8px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13px;font-weight:600;color:${T.text};}
    .seed-item:last-child{border-bottom:none;}
    .seed-why{font-size:12px;color:${T.textSub};line-height:1.6;margin-top:12px;padding-top:12px;
      border-top:1px solid ${T.glassBorder};}

    /* Workout badge */
    .workout-badge{padding:14px 18px;border-radius:14px;font-size:13px;font-weight:600;
      line-height:1.55;border:1px solid;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.hn-layout{grid-template-columns:1fr;}.seed-grid{grid-template-columns:1fr;}}
    @media(max-width:600px){.hn-content{padding:20px 16px;}.hn-header{padding:18px 20px;}.phase-sel{gap:8px;}.meal-macros{flex-wrap:wrap;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="hn-root">
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(52,211,153,0.07) 0%,transparent 65%)"}} />
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)"}} />

        <div className="hn-header">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button className="back-btn" onClick={() => navigate("/female-health")}>← Women's Health</button>
            <div className="hn-logo">AshFit<span>Verse</span></div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="hn-content">
          <div style={{animation:"fadeUp 0.6s ease both"}}>
            <div className="hn-title">🥗 Hormone Nutrition Guide</div>
            <div className="hn-sub">
              Eat in sync with your cycle. Each phase has different hormonal needs — the right foods can dramatically
              reduce PMS, improve energy and support hormonal balance naturally.
              {user.lastPeriod && <span style={{color:T.green,fontWeight:700}}> Your current phase is auto-selected below.</span>}
            </div>
          </div>

          {/* Phase selector */}
          <div className="phase-sel" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>
            {PHASES.map((p, i) => (
              <button key={i} className={`phase-btn ${activePhase===i?"active":""}`}
                style={activePhase===i?{borderColor:p.color,background:`${p.color}14`,boxShadow:`0 0 20px ${p.color}30`}:{}}
                onClick={() => { setActivePhase(i); setExpandedMeal(null); }}>
                <span className="pb-icon">{p.icon}</span>
                <div>
                  <div className="pb-name" style={activePhase===i?{color:p.color}:{}}>{p.name.replace(" Phase","")}</div>
                  <div className="pb-days">{p.days}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Hormone banner */}
          <div className="hormone-banner" style={{
            background:`${phase.color}10`,borderColor:`${phase.color}30`,
            animation:"fadeUp 0.5s ease both"
          }}>
            <span className="hb-icon">{phase.icon}</span>
            <div>
              <div className="hb-hormone" style={{color:phase.color}}>{phase.hormone}</div>
              <div className="hb-detail" style={{color:T.textSub}}>{phase.hormoneDetail}</div>
            </div>
          </div>

          <div className="hn-layout" style={{animation:"fadeUp 0.5s ease 0.05s both"}}>
            {/* Meals */}
            <div>
              <div style={{fontFamily:FONT.display,fontSize:16,fontWeight:800,color:T.text,marginBottom:16}}>
                Meal Plan — {phase.name}
              </div>
              {phase.meals.map((meal, mi) => (
                <div key={mi} className="meal-card"
                  style={expandedMeal===mi?{borderColor:phase.color}:{}}
                  onClick={() => setExpandedMeal(expandedMeal===mi?null:mi)}>
                  <div className="meal-header">
                    <div className="meal-left">
                      <span className="meal-ico">{meal.icon}</span>
                      <div>
                        <div className="meal-time">{meal.time}</div>
                        <div className="meal-name">{meal.name}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span className="meal-cal" style={{color:phase.color}}>{meal.macros.cal} kcal</span>
                      <span style={{color:T.textMuted,fontSize:14,transition:"transform 0.3s",
                        transform:expandedMeal===mi?"rotate(180deg)":"none"}}>▼</span>
                    </div>
                  </div>
                  {expandedMeal === mi && (
                    <div className="meal-body">
                      <ul className="meal-items">
                        {meal.items.map((item, ii) => (
                          <li key={ii} className="meal-item">
                            <div className="meal-dot" style={{background:phase.color}} />{item}
                          </li>
                        ))}
                      </ul>
                      <div className="meal-macros">
                        {[
                          {label:"Protein",val:`${meal.macros.protein}g`,color:"#4f8ef7"},
                          {label:"Carbs",val:`${meal.macros.carbs}g`,color:"#a78bfa"},
                          {label:"Fats",val:`${meal.macros.fats}g`,color:"#fb923c"},
                        ].map((m,i) => (
                          <span key={i} className="macro-chip"
                            style={{background:`${m.color}18`,color:m.color,border:`1px solid ${m.color}28`}}>
                            {m.label} {m.val}
                          </span>
                        ))}
                      </div>
                      <div className="meal-why" style={{borderColor:phase.color,background:`${phase.color}08`}}>
                        💡 {meal.why}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Side panel */}
            <div>
              <div className="g-card">
                <div className="g-title">Key Nutrients</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {phase.keyNutrients.map((n,i) => (
                    <span key={i} className="key-nutrient"
                      style={{background:`${phase.color}14`,color:phase.color,borderColor:`${phase.color}28`}}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="g-card">
                <div className="g-title">Avoid This Phase</div>
                {phase.avoid.map((a,i) => (
                  <div key={i} className="avoid-item">
                    <span style={{fontSize:16,flexShrink:0}}>❌</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>

              <div className="g-card">
                <div className="g-title">Supplements</div>
                {phase.supplements.map((s,i) => (
                  <div key={i} className="supp-item">
                    <div className="supp-dot" style={{background:phase.color,boxShadow:`0 0 6px ${phase.color}`}} />
                    {s}
                  </div>
                ))}
              </div>

              <div className="g-card">
                <div className="g-title">Movement</div>
                <div className="workout-badge" style={{background:`${phase.color}10`,borderColor:`${phase.color}30`,color:T.textSub}}>
                  🏋️ {phase.workouts}
                </div>
              </div>

              <div className="g-card">
                <div className="g-title">Hydration</div>
                <div style={{fontSize:13,color:T.textSub,lineHeight:1.6}}>💧 {phase.hydration}</div>
              </div>

              <div className="g-card">
                <div className="g-title">Self-Care</div>
                {phase.selfCare.map((s,i) => (
                  <div key={i} className="self-care-item">
                    <span style={{fontSize:16,flexShrink:0}}>✨</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seed cycling */}
          <div style={{marginBottom:24,animation:"fadeUp 0.6s ease 0.15s both"}}>
            <div style={{fontFamily:FONT.display,fontSize:19,fontWeight:800,color:T.text,marginBottom:6}}>
              🌱 Seed Cycling
            </div>
            <div style={{fontSize:14,color:T.textSub,marginBottom:16,lineHeight:1.6}}>
              Add these seeds to smoothies, yogurt or salads daily. A simple evidence-backed method to
              support natural hormone cycling throughout the month.
            </div>
            <div className="seed-grid">
              {Object.values(SEED_CYCLING).map((sc, i) => (
                <div key={i} className="seed-card" style={{borderColor:`${sc.color}25`}}>
                  <div className="seed-phase" style={{color:sc.color}}>{sc.phase}</div>
                  {sc.seeds.map((s,j) => (
                    <div key={j} className="seed-item">
                      <span style={{fontSize:16}}>🌰</span> {s}
                    </div>
                  ))}
                  <div className="seed-why">{sc.why}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}