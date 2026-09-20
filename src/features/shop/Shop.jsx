// src/features/shop/Shop.jsx — AshFitVerse Amazon-Style Fitness & Wellness Store
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
  TrendingUp,
  Tag,
  Package,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PANORAMIC AMAZON HERO BANNER SLIDES
// ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "1",
    title: "GREAT INDIAN FITNESS FESTIVAL",
    subtitle: "Up to 55% OFF on 100% Authentic Whey & Plant Protein",
    description: "Labdoor Certified • Direct Brand Import • Free Next-Day Prime Delivery across 500+ Indian cities",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
    accent: "#f59e0b",
    badge: "🔥 PRIME FITNESS DAYS",
    targetCategory: "protein",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "1") || COMMON_PRODUCTS[0],
  },
  {
    id: "4",
    title: "POWER & EXPLOSIVE STRENGTH DAYS",
    subtitle: "Creapure German Creatines & High-Stim Pre-Workouts",
    description: "Accelerate ATP phosphagen recovery and smash PRs with clinically tested performance boosters",
    bgGradient: "linear-gradient(135deg, #18181b 0%, #2e1065 50%, #172554 100%)",
    accent: "#38bdf8",
    badge: "⚡ EXPLOSIVE PERFORMANCE",
    targetCategory: "creatine",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "4") || COMMON_PRODUCTS[3],
  },
  {
    id: "10",
    title: "PRO ATHLETE GYM GEAR & BELTS",
    subtitle: "10mm Leather Lever Belts, Wrist Wraps & Shakers",
    description: "Built for heavy deadlifts, powerlifting squats & intense training • Starting at ₹349",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
    accent: "#10b981",
    badge: "🏆 HEAVY DUTY GEAR",
    targetCategory: "gear",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "10") || COMMON_PRODUCTS[9],
  },
  {
    id: "24",
    title: "DAILY WELLNESS & RECOVERY",
    subtitle: "Triple Strength Omega-3, KSM-66 Ashwagandha & Vitamins",
    description: "Support cardiovascular health, joint cartilage lubrication & daily immune vitality",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #1e293b 100%)",
    accent: "#fb923c",
    badge: "🌿 VITALITY & LONGEVITY",
    targetCategory: "vitamins",
    featuredProduct: COMMON_PRODUCTS.find((p) => p.id === "24") || COMMON_PRODUCTS[4],
  },
];

const SEARCH_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "protein", label: "Whey & Protein" },
  { id: "creatine", label: "Creatine & Power" },
  { id: "preworkout", label: "Pre-Workout" },
  { id: "vitamins", label: "Vitamins & Fish Oil" },
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
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 43 });

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
  }, [allProducts, category, search, sort]);

  // Lightning Deals & Best Sellers subsets
  const lightningDeals = useMemo(() => {
    return allProducts.slice(0, 10).map((p, idx) => ({
      ...p,
      claimedPercent: 55 + ((idx * 7) % 40),
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
    setAddedToast(`Added "${product.name.slice(0, 26)}..." to Cart!`);
    setTimeout(() => setAddedToast(""), 3500);
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
        { name: "ON Gold Whey", img: "/products/1.jpg", id: "1" },
        { name: "MB Biozyme", img: "/products/2.jpg", id: "2" },
        { name: "Dymatize ISO", img: "/products/3.jpg", id: "3" },
        { name: "Avvatar Whey", img: "/products/19.jpg", id: "19" },
      ],
      linkText: "See all Protein offers",
    },
    {
      title: "Explosive Strength | Creatine & Pre-Workouts",
      categoryTarget: "creatine",
      items: [
        { name: "Wellcore Creatine", img: "/products/21.jpg", id: "21" },
        { name: "ON Creatine", img: "/products/4.jpg", id: "4" },
        { name: "Cellucor C4", img: "/products/7.jpg", id: "7" },
        { name: "MB Pre-Workout", img: "/products/8.jpg", id: "8" },
      ],
      linkText: "Explore strength boosters",
    },
    {
      title: "Vitamins, Fish Oil & Daily Recovery",
      categoryTarget: "vitamins",
      items: [
        { name: "TrueBasics Omega", img: "/products/24.jpg", id: "24" },
        { name: "Fast&Up Charge", img: "/products/23.jpg", id: "23" },
        { name: "MB Fish Oil", img: "/products/5.jpg", id: "5" },
        { name: "HK Multivitamin", img: "/products/6.jpg", id: "6" },
      ],
      linkText: "See wellness & recovery",
    },
    {
      title: "Pro Gym Gear, Belts & Accessories",
      categoryTarget: "gear",
      items: [
        { name: "USI Leather Belt", img: "/products/10.jpg", id: "10" },
        { name: "Boldfit Wraps", img: "/products/14.jpg", id: "14" },
        { name: "BlenderBottle", img: "/products/18.jpg", id: "18" },
        { name: "Kobo Dumbbells", img: "/products/12.jpg", id: "12" },
      ],
      linkText: "Shop gym equipment",
    },
  ];

  const currentSlide = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];

  const css = `
    .amazon-shop-root {
      min-height: 100vh;
      background: ${dark ? "#0f172a" : "#eaeded"};
      color: ${dark ? "#f8fafc" : "#0f1111"};
      font-family: ${FONT.body};
      opacity: ${mounted ? 1 : 0};
      transition: opacity 0.4s ease;
      position: relative;
      overflow-x: hidden;
    }

    /* ── Top Amazon Header ── */
    .amz-nav-top {
      background: #131921;
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 16px;
      color: #ffffff;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .amz-logo-box {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: border 0.15s;
    }
    .amz-logo-box:hover {
      border-color: #ffffff;
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
      color: #f99f1b;
      margin-left: 2px;
    }
    .amz-smile-curve {
      height: 3px;
      width: 76px;
      background: #f99f1b;
      border-radius: 99px;
      margin-top: 2px;
      box-shadow: 0 1px 4px rgba(249, 159, 27, 0.4);
    }
    .amz-deliver-box {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: border 0.15s;
    }
    .amz-deliver-box:hover {
      border-color: #ffffff;
    }
    .amz-del-small {
      font-size: 11px;
      color: #cccccc;
      line-height: 1.1;
    }
    .amz-del-bold {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }

    /* ── Amazon Search Bar ── */
    .amz-search-container {
      flex: 1;
      max-width: 820px;
      height: 40px;
      display: flex;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .amz-search-container:focus-within {
      box-shadow: 0 0 0 3px #f99f1b;
    }
    .amz-cat-btn {
      background: #f3f3f3;
      border: none;
      color: #0f1111;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      border-right: 1px solid #ddd;
      white-space: nowrap;
    }
    .amz-cat-btn:hover {
      background: #e6e6e6;
    }
    .amz-search-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0 14px;
      font-size: 14px;
      color: #0f1111;
      background: #ffffff;
    }
    .amz-search-btn {
      width: 45px;
      background: #febd69;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      color: #131921;
    }
    .amz-search-btn:hover {
      background: #f3a847;
    }

    /* ── Right Header Actions ── */
    .amz-header-item {
      padding: 4px 8px;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: border 0.15s;
      white-space: nowrap;
    }
    .amz-header-item:hover {
      border-color: #ffffff;
    }
    .amz-cart-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
    }
    .amz-cart-btn:hover {
      border-color: #ffffff;
    }
    .amz-cart-badge {
      position: absolute;
      top: 2px;
      left: 17px;
      color: #f08804;
      font-weight: 900;
      font-size: 14px;
      font-family: ${FONT.display};
    }

    /* ── Amazon Sub-Navigation Ribbon ── */
    .amz-nav-sub {
      background: #232f3e;
      height: 39px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 18px;
      font-size: 13px;
      font-weight: 550;
      color: #ffffff;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .amz-nav-sub::-webkit-scrollbar {
      display: none;
    }
    .amz-sub-link {
      cursor: pointer;
      white-space: nowrap;
      padding: 6px 8px;
      border: 1px solid transparent;
      border-radius: 3px;
      transition: border 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .amz-sub-link:hover {
      border-color: #ffffff;
    }
    .amz-sub-link.active {
      font-weight: 800;
      color: #f99f1b;
      border-bottom: 2px solid #f99f1b;
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
      height: 220px;
      background: linear-gradient(
        to bottom,
        rgba(234, 237, 237, 0) 0%,
        ${dark ? "rgba(15,23,42,0.6)" : "rgba(234,237,237,0.7)"} 50%,
        ${dark ? "#0f172a" : "#eaeded"} 100%
      );
      pointer-events: none;
      z-index: 10;
    }
    .amz-hero-arrow {
      position: absolute;
      top: 130px;
      width: 44px;
      height: 60px;
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 15;
      color: #0f1111;
      transition: background 0.2s;
    }
    .amz-hero-arrow:hover {
      background: rgba(255,255,255,0.85);
    }
    .amz-hero-arrow.left { left: 16px; }
    .amz-hero-arrow.right { right: 16px; }

    /* ── Iconic 4-Quadrant Card Grid (Floating on Hero) ── */
    .amz-quadrant-grid {
      max-width: 1440px;
      margin: -140px auto 30px;
      padding: 0 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      position: relative;
      z-index: 20;
    }
    .amz-quad-card {
      background: ${dark ? "rgba(30, 41, 59, 0.95)" : "#ffffff"};
      border-radius: 4px;
      padding: 20px 18px 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,${dark ? "0.4" : "0.08"});
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .amz-quad-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,${dark ? "0.6" : "0.14"});
    }
    .amz-quad-title {
      font-size: 18px;
      font-weight: 800;
      color: ${dark ? "#ffffff" : "#0f1111"};
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
      padding: 6px;
      border-radius: 4px;
      background: ${dark ? "rgba(255,255,255,0.03)" : "#f8fafc"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};
      transition: background 0.15s;
    }
    .amz-quad-item:hover {
      background: ${dark ? "rgba(255,255,255,0.08)" : "#edf2f7"};
    }
    .amz-quad-img {
      width: 90px;
      height: 90px;
      object-fit: contain;
      margin-bottom: 6px;
      transition: transform 0.2s;
    }
    .amz-quad-item:hover .amz-quad-img {
      transform: scale(1.06);
    }
    .amz-quad-lbl {
      font-size: 11px;
      font-weight: 600;
      color: ${dark ? "#cbd5e1" : "#334155"};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .amz-quad-link {
      font-size: 13px;
      font-weight: 700;
      color: #007185;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .amz-quad-link:hover {
      color: #c7511f;
      text-decoration: underline;
    }

    /* ── Horizontal Scrolling Deal Rails ── */
    .amz-deal-shelf {
      max-width: 1440px;
      margin: 0 auto 30px;
      padding: 20px;
      background: ${dark ? "rgba(30, 41, 59, 0.95)" : "#ffffff"};
      border-radius: 4px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      box-shadow: 0 2px 10px rgba(0,0,0,${dark ? "0.3" : "0.05"});
    }
    .amz-shelf-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .amz-shelf-title {
      font-size: 20px;
      font-weight: 800;
      font-family: ${FONT.display};
      color: ${dark ? "#ffffff" : "#0f1111"};
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .amz-countdown-badge {
      background: #cc0c39;
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .amz-shelf-rail {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .amz-shelf-rail::-webkit-scrollbar {
      display: none;
    }
    .amz-deal-card {
      flex: 0 0 220px;
      background: ${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"};
      border-radius: 4px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .amz-deal-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,${dark ? "0.4" : "0.1"});
      transform: translateY(-2px);
    }
    .amz-deal-img-box {
      width: 100%;
      height: 160px;
      background: #ffffff;
      border-radius: 4px;
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
      transition: transform 0.2s ease;
    }
    .amz-deal-card:hover .amz-deal-img-box img {
      transform: scale(1.05);
    }
    .amz-deal-badge {
      background: #cc0c39;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 2px;
      display: inline-block;
      margin-bottom: 6px;
      width: fit-content;
    }
    .amz-deal-price {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 4px;
    }
    .amz-deal-curr {
      font-size: 18px;
      font-weight: 800;
      color: ${dark ? "#ffffff" : "#0f1111"};
    }
    .amz-deal-mrp {
      font-size: 12px;
      color: #565959;
      text-decoration: line-through;
    }
    .amz-deal-progress {
      height: 5px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
      margin: 8px 0 4px;
    }
    .amz-deal-progress-bar {
      height: 100%;
      background: #e77600;
      border-radius: 99px;
    }

    /* ── Main Catalog Grid ── */
    .amz-catalog-container {
      max-width: 1440px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }
    .amz-filter-bar {
      background: ${dark ? "rgba(30, 41, 59, 0.95)" : "#ffffff"};
      border-radius: 4px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
    }
    .amz-pills-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .amz-pill-btn {
      padding: 7px 14px;
      border-radius: 20px;
      border: 1px solid ${dark ? "rgba(255,255,255,0.15)" : "#d5d9d9"};
      background: ${dark ? "rgba(255,255,255,0.05)" : "#ffffff"};
      color: ${dark ? "#e2e8f0" : "#0f1111"};
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .amz-pill-btn.active {
      background: #febd69;
      border-color: #f3a847;
      color: #131921;
      font-weight: 800;
    }
    .amz-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .amz-prod-card {
      background: ${dark ? "rgba(30, 41, 59, 0.95)" : "#ffffff"};
      border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"};
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .amz-prod-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0,0,0,${dark ? "0.5" : "0.12"});
      border-color: #febd69;
    }
    .amz-prod-img-box {
      width: 100%;
      height: 230px;
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
    .amz-prime-badge {
      color: #007185;
      font-weight: 900;
      font-style: italic;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }
    .amz-prime-check {
      background: #e77600;
      color: #ffffff;
      font-size: 10px;
      font-style: normal;
      padding: 1px 4px;
      border-radius: 2px;
      font-weight: 800;
    }
    .amz-add-cart-btn {
      height: 38px;
      border-radius: 20px;
      border: 1px solid #fcd200;
      background: #ffd814;
      color: #0f1111;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .amz-add-cart-btn:hover {
      background: #f7ca00;
      border-color: #f2c200;
    }
    .amz-buy-now-btn {
      height: 38px;
      border-radius: 20px;
      border: 1px solid #ff8f00;
      background: #ffa41c;
      color: #0f1111;
      font-size: 13px;
      font-weight: 700;
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

    /* ── Amazon Footer ── */
    .amz-back-to-top {
      background: #37475a;
      color: #ffffff;
      text-align: center;
      padding: 15px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .amz-back-to-top:hover {
      background: #485769;
    }
    .amz-footer-main {
      background: #232f3e;
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
    .amz-footer-col-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .amz-footer-link {
      font-size: 13px;
      color: #ddd;
      margin-bottom: 8px;
      cursor: pointer;
      transition: color 0.15s;
    }
    .amz-footer-link:hover {
      text-decoration: underline;
      color: #ffffff;
    }
    .amz-footer-sub {
      background: #131921;
      text-align: center;
      padding: 24px;
      color: #999999;
      font-size: 12px;
    }

    /* Responsive */
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
      .amz-nav-top {
        padding: 0 10px;
        gap: 10px;
      }
      .amz-deliver-box, .amz-lang-pill {
        display: none;
      }
      .amz-hero-wrapper {
        height: 280px;
      }
      .amz-hero-slide {
        padding: 20px 20px 80px;
      }
      .amz-quadrant-grid {
        grid-template-columns: 1fr;
        margin-top: -30px;
      }
      .amz-footer-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <div className="amazon-shop-root">
      <style>{css}</style>

      {/* ── Amazon Navigation Header ── */}
      <header className="amz-nav-top">
        {/* Brand Logo with Amazon Smile Arrow */}
        <div className="amz-logo-box" onClick={() => navigate("/dashboard")}>
          <div className="amz-logo-text">
            <span>AshFitVerse</span>
            <span className="amz-logo-accent">.in</span>
          </div>
          <div className="amz-smile-curve" />
        </div>

        {/* Location Selector */}
        <div
          className="amz-deliver-box"
          onClick={() => {
            const pin = prompt("Enter your Delivery PIN code:", "110001");
            if (pin) alert(`Delivery PIN updated to ${pin}. Showing Amazon Prime fast delivery options!`);
          }}
          title="Click to change delivery pincode"
        >
          <MapPin size={16} color="#ffffff" style={{ marginTop: 4 }} />
          <div>
            <div className="amz-del-small">Deliver to {user?.displayName?.split(" ")[0] || "Ashish"}</div>
            <div className="amz-del-bold">New Delhi 110001</div>
          </div>
        </div>

        {/* 3-Part Amazon Search Bar */}
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
                  top: 40,
                  left: 0,
                  width: 170,
                  background: "#ffffff",
                  borderRadius: "0 0 6px 6px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
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
                      padding: "8px 12px",
                      fontSize: 12.5,
                      fontWeight: searchCategory === c.id ? 800 : 500,
                      color: "#131921",
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
            placeholder="Search AshFitVerse or Amazon for sports nutrition, gym equipment & supplements"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="amz-search-btn"
            title="Search products"
            onClick={() => {
              if (searchCategory !== "all") setCategory(searchCategory);
            }}
          >
            <Search size={18} />
          </button>
        </div>

        {/* Language Badge */}
        <div className="amz-header-item amz-lang-pill" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 14 }}>🇮🇳</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>EN ▾</span>
        </div>

        {/* Account & Lists */}
        <div className="amz-header-item" onClick={() => navigate("/profile")}>
          <div className="amz-del-small">Hello, {user?.displayName?.split(" ")[0] || "Sign in"}</div>
          <div className="amz-del-bold">Account & Lists ▾</div>
        </div>

        {/* Returns & Orders */}
        <div className="amz-header-item" onClick={() => navigate("/profile?tab=orders")}>
          <div className="amz-del-small">Returns</div>
          <div className="amz-del-bold">& Orders</div>
        </div>

        {/* Cart */}
        <div
          className="amz-cart-btn"
          onClick={() => {
            alert(`🛒 You have ${cartCount} items ready for checkout with your Amazon Affiliate Prime delivery.`);
          }}
        >
          <ShoppingCart size={28} color="#ffffff" />
          <span className="amz-cart-badge">{cartCount}</span>
          <span style={{ fontSize: 14, fontWeight: 800, marginTop: 8 }}>Cart</span>
        </div>

        {/* Admin Add Item */}
        {isAdmin && (
          <button
            onClick={() => setShowAddProductModal(true)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              background: "#febd69",
              border: "1px solid #f3a847",
              color: "#131921",
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
            borderRadius: 4,
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

      {/* ── Amazon Sub-Navigation Ribbon ── */}
      <nav className="amz-nav-sub">
        <div
          className="amz-sub-link"
          style={{ fontWeight: 800 }}
          onClick={() => {
            setCategory("all");
            setSearch("");
          }}
        >
          <Menu size={16} />
          <span>All</span>
        </div>
        <div
          className={`amz-sub-link ${category === "all" ? "active" : ""}`}
          onClick={() => setCategory("all")}
        >
          Today's Deals
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
          Creatine & Strength
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
          style={{ color: "#38bdf8", fontWeight: 700 }}
          onClick={() => navigate("/shop?dept=male")}
        >
          ⚡ Men's Performance
        </div>
        <div
          className="amz-sub-link"
          style={{ color: "#f472b6", fontWeight: 700 }}
          onClick={() => navigate("/shop?dept=female")}
        >
          🌸 Women's Wellness
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#f99f1b", fontSize: 12, fontWeight: 800 }}>
          <span>✓prime</span>
          <span style={{ color: "#ffffff", fontWeight: 500 }}>Join Prime for Free Next-Day Delivery</span>
        </div>
      </nav>

      {/* Added Toast Notification */}
      {addedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#065f46",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <Check size={18} />
          <span>{addedToast}</span>
        </div>
      )}

      {/* ── Panoramic Amazon Hero Banner Slider ── */}
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
              <div style={{ maxWidth: 640, zIndex: 5 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: slide.accent,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
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
                <p style={{ fontSize: 13, color: "#cbd5e1", margin: "0 0 18px", maxWidth: 520, lineHeight: 1.4 }}>
                  {slide.description}
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setCategory(slide.targetCategory)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: 20,
                      background: "#febd69",
                      border: "1px solid #f3a847",
                      color: "#131921",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Shop Deals Now
                  </button>
                  <button
                    onClick={() => navigate(`/shop/product/${slide.featuredProduct.id}`)}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    View Featured Product
                  </button>
                </div>
              </div>

              {/* Featured packaging preview floating in hero */}
              <div
                style={{
                  zIndex: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.95)",
                  padding: 16,
                  borderRadius: 16,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/shop/product/${slide.featuredProduct.id}`)}
                title="Click to view full packaging specs"
              >
                <img
                  src={slide.featuredProduct.image}
                  alt={slide.featuredProduct.name}
                  style={{
                    width: 170,
                    height: 170,
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Bottom Fade that blends hero smoothly into cards */}
        <div className="amz-hero-fade" />

        {/* Chevrons */}
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

      {/* ── The Iconic Amazon 4-Quadrant Card Grid (Floating on Hero) ── */}
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
                        e.currentTarget.src = "/products/1.jpg";
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
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{quad.linkText}</span>
              <span>›</span>
            </div>
          </div>
        ))}
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
                  width: 32,
                  height: 32,
                  borderRadius: 4,
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
                  width: 32,
                  height: 32,
                  borderRadius: 4,
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
                    e.currentTarget.src = "/products/1.jpg";
                  }}
                />
              </div>
              <div className="amz-deal-badge">{prod.discount || "Up to 35% off"}</div>
              <div className="amz-deal-price">
                <span className="amz-deal-curr">{prod.price}</span>
                <span className="amz-deal-mrp">{prod.originalPrice}</span>
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
              <div className="amz-deal-progress">
                <div
                  className="amz-deal-progress-bar"
                  style={{ width: `${prod.claimedPercent}%` }}
                />
              </div>
              <div style={{ fontSize: 10.5, color: "#e77600", fontWeight: 700 }}>
                {prod.claimedPercent}% claimed
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Best Sellers Shelf ── */}
      <section className="amz-deal-shelf">
        <div className="amz-shelf-header">
          <div className="amz-shelf-title">
            <span>Best Sellers in Sports, Nutrition & Fitness</span>
            <span
              style={{
                fontSize: 12,
                color: "#e77600",
                fontWeight: 800,
                background: "rgba(231,118,0,0.12)",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              #1 Ranked
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => handleScroll(bestSellersScrollRef, "left")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
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
              onClick={() => handleScroll(bestSellersScrollRef, "right")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
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

        <div className="amz-shelf-rail" ref={bestSellersScrollRef}>
          {bestSellers.map((prod, index) => (
            <div
              key={prod.id}
              className="amz-deal-card"
              onClick={() => navigate(`/shop/product/${prod.id}`)}
              title={prod.name}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background: "#e77600",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "2px 7px",
                  borderRadius: 2,
                  zIndex: 2,
                }}
              >
                #{index + 1} Best Seller
              </div>
              <div className="amz-deal-img-box">
                <img
                  src={prod.image}
                  alt={prod.name}
                  onError={(e) => {
                    e.currentTarget.src = "/products/1.jpg";
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#007185", fontWeight: 700, marginBottom: 2 }}>
                {prod.brand}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: dark ? "#ffffff" : "#0f1111",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.3,
                  minHeight: 32,
                  marginBottom: 6,
                }}
              >
                {prod.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <div style={{ display: "flex", color: "#ffa41c", fontSize: 11 }}>
                  {"★".repeat(4)}★
                </div>
                <span style={{ fontSize: 11, color: "#007185", fontWeight: 600 }}>1,840</span>
              </div>
              <div className="amz-deal-price">
                <span className="amz-deal-curr">{prod.price}</span>
                <span className="amz-deal-mrp">{prod.originalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Catalog Grid ── */}
      <section className="amz-catalog-container" id="catalog-section">
        {/* Filter & Sort Bar */}
        <div className="amz-filter-bar">
          <div className="amz-pills-row">
            {[
              { id: "all", label: "All Items", icon: "🛒" },
              { id: "protein", label: "Whey & Protein", icon: "🥤" },
              { id: "creatine", label: "Creatine & Strength", icon: "⚡" },
              { id: "preworkout", label: "Pre-Workout", icon: "🔥" },
              { id: "vitamins", label: "Vitamins & Omegas", icon: "💊" },
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: dark ? "#94a3b8" : "#565959" }}>Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#d5d9d9"}`,
                background: dark ? "rgba(255,255,255,0.05)" : "#f0f2f2",
                color: dark ? "#fff" : "#0f1111",
                fontSize: 12.5,
                fontWeight: 600,
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

        {/* Product Cards Feed */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: dark ? "rgba(30, 41, 59, 0.95)" : "#ffffff",
              borderRadius: 8,
              border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>No matching fitness products found</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              Try searching with another keyword or select "All Items"
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
                        e.currentTarget.src = "/products/1.jpg";
                      }}
                    />

                    {p.badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          padding: "3px 8px",
                          borderRadius: 3,
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
                        background: "rgba(255,255,255,0.85)",
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#e77600", textTransform: "uppercase", marginBottom: 2 }}>
                      {p.brand}
                    </div>

                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: dark ? "#ffffff" : "#0f1111",
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
                      <span style={{ fontSize: 12, color: "#007185", fontWeight: 700 }}>
                        4.8 ({Number(p.id) * 31 + 420})
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: "#565959", marginBottom: 6 }}>
                      1K+ bought in past month
                    </div>

                    {/* Amazon Price Layout */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: "#cc0c39", fontWeight: 800 }}>
                        {p.discount || "-22%"}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 900, color: dark ? "#ffffff" : "#0f1111" }}>
                        {p.price}
                      </span>
                      <span style={{ fontSize: 12, color: "#565959", textDecoration: "line-through" }}>
                        M.R.P: {p.originalPrice}
                      </span>
                    </div>

                    {/* Prime badge & delivery estimate */}
                    <div className="amz-prime-badge">
                      <span className="amz-prime-check">✓</span>
                      <span>prime</span>
                      <span style={{ fontSize: 12, color: dark ? "#94a3b8" : "#565959", fontStyle: "normal", fontWeight: 500, marginLeft: 4 }}>
                        Get it by <b>Tomorrow, 2 PM</b>
                      </span>
                    </div>

                    <div style={{ fontSize: 11.5, color: "#007600", fontWeight: 700, marginBottom: 12 }}>
                      In stock • 100% Authentic Guaranteed
                    </div>

                    {/* Action CTA Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                      <button
                        className="amz-add-cart-btn"
                        onClick={(e) => handleAddToCart(e, p)}
                        title="Add to local Cart"
                      >
                        <ShoppingCart size={14} />
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
                        <span>Buy Now</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Amazon Footer ── */}
      <footer>
        <div className="amz-back-to-top" onClick={scrollToTop}>
          Back to top
        </div>

        <div className="amz-footer-main">
          <div className="amz-footer-grid">
            <div>
              <div className="amz-footer-col-title">Get to Know Us</div>
              <div className="amz-footer-link" onClick={() => navigate("/dashboard")}>About AshFitVerse</div>
              <div className="amz-footer-link">Careers & Fitness Coaches</div>
              <div className="amz-footer-link">Scientific Supplement Reviews</div>
              <div className="amz-footer-link">Community Transformation Hub</div>
            </div>

            <div>
              <div className="amz-footer-col-title">Connect with Us</div>
              <div className="amz-footer-link">Instagram @AshFitVerse</div>
              <div className="amz-footer-link">YouTube Training Guides</div>
              <div className="amz-footer-link">Twitter / X Updates</div>
              <div className="amz-footer-link">Discord Community Voice</div>
            </div>

            <div>
              <div className="amz-footer-col-title">Make Money with Us</div>
              <div className="amz-footer-link">AshFitVerse Associate Program</div>
              <div className="amz-footer-link">Sell your Fitness Brand</div>
              <div className="amz-footer-link">Brand Sponsorships & Ads</div>
              <div className="amz-footer-link">Affiliate ID: {affiliateTag}</div>
            </div>

            <div>
              <div className="amz-footer-col-title">Let Us Help You</div>
              <div className="amz-footer-link" onClick={() => navigate("/profile?tab=orders")}>Your Account & Orders</div>
              <div className="amz-footer-link">100% Purchase Protection</div>
              <div className="amz-footer-link">Amazon Easy Return Centre</div>
              <div className="amz-footer-link">Help & Fitness Support</div>
            </div>
          </div>
        </div>

        <div className="amz-footer-sub">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <span style={{ fontWeight: 900, color: "#fff", fontSize: 15 }}>AshFitVerse.in</span>
            <span>•</span>
            <span>English</span>
            <span>•</span>
            <span>India</span>
          </div>
          <div>
            © 2026 AshFitVerse.com, Inc. or its affiliates • Empowering India's Health & Strength Transformation
          </div>
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
