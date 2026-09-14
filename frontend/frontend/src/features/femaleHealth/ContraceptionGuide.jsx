// src/features/femaleHealth/ContraceptionGuide.jsx
// Educational contraception guide — part of Women's Health section
// Covers: types, how they work, cycle-based methods, when to see a doctor

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import { generateCSS, FONT } from "../../theme";

const METHODS = [
  {
    id: "barrier",
    emoji: "🛡️",
    title: "Barrier Methods",
    color: "#4f8ef7",
    subtitle: "Physical prevention",
    effectiveness: "85–98%",
    description: "Physically block sperm from reaching the egg. No hormones involved — good option if you prefer hormone-free contraception.",
    types: [
      { name: "Male Condom", eff: "98% perfect use", note: "Also protects against STIs. Most widely available." },
      { name: "Female Condom", eff: "95% perfect use", note: "Can be inserted up to 8 hours before sex." },
      { name: "Diaphragm / Cervical Cap", eff: "86–92%", note: "Used with spermicide. Requires fitting by a doctor." },
      { name: "Spermicide", eff: "72–82%", note: "Best used alongside another method." },
    ],
    pros: ["No hormones", "Immediately effective", "Condoms protect vs STIs", "No prescription needed (condoms)"],
    cons: ["Must be used correctly every time", "Can interrupt intimacy", "Some latex allergies"],
    doctorNote: null,
  },
  {
    id: "hormonal_short",
    emoji: "💊",
    title: "Hormonal Methods (Short-acting)",
    color: "#f472b6",
    subtitle: "Daily / weekly / monthly",
    effectiveness: "91–99%",
    description: "Use synthetic hormones (estrogen and/or progestin) to prevent ovulation, thicken cervical mucus, or thin the uterine lining.",
    types: [
      { name: "Combined Pill (COC)", eff: "99% perfect use", note: "Taken daily. Contains estrogen + progestin. Can regulate periods and reduce cramps." },
      { name: "Mini Pill (POP)", eff: "99% perfect use", note: "Progestin only. Good for breastfeeding mothers or those who can't take estrogen." },
      { name: "Patch", eff: "99% perfect use", note: "Changed weekly for 3 weeks, then 1 week off." },
      { name: "Vaginal Ring (NuvaRing)", eff: "99% perfect use", note: "Inserted monthly. Releases hormones locally." },
    ],
    pros: ["Highly effective when used correctly", "Can reduce period pain & PMS", "May improve acne", "Reversible"],
    cons: ["Must remember daily/weekly", "Possible side effects (nausea, mood, libido)", "Does NOT protect vs STIs", "Prescription required"],
    doctorNote: "Discuss with your doctor if you have a history of blood clots, migraines with aura, or certain cancers.",
  },
  {
    id: "hormonal_long",
    emoji: "🔵",
    title: "Long-Acting Reversible (LARC)",
    color: "#a78bfa",
    subtitle: "Set and forget — years of protection",
    effectiveness: "99%+",
    description: "The most effective reversible contraception available. Once in place, no daily action needed. Fertility returns quickly after removal.",
    types: [
      { name: "Copper IUD (Non-hormonal)", eff: ">99%", note: "Lasts 5–10 years. Hormone-free. Can also be used as emergency contraception within 5 days." },
      { name: "Hormonal IUD (Mirena/Kyleena)", eff: ">99%", note: "Lasts 3–8 years depending on type. Often reduces or stops periods." },
      { name: "Implant (Nexplanon)", eff: ">99%", note: "Small rod inserted in upper arm. Lasts 3 years. Most effective contraception available." },
      { name: "Hormonal Injection (Depo-Provera)", eff: "99% perfect use", note: "Given every 3 months. May delay return of fertility by 6–12 months after stopping." },
    ],
    pros: ["Extremely effective", "Nothing to remember daily", "Long-lasting", "Quickly reversible (except injection)"],
    cons: ["Requires a doctor/clinic for insertion", "Irregular bleeding initially", "Injection delays fertility return"],
    doctorNote: "IUD insertion can cause cramping. A checkup 4–6 weeks after insertion is usually recommended.",
  },
  {
    id: "natural",
    emoji: "📅",
    title: "Cycle-Based (Natural) Methods",
    color: "#34d399",
    subtitle: "Fertility awareness methods (FAM)",
    effectiveness: "76–99%",
    description: "Track your menstrual cycle and body signals to identify fertile and infertile days. Effectiveness depends heavily on consistent, accurate tracking.",
    types: [
      { name: "Calendar / Rhythm Method", eff: "76–88%", note: "Track cycle length over 6+ months to predict fertile window. Less reliable with irregular cycles." },
      { name: "Basal Body Temperature (BBT)", eff: "99% perfect use", note: "Temperature rises slightly after ovulation. Track daily with a BBT thermometer first thing in the morning." },
      { name: "Cervical Mucus Method (Billings)", eff: "97–99% perfect use", note: "Monitor changes in cervical mucus throughout cycle. Clear, stretchy = fertile. Thick, white = less fertile." },
      { name: "Symptothermal Method", eff: "99% perfect use", note: "Combines BBT + cervical mucus + other signs. Most effective natural method when taught properly." },
    ],
    pros: ["No hormones or devices", "Increases body awareness", "Can be used to ACHIEVE pregnancy too", "Free or low cost"],
    cons: ["Requires training and consistent tracking", "Less reliable with irregular cycles", "No STI protection", "Illness/stress can affect readings"],
    doctorNote: "Consider learning from a certified FAM instructor for best results. Apps like Natural Cycles are FDA-cleared but still require consistent use.",
  },
  {
    id: "permanent",
    emoji: "♾️",
    title: "Permanent Methods",
    color: "#fb923c",
    subtitle: "For those done with having children",
    effectiveness: "99.5%+",
    description: "Surgical procedures that permanently prevent pregnancy. Should be considered irreversible — not a choice to make under pressure or when unsure.",
    types: [
      { name: "Tubal Ligation (Female Sterilisation)", eff: "99.5%", note: "Fallopian tubes are cut, tied or blocked. Done under general anaesthesia." },
      { name: "Vasectomy (Male Partner)", eff: "99.9%", note: "Simpler, safer and more effective than tubal ligation. Takes 3 months to confirm effectiveness." },
    ],
    pros: ["Permanent protection", "No ongoing maintenance", "Highly effective"],
    cons: ["Not reversible in most cases", "Surgical risks", "Requires counselling and informed consent"],
    doctorNote: "Most doctors will discuss your age and family situation. This is a major decision — take your time.",
  },
  {
    id: "emergency",
    emoji: "🚨",
    title: "Emergency Contraception",
    color: "#fbbf24",
    subtitle: "After unprotected sex",
    effectiveness: "52–95%",
    description: "NOT a regular contraceptive method. Used after unprotected sex or contraceptive failure. The sooner it is taken, the more effective it is.",
    types: [
      { name: "Morning-After Pill (Levonorgestrel)", eff: "95% within 24h", note: "Available OTC in many countries. Effective up to 72 hours, less so after. Does NOT terminate pregnancy." },
      { name: "Ella (Ulipristal Acetate)", eff: "~85% up to 5 days", note: "Prescription required. More effective than levonorgestrel, especially 72–120 hours after sex." },
      { name: "Copper IUD", eff: ">99%", note: "Most effective EC. Must be inserted within 5 days. Also provides ongoing contraception." },
    ],
    pros: ["Available when regular contraception fails", "Copper IUD becomes long-term method"],
    cons: ["Not for regular use", "Can cause nausea, irregular bleeding", "Does not protect vs STIs"],
    doctorNote: "Emergency contraception does NOT cause abortion. It prevents fertilisation or implantation. If you're already pregnant, it will not affect the pregnancy.",
  },
];

const WHEN_TO_SEE_DOCTOR = [
  { ico:"💊", text:"Before starting hormonal contraception (especially if you smoke, have migraines, or clotting history)" },
  { ico:"🔵", text:"For IUD or implant insertion, removal, or check" },
  { ico:"🩸", text:"If you experience unusual bleeding, pain, or discharge after starting a method" },
  { ico:"❓", text:"If you're unsure which method suits your health and lifestyle" },
  { ico:"🤰", text:"If you want to stop contraception to try for a baby" },
  { ico:"💊", text:"If current method is causing side effects affecting your quality of life" },
];

const MYTH_FACTS = [
  { myth: "The pill causes infertility", fact: "Fertility returns within 1–3 months of stopping the pill for most women." },
  { myth: "You can't get pregnant on your period", fact: "Unlikely but possible — sperm can survive 5 days, and early ovulation can occur." },
  { myth: "IUDs are only for women who've had children", fact: "IUDs are safe and effective for women of any age, including those who haven't had children." },
  { myth: "Natural methods don't work", fact: "When learned and applied correctly, FAM methods can be up to 99% effective." },
  { myth: "Emergency contraception is an abortion pill", fact: "EC prevents fertilisation — it does not terminate an existing pregnancy." },
];

export default function ContraceptionGuide() {
  const navigate  = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const { user }  = useUser();
  const [mounted, setMounted]   = useState(false);
  const [active,  setActive]    = useState(null); // expanded method id
  const [section, setSection]   = useState("methods"); // methods | natural | myths | doctor

  useEffect(() => { setMounted(true); }, []);

  const css = generateCSS(T, dark) + `
    .cg{min-height:100vh;background:${T.bg};color:${T.text};
      font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s,background 0.5s;}

    /* Header */
    .cg-hd{
      background:${dark?"rgba(255,55,95,0.06)":"rgba(255,55,95,0.04)"};
      border-bottom:1px solid ${dark?"rgba(255,55,95,0.15)":"rgba(255,55,95,0.10)"};
      padding:20px 28px;display:flex;align-items:center;justify-content:space-between;
      position:sticky;top:0;z-index:20;backdrop-filter:blur(32px);
    }
    .cg-back{display:flex;align-items:center;gap:10px;cursor:pointer;
      font-size:13px;font-weight:600;color:${T.textSub};transition:color 0.2s;}
    .cg-back:hover{color:#ff375f;}
    .cg-hd-title{font-family:${FONT.display};font-size:18px;font-weight:800;
      color:${T.text};letter-spacing:-0.01em;}
    .cg-hd-sub{font-size:10.5px;color:#ff375f;font-weight:600;margin-top:1px;}

    /* Hero */
    .cg-hero{padding:40px 28px 32px;text-align:center;
      background:${dark
        ?"linear-gradient(160deg,rgba(255,55,95,0.08),rgba(167,139,250,0.06))"
        :"linear-gradient(160deg,rgba(255,55,95,0.05),rgba(167,139,250,0.04))"};
      border-bottom:1px solid ${T.glassBorder};}
    .cg-hero-ico{font-size:48px;margin-bottom:14px;display:block;}
    .cg-hero-title{font-family:${FONT.display};font-size:30px;font-weight:800;
      color:${T.text};letter-spacing:-0.02em;margin-bottom:10px;}
    .cg-hero-title span{color:#ff375f;}
    .cg-hero-desc{font-size:14px;color:${T.textSub};line-height:1.75;max-width:600px;margin:0 auto 18px;}
    .disclaimer{display:inline-flex;align-items:center;gap:8px;
      padding:10px 18px;border-radius:99px;
      background:${dark?"rgba(255,159,10,0.08)":"rgba(255,159,10,0.06)"};
      border:1px solid rgba(255,159,10,0.22);
      font-size:11.5px;color:${T.orange};font-weight:600;}

    /* Section nav */
    .sec-nav{display:flex;gap:6px;padding:20px 28px 0;overflow-x:auto;scrollbar-width:none;}
    .sec-nav::-webkit-scrollbar{display:none;}
    .sec-btn{padding:9px 18px;border-radius:99px;border:1px solid ${T.glassBorder};
      background:${T.glass};font-size:12.5px;font-weight:700;
      cursor:pointer;font-family:${FONT.body};color:${T.textSub};
      white-space:nowrap;transition:all 0.22s;flex-shrink:0;}
    .sec-btn:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .sec-btn.on{background:linear-gradient(135deg,#ff375f,#a78bfa);
      color:#fff;border-color:transparent;
      box-shadow:0 4px 16px rgba(255,55,95,0.28);}

    /* Main content */
    .cg-body{padding:24px 28px;max-width:960px;margin:0 auto;}

    /* Method card */
    .method-card{border-radius:20px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.72)"};
      backdrop-filter:blur(28px);
      box-shadow:inset 0 1px 0 ${dark?"rgba(255,255,255,0.10)":"rgba(255,255,255,0.90)"},
        0 2px 12px rgba(0,0,0,${dark?"0.16":"0.06"});
      margin-bottom:14px;overflow:hidden;transition:all 0.28s;
      position:relative;}
    .method-card::before{content:'';position:absolute;inset:0;border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,${dark?"0.05":"0.35"}) 0%,transparent 40%);
      pointer-events:none;}
    .method-card > *{position:relative;z-index:1;}
    .method-header{display:flex;align-items:center;gap:14px;padding:20px;cursor:pointer;
      transition:background 0.2s;}
    .method-header:hover{background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"};}
    .method-emoji{font-size:30px;flex-shrink:0;}
    .method-info{flex:1;}
    .method-title{font-family:${FONT.display};font-size:16px;font-weight:800;color:${T.text};margin-bottom:2px;}
    .method-sub{font-size:11px;color:${T.textSub};margin-bottom:5px;}
    .eff-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
      border-radius:99px;font-size:10.5px;font-weight:800;}
    .method-chevron{font-size:16px;color:${T.textMuted};transition:transform 0.25s;flex-shrink:0;}
    .method-chevron.open{transform:rotate(180deg);}

    /* Method body */
    .method-body{padding:0 20px 20px;border-top:1px solid ${T.glassBorder};}
    .method-desc{font-size:13.5px;color:${T.textSub};line-height:1.7;padding:14px 0 16px;}

    /* Types list */
    .types-title{font-size:9.5px;font-weight:700;letter-spacing:0.16em;
      text-transform:uppercase;color:${T.textMuted};margin-bottom:10px;}
    .type-item{display:flex;align-items:flex-start;gap:12px;padding:10px 14px;
      border-radius:12px;background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"};
      border:1px solid ${T.glassBorder};margin-bottom:7px;}
    .type-item:last-child{margin-bottom:0;}
    .type-name{font-size:13px;font-weight:700;color:${T.text};margin-bottom:2px;}
    .type-eff{font-size:10.5px;font-weight:700;margin-bottom:3px;}
    .type-note{font-size:12px;color:${T.textSub};line-height:1.55;}

    /* Pros / Cons */
    .pro-con{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;}
    .pro-box,.con-box{border-radius:13px;padding:14px;}
    .pro-box{background:${dark?"rgba(48,209,88,0.08)":"rgba(48,209,88,0.06)"};border:1px solid rgba(48,209,88,0.20);}
    .con-box{background:${dark?"rgba(255,55,95,0.08)":"rgba(255,55,95,0.06)"};border:1px solid rgba(255,55,95,0.18);}
    .box-title{font-size:9.5px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:9px;}
    .box-item{display:flex;align-items:flex-start;gap:7px;font-size:12px;color:${T.textSub};line-height:1.5;margin-bottom:6px;}
    .box-item:last-child{margin-bottom:0;}

    /* Doctor note */
    .doctor-note{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;
      border-radius:12px;margin-top:14px;
      background:${dark?"rgba(79,142,247,0.08)":"rgba(79,142,247,0.06)"};
      border:1px solid rgba(79,142,247,0.22);}
    .doctor-note-txt{font-size:12.5px;color:${T.textSub};line-height:1.6;}

    /* Natural methods section */
    .nat-intro{padding:18px 22px;border-radius:18px;margin-bottom:20px;
      background:${dark?"rgba(52,211,153,0.08)":"rgba(52,211,153,0.06)"};
      border:1px solid rgba(52,211,153,0.22);}
    .nat-intro-title{font-family:${FONT.display};font-size:17px;font-weight:800;
      color:#34d399;margin-bottom:6px;}
    .nat-intro-txt{font-size:13.5px;color:${T.textSub};line-height:1.7;}
    .nat-step{display:flex;gap:14px;padding:14px;border-radius:14px;
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.72)"};
      border:1px solid ${T.glassBorder};margin-bottom:10px;}
    .nat-step-num{width:32px;height:32px;border-radius:50%;flex-shrink:0;
      background:#34d399;display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:800;color:#fff;}
    .nat-step-title{font-size:13.5px;font-weight:700;color:${T.text};margin-bottom:3px;}
    .nat-step-txt{font-size:12.5px;color:${T.textSub};line-height:1.6;}

    /* Myths section */
    .myth-card{border-radius:16px;margin-bottom:12px;overflow:hidden;
      border:1px solid ${T.glassBorder};}
    .myth-row{padding:14px 18px;
      background:${dark?"rgba(255,55,95,0.06)":"rgba(255,55,95,0.04)"};
      border-bottom:1px solid rgba(255,55,95,0.12);}
    .myth-label{font-size:9px;font-weight:800;letter-spacing:0.16em;
      text-transform:uppercase;color:#ff375f;margin-bottom:3px;}
    .myth-txt{font-size:13.5px;font-weight:700;color:${T.text};}
    .fact-row{padding:14px 18px;
      background:${dark?"rgba(48,209,88,0.06)":"rgba(48,209,88,0.04)"};}
    .fact-label{font-size:9px;font-weight:800;letter-spacing:0.16em;
      text-transform:uppercase;color:#30d158;margin-bottom:3px;}
    .fact-txt{font-size:13px;color:${T.textSub};line-height:1.6;}

    /* Doctor section */
    .doc-intro{padding:20px;border-radius:18px;margin-bottom:20px;
      background:${dark?"rgba(79,142,247,0.08)":"rgba(79,142,247,0.06)"};
      border:1px solid rgba(79,142,247,0.22);text-align:center;}
    .doc-ico{font-size:40px;margin-bottom:10px;display:block;}
    .doc-title{font-family:${FONT.display};font-size:18px;font-weight:800;
      color:${T.text};margin-bottom:6px;}
    .doc-txt{font-size:13.5px;color:${T.textSub};line-height:1.7;}
    .doc-item{display:flex;align-items:center;gap:13px;padding:14px 16px;
      border-radius:14px;border:1px solid ${T.glassBorder};
      background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.70)"};
      backdrop-filter:blur(20px);margin-bottom:9px;}
    .doc-item-ico{font-size:22px;flex-shrink:0;}
    .doc-item-txt{font-size:13px;color:${T.textSub};line-height:1.55;}

    /* Section title */
    .sec-title{font-family:${FONT.display};font-size:20px;font-weight:800;
      color:${T.text};margin-bottom:6px;}
    .sec-desc{font-size:13.5px;color:${T.textSub};line-height:1.7;margin-bottom:20px;}

    @media(max-width:640px){
      .cg-body{padding:18px 16px;}
      .cg-hd{padding:16px 18px;}
      .cg-hero{padding:28px 18px 24px;}
      .pro-con{grid-template-columns:1fr;}
      .sec-nav{padding:16px 16px 0;}
    }
  `;

  const SECTIONS = [
    { id:"methods",  label:"All Methods"       },
    { id:"natural",  label:"📅 Cycle-Based FAM" },
    { id:"myths",    label:"❌ Myths vs Facts"  },
    { id:"doctor",   label:"👩‍⚕️ See a Doctor"   },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="cg">
        <div className="orb orb-1"/><div className="orb orb-2"/>

        {/* Header */}
        <div className="cg-hd">
          <div className="cg-back" onClick={() => navigate("/female-health")}>
            ← Women's Health
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="cg-hd-title">Contraception Guide</div>
            <div className="cg-hd-sub">Educational information only</div>
          </div>
        </div>

        {/* Hero */}
        <div className="cg-hero">
          <span className="cg-hero-ico">🌸</span>
          <div className="cg-hero-title">Know Your <span>Options</span></div>
          <div className="cg-hero-desc">
            Contraception is a deeply personal choice. This guide covers all major methods —
            how they work, their effectiveness, pros and cons, and when to speak with a doctor.
            No method is "best" for everyone — the right one fits your body, lifestyle and goals.
          </div>
          <div className="disclaimer">
            ⚠️ This is educational information only — always consult a healthcare provider before starting any contraceptive method
          </div>
        </div>

        {/* Section nav */}
        <div className="sec-nav">
          {SECTIONS.map(s => (
            <button key={s.id} className={`sec-btn ${section===s.id?"on":""}`} onClick={() => setSection(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="cg-body">

          {/* ── ALL METHODS ── */}
          {section === "methods" && (
            <>
              <div style={{ marginBottom:20 }}>
                <div className="sec-title">Contraception Methods</div>
                <div className="sec-desc">
                  Tap any method to expand details about types, effectiveness, pros/cons and medical notes.
                  Effectiveness percentages refer to typical use unless otherwise noted.
                </div>
              </div>

              {METHODS.map(m => {
                const isOpen = active === m.id;
                return (
                  <div key={m.id} className="method-card">
                    <div className="method-header" onClick={() => setActive(isOpen ? null : m.id)}>
                      <span className="method-emoji">{m.emoji}</span>
                      <div className="method-info">
                        <div className="method-title">{m.title}</div>
                        <div className="method-sub">{m.subtitle}</div>
                        <span className="eff-badge" style={{ background:`${m.color}14`,color:m.color,border:`1px solid ${m.color}28` }}>
                          ✓ {m.effectiveness} effective
                        </span>
                      </div>
                      <span className={`method-chevron ${isOpen?"open":""}`}>▾</span>
                    </div>

                    {isOpen && (
                      <div className="method-body">
                        <div className="method-desc">{m.description}</div>

                        <div className="types-title">Types</div>
                        {m.types.map((t, i) => (
                          <div key={i} className="type-item">
                            <div style={{ width:6,height:6,borderRadius:"50%",background:m.color,marginTop:7,flexShrink:0 }}/>
                            <div>
                              <div className="type-name">{t.name}</div>
                              <div className="type-eff" style={{ color:m.color }}>{t.eff}</div>
                              <div className="type-note">{t.note}</div>
                            </div>
                          </div>
                        ))}

                        <div className="pro-con">
                          <div className="pro-box">
                            <div className="box-title" style={{ color:"#30d158" }}>✓ Advantages</div>
                            {m.pros.map((p,i) => (
                              <div key={i} className="box-item">
                                <span style={{ color:"#30d158",flexShrink:0,marginTop:1 }}>•</span>
                                {p}
                              </div>
                            ))}
                          </div>
                          <div className="con-box">
                            <div className="box-title" style={{ color:"#ff375f" }}>✗ Considerations</div>
                            {m.cons.map((c,i) => (
                              <div key={i} className="box-item">
                                <span style={{ color:"#ff375f",flexShrink:0,marginTop:1 }}>•</span>
                                {c}
                              </div>
                            ))}
                          </div>
                        </div>

                        {m.doctorNote && (
                          <div className="doctor-note">
                            <span style={{ fontSize:20,flexShrink:0 }}>👩‍⚕️</span>
                            <div className="doctor-note-txt"><strong style={{ color:T.accent }}>Doctor's note: </strong>{m.doctorNote}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── NATURAL / CYCLE BASED ── */}
          {section === "natural" && (
            <>
              <div className="nat-intro">
                <div className="nat-intro-title">📅 Fertility Awareness Methods (FAM)</div>
                <div className="nat-intro-txt">
                  FAM involves tracking your body's natural signals to identify which days of your cycle
                  you're fertile. Used correctly, they can be highly effective — but they require
                  commitment, education, and a regular cycle.
                </div>
              </div>

              <div className="sec-title" style={{ marginBottom:6 }}>How to Start</div>
              <div className="sec-desc">Follow these steps to practise FAM effectively.</div>

              {[
                {
                  n:1,
                  title:"Track your cycle length",
                  text:"Record the first day of your period for at least 3–6 months. A typical cycle is 21–35 days. Irregular cycles make FAM less reliable.",
                },
                {
                  n:2,
                  title:"Take your Basal Body Temperature (BBT)",
                  text:"Use a BBT thermometer (accurate to 0.05°C) every morning before getting out of bed, at the same time. After ovulation, BBT rises by ~0.2°C and stays high. This confirms ovulation has passed.",
                },
                {
                  n:3,
                  title:"Observe cervical mucus",
                  text:"Throughout your cycle, check your discharge. Right before and during ovulation it becomes clear, slippery and stretchy (like egg white) — this is your most fertile window. Before and after, it's thicker and cloudy.",
                },
                {
                  n:4,
                  title:"Identify your fertile window",
                  text:"Sperm can survive up to 5 days inside you. Your fertile window is typically the 5 days before ovulation + the day of ovulation. Avoid unprotected sex (or use a barrier method) on these days.",
                },
                {
                  n:5,
                  title:"Use a certified app or instructor",
                  text:"Apps like Natural Cycles (FDA-cleared) or Clue can help track your data. For best results, learn from a certified FAM educator — self-teaching without guidance increases error risk.",
                },
                {
                  n:6,
                  title:"Know the limitations",
                  text:"Illness, travel, stress, alcohol, and irregular sleep can all affect BBT readings. FAM doesn't protect against STIs. If your cycle varies by more than a few days, FAM is less reliable.",
                },
              ].map(step => (
                <div key={step.n} className="nat-step">
                  <div className="nat-step-num">{step.n}</div>
                  <div>
                    <div className="nat-step-title">{step.title}</div>
                    <div className="nat-step-txt">{step.text}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop:24,padding:"18px 20px",borderRadius:16,background:dark?"rgba(255,159,10,0.08)":"rgba(255,159,10,0.06)",border:"1px solid rgba(255,159,10,0.22)" }}>
                <div style={{ fontSize:14,fontWeight:700,color:T.orange,marginBottom:6 }}>⚠️ Important note</div>
                <div style={{ fontSize:13,color:T.textSub,lineHeight:1.7 }}>
                  FAM is most suitable for people who have regular cycles, are comfortable with detailed tracking,
                  and are in a stable, mutually monogamous relationship. If you're at high risk of STIs or are not
                  ready for a pregnancy, pair FAM with barrier methods on fertile days.
                </div>
              </div>
            </>
          )}

          {/* ── MYTHS ── */}
          {section === "myths" && (
            <>
              <div className="sec-title">Myths vs Facts</div>
              <div className="sec-desc">Common misconceptions about contraception — cleared up.</div>
              {MYTH_FACTS.map((m, i) => (
                <div key={i} className="myth-card">
                  <div className="myth-row">
                    <div className="myth-label">✗ Myth</div>
                    <div className="myth-txt">{m.myth}</div>
                  </div>
                  <div className="fact-row">
                    <div className="fact-label">✓ Fact</div>
                    <div className="fact-txt">{m.fact}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── DOCTOR ── */}
          {section === "doctor" && (
            <>
              <div className="doc-intro">
                <span className="doc-ico">👩‍⚕️</span>
                <div className="doc-title">When to See a Doctor</div>
                <div className="doc-txt">
                  A gynaecologist, general physician, or sexual health clinic can help you choose
                  the right method, check for contraindications, and manage side effects.
                  Appointments are confidential.
                </div>
              </div>

              <div className="sec-title" style={{ marginBottom:14 }}>Go to a doctor if...</div>
              {WHEN_TO_SEE_DOCTOR.map((w, i) => (
                <div key={i} className="doc-item">
                  <span className="doc-item-ico">{w.ico}</span>
                  <div className="doc-item-txt">{w.text}</div>
                </div>
              ))}

              <div style={{ marginTop:28,padding:"20px",borderRadius:18,background:dark?"rgba(255,55,95,0.07)":"rgba(255,55,95,0.05)",border:"1px solid rgba(255,55,95,0.18)" }}>
                <div style={{ fontSize:15,fontWeight:800,color:"#ff375f",marginBottom:8 }}>🇮🇳 In India</div>
                <div style={{ fontSize:13,color:T.textSub,lineHeight:1.75 }}>
                  Condoms and emergency contraception (e.g. i-Pill) are available OTC at pharmacies without prescription.
                  For hormonal pills, IUDs, implants and sterilisation, visit a gynaecologist, government health centre,
                  or family planning clinic. Government hospitals offer many family planning services free of charge.
                  <br/><br/>
                  <strong style={{ color:T.text }}>Helpline:</strong> National Health Helpline — 1800-180-1104 (toll-free)
                </div>
              </div>

              <div style={{ marginTop:16,padding:"16px",borderRadius:14,background:T.glass,border:`1px solid ${T.glassBorder}`,fontSize:12.5,color:T.textMuted,lineHeight:1.7 }}>
                <strong style={{ color:T.text }}>Disclaimer: </strong>
                The information on this page is for educational purposes only and does not constitute medical advice.
                Please consult a qualified healthcare professional before making any decisions about contraception.
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}