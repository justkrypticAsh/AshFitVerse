import React from "react";
import WorkoutDayPage from "./WorkoutDayPage";

const CONFIG = {
  name: "Back Day",
  tag: "Pull Day",
  emoji: "🏋️",
  color: "#a78bfa",
  duration: "60 min",
  description: "Build a wide, thick back with deadlifts, rows and pull-ups. The foundation of real strength.",
  muscles: [
    { name: "Latissimus Dorsi", type: "Primary" },
    { name: "Rhomboids", type: "Primary" },
    { name: "Trapezius", type: "Secondary" },
    { name: "Biceps Brachii", type: "Secondary" },
    { name: "Rear Deltoid", type: "Stabiliser" },
    { name: "Erector Spinae", type: "Stabiliser" },
  ],
  goals: [
    { icon: "🎯", text: "Feel the stretch in your lats on every pull" },
    { icon: "💪", text: "Lead with your elbows, not your hands on rows" },
    { icon: "🔥", text: "Keep your chest up and spine neutral on deadlifts" },
    { icon: "⏱️", text: "Rest 2 min after deadlifts, 90s for accessories" },
  ],
  exercises: [
    {
      name: "Conventional Deadlift",
      reps: "4 × 5 reps",
      rest: "2 min",
      tip: "Bar over mid-foot. Hinge from hips. Keep lats tight — 'protect your armpits'. Lock out at top.",
      sets: [
        { reps: "5", weight: "60 kg (warm-up)" },
        { reps: "5", weight: "100 kg" },
        { reps: "5", weight: "100 kg" },
        { reps: "5", weight: "100 kg" },
      ],
    },
    {
      name: "Weighted Pull-ups",
      reps: "4 × 8 reps",
      rest: "90s",
      tip: "Full dead hang at the bottom. Pull your chest to the bar. Avoid swinging.",
      sets: [
        { reps: "8", weight: "Bodyweight" },
        { reps: "8", weight: "+5 kg" },
        { reps: "8", weight: "+5 kg" },
        { reps: "8", weight: "+5 kg" },
      ],
    },
    {
      name: "Barbell Bent-Over Row",
      reps: "3 × 10 reps",
      rest: "75s",
      tip: "Hinge to ~45°, pull bar to lower chest/upper stomach. Squeeze shoulder blades together at top.",
      sets: [
        { reps: "10", weight: "70 kg" },
        { reps: "10", weight: "70 kg" },
        { reps: "10", weight: "70 kg" },
      ],
    },
    {
      name: "Seated Cable Row",
      reps: "3 × 12 reps",
      rest: "60s",
      tip: "Don't lean back excessively. Pull to your navel. Control the negative for 2 seconds.",
      sets: [
        { reps: "12", weight: "65 kg" },
        { reps: "12", weight: "65 kg" },
        { reps: "12", weight: "65 kg" },
      ],
    },
    {
      name: "Face Pulls",
      reps: "3 × 15 reps",
      rest: "60s",
      tip: "Pull to face level, rotate wrists out at the end. Great for rear delts and rotator cuff health.",
      sets: [
        { reps: "15", weight: "25 kg" },
        { reps: "15", weight: "25 kg" },
        { reps: "15", weight: "25 kg" },
      ],
    },
  ],
};

export default function BackDay() {
  return <WorkoutDayPage config={CONFIG} />;
}