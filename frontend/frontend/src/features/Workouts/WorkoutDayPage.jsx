// src/features/Workouts/WorkoutDayPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/usetheme";
import useUser from "../../hooks/useUser";
import useIsMobile from "../../hooks/useIsMobile";
import { FONT, generateCSS } from "../../theme";
import { addLog, todayKey, addAppNotification } from "../../lib/userLogs";
import { showDonePopup } from "../../components/DonePopup";

export default function WorkoutDayPage({ config }) {
  const navigate = useNavigate();
  const { authUid } = useUser();
  const { dark, toggleTheme, T } = useTheme();
  const isMobile = useIsMobile(840);
  const [mounted, setMounted] = useState(false);

  const [completedSets, setCompletedSets] = useState({});
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [done, setDone] = useState(false);
  const [activeEx, setActiveEx] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Workout stopwatch
  useEffect(() => {
    let i;
    if (timerActive) i = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [timerActive]);

  // Rest timer
  useEffect(() => {
    let i;
    if (restActive && restTimer > 0) {
      i = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            setRestActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(i);
  }, [restActive, restTimer]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleSet = (exIdx, setIdx) => {
    const key = `${exIdx}-${setIdx}`;
    const wasCompleted = completedSets[key];
    setCompletedSets((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!wasCompleted) {
      setRestTimer(90);
      setRestActive(true);
      if (!timerActive) setTimerActive(true);
    }
  };

  const totalSets = config.exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const completedCount = Object.values(completedSets).filter(Boolean).length;
  const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

  const finishWorkout = async () => {
    if (completedCount === 0 || saving) return;
    setSaving(true);
    setTimerActive(false);
    const effectiveUid = authUid || localStorage.getItem("ashfitverse_email") || "local_athlete";
    try {
      const exercises = config.exercises
        .map((exercise, exIdx) => ({
          name: exercise.name,
          sets: exercise.sets.filter((_, setIdx) => completedSets[`${exIdx}-${setIdx}`]),
        }))
        .filter((exercise) => exercise.sets.length);

      await addLog(effectiveUid, "workouts", {
        date: todayKey(),
        name: config.name,
        exercises,
        sets: completedCount,
        duration: timer,
        volume: 0,
        caloriesBurned: Math.round((timer / 60) * 6),
      });

      await addAppNotification(effectiveUid, {
        text: `Workout saved: ${config.name} · ${completedCount} sets complete`,
        type: "workout",
        path: "/workout-logger",
      });

      setDone(true);
      showDonePopup({
        title: "Workout Finished!",
        message: `${config.name} logged & synced with your Dashboard!`,
        subtext: `${completedCount} sets completed · ${Math.round(timer / 60)} min session`,
        color: config.color || T.accent,
      });
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const themeCss = generateCSS(T, dark);

  return (
    <>
      <style>{themeCss}</style>
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          color: T.text,
          fontFamily: FONT.body,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease, background 0.4s ease, color 0.4s ease",
          position: "relative",
          paddingBottom: isMobile ? "calc(80px + env(safe-area-inset-bottom, 0px))" : "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Ambient Subtle Glow Orbs */}
        <div className="orb orb-1" style={{ opacity: 0.15 }} />
        <div className="orb orb-2" style={{ opacity: 0.12 }} />

        {/* ── Completion Overlay ── */}
        {done && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(16px)",
              padding: 20,
            }}
          >
            <div
              style={{
                background: dark ? "#0f121d" : "#ffffff",
                border: `1px solid ${config.color || T.accent}40`,
                borderRadius: 24,
                padding: "36px 28px",
                textAlign: "center",
                maxWidth: 420,
                width: "100%",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 12 }}>{config.emoji || "💪"}</div>
              <h2
                style={{
                  fontFamily: FONT.display,
                  fontSize: 26,
                  fontWeight: 900,
                  color: T.text,
                  marginBottom: 8,
                }}
              >
                {config.name} Complete!
              </h2>
              <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6, marginBottom: 24 }}>
                You completed <strong style={{ color: config.color }}>{completedCount} sets</strong> in{" "}
                <strong>{formatTime(timer)}</strong>. Recovery starts now — rehydrate and refuel!
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  border: "none",
                  background: config.color || T.accent,
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: FONT.display,
                }}
              >
                Back to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* ── Rest Timer Floating Pill ── */}
        {restActive && restTimer > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: isMobile ? "calc(76px + env(safe-area-inset-bottom, 0px))" : 28,
              right: isMobile ? 16 : 28,
              left: isMobile ? 16 : "auto",
              zIndex: 1000,
              background: dark ? "rgba(12, 16, 28, 0.95)" : "rgba(255, 255, 255, 0.98)",
              border: `1px solid ${config.color || T.accent}40`,
              borderRadius: 20,
              padding: "14px 20px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>😮‍💨</span>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Rest Timer
                </div>
                <div
                  style={{
                    fontFamily: FONT.display,
                    fontSize: 22,
                    fontWeight: 900,
                    color: config.color || T.accent,
                  }}
                >
                  {formatTime(restTimer)}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setRestActive(false);
                setRestTimer(0);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: T.textSub,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Skip
            </button>
          </div>
        )}

        {/* ── Sticky Modern Header ── */}
        <header
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: `1px solid ${T.glassBorder}`,
            background: dark ? "rgba(9, 11, 17, 0.88)" : "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(28px) saturate(180%)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/workout-planner")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 10,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: T.textSub,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT.body,
              }}
            >
              ← Workouts
            </button>
            <div
              onClick={() => navigate("/dashboard")}
              style={{
                fontFamily: FONT.display,
                fontSize: 18,
                fontWeight: 900,
                color: T.text,
                cursor: "pointer",
              }}
            >
              AshFit<span style={{ color: config.color || T.accent }}>Verse</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              onClick={() => setTimerActive(!timerActive)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                background: `${config.color || T.accent}14`,
                border: `1px solid ${config.color || T.accent}30`,
                fontFamily: FONT.display,
                fontSize: 13,
                fontWeight: 800,
                color: config.color || T.accent,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>{timerActive ? "⏸" : "▶"}</span>
              <span>{formatTime(timer)}</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `1px solid ${T.glassBorder}`,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: T.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {dark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>

        {/* ── Main Container ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: isMobile ? "16px 16px 20px" : "28px 24px" }}>
          {/* Hero Section */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "flex-end",
              gap: 18,
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: `${config.color}15`,
                  border: `1px solid ${config.color}35`,
                  fontSize: 11,
                  fontWeight: 800,
                  color: config.color,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {config.emoji} {config.tag}
              </div>
              <h1
                style={{
                  fontFamily: FONT.display,
                  fontSize: isMobile ? 32 : 44,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: T.text,
                  margin: "0 0 8px 0",
                  lineHeight: 1.1,
                }}
              >
                {config.name}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: T.textSub,
                  lineHeight: 1.5,
                  maxWidth: 580,
                  margin: 0,
                }}
              >
                {config.description}
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div style={{ display: "flex", gap: 10, width: isMobile ? "100%" : "auto" }}>
              {[
                { val: config.exercises.length, lbl: "Exercises" },
                { val: totalSets, lbl: "Sets" },
                { val: config.duration, lbl: "Duration" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: isMobile ? 1 : "none",
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                    border: `1px solid ${T.glassBorder}`,
                    textAlign: "center",
                    minWidth: 70,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT.display,
                      fontSize: 18,
                      fontWeight: 800,
                      color: config.color,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: T.textMuted,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginTop: 2,
                    }}
                  >
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: `1px solid ${T.glassBorder}`,
              borderRadius: 16,
              padding: "12px 16px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              <span style={{ color: T.textSub }}>
                {completedCount} of {totalSets} sets completed
              </span>
              <span style={{ color: config.color, fontFamily: FONT.display }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 99,
                background: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: config.color || T.accent,
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Two Columns Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 310px",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* Exercises List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {config.exercises.map((ex, ei) => {
                const isOpen = activeEx === ei;
                return (
                  <div
                    key={ei}
                    style={{
                      background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                      border: `1px solid ${isOpen ? `${config.color}40` : T.glassBorder}`,
                      borderRadius: 18,
                      overflow: "hidden",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    {/* Header */}
                    <div
                      onClick={() => setActiveEx(isOpen ? -1 : ei)}
                      style={{
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: `${config.color}18`,
                            color: config.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT.display,
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {ei + 1}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: FONT.display,
                              fontSize: 15,
                              fontWeight: 800,
                              color: T.text,
                            }}
                          >
                            {ex.name}
                          </div>
                          <div style={{ fontSize: 11, color: T.textSub, marginTop: 2 }}>
                            {ex.sets.length} sets · {ex.reps} · {ex.rest} rest
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 12,
                          color: T.textMuted,
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        ▼
                      </span>
                    </div>

                    {/* Sets Content */}
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 18px 16px",
                          borderTop: `1px solid ${T.glassBorder}`,
                          paddingTop: 14,
                        }}
                      >
                        {/* Table Header */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "32px 1fr 1fr 1fr 38px",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 8,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: T.textMuted,
                            textAlign: "center",
                          }}
                        >
                          <div>Set</div>
                          <div>Reps</div>
                          <div>Load</div>
                          <div>Rest</div>
                          <div>Done</div>
                        </div>

                        {/* Sets Rows */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {ex.sets.map((s, si) => {
                            const key = `${ei}-${si}`;
                            const isChecked = completedSets[key];

                            return (
                              <div
                                key={si}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "32px 1fr 1fr 1fr 38px",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    height: 34,
                                    borderRadius: 8,
                                    background: isChecked ? `${config.color}20` : dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                                    color: isChecked ? config.color : T.textSub,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    fontFamily: FONT.display,
                                  }}
                                >
                                  {si + 1}
                                </div>

                                <div
                                  style={{
                                    height: 34,
                                    borderRadius: 8,
                                    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${T.glassBorder}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: T.text,
                                  }}
                                >
                                  {s.reps}
                                </div>

                                <div
                                  style={{
                                    height: 34,
                                    borderRadius: 8,
                                    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${T.glassBorder}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: T.text,
                                  }}
                                >
                                  {s.weight}
                                </div>

                                <div
                                  style={{
                                    height: 34,
                                    borderRadius: 8,
                                    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${T.glassBorder}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: T.textSub,
                                  }}
                                >
                                  {ex.rest}
                                </div>

                                <button
                                  onClick={() => toggleSet(ei, si)}
                                  aria-label={`Mark set ${si + 1} complete`}
                                  style={{
                                    width: 38,
                                    height: 34,
                                    borderRadius: 8,
                                    border: isChecked ? `1px solid ${config.color}` : `1px solid ${T.glassBorder}`,
                                    background: isChecked ? config.color : "transparent",
                                    color: isChecked ? "#ffffff" : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                    fontWeight: 900,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {isChecked ? "✓" : ""}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Form Tip */}
                        {ex.tip && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: `${config.color}0c`,
                              border: `1px solid ${config.color}20`,
                              fontSize: 11.5,
                              color: T.textSub,
                              lineHeight: 1.5,
                            }}
                          >
                            <strong style={{ color: config.color }}>Form Cue: </strong>
                            {ex.tip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Muscles Worked */}
              <div
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  border: `1px solid ${T.glassBorder}`,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: T.textMuted,
                    marginBottom: 12,
                  }}
                >
                  Muscles Worked
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {config.muscles.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: i < config.muscles.length - 1 ? `1px solid ${T.glassBorder}` : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: config.color,
                          }}
                        />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>
                          {m.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: `${config.color}15`,
                          color: config.color,
                        }}
                      >
                        {m.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routine Goals */}
              <div
                style={{
                  background: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  border: `1px solid ${T.glassBorder}`,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: T.textMuted,
                    marginBottom: 12,
                  }}
                >
                  Key Objectives
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {config.goals.map((g, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 12,
                        color: T.textSub,
                        lineHeight: 1.45,
                      }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{g.icon}</span>
                      <span>{g.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finish Workout CTA */}
              <button
                disabled={completedCount === 0 || saving}
                onClick={finishWorkout}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  border: "none",
                  background: completedCount > 0 ? config.color || T.accent : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  color: completedCount > 0 ? "#ffffff" : T.textMuted,
                  fontFamily: FONT.display,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: completedCount > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  boxShadow: completedCount > 0 ? `0 6px 20px ${config.color}35` : "none",
                }}
              >
                {saving
                  ? "Saving Workout…"
                  : completedCount === 0
                  ? "Check sets to finish"
                  : `Finish ${config.name} (${completedCount} sets) ✓`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
