// src/features/shop/Shop.jsx — AshFitVerse Pro Store: Elite Sports & Nutrition
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { buildAmazonAffiliateUrl, getAffiliateTag } from "../../config/affiliateConfig";
import AddAffiliateProductModal from "../../components/AddAffiliateProductModal";
import { COMMON_PRODUCTS, MALE_PRODUCTS, FEMALE_PRODUCTS, logUserOrder } from "./productCatalog";
import {
  Star,
  Search,
  Plus,
  ArrowLeft,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Flame,
  Zap,
  Clock,
  Send,
  Award,
  Layers,
  Percent,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpRight,
  PackageCheck,
  Truck,
  Coins,
  Share2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PRO ATHLETE HERO SLIDES (ASHFITVERSE SIGNATURE SERIES)
// ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "1",
    tagline: "COACH ASHISH'S VERIFIED PERFORMANCE",
    title: "ELITE SPORTS NUTRITION & GEAR",
    subtitle: "Up to 55% OFF on 100% Authentic Whey, Creatine & Power Gear",
    description: "Every batch verified for zero banned substances. Delivered directly with Amazon Prime speed & authenticity.",
    bgGradient: "linear-gradient(135deg, #070b14 0%, #172554 50%, #1e1b4b 100%)",
    accent: "#f59e0b",
    badge: "🔥 ASHFITVERSE VERIFIED",
    targetCategory: "protein",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "1") || COMMON_PRODUCTS[0],
  },
  {
    id: "4",
    tagline: "CLINICAL ATP & STRENGTH PROTOCOL",
    title: "EXPLOSIVE STRENGTH & POWER DAYS",
    subtitle: "German Creapure Creatine & High-Stim Nitric Pre-Workouts",
    description: "Saturate intramuscular phosphocreatine reserves and shatter squat, bench & deadlift PR plateaus.",
    bgGradient: "linear-gradient(135deg, #090e1a 0%, #2e1065 50%, #431407 100%)",
    accent: "#38bdf8",
    badge: "⚡ PEAK ATP POWER",
    targetCategory: "creatine",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "4") || COMMON_PRODUCTS[3],
  },
  {
    id: "10",
    tagline: "COMPETITION LIFTING ARSENAL",
    title: "HEAVY DUTY POWERLIFTING GEAR",
    subtitle: "10mm Leather Lever Belts, Wrist Wraps & Shakers",
    description: "Rigid intra-abdominal spinal stabilization and joint protection trusted by elite strength athletes.",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
    accent: "#10b981",
    badge: "🏆 POWERLIFTING GEAR",
    targetCategory: "gear",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "10") || COMMON_PRODUCTS[9],
  },
  {
    id: "24",
    tagline: "LONGEVITY, HORMONES & RECOVERY",
    title: "VITALITY & RESTORATIVE RECOVERY",
    subtitle: "Triple Strength Omega-3, KSM-66 Ashwagandha & Vitamins",
    description: "Fortify cardiovascular endurance, lubricate articular cartilage, and promote deep restorative REM sleep.",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #1e293b 100%)",
    accent: "#fb923c",
    badge: "🌿 RECOVERY & LONGEVITY",
    targetCategory: "vitamins",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "24") || COMMON_PRODUCTS[4],
  },
];

// Coach Ashish's Curated Athlete Stacks
const COACH_STACKS = [
  {
    id: "stack-hypertrophy",
    title: "The Ultimate Hypertrophy Mass Monster Stack",
    tagline: "24g Whey Isolate + 3g German Creapure + BlenderBottle Pro",
    goal: "hypertrophy",
    synergyScore: "99.8% Synergy",
    bundlePrice: "₹5,247",
    regularPrice: "₹6,098",
    discountBadge: "SAVE ₹851 BUNDLE DEAL",
    items: [
      { id: "1", name: "ON Gold Standard Whey 2 lbs", img: "/products/1.jpg" },
      { id: "4", name: "German Creapure Creatine 250g", img: "/products/4.jpg" },
      { id: "18", name: "BlenderBottle Pro Series 820ml", img: "/products/18.jpg" },
    ],
  },
  {
    id: "stack-pr-hunter",
    title: "Explosive PR Hunter & Nitric Pump Stack",
    tagline: "MuscleBlaze Pre-Workout 200 + USI Lever Belt + Boldfit Wraps",
    goal: "strength",
    synergyScore: "98.9% Synergy",
    bundlePrice: "₹4,847",
    regularPrice: "₹5,598",
    discountBadge: "SAVE ₹751 BUNDLE DEAL",
    items: [
      { id: "7", name: "MuscleBlaze Pre-Workout 200", img: "/products/7.jpg" },
      { id: "10", name: "USI 10mm Leather Lever Belt", img: "/products/10.jpg" },
      { id: "25", name: "Boldfit Heavy Wrist Wraps", img: "/products/25.jpg" },
    ],
  },
  {
    id: "stack-longevity",
    title: "Daily Longevity & Joint Armor Stack",
    tagline: "TrueBasics Triple Omega-3 + Fast&Up Vit C + HK Multivitamin",
    goal: "longevity",
    synergyScore: "99.2% Synergy",
    bundlePrice: "₹1,899",
    regularPrice: "₹2,499",
    discountBadge: "SAVE ₹600 BUNDLE DEAL",
    items: [
      { id: "24", name: "TrueBasics Triple Omega-3", img: "/products/24.jpg" },
      { id: "23", name: "Fast&Up Charge Vitamin C 1000mg", img: "/products/23.jpg" },
      { id: "11", name: "HK Vitals Multivitamin + Zinc", img: "/products/11.jpg" },
    ],
  },
];

const SEARCH_CATEGORIES = [
  { id: "all", label: "All Gear & Nutrition" },
  { id: "protein", label: "Whey & Protein" },
  { id: "creatine", label: "Creatine & Strength" },
  { id: "preworkout", label: "Pre-Workout" },
  { id: "vitamins", label: "Vitamins & Longevity" },
  { id: "gear", label: "Gym Gear & Belts" },
];

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isAdmin } = useUser();
  const affiliateTag = getAffiliateTag() || "ashfitverse-21";

  // Check query params for department
  const queryParams = new URLSearchParams(location.search);
  const deptParam = queryParams.get("dept"); // "male" | "female" | null

  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all"); // all | hypertrophy | fatloss | strength | longevity
  const [searchCategory, setSearchCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [addedToast, setAddedToast] = useState("");

  // Live countdown timer for Lightning Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 24 });

  const dealsScrollRef = useRef(null);
  const heroTimerRef = useRef(null);

  // Sync products depending on department
  const baseProducts = useMemo(() => {
    if (deptParam === "male") return MALE_PRODUCTS;
    if (deptParam === "female") return FEMALE_PRODUCTS;
    return COMMON_PRODUCTS;
  }, [deptParam]);

  // Handle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero auto-scroll
  useEffect(() => {
    if (isHoveringHero) return;
    heroTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(heroTimerRef.current);
  }, [isHoveringHero]);

  useEffect(() => {
    setMounted(true);
    try {
      const q = query(collection(db, "affiliate_products"), where("shop", "in", ["common", "all"]));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            rating: d.data().rating || 4.8,
            reviews: d.data().reviews || 100,
          }));
          setDynamicProducts(list);
        },
        (err) => console.warn("Dynamic products sync:", err)
      );
      return () => unsub();
    } catch {}
  }, []);

  const allProducts = useMemo(() => {
    return [...dynamicProducts, ...baseProducts];
  }, [dynamicProducts, baseProducts]);

  const filtered = useMemo(() => {
    return allProducts
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => {
        if (goalFilter === "all") return true;
        if (goalFilter === "hypertrophy") return p.category === "protein" || p.category === "creatine";
        if (goalFilter === "strength") return p.category === "creatine" || p.category === "gear" || p.category === "preworkout";
        if (goalFilter === "fatloss") return p.category === "preworkout" || p.category === "protein";
        if (goalFilter === "longevity") return p.category === "vitamins";
        return true;
      })
      .filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(search.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
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
        return 0;
      });
  }, [allProducts, category, goalFilter, search, sort]);

  // Lightning Deals subset
  const lightningDeals = useMemo(() => {
    return allProducts.slice(0, 10).map((p, idx) => ({
      ...p,
      claimedPercent: 62 + ((idx * 7) % 32),
    }));
  }, [allProducts]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setCartCount((prev) => prev + 1);
    setAddedToast(`Added "${product.name.slice(0, 24)}..." to FitBag!`);
    setTimeout(() => setAddedToast(""), 3500);
  };

  // Navigates directly to Chat with multi-contact sharing state
  const handleShareProductToChat = (e, product) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/shop/product/${product.id}?tag=${affiliateTag}`;
    const prefill = `🔥 Check out this fitness essential on AshFitVerse Store!\n\n📦 ${product.name}\n💰 Price: ${product.price} (M.R.P: ${product.originalPrice})\n⭐ Verified Athlete Rating: 4.8★\n🔗 Direct Link: ${productUrl}`;
    navigate("/chat", {
      state: {
        shareProduct: product,
        prefillMessage: prefill,
      },
    });
  };

  const css =
    generateCSS(T, dark) +
    `
    /* ── ASHFITVERSE STORE CYBER-ATHLETIC DESIGN SYSTEM ── */
    .fitverse-shop-root {
      background: ${dark ? "#070b14" : "#f8fafc"};
      color: ${T.text};
      min-height: 100vh;
      font-family: ${FONT.body};
      padding-bottom: 80px;
    }

    /* ── Top Navigation Bar ── */
    .pro-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: ${dark ? "rgba(8, 12, 22, 0.92)" : "rgba(255, 255, 255, 0.94)"};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"};
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, ${dark ? "0.4" : "0.04"});
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .brand-icon-pod {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
    }
    .brand-title {
      font-family: ${FONT.display};
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: ${dark ? "#ffffff" : "#0f172a"};
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-pill {
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.5px;
      background: ${dark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7"};
      color: #f59e0b;
      padding: 3px 8px;
      border-radius: 99px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* ── Store Switcher Tabs in Subnav ── */
    .store-tabs-ribbon {
      background: ${dark ? "#0b101d" : "#ffffff"};
      border-bottom: 1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0"};
      padding: 8px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow-x: auto;
      scrollbar-width: none;
      gap: 12px;
    }
    .store-tabs-ribbon::-webkit-scrollbar { display: none; }

    .dept-tabs-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dept-tab-btn {
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 12.5px;
      font-weight: 750;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.18s ease;
      border: 1px solid transparent;
      background: transparent;
      color: ${dark ? "#94a3b8" : "#64748b"};
      text-decoration: none;
    }
    .dept-tab-btn:hover {
      color: ${dark ? "#ffffff" : "#0f172a"};
      background: ${dark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"};
    }
    .dept-tab-btn.active {
      background: ${dark ? "rgba(245, 158, 11, 0.14)" : "#fef3c7"};
      border-color: rgba(245, 158, 11, 0.4);
      color: #f59e0b;
      font-weight: 850;
    }

    /* ── Futuristic Search Box ── */
    .pro-search-box {
      flex: 1;
      max-width: 640px;
      height: 44px;
      display: flex;
      align-items: center;
      background: ${dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"};
      border-radius: 12px;
      padding: 0 4px 0 14px;
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .pro-search-box:focus-within {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
    }
    .pro-search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      color: ${dark ? "#ffffff" : "#0f172a"};
      font-size: 13.5px;
      font-weight: 500;
    }
    .pro-search-input::placeholder {
      color: ${dark ? "#64748b" : "#94a3b8"};
    }
    .pro-search-btn {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .pro-search-btn:hover {
      transform: scale(1.05);
    }

    /* ── Header Badges & Actions ── */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .fitcoin-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 99px;
      background: ${dark ? "rgba(245, 158, 11, 0.12)" : "#fffbeb"};
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
    }
    .nav-action-btn {
      padding: 7px 14px;
      border-radius: 10px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"};
      background: ${dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff"};
      color: ${dark ? "#e2e8f0" : "#334155"};
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.18s;
    }
    .nav-action-btn:hover {
      background: ${dark ? "rgba(255, 255, 255, 0.09)" : "#f1f5f9"};
      color: ${dark ? "#ffffff" : "#0f172a"};
    }
    .cart-btn {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      border: none;
      color: #ffffff;
    }
    .cart-btn:hover {
      filter: brightness(1.1);
    }

    /* ── Cinematic Hero Carousel ── */
    .hero-container {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 20px;
      position: relative;
    }
    .hero-card {
      border-radius: 24px;
      overflow: hidden;
      min-height: 380px;
      position: relative;
      display: flex;
      align-items: center;
      padding: 40px 60px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, ${dark ? "0.6" : "0.15"});
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.4s ease;
    }
    .hero-content {
      max-width: 680px;
      z-index: 2;
    }
    .hero-tagline {
      font-size: 11.5px;
      font-weight: 850;
      letter-spacing: 1.5px;
      color: #f59e0b;
      margin-bottom: 10px;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .hero-title {
      font-family: ${FONT.display};
      font-size: 38px;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 18px;
      font-weight: 750;
      color: #f8fafc;
      margin-bottom: 10px;
    }
    .hero-desc {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .hero-btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #ffffff;
      font-size: 14px;
      font-weight: 850;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
      transition: transform 0.15s;
    }
    .hero-btn-primary:hover {
      transform: translateY(-2px);
    }
    .hero-btn-secondary {
      padding: 12px 20px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 14px;
      font-weight: 750;
      cursor: pointer;
      transition: background 0.15s;
    }
    .hero-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    /* Hero Featured Showcase Pod */
    .hero-featured-pod {
      margin-left: auto;
      z-index: 2;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 20px;
      width: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
    }
    .hero-product-img {
      width: 170px;
      height: 170px;
      object-fit: contain;
      filter: drop-shadow(0 12px 24px rgba(0,0,0,0.5));
      margin-bottom: 12px;
      transition: transform 0.3s ease;
    }
    .hero-featured-pod:hover .hero-product-img {
      transform: scale(1.08) translateY(-4px);
    }

    /* Hero Carousel Indicators */
    .hero-dots {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 5;
    }
    .hero-dot {
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.2s;
    }
    .hero-dot.active {
      width: 28px;
      background: #f59e0b;
    }

    /* ── Coach Ashish's Signature Stacks Section ── */
    .stacks-section {
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .section-header-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .section-title {
      font-family: ${FONT.display};
      font-size: 24px;
      font-weight: 900;
      color: ${dark ? "#ffffff" : "#0f172a"};
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-subtitle {
      font-size: 13px;
      color: ${dark ? "#94a3b8" : "#64748b"};
      margin-top: 2px;
    }

    .stacks-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .stack-card {
      background: ${dark ? "rgba(15, 23, 42, 0.85)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"};
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0, 0, 0, ${dark ? "0.4" : "0.06"});
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;
    }
    .stack-card:hover {
      transform: translateY(-4px);
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 16px 40px rgba(0, 0, 0, ${dark ? "0.6" : "0.12"});
    }
    .stack-synergy-pill {
      font-size: 11px;
      font-weight: 850;
      padding: 4px 10px;
      border-radius: 99px;
      background: ${dark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5"};
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
      width: fit-content;
    }
    .stack-title {
      font-family: ${FONT.display};
      font-size: 17px;
      font-weight: 850;
      color: ${dark ? "#ffffff" : "#0f172a"};
      margin-bottom: 6px;
    }
    .stack-tagline {
      font-size: 12.5px;
      color: ${dark ? "#94a3b8" : "#64748b"};
      margin-bottom: 16px;
      line-height: 1.4;
    }

    /* Stack Items Trio with + Connector */
    .stack-items-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${dark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc"};
      border-radius: 14px;
      padding: 12px 8px;
      margin-bottom: 18px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"};
    }
    .stack-item-pod {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 75px;
      text-align: center;
    }
    .stack-item-img-box {
      width: 60px;
      height: 60px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      margin-bottom: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .stack-item-img-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .stack-item-label {
      font-size: 10.5px;
      font-weight: 750;
      color: ${dark ? "#cbd5e1" : "#334155"};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70px;
    }
    .stack-plus-symbol {
      color: #f59e0b;
      font-weight: 900;
      font-size: 16px;
    }

    .stack-pricing-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .stack-bundle-price {
      font-size: 20px;
      font-weight: 900;
      color: #f59e0b;
    }
    .stack-regular-price {
      font-size: 13px;
      text-decoration: line-through;
      color: ${dark ? "#64748b" : "#94a3b8"};
      margin-left: 6px;
    }
    .stack-save-pill {
      font-size: 11px;
      font-weight: 850;
      padding: 3px 8px;
      border-radius: 6px;
      background: #cc0c39;
      color: #ffffff;
    }

    /* ── Flash Deals Rail ── */
    .deals-strip-card {
      max-width: 1400px;
      margin: 0 auto 40px;
      padding: 24px;
      background: ${dark ? "rgba(15, 23, 42, 0.85)" : "#ffffff"};
      border-radius: 22px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"};
      box-shadow: 0 8px 30px rgba(0, 0, 0, ${dark ? "0.3" : "0.05"});
    }
    .deal-rail-wrapper {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .deal-rail-wrapper::-webkit-scrollbar { display: none; }

    .deal-card {
      flex: 0 0 220px;
      background: ${dark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc"};
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9"};
      border-radius: 16px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .deal-card:hover {
      transform: translateY(-3px);
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, ${dark ? "0.4" : "0.08"});
    }
    .deal-img-pod {
      width: 100%;
      height: 150px;
      background: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      margin-bottom: 10px;
    }
    .deal-img-pod img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.2s ease;
    }
    .deal-card:hover .deal-img-pod img {
      transform: scale(1.06);
    }

    /* ── Main Catalog Filter Bar ── */
    .catalog-section {
      max-width: 1400px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }
    .filter-toolbar {
      background: ${dark ? "rgba(15, 23, 42, 0.85)" : "#ffffff"};
      border-radius: 18px;
      padding: 14px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"};
      box-shadow: 0 4px 16px rgba(0, 0, 0, ${dark ? "0.2" : "0.03"});
    }
    .goal-pills-row {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .goal-pills-row::-webkit-scrollbar { display: none; }

    .goal-pill-btn {
      padding: 8px 16px;
      border-radius: 99px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"};
      background: ${dark ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
      color: ${dark ? "#cbd5e1" : "#334155"};
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .goal-pill-btn:hover {
      border-color: #f59e0b;
      color: ${dark ? "#ffffff" : "#0f172a"};
    }
    .goal-pill-btn.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-color: #f59e0b;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
    }

    /* ── Pro Athlete Product Cards Grid ── */
    .pro-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 24px;
    }
    .pro-prod-card {
      background: ${dark ? "rgba(15, 23, 42, 0.85)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"};
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      position: relative;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, ${dark ? "0.3" : "0.04"});
    }
    .pro-prod-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, ${dark ? "0.55" : "0.12"});
      border-color: rgba(245, 158, 11, 0.45);
    }

    /* Crisp Packaging Image Pod with 100% visibility guarantee */
    .pro-img-showcase {
      width: 100%;
      height: 230px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      position: relative;
      overflow: hidden;
    }
    .pro-img-showcase img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.25s ease;
    }
    .pro-prod-card:hover .pro-img-showcase img {
      transform: scale(1.07);
    }

    .card-top-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 2;
    }
    .purity-seal {
      background: rgba(16, 185, 129, 0.95);
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 850;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
    }
    .custom-badge {
      font-size: 10.5px;
      font-weight: 850;
      padding: 3px 8px;
      border-radius: 6px;
      color: #ffffff;
    }

    .card-wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      z-index: 3;
      transition: transform 0.15s;
    }
    .card-wishlist-btn:hover {
      transform: scale(1.1);
      color: #ef4444;
    }

    .pro-card-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .pro-brand-label {
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #f59e0b;
      margin-bottom: 4px;
    }
    .pro-item-name {
      font-size: 14.5px;
      font-weight: 750;
      color: ${dark ? "#ffffff" : "#0f172a"};
      line-height: 1.35;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 39px;
    }

    .pro-rating-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }
    .rating-stars {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .rating-score {
      font-size: 13px;
      font-weight: 800;
      color: ${dark ? "#e2e8f0" : "#1e293b"};
    }
    .rating-count {
      font-size: 12px;
      color: ${dark ? "#64748b" : "#94a3b8"};
    }

    .pro-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 14px;
    }
    .pro-spec-tag {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: ${dark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"};
      color: ${dark ? "#94a3b8" : "#475569"};
    }

    .pro-price-block {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;
      margin-top: auto;
    }
    .pro-current-price {
      font-size: 20px;
      font-weight: 900;
      color: ${dark ? "#ffffff" : "#0f172a"};
    }
    .pro-old-price {
      font-size: 13px;
      text-decoration: line-through;
      color: ${dark ? "#64748b" : "#94a3b8"};
    }
    .pro-discount-tag {
      font-size: 12px;
      font-weight: 850;
      color: #10b981;
    }

    .fitcoin-cashback-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      font-weight: 750;
      color: #f59e0b;
      margin-bottom: 14px;
    }

    /* ── Action Buttons ── */
    .pro-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    .btn-buy-amazon {
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      transition: filter 0.15s;
    }
    .btn-buy-amazon:hover {
      filter: brightness(1.1);
    }
    .btn-add-fitbag {
      height: 40px;
      border-radius: 10px;
      background: ${dark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9"};
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1"};
      color: ${dark ? "#ffffff" : "#0f172a"};
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-add-fitbag:hover {
      background: ${dark ? "rgba(255, 255, 255, 0.14)" : "#e2e8f0"};
    }
    .btn-share-chat {
      height: 36px;
      border-radius: 10px;
      background: ${dark ? "rgba(56, 189, 248, 0.1)" : "#f0f9ff"};
      border: 1px solid ${dark ? "rgba(56, 189, 248, 0.25)" : "#bae6fd"};
      color: #0284c7;
      font-size: 12.5px;
      font-weight: 750;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s;
      width: 100%;
    }
    .btn-share-chat:hover {
      background: #0284c7;
      color: #ffffff;
    }

    /* ── Guarantee Pillars Strip ── */
    .pillars-strip {
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .pillars-grid {
      background: ${dark ? "rgba(15, 23, 42, 0.85)" : "#ffffff"};
      border-radius: 22px;
      border: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"};
      padding: 30px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .pillar-box {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .pillar-icon-pod {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .pillar-title {
      font-size: 15px;
      font-weight: 800;
      color: ${dark ? "#ffffff" : "#0f172a"};
      margin-bottom: 4px;
    }
    .pillar-desc {
      font-size: 12.5px;
      color: ${dark ? "#94a3b8" : "#64748b"};
      line-height: 1.4;
    }

    /* ── Pro Store Footer ── */
    .pro-footer {
      background: ${dark ? "#040711" : "#0f172a"};
      color: #ffffff;
      padding: 50px 24px 30px;
      border-top: 1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "transparent"};
      margin-top: 60px;
    }
    .pro-footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .footer-col-title {
      font-family: ${FONT.display};
      font-size: 15px;
      font-weight: 850;
      color: #ffffff;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    .footer-link {
      color: #94a3b8;
      font-size: 13.5px;
      margin-bottom: 10px;
      cursor: pointer;
      display: block;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-link:hover {
      color: #f59e0b;
    }
    .footer-bottom-bar {
      max-width: 1200px;
      margin: 0 auto;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #64748b;
      font-size: 12.5px;
      flex-wrap: wrap;
      gap: 12px;
    }

    @media (max-width: 1024px) {
      .stacks-grid { grid-template-columns: 1fr; }
      .pillars-grid { grid-template-columns: 1fr 1fr; }
      .pro-footer-content { grid-template-columns: 1fr 1fr; }
      .hero-featured-pod { display: none; }
    }
    @media (max-width: 640px) {
      .pro-navbar { padding: 10px 14px; flex-wrap: wrap; }
      .pro-search-box { order: 3; width: 100%; max-width: 100%; margin-top: 8px; }
      .hero-card { padding: 24px 20px; min-height: 320px; }
      .hero-title { font-size: 26px; }
      .hero-subtitle { font-size: 15px; }
      .pillars-grid { grid-template-columns: 1fr; }
      .pro-footer-content { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div className="fitverse-shop-root">
      <style>{css}</style>

      {/* ── Top Pro Navigation Bar ── */}
      <header className="pro-navbar">
        {/* Brand Identity */}
        <div className="brand-cluster" onClick={() => navigate("/dashboard")}>
          <div className="brand-icon-pod">
            <Zap size={22} />
          </div>
          <div>
            <div className="brand-title">
              <span>ASHFITVERSE</span>
              <span style={{ color: "#f59e0b" }}>STORE</span>
              <span className="brand-pill">PRO ATHLETE</span>
            </div>
            <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
              100% Labdoor Verified Nutrition & Gear
            </div>
          </div>
        </div>

        {/* Pro Search Box */}
        <div className="pro-search-box">
          <input
            type="text"
            className="pro-search-input"
            placeholder="Search authentic whey, creatine, power belts, omegas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "0 8px",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          )}
          <button className="pro-search-btn" title="Search catalog">
            <Search size={17} />
          </button>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* FitCoins Rewards */}
          <div className="fitcoin-badge" title="Earn 5% to 10% FitCoins cashback on all verified gear">
            <Coins size={15} />
            <span>450 FitCoins</span>
          </div>

          {/* Chat & Share Shortcut */}
          <button
            className="nav-action-btn"
            onClick={() => navigate("/chat")}
            title="Open FitVerse Direct Messaging & Gym Groups"
          >
            <Send size={15} color="#38bdf8" />
            <span>Chat & Share</span>
          </button>

          {/* FitBag Cart */}
          <button className="nav-action-btn cart-btn" onClick={() => alert(`FitBag: ${cartCount} items active. Ready to checkout!`)}>
            <ShoppingCart size={16} />
            <span>FitBag ({cartCount})</span>
          </button>

          {/* Admin Add Product */}
          {isAdmin && (
            <button
              className="nav-action-btn"
              style={{ borderColor: "#f59e0b", color: "#f59e0b" }}
              onClick={() => setShowAddProductModal(true)}
            >
              <Plus size={15} />
              <span>+ Add Product</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Store Department Switcher Ribbon ── */}
      <div className="store-tabs-ribbon">
        <div className="dept-tabs-group">
          <button
            className={`dept-tab-btn ${!deptParam ? "active" : ""}`}
            onClick={() => navigate("/shop")}
          >
            <span>🌐 Common Pro Shop</span>
          </button>
          <button
            className={`dept-tab-btn ${deptParam === "male" ? "active" : ""}`}
            onClick={() => navigate("/male-shop")}
          >
            <span>⚡ Men's Elite Shop</span>
          </button>
          <button
            className={`dept-tab-btn ${deptParam === "female" ? "active" : ""}`}
            onClick={() => navigate("/female-shop")}
          >
            <span>🌸 Women's Wellness</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={15} color="#10b981" />
            <span>Anti-Doping & Purity Tested</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <Truck size={15} color="#38bdf8" />
            <span>Amazon Prime 1-Day Fulfillment</span>
          </div>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {addedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{addedToast}</span>
        </div>
      )}

      {/* ── Cinematic Hero Carousel ── */}
      <div
        className="hero-container"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {HERO_SLIDES.map((slide, idx) => {
          if (idx !== activeSlide) return null;
          return (
            <div
              key={slide.id}
              className="hero-card"
              style={{ background: slide.bgGradient }}
            >
              <div className="hero-content">
                <div className="hero-tagline">
                  <Sparkles size={14} color="#f59e0b" />
                  <span>{slide.tagline}</span>
                </div>
                <h1 className="hero-title">{slide.title}</h1>
                <div className="hero-subtitle">{slide.subtitle}</div>
                <p className="hero-desc">{slide.description}</p>
                <div className="hero-cta-group">
                  <button
                    className="hero-btn-primary"
                    onClick={() => {
                      setCategory(slide.targetCategory);
                      const el = document.getElementById("catalog-grid");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span>Explore Collection</span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="hero-btn-secondary"
                    onClick={() => {
                      if (slide.featuredProduct) {
                        navigate(`/shop/product/${slide.featuredProduct.id}`);
                      }
                    }}
                  >
                    <span>View Featured Gear</span>
                  </button>
                </div>
              </div>

              {/* Featured Showcase Pod */}
              {slide.featuredProduct && (
                <div
                  className="hero-featured-pod"
                  onClick={() => navigate(`/shop/product/${slide.featuredProduct.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 850, color: "#f59e0b", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
                    {slide.badge}
                  </div>
                  <img
                    src={slide.featuredProduct.localImage || slide.featuredProduct.image}
                    alt={slide.featuredProduct.name}
                    className="hero-product-img"
                    onError={(e) => {
                      if (e.target.src !== slide.featuredProduct.image) {
                        e.target.src = slide.featuredProduct.image;
                      }
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", marginBottom: 4, lineHeight: 1.3 }}>
                    {slide.featuredProduct.name.slice(0, 42)}...
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>
                    {slide.featuredProduct.price}
                  </div>
                </div>
              )}

              {/* Navigation Indicators */}
              <div className="hero-dots">
                {HERO_SLIDES.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`hero-dot ${dotIdx === activeSlide ? "active" : ""}`}
                    onClick={() => setActiveSlide(dotIdx)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Coach Ashish's Signature Stacks (Innovation unique to AshFitVerse!) ── */}
      <section className="stacks-section">
        <div className="section-header-box">
          <div>
            <div className="section-title">
              <Flame size={24} color="#f59e0b" />
              <span>Coach Ashish's Signature Athlete Stacks</span>
            </div>
            <div className="section-subtitle">
              Scientifically engineered multi-supplement synergies for maximum biological absorption and PR output.
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#f59e0b" }}>
            ⚡ 1-Click Multi-Item Bundle Deals
          </div>
        </div>

        <div className="stacks-grid">
          {COACH_STACKS.map((stack) => (
            <div key={stack.id} className="stack-card">
              <div>
                <div className="stack-synergy-pill">
                  <CheckCircle2 size={13} />
                  <span>{stack.synergyScore}</span>
                </div>
                <div className="stack-title">{stack.title}</div>
                <div className="stack-tagline">{stack.tagline}</div>

                {/* Visual Trio with + connectors */}
                <div className="stack-items-row">
                  {stack.items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <div
                        className="stack-item-pod"
                        onClick={() => navigate(`/shop/product/${item.id}`)}
                        style={{ cursor: "pointer" }}
                        title={item.name}
                      >
                        <div className="stack-item-img-box">
                          <img src={item.img} alt={item.name} />
                        </div>
                        <div className="stack-item-label">{item.name}</div>
                      </div>
                      {idx < stack.items.length - 1 && <span className="stack-plus-symbol">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div>
                <div className="stack-pricing-row">
                  <div>
                    <span className="stack-bundle-price">{stack.bundlePrice}</span>
                    <span className="stack-regular-price">{stack.regularPrice}</span>
                  </div>
                  <span className="stack-save-pill">{stack.discountBadge}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button
                    className="btn-buy-amazon"
                    onClick={() => {
                      const firstItem = COMMON_PRODUCTS.find((p) => p.id === stack.items[0].id) || COMMON_PRODUCTS[0];
                      const affUrl = buildAmazonAffiliateUrl(firstItem.asin, affiliateTag);
                      logUserOrder(firstItem, affiliateTag, user);
                      window.open(affUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <span>⚡ Order Stack</span>
                  </button>
                  <button
                    className="btn-share-chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      const prefill = `🔥 Check out Coach Ashish's Signature Stack: ${stack.title}!\n\n✨ Included: ${stack.tagline}\n💰 Bundle Deal: ${stack.bundlePrice} (${stack.discountBadge})\n⚡ Scientific Synergy: ${stack.synergyScore}\n🔗 View on AshFitVerse Store: ${window.location.origin}/shop`;
                      navigate("/chat", {
                        state: {
                          shareProduct: {
                            id: stack.id,
                            name: stack.title,
                            brand: "Coach Ashish Curated",
                            price: stack.bundlePrice,
                            originalPrice: stack.regularPrice,
                            image: stack.items[0].img,
                            localImage: stack.items[0].img,
                          },
                          prefillMessage: prefill,
                        },
                      });
                    }}
                  >
                    <Send size={13} />
                    <span>Share to Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lightning Deals Flash Rail ── */}
      <section className="deals-strip-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: FONT.display, color: dark ? "#ffffff" : "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={20} color="#f59e0b" />
              <span>Lightning Deals of the Day</span>
            </div>
            <div
              style={{
                background: "#cc0c39",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Clock size={13} />
              <span>
                ENDS IN {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => dealsScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: "none",
                cursor: "pointer",
                color: T.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => dealsScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: "none",
                cursor: "pointer",
                color: T.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="deal-rail-wrapper" ref={dealsScrollRef}>
          {lightningDeals.map((product) => {
            const affUrl = buildAmazonAffiliateUrl(product.asin, affiliateTag);
            return (
              <div
                key={product.id}
                className="deal-card"
                onClick={() => navigate(`/shop/product/${product.id}`)}
              >
                <div className="deal-img-pod">
                  <img
                    src={product.localImage || product.image}
                    alt={product.name}
                    onError={(e) => {
                      if (e.target.src !== product.image) {
                        e.target.src = product.image;
                      }
                    }}
                  />
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 850, color: "#f59e0b", textTransform: "uppercase", marginBottom: 3 }}>
                  {product.brand}
                </div>
                <div style={{ fontSize: 13, fontWeight: 750, color: dark ? "#ffffff" : "#0f172a", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {product.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#f59e0b" }}>{product.price}</span>
                  <span style={{ fontSize: 11, textDecoration: "line-through", color: dark ? "#64748b" : "#94a3b8" }}>{product.originalPrice}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>{product.discount}</span>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: dark ? "#94a3b8" : "#64748b", fontWeight: 700, marginBottom: 4 }}>
                    <span>Claimed</span>
                    <span style={{ color: "#f59e0b" }}>{product.claimedPercent}%</span>
                  </div>
                  <div style={{ width: "100%", height: 5, background: dark ? "rgba(255,255,255,0.1)" : "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${product.claimedPercent}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #ea580c)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Main Catalog Grid ── */}
      <section className="catalog-section" id="catalog-grid">
        <div className="section-header-box">
          <div>
            <div className="section-title">
              <span>Verified Sports Nutrition & Athlete Gear</span>
              <span style={{ fontSize: 13, fontWeight: 750, color: "#f59e0b", background: dark ? "rgba(245,158,11,0.15)" : "#fef3c7", padding: "3px 9px", borderRadius: 99 }}>
                {filtered.length} Authentic Products
              </span>
            </div>
            <div className="section-subtitle">
              Every single product listed features its original manufacturer packaging photo, verified ingredients, and direct Prime affiliate access.
            </div>
          </div>
        </div>

        {/* Filter & Goal Matcher Toolbar */}
        <div className="filter-toolbar">
          <div className="goal-pills-row">
            <button
              className={`goal-pill-btn ${category === "all" && goalFilter === "all" ? "active" : ""}`}
              onClick={() => {
                setCategory("all");
                setGoalFilter("all");
              }}
            >
              🔥 All Gear & Nutrition
            </button>
            <button
              className={`goal-pill-btn ${goalFilter === "hypertrophy" ? "active" : ""}`}
              onClick={() => setGoalFilter(goalFilter === "hypertrophy" ? "all" : "hypertrophy")}
            >
              💪 Hypertrophy & Muscle
            </button>
            <button
              className={`goal-pill-btn ${goalFilter === "strength" ? "active" : ""}`}
              onClick={() => setGoalFilter(goalFilter === "strength" ? "all" : "strength")}
            >
              ⚡ Explosive PRs & Strength
            </button>
            <button
              className={`goal-pill-btn ${goalFilter === "fatloss" ? "active" : ""}`}
              onClick={() => setGoalFilter(goalFilter === "fatloss" ? "all" : "fatloss")}
            >
              🏃 Fat Loss & Cut
            </button>
            <button
              className={`goal-pill-btn ${goalFilter === "longevity" ? "active" : ""}`}
              onClick={() => setGoalFilter(goalFilter === "longevity" ? "all" : "longevity")}
            >
              🌿 Longevity & Recovery
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: dark ? "rgba(255,255,255,0.06)" : "#ffffff",
                color: T.text,
                border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#cbd5e1"}`,
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="pro-product-grid">
          {filtered.map((product) => {
            const affUrl = buildAmazonAffiliateUrl(product.asin, affiliateTag);
            const isFav = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                className="pro-prod-card"
                onClick={() => navigate(`/shop/product/${product.id}`)}
              >
                {/* Image Showcase Pod with 100% visibility guarantee */}
                <div className="pro-img-showcase">
                  <div className="card-top-badges">
                    <span className="purity-seal">
                      <ShieldCheck size={12} />
                      <span>99.8% Purity</span>
                    </span>
                    {product.badge && (
                      <span
                        className="custom-badge"
                        style={{ background: product.badgeColor || "#f59e0b" }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <button
                    className="card-wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title="Add to wishlist"
                  >
                    <Heart size={16} fill={isFav ? "#ef4444" : "none"} color={isFav ? "#ef4444" : "#64748b"} />
                  </button>

                  {/* Guaranteed Authentic Packaging Image */}
                  <img
                    src={product.localImage || product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      if (e.target.src !== product.image) {
                        e.target.src = product.image;
                      }
                    }}
                  />
                </div>

                {/* Card Body */}
                <div className="pro-card-body">
                  <div className="pro-brand-label">{product.brand}</div>
                  <div className="pro-item-name" title={product.name}>
                    {product.name}
                  </div>

                  {/* Rating */}
                  <div className="pro-rating-row">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < 4 ? "#f59e0b" : "#f59e0b"}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    <span className="rating-score">4.8</span>
                    <span className="rating-count">({product.reviews || "3,240"})</span>
                  </div>

                  {/* Feature Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="pro-tags-row">
                      {product.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="pro-spec-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Discount */}
                  <div className="pro-price-block">
                    <span className="pro-current-price">{product.price}</span>
                    {product.originalPrice && (
                      <span className="pro-old-price">{product.originalPrice}</span>
                    )}
                    {product.discount && (
                      <span className="pro-discount-tag">{product.discount}</span>
                    )}
                  </div>

                  {/* FitCoins Cashback */}
                  <div className="fitcoin-cashback-row">
                    <Coins size={14} />
                    <span>+150 FitCoins on Order</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pro-actions-grid">
                    <button
                      className="btn-buy-amazon"
                      onClick={(e) => {
                        e.stopPropagation();
                        logUserOrder(product, affiliateTag, user);
                        window.open(affUrl, "_blank", "noopener,noreferrer");
                      }}
                      title="Buy directly on Amazon with Prime Delivery"
                    >
                      <span>Buy Amazon</span>
                      <ExternalLink size={13} />
                    </button>
                    <button
                      className="btn-add-fitbag"
                      onClick={(e) => handleAddToCart(e, product)}
                      title="Add to in-app FitBag"
                    >
                      <ShoppingCart size={14} />
                      <span>+ FitBag</span>
                    </button>
                  </div>

                  {/* Dedicated Share to Chat Button (Multi-Contact Broadcast) */}
                  <button
                    className="btn-share-chat"
                    onClick={(e) => handleShareProductToChat(e, product)}
                    title="Broadcast product to your FitVerse friends or gym group in 1-click"
                  >
                    <Send size={13} />
                    <span>💬 Share to Gym Buddies</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AshFitVerse Authenticity & Purity Guarantee Strip ── */}
      <section className="pillars-strip">
        <div className="pillars-grid">
          <div className="pillar-box">
            <div className="pillar-icon-pod" style={{ background: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", color: "#10b981" }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="pillar-title">100% Labdoor Certified</div>
              <div className="pillar-desc">
                Zero spiked heavy metals or banned compounds. Batch lab reports publicly verified.
              </div>
            </div>
          </div>

          <div className="pillar-box">
            <div className="pillar-icon-pod" style={{ background: dark ? "rgba(56,189,248,0.15)" : "#f0f9ff", color: "#0284c7" }}>
              <PackageCheck size={24} />
            </div>
            <div>
              <div className="pillar-title">Factory Direct Sealed</div>
              <div className="pillar-desc">
                Tamper-evident holographic security seals direct from brand manufacturing facilities.
              </div>
            </div>
          </div>

          <div className="pillar-box">
            <div className="pillar-icon-pod" style={{ background: dark ? "rgba(245,158,11,0.15)" : "#fef3c7", color: "#f59e0b" }}>
              <Truck size={24} />
            </div>
            <div>
              <div className="pillar-title">Prime 1-Day Dispatch</div>
              <div className="pillar-desc">
                Fulfilled via Amazon Prime high-speed logistics across all major Indian cities.
              </div>
            </div>
          </div>

          <div className="pillar-box">
            <div className="pillar-icon-pod" style={{ background: dark ? "rgba(168,85,247,0.15)" : "#faf5ff", color: "#a855f7" }}>
              <Coins size={24} />
            </div>
            <div>
              <div className="pillar-title">10% FitCoins Back</div>
              <div className="pillar-desc">
                Earn reward tokens on every order to unlock Coach Ashish pro lifting programs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pro Store Footer ── */}
      <footer className="pro-footer">
        <div className="pro-footer-content">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div className="brand-icon-pod" style={{ width: 34, height: 34 }}>
                <Zap size={18} />
              </div>
              <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 900 }}>
                ASHFITVERSE STORE
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, maxWidth: 360 }}>
              The elite sports nutrition and athletic performance vault curated by Coach Ashish. Verified
              supplements, competition power gear, and longevity protocols for serious athletes.
            </p>
          </div>

          <div>
            <div className="footer-col-title">DEPARTMENTS</div>
            <a href="/shop" className="footer-link">Common Pro Shop</a>
            <a href="/male-shop" className="footer-link">Men's Elite Shop</a>
            <a href="/female-shop" className="footer-link">Women's Wellness Shop</a>
            <a href="/chat" className="footer-link">FitVerse Chat & Share</a>
          </div>

          <div>
            <div className="footer-col-title">FITNESS APPS</div>
            <a href="/workouts" className="footer-link">Workout Planner & Logs</a>
            <a href="/diet" className="footer-link">Macro & Diet Tracker</a>
            <a href="/calculator/calories" className="footer-link">Calorie Calculator</a>
            <a href="/community" className="footer-link">Athlete Community</a>
          </div>

          <div>
            <div className="footer-col-title">VERIFICATION</div>
            <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>
              Affiliate Associate ID: <strong style={{ color: "#f59e0b" }}>{affiliateTag}</strong>
              <br />
              All purchases fulfilled by Amazon India. Product trademarks belong to their respective manufacturers.
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} AshFitVerse Pro Store. All rights reserved.</div>
          <div>Built with passion for high-performance athletes across India 🇮🇳</div>
        </div>
      </footer>

      {/* ── Admin Add Product Modal ── */}
      {showAddProductModal && (
        <AddAffiliateProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          defaultShop="common"
        />
      )}
    </div>
  );
}
