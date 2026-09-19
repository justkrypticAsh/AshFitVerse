// src/features/shop/Shop.jsx — Common Fitness & Wellness Amazon Affiliate Shop
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { buildAmazonAffiliateUrl, getAffiliateTag } from "../../config/affiliateConfig";
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
  ShoppingBag,
  ExternalLink,
  Flame,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CURATED MASTER AFFILIATE PRODUCTS (COMMON FITNESS & NUTRITION)
// ─────────────────────────────────────────────────────────────
const BASE_PRODUCTS = [
  // ── WHEY & PROTEIN ──
  {
    id: 1,
    category: "protein",
    name: "Optimum Nutrition (ON) Gold Standard 100% Whey Protein (2 lbs / 907g)",
    brand: "Optimum Nutrition",
    asin: "B000QSNY54",
    rating: 4.8,
    reviews: 28400,
    price: "₹3,499",
    originalPrice: "₹4,499",
    discount: "22% OFF",
    image: "https://m.media-amazon.com/images/I/716uVVqU+TL._SL1500_.jpg",
    tags: ["Whey Blend", "24g Protein", "5.5g BCAAs", "Gluten Free"],
    description: "The world's #1 selling whey protein. 24g pure whey isolate & concentrate blend with 5.5g natural BCAAs per scoop.",
    badge: "#1 Best Seller",
    badgeColor: "#f59e0b",
  },
  {
    id: 2,
    category: "protein",
    name: "MuscleBlaze Biozyme Performance Whey (2kg / 4.4 lbs, Rich Chocolate)",
    brand: "MuscleBlaze",
    asin: "B07T48L8H3",
    rating: 4.7,
    reviews: 19800,
    price: "₹4,799",
    originalPrice: "₹6,299",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61kLg2eQZSL._SL1100_.jpg",
    tags: ["Enhanced Absorption Formula", "25g Protein", "Clinically Tested"],
    description: "Formulated for Indian bodies with Enhanced Absorption Formula (EAF). 50% higher protein absorption and zero stomach discomfort.",
    badge: "Clinical Tested",
    badgeColor: "#10b981",
  },
  {
    id: 3,
    category: "protein",
    name: "Dymatize ISO100 Hydrolyzed 100% Whey Isolate (5 lbs / 2.3kg, Gourmet Chocolate)",
    brand: "Dymatize",
    asin: "B002DYJZXE",
    rating: 4.9,
    reviews: 14200,
    price: "₹8,499",
    originalPrice: "₹10,999",
    discount: "23% OFF",
    image: "https://m.media-amazon.com/images/I/71d1V-w2wzL._SL1500_.jpg",
    tags: ["Hydrolyzed Isolate", "25g Protein", "<1g Sugar", "Ultra Fast Digest"],
    description: "Hydrolyzed whey isolate for instant post-workout amino uptake. Perfect for lean competition prep and rapid muscular recovery.",
    badge: "Elite Choice",
    badgeColor: "#8b5cf6",
  },
  {
    id: 4,
    category: "protein",
    name: "The Whole Truth 100% Raw Whey Isolate Unflavoured (1kg)",
    brand: "The Whole Truth",
    asin: "B09WDPCS8J",
    rating: 4.6,
    reviews: 6400,
    price: "₹2,699",
    originalPrice: "₹3,299",
    discount: "18% OFF",
    image: "https://m.media-amazon.com/images/I/61b7U2QjVLL._SL1500_.jpg",
    tags: ["Zero Artificial Flavours", "Cold Filtered", "27g Protein", "Clean Label"],
    description: "Only one single ingredient: 100% cold-microfiltered whey isolate from grass-fed cows. Zero gums, zero artificial sweeteners.",
    badge: "100% Clean",
    badgeColor: "#06b6d4",
  },

  // ── CREATINE & STRENGTH ──
  {
    id: 5,
    category: "creatine",
    name: "Optimum Nutrition Micronized Creatine Monohydrate Powder (250g)",
    brand: "Optimum Nutrition",
    asin: "B002DYIZEO",
    rating: 4.8,
    reviews: 32000,
    price: "₹999",
    originalPrice: "₹1,399",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/61m1N4Xp3tL._SL1500_.jpg",
    tags: ["100% Pure Creatine", "3g Per Scoop", "ATP Regeneration", "Unflavoured"],
    description: "Micronized for superior water solubility. Clinically shown to dramatically increase heavy compound strength, sprint power, and muscle volume.",
    badge: "#1 Creatine",
    badgeColor: "#f59e0b",
  },
  {
    id: 6,
    category: "creatine",
    name: "MuscleBlaze Creatine Monohydrate with Creapure Germany (250g)",
    brand: "MuscleBlaze",
    asin: "B07T48L8H4",
    rating: 4.9,
    reviews: 9100,
    price: "₹1,499",
    originalPrice: "₹1,999",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/61q5d9vX6+L._SL1500_.jpg",
    tags: ["Creapure Germany", "99.99% Purity", "Heavy Metals Tested"],
    description: "Manufactured using world-renowned Creapure from Alzchem Germany. Guaranteed 99.99% pure without creatinine impurities.",
    badge: "Creapure Gold",
    badgeColor: "#3b82f6",
  },

  // ── PRE-WORKOUT & ENERGY ──
  {
    id: 7,
    category: "preworkout",
    name: "Cellucor C4 Original Pre-Workout Explosive Energy (30 Servings)",
    brand: "Cellucor",
    asin: "B00U46447S",
    rating: 4.7,
    reviews: 21500,
    price: "₹2,299",
    originalPrice: "₹3,199",
    discount: "28% OFF",
    image: "https://m.media-amazon.com/images/I/71oO46j2zUL._SL1500_.jpg",
    tags: ["150mg Caffeine", "1.6g CarnoSyn Beta-Alanine", "1g Arginine AKG"],
    description: "Explosive energy and laser focus. Formulated with TeaCrine, Beta-Alanine and Arginine for high volume lifting sessions.",
    badge: "Fan Favorite",
    badgeColor: "#f43f5e",
  },
  {
    id: 8,
    category: "preworkout",
    name: "Fast&Up Reload Electrolyte Hydration Tablets (Pack of 3 Tubes, 60 Tabs)",
    brand: "Fast&Up",
    asin: "B07V2Q21PL",
    rating: 4.6,
    reviews: 18700,
    price: "₹799",
    originalPrice: "₹1,050",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/71H2l6Y1pGL._SL1500_.jpg",
    tags: ["5 Essential Electrolytes", "Instant Energy", "Effervescent", "No Cramps"],
    description: "Informed-Choice certified effervescent hydration tablets. Replenishes sodium, potassium, magnesium, and calcium lost in sweat.",
    badge: "Hydration Pro",
    badgeColor: "#06b6d4",
  },

  // ── VITAMINS & WELLNESS ──
  {
    id: 9,
    category: "vitamins",
    name: "Doctor's Best High Absorption Magnesium Glycinate 400mg (240 Tablets)",
    brand: "Doctor's Best",
    asin: "B000BD0RT0",
    rating: 4.8,
    reviews: 36000,
    price: "₹2,199",
    originalPrice: "₹2,899",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61gR2z-L1VL._SL1500_.jpg",
    tags: ["100% Cheated TRAACS", "Deep Sleep", "Muscle Relaxation", "No Laxative Effect"],
    description: "Fully chelated TRAACS magnesium glycinate. Restores muscular recovery, prevents night cramps, and supports deep REM sleep.",
    badge: "Sleep Essential",
    badgeColor: "#8b5cf6",
  },
  {
    id: 10,
    category: "vitamins",
    name: "NOW Foods Ultra Omega-3 Deep Sea Fish Oil 500 EPA / 250 DHA (180 Softgels)",
    brand: "NOW Foods",
    asin: "B000SE5SY6",
    rating: 4.8,
    reviews: 24500,
    price: "₹2,499",
    originalPrice: "₹3,299",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/71E+qF6Uu2L._SL1500_.jpg",
    tags: ["Molecularly Distilled", "750mg Active EPA/DHA", "Joint Health", "Enteric Coated"],
    description: "Molecularly distilled fish oil free from mercury and heavy metals. Reduces systemic inflammation, protects cartilage, and optimizes cardiac output.",
    badge: "Heart & Joints",
    badgeColor: "#10b981",
  },
  {
    id: 11,
    category: "vitamins",
    name: "HealthKart HK Vitals Multivitamin with Zinc, Vitamin C, D3 & Ginseng (60 Tablets)",
    brand: "HealthKart",
    asin: "B08R7NDW5T",
    rating: 4.5,
    reviews: 42000,
    price: "₹499",
    originalPrice: "₹749",
    discount: "33% OFF",
    image: "https://m.media-amazon.com/images/I/61F+w8R19zL._SL1000_.jpg",
    tags: ["100% RDA Minerals", "Korean Ginseng", "Immunity", "Energy"],
    description: "Complete daily multivitamin with Ginseng extract and 9 essential amino acids to fight workout fatigue and bolster immune health.",
    badge: "Daily Vital",
    badgeColor: "#3b82f6",
  },
  {
    id: 12,
    category: "vitamins",
    name: "Pintola All-Natural Organic Peanut Butter Crunchy 1kg (100% Roasted Peanuts)",
    brand: "Pintola",
    asin: "B07H83LBNP",
    rating: 4.7,
    reviews: 38000,
    price: "₹449",
    originalPrice: "₹599",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/71jY3S7R2TL._SL1500_.jpg",
    tags: ["30g Protein / 100g", "Zero Added Sugar", "Zero Hydrogenated Oil", "Non-GMO"],
    description: "100% pure roasted peanuts. Zero palm oil, zero sugar, zero emulsifiers. Healthy caloric density for lean bulking and muscle repair.",
    badge: "Top Snack",
    badgeColor: "#f59e0b",
  },

  // ── GYM GEAR & ACCESSORIES ──
  {
    id: 13,
    category: "gear",
    name: "Harbinger 4-Inch Padded Leather Weightlifting Belt (Heavy Duty Lumbar Support)",
    brand: "Harbinger",
    asin: "B00074H6MI",
    rating: 4.8,
    reviews: 12500,
    price: "₹2,799",
    originalPrice: "₹3,699",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/81R6S0Y1p1L._SL1500_.jpg",
    tags: ["Genuine Split Leather", "Contoured Fit", "Steel Roller Buckle", "Heavy Squats"],
    description: "Full-grain leather with interior foam padding. Stabilizes intra-abdominal pressure during heavy deadlifts, squats, and overhead presses.",
    badge: "Powerlifter Pick",
    badgeColor: "#f59e0b",
  },
  {
    id: 14,
    category: "gear",
    name: "Versa Gripps Pro Weightlifting Straps & Hooks (Official Patented Grip Assist)",
    brand: "Versa Gripps",
    asin: "B007R6X49M",
    rating: 4.9,
    reviews: 8400,
    price: "₹4,999",
    originalPrice: "₹6,499",
    discount: "23% OFF",
    image: "https://m.media-amazon.com/images/I/71j6+y8zYIL._SL1500_.jpg",
    tags: ["Eliminates Grip Fatigue", "Pull Day King", "Quick Release", "Made in USA"],
    description: "Replaces lifting straps and hooks entirely. Locks onto barbells and dumbbells instantaneously, isolating the lats and upper back.",
    badge: "Pro Choice",
    badgeColor: "#8b5cf6",
  },
  {
    id: 15,
    category: "gear",
    name: "Boldfit Heavy Duty Resistance Loop Bands for Workout & Warmup (Set of 5)",
    brand: "Boldfit",
    asin: "B0892B19F6",
    rating: 4.6,
    reviews: 26000,
    price: "₹499",
    originalPrice: "₹999",
    discount: "50% OFF",
    image: "https://m.media-amazon.com/images/I/71wL1eL1eTL._SL1500_.jpg",
    tags: ["100% Natural Latex", "5 Resistance Tiers", "Portability Pouch"],
    description: "Essential for rotator cuff activation, glute bridges, pull-up assistance, and dynamic mobility before heavy compound sessions.",
    badge: "Warm-Up Essential",
    badgeColor: "#10b981",
  },
  {
    id: 16,
    category: "gear",
    name: "Strauss High Density Deep Tissue Foam Roller with Grid Matrix (33cm)",
    brand: "Strauss",
    asin: "B01NAO9IJE",
    rating: 4.6,
    reviews: 14800,
    price: "₹699",
    originalPrice: "₹1,299",
    discount: "46% OFF",
    image: "https://m.media-amazon.com/images/I/71Q3Z1d1zPL._SL1500_.jpg",
    tags: ["Myofascial Release", "Trigger Point Relief", "EVA Foam", "Durable Core"],
    description: "3D multi-density zones mimic sports therapist fingertips. Breaks down tight muscular adhesions and accelerates lactic acid clearance.",
    badge: "Recovery Essential",
    badgeColor: "#06b6d4",
  },
  {
    id: 17,
    category: "gear",
    name: "HealthSense Ultra-Accurate Bluetooth Smart Body Fat Scale (13 Fitness Metrics)",
    brand: "HealthSense",
    asin: "B07P7H5J4N",
    rating: 4.7,
    reviews: 31000,
    price: "₹1,799",
    originalPrice: "₹2,999",
    discount: "40% OFF",
    image: "https://m.media-amazon.com/images/I/61S1k1d1eAL._SL1200_.jpg",
    tags: ["BIA Technology", "Body Fat %", "Muscle Mass", "Bluetooth Sync"],
    description: "Bioelectrical Impedance Analysis measures visceral fat, skeletal muscle mass, BMR, and hydration percentage. Syncs seamlessly with fitness apps.",
    badge: "High Tech",
    badgeColor: "#3b82f6",
  },
  {
    id: 18,
    category: "gear",
    name: "BlenderBottle Pro Series 820ml Shaker Bottle with Wire Whisk Ball",
    brand: "BlenderBottle",
    asin: "B01LZE4K6U",
    rating: 4.8,
    reviews: 44000,
    price: "₹899",
    originalPrice: "₹1,299",
    discount: "31% OFF",
    image: "https://m.media-amazon.com/images/I/71K1e1d1zBL._SL1500_.jpg",
    tags: ["Eastman Tritan Plastic", "Odor Resistant", "Leak Proof Lid", "BPA Free"],
    description: "Durable Eastman Tritan plastic resists protein odour retention. 316 surgical-grade stainless steel BlenderBall mixes thickest mass gainers silky smooth.",
    badge: "#1 Shaker",
    badgeColor: "#f59e0b",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Products", icon: "🛒" },
  { id: "protein", label: "Protein & Whey", icon: "🥤" },
  { id: "creatine", label: "Creatine & Strength", icon: "⚡" },
  { id: "preworkout", label: "Pre-Workout & Energy", icon: "🔥" },
  { id: "vitamins", label: "Vitamins & Recovery", icon: "💊" },
  { id: "gear", label: "Gym Gear & Equipment", icon: "🏋️" },
];

export default function Shop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user } = useUser();

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

    // Real-time Firestore dynamic affiliate products sync
    try {
      const q = query(
        collection(db, "affiliate_products"),
        where("shop", "in", ["common", "all"])
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const custom = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setDynamicProducts(custom);
        },
        (err) => console.warn("Shop dynamic products sync warning:", err)
      );
      return () => unsub();
    } catch {}
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Combine curated base products with newly added dynamic affiliate products
  const allProducts = useMemo(() => {
    return [...dynamicProducts, ...BASE_PRODUCTS];
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
        return (b.reviews || 0) - (a.reviews || 0); // default: popularity
      });
  }, [allProducts, category, search, sort]);

  const css =
    generateCSS(T, dark) +
    `
    .shop-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted ? 1 : 0};transition:opacity 0.6s ease;position:relative;overflow-x:hidden;}
    .shop-header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark ? "rgba(8,9,13,0.92)" : "rgba(255,255,255,0.92)"};backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);}
    .shop-brand{font-family:${FONT.display};font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;}
    .shop-switcher-bar{display:flex;align-items:center;gap:6px;background:${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};padding:4px;border-radius:14px;border:1px solid ${T.glassBorder};}
    .shop-switch-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;background:transparent;color:${dark ? T.textSub : "#64748b"};font-size:12.5px;font-weight:750;cursor:pointer;transition:all 0.16s ease;}
    .shop-switch-pill.active{background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;box-shadow:0 2px 10px rgba(245,158,11,0.35);}
    .shop-main{max-width:1200px;margin:0 auto;padding:24px 24px 80px;}
    .shop-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;}
    .shop-card{border-radius:20px;overflow:hidden;background:${T.glass};border:1px solid ${T.glassBorder};display:flex;flex-direction:column;transition:all 0.24s cubic-bezier(0.16,1,0.3,1);position:relative;}
    .shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};box-shadow:0 16px 40px rgba(0,0,0,${dark ? "0.45" : "0.08"});}
    .shop-img-box{position:relative;width:100%;height:190px;background:${dark ? "rgba(255,255,255,0.02)" : "#ffffff"};display:flex;align-items:center;justify-content:center;overflow:hidden;padding:12px;box-sizing:border-box;}
    .shop-img-box img{max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.3s ease;}
    .shop-card:hover .shop-img-box img{transform:scale(1.05);}
    .shop-buy-btn{width:100%;height:42px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;font-size:13px;font-weight:800;font-family:${FONT.display};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 3px 12px rgba(245,158,11,0.3);transition:all 0.16s ease;}
    .shop-buy-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    @media(max-width:768px){
      .shop-header{padding:0 14px;height:56px;}
      .shop-switcher-bar{overflow-x:auto;scrollbar-width:none;}
      .shop-card-grid{grid-template-columns:1fr 1fr;gap:12px;}
      .shop-img-box{height:140px;}
    }
    @media(max-width:480px){
      .shop-card-grid{grid-template-columns:1fr;}
    }
  `;

  return (
    <div className="shop-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="shop-header">
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

          <div className="shop-brand" onClick={() => navigate("/dashboard")}>
            <span>🛍️</span>
            <span>
              FitVerse<span>Shop</span>
            </span>
          </div>
        </div>

        {/* Unified 3-Shop Switcher */}
        <div className="shop-switcher-bar">
          <button className="shop-switch-pill active">
            <span>🛒</span>
            <span>All Fitness</span>
          </button>
          <button
            className="shop-switch-pill"
            onClick={() => navigate("/male-shop")}
            title="Open Men's Performance & Testosterone Shop"
          >
            <span>⚡</span>
            <span>Men's Shop</span>
          </button>
          <button
            className="shop-switch-pill"
            onClick={() => navigate("/female-shop")}
            title="Open Women's Health & PCOS Shop"
          >
            <span>🌸</span>
            <span>Women's Shop</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowAddProductModal(true)}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(234,88,12,0.18))",
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#f59e0b",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Affiliate Item</span>
          </button>

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
      <main className="shop-main">
        {/* Banner Section */}
        <div
          style={{
            padding: "24px 28px",
            borderRadius: 22,
            background: dark
              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.08))"
              : "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(59, 130, 246, 0.05))",
            border: dark ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid #fed7aa",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: "rgba(245, 158, 11, 0.18)", color: "#f59e0b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              <ShieldCheck size={13} /> Vetted & Lab-Certified Fitness Essentials
            </div>
            <h1 style={{ margin: "4px 0 6px", fontFamily: FONT.display, fontSize: 26, fontWeight: 900, color: T.text }}>
              Common Fitness & Performance Shop
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: T.textSub, maxWidth: 560, lineHeight: 1.5 }}>
              Handpicked, authentic whey isolates, German creapure, heavy duty lifting gear, and vitamins. Direct Amazon Prime delivery with verified athlete in-app reviews.
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ padding: "10px 16px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${T.glassBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b" }}>
                {allProducts.length}+
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                Verified Products
              </div>
            </div>

            <div style={{ padding: "10px 16px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${T.glassBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#10b981" }}>
                100%
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                Prime Authentic
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: active ? "1.5px solid #f59e0b" : `1px solid ${T.glassBorder}`,
                    background: active
                      ? (dark ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.1)")
                      : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: active ? "#f59e0b" : T.textSub,
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
                placeholder="Search protein, creatine..."
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
          <div className="shop-card-grid">
            {filtered.map((p) => {
              const affiliateUrl = buildAmazonAffiliateUrl(p.asin || p.href || p.name);
              const isWished = wishlist.includes(p.id);

              return (
                <div key={p.id} className="shop-card">
                  {/* Image Container with Badges */}
                  <div className="shop-img-box">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80";
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
                          background: p.badgeColor || "#f59e0b",
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
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                      {p.description}
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

                    {/* In-App Review Row (Clickable to open Reviews Modal) */}
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
                      <button className="shop-buy-btn">
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
        defaultShop="common"
        onProductAdded={(newP) => {
          setDynamicProducts((prev) => [newP, ...prev]);
        }}
        dark={dark}
        T={T}
      />
    </div>
  );
}