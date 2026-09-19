// src/components/ShopHeroAdBanner.jsx — Dynamic Sponsored Editorial Ad Carousel (No Prices, Direct Product Routing)
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { FONT } from "../theme";

export default function ShopHeroAdBanner({
  slides = [],
  dark = true,
  T = {},
  storeType = "common", // "common" | "male" | "female"
}) {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [totalSlides, isHovered]);

  if (!slides || slides.length === 0) return null;

  const current = slides[currentIdx] || slides[0];
  if (!current) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  };

  const handleBannerClick = () => {
    if (current.id) {
      navigate(`/shop/product/${current.id}`);
    }
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
      onClick={handleBannerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: currentTheme.gradient,
        border: `1px solid ${currentTheme.border}`,
        marginBottom: 28,
        cursor: "pointer",
        boxShadow: dark
          ? "0 18px 45px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 18px 40px -10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Subtle Halo Spotlight Effect */}
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
          padding: "26px 34px",
          position: "relative",
          zIndex: 2,
          gap: 24,
          minHeight: 220,
        }}
      >
        {/* Left Editorial Content Side */}
        <div style={{ flex: "1 1 440px", maxWidth: 640 }}>
          {/* Top Ticker Badges (No Price - Pure Brand & Category Spotlight) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
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
              {current.adTag || "FEATURED ATHLETE CHOICE"}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              <ShieldCheck size={13} /> 100% Verified Authentic
            </span>
          </div>

          {/* Brand Headline */}
          <div style={{ fontSize: 13, fontWeight: 700, color: currentTheme.badgeColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            {current.brand}
          </div>

          {/* Product Name */}
          <h2
            style={{
              margin: 0,
              fontFamily: FONT.display,
              fontSize: "clamp(20px, 3.2vw, 28px)",
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
              margin: "0 0 18px",
              fontSize: 13.5,
              color: T.textSub,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {current.tagline || current.description}
          </p>

          {/* Action CTA Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBannerClick();
              }}
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
                border: "none",
                cursor: "pointer",
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
              <span>Explore Details & Reviews</span>
              <ArrowRight size={15} />
            </button>

            <span style={{ fontSize: 11.5, color: T.textMuted, fontWeight: 600 }}>
              Click banner to view packaging, specs & verified ratings
            </span>
          </div>
        </div>

        {/* Right Product Image Spotlight Side */}
        <div
          style={{
            flex: "0 0 220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 190,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              filter: "blur(18px)",
              zIndex: 1,
            }}
          />

          <img
            src={current.image}
            alt={current.name}
            style={{
              maxHeight: 190,
              maxWidth: 190,
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
          <span style={{ fontWeight: 800, color: currentTheme.badgeColor }}>FEATURED SPOTLIGHT:</span>
          <span>Slide {currentIdx + 1} of {totalSlides}</span>
        </div>

        {/* Slide Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(i);
              }}
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
