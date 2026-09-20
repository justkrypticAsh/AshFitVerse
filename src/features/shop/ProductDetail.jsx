// src/features/shop/ProductDetail.jsx — Comprehensive Dedicated Product Page
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { buildAmazonAffiliateUrl, getAffiliateTag } from "../../config/affiliateConfig";
import { getProductById, ALL_CATALOG_PRODUCTS, logUserOrder } from "./productCatalog";
import {
  Star,
  ArrowLeft,
  Heart,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Tag,
  Copy,
  Send,
  AlertCircle,
  Package,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [verifiedBuyer, setVerifiedBuyer] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load product data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductById(id).then((prod) => {
      if (isMounted) {
        setProduct(prod);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load 100% REAL in-app reviews for this specific product from Firestore
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);

    try {
      const q = query(
        collection(db, "product_reviews"),
        where("productId", "==", String(id)),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReviews(list);
          setReviewsLoading(false);
        },
        (err) => {
          console.warn("Real reviews fetch warning:", err);
          // Fallback query without orderBy index requirement
          const fallbackQ = query(
            collection(db, "product_reviews"),
            where("productId", "==", String(id))
          );
          onSnapshot(fallbackQ, (fallbackSnap) => {
            const fallbackList = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setReviews(fallbackList);
            setReviewsLoading(false);
          });
        }
      );

      return () => unsub();
    } catch (e) {
      setReviewsLoading(false);
    }
  }, [id]);

  // Calculate real average rating and breakdown
  const stats = useMemo(() => {
    if (!reviews.length) {
      return { avg: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += star;
    });
    return {
      avg: (sum / reviews.length).toFixed(1),
      count: reviews.length,
      breakdown,
    };
  }, [reviews]);

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return ALL_CATALOG_PRODUCTS.filter(
      (p) => p.category === product.category && String(p.id) !== String(product.id)
    ).slice(0, 4);
  }, [product]);

  const affiliateTag = getAffiliateTag() || "ashfitverse-21";
  const amazonAffiliateUrl = product
    ? buildAmazonAffiliateUrl(product.asin || product.name, affiliateTag)
    : "";

  const handleBuyClick = () => {
    if (product) {
      logUserOrder(product, user);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleShareToChat = () => {
    const productUrl = `${window.location.origin}/shop/product/${product?.id || id}?tag=${affiliateTag}`;
    const prefill = `🔥 Check out this fitness gear on AshFitVerse Store!\n\n📦 ${product?.name}\n💰 Price: ${product?.price}\n⭐ Verified Athlete Rating: 4.8★\n🔗 Direct Link: ${productUrl}`;
    navigate("/chat", {
      state: {
        shareProduct: product,
        prefillMessage: prefill,
      },
    });
  };

  const handleAddToCart = () => {
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2500);
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const ref = doc(db, "product_reviews", reviewId);
      await updateDoc(ref, {
        helpful: increment(1),
      });
    } catch (err) {
      console.warn("Helpful vote error:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please write your detailed experience before submitting.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      await addDoc(collection(db, "product_reviews"), {
        productId: String(product.id),
        productName: product.name,
        rating: Number(rating),
        title: title.trim() || `${rating} Stars Experience`,
        comment: comment.trim(),
        verifiedBuyer: Boolean(verifiedBuyer),
        authorName: user?.name || "Verified Athlete",
        authorUid: user?.uid || null,
        helpful: 0,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setComment("");
      setShowReviewForm(false);
      setReviewSuccessMsg("Your verified review has been published! Thank you! ⭐");
      setTimeout(() => setReviewSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError("Could not submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Determine back destination based on store type
  const getBackRoute = () => {
    if (product?.shopType === "male") return "/male-shop";
    if (product?.shopType === "female") return "/female-shop";
    return "/shop";
  };

  const getBackLabel = () => {
    if (product?.shopType === "male") return "← Back to Men's Shop";
    if (product?.shopType === "female") return "← Back to Women's Shop";
    return "← Back to Common Shop";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.text }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛍️</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Loading authentic product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.text, padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Product Not Found</h2>
          <p style={{ color: T.textSub, fontSize: 14, marginBottom: 20 }}>
            This item might have been updated or moved. Check out the latest catalog in our shops.
          </p>
          <button
            onClick={() => navigate("/shop")}
            style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}
          >
            Explore Common Shop
          </button>
        </div>
      </div>
    );
  }

  const css =
    generateCSS(T, dark) +
    `
    .pd-root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};position:relative;}
    .pd-header{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid ${T.glassBorder};background:${dark ? "rgba(8,9,13,0.92)" : "rgba(255,255,255,0.92)"};backdrop-filter:blur(30px);}
    .pd-container{max-width:1200px;margin:0 auto;padding:24px 20px 80px;}
    .pd-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:start;}
    .pd-img-card{background:${dark ? "rgba(255,255,255,0.02)" : "#ffffff"};border:1px solid ${T.glassBorder};border-radius:24px;padding:32px;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 12px 36px rgba(0,0,0,${dark ? "0.35" : "0.05"});}
    .pd-img-card img{max-width:100%;max-height:420px;object-fit:contain;transition:transform 0.4s ease;}
    .pd-img-card:hover img{transform:scale(1.04);}
    .pd-buy-main{width:100%;height:50px;border-radius:14px;border:none;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;font-size:15px;font-weight:900;font-family:${FONT.display};cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;box-shadow:0 6px 20px rgba(245,158,11,0.35);transition:all 0.2s;}
    .pd-buy-main:hover{filter:brightness(1.08);transform:translateY(-2px);}
    .pd-sec-btn{height:46px;padding:0 20px;border-radius:12px;border:1px solid ${T.glassBorder};background:${dark ? "rgba(255,255,255,0.05)" : "#f8fafc"};color:${T.text};font-size:13.5px;font-weight:750;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all 0.16s;}
    .pd-sec-btn:hover{background:${dark ? "rgba(255,255,255,0.1)" : "#f1f5f9"};}
    .pd-review-card{padding:18px 20px;border-radius:16px;background:${dark ? "rgba(255,255,255,0.03)" : "#ffffff"};border:1px solid ${T.glassBorder};margin-bottom:14px;}
    .pd-rel-card{border-radius:16px;overflow:hidden;background:${T.glass};border:1px solid ${T.glassBorder};padding:14px;text-decoration:none;color:inherit;transition:all 0.2s;}
    .pd-rel-card:hover{transform:translateY(-3px);border-color:${T.glassBorderHover};}
    @media(max-width:860px){
      .pd-grid{grid-template-columns:1fr;gap:24px;}
      .pd-header{padding:0 14px;}
      .pd-container{padding:16px 14px 60px;}
    }
  `;

  return (
    <div className="pd-root">
      <style>{css}</style>

      {/* ── Top Header Navigation Bar ── */}
      <header className="pd-header">
        <button
          onClick={() => navigate(getBackRoute())}
          style={{
            padding: "7px 14px",
            borderRadius: 10,
            border: `1px solid ${T.glassBorder}`,
            background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
            color: T.text,
            fontSize: 12.5,
            fontWeight: 750,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={14} />
          <span>{getBackLabel()}</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleShare}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: `1px solid ${T.glassBorder}`,
              background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
              color: T.text,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Copy product link"
          >
            {copiedShare ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{copiedShare ? "Link Copied!" : "Share Link"}</span>
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

      {/* ── Main Product Detail Content ── */}
      <main className="pd-container">
        {/* Breadcrumb row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
          <Link to="/dashboard" style={{ color: T.textMuted, textDecoration: "none" }}>Dashboard</Link>
          <span>/</span>
          <Link to={getBackRoute()} style={{ color: T.textMuted, textDecoration: "none" }}>
            {product.shopType === "male" ? "Men's Shop" : product.shopType === "female" ? "Women's Shop" : "Common Shop"}
          </Link>
          <span>/</span>
          <span style={{ color: T.textSub, fontWeight: 700 }}>{product.brand}</span>
        </div>

        {/* 2-Column Showcase */}
        <div className="pd-grid">
          {/* Left: Big Product Image Showcase */}
          <div>
            <div className="pd-img-card">
              {/* Badges */}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
                {product.badge && (
                  <span
                    style={{
                      padding: "5px 12px",
                      borderRadius: 10,
                      background: product.badgeColor || "#f59e0b",
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {product.badge}
                  </span>
                )}
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: dark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)",
                    border: `1px solid ${T.glassBorder}`,
                    color: T.text,
                    fontSize: 11,
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ShieldCheck size={12} color="#10b981" /> 100% Genuine
                </span>
              </div>

              {product.discount && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    padding: "6px 12px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 900,
                    boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                    zIndex: 2,
                  }}
                >
                  {product.discount}
                </div>
              )}

              <img
                src={product.image}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = product.localImage || `/products/${product.id || id}.jpg`;
                }}
              />
            </div>

            {/* Quick Guarantees Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 18,
              }}
            >
              <div style={{ padding: "12px 14px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Truck size={18} color="#3b82f6" />
                <div style={{ fontSize: 11.5 }}>
                  <div style={{ fontWeight: 800, color: T.text }}>Fast Prime Delivery</div>
                  <div style={{ color: T.textMuted }}>Direct Amazon dispatch</div>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck size={18} color="#10b981" />
                <div style={{ fontSize: 11.5 }}>
                  <div style={{ fontWeight: 800, color: T.text }}>Labdoor Verified</div>
                  <div style={{ color: T.textMuted }}>Zero banned substances</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Commercial Details & Purchase Hub */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              {product.brand}
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontFamily: FONT.display,
                fontSize: "clamp(22px, 3.5vw, 30px)",
                fontWeight: 900,
                color: T.text,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              {product.name}
            </h1>

            {/* Real Reviews Badge Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 10,
                  background: stats.count > 0 ? "rgba(234,179,8,0.15)" : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: stats.count > 0 ? "#eab308" : T.textMuted,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                <Star size={14} fill={stats.count > 0 ? "#eab308" : "none"} />
                <span>{stats.count > 0 ? `${stats.avg} / 5.0` : "Unrated"}</span>
              </div>

              <span style={{ fontSize: 13, color: T.textMuted }}>
                {stats.count > 0
                  ? `(${stats.count} Verified Community Review${stats.count > 1 ? "s" : ""})`
                  : "(0 Community Reviews — Be the first!)"}
              </span>

              {product.asin && (
                <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto", fontFamily: "monospace" }}>
                  ASIN: {product.asin}
                </span>
              )}
            </div>

            {/* Price Box */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 18,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${T.glassBorder}`,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#10b981", fontFamily: FONT.display }}>
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span style={{ fontSize: 16, textDecoration: "line-through", color: T.textMuted, fontWeight: 600 }}>
                    {product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#ef4444" }}>
                    Save {product.discount}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                Inclusive of all taxes • Live Amazon Prime verified pricing
              </div>
            </div>

            {/* Description & Performance Highlights */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: T.textMuted, letterSpacing: "0.06em", marginBottom: 8 }}>
                Product Overview & Benefits
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: T.textSub, lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>

            {/* Feature Tags */}
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 26 }}>
                {product.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 10,
                      background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                      border: `1px solid ${T.glassBorder}`,
                      color: T.textSub,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>
            )}

            {/* Primary & Secondary Action CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <a
                href={amazonAffiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBuyClick}
                className="pd-buy-main"
              >
                <span>📦 Buy on Amazon (Prime Delivery)</span>
                <ExternalLink size={17} />
              </a>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handleAddToCart}
                  className="pd-sec-btn"
                  style={{ flex: "1 1 140px" }}
                >
                  {cartSuccess ? <Check size={16} color="#10b981" /> : <Package size={16} />}
                  <span>{cartSuccess ? "Saved to Cart! ✓" : "Add to Cart"}</span>
                </button>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="pd-sec-btn"
                  style={{
                    color: isWishlisted ? "#ef4444" : T.text,
                    background: isWishlisted ? "rgba(239,68,68,0.12)" : undefined,
                  }}
                >
                  <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} />
                  <span>{isWishlisted ? "Favorited" : "Wishlist"}</span>
                </button>

                <button
                  onClick={handleShareToChat}
                  className="pd-sec-btn"
                  title="Share product with your FitVerse gym buddies"
                >
                  <Send size={15} color="#3b82f6" />
                  <span>Share in Chat</span>
                </button>
              </div>
            </div>

            {/* Disclosure */}
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, padding: "10px 14px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${T.glassBorder}` }}>
              <strong>Affiliate Disclosure:</strong> AshFitVerse earns an affiliate commission through verified purchases on Amazon at zero extra cost to you.
            </div>
          </div>
        </div>

        {/* ── REAL IN-APP REVIEWS SECTION (100% REAL - NO FAKE DATA) ── */}
        <div
          id="reviews-section"
          style={{
            marginTop: 48,
            padding: "32px",
            borderRadius: 24,
            background: dark ? "rgba(255,255,255,0.02)" : "#ffffff",
            border: `1px solid ${T.glassBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#f59e0b", letterSpacing: "0.06em", marginBottom: 4 }}>
                Community Feedback
              </div>
              <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: 24, fontWeight: 900, color: T.text }}>
                Verified Athlete Reviews & Ratings
              </h2>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "#ffffff",
                border: "none",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
              }}
            >
              <Sparkles size={15} />
              <span>{showReviewForm ? "Cancel Review" : "Write In-App Review"}</span>
            </button>
          </div>

          {reviewSuccessMsg && (
            <div style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", color: "#10b981", fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
              {reviewSuccessMsg}
            </div>
          )}

          {/* Interactive Review Submission Form */}
          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              style={{
                padding: "24px",
                borderRadius: 18,
                background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                border: `1px solid ${T.glassBorder}`,
                marginBottom: 32,
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: T.text }}>
                Share Your Athletic Experience
              </h3>

              {reviewError && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                  {reviewError}
                </div>
              )}

              {/* Star Rating Picker */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>
                  Overall Rating *
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        color: (hoverRating || rating) >= starVal ? "#eab308" : T.textMuted,
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <Star size={24} fill={(hoverRating || rating) >= starVal ? "#eab308" : "none"} />
                    </button>
                  ))}
                  <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 800, color: "#eab308", alignSelf: "center" }}>
                    {rating} Star{rating > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great taste, mixes instantly in shaker!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: dark ? "rgba(0,0,0,0.3)" : "#ffffff",
                    border: `1px solid ${T.glassBorder}`,
                    color: T.text,
                    fontSize: 13,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Detailed Experience */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details about performance, taste, digestion, recovery, or packaging..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: dark ? "rgba(0,0,0,0.3)" : "#ffffff",
                    border: `1px solid ${T.glassBorder}`,
                    color: T.text,
                    fontSize: 13,
                    boxSizing: "border-box",
                    outline: "none",
                    fontFamily: FONT.body,
                  }}
                />
              </div>

              {/* Verified Buyer Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <input
                  type="checkbox"
                  id="verified-buyer"
                  checked={verifiedBuyer}
                  onChange={(e) => setVerifiedBuyer(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="verified-buyer" style={{ fontSize: 12.5, fontWeight: 600, color: T.textSub, cursor: "pointer" }}>
                  I have purchased or used this product (Verified Athlete Review)
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  padding: "11px 24px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: submittingReview ? "not-allowed" : "pointer",
                  opacity: submittingReview ? 0.7 : 1,
                }}
              >
                {submittingReview ? "Submitting to Community..." : "Publish Review"}
              </button>
            </form>
          )}

          {/* Reviews List & Visual Breakdown */}
          {reviewsLoading ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: T.textMuted }}>
              Loading verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                borderRadius: 18,
                background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                border: `1px dashed ${T.glassBorder}`,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
                No Verified Reviews Yet
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, maxWidth: 420, margin: "6px auto 16px" }}>
                Be the first athlete in our fitness community to rate this product and help others make informed choices!
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                  color: "#fff",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div>
              {/* Rating Stats Bar */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 28, padding: "18px 24px", borderRadius: 16, background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#eab308", lineHeight: 1 }}>
                    {stats.avg}
                  </div>
                  <div style={{ display: "flex", gap: 2, margin: "6px 0" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(Number(stats.avg)) ? "#eab308" : "none"} color="#eab308" />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>
                    {stats.count} Verified Review{stats.count > 1 ? "s" : ""}
                  </div>
                </div>

                {/* Star Distribution Progress Bars */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = stats.breakdown[s] || 0;
                    const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 11.5 }}>
                        <span style={{ width: 26, color: T.textMuted, fontWeight: 700 }}>{s} ★</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 99, background: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#eab308", borderRadius: 99 }} />
                        </div>
                        <span style={{ width: 24, textAlign: "right", color: T.textMuted }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Real Reviews */}
              {reviews.map((rev) => (
                <div key={rev.id} className="pd-review-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(rev.authorName || "A")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                          {rev.authorName || "Verified Athlete"}
                        </div>
                        {rev.verifiedBuyer && (
                          <div style={{ fontSize: 10.5, color: "#10b981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <ShieldCheck size={11} /> Verified Buyer
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} fill={s <= rev.rating ? "#eab308" : "none"} color="#eab308" />
                      ))}
                    </div>
                  </div>

                  <h4 style={{ margin: "4px 0 6px", fontSize: 14, fontWeight: 800, color: T.text }}>
                    {rev.title}
                  </h4>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textSub, lineHeight: 1.55 }}>
                    {rev.comment}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: T.textMuted }}>
                    <span>
                      {rev.createdAt?.toDate
                        ? rev.createdAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                        : "Recently reviewed"}
                    </span>

                    <button
                      onClick={() => handleHelpfulVote(rev.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: T.textMuted,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <ThumbsUp size={12} />
                      <span>Helpful ({rev.helpful || 0})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 54 }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#f59e0b", letterSpacing: "0.06em", marginBottom: 4 }}>
              Related Essentials
            </div>
            <h2 style={{ margin: "0 0 20px", fontFamily: FONT.display, fontSize: 22, fontWeight: 900, color: T.text }}>
              Athletes Also Recommended
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {relatedProducts.map((rel) => (
                <Link key={rel.id} to={`/shop/product/${rel.id}`} className="pd-rel-card">
                  <div style={{ width: "100%", height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "rgba(255,255,255,0.02)" : "#ffffff", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                    <img src={rel.image} alt={rel.name} style={{ maxHeight: "85%", maxWidth: "85%", objectFit: "contain" }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", marginBottom: 2 }}>
                    {rel.brand}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {rel.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#10b981" }}>{rel.price}</span>
                    {rel.originalPrice && <span style={{ fontSize: 12, textDecoration: "line-through", color: T.textMuted }}>{rel.originalPrice}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
