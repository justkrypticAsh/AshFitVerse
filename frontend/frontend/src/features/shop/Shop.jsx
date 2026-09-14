// src/features/shop/Shop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

// ─────────────────────────────────────────────────────────────
// AFFILIATE PRODUCTS DATABASE
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
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => { setMounted(true); }, []);

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

  const css = generateCSS(T, dark) + `
    .shop-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s ease,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    /* UNIFIED HEADER BAR WITH MATCHING NAVIGATION BUTTON */
    .header{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark?"rgba(8,8,12,0.85)":"rgba(255,255,255,0.85)"};backdrop-filter:blur(40px);}
    .pr-back{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};color:${T.text};font-size:13px;font-weight:600;cursor:pointer;font-family:${FONT.body};transition:all 0.15s ease;}
    .pr-back:hover{background:${T.accentSoft};border-color:${T.accent}40;color:${T.accent};}
    .h-logo{font-family:${FONT.display};font-size:18px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}
    .h-right{display:flex;align-items:center;gap:10px;}

    .theme-toggle{width:48px;height:26px;border-radius:99px;border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};cursor:pointer;position:relative;}
    .toggle-thumb{position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:${T.accent};display:flex;align-items:center;justify-content:center;font-size:10px;transition:left .2s ease;left:${dark?"24px":"2px"};}

    .shop-wishlist-h{
      display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
      border:1px solid ${T.glassBorder};background:${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};
      color:${T.textSub};font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT.body};transition:all 0.22s;
    }
    .shop-wishlist-h:hover{color:${T.orange};border-color:${T.orange}40;}

    /* Hero Banner */
    .shop-hero {
      background: linear-gradient(135deg, ${dark ? "rgba(79,142,247,0.12)" : "rgba(79,142,247,0.07)"} 0%, ${dark ? "rgba(251,146,60,0.08)" : "rgba(251,146,60,0.05)"} 100%);
      border-bottom: 1px solid ${T.glassBorder};
      padding: 36px 40px;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    .shop-hero-content {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
    }
    .shop-hero-title {
      font-family: ${FONT.display};
      font-size: 38px; font-weight: 800; letter-spacing: -0.03em;
      color: ${T.text}; line-height: 1.1; margin-bottom: 8px;
    }
    .shop-hero-title span {
      background: linear-gradient(135deg, ${T.orange}, ${T.accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .shop-hero-sub {
      font-size: 14.5px; color: ${T.textSub}; line-height: 1.6; max-width: 500px;
    }
    .shop-hero-stats { display: flex; gap: 28px; margin-top: 20px; }
    .shop-hero-stat-val { font-family: ${FONT.display}; font-size: 24px; font-weight: 800; color: ${T.text}; }
    .shop-hero-stat-lbl { font-size: 10.5px; color: ${T.textMuted}; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
    .shop-aff-badges { display: flex; gap: 10px; flex-wrap: wrap; }
    .shop-aff-badge {
      padding: 10px 18px; border-radius: 12px;
      border: 1px solid ${T.glassBorder};
      background: ${T.glass};
      backdrop-filter: blur(20px);
      font-size: 13px; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
    }

    /* Main Content */
    .shop-main {
      max-width: 1100px; margin: 0 auto;
      padding: 32px 40px;
      position: relative; z-index: 1;
    }

    /* Filters */
    .shop-filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; align-items: center; }
    .shop-cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .shop-cat-tab {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 13px;
      border: 1.5px solid ${T.glassBorder};
      background: ${T.glass}; backdrop-filter: blur(20px);
      cursor: pointer; font-size: 13px; font-weight: 700;
      color: ${T.textSub}; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap; font-family: ${FONT.body};
    }
    .shop-cat-tab:hover { color: ${T.text}; border-color: ${T.glassBorderHover}; transform: translateY(-2px); }
    .shop-cat-tab.active {
      background: linear-gradient(135deg, ${T.orange}18, ${T.accent}10);
      color: ${T.orange}; border-color: ${T.orange}35;
      box-shadow: 0 0 18px ${T.orange}20;
    }

    .shop-search-sort { display: flex; gap: 10px; margin-left: auto; flex-wrap: wrap; }
    .shop-search-inp {
      height: 44px; background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1.5px solid ${T.glassBorder}; border-radius: 13px; padding: 0 18px;
      font-size: 13px; font-family: ${FONT.body}; color: ${T.text}; outline: none; transition: all 0.25s; width: 220px;
    }
    .shop-search-inp:focus { border-color: ${T.accent}; box-shadow: 0 0 0 4px ${T.accentGlow}; }
    .shop-search-inp::placeholder { color: ${T.textMuted}; }
    .shop-sort-sel {
      height: 44px; background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
      border: 1.5px solid ${T.glassBorder}; border-radius: 13px; padding: 0 14px;
      font-size: 13px; font-family: ${FONT.body}; color: ${T.text}; outline: none; cursor: pointer; transition: all 0.25s;
    }
    .shop-sort-sel:focus { border-color: ${T.accent}; }

    .shop-plat-filters { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 24px; }
    .shop-plat-btn {
      padding: 7px 14px; border-radius: 10px; border: 1.5px solid ${T.glassBorder};
      background: ${T.glass}; color: ${T.textSub}; font-size: 12px; font-weight: 700;
      cursor: pointer; font-family: ${FONT.body}; transition: all 0.22s;
    }
    .shop-plat-btn:hover { color: ${T.text}; }
    .shop-plat-btn.active { color: #fff; border-color: transparent; }

    /* Product Grid */
    .shop-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .shop-p-card {
      background: ${T.glass};
      border: 1px solid ${T.glassBorder};
      border-radius: 22px;
      backdrop-filter: blur(28px) saturate(180%);
      overflow: hidden;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; flex-direction: column;
      animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      position: relative;
    }
    .shop-p-card:hover {
      transform: translateY(-6px);
      border-color: ${T.glassBorderHover};
      box-shadow: 0 24px 60px rgba(0,0,0,${dark ? "0.35" : "0.1"});
    }

    .shop-p-img-wrap {
      position: relative; overflow: hidden; height: 190px;
      background: ${dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
    }
    .shop-p-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .shop-p-card:hover .shop-p-img { transform: scale(1.06); }
    
    .shop-p-badge { position: absolute; top: 12px; left: 12px; padding: 4px 11px; border-radius: 99px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
    .shop-p-discount { position: absolute; top: 12px; right: 44px; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; background: rgba(239,68,68,0.88); color: #fff; }
    
    .shop-p-wishlist {
      position: absolute; top: 10px; right: 10px;
      width: 30px; height: 30px; border-radius: 50%;
      background: ${dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.85)"};
      backdrop-filter: blur(8px); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; transition: all 0.25s;
    }
    .shop-p-wishlist:hover { transform: scale(1.15); }

    .shop-p-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
    .shop-p-platform {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 99px;
      font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
      margin-bottom: 8px; border: 1px solid; align-self: flex-start;
    }
    .shop-p-name { font-family: ${FONT.display}; font-size: 15px; font-weight: 800; color: ${T.text}; margin-bottom: 4px; line-height: 1.3; }
    .shop-p-brand { font-size: 12px; color: ${T.textMuted}; font-weight: 600; margin-bottom: 8px; }
    .shop-p-desc { font-size: 12px; color: ${T.textSub}; line-height: 1.6; margin-bottom: 12px; flex: 1; }
    
    .shop-p-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .shop-p-tag { padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; background: ${T.accentSoft}; color: ${T.accent}; border: 1px solid ${T.accent}22; }
    
    .shop-p-rating-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .shop-p-rating-num { font-size: 12px; font-weight: 800; color: ${T.text}; }
    .shop-p-reviews { font-size: 11px; color: ${T.textMuted}; }
    
    .shop-p-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
    .shop-p-price { font-family: ${FONT.display}; font-size: 22px; font-weight: 800; color: ${T.text}; }
    .shop-p-original { font-size: 13px; color: ${T.textMuted}; text-decoration: line-through; }
    
    .shop-p-buy-btn {
      width: 100%; height: 44px; border-radius: 13px; border: none;
      background: linear-gradient(135deg, ${T.orange}, ${T.accent});
      color: #fff; font-size: 13px; font-weight: 800;
      font-family: ${FONT.body}; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      letter-spacing: 0.04em; text-transform: uppercase;
      box-shadow: 0 6px 20px ${T.orange}30;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .shop-p-buy-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px ${T.orange}40; filter: brightness(1.08); }

    .shop-empty { text-align: center; padding: 70px 20px; color: ${T.textSub}; }
    .shop-empty-icon { font-size: 52px; margin-bottom: 14px; }
    .shop-empty-title { font-family: ${FONT.display}; font-size: 19px; font-weight: 800; color: ${T.text}; margin-bottom: 6px; }

    @media (max-width: 900px) {
      .shop-hero-content { flex-direction: column; align-items: flex-start; }
      .shop-search-sort { margin-left: 0; width: 100%; }
      .shop-search-inp { width: 100%; }
    }
    @media (max-width: 600px) {
      .header { padding: 0 16px; }
      .shop-main { padding: 20px 16px; }
      .shop-hero { padding: 24px 20px; }
      .shop-hero-title { font-size: 28px; }
      .shop-product-grid { grid-template-columns: 1fr; gap: 16px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="shop-root">
        <div className="bg-image-layer"><img src={BG_IMAGES.shop || BG_IMAGES.diet} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        {/* UNIFIED HEADER BAR WITH MATCHING NAVIGATION BUTTON */}
        <div className="header">
          <button className="pr-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Store</span></div>
          <div className="h-right">
            <button className="shop-wishlist-h" onClick={() => setCategory(category === "wishlist" ? "all" : "wishlist")}>
              ♡ Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="shop-hero">
          <div className="shop-hero-content">
            <div>
              <div className="shop-hero-title">
                AshFit<span>Store</span>
              </div>
              <div className="shop-hero-sub">
                Handpicked supplements, vitamins, enhancers and gear — curated directly from trusted brand partners.
              </div>
              <div className="shop-hero-stats">
                {[
                  { val: PRODUCTS.length + "+", lbl: "Products" },
                  { val: "3", lbl: "Platforms" },
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
          <div className="shop-filters">
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
          <div className="shop-plat-filters">
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
            <strong style={{ color: T.textSub }}>Affiliate Disclosure:</strong> AshFitStore participates in partner affiliate programmes.
            When you click a product link and make a purchase, we may earn a small commission at no extra cost to you.
          </div>
        </div>
      </div>
    </>
  );
}