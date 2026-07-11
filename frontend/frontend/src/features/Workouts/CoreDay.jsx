import React from "react";
import WorkoutDayPage from "./WorkoutDayPage";

const CORE_CONFIG = {
  name: "Core & Abs",
  tag: "Core Day",
  emoji: "🔥",
  color: "#34d399",
  duration: "40 min",
  description: "A strong core is the foundation of all athletic performance. Train it hard, train it smart.",
  muscles: [
    { name: "Rectus Abdominis", type: "Primary" },
    { name: "Obliques", type: "Primary" },
    { name: "Transverse Abdominis", type: "Primary" },
    { name: "Hip Flexors", type: "Secondary" },
    { name: "Erector Spinae", type: "Stabiliser" },
  ],
  goals: [
    { icon: "🎯", text: "Quality over quantity — feel every rep in your core" },
    { icon: "💪", text: "Don't hold your breath — exhale on the exertion" },
    { icon: "🔥", text: "Keep lower back pressed to floor during floor work" },
    { icon: "⏱️", text: "Short rest periods (30–60s) to maximise burn" },
  ],
  exercises: [
    {
      name: "Plank",
      reps: "3 × 60 seconds",
      rest: "45s",
      tip: "Neutral spine — don't let hips sag or pike. Squeeze glutes and quads. Breathe steadily.",
      sets: [
        { reps: "60s", weight: "Bodyweight" },
        { reps: "60s", weight: "Bodyweight" },
        { reps: "60s", weight: "Bodyweight" },
      ],
    },
    {
      name: "Hanging Leg Raises",
      reps: "3 × 12 reps",
      rest: "60s",
      tip: "No swinging. Tuck pelvis under at the top for full ab contraction. Control the descent.",
      sets: [
        { reps: "12", weight: "Bodyweight" },
        { reps: "12", weight: "Bodyweight" },
        { reps: "12", weight: "Bodyweight" },
      ],
    },
    {
      name: "Cable Crunch",
      reps: "3 × 15 reps",
      rest: "60s",
      tip: "Hinge at hips to crunch — don't pull with arms. Round your upper back. Squeeze at the bottom.",
      sets: [
        { reps: "15", weight: "35 kg" },
        { reps: "15", weight: "35 kg" },
        { reps: "15", weight: "35 kg" },
      ],
    },
    {
      name: "Russian Twists",
      reps: "3 × 20 reps",
      rest: "45s",
      tip: "Lean back ~45°, feet off floor. Twist from waist, not arms. Touch the floor each side.",
      sets: [
        { reps: "20 total", weight: "10 kg plate" },
        { reps: "20 total", weight: "10 kg plate" },
        { reps: "20 total", weight: "10 kg plate" },
      ],
    },
    {
      name: "Dragon Flag",
      reps: "3 × 8 reps",
      rest: "75s",
      tip: "Start advanced — keep body rigid like a plank. Lower slowly, don't drop. Press lower back into bench.",
      sets: [
        { reps: "8", weight: "Bodyweight" },
        { reps: "8", weight: "Bodyweight" },
        { reps: "8", weight: "Bodyweight" },
      ],
    },
    {
      name: "Ab Wheel Rollout",
      reps: "3 × 10 reps",
      rest: "60s",
      tip: "Brace hard before rolling. Roll as far as you can without arching lower back. Pull back with abs.",
      sets: [
        { reps: "10", weight: "Bodyweight" },
        { reps: "10", weight: "Bodyweight" },
        { reps: "10", weight: "Bodyweight" },
      ],
    },
  ],
};

export default function CoreDay() {
  return <WorkoutDayPage config={CORE_CONFIG} />;
}