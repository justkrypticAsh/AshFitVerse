// src/features/shop/FemaleShop.jsx — Women's Wellness, PCOS & Hormonal Health Shop
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { buildAmazonAffiliateUrl, getAffiliateTag } from "../../config/affiliateConfig";
import ProductReviewsModal from "../../components/ProductReviewsModal";
import AddAffiliateProductModal from "../../components/AddAffiliateProductModal";
import ShopHeroAdBanner from "../../components/ShopHeroAdBanner";
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CURATED MASTER FEMALE WELLNESS & HORMONAL HEALTH PRODUCTS
// ─────────────────────────────────────────────────────────────
const BASE_FEMALE_PRODUCTS = [
  // ── PCOS & HORMONAL BALANCE ──
  {
    id: 201,
    category: "pcos",
    name: "Wholesome Story Myo & D-Chiro Inositol 40:1 Ratio (120 Veg Capsules)",
    brand: "Wholesome Story",
    asin: "B07TXLSG51",
    rating: 4.8,
    reviews: 26000,
    price: "₹2,199",
    originalPrice: "₹2,999",
    discount: "27% OFF",
    image: "https://m.media-amazon.com/images/I/71a1e1d1zRL._SL1500_.jpg",
    tags: ["40:1 Ratio", "PCOS Ovulation", "Insulin Sensitivity", "Clean Formula"],
    description: "Gold-standard 40:1 Myo to D-Chiro Inositol ratio. Restores regular ovulatory cycles, improves oocyte egg quality, and stabilizes insulin spikes.",
    badge: "#1 PCOS Choice",
    badgeColor: "#ec4899",
  },
  {
    id: 202,
    category: "pcos",
    name: "Vahdam 100% Pure Organic Spearmint Tea Leaves (100g Pouch)",
    brand: "Vahdam",
    asin: "B07G4T1Z2K",
    rating: 4.7,
    reviews: 14200,
    price: "₹449",
    originalPrice: "₹650",
    discount: "31% OFF",
    image: "https://m.media-amazon.com/images/I/71b1e1d1zSL._SL1500_.jpg",
    tags: ["Anti-Androgen", "Reduces Facial Hair", "Hormonal Acne", "Caffeine Free"],
    description: "Clinically shown to decrease free testosterone in women with PCOS. Reduces androgenic hirsutism, facial stubble, and hormonal chin breakouts.",
    badge: "Anti-Androgen",
    badgeColor: "#10b981",
  },
  {
    id: 203,
    category: "pcos",
    name: "Thorne Research Berberine 500mg Plant Alkaloid (60 Veg Capsules)",
    brand: "Thorne",
    asin: "B0032ZZV2K",
    rating: 4.8,
    reviews: 11000,
    price: "₹2,499",
    originalPrice: "₹3,299",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61c1e1d1zTL._SL1500_.jpg",
    tags: ["Metabolic Health", "Insulin Resistance", "Weight Control", "Clinically Proven"],
    description: "Natural botanical equivalent to metformin in randomized clinical trials. Activates AMPK enzymes to manage blood glucose and metabolic weight gain.",
    badge: "Clinical Grade",
    badgeColor: "#8b5cf6",
  },
  {
    id: 204,
    category: "pcos",
    name: "Himalaya Organic Shatavari Female Uterine Tonic (60 Tablets)",
    brand: "Himalaya",
    asin: "B00063HCVW",
    rating: 4.6,
    reviews: 18500,
    price: "₹349",
    originalPrice: "₹499",
    discount: "30% OFF",
    image: "https://m.media-amazon.com/images/I/61d1e1d1zUL._SL1000_.jpg",
    tags: ["Ayurvedic Adaptogen", "Estrogen Balance", "Uterine Health", "Vitality"],
    description: "Revered Ayurvedic adaptogen for female hormonal rhythm. Nourishes reproductive tissues and alleviates severe mood swings and PMS irritability.",
    badge: "Herbal Choice",
    badgeColor: "#10b981",
  },

  // ── PERIOD CARE & CYCLE HEALTH ──
  {
    id: 205,
    category: "period",
    name: "Sirona FDA-Approved Medical Grade Silicone Menstrual Cup (Medium)",
    brand: "Sirona",
    asin: "B0797MGN3D",
    rating: 4.8,
    reviews: 48000,
    price: "₹399",
    originalPrice: "₹699",
    discount: "43% OFF",
    image: "https://m.media-amazon.com/images/I/61g1e1d1zXL._SL1100_.jpg",
    tags: ["100% Medical Silicone", "12-Hour Leakproof", "Eco-Friendly", "10-Year Life"],
    description: "Ultra-soft medical grade silicone. Provides up to 12 hours of leak-free freedom during heavy workouts, swimming, and sleep without odor.",
    badge: "#1 Menstrual Cup",
    badgeColor: "#ec4899",
  },
  {
    id: 206,
    category: "period",
    name: "Carmesi 100% Certified Organic Cotton Rash-Free Sanitary Pads (30 Pack)",
    brand: "Carmesi",
    asin: "B07R4R8V61",
    rating: 4.7,
    reviews: 22000,
    price: "₹349",
    originalPrice: "₹499",
    discount: "30% OFF",
    image: "https://m.media-amazon.com/images/I/61h1e1d1zYL._SL1100_.jpg",
    tags: ["Pure Organic Cotton", "Zero Synthetics", "Rash-Free", "Biodegradable"],
    description: "Feather-soft organic cotton surface with plant-based waterproof backing. Zero chlorine, dyes, or harsh synthetics for sensitive skin.",
    badge: "100% Organic",
    badgeColor: "#10b981",
  },
  {
    id: 207,
    category: "period",
    name: "Nua Period Cramp Relief Self-Heating Heat Patches (Pack of 5)",
    brand: "Nua",
    asin: "B08R3Q7P1D",
    rating: 4.6,
    reviews: 16500,
    price: "₹299",
    originalPrice: "₹449",
    discount: "33% OFF",
    image: "https://m.media-amazon.com/images/I/61i1e1d1zZL._SL1100_.jpg",
    tags: ["8-Hour Continuous Heat", "Drug Free", "Soothes Cramps", "Discreet"],
    description: "Air-activated warming patches that adhere comfortably to underwear. Delivers 8 hours of soothing, targeted heat to relax pelvic muscles.",
    badge: "Cramp Relief",
    badgeColor: "#f59e0b",
  },
  {
    id: 208,
    category: "period",
    name: "Doctor's Best Pure Magnesium Glycinate 400mg (240 Tablets)",
    brand: "Doctor's Best",
    asin: "B000BD0RT0",
    rating: 4.8,
    reviews: 36000,
    price: "₹2,199",
    originalPrice: "₹2,899",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/61f1e1d1zWL._SL1500_.jpg",
    tags: ["PMS Muscle Spasms", "Deep Sleep", "Reduces Bloating", "Gentle on Stomach"],
    description: "Reduces prostaglandin-mediated uterine spasms that cause severe menstrual cramps. Calms nervous system anxiety and alleviates PMS insomnia.",
    badge: "Doctor's Pick",
    badgeColor: "#8b5cf6",
  },

  // ── SKIN, HAIR & COLLAGEN ──
  {
    id: 209,
    category: "skin",
    name: "Wellbeing Nutrition Pure Wild Korean Marine Collagen Peptides Powder (200g Jar)",
    brand: "Wellbeing Nutrition",
    asin: "B0892D5Z19",
    rating: 4.8,
    reviews: 14800,
    price: "₹1,899",
    originalPrice: "₹2,499",
    discount: "24% OFF",
    image: "https://m.media-amazon.com/images/I/71j1e1d1z0L._SL1500_.jpg",
    tags: ["Type I & III Collagen", "Skin Hydration", "Hair Thickness", "Joint Cartilage"],
    description: "Hydrolyzed low-molecular marine peptides with 1.5x higher bioavailability than bovine collagen. Restores skin elasticity and strengthens thinning hair.",
    badge: "Beauty Collagen",
    badgeColor: "#ec4899",
  },
  {
    id: 210,
    category: "skin",
    name: "Nature's Way Vitex Chasteberry Fruit 400mg (100 Veg Capsules)",
    brand: "Nature's Way",
    asin: "B00028OUZ4",
    rating: 4.7,
    reviews: 19500,
    price: "₹1,299",
    originalPrice: "₹1,799",
    discount: "28% OFF",
    image: "https://m.media-amazon.com/images/I/71e1e1d1zVL._SL1500_.jpg",
    tags: ["Progesterone Support", "Clears Hormonal Acne", "Reduces Mastalgia", "Cycle Syncing"],
    description: "Modulates pituitary dopamine receptors to normalize luteal phase defect, boost progesterone, and eliminate cystic jawline acne.",
    badge: "Hormone Sync",
    badgeColor: "#8b5cf6",
  },

  // ── SEXUAL WELLNESS & INTIMATE CARE ──
  {
    id: 211,
    category: "intimate",
    name: "MyMuse Glide 100% Natural Organic Aloe Vera Intimate Lubricant (100ml)",
    brand: "MyMuse",
    asin: "B09WDPCS8K",
    rating: 4.8,
    reviews: 11500,
    price: "₹499",
    originalPrice: "₹699",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/61l1e1d1z2L._SL1000_.jpg",
    tags: ["Organic Aloe Vera", "Glycerin Free", "pH 3.8 - 4.2", "Condom Compatible"],
    description: "Enriched with real organic aloe vera. Paraben-free, non-staining, and matches natural vaginal pH to eliminate intimate dryness and irritation.",
    badge: "Organic Lube",
    badgeColor: "#ec4899",
  },
  {
    id: 212,
    category: "intimate",
    name: "Sirona Natural Daily Intimate Wash with Tea Tree & Olive Oil (200ml)",
    brand: "Sirona",
    asin: "B0797MVQ5P",
    rating: 4.7,
    reviews: 28000,
    price: "₹299",
    originalPrice: "₹399",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/61n1e1d1z4L._SL1100_.jpg",
    tags: ["Maintains pH 3.5", "Tea Tree Anti-Fungal", "No Sulphates", "Odor Prevention"],
    description: "Maintains delicate acid mantle balance. Dermatologically tested to protect against fungal infections, itching, and post-workout odor.",
    badge: "pH 3.5 Balanced",
    badgeColor: "#06b6d4",
  },

  // ── SUPPLEMENTS & FITNESS GEAR ──
  {
    id: 213,
    category: "vitamins",
    name: "Carbamide Forte Chelated Iron with Folic Acid, Zinc & Vitamin C (100 Tablets)",
    brand: "Carbamide Forte",
    asin: "B07X9Q8P3Z",
    rating: 4.6,
    reviews: 17200,
    price: "₹499",
    originalPrice: "₹699",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/61k1e1d1z1L._SL1100_.jpg",
    tags: ["Gentle Bisglycinate", "No Constipation", "Boosts Hemoglobin", "Folic Acid"],
    description: "Non-constipating chelated iron bisglycinate with added Vitamin C for maximum bioavailability. Restores ferritin levels drained by heavy menstrual cycles.",
    badge: "Iron Boost",
    badgeColor: "#ef4444",
  },
  {
    id: 214,
    category: "gear",
    name: "Boldfit Fabric Booty Resistance Hip Bands for Glute Activation (Set of 3)",
    brand: "Boldfit",
    asin: "B0892D5Z20",
    rating: 4.8,
    reviews: 31000,
    price: "₹599",
    originalPrice: "₹1,299",
    discount: "54% OFF",
    image: "https://m.media-amazon.com/images/I/71m1e1d1z3L._SL1500_.jpg",
    tags: ["Non-Slip Fabric", "No Pinching", "Glute Hypertrophy", "3 Resistance Levels"],
    description: "Premium cotton-elastic blend with inner non-slip grip strips. Never rolls or snaps during hip thrusts, squats, and Romanian deadlifts.",
    badge: "#1 Glute Band",
    badgeColor: "#ec4899",
  },
  {
    id: 215,
    category: "pcos",
    name: "Oziva Plant-Based HerBalance for PCOS/PCOD with Shatavari & Chasteberry (250g)",
    brand: "Oziva",
    asin: "B07Y7H789Z",
    rating: 4.6,
    reviews: 19400,
    price: "₹899",
    originalPrice: "₹1,199",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/71s1e1d1z6L._SL1500_.jpg",
    tags: ["8 Clean Herbs", "Inositol Support", "Period Regularity", "Acne & Weight Support"],
    description: "Clinically vetted Ayurvedic herbs combined with whole-food nutrients to balance LH/FSH ratio, regulate ovulation, and soothe androgenic symptoms.",
    badge: "PCOS Hero",
    badgeColor: "#ec4899",
  },
  {
    id: 216,
    category: "skin",
    name: "Wellbeing Nutrition Marine Collagen Peptides Types 1 & 3 (200g Mango Peach)",
    brand: "Wellbeing Nutrition",
    asin: "B08YRP9W9R",
    rating: 4.8,
    reviews: 14200,
    price: "₹1,999",
    originalPrice: "₹2,699",
    discount: "26% OFF",
    image: "https://m.media-amazon.com/images/I/71r1e1d1z7L._SL1500_.jpg",
    tags: ["Deep Sea Korean Collagen", "Hyaluronic Acid", "Skin Firmness", "Nail & Hair Health"],
    description: "Hydrolyzed low-molecular weight peptides for rapid cellular absorption. Rebuilds dermis extracellular matrix for plump skin and reduced fine lines.",
    badge: "Glow Elixir",
    badgeColor: "#f59e0b",
  },
  {
    id: 217,
    category: "intimate",
    name: "Pee Safe Natural Intimate Wash for Women with Tea Tree Oil & Witch Hazel (105ml)",
    brand: "Pee Safe",
    asin: "B075C51997",
    rating: 4.6,
    reviews: 26500,
    price: "₹249",
    originalPrice: "₹399",
    discount: "38% OFF",
    image: "https://m.media-amazon.com/images/I/61q1e1d1z8L._SL1000_.jpg",
    tags: ["pH 3.5 Balanced", "Tea Tree Antimicrobial", "Paraben Free", "Gynecologist Approved"],
    description: "Maintains optimal vaginal acidic pH 3.5, guarding against recurrent candidiasis, odor, and bacterial vaginosis without disrupting normal flora.",
    badge: "Daily Intimate",
    badgeColor: "#06b6d4",
  },
  {
    id: 218,
    category: "pcos",
    name: "Teacurry 100% Organic Spearmint Tea for Facial Hair & Hormonal Balance (30 Bags)",
    brand: "Teacurry",
    asin: "B08L7V894G",
    rating: 4.6,
    reviews: 12800,
    price: "₹399",
    originalPrice: "₹599",
    discount: "33% OFF",
    image: "https://m.media-amazon.com/images/I/71p1e1d1z9L._SL1500_.jpg",
    tags: ["Spearmint Leaves", "Anti-Androgenic", "Hirsutism Support", "Zero Caffeine"],
    description: "Traditional herbal remedy showing proven anti-androgenic effects in multiple randomized trials. Curbs excessive DHT-driven facial hair growth.",
    badge: "Anti-Hirsutism",
    badgeColor: "#10b981",
  },
  {
    id: 219,
    category: "skin",
    name: "Plum 15% Vitamin C Face Serum with Mandarin & Kakadu Plum (30ml)",
    brand: "Plum",
    asin: "B093DFH4P3",
    rating: 4.6,
    reviews: 38000,
    price: "₹649",
    originalPrice: "₹899",
    discount: "28% OFF",
    image: "https://m.media-amazon.com/images/I/61o1e1d1z0M._SL1200_.jpg",
    tags: ["15% Ethyl Ascorbic Acid", "Fades Dark Spots", "Kakadu Plum", "Fragrance Free"],
    description: "Potent stable antioxidant serum that lightens post-inflammatory hyperpigmentation (PIH) and sun damage while boosting natural collagen synthesis.",
    badge: "Radiance Serum",
    badgeColor: "#f59e0b",
  },
  {
    id: 220,
    category: "pcos",
    name: "Gynoveda MyPCOS Ayurvedic Tablets for Delayed & Irregular Periods (120 Tablets)",
    brand: "Gynoveda",
    asin: "B08NDL2T78",
    rating: 4.7,
    reviews: 18900,
    price: "₹1,499",
    originalPrice: "₹2,200",
    discount: "32% OFF",
    image: "https://m.media-amazon.com/images/I/71n1e1d1z1M._SL1500_.jpg",
    tags: ["Kanchnar Guggulu", "Shatapushpa", "Dissolves Ovarian Cysts", "100% Ayurvedic"],
    description: "Formulated by Ayurvedic gynecologists to regulate ovulatory cycles naturally, detoxify uterine tissue, and restore predictable 28-day cycles.",
    badge: "Gynecologist Choice",
    badgeColor: "#8b5cf6",
  },
  {
    id: 221,
    category: "skin",
    name: "Bodywise 2.5% Glutathione Effervescent Tablets with Vitamin C (30 Tablets)",
    brand: "Bodywise",
    asin: "B09BNR6W2X",
    rating: 4.5,
    reviews: 15600,
    price: "₹999",
    originalPrice: "₹1,499",
    discount: "33% OFF",
    image: "https://m.media-amazon.com/images/I/71m1e1d1z2M._SL1500_.jpg",
    tags: ["500mg L-Glutathione", "Melanin Inhibitor", "Fizzy Orange Flavor", "Even Skin Tone"],
    description: "Master intracellular antioxidant that shifts melanin production from dark eumelanin to light pheomelanin, clearing stubborn tanning and melasma.",
    badge: "Skin Brightener",
    badgeColor: "#ec4899",
  },
  {
    id: 222,
    category: "period",
    name: "SOFY AntiBacteria Extra Long Sanitary Pads with Deep Absorbent Core (Pack of 30)",
    brand: "SOFY",
    asin: "B07D3S4X9J",
    rating: 4.7,
    reviews: 41000,
    price: "₹399",
    originalPrice: "₹499",
    discount: "20% OFF",
    image: "https://m.media-amazon.com/images/I/71l1e1d1z3M._SL1500_.jpg",
    tags: ["99.9% Antibacterial Layer", "No Odor Tech", "XXL 320mm Wings", "Heavy Flow Support"],
    description: "Natural green antibacterial sheet prevents 99.9% bacterial proliferation and odor. Ultra-wide back wings guarantee zero overnight side leakage.",
    badge: "Heavy Flow King",
    badgeColor: "#10b981",
  },
  {
    id: 223,
    category: "gear",
    name: "Fitbit Inspire 3 Health & Menstrual Health Tracker Smart Band (Midnight Zen)",
    brand: "Fitbit",
    asin: "B0B3NWV6R6",
    rating: 4.7,
    reviews: 21500,
    price: "₹6,999",
    originalPrice: "₹8,999",
    discount: "22% OFF",
    image: "https://m.media-amazon.com/images/I/61k1e1d1z4M._SL1200_.jpg",
    tags: ["Cycle Phase Tracking", "Sleep Stages", "24/7 Heart Rate", "Water Resistant 50m"],
    description: "Tracks resting heart rate trends, skin temperature fluctuations, and estimated fertile windows to align your workouts with follicular and luteal phases.",
    badge: "Smart Health",
    badgeColor: "#3b82f6",
  },
  {
    id: 224,
    category: "gear",
    name: "Strauss 10mm Extra-Thick Anti-Tear High Density NBR Yoga & Pilates Mat with Strap",
    brand: "Strauss",
    asin: "B00GZ17410",
    rating: 4.6,
    reviews: 32000,
    price: "₹799",
    originalPrice: "₹1,499",
    discount: "47% OFF",
    image: "https://m.media-amazon.com/images/I/71j1e1d1z5M._SL1500_.jpg",
    tags: ["10mm Dense Cushioning", "Knee & Spine Protection", "Non-Slip Ribbed Texture", "Free Carry Strap"],
    description: "Extra thick 10mm cushioning protects sensitive pelvic and knee bones during hip thrusts, core Pilates, and deep restorative yoga stretches.",
    badge: "Joint Cushion",
    badgeColor: "#f59e0b",
  },
];

const FEMALE_HERO_SLIDES = [
  {
    id: "f-hero-1",
    name: "Wholesome Story Myo-Inositol & D-Chiro Inositol (40:1 Ratio, 120 Veg Capsules)",
    brand: "Wholesome Story",
    asin: "B07TXLSG51",
    rating: 4.9,
    reviews: 42000,
    price: "₹2,699",
    originalPrice: "₹3,599",
    discount: "25% OFF",
    image: "https://m.media-amazon.com/images/I/71rB8v8-WBL._SL1500_.jpg",
    tagline: "The golden medical ratio 40:1 for PCOS/PCOD ovulatory support, insulin sensitization, and balancing androgenic acne.",
    adTag: "🌸 #1 PCOS ESSENTIAL",
  },
  {
    id: "f-hero-2",
    name: "Vahdam Pure Kashmiri Organic Spearmint Tea for Facial Hair & Hormonal Balance (50 Bags)",
    brand: "Vahdam India",
    asin: "B0786H7W2K",
    rating: 4.7,
    reviews: 18500,
    price: "₹499",
    originalPrice: "₹699",
    discount: "29% OFF",
    image: "https://m.media-amazon.com/images/I/71N7j2m1GcL._SL1500_.jpg",
    tagline: "Clinically demonstrated anti-androgenic effects. Significantly reduces free testosterone levels responsible for hirsutism and cystic acne.",
    adTag: "⚡ DAILY DETOX HERO",
  },
  {
    id: "f-hero-3",
    name: "Vital Proteins Wild Caught Marine Collagen Peptides (Unflavoured 221g)",
    brand: "Vital Proteins",
    asin: "B07J3H478Y",
    rating: 4.8,
    reviews: 28000,
    price: "₹3,499",
    originalPrice: "₹4,499",
    discount: "22% OFF",
    image: "https://m.media-amazon.com/images/I/71n1e1d1z5L._SL1500_.jpg",
    tagline: "Type 1 & 3 marine peptides derived from wild-caught white fish. Fortifies bone mineral density, joint cartilage, and youthful dermis elasticity.",
    adTag: "✨ SKIN & BONE GLOW",
  },
];

const FEMALE_CATEGORIES = [
  { id: "all", label: "All Women's Essentials", icon: "🌸" },
  { id: "pcos", label: "PCOS & Hormones", icon: "💊" },
  { id: "period", label: "Period Care", icon: "🩸" },
  { id: "skin", label: "Skin, Hair & Collagen", icon: "✨" },
  { id: "intimate", label: "Sexual & Intimate", icon: "🌹" },
  { id: "vitamins", label: "Iron & Vitamins", icon: "🥤" },
  { id: "gear", label: "Fitness & Glute Gear", icon: "🧘" },
];

export default function FemaleShop() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user, isAdmin } = useUser();
  const affiliateTag = getAffiliateTag() || "ashfitverse-21";

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
        where("shop", "in", ["female", "all"])
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const custom = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setDynamicProducts(custom);
        },
        (err) => console.warn("Female shop dynamic sync warning:", err)
      );
      return () => unsub();
    } catch {}
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allProducts = useMemo(() => {
    return [...dynamicProducts, ...BASE_FEMALE_PRODUCTS];
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
    .f-shop-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted ? 1 : 0};transition:opacity 0.6s ease;position:relative;overflow-x:hidden;}
    .f-shop-header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark ? "rgba(8,9,13,0.92)" : "rgba(255,255,255,0.92)"};backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);}
    .f-shop-brand{font-family:${FONT.display};font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;}
    .f-shop-switcher{display:flex;align-items:center;gap:6px;background:${dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};padding:4px;border-radius:14px;border:1px solid ${T.glassBorder};}
    .f-shop-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;background:transparent;color:${dark ? T.textSub : "#64748b"};font-size:12.5px;font-weight:750;cursor:pointer;transition:all 0.16s ease;}
    .f-shop-pill.active{background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;box-shadow:0 2px 10px rgba(236,72,153,0.35);}
    .f-shop-main{max-width:1200px;margin:0 auto;padding:24px 24px 80px;}
    .f-shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;}
    .f-shop-card{border-radius:20px;overflow:hidden;background:${T.glass};border:1px solid ${T.glassBorder};display:flex;flex-direction:column;transition:all 0.24s cubic-bezier(0.16,1,0.3,1);position:relative;}
    .f-shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};box-shadow:0 16px 40px rgba(0,0,0,${dark ? "0.45" : "0.08"});}
    .f-shop-img-box{position:relative;width:100%;height:190px;background:${dark ? "rgba(255,255,255,0.02)" : "#ffffff"};display:flex;align-items:center;justify-content:center;overflow:hidden;padding:12px;box-sizing:border-box;}
    .f-shop-img-box img{max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.3s ease;}
    .f-shop-card:hover .f-shop-img-box img{transform:scale(1.05);}
    .f-shop-buy-btn{width:100%;height:42px;border-radius:12px;border:none;background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;font-size:13px;font-weight:800;font-family:${FONT.display};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 3px 12px rgba(236,72,153,0.3);transition:all 0.16s ease;}
    .f-shop-buy-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    @media(max-width:768px){
      .f-shop-header{padding:0 14px;height:56px;}
      .f-shop-switcher{overflow-x:auto;scrollbar-width:none;}
      .f-shop-grid{grid-template-columns:1fr 1fr;gap:12px;}
      .f-shop-img-box{height:140px;}
    }
    @media(max-width:480px){
      .f-shop-grid{grid-template-columns:1fr;}
    }
  `;

  return (
    <div className="f-shop-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="f-shop-header">
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

          <div className="f-shop-brand" onClick={() => navigate("/dashboard")}>
            <span>🌸</span>
            <span>
              Women's<span>Shop</span>
            </span>
          </div>
        </div>

        {/* Unified 3-Shop Switcher */}
        <div className="f-shop-switcher">
          <button
            className="f-shop-pill"
            onClick={() => navigate("/shop")}
            title="Open All Fitness Shop"
          >
            <span>🛒</span>
            <span>All Fitness</span>
          </button>
          <button
            className="f-shop-pill"
            onClick={() => navigate("/male-shop")}
            title="Open Men's Performance & Testosterone Shop"
          >
            <span>⚡</span>
            <span>Men's Shop</span>
          </button>
          <button className="f-shop-pill active">
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
                background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(219,39,119,0.18))",
                border: "1px solid rgba(236,72,153,0.4)",
                color: "#ec4899",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Admin Only: Add new women's affiliate product"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Women's Item</span>
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
      <main className="f-shop-main">
        {/* Dynamic Sponsored Hero Deal Carousel */}
        <ShopHeroAdBanner
          slides={FEMALE_HERO_SLIDES}
          onOpenReview={(prod) => setSelectedReviewProduct(prod)}
          affiliateTag="ashfitverse-21"
          dark={dark}
          T={T}
          storeType="female"
        />

        {/* Women's Trust Badges Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { icon: "🌸", title: "Hormone-Safe Formulations", desc: "Clinically formulated without endocrine disruptors" },
            { icon: "🩺", title: "Gynecologist & Dietitian Vetted", desc: "Targeted support for PCOS, cycle health & fertility" },
            { icon: "⭐", title: "Real Women's Community Ratings", desc: "Authentic in-app verified cycle recovery reviews" },
            { icon: "📦", title: "Discreet & 100% Organic", desc: "Delivered securely via Amazon Prime fulfillment" },
          ].map((b, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 14,
                background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${T.glassBorder}`,
                boxShadow: dark ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text }}>{b.title}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search Row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {FEMALE_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: active ? "1.5px solid #ec4899" : `1px solid ${T.glassBorder}`,
                    background: active
                      ? (dark ? "rgba(236, 72, 153, 0.18)" : "rgba(236, 72, 153, 0.1)")
                      : dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    color: active ? "#ec4899" : T.textSub,
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
                placeholder="Search inositol, spearmint..."
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
          <div className="f-shop-grid">
            {filtered.map((p) => {
              const affiliateUrl = buildAmazonAffiliateUrl(p.asin || p.href || p.name);
              const isWished = wishlist.includes(p.id);

              return (
                <div key={p.id} className="f-shop-card">
                  {/* Image Container with Badges */}
                  <div className="f-shop-img-box">
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
                          background: p.badgeColor || "#ec4899",
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
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                          color: "#ec4899",
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
                      <button className="f-shop-buy-btn">
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
        defaultShop="female"
        onProductAdded={(newP) => {
          setDynamicProducts((prev) => [newP, ...prev]);
        }}
        dark={dark}
        T={T}
      />
    </div>
  );
}