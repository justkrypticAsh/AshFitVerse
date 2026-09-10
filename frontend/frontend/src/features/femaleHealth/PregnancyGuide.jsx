// src/features/femaleHealth/PregnancyGuide.jsx
// Complete Pregnancy Companion — Trimester guide + Kick Counter + Contraction Timer
// + Weight Tracker + Hospital Bag + Birth Plan + Journal + Indian Nutrition + Partner Guide

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser  from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

// ── Data ───────────────────────────────────────────────────────────────────
const TRIMESTERS = [
  {
    id:1, name:"First Trimester", weeks:"Week 1–12", emoji:"🌱", color:"#f472b6",
    tagline:"The beginning — rest, nourish, and listen to your body.",
    baby:[
      "Fertilisation → embryo forms in week 1–2",
      "Heart begins beating around week 6",
      "Brain, spinal cord, and organs start forming",
      "By week 12, baby is ~6 cm and fingers are visible",
      "All major organs are in place by end of T1",
    ],
    body:[
      "Morning sickness (nausea) — most common in weeks 6–10",
      "Extreme fatigue — progesterone spike is the cause",
      "Breast tenderness and slight swelling",
      "Frequent urination as uterus expands",
      "Heightened sense of smell, food aversions",
      "Mild cramping and light spotting (implantation) is normal",
    ],
    workouts:[
      {name:"Walking",         duration:"20–30 min", intensity:"Light",    safe:true },
      {name:"Prenatal Yoga",   duration:"30 min",    intensity:"Light",    safe:true },
      {name:"Swimming",        duration:"20 min",    intensity:"Light",    safe:true },
      {name:"Light Stretching",duration:"15 min",    intensity:"Very low", safe:true },
      {name:"Running",         duration:"Avoid",     intensity:"High",     safe:false},
      {name:"Heavy Lifting",   duration:"Avoid",     intensity:"High",     safe:false},
    ],
    nutrition:[
      {item:"Folic Acid",  why:"Neural tube development — 400–800 mcg/day",   foods:"Spinach, methi, moong dal, fortified cereals, broccoli"},
      {item:"Iron",        why:"Increased blood volume, prevents anaemia",      foods:"Rajma, chana, palak, beetroot, ragi, dates (khajoor)"},
      {item:"Vitamin B6",  why:"Reduces nausea symptoms significantly",         foods:"Banana, aloo, chicken, sunflower seeds"},
      {item:"Ginger",      why:"Natural nausea relief",                         foods:"Adrak chai, ginger biscuits, ginger in warm water"},
      {item:"Calcium",     why:"Baby's bones and teeth formation begins",        foods:"Dahi, paneer, ragi, sesame (til), almonds, milk"},
      {item:"Hydration",   why:"Prevents dehydration from nausea/vomiting",     foods:"Water, nariyal pani, nimbu pani, dal ka paani"},
    ],
    avoid:[
      "Alcohol (zero tolerance — no safe amount)",
      "Raw/undercooked meat, fish, or eggs",
      "Unpasteurised dairy products",
      "High-mercury fish (shark, swordfish, king mackerel)",
      "Excessive caffeine (max 200mg/day — 1 small cup)",
      "Papaya (papita) and pineapple (ananas) in large quantities",
      "Processed junk food and trans fats",
    ],
    symptoms:[
      {s:"Morning sickness",  tip:"Eat small meals every 2h. Dry toast or salty crackers before getting up."},
      {s:"Fatigue",           tip:"Nap without guilt. Your body is building a human."},
      {s:"Food aversions",    tip:"Eat whatever stays down. This phase passes by week 12."},
      {s:"Bloating & gas",    tip:"Eat slowly. Avoid carbonated drinks. Walk after meals."},
      {s:"Mood swings",       tip:"Hormones are responsible. Communicate with your partner."},
      {s:"Light spotting",    tip:"Usually implantation. Mention to doctor at next visit."},
    ],
    appointments:[
      "First prenatal appointment (8–10 weeks)",
      "Blood tests: blood type, iron, HIV, rubella immunity",
      "First ultrasound to confirm heartbeat and dating",
      "Nuchal translucency scan (11–13 weeks) — chromosomal screening",
      "Discuss prenatal vitamins with your doctor",
    ],
    redFlags:[
      "Heavy bleeding or passing tissue",
      "Severe abdominal pain or cramping",
      "High fever (>38°C)",
      "Painful urination (possible UTI)",
      "Severe vomiting — can't keep anything down (hyperemesis)",
    ],
    partner:[
      "Attend the first ultrasound — seeing the heartbeat together is powerful",
      "Take over cooking if smells trigger her nausea",
      "Never comment on her eating habits — nausea makes choices limited",
      "Handle household chemicals, lifting, and heavy tasks",
      "Be patient with mood swings — progesterone is to blame, not her",
      "Research your nearest hospital and antenatal classes together",
    ],
    sleep:[
      {tip:"Side sleeping is fine in T1 — left side preferred", safe:true},
      {tip:"Use a thin pillow between knees to align hips", safe:true},
      {tip:"Sleeping on stomach — okay until bump appears", safe:true},
      {tip:"Lying flat on back is still okay in early T1", safe:true},
    ],
    ayurveda:[
      {item:"Shatavari",   use:"Supports hormonal balance, reduces nausea — consult doctor before use"},
      {item:"Ginger (Adrak)", use:"Adrak chai helps nausea — safe in moderation"},
      {item:"Tulsi",       use:"Mild immune support — herbal tea, 1 cup/day"},
      {item:"Ajwain water",use:"Relieves gas and bloating — boil in water and sip warm"},
    ],
  },
  {
    id:2, name:"Second Trimester", weeks:"Week 13–26", emoji:"🌸", color:"#a78bfa",
    tagline:"The golden trimester — energy returns, baby grows fast.",
    baby:[
      "Baby starts moving — you'll feel flutters around week 16–20",
      "Gender can be determined by ultrasound (week 18–20)",
      "Baby develops fingerprints, eyebrows, and eyelashes",
      "Hearing develops — baby can hear your voice by week 20",
      "By week 26, baby weighs ~900g and is ~35 cm long",
      "Lungs begin developing surfactant for breathing",
    ],
    body:[
      "Nausea usually subsides — energy returns",
      "Visible baby bump appears (especially from week 16–20)",
      "Round ligament pain — sharp pain on sides of abdomen",
      "Backache as centre of gravity shifts",
      "Skin changes: linea nigra, darkening of nipples",
      "Nasal congestion and possible nosebleeds (increased blood flow)",
      "Braxton Hicks contractions may begin (painless)",
    ],
    workouts:[
      {name:"Prenatal Yoga",     duration:"45 min",    intensity:"Moderate", safe:true },
      {name:"Swimming",          duration:"30–45 min", intensity:"Moderate", safe:true },
      {name:"Walking",           duration:"30–45 min", intensity:"Moderate", safe:true },
      {name:"Stationary Cycling",duration:"20–30 min", intensity:"Light",    safe:true },
      {name:"Light Strength",    duration:"20 min",    intensity:"Low",      safe:true },
      {name:"Crunches/Sit-ups",  duration:"Avoid",     intensity:"—",        safe:false},
      {name:"Contact Sports",    duration:"Avoid",     intensity:"—",        safe:false},
    ],
    nutrition:[
      {item:"Protein",       why:"Baby's muscles, organs, and tissue growth",      foods:"Eggs, chicken, moong dal, paneer, tofu, low-mercury fish"},
      {item:"Calcium & D3",  why:"Skeleton hardening, teeth formation",            foods:"Doodh, dahi, ragi sattu, sunlight, fortified foods"},
      {item:"Omega-3 (DHA)", why:"Brain and eye development is rapid now",         foods:"Salmon, akhrot, alsi (flaxseed), chia seeds"},
      {item:"Iron",          why:"Blood volume increases 50% during pregnancy",    foods:"Red meat, palak, chukander, khajoor, masoor dal"},
      {item:"Fibre",         why:"Prevents constipation (very common T2 problem)", foods:"Oats, gehun, sabzi, fruits, rajma, chana"},
      {item:"Magnesium",     why:"Reduces leg cramps, supports bone formation",    foods:"Pumpkin seeds, badam, dark chocolate, kela"},
    ],
    avoid:[
      "Lying flat on your back for long periods (compresses vena cava)",
      "High-impact sports with fall risk",
      "Hot tubs, saunas, extreme heat exposure",
      "Raw sprouts (listeria risk)",
      "Excessive salt (increases swelling/oedema)",
    ],
    symptoms:[
      {s:"Round ligament pain", tip:"Move slowly, avoid sudden position changes. Heat pack helps."},
      {s:"Backache",            tip:"Prenatal yoga and a pregnancy pillow at night help greatly."},
      {s:"Leg cramps",          tip:"Magnesium supplement + stretch calves before bed."},
      {s:"Heartburn",           tip:"Small frequent meals. Sleep with head elevated."},
      {s:"Swollen ankles",      tip:"Elevate feet when sitting. Stay hydrated. Reduce salt."},
      {s:"Braxton Hicks",       tip:"Normal practice contractions. Pain-free. Drink water."},
    ],
    appointments:[
      "Anatomy scan (18–22 weeks) — checks all organs",
      "Glucose challenge test (24–28 weeks) — screens for gestational diabetes",
      "Iron levels re-check",
      "Discussion of birth plan with OB/midwife",
      "Dental checkup — gum disease is common in pregnancy",
    ],
    redFlags:[
      "Regular painful contractions before 37 weeks",
      "Sudden severe swelling of face, hands, feet (preeclampsia sign)",
      "Reduced or absent baby movement after week 20",
      "Severe headache with visual disturbances",
      "Unusual discharge or fluid leaking",
    ],
    partner:[
      "Start attending antenatal/childbirth classes together",
      "Give regular back massages — she'll love you forever",
      "Go to anatomy scan together — this is when baby looks like a baby",
      "Start baby-proofing and nursery planning as a team",
      "Read about labour and delivery so you're informed and calm",
      "If she gets mood swings, don't take it personally — hormones peak in T2",
    ],
    sleep:[
      {tip:"LEFT side sleeping is strongly recommended from T2 onwards", safe:true},
      {tip:"A pregnancy pillow (U-shape) is life-changing — get one now", safe:true},
      {tip:"Elevate head slightly if heartburn keeps you up", safe:true},
      {tip:"Avoid sleeping on your back — compresses the vena cava", safe:false},
      {tip:"Sleeping on stomach becomes impossible and unsafe now", safe:false},
    ],
    ayurveda:[
      {item:"Ashwagandha",  use:"NOT recommended during pregnancy — avoid"},
      {item:"Shatavari",    use:"Traditionally used to support pregnancy — consult doctor"},
      {item:"Amla (Awla)",  use:"Rich in Vitamin C — amla juice diluted, 20ml/day is safe"},
      {item:"Ghee",         use:"1–2 tsp/day — traditional for baby's brain development"},
      {item:"Til (sesame)", use:"Rich in calcium — til laddoo in moderation is fine"},
    ],
  },
  {
    id:3, name:"Third Trimester", weeks:"Week 27–40", emoji:"👶", color:"#fb923c",
    tagline:"The final stretch — prepare your body and mind for birth.",
    baby:[
      "Brain develops rapidly — triples in weight this trimester",
      "Baby's eyes open and respond to light",
      "Fat layers build up for warmth after birth",
      "Baby turns head-down position (usually by week 36)",
      "Lungs mature — full lung maturity by week 36–38",
      "By week 40, average weight is 3.2–3.5 kg",
    ],
    body:[
      "Shortness of breath as baby pushes against diaphragm",
      "Difficulty sleeping — frequent position changes needed",
      "Pelvic pressure and 'lightning crotch' (nerve pain)",
      "Colostrum (first milk) may leak from breasts",
      "Increased Braxton Hicks — body practising for labour",
      "Nesting instinct — urge to clean and organise",
      "Oedema (swelling) in feet and ankles worsens",
    ],
    workouts:[
      {name:"Walking",            duration:"20–30 min", intensity:"Light",    safe:true },
      {name:"Prenatal Yoga",      duration:"30 min",    intensity:"Gentle",   safe:true },
      {name:"Swimming",           duration:"20–30 min", intensity:"Light",    safe:true },
      {name:"Pelvic Floor Kegels",duration:"10 min",    intensity:"Very low", safe:true },
      {name:"Birthing Ball",      duration:"15 min",    intensity:"Very low", safe:true },
      {name:"Strenuous exercise", duration:"Avoid",     intensity:"High",     safe:false},
      {name:"Lying on back",      duration:"Avoid",     intensity:"—",        safe:false},
    ],
    nutrition:[
      {item:"Vitamin K",        why:"Blood clotting for mother and baby at birth",      foods:"Broccoli, patta gobhi, palak, eggs"},
      {item:"Choline",          why:"Baby's brain development in final weeks",           foods:"Eggs, chicken, fish, wheat germ, mungfali"},
      {item:"Iron",             why:"Prepare for blood loss during delivery",            foods:"Continue iron-rich diet + supplement as prescribed"},
      {item:"Collagen/Protein", why:"Perineum elasticity for birth",                    foods:"Bone broth, fish, chicken, eggs, dal"},
      {item:"Dates (Khajoor)",  why:"Studies show 6 dates/day may ease labour onset",   foods:"6 Medjool dates daily from week 36 onwards"},
      {item:"Healthy fats",     why:"Baby's brain and nervous system final development", foods:"Avocado, badam, olive oil, nariyal, salmon"},
    ],
    avoid:[
      "Lying flat on your back — always lie on left side",
      "Overeating in one sitting (increases heartburn massively)",
      "Strenuous travel after week 36",
      "Stress and anxiety (cortisol affects baby too)",
      "Skipping prenatal appointments in this critical window",
    ],
    symptoms:[
      {s:"Shortness of breath",  tip:"Sleep propped up with pillows. Baby drops around week 36."},
      {s:"Insomnia",             tip:"Left-side sleeping + pregnancy pillow. Warm milk helps."},
      {s:"Pelvic pain/SPD",      tip:"Avoid wide-leg movements. Physio belt can help."},
      {s:"Heartburn",            tip:"Small meals, no eating 3h before bed, sleep head elevated."},
      {s:"Anxiety about birth",  tip:"Attend antenatal class. Write birth plan. Talk to midwife."},
      {s:"Swelling",             tip:"Rest, elevate feet, stay cool, reduce salt intake."},
    ],
    appointments:[
      "Weekly appointments from week 36 onwards",
      "Group B Streptococcus (GBS) swab test — week 35–37",
      "Foetal position check — confirm baby is head-down",
      "NST (Non-Stress Test) if overdue or high risk",
      "Hospital bag ready by week 36",
      "Birth plan discussion finalised",
    ],
    redFlags:[
      "No foetal movement for 12+ hours (do kick counts!)",
      "Signs of labour before 37 weeks (preterm labour)",
      "Sudden severe headache, vision changes, upper abdominal pain",
      "Heavy vaginal bleeding at any point",
      "Fluid gushing (possible membrane rupture) without contractions",
    ],
    partner:[
      "Pack the hospital bag together by week 36",
      "Download a contraction timer app — you'll need it",
      "Attend ALL third trimester appointments",
      "Prepare a calm playlist for the labour room",
      "Learn breathing techniques to guide her through contractions",
      "Know the route to hospital and have petrol in the car",
    ],
    sleep:[
      {tip:"LEFT side sleeping is essential — improves blood flow to baby", safe:true},
      {tip:"U-shaped pregnancy pillow between knees and under bump", safe:true},
      {tip:"Semi-reclined position helps with shortness of breath", safe:true},
      {tip:"Sleeping on back is NOT safe in T3 — risk of stillbirth increases", safe:false},
      {tip:"Sleeping on stomach is impossible and not recommended", safe:false},
    ],
    ayurveda:[
      {item:"Dates (Khajoor)",  use:"6/day from week 36 — may soften cervix and shorten labour"},
      {item:"Raspberry leaf tea",use:"From week 36 — traditionally used to tone uterus (consult OB)"},
      {item:"Warm sesame oil",  use:"Gentle perineal massage from week 36 with warm til oil"},
      {item:"Saffron (Kesar)",  use:"Kesar doodh — 2-3 strands in warm milk — safe and traditional"},
    ],
  },
];

const POSTPARTUM = {
  physical:[
    "Lochia (postpartum bleeding) for 4–6 weeks — normal",
    "Perineal soreness if vaginal birth — ice pack and sitz baths",
    "C-section recovery: avoid lifting for 6 weeks",
    "Night sweats as hormones readjust",
    "Hair loss at 3–4 months postpartum — temporary, don't panic",
    "Pelvic floor weakness — start Kegels gently from day 1",
  ],
  mental:[
    "Baby blues (days 2–5): weepiness, mood swings — normal, passes",
    "Postpartum depression (PPD): persistent sadness beyond 2 weeks — seek help",
    "Postpartum anxiety: racing thoughts, fear of harm to baby — treatable",
    "Identity shift — becoming a mother is a huge psychological change",
    "Sleep deprivation amplifies all symptoms — rest is medicine",
  ],
  nutrition:[
    {item:"Calories",        why:"Extra 400–500 kcal/day if breastfeeding",   foods:"Nutrient-dense meals — not junk calories"},
    {item:"Iron",            why:"Replenish blood lost during delivery",        foods:"Red meat, palak, khajoor, liver"},
    {item:"Calcium",         why:"Prevent bone loss from breastfeeding",        foods:"Dahi, ragi, til, badam"},
    {item:"Omega-3",         why:"Reduces PPD risk, supports baby brain",       foods:"Fatty fish, akhrot, alsi, fish oil"},
    {item:"Lactation foods", why:"Support milk supply",                         foods:"Oats, methi, saunf, shatavari, garlic, gondh ke laddoo"},
    {item:"Hydration",       why:"Breastfeeding requires extra 750ml/day",      foods:"Paani, soups, nariyal pani, ajwain water"},
  ],
  workouts:[
    "Weeks 1–6: Rest, walking only, pelvic floor activation",
    "Week 6 (after clearance): Gentle core, light yoga, swimming",
    "Month 3+: Gradual return to full exercise",
    "Avoid high-impact until 12+ weeks (especially with diastasis recti)",
    "Always get clearance from your OB/midwife before resuming",
  ],
};

const LABOUR_SIGNS = [
  {sign:"Bloody show",               desc:"Pink/brown mucus discharge. Labour usually within 24–72h.", urgent:false},
  {sign:"Water breaking",            desc:"Gush or trickle of clear fluid. Go to hospital promptly.",  urgent:true },
  {sign:"Regular contractions",      desc:"Every 5 min for 1h, lasting 60 sec. Time and call doctor.", urgent:true },
  {sign:"Nesting urge spike",        desc:"Sudden burst of energy and urge to clean. Labour approaching.", urgent:false},
  {sign:"Pelvic pressure increases", desc:"Baby has dropped into the pelvis (lightening). Hours to weeks.", urgent:false},
  {sign:"Back pain + contractions",  desc:"Posterior labour — baby may be back-to-back. Inform midwife.", urgent:true },
];

const HOSPITAL_BAG = {
  mother:[
    {item:"Birth plan (2 copies)", checked:false},
    {item:"Hospital notes / antenatal folder", checked:false},
    {item:"ID and insurance card", checked:false},
    {item:"Comfortable nightgown (front-open for breastfeeding)", checked:false},
    {item:"Nursing bra × 2", checked:false},
    {item:"Maternity pads × 2 packs", checked:false},
    {item:"Toiletries: toothbrush, shampoo, lip balm", checked:false},
    {item:"Snacks for labour: dates, energy bars, nimbu pani", checked:false},
    {item:"Phone charger", checked:false},
    {item:"Comfortable going-home outfit (maternity size)", checked:false},
    {item:"Slippers and warm socks", checked:false},
    {item:"Pillow from home (for comfort)", checked:false},
  ],
  baby:[
    {item:"Onesie × 3 (newborn size)", checked:false},
    {item:"Swaddle blankets × 2", checked:false},
    {item:"Baby hat and mittens", checked:false},
    {item:"Nappies/diapers (newborn size)", checked:false},
    {item:"Baby wipes (sensitive skin)", checked:false},
    {item:"Car seat (installed and checked)", checked:false},
    {item:"Baby nail file", checked:false},
  ],
  partner:[
    {item:"Change of clothes × 2", checked:false},
    {item:"Snacks and drinks for yourself", checked:false},
    {item:"Camera / phone charged", checked:false},
    {item:"Playlist / entertainment for long labour", checked:false},
    {item:"Cash for parking and vending", checked:false},
    {item:"This app open and contraction timer ready 😊", checked:false},
  ],
};

const BIRTH_PLAN_TEMPLATE = {
  environment:["Dim lighting","Soft music","Minimal interruptions","Partner present at all times","Medical students NOT permitted"],
  pain:["Try natural methods first (breathing, massage, birthing ball)","Open to epidural if needed","No pethidine / opioids","Gas and air (Entonox) welcome"],
  labour:["Freedom to move and change positions","Intermittent monitoring (not continuous CTG)","Delayed cord clamping","Skin-to-skin immediately after birth","Water birth if available"],
  delivery:["Avoid episiotomy if possible — prefer to tear naturally","Partner to cut cord","Baby placed on chest immediately","No routine suctioning of baby"],
  postbirth:["Breastfeed as soon as possible","Delayed first bath (at least 24h)","Vitamin K for baby — oral preferred","Rooming-in (baby stays with me)"],
};

// ── Main Component ──────────────────────────────────────────────────────────
export default function PregnancyGuide() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user } = useUser();

  const [mounted,     setMounted]     = useState(false);
  const [activeTri,   setActiveTri]   = useState(0);
  const [activeTab,   setActiveTab]   = useState("baby");
  const [activeSection, setActiveSection] = useState("guide"); // guide|tools|bag|birthplan|journal
  const [showPost,    setShowPost]    = useState(false);
  const [showLabour,  setShowLabour]  = useState(false);
  const [week,        setWeek]        = useState(null);

  // Kick counter
  const [kicks,       setKicks]       = useState([]);
  const [kickSession, setKickSession] = useState(false);
  const [kickStart,   setKickStart]   = useState(null);

  // Contraction timer
  const [contractions,    setContractions]    = useState([]);
  const [contrActive,     setContrActive]     = useState(false);
  const [contrStart,      setContrStart]      = useState(null);
  const [contrInterval,   setContrInterval]   = useState(null);
  const [contrElapsed,    setContrElapsed]    = useState(0);
  const contrTimerRef = useRef(null);

  // Weight tracker
  const [weights,     setWeights]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("pg_weights")||"[]"); } catch { return []; }
  });
  const [weightInput, setWeightInput] = useState("");

  // Hospital bag
  const [bag,         setBag]         = useState(() => {
    try { return JSON.parse(localStorage.getItem("pg_bag")||JSON.stringify(HOSPITAL_BAG)); }
    catch { return JSON.parse(JSON.stringify(HOSPITAL_BAG)); }
  });

  // Birth plan
  const [plan,        setPlan]        = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pg_plan")||"null");
      if (saved) return saved;
    } catch {}
    const init = {};
    Object.entries(BIRTH_PLAN_TEMPLATE).forEach(([k,v]) => { init[k] = v.map(i => ({text:i,on:true})); });
    return init;
  });

  // Journal
  const [journal,     setJournal]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("pg_journal")||"[]"); } catch { return []; }
  });
  const [journalText, setJournalText] = useState("");
  const [journalMood, setJournalMood] = useState("😊");

  useEffect(() => { setMounted(true); }, []);

  // Persist
  useEffect(() => { localStorage.setItem("pg_weights", JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem("pg_bag",     JSON.stringify(bag));     }, [bag]);
  useEffect(() => { localStorage.setItem("pg_plan",    JSON.stringify(plan));    }, [plan]);
  useEffect(() => { localStorage.setItem("pg_journal", JSON.stringify(journal)); }, [journal]);

  useEffect(() => {
    if (!week) return;
    setActiveTri(week<=12?0:week<=26?1:2);
  }, [week]);

  // Contraction timer
  useEffect(() => {
    if (contrActive) {
      contrTimerRef.current = setInterval(() => setContrElapsed(e => e+1), 1000);
    } else {
      clearInterval(contrTimerRef.current);
    }
    return () => clearInterval(contrTimerRef.current);
  }, [contrActive]);

  const startContraction = () => {
    setContrActive(true);
    setContrStart(Date.now());
    setContrElapsed(0);
  };

  const stopContraction = () => {
    setContrActive(false);
    const duration = contrElapsed;
    const now      = Date.now();
    setContractions(prev => {
      const gap = prev.length ? Math.round((now - prev[prev.length-1].endTime)/1000) : null;
      return [...prev, {duration, startTime:contrStart, endTime:now, gap, time:new Date().toLocaleTimeString()}];
    });
  };

  const avgGap = contractions.length>1
    ? Math.round(contractions.slice(-5).filter(c=>c.gap).reduce((a,c)=>a+c.gap,0)/contractions.filter(c=>c.gap).length)
    : null;
  const avgDur = contractions.length
    ? Math.round(contractions.slice(-5).reduce((a,c)=>a+c.duration,0)/Math.min(contractions.length,5))
    : null;

  // Kick counter
  const startKickSession = () => { setKickSession(true); setKicks([]); setKickStart(Date.now()); };
  const logKick = () => { setKicks(prev => [...prev, Date.now()]); };
  const kickElapsed = kickStart ? Math.floor((Date.now()-kickStart)/60000) : 0;

  const tri = TRIMESTERS[activeTri];

  const TABS = [
    {id:"baby",         label:"👶 Baby"},
    {id:"body",         label:"🩺 Body"},
    {id:"workout",      label:"🏃 Exercise"},
    {id:"nutrition",    label:"🥗 Nutrition"},
    {id:"avoid",        label:"🚫 Avoid"},
    {id:"symptoms",     label:"💊 Symptoms"},
    {id:"appointments", label:"📋 Checkups"},
    {id:"partner",      label:"💑 Partner"},
    {id:"sleep",        label:"😴 Sleep"},
    {id:"ayurveda",     label:"🌿 Ayurveda"},
    {id:"redflags",     label:"🚨 Red Flags"},
  ];

  const SECTIONS = [
    {id:"guide",     label:"📖 Guide",          icon:"📖"},
    {id:"tools",     label:"🛠 Tools",           icon:"🛠"},
    {id:"bag",       label:"🧳 Hospital Bag",    icon:"🧳"},
    {id:"birthplan", label:"📝 Birth Plan",      icon:"📝"},
    {id:"journal",   label:"💌 Journal",         icon:"💌"},
  ];

  const bagTotal   = Object.values(bag).flat().length;
  const bagChecked = Object.values(bag).flat().filter(i=>i.checked).length;
  const planTotal  = Object.values(plan).flat().length;
  const planOn     = Object.values(plan).flat().filter(i=>i.on).length;

  const toggleBag = (cat, idx) => {
    setBag(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n[cat][idx].checked = !n[cat][idx].checked;
      return n;
    });
  };
  const togglePlan = (cat, idx) => {
    setPlan(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n[cat][idx].on = !n[cat][idx].on;
      return n;
    });
  };

  const addWeight = () => {
    if (!weightInput) return;
    setWeights(prev => [...prev, {w:+weightInput, date:new Date().toLocaleDateString("en-IN"), wk:week||"?"}]);
    setWeightInput("");
  };
  const addJournal = () => {
    if (!journalText.trim()) return;
    setJournal(prev => [{text:journalText.trim(), mood:journalMood, date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"}), wk:week||"?", id:Date.now()}, ...prev]);
    setJournalText("");
  };

  const PINK = "#f472b6";
  const css = generateCSS(T, dark) + `
    .pg-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity .6s ease,background .4s;}

    /* ── Header ── */
    .pg-hd{display:flex;align-items:center;justify-content:space-between;
      padding:13px 26px;
      background:${dark?"rgba(8,8,14,0.92)":"rgba(255,255,255,0.92)"};
      border-bottom:1px solid ${T.glassBorder};backdrop-filter:blur(40px);
      position:sticky;top:0;z-index:40;}
    .pg-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.textSub};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all .16s;}
    .pg-back:hover{color:${PINK};border-color:${PINK}50;}
    .pg-brand{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .pg-brand span{color:${PINK};}
    .pg-toggle{width:48px;height:26px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};cursor:pointer;position:relative;}
    .pg-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:${PINK};
      display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left .2s;left:${dark?"24px":"2px"};}

    /* ── Page wrapper ── */
    .pg-page{max-width:1020px;margin:0 auto;padding:28px 22px 80px;}

    /* ── Hero ── */
    .pg-hero{text-align:center;padding:32px 22px 24px;margin-bottom:24px;
      border-radius:22px;position:relative;overflow:hidden;
      background:${dark
        ?"linear-gradient(135deg,rgba(244,114,182,0.10),rgba(167,139,250,0.07))"
        :"linear-gradient(135deg,rgba(244,114,182,0.08),rgba(167,139,250,0.05))"};
      border:1px solid rgba(244,114,182,0.20);}
    .pg-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;
      background:radial-gradient(circle,rgba(244,114,182,0.14),transparent 65%);pointer-events:none;}
    .pg-hero-title{font-family:${FONT.display};font-size:30px;font-weight:800;
      letter-spacing:-.02em;color:${T.text};margin-bottom:7px;}
    .pg-hero-title span{background:linear-gradient(135deg,${PINK},#a78bfa);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .pg-hero-sub{font-size:13.5px;color:${T.textSub};max-width:460px;margin:0 auto 18px;line-height:1.65;}
    .week-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}
    .week-label{font-size:13px;color:${T.textSub};font-weight:600;}
    .week-inp{width:76px;padding:8px 10px;border-radius:10px;text-align:center;
      border:1.5px solid rgba(244,114,182,0.35);
      background:${dark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.85)"};
      color:${T.text};font-size:14px;font-weight:800;font-family:${FONT.body};outline:none;}
    .week-inp:focus{border-color:${PINK};}
    .week-badge{padding:6px 14px;border-radius:99px;font-size:12px;font-weight:800;
      background:rgba(244,114,182,0.14);border:1px solid rgba(244,114,182,0.28);color:${PINK};}

    /* ── Nav section pills ── */
    .pg-nav{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:22px;}
    .pg-navbtn{padding:9px 16px;border-radius:12px;font-size:12.5px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.65)"};
      color:${T.textSub};transition:all .2s cubic-bezier(.34,1.56,.64,1);}
    .pg-navbtn:hover{transform:translateY(-2px);}
    .pg-navbtn.act{background:linear-gradient(135deg,${PINK},#a78bfa);color:#fff;border-color:transparent;
      box-shadow:0 4px 14px rgba(244,114,182,0.35);}

    /* ── Quick action pills ── */
    .pg-quick{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:22px;}
    .pg-qbtn{padding:8px 16px;border-radius:99px;font-size:12px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};border:1.5px solid;
      transition:all .2s cubic-bezier(.34,1.56,.64,1);}
    .pg-qbtn:hover{transform:translateY(-2px);}

    /* ── Trimester tabs ── */
    .tri-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
    .tri-tab{padding:14px 10px;border-radius:16px;border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.60)"};
      cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);
      text-align:center;position:relative;overflow:hidden;}
    .tri-tab::before{content:'';position:absolute;inset:0;border-radius:16px;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.06":"0.45"}) 0%,transparent 45%);pointer-events:none;}
    .tri-tab:hover{transform:translateY(-3px);}
    .tri-tab.active{border-color:var(--tc);
      box-shadow:0 0 0 1px var(--tc)30,0 10px 28px var(--tc)18,
        inset 0 1px 0 rgba(255,255,255,${dark?"0.14":"0.88"});}
    .tri-emoji{font-size:26px;margin-bottom:7px;display:block;}
    .tri-name{font-family:${FONT.display};font-size:13.5px;font-weight:800;margin-bottom:2px;color:${T.text};}
    .tri-weeks{font-size:10.5px;color:${T.textSub};}
    .tri-tagline{font-size:10.5px;color:${T.textMuted};margin-top:5px;line-height:1.4;}

    /* ── Glass card ── */
    .gc{background:${dark
        ?"linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))"
        :"linear-gradient(160deg,rgba(255,255,255,0.83),rgba(255,255,255,0.56))"};
      border:1px solid ${T.glassBorder};border-radius:20px;
      backdrop-filter:blur(44px);
      box-shadow:inset 0 1.5px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.92)"},
        0 4px 18px rgba(0,0,0,${dark?"0.17":"0.06"});
      padding:20px;margin-bottom:14px;position:relative;overflow:hidden;}
    .gc::before{content:'';position:absolute;inset:0;border-radius:20px;pointer-events:none;
      background:linear-gradient(125deg,rgba(255,255,255,${dark?"0.07":"0.42"}) 0%,transparent 35%);}
    .gc>*{position:relative;z-index:1;}
    .gc-title{font-family:${FONT.display};font-size:15px;font-weight:800;
      color:${T.text};margin-bottom:14px;display:flex;align-items:center;gap:8px;}
    .gc-sub{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:${T.textMuted};margin-bottom:12px;}

    /* ── Inner tabs ── */
    .inner-tabs{display:flex;gap:4px;flex-wrap:wrap;overflow-x:auto;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};border-radius:13px;
      padding:4px;margin-bottom:18px;}
    .inner-tab{padding:7px 11px;border-radius:9px;border:none;background:transparent;
      color:${T.textSub};font-size:11px;font-weight:700;
      font-family:${FONT.body};cursor:pointer;transition:all .16s;white-space:nowrap;}
    .inner-tab:hover{color:${T.text};}
    .inner-tab.act{background:${dark?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.90)"};color:${T.text};
      box-shadow:0 2px 8px rgba(0,0,0,${dark?"0.18":"0.06"});}

    /* ── List ── */
    .pg-list{list-style:none;padding:0;margin:0;}
    .pg-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13.5px;color:${T.textSub};line-height:1.55;}
    .pg-item:last-child{border-bottom:none;}
    .pg-bullet{width:22px;height:22px;border-radius:7px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;margin-top:1px;}

    /* ── Nutrition ── */
    .nut-row{display:grid;grid-template-columns:130px 1fr 1fr;gap:10px;
      padding:10px 0;border-bottom:1px solid ${T.glassBorder};align-items:start;}
    .nut-row:last-child{border-bottom:none;}
    .nut-item{font-size:13px;font-weight:800;color:${T.text};}
    .nut-why{font-size:12px;color:${T.textSub};line-height:1.45;}
    .nut-foods{font-size:11.5px;color:${T.textMuted};line-height:1.45;}

    /* ── Workout cards ── */
    .wo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px;}
    .wo-card{padding:14px;border-radius:13px;border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.70)"};
      text-align:center;transition:all .2s;}
    .wo-card:hover{transform:translateY(-2px);}
    .wo-card.safe{border-color:rgba(48,209,88,0.28);background:rgba(48,209,88,0.05);}
    .wo-card.unsafe{border-color:rgba(255,69,58,0.22);background:rgba(255,69,58,0.05);}
    .wo-name{font-size:12.5px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .wo-dur{font-size:11px;color:${T.textSub};}
    .wo-int{font-size:10.5px;font-weight:700;margin-top:6px;padding:2px 8px;border-radius:99px;}

    /* ── Symptoms ── */
    .sym-row{display:flex;align-items:flex-start;gap:11px;padding:11px 0;
      border-bottom:1px solid ${T.glassBorder};}
    .sym-row:last-child{border-bottom:none;}
    .sym-name{font-size:13px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .sym-tip{font-size:12.5px;color:${T.textSub};line-height:1.55;}

    /* ── Sleep cards ── */
    .sleep-row{display:flex;align-items:flex-start;gap:11px;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};}
    .sleep-row:last-child{border-bottom:none;}

    /* ── Ayurveda ── */
    .ay-row{display:flex;align-items:flex-start;gap:11px;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};}
    .ay-row:last-child{border-bottom:none;}
    .ay-item{font-size:13px;font-weight:800;color:#34d399;width:110px;flex-shrink:0;}
    .ay-use{font-size:12.5px;color:${T.textSub};line-height:1.5;}

    /* ── Red flags ── */
    .rf-item{display:flex;align-items:flex-start;gap:10px;padding:9px 13px;border-radius:11px;
      margin-bottom:7px;background:rgba(255,69,58,0.07);border:1px solid rgba(255,69,58,0.18);
      font-size:13px;color:${T.text};line-height:1.5;}

    /* ── Partner ── */
    .partner-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;
      border-bottom:1px solid ${T.glassBorder};font-size:13.5px;color:${T.textSub};line-height:1.55;}
    .partner-item:last-child{border-bottom:none;}

    /* ── Labour ── */
    .labour-card{border-radius:16px;overflow:hidden;margin-bottom:10px;border:1.5px solid;}
    .labour-hd{padding:12px 16px;display:flex;align-items:center;gap:10px;}
    .labour-sign{font-size:13.5px;font-weight:800;color:${T.text};flex:1;}
    .labour-desc{padding:0 16px 12px;font-size:13px;color:${T.textSub};line-height:1.6;}
    .urgent-tag{padding:3px 9px;border-radius:99px;font-size:9.5px;font-weight:800;
      text-transform:uppercase;letter-spacing:.06em;flex-shrink:0;}

    /* ── Postpartum ── */
    .post-section{border-radius:18px;padding:20px;margin-top:20px;
      background:${dark?"rgba(52,211,153,0.07)":"rgba(52,211,153,0.05)"};
      border:1px solid rgba(52,211,153,0.22);}
    .post-title{font-family:${FONT.display};font-size:17px;font-weight:800;color:#34d399;margin-bottom:14px;}
    .sec-hd{font-family:${FONT.display};font-size:12px;font-weight:800;
      color:${T.textMuted};letter-spacing:.1em;text-transform:uppercase;margin:16px 0 9px;
      display:flex;align-items:center;gap:7px;}

    /* ── TOOLS ── */
    .tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}

    /* Kick counter */
    .kick-counter{text-align:center;padding:10px 0;}
    .kick-number{font-family:${FONT.display};font-size:72px;font-weight:800;
      color:${PINK};line-height:1;margin-bottom:6px;}
    .kick-btn{padding:14px 32px;border-radius:99px;border:none;
      background:linear-gradient(135deg,${PINK},#a78bfa);color:#fff;
      font-size:16px;font-weight:800;font-family:${FONT.body};cursor:pointer;
      transition:all .2s cubic-bezier(.34,1.56,.64,1);
      box-shadow:0 6px 22px rgba(244,114,182,0.40);}
    .kick-btn:hover{transform:scale(1.05);}
    .kick-btn:active{transform:scale(0.97);}
    .kick-small-btn{padding:8px 18px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:transparent;color:${T.textSub};font-size:12px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};margin-top:10px;}

    /* Contraction timer */
    .contr-time{font-family:${FONT.display};font-size:52px;font-weight:800;
      color:${contrActive?"#ff453a":"#fb923c"};text-align:center;line-height:1;margin-bottom:8px;}
    .contr-btn{width:100%;padding:14px;border-radius:14px;border:none;
      font-size:14px;font-weight:800;font-family:${FONT.body};cursor:pointer;
      transition:all .2s;margin-top:10px;}
    .contr-btn.start{background:linear-gradient(135deg,#fb923c,#f472b6);color:#fff;
      box-shadow:0 5px 18px rgba(251,146,60,0.35);}
    .contr-btn.stop{background:linear-gradient(135deg,#ff453a,#fb923c);color:#fff;
      box-shadow:0 5px 18px rgba(255,69,58,0.35);}
    .contr-stat{display:flex;gap:10px;margin-top:12px;}
    .contr-stat-box{flex:1;text-align:center;padding:10px;border-radius:12px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      border:1px solid ${T.glassBorder};}
    .contr-stat-v{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};}
    .contr-stat-l{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-top:2px;}
    .contr-row{display:flex;align-items:center;justify-content:space-between;
      padding:8px 0;border-bottom:1px solid ${T.glassBorder};font-size:12px;color:${T.textSub};}
    .contr-row:last-child{border-bottom:none;}

    /* Weight tracker */
    .wt-inp-row{display:flex;gap:8px;margin-bottom:14px;}
    .wt-inp{flex:1;padding:9px 13px;border-radius:11px;
      border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.80)"};
      color:${T.text};font-size:14px;font-family:${FONT.body};outline:none;}
    .wt-inp:focus{border-color:${PINK}50;}
    .wt-add{padding:9px 18px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${PINK},#a78bfa);color:#fff;
      font-size:12.5px;font-weight:700;font-family:${FONT.body};cursor:pointer;}
    .wt-row{display:flex;align-items:center;justify-content:space-between;
      padding:8px 0;border-bottom:1px solid ${T.glassBorder};font-size:13px;}
    .wt-row:last-child{border-bottom:none;}

    /* ── Hospital bag ── */
    .bag-progress{height:8px;background:${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"};
      border-radius:99px;overflow:hidden;margin-bottom:18px;}
    .bag-fill{height:100%;border-radius:99px;
      background:linear-gradient(90deg,${PINK},#a78bfa);
      transition:width .5s cubic-bezier(.4,0,.2,1);}
    .bag-cat-title{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
      color:${T.textMuted};margin:16px 0 8px;display:flex;align-items:center;gap:7px;}
    .bag-item{display:flex;align-items:center;gap:11px;padding:9px 0;
      border-bottom:1px solid ${T.glassBorder};cursor:pointer;font-size:13.5px;
      color:${T.textSub};transition:all .15s;}
    .bag-item:last-child{border-bottom:none;}
    .bag-item:hover{padding-left:4px;}
    .bag-cb{width:22px;height:22px;border-radius:7px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:800;transition:all .2s;}
    .bag-cb.on{background:${PINK};color:#fff;box-shadow:0 2px 8px rgba(244,114,182,0.4);}
    .bag-cb.off{background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};color:${T.textMuted};}
    .bag-txt.done{text-decoration:line-through;color:${T.textMuted};}

    /* ── Birth plan ── */
    .plan-cat-title{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
      color:${T.textMuted};margin:16px 0 8px;}
    .plan-item{display:flex;align-items:center;gap:10px;padding:9px 0;
      border-bottom:1px solid ${T.glassBorder};cursor:pointer;font-size:13.5px;
      color:${T.textSub};transition:all .15s;}
    .plan-item:last-child{border-bottom:none;}
    .plan-item:hover{padding-left:4px;}
    .plan-toggle{width:22px;height:22px;border-radius:7px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:800;transition:all .2s;}
    .plan-toggle.on{background:#a78bfa;color:#fff;box-shadow:0 2px 8px rgba(167,139,250,0.4);}
    .plan-toggle.off{background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"};color:${T.textMuted};}
    .plan-txt.off{text-decoration:line-through;color:${T.textMuted};opacity:0.5;}

    /* ── Journal ── */
    .jrnl-row{display:flex;gap:8px;margin-bottom:14px;}
    .jrnl-inp{flex:1;padding:10px 14px;border-radius:12px;resize:none;
      border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.80)"};
      color:${T.text};font-size:13.5px;font-family:${FONT.body};outline:none;min-height:72px;}
    .jrnl-inp:focus{border-color:${PINK}50;}
    .jrnl-mood-row{display:flex;gap:6px;margin-bottom:10px;}
    .jrnl-mood{width:36px;height:36px;border-radius:10px;font-size:18px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      border:2px solid transparent;transition:all .15s;}
    .jrnl-mood.sel{border-color:${PINK};background:rgba(244,114,182,0.12);transform:scale(1.1);}
    .jrnl-add{padding:10px 20px;border-radius:11px;border:none;
      background:linear-gradient(135deg,${PINK},#a78bfa);color:#fff;
      font-size:12.5px;font-weight:700;font-family:${FONT.body};cursor:pointer;margin-top:4px;}
    .jrnl-entry{padding:14px;border-radius:14px;margin-bottom:10px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.75)"};
      border:1px solid ${T.glassBorder};}
    .jrnl-meta{display:flex;align-items:center;gap:8px;margin-bottom:7px;font-size:11px;color:${T.textMuted};}
    .jrnl-text{font-size:13.5px;color:${T.textSub};line-height:1.6;}

    /* ── Disclaimer ── */
    .disclaimer{padding:13px 16px;border-radius:13px;margin-top:24px;
      background:${dark?"rgba(255,159,10,0.07)":"rgba(255,159,10,0.06)"};
      border:1px solid rgba(255,159,10,0.22);font-size:12.5px;color:${T.textSub};line-height:1.65;}
    .disclaimer strong{color:${T.orange};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    .fadeUp{animation:fadeUp .45s ease both;}

    @media(max-width:768px){
      .pg-page{padding:18px 13px 50px;}
      .tri-tabs{grid-template-columns:1fr;}
      .nut-row{grid-template-columns:1fr;}
      .wo-grid{grid-template-columns:1fr 1fr;}
      .tool-grid{grid-template-columns:1fr;}
      .pg-hd{padding:12px 14px;}
      .inner-tabs{flex-wrap:nowrap;}
      .pg-hero-title{font-size:24px;}
    }
  `;

  const fmtSec = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <>
      <style>{css}</style>
      <div className="pg-root">
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 65%)"}}/>
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)"}}/>

        {/* Header */}
        <div className="pg-hd">
          <button className="pg-back" onClick={() => navigate("/female-health")}>← Women's Health</button>
          <div className="pg-brand">AshFit<span>Verse</span></div>
          <button className="pg-toggle" onClick={toggleTheme}>
            <div className="pg-thumb">{dark?"🌙":"☀️"}</div>
          </button>
        </div>

        <div className="pg-page">

          {/* Hero */}
          <div className="pg-hero fadeUp">
            <div style={{fontSize:44,marginBottom:9}}>🤰</div>
            <div className="pg-hero-title">Pregnancy <span>Companion</span></div>
            <div className="pg-hero-sub">Your complete trimester guide, tools, and tracker — all in one seamless space.</div>
            <div className="week-row">
              <span className="week-label">I'm in week</span>
              <input type="number" min={1} max={42} className="week-inp" placeholder="—"
                value={week||""} onChange={e => setWeek(+e.target.value||null)}/>
              {week && <span className="week-badge">{week<=12?"1st Trimester":week<=26?"2nd Trimester":"3rd Trimester"}</span>}
            </div>
          </div>

          {/* Section nav */}
          <div className="pg-nav">
            {SECTIONS.map(s => (
              <button key={s.id} className={`pg-navbtn ${activeSection===s.id?"act":""}`}
                onClick={() => setActiveSection(s.id)}>
                {s.label}
              </button>
            ))}
          </div>

          {/* ──────────── GUIDE SECTION ──────────── */}
          {activeSection === "guide" && (
            <>
              {/* Quick actions */}
              <div className="pg-quick">
                {[
                  {label:"🚨 Labour Signs", action:()=>{setShowLabour(v=>!v);setShowPost(false);}, active:showLabour, color:"#ff453a"},
                  {label:"🌺 After Birth",  action:()=>{setShowPost(v=>!v);setShowLabour(false);}, active:showPost,   color:"#34d399"},
                  {label:"📞 Emergency",    action:()=>{window.open("tel:112");},                  active:false,      color:"#ff9f0a"},
                ].map((b,i) => (
                  <button key={i} className="pg-qbtn"
                    style={{borderColor:`${b.color}40`,color:b.active?b.color:T.textSub,background:b.active?`${b.color}12`:"transparent"}}
                    onClick={b.action}>{b.label}</button>
                ))}
              </div>

              {/* Labour signs */}
              {showLabour && (
                <div className="gc fadeUp" style={{marginBottom:18}}>
                  <div className="gc-title">🚨 Signs of Labour</div>
                  {LABOUR_SIGNS.map((l,i) => (
                    <div key={i} className="labour-card"
                      style={{borderColor:l.urgent?"rgba(255,69,58,0.28)":"rgba(255,159,10,0.22)",background:l.urgent?"rgba(255,69,58,0.05)":"rgba(255,159,10,0.04)"}}>
                      <div className="labour-hd">
                        <span>{l.urgent?"🔴":"🟡"}</span>
                        <span className="labour-sign">{l.sign}</span>
                        <span className="urgent-tag"
                          style={{background:l.urgent?"rgba(255,69,58,0.14)":"rgba(255,159,10,0.14)",color:l.urgent?"#ff453a":"#ff9f0a",border:`1px solid ${l.urgent?"rgba(255,69,58,0.30)":"rgba(255,159,10,0.28)"}`}}>
                          {l.urgent?"Go to hospital":"Monitor"}
                        </span>
                      </div>
                      <div className="labour-desc">{l.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Postpartum */}
              {showPost && (
                <div className="post-section fadeUp" style={{marginBottom:18}}>
                  <div className="post-title">🌺 After Birth — The 4th Trimester</div>
                  <div className="sec-hd" style={{color:"#34d399"}}>🩺 Physical Recovery</div>
                  <ul className="pg-list">
                    {POSTPARTUM.physical.map((p,i) => (
                      <li key={i} className="pg-item">
                        <span className="pg-bullet" style={{background:"rgba(52,211,153,0.14)",color:"#34d399"}}>✓</span>{p}
                      </li>
                    ))}
                  </ul>
                  <div className="sec-hd" style={{color:"#a78bfa"}}>🧠 Mental Health</div>
                  <ul className="pg-list">
                    {POSTPARTUM.mental.map((p,i) => (
                      <li key={i} className="pg-item">
                        <span className="pg-bullet" style={{background:"rgba(167,139,250,0.14)",color:"#a78bfa"}}>♥</span>{p}
                      </li>
                    ))}
                  </ul>
                  <div className="sec-hd" style={{color:"#fb923c"}}>🥗 Postpartum Nutrition</div>
                  {POSTPARTUM.nutrition.map((n,i) => (
                    <div key={i} className="nut-row">
                      <div className="nut-item">{n.item}</div>
                      <div className="nut-why">{n.why}</div>
                      <div className="nut-foods">🍽 {n.foods}</div>
                    </div>
                  ))}
                  <div className="sec-hd" style={{color:"#34d399"}}>🏃 Return to Exercise</div>
                  <ul className="pg-list">
                    {POSTPARTUM.workouts.map((w,i) => (
                      <li key={i} className="pg-item">
                        <span className="pg-bullet" style={{background:"rgba(52,211,153,0.12)",color:"#34d399"}}>→</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trimester tabs */}
              <div className="tri-tabs">
                {TRIMESTERS.map((t,i) => (
                  <div key={t.id} className={`tri-tab ${activeTri===i?"active":""}`}
                    style={{"--tc":t.color}} onClick={() => {setActiveTri(i);setActiveTab("baby");}}>
                    <div style={{position:"relative",zIndex:1}}>
                      <span className="tri-emoji">{t.emoji}</span>
                      <div className="tri-name" style={{color:activeTri===i?t.color:T.text}}>{t.name}</div>
                      <div className="tri-weeks">{t.weeks}</div>
                      <div className="tri-tagline">{t.tagline}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inner tabs */}
              <div className="inner-tabs">
                {TABS.map(t => (
                  <button key={t.id} className={`inner-tab ${activeTab===t.id?"act":""}`}
                    onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* Content */}
              <div className="gc fadeUp" key={`${activeTri}-${activeTab}`}>

                {activeTab==="baby" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>{tri.emoji} Baby Development — {tri.weeks}</div>
                    <ul className="pg-list">
                      {tri.baby.map((b,i) => (
                        <li key={i} className="pg-item">
                          <span className="pg-bullet" style={{background:`${tri.color}15`,color:tri.color}}>✦</span>{b}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab==="body" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>🩺 What's Happening to Your Body</div>
                    <ul className="pg-list">
                      {tri.body.map((b,i) => (
                        <li key={i} className="pg-item">
                          <span className="pg-bullet" style={{background:`${tri.color}15`,color:tri.color}}>◎</span>{b}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab==="workout" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>🏃 Safe Exercise — {tri.name}</div>
                    <div style={{marginBottom:13,padding:"10px 14px",borderRadius:11,background:"rgba(48,209,88,0.08)",border:"1px solid rgba(48,209,88,0.20)",fontSize:12.5,color:T.textSub}}>
                      ✅ Always get clearance from your OB before starting or continuing exercise during pregnancy.
                    </div>
                    <div className="wo-grid">
                      {tri.workouts.map((w,i) => (
                        <div key={i} className={`wo-card ${w.safe?"safe":"unsafe"}`}>
                          <div style={{fontSize:20,marginBottom:6}}>{w.safe?"✅":"🚫"}</div>
                          <div className="wo-name">{w.name}</div>
                          <div className="wo-dur">{w.duration}</div>
                          <div className="wo-int" style={{color:w.safe?"#30d158":"#ff453a",background:w.safe?"rgba(48,209,88,0.12)":"rgba(255,69,58,0.12)"}}>
                            {w.intensity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab==="nutrition" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>🥗 Nutrition Focus — {tri.name}</div>
                    {tri.nutrition.map((n,i) => (
                      <div key={i} className="nut-row">
                        <div className="nut-item" style={{color:tri.color}}>{n.item}</div>
                        <div className="nut-why">{n.why}</div>
                        <div className="nut-foods">🍽 {n.foods}</div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="avoid" && (
                  <>
                    <div className="gc-title" style={{color:"#ff453a"}}>🚫 What to Avoid — {tri.name}</div>
                    <ul className="pg-list">
                      {tri.avoid.map((a,i) => (
                        <li key={i} className="pg-item">
                          <span className="pg-bullet" style={{background:"rgba(255,69,58,0.12)",color:"#ff453a"}}>✕</span>{a}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab==="symptoms" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>💊 Common Symptoms & Tips</div>
                    {tri.symptoms.map((s,i) => (
                      <div key={i} className="sym-row">
                        <span className="pg-bullet" style={{background:`${tri.color}15`,color:tri.color,width:24,height:24,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:800}}>{i+1}</span>
                        <div>
                          <div className="sym-name">{s.s}</div>
                          <div className="sym-tip">💡 {s.tip}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="appointments" && (
                  <>
                    <div className="gc-title" style={{color:tri.color}}>📋 Key Appointments & Tests</div>
                    {tri.appointments.map((a,i) => (
                      <div key={i} className="partner-item">
                        <span className="pg-bullet" style={{background:`${tri.color}15`,color:tri.color}}>✓</span>{a}
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="partner" && (
                  <>
                    <div className="gc-title" style={{color:"#a78bfa"}}>💑 Partner's Role — {tri.name}</div>
                    <div style={{padding:"10px 14px",borderRadius:11,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.22)",fontSize:12.5,color:T.textSub,marginBottom:13}}>
                      Share this with your partner — pregnancy is a team effort.
                    </div>
                    {tri.partner.map((p,i) => (
                      <div key={i} className="partner-item">
                        <span className="pg-bullet" style={{background:"rgba(167,139,250,0.14)",color:"#a78bfa"}}>💑</span>{p}
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="sleep" && (
                  <>
                    <div className="gc-title" style={{color:"#0a84ff"}}>😴 Sleep Positions — {tri.name}</div>
                    {tri.sleep.map((s,i) => (
                      <div key={i} className="sleep-row">
                        <span className="pg-bullet" style={{background:s.safe?"rgba(48,209,88,0.14)":"rgba(255,69,58,0.12)",color:s.safe?"#30d158":"#ff453a"}}>{s.safe?"✓":"✕"}</span>
                        <div style={{fontSize:13.5,color:T.textSub,lineHeight:1.55}}>{s.tip}</div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="ayurveda" && (
                  <>
                    <div className="gc-title" style={{color:"#34d399"}}>🌿 Ayurvedic & Traditional Remedies</div>
                    <div style={{padding:"10px 14px",borderRadius:11,background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.22)",fontSize:12.5,color:T.textSub,marginBottom:13}}>
                      Always consult your doctor before using any herbal remedy during pregnancy.
                    </div>
                    {tri.ayurveda.map((a,i) => (
                      <div key={i} className="ay-row">
                        <div className="ay-item">{a.item}</div>
                        <div className="ay-use">{a.use}</div>
                      </div>
                    ))}
                  </>
                )}

                {activeTab==="redflags" && (
                  <>
                    <div className="gc-title" style={{color:"#ff453a"}}>🚨 Call Your Doctor Immediately If…</div>
                    <div style={{padding:"10px 14px",borderRadius:11,background:"rgba(255,69,58,0.07)",border:"1px solid rgba(255,69,58,0.18)",fontSize:12.5,color:T.textSub,marginBottom:13}}>
                      These symptoms can indicate serious complications. Do NOT wait. Call your OB, midwife, or go to A&E.
                    </div>
                    {tri.redFlags.map((r,i) => (
                      <div key={i} className="rf-item"><span style={{fontSize:15,flexShrink:0}}>🔴</span>{r}</div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {/* ──────────── TOOLS SECTION ──────────── */}
          {activeSection === "tools" && (
            <>
              <div className="tool-grid">
                {/* Kick Counter */}
                <div className="gc">
                  <div className="gc-title" style={{color:PINK}}>👟 Kick Counter</div>
                  <div style={{fontSize:12,color:T.textSub,marginBottom:14,lineHeight:1.55}}>
                    Start a session and tap every time you feel baby move. 10 kicks in 2h is a healthy goal.
                  </div>
                  {!kickSession ? (
                    <button className="kick-btn" onClick={startKickSession}>Start Session</button>
                  ) : (
                    <div className="kick-counter">
                      <div className="kick-number">{kicks.length}</div>
                      <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>kicks • {kickElapsed} min elapsed</div>
                      <button className="kick-btn" onClick={logKick}>👟 Tap for Kick</button>
                      <br/>
                      <button className="kick-small-btn" onClick={() => {setKickSession(false);setKicks([]);setKickStart(null);}}>
                        End Session
                      </button>
                      {kicks.length >= 10 && (
                        <div style={{marginTop:14,padding:"10px",borderRadius:11,background:"rgba(48,209,88,0.10)",border:"1px solid rgba(48,209,88,0.25)",fontSize:13,fontWeight:700,color:"#30d158"}}>
                          ✅ 10 kicks reached! Baby is active.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Contraction Timer */}
                <div className="gc">
                  <div className="gc-title" style={{color:"#fb923c"}}>⏱ Contraction Timer</div>
                  <div style={{fontSize:12,color:T.textSub,marginBottom:14,lineHeight:1.55}}>
                    Tap START when contraction begins, STOP when it ends. Call doctor when contractions are 5 min apart.
                  </div>
                  <div className="contr-time">{fmtSec(contrElapsed)}</div>
                  <button className={`contr-btn ${contrActive?"stop":"start"}`}
                    onClick={contrActive ? stopContraction : startContraction}>
                    {contrActive ? "⏹ Stop Contraction" : "▶ Start Contraction"}
                  </button>
                  {contractions.length > 0 && (
                    <div className="contr-stat">
                      <div className="contr-stat-box">
                        <div className="contr-stat-v">{avgDur ? fmtSec(avgDur) : "—"}</div>
                        <div className="contr-stat-l">Avg Duration</div>
                      </div>
                      <div className="contr-stat-box">
                        <div className="contr-stat-v">{avgGap ? fmtSec(avgGap) : "—"}</div>
                        <div className="contr-stat-l">Avg Gap</div>
                      </div>
                      <div className="contr-stat-box">
                        <div className="contr-stat-v">{contractions.length}</div>
                        <div className="contr-stat-l">Logged</div>
                      </div>
                    </div>
                  )}
                  {contractions.length > 0 && (
                    <div style={{marginTop:14,maxHeight:180,overflowY:"auto"}}>
                      {contractions.slice().reverse().map((c,i) => (
                        <div key={i} className="contr-row">
                          <span>{c.time}</span>
                          <span>⏱ {fmtSec(c.duration)}</span>
                          <span style={{color:T.textMuted}}>{c.gap ? `Gap: ${fmtSec(c.gap)}` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {contractions.length > 0 && (
                    <button className="kick-small-btn" onClick={() => setContractions([])}>Clear log</button>
                  )}
                </div>
              </div>

              {/* Weight Tracker */}
              <div className="gc">
                <div className="gc-title" style={{color:"#34d399"}}>⚖️ Weight Tracker</div>
                <div style={{fontSize:12,color:T.textSub,marginBottom:14}}>
                  Healthy weight gain: T1: 1–2 kg total · T2: ~0.5 kg/week · T3: ~0.5 kg/week
                </div>
                <div className="wt-inp-row">
                  <input className="wt-inp" type="number" placeholder="Weight in kg"
                    value={weightInput} onChange={e => setWeightInput(e.target.value)}/>
                  <button className="wt-add" onClick={addWeight}>Add</button>
                </div>
                {weights.length === 0 ? (
                  <div style={{textAlign:"center",padding:"20px 0",color:T.textMuted,fontSize:13}}>No entries yet</div>
                ) : (
                  weights.slice().reverse().map((w,i) => (
                    <div key={i} className="wt-row">
                      <span style={{fontWeight:700,color:T.text}}>{w.w} kg</span>
                      <span style={{color:T.textMuted,fontSize:11}}>Week {w.wk}</span>
                      <span style={{color:T.textMuted,fontSize:11}}>{w.date}</span>
                      {i < weights.length-1 && (
                        <span style={{fontWeight:700,color:weights[weights.length-1-i].w > weights[weights.length-2-i]?.w?"#30d158":"#fb923c",fontSize:12}}>
                          {weights[weights.length-1-i].w > weights[weights.length-2-i]?.w ? "↑" : "↓"}
                          {Math.abs(weights[weights.length-1-i].w - (weights[weights.length-2-i]?.w||weights[weights.length-1-i].w)).toFixed(1)} kg
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ──────────── HOSPITAL BAG ──────────── */}
          {activeSection === "bag" && (
            <div className="gc">
              <div className="gc-title" style={{color:PINK}}>🧳 Hospital Bag Checklist</div>
              <div style={{fontSize:13,color:T.textSub,marginBottom:14}}>
                {bagChecked}/{bagTotal} items packed
              </div>
              <div className="bag-progress">
                <div className="bag-fill" style={{width:`${(bagChecked/bagTotal)*100}%`}}/>
              </div>
              {[
                {key:"mother", label:"👩 For You"},
                {key:"baby",   label:"👶 For Baby"},
                {key:"partner",label:"💑 For Partner"},
              ].map(cat => (
                <div key={cat.key}>
                  <div className="bag-cat-title">{cat.label}</div>
                  {bag[cat.key].map((item,idx) => (
                    <div key={idx} className="bag-item" onClick={() => toggleBag(cat.key, idx)}>
                      <div className={`bag-cb ${item.checked?"on":"off"}`}>{item.checked?"✓":"○"}</div>
                      <span className={`bag-txt ${item.checked?"done":""}`}>{item.item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ──────────── BIRTH PLAN ──────────── */}
          {activeSection === "birthplan" && (
            <div className="gc">
              <div className="gc-title" style={{color:"#a78bfa"}}>📝 Birth Plan Builder</div>
              <div style={{fontSize:13,color:T.textSub,marginBottom:6}}>
                Toggle preferences on/off. Share with your midwife or OB. {planOn}/{planTotal} preferences selected.
              </div>
              <div style={{padding:"10px 14px",borderRadius:11,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.22)",fontSize:12.5,color:T.textSub,marginBottom:16}}>
                💡 A birth plan is a preference list, not a contract. Be flexible — labour is unpredictable.
              </div>
              {[
                {key:"environment", label:"🏥 Labour Environment"},
                {key:"pain",        label:"💊 Pain Management"},
                {key:"labour",      label:"🤰 During Labour"},
                {key:"delivery",    label:"👶 At Delivery"},
                {key:"postbirth",   label:"🌺 After Birth"},
              ].map(cat => (
                <div key={cat.key}>
                  <div className="plan-cat-title">{cat.label}</div>
                  {plan[cat.key].map((item,idx) => (
                    <div key={idx} className="plan-item" onClick={() => togglePlan(cat.key, idx)}>
                      <div className={`plan-toggle ${item.on?"on":"off"}`}>{item.on?"✓":"✕"}</div>
                      <span className={`plan-txt ${item.on?"":"off"}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ──────────── JOURNAL ──────────── */}
          {activeSection === "journal" && (
            <div className="gc">
              <div className="gc-title" style={{color:PINK}}>💌 Pregnancy Journal</div>
              <div style={{fontSize:13,color:T.textSub,marginBottom:14}}>
                Capture memories, feelings, and milestones. These moments go by fast. ♥
              </div>
              <div className="jrnl-mood-row">
                {["😊","😴","🤢","😭","😍","🤩","😰","💪"].map(m => (
                  <div key={m} className={`jrnl-mood ${journalMood===m?"sel":""}`} onClick={() => setJournalMood(m)}>{m}</div>
                ))}
              </div>
              <div className="jrnl-row">
                <textarea className="jrnl-inp" placeholder="How are you feeling today? What milestone happened? Any worries or joys to capture..."
                  value={journalText} onChange={e => setJournalText(e.target.value)} rows={3}/>
              </div>
              <button className="jrnl-add" onClick={addJournal} disabled={!journalText.trim()}>Save Entry →</button>
              <div style={{marginTop:20}}>
                {journal.length === 0 ? (
                  <div style={{textAlign:"center",padding:"24px 0",color:T.textMuted,fontSize:13}}>
                    No entries yet. Write your first memory! ✨
                  </div>
                ) : journal.map(e => (
                  <div key={e.id} className="jrnl-entry">
                    <div className="jrnl-meta">
                      <span style={{fontSize:18}}>{e.mood}</span>
                      <span>{e.date}</span>
                      <span>·</span>
                      <span>Week {e.wk}</span>
                    </div>
                    <div className="jrnl-text">{e.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            <strong>⚕️ Medical Disclaimer: </strong>
            This guide is for general information only and does not replace professional medical advice.
            Every pregnancy is unique. Always consult your doctor, OB-GYN, or midwife before making
            any changes to your diet, exercise, or healthcare routine during pregnancy.
          </div>
        </div>
      </div>
    </>
  );
}
