// src/features/shop/MaleShop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const CATEGORIES = [
  { id:"all",         label:"All Products",       icon:"⚡" },
  { id:"supplements", label:"Supplements",         icon:"💊" },
  { id:"performance", label:"Performance",         icon:"🏋️" },
  { id:"sexual",      label:"Sexual Wellness",     icon:"❤️" },
  { id:"enhancers",   label:"Enhancers",           icon:"🔥" },
  { id:"hormones",    label:"Hormone Support",     icon:"⚗️" },
  { id:"grooming",    label:"Men's Grooming",      icon:"🧴" },
  { id:"gear",        label:"Training Gear",       icon:"🎽" },
];

const PRODUCTS = [
  // Supplements
  { id:1,  cat:"supplements", name:"Whey Protein Isolate 2kg",        brand:"MuscleBlaze",    price:"₹2,799", original:"₹3,499", off:"20%", rating:4.8, reviews:12400, badge:"Best Seller", color:"#0a84ff", tags:["Protein","Muscle","Recovery"],   desc:"25g protein per serve. Cold-processed isolate for maximum absorption. Zero sugar.",                      href:"#" },
  { id:2,  cat:"supplements", name:"Creatine Monohydrate 500g",       brand:"Optimum Nutrition",price:"₹1,299",original:"₹1,699",off:"24%", rating:4.9, reviews:8200,  badge:"Clinical Grade",color:"#30d158",tags:["Strength","Power","ATP"],       desc:"100% pure creatine monohydrate. Increases strength, power output and muscle volume.",                   href:"#" },
  { id:3,  cat:"supplements", name:"Pre-Workout Extreme",             brand:"Cellucor C4",    price:"₹1,899", original:"₹2,499", off:"24%", rating:4.7, reviews:6800,  badge:null,          color:"#ff9f0a", tags:["Energy","Focus","Pump"],          desc:"300mg caffeine, 6g citrulline, 3.2g beta-alanine. Maximum energy and pump.",                            href:"#" },
  { id:4,  cat:"supplements", name:"Ashwagandha KSM-66 600mg",       brand:"Himalaya",       price:"₹549",   original:"₹799",   off:"31%", rating:4.8, reviews:9100,  badge:"Top Rated",   color:"#bf5af2", tags:["Testosterone","Cortisol","Sleep"], desc:"KSM-66 extract — clinically proven to raise testosterone 17%, reduce cortisol 30%.",                    href:"#" },
  { id:5,  cat:"supplements", name:"ZMA (Zinc+Mag+B6)",              brand:"Optimum Nutrition",price:"₹1,199",original:"₹1,599",off:"25%", rating:4.7, reviews:4200,  badge:null,          color:"#0a84ff", tags:["Zinc","Sleep","Testosterone"],    desc:"Zinc 30mg + Magnesium 450mg + B6. Boosts testosterone and sleep quality.",                               href:"#" },
  { id:6,  cat:"supplements", name:"Omega-3 Triple Strength 120 caps",brand:"HealthKart",    price:"₹799",   original:"₹1,099", off:"27%", rating:4.6, reviews:7300,  badge:null,          color:"#30d158", tags:["Heart","Joint","Anti-inflammatory"],desc:"2000mg EPA+DHA per serve. Reduces inflammation, supports testosterone and heart health.",                href:"#" },
  { id:7,  cat:"supplements", name:"Vitamin D3+K2 4000IU",           brand:"Now Foods",      price:"₹899",   original:"₹1,299", off:"30%", rating:4.8, reviews:5100,  badge:"Essential",   color:"#ff9f0a", tags:["Vitamin D","Testosterone","Immunity"],desc:"Vitamin D deficiency directly lowers testosterone. K2 ensures calcium goes to bones.",                  href:"#" },
  { id:8,  cat:"supplements", name:"Magnesium Glycinate 400mg",      brand:"Doctor's Best",  price:"₹1,299", original:"₹1,799", off:"28%", rating:4.7, reviews:3800,  badge:null,          color:"#bf5af2", tags:["Sleep","Recovery","Stress"],      desc:"Most bioavailable form of magnesium. Improves sleep, reduces cortisol and aids recovery.",               href:"#" },

  // Performance
  { id:9,  cat:"performance", name:"Beta-Alanine 300g",              brand:"Bulk Supplements",price:"₹999",  original:"₹1,299", off:"23%", rating:4.6, reviews:2800,  badge:null,          color:"#ff9f0a", tags:["Endurance","Lactic Acid","Cardio"],desc:"Delays muscle fatigue. Increases training volume and endurance performance.",                             href:"#" },
  { id:10, cat:"performance", name:"L-Citrulline 500g",             brand:"Nutricost",       price:"₹1,499", original:"₹1,999", off:"25%", rating:4.8, reviews:3900,  badge:"Natural Pump",color:"#f472b6", tags:["Pump","Blood Flow","ED"],         desc:"Converts to L-Arginine → boosts nitric oxide → better pump, blood flow and erection quality.",          href:"#" },
  { id:11, cat:"performance", name:"BCAAs 2:1:1 500g",              brand:"MuscleBlaze",     price:"₹1,499", original:"₹1,899", off:"21%", rating:4.6, reviews:6200,  badge:null,          color:"#0a84ff", tags:["Recovery","Muscle","BCAA"],       desc:"Leucine, Isoleucine, Valine in 2:1:1 ratio. Prevents muscle breakdown during training.",                href:"#" },
  { id:12, cat:"performance", name:"Electrolyte Powder (30 servings)",brand:"Liquid I.V.",   price:"₹1,299", original:"₹1,699", off:"24%", rating:4.7, reviews:4100,  badge:null,          color:"#30d158", tags:["Hydration","Stamina","Electrolytes"],desc:"5x faster hydration than water alone. Essential for performance in heat.",                              href:"#" },

  // Sexual Wellness
  { id:13, cat:"sexual",      name:"Tongkat Ali 400mg Extract",      brand:"Momentous",      price:"₹2,499", original:"₹3,299", off:"24%", rating:4.8, reviews:2100,  badge:"#1 Libido",   color:"#ff9f0a", tags:["Libido","Testosterone","SHBG"],   desc:"LJ100 100:1 extract. Reduces SHBG (frees testosterone), improves libido and sperm quality.",             href:"#" },
  { id:14, cat:"sexual",      name:"Maca Root 3000mg",              brand:"Swanson",         price:"₹799",   original:"₹1,099", off:"27%", rating:4.5, reviews:3400,  badge:null,          color:"#bf5af2", tags:["Libido","Energy","Fertility"],    desc:"Peruvian superfood. Improves sexual desire, energy and sperm quality without affecting hormones.",       href:"#" },
  { id:15, cat:"sexual",      name:"Water-Based Lubricant 100ml",   brand:"Durex",           price:"₹349",   original:"₹499",   off:"30%", rating:4.7, reviews:8900,  badge:"Body-Safe",   color:"#0a84ff", tags:["Lubricant","pH-Safe","Condom-Safe"],desc:"pH-balanced, glycerin-free. Safe with all condoms and toys. Dermatologist tested.",                      href:"#" },
  { id:16, cat:"sexual",      name:"Delay Spray (Lidocaine 10%)",   brand:"Manforce",        price:"₹449",   original:"₹649",   off:"31%", rating:4.5, reviews:5600,  badge:"Popular",     color:"#ff375f", tags:["PE","Delay","Performance"],       desc:"Reduces sensitivity to delay ejaculation. Apply 15 min before. Safe and fast-acting.",                  href:"#" },
  { id:17, cat:"sexual",      name:"Vibrating Cock Ring",           brand:"MyMuse",          price:"₹1,299", original:"₹1,799", off:"28%", rating:4.7, reviews:2100,  badge:"Couples Pick", color:"#bf5af2", tags:["Ring","Vibrating","Couples"],     desc:"Stretchy silicone. Prolongs erection, vibrates for partner stimulation. USB rechargeable.",              href:"#" },
  { id:18, cat:"sexual",      name:"Condoms Ultra Thin (10 pack)",  brand:"Durex",           price:"₹299",   original:"₹399",   off:"25%", rating:4.8, reviews:22000, badge:"Best Seller",  color:"#30d158", tags:["Condom","Protection","Thin"],      desc:"0.06mm ultra-thin. Electronically tested. Maximum sensitivity with full protection.",                   href:"#" },
  { id:19, cat:"sexual",      name:"Prostate Massager",             brand:"Lelo",            price:"₹4,999", original:"₹6,999", off:"29%", rating:4.8, reviews:980,   badge:"Premium",      color:"#0a84ff", tags:["Prostate","P-spot","Health"],      desc:"Body-safe silicone. Prostate massage promotes prostate health and intense orgasms.",                     href:"#" },
  { id:20, cat:"sexual",      name:"Male Masturbator",              brand:"Tenga",           price:"₹999",   original:"₹1,499", off:"33%", rating:4.6, reviews:3200,  badge:"Discreet",     color:"#ff9f0a", tags:["Solo","Masturbator","Japanese"],   desc:"Japanese-engineered internal texture. Hygienic, disposable. Plain discreet packaging.",                 href:"#" },

  // Enhancers
  { id:21, cat:"enhancers",   name:"Boron 10mg",                    brand:"Now Foods",       price:"₹799",   original:"₹1,099", off:"27%", rating:4.6, reviews:1800,  badge:"Free T Boost", color:"#ff9f0a",tags:["Free Testosterone","SHBG","Bone"],  desc:"Reduces SHBG — frees bound testosterone. Studies show 28% increase in free T in one week.",            href:"#" },
  { id:22, cat:"enhancers",   name:"Fadogia Agrestis 600mg",        brand:"Gorilla Mind",    price:"₹2,999", original:"₹3,999", off:"25%", rating:4.4, reviews:890,   badge:"Advanced",     color:"#ff375f",tags:["LH","Testosterone","Advanced"],    desc:"Raises LH and testosterone. Cycle 8 on/4 off. Use under medical supervision.",                          href:"#" },
  { id:23, cat:"enhancers",   name:"Pine Pollen Tincture",          brand:"Sun Potion",      price:"₹1,899", original:"₹2,499", off:"24%", rating:4.4, reviews:640,   badge:null,           color:"#30d158",tags:["Androgen","Natural","Energy"],      desc:"Contains natural androgens including DHEA and testosterone. Potent phytoandrogen.",                     href:"#" },
  { id:24, cat:"enhancers",   name:"NAC 600mg",                     brand:"Jarrow Formulas", price:"₹1,499", original:"₹1,999", off:"25%", rating:4.7, reviews:2800,  badge:null,           color:"#bf5af2",tags:["Antioxidant","Liver","Sperm"],      desc:"N-Acetyl Cysteine. Improves sperm motility, reduces oxidative stress and supports liver.",               href:"#" },

  // Hormone Support
  { id:25, cat:"hormones",    name:"DHEA 25mg Micronised",          brand:"Jarrow Formulas", price:"₹1,499", original:"₹1,999", off:"25%", rating:4.5, reviews:1200,  badge:"Consult Dr",   color:"#ff9f0a",tags:["DHEA","Testosterone","Adrenal"],    desc:"Precursor to testosterone and estrogen. Micronised for superior absorption. Medical supervision advised.",href:"#" },
  { id:26, cat:"hormones",    name:"Vitamin B Complex",             brand:"Solgar",           price:"₹899",   original:"₹1,299", off:"31%", rating:4.7, reviews:5600,  badge:null,           color:"#0a84ff",tags:["Energy","Hormones","Metabolism"],   desc:"Complete B-complex including B6, B12, folate. Essential for testosterone synthesis and energy.",         href:"#" },
  { id:27, cat:"hormones",    name:"CoQ10 Ubiquinol 200mg",         brand:"Qunol",           price:"₹2,199", original:"₹2,899", off:"24%", rating:4.8, reviews:1600,  badge:"Heart + T",    color:"#30d158",tags:["CoQ10","Sperm","Heart","Mitochondria"],desc:"Ubiquinol — most active form. Boosts sperm quality, heart health and testosterone.",                   href:"#" },

  // Grooming
  { id:28, cat:"grooming",    name:"Beard Oil 50ml",                brand:"Beardo",          price:"₹399",   original:"₹549",   off:"27%", rating:4.6, reviews:8900,  badge:null,           color:"#ff9f0a",tags:["Beard","Grooming","Skin"],           desc:"Argan and jojoba oil blend. Conditions beard, reduces itch and promotes healthy growth.",                href:"#" },
  { id:29, cat:"grooming",    name:"Anti-Acne Face Wash",          brand:"Plum",             price:"₹299",   original:"₹399",   off:"25%", rating:4.5, reviews:6700,  badge:null,           color:"#30d158",tags:["Acne","Skin","Oil-Control"],          desc:"2% Salicylic acid. Unclogs pores, controls oil and prevents hormonal breakouts.",                       href:"#" },
  { id:30, cat:"grooming",    name:"Intimate Wash (Men)",           brand:"Mangroomer",      price:"₹349",   original:"₹499",   off:"30%", rating:4.5, reviews:3200,  badge:"pH Safe",      color:"#0a84ff",tags:["Hygiene","Intimate","Sensitive"],     desc:"pH-balanced for male intimate areas. Prevents odour, rash and irritation.",                              href:"#" },

  // Training Gear
  { id:31, cat:"gear",        name:"Lifting Straps",                brand:"RDX",             price:"₹499",   original:"₹699",   off:"29%", rating:4.7, reviews:4200,  badge:null,           color:"#ff9f0a",tags:["Straps","Grip","Deadlift"],          desc:"Heavy duty cotton straps. Improves grip for deadlifts, rows and pull-ups.",                              href:"#" },
  { id:32, cat:"gear",        name:"Knee Sleeves (Pair)",           brand:"SBD",             price:"₹2,499", original:"₹3,299", off:"24%", rating:4.8, reviews:2100,  badge:"Pro Grade",    color:"#0a84ff",tags:["Knee","Squat","Support"],            desc:"7mm neoprene. Competition legal. Maximum support and warmth for squats and leg press.",                  href:"#" },
  { id:33, cat:"gear",        name:"Gym Shaker Bottle 700ml",      brand:"MuscleBlaze",     price:"₹299",   original:"₹399",   off:"25%", rating:4.6, reviews:11000, badge:null,           color:"#30d158",tags:["Shaker","BPA-Free","Gym"],            desc:"BPA-free. BlenderBall wire whisk. Leak-proof lid. Fits in all bag compartments.",                       href:"#" },
];

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:11, color: i <= Math.round(rating) ? "#ff9f0a" : "rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </span>
  );
}

export default function MaleShop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isMale } = useUser();
  const [mounted,   setMounted]   = useState(false);
  const [category,  setCategory]  = useState("all");
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState("popular");
  const [wishlist,  setWishlist]  = useState([]);

  useEffect(() => {
    setMounted(true);
    if (!isMale) navigate("/dashboard");
  }, [isMale]);

  const toggleWish = id => setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w,id]);

  let filtered = PRODUCTS
    .filter(p => category==="all" || p.cat===category)
    .filter(p => !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  if (sort==="popular")    filtered.sort((a,b) => b.reviews - a.reviews);
  if (sort==="rating")     filtered.sort((a,b) => b.rating  - a.rating);
  if (sort==="price_low")  filtered.sort((a,b) => parseInt(a.price.replace(/\D/g,"")) - parseInt(b.price.replace(/\D/g,"")));
  if (sort==="price_high") filtered.sort((a,b) => parseInt(b.price.replace(/\D/g,"")) - parseInt(a.price.replace(/\D/g,"")));

  const ACCENT = "#0a84ff";

  const css = generateCSS(T, dark) + `
    .ms-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.6s ease,background 0.5s;}

    /* Header */
    .ms-hd{
      display:flex;align-items:center;justify-content:space-between;
      padding:0 32px;height:56px;
      background:${dark?"rgba(7,7,11,0.94)":"rgba(255,255,255,0.94)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(40px);
      position:sticky;top:0;z-index:50;
    }
    .ms-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.text};font-size:13px;font-weight:500;cursor:pointer;
      font-family:${FONT.body};transition:all 0.15s;}
    .ms-back:hover{background:${ACCENT}12;border-color:${ACCENT}40;color:${ACCENT};}
    .ms-logo{font-family:${FONT.display};font-size:17px;font-weight:800;letter-spacing:-0.01em;color:${T.text};}
    .ms-logo span{color:${ACCENT};}
    .theme-toggle{width:50px;height:27px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:21px;height:21px;border-radius:50%;
      background:${ACCENT};display:flex;align-items:center;justify-content:center;font-size:10px;
      transition:left 0.24s cubic-bezier(0.4,0,0.2,1);left:${dark?"26px":"2px"};}

    /* Hero banner */
    .ms-hero{
      background:${dark
        ? "linear-gradient(135deg,rgba(10,132,255,0.14) 0%,rgba(48,209,88,0.06) 50%,rgba(10,10,14,0.95) 100%)"
        : "linear-gradient(135deg,rgba(10,132,255,0.10) 0%,rgba(48,209,88,0.05) 100%)"};
      border-bottom:1px solid ${T.glassBorder};
      padding:36px 40px;position:relative;overflow:hidden;
    }
    .ms-hero::before{content:'';position:absolute;top:-60px;right:-60px;
      width:320px;height:320px;border-radius:50%;
      background:radial-gradient(circle,rgba(10,132,255,0.18) 0%,transparent 65%);
      pointer-events:none;}
    .ms-hero-title{font-family:${FONT.display};font-size:34px;font-weight:800;
      letter-spacing:-0.025em;color:${T.text};margin-bottom:8px;position:relative;z-index:1;}
    .ms-hero-title span{color:${ACCENT};}
    .ms-hero-sub{font-size:14px;color:${T.textSub};line-height:1.65;
      max-width:520px;position:relative;z-index:1;}
    .ms-hero-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;
      border-radius:99px;
      background:${dark?"rgba(10,132,255,0.12)":"rgba(10,132,255,0.08)"};
      border:1px solid rgba(10,132,255,0.25);
      font-size:12px;font-weight:700;color:${ACCENT};margin-top:14px;position:relative;z-index:1;}
    .ms-hero-stats{display:flex;gap:28px;margin-top:20px;position:relative;z-index:1;}
    .ms-hs-val{font-family:${FONT.display};font-size:26px;font-weight:800;color:${T.text};}
    .ms-hs-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.10em;text-transform:uppercase;margin-top:2px;}

    /* Main */
    .ms-main{max-width:1200px;margin:0 auto;padding:28px 32px;}

    /* Category tabs */
    .cat-row{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;margin-bottom:18px;}
    .cat-row::-webkit-scrollbar{height:0;}
    .cat-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;
      border:1.5px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.65)"};
      backdrop-filter:blur(20px);
      color:${T.textSub};font-size:12.5px;font-weight:700;
      cursor:pointer;transition:all 0.18s;white-space:nowrap;font-family:${FONT.body};
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.85)"};}
    .cat-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .cat-btn.act{
      background:${dark?"rgba(10,132,255,0.15)":"rgba(10,132,255,0.10)"};
      color:${ACCENT};border-color:rgba(10,132,255,0.35);
      box-shadow:0 0 18px rgba(10,132,255,0.18),inset 0 1px 0 rgba(255,255,255,0.12);}

    /* Filters */
    .filter-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
    .search-inp{flex:1;min-width:200px;height:42px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.7)"};
      border:1px solid ${T.glassBorder};border-radius:11px;
      padding:0 14px 0 36px;font-size:13px;font-family:${FONT.body};color:${T.text};
      outline:none;transition:all 0.18s;backdrop-filter:blur(20px);}
    .search-inp::placeholder{color:${T.textMuted};}
    .search-inp:focus{border-color:${ACCENT}50;background:${dark?"rgba(10,132,255,0.07)":"rgba(10,132,255,0.05)"};}
    .search-wrap{position:relative;flex:1;min-width:200px;}
    .search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;color:${T.textMuted};pointer-events:none;}
    .sort-sel{height:42px;padding:0 14px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.7)"};
      border:1px solid ${T.glassBorder};border-radius:11px;
      font-size:13px;font-family:${FONT.body};color:${T.text};
      outline:none;cursor:pointer;backdrop-filter:blur(20px);}

    /* Results bar */
    .res-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
    .res-count{font-size:13px;color:${T.textSub};font-weight:500;}
    .res-count strong{color:${T.text};font-weight:800;}
    .wish-count{font-size:12px;color:${ACCENT};font-weight:700;}

    /* Product grid */
    .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;}

    /* Product card — glass */
    .prod-card{
      background:${dark?"linear-gradient(145deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)":"linear-gradient(145deg,rgba(255,255,255,0.84) 0%,rgba(255,255,255,0.62) 100%)"};
      border:1px solid ${T.glassBorder};border-radius:18px;
      backdrop-filter:blur(40px);
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.92)"},0 2px 14px rgba(0,0,0,${dark?"0.22":"0.06"});
      display:flex;flex-direction:column;overflow:hidden;
      transition:all 0.28s cubic-bezier(0.4,0,0.2,1);
      position:relative;
    }
    .prod-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.06":"0.40"}) 0%,transparent 40%);
      pointer-events:none;}
    .prod-card > *{position:relative;z-index:1;}
    .prod-card:hover{transform:translateY(-5px);border-color:${T.glassBorderHover};
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.95)"},0 20px 48px rgba(0,0,0,${dark?"0.30":"0.10"});}

    /* Card top strip */
    .prod-strip{height:3px;width:100%;}

    .prod-top{padding:16px 16px 12px;flex:1;}
    .prod-badge{display:inline-block;padding:3px 10px;border-radius:99px;
      font-size:9.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;}
    .prod-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px;}
    .prod-tag{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;}
    .prod-name{font-family:${FONT.display};font-size:14px;font-weight:800;color:${T.text};
      margin-bottom:3px;line-height:1.3;letter-spacing:-0.01em;}
    .prod-brand{font-size:11px;color:${T.textMuted};margin-bottom:7px;font-weight:500;}
    .prod-desc{font-size:12px;color:${T.textSub};line-height:1.6;margin-bottom:11px;}
    .prod-rating{display:flex;align-items:center;gap:7px;margin-bottom:11px;}
    .prod-rnum{font-size:12px;font-weight:800;color:${T.text};}
    .prod-reviews{font-size:10.5px;color:${T.textMuted};}
    .prod-price-row{display:flex;align-items:baseline;gap:8px;}
    .prod-price{font-family:${FONT.display};font-size:21px;font-weight:800;color:${T.text};}
    .prod-orig{font-size:12px;color:${T.textMuted};text-decoration:line-through;}
    .prod-off{font-size:11px;font-weight:800;color:#30d158;}

    .prod-btns{padding:10px 14px 14px;display:flex;gap:8px;}
    .wish-btn{width:40px;height:40px;border-radius:11px;
      border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      display:flex;align-items:center;justify-content:center;
      font-size:17px;cursor:pointer;transition:all 0.2s;flex-shrink:0;}
    .wish-btn:hover{transform:scale(1.08);}
    .buy-btn{flex:1;height:40px;border-radius:11px;border:none;
      color:#fff;font-size:12.5px;font-weight:800;
      font-family:${FONT.body};cursor:pointer;transition:all 0.2s;
      letter-spacing:0.04em;}
    .buy-btn:hover{filter:brightness(1.12);transform:translateY(-1px);}

    /* Disclaimer */
    .disclaimer{margin:28px 0 0;padding:14px 18px;border-radius:13px;
      background:${dark?"rgba(10,132,255,0.07)":"rgba(10,132,255,0.05)"};
      border:1px solid rgba(10,132,255,0.18);
      font-size:11.5px;color:${T.textSub};line-height:1.7;text-align:center;}
    .disclaimer strong{color:${ACCENT};}

    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:900px){.ms-main{padding:22px 16px;}.ms-hero{padding:24px 20px;}.ms-hero-title{font-size:26px;}}
    @media(max-width:600px){.prod-grid{grid-template-columns:1fr 1fr;gap:10px;}.ms-hd{padding:0 16px;}.cat-btn{padding:7px 12px;font-size:11.5px;}.ms-hero-stats{gap:18px;}.ms-hs-val{font-size:22px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="ms-root">
        <div className="orb orb-1" style={{ background:"radial-gradient(circle,rgba(10,132,255,0.09) 0%,transparent 65%)" }}/>
        <div className="orb orb-2" style={{ background:"radial-gradient(circle,rgba(48,209,88,0.06) 0%,transparent 65%)" }}/>

        {/* Header */}
        <div className="ms-hd">
          <button className="ms-back" onClick={() => navigate(-1)}>← Back</button>
          <div className="ms-logo">AshFit<span>Verse</span></div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {wishlist.length > 0 && <span style={{ fontSize:12,color:ACCENT,fontWeight:700 }}>♡ {wishlist.length} saved</span>}
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="ms-hero">
          <div style={{ maxWidth:1160,margin:"0 auto" }}>
            <div className="ms-hero-title">Men's <span>Wellness Shop</span></div>
            <div className="ms-hero-sub">
              Supplements, sexual wellness, enhancers and training gear — everything curated for men who take their health seriously.
            </div>
            <div className="ms-hero-badge">
              🔒 18+ Adult Content &nbsp;·&nbsp; 📦 Discreet Packaging &nbsp;·&nbsp; ✓ Quality Curated
            </div>
            <div className="ms-hero-stats">
              {[
                { v:`${PRODUCTS.length}+`, l:"Products"    },
                { v:"8",                   l:"Categories"  },
                { v:"100%",                l:"Discreet"    },
              ].map((s,i) => (
                <div key={i}>
                  <div className="ms-hs-val">{s.v}</div>
                  <div className="ms-hs-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ms-main">
          {/* Category row */}
          <div className="cat-row">
            {CATEGORIES.map(c => (
              <button key={c.id} className={`cat-btn ${category===c.id?"act":""}`}
                onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div className="search-wrap">
              <span className="search-ico">🔍</span>
              <input className="search-inp"
                placeholder="Search products, brands, ingredients..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>

          {/* Results bar */}
          <div className="res-bar">
            <div className="res-count">
              Showing <strong>{filtered.length}</strong> products
              {category!=="all" && <span style={{ color:T.textMuted }}> in {CATEGORIES.find(c=>c.id===category)?.label}</span>}
            </div>
          </div>

          {/* Products */}
          <div className="prod-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="prod-card" style={{ animationDelay:`${i*0.03}s` }}>
                {/* Color strip */}
                <div className="prod-strip" style={{ background:`linear-gradient(90deg,${p.color},${p.color}66)` }}/>

                <div className="prod-top">
                  {p.badge && (
                    <div className="prod-badge" style={{ background:`${p.color}16`,color:p.color,border:`1px solid ${p.color}28` }}>
                      {p.badge}
                    </div>
                  )}
                  <div className="prod-tags">
                    {p.tags.slice(0,3).map((t,j) => (
                      <span key={j} className="prod-tag" style={{ background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}22` }}>{t}</span>
                    ))}
                  </div>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-brand">{p.brand}</div>
                  <div className="prod-desc">{p.desc}</div>
                  <div className="prod-rating">
                    <Stars rating={p.rating}/>
                    <span className="prod-rnum">{p.rating}</span>
                    <span className="prod-reviews">({p.reviews.toLocaleString()})</span>
                  </div>
                  <div className="prod-price-row">
                    <span className="prod-price">{p.price}</span>
                    <span className="prod-orig">{p.original}</span>
                    <span className="prod-off">{p.off} OFF</span>
                  </div>
                </div>

                <div className="prod-btns">
                  <button className="wish-btn" onClick={() => toggleWish(p.id)}>
                    {wishlist.includes(p.id) ? "❤️" : "🤍"}
                  </button>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ flex:1,textDecoration:"none" }}>
                    <button className="buy-btn" style={{ background:`linear-gradient(135deg,${p.color},${p.color}cc)`,width:"100%" }}>
                      Buy Now ↗
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <strong>📦 Discreet Delivery:</strong> All orders ship in plain, unmarked packaging. No product names visible outside.
            &nbsp;|&nbsp; <strong>🔒 Privacy:</strong> Purchase history is confidential.
            &nbsp;|&nbsp; <strong>Affiliate Disclosure:</strong> AshFitVerse earns commission at no extra cost to you.
          </div>
        </div>
      </div>
    </>
  );
}