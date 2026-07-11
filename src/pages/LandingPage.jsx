// src/pages/LandingPage.jsx — AshFitVerse v7
// FIXES vs v6:
//  • Light mode applies everywhere EXCEPT hero (hero always stays dark-overlay)
//  • Neon glow completely removed — pure accent colour, high contrast both themes
//  • Card backgrounds removed (no ghost boxes in light mode)
//  • Intro transitions: all consistent clip-path based (no glitch/burn/opacity hacks)
//  • Duplicate slogans removed
//  • Hero subtitle fully visible (solid colour, text-shadow for legibility over video)
//  • /videos/ local paths — put mp4 files in /public/videos/

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Video paths ──────────────────────────────────────────────────────────────
// Download from pexels and place in /public/videos/
const CLIPS = [
  { src: "/videos/intro1.mp4", words: ["FORGE", "YOUR", "STRENGTH"], sub: "Every set. Every rep. Every day.",       accent: "#4f8ef7", trans: "wipe-right"  },
  { src: "/videos/intro2.mp4", words: ["EAT.", "SMART.", "THRIVE."], sub: "Biology-powered nutrition.",             accent: "#34d399", trans: "wipe-up"     },
  { src: "/videos/intro3.mp4", words: ["TRACK", "EVERY", "WIN"],     sub: "23 metrics. Real-time insights.",        accent: "#a78bfa", trans: "wipe-left"   },
  { src: "/videos/intro4.mp4", words: ["MIND.", "BODY.", "UNITED."], sub: "Holistic wellness, one platform.",       accent: "#fbbf24", trans: "wipe-down"   },
  { src: "/videos/intro5.mp4", words: ["BUILT", "FOR", "HER"],       sub: "Cycle-aware. Hormone-smart.",            accent: "#f472b6", trans: "wipe-right"  },
  { src: "/videos/intro6.mp4", words: ["YOUR", "BEST", "BODY."],     sub: "Welcome to AshFitVerse.",                accent: "#ffffff", trans: "wipe-up"     },
];
const HERO_VID  = "/videos/hero.mp4";
const HOLD_MS   = 2600;
const TRANS_MS  = 680;

const HERO_LINES = [
  "Build Your\nBest Body.",
  "Train Like\nYou Mean It.",
  "Science Meets\nDiscipline.",
  "Your Body.\nYour Rules.",
];

const FEATURES = [
  { id:1, side:"left",  num:"01", tag:"TRAINING",        title:"Train Like You\nMean It",       sub:"Phase-based plans · 500+ exercises · adaptive AI recovery scoring",        accent:"#4f8ef7", img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80", stat:"500+",   sl:"Exercises"    },
  { id:2, side:"right", num:"02", tag:"NUTRITION",       title:"Eat With\nPurpose",              sub:"Hormone-synced meal plans · macro tracking · 1200+ mapped foods",           accent:"#34d399", img:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80", stat:"1200+",  sl:"Meals mapped" },
  { id:3, side:"left",  num:"03", tag:"WOMEN'S HEALTH",  title:"Cycle-Aware\nFitness",           sub:"Cycle tracker · PCOS guide · ovulation AI · hormone-phase plans",           accent:"#f472b6", img:"https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1400&q=80", stat:"28-day", sl:"Intelligence" },
  { id:4, side:"right", num:"04", tag:"MEN'S HEALTH",    title:"Optimise Every\nSystem",         sub:"Testosterone health · sleep & HRV · mental resilience · sexual wellness",    accent:"#fb923c", img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80", stat:"360°",   sl:"Coverage"     },
  { id:5, side:"left",  num:"05", tag:"ANALYTICS",       title:"Data That\nDrives Results",      sub:"BMI · body fat · calorie trends · weight progress · weekly deep dives",      accent:"#a78bfa", img:"https://images.unsplash.com/photo-1581009137042-c552e485697a?w=1400&q=80", stat:"23",     sl:"Live metrics" },
  { id:6, side:"right", num:"06", tag:"MENTAL WELLNESS", title:"Mind & Body\nUnited",            sub:"Mood tracking · CBT tools · stress management · daily mindfulness",           accent:"#fbbf24", img:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1400&q=80", stat:"Daily",  sl:"Check-ins"    },
  { id:7, side:"left",  num:"07", tag:"SHOP",            title:"Science-Backed\nSupplements",    sub:"Ashwagandha · ZMA · creatine · omega-3 · evidence-only curation",            accent:"#38bdf8", img:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80", stat:"60+",    sl:"Products"     },
];

const STATS   = [{ num:"24K+", lbl:"Active members" },{ num:"180K", lbl:"Workouts logged" },{ num:"98%", lbl:"Goal achievement" },{ num:"4.9★", lbl:"Average rating" }];
const MARQUEE = ["Workouts","Nutrition","Cycle Tracking","Testosterone Health","Mental Wellness","Sleep Recovery","Progress Analytics","Women's Health","Men's Health","Supplements"];
const WHY     = [
  { ico:"📊", t:"Unified Analytics",    d:"23 real-time health metrics — weight, BMI, body fat, calories, sleep & HRV, all synced across devices.", c:"#4f8ef7" },
  { ico:"🧬", t:"Biology-First Design", d:"Phase-based plans adapting to your hormonal cycle, testosterone levels, sleep quality and recovery score.", c:"#a78bfa" },
  { ico:"🔒", t:"Private by Default",   d:"End-to-end encrypted health data. No ads, no data selling, no third-party sharing. Ever.",                 c:"#34d399" },
  { ico:"🛒", t:"Evidence-Only Shop",   d:"Curated supplements with clinical evidence. No paid placements — merit only.",                             c:"#fbbf24" },
  { ico:"♀♂", t:"Gender-Aware AI",      d:"Separate, deep health stacks for female and male biology — not just different colour schemes.",            c:"#f472b6" },
  { ico:"⚡", t:"Zero Setup",           d:"Complete onboarding in under 3 minutes. Personalised dashboard ready immediately after signup.",           c:"#fb923c" },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
// Hero section ALWAYS uses dark values regardless of theme toggle
const DARK = {
  bg:"#07080f", bgD:"#050610",
  txt:"#eef2ff", txS:"rgba(210,218,255,.72)", txM:"rgba(210,218,255,.44)", txF:"rgba(210,218,255,.20)",
  bdr:"rgba(255,255,255,.08)", bdrH:"rgba(255,255,255,.22)",
  acc:"#4f8ef7",
  featBg:"rgba(7,8,15,.97)", statBg:"rgba(5,6,18,.98)", whyBg:"rgba(7,8,15,.99)",
  genBg:"rgba(5,6,18,.99)",  ctaBg:"rgba(5,6,15,1)",    footBg:"rgba(5,6,15,1)",
  cardBg:"rgba(7,8,20,.55)", cardBgH:"rgba(12,14,28,.9)",
  genCard:"rgba(7,8,20,.65)",genCardH:"rgba(12,14,30,.9)",
  fovBg:"linear-gradient(105deg,rgba(7,8,15,.94) 0%,rgba(7,8,15,.72) 50%,rgba(7,8,15,.4) 100%)",
  imgBright:".55",
};
const LIGHT = {
  bg:"#f4f6ff", bgD:"#eceffe",
  txt:"#0a0c1e", txS:"rgba(10,12,30,.65)", txM:"rgba(10,12,30,.42)", txF:"rgba(10,12,30,.22)",
  bdr:"rgba(0,0,0,.09)", bdrH:"rgba(79,142,247,.45)",
  acc:"#2563eb",
  featBg:"#f9faff", statBg:"#f4f6ff", whyBg:"#f9faff",
  genBg:"#f4f6ff",  ctaBg:"#eceffe",  footBg:"#eceffe",
  // NO card backgrounds in light mode — transparent so no ghost boxes
  cardBg:"transparent", cardBgH:"rgba(255,255,255,.6)",
  genCard:"rgba(255,255,255,.7)", genCardH:"rgba(255,255,255,.95)",
  fovBg:"linear-gradient(105deg,rgba(249,250,255,.96) 0%,rgba(249,250,255,.82) 50%,rgba(249,250,255,.55) 100%)",
  imgBright:".65",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const T = isDark ? DARK : LIGHT;

  // intro
  const [clipIdx,   setClipIdx]   = useState(0);
  const [iPhase,    setIPhase]    = useState("in");   // in|hold|out|done
  // hero typewriter
  const [heroLine,  setHeroLine]  = useState(0);
  const [heroTxt,   setHeroTxt]   = useState("");
  const [heroPhase, setHeroPhase] = useState("typing");
  // page
  const [scrollY,   setScrollY]   = useState(0);
  const [visRows,   setVisRows]   = useState(new Set());

  const canvasRef  = useRef(null);
  const distRef    = useRef(null);
  const rowRefs    = useRef([]);
  const scrollRef  = useRef(0);
  const mouseRef   = useRef({ x:-999, y:-999, vx:0, vy:0, px:-999, py:-999 });
  const isDarkRef  = useRef(isDark);
  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  // ── Intro sequence ──────────────────────────────────────────────────────
  useEffect(() => {
    if (iPhase === "done") return;
    let t;
    if (iPhase === "in")   t = setTimeout(() => setIPhase("hold"), 260);
    if (iPhase === "hold") t = setTimeout(() => setIPhase("out"),  HOLD_MS);
    if (iPhase === "out")  t = setTimeout(() => {
      if (clipIdx < CLIPS.length - 1) { setClipIdx(c => c+1); setIPhase("in"); }
      else setIPhase("done");
    }, TRANS_MS);
    return () => clearTimeout(t);
  }, [iPhase, clipIdx]);

  // ── Hero typewriter ─────────────────────────────────────────────────────
  useEffect(() => {
    if (iPhase !== "done") return;
    const full = HERO_LINES[heroLine];
    let t;
    if (heroPhase === "typing") {
      if (heroTxt.length < full.length) t = setTimeout(() => setHeroTxt(full.slice(0, heroTxt.length+1)), 44);
      else t = setTimeout(() => setHeroPhase("hold"), 2400);
    } else if (heroPhase === "hold") {
      t = setTimeout(() => setHeroPhase("erasing"), 400);
    } else if (heroPhase === "erasing") {
      if (heroTxt.length > 0) t = setTimeout(() => setHeroTxt(heroTxt.slice(0,-1)), 20);
      else { setHeroLine(l => (l+1) % HERO_LINES.length); setHeroPhase("typing"); }
    }
    return () => clearTimeout(t);
  }, [iPhase, heroPhase, heroTxt, heroLine]);

  // ── IntersectionObserver for feature rows ───────────────────────────────
  useEffect(() => {
    if (iPhase !== "done") return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setVisRows(p => new Set([...p, +e.target.dataset.idx])); });
    }, { threshold: 0.14 });
    rowRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [iPhase]);

  // ── Scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => { scrollRef.current = window.scrollY; setScrollY(window.scrollY); };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Mesh canvas BG ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const N = 72;
    const pts = Array.from({length:N}, (_,i) => ({
      x:Math.random()*1.2-.1, y:Math.random()*1.2-.1,
      r:.3+Math.random()*.9, vx:(Math.random()-.5)*.00022, vy:(Math.random()-.5)*.00018,
      ph:Math.random()*Math.PI*2, a:.04+Math.random()*.09,
      c:["rgba(79,142,247,","rgba(167,139,250,","rgba(52,211,153,","rgba(251,146,60,"][i%4],
    }));
    const GX=8, GY=5;
    const nodes = [];
    for (let gy=0;gy<=GY;gy++) for (let gx=0;gx<=GX;gx++)
      nodes.push({ bx:gx/GX, by:gy/GY, ox:(Math.random()-.5)*.055, oy:(Math.random()-.5)*.055, ph:Math.random()*Math.PI*2 });
    let t=0, raf;
    const draw = () => {
      t+=.007;
      const sp = Math.min(scrollRef.current/1000,1);
      const mx = isFinite(mouseRef.current.x) ? mouseRef.current.x/(W||1) : .5;
      const my = isFinite(mouseRef.current.y) ? mouseRef.current.y/(H||1) : .5;
      if (!W||!H) { raf=requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,W,H);
      const dark = isDarkRef.current;
      const bg = ctx.createRadialGradient(W*.5,H*.25,0,W*.5,H*.25,W*.85);
      if (dark) { bg.addColorStop(0,"rgba(7,8,15,1)"); bg.addColorStop(.5,"rgba(5,6,20,1)"); bg.addColorStop(1,"rgba(3,4,10,1)"); }
      else       { bg.addColorStop(0,"rgba(244,246,255,1)"); bg.addColorStop(.5,"rgba(236,239,254,1)"); bg.addColorStop(1,"rgba(228,232,252,1)"); }
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      if (mx>0) {
        const mg=ctx.createRadialGradient(mx*W,my*H,0,mx*W,my*H,W*.3);
        mg.addColorStop(0,`rgba(79,142,247,${.055+sp*.035})`); mg.addColorStop(1,"rgba(79,142,247,0)");
        ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
      }
      const ma = dark ? .022+sp*.015 : .05+sp*.02;
      for (let gy=0;gy<=GY;gy++) {
        ctx.beginPath();
        for (let gx=0;gx<=GX;gx++) {
          const nd=nodes[gy*(GX+1)+gx];
          const nx=(nd.bx+nd.ox+Math.sin(t*.35+nd.ph)*.013+mx*.02)*W;
          const ny=(nd.by+nd.oy+Math.cos(t*.28+nd.ph)*.011+my*.013)*H;
          if(isFinite(nx)&&isFinite(ny)) gx===0?ctx.moveTo(nx,ny):ctx.lineTo(nx,ny);
        }
        ctx.strokeStyle=`rgba(79,142,247,${ma})`; ctx.lineWidth=.5; ctx.stroke();
      }
      for (let gx=0;gx<=GX;gx++) {
        ctx.beginPath();
        for (let gy=0;gy<=GY;gy++) {
          const nd=nodes[gy*(GX+1)+gx];
          const nx=(nd.bx+nd.ox+Math.sin(t*.35+nd.ph)*.013+mx*.02)*W;
          const ny=(nd.by+nd.oy+Math.cos(t*.28+nd.ph)*.011+my*.013)*H;
          if(isFinite(nx)&&isFinite(ny)) gy===0?ctx.moveTo(nx,ny):ctx.lineTo(nx,ny);
        }
        ctx.strokeStyle=`rgba(79,142,247,${ma})`; ctx.lineWidth=.5; ctx.stroke();
      }
      pts.forEach(p => {
        p.x+=p.vx+Math.sin(t*.45+p.ph)*.00011; p.y+=p.vy+Math.cos(t*.38+p.ph)*.000085;
        if(p.x<-.1) p.x=1.1; if(p.x>1.1) p.x=-.1; if(p.y<-.1) p.y=1.1; if(p.y>1.1) p.y=-.1;
        const px=p.x*W, py=p.y*H, pr=p.r*15;
        if(!isFinite(px)||!isFinite(py)||pr<=0) return;
        const al = dark ? p.a : p.a*.5;
        const grd=ctx.createRadialGradient(px,py,0,px,py,pr);
        grd.addColorStop(0,p.c+al*2.2+")"); grd.addColorStop(1,p.c+"0)");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=p.c+al*3+")"; ctx.beginPath(); ctx.arc(px,py,p.r,0,Math.PI*2); ctx.fill();
      });
      for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d2=dx*dx+dy*dy;
        if (d2<.005) {
          const al = dark ? (1-d2/.005)*.038 : (1-d2/.005)*.06;
          const x1=pts[i].x*W,y1=pts[i].y*H,x2=pts[j].x*W,y2=pts[j].y*H;
          if(!isFinite(x1)||!isFinite(y1)) continue;
          ctx.strokeStyle=`rgba(79,142,247,${al})`; ctx.lineWidth=.5;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
      }
      if (dark) {
        const sy=((t*.1)%1)*H;
        const sg=ctx.createLinearGradient(0,sy-50,0,sy+50);
        sg.addColorStop(0,"rgba(79,142,247,0)"); sg.addColorStop(.5,`rgba(79,142,247,.011)`); sg.addColorStop(1,"rgba(79,142,247,0)");
        ctx.fillStyle=sg; ctx.fillRect(0,sy-50,W,100);
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize",resize); cancelAnimationFrame(raf); };
  }, [isDark]);

  // ── Distortion cursor ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = distRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = e => {
      mouseRef.current.vx=e.clientX-mouseRef.current.px;
      mouseRef.current.vy=e.clientY-mouseRef.current.py;
      mouseRef.current.px=mouseRef.current.x;
      mouseRef.current.py=mouseRef.current.y;
      mouseRef.current.x=e.clientX;
      mouseRef.current.y=e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    let cx=-999, cy=-999, rings=[], lastX=-999, lastY=-999, raf;
    const draw = () => {
      if(!W||!H) { raf=requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,W,H);
      cx+=(mouseRef.current.x-cx)*.28;
      cy+=(mouseRef.current.y-cy)*.28;
      if(cx<0) { raf=requestAnimationFrame(draw); return; }
      const spd=Math.sqrt(mouseRef.current.vx**2+mouseRef.current.vy**2);
      const dark=isDarkRef.current;
      const ac=dark?"79,142,247":"37,99,235";
      if(spd>3) {
        const d=Math.sqrt((cx-lastX)**2+(cy-lastY)**2);
        if(d>16) { rings.push({x:cx,y:cy,r:0,max:46+spd*1.3,life:1}); lastX=cx; lastY=cy; }
      }
      rings=rings.filter(r=>r.life>0);
      rings.forEach(rg => {
        rg.r+=(rg.max-rg.r)*.14; rg.life-=.032+spd*.002;
        const al=rg.life*.45;
        ctx.save(); ctx.globalAlpha=al;
        ctx.strokeStyle=`rgba(${ac},${al})`; ctx.lineWidth=1.2;
        ctx.shadowColor=`rgba(${ac},.8)`; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.arc(rg.x,rg.y,rg.r,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      });
      const aR=20+spd*.35;
      const aG=ctx.createRadialGradient(cx,cy,aR*.2,cx,cy,aR);
      aG.addColorStop(0,`rgba(${ac},0)`); aG.addColorStop(.6,`rgba(${ac},${.06+spd*.003})`); aG.addColorStop(1,`rgba(${ac},0)`);
      ctx.fillStyle=aG; ctx.beginPath(); ctx.arc(cx,cy,aR,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.globalAlpha=.9;
      ctx.fillStyle=`rgba(${ac},1)`;
      ctx.shadowColor=`rgba(${ac},1)`; ctx.shadowBlur=10+spd*.4;
      ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2); ctx.fill(); ctx.restore();
      if(spd>5) {
        const tl=Math.min(spd*2.2,55);
        const nm=Math.sqrt(mouseRef.current.vx**2+mouseRef.current.vy**2)||1;
        const nx=-mouseRef.current.vx/nm, ny=-mouseRef.current.vy/nm;
        const tg=ctx.createLinearGradient(cx,cy,cx+nx*tl,cy+ny*tl);
        tg.addColorStop(0,`rgba(${ac},.5)`); tg.addColorStop(1,`rgba(${ac},0)`);
        ctx.save(); ctx.globalAlpha=Math.min(spd/28,.75);
        ctx.strokeStyle=tg; ctx.lineWidth=1.8+spd*.05; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+nx*tl,cy+ny*tl); ctx.stroke(); ctx.restore();
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMove); cancelAnimationFrame(raf); };
  }, []);

  const isDone = iPhase === "done";
  const isOut  = iPhase === "out";
  const clip   = CLIPS[clipIdx];
  const heroOpacity = Math.max(0, 1 - scrollY/(window.innerHeight*.52));
  const heroTY      = -scrollY*.32;

  // ── CSS ──────────────────────────────────────────────────────────────────
  // Hero always uses dark text/overlay values regardless of isDark toggle
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    ::selection{background:${T.acc};color:#fff;}
    ::-webkit-scrollbar{width:2px;}
    ::-webkit-scrollbar-thumb{background:${T.acc}66;border-radius:99px;}
    body,a,button{cursor:none;}

    /* ══════════════ INTRO ══════════════ */
    .intro{position:fixed;inset:0;z-index:1000;overflow:hidden;background:#000;}
    .iv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
        animation:kenBI 3.8s ease-out forwards;}
    @keyframes kenBI{from{transform:scale(1.1);}to{transform:scale(1.0);}}

    /* Consistent 4-layer overlay — same on every clip */
    .io1{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.42) 0%,rgba(0,0,0,.04) 38%,rgba(0,0,0,.72) 100%);}
    .io2{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,.32) 0%,transparent 62%);}
    .io3{position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.28;background:var(--ac);}
    .io4{position:absolute;inset:0;background:radial-gradient(ellipse 80% 78% at 50% 50%,transparent 32%,rgba(0,0,0,.58) 100%);}

    /* ── Transitions: ALL clip-path based — consistent look ── */
    /* wipe-right: content exits to the right */
    .tr-wipe-right{animation:trWipeRight ${TRANS_MS}ms cubic-bezier(.77,0,.18,1) forwards;}
    @keyframes trWipeRight{0%{clip-path:inset(0 0 0 0);}100%{clip-path:inset(0 0 0 100%);}}

    /* wipe-up: content exits upward */
    .tr-wipe-up{animation:trWipeUp ${TRANS_MS}ms cubic-bezier(.77,0,.18,1) forwards;}
    @keyframes trWipeUp{0%{clip-path:inset(0 0 0 0);}100%{clip-path:inset(0 0 100% 0);}}

    /* wipe-left: content exits to the left */
    .tr-wipe-left{animation:trWipeLeft ${TRANS_MS}ms cubic-bezier(.77,0,.18,1) forwards;}
    @keyframes trWipeLeft{0%{clip-path:inset(0 0 0 0);}100%{clip-path:inset(0 100% 0 0);}}

    /* wipe-down: content exits downward */
    .tr-wipe-down{animation:trWipeDown ${TRANS_MS}ms cubic-bezier(.77,0,.18,1) forwards;}
    @keyframes trWipeDown{0%{clip-path:inset(0 0 0 0);}100%{clip-path:inset(100% 0 0 0);}}

    /* Intro text */
    .itxt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
          justify-content:center;text-align:center;padding:0 24px;pointer-events:none;z-index:6;}
    .iword{display:block;font-family:'Syne',sans-serif;font-size:clamp(58px,11vw,148px);
           font-weight:800;line-height:.82;letter-spacing:-.03em;color:#fff;
           opacity:0;transform:translateY(46px) skewY(3deg);
           animation:iWordIn .58s cubic-bezier(.22,1,.36,1) forwards;}
    /* Last word — gradient accent, no neon glow */
    .iword.ac{
      background:linear-gradient(140deg,var(--ac) 20%,rgba(255,255,255,.92) 80%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    @keyframes iWordIn{0%{opacity:0;transform:translateY(46px) skewY(3deg);}100%{opacity:1;transform:translateY(0) skewY(0);}}
    .isub{margin-top:26px;font-size:clamp(12px,1.5vw,18px);color:rgba(255,255,255,.58);
          font-weight:300;letter-spacing:.22em;text-transform:uppercase;
          opacity:0;animation:iSubIn .55s .5s cubic-bezier(.22,1,.36,1) forwards;}
    @keyframes iSubIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    .ieyebrow{position:absolute;bottom:32px;left:48px;font-size:10.5px;font-weight:700;
              letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.4);
              opacity:0;animation:iSubIn .5s .65s forwards;}
    .inum{position:absolute;top:50%;right:56px;transform:translateY(-50%);
          font-family:'Syne',sans-serif;font-size:clamp(72px,9vw,122px);font-weight:800;
          letter-spacing:-.04em;color:rgba(255,255,255,.04);user-select:none;pointer-events:none;}
    .idots{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}
    .idot{width:5px;height:5px;border-radius:99px;background:rgba(255,255,255,.22);transition:all .3s;}
    .idot.on{width:24px;background:var(--ac);}
    .iskip{position:absolute;bottom:30px;right:48px;font-size:10.5px;font-weight:700;
           letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.3);cursor:none;
           z-index:10;background:transparent;border:1px solid rgba(255,255,255,.15);
           padding:8px 18px;border-radius:2px;transition:all .22s;}
    .iskip:hover{color:#fff;border-color:rgba(255,255,255,.5);}

    /* ══════════════ NAV ══════════════ */
    .nav{position:fixed;top:0;left:0;right:0;z-index:200;
         display:flex;align-items:center;justify-content:space-between;padding:28px 56px;}
    .nlogo{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;
           letter-spacing:.05em;color:${T.txt};text-transform:uppercase;}
    /* No neon — just accent colour */
    .nlogo em{color:${T.acc};font-style:normal;}
    .nr{display:flex;align-items:center;gap:14px;}
    /* Theme toggle */
    .tt{width:50px;height:28px;border-radius:99px;cursor:none;position:relative;
        flex-shrink:0;outline:none;padding:0;
        border:1.5px solid ${T.acc}55;
        background:${isDark?"rgba(79,142,247,.15)":"rgba(37,99,235,.12)"};
        transition:background .4s,border-color .4s;}
    .tt:hover{border-color:${T.acc}99;}
    .tk{position:absolute;top:3px;width:22px;height:22px;border-radius:50%;
        background:linear-gradient(135deg,${T.acc},#a78bfa);
        display:flex;align-items:center;justify-content:center;font-size:12px;
        transition:left .4s cubic-bezier(.34,1.56,.64,1);pointer-events:none;
        left:${isDark?"3px":"25px"};}
    .nl{font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
        color:${T.txM};background:none;border:none;cursor:none;padding:8px 4px;transition:color .25s;}
    .nl:hover{color:${T.txt};}
    .nbtn{font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
          color:${T.txt};background:transparent;border:1px solid ${T.acc}66;
          padding:10px 22px;border-radius:3px;cursor:none;
          transition:all .28s cubic-bezier(.4,0,.2,1);}
    .nbtn:hover{background:${T.acc}18;border-color:${T.acc};}

    /* ══════════════ HERO ══════════════
       Hero ALWAYS uses dark overlay — independent of isDark state.
       Video BG + dark overlays are hardcoded here so light mode toggle
       doesn't inject white/light gradients into the hero.
    ══════════════════════════════════ */
    .hero{position:relative;height:100vh;overflow:hidden;
          display:flex;flex-direction:column;justify-content:flex-end;
          padding:0 56px 100px;}
    .hero-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
              filter:brightness(.32) saturate(1.1);
              animation:heroBG 22s ease-in-out infinite alternate;}
    @keyframes heroBG{from{transform:scale(1.0);}to{transform:scale(1.12) translateX(-3%);}}
    /* ALWAYS dark overlay — no theme variable used here */
    .hero-vid-ov{position:absolute;inset:0;
                 background:linear-gradient(to bottom,
                   rgba(5,6,16,.22) 0%,
                   rgba(5,6,16,.04) 38%,
                   rgba(5,6,16,.86) 100%);}
    .hero-tint{position:absolute;inset:0;pointer-events:none;
               background:radial-gradient(ellipse 55% 50% at 75% 82%,rgba(79,142,247,.14) 0%,transparent 70%);}
    .hero-body{position:relative;z-index:2;display:flex;flex-direction:column;}
    /* Hero text always white/light — hardcoded */
    .hero-eye{font-size:10.5px;font-weight:700;letter-spacing:.34em;text-transform:uppercase;
              color:#4f8ef7;margin-bottom:32px;}
    .hero-h1{font-family:'Syne',sans-serif;font-size:clamp(56px,9vw,138px);font-weight:800;
             line-height:.90;letter-spacing:-.04em;color:#eef2ff;white-space:pre-line;
             text-shadow:0 2px 40px rgba(0,0,0,.8);min-height:2.8em;margin-bottom:6px;}
    .hero-cursor{display:inline-block;width:3px;height:.82em;background:#4f8ef7;
                 margin-left:6px;vertical-align:-.02em;animation:blink .9s step-end infinite;}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    /* Subtitle — always visible over dark hero */
    .hero-sub{
      font-size:clamp(15px,1.8vw,20px);
      color:rgba(220,228,255,.88);
      font-weight:300;line-height:1.7;
      margin-top:24px;
      max-width:460px;
      text-shadow:0 1px 22px rgba(0,0,0,.75);
    }
    /* Ghost line */
    .hero-ghost{font-family:'Syne',sans-serif;font-size:clamp(56px,9vw,138px);font-weight:800;
                line-height:.90;letter-spacing:-.04em;color:transparent;
                -webkit-text-stroke:1.5px rgba(79,142,247,.22);
                user-select:none;pointer-events:none;margin-top:4px;}
    .hero-scroll{position:absolute;bottom:38px;left:56px;z-index:2;
                 display:flex;align-items:center;gap:12px;font-size:10px;
                 letter-spacing:.22em;text-transform:uppercase;color:rgba(210,218,255,.32);}
    .hline{width:36px;height:1px;background:linear-gradient(to right,rgba(79,142,247,.7),transparent);
           animation:lGrow 2.4s ease-in-out infinite;}
    @keyframes lGrow{0%,100%{transform:scaleX(.2);opacity:.4;}50%{transform:scaleX(1);opacity:1;}}

    /* ══════════════ MARQUEE ══════════════ */
    .mq{border-top:1px solid ${T.bdr};border-bottom:1px solid ${T.bdr};padding:13px 0;
        overflow:hidden;background:${isDark?"rgba(5,6,15,.96)":"rgba(244,246,255,.96)"};
        backdrop-filter:blur(20px);position:relative;z-index:10;}
    .mq-t{display:flex;white-space:nowrap;width:max-content;animation:mq 30s linear infinite;}
    .mq-t:hover{animation-play-state:paused;}
    @keyframes mq{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    .mqi{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.24em;
          text-transform:uppercase;color:${T.acc}88;padding:0 32px;
          display:inline-flex;align-items:center;gap:32px;}
    .mqs{width:3px;height:3px;border-radius:50%;background:${T.acc}44;}

    /* ══════════════ FEATURES ══════════════ */
    .fs{background:${T.featBg};position:relative;z-index:10;}
    .fhdr{padding:80px 56px 44px;display:flex;align-items:flex-end;justify-content:space-between;
          border-bottom:1px solid ${T.bdr};}
    /* No neon — plain accent colour for labels */
    .fhdr-l{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:${T.acc};font-weight:600;}
    .fhdr-r{font-family:'Syne',sans-serif;font-size:10.5px;letter-spacing:.2em;color:${T.txM};font-weight:700;}

    .fr{position:relative;overflow:hidden;cursor:none;border-bottom:1px solid ${T.bdr};
        opacity:0;transition:opacity .65s ease,transform .65s cubic-bezier(.4,0,.2,1);}
    .fr:first-child{border-top:1px solid ${T.bdr};}
    .fr.fl {transform:translateX(-44px);}
    .fr.frr{transform:translateX( 44px);}
    .fr.vis{opacity:1;transform:translateX(0)!important;}

    .fr-grid{display:grid;grid-template-columns:1fr 1fr;min-height:360px;}
    .frr .fr-grid{direction:rtl;}
    .frr .fr-grid > *{direction:ltr;}

    .fr-img{position:relative;overflow:hidden;background:#111;}
    .fr-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
                transform:scale(1.07);
                transition:transform .65s cubic-bezier(.4,0,.2,1),filter .55s;
                filter:brightness(${T.imgBright}) saturate(.88);}
    .fr:hover .fr-img img{transform:scale(1.0);filter:brightness(${isDark?".80":".92"}) saturate(1);}
    .fl  .fr-img::after{content:'';position:absolute;inset:0;
                         background:linear-gradient(to right,transparent 55%,${T.featBg} 100%);pointer-events:none;}
    .frr .fr-img::after{content:'';position:absolute;inset:0;
                         background:linear-gradient(to left, transparent 55%,${T.featBg} 100%);pointer-events:none;}

    .fr-txt{display:flex;flex-direction:column;justify-content:center;
            padding:52px 56px;position:relative;z-index:2;}
    .fr-bar{position:absolute;top:50%;translate:0 -50%;width:0;height:55%;
            transition:width .42s cubic-bezier(.34,1.56,.64,1);border-radius:0 3px 3px 0;}
    .fl  .fr-bar{left:0;}
    .frr .fr-bar{right:0;border-radius:3px 0 0 3px;}
    .fr:hover .fr-bar{width:3px;}

    /* No neon — accent colour only */
    .fr-num{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.3em;
            text-transform:uppercase;color:${T.txM};margin-bottom:8px;transition:color .3s;}
    .fr:hover .fr-num{color:${T.acc};}
    .fr-tag{font-size:9.5px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;
            color:var(--fac);margin-bottom:10px;}
    .fr-title{font-family:'Syne',sans-serif;font-size:clamp(26px,3vw,46px);font-weight:800;
              line-height:1.02;letter-spacing:-.025em;color:${T.txt};white-space:pre-line;
              margin-bottom:16px;transition:translate .42s cubic-bezier(.34,1.56,.64,1);}
    .fl:hover  .fr-title{translate: 10px 0;}
    .frr:hover .fr-title{translate:-10px 0;}
    .fr-line{height:2px;width:0;border-radius:99px;margin-bottom:16px;
             transition:width .55s cubic-bezier(.34,1.56,.64,1) .1s;}
    .fr.vis .fr-line{width:68px;}
    .fr-sub{font-size:13px;color:${T.txS};line-height:1.68;font-weight:300;max-width:320px;margin-bottom:24px;}
    /* Stat — accent colour, NO neon/glow */
    .fr-sv{font-family:'Syne',sans-serif;font-size:clamp(22px,2.6vw,38px);font-weight:800;line-height:1;}
    .fr-sl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${T.txM};margin-top:4px;font-weight:600;}
    .fr-arr{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
            border-radius:50%;border:1px solid ${T.bdr};font-size:15px;color:transparent;
            scale:.6;margin-top:20px;transition:all .38s cubic-bezier(.34,1.56,.64,1);}
    .fr:hover .fr-arr{color:${T.txt};border-color:${T.acc}88;scale:1;background:${T.acc}18;}

    /* ══════════════ STATS ══════════════ */
    .ss{padding:110px 56px;border-top:1px solid ${T.bdr};
        display:grid;grid-template-columns:1fr 1fr;gap:80px;
        background:${T.statBg};position:relative;z-index:10;}
    /* Universal section eyebrow — accent, no neon */
    .eye{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;
         color:${T.acc};font-weight:600;margin-bottom:18px;}
    .sh2{font-family:'Syne',sans-serif;font-size:clamp(30px,3.8vw,52px);font-weight:800;
         letter-spacing:-.025em;color:${T.txt};line-height:.96;margin-bottom:22px;}
    /* Ghost em — outline only, visible on both themes */
    .sh2 em,.wh2 em{font-style:normal;color:transparent;
                    -webkit-text-stroke:1.5px ${T.acc};}
    .ctah2 em{display:block;font-style:normal;color:transparent;
              -webkit-text-stroke:2px ${T.acc};}
    .sbody{font-size:14.5px;color:${T.txS};line-height:1.82;font-weight:300;max-width:400px;}
    .sgrid{display:grid;grid-template-columns:1fr 1fr;border:1px solid ${T.bdr};}
    .sblk{padding:34px 24px;border-right:1px solid ${T.bdr};border-bottom:1px solid ${T.bdr};
          cursor:none;position:relative;overflow:hidden;transition:background .3s;}
    .sblk::before{content:'';position:absolute;inset:0;
                  background:linear-gradient(135deg,${T.acc}00,${T.acc}09);
                  opacity:0;transition:opacity .3s;}
    .sblk:hover::before{opacity:1;}
    .sblk:nth-child(2n){border-right:none;}
    .sblk:nth-last-child(-n+2){border-bottom:none;}
    .sn{font-family:'Syne',sans-serif;font-size:clamp(30px,3.8vw,50px);font-weight:800;
        line-height:1;color:${T.txt};margin-bottom:8px;}
    .sl{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:${T.txM};font-weight:600;}

    /* ══════════════ WHY ══════════════ */
    .ws{padding:100px 56px;border-top:1px solid ${T.bdr};background:${T.whyBg};position:relative;z-index:10;}
    .whdr{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:60px;}
    .wh2{font-family:'Syne',sans-serif;font-size:clamp(30px,3.8vw,52px);font-weight:800;
         letter-spacing:-.025em;color:${T.txt};line-height:1.0;}
    .wsub{font-size:13px;color:${T.txM};max-width:250px;text-align:right;line-height:1.7;font-weight:300;}
    .wgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border:1px solid ${T.bdr};}
    /* Cards: dark = semi-transparent, light = transparent (no ghost boxes) */
    .wcard{padding:36px 28px;border-right:1px solid ${T.bdr};
           background:${T.cardBg};
           transition:background .3s;cursor:none;position:relative;overflow:hidden;}
    .wcard:last-child{border-right:none;}
    .wcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
                  background:linear-gradient(90deg,transparent,var(--wc),transparent);
                  transform:scaleX(0);transition:transform .4s cubic-bezier(.34,1.56,.64,1);transform-origin:center;}
    .wcard:hover{background:${T.cardBgH};}
    .wcard:hover::after{transform:scaleX(1);}
    .wico{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;
          justify-content:center;font-size:20px;margin-bottom:20px;
          background:var(--wcs);border:1px solid var(--wcb);}
    .wtitle{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${T.txt};margin-bottom:10px;}
    .wdesc{font-size:13px;color:${T.txS};line-height:1.7;font-weight:300;}

    /* ══════════════ GENDER ══════════════ */
    .gs{padding:100px 56px;border-top:1px solid ${T.bdr};background:${T.genBg};
        display:grid;grid-template-columns:1fr 1fr;gap:20px;position:relative;z-index:10;}
    .gcard{border-radius:4px;padding:44px 40px;position:relative;overflow:hidden;
           border:1px solid ${T.bdr};background:${T.genCard};
           transition:border-color .35s,background .35s;cursor:none;}
    .gcard:hover{border-color:var(--gc);background:${T.genCardH};}
    .gglow{position:absolute;top:-44px;right:-44px;width:200px;height:200px;border-radius:50%;
           filter:blur(65px);opacity:.07;background:var(--gc);transition:opacity .4s;pointer-events:none;}
    .gcard:hover .gglow{opacity:.18;}
    /* No neon on gender symbol or title — accent colour only */
    .gsym{font-size:40px;margin-bottom:14px;color:var(--gc);}
    .gtitle{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--gc);margin-bottom:22px;}
    .gitem{display:flex;align-items:center;gap:12px;padding:11px 0;font-size:13.5px;
           color:${T.txS};border-bottom:1px solid ${T.bdr};transition:color .25s;}
    .gitem:last-child{border-bottom:none;}
    .gcard:hover .gitem{color:${T.txt};}
    .gdot{width:5px;height:5px;border-radius:50%;background:var(--gc);flex-shrink:0;}

    /* ══════════════ CTA ══════════════ */
    .ctas{padding:160px 56px;border-top:1px solid ${T.bdr};
          display:flex;flex-direction:column;align-items:center;text-align:center;
          background:${T.ctaBg};position:relative;overflow:hidden;z-index:10;}
    .ctaglow{position:absolute;inset:0;pointer-events:none;
             background:radial-gradient(ellipse 65% 50% at 50% 50%,${T.acc}0a 0%,transparent 70%);}
    /* No neon — plain accent */
    .ctaeye{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;
            color:${T.acc};font-weight:600;margin-bottom:28px;}
    .ctah2{font-family:'Syne',sans-serif;font-size:clamp(50px,8vw,122px);font-weight:800;
           line-height:.88;letter-spacing:-.04em;color:${T.txt};margin-bottom:50px;
           position:relative;z-index:1;}
    .ctabtns{display:flex;gap:14px;position:relative;z-index:1;}
    .ctap{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
          color:${T.txt};background:${T.acc}20;border:1px solid ${T.acc}66;
          padding:17px 42px;border-radius:3px;cursor:none;
          transition:all .32s cubic-bezier(.4,0,.2,1);backdrop-filter:blur(12px);}
    .ctap:hover{background:${T.acc}35;border-color:${T.acc};translate:0 -4px;}
    .ctas2{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
           color:${T.txM};background:transparent;border:1px solid ${T.bdr};
           padding:17px 42px;border-radius:3px;cursor:none;transition:all .28s;}
    .ctas2:hover{color:${T.txS};border-color:${T.bdrH};}
    .trust{display:flex;gap:26px;justify-content:center;margin-top:44px;flex-wrap:wrap;position:relative;z-index:1;}
    .titem{font-size:11.5px;color:${T.txF};font-weight:600;}

    /* ══════════════ FOOTER ══════════════ */
    .footer{padding:36px 56px;border-top:1px solid ${T.bdr};
            display:flex;align-items:center;justify-content:space-between;
            background:${T.footBg};z-index:10;position:relative;}
    .flog{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
          letter-spacing:.06em;text-transform:uppercase;color:${T.txM};}
    .flog em{color:${T.acc};font-style:normal;}
    .fcpy{font-size:11px;color:${T.txF};letter-spacing:.08em;}

    @media(max-width:960px){
      .nav,.hero,.fhdr,.ss,.ws,.ctas,.footer,.gs{padding-left:22px!important;padding-right:22px!important;}
      .hero{padding-bottom:72px!important;}
      .fr-grid{grid-template-columns:1fr!important;direction:ltr!important;}
      .fr-img{height:220px;}
      .fr-txt{padding:36px 22px!important;}
      .ss{grid-template-columns:1fr;gap:44px;}
      .wgrid{grid-template-columns:1fr;}
      .gs{grid-template-columns:1fr;}
      .ctabtns{flex-direction:column;width:100%;max-width:300px;}
    }
  `;

  return (
    <div style={{ background:T.bg, color:T.txt, fontFamily:"'DM Sans',sans-serif", overflowX:"hidden", transition:"background .5s,color .5s" }}>
      <style>{css}</style>

      <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,width:"100%",height:"100%",pointerEvents:"none" }} />
      <canvas ref={distRef}   style={{ position:"fixed",inset:0,zIndex:9998,width:"100%",height:"100%",pointerEvents:"none" }} />

      {/* ════════════ INTRO ════════════ */}
      {!isDone && (
        <div className={`intro${isOut ? ` tr-${clip.trans}` : ""}`} style={{ "--ac": clip.accent }}>
          <video key={clipIdx} className="iv" src={clip.src} autoPlay muted playsInline loop
            style={{ filter:"brightness(.68) contrast(1.08) saturate(1.12)" }} />
          <div className="io1"/><div className="io2"/><div className="io3"/><div className="io4"/>
          <div className="inum">{String(clipIdx+1).padStart(2,"0")}</div>
          <div className="itxt" key={clipIdx}>
            <div>
              {clip.words.map((w,wi) => (
                <span key={wi} className={`iword${wi===clip.words.length-1?" ac":""}`}
                  style={{ animationDelay:`${wi*.13}s`, "--ac":clip.accent }}>{w}</span>
              ))}
            </div>
            <div className="isub">{clip.sub}</div>
          </div>
          <div className="ieyebrow">
            AshFitVerse · {String(clipIdx+1).padStart(2,"0")} / {String(CLIPS.length).padStart(2,"0")}
          </div>
          <div className="idots">
            {CLIPS.map((_,i) => <div key={i} className={`idot${i===clipIdx?" on":""}`} style={{ "--ac":clip.accent }}/>)}
          </div>
          <button className="iskip" onClick={() => setIPhase("done")}>SKIP ›</button>
        </div>
      )}

      {/* ════════════ PAGE ════════════ */}
      <div style={{ opacity:isDone?1:0, transition:"opacity .7s ease", pointerEvents:isDone?"all":"none" }}>

        {/* Nav */}
        <nav className="nav">
          <div className="nlogo">AshFit<em>Verse</em></div>
          <div className="nr">
            <button className="tt" onClick={() => setIsDark(d=>!d)} aria-label="Toggle theme">
              <div className="tk">{isDark?"🌙":"☀️"}</div>
            </button>
            <button className="nl" onClick={() => navigate("/login")}>Sign In</button>
            <button className="nbtn" onClick={() => navigate("/signup")}>Get Started</button>
          </div>
        </nav>

        {/* Hero — always dark internally */}
        <section className="hero">
          <video className="hero-vid" src={HERO_VID} autoPlay muted playsInline loop />
          <div className="hero-vid-ov"/>
          <div className="hero-tint"/>
          <div className="hero-body" style={{ opacity:heroOpacity, transform:`translateY(${heroTY}px)`, transition:"opacity .06s" }}>
            <div className="hero-eye">Premium Fitness Ecosystem — Est. 2025</div>
            <h1 className="hero-h1">
              {heroTxt}<span className="hero-cursor"/>
            </h1>
            <div className="hero-ghost" aria-hidden>{HERO_LINES[0]}</div>
            {/* Subtitle — always visible, hardcoded light text */}
            <p className="hero-sub">
              Science-backed training, hormone nutrition and full-body health —<br/>
              for humans who refuse to settle.
            </p>
          </div>
          <div className="hero-scroll" style={{ opacity:Math.min(heroOpacity*2,.36) }}>
            <div className="hline"/>Scroll to explore
          </div>
        </section>

        {/* Marquee */}
        <div className="mq">
          <div className="mq-t">
            {[0,1].map(ri => MARQUEE.map((item,i) => (
              <span key={`${ri}-${i}`} className="mqi">{item}<span className="mqs"/></span>
            )))}
          </div>
        </div>

        {/* Features */}
        <section className="fs">
          <div className="fhdr">
            <div className="fhdr-l">Core Modules</div>
            <div className="fhdr-r">{String(FEATURES.length).padStart(2,"0")} Features</div>
          </div>
          {FEATURES.map((f,i) => (
            <div key={f.id} ref={el => rowRefs.current[i]=el} data-idx={i}
              className={`fr ${f.side==="left"?"fl":"frr"}${visRows.has(i)?" vis":""}`}
              style={{ transitionDelay:`${i*.05}s`, "--fac":f.accent }}
              onClick={() => navigate("/signup")}>
              <div className="fr-grid">
                <div className="fr-img">
                  <img src={f.img} alt={f.tag} loading="lazy"/>
                </div>
                <div className="fr-txt">
                  <div className="fr-bar" style={{ background:f.accent }}/>
                  <div className="fr-num">{f.num}</div>
                  <div className="fr-tag">{f.tag}</div>
                  <div className="fr-title">{f.title}</div>
                  <div className="fr-line" style={{ background:`linear-gradient(90deg,${f.accent},transparent)` }}/>
                  <div className="fr-sub">{f.sub}</div>
                  <div className="fr-sv" style={{ color:f.accent }}>{f.stat}</div>
                  <div className="fr-sl">{f.sl}</div>
                  <div className="fr-arr">→</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section className="ss">
          <div>
            <div className="eye">By the numbers</div>
            <h2 className="sh2">Real People.<br/><em>Real Results.</em></h2>
            <p className="sbody">
              AshFitVerse connects every health signal — training, sleep, nutrition, hormones, mental health
              — and builds a programme that adapts to{" "}
              <em style={{ fontStyle:"italic", color:T.acc }}>you</em>.
            </p>
          </div>
          <div className="sgrid">
            {STATS.map((s,i) => (
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
            <p className="wsub">Six interconnected health systems working as one adaptive engine.</p>
          </div>
          <div className="wgrid">
            {WHY.map((w,i) => (
              <div key={i} className="wcard" style={{ "--wc":w.c, "--wcs":w.c+"18", "--wcb":w.c+"30" }}>
                <div className="wico">{w.ico}</div>
                <div className="wtitle">{w.t}</div>
                <div className="wdesc">{w.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Gender */}
        <section className="gs">
          {[
            { sym:"♀", title:"Women's Health Hub", gc:"#f472b6",
              items:["Cycle Tracker & Ovulation Predictions","PCOS / PCOD Complete Guide","Phase-Based Hormone Nutrition","Follicular & Luteal Training Plans","Mental Wellness & Mood Logging","Women's Supplement Shop"] },
            { sym:"♂", title:"Men's Health Hub", gc:"#4f8ef7",
              items:["Testosterone Natural Optimisation","Sleep Quality & HRV Recovery","Sexual Wellness Education","Mental Health Daily Check-Ins","Cortisol & Stress Management","Men's Performance Supplement Shop"] },
          ].map((g,i) => (
            <div key={i} className="gcard" style={{ "--gc":g.gc }}>
              <div className="gglow"/>
              <div className="gsym">{g.sym}</div>
              <div className="gtitle">{g.title}</div>
              {g.items.map((item,j) => (
                <div key={j} className="gitem"><div className="gdot"/>{item}</div>
              ))}
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="ctas">
          <div className="ctaglow"/>
          <div className="ctaeye">Your era starts now</div>
          <h2 className="ctah2">Start Your<em>Journey.</em></h2>
          <div className="ctabtns">
            <button className="ctap" onClick={() => navigate("/signup")}>Create Free Account →</button>
            <button className="ctas2" onClick={() => navigate("/login")}>Sign In</button>
          </div>
          <div className="trust">
            {["🔒 Encrypted","📱 All devices","🆓 Free plan","⚡ 3-min setup","🚫 No ads"].map((b,i) => (
              <div key={i} className="titem">{b}</div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="flog">AshFit<em>Verse</em></div>
          <div className="fcpy">Built for Discipline · © 2025 AshFitVerse</div>
        </footer>

      </div>
    </div>
  );
}