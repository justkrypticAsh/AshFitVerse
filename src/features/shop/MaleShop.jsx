// src/features/shop/MaleShop.jsx — Men's Wellness, Testosterone & Performance Shop
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { buildAmazonAffiliateUrl, getAffiliateTag } from "../../config/affiliateConfig";
import AddAffiliateProductModal from "../../components/AddAffiliateProductModal";
import ShopHeroAdBanner from "../../components/ShopHeroAdBanner";
import { MALE_PRODUCTS, logUserOrder } from "./productCatalog";
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
// SPONSORED PROMOTIONAL EDITORIAL SLIDES (NO PRICES, DIRECT PRODUCT LINK)
// ─────────────────────────────────────────────────────────────
const MALE_HERO_SLIDES = [
  {
    id: "101",
    name: "Kapiva Himalayan Pure Shilajit Resin with 60% Fulvic Acid (20g Jar)",
    brand: "Kapiva",
    asin: "B091J3147K",
    image: "/products/101.jpg",
    tagline: "Sourced from 18,000 ft Himalayan peaks. Clinically tested to boost natural free testosterone, stamina, and cellular ATP energy.",
    adTag: "🔥 TOP MEN'S BESTSELLER",
  },
  {
    id: "103",
    name: "Momentous Tongkat Ali 400mg LJ100 Standardized Extract (60 Capsules)",
    brand: "Momentous",
    asin: "B0B8QF54N6",
    image: "/products/103.jpg",
    tagline: "Unbinds SHBG, liberating bioavailable free testosterone for aggressive gym drive, strength, and recovery.",
    adTag: "⚡ ELITE TESTOSTERONE SUPPORT",
  },
  {
    id: "111",
    name: "SBD Powerlifting 10mm Competition Lever Belt (English Bridle Leather)",
    brand: "SBD Apparel",
    asin: "B08M3XKGKZ",
    image: "/products/111.jpg",
    tagline: "Patented gliding lever technology. Unmatched lumbar support and intra-abdominal stability for 250kg+ squats and deadlifts.",
    adTag: "🏆 WORLD CHAMPION GEAR",
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
  const affiliateTag = getAffiliateTag() || "ashfitverse-21";

  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
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
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            rating: d.data().rating || 4.8,
            reviews: d.data().reviews || 100,
          }));
          setDynamicProducts(list);
        },
        (err) => {
          console.warn("Firestore dynamic male products sync:", err);
        }
      );
      return () => unsub();
    } catch {}
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allProducts = useMemo(() => {
    return [...dynamicProducts, ...MALE_PRODUCTS];
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

  const css =
    generateCSS(T, dark) +
    `
    .m-shop-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted ? 1 : 0};transition:opacity 0.6s ease;position:relative;overflow-x:hidden;}
    .m-shop-header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark ? "rgba(8,9,13,0.92)" : "rgba(255,255,255,0.92)"};backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);}
    .m-shop-brand{font-family:${FONT.display};font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;}
    .m-shop-main{max-width:1200px;margin:0 auto;padding:24px 24px 80px;}
    .m-shop-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px;}
    .m-shop-card{border-radius:20px;overflow:hidden;background:${T.glass};border:1px solid ${T.glassBorder};display:flex;flex-direction:column;transition:all 0.24s cubic-bezier(0.16,1,0.3,1);position:relative;cursor:pointer;}
    .m-shop-card:hover{transform:translateY(-4px);border-color:${T.glassBorderHover};box-shadow:0 16px 40px rgba(0,0,0,${dark ? "0.45" : "0.08"});}
    .m-shop-img-box{position:relative;width:100%;height:190px;background:${dark ? "rgba(255,255,255,0.02)" : "#ffffff"};display:flex;align-items:center;justify-content:center;overflow:hidden;padding:12px;box-sizing:border-box;}
    .m-shop-img-box img{max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.3s ease;}
    .m-shop-card:hover .m-shop-img-box img{transform:scale(1.05);}
    .m-shop-buy-btn{width:100%;height:42px;border-radius:12px;border:none;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#ffffff;font-size:13px;font-weight:800;font-family:${FONT.display};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 3px 12px rgba(59,130,246,0.3);transition:all 0.16s ease;}
    .m-shop-buy-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    @media(max-width:768px){
      .m-shop-header{padding:0 14px;height:56px;}
      .m-shop-card-grid{grid-template-columns:1fr 1fr;gap:12px;}
      .m-shop-img-box{height:140px;}
    }
    @media(max-width:480px){
      .m-shop-card-grid{grid-template-columns:1fr;}
    }
  `;

  return (
    <div className="m-shop-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="m-shop-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/male-health")}
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
            <span>Men's Health Hub</span>
          </button>

          <div className="m-shop-brand" onClick={() => navigate("/male-health")}>
            <span>⚡</span>
            <span>
              Men's<span>Shop</span>
            </span>
          </div>
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
              <span>Add Item</span>
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
        {/* Dynamic Sponsored Hero Deal Carousel */}
        <ShopHeroAdBanner
          slides={MALE_HERO_SLIDES}
          affiliateTag={affiliateTag}
          dark={dark}
          T={T}
          storeType="male"
        />

        {/* Trust Badges Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { icon: "⚡", title: "Peak Testosterone Formulations", desc: "Clinically validated botanicals for male endocrine health" },
            { icon: "🛡️", title: "100% Lab Tested Purity", desc: "Gold grade Shilajit, Tongkat Ali & heavy metal screened" },
            { icon: "⭐", title: "Men's Community Ratings", desc: "Authentic in-app verified strength & stamina reviews" },
            { icon: "🚚", title: "Discreet Prime Delivery", desc: "Fast packaging dispatched straight from Amazon India" },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: dark ? "rgba(255,255,255,0.02)" : "#ffffff",
                border: `1px solid ${T.glassBorder}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
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

        {/* ── Filter & Search Control Bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
              maxWidth: "100%",
            }}
          >
            {MALE_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: active ? "none" : `1px solid ${T.glassBorder}`,
                    background: active
                      ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                      : dark
                      ? "rgba(255,255,255,0.04)"
                      : "#ffffff",
                    color: active ? "#ffffff" : T.textSub,
                    fontSize: 12.5,
                    fontWeight: 750,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: active ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                    transition: "all 0.16s ease",
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Sort Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  color: T.textMuted,
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search shilajit, tongs, belt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: 38,
                  padding: "0 12px 0 34px",
                  borderRadius: 12,
                  border: `1px solid ${T.glassBorder}`,
                  background: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
                  color: T.text,
                  fontSize: 12.5,
                  outline: "none",
                  width: 210,
                }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                height: 38,
                padding: "0 12px",
                borderRadius: 12,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
                color: T.text,
                fontSize: 12.5,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="popular">Curated Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── Product Card Grid ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              borderRadius: 20,
              background: dark ? "rgba(255,255,255,0.02)" : "#f8fafc",
              border: `1px solid ${T.glassBorder}`,
              marginTop: 20,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>No products found</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
              Try adjusting your search or category filter.
            </div>
          </div>
        ) : (
          <div className="m-shop-card-grid">
            {filtered.map((p) => {
              const affiliateUrl = buildAmazonAffiliateUrl(p.asin || p.href || p.name);
              const isWished = wishlist.includes(p.id);

              return (
                <div
                  key={p.id}
                  className="m-shop-card"
                  onClick={() => navigate(`/shop/product/${p.id}`)}
                  title="Click to view full specifications, photos & in-app reviews"
                >
                  {/* Image Container with Badges */}
                  <div className="m-shop-img-box">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
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

                    {/* In-App Reviews Trigger */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shop/product/${p.id}#reviews-section`);
                      }}
                      title="Read authentic athlete reviews & post yours"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                        cursor: "pointer",
                        padding: "6px 9px",
                        borderRadius: 8,
                        background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                        border: `1px solid ${T.glassBorder}`,
                        transition: "all 0.16s ease",
                      }}
                    >
                      <div style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 3 }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 11.5, fontWeight: 800 }}>In-App Reviews</span>
                      </div>
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
                        <span>View / Rate →</span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        logUserOrder(p, user);
                      }}
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
          <strong style={{ color: T.textSub }}>Amazon Associate Disclosure:</strong> AshFitVerse is a participant in the Amazon Services LLC Associates Program. When you purchase through our links, we earn an affiliate commission at zero extra cost to you. All product recommendations are independently vetted and selected for quality and athletic performance.
        </div>
      </main>

      {/* Admin Add Product Modal */}
      {showAddProductModal && (
        <AddAffiliateProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          defaultShop="male"
        />
      )}
    </div>
  );
}
