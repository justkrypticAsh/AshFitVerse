// src/animations.js
// ─────────────────────────────────────────────────────────────────────────────
// AshFitVerse — Global Animation System
// Uses: Framer Motion (component animations) + Lenis (smooth scroll)
// Works on: macOS, Windows, Android, iOS — all browsers
//
// HOW TO USE:
//   1. Wrap App in <SmoothScrollProvider> (already done in main.jsx via initSmoothScroll)
//   2. Use <FadeUp>, <FadeIn>, <ScaleIn>, <SlideIn> etc for elements
//   3. Use <StaggerChildren> to animate lists
//   4. Use <PageTransition> in PageWrapper.jsx
//   5. Use motion variants directly for custom needs
//
// INSTALL (run in project root):
//   npm install framer-motion lenis
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, createContext, useContext } from "react";
import {
  motion, AnimatePresence, useInView,
  useScroll, useTransform, useSpring,
  useReducedMotion,
} from "framer-motion";

// ── 1. SMOOTH SCROLL SETUP (Lenis) ───────────────────────────────────────────
// Call this once in main.jsx / App.jsx
let lenisInstance = null;

export function initSmoothScroll() {
  // Don't run on SSR or if already initialised
  if (typeof window === "undefined" || lenisInstance) return;

  import("lenis").then(({ default: Lenis }) => {
    lenisInstance = new Lenis({
      duration:    1.2,          // Scroll duration multiplier
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
      smoothTouch: false,        // Keep native momentum on touch (iOS feels better)
      direction:   "vertical",
      gestureDirection: "vertical",
      infinite:    false,
    });

    // Lenis needs RAF to tick
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Expose globally for imperative scrollTo
    window.__lenis = lenisInstance;
  }).catch(() => {
    // Lenis not installed — graceful fallback (native scroll still works)
    console.warn("AshFitVerse: Lenis not found. Run: npm install lenis");
  });
}

// Scroll to an element or position
export function scrollTo(target, options = {}) {
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { duration: 1, ...options });
  } else {
    if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }
}

// ── 2. SPRING CONFIGS ─────────────────────────────────────────────────────────
export const SPRING = {
  // Fast, snappy — buttons, toggles
  snappy: { type:"spring", stiffness:400, damping:28, mass:0.8 },
  // Smooth, bouncy — cards, modals
  bounce: { type:"spring", stiffness:300, damping:20, mass:0.9 },
  // Gentle — page transitions, large elements
  gentle: { type:"spring", stiffness:200, damping:26, mass:1.0 },
  // Ultra smooth — drawers, sidebars
  smooth: { type:"spring", stiffness:180, damping:30, mass:1.1 },
  // Micro interactions — hover states
  micro:  { type:"spring", stiffness:600, damping:30, mass:0.6 },
};

// ── 3. EASING CURVES ──────────────────────────────────────────────────────────
export const EASE = {
  appleOut:   [0.25, 0.46, 0.45, 0.94],
  appleInOut: [0.45, 0.05, 0.55, 0.95],
  expo:       [0.16, 1,    0.3,  1   ],
  back:       [0.34, 1.56, 0.64, 1   ],
  smooth:     [0.4,  0,    0.2,  1   ],
};

// ── 4. ANIMATION VARIANTS ─────────────────────────────────────────────────────
export const VARIANTS = {
  // Fade up — most common
  fadeUp: {
    hidden:  { opacity:0, y:24    },
    visible: { opacity:1, y:0, transition:{ duration:0.55, ease:EASE.expo } },
    exit:    { opacity:0, y:-16,  transition:{ duration:0.28, ease:EASE.appleOut } },
  },

  // Fade in — simple
  fadeIn: {
    hidden:  { opacity:0           },
    visible: { opacity:1, transition:{ duration:0.45, ease:EASE.appleOut } },
    exit:    { opacity:0, transition:{ duration:0.22 } },
  },

  // Scale in — modals, popups
  scaleIn: {
    hidden:  { opacity:0, scale:0.88, y:8    },
    visible: { opacity:1, scale:1,    y:0, transition:{ duration:0.38, ease:EASE.back } },
    exit:    { opacity:0, scale:0.94, y:4, transition:{ duration:0.22, ease:EASE.appleOut } },
  },

  // Slide from right — page transition
  slideRight: {
    hidden:  { opacity:0, x:60  },
    visible: { opacity:1, x:0,  transition:{ duration:0.48, ease:EASE.expo } },
    exit:    { opacity:0, x:-40,transition:{ duration:0.30, ease:EASE.appleOut } },
  },

  // Slide from left
  slideLeft: {
    hidden:  { opacity:0, x:-60 },
    visible: { opacity:1, x:0,  transition:{ duration:0.48, ease:EASE.expo } },
    exit:    { opacity:0, x:40, transition:{ duration:0.30, ease:EASE.appleOut } },
  },

  // Slide from bottom — bottom sheets, toasts
  slideUp: {
    hidden:  { opacity:0, y:60  },
    visible: { opacity:1, y:0,  transition:{ duration:0.42, ease:EASE.expo } },
    exit:    { opacity:0, y:60, transition:{ duration:0.28, ease:EASE.appleOut } },
  },

  // Card — slight elevation + scale
  card: {
    hidden:  { opacity:0, y:18, scale:0.97 },
    visible: { opacity:1, y:0,  scale:1,   transition:{ duration:0.50, ease:EASE.expo } },
    exit:    { opacity:0, y:-8, scale:0.98,transition:{ duration:0.24 } },
  },

  // Stagger container
  stagger: {
    hidden:  {},
    visible: { transition:{ staggerChildren:0.07, delayChildren:0.05 } },
  },

  // Stagger item
  staggerItem: {
    hidden:  { opacity:0, y:20 },
    visible: { opacity:1, y:0, transition:{ duration:0.45, ease:EASE.expo } },
  },

  // Blur in — premium reveal
  blurIn: {
    hidden:  { opacity:0, filter:"blur(12px)", y:12 },
    visible: { opacity:1, filter:"blur(0px)",  y:0,  transition:{ duration:0.55, ease:EASE.expo } },
    exit:    { opacity:0, filter:"blur(8px)",  y:-8, transition:{ duration:0.26 } },
  },

  // Sidebar
  sidebar: {
    hidden:  { x:"-100%", opacity:0 },
    visible: { x:0,       opacity:1, transition:{ duration:0.38, ease:EASE.expo } },
    exit:    { x:"-100%", opacity:0, transition:{ duration:0.28, ease:EASE.appleOut } },
  },

  // Number counter (for stat cards)
  counter: {
    hidden:  { opacity:0, y:12, scale:0.9  },
    visible: { opacity:1, y:0,  scale:1,   transition:{ duration:0.50, ease:EASE.back } },
  },
};

// ── 5. SCROLL-TRIGGERED HOOK ──────────────────────────────────────────────────
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const inView = useInView(ref, {
    once:   options.once   ?? true,
    margin: options.margin ?? "0px 0px -60px 0px",
    amount: options.amount ?? 0.12,
  });
  return [ref, prefersReduced ? true : inView];
}

// ── 6. COMPONENTS ─────────────────────────────────────────────────────────────

// FadeUp — most common scroll reveal
export function FadeUp({ children, delay = 0, duration = 0.55, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden:  { opacity:0, y:22 },
        visible: { opacity:1, y:0, transition:{ duration, delay, ease:EASE.expo } },
      }}
    >
      {children}
    </motion.div>
  );
}

// FadeIn — opacity only
export function FadeIn({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : { opacity:0 }}
      animate={inView ? { opacity:1 } : { opacity:0 }}
      transition={{ duration:0.45, delay, ease:EASE.appleOut }}
    >
      {children}
    </motion.div>
  );
}

// ScaleIn — for cards, modals
export function ScaleIn({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={VARIANTS.scaleIn}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// BlurIn — premium text/heading reveal
export function BlurIn({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={VARIANTS.blurIn}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// StaggerChildren — animate a list of children in sequence
export function StaggerChildren({ children, delay = 0, stagger = 0.07, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden:  {},
        visible: { transition:{ staggerChildren: prefersReduced ? 0 : stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem — use inside StaggerChildren
export function StaggerItem({ children, className = "", style = {} }) {
  return (
    <motion.div className={className} style={style} variants={VARIANTS.staggerItem}>
      {children}
    </motion.div>
  );
}

// AnimCard — card with hover animations
export function AnimCard({ children, delay = 0, className = "", style = {}, onClick }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={VARIANTS.card}
      transition={{ delay }}
      whileHover={prefersReduced ? {} : { y:-5, transition: SPRING.micro }}
      whileTap={prefersReduced  ? {} : { scale:0.98, transition: SPRING.snappy }}
    >
      {children}
    </motion.div>
  );
}

// AnimButton — button with press animation
export function AnimButton({ children, className = "", style = {}, onClick, disabled = false, type = "button" }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !prefersReduced ? { scale:1.025, transition:SPRING.micro } : {}}
      whileTap={!disabled  && !prefersReduced ? { scale:0.965, transition:SPRING.snappy } : {}}
    >
      {children}
    </motion.button>
  );
}

// PageTransition — wrap route content for page-level transitions
export function PageTransition({ children, variant = "fadeUp", className = "", style = {} }) {
  const prefersReduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        style={style}
        initial={prefersReduced ? false : "hidden"}
        animate="visible"
        exit="exit"
        variants={prefersReduced ? {} : VARIANTS[variant] || VARIANTS.fadeUp}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Modal — animated modal/popup
export function AnimModal({ children, isOpen, onClose, className = "", style = {} }) {
  const prefersReduced = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",zIndex:900 }}
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            transition={{ duration:0.22 }}
            onClick={onClose}
          />
          {/* Modal content */}
          <motion.div
            className={className}
            style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:901,...style }}
            initial={prefersReduced ? { opacity:0 } : "hidden"}
            animate="visible"
            exit="exit"
            variants={VARIANTS.scaleIn}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// AnimToast — bottom toast notification
export function AnimToast({ children, isVisible, style = {} }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{
            position:"fixed",bottom:28,left:"50%",x:"-50%",
            zIndex:9999,...style,
          }}
          initial={{ opacity:0, y:20, scale:0.92 }}
          animate={{ opacity:1, y:0,  scale:1,   transition:{ duration:0.32, ease:EASE.back  } }}
          exit={{    opacity:0, y:16, scale:0.94, transition:{ duration:0.20, ease:EASE.appleOut } }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// AnimateList — simple wrapper for list items with stagger
export function AnimateList({ items, renderItem, stagger = 0.06, className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={prefersReduced ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden:  {},
        visible: { transition:{ staggerChildren: prefersReduced ? 0 : stagger } },
      }}
    >
      {items.map((item, i) => (
        <motion.div key={i} variants={VARIANTS.staggerItem}>
          {renderItem(item, i)}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── 7. PARALLAX HOOK ──────────────────────────────────────────────────────────
// Use on hero sections for depth effect
export function useParallax(speed = 0.5) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [`${-50*speed}px`, `${50*speed}px`]);
  const y   = useSpring(raw, { stiffness:100, damping:30, restDelta:0.001 });
  return [ref, y];
}

// ── 8. SCROLL PROGRESS ────────────────────────────────────────────────────────
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness:100, damping:30, restDelta:0.001 });
  return smoothProgress;
}

// ── 9. COUNTER ANIMATION ──────────────────────────────────────────────────────
export function AnimCounter({ from = 0, to, duration = 1.5, suffix = "", prefix = "", className = "", style = {} }) {
  const [ref, inView] = useScrollReveal();
  const prefersReduced = useReducedMotion();
  const count = useSpring(prefersReduced || !inView ? to : from, {
    stiffness: prefersReduced ? 1000 : 80,
    damping:   prefersReduced ? 30   : 20,
  });

  useEffect(() => {
    if (inView) count.set(to);
  }, [inView, to]);

  return (
    <motion.span ref={ref} className={className} style={style}>
      {prefix}
      <motion.span>{count}</motion.span>
      {suffix}
    </motion.span>
  );
}

// ── 10. HOVER GLOW EFFECT ─────────────────────────────────────────────────────
export function HoverGlow({ children, color = "#0a84ff", intensity = 0.15, className = "", style = {} }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={prefersReduced ? {} : {
        boxShadow: `0 0 32px ${color}${Math.round(intensity*255).toString(16).padStart(2,"0")}, 0 0 64px ${color}${Math.round(intensity*0.5*255).toString(16).padStart(2,"0")}`,
        transition: { duration:0.22 },
      }}
    >
      {children}
    </motion.div>
  );
}

// ── 11. SLIDE TABS ────────────────────────────────────────────────────────────
// Animated tab indicator — drop-in for any tab bar
export function AnimTabIndicator({ layoutId = "tab-indicator", style = {} }) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{ position:"absolute",inset:0,borderRadius:"inherit",zIndex:0,...style }}
      transition={{ type:"spring", stiffness:400, damping:32 }}
    />
  );
}

// ── 12. ANIMATED PRESENCE WRAPPER ─────────────────────────────────────────────
// Simple AnimatePresence export for conditional renders
export { AnimatePresence, motion };