// src/features/shop/MaleShop.jsx — Men's Wellness, Testosterone & Performance Shop
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { buildAmazonAffiliateUrl } from "../../config/affiliateConfig";
import ProductReviewsModal from "../../components/ProductReviewsModal";
import AddAffiliateProductModal from "../../components/AddAffiliateProductModal";
import {
  Star,
  Search,
  Plus,
  ArrowLeft,
  Heart,
  MessageSquare,
  ShieldCheck,
  Check,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CURATED MASTER MALE PERFORMANCE & WELLNESS PRODUCTS
// ─────────────────────────────────────────────────────────────
const BASE_MALE_PRODUCTS = [
  // ── TESTOSTERONE & VITALITY ──
  {
    id: 101,
    category: "testosterone",
    name: "Kapiva Himalayan Pure Shilajit Resin with 60% Fulvic Acid (20g Jar)",
    brand: "Kapiva",
    asin: "B091J3147K",
    rating: 4.8,
    reviews: 34000,
    price: "₹999",
    originalPrice: "₹1,499",
    discount: "33% OFF",
    image: "https://m.media-amazon.com/images/I/71y8R1d1zDL._SL1500_.jpg",
    tags: ["Gold Grade", "60% Fulvic Acid", "80+ Minerals", "Lab Tested"],
    description: "Sourced from 18,000 ft Himalayan peaks. Clinically tested to boost natural free testosterone, stamina, and cellular ATP energy.",
    badge: "#1 Best Seller",
    badgeColor: "#f59e0b",
  },
  {
    id: 102,
    category: "testosterone",
    name: "Himalaya Organic KSM-66 Ashwagandha 600mg (60 Veg Capsules)",
    brand: "Himalaya",
    asin: "B00063HCS2",
    rating: 4.8,
    reviews: 21500,
    price: "₹549",
    originalPrice: "₹799",
    discount: "31% OFF",
    image: "https://m.media-amazon.com/images/I/61k1e1d1zEL._SL1000_.jpg",
    tags: ["KSM-66 Extract", "Lowers Cortisol 30%", "Boosts Total T 17%", "Root Only"],
    description: "Full-spectrum root extract with 5% withanolides. Clinically proven to reduce stress cortisol by 30% and optimize serum testosterone levels.",
    badge: "Clinical Tested",
    badgeColor: "#10b981",
  },
  {
    id: 103,
    category: "testosterone",
    name: "Momentous Tongkat Ali 400mg LJ100 Standardized Extract (60 Capsules)",
    brand: "Momentous",
    asin: "B0B8QF54N6",
    rating: 4.8,
    reviews: 8900,
    price: "₹2,699",
    originalPrice: "₹3,499",
    discount: "23% OFF",
    image: "https://m.media-amazon.com/images/I/61m1e1d1zFL._SL1500_.jpg",
    tags: ["LJ100 Extract", "Frees Bound T", "Reduces SHBG", "Andrew Huberman Pick"],
    description: "Patented LJ100 Tongkat Ali. Lowers Sex Hormone-Binding Globulin (SHBG) to unbind free circulating testosterone in active men.",
    badge: "Free T Booster",
    badgeColor: "#8b5cf6",
  },
  {
    id: 104,
    category: "testosterone",
    name: "NOW Foods Boron 10mg Albion Bororganic Glycine (120 Veg Capsules)",
    brand: "NOW Foods",
    asin: "B00093D2BA",
    rating: 4.7,
    reviews: 9400,
    price: "₹899",
    originalPrice: "₹1,299",
    discount: "31% OFF",
    image: "https://m.media-amazon.com/images/I/61q1e1d1zIL._SL1200_.jpg",
    tags: ["SHBG Reduction", "Free Testosterone", "Bone Density", "Joint Health"],
    description: "Clinical studies demonstrate 10mg elemental boron reduces plasma estradiol and raises free testosterone significantly within 7 days.",
    badge: "Fast Acting",
    badgeColor: "#3b82f6",
  },

  // ── MUSCLE & PERFORMANCE ──
  {
    id: 105,
    category: "muscle",
    name: "MuscleBlaze Biozyme Whey Isolate (2kg / 4.4 lbs, Gourmet Chocolate)",
    brand: "MuscleBlaze",
    asin: "B07T48L8H3",
    rating: 4.8,
    reviews: 26000,
    price: "₹5,299",
    originalPrice: "₹6,999",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61kLg2eQZSL._SL1100_.jpg",
    tags: ["27g Pure Isolate", "EAF Formula", "Informed-Choice UK", "Zero Sugar"],
    description: "Informed-Choice certified isolate for elite muscular hypertrophy and zero bloat.",
    badge: "Top Protein",
    badgeColor: "#10b981",
  },
  {
    id: 106,
    category: "muscle",
    name: "Optimum Nutrition Micronized Creatine Monohydrate 250g",
    brand: "Optimum Nutrition",
    asin: "B002DYIZEO",
    rating: 4.8,
    reviews: 32000,
    price: "₹999",
    originalPrice: "₹1,399",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/61m1N4Xp3tL._SL1500_.jpg",
    tags: ["Pure Monohydrate", "Strength & Volume", "3g Per Serving"],
    description: "Supports ATP recycling and maximal muscular contraction during heavy sets.",
    badge: "#1 Strength",
    badgeColor: "#f59e0b",
  },
  {
    id: 107,
    category: "muscle",
    name: "Nutricost Pure L-Citrulline Powder 500g (Nitric Oxide & Pump)",
    brand: "Nutricost",
    asin: "B01MY0E2L1",
    rating: 4.8,
    reviews: 8200,
    price: "₹1,899",
    originalPrice: "₹2,499",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61s1e1d1zKL._SL1200_.jpg",
    tags: ["Pure L-Citrulline", "Nitric Oxide", "Erectile Quality", "Muscle Pump"],
    description: "Boosts blood arginine and nitric oxide production. Delivers skin-splitting pumps in the gym and supports optimal vascular erectile health.",
    badge: "Blood Flow",
    badgeColor: "#f43f5e",
  },

  // ── SEXUAL WELLNESS ──
  {
    id: 108,
    category: "sexual",
    name: "Durex Naturals Pure Water-Based Intimate Moisture Lubricant (100ml)",
    brand: "Durex",
    asin: "B0798CJPGL",
    rating: 4.7,
    reviews: 14600,
    price: "₹425",
    originalPrice: "₹599",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/61t1e1d1zLL._SL1000_.jpg",
    tags: ["100% Natural Ingredients", "pH-Balanced", "Condom Safe", "Non-Sticky"],
    description: "Free from artificial fragrances and parabens. Formulated with prebiotics to support natural microbiome balance.",
    badge: "Body Safe",
    badgeColor: "#06b6d4",
  },
  {
    id: 109,
    category: "sexual",
    name: "Manforce Staylong Delay Gel / Spray for Men (Lidocaine 10% Formula)",
    brand: "Manforce",
    asin: "B01LXU8C6X",
    rating: 4.5,
    reviews: 11200,
    price: "₹399",
    originalPrice: "₹549",
    discount: "27% OFF",
    image: "https://m.media-amazon.com/images/I/61u1e1d1zML._SL1000_.jpg",
    tags: ["Delay Ejaculation", "Fast Acting", "Non-Transferable", "Dermatologist Tested"],
    description: "Clinically formulated desensitizing topical spray. Extends intimate stamina and control without numbing your partner.",
    badge: "Endurance",
    badgeColor: "#f43f5e",
  },
  {
    id: 110,
    category: "sexual",
    name: "Swanson Premium Maca Root 500mg Extract (100 Capsules)",
    brand: "Swanson",
    asin: "B0017OB75U",
    rating: 4.6,
    reviews: 9800,
    price: "₹799",
    originalPrice: "₹1,099",
    discount: "27% OFF",
    image: "https://m.media-amazon.com/images/I/61n1e1d1zGL._SL1000_.jpg",
    tags: ["Peruvian Superfood", "Libido Enhancement", "Sperm Motility", "Non-Hormonal"],
    description: "Peruvian adaptogen used for centuries to elevate sexual desire, semen volume, and psychological vitality without androgenic interference.",
    badge: "Libido Pick",
    badgeColor: "#8b5cf6",
  },

  // ── RECOVERY & SLEEP ──
  {
    id: 111,
    category: "recovery",
    name: "Optimum Nutrition ZMA Zinc Magnesium Vitamin B6 (90 Capsules)",
    brand: "Optimum Nutrition",
    asin: "B000GIQS3S",
    rating: 4.7,
    reviews: 18500,
    price: "₹1,499",
    originalPrice: "₹1,999",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/61p1e1d1zHL._SL1200_.jpg",
    tags: ["30mg Zinc", "450mg Magnesium", "Deep REM Sleep", "Nocturnal T Release"],
    description: "Standardized clinical ZMA blend. Supports nocturnal anabolic hormone secretion and enhances deep non-REM restorative sleep.",
    badge: "Sleep & T",
    badgeColor: "#8b5cf6",
  },
  {
    id: 112,
    category: "recovery",
    name: "Doctor's Best High Absorption CoQ10 with BioPerine 100mg (120 Softgels)",
    brand: "Doctor's Best",
    asin: "B0019GW3G8",
    rating: 4.8,
    reviews: 24000,
    price: "₹1,899",
    originalPrice: "₹2,499",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61r1e1d1zJL._SL1200_.jpg",
    tags: ["BioPerine Enhanced", "Cardiovascular Output", "Mitochondrial Energy", "Sperm Count"],
    description: "Enhances cardiac pumping efficiency and mitochondrial ATP production. Clinically shown to improve male sperm concentration and motility.",
    badge: "Mitochondrial",
    badgeColor: "#10b981",
  },

  // ── GROOMING & GEAR ──
  {
    id: 113,
    category: "grooming",
    name: "Beardo Godfather Beard Growth Oil & Softener Blend (30ml)",
    brand: "Beardo",
    asin: "B01C2M9J70",
    rating: 4.6,
    reviews: 31000,
    price: "₹349",
    originalPrice: "₹450",
    discount: "22% OFF",
    image: "https://m.media-amazon.com/images/I/61v1e1d1zNL._SL1000_.jpg",
    tags: ["Argan & Almond Oil", "Stimulates Follicles", "Zero Greasiness", "No Itch"],
    description: "Non-greasy nourishing beard oil enriched with Vitamin E. Soothes itchy beard stubble and thickens patchy facial hair growth.",
    badge: "Men's Care",
    badgeColor: "#f59e0b",
  },
  {
    id: 114,
    category: "gear",
    name: "RDX Heavy Duty Padded Cotton Weightlifting Wrist Straps (Pair)",
    brand: "RDX",
    asin: "B004X6J2VO",
    rating: 4.8,
    reviews: 14500,
    price: "₹699",
    originalPrice: "₹999",
    discount: "30% OFF",
    image: "https://m.media-amazon.com/images/I/71w1e1d1zOL._SL1500_.jpg",
    tags: ["Neoprene Wrist Padding", "Non-Slip Grip", "Deadlifts & Shrugs", "Steel Bar Fit"],
    description: "Durable reinforced cotton webbing with 5mm neoprene wrist padding. Prevents grip slippage during heavy 200kg+ deadlift sets.",
    badge: "Grip King",
    badgeColor: "#f43f5e",
  },
  {
    id: 115,
    category: "gear",
    name: "SBD Heavy-Duty Neoprene 7mm Knee Sleeves (Competition Level Support)",
    brand: "SBD",
    asin: "B01N0PZ6Z6",
    rating: 4.9,
    reviews: 6200,
    price: "₹6,499",
    originalPrice: "₹8,499",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61x1e1d1zPL._SL1200_.jpg",
    tags: ["7mm High Grade Neoprene", "IPF Approved", "Heavy Squatting", "Patella Warmth"],
    description: "The gold standard knee sleeves for powerlifters and heavy squatters. Delivers immense rebound warmth, patella tracking, and joint stabilization.",
    badge: "IPF Legal",
    badgeColor: "#3b82f6",
  },
];

const MALE_CATEGORIES = [
  { id: "all", label: "All Men's Products", icon: "⚡" },
  { id: "testosterone", label: "Testosterone & Vitality", icon: "🔥" },
  { id: "muscle", label: "Muscle & Strength", icon: "🏋️" },
  { id: "sexual", label: "Sexual Wellness", icon: "❤️" },
  { id: "recovery", label: "Sleep & Recovery", icon: "🌙" },
  { id: "grooming", label: "Grooming & Skin", icon: "🧴" },
  { id: "gear", label: "Heavy Duty Gear", icon: "🛡️" },
];

export default function MaleShop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isAdmin } = useUser();

  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);

  // Modals state
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const q = query(
        collection(db, "affiliate_products"),
        where("shop", "in", ["male", "all"])
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const custom = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setDynamicProducts(custom);
        },
        (err) => console.warn("Male shop dynamic sync warning:", err)
      );
      return () => unsub();
    } catch {}
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allProducts = useMemo(() => {
    return [...dynamicProducts, ...BASE_MALE_PRODUCTS];
  }, [dynamicProducts]);

  const filtered = useMemo(() => {
    return allProducts
      .filter((p) => category === "all" || p.category === category)
      .filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(search.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sort === "reviews") return (b.reviews || 0) - (a.reviews || 0);
        if (sort === "price-low") {
          const pA = Number(String(a.price).replace(/[^0-9]/g, "")) || 0;
          const pB = Number(String(b.price).replace(/[^0-9]/g, "")) || 0;
          return pA - pB;
        }
        if (sort === "price-high") {
          const pA = Number(String(a.price).replace(/[^0-9]/g, "")) || 0;
          const pB = Number(String(b.price).replace(/[^0-9]/g, "")) || 0;
          return pB - pA;
        }
        return (b.reviews || 0) - (a.reviews || 0);
      });
  }, [allProducts, category, search, sort]);

  const css =
    generateCSS(T, dark) +
    `
    .m-shop-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted ? 1 : 0};transition:opacity 0.6s ease;position:relative;overflow-x:hidden;}
    .m-shop-header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark ? "rgba(8,9,13,0.92)" : "rgba(255,255,255,0.92)"};backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);}
    .m-shop-brand{font-family:${FONT.display};font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;}
    .m-shop-switcher{display:flex;align-items:center;gap:6px;background:${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};padding:4px;border-radius:14px;border:1px solid ${T.glassBorder};}
    .m-shop-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;background:transparent;color:${dark ? T.textSub : "#64748b"};font-size:12.5px;font-weight:750;cursor:pointer;transition:all 0.16s ease;}
    .m-shop-pill.active{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#ffffff;box-shadow:0 2px 10px rgba(59,130,246,0.35);}
    .m-shop-main{max-width:1200px;margin:0 auto;padding:24px 24px 80px;}
    .m-shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;}
    .m-shop-card{border-radius:20px;overflow:hidden;background:${T.glass};border:1px solid ${T.glassBorder};display:flex;flex-direction:column;transition:all 0.24s cubic-bezier(0.16,1,0.3,1);position:relative;}
    .m-shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};box-shadow:0 16px 40px rgba(0,0,0,${dark ? "0.45" : "0.08"});}
    .m-shop-img-box{position:relative;width:100%;height:190px;background:${dark ? "rgba(255,255,255,0.02)" : "#ffffff"};display:flex;align-items:center;justify-content:center;overflow:hidden;padding:12px;box-sizing:border-box;}
    .m-shop-img-box img{max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.3s ease;}
    .m-shop-card:hover .m-shop-img-box img{transform:scale(1.05);}
    .m-shop-buy-btn{width:100%;height:42px;border-radius:12px;border:none;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#ffffff;font-size:13px;font-weight:800;font-family:${FONT.display};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 3px 12px rgba(59,130,246,0.3);transition:all 0.16s ease;}
    .m-shop-buy-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    @media(max-width:768px){
      .m-shop-header{padding:0 14px;height:56px;}
      .m-shop-switcher{overflow-x:auto;scrollbar-width:none;}
      .m-shop-grid{grid-template-columns:1fr 1fr;gap:12px;}
      .m-shop-img-box{height:140px;}
    }
    @media(max-width:480px){
      .m-shop-grid{grid-template-columns:1fr;}
    }
  `;

  return (
    <div className="m-shop-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="m-shop-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: `1px solid ${T.glassBorder}`,
              background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
              color: T.text,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>

          <div className="m-shop-brand" onClick={() => navigate("/dashboard")}>
            <span>⚡</span>
            <span>
              Men's<span>Shop</span>
            </span>
          </div>
        </div>

        {/* Unified 3-Shop Switcher */}
        <div className="m-shop-switcher">
          <button
            className="m-shop-pill"
            onClick={() => navigate("/shop")}
            title="Open All Fitness Shop"
          >
            <span>🛒</span>
            <span>All Fitness</span>
          </button>
          <button className="m-shop-pill active">
            <span>⚡</span>
            <span>Men's Shop</span>
          </button>
          <button
            className="m-shop-pill"
            onClick={() => navigate("/female-shop")}
            title="Open Women's Health & PCOS Shop"
          >
            <span>🌸</span>
            <span>Women's Shop</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAdmin && (
            <button
              onClick={() => setShowAddProductModal(true)}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(29,78,216,0.18))",
                border: "1px solid rgba(59,130,246,0.4)",
                color: "#3b82f6",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Admin Only: Add new men's affiliate product"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Men's Item</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${T.glassBorder}`,
              background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              color: T.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="m-shop-main">
        {/* Banner Section */}
        <div
          style={{
            padding: "24px 28px",
            borderRadius: 22,
            background: dark
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.08))"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.05))",
            border: dark ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid #bfdbfe",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: "rgba(59, 130, 246, 0.18)", color: "#3b82f6", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              <ShieldCheck size={13} /> Clinically Backed Male Endocrine & Vitality
            </div>
            <h1 style={{ margin: "4px 0 6px", fontFamily: FONT.display, fontSize: 26, fontWeight: 900, color: T.text }}>
              Men's Performance & Wellness Shop
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: T.textSub, maxWidth: 560, lineHeight: 1.5 }}>
              Evidence-based Himalayan shilajit, KSM-66 ashwagandha, tongkat ali, ZMA, and powerlifting essentials. Real Amazon affiliate links with in-app athlete reviews.
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ padding: "10px 16px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${T.glassBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#3b82f6" }}>
                {allProducts.length}+
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                Curated Products
              </div>
            </div>

            <div style={{ padding: "10px 16px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${T.glassBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#10b981" }}>
                100%
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                Lab Tested
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {MALE_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: active ? "1.5px solid #3b82f6" : `1px solid ${T.glassBorder}`,
                    background: active
                      ? (dark ? "rgba(59, 130, 246, 0.18)" : "rgba(59, 130, 246, 0.1)")
                      : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: active ? "#3b82f6" : T.textSub,
                    fontSize: 12.5,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    transition: "all 0.16s ease",
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: 12, color: T.textMuted, pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search shilajit, tongkat ali..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: 38,
                  padding: "0 14px 0 34px",
                  borderRadius: 11,
                  border: `1px solid ${T.glassBorder}`,
                  background: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
                  color: T.text,
                  fontSize: 12.5,
                  outline: "none",
                  width: 190,
                }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: 11,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
                color: T.text,
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", borderRadius: 20, background: T.glass, border: `1px solid ${T.glassBorder}` }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>No products found</div>
            <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 4 }}>
              Try adjusting your search or category filter.
            </div>
          </div>
        ) : (
          <div className="m-shop-grid">
            {filtered.map((p) => {
              const affiliateUrl = buildAmazonAffiliateUrl(p.asin || p.href || p.name);
              const isWished = wishlist.includes(p.id);

              return (
                <div key={p.id} className="m-shop-card">
                  {/* Image Container with Badges */}
                  <div className="m-shop-img-box">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80";
                      }}
                    />

                    {p.badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          padding: "3px 9px",
                          borderRadius: 99,
                          background: p.badgeColor || "#3b82f6",
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        }}
                      >
                        {p.badge}
                      </div>
                    )}

                    {p.discount && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 44,
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: "rgba(239, 68, 68, 0.9)",
                          color: "#ffffff",
                          fontSize: 9.5,
                          fontWeight: 800,
                        }}
                      >
                        {p.discount}
                      </div>
                    )}

                    <button
                      onClick={() => toggleWishlist(p.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "none",
                        background: dark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                    >
                      {isWished ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {p.brand}
                    </div>

                    <div
                      style={{
                        fontFamily: FONT.display,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: T.text,
                        margin: "3px 0 6px",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 36,
                      }}
                    >
                      {p.name}
                    </div>

                    <div
                      style={{
                        fontSize: 11.5,
                        color: T.textSub,
                        lineHeight: 1.4,
                        marginBottom: 10,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.description || p.desc}
                    </div>

                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                        {p.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 6,
                              background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                              color: dark ? "#94a3b8" : "#64748b",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* In-App Review Row */}
                    <div
                      onClick={() => setSelectedReviewProduct(p)}
                      title="Read community reviews and post yours"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                        cursor: "pointer",
                        padding: "5px 8px",
                        borderRadius: 8,
                        background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                        border: `1px solid ${T.glassBorder}`,
                      }}
                    >
                      <div style={{ color: "#f59e0b", fontSize: 12, display: "flex", gap: 1 }}>
                        {"★".repeat(Math.round(Number(p.rating) || 5))}
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text }}>
                        {p.rating}
                      </span>
                      <span style={{ fontSize: 10.5, color: T.textMuted }}>
                        ({p.reviews?.toLocaleString?.() || p.reviews})
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#3b82f6",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <MessageSquare size={11} />
                        <span>Reviews</span>
                      </span>
                    </div>

                    {/* Pricing */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14, marginTop: "auto" }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: "#10b981", fontFamily: FONT.display }}>
                        {p.price}
                      </span>
                      {p.originalPrice && (
                        <span style={{ fontSize: 12, color: T.textMuted, textDecoration: "line-through" }}>
                          {p.originalPrice}
                        </span>
                      )}
                      <span style={{ marginLeft: "auto", fontSize: 10, color: dark ? "#94a3b8" : "#64748b", fontWeight: 700 }}>
                        Amazon Prime
                      </span>
                    </div>

                    {/* Amazon Buy Button */}
                    <a
                      href={affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <button className="m-shop-buy-btn">
                        <span>📦 Buy on Amazon</span>
                        <span>↗</span>
                      </button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Affiliate Transparency Footer */}
        <div
          style={{
            marginTop: 48,
            padding: "16px 22px",
            borderRadius: 16,
            background: dark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            border: `1px solid ${T.glassBorder}`,
            fontSize: 11.5,
            color: T.textMuted,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          <strong style={{ color: T.textSub }}>Amazon Associate Disclosure:</strong> AshFitVerse is a participant in the Amazon Services LLC Associates Program. When you purchase through our links, we may earn an affiliate commission at no extra cost to you. All product recommendations are independently vetted and selected for quality and athletic performance.
        </div>
      </main>

      {/* ── Modals ── */}
      <ProductReviewsModal
        isOpen={Boolean(selectedReviewProduct)}
        onClose={() => setSelectedReviewProduct(null)}
        product={selectedReviewProduct}
        user={user}
        dark={dark}
        T={T}
      />

      <AddAffiliateProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        defaultShop="male"
        onProductAdded={(newP) => {
          setDynamicProducts((prev) => [newP, ...prev]);
        }}
        dark={dark}
        T={T}
      />
    </div>
  );
}