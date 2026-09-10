import React from "react";
import useUser from "../hooks/useUser";
import LockedFeature from "./LockedFeature";
function PlanLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#07080f" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
export default function RequirePlan({ minPlan = "free", feature, children }) {
  const { loading, hasPlan } = useUser();
  if (loading) return <PlanLoader />;
  if (!hasPlan(minPlan)) {
    return <LockedFeature featureName={feature} requiredPlan={minPlan} />;
  }
  return children;
}