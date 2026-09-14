// src/features/femaleHealth/FemaleWellnessShop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const CATEGORIES = [
  { id: "all",           label: "All Products",          icon: "💜" },
  { id: "hormones",      label: "Hormone Support",       icon: "⚖️" },
  { id: "period",        label: "Period Care",           icon: "🔴" },
  { id: "pcos",          label: "PCOS / PCOD",          icon: "💊" },
  { id: "sexual",        label: "Sexual Wellness",       icon: "❤️" },
  { id: "contraception", label: "Contraception",         icon: "🛡️" },
  { id: "fertility",     label: "Fertility",             icon: "🌸" },
  { id: "skincare",      label: "Skin & Hair",          icon: "✨" },
];

const PRODUCTS = [
  // Hormone Support
  { id:1,  cat:"hormones",      name:"Inositol 40:1 (Myo+D-Chiro)",       brand:"Ovaboost",          price:"₹1,899", original:"₹2,499", discount:"24%", rating:4.9, reviews:3200, badge:"#1 PCOS",     badgeColor:"#a78bfa", color:"#a78bfa", tags:["PCOS","Ovulation","Insulin"],      desc:"The gold standard supplement for PCOS. Clinically proven to restore ovulation and reduce androgens.",       href:"#" },
  { id:2,  cat:"hormones",      name:"Chasteberry (Vitex) 400mg",          brand:"Jarrow Formulas",   price:"₹1,299", original:"₹1,699", discount:"23%", rating:4.6, reviews:1800, badge:null,          badgeColor:null,     color:"#f472b6", tags:["PMS","Cycle","Hormones"],          desc:"Regulates LH and reduces PMS symptoms. Supports cycle regularity and progesterone balance.",               href:"#" },
  { id:3,  cat:"hormones",      name:"Magnesium Glycinate 400mg",          brand:"Doctor's Best",     price:"₹1,299", original:"₹1,699", discount:"23%", rating:4.8, reviews:4200, badge:"Top Rated",   badgeColor:"#4f8ef7", color:"#4f8ef7", tags:["PMS","Sleep","Cramps"],            desc:"Highly bioavailable magnesium for PMS, sleep, cramps and hormonal balance.",                                href:"#" },
  { id:4,  cat:"hormones",      name:"Evening Primrose Oil 1000mg",        brand:"Solgar",            price:"₹899",  original:"₹1,199", discount:"25%", rating:4.5, reviews:2100, badge:null,          badgeColor:null,     color:"#fbbf24", tags:["Hormones","Skin","Cycle"],          desc:"GLA-rich oil that supports hormone production and reduces breast tenderness and PMS.",                       href:"#" },
  { id:5,  cat:"hormones",      name:"Spearmint Extract 900mg",            brand:"Swanson",           price:"₹799",  original:"₹999",  discount:"20%", rating:4.5, reviews:980,  badge:"Anti-androgen",badgeColor:"#34d399", color:"#34d399", tags:["Acne","Hair","Androgens"],          desc:"Clinically shown to reduce testosterone and improve hirsutism and acne in women with PCOS.",                href:"#" },
  { id:6,  cat:"hormones",      name:"Vitamin B6 + B12 Complex",           brand:"Now Foods",         price:"₹599",  original:"₹799",  discount:"25%", rating:4.6, reviews:1600, badge:null,          badgeColor:null,     color:"#fb923c", tags:["PMS","Mood","Energy"],              desc:"B6 reduces PMS symptoms including mood swings, bloating and breast tenderness.",                             href:"#" },

  // Period Care
  { id:7,  cat:"period",        name:"Organic Cotton Pads (30 pack)",      brand:"Carmesi",           price:"₹349",  original:"₹449",  discount:"22%", rating:4.7, reviews:5600, badge:"Organic",     badgeColor:"#34d399", color:"#34d399", tags:["Period","Organic","Sensitive"],    desc:"100% certified organic cotton. No chemicals, dyes or fragrance. Rash-free for sensitive skin.",             href:"#" },
  { id:8,  cat:"period",        name:"Menstrual Cup (Medium)",             brand:"Sirona",            price:"₹449",  original:"₹649",  discount:"31%", rating:4.8, reviews:8200, badge:"Eco Pick",    badgeColor:"#34d399", color:"#f472b6", tags:["Reusable","Eco","12-hour"],        desc:"Medical-grade silicone. 12-hour protection. Eco-friendly and cost-effective long-term.",                    href:"#" },
  { id:9,  cat:"period",        name:"Period Pain Patches (6 pack)",       brand:"Ouch Away",         price:"₹299",  original:"₹399",  discount:"25%", rating:4.5, reviews:3100, badge:null,          badgeColor:null,     color:"#fb923c", tags:["Pain Relief","Cramps","Heat"],     desc:"Heat-activated patches that provide 8-hour relief from period cramps. Drug-free.",                           href:"#" },
  { id:10, cat:"period",        name:"Menstrual Disc (10 pack)",           brand:"Niine",             price:"₹599",  original:"₹799",  discount:"25%", rating:4.6, reviews:1200, badge:"New",         badgeColor:"#4f8ef7", color:"#4f8ef7", tags:["Disc","No-leak","Mess-free"],      desc:"Sit-at-rim design for mess-free period sex. Up to 12 hours of leak-free protection.",                       href:"#" },
  { id:11, cat:"period",        name:"Raspberry Leaf Tea (50 bags)",       brand:"Pukka",             price:"₹699",  original:"₹899",  discount:"22%", rating:4.4, reviews:890,  badge:null,          badgeColor:null,     color:"#f472b6", tags:["Herbal","Cramps","Natural"],       desc:"Traditional tonic for uterine health. May reduce period cramps and improve flow regulation.",                href:"#" },

  // PCOS/PCOD
  { id:12, cat:"pcos",          name:"Berberine HCl 500mg",               brand:"Thorne",            price:"₹2,299", original:"₹2,999", discount:"23%", rating:4.8, reviews:1800, badge:"Clinical Grade",badgeColor:"#a78bfa", color:"#a78bfa", tags:["Insulin","PCOS","Blood Sugar"],   desc:"As effective as Metformin in some studies. Dramatically improves insulin sensitivity in PCOS.",              href:"#" },
  { id:13, cat:"pcos",          name:"NAC N-Acetyl Cysteine 600mg",       brand:"Jarrow Formulas",   price:"₹1,499", original:"₹1,899", discount:"21%", rating:4.7, reviews:1200, badge:null,          badgeColor:null,     color:"#fb923c", tags:["PCOS","Antioxidant","Ovulation"],  desc:"Powerful antioxidant that improves insulin resistance and may help restore ovulation in PCOS.",               href:"#" },
  { id:14, cat:"pcos",          name:"PCOS Supplement Stack Kit",          brand:"Ovaboost",          price:"₹3,999", original:"₹5,499", discount:"27%", rating:4.9, reviews:680,  badge:"Best Value",  badgeColor:"#fbbf24", color:"#fbbf24", tags:["PCOS","Bundle","Complete"],        desc:"Complete PCOS kit — Inositol, Vitamin D, Magnesium, Spearmint and CoQ10 in one bundle.",                    href:"#" },
  { id:15, cat:"pcos",          name:"Zinc Picolinate 50mg",              brand:"Solgar",            price:"₹999",  original:"₹1,299", discount:"23%", rating:4.6, reviews:1500, badge:null,          badgeColor:null,     color:"#34d399", tags:["Acne","Androgens","Hair"],          desc:"Reduces acne, hair loss and facial hair in PCOS. Anti-androgenic at therapeutic doses.",                    href:"#" },

  // Sexual Wellness
  { id:16, cat:"sexual",        name:"Personal Lubricant (Water-based)",  brand:"Sirona",            price:"₹399",  original:"₹549",  discount:"27%", rating:4.7, reviews:2800, badge:"Body-safe",   badgeColor:"#f472b6", color:"#f472b6", tags:["Lubricant","pH-Safe","Intimate"],  desc:"pH-balanced, glycerin-free, paraben-free. Safe with condoms and sex toys. Dermatologist tested.",           href:"#" },
  { id:17, cat:"sexual",        name:"Female Arousal Serum",              brand:"Woo More Play",     price:"₹1,499", original:"₹1,999", discount:"25%", rating:4.5, reviews:920,  badge:"Adult",       badgeColor:"#fb923c", color:"#fb923c", tags:["Arousal","Sensation","Topical"],   desc:"Topical serum that enhances sensitivity and arousal. Water-based, clitoral stimulation.",                    href:"#" },
  { id:18, cat:"sexual",        name:"Vibrating Massager (Discreet)",     brand:"MyMuse",            price:"₹2,499", original:"₹3,499", discount:"29%", rating:4.8, reviews:1400, badge:"Bestseller",  badgeColor:"#a78bfa", color:"#a78bfa", tags:["Massager","Pleasure","Discreet"],  desc:"USB rechargeable, 10 vibration modes, 100% waterproof. Discreet packaging guaranteed.",                     href:"#" },
  { id:19, cat:"sexual",        name:"Intimate Wash (pH-balanced)",       brand:"Carmesi",           price:"₹299",  original:"₹399",  discount:"25%", rating:4.6, reviews:4200, badge:"Dermatest",   badgeColor:"#34d399", color:"#34d399", tags:["Hygiene","pH","Gentle"],           desc:"Maintains vaginal pH 3.8–4.5. Free from sulphates, parabens and fragrance.",                                href:"#" },
  { id:20, cat:"sexual",        name:"Libido Support Supplement",         brand:"HerLibido",         price:"₹1,799", original:"₹2,299", discount:"22%", rating:4.4, reviews:560,  badge:null,          badgeColor:null,     color:"#f472b6", tags:["Libido","Maca","Ashwagandha"],     desc:"Maca root, Ashwagandha, Shatavari — clinically studied for female libido and energy.",                      href:"#" },

  // Contraception
  { id:21, cat:"contraception", name:"Female Condoms (10 pack)",          brand:"Velvet",            price:"₹499",  original:"₹699",  discount:"29%", rating:4.3, reviews:780,  badge:"STI Protection",badgeColor:"#4f8ef7", color:"#4f8ef7", tags:["Condom","STI","Female-controlled"],desc:"Female-controlled protection. Works with any partner, including women. Nitrile — latex-free.",               href:"#" },
  { id:22, cat:"contraception", name:"Emergency Contraceptive Pill",      brand:"i-Pill",            price:"₹99",   original:"₹129",  discount:"23%", rating:4.2, reviews:11200,badge:"OTC",          badgeColor:"#fb923c", color:"#fb923c", tags:["Emergency","72hr","OTC"],          desc:"Levonorgestrel 1.5mg. Take within 72 hours of unprotected sex. Not for regular use.",                       href:"#" },
  { id:23, cat:"contraception", name:"Pregnancy Test Kit (2 pack)",       brand:"Prega News",        price:"₹149",  original:"₹199",  discount:"25%", rating:4.7, reviews:22000,badge:"99% Accurate",badgeColor:"#34d399", color:"#34d399", tags:["Pregnancy","Test","Early Detection"],desc:"99% accurate from the day of missed period. Results in 3 minutes.",                                          href:"#" },
  { id:24, cat:"contraception", name:"Ovulation Test Strips (20 pack)",   brand:"Pee Safe",          price:"₹399",  original:"₹549",  discount:"27%", rating:4.6, reviews:3400, badge:null,          badgeColor:null,     color:"#a78bfa", tags:["Ovulation","LH","Fertility"],       desc:"Detects LH surge 24–36 hours before ovulation. For family planning or PCOS monitoring.",                    href:"#" },

  // Fertility
  { id:25, cat:"fertility",     name:"CoQ10 Ubiquinol 200mg",             brand:"Qunol",             price:"₹2,199", original:"₹2,799", discount:"21%", rating:4.8, reviews:1100, badge:"Egg Quality", badgeColor:"#fbbf24", color:"#fbbf24", tags:["Fertility","Egg Quality","Mitochondria"],desc:"Most bioavailable form of CoQ10. Critical for egg cell energy production and quality.",                   href:"#" },
  { id:26, cat:"fertility",     name:"Folate (Methylfolate) 800mcg",      brand:"Thorne",            price:"₹1,299", original:"₹1,699", discount:"24%", rating:4.9, reviews:2100, badge:"Pre-natal",   badgeColor:"#34d399", color:"#34d399", tags:["Folate","Pre-natal","Neural Tube"],desc:"Active methylfolate — superior to folic acid. Essential before and during early pregnancy.",                  href:"#" },
  { id:27, cat:"fertility",     name:"DHEA 25mg (Micronised)",            brand:"Jarrow",            price:"₹1,499", original:"₹1,999", discount:"25%", rating:4.5, reviews:680,  badge:"Consult Dr",  badgeColor:"#fb923c", color:"#fb923c", tags:["DHEA","DOR","Ovarian Reserve"],   desc:"May improve ovarian reserve in women with diminished ovarian reserve. Use under medical supervision.",       href:"#" },

  // Skin & Hair
  { id:28, cat:"skincare",      name:"Collagen Peptides 10g sachets",     brand:"WOW Life Science",  price:"₹1,499", original:"₹1,999", discount:"25%", rating:4.6, reviews:3800, badge:null,          badgeColor:null,     color:"#f472b6", tags:["Collagen","Skin","Hair","Nails"],  desc:"Hydrolyzed Type I & III collagen. Improves skin elasticity, reduces hair thinning, strengthens nails.",     href:"#" },
  { id:29, cat:"skincare",      name:"Biotin 10000mcg",                   brand:"HealthKart",        price:"₹699",  original:"₹999",  discount:"30%", rating:4.5, reviews:6700, badge:"Hair Growth",  badgeColor:"#fbbf24", color:"#fbbf24", tags:["Biotin","Hair","Nails","Skin"],    desc:"High-potency biotin for hair growth, nail strength and skin health. Often deficient in PCOS.",              href:"#" },
  { id:30, cat:"skincare",      name:"Niacinamide Serum 10%",             brand:"Minimalist",        price:"₹599",  original:"₹799",  discount:"25%", rating:4.8, reviews:12400,badge:"Bestseller",  badgeColor:"#4f8ef7", color:"#4f8ef7", tags:["Acne","Pores","Hyperpigmentation"],"desc":"10% Niacinamide + 0.1% Zinc. Reduces acne, pores and hormonal hyperpigmentation.",                        href:"#" },
];

function StarRating({ rating }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:2}}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{fontSize:11,color:i<=Math.round(rating)?"#fbbf24":"rgba(255,255,255,0.18)"}}>★</span>
      ))}
    </div>
  );
}

export default function FemaleWellnessShop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { isFemale } = useUser();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => { setMounted(true); if (!isFemale) navigate("/dashboard"); }, []);

  const toggleWishlist = (id) =>
    setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w,id]);

  let filtered = PRODUCTS
    .filter(p => category==="all" || p.cat===category)
    .filter(p => search==="" || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())));

  if (sort==="popular")    filtered = [...filtered].sort((a,b) => b.reviews-a.reviews);
  if (sort==="rating")     filtered = [...filtered].sort((a,b) => b.rating-a.rating);
  if (sort==="price_low")  filtered = [...filtered].sort((a,b) => parseInt(a.price.replace(/[^\d]/g,""))-parseInt(b.price.replace(/[^\d]/g,"")));
  if (sort==="price_high") filtered = [...filtered].sort((a,b) => parseInt(b.price.replace(/[^\d]/g,""))-parseInt(a.price.replace(/[^\d]/g,"")));

  const css = generateCSS(T, dark) + `
    .fw-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}
    .fw-header{display:flex;align-items:center;justify-content:space-between;
      padding:22px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:50;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.pink};border-color:${T.pink}40;}
    .fw-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .fw-logo span{color:${T.pink};}
    .theme-toggle{width:54px;height:29px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;position:relative;}
    .toggle-thumb{width:23px;height:23px;border-radius:50%;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      position:absolute;top:3px;left:${dark?"28px":"3px"};
      transition:left 0.35s cubic-bezier(0.4,0,0.2,1);
      display:flex;align-items:center;justify-content:center;font-size:12px;}

    /* Hero */
    .fw-hero{background:linear-gradient(135deg,${dark?"rgba(244,114,182,0.1)":"rgba(244,114,182,0.07)"} 0%,${dark?"rgba(167,139,250,0.07)":"rgba(167,139,250,0.05)"} 100%);
      border-bottom:1px solid ${T.glassBorder};padding:36px 40px;position:relative;overflow:hidden;}
    .fw-hero::before{content:'';position:absolute;top:-50%;right:-5%;width:400px;height:400px;
      background:radial-gradient(circle,${T.pink}15,transparent 65%);border-radius:50%;pointer-events:none;}
    .fw-hero-content{max-width:1160px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:24px;}
    .fw-hero-title{font-family:${FONT.display};font-size:36px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:8px;}
    .fw-hero-title span{background:linear-gradient(135deg,${T.pink},${T.purple});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .fw-hero-sub{font-size:14px;color:${T.textSub};line-height:1.65;max-width:500px;}
    .fw-stats{display:flex;gap:24px;margin-top:18px;}
    .fw-stat-val{font-family:${FONT.display};font-size:24px;font-weight:800;color:${T.text};}
    .fw-stat-lbl{font-size:10px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:3px;}
    .adult-badge{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      background:${T.purpleSoft};border:1px solid ${T.purple}30;font-size:12px;font-weight:700;color:${T.purple};}

    /* Main */
    .fw-main{max-width:1200px;margin:0 auto;padding:28px 40px;position:relative;z-index:1;}

    /* Filters */
    .cat-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:18px;}
    .cat-btn{display:flex;align-items:center;gap:7px;padding:10px 18px;border-radius:13px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);
      cursor:pointer;font-size:13px;font-weight:700;color:${T.textSub};
      transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .cat-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .cat-btn.active{background:linear-gradient(135deg,${T.pink}20,${T.purple}15);
      color:${T.pink};border-color:${T.pink}35;box-shadow:0 0 16px ${T.pinkGlow}40;}

    .search-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
    .search-inp{flex:1;min-width:200px;height:44px;
      background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:0 18px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.25s;}
    .search-inp:focus{border-color:${T.pink};box-shadow:0 0 0 4px ${T.pinkGlow}20;}
    .search-inp::placeholder{color:${T.textMuted};}
    .sort-sel{height:44px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:13px;padding:0 14px;
      font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;cursor:pointer;}

    /* Product grid */
    .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}

    /* Product card */
    .p-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      backdrop-filter:blur(28px);overflow:hidden;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
      display:flex;flex-direction:column;}
    .p-card:hover{transform:translateY(-5px);border-color:${T.glassBorderHover};
      box-shadow:0 24px 60px rgba(0,0,0,${dark?"0.32":"0.1"});}
    .p-top{padding:20px 20px 0;flex:1;}
    .p-badge{display:inline-block;padding:4px 11px;border-radius:99px;
      font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;}
    .p-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
    .p-tag{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;
      background:${T.accentSoft};color:${T.accent};border:1px solid ${T.accent}20;}
    .p-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};margin-bottom:3px;line-height:1.3;}
    .p-brand{font-size:11px;color:${T.textMuted};margin-bottom:8px;}
    .p-desc{font-size:12px;color:${T.textSub};line-height:1.6;margin-bottom:12px;}
    .p-rating-row{display:flex;align-items:center;gap:7px;margin-bottom:12px;}
    .p-rating-num{font-size:12px;font-weight:800;color:${T.text};}
    .p-reviews{font-size:11px;color:${T.textMuted};}
    .p-price-row{display:flex;align-items:baseline;gap:8px;margin-bottom:4px;}
    .p-price{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};}
    .p-original{font-size:12px;color:${T.textMuted};text-decoration:line-through;}
    .p-discount{font-size:11px;font-weight:800;color:${T.green};}
    .p-bottom{padding:12px 20px 18px;display:flex;gap:8px;}
    .p-wish{width:42px;height:42px;border-radius:12px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;display:flex;align-items:center;justify-content:center;
      font-size:18px;transition:all 0.25s;flex-shrink:0;}
    .p-wish:hover{border-color:${T.pink}40;transform:scale(1.08);}
    .p-buy{flex:1;height:42px;border-radius:12px;border:none;
      background:linear-gradient(135deg,${T.pink},${T.purple});
      color:#fff;font-size:12px;font-weight:800;font-family:${FONT.body};
      cursor:pointer;transition:all 0.25s;letter-spacing:0.04em;}
    .p-buy:hover{filter:brightness(1.1);transform:translateY(-1px);}

    .results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
    .results-count{font-size:13px;color:${T.textSub};font-weight:600;}
    .results-count span{color:${T.text};font-weight:800;}

    .disclaimer{padding:16px 20px;border-radius:14px;background:${T.purpleSoft};
      border:1px solid ${T.purple}25;font-size:12px;color:${T.textMuted};line-height:1.65;
      margin:28px 0 0;text-align:center;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:900px){.fw-hero-content{flex-direction:column;}.fw-main{padding:20px 16px;}.cat-scroll{gap:6px;}}
    @media(max-width:600px){.fw-header{padding:18px 20px;}.fw-hero{padding:24px 20px;}.fw-hero-title{font-size:26px;}.product-grid{grid-template-columns:1fr 1fr;gap:12px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="fw-root">
        <div className="orb orb-1" style={{background:"radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 65%)"}} />
        <div className="orb orb-2" style={{background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)"}} />

        <div className="fw-header">
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button className="back-btn" onClick={() => navigate("/female-health")}>← Women's Health</button>
            <div className="fw-logo">AshFit<span>Verse</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,color:T.textSub,fontWeight:600}}>
              ♡ {wishlist.length > 0 ? `Saved (${wishlist.length})` : "Wishlist"}
            </span>
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark?"🌙":"☀️"}</div>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="fw-hero">
          <div className="fw-hero-content">
            <div>
              <div className="fw-hero-title">Women's <span>Wellness Shop</span></div>
              <div className="fw-hero-sub">
                Everything a woman needs — hormones, period care, sexual wellness, contraception and fertility.
                Curated, evidence-based, discreet delivery.
              </div>
              <div className="fw-stats">
                {[
                  {val:`${PRODUCTS.length}+`,lbl:"Products"},
                  {val:"8",lbl:"Categories"},
                  {val:"100%",lbl:"Discreet"},
                ].map((s,i) => (
                  <div key={i}>
                    <div className="fw-stat-val">{s.val}</div>
                    <div className="fw-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="adult-badge">
              🔒 18+ Content · Discreet Packaging · No Judgement
            </div>
          </div>
        </div>

        <div className="fw-main">
          {/* Category tabs */}
          <div className="cat-scroll" style={{animation:"fadeUp 0.6s ease both"}}>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`cat-btn ${category===c.id?"active":""}`}
                onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="search-row" style={{animation:"fadeUp 0.6s ease 0.05s both"}}>
            <input className="search-inp" placeholder="Search products, brands, conditions..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          <div className="results-bar" style={{animation:"fadeUp 0.6s ease 0.08s both"}}>
            <div className="results-count">
              Showing <span>{filtered.length}</span> products
              {category!=="all" && <span> in {CATEGORIES.find(c=>c.id===category)?.label}</span>}
            </div>
          </div>

          {/* Products */}
          <div className="product-grid" style={{animation:"fadeUp 0.6s ease 0.1s both"}}>
            {filtered.map((p,i) => (
              <div key={p.id} className="p-card" style={{animationDelay:`${i*0.03}s`}}>
                <div className="p-top">
                  {p.badge && (
                    <div className="p-badge" style={{background:`${p.badgeColor}18`,color:p.badgeColor,border:`1px solid ${p.badgeColor}28`}}>
                      {p.badge}
                    </div>
                  )}
                  <div className="p-tags">
                    {p.tags.slice(0,3).map((t,j) => (
                      <span key={j} className="p-tag" style={{background:`${p.color}14`,color:p.color,borderColor:`${p.color}25`}}>{t}</span>
                    ))}
                  </div>
                  <div className="p-name">{p.name}</div>
                  <div className="p-brand">{p.brand}</div>
                  <div className="p-desc">{p.desc}</div>
                  <div className="p-rating-row">
                    <StarRating rating={p.rating} />
                    <span className="p-rating-num">{p.rating}</span>
                    <span className="p-reviews">({p.reviews.toLocaleString()})</span>
                  </div>
                  <div className="p-price-row">
                    <span className="p-price">{p.price}</span>
                    <span className="p-original">{p.original}</span>
                    <span className="p-discount">{p.discount} OFF</span>
                  </div>
                </div>
                <div className="p-bottom">
                  <button className="p-wish" onClick={() => toggleWishlist(p.id)}>
                    {wishlist.includes(p.id)?"❤️":"🤍"}
                  </button>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" style={{flex:1,textDecoration:"none"}}>
                    <button className="p-buy">Buy Now ↗</button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <strong>🔒 Discreet & Private:</strong> All orders ship in plain, unmarked packaging. No product names on the outside.
            AshFitVerse earns affiliate commission on purchases. Products independently selected for quality and safety.
            Contraceptive and medical products should be used as directed — consult a healthcare provider for personalised advice.
          </div>
        </div>
      </div>
    </>
  );
}