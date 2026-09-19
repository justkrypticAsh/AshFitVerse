// src/components/ShopHeroAdBanner.jsx — Dynamic Sponsored eCommerce Ad Carousel
import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, Star, ChevronLeft, ChevronRight, Clock, ShieldCheck, Zap } from "lucide-react";
import { buildAmazonAffiliateUrl } from "../config/affiliateConfig";
import { FONT } from "../theme";

export default function ShopHeroAdBanner({
  slides = [],
  onOpenReview,
  affiliateTag = "ashfitverse-21",
  dark = true,
  T = {},
  storeType = "common", // "common" | "male" | "female"
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, [totalSlides, isHovered]);

  if (!slides || slides.length === 0) return null;

  const current = slides[currentIdx] || slides[0];
  if (!current) return null;
  const affiliateUrl = buildAmazonAffiliateUrl(current.asin || current.link, affiliateTag);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  };

  // Color theme per store type
  const themeAccents = {
    common: {
      gradient: dark
        ? "linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(59,130,246,0.18) 50%, rgba(16,185,129,0.15) 100%)"
        : "linear-gradient(135deg, #fffbeb 0%, #eff6ff 50%, #ecfdf5 100%)",
      border: dark ? "rgba(245,158,11,0.35)" : "#fde68a",
      badgeBg: "rgba(245,158,11,0.18)",
      badgeColor: "#f59e0b",
      btnBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      btnShadow: "0 8px 24px rgba(245,158,11,0.35)",
    },
    male: {
      gradient: dark
        ? "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(37,99,235,0.18) 50%, rgba(147,51,234,0.15) 100%)"
        : "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 50%, #faf5ff 100%)",
      border: dark ? "rgba(59,130,246,0.4)" : "#bfdbfe",
      badgeBg: "rgba(59,130,246,0.18)",
      badgeColor: "#3b82f6",
      btnBg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      btnShadow: "0 8px 24px rgba(59,130,246,0.35)",
    },
    female: {
      gradient: dark
        ? "linear-gradient(135deg, rgba(236,72,153,0.25) 0%, rgba(219,39,119,0.18) 50%, rgba(168,85,247,0.15) 100%)"
        : "linear-gradient(135deg, #fdf2f8 0%, #fdf4ff 50%, #fff1f2 100%)",
      border: dark ? "rgba(236,72,153,0.4)" : "#fbcfe8",
      badgeBg: "rgba(236,72,153,0.18)",
      badgeColor: "#ec4899",
      btnBg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      btnShadow: "0 8px 24px rgba(236,72,153,0.35)",
    },
  };

  const currentTheme = themeAccents[storeType] || themeAccents.common;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: currentTheme.gradient,
        border: `1px solid ${currentTheme.border}`,
        marginBottom: 28,
        boxShadow: dark
          ? "0 18px 45px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 18px 40px -10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "all 0.4s ease",
      }}
    >
      {/* Dynamic Background Glow Effect */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: dark
            ? "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "24px 32px",
          position: "relative",
          zIndex: 2,
          gap: 24,
          minHeight: 240,
        }}
      >
        {/* Left Content Side */}
        <div style={{ flex: "1 1 440px", maxWidth: 640 }}>
          {/* Top Ticker Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 99,
                background: currentTheme.badgeBg,
                color: currentTheme.badgeColor,
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <Zap size={12} fill="currentColor" />
              {current.adTag || "SPONSORED BRAND SPOTLIGHT"}
            </span>

            {current.discount && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 99,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                }}
              >
                🔥 {current.discount}
              </span>
            )}

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: T.textMuted || "#94a3b8",
              }}
            >
              <Clock size={11} /> Limited Time Prime Deal
            </span>
          </div>

          {/* Product Headline & Brand */}
          <div style={{ fontSize: 13, fontWeight: 700, color: currentTheme.badgeColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            {current.brand}
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: FONT.display,
              fontSize: "clamp(20px, 3vw, 27px)",
              fontWeight: 900,
              lineHeight: 1.25,
              color: T.text,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            {current.name}
          </h2>

          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13.5,
              color: T.textSub,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {current.tagline || current.description}
          </p>

          {/* Price & Rating Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: currentTheme.badgeColor }}>
                {current.price}
              </span>
              {current.originalPrice && (
                <span style={{ fontSize: 14, textDecoration: "line-through", color: T.textMuted, fontWeight: 600 }}>
                  {current.originalPrice}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 8,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
              }}
            >
              <Star size={13} fill="#eab308" color="#eab308" />
              <span>{current.rating || 4.8}</span>
              <span style={{ color: T.textMuted, fontWeight: 500 }}>
                ({(current.reviews || 2400).toLocaleString()}+ athletes)
              </span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 14,
                background: currentTheme.btnBg,
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: currentTheme.btnShadow,
                transition: "transform 0.2s ease, filter 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.filter = "none";
              }}
            >
              <span>Claim Deal on Amazon</span>
              <ExternalLink size={15} />
            </a>

            {onOpenReview && (
              <button
                onClick={() => onOpenReview(current)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 14,
                  background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${T.glassBorder}`,
                  color: T.text,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                <Star size={14} color="#f59e0b" />
                <span>Read In-App Reviews</span>
              </button>
            )}

            <div
              style={{
                fontSize: 11,
                color: T.textMuted,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginLeft: "auto",
              }}
            >
              <ShieldCheck size={12} color="#10b981" /> Verified Partner
            </div>
          </div>
        </div>

        {/* Right Product Image Spotlight Side */}
        <div
          style={{
            flex: "0 0 240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 200,
          }}
        >
          {/* Subtle Halo Spotlight Behind Image */}
          <div
            style={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
              filter: "blur(18px)",
              zIndex: 1,
            }}
          />

          <img
            src={current.image}
            alt={current.name}
            style={{
              maxHeight: 210,
              maxWidth: 210,
              objectFit: "contain",
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.35))",
              transition: "transform 0.4s ease",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Floating Discount Tag */}
          {current.discount && (
            <div
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                zIndex: 3,
                padding: "5px 9px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 900,
                boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
              }}
            >
              {current.discount}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Bar with Arrows and Slide Dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          background: dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.5)",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
          fontSize: 11,
          color: T.textMuted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, color: currentTheme.badgeColor }}>FEATURED OFFERS:</span>
          <span>Slide {currentIdx + 1} of {totalSlides}</span>
        </div>

        {/* Slide Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              style={{
                width: i === currentIdx ? 24 : 7,
                height: 7,
                borderRadius: 99,
                background: i === currentIdx ? currentTheme.badgeColor : dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next / Prev Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={handlePrev}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "#ffffff",
              color: T.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Previous deal"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            onClick={handleNext}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
              background: dark ? "rgba(255,255,255,0.06)" : "#ffffff",
              color: T.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Next deal"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
