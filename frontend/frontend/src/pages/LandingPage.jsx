// src/pages/LandingPage.jsx — AshFitVerse v8
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/usetheme";
import useUser from "../hooks/useUser";
import { generateCSS, FONT } from "../theme";

const CLIPS = [
  { src: "/videos/intro1.mp4", poster: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80", words: ["TRAIN", "LIKE", "YOU MEAN IT"], sub: "Chest · Back · Legs · Core — 500+ exercises, built for your goal", accent: "#4f8ef7", trans: "wipe-right" },
  { src: "/videos/intro2.mp4", poster: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80", words: ["EAT", "WITH", "PURPOSE"], sub: "Personalised meal plans · macro tracking · diet logger", accent: "#34d399", trans: "wipe-up" },
  { src: "/videos/intro3.mp4", poster: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1400&q=80", words: ["CYCLE.", "PCOS.", "PREGNANCY."], sub: "Cycle tracker · PCOS guide · pregnancy & prenatal hub — built for her", accent: "#f472b6", trans: "wipe-left" },
  { src: "/videos/intro4.mp4", poster: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80", words: ["TESTOSTERONE.", "SLEEP.", "MIND."], sub: "Testosterone health · HRV sleep · sexual wellness — built for him", accent: "#fb923c", trans: "wipe-down" },
  { src: "/videos/intro5.mp4", poster: "https://images.unsplash.com/photo-1581009137042-c5c5dee9f50b?w=1400&q=80", words: ["TRACK", "EVERY", "WIN"], sub: "BMI · body fat % · calorie calculator · weight trends — 23 live metrics", accent: "#a78bfa", trans: "wipe-right" },
  { src: "/videos/intro6.mp4", poster: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1400&q=80", words: ["MIND", "BODY", "UNITED"], sub: "Mood tracker · CBT tools · stress management · daily mindfulness", accent: "#fbbf24", trans: "wipe-up" },
];

const HERO_VID = "/videos/hero.mp4";
const HERO_POSTER = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80";
const HOLD_MS = 3200;
const TRANS_MS = 650;

const HERO_LINES = [
  "Your Body.\nYour Biology.",
  "Train Like\nYou Mean It.",
  "Science Meets\nDiscipline.",
  "His & Hers.\nOne Platform.",
];

const FEATURES = [
  {
    id:1, side:"left", num:"01", tag:"TRAINING",
    title:"Personalised\nWorkout Plans",
    sub:"Phase-based training plans built around your goal, equipment and fitness level. 500+ exercises across strength, fat loss, endurance and wellness — with adaptive progression built in.",
    accent:"#4f8ef7",
    img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80",
    stat:"500+", sl:"Exercises"
  },
  {
    id:2, side:"right", num:"02", tag:"NUTRITION",
    title:"Diet Logging &\nMeal Plans",
    sub:"Log every meal, track macros and calories in real time. Goal-specific diet plans — fat loss, muscle gain or maintenance — with an Indian food database and weekly diet targets.",
    accent:"#34d399",
    img:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80",
    stat:"1,200+", sl:"Foods mapped"
  },
  {
    id:3, side:"left", num:"03", tag:"WOMEN'S HEALTH",
    title:"Cycle, PCOS &\nPregnancy Hub",
    sub:"A complete female health stack: cycle tracking with ovulation windows, a dedicated PCOS guide with diet and workout modifications, and a full trimester-by-trimester pregnancy and prenatal guide.",
    accent:"#f472b6",
    img:"https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1400&q=80",
    stat:"28-day", sl:"Cycle intelligence"
  },
  {
    id:4, side:"right", num:"04", tag:"MEN'S HEALTH",
    title:"Testosterone, Sleep\n& Sexual Wellness",
    sub:"Natural testosterone optimisation through training, sleep and nutrition. HRV-based sleep quality tracker, sexual wellness education, and daily mental health check-ins — all in one place.",
    accent:"#fb923c",
    img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80",
    stat:"360°", sl:"Male health coverage"
  },
  {
    id:5, side:"left", num:"05", tag:"BODY ANALYTICS",
    title:"BMI · Fat % ·\nCalorie Calculator",
    sub:"Your complete analytics dashboard: BMI, body fat percentage, TDEE and daily calorie targets, weight trend charts and progress tracking — 23 live metrics updated as you log.",
    accent:"#a78bfa",
    img:"https://images.unsplash.com/photo-1581009137042-c552e485697a?w=1400&q=80",
    stat:"23", sl:"Live metrics"
  },
  {
    id:6, side:"right", num:"06", tag:"MENTAL WELLNESS",
    title:"Mind & Body\nUnited",
    sub:"Daily mood tracking, CBT-based journalling tools, cortisol and stress management techniques, and guided mindfulness check-ins. Mental health is built into the programme — not bolted on.",
    accent:"#fbbf24",
    img:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1400&q=80",
    stat:"Daily", sl:"Check-ins"
  },
  {
    id:7, side:"left", num:"07", tag:"FITVERSE COMMUNITY",
    title:"Train Together.\nGrow Together.",
    sub:"Share workouts, join community challenges, send direct messages, and climb the leaderboard. FitVerse is where accountability meets a real fitness community — not a social media feed.",
    accent:"#38bdf8",
    img:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80",
    stat:"Growing", sl:"Community"
  },
  {
    id:8, side:"right", num:"08", tag:"WELLNESS SHOP",
    title:"Science-Backed\nSupplements",
    sub:"Curated male and female wellness shops stocked with evidence-based products. Ashwagandha, ZMA, creatine, PCOS supplements, period care and sexual wellness — no paid placements, ever.",
    accent:"#34d399",
    img:"https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1400&q=80",
    stat:"80+", sl:"Curated products"
  },
];

// ── STATS: removed "24K+ Active members" and "4.9★ rating" — replaced with real facts
const STATS = [
  { num:"8",          lbl:"Health modules"        },
  { num:"His & Hers", lbl:"Dedicated health stacks"},
  { num:"23",         lbl:"Live metrics tracked"   },
  { num:"3 min",      lbl:"Setup to live dashboard"},
];

const MARQUEE = [
  "Workout Planner","Diet Logger","Cycle Tracker","PCOS Guide","Pregnancy Guide",
  "Testosterone Health","Sleep & HRV","Sexual Wellness","Mental Wellness",
  "Body Fat Calculator","BMI Calculator","FitVerse Community","Wellness Shop",
];

const WHY = [
  { num:"01", t:"Biology-First, Always",      d:"Separate deep health stacks for female and male biology — cycle-synced plans, testosterone optimisation, hormone nutrition. Not just different colours.", c:"#f472b6" },
  { num:"02", t:"Pregnancy & PCOS Hub",        d:"Full prenatal guide and PCOS management with dedicated diet, workout modifications, supplements and symptom tracking — found nowhere else.", c:"#a78bfa" },
  { num:"03", t:"Sexual Wellness — Both",      d:"Honest, adult education on sexual health for men and women. Performance nutrition, contraception awareness, curated wellness products.", c:"#fb923c" },
  { num:"04", t:"23 Live Health Metrics",       d:"BMI, body fat %, TDEE, calorie targets, weight trends, sleep quality, HRV, mood scores — every number that matters, synced in real time.", c:"#4f8ef7" },
  { num:"05", t:"Private by Default",           d:"Your health data is yours. No ads, no data selling, no third-party sharing. End-to-end encrypted and confidential. Ever.", c:"#34d399" },
  { num:"06", t:"Ready in 3 Minutes",           d:"Complete onboarding in under 3 minutes. Gender-personalised dashboard, workout plan and diet targets — live immediately after signup.", c:"#fbbf24" },
];

const GENDER_CARDS = [
  { sym:"♀", title:"Women's Health Hub", gc:"#f472b6", items:[
    "Cycle Tracker — Period, Ovulation & Symptoms",
    "PCOS / PCOD — Diet, Workouts & Supplements",
    "Pregnancy & Prenatal Guide",
    "Phase-Based Hormone Nutrition",
    "Contraception & Fertility Awareness",
    "Female Wellness & Skincare Shop",
  ]},
  { sym:"♂", title:"Men's Health Hub", gc:"#4f8ef7", items:[
    "Testosterone Natural Optimisation",
    "Sleep Quality & HRV Recovery Tracker",
    "Sexual Wellness — Education & Products",
    "Mental Health Daily Check-Ins",
    "Cortisol & Stress Management",
    "Men's Performance Supplement Shop",
  ]},
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { dark: isDark, toggleTheme, T } = useTheme();
  const { user } = useUser();
  const hasAuthed = Boolean(user?.email || (typeof window !== "undefined" && localStorage.getItem("ashfitverse_email")));

  const [clipIdx,    setClipIdx]    = useState(0);
  const [iPhase,     setIPhase]     = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("skipIntro") === "true" || sessionStorage.getItem("ashfit_seen_intro")) {
        return "done";
      }
    }
    return "in";
  });
  const [heroLine,   setHeroLine]   = useState(0);
  const [heroTxt,    setHeroTxt]    = useState("");
  const [heroPhase,  setHeroPhase]  = useState("typing");
  const [scrollY,    setScrollY]    = useState(0);
  const [visRows,    setVisRows]    = useState(new Set());

  const canvasRef  = useRef(null);
  const rowRefs    = useRef([]);
  const isDarkRef  = useRef(isDark);
  const heroVidRef = useRef(null);
  const videoRefs  = useRef({});
  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  // Safe playback for intro videos & hero video
  useEffect(() => {
    if (iPhase === "done") {
      try { sessionStorage.setItem("ashfit_seen_intro", "1"); } catch (_) {}
      Object.values(videoRefs.current).forEach((el) => {
        if (el) {
          try { el.pause(); } catch (_) {}
        }
      });
      if (heroVidRef.current) {
        heroVidRef.current.muted = true;
        heroVidRef.current.defaultMuted = true;
        const p = heroVidRef.current.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    }
  }, [iPhase]);

  useEffect(() => {
    if (iPhase === "done") return;
    const currentEl = videoRefs.current[clipIdx];
    if (currentEl) {
      currentEl.muted = true;
      currentEl.defaultMuted = true;
      currentEl.play().catch(() => {});
    }
    // Pause other clips to preserve GPU/CPU
    Object.entries(videoRefs.current).forEach(([idx, el]) => {
      if (el && Number(idx) !== clipIdx) {
        try {
          el.pause();
          el.currentTime = 0;
        } catch (_) {}
      }
    });
  }, [clipIdx]);

  // Global user interaction unblocker for browser autoplay policy
  useEffect(() => {
    const handleGesture = () => {
      if (heroVidRef.current) {
        heroVidRef.current.muted = true;
        heroVidRef.current.defaultMuted = true;
        heroVidRef.current.play().catch(() => {});
      }
      const cur = videoRefs.current[clipIdx];
      if (cur) {
        cur.muted = true;
        cur.defaultMuted = true;
        cur.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", handleGesture, { once: true });
    window.addEventListener("keydown", handleGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, [clipIdx]);

  // Intro sequencer with smooth crossfade
  useEffect(() => {
    if (iPhase === "done") return;
    let t;
    if (iPhase === "in")   t = setTimeout(() => setIPhase("hold"), 300);
    if (iPhase === "hold") t = setTimeout(() => setIPhase("out"), HOLD_MS);
    if (iPhase === "out")  t = setTimeout(() => {
      if (clipIdx < CLIPS.length - 1) {
        setClipIdx((c) => c + 1);
        setIPhase("in");
      } else {
        setIPhase("done");
      }
    }, TRANS_MS);
    return () => clearTimeout(t);
  }, [iPhase, clipIdx]);

  // Hero typewriter
  useEffect(() => {
    if (iPhase !== "done") return;
    const full = HERO_LINES[heroLine];
    let t;
    if (heroPhase === "typing") {
      if (heroTxt.length < full.length) t = setTimeout(() => setHeroTxt(full.slice(0, heroTxt.length + 1)), 44);
      else t = setTimeout(() => setHeroPhase("hold"), 2400);
    } else if (heroPhase === "hold") {
      t = setTimeout(() => setHeroPhase("erasing"), 400);
    } else if (heroPhase === "erasing") {
      if (heroTxt.length > 0) t = setTimeout(() => setHeroTxt(heroTxt.slice(0, -1)), 20);
      else { setHeroLine(l => (l + 1) % HERO_LINES.length); setHeroPhase("typing"); }
    }
    return () => clearTimeout(t);
  }, [iPhase, heroPhase, heroTxt, heroLine]);

  // Scroll reveal
  useEffect(() => {
    if (iPhase !== "done") return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setVisRows(p => new Set([...p, +e.target.dataset.idx])); });
    }, { threshold: 0.14 });
    rowRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [iPhase]);

  // Scroll position
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Animated canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let t = 0, raf;
    const draw = () => {
      t += 0.003;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      const dark = isDarkRef.current;
      const baseGrd = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.9);
      if (dark) {
        baseGrd.addColorStop(0, "#090a16"); baseGrd.addColorStop(0.6, "#05060f"); baseGrd.addColorStop(1, "#020308");
      } else {
        baseGrd.addColorStop(0, "#f7f9ff"); baseGrd.addColorStop(0.6, "#edf0fc"); baseGrd.addColorStop(1, "#e2e6f7");
      }
      ctx.fillStyle = baseGrd; ctx.fillRect(0, 0, W, H);
      const fluidX = W * (0.5 + Math.sin(t) * 0.15);
      const fluidY = H * (0.4 + Math.cos(t * 0.8) * 0.12);
      const aurora = ctx.createRadialGradient(fluidX, fluidY, 0, fluidX, fluidY, W * 0.45);
      if (dark) {
        aurora.addColorStop(0, "rgba(79,142,247,0.04)"); aurora.addColorStop(0.5, "rgba(167,139,250,0.02)"); aurora.addColorStop(1, "rgba(79,142,247,0)");
      } else {
        aurora.addColorStop(0, "rgba(79,142,247,0.06)"); aurora.addColorStop(0.5, "rgba(52,211,153,0.03)"); aurora.addColorStop(1, "rgba(79,142,247,0)");
      }
      ctx.fillStyle = aurora; ctx.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [isDark]);

  const isDone = iPhase === "done";
  const isOut  = iPhase === "out";
  const clip   = CLIPS[clipIdx];
  const heroOpacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.52));
  const heroTY      = -scrollY * 0.32;

  const css = generateCSS(T, isDark) + `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    ::-webkit-scrollbar{width:2px;}
    ::-webkit-scrollbar-thumb{background:${T.accent}66;border-radius:99px;}

    .intro{position:fixed;inset:0;z-index:1000;overflow:hidden;background:#050712;}
    .iv-wrapper{
      position:absolute;inset:0;width:100%;height:100%;
      opacity:0;
      transform:scale(1.035);
      background-size:cover;background-position:center;background-repeat:no-repeat;
      transition:opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 4s ease-out;
      will-change:opacity,transform;
    }
    .iv-wrapper.active{opacity:1;transform:scale(1.0);z-index:2;}
    .iv{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.92) contrast(1.04) saturate(1.08);}
    .io1{position:absolute;inset:0;z-index:3;background:linear-gradient(to bottom,rgba(0,0,0,.32) 0%,rgba(0,0,0,.08) 45%,rgba(0,0,0,.72) 100%);}
    .io2{position:absolute;inset:0;z-index:3;background:radial-gradient(circle at center,transparent 45%,rgba(0,0,0,.45) 100%);}
    .itxt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px;pointer-events:none;z-index:6;}
    .iword{display:block;font-family:${FONT.display};font-size:clamp(58px,11vw,148px);font-weight:800;line-height:.82;letter-spacing:-.03em;color:#fff;opacity:0;transform:translateY(46px) skewY(3deg);animation:iWordIn .58s cubic-bezier(.22,1,.36,1) forwards;}
    .iword.ac{background:linear-gradient(140deg,var(--ac) 20%,rgba(255,255,255,.92) 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    @keyframes iWordIn{0%{opacity:0;transform:translateY(46px) skewY(3deg);}100%{opacity:1;transform:translateY(0) skewY(0);}}
    .isub{margin-top:26px;font-size:clamp(12px,1.5vw,18px);color:rgba(255,255,255,.75);font-weight:300;letter-spacing:.22em;text-transform:uppercase;opacity:0;animation:iSubIn .55s .5s cubic-bezier(.22,1,.36,1) forwards;}
    @keyframes iSubIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    .ieyebrow{position:absolute;bottom:32px;left:48px;font-size:10.5px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.5);opacity:0;animation:iSubIn .5s .65s forwards;z-index:6;}
    .idots{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}
    .idot{width:5px;height:5px;border-radius:99px;background:rgba(255,255,255,.34);transition:all .3s;}
    .idot.on{width:24px;background:var(--ac);}
    .iskip{position:absolute;bottom:30px;right:48px;font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);z-index:10;background:transparent;border:1px solid rgba(255,255,255,.25);padding:8px 18px;border-radius:2px;transition:all .22s;cursor:pointer;}
    .iskip:hover{color:#fff;border-color:rgba(255,255,255,.78);}

    /* ── NAVBAR — Apple Liquid Glass ── */
    .nav{
      position:fixed;top:14px;left:20px;right:20px;z-index:200;
      display:flex;align-items:center;justify-content:space-between;
      padding:11px 22px;
      border-radius:18px;
      /* Core liquid glass: heavily blurred, lightly tinted */
      background:${isDark
        ?"rgba(255,255,255,0.06)"
        :"rgba(255,255,255,0.42)"};
      /* Layered borders for glass depth */
      border:1px solid ${isDark
        ?"rgba(255,255,255,0.12)"
        :"rgba(255,255,255,0.72)"};
      /* Multi-layer blur + saturation = liquid glass */
      backdrop-filter:blur(48px) saturate(220%) brightness(${isDark?"1.06":"1.02"});
      -webkit-backdrop-filter:blur(48px) saturate(220%) brightness(${isDark?"1.06":"1.02"});
      /* Three-layer box shadow: top specular, ambient, depth */
      box-shadow:
        inset 0 1.5px 0 ${isDark?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.90)"},
        inset 0 -1px 0 rgba(0,0,0,${isDark?"0.08":"0.03"}),
        0 1px 0 ${isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.50)"},
        0 8px 32px rgba(0,0,0,${isDark?"0.28":"0.08"}),
        0 2px 8px rgba(0,0,0,${isDark?"0.16":"0.04"});
      transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
      /* Subtle inner gradient for the glass curve illusion */
      position:fixed;
    }
    /* The frosted-glass internal shimmer layer */
    .nav::before{
      content:'';
      position:absolute;inset:0;border-radius:18px;pointer-events:none;
      background:linear-gradient(
        140deg,
        rgba(255,255,255,${isDark?"0.10":"0.50"}) 0%,
        rgba(255,255,255,${isDark?"0.03":"0.15"}) 28%,
        transparent 55%,
        rgba(255,255,255,${isDark?"0.04":"0.18"}) 100%
      );
      z-index:0;
    }
    /* Refraction edge — thin bright line on left + top */
    .nav::after{
      content:'';
      position:absolute;inset:0;border-radius:18px;pointer-events:none;
      background:linear-gradient(
        130deg,
        rgba(255,255,255,${isDark?"0.22":"0.70"}) 0%,
        transparent 18%
      );
      z-index:0;
    }
    .nav > *{ position:relative;z-index:1; }

    /* Scrolled — more frosted, deeper shadow */
    .nav.scrolled{
      background:${isDark?"rgba(10,10,18,0.55)":"rgba(255,255,255,0.62)"};
      backdrop-filter:blur(60px) saturate(240%) brightness(${isDark?"1.08":"1.03"});
      -webkit-backdrop-filter:blur(60px) saturate(240%) brightness(${isDark?"1.08":"1.03"});
      box-shadow:
        inset 0 1.5px 0 ${isDark?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.95)"},
        inset 0 -1px 0 rgba(0,0,0,${isDark?"0.10":"0.04"}),
        0 12px 44px rgba(0,0,0,${isDark?"0.36":"0.12"}),
        0 4px 12px rgba(0,0,0,${isDark?"0.20":"0.06"});
    }

    /* Logo — Fit white/dark, Verse blue */
    .nlogo{font-family:${FONT.display};font-size:18px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;}
    .nlogo-fit{color:${isDark?"rgba(255,255,255,0.92)":"rgba(10,12,26,0.88)"};}
    .nlogo-verse{color:${T.accent};}

    .nr{display:flex;align-items:center;gap:10px;}

    /* Theme toggle — liquid glass pill */
    .tt{
      width:48px;height:26px;border-radius:99px;
      position:relative;flex-shrink:0;outline:none;padding:0;
      background:${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};
      border:1px solid ${isDark?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.80)"};
      box-shadow:inset 0 1px 0 rgba(255,255,255,${isDark?"0.14":"0.70"}),0 1px 4px rgba(0,0,0,0.10);
      transition:all .28s;cursor:pointer;
    }
    .tt:hover{
      background:${isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.09)"};
      border-color:${isDark?"rgba(255,255,255,0.24)":"rgba(255,255,255,0.95)"};
    }
    .tk{
      position:absolute;top:2px;width:20px;height:20px;border-radius:50%;
      background:linear-gradient(135deg,${T.accent},#a78bfa);
      display:flex;align-items:center;justify-content:center;font-size:11px;
      transition:left .35s cubic-bezier(.34,1.56,.64,1);pointer-events:none;
      box-shadow:0 2px 8px ${T.accent}55;
      left:${isDark?"25px":"2px"};
    }

    /* Nav links — ghost text on glass */
    .nl{
      font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
      color:${isDark?"rgba(255,255,255,0.55)":"rgba(10,12,26,0.52)"};
      background:none;border:none;padding:7px 6px;transition:color .18s;cursor:pointer;
    }
    .nl:hover{color:${isDark?"rgba(255,255,255,0.92)":"rgba(10,12,26,0.90)"};}

    /* Get Started — glass pill button */
    .nbtn{
      font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
      color:${isDark?"rgba(255,255,255,0.88)":"rgba(10,12,26,0.80)"};
      background:${isDark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.55)"};
      border:1px solid ${isDark?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.85)"};
      padding:8px 18px;border-radius:99px;
      backdrop-filter:blur(20px);
      box-shadow:inset 0 1px 0 rgba(255,255,255,${isDark?"0.16":"0.80"}),0 2px 8px rgba(0,0,0,0.08);
      transition:all .24s cubic-bezier(.34,1.56,.64,1);cursor:pointer;
    }
    .nbtn:hover{
      background:${T.accent};
      border-color:${T.accent};
      color:#fff;
      transform:translateY(-1px);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.25),0 6px 20px ${T.accent}44;
    }

    .hero{position:relative;height:100vh;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 56px;}
    .hero-vid{
      position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
      filter:brightness(0.85) contrast(1.05) saturate(1.10);
    }
    .hero-vid-ov{
      position:absolute;inset:0;
      background:linear-gradient(to bottom,rgba(5,6,16,.38) 0%,rgba(5,6,16,.12) 40%,rgba(5,6,16,.88) 100%);
    }
    .hero-tint{
      position:absolute;inset:0;pointer-events:none;
      background:radial-gradient(ellipse 65% 55% at 75% 75%,rgba(79,142,247,.12) 0%,transparent 70%);
    }
    .hero-body{position:relative;z-index:2;display:flex;flex-direction:column;margin-top:60px;}
    .hero-eye{font-size:10.5px;font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:#4f8ef7;margin-bottom:20px;}
    .hero-h1{font-family:${FONT.display};font-size:clamp(56px,8.5vw,128px);font-weight:800;line-height:.95;letter-spacing:-.04em;color:#ffffff;white-space:pre-line;text-shadow:0 4px 30px rgba(0,0,0,0.95),0 2px 10px rgba(0,0,0,0.85);min-height:2.2em;margin-bottom:6px;}
    .hero-cursor{display:inline-block;width:3px;height:.82em;background:#4f8ef7;margin-left:6px;vertical-align:-.02em;animation:blink .9s step-end infinite;}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    .hero-sub-container{margin-top:32px;max-width:640px;border-left:2px solid ${T.accent};padding-left:24px;}
    .hero-sub-text{font-family:${FONT.display};font-size:clamp(16px,1.8vw,21px);font-weight:700;line-height:1.5;letter-spacing:-0.01em;background:linear-gradient(135deg,#ffffff 30%,rgba(255,255,255,0.7) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .hero-sub-desc{font-size:clamp(13px,1.3vw,15px);color:rgba(238,242,255,0.75);font-weight:400;line-height:1.6;margin-top:8px;}
    .hero-scroll{position:absolute;bottom:42px;left:56px;z-index:2;display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#ffffff;text-shadow:0 2px 10px rgba(0,0,0,0.9);font-weight:700;}
    .hline{width:40px;height:2px;background:#4f8ef7;animation:lGrow 2.4s ease-in-out infinite;}
    @keyframes lGrow{0%,100%{transform:scaleX(.2);opacity:.6;}50%{transform:scaleX(1);opacity:1;}}

    .mq{border-top:1px solid ${T.glassBorder};border-bottom:1px solid ${T.glassBorder};padding:13px 0;overflow:hidden;background:${isDark?"rgba(5,6,15,.96)":"rgba(244,246,255,.96)"};backdrop-filter:blur(20px);position:relative;z-index:10;}
    .mq-t{display:flex;white-space:nowrap;width:max-content;animation:mq 36s linear infinite;}
    .mq-t:hover{animation-play-state:paused;}
    @keyframes mq{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    .mqi{font-family:${FONT.display};font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:${T.accent}bb;padding:0 32px;display:inline-flex;align-items:center;gap:32px;}
    .mqs{width:3px;height:3px;border-radius:50%;background:${T.accent}44;}

    .fs{background:${T.bg};position:relative;z-index:10;}
    .fhdr{padding:80px 56px 44px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid ${T.glassBorder};}
    .fhdr-l{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:${T.accent};font-weight:600;}
    .fhdr-r{font-family:${FONT.display};font-size:10.5px;letter-spacing:.2em;color:${T.textMuted};font-weight:700;}
    .fr{position:relative;overflow:hidden;border-bottom:1px solid ${T.glassBorder};opacity:0;transition:opacity .65s ease,transform .65s cubic-bezier(.4,0,.2,1);}
    .fr:first-child{border-top:1px solid ${T.glassBorder};}
    .fr.fl{transform:translateX(-44px);}
    .fr.frr{transform:translateX(44px);}
    .fr.vis{opacity:1;transform:translateX(0)!important;}
    .fr-grid{display:grid;grid-template-columns:1fr 1fr;min-height:360px;}
    .frr .fr-grid{direction:rtl;}
    .frr .fr-grid > *{direction:ltr;}
    .fr-img{position:relative;overflow:hidden;background:#111;}
    .fr-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.07);transition:transform .65s cubic-bezier(.4,0,.2,1),filter .55s;filter:brightness(0.6) saturate(.88);}
    .fr:hover .fr-img img{transform:scale(1.0);filter:brightness(${isDark?".80":".92"}) saturate(1);}
    .fr-txt{display:flex;flex-direction:column;justify-content:center;padding:52px 56px;position:relative;z-index:2;}
    .fr-bar{position:absolute;top:50%;translate:0 -50%;width:0;height:55%;transition:width .42s cubic-bezier(.34,1.56,.64,1);border-radius:0 3px 3px 0;}
    .fl .fr-bar{left:0;}
    .frr .fr-bar{right:0;border-radius:3px 0 0 3px;}
    .fr:hover .fr-bar{width:3px;}
    .fr-num{font-family:${FONT.display};font-size:10px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:${T.textMuted};margin-bottom:8px;transition:color .3s;}
    .fr:hover .fr-num{color:${T.accent};}
    .fr-tag{font-size:9.5px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--fac);margin-bottom:10px;}
    .fr-title{font-family:${FONT.display};font-size:clamp(26px,3vw,46px);font-weight:800;line-height:1.02;letter-spacing:-.025em;color:${T.text};white-space:pre-line;margin-bottom:16px;transition:translate .42s cubic-bezier(.34,1.56,.64,1);}
    .fl:hover .fr-title{translate:10px 0;}
    .frr:hover .fr-title{translate:-10px 0;}
    .fr-line{height:2px;width:0;border-radius:99px;margin-bottom:16px;transition:width .55s cubic-bezier(.34,1.56,.64,1) .1s;}
    .fr.vis .fr-line{width:68px;}
    .fr-sub{font-size:13.5px;color:${T.textSub};line-height:1.72;font-weight:400;max-width:360px;margin-bottom:24px;}
    .fr-sv{font-family:${FONT.display};font-size:clamp(22px,2.6vw,38px);font-weight:800;line-height:1;}
    .fr-sl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${T.textMuted};margin-top:4px;font-weight:600;}
    .fr-arr{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1px solid ${T.glassBorder};font-size:15px;color:transparent;scale:.6;margin-top:20px;transition:all .38s cubic-bezier(.34,1.56,.64,1);}
    .fr:hover .fr-arr{color:${T.text};border-color:${T.accent}88;scale:1;background:${T.accent}18;}

    .ss{padding:110px 56px;border-top:1px solid ${T.glassBorder};display:grid;grid-template-columns:1fr 1fr;gap:80px;background:${T.bg};position:relative;z-index:10;}
    .eye{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:${T.accent};font-weight:600;margin-bottom:18px;}
    .sh2{font-family:${FONT.display};font-size:clamp(30px,3.8vw,52px);font-weight:800;letter-spacing:-.025em;color:${T.text};line-height:.96;margin-bottom:22px;}
    .sh2 em,.wh2 em{font-style:normal;color:transparent;-webkit-text-stroke:1.5px ${T.accent};}
    .ctah2 em{display:block;font-style:normal;color:transparent;-webkit-text-stroke:2px ${T.accent};}
    .sbody{font-size:14.5px;color:${T.textSub};line-height:1.82;font-weight:300;max-width:400px;}
    .sgrid{display:grid;grid-template-columns:1fr 1fr;border:1px solid ${T.glassBorder};}
    .sblk{padding:34px 24px;border-right:1px solid ${T.glassBorder};border-bottom:1px solid ${T.glassBorder};position:relative;overflow:hidden;transition:background .3s;}
    .sblk::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${T.accent}00,${T.accent}09);opacity:0;transition:opacity .3s;}
    .sblk:hover::before{opacity:1;}
    .sblk:nth-child(2n){border-right:none;}
    .sblk:nth-last-child(-n+2){border-bottom:none;}
    .sn{font-family:${FONT.display};font-size:clamp(30px,3.8vw,50px);font-weight:800;line-height:1;color:${T.text};margin-bottom:8px;}
    .sl{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:${T.textMuted};font-weight:600;}

    .ws{padding:100px 56px;border-top:1px solid ${T.glassBorder};background:${T.bg};position:relative;z-index:10;}
    .whdr{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:60px;}
    .wh2{font-family:${FONT.display};font-size:clamp(30px,3.8vw,52px);font-weight:800;letter-spacing:-.025em;color:${T.text};line-height:1.0;}
    .wsub{font-size:13px;color:${T.textMuted};max-width:260px;text-align:right;line-height:1.7;font-weight:300;}
    .wgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border:1px solid ${T.glassBorder};}
    .wcard{padding:36px 28px;border-right:1px solid ${T.glassBorder};background:${isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.5)"};transition:background .3s;position:relative;overflow:hidden;}
    .wcard:last-child{border-right:none;}
    .wcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--wc),transparent);transform:scaleX(0);transition:transform .4s cubic-bezier(.34,1.56,.64,1);transform-origin:center;}
    .wcard:hover{background:${isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.85)"};}
    .wcard:hover::after{transform:scaleX(1);}
    .wico{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:20px;background:var(--wcs);border:1px solid var(--wcb);}
    .wtitle{font-family:${FONT.display};font-size:17px;font-weight:800;color:${T.text};margin-bottom:10px;}
    .wdesc{font-size:13px;color:${T.textSub};line-height:1.7;font-weight:300;}

    .gs{padding:100px 56px;border-top:1px solid ${T.glassBorder};background:${T.bg};display:grid;grid-template-columns:1fr 1fr;gap:20px;position:relative;z-index:10;}
    .gcard{border-radius:4px;padding:44px 40px;position:relative;overflow:hidden;border:1px solid ${T.glassBorder};background:${isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.60)"};transition:border-color .35s,background .35s;}
    .gcard:hover{border-color:var(--gc);background:${isDark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.80)"};}
    .gglow{position:absolute;top:-44px;right:-44px;width:200px;height:200px;border-radius:50%;filter:blur(65px);opacity:.07;background:var(--gc);transition:opacity .4s;pointer-events:none;}
    .gcard:hover .gglow{opacity:.18;}
    .gsym{font-size:40px;margin-bottom:14px;color:var(--gc);}
    .gtitle{font-family:${FONT.display};font-size:22px;font-weight:800;color:var(--gc);margin-bottom:22px;}
    .gitem{display:flex;align-items:center;gap:12px;padding:11px 0;font-size:13.5px;color:${T.textSub};border-bottom:1px solid ${T.glassBorder};transition:color .25s;}
    .gitem:last-child{border-bottom:none;}
    .gcard:hover .gitem{color:${T.text};}
    .gdot{width:5px;height:5px;border-radius:50%;background:var(--gc);flex-shrink:0;}

    .ctas{padding:160px 56px;border-top:1px solid ${T.glassBorder};display:flex;flex-direction:column;align-items:center;text-align:center;background:${T.bg};position:relative;overflow:hidden;z-index:10;}
    .ctaglow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 65% 50% at 50% 50%,${T.accent}0a 0%,transparent 70%);}
    .ctaeye{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:${T.accent};font-weight:600;margin-bottom:28px;}
    .ctah2{font-family:${FONT.display};font-size:clamp(50px,8vw,122px);font-weight:800;line-height:.88;letter-spacing:-.04em;color:${T.text};margin-bottom:50px;position:relative;z-index:1;}
    .ctabtns{display:flex;gap:14px;position:relative;z-index:1;}
    .ctap{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${isDark?"#fff":"#0f172a"};background:${T.accent}20;border:1px solid ${T.accent}66;padding:17px 42px;border-radius:3px;transition:all .32s;backdrop-filter:blur(12px);cursor:pointer;}
    .ctap:hover{background:${T.accent}35;border-color:${T.accent};translate:0 -4px;}
    .ctas2{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${T.textMuted};background:transparent;border:1px solid ${T.glassBorder};padding:17px 42px;border-radius:3px;transition:all .28s;cursor:pointer;}
    .ctas2:hover{color:${T.textSub};border-color:${T.glassBorderHover};}
    .trust{display:flex;gap:26px;justify-content:center;margin-top:44px;flex-wrap:wrap;position:relative;z-index:1;}
    .titem{font-size:11.5px;color:${T.textSub};font-weight:600;}

    .footer{padding:36px 56px;border-top:1px solid ${T.glassBorder};display:flex;align-items:center;justify-content:space-between;background:${T.bg};z-index:10;position:relative;}
    .flog{font-family:${FONT.display};font-size:15px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${T.textMuted};}
    .flog-fit{color:${T.textMuted};}
    .flog-verse{color:${T.accent};}
    .fcpy{font-size:11px;color:${T.textSub};letter-spacing:.08em;}

    @media(max-width:960px){
      .nav{
        left:12px;right:12px;top:12px;
        padding:9px 16px;
        border-radius:16px;
      }
      .nlogo{font-size:16px;}
      .nl{display:none!important;}
      .nbtn{padding:7px 14px;font-size:11px;white-space:nowrap;}
      
      .hero{
        min-height:100vh;
        min-height:100dvh;
        height:auto;
        padding:120px 24px 60px!important;
        justify-content:center;
      }
      .hero-body{margin-top:0;}
      .hero-eye{font-size:10px;letter-spacing:.22em;margin-bottom:16px;}
      .hero-h1{
        font-size:clamp(36px,7.5vw,56px)!important;
        line-height:1.04!important;
        letter-spacing:-.03em!important;
        min-height:auto!important;
        margin-bottom:14px!important;
        word-break:break-word!important;
        overflow-wrap:break-word!important;
        text-wrap:balance!important;
      }
      .hero-sub-container{
        padding-left:16px!important;
        margin-top:18px!important;
        max-width:100%!important;
      }
      .hero-sub-text{font-size:16px!important;line-height:1.45!important;}
      .hero-sub-desc{font-size:13.5px!important;line-height:1.6!important;margin-top:6px!important;}
      .hero-scroll{
        position:relative!important;
        bottom:auto!important;
        left:auto!important;
        margin-top:32px!important;
      }

      .fhdr{padding:48px 24px 28px!important;}
      .fr-grid{
        display:flex!important;
        flex-direction:column!important;
        min-height:auto!important;
        direction:ltr!important;
      }
      .frr .fr-grid{direction:ltr!important;}
      .fr-img{
        width:100%!important;
        height:240px!important;
        min-height:240px!important;
        position:relative!important;
      }
      .fr-txt{
        padding:32px 24px 36px!important;
        max-width:100%!important;
      }
      .fr-title{
        font-size:clamp(24px,5vw,34px)!important;
        line-height:1.1!important;
        margin-bottom:14px!important;
        white-space:normal!important;
        word-break:break-word!important;
        overflow-wrap:break-word!important;
      }
      .fl:hover .fr-title,.frr:hover .fr-title{translate:0 0!important;}
      .fr-sub{max-width:100%!important;margin-bottom:20px!important;}
      .fr.fl{transform:translateY(24px)!important;}
      .fr.frr{transform:translateY(24px)!important;}
      .fr.vis{transform:translateY(0)!important;}

      .ss{
        padding:70px 24px!important;
        display:flex!important;
        flex-direction:column!important;
        gap:40px!important;
      }
      .sh2{
        font-size:clamp(28px,6vw,40px)!important;
        line-height:1.02!important;
        margin-bottom:16px!important;
        word-break:break-word!important;
      }
      .sh2 em{ -webkit-text-stroke:1.2px ${T.accent}!important; }
      .sbody{font-size:14px!important;line-height:1.7!important;max-width:100%!important;}
      .sgrid{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        border-radius:12px;
        overflow:hidden;
      }
      .sblk{padding:24px 18px!important;}
      .sn{
        font-size:clamp(24px,5vw,34px)!important;
        line-height:1.1!important;
        word-break:break-word!important;
      }
      .sl{font-size:10px!important;letter-spacing:.12em!important;}

      .ws{padding:70px 24px!important;}
      .whdr{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        gap:14px!important;
        margin-bottom:36px!important;
      }
      .wh2{
        font-size:clamp(28px,6vw,40px)!important;
        line-height:1.02!important;
        word-break:break-word!important;
      }
      .wh2 em{ -webkit-text-stroke:1.2px ${T.accent}!important; }
      .wsub{
        text-align:left!important;
        max-width:100%!important;
        font-size:13.5px!important;
        line-height:1.6!important;
      }
      .wgrid{
        display:flex!important;
        flex-direction:column!important;
        grid-template-columns:1fr!important;
        border-radius:14px;
        overflow:hidden;
      }
      .wcard{
        border-right:none!important;
        border-bottom:1px solid ${T.glassBorder}!important;
        padding:28px 22px!important;
      }
      .wcard:last-child{border-bottom:none!important;}

      .gs{
        padding:70px 24px!important;
        display:flex!important;
        flex-direction:column!important;
        gap:20px!important;
      }
      .gcard{padding:32px 24px!important;border-radius:14px;}

      .ctas{padding:90px 24px!important;}
      .ctah2{
        font-size:clamp(38px,8vw,68px)!important;
        line-height:.95!important;
        margin-bottom:36px!important;
        word-break:break-word!important;
      }
      .ctah2 em{ -webkit-text-stroke:1.5px ${T.accent}!important; }
      .ctabtns{
        flex-direction:column!important;
        width:100%!important;
        max-width:340px!important;
        gap:12px!important;
      }
      .ctap,.ctas2{
        width:100%!important;
        padding:16px 24px!important;
        text-align:center!important;
        display:flex!important;
        justify-content:center!important;
      }
      .trust{gap:14px 20px!important;margin-top:34px!important;}

      .footer{
        padding:30px 24px 36px!important;
        flex-direction:column!important;
        gap:12px!important;
        align-items:center!important;
        text-align:center!important;
      }
    }

    @media(max-width:640px){
      .nav{
        left:8px!important;right:8px!important;top:10px!important;
        padding:8px 14px!important;
        border-radius:14px!important;
      }
      .nlogo{font-size:15px!important;}
      .nr{gap:8px!important;}
      .nl{display:none!important;}
      .nbtn{padding:7px 13px!important;font-size:10.5px!important;white-space:nowrap!important;}
      .tt{width:42px!important;height:24px!important;}
      .tk{width:18px!important;height:18px!important;left:${isDark?"20px":"2px"}!important;}

      .iword{
        font-size:clamp(26px,8vw,42px)!important;
        line-height:.95!important;
        word-break:break-word!important;
        max-width:320px!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      .isub{
        font-size:11px!important;
        letter-spacing:.1em!important;
        line-height:1.55!important;
        padding:0 12px!important;
        max-width:300px!important;
        margin-left:auto!important;
        margin-right:auto!important;
        margin-top:16px!important;
        text-wrap:balance!important;
      }
      .ieyebrow{left:16px!important;bottom:22px!important;font-size:9.5px!important;letter-spacing:.16em!important;}
      .iskip{
        right:16px!important;bottom:18px!important;
        padding:6px 14px!important;font-size:10px!important;
        z-index:99!important;
        background:rgba(0,0,0,0.35)!important;
        backdrop-filter:blur(8px)!important;
      }

      .hero{
        padding:100px 18px 48px!important;
      }
      .hero-eye{
        font-size:9px!important;
        letter-spacing:.16em!important;
        margin-bottom:12px!important;
      }
      .hero-h1{
        font-size:clamp(30px,8.4vw,44px)!important;
        line-height:1.06!important;
        margin-bottom:10px!important;
      }
      .hero-sub-container{
        padding-left:12px!important;
        margin-top:14px!important;
      }
      .hero-sub-text{font-size:15px!important;line-height:1.4!important;}
      .hero-sub-desc{font-size:12.5px!important;line-height:1.55!important;margin-top:6px!important;}
      .hero-scroll{margin-top:24px!important;font-size:10px!important;}

      .mq{padding:9px 0!important;}
      .mqi{font-size:9.5px!important;letter-spacing:.18em!important;padding:0 20px!important;gap:20px!important;}

      .fhdr{padding:40px 18px 20px!important;}
      .fhdr-l,.fhdr-r{font-size:9px!important;letter-spacing:.18em!important;}
      .fr-img{height:200px!important;min-height:200px!important;}
      .fr-txt{padding:24px 18px 28px!important;}
      .fr-title{font-size:clamp(21px,5.8vw,28px)!important;line-height:1.12!important;margin-bottom:10px!important;}
      .fr-sub{font-size:12.5px!important;line-height:1.6!important;margin-bottom:16px!important;}
      .fr-sv{font-size:24px!important;}

      .ss{padding:54px 18px!important;gap:30px!important;}
      .sh2{font-size:clamp(24px,6.8vw,32px)!important;margin-bottom:12px!important;}
      .sbody{font-size:13px!important;line-height:1.6!important;}
      .sblk{padding:20px 14px!important;}
      .sn{font-size:clamp(20px,5vw,26px)!important;}
      .sl{font-size:9.5px!important;letter-spacing:.08em!important;}

      .ws{padding:54px 18px!important;}
      .whdr{margin-bottom:26px!important;gap:10px!important;}
      .wh2{font-size:clamp(24px,6.8vw,32px)!important;}
      .wsub{font-size:12.5px!important;}
      .wcard{padding:22px 16px!important;}
      .wico{width:34px!important;height:34px!important;font-size:15px!important;margin-bottom:12px!important;}
      .wtitle{font-size:15px!important;}
      .wdesc{font-size:12px!important;}

      .gs{padding:54px 18px!important;gap:14px!important;}
      .gcard{padding:24px 16px!important;}
      .gsym{font-size:30px!important;margin-bottom:8px!important;}
      .gtitle{font-size:17px!important;margin-bottom:12px!important;}
      .gitem{font-size:12px!important;padding:8px 0!important;}

      .ctas{padding:72px 18px!important;}
      .ctaeye{font-size:9px!important;letter-spacing:.18em!important;margin-bottom:14px!important;}
      .ctah2{font-size:clamp(32px,8.6vw,48px)!important;margin-bottom:28px!important;}
      .ctap,.ctas2{padding:14px 18px!important;font-size:11px!important;}
      .trust{gap:10px 14px!important;margin-top:26px!important;}
      .titem{font-size:10px!important;}

      .footer{padding:24px 18px 32px!important;}
      .fcpy{font-size:10px!important;}
    }
  `;

  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background:T.bg, color:T.text, fontFamily:FONT.body, overflowX:"hidden", transition:"background .5s,color .5s" }}>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,width:"100%",height:"100%",pointerEvents:"none" }}/>

      {/* Intro sequence */}
      {!isDone && (
        <div className="intro" style={{ "--ac": clip.accent }}>
          {CLIPS.map((c, i) => {
            const shouldMountVideo = i === clipIdx || i === (clipIdx + 1) % CLIPS.length;
            return (
              <div
                key={i}
                className={`iv-wrapper ${i === clipIdx ? "active" : ""}`}
                style={{ background: "#050712" }}
              >
                {shouldMountVideo && (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                      if (el) {
                        el.muted = true;
                        el.defaultMuted = true;
                      }
                    }}
                    className="iv"
                    src={c.src}
                    autoPlay
                    muted
                    defaultMuted
                    playsInline
                    loop
                    preload="auto"
                    disablePictureInPicture
                  />
                )}
              </div>
            );
          })}
          <div className="io1"/><div className="io2"/>
          <div className="itxt" key={clipIdx}>
            <div>
              {clip.words.map((w, wi) => (
                <span key={wi} className={`iword${wi === clip.words.length - 1 ? " ac" : ""}`}
                  style={{ animationDelay:`${wi * .13}s`, "--ac": clip.accent }}>{w}</span>
              ))}
            </div>
            <div className="isub">{clip.sub}</div>
          </div>
          <div className="ieyebrow">AshFitVerse · {String(clipIdx + 1).padStart(2, "0")} / {String(CLIPS.length).padStart(2, "0")}</div>
          <div className="idots">
            {CLIPS.map((_, i) => <div key={i} className={`idot${i === clipIdx ? " on" : ""}`} style={{ "--ac": clip.accent }}/>)}
          </div>
          <button className="iskip" onClick={() => setIPhase("done")}>SKIP ›</button>
        </div>
      )}

      <div style={{ opacity:isDone?1:0, transition:"opacity .7s ease", pointerEvents:isDone?"all":"none" }}>

        {/* ── NAVBAR ── */}
        <nav className={`nav${navScrolled?" scrolled":""}`}>
          <div className="nlogo">
            <span className="nlogo-fit">AshFit</span><span className="nlogo-verse">Verse</span>
          </div>
          <div className="nr">
            <button className="tt" onClick={toggleTheme} aria-label="Toggle theme">
              <div className="tk">
                {isDark ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
              </div>
            </button>
            {hasAuthed ? (
              <>
                <button className="nl" onClick={() => navigate("/login")}>Switch</button>
                <button className="nbtn" onClick={() => navigate("/dashboard")}>Dashboard →</button>
              </>
            ) : (
              <>
                <button className="nl" onClick={() => navigate("/login")}>Sign In</button>
                <button className="nbtn" onClick={() => navigate("/signup")}>Get Started</button>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <video
            ref={(el) => {
              heroVidRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
              }
            }}
            className="hero-vid"
            src={HERO_VID}
            poster={HERO_POSTER}
            autoPlay
            muted
            defaultMuted
            playsInline
            loop
            preload="auto"
            onCanPlay={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.play().catch(() => {});
            }}
          />
          <div className="hero-vid-ov"/>
          <div className="hero-tint"/>
          <div className="hero-body" style={{ opacity:heroOpacity, transform:`translateY(${heroTY}px)`, transition:"opacity .06s" }}>
            <div className="hero-eye">Premium Fitness Ecosystem — Est. 2025</div>
            <h1 className="hero-h1">{heroTxt}<span className="hero-cursor"/></h1>
            <div className="hero-sub-container">
              <div className="hero-sub-text">Your body. Your biology. One complete platform.</div>
              <div className="hero-sub-desc">
                From cycle tracking and pregnancy guides to testosterone health, sleep HRV and sexual wellness — AshFitVerse goes deeper than any fitness app ever has.
              </div>
            </div>
          </div>
          <div className="hero-scroll"><div className="hline"/>Scroll to explore</div>
        </section>

        {/* Marquee */}
        <div className="mq">
          <div className="mq-t">
            {[0, 1].map(ri => MARQUEE.map((item, i) => (
              <span key={`${ri}-${i}`} className="mqi">{item}<span className="mqs"/></span>
            )))}
          </div>
        </div>

        {/* Features */}
        <section className="fs">
          <div className="fhdr">
            <div className="fhdr-l">Core Modules</div>
            <div className="fhdr-r">{String(FEATURES.length).padStart(2, "0")} Features</div>
          </div>
          {FEATURES.map((f, i) => (
            <div key={f.id} ref={el => rowRefs.current[i] = el} data-idx={i}
              className={`fr ${f.side === "left" ? "fl" : "frr"}${visRows.has(i) ? " vis" : ""}`}
              style={{ transitionDelay:`${i * .05}s`, "--fac": f.accent }}
              onClick={() => navigate("/signup")}>
              <div className="fr-grid">
                <div className="fr-img"><img src={f.img} alt={f.tag} loading="lazy"/></div>
                <div className="fr-txt">
                  <div className="fr-bar" style={{ background: f.accent }}/>
                  <div className="fr-num">{f.num}</div>
                  <div className="fr-tag">{f.tag}</div>
                  <div className="fr-title">{f.title}</div>
                  <div className="fr-line" style={{ background:`linear-gradient(90deg,${f.accent},transparent)` }}/>
                  <div className="fr-sub">{f.sub}</div>
                  <div className="fr-sv" style={{ color: f.accent }}>{f.stat}</div>
                  <div className="fr-sl">{f.sl}</div>
                  <div className="fr-arr">→</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Stats — NO fake numbers */}
        <section className="ss">
          <div>
            <div className="eye">Built different</div>
            <h2 className="sh2">Real Depth.<br/><em>One Platform.</em></h2>
            <p className="sbody">
              AshFitVerse connects every health signal — training, sleep, nutrition, hormones and mental health — and builds a programme that adapts to <em style={{ fontStyle:"italic", color:T.accent }}>you</em>.
            </p>
          </div>
          <div className="sgrid">
            {STATS.map((s, i) => (
              <div key={i} className="sblk">
                <div className="sn">{s.num}</div>
                <div className="sl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="ws">
          <div className="whdr">
            <div>
              <div className="eye">Why AshFitVerse</div>
              <h2 className="wh2">Every System.<br/><em>One Platform.</em></h2>
            </div>
            <p className="wsub">Six reasons we are built differently — not just another fitness app.</p>
          </div>
          <div className="wgrid">
            {WHY.map((w, i) => (
              <div key={i} className="wcard" style={{ "--wc":w.c, "--wcs":w.c+"18", "--wcb":w.c+"30" }}>
                <div className="wico">{w.num}</div>
                <div className="wtitle">{w.t}</div>
                <div className="wdesc">{w.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Gender cards */}
        <section className="gs">
          {GENDER_CARDS.map((g, i) => (
            <div key={i} className="gcard" style={{ "--gc": g.gc }}>
              <div className="gglow"/>
              <div className="gsym">{g.sym}</div>
              <div className="gtitle">{g.title}</div>
              {g.items.map((item, j) => (
                <div key={j} className="gitem"><div className="gdot"/>{item}</div>
              ))}
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="ctas">
          <div className="ctaglow"/>
          <div className="ctaeye">Your era starts now</div>
          <div className="ctah2">Start Your<em>Journey.</em></div>
          <div className="ctabtns">
            <button className="ctap" onClick={() => navigate("/signup")}>Create Free Account →</button>
            <button className="ctas2" onClick={() => navigate("/login")}>Sign In</button>
          </div>
          <div className="trust">
            {["🔒 Encrypted","📱 All devices","🆓 Free plan","⚡ 3-min setup","🚫 No ads"].map((b, i) => (
              <div key={i} className="titem">{b}</div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="flog">
            <span className="flog-fit">AshFit</span><span className="flog-verse">Verse</span>
          </div>
          <div className="fcpy">Built for Discipline · © 2025 AshFitVerse</div>
        </footer>

      </div>
    </div>
  );
}