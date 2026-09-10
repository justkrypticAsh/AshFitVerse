// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";
import Onboarding  from "./pages/Onboarding";

// Protected pages
import Dashboard  from "./pages/Dashboard";
import Pricing    from "./pages/Pricing";
import Profile    from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

// Calculators
import CalorieCalculator from "./features/Calculator/CalorieCalculator";
import FatCalculator     from "./features/Calculator/FatCalculator";
import BmiCalculator     from "./features/Calculator/Bmicalculator";

// Workouts
import WorkoutPlanner from "./features/Workouts/WorkoutPlanner";
import WorkoutLogger  from "./features/Workouts/WorkoutLogger";
import ChestDay       from "./features/Workouts/ChestDay";
import BackDay        from "./features/Workouts/BackDay";
import LegDay         from "./features/Workouts/LegDay";
import CoreDay        from "./features/Workouts/CoreDay";

// Diet
import DietLogger from "./features/diet/DietLogger";
import DietPlan   from "./features/diet/DietPlan";

// Shop
import Shop from "./features/shop/Shop";

// Community
import Community from "./features/community/Community";

// Female Health
import FemaleHealthDashboard from "./features/femaleHealth/FemaleHealthDashboard";
import CycleTracker          from "./features/femaleHealth/CycleTracker";
import PCOSGuide             from "./features/femaleHealth/PCOSGuide";
import HormoneNutrition      from "./features/femaleHealth/HormoneNutrition";
import MentalWellness        from "./features/femaleHealth/MentalWellness";
import ContraceptionGuide    from "./features/femaleHealth/ContraceptionGuide";
import PregnancyGuide        from "./features/femaleHealth/PregnancyGuide";

import FemaleShop from "./features/shop/FemaleShop";

// Male Health
import MaleHealthDashboard from "./features/maleHealth/MaleHealthDashboard";
import TestosteroneHealth  from "./features/maleHealth/TestosteroneHealth";
import MentalHealth        from "./features/maleHealth/MentalHealth";
import SexualWellness      from "./features/maleHealth/SexualWellness";
import SleepTracker        from "./features/maleHealth/SleepTracker";
import MaleShop   from "./features/shop/MaleShop";
import RequirePlan from "./components/RequirePlan";


// ── Auth + Onboarding guard ────────────────────────────────────────────────
function RequireAuth({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? "authed" : "unauthed");
    });
    return () => unsub();
  }, []);

  if (status === "loading") return <FullScreenLoader />;
  if (status === "unauthed") return <Navigate to="/login" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { setStatus("unauthed"); return; }
      const onboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
      setStatus(onboarded ? "ready" : "needs_onboarding");
    });
    return () => unsub();
  }, []);

  if (status === "loading")          return <FullScreenLoader />;
  if (status === "unauthed")         return <Navigate to="/login" replace />;
  if (status === "needs_onboarding") return <Navigate to="/onboarding" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { setStatus("show"); return; }
      const onboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
      setStatus(onboarded ? "dashboard" : "onboarding");
    });
    return () => unsub();
  }, []);

  if (status === "loading")     return <FullScreenLoader />;
  if (status === "dashboard")   return <Navigate to="/dashboard" replace />;
  if (status === "onboarding")  return <Navigate to="/onboarding" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#07080f",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
          color: "#eef2ff", marginBottom: 20, letterSpacing: "0.04em",
        }}>
          AshFit<span style={{ color: "#4f8ef7" }}>Verse</span>
        </div>
        <div style={{
          width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#4f8ef7", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={
          <RedirectIfAuthed><Login /></RedirectIfAuthed>
        } />
        <Route path="/signup" element={
          <RedirectIfAuthed><Signup /></RedirectIfAuthed>
        } />

        {/* ── Onboarding ── */}
        <Route path="/onboarding" element={
          <RequireAuth><Onboarding /></RequireAuth>
        } />

        {/* ── Protected ── */}
        <Route path="/dashboard" element={
          <RequireOnboarding><Dashboard /></RequireOnboarding>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={
          <RequireOnboarding><Profile /></RequireOnboarding>
        } />
        <Route path="/user/:uid" element={
          <RequireOnboarding><UserProfile /></RequireOnboarding>
        } />

        {/* ── Calculators ── */}
        <Route path="/calorie-calculator" element={
          <RequireOnboarding><CalorieCalculator /></RequireOnboarding>
        } />
        <Route path="/fat-calculator" element={
          <RequireOnboarding>
            <RequirePlan minPlan="lite" feature="Fat % Body Calculator">
              <FatCalculator />
            </RequirePlan>
          </RequireOnboarding>
        } />
        <Route path="/bmi-calculator" element={
          <RequireOnboarding><BmiCalculator /></RequireOnboarding>
        } />

        {/* ── Workouts ── */}
        <Route path="/workout-planner" element={
          <RequireOnboarding>
            <RequirePlan minPlan="lite" feature="Workout Planner">
              <WorkoutPlanner />
            </RequirePlan>
          </RequireOnboarding>
        } />
        <Route path="/workout-logger" element={
          <RequireOnboarding>
            <RequirePlan minPlan="lite" feature="Workout Logger">
              <WorkoutLogger />
            </RequirePlan>
          </RequireOnboarding>
        } />
        <Route path="/workout/chest" element={
          <RequireOnboarding><ChestDay /></RequireOnboarding>
        } />
        <Route path="/workout/back" element={
          <RequireOnboarding><BackDay /></RequireOnboarding>
        } />
        <Route path="/workout/legs" element={
          <RequireOnboarding><LegDay /></RequireOnboarding>
        } />
        <Route path="/workout/core" element={
          <RequireOnboarding><CoreDay /></RequireOnboarding>
        } />

        {/* ── Diet ── */}
        <Route path="/diet-logger" element={
          <RequireOnboarding>
            <RequirePlan minPlan="lite" feature="Diet Logger">
              <DietLogger />
            </RequirePlan>
          </RequireOnboarding>
        } />
        <Route path="/diet-plan" element={
          <RequireOnboarding>
            <RequirePlan minPlan="lite" feature="Diet Plan Generator">
              <DietPlan />
            </RequirePlan>
          </RequireOnboarding>
        } />

        {/* ── Shop ── */}
        <Route path="/shop" element={
          <RequireOnboarding><Shop /></RequireOnboarding>
        } />

        {/* ── Community ── */}
        <Route path="/community" element={
          <RequireOnboarding><Community /></RequireOnboarding>
        } />

        {/* ── Female Health ── */}
        <Route path="/female-health"       element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Women's Health Hub"><FemaleHealthDashboard /></RequirePlan></RequireOnboarding>} />
        <Route path="/cycle-tracker"       element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Cycle Tracker"><CycleTracker /></RequirePlan></RequireOnboarding>} />
        <Route path="/pcos-guide"          element={<RequireOnboarding><RequirePlan minPlan="pro" feature="PCOS Guide"><PCOSGuide /></RequirePlan></RequireOnboarding>} />
        <Route path="/hormone-nutrition"   element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Hormone Nutrition"><HormoneNutrition /></RequirePlan></RequireOnboarding>} />
        <Route path="/female-mental"       element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Mental Wellness"><MentalWellness /></RequirePlan></RequireOnboarding>} />
        <Route path="/contraception"       element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Contraception Guide"><ContraceptionGuide /></RequirePlan></RequireOnboarding>} />
        <Route path="/contraception-guide" element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Contraception Guide"><ContraceptionGuide /></RequirePlan></RequireOnboarding>} />
        <Route path="/pregnancy-guide"     element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Pregnancy Guide"><PregnancyGuide /></RequirePlan></RequireOnboarding>} />
        <Route path="/female-shop"         element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Women's Wellness Shop"><FemaleShop /></RequirePlan></RequireOnboarding>} />


        {/* ── Male Health ── */}
        <Route path="/male-health"         element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Men's Health Hub"><MaleHealthDashboard /></RequirePlan></RequireOnboarding>} />
        <Route path="/testosterone-health" element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Testosterone Health"><TestosteroneHealth /></RequirePlan></RequireOnboarding>} />
        <Route path="/male-mental-health"  element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Men's Mental Health"><MentalHealth /></RequirePlan></RequireOnboarding>} />
        <Route path="/sexual-wellness"     element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Sexual Wellness"><SexualWellness /></RequirePlan></RequireOnboarding>} />
        <Route path="/sleep-tracker"       element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Sleep Tracker"><SleepTracker /></RequirePlan></RequireOnboarding>} />
        <Route path="/male-shop"           element={<RequireOnboarding><RequirePlan minPlan="pro" feature="Men's Wellness Shop"><MaleShop /></RequirePlan></RequireOnboarding>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}