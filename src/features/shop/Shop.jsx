// src/features/shop/Shop.jsx
// ─────────────────────────────────────────────────────────────
// Migrated to unified theme system (useTheme + PageWrapper)
// All functionality preserved 1:1 — only theming layer swapped
// ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import useTheme from "../../hooks/useTheme";
import { FONT } from "../../theme";

// ─────────────────────────────────────────────────────────────
// AFFILIATE PRODUCTS DATABASE
// Replace href links with your actual affiliate URLs
// ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  // ── SUPPLEMENTS ──
  {
    id: 1, category: "supplements",
    name: "Optimum Nutrition Gold Standard Whey",
    brand: "Optimum Nutrition",
    platform: "Amazon",
    rating: 4.8, reviews: 12400,
    price: "₹3,499", originalPrice: "₹4,499",
    discount: "22% OFF",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
    tags: ["Whey Protein", "Best Seller", "24g Protein"],
    description: "100% Whey protein with 24g protein per serving. Double Rich Chocolate flavour.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Best Seller",
    badgeColor: "#fbbf24",
  },
  {
    id: 2, category: "supplements",
    name: "MyProtein Impact Whey Isolate",
    brand: "MyProtein",
    platform: "MyProtein",
    rating: 4.7, reviews: 8900,
    price: "₹2,999", originalPrice: "₹3,999",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=400&q=80",
    tags: ["Whey Isolate", "Low Fat", "25g Protein"],
    description: "90% protein content, ultra-low fat and carb. Perfect for lean gains.",
    href: "https://www.myprotein.com/YOUR_AFFILIATE_LINK",
    badge: "Top Rated",
    badgeColor: "#4f8ef7",
  },
  {
    id: 3, category: "supplements",
    name: "Creatine Monohydrate 500g",
    brand: "Healthkart",
    platform: "Healthkart",
    rating: 4.6, reviews: 5200,
    price: "₹899", originalPrice: "₹1,299",
    discount: "31% OFF",
    image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400&q=80",
    tags: ["Creatine", "Strength", "5g per serving"],
    description: "Pure micronised creatine monohydrate. Increase strength and power output.",
    href: "https://www.healthkart.com/YOUR_AFFILIATE_LINK",
    badge: "Value Pick",
    badgeColor: "#34d399",
  },
  {
    id: 4, category: "supplements",
    name: "MuscleBlaze Mass Gainer XXL",
    brand: "MuscleBlaze",
    platform: "Amazon",
    rating: 4.5, reviews: 9800,
    price: "₹2,799", originalPrice: "₹3,499",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    tags: ["Mass Gainer", "Bulk", "High Carb"],
    description: "1250 kcal per serving. Ideal for hardgainers looking to pack on mass fast.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: null,
    badgeColor: null,
  },
  {
    id: 5, category: "supplements",
    name: "Optimum Nutrition BCAA 200 Caps",
    brand: "Optimum Nutrition",
    platform: "Amazon",
    rating: 4.7, reviews: 4300,
    price: "₹1,499", originalPrice: "₹1,999",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    tags: ["BCAA", "Recovery", "2:1:1 ratio"],
    description: "Essential amino acids in 2:1:1 ratio for muscle recovery and endurance.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: null,
    badgeColor: null,
  },
  {
    id: 6, category: "supplements",
    name: "Dymatize ISO100 Hydrolyzed Whey",
    brand: "Dymatize",
    platform: "Healthkart",
    rating: 4.9, reviews: 3100,
    price: "₹5,999", originalPrice: "₹7,499",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    tags: ["Hydrolyzed", "Fast Absorb", "25g Protein"],
    description: "Hydrolyzed whey protein for maximum absorption post-workout.",
    href: "https://www.healthkart.com/YOUR_AFFILIATE_LINK",
    badge: "Premium",
    badgeColor: "#a78bfa",
  },

  // ── MULTIVITAMINS ──
  {
    id: 7, category: "multivitamins",
    name: "Centrum Silver Multivitamin",
    brand: "Centrum",
    platform: "Amazon",
    rating: 4.6, reviews: 7800,
    price: "₹649", originalPrice: "₹899",
    discount: "28% OFF",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80",
    tags: ["Complete Formula", "30+ Vitamins", "Daily"],
    description: "Complete multivitamin with 30+ essential vitamins and minerals for active adults.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Best Seller",
    badgeColor: "#fbbf24",
  },
  {
    id: 8, category: "multivitamins",
    name: "Vitamin D3 + K2 5000 IU",
    brand: "Now Foods",
    platform: "Amazon",
    rating: 4.8, reviews: 5600,
    price: "₹899", originalPrice: "₹1,199",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9d222?w=400&q=80",
    tags: ["Vitamin D3", "Bone Health", "Immune Support"],
    description: "High potency D3 + K2 for bone health, immune function and testosterone support.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Top Rated",
    badgeColor: "#4f8ef7",
  },
  {
    id: 9, category: "multivitamins",
    name: "Omega-3 Fish Oil 1000mg",
    brand: "HealthKart",
    platform: "Healthkart",
    rating: 4.5, reviews: 11200,
    price: "₹499", originalPrice: "₹699",
    discount: "29% OFF",
    image: "https://images.unsplash.com/photo-1587854680352-936b22b91030?w=400&q=80",
    tags: ["EPA + DHA", "Heart Health", "Joint Support"],
    description: "Triple strength omega-3 with 360mg EPA and 240mg DHA per softgel.",
    href: "https://www.healthkart.com/YOUR_AFFILIATE_LINK",
    badge: null,
    badgeColor: null,
  },
  {
    id: 10, category: "multivitamins",
    name: "Magnesium Glycinate 400mg",
    brand: "Doctor's Best",
    platform: "Amazon",
    rating: 4.7, reviews: 4200,
    price: "₹1,299", originalPrice: "₹1,699",
    discount: "23% OFF",
    image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&q=80",
    tags: ["Sleep", "Recovery", "Muscle Relaxation"],
    description: "Highly bioavailable magnesium for better sleep, muscle recovery and stress relief.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Staff Pick",
    badgeColor: "#34d399",
  },
  {
    id: 11, category: "multivitamins",
    name: "Zinc + Vitamin C Immunity Stack",
    brand: "MyProtein",
    platform: "MyProtein",
    rating: 4.6, reviews: 2800,
    price: "₹599", originalPrice: "₹799",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&q=80",
    tags: ["Immunity", "Zinc", "Vitamin C"],
    description: "Zinc and Vitamin C combination for immune defence and testosterone production.",
    href: "https://www.myprotein.com/YOUR_AFFILIATE_LINK",
    badge: null,
    badgeColor: null,
  },

  // ── ENHANCERS ──
  {
    id: 12, category: "enhancers",
    name: "C4 Original Pre-Workout",
    brand: "Cellucor",
    platform: "Amazon",
    rating: 4.7, reviews: 15600,
    price: "₹2,199", originalPrice: "₹2,999",
    discount: "27% OFF",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    tags: ["Pre-Workout", "Energy", "150mg Caffeine"],
    description: "Explosive energy, focus and pumps. 150mg caffeine + beta-alanine formula.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Best Seller",
    badgeColor: "#fbbf24",
  },
  {
    id: 13, category: "enhancers",
    name: "Ghost Legend Pre-Workout",
    brand: "Ghost",
    platform: "Amazon",
    rating: 4.8, reviews: 6700,
    price: "₹3,499", originalPrice: "₹4,299",
    discount: "19% OFF",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    tags: ["Pre-Workout", "250mg Caffeine", "Pump"],
    description: "Full clinical doses, fully transparent label. The pre-workout you've been waiting for.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Premium",
    badgeColor: "#a78bfa",
  },
  {
    id: 14, category: "enhancers",
    name: "L-Glutamine Powder 500g",
    brand: "MuscleBlaze",
    platform: "Healthkart",
    rating: 4.5, reviews: 3900,
    price: "₹799", originalPrice: "₹1,099",
    discount: "27% OFF",
    image: "https://images.unsplash.com/photo-1544991875-5dc1b05f5a49?w=400&q=80",
    tags: ["Recovery", "Gut Health", "5g per serve"],
    description: "Pharmaceutical grade L-Glutamine for muscle recovery and gut health.",
    href: "https://www.healthkart.com/YOUR_AFFILIATE_LINK",
    badge: null,
    badgeColor: null,
  },
  {
    id: 15, category: "enhancers",
    name: "Ashwagandha KSM-66 600mg",
    brand: "Himalaya",
    platform: "Amazon",
    rating: 4.6, reviews: 8200,
    price: "₹549", originalPrice: "₹749",
    discount: "27% OFF",
    image: "https://images.unsplash.com/photo-1615485500704-8e3b20b25571?w=400&q=80",
    tags: ["Adaptogen", "Testosterone", "Stress Relief"],
    description: "KSM-66 extract — clinically proven to reduce cortisol and boost testosterone naturally.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Natural",
    badgeColor: "#34d399",
  },
  {
    id: 16, category: "enhancers",
    name: "EAA (Essential Amino Acids)",
    brand: "MyProtein",
    platform: "MyProtein",
    rating: 4.7, reviews: 4100,
    price: "₹1,799", originalPrice: "₹2,399",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    tags: ["EAA", "Intra-Workout", "All 9 Aminos"],
    description: "All 9 essential amino acids in one formula. Sip during training for maximum muscle protein synthesis.",
    href: "https://www.myprotein.com/YOUR_AFFILIATE_LINK",
    badge: null,
    badgeColor: null,
  },

  // ── GEAR & EQUIPMENT ──
  {
    id: 17, category: "gear",
    name: "Harbinger Pro Lifting Belt",
    brand: "Harbinger",
    platform: "Amazon",
    rating: 4.8, reviews: 3400,
    price: "₹2,499", originalPrice: "₹3,499",
    discount: "29% OFF",
    image: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80",
    tags: ["Lifting Belt", "Back Support", "Powerlifting"],
    description: "4-inch foam core belt for maximum lumbar support during heavy compound lifts.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Best Seller",
    badgeColor: "#fbbf24",
  },
  {
    id: 18, category: "gear",
    name: "Versa Gripps Pro Straps",
    brand: "Versa Gripps",
    platform: "Amazon",
    rating: 4.9, reviews: 2100,
    price: "₹3,999", originalPrice: "₹5,499",
    discount: "27% OFF",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
    tags: ["Wrist Straps", "Grip", "Pull Day"],
    description: "Replace gloves forever. The ultimate gripping tool for deadlifts, rows and pull-downs.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Premium",
    badgeColor: "#a78bfa",
  },
  {
    id: 19, category: "gear",
    name: "Adjustable Dumbbell Set 5–52.5 lbs",
    brand: "Bowflex",
    platform: "Amazon",
    rating: 4.8, reviews: 18700,
    price: "₹24,999", originalPrice: "₹32,999",
    discount: "24% OFF",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    tags: ["Home Gym", "Adjustable", "Space Saving"],
    description: "Replaces 15 sets of weights. Quick-adjust dial system. Essential for home gym.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Top Rated",
    badgeColor: "#4f8ef7",
  },
  {
    id: 20, category: "gear",
    name: "Nike Metcon 9 Training Shoes",
    brand: "Nike",
    platform: "Amazon",
    rating: 4.7, reviews: 5600,
    price: "₹8,995", originalPrice: "₹11,995",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    tags: ["Training Shoes", "Flat Sole", "Lifting"],
    description: "Purpose-built for lifting. Wide, flat sole for maximum stability during squats and deadlifts.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: null,
    badgeColor: null,
  },
  {
    id: 21, category: "gear",
    name: "Resistance Band Set (5 levels)",
    brand: "WODFitters",
    platform: "Amazon",
    rating: 4.6, reviews: 9200,
    price: "₹999", originalPrice: "₹1,499",
    discount: "33% OFF",
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80",
    tags: ["Resistance Bands", "Home Gym", "Mobility"],
    description: "5 resistance levels from 10–125 lbs. For warm-ups, mobility and assisted pull-ups.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: "Value Pick",
    badgeColor: "#34d399",
  },
  {
    id: 22, category: "gear",
    name: "Shaker Bottle with Storage",
    brand: "BlenderBottle",
    platform: "Amazon",
    rating: 4.7, reviews: 22000,
    price: "₹799", originalPrice: "₹1,199",
    discount: "33% OFF",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80",
    tags: ["Shaker", "800ml", "Leakproof"],
    description: "ProStak system with twist-lock storage jars. Classic BlenderBall wire whisk.",
    href: "https://amzn.to/YOUR_AFFILIATE_LINK_HERE",
    badge: null,
    badgeColor: null,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Products", icon: "🛒" },
  { id: "supplements", label: "Supplements", icon: "🥤" },
  { id: "multivitamins", label: "Multivitamins", icon: "💊" },
  { id: "enhancers", label: "Enhancers", icon: "⚡" },
  { id: "gear", label: "Gear & Equipment", icon: "🏋️" },
];

const PLATFORMS = [
  { id: "all", label: "All Platforms" },
  { id: "Amazon", label: "Amazon" },
  { id: "MyProtein", label: "MyProtein" },
  { id: "Healthkart", label: "Healthkart" },
];

const PLATFORM_COLORS = {
  Amazon: "#fb923c",
  MyProtein: "#4f8ef7",
  Healthkart: "#34d399",
};

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            fontSize: 11,
            color: i <= Math.round(rating) ? "#fbbf24" : "rgba(150,150,150,0.3)"
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function Shop() {
  const { dark, T } = useTheme();
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id) => {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  };

  let filtered = PRODUCTS
    .filter(p => category === "all" || p.category === category)
    .filter(p => platform === "all" || p.platform === platform)
    .filter(p =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  if (sort === "popular") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sort === "price_low") filtered = [...filtered].sort((a, b) => parseInt(a.price.replace(/[^\d]/g, "")) - parseInt(b.price.replace(/[^\d]/g, "")));
  if (sort === "price_high") filtered = [...filtered].sort((a, b) => parseInt(b.price.replace(/[^\d]/g, "")) - parseInt(a.price.replace(/[^\d]/g, "")));

  // ── Shop-specific scoped CSS (only what's NOT in theme.js) ──
  const shopCSS = `
    /* Hero banner */
    .shop-hero {
      background: linear-gradient(135deg,
        ${dark ? "rgba(79,142,247,0.12)" : "rgba(79,142,247,0.07)"} 0%,
        ${dark ? "rgba(251,146,60,0.08)" : "rgba(251,146,60,0.05)"} 100%);
      border-bottom: 1px solid ${T.glassBorder};
      padding: 40px;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    .shop-hero::before {
      content: '';
      position: absolute; top: -50%; right: -10%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, ${T.orange}15, transparent 65%);
      border-radius: 50%; pointer-events: none;
    }
    .shop-hero-content {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
    }
    .shop-hero-title {
      font-family: ${FONT.display};
      font-size: 40px; font-weight: 800; letter-spacing: -0.03em;
      color: ${T.text}; line-height: 1.1; margin-bottom: 10px;
    }
    .shop-hero-title span {
      background: linear-gradient(135deg, ${T.orange}, ${T.accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .shop-hero-sub {
      font-size: 15px; color: ${T.textSub}; line-height: 1.6; max-width: 500px;
    }
    .shop-hero-stats { display: flex; gap: 28px; margin-top: 22px; }
    .shop-hero-stat-val {
      font-family: ${FONT.display};
      font-size: 26px; font-weight: 800; color: ${T.text};
    }
    .shop-hero-stat-lbl {
      font-size: 11px; color: ${T.textMuted}; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px;
    }
    .shop-aff-badges { display: flex; gap: 10px; flex-wrap: wrap; }
    .shop-aff-badge {
      padding: 10px 18px; border-radius: 12px;
      border: 1px solid ${T.glassBorder};
      background: ${T.glass};
      backdrop-filter: blur(20px);
      font-size: 13px; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
    }

    /* Main layout */
    .shop-main {
      max-width: 1200px; margin: 0 auto;
      padding: 32px 40px;
      position: relative; z-index: 1;
    }

    /* Filters */
    .shop-filters {
      display: flex; flex-wrap: wrap; gap: 12px;
      margin-bottom: 28px; align-items: center;
    }
    .shop-cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .shop-cat-tab {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 13px;
      border: 1.5px solid ${T.glassBorder};
      background: ${T.glass};
      backdrop-filter: blur(20px);
      cursor: pointer; font-size: 13px; font-weight: 700;
      color: ${T.textSub};
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
      font-family: ${FONT.body};
    }
    .shop-cat-tab:hover {
      color: ${T.text};
      border-color: ${T.glassBorderHover};
      transform: translateY(-2px);
    }
    .shop-cat-tab.active {
      background: linear-gradient(135deg, ${T.orange}18, ${T.accent}10);
      color: ${T.orange};
      border-color: ${T.orange}35;
      box-shadow: 0 0 18px ${T.orange}20;
    }

    .shop-search-sort {
      display: flex; gap: 10px;
      margin-left: auto; flex-wrap: wrap;
    }
    .shop-search-inp {
      height: 44px;
      background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1.5px solid ${T.glassBorder};
      border-radius: 13px; padding: 0 18px;
      font-size: 13px; font-family: ${FONT.body};
      color: ${T.text}; outline: none;
      transition: all 0.25s;
      width: 220px;
    }
    .shop-search-inp:focus {
      border-color: ${T.accent};
      box-shadow: 0 0 0 4px ${T.accentGlow};
    }
    .shop-search-inp::placeholder { color: ${T.textMuted}; }
    .shop-sort-sel {
      height: 44px;
      background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1.5px solid ${T.glassBorder};
      border-radius: 13px; padding: 0 14px;
      font-size: 13px; font-family: ${FONT.body};
      color: ${T.text}; outline: none;
      cursor: pointer; transition: all 0.25s;
    }
    .shop-sort-sel:focus { border-color: ${T.accent}; }

    /* Platform filter */
    .shop-plat-filters {
      display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .shop-plat-btn {
      padding: 7px 14px; border-radius: 10px;
      border: 1.5px solid ${T.glassBorder};
      background: ${T.glass};
      color: ${T.textSub};
      font-size: 12px; font-weight: 700;
      cursor: pointer; font-family: ${FONT.body};
      transition: all 0.22s;
    }
    .shop-plat-btn:hover { color: ${T.text}; }
    .shop-plat-btn.active { color: #fff; border-color: transparent; }

    /* Product grid */
    .shop-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    /* Product card */
    .shop-p-card {
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      border-radius: 22px;
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      overflow: hidden;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; flex-direction: column;
      animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      position: relative;
    }
    .shop-p-card:hover {
      transform: translateY(-6px);
      border-color: ${T.glassBorderHover};
      box-shadow: 0 28px 70px rgba(0,0,0,${dark ? "0.35" : "0.12"});
    }

    .shop-p-img-wrap {
      position: relative; overflow: hidden; height: 200px;
      background: ${dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
    }
    .shop-p-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .shop-p-card:hover .shop-p-img { transform: scale(1.06); }
    .shop-p-badge {
      position: absolute; top: 12px; left: 12px;
      padding: 4px 11px; border-radius: 99px;
      font-size: 10px; font-weight: 800;
      letter-spacing: 0.06em; text-transform: uppercase;
    }
    .shop-p-discount {
      position: absolute; top: 12px; right: 44px;
      padding: 4px 10px; border-radius: 99px;
      font-size: 10px; font-weight: 800;
      background: rgba(239,68,68,0.85); color: #fff;
    }
    .shop-p-wishlist {
      position: absolute; top: 10px; right: 10px;
      width: 30px; height: 30px; border-radius: 50%;
      background: ${dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)"};
      backdrop-filter: blur(8px);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; transition: all 0.25s;
    }
    .shop-p-wishlist:hover { transform: scale(1.15); }

    .shop-p-body {
      padding: 18px; flex: 1;
      display: flex; flex-direction: column;
    }
    .shop-p-platform {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 99px;
      font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
      margin-bottom: 8px; border: 1px solid;
      align-self: flex-start;
    }
    .shop-p-name {
      font-family: ${FONT.display};
      font-size: 15px; font-weight: 800;
      color: ${T.text}; margin-bottom: 4px; line-height: 1.3;
    }
    .shop-p-brand {
      font-size: 12px; color: ${T.textMuted};
      font-weight: 600; margin-bottom: 8px;
    }
    .shop-p-desc {
      font-size: 12px; color: ${T.textSub};
      line-height: 1.6; margin-bottom: 12px; flex: 1;
    }
    .shop-p-tags {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
    }
    .shop-p-tag {
      padding: 3px 10px; border-radius: 99px;
      font-size: 10px; font-weight: 700;
      background: ${T.accentSoft};
      color: ${T.accent};
      border: 1px solid ${T.accent}22;
    }
    .shop-p-rating-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
    }
    .shop-p-rating-num {
      font-size: 12px; font-weight: 800; color: ${T.text};
    }
    .shop-p-reviews { font-size: 11px; color: ${T.textMuted}; }
    .shop-p-price-row {
      display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px;
    }
    .shop-p-price {
      font-family: ${FONT.display};
      font-size: 22px; font-weight: 800; color: ${T.text};
    }
    .shop-p-original {
      font-size: 13px; color: ${T.textMuted};
      text-decoration: line-through;
    }
    .shop-p-buy-btn {
      width: 100%; height: 46px; border-radius: 13px; border: none;
      background: linear-gradient(135deg, ${T.orange}, ${T.accent});
      color: #fff; font-size: 13px; font-weight: 800;
      font-family: ${FONT.body}; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      letter-spacing: 0.04em; text-transform: uppercase;
      box-shadow: 0 6px 20px ${T.orange}30;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .shop-p-buy-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px ${T.orange}40;
      filter: brightness(1.08);
    }

    /* Empty state */
    .shop-empty {
      text-align: center; padding: 80px 20px;
      color: ${T.textSub};
    }
    .shop-empty-icon { font-size: 56px; margin-bottom: 16px; }
    .shop-empty-title {
      font-family: ${FONT.display};
      font-size: 20px; font-weight: 800; color: ${T.text}; margin-bottom: 8px;
    }

    /* Results bar */
    .shop-results-bar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .shop-results-count {
      font-size: 13px; color: ${T.textSub}; font-weight: 600;
    }
    .shop-results-count span { color: ${T.text}; font-weight: 800; }

    /* Wishlist button in header (passed via rightSlot) */
    .shop-wishlist-h {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 11px;
      border: 1px solid ${T.glassBorder};
      background: ${T.glass};
      backdrop-filter: blur(12px);
      color: ${T.textSub};
      font-size: 13px; font-weight: 700;
      cursor: pointer; font-family: ${FONT.body};
      transition: all 0.22s;
    }
    .shop-wishlist-h:hover {
      color: ${T.orange};
      border-color: ${T.orange}40;
    }

    @media (max-width: 900px) {
      .shop-hero-content { flex-direction: column; }
      .shop-search-sort { margin-left: 0; width: 100%; }
      .shop-filters { gap: 8px; }
      .shop-product-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
    @media (max-width: 600px) {
      .shop-main { padding: 20px 16px; }
      .shop-hero { padding: 24px 20px; }
      .shop-hero-title { font-size: 28px; }
      .shop-product-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .shop-p-body { padding: 14px; }
      .shop-p-img-wrap { height: 160px; }
    }
  `;

  // Wishlist button for header rightSlot
  const wishlistBtn = (
    <button className="shop-wishlist-h">
      ♡ Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
    </button>
  );

  return (
    <PageWrapper
      bgKey="shop"
      backTo="/dashboard"
      accentColor={T.orange}
      rightSlot={wishlistBtn}
    >
      <style>{shopCSS}</style>

      {/* Hero Banner */}
      <div className="shop-hero anim-fade-in">
        <div className="shop-hero-content">
          <div>
            <div className="shop-hero-title">
              Your Fitness<br /><span>Store</span>
            </div>
            <div className="shop-hero-sub">
              Handpicked supplements, vitamins, enhancers and gear — all from trusted brands via our affiliate partners.
            </div>
            <div className="shop-hero-stats">
              {[
                { val: PRODUCTS.length + "+", lbl: "Products" },
                { val: "4", lbl: "Platforms" },
                { val: "4", lbl: "Categories" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="shop-hero-stat-val">{s.val}</div>
                  <div className="shop-hero-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="shop-aff-badges">
            {[
              { name: "Amazon", color: "#fb923c", icon: "📦" },
              { name: "MyProtein", color: "#4f8ef7", icon: "💪" },
              { name: "Healthkart", color: "#34d399", icon: "🌿" },
            ].map((a, i) => (
              <div
                key={i}
                className="shop-aff-badge"
                style={{ color: a.color, borderColor: `${a.color}30` }}
              >
                <span>{a.icon}</span> {a.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shop-main">
        {/* Category tabs + search/sort */}
        <div className="shop-filters anim-fade-up">
          <div className="shop-cat-tabs">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`shop-cat-tab ${category === c.id ? "active" : ""}`}
                onClick={() => setCategory(c.id)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="shop-search-sort">
            <input
              className="shop-search-inp"
              placeholder="Search products, brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="shop-sort-sel"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Platform filter */}
        <div className="shop-plat-filters anim-fade-up d-1">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              className={`shop-plat-btn ${platform === p.id ? "active" : ""}`}
              onClick={() => setPlatform(p.id)}
              style={platform === p.id ? {
                background: p.id === "all"
                  ? `linear-gradient(135deg, ${T.accent}, ${T.purple})`
                  : PLATFORM_COLORS[p.id] || T.accent,
                borderColor: "transparent",
                color: "#fff",
              } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="shop-results-bar anim-fade-up d-2">
          <div className="shop-results-count">
            Showing <span>{filtered.length}</span> products
            {category !== "all" && (
              <span> in {CATEGORIES.find(c => c.id === category)?.label}</span>
            )}
          </div>
        </div>

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="shop-product-grid">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="shop-p-card"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="shop-p-img-wrap">
                  <img src={p.image} alt={p.name} className="shop-p-img" />
                  {p.badge && (
                    <div
                      className="shop-p-badge"
                      style={{ background: p.badgeColor, color: "#000" }}
                    >
                      {p.badge}
                    </div>
                  )}
                  <div className="shop-p-discount">{p.discount}</div>
                  <button
                    className="shop-p-wishlist"
                    onClick={() => toggleWishlist(p.id)}
                  >
                    {wishlist.includes(p.id) ? "❤️" : "🤍"}
                  </button>
                </div>

                <div className="shop-p-body">
                  <div
                    className="shop-p-platform"
                    style={{
                      color: PLATFORM_COLORS[p.platform] || T.accent,
                      borderColor: `${PLATFORM_COLORS[p.platform] || T.accent}30`,
                      background: `${PLATFORM_COLORS[p.platform] || T.accent}10`,
                    }}
                  >
                    {p.platform === "Amazon" ? "📦" : p.platform === "MyProtein" ? "💪" : "🌿"} {p.platform}
                  </div>

                  <div className="shop-p-name">{p.name}</div>
                  <div className="shop-p-brand">{p.brand}</div>
                  <div className="shop-p-desc">{p.description}</div>

                  <div className="shop-p-tags">
                    {p.tags.map((t, ti) => (
                      <span key={ti} className="shop-p-tag">{t}</span>
                    ))}
                  </div>

                  <div className="shop-p-rating-row">
                    <StarRating rating={p.rating} />
                    <span className="shop-p-rating-num">{p.rating}</span>
                    <span className="shop-p-reviews">
                      ({p.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  <div className="shop-p-price-row">
                    <span className="shop-p-price">{p.price}</span>
                    <span className="shop-p-original">{p.originalPrice}</span>
                  </div>

                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button className="shop-p-buy-btn">
                      Buy on {p.platform} ↗
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="shop-empty">
            <div className="shop-empty-icon">🔍</div>
            <div className="shop-empty-title">No products found</div>
            <div>Try a different search or category</div>
          </div>
        )}

        {/* Affiliate disclaimer */}
        <div style={{
          marginTop: 48,
          padding: "16px 20px",
          background: T.glass,
          border: `1px solid ${T.glassBorder}`,
          borderRadius: 14,
          backdropFilter: "blur(20px)",
          fontSize: 12,
          color: T.textMuted,
          lineHeight: 1.65,
          textAlign: "center"
        }}>
          <strong style={{ color: T.textSub }}>Affiliate Disclosure:</strong> AshFitVerse participates in affiliate marketing programmes.
          When you click a product link and make a purchase, we may earn a small commission at no extra cost to you.
          All products are independently selected based on quality and value.
        </div>
      </div>
    </PageWrapper>
  );
}