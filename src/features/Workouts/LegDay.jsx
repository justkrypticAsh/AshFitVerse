import React from "react";
import WorkoutDayPage from "./WorkoutDayPage";

const LEG_CONFIG = {
  name: "Leg Day",
  tag: "Lower Body",
  emoji: "🦵",
  color: "#fb923c",
  duration: "65 min",
  description: "Never skip leg day. Build powerful quads, hamstrings and glutes that support every movement you make.",
  muscles: [
    { name: "Quadriceps", type: "Primary" },
    { name: "Hamstrings", type: "Primary" },
    { name: "Gluteus Maximus", type: "Primary" },
    { name: "Adductors", type: "Secondary" },
    { name: "Calves", type: "Secondary" },
    { name: "Core", type: "Stabiliser" },
  ],
  goals: [
    { icon: "🎯", text: "Squat to parallel or below — full ROM builds more muscle" },
    { icon: "💪", text: "Drive through your heels and mid-foot, not your toes" },
    { icon: "🔥", text: "Brace your core before each rep — protect your spine" },
    { icon: "⏱️", text: "Rest 2–3 min after squats and deadlifts" },
  ],
  exercises: [
    {
      name: "Back Squat",
      reps: "4 × 8 reps",
      rest: "2–3 min",
      tip: "Bar on upper traps. Chest up, knees track over toes. Break parallel. Drive hips through at top.",
      sets: [
        { reps: "8", weight: "60 kg (warm-up)" },
        { reps: "8", weight: "90 kg" },
        { reps: "8", weight: "90 kg" },
        { reps: "8", weight: "90 kg" },
      ],
    },
    {
      name: "Romanian Deadlift",
      reps: "3 × 10 reps",
      rest: "90s",
      tip: "Push hips back, not down. Feel the hamstring stretch. Keep bar close to legs throughout.",
      sets: [
        { reps: "10", weight: "70 kg" },
        { reps: "10", weight: "70 kg" },
        { reps: "10", weight: "70 kg" },
      ],
    },
    {
      name: "Leg Press",
      reps: "3 × 12 reps",
      rest: "90s",
      tip: "Don't lock knees at the top. Feet shoulder-width. Higher foot placement targets glutes/hamstrings.",
      sets: [
        { reps: "12", weight: "140 kg" },
        { reps: "12", weight: "140 kg" },
        { reps: "12", weight: "140 kg" },
      ],
    },
    {
      name: "Walking Lunges",
      reps: "3 × 10 each",
      rest: "75s",
      tip: "Long stride, front knee stays behind toes. Keep torso upright throughout.",
      sets: [
        { reps: "10/side", weight: "20 kg DBs" },
        { reps: "10/side", weight: "20 kg DBs" },
        { reps: "10/side", weight: "20 kg DBs" },
      ],
    },
    {
      name: "Seated Calf Raise",
      reps: "4 × 20 reps",
      rest: "60s",
      tip: "Full range of motion — deep stretch at bottom, full contraction at top. Slow and controlled.",
      sets: [
        { reps: "20", weight: "50 kg" },
        { reps: "20", weight: "50 kg" },
        { reps: "20", weight: "50 kg" },
        { reps: "20", weight: "50 kg" },
      ],
    },
  ],
};

export function LegDay() {
  return <WorkoutDayPage config={LEG_CONFIG} />;
}

export default LegDay;