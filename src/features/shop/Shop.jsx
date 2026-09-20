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
  MapPin,
  Menu,
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PANORAMIC PRO ATHLETE HERO SLIDES
// ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "1",
    title: "GRAND FITNESS FESTIVAL",
    subtitle: "Up to 55% OFF on 100% Authentic Whey & Isolate",
    description: "Labdoor Certified • Anti-Doping Tested • Guaranteed Same-Day / Next-Day Delivery with Amazon Prime",
    bgGradient: "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #172554 100%)",
    accent: "#f59e0b",
    badge: "🔥 PRIME ATHLETE DEALS",
    targetCategory: "protein",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "1") || COMMON_PRODUCTS[0],
  },
  {
    id: "4",
    title: "EXPLOSIVE STRENGTH & POWER DAYS",
    subtitle: "German Creapure Creatine & High-Stim Pre-Workouts",
    description: "Max out intramuscular phosphocreatine ATP and shatter deadlift & squat PRs with pure clinical formulations",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #311042 50%, #431407 100%)",
    accent: "#38bdf8",
    badge: "⚡ PEAK ATP POWER",
    targetCategory: "creatine",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "4") || COMMON_PRODUCTS[3],
  },
  {
    id: "10",
    title: "HEAVY DUTY PRO GYM GEAR",
    subtitle: "10mm Leather Lever Belts, Wrist Wraps & Shakers",
    description: "Competition-grade spinal stabilization and joint wraps trusted by competitive powerlifters and athletes",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
    accent: "#10b981",
    badge: "🏆 POWERLIFTING GEAR",
    targetCategory: "gear",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "10") || COMMON_PRODUCTS[9],
  },
  {
    id: "24",
    title: "DAILY HEALTH, OMEGAS & RECOVERY",
    subtitle: "Triple Strength Omega-3, KSM-66 Ashwagandha & Vitamins",
    description: "Fortify cardiovascular endurance, lubricate articular cartilage, and optimize deep REM restorative sleep",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #1e293b 100%)",
    accent: "#fb923c",
    badge: "🌿 LONGEVITY & VITALITY",
    targetCategory: "vitamins",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "24") || COMMON_PRODUCTS[4],
  },
];

// Coach Ashish's Curated Athlete Stacks
const COACH_STACKS = [
  {
    id: "stack-hypertrophy",
    title: "The Ultimate Hypertrophy & Muscle Growth Stack",
    tagline: "24g Whey Isolate + 3g Micronized Creapure + Shaker",
    goal: "hypertrophy",
    synergyScore: "99.8% Synergy",
    bundlePrice: "₹5,247",
    regularPrice: "₹6,098",
    discountBadge: "SAVE ₹851 BUNDLE DEAL",
    items: [
      { id: "1", name: "ON Gold Standard Whey 2 lbs", img: "https://m.media-amazon.com/images/I/71rYnIdVEqL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/1.jpg" },
      { id: "4", name: "German Creapure Creatine 250g", img: "https://m.media-amazon.com/images/I/61A69Friz+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/4.jpg" },
      { id: "18", name: "BlenderBottle Pro Series 820ml", img: "https://m.media-amazon.com/images/I/71JlXDV-nPL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/18.jpg" },
    ],
  },
  {
    id: "stack-pr-hunter",
    title: "Explosive PR Hunter & Nitric Pump Stack",
    tagline: "High-Stim Caffeine C4 + L-Citrulline + USI Lever Belt",
    goal: "strength",
    synergyScore: "98.9% Synergy",
    bundlePrice: "₹4,847",
    regularPrice: "₹5,598",
    discountBadge: "SAVE ₹751 BUNDLE DEAL",
    items: [
      { id: "7", name: "Cellucor C4 Pre-Workout", img: "https://m.media-amazon.com/images/I/61CGhaCb55L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/7.jpg" },
      { id: "10", name: "USI Universal Leather Lever Belt", img: "https://m.media-amazon.com/images/I/71j+4jDZTeL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/10.jpg" },
      { id: "14", name: "Boldfit Heavy Wrist Wraps", img: "https://m.media-amazon.com/images/I/61VMKkVBwqL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/14.jpg" },
    ],
  },
  {
    id: "stack-longevity",
    title: "Daily Longevity & Joint Armor Stack",
    tagline: "Triple Omega-3 (560mg EPA/400mg DHA) + Vit C + Multivitamin",
    goal: "longevity",
    synergyScore: "99.2% Synergy",
    bundlePrice: "₹1,899",
    regularPrice: "₹2,499",
    discountBadge: "SAVE ₹600 BUNDLE DEAL",
    items: [
      { id: "24", name: "TrueBasics Triple Omega-3", img: "https://m.media-amazon.com/images/I/61WBl1SBy+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/24.jpg" },
      { id: "23", name: "Fast&Up Charge Vitamin C 1000mg", img: "https://m.media-amazon.com/images/I/61q1SGIQ2fL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/23.jpg" },
      { id: "6", name: "HK Vitals Multivitamin + Zinc", img: "https://m.media-amazon.com/images/I/71pYCanoMhL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/6.jpg" },
    ],
  },
];

const SEARCH_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "protein", label: "Whey & Protein" },
  { id: "creatine", label: "Creatine & Strength" },
  { id: "preworkout", label: "Pre-Workout" },
  { id: "vitamins", label: "Vitamins & Recovery" },
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
  const bestSellersScrollRef = useRef(null);
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
    }, 5500);
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

  // Lightning Deals & Best Sellers subsets
  const lightningDeals = useMemo(() => {
    return allProducts.slice(0, 10).map((p, idx) => ({
      ...p,
      claimedPercent: 62 + ((idx * 7) % 32),
    }));
  }, [allProducts]);

  const bestSellers = useMemo(() => {
    return allProducts.slice(0, 12);
  }, [allProducts]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setCartCount((prev) => prev + 1);
    setAddedToast(`Added "${product.name.slice(0, 24)}..." to Cart!`);
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

  const handleScroll = (ref, dir) => {
    if (ref.current) {
      const scrollAmount = dir === "left" ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4-Quadrant Card Grid Data
  const quadrantData = [
    {
      title: "Up to 40% off | Top Whey & Protein Brands",
      categoryTarget: "protein",
      items: [
        { name: "ON Gold Whey", img: "https://m.media-amazon.com/images/I/71rYnIdVEqL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/1.jpg", id: "1" },
        { name: "MB Biozyme", img: "https://m.media-amazon.com/images/I/71s0HTuXpuL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/2.jpg", id: "2" },
        { name: "Dymatize ISO", img: "https://m.media-amazon.com/images/I/41Yv+JFOarL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/3.jpg", id: "3" },
        { name: "Avvatar Whey", img: "https://m.media-amazon.com/images/I/41E3fWK+ebL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/19.jpg", id: "19" },
      ],
      linkText: "See all Protein offers",
    },
    {
      title: "Explosive Strength | Creatine & Pre-Workouts",
      categoryTarget: "creatine",
      items: [
        { name: "Wellcore Creatine", img: "https://m.media-amazon.com/images/I/61A69Friz+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/21.jpg", id: "21" },
        { name: "ON Creatine", img: "https://m.media-amazon.com/images/I/61A69Friz+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/4.jpg", id: "4" },
        { name: "Cellucor C4", img: "https://m.media-amazon.com/images/I/61CGhaCb55L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/7.jpg", id: "7" },
        { name: "MB Pre-Workout", img: "https://m.media-amazon.com/images/I/61CGhaCb55L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/8.jpg", id: "8" },
      ],
      linkText: "Explore strength boosters",
    },
    {
      title: "Vitamins, Fish Oil & Daily Recovery",
      categoryTarget: "vitamins",
      items: [
        { name: "TrueBasics Omega", img: "https://m.media-amazon.com/images/I/61WBl1SBy+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/24.jpg", id: "24" },
        { name: "Fast&Up Charge", img: "https://m.media-amazon.com/images/I/61q1SGIQ2fL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/23.jpg", id: "23" },
        { name: "MB Fish Oil", img: "https://m.media-amazon.com/images/I/61A69Friz+L._AC_UL800_FMwebp_QL65_.jpg", local: "/products/5.jpg", id: "5" },
        { name: "HK Multivitamin", img: "https://m.media-amazon.com/images/I/71pYCanoMhL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/6.jpg", id: "6" },
      ],
      linkText: "See wellness & recovery",
    },
    {
      title: "Pro Gym Gear, Belts & Accessories",
      categoryTarget: "gear",
      items: [
        { name: "USI Leather Belt", img: "https://m.media-amazon.com/images/I/71j+4jDZTeL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/10.jpg", id: "10" },
        { name: "Boldfit Wraps", img: "https://m.media-amazon.com/images/I/61VMKkVBwqL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/14.jpg", id: "14" },
        { name: "BlenderBottle", img: "https://m.media-amazon.com/images/I/71JlXDV-nPL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/18.jpg", id: "18" },
        { name: "Kobo Dumbbells", img: "https://m.media-amazon.com/images/I/71i9edMVSBL._AC_UL800_FMwebp_QL65_.jpg", local: "/products/12.jpg", id: "12" },
      ],
      linkText: "Shop gym equipment",
    },
  ];

  const currentSlide = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];

  const css = `
    .fitverse-shop-root {
      min-height: 100vh;
      background: ${dark ? "#090d16" : "#f1f5f9"};
      color: ${dark ? "#f8fafc" : "#0f172a"};
      font-family: ${FONT.body};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.4s ease;
      position: relative;
      overflow-x: hidden;
    }

    /* ── AshFitVerse Nav Header ── */
    .amz-nav-top {
      background: ${dark ? "#0c111c" : "#1e293b"};
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 16px;
      color: #ffffff;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);
    }
    .amz-logo-box {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      border: 1px solid transparent;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .amz-logo-box:hover {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(255,255,255,0.04);
    }
    .amz-logo-text {
      font-family: ${FONT.display};
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1;
      color: #ffffff;
      display: flex;
      align-items: center;
    }
    .amz-logo-accent {
      color: #f59e0b;
      margin-left: 3px;
    }
    .amz-smile-curve {
      height: 3px;
      width: 80px;
      background: linear-gradient(90deg, #f59e0b, #ea580c);
      border-radius: 99px;
      margin-top: 3px;
      box-shadow: 0 1px 6px rgba(245, 158, 11, 0.4);
    }
    .amz-deliver-box {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .amz-deliver-box:hover {
      border-color: rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.04);
    }
    .amz-del-small {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.1;
    }
    .amz-del-bold {
      font-size: 13px;
      font-weight: 750;
      color: #ffffff;
      line-height: 1.2;
    }

    /* ── Search Bar ── */
    .amz-search-container {
      flex: 1;
      max-width: 820px;
      height: 42px;
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.15);
      background: #ffffff;
      transition: all 0.2s;
    }
    .amz-search-container:focus-within {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.4);
      border-color: #f59e0b;
    }
    .amz-cat-btn {
      background: #f8fafc;
      border: none;
      color: #0f172a;
      padding: 0 14px;
      font-size: 12.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      border-right: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    .amz-cat-btn:hover {
      background: #f1f5f9;
    }
    .amz-search-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0 14px;
      font-size: 13.5px;
      color: #0f172a;
      background: transparent;
    }
    .amz-search-btn {
      width: 48px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 0.15s;
      color: #ffffff;
    }
    .amz-search-btn:hover {
      filter: brightness(1.1);
    }

    /* ── Subnav Ribbon ── */
    .amz-nav-sub {
      background: ${dark ? "#0f1626" : "#0f172a"};
      height: 42px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 16px;
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      overflow-x: auto;
      scrollbar-width: none;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .amz-nav-sub::-webkit-scrollbar {
      display: none;
    }
    .amz-sub-link {
      cursor: pointer;
      white-space: nowrap;
      padding: 6px 10px;
      border-radius: 6px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .amz-sub-link:hover {
      color: #ffffff;
      background: rgba(255,255,255,0.08);
    }
    .amz-sub-link.active {
      color: #f59e0b;
      font-weight: 800;
      background: rgba(245,158,11,0.12);
    }

    /* ── Panoramic Hero Banner ── */
    .amz-hero-wrapper {
      position: relative;
      width: 100%;
      height: 380px;
      overflow: hidden;
    }
    .amz-hero-slide {
      position: absolute;
      inset: 0;
      transition: opacity 0.6s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30px 60px 140px;
      box-sizing: border-box;
    }
    .amz-hero-fade {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        ${dark ? "rgba(9,13,22,0.7)" : "rgba(241,245,249,0.7)"} 50%,
        ${dark ? "#090d16" : "#f1f5f9"} 100%
      );
      pointer-events: none;
      z-index: 10;
    }
    .amz-hero-arrow {
      position: absolute;
      top: 130px;
      width: 44px;
      height: 56px;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 15;
      color: #ffffff;
      transition: background 0.2s;
    }
    .amz-hero-arrow:hover {
      background: rgba(245, 158, 11, 0.8);
    }
    .amz-hero-arrow.left { left: 20px; }
    .amz-hero-arrow.right { right: 20px; }

    /* ── 4-Quadrant Card Grid ── */
    .amz-quadrant-grid {
      max-width: 1440px;
      margin: -130px auto 36px;
      padding: 0 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      position: relative;
      z-index: 20;
    }
    .amz-quad-card {
      background: ${dark ? "rgba(17, 24, 39, 0.95)" : "#ffffff"};
      border-radius: 16px;
      padding: 20px 18px 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,${dark ? "0.5" : "0.08"});
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .amz-quad-card:hover {
      transform: translateY(-3px);
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 16px 40px rgba(0,0,0,${dark ? "0.6" : "0.14"});
    }
    .amz-quad-title {
      font-size: 17px;
      font-weight: 800;
      color: ${dark ? "#ffffff" : "#0f172a"};
      margin-bottom: 14px;
      line-height: 1.25;
      font-family: ${FONT.display};
    }
    .amz-quad-subgrid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .amz-quad-item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 8px;
      border-radius: 10px;
      background: ${dark ? "rgba(255,255,255,0.03)" : "#f8fafc"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};
      transition: background 0.15s;
    }
    .amz-quad-item:hover {
      background: ${dark ? "rgba(255,255,255,0.08)" : "#edf2f7"};
    }
    .amz-quad-img {
      width: 86px;
      height: 86px;
      object-fit: contain;
      margin-bottom: 6px;
      transition: transform 0.2s;
    }
    .amz-quad-item:hover .amz-quad-img {
      transform: scale(1.08);
    }
    .amz-quad-lbl {
      font-size: 11px;
      font-weight: 700;
      color: ${dark ? "#cbd5e1" : "#334155"};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
    .amz-quad-link {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: color 0.15s;
    }
    .amz-quad-link:hover {
      color: #f59e0b;
      text-decoration: underline;
    }

    /* ── Coach Ashish Stacks Strip ── */
    .coach-stacks-section {
      max-width: 1440px;
      margin: 0 auto 36px;
      padding: 0 20px;
    }
    .coach-stacks-card {
      background: ${dark ? "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.95))" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(245,158,11,0.3)" : "#fde68a"};
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,${dark ? "0.4" : "0.06"});
    }

    /* ── Deal Rails ── */
    .amz-deal-shelf {
      max-width: 1440px;
      margin: 0 auto 36px;
      padding: 22px;
      background: ${dark ? "rgba(17, 24, 39, 0.95)" : "#ffffff"};
      border-radius: 18px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      box-shadow: 0 4px 20px rgba(0,0,0,${dark ? "0.3" : "0.05"});
    }
    .amz-shelf-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .amz-shelf-title {
      font-size: 20px;
      font-weight: 800;
      font-family: ${FONT.display};
      color: ${dark ? "#ffffff" : "#0f172a"};
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .amz-countdown-badge {
      background: #cc0c39;
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .amz-shelf-rail {
      display: flex;
      gap: 18px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .amz-shelf-rail::-webkit-scrollbar {
      display: none;
    }
    .amz-deal-card {
      flex: 0 0 230px;
      background: ${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"};
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .amz-deal-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,${dark ? "0.4" : "0.1"});
      transform: translateY(-3px);
      border-color: rgba(245,158,11,0.4);
    }
    .amz-deal-img-box {
      width: 100%;
      height: 160px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      margin-bottom: 10px;
    }
    .amz-deal-img-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.25s ease;
    }
    .amz-deal-card:hover .amz-deal-img-box img {
      transform: scale(1.06);
    }

    /* ── Main Catalog Grid ── */
    .amz-catalog-container {
      max-width: 1440px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }
    .amz-filter-bar {
      background: ${dark ? "rgba(17, 24, 39, 0.95)" : "#ffffff"};
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
    }
    .amz-pills-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .amz-pill-btn {
      padding: 8px 16px;
      border-radius: 99px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.15)" : "#d5d9d9"};
      background: ${dark ? "rgba(255,255,255,0.04)" : "#ffffff"};
      color: ${dark ? "#e2e8f0" : "#0f172a"};
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .amz-pill-btn.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-color: #f59e0b;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(245,158,11,0.35);
    }
    .amz-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
      gap: 22px;
    }
    .amz-prod-card {
      background: ${dark ? "rgba(17, 24, 39, 0.95)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      position: relative;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .amz-prod-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 34px rgba(0,0,0,${dark ? "0.55" : "0.12"});
      border-color: rgba(245, 158, 11, 0.5);
    }
    .amz-prod-img-box {
      width: 100%;
      height: 220px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }
    .amz-prod-img-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.25s ease;
    }
    .amz-prod-card:hover .amz-prod-img-box img {
      transform: scale(1.06);
    }
    .amz-prod-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* ── Action Buttons ── */
    .amz-add-cart-btn {
      height: 38px;
      border-radius: 10px;
      border: 1px solid #fcd200;
      background: #ffd814;
      color: #0f1111;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .amz-add-cart-btn:hover {
      background: #f7ca00;
    }
    .amz-buy-now-btn {
      height: 38px;
      border-radius: 10px;
      border: 1px solid #ff8f00;
      background: #ffa41c;
      color: #0f1111;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .amz-buy-now-btn:hover {
      background: #fa8900;
    }
    .amz-chat-share-btn {
      height: 34px;
      border-radius: 8px;
      border: 1px solid ${dark ? "rgba(56, 189, 248, 0.3)" : "#bae6fd"};
      background: ${dark ? "rgba(56, 189, 248, 0.1)" : "#f0f9ff"};
      color: #0284c7;
      font-size: 12px;
      font-weight: 750;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s;
      width: 100%;
      margin-top: 8px;
    }
    .amz-chat-share-btn:hover {
      background: #0284c7;
      color: #ffffff;
    }

    /* ── Footer ── */
    .amz-back-to-top {
      background: ${dark ? "#1e293b" : "#334155"};
      color: #ffffff;
      text-align: center;
      padding: 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .amz-footer-main {
      background: ${dark ? "#0c111c" : "#1e293b"};
      color: #ffffff;
      padding: 40px 60px;
    }
    .amz-footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 40px;
    }

    @media (max-width: 1024px) {
      .amz-quadrant-grid {
        grid-template-columns: 1fr 1fr;
        margin-top: -80px;
      }
      .amz-footer-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .amz-nav-top { padding: 0 12px; }
      .amz-hero-wrapper { height: 280px; }
      .amz-hero-slide { padding: 20px 20px 80px; }
      .amz-quadrant-grid { grid-template-columns: 1fr; margin-top: -30px; }
      .amz-footer-grid { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div className="fitverse-shop-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="amz-nav-top">
        {/* AshFitVerse Store Logo */}
        <div className="amz-logo-box" onClick={() => navigate("/dashboard")}>
          <div className="amz-logo-text">
            <span>AshFitVerse</span>
            <span className="amz-logo-accent">Store</span>
          </div>
          <div className="amz-smile-curve" />
        </div>

        {/* Location Selector */}
        <div
          className="amz-deliver-box"
          onClick={() => {
            const pin = prompt("Enter your Delivery PIN code:", "110001");
            if (pin) alert(`Delivery PIN updated to ${pin}. Showing fast Prime delivery options!`);
          }}
          title="Click to update delivery location"
        >
          <MapPin size={16} color="#f59e0b" style={{ marginTop: 2 }} />
          <div>
            <div className="amz-del-small">Deliver to {user?.displayName?.split(" ")[0] || "Ashish"}</div>
            <div className="amz-del-bold">New Delhi 110001</div>
          </div>
        </div>

        {/* Unified Search Bar */}
        <div className="amz-search-container">
          <div style={{ position: "relative" }}>
            <button
              className="amz-cat-btn"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              type="button"
            >
              <span>{SEARCH_CATEGORIES.find((c) => c.id === searchCategory)?.label || "All"}</span>
              <ChevronDown size={12} />
            </button>
            {showCategoryDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: 42,
                  left: 0,
                  width: 175,
                  background: "#ffffff",
                  borderRadius: "0 0 8px 8px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  zIndex: 200,
                  overflow: "hidden",
                }}
              >
                {SEARCH_CATEGORIES.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSearchCategory(c.id);
                      setCategory(c.id);
                      setShowCategoryDropdown(false);
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: 12.5,
                      fontWeight: searchCategory === c.id ? 800 : 550,
                      color: "#0f172a",
                      cursor: "pointer",
                      background: searchCategory === c.id ? "#fef3c7" : "transparent",
                    }}
                  >
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            className="amz-search-input"
            placeholder="Search verified whey, creatine, gear, multivitamins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="amz-search-btn"
            title="Search store"
            onClick={() => {
              if (searchCategory !== "all") setCategory(searchCategory);
            }}
          >
            <Search size={18} />
          </button>
        </div>

        {/* FitVerse Chat Link */}
        <div
          className="amz-deliver-box"
          onClick={() => navigate("/chat")}
          title="Open FitVerse Direct Messaging & Gym Groups"
        >
          <Send size={16} color="#38bdf8" />
          <div>
            <div className="amz-del-small">FitVerse</div>
            <div className="amz-del-bold">Chat & Buddies</div>
          </div>
        </div>

        {/* Returns & Orders */}
        <div className="amz-deliver-box" onClick={() => navigate("/profile?tab=orders")}>
          <div>
            <div className="amz-del-small">Returns</div>
            <div className="amz-del-bold">& Orders</div>
          </div>
        </div>

        {/* Cart */}
        <div
          className="amz-deliver-box"
          onClick={() => alert(`🛒 You have ${cartCount} items ready for checkout with Prime delivery.`)}
        >
          <ShoppingCart size={22} color="#f59e0b" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>({cartCount})</span>
        </div>

        {/* Admin Add Item */}
        {isAdmin && (
          <button
            onClick={() => setShowAddProductModal(true)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: "#f59e0b",
              border: "none",
              color: "#0f172a",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Admin: Add new product"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            color: "#ffffff",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Toggle Dark / Light mode"
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </header>

      {/* ── Sub-Navigation Ribbon ── */}
      <nav className="amz-nav-sub">
        <div
          className="amz-sub-link"
          style={{ fontWeight: 800 }}
          onClick={() => {
            setCategory("all");
            setGoalFilter("all");
            setSearch("");
          }}
        >
          <Menu size={16} />
          <span>All Products</span>
        </div>
        <div
          className={`amz-sub-link ${category === "all" ? "active" : ""}`}
          onClick={() => setCategory("all")}
        >
          Today's Lightning Deals
        </div>
        <div
          className={`amz-sub-link ${category === "protein" ? "active" : ""}`}
          onClick={() => setCategory("protein")}
        >
          Whey & Protein
        </div>
        <div
          className={`amz-sub-link ${category === "creatine" ? "active" : ""}`}
          onClick={() => setCategory("creatine")}
        >
          Creatine Monohydrate
        </div>
        <div
          className={`amz-sub-link ${category === "preworkout" ? "active" : ""}`}
          onClick={() => setCategory("preworkout")}
        >
          Pre-Workouts
        </div>
        <div
          className={`amz-sub-link ${category === "vitamins" ? "active" : ""}`}
          onClick={() => setCategory("vitamins")}
        >
          Vitamins & Fish Oil
        </div>
        <div
          className={`amz-sub-link ${category === "gear" ? "active" : ""}`}
          onClick={() => setCategory("gear")}
        >
          Gym Gear & Belts
        </div>

        {/* Dedicated store links */}
        <div
          className="amz-sub-link"
          style={{ color: "#38bdf8", fontWeight: 750 }}
          onClick={() => navigate("/shop?dept=male")}
        >
          ⚡ Men's Performance
        </div>
        <div
          className="amz-sub-link"
          style={{ color: "#f472b6", fontWeight: 750 }}
          onClick={() => navigate("/shop?dept=female")}
        >
          🌸 Women's Wellness
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#f59e0b", fontSize: 12, fontWeight: 800 }}>
          <span>✓prime</span>
          <span style={{ color: "#ffffff", fontWeight: 550 }}>Free Next-Day Delivery across India</span>
        </div>
      </nav>

      {/* Added Toast */}
      {addedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#059669",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 750,
          }}
        >
          <Check size={18} />
          <span>{addedToast}</span>
        </div>
      )}

      {/* ── Panoramic Hero Banner ── */}
      <section
        className="amz-hero-wrapper"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={slide.id}
              className="amz-hero-slide"
              style={{
                background: slide.bgGradient,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <div style={{ maxWidth: 650, zIndex: 5 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: slide.accent,
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  {slide.badge}
                </div>
                <h1
                  style={{
                    fontSize: "clamp(24px, 4vw, 36px)",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    fontFamily: FONT.display,
                    margin: "0 0 10px",
                  }}
                >
                  {slide.title}
                </h1>
                <p style={{ fontSize: 16, fontWeight: 700, color: slide.accent, margin: "0 0 8px" }}>
                  {slide.subtitle}
                </p>
                <p style={{ fontSize: 13, color: "#cbd5e1", margin: "0 0 18px", maxWidth: 520, lineHeight: 1.45 }}>
                  {slide.description}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setCategory(slide.targetCategory)}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                    }}
                  >
                    Shop Verified Deals
                  </button>
                  <button
                    onClick={() => navigate(`/shop/product/${slide.featuredProduct.id}`)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    View Product Specs
                  </button>
                </div>
              </div>

              {/* Real packaging image preview floating in hero */}
              <div
                style={{
                  zIndex: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ffffff",
                  padding: 16,
                  borderRadius: 20,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/shop/product/${slide.featuredProduct.id}`)}
                title="Click to view packaging & specs"
              >
                <img
                  src={slide.featuredProduct.image}
                  alt={slide.featuredProduct.name}
                  style={{
                    width: 170,
                    height: 170,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = slide.featuredProduct.localImage || "/products/1.jpg";
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Bottom Fade */}
        <div className="amz-hero-fade" />

        {/* Navigation Chevrons */}
        <button
          className="amz-hero-arrow left"
          onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className="amz-hero-arrow right"
          onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
        >
          <ChevronRight size={28} />
        </button>
      </section>

      {/* ── 4-Quadrant Card Grid (Floating on Hero) ── */}
      <section className="amz-quadrant-grid">
        {quadrantData.map((quad, qIdx) => (
          <div key={qIdx} className="amz-quad-card">
            <div>
              <div className="amz-quad-title">{quad.title}</div>
              <div className="amz-quad-subgrid">
                {quad.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="amz-quad-item"
                    onClick={() => navigate(`/shop/product/${item.id}`)}
                    title={`View ${item.name}`}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="amz-quad-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = item.local || "/products/1.jpg";
                      }}
                    />
                    <div className="amz-quad-lbl">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="amz-quad-link"
              onClick={() => {
                setCategory(quad.categoryTarget);
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{quad.linkText}</span>
              <span>›</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── INNOVATION: Coach Ashish's Signature Athlete Stacks (Curated Bundles) ── */}
      <section className="coach-stacks-section">
        <div className="coach-stacks-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: "rgba(245,158,11,0.18)", color: "#f59e0b", fontSize: 11, fontWeight: 800 }}>
                <Award size={14} />
                <span>COACH ASHISH'S CURATED ATHLETE STACKS</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: FONT.display, marginTop: 4, color: dark ? "#fff" : "#0f172a" }}>
                Smart Fitness Stacks • Save up to ₹850
              </div>
            </div>
            <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b" }}>
              Pre-calculated nutritional synergy for faster gains & explosive performance
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {COACH_STACKS.map((stack) => (
              <div
                key={stack.id}
                style={{
                  borderRadius: 14,
                  padding: 18,
                  background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                  border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "#cc0c39", color: "#fff" }}>
                      {stack.discountBadge}
                    </span>
                    <span style={{ fontSize: 11, color: "#10b981", fontWeight: 800 }}>
                      ⚡ {stack.synergyScore}
                    </span>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 800, color: dark ? "#fff" : "#0f172a", marginBottom: 4 }}>
                    {stack.title}
                  </div>
                  <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
                    {stack.tagline}
                  </div>

                  {/* Stack Items 3-in-a-row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0 16px" }}>
                    {stack.items.map((it, idx) => (
                      <React.Fragment key={it.id}>
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 10,
                            background: "#ffffff",
                            padding: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/shop/product/${it.id}`)}
                          title={`View ${it.name}`}
                        >
                          <img
                            src={it.img}
                            alt=""
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = it.local || "/products/1.jpg";
                            }}
                          />
                        </div>
                        {idx < stack.items.length - 1 && (
                          <span style={{ fontSize: 16, fontWeight: 900, color: "#f59e0b" }}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Stack Pricing & Actions */}
                <div style={{ borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`, paddingTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: dark ? "#fff" : "#0f172a" }}>
                      {stack.bundlePrice}{" "}
                      <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through" }}>
                        {stack.regularPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Prime Next-Day Delivery</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      onClick={() => {
                        setCartCount((prev) => prev + 3);
                        setAddedToast(`Added all 3 items of "${stack.title}" to Cart!`);
                        setTimeout(() => setAddedToast(""), 3500);
                      }}
                      className="amz-add-cart-btn"
                    >
                      <ShoppingCart size={13} />
                      <span>Add Bundle</span>
                    </button>

                    <button
                      onClick={() => {
                        const prefill = `🔥 Coach Ashish's Signature Stack: "${stack.title}"\n💰 Bundle Price: ${stack.bundlePrice} (${stack.discountBadge})\n⚡ Nutritional Synergy: ${stack.synergyScore}\nCheck it out on AshFitVerse Store!`;
                        navigate("/chat", {
                          state: {
                            shareProduct: {
                              id: stack.items[0].id,
                              name: stack.title,
                              price: stack.bundlePrice,
                              brand: "Coach Ashish Curated Stack",
                              image: stack.items[0].img,
                              localImage: stack.items[0].local,
                            },
                            prefillMessage: prefill,
                          },
                        });
                      }}
                      className="amz-buy-now-btn"
                    >
                      <Send size={13} />
                      <span>Share Stack</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Lightning Deals Shelf ── */}
      <section className="amz-deal-shelf">
        <div className="amz-shelf-header">
          <div className="amz-shelf-title">
            <span>Today's Lightning Deals</span>
            <div className="amz-countdown-badge">
              <Clock size={13} />
              <span>
                Ends in {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m{" "}
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="amz-quad-link"
              onClick={() => {
                setCategory("all");
                document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See all deals ›
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => handleScroll(dealsScrollRef, "left")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#ccc"}`,
                  background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  color: dark ? "#fff" : "#000",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handleScroll(dealsScrollRef, "right")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#ccc"}`,
                  background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  color: dark ? "#fff" : "#000",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="amz-shelf-rail" ref={dealsScrollRef}>
          {lightningDeals.map((prod) => (
            <div
              key={prod.id}
              className="amz-deal-card"
              onClick={() => navigate(`/shop/product/${prod.id}`)}
              title={prod.name}
            >
              <div className="amz-deal-img-box">
                <img
                  src={prod.image}
                  alt={prod.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = prod.localImage || "/products/1.jpg";
                  }}
                />
              </div>
              <div style={{ display: "inline-block", background: "#cc0c39", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 3, width: "fit-content", marginBottom: 6 }}>
                {prod.discount || "Up to 35% off"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: dark ? "#ffffff" : "#0f172a" }}>{prod.price}</span>
                <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through" }}>{prod.originalPrice}</span>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: dark ? "#cbd5e1" : "#333",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.3,
                  minHeight: 31,
                }}
              >
                {prod.name}
              </div>
              <div style={{ height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", margin: "8px 0 4px" }}>
                <div style={{ height: "100%", width: `${prod.claimedPercent}%`, background: "#f59e0b" }} />
              </div>
              <div style={{ fontSize: 10.5, color: "#f59e0b", fontWeight: 700 }}>
                {prod.claimedPercent}% claimed
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Catalog Grid with AI Synergy Filter ── */}
      <section className="amz-catalog-container" id="catalog-section">
        {/* Category & Goal Filter Bar */}
        <div className="amz-filter-bar">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {/* Category Pills */}
            <div className="amz-pills-row">
              {[
                { id: "all", label: "All Items", icon: "🛒" },
                { id: "protein", label: "Whey & Protein", icon: "🥤" },
                { id: "creatine", label: "Creatine & Strength", icon: "⚡" },
                { id: "preworkout", label: "Pre-Workout", icon: "🔥" },
                { id: "vitamins", label: "Vitamins & Recovery", icon: "💊" },
                { id: "gear", label: "Gym Equipment", icon: "🏋️" },
              ].map((p) => {
                const active = category === p.id;
                return (
                  <button
                    key={p.id}
                    className={`amz-pill-btn ${active ? "active" : ""}`}
                    onClick={() => setCategory(p.id)}
                  >
                    <span style={{ marginRight: 4 }}>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* INNOVATION: Athlete Goal Synergy Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 6, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase" }}>
                FitVerse Goal Match:
              </span>
              {[
                { id: "all", label: "All Goals" },
                { id: "hypertrophy", label: "🎯 Hypertrophy (Muscle Gain)" },
                { id: "strength", label: "⚡ Pure Strength & PRs" },
                { id: "fatloss", label: "🔥 Fat Loss & Definition" },
                { id: "longevity", label: "🌿 Longevity & Recovery" },
              ].map((g) => {
                const active = goalFilter === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoalFilter(g.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: active ? "1px solid #38bdf8" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                      background: active ? "rgba(56,189,248,0.15)" : "transparent",
                      color: active ? "#38bdf8" : dark ? "#94a3b8" : "#64748b",
                      fontSize: 12,
                      fontWeight: active ? 800 : 550,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b" }}>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#cbd5e1"}`,
                    background: dark ? "rgba(255,255,255,0.05)" : "#ffffff",
                    color: dark ? "#fff" : "#0f172a",
                    fontSize: 12,
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="popular">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Feed */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: dark ? "rgba(17, 24, 39, 0.95)" : "#ffffff",
              borderRadius: 16,
              border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>No matching fitness products found</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Try adjusting your search or selecting "All Goals"
            </div>
          </div>
        ) : (
          <div className="amz-product-grid">
            {filtered.map((p) => {
              const affiliateUrl = buildAmazonAffiliateUrl(p.asin || p.href || p.name);
              const isWished = wishlist.includes(p.id);

              return (
                <div
                  key={p.id}
                  className="amz-prod-card"
                  onClick={() => navigate(`/shop/product/${p.id}`)}
                  title="Click to view genuine reviews, nutrition facts & verified specs"
                >
                  {/* Image Container with Badges */}
                  <div className="amz-prod-img-box">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = p.localImage || "/products/1.jpg";
                      }}
                    />

                    {p.badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: p.badgeColor || "#f59e0b",
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {p.badge}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.9)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      {isWished ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="amz-prod-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase" }}>
                        {p.brand}
                      </span>
                      <span style={{ fontSize: 10.5, color: "#10b981", fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                        <span>🪙 +150 FitCoins</span>
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: dark ? "#ffffff" : "#0f172a",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 36,
                        marginBottom: 6,
                      }}
                    >
                      {p.name}
                    </div>

                    {/* Star Rating & Bought Count */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ display: "flex", color: "#ffa41c", fontSize: 13 }}>
                        {"★".repeat(4)}★
                      </div>
                      <span style={{ fontSize: 12, color: "#0284c7", fontWeight: 800 }}>
                        4.8 ({Number(p.id) * 31 + 420})
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>• 1K+ bought</span>
                    </div>

                    {/* Price Layout */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: "#cc0c39", fontWeight: 800 }}>
                        {p.discount || "-22%"}
                      </span>
                      <span style={{ fontSize: 21, fontWeight: 900, color: dark ? "#ffffff" : "#0f172a" }}>
                        {p.price}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through" }}>
                        M.R.P: {p.originalPrice}
                      </span>
                    </div>

                    {/* Prime badge & delivery estimate */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
                      <span style={{ color: "#007185", fontWeight: 900, fontStyle: "italic", fontSize: 13 }}>✓prime</span>
                      <span style={{ fontSize: 11.5, color: dark ? "#94a3b8" : "#64748b" }}>
                        Fastest delivery <b>Tomorrow, 2 PM</b>
                      </span>
                    </div>

                    {/* Action CTA Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                      <button
                        className="amz-add-cart-btn"
                        onClick={(e) => handleAddToCart(e, p)}
                        title="Add to local Cart"
                      >
                        <ShoppingCart size={13} />
                        <span>Add to Cart</span>
                      </button>

                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="amz-buy-now-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          logUserOrder(user?.uid || "guest", p.id, {
                            name: p.name,
                            price: p.price,
                            brand: p.brand,
                            source: "amazon_affiliate_click",
                          });
                        }}
                        title={`Buy on Amazon with affiliate tag ${affiliateTag}`}
                      >
                        <span>Buy on Amazon</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    {/* INNOVATION: Direct Share to FitVerse Chat (Multi-Recipient) */}
                    <button
                      className="amz-chat-share-btn"
                      onClick={(e) => handleShareProductToChat(e, p)}
                      title="Share with multiple gym buddies on FitVerse Chat"
                    >
                      <Send size={13} />
                      <span>Share with Gym Buddies</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="amz-back-to-top" onClick={scrollToTop}>
          Back to top
        </div>

        <div className="amz-footer-main">
          <div className="amz-footer-grid">
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>About AshFitVerse</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                Athlete Dashboard
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8, cursor: "pointer" }} onClick={() => navigate("/community")}>
                Community Transformations
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8, cursor: "pointer" }} onClick={() => navigate("/chat")}>
                FitVerse Direct Chat
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Connect & Training</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Instagram @AshFitVerse</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Coach Ashish YouTube Hub</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Powerlifting Workout Guides</div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Associate Program</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Official Amazon Associate Store</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Affiliate Tag: {affiliateTag}</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Brand Sponsorships</div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Guarantees & Support</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>100% Labdoor Purity Tested</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Amazon Easy Returns Guarantee</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Anti-Counterfeit Protection</div>
            </div>
          </div>
        </div>

        <div style={{ background: dark ? "#060911" : "#0f172a", textAlign: "center", padding: 22, color: "#94a3b8", fontSize: 12 }}>
          © 2026 AshFitVerse.in • Empowering India's Health, Strength & Athletic Transformation
        </div>
      </footer>

      {/* Admin Add Product Modal */}
      {showAddProductModal && (
        <AddAffiliateProductModal
          onClose={() => setShowAddProductModal(false)}
          defaultShop={deptParam || "common"}
          onProductAdded={(newProd) => {
            setDynamicProducts((prev) => [newProd, ...prev]);
            setShowAddProductModal(false);
          }}
        />
      )}
    </div>
  );
}
