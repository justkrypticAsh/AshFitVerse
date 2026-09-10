// src/features/shop/FemaleShop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const CATEGORIES = [
  { id: "all",          label: "All Products",      icon: "✨" },
  { id: "supplements",  label: "Supplements",       icon: "🥤" },
  { id: "pcos_pcod",    label: "PCOS & Hormones",   icon: "💊" },
  { id: "intimate",     label: "Sexual Wellness",   icon: "🌹" },
  { id: "menstrual",    label: "Menstrual Care",    icon: "🩸" },
  { id: "contraceptive",label: "Contraceptives",    icon: "🛡️" },
  { id: "skincare",     label: "Skincare & Body",   icon: "🧴" },
  { id: "gear",         label: "Fitness Gear",      icon: "🧘" },
];

const PRODUCTS = [
  // PCOS & Hormones
  {
    id: 101, cat: "pcos_pcod",
    name: "Myo-Inositol & D-Chiro Inositol 40:1",
    brand: "Wholesome Story", price: "₹2,199", original: "₹2,799", off: "21%",
    rating: 4.8, reviews: 14200, badge: "PCOS Choice", color: "#f472b6",
    tags: ["Inositol", "PCOS", "Ovulation"],
    desc: "Clinically proven 40:1 ratio. Restores ovulation, improves egg quality, and balances insulin.",
    href: "#"
  },
  {
    id: 102, cat: "pcos_pcod",
    name: "Spearmint Tea Leaves 100g",
    brand: "Vahdam", price: "₹449", original: "₹599", off: "25%",
    rating: 4.7, reviews: 5800, badge: "Anti-Androgen", color: "#34d399",
    tags: ["Tea", "Hormones", "Facial Hair"],
    desc: "Natural anti-androgenic tea. Helps reduce excess facial hair (hirsutism) and hormonal acne.",
    href: "#"
  },
  {
    id: 103, cat: "pcos_pcod",
    name: "Shatavari Root Extract 500mg",
    brand: "Himalaya", price: "₹349", original: "₹499", off: "30%",
    rating: 4.6, reviews: 8900, badge: "Ayurvedic", color: "#a78bfa",
    tags: ["Shatavari", "Estrogen", "Cycle"],
    desc: "Traditional female tonic. Regulates cycle length, reduces PMS symptoms, and supports vitality.",
    href: "#"
  },

  // Sexual Wellness
  {
    id: 104, cat: "intimate",
    name: "Clitoral Suction Air-Pulse Wave Massager",
    brand: "Satisfyer Pro 2", price: "₹3,499", original: "₹4,999", off: "30%",
    rating: 4.9, reviews: 18500, badge: "Best Seller", color: "#f472b6",
    tags: ["Air Pulse", "Waterproof", "Silicone"],
    desc: "Contactless air-pulse technology for deep clitoral stimulation. 11 intensity settings, 100% body-safe.",
    href: "#"
  },
  {
    id: 105, cat: "intimate",
    name: "Natural Water-Based Lubricant 100ml",
    brand: "MyMuse", price: "₹499", original: "₹699", off: "28%",
    rating: 4.8, reviews: 6200, badge: "pH Balanced", color: "#fb923c",
    tags: ["Lube", "pH Safe", "Aloe Vera"],
    desc: "Infused with aloe vera. Paraben-free, non-sticky, condom-compatible, and gentle on sensitive skin.",
    href: "#"
  },
  {
    id: 106, cat: "intimate",
    name: "G-Spot Dual-Motor Rabbit Vibrator",
    brand: "Lelo Sona", price: "₹6,999", original: "₹8,999", off: "22%",
    rating: 4.8, reviews: 2400, badge: "Premium", color: "#a78bfa",
    tags: ["Dual Motor", "G-Spot", "Rechargeable"],
    desc: "Ergonomic dual stimulation for G-spot and clitoris. Whisper quiet motors with 10 vibration modes.",
    href: "#"
  },
  {
    id: 107, cat: "intimate",
    name: "Pelvic Floor Kegel Exerciser Set",
    brand: "Elvie Trainer", price: "₹4,299", original: "₹5,499", off: "21%",
    rating: 4.7, reviews: 3100, badge: "Doctor Recommended", color: "#34d399",
    tags: ["Kegel", "Bladder Support", "Tightening"],
    desc: "Medical-grade silicone weights. Strengthens pelvic floor for better bladder control and intimacy.",
    href: "#"
  },

  // Menstrual Care
  {
    id: 108, cat: "menstrual",
    name: "Medical Grade Menstrual Cup (Medium)",
    brand: "Sirona", price: "₹399", original: "₹699", off: "42%",
    rating: 4.8, reviews: 24000, badge: "Eco Pick", color: "#f472b6",
    tags: ["Reusable", "12h Protection", "Silicone"],
    desc: "100% medical-grade silicone. Up to 12 hours leak-proof protection. Reusable up to 10 years.",
    href: "#"
  },
  {
    id: 109, cat: "menstrual",
    name: "Cramp Relief Heating Patches (Pack of 5)",
    brand: "Nua", price: "₹299", original: "₹399", off: "25%",
    rating: 4.7, reviews: 9400, badge: "Fast Relief", color: "#fb923c",
    tags: ["Heat Patch", "Period Cramps", "Drug-Free"],
    desc: "Air-activated self-heating patches. Provides 8 hours of continuous soothing warmth for period pain.",
    href: "#"
  },
  {
    id: 110, cat: "menstrual",
    name: "Organic Cotton Ultra-Thin Pads (12 Pack)",
    brand: "Carmesi", price: "₹249", original: "₹349", off: "28%",
    rating: 4.6, reviews: 11200, badge: "Chemical-Free", color: "#34d399",
    tags: ["Organic", "Rash-Free", "Cotton"],
    desc: "100% organic cotton top-sheet. Naturally rash-free, biodegradable, and free from artificial fragrances.",
    href: "#"
  },

  // Contraceptives
  {
    id: 111, cat: "contraceptive",
    name: "Emergency Contraceptive Pill (I-Pill)",
    brand: "Piramal", price: "₹110", original: "₹130", off: "15%",
    rating: 4.9, reviews: 32000, badge: "OTC Essential", color: "#ef4444",
    tags: ["72 Hours", "Emergency", "Oral Pill"],
    desc: "Levonorgestrel 1.5mg. Effective emergency oral contraception when taken within 72 hours.",
    href: "#"
  },
  {
    id: 112, cat: "contraceptive",
    name: "Female Condoms Extra Soft (3 Pack)",
    brand: "FC2", price: "₹499", original: "₹699", off: "28%",
    rating: 4.5, reviews: 2900, badge: "Female Controlled", color: "#f472b6",
    tags: ["Barrier", "Nitrile", "Non-Latex"],
    desc: "Nitrile barrier protection. Gives full control over contraception and STI protection. Latex-free.",
    href: "#"
  },

  // Supplements
  {
    id: 113, cat: "supplements",
    name: "Plant Protein for Women (Salted Caramel)",
    brand: "Cosmix", price: "₹1,649", original: "₹2,199", off: "25%",
    rating: 4.7, reviews: 7600, badge: "Easy Digest", color: "#a78bfa",
    tags: ["Plant Protein", "Zero Bloat", "Herbs"],
    desc: "Pea + brown rice protein with ayurvedic herbs. 22g protein, zero bloating, gluten-free.",
    href: "#"
  },
  {
    id: 114, cat: "supplements",
    name: "Iron + Folic Acid + Vitamin B12",
    brand: "HealthKart", price: "₹499", original: "₹699", off: "28%",
    rating: 4.6, reviews: 6100, badge: "Blood Health", color: "#ef4444",
    tags: ["Iron", "Anemia", "Energy"],
    desc: "Gentle iron chelate with Vitamin B12 and folate. Helps combat period fatigue and low hemoglobin.",
    href: "#"
  },

  // Skincare
  {
    id: 115, cat: "skincare",
    name: "Hormonal Acne 2% Salicylic Body Wash",
    brand: "Chemists at Play", price: "₹399", original: "₹599", off: "33%",
    rating: 4.6, reviews: 8100, badge: "Clear Skin", color: "#34d399",
    tags: ["Acne", "Salicylic Acid", "Smooth Skin"],
    desc: "Targets hormonal chest and back acne. Gently exfoliates pores without drying out skin.",
    href: "#"
  },

  // Gear
  {
    id: 116, cat: "gear",
    name: "Non-Slip Alignment Yoga Mat 6mm",
    brand: "Strauss", price: "₹1,299", original: "₹1,899", off: "31%",
    rating: 4.7, reviews: 4500, badge: "Eco TPE", color: "#f472b6",
    tags: ["Yoga", "6mm Cushion", "Alignment"],
    desc: "Laser-engraved alignment lines. Extra-thick 6mm TPE cushioning for joint protection during Pilates/Yoga.",
    href: "#"
  }
];

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 11, color: i <= Math.round(rating) ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </span>
  );
}

export default function FemaleShop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleWish = id => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  let filtered = PRODUCTS
    .filter(p => category === "all" || p.cat === category)
    .filter(p => !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  if (sort === "popular")    filtered.sort((a, b) => b.reviews - a.reviews);
  if (sort === "rating")     filtered.sort((a, b) => b.rating - a.rating);
  if (sort === "price_low")  filtered.sort((a, b) => parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, "")));
  if (sort === "price_high") filtered.sort((a, b) => parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, "")));

  const ACCENT = T.pink || "#f472b6";

  const css = generateCSS(T, dark) + `
    .fs-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.6s ease,background 0.5s;}

    /* Header */
    .fs-hd{
      display:flex;align-items:center;justify-content:space-between;
      padding:0 32px;height:60px;
      background:${dark ? "rgba(8,8,12,0.85)" : "rgba(255,255,255,0.85)"};
      border-bottom:1px solid ${T.glassBorder};
      backdrop-filter:blur(40px);
      position:sticky;top:0;z-index:50;
    }
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
      color:${T.text};font-size:13px;font-weight:600;cursor:pointer;
      font-family:${FONT.body};transition:all 0.15s ease;}
    .pr-back:hover{background:${ACCENT}15;border-color:${ACCENT}40;color:${ACCENT};}
    
    .fs-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .fs-logo span{color:${ACCENT};}

    .theme-toggle{width:48px;height:26px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;
      background:${ACCENT};display:flex;align-items:center;justify-content:center;
      font-size:10px;transition:left .2s ease;left:${dark ? "24px" : "2px"};}

    /* Hero Banner */
    .fs-hero{
      background:${dark
        ? "linear-gradient(135deg,rgba(244,114,182,0.15) 0%,rgba(167,139,250,0.08) 50%,rgba(10,10,14,0.95) 100%)"
        : "linear-gradient(135deg,rgba(244,114,182,0.10) 0%,rgba(167,139,250,0.06) 100%)"};
      border-bottom:1px solid ${T.glassBorder};
      padding:36px 40px;position:relative;overflow:hidden;
    }
    .fs-hero-title{font-family:${FONT.display};font-size:36px;font-weight:800;
      letter-spacing:-0.025em;color:${T.text};margin-bottom:8px;position:relative;z-index:1;}
    .fs-hero-title span{color:${ACCENT};}
    .fs-hero-sub{font-size:14px;color:${T.textSub};line-height:1.65;
      max-width:540px;position:relative;z-index:1;}
    .fs-hero-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;
      border-radius:99px;background:${ACCENT}15;border:1px solid ${ACCENT}30;
      font-size:12px;font-weight:700;color:${ACCENT};margin-top:14px;position:relative;z-index:1;}

    /* Main Container */
    .fs-main{max-width:1120px;margin:0 auto;padding:28px 32px;}

    /* Category Row */
    .cat-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:20px;}
    .cat-row::-webkit-scrollbar{height:0;}
    .cat-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;
      border:1.5px solid ${T.glassBorder};
      background:${dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)"};
      backdrop-filter:blur(20px);color:${T.textSub};font-size:12.5px;font-weight:700;
      cursor:pointer;transition:all 0.18s;white-space:nowrap;font-family:${FONT.body};}
    .cat-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .cat-btn.act{
      background:${ACCENT}18;color:${ACCENT};border-color:${ACCENT}40;
      box-shadow:0 0 16px ${ACCENT}25;}

    /* Filters */
    .filter-row{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;}
    .search-wrap{position:relative;flex:1;min-width:200px;}
    .search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;color:${T.textMuted};}
    .search-inp{width:100%;height:44px;background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:12px;
      padding:0 14px 0 36px;font-size:13px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.18s;}
    .search-inp:focus{border-color:${ACCENT};box-shadow:0 0 0 3px ${ACCENT}25;}
    .sort-sel{height:44px;padding:0 14px;background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:12px;font-size:13px;
      font-family:${FONT.body};color:${T.text};outline:none;cursor:pointer;}

    /* Product Grid */
    .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}

    .prod-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      backdrop-filter:blur(32px);display:flex;flex-direction:column;overflow:hidden;
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;
    }
    .prod-card:hover{transform:translateY(-5px);border-color:${T.glassBorderHover};
      box-shadow:0 18px 45px rgba(0,0,0,${dark ? "0.3" : "0.08"});}

    .prod-strip{height:3px;width:100%;}
    .prod-top{padding:18px;flex:1;}
    .prod-badge{display:inline-block;padding:3px 10px;border-radius:99px;
      font-size:9.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;}
    .prod-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
    .prod-tag{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;}
    .prod-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};
      margin-bottom:4px;line-height:1.3;}
    .prod-brand{font-size:11.5px;color:${T.textMuted};margin-bottom:8px;font-weight:600;}
    .prod-desc{font-size:12px;color:${T.textSub};line-height:1.6;margin-bottom:12px;}
    .prod-rating{display:flex;align-items:center;gap:7px;margin-bottom:12px;}
    .prod-rnum{font-size:12px;font-weight:800;color:${T.text};}
    .prod-reviews{font-size:11px;color:${T.textMuted};}
    .prod-price-row{display:flex;align-items:baseline;gap:8px;}
    .prod-price{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};}
    .prod-orig{font-size:12px;color:${T.textMuted};text-decoration:line-through;}
    .prod-off{font-size:11px;font-weight:800;color:#34d399;}

    .prod-btns{padding:12px 18px 18px;display:flex;gap:8px;}
    .wish-btn{width:42px;height:42px;border-radius:12px;border:1px solid ${T.glassBorder};
      background:${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
      display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;}
    .buy-btn{flex:1;height:42px;border-radius:12px;border:none;color:#fff;
      font-size:13px;font-weight:800;font-family:${FONT.body};cursor:pointer;
      transition:all 0.2s;letter-spacing:0.03em;}
    .buy-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}

    .disclaimer{margin-top:36px;padding:16px 20px;border-radius:14px;
      background:${ACCENT}10;border:1px solid ${ACCENT}25;
      font-size:12px;color:${T.textSub};line-height:1.65;text-align:center;}

    @media(max-width:700px){.fs-main{padding:20px 16px;}.prod-grid{grid-template-columns:1fr;}.fs-hd{padding:0 16px;}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="fs-root">
        {/* Header */}
        <div className="fs-hd">
          <button className="pr-back" onClick={() => navigate("/female-health")}>← Female Health</button>
          <div className="fs-logo">AshFit<span>Store</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {wishlist.length > 0 && <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700 }}>♡ {wishlist.length} saved</span>}
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="fs-hero">
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div className="fs-hero-title">Women's <span>Wellness Store</span></div>
            <div className="fs-hero-sub">
              PCOS/PCOD supplements, menstrual essentials, hormone balance, intimacy, and contraceptives — 100% confidential and discreet.
            </div>
            <div className="fs-hero-badge">
              📦 100% Discreet Plain Packaging &nbsp;·&nbsp; 🔒 Confidential Billing &nbsp;·&nbsp; 🌸 Verified Female Health Brands
            </div>
          </div>
        </div>

        <div className="fs-main">
          {/* Category row */}
          <div className="cat-row">
            {CATEGORIES.map(c => (
              <button key={c.id} className={`cat-btn ${category === c.id ? "act" : ""}`} onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div className="search-wrap">
              <span className="search-ico">🔍</span>
              <input className="search-inp" placeholder="Search supplements, menstrual cups, vitamins..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>

          {/* Product grid */}
          <div className="prod-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="prod-card">
                <div className="prod-strip" style={{ background: `linear-gradient(90deg,${p.color},${p.color}66)` }} />
                
                <div className="prod-top">
                  {p.badge && (
                    <div className="prod-badge" style={{ background: `${p.color}16`, color: p.color, border: `1px solid ${p.color}28` }}>
                      {p.badge}
                    </div>
                  )}
                  <div className="prod-tags">
                    {p.tags.map((t, j) => (
                      <span key={j} className="prod-tag" style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}22` }}>{t}</span>
                    ))}
                  </div>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-brand">{p.brand}</div>
                  <div className="prod-desc">{p.desc}</div>
                  
                  <div className="prod-rating">
                    <Stars rating={p.rating} />
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
                  <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                    <button className="buy-btn" style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)`, width: "100%" }}>
                      Buy Now ↗
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <strong>📦 100% Plain Packaging:</strong> All sexual wellness & contraceptive orders are delivered in unbranded boxes without product labels. 
            &nbsp;|&nbsp; <strong>Affiliate Disclosure:</strong> AshFitStore earns a small commission at no additional cost to you.
          </div>
        </div>
      </div>
    </>
  );
}