// src/components/AddAffiliateProductModal.jsx — Dynamic Amazon Affiliate Product Importer
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { FONT } from "../theme";
import {
  extractAsin,
  buildAmazonAffiliateUrl,
  getAffiliateTag,
  setAffiliateTag,
} from "../config/affiliateConfig";
import { Plus, X, Link, Image, Tag, Sparkles, Check, Settings, ExternalLink } from "lucide-react";
import useUser from "../hooks/useUser";

export default function AddAffiliateProductModal({
  isOpen,
  onClose,
  defaultShop = "common", // "common" | "male" | "female"
  onProductAdded,
  dark = true,
  T = {},
}) {
  const { isAdmin } = useUser();
  const [shop, setShop] = useState(defaultShop);
  const [urlInput, setUrlInput] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("supplements");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("Recommended");
  const [tagsInput, setTagsInput] = useState("");
  const [currentTag, setCurrentTag] = useState(() => getAffiliateTag());

  const [showTagSettings, setShowTagSettings] = useState(false);
  const [tempTag, setTempTag] = useState(() => getAffiliateTag());
  const [tagSavedMsg, setTagSavedMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !isAdmin) return null;

  const detectedAsin = extractAsin(urlInput);

  const handleUrlBlur = () => {
    if (!urlInput.trim()) return;
    const asin = extractAsin(urlInput);
    if (asin && !imageUrl) {
      // Set high-res Amazon direct product image CDN URL if available
      setImageUrl(`https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`);
    }
  };

  const handleSaveAffiliateTag = () => {
    if (!tempTag.trim()) return;
    setAffiliateTag(tempTag.trim());
    setCurrentTag(tempTag.trim());
    setTagSavedMsg("Amazon Associate Tag updated across all shops! ✓");
    setTimeout(() => {
      setTagSavedMsg("");
      setShowTagSettings(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }
    if (!price.trim()) {
      setErrorMsg("Price is required.");
      return;
    }

    setSubmitting(true);

    const asin = extractAsin(urlInput);
    const finalAffiliateUrl = buildAmazonAffiliateUrl(urlInput || name, currentTag);

    // Calculate discount if originalPrice provided
    let discountStr = null;
    const numPrice = Number(String(price).replace(/[^0-9]/g, ""));
    const numOrig = Number(String(originalPrice).replace(/[^0-9]/g, ""));
    if (numPrice && numOrig && numOrig > numPrice) {
      const pct = Math.round(((numOrig - numPrice) / numOrig) * 100);
      discountStr = `${pct}% OFF`;
    }

    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : [category, "Amazon Prime"];

    const newDoc = {
      shop, // "common" | "male" | "female"
      name: name.trim(),
      brand: brand.trim() || "Amazon Certified",
      category,
      price: price.startsWith("₹") ? price : `₹${price}`,
      originalPrice: originalPrice ? (originalPrice.startsWith("₹") ? originalPrice : `₹${originalPrice}`) : null,
      discount: discountStr,
      rating: 4.8,
      reviews: 1,
      image:
        imageUrl.trim() ||
        (asin ? `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg` : "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80"),
      tags,
      description: description.trim() || "Premium lab-tested fitness & wellness product available on Amazon.",
      asin: asin || null,
      href: finalAffiliateUrl,
      badge: badge.trim() || null,
      badgeColor: badge === "Best Seller" ? "#f59e0b" : "#3b82f6",
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "affiliate_products"), newDoc);
      onProductAdded?.({ id: docRef.id, ...newDoc });
      onClose();
    } catch (err) {
      console.warn("Firestore product add warning, fallback to local:", err);
      onProductAdded?.({ id: `custom_${Date.now()}`, ...newDoc });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10006,
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 24,
          background: dark ? "#0a0d16" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
          color: dark ? "#f8fafc" : "#0f172a",
          boxShadow: dark
            ? "0 28px 70px rgba(0, 0, 0, 0.75), 0 0 30px rgba(245, 158, 11, 0.15)"
            : "0 24px 60px rgba(15, 23, 42, 0.14)",
          fontFamily: FONT.body,
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: dark ? "rgba(10, 13, 22, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, fontFamily: FONT.display }}>
                Add Amazon Affiliate Product
              </h3>
              <div style={{ fontSize: 11.5, color: dark ? "#94a3b8" : "#64748b" }}>
                Auto-injects your Associate Tag & publishes live to the shop
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setShowTagSettings(!showTagSettings)}
              title="Configure Amazon Associate Tag"
              style={{
                padding: "6px 10px",
                borderRadius: 9,
                background: showTagSettings
                  ? "rgba(245, 158, 11, 0.2)"
                  : dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#f59e0b",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Settings size={13} />
              <span>Tag: {currentTag}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: dark ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                border: "none",
                color: dark ? "#94a3b8" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Associate Tag Configuration Banner */}
        {showTagSettings && (
          <div
            style={{
              margin: "14px 22px 0",
              padding: "14px 16px",
              borderRadius: 14,
              background: dark ? "rgba(245, 158, 11, 0.08)" : "#fffbeb",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", marginBottom: 6 }}>
              ⚙️ Amazon Associate ID Setting
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 11.5, color: dark ? "#cbd5e1" : "#64748b", lineHeight: 1.4 }}>
              Enter your Amazon Associates tracking ID (e.g. <code>ashfitverse-21</code>). All affiliate links in the app will automatically use this tag.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="your-amazon-associate-tag"
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSaveAffiliateTag}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#f59e0b",
                  color: "#000",
                  border: "none",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Save Tag
              </button>
            </div>
            {tagSavedMsg && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: "#10b981", fontWeight: 700 }}>
                {tagSavedMsg}
              </div>
            )}
          </div>
        )}

        {/* Main Product Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
          {errorMsg && (
            <div style={{ padding: "10px", borderRadius: 10, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              {errorMsg}
            </div>
          )}

          {/* Target Shop Selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 6, textTransform: "uppercase" }}>
              Target Shop Destination
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { id: "common", label: "Common Shop", icon: "🛒", sub: "All Fitness & Gym" },
                { id: "male", label: "Men's Shop", icon: "⚡", sub: "Testosterone & Vitals" },
                { id: "female", label: "Women's Shop", icon: "🌸", sub: "PCOS, Cycle & Care" },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setShop(s.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: shop === s.id
                      ? "1.5px solid #f59e0b"
                      : dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                    background: shop === s.id
                      ? (dark ? "rgba(245, 158, 11, 0.14)" : "rgba(245, 158, 11, 0.08)")
                      : (dark ? "rgba(255,255,255,0.03)" : "#f8fafc"),
                    transition: "all 0.16s ease",
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: shop === s.id ? "#f59e0b" : T.text }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 10, color: dark ? "#64748b" : "#94a3b8" }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amazon Link / ASIN Input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
              AMAZON PRODUCT URL OR ASIN *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="https://www.amazon.in/dp/B07T48L8H3 or ASIN (e.g. B000GISTZ4)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlBlur}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>
            {detectedAsin && (
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={12} /> Detected ASIN: {detectedAsin} (Affiliate link auto-generated)
              </div>
            )}
          </div>

          {/* Name & Brand */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                PRODUCT TITLE *
              </label>
              <input
                type="text"
                placeholder="e.g. Optimum Nutrition Gold Standard 100% Whey"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                BRAND
              </label>
              <input
                type="text"
                placeholder="e.g. Optimum Nutrition"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Pricing & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                DISCOUNTED PRICE *
              </label>
              <input
                type="text"
                placeholder="₹2,999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                ORIGINAL MRP
              </label>
              <input
                type="text"
                placeholder="₹3,999"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  height: 42,
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12,
                  outline: "none",
                  padding: "0 10px",
                }}
              >
                <option value="supplements">Supplements & Whey</option>
                <option value="creatine">Creatine & Strength</option>
                <option value="preworkout">Pre-Workout & Energy</option>
                <option value="multivitamins">Vitamins & Recovery</option>
                <option value="gear">Gym Gear & Straps</option>
                <option value="pcos_pcod">PCOS & Hormones (Women)</option>
                <option value="menstrual">Period Care (Women)</option>
                <option value="sexual">Sexual Wellness</option>
                <option value="enhancers">Testosterone & Vitals (Men)</option>
                <option value="grooming">Grooming & Skincare</option>
              </select>
            </div>
          </div>

          {/* Image URL with Live Thumbnail Preview */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
              HIGH-RES PRODUCT IMAGE URL
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                placeholder="https://m.media-amazon.com/images/I/... or direct product photo"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
              {imageUrl && (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}
            </div>
          </div>

          {/* Description & Badge */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                KEY PRODUCT BENEFITS & DESCRIPTION
              </label>
              <textarea
                rows={2}
                placeholder="24g protein per serving. Pure isolate for maximum absorption..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
                HIGHLIGHT BADGE
              </label>
              <input
                type="text"
                placeholder="e.g. Best Seller, Top Rated"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 11,
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                  background: dark ? "#08090d" : "#ffffff",
                  color: dark ? "#f8fafc" : "#0f172a",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4 }}>
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              placeholder="Whey Isolate, Low Carb, 24g Protein, Amazon Prime"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 11,
                border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                background: dark ? "#08090d" : "#ffffff",
                color: dark ? "#f8fafc" : "#0f172a",
                fontSize: 12.5,
                outline: "none",
              }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                color: dark ? "#f8fafc" : "#0f172a",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 800,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{submitting ? "Publishing to Shop…" : "Publish Affiliate Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
