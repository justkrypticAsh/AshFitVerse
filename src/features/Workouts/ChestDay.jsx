// ─────────────────────────────────────────────────────────────
// src/features/workouts/ChestDay.jsx
// ─────────────────────────────────────────────────────────────
import React from "react";
import WorkoutDayPage from "./WorkoutDayPage";

const CONFIG = {
  name: "Chest Day",
  tag: "Push Day",
  emoji: "💪",
  color: "#4f8ef7",
  duration: "55 min",
  description: "Build a powerful, thick chest with compound presses and isolation movements. Focus on the mind-muscle connection.",
  muscles: [
    { name: "Pectoralis Major", type: "Primary" },
    { name: "Anterior Deltoid", type: "Secondary" },
    { name: "Triceps Brachii", type: "Secondary" },
    { name: "Serratus Anterior", type: "Stabiliser" },
  ],
  goals: [
    { icon: "🎯", text: "Achieve a deep stretch at the bottom of each press" },
    { icon: "💪", text: "Keep shoulder blades retracted and depressed throughout" },
    { icon: "🔥", text: "Progressive overload — aim to beat last week's weights" },
    { icon: "⏱️", text: "Rest 90s between sets for optimal hypertrophy" },
  ],
  exercises: [
    {
      name: "Flat Barbell Bench Press",
      reps: "4 × 8 reps",
      rest: "90s",
      tip: "Lower the bar to your lower chest. Keep elbows at ~75° — not flared. Drive through your feet.",
      sets: [
        { reps: "6–8", weight: "Warm-up" },
        { reps: "8", weight: "80 kg" },
        { reps: "8", weight: "80 kg" },
        { reps: "8", weight: "80 kg" },
      ],
    },
    {
      name: "Incline DB Press",
      reps: "3 × 10 reps",
      rest: "75s",
      tip: "Set bench to 30–45°. Control the descent for 2 seconds. Don't let DBs crash at the top.",
      sets: [
        { reps: "10", weight: "28 kg" },
        { reps: "10", weight: "28 kg" },
        { reps: "10", weight: "28 kg" },
      ],
    },
    {
      name: "Cable Fly (Low to High)",
      reps: "3 × 12 reps",
      rest: "60s",
      tip: "Think 'hugging a tree'. Keep a slight bend in elbows. Squeeze hard at the top for 1 second.",
      sets: [
        { reps: "12", weight: "15 kg" },
        { reps: "12", weight: "15 kg" },
        { reps: "12", weight: "15 kg" },
      ],
    },
    {
      name: "Chest Dips",
      reps: "3 × 10 reps",
      rest: "75s",
      tip: "Lean forward ~30° to target chest. Lower until shoulders are below elbows. Full ROM.",
      sets: [
        { reps: "10", weight: "Bodyweight" },
        { reps: "10", weight: "Bodyweight" },
        { reps: "10", weight: "+5 kg" },
      ],
    },
    {
      name: "DB Pullovers",
      reps: "3 × 12 reps",
      rest: "60s",
      tip: "Keep a slight bend in elbows. Stretch the chest fully at the top. Don't go too heavy.",
      sets: [
        { reps: "12", weight: "20 kg" },
        { reps: "12", weight: "20 kg" },
        { reps: "12", weight: "20 kg" },
      ],
    },
  ],
};

export default function ChestDay() {
  return <WorkoutDayPage config={CONFIG} />;
}