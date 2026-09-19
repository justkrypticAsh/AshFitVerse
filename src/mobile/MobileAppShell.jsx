// src/mobile/MobileAppShell.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./mobileTheme.css";
import MobileHomeScreen from "./screens/MobileHomeScreen";
import MobileActionSheet from "./components/MobileActionSheet";
import WeightLogModal from "../components/WeightLogModal";
import StreakModal from "../components/StreakModal";
import FeedbackModal from "../components/FeedbackModal";
import OnboardingModal from "../components/OnboardingModal";
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
  meals = [],
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
  updateUser,
  activeDates = [],
  isTodayActive = false,
  hasCommunityUpdate,
  incomingMessageToast,
  dismissToast,
}) {
  const navigate = useNavigate();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Auto trigger onboarding modal for new / incomplete profiles on mobile
  React.useEffect(() => {
    if (user && (!user.weight || !user.height || !user.age)) {
      try {
        const dismissed = sessionStorage.getItem("ashfitverse_onboarding_dismissed");
        if (!dismissed) {
          setShowOnboardModal(true);
        }
      } catch {}
    }
  }, [user?.weight, user?.height, user?.age]);

  // Quick hydration tracker state (Defaults honestly to 0 ml if not logged today)
  const [waterMl, setWaterMl] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const val = localStorage.getItem(`ashfitverse_water_${today}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
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

  return (
    <div
      className="mobile-app-shell"
      style={{
        background: dark ? "#090b10" : "#f8fafc",
        color: dark ? "#f8fafc" : "#0f172a",
      }}
    >
      {/* ── Top Mobile App Bar ── */}
      <header
        className="mob-app-bar"
        style={{
          background: dark ? "rgba(9, 11, 16, 0.92)" : "rgba(248, 250, 252, 0.94)",
          borderBottom: `1px solid ${dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"}`,
        }}
      >
        <div className="mob-app-bar-user" onClick={() => navigate("/profile")}>
          <div className="mob-avatar-wrap">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="mob-avatar-img" />
            ) : (
              <div className="mob-avatar-fallback">{user?.name?.[0]?.toUpperCase() || "A"}</div>
            )}
            <div className="mob-avatar-online" />
          </div>

          <div className="mob-greeting-wrap">
            <span
              className="mob-greeting-sub"
              style={{ color: dark ? "rgba(241, 245, 249, 0.45)" : "rgba(15, 23, 42, 0.45)" }}
            >
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
            <span>🔥</span> {displayStreak > 0 ? `${displayStreak}d` : "0d"}
          </div>

          {/* Theme toggle */}
          <button
            className="mob-action-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              color: dark ? "#f8fafc" : "#0f172a",
            }}
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* ── Active Screen Container ── */}
      <main className="mob-main-content">
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
          mealGroups={mealGroups}
          authUid={authUid}
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
      </main>

      {/* Real-time Incoming Message Toast */}
      <CommunityNotificationToast toast={incomingMessageToast} onDismiss={dismissToast} />

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
        activeDates={activeDates}
        isTodayActive={isTodayActive}
        totalWorkouts={workouts?.length || 0}
        totalMeals={meals?.length || 0}
        dark={dark}
        T={T}
      />

      {/* Onboarding & Profile Completion Modal for Mobile */}
      <OnboardingModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        user={user}
        authUid={authUid}
        updateUser={updateUser}
        dark={dark}
        T={T}
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
