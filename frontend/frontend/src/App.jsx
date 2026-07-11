// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard  from "./pages/Dashboard";
import Pricing     from "./pages/Pricing";
import Profile     from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

// Calculators
import CalorieCalculator from "./features/Calculator/CalorieCalculator";
import FatCalculator     from "./features/Calculator/FatCalculator";

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

// Male Health
import MaleHealthDashboard  from "./features/maleHealth/MaleHealthDashboard";
import TestosteroneHealth   from "./features/maleHealth/TestosteroneHealth";
import MentalHealth         from "./features/maleHealth/MentalHealth";
import SexualWellness       from "./features/maleHealth/SexualWellness";
import SleepTracker         from "./features/maleHealth/SleepTracker";

// ── Protected route — redirects to onboarding if not done ──
function RequireOnboarding({ children }) {
  const onboarded = localStorage.getItem("ashfitverse_onboarded") === "true";
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"        element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ── Protected (require onboarding) ── */}
        <Route path="/dashboard" element={
          <RequireOnboarding><Dashboard /></RequireOnboarding>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={
          <RequireOnboarding><Profile /></RequireOnboarding>
        } />
        <Route path="/user/:uid" element={<RequireOnboarding><UserProfile /></RequireOnboarding>} />
        <Route path="/calorie-calculator" element={
          <RequireOnboarding><CalorieCalculator /></RequireOnboarding>
        } />
        <Route path="/fat-calculator" element={
          <RequireOnboarding><FatCalculator /></RequireOnboarding>
        } />
        <Route path="/workout-planner" element={
          <RequireOnboarding><WorkoutPlanner /></RequireOnboarding>
        } />
        <Route path="/workout-logger" element={
          <RequireOnboarding><WorkoutLogger /></RequireOnboarding>
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
        <Route path="/diet-logger" element={
          <RequireOnboarding><DietLogger /></RequireOnboarding>
        } />
        <Route path="/diet-plan" element={
          <RequireOnboarding><DietPlan /></RequireOnboarding>
        } />
        <Route path="/shop" element={
          <RequireOnboarding><Shop /></RequireOnboarding>
        } />
        <Route path="/community" element={
          <RequireOnboarding><Community /></RequireOnboarding>
        } />

        {/* ── Female Health ── */}
        <Route path="/female-health"      element={<RequireOnboarding><FemaleHealthDashboard /></RequireOnboarding>} />
        <Route path="/cycle-tracker"      element={<RequireOnboarding><CycleTracker /></RequireOnboarding>} />
        <Route path="/pcos-guide"         element={<RequireOnboarding><PCOSGuide /></RequireOnboarding>} />
        <Route path="/hormone-nutrition"  element={<RequireOnboarding><HormoneNutrition /></RequireOnboarding>} />
        <Route path="/female-mental"      element={<RequireOnboarding><MentalWellness /></RequireOnboarding>} />

        {/* ── Male Health ── */}
        <Route path="/male-health"          element={<RequireOnboarding><MaleHealthDashboard /></RequireOnboarding>} />
        <Route path="/testosterone-health"  element={<RequireOnboarding><TestosteroneHealth /></RequireOnboarding>} />
        <Route path="/male-mental-health"   element={<RequireOnboarding><MentalHealth /></RequireOnboarding>} />
        <Route path="/sexual-wellness"      element={<RequireOnboarding><SexualWellness /></RequireOnboarding>} />
        <Route path="/sleep-tracker"        element={<RequireOnboarding><SleepTracker /></RequireOnboarding>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}