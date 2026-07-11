// src/features/shop/MaleWellnessShop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

// ─── Product Data ──────────────────────────────────────────
const CATEGORIES = [
  { id: "all",         label: "All Products",       icon: "🛒" },
  { id: "testosterone",label: "Testosterone",        icon: "⚡" },
  { id: "performance", label: "Performance",         icon: "❤️" },
  { id: "mental",      label: "Mental Health",       icon: "🧠" },
  { id: "sleep",       label: "Sleep & Recovery",    icon: "😴" },
  { id: "protein",     label: "Protein & Fitness",   icon: "🏋️" },
  { id: "sexual",      label: "Sexual Wellness",     icon: "🔒" },
];

const PRODUCTS = [
  // ── Testosterone ──
  {
    id: 1, cat: "testosterone",
    name: "Ashwagandha KSM-66 600mg",
    brand: "Himalaya Wellness",
    price: 549, mrp: 799,
    rating: 4.8, reviews: 2841,
    badge: "Best Seller",
    badgeColor: "#fb923c",
    color: "#fb923c",
    emoji: "🌿",
    desc: "KSM-66 — the only ashwagandha extract with 22+ clinical trials. Reduces cortisol by 27%, raises testosterone by 17%.",
    tags: ["Cortisol", "T-Boost", "Stress"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 2, cat: "testosterone",
    name: "Tongkat Ali 200:1 Extract",
    brand: "Double Wood Supplements",
    price: 2499, mrp: 3199,
    rating: 4.6, reviews: 1203,
    badge: "Clinical Grade",
    badgeColor: "#4f8ef7",
    color: "#4f8ef7",
    emoji: "⚡",
    desc: "LJ100 standardised extract — the most researched Tongkat Ali form. Reduces SHBG, increases free testosterone and libido.",
    tags: ["Free T", "Libido", "SHBG"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 3, cat: "testosterone",
    name: "ZMA (Zinc + Magnesium + B6)",
    brand: "Optimum Nutrition",
    price: 1199, mrp: 1599,
    rating: 4.7, reviews: 4512,
    badge: null,
    color: "#34d399",
    emoji: "💊",
    desc: "Classic ZMA formula. Zinc 30mg + Magnesium 450mg + B6 10mg. Improves testosterone, deep sleep and recovery simultaneously.",
    tags: ["Zinc", "Magnesium", "Sleep"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 4, cat: "testosterone",
    name: "Vitamin D3 + K2 (5000 IU)",
    brand: "Now Foods",
    price: 1299, mrp: 1799,
    rating: 4.9, reviews: 6234,
    badge: "Top Rated",
    badgeColor: "#fbbf24",
    color: "#fbbf24",
    emoji: "☀️",
    desc: "Deficient men have 25% lower testosterone. D3+K2 combo ensures calcium goes to bones, not arteries. Most important supplement for Indian men.",
    tags: ["Vitamin D", "K2", "Immunity"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 5, cat: "testosterone",
    name: "Boron Glycinate 10mg",
    brand: "Jarrow Formulas",
    price: 1899, mrp: 2499,
    rating: 4.5, reviews: 876,
    badge: "Science-Backed",
    badgeColor: "#a78bfa",
    color: "#a78bfa",
    emoji: "🔬",
    desc: "10mg boron daily increases free testosterone by 28% and reduces oestrogen by 39% in 7 days. Often overlooked but highly effective.",
    tags: ["Free T", "Anti-E", "Boron"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 6, cat: "testosterone",
    name: "Fadogia Agrestis 600mg",
    brand: "Gorilla Mind",
    price: 3499, mrp: 4299,
    rating: 4.3, reviews: 512,
    badge: "Advanced",
    badgeColor: "#f87171",
    color: "#f87171",
    emoji: "🦍",
    desc: "Raises LH (luteinising hormone) which signals testes to produce more testosterone. Cycle 8 weeks on, 4 weeks off.",
    tags: ["LH", "T-Boost", "Cycle"],
    affiliate: "https://amzn.to/placeholder",
  },

  // ── Performance / Sexual Wellness ──
  {
    id: 7, cat: "performance",
    name: "L-Citrulline Malate 2:1 (500g)",
    brand: "Bulk Supplements",
    price: 1299, mrp: 1799,
    rating: 4.8, reviews: 3201,
    badge: "Best for Blood Flow",
    badgeColor: "#f472b6",
    color: "#f472b6",
    emoji: "💉",
    desc: "Boosts nitric oxide by 30–50%. Improves erectile function, gym pump and endurance. Pure powder, no fillers.",
    tags: ["NO Boost", "Pump", "Performance"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 8, cat: "performance",
    name: "Maca Root Extract 3000mg",
    brand: "Naturo Sciences",
    price: 1499, mrp: 1999,
    rating: 4.5, reviews: 1876,
    badge: null,
    color: "#fbbf24",
    emoji: "🌱",
    desc: "Peruvian root that increases libido, sexual desire and energy without directly raising testosterone. Improves sperm quality.",
    tags: ["Libido", "Sperm", "Energy"],
    affiliate: "https://amzn.to/placeholder",
  },

  // ── Sexual Wellness (discreet) ──
  {
    id: 9, cat: "sexual",
    name: "Durex Ultra Thin Condoms (10s)",
    brand: "Durex",
    price: 299, mrp: 399,
    rating: 4.7, reviews: 8902,
    badge: "Discreet Shipping",
    badgeColor: "#34d399",
    color: "#34d399",
    emoji: "🛡️",
    desc: "0.06mm ultra-thin for maximum sensation. Electronically tested. WHO-approved. pH-balanced lubricant.",
    tags: ["Safety", "STI", "Condom"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 10, cat: "sexual",
    name: "Water-Based Lubricant 100ml",
    brand: "Durex Play",
    price: 349, mrp: 449,
    rating: 4.6, reviews: 4231,
    badge: "Discreet Shipping",
    badgeColor: "#34d399",
    color: "#4f8ef7",
    emoji: "💧",
    desc: "pH-balanced, glycerin-free, condom-safe. Longer lasting than regular lubes. Safe for sensitive skin.",
    tags: ["Lubricant", "pH-Safe", "Condom-Safe"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 11, cat: "sexual",
    name: "Delay Spray (Lidocaine 9.6%)",
    brand: "Manforce Staylong",
    price: 449, mrp: 599,
    rating: 4.4, reviews: 2103,
    badge: "Discreet Shipping",
    badgeColor: "#34d399",
    color: "#a78bfa",
    emoji: "⏱️",
    desc: "Clinically tested lidocaine spray for premature ejaculation. Apply 15 min before. Absorbs fully — no transfer to partner.",
    tags: ["PE", "Delay", "Topical"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 12, cat: "sexual",
    name: "Male Performance Toy (Pocket)",
    brand: "Tenga",
    price: 999, mrp: 1499,
    rating: 4.5, reviews: 1456,
    badge: "Discreet Shipping",
    badgeColor: "#34d399",
    color: "#fb923c",
    emoji: "🔒",
    desc: "Japanese-engineered internal texture. Disposable, hygienic, sealed packaging. Used for training ejaculatory control.",
    tags: ["Solo", "PE Training", "Discreet"],
    affiliate: "https://amzn.to/placeholder",
  },

  // ── Mental Health ──
  {
    id: 13, cat: "mental",
    name: "L-Theanine 200mg",
    brand: "Doctor's Best",
    price: 999, mrp: 1399,
    rating: 4.8, reviews: 3401,
    badge: "Calm Focus",
    badgeColor: "#4f8ef7",
    color: "#4f8ef7",
    emoji: "🧘",
    desc: "Calms without sedating. Pairs with caffeine for clean focus. Reduces anxiety and improves sleep architecture.",
    tags: ["Anxiety", "Focus", "Sleep"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 14, cat: "mental",
    name: "Omega-3 Triple Strength",
    brand: "HealthKart HK Vitals",
    price: 799, mrp: 1099,
    rating: 4.7, reviews: 5623,
    badge: null,
    color: "#38bdf8",
    emoji: "🐟",
    desc: "2g EPA+DHA per serving. Reduces inflammation, improves mood, testosterone and sperm quality. Anti-SHBG effect.",
    tags: ["EPA", "DHA", "Anti-inflammatory"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 15, cat: "mental",
    name: "Rhodiola Rosea 500mg",
    brand: "Now Foods",
    price: 1799, mrp: 2299,
    rating: 4.6, reviews: 1234,
    badge: "Adaptogen",
    badgeColor: "#34d399",
    color: "#34d399",
    emoji: "🌸",
    desc: "Reduces burnout, fatigue and cortisol. Improves physical and mental performance under stress. Best adaptogen for high-performers.",
    tags: ["Adaptogen", "Cortisol", "Fatigue"],
    affiliate: "https://amzn.to/placeholder",
  },

  // ── Sleep & Recovery ──
  {
    id: 16, cat: "sleep",
    name: "Magnesium Glycinate 400mg",
    brand: "Doctor's Best",
    price: 1299, mrp: 1799,
    rating: 4.9, reviews: 7823,
    badge: "#1 for Sleep",
    badgeColor: "#a78bfa",
    color: "#a78bfa",
    emoji: "🌙",
    desc: "Best absorbed form of magnesium. Improves deep sleep, reduces cortisol, decreases muscle soreness and improves insulin sensitivity.",
    tags: ["Deep Sleep", "Cortisol", "Muscles"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 17, cat: "sleep",
    name: "Apigenin + L-Theanine Sleep Stack",
    brand: "Momentous",
    price: 3299, mrp: 4299,
    rating: 4.7, reviews: 892,
    badge: "Huberman Protocol",
    badgeColor: "#fbbf24",
    color: "#fbbf24",
    emoji: "😴",
    desc: "Andrew Huberman's sleep stack: Apigenin 50mg + L-Theanine 200mg. Non-habit forming. Improves sleep onset and REM quality.",
    tags: ["REM", "Sleep Onset", "Non-habit"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 18, cat: "sleep",
    name: "Ashwagandha + Magnesium Night Pack",
    brand: "HealthKart",
    price: 1499, mrp: 1999,
    rating: 4.6, reviews: 2103,
    badge: null,
    color: "#a78bfa",
    emoji: "🌛",
    desc: "Evening stack combo — Ashwagandha 300mg + Magnesium Glycinate 200mg. Reduces night cortisol and improves deep sleep.",
    tags: ["Cortisol", "Deep Sleep", "Recovery"],
    affiliate: "https://amzn.to/placeholder",
  },

  // ── Protein & Fitness ──
  {
    id: 19, cat: "protein",
    name: "Whey Protein Isolate (1kg)",
    brand: "MuscleBlaze Biozyme",
    price: 2299, mrp: 2999,
    rating: 4.8, reviews: 12431,
    badge: "Best in India",
    badgeColor: "#fb923c",
    color: "#fb923c",
    emoji: "💪",
    desc: "Enhanced absorption whey isolate. 27g protein per serving, <1g fat & sugar. FSSAI certified, lab tested for purity.",
    tags: ["Isolate", "High Protein", "Low Fat"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 20, cat: "protein",
    name: "Creatine Monohydrate (500g)",
    brand: "Optimum Nutrition",
    price: 1499, mrp: 1999,
    rating: 4.9, reviews: 9823,
    badge: "Most Studied",
    badgeColor: "#34d399",
    color: "#34d399",
    emoji: "🔋",
    desc: "The most researched supplement in sports science. 5g daily increases strength, muscle mass, DHT and cognitive function.",
    tags: ["Strength", "Muscle", "DHT"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 21, cat: "protein",
    name: "Pre-Workout (DMHA-Free)",
    brand: "Cellucor C4 Original",
    price: 2499, mrp: 3499,
    rating: 4.6, reviews: 4321,
    badge: null,
    color: "#f87171",
    emoji: "⚡",
    desc: "Clean pre-workout with Citrulline 6g, Beta-Alanine, CarnoSyn, Caffeine 150mg. No proprietary blends, fully dosed.",
    tags: ["Energy", "Pump", "Focus"],
    affiliate: "https://amzn.to/placeholder",
  },
  {
    id: 22, cat: "protein",
    name: "Electrolyte Powder (30 servings)",
    brand: "LMNT",
    price: 2999, mrp: 3999,
    rating: 4.8, reviews: 3102,
    badge: "Zero Sugar",
    badgeColor: "#4f8ef7",
    color: "#4f8ef7",
    emoji: "💧",
    desc: "Sodium 1000mg, Potassium 200mg, Magnesium 60mg per serving. For serious athletes. No sugar, no artificial sweeteners.",
    tags: ["Hydration", "Sodium", "Keto-friendly"],
    affiliate: "https://amzn.to/placeholder",
  },
];

// ─────────────────────────────────────────────────────────
export default function MaleWellnessShop() {
  const navigate  = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user }  = useUser();
  const [mounted, setMounted]   = useState(false);
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch]     = useState("");
  const [cart, setCart]         = useState(() => {
    try { return JSON.parse(localStorage.getItem("ashfitverse_cart") || "[]"); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ashfitverse_wishlist") || "[]"); } catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { localStorage.setItem("ashfitverse_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("ashfitverse_wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const showToast = (msg, color = T.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product) => {
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    showToast(`${product.name.split(" ").slice(0, 3).join(" ")} added to cart!`);
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));

  const toggleWishlist = (product) => {
    setWishlist(w => {
      if (w.includes(product.id)) return w.filter(x => x !== product.id);
      showToast(`Added to wishlist ❤️`, T.pink);
      return [...w, product.id];
    });
  };

  const cartTotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  // Filter + sort
  let filtered = PRODUCTS
    .filter(p => activeCat === "all" || p.cat === activeCat)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  if (sortBy === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const css = generateCSS(T, dark) + `
    .ms-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};
      opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.4s;}

    .ms-header{display:flex;align-items:center;justify-content:space-between;
      padding:20px 40px;border-bottom:1px solid ${T.glassBorder};
      background:${dark?"rgba(7,8,15,0.90)":"rgba(242,244,252,0.90)"};
      backdrop-filter:blur(32px);position:sticky;top:0;z-index:100;}
    .back-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
      border:1px solid ${T.glassBorder};background:${T.glass};color:${T.textSub};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.22s;font-family:${FONT.body};}
    .back-btn:hover{color:${T.accent};border-color:${T.accent}40;}
    .ms-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .ms-logo span{color:${T.accent};}
    .ms-header-right{display:flex;align-items:center;gap:10px;}

    .cart-btn{position:relative;width:44px;height:44px;border-radius:13px;
      border:1px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(12px);
      display:flex;align-items:center;justify-content:center;font-size:18px;
      cursor:pointer;transition:all 0.22s;color:${T.textSub};}
    .cart-btn:hover{border-color:${T.accent}40;color:${T.accent};}
    .cart-badge{position:absolute;top:-6px;right:-6px;width:18px;height:18px;
      border-radius:50%;background:${T.accent};color:#fff;
      font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;}

    .ms-content{max-width:1300px;margin:0 auto;padding:28px 40px;position:relative;z-index:1;}

    /* Hero banner */
    .ms-hero{border-radius:24px;padding:32px 40px;margin-bottom:28px;
      background:linear-gradient(135deg,${T.accent}18,${T.purple}12);
      border:1px solid ${T.accent}25;position:relative;overflow:hidden;}
    .ms-hero::before{content:'';position:absolute;top:-40px;right:-40px;
      width:200px;height:200px;border-radius:50%;
      background:radial-gradient(circle,${T.accent}20,transparent 70%);}
    .ms-hero-title{font-family:${FONT.display};font-size:28px;font-weight:800;
      color:${T.text};margin-bottom:6px;position:relative;}
    .ms-hero-sub{font-size:14px;color:${T.textSub};line-height:1.6;max-width:500px;position:relative;}
    .ms-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
      border-radius:99px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);
      font-size:12px;font-weight:700;color:${T.text};margin-top:16px;position:relative;}

    /* Search + sort */
    .ms-controls{display:flex;gap:12px;margin-bottom:24px;align-items:center;}
    .ms-search{flex:1;height:48px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1.5px solid ${T.glassBorder};border-radius:14px;padding:0 18px;
      font-size:14px;font-family:${FONT.body};color:${T.text};outline:none;transition:all 0.25s;}
    .ms-search:focus{border-color:${T.accent};background:${T.accentSoft};}
    .ms-search::placeholder{color:${T.textMuted};}
    .ms-sort{height:48px;padding:0 16px;background:${T.glass};border:1.5px solid ${T.glassBorder};
      border-radius:14px;font-size:13px;font-family:${FONT.body};font-weight:600;
      color:${T.textSub};cursor:pointer;outline:none;transition:all 0.25s;}
    .ms-sort:focus{border-color:${T.accent};}

    /* Categories */
    .cat-row{display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:4px;}
    .cat-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:13px;
      border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);
      font-size:13px;font-weight:700;color:${T.textSub};cursor:pointer;
      transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .cat-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .cat-btn.active{background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;border-color:transparent;box-shadow:0 4px 16px ${T.accentGlow};}
    .cat-ico{font-size:16px;}

    /* Product grid */
    .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
    .prod-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;
      padding:20px;backdrop-filter:blur(28px);transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
      display:flex;flex-direction:column;position:relative;overflow:hidden;}
    .prod-card:hover{transform:translateY(-5px);border-color:${T.glassBorderHover};
      box-shadow:0 24px 60px rgba(0,0,0,${dark?"0.35":"0.10"});}
    .prod-card::before{content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,var(--pc)06,transparent 55%);pointer-events:none;}

    .prod-badge{display:inline-block;padding:4px 11px;border-radius:99px;font-size:10px;
      font-weight:800;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.06em;}
    .prod-emoji{font-size:36px;margin-bottom:12px;display:block;}
    .prod-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};margin-bottom:3px;}
    .prod-brand{font-size:11px;color:${T.textMuted};margin-bottom:8px;}
    .prod-desc{font-size:12px;color:${T.textSub};line-height:1.55;margin-bottom:12px;flex:1;}

    .prod-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}
    .prod-tag{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;}

    /* Rating */
    .prod-rating{display:flex;align-items:center;gap:6px;margin-bottom:12px;}
    .stars{display:flex;gap:1px;}
    .star{font-size:11px;}
    .rating-num{font-size:12px;font-weight:700;color:${T.text};}
    .rating-count{font-size:11px;color:${T.textMuted};}

    /* Price */
    .prod-price-row{display:flex;align-items:baseline;gap:8px;margin-bottom:14px;}
    .prod-price{font-family:${FONT.display};font-size:22px;font-weight:800;}
    .prod-mrp{font-size:13px;color:${T.textMuted};text-decoration:line-through;}
    .prod-discount{font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;
      background:${T.greenSoft};color:${T.green};}

    /* Buttons */
    .prod-btns{display:flex;gap:8px;margin-top:auto;}
    .wish-btn{width:40px;height:40px;border-radius:11px;border:1.5px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;display:flex;align-items:center;
      justify-content:center;font-size:16px;transition:all 0.22s;flex-shrink:0;}
    .wish-btn:hover{transform:scale(1.1);border-color:${T.pink}40;}
    .wish-btn.active{border-color:${T.pink};background:${T.pinkSoft};}
    .add-btn{flex:1;height:40px;border-radius:11px;border:none;
      background:linear-gradient(135deg,var(--pc),var(--pc)cc);
      color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:${FONT.body};
      transition:all 0.25s;letter-spacing:0.04em;}
    .add-btn:hover{filter:brightness(1.12);transform:translateY(-1px);}
    .buy-btn{flex:1;height:40px;border-radius:11px;
      border:1.5px solid var(--pc);background:transparent;
      color:var(--pc);font-size:12px;font-weight:800;cursor:pointer;font-family:${FONT.body};
      transition:all 0.25s;letter-spacing:0.04em;}
    .buy-btn:hover{background:linear-gradient(135deg,var(--pc)15,transparent);}

    /* Results count */
    .results-count{font-size:13px;color:${T.textMuted};font-weight:600;margin-bottom:16px;}

    /* Empty state */
    .empty-state{text-align:center;padding:60px 20px;color:${T.textSub};}
    .empty-ico{font-size:48px;margin-bottom:12px;}

    /* Cart drawer */
    .cart-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);
      backdrop-filter:blur(8px);opacity:${showCart?1:0};
      pointer-events:${showCart?"all":"none"};transition:opacity 0.3s;}
    .cart-drawer{position:fixed;right:0;top:0;bottom:0;width:400px;z-index:201;
      background:${dark?"#0c0e1a":"#ffffff"};border-left:1px solid ${T.glassBorder};
      display:flex;flex-direction:column;
      transform:${showCart?"translateX(0)":"translateX(100%)"};
      transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);}
    .cart-head{padding:24px;border-bottom:1px solid ${T.glassBorder};
      display:flex;align-items:center;justify-content:space-between;}
    .cart-title{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .cart-close{width:36px;height:36px;border-radius:10px;border:1px solid ${T.glassBorder};
      background:${T.glass};cursor:pointer;display:flex;align-items:center;justify-content:center;
      font-size:16px;color:${T.textSub};transition:all 0.2s;}
    .cart-close:hover{border-color:${T.red}40;color:${T.red};}
    .cart-items{flex:1;overflow-y:auto;padding:20px;}
    .cart-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid ${T.glassBorder};}
    .cart-item:last-child{border-bottom:none;}
    .ci-emoji{font-size:28px;flex-shrink:0;}
    .ci-name{font-size:13px;font-weight:700;color:${T.text};margin-bottom:3px;}
    .ci-brand{font-size:11px;color:${T.textMuted};margin-bottom:6px;}
    .ci-price{font-family:${FONT.display};font-size:15px;font-weight:800;}
    .ci-remove{background:none;border:none;color:${T.red};font-size:12px;
      font-weight:700;cursor:pointer;font-family:${FONT.body};transition:opacity 0.2s;}
    .ci-remove:hover{opacity:0.7;}
    .cart-foot{padding:20px;border-top:1px solid ${T.glassBorder};}
    .cart-total{display:flex;justify-content:space-between;font-size:16px;
      font-weight:800;color:${T.text};margin-bottom:16px;}
    .cart-total span:last-child{font-family:${FONT.display};color:${T.accent};}
    .checkout-btn{width:100%;height:52px;border-radius:14px;border:none;
      background:linear-gradient(135deg,${T.accent},${T.purple});
      color:#fff;font-size:14px;font-weight:800;font-family:${FONT.body};
      letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;
      transition:all 0.3s;box-shadow:0 8px 24px ${T.accentGlow};}
    .checkout-btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px ${T.accentGlow};}
    .empty-cart{text-align:center;padding:40px 20px;color:${T.textSub};}

    /* Toast */
    .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      padding:14px 24px;border-radius:14px;font-size:13px;font-weight:700;
      color:#fff;z-index:300;backdrop-filter:blur(20px);
      animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      box-shadow:0 8px 32px rgba(0,0,0,0.3);white-space:nowrap;}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

    /* Discreet badge */
    .discreet-note{display:flex;align-items:center;gap:8px;padding:10px 16px;
      border-radius:11px;background:${T.accentSoft};border:1px solid ${T.accent}25;
      font-size:11px;font-weight:700;color:${T.accent};margin-bottom:16px;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:960px){.prod-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));}.cart-drawer{width:100%;}}
    @media(max-width:600px){.ms-content{padding:20px 16px;}.ms-header{padding:16px 20px;}.cat-row{gap:6px;}.ms-controls{flex-wrap:wrap;}.ms-hero{padding:22px 20px;}}
  `;

  const discount = (price, mrp) => Math.round(((mrp - price) / mrp) * 100);

  return (
    <>
      <style>{css}</style>
      <div className="ms-root">
        <div className="orb orb-1" style={{ background: "radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 65%)" }} />
        <div className="orb orb-2" style={{ background: "radial-gradient(circle,rgba(251,146,60,0.05) 0%,transparent 65%)" }} />

        {/* Cart overlay */}
        <div className="cart-overlay" onClick={() => setShowCart(false)} />
        <div className="cart-drawer">
          <div className="cart-head">
            <div className="cart-title">🛒 Your Cart ({cartCount})</div>
            <button className="cart-close" onClick={() => setShowCart(false)}>✕</button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Cart is empty</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Add some products to get started</div>
              </div>
            ) : (
              cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <span className="ci-emoji">{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div className="ci-name">{item.name}</div>
                    <div className="ci-brand">{item.brand}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div className="ci-price" style={{ color: item.color }}>₹{(item.price * item.qty).toLocaleString()}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: T.textMuted }}>×{item.qty}</span>
                        <button className="ci-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="cart-foot">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12, textAlign: "center" }}>
                🔒 Discreet packaging · Plain box · No product names visible
              </div>
              <button className="checkout-btn">Proceed to Checkout →</button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="ms-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate("/male-health")}>← Men's Health</button>
            <div className="ms-logo">AshFit<span>Verse</span></div>
          </div>
          <div className="ms-header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
            </button>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒
              {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
            </button>
          </div>
        </div>

        <div className="ms-content">
          {/* Hero */}
          <div className="ms-hero" style={{ animation: "fadeUp 0.6s ease both" }}>
            <div className="ms-hero-title">♂ Men's Wellness Shop</div>
            <div className="ms-hero-sub">
              Clinically-backed supplements, sexual wellness products and fitness essentials — curated for real results.
              Every product vetted for quality, evidence and value.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              {["✅ Evidence-based only", "🚚 Discreet shipping", "🔒 Private billing", "💊 Lab-tested brands"].map((b, i) => (
                <div key={i} className="ms-hero-badge">{b}</div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="ms-controls" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            <input className="ms-search" placeholder="🔍  Search supplements, brands, benefits..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="ms-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low–High</option>
              <option value="price-high">Price: High–Low</option>
            </select>
          </div>

          {/* Categories */}
          <div className="cat-row" style={{ animation: "fadeUp 0.6s ease 0.08s both" }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`cat-btn ${activeCat === c.id ? "active" : ""}`}
                onClick={() => setActiveCat(c.id)}>
                <span className="cat-ico">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Discreet note for sexual category */}
          {activeCat === "sexual" && (
            <div className="discreet-note">
              🔒 All items in this category ship in plain, unmarked packaging. No product details on box or billing statement.
            </div>
          )}

          {/* Results count */}
          <div className="results-count" style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
            Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {search && ` for "${search}"`}
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ico">🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No products found</div>
              <div style={{ fontSize: 13 }}>Try a different search or category</div>
            </div>
          ) : (
            <div className="prod-grid" style={{ animation: "fadeUp 0.6s ease 0.12s both" }}>
              {filtered.map(p => (
                <div key={p.id} className="prod-card" style={{ "--pc": p.color }}>
                  {p.badge && (
                    <div className="prod-badge" style={{ background: `${p.badgeColor || p.color}18`, color: p.badgeColor || p.color, border: `1px solid ${p.badgeColor || p.color}28` }}>
                      {p.badge}
                    </div>
                  )}
                  <span className="prod-emoji">{p.emoji}</span>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-brand">{p.brand}</div>
                  <div className="prod-desc">{p.desc}</div>

                  <div className="prod-tags">
                    {p.tags.map((t, i) => (
                      <span key={i} className="prod-tag"
                        style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}22` }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="prod-rating">
                    <div className="stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="star" style={{ color: s <= Math.round(p.rating) ? "#fbbf24" : T.glassBorder }}>★</span>
                      ))}
                    </div>
                    <span className="rating-num">{p.rating}</span>
                    <span className="rating-count">({p.reviews.toLocaleString()})</span>
                  </div>

                  <div className="prod-price-row">
                    <span className="prod-price" style={{ color: p.color }}>₹{p.price.toLocaleString()}</span>
                    <span className="prod-mrp">₹{p.mrp.toLocaleString()}</span>
                    <span className="prod-discount">{discount(p.price, p.mrp)}% off</span>
                  </div>

                  <div className="prod-btns">
                    <button className={`wish-btn ${wishlist.includes(p.id) ? "active" : ""}`}
                      onClick={() => toggleWishlist(p)}>
                      {wishlist.includes(p.id) ? "❤️" : "🤍"}
                    </button>
                    <button className="add-btn" onClick={() => addToCart(p)}>
                      + Add to Cart
                    </button>
                    <a href={p.affiliate} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button className="buy-btn">Buy ↗</button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Affiliate + disclaimer */}
          <div style={{ marginTop: 40, padding: "16px 20px", borderRadius: 14, background: T.glass, border: `1px solid ${T.glassBorder}`, fontSize: 11, color: T.textMuted, textAlign: "center", lineHeight: 1.65 }}>
            <strong style={{ color: T.text }}>Affiliate Disclosure:</strong> Some links above are affiliate links. AshFitVerse earns a small commission at no extra cost to you.
            Products are selected based on clinical evidence, quality certifications and user reviews — never paid placement.
            Sexual wellness products ship in plain, unmarked packaging. · <strong style={{ color: T.text }}>18+ only</strong>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="toast" style={{ background: toast.color }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}