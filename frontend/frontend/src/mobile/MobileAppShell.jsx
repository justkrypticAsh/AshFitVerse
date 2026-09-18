// src/mobile/MobileAppShell.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./mobileTheme.css";
import MobileHomeScreen from "./screens/MobileHomeScreen";
import MobileWorkoutsScreen from "./screens/MobileWorkoutsScreen";
import MobileNutritionScreen from "./screens/MobileNutritionScreen";
import MobileCommunityScreen from "./screens/MobileCommunityScreen";
import MobileHubScreen from "./screens/MobileHubScreen";
import MobileActionSheet from "./components/MobileActionSheet";
import WeightLogModal from "../components/WeightLogModal";
import StreakModal from "../components/StreakModal";
import FeedbackModal from "../components/FeedbackModal";
import { recordDailyActivity } from "../lib/userLogs";

export default function MobileAppShell({
  user,
  authUid,
  dark,
  toggleTheme,
  T,
  displayStreak,
  calorieTarget,
  todayCalories,
  todayBurned,
  todayNetCalories,
  todayMacros,
  mealGroups,
  weights,
  workouts,
  todayWorkouts,
  todayMeals,
  activeChallenges,
  handleDashboardCheckIn,
  workoutPlan,
  isFemale,
  isMale,
  getCycleDay,
  getPhaseName,
  bmi,
  isPro,
  clearUser,
  initialTab = "home",
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Quick hydration tracker state
  const [waterMl, setWaterMl] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const val = localStorage.getItem(`ashfitverse_water_${today}`);
      return val ? parseInt(val, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  const handleQuickWater = () => {
    const updated = waterMl + 250;
    setWaterMl(updated);
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`ashfitverse_water_${today}`, String(updated));
    } catch {}
    if (authUid) {
      recordDailyActivity(authUid, "water_intake", { amount: 250, total: updated });
    }
  };

  // Greeting period
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good morning", icon: "🌅" };
    if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: "☀️" };
    if (hour >= 17 && hour < 21) return { text: "Good evening", icon: "🌆" };
    return { text: "Good night", icon: "🌙" };
  };
  const greeting = getGreeting();

  const navTabs = [
    { id: "home", label: "Home", icon: "⚡" },
    { id: "workouts", label: "Train", icon: "🏋️" },
    { id: "nutrition", label: "Fuel", icon: "🥗" },
    { id: "community", label: "Squad", icon: "👥" },
    { id: "hub", label: "Hub", icon: "🧭" },
  ];

  return (
    <div
      className="mobile-app-shell"
      style={{
        background: dark ? "#07080d" : "#f8f6f0",
        color: dark ? "#f8fafc" : "#0f172a",
      }}
    >
      {/* ── Ambient Orbs ── */}
      <div className="mob-orb mob-orb-1" />
      <div className="mob-orb mob-orb-2" />
      <div className="mob-orb mob-orb-3" />

      {/* ── Top Mobile App Bar ── */}
      <header
        className="mob-app-bar"
        style={{
          background: dark ? "rgba(7, 8, 13, 0.88)" : "rgba(248, 246, 240, 0.92)",
          borderBottom: `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
        }}
      >
        <div className="mob-app-bar-user" onClick={() => setActiveTab("hub")}>
          <div className="mob-avatar-wrap">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="mob-avatar-img" />
            ) : (
              <div className="mob-avatar-fallback">{user?.name?.[0]?.toUpperCase() || "A"}</div>
            )}
            <div className="mob-avatar-online" />
          </div>

          <div className="mob-greeting-wrap">
            <span className="mob-greeting-sub" style={{ color: dark ? "rgba(241, 245, 249, 0.55)" : "rgba(15, 23, 42, 0.55)" }}>
              {greeting.icon} {greeting.text}
            </span>
            <span className="mob-greeting-name" style={{ color: dark ? "#f8fafc" : "#0f172a" }}>
              {user?.name || "Athlete"}
            </span>
          </div>
        </div>

        <div className="mob-app-bar-actions">
          {/* Streak pill */}
          <div className="mob-streak-pill" onClick={() => setShowStreakModal(true)}>
            <span>🔥</span> {displayStreak}d
          </div>

          {/* Theme toggle */}
          <button
            className="mob-action-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              color: dark ? "#f8fafc" : "#0f172a",
            }}
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* ── Active Screen Container ── */}
      <main className="mob-main-content">
        {activeTab === "home" && (
          <MobileHomeScreen
            user={user}
            dark={dark}
            T={T}
            displayStreak={displayStreak}
            calorieTarget={calorieTarget}
            todayCalories={todayCalories}
            todayBurned={todayBurned}
            todayNetCalories={todayNetCalories}
            todayMacros={todayMacros}
            weights={weights}
            todayWorkouts={todayWorkouts}
            todayMeals={todayMeals}
            activeChallenges={activeChallenges}
            handleDashboardCheckIn={handleDashboardCheckIn}
            workoutPlan={workoutPlan}
            isFemale={isFemale}
            isMale={isMale}
            getCycleDay={getCycleDay}
            getPhaseName={getPhaseName}
            bmi={bmi}
            isPro={isPro}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenWeightModal={() => setShowWeightModal(true)}
            onOpenActionSheet={() => setShowActionSheet(true)}
            onQuickWater={handleQuickWater}
            waterMl={waterMl}
          />
        )}

        {activeTab === "workouts" && (
          <MobileWorkoutsScreen
            dark={dark}
            T={T}
            workouts={workouts}
            todayWorkouts={todayWorkouts}
            workoutPlan={workoutPlan}
          />
        )}

        {activeTab === "nutrition" && (
          <MobileNutritionScreen
            dark={dark}
            T={T}
            calorieTarget={calorieTarget}
            todayCalories={todayCalories}
            todayBurned={todayBurned}
            todayNetCalories={todayNetCalories}
            todayMacros={todayMacros}
            mealGroups={mealGroups}
            onQuickWater={handleQuickWater}
            waterMl={waterMl}
          />
        )}

        {activeTab === "community" && (
          <MobileCommunityScreen
            user={user}
            dark={dark}
            T={T}
          />
        )}

        {activeTab === "hub" && (
          <MobileHubScreen
            user={user}
            dark={dark}
            toggleTheme={toggleTheme}
            T={T}
            isFemale={isFemale}
            isMale={isMale}
            isPro={isPro}
            clearUser={clearUser}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
          />
        )}
      </main>

      {/* ── Native Android Floating Bottom Navigation Bar ── */}
      <nav
        className="mob-bottom-nav"
        style={{
          background: dark ? "rgba(13, 16, 26, 0.94)" : "rgba(255, 255, 255, 0.96)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.08)"}`,
        }}
      >
        {/* Left 2 tabs: Home, Workouts */}
        {navTabs.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`mob-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="mob-nav-icon-wrap">
                <span className="mob-nav-icon">{tab.icon}</span>
              </div>
              <span
                className="mob-nav-label"
                style={{
                  color: isActive
                    ? "#3b82f6"
                    : dark
                    ? "rgba(241, 245, 249, 0.5)"
                    : "rgba(15, 23, 42, 0.5)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Center Glowing Action Dial (+) */}
        <div className="mob-fab-wrap">
          <button
            className="mob-fab-btn"
            onClick={() => setShowActionSheet(true)}
            aria-label="Quick Action Center"
          >
            +
          </button>
        </div>

        {/* Right 3 tabs: Nutrition, Community, Hub */}
        {navTabs.slice(2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`mob-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="mob-nav-icon-wrap">
                <span className="mob-nav-icon">{tab.icon}</span>
              </div>
              <span
                className="mob-nav-label"
                style={{
                  color: isActive
                    ? "#3b82f6"
                    : dark
                    ? "rgba(241, 245, 249, 0.5)"
                    : "rgba(15, 23, 42, 0.5)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Center Action Bottom Sheet ── */}
      <MobileActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        dark={dark}
        T={T}
        onQuickWater={handleQuickWater}
        onOpenWeightModal={() => setShowWeightModal(true)}
        onCheckInChallenge={
          activeChallenges && activeChallenges.length > 0
            ? () => handleDashboardCheckIn(activeChallenges[0].id)
            : null
        }
        activeChallengeTitle={activeChallenges?.[0]?.title}
      />

      {/* ── Modals ── */}
      <WeightLogModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        uid={authUid}
        initialWeight={user?.weight}
        targetWeight={user?.targetWeight}
        onSaved={({ weight, targetWeight }) => {
          if (user) {
            user.weight = weight;
            if (targetWeight) user.targetWeight = targetWeight;
          }
        }}
      />

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={displayStreak}
        activeDates={[]}
        isTodayActive={true}
        onCheckIn={() => {}}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
        authUid={authUid}
      />
    </div>
  );
}
