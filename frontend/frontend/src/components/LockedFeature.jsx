import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { generateCSS, FONT } from "../theme";
import { PLAN_META } from "../config/planConfig";

export default function LockedFeature({ featureName, requiredPlan = "lite" }) {
  const navigate = useNavigate();
  const { dark, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const meta = PLAN_META[requiredPlan] || PLAN_META.lite;

  useEffect(() => { setMounted(true); }, []);

  const css = generateCSS(T, dark) + `
    .lk{min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:${T.bg};font-family:${FONT.body};padding:24px;
      opacity:${mounted?1:0};transition:opacity 0.5s;}
    .lk-box{max-width:420px;width:100%;text-align:center;
      background:${dark?"linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))":"linear-gradient(160deg,rgba(255,255,255,0.88),rgba(255,255,255,0.65))"};
      border:1px solid ${T.glassBorder};border-radius:24px;padding:40px 32px;
      backdrop-filter:blur(44px);
      box-shadow:0 20px 60px rgba(0,0,0,${dark?"0.35":"0.10"});}
    .lk-lock{font-size:48px;margin-bottom:16px;}
    .lk-title{font-family:${FONT.display};font-size:22px;font-weight:800;color:${T.text};margin-bottom:8px;}
    .lk-sub{font-size:14px;color:${T.textSub};line-height:1.6;margin-bottom:6px;}
    .lk-plan{display:inline-flex;align-items:center;gap:6px;margin:16px 0 24px;
      padding:6px 14px;border-radius:99px;
      background:${meta.color}18;border:1px solid ${meta.color}35;
      font-size:12px;font-weight:800;color:${meta.color};}
    .lk-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
    .lk-primary{padding:12px 28px;border-radius:13px;border:none;
      background:linear-gradient(135deg,${meta.color},${T.purple});
      color:#fff;font-size:13px;font-weight:800;font-family:${FONT.body};cursor:pointer;
      box-shadow:0 6px 20px ${meta.color}40;transition:transform 0.2s;}
    .lk-primary:hover{transform:translateY(-2px);}
    .lk-secondary{padding:12px 22px;border-radius:13px;
      border:1px solid ${T.glassBorder};background:transparent;
      color:${T.textSub};font-size:13px;font-weight:700;font-family:${FONT.body};cursor:pointer;}
    .lk-secondary:hover{color:${T.text};border-color:${T.glassBorderHover};}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="lk">
        <div className="lk-box">
          <div className="lk-lock">🔒</div>
          <div className="lk-title">{featureName || "Premium Feature"}</div>
          <div className="lk-sub">This feature is not included in your current plan.</div>
          <div className="lk-plan">{meta.emoji} Requires {meta.name} · {meta.price}</div>
          <div className="lk-btns">
            <button className="lk-primary" onClick={() => navigate("/pricing")}>
              Upgrade to {meta.name} →
            </button>
            <button className="lk-secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
