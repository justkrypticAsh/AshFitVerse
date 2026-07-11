import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { generateCSS, BG_IMAGES, FONT } from "../../theme";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WEEK_PLAN = [
  {
    day: "Monday", type: "Training Day", typeColor: "#4f8ef7",
    total: { cal: 2600, protein: 175, carbs: 280, fats: 72 },
    meals: [
      { time: "7:00 AM", name: "Breakfast", emoji: "🌅", items: ["100g Oats with milk", "2 whole eggs + 3 egg whites", "1 banana", "Whey protein shake (30g)"], cal: 680, protein: 47, carbs: 82, fats: 12 },
      { time: "10:30 AM", name: "Mid-Morning Snack", emoji: "🍎", items: ["Greek yogurt (170g)", "30g mixed nuts", "1 apple"], cal: 340, protein: 20, carbs: 28, fats: 17 },
      { time: "1:00 PM", name: "Lunch", emoji: "☀️", items: ["200g chicken breast", "150g brown rice", "Large mixed salad", "Olive oil dressing (1 tbsp)"], cal: 620, protein: 58, carbs: 72, fats: 14 },
      { time: "4:00 PM", name: "Pre-Workout", emoji: "⚡", items: ["Banana", "Whey protein (30g)", "Rice cakes (2)"], cal: 310, protein: 25, carbs: 45, fats: 3 },
      { time: "7:30 PM", name: "Post-Workout", emoji: "💪", items: ["150g salmon", "150g sweet potato", "Broccoli (200g)", "Olive oil drizzle"], cal: 490, protein: 38, carbs: 42, fats: 16 },
      { time: "9:30 PM", name: "Evening Snack", emoji: "🌙", items: ["Cottage cheese (200g)", "Casein protein shake"], cal: 260, protein: 38, carbs: 11, fats: 5 },
    ],
  },
  {
    day: "Tuesday", type: "Training Day", typeColor: "#a78bfa",
    total: { cal: 2550, protein: 168, carbs: 270, fats: 70 },
    meals: [
      { time: "7:00 AM", name: "Breakfast", emoji: "🌅", items: ["3 whole eggs scrambled", "2 slices whole grain toast", "Avocado (1/2)", "1 orange"], cal: 620, protein: 28, carbs: 56, fats: 28 },
      { time: "10:30 AM", name: "Mid-Morning Snack", emoji: "🍌", items: ["Banana", "Peanut butter (2 tbsp)", "Casein shake"], cal: 370, protein: 28, carbs: 38, fats: 18 },
      { time: "1:00 PM", name: "Lunch", emoji: "☀️", items: ["200g turkey breast", "Quinoa (120g dry)", "Roasted vegetables", "Feta cheese (30g)"], cal: 590, protein: 55, carbs: 65, fats: 14 },
      { time: "4:00 PM", name: "Pre-Workout", emoji: "⚡", items: ["Whey protein (30g)", "2 rice cakes with honey", "Coffee"], cal: 290, protein: 25, carbs: 40, fats: 2 },
      { time: "7:30 PM", name: "Post-Workout", emoji: "💪", items: ["200g lean beef mince", "150g white rice", "Stir-fry vegetables", "Soy sauce (light)"], cal: 520, protein: 45, carbs: 58, fats: 14 },
      { time: "9:30 PM", name: "Evening Snack", emoji: "🌙", items: ["Cottage cheese (150g)", "Berries (100g)"], cal: 200, protein: 18, carbs: 22, fats: 4 },
    ],
  },
  {
    day: "Wednesday", type: "Rest Day", typeColor: "#34d399",
    total: { cal: 2100, protein: 155, carbs: 210, fats: 65 },
    meals: [
      { time: "8:00 AM", name: "Breakfast", emoji: "🌅", items: ["2 whole eggs + 2 whites", "Spinach and mushroom sauté", "1 slice sourdough", "1 grapefruit"], cal: 420, protein: 30, carbs: 38, fats: 14 },
      { time: "11:00 AM", name: "Mid-Morning", emoji: "🍎", items: ["Whey protein shake", "Apple", "15g almonds"], cal: 290, protein: 27, carbs: 28, fats: 8 },
      { time: "1:30 PM", name: "Lunch", emoji: "☀️", items: ["180g grilled chicken", "Large mixed salad", "Chickpeas (100g)", "Olive oil + lemon dressing"], cal: 520, protein: 48, carbs: 42, fats: 18 },
      { time: "4:00 PM", name: "Snack", emoji: "🥜", items: ["Greek yogurt (170g)", "30g mixed seeds", "Honey drizzle"], cal: 280, protein: 20, carbs: 26, fats: 10 },
      { time: "7:00 PM", name: "Dinner", emoji: "🌙", items: ["150g salmon fillet", "Roasted asparagus", "Cauliflower rice (200g)", "Lemon butter sauce"], cal: 450, protein: 38, carbs: 18, fats: 22 },
      { time: "9:00 PM", name: "Evening", emoji: "⭐", items: ["Casein protein shake (30g)", "Herbal tea"], cal: 140, protein: 24, carbs: 6, fats: 2 },
    ],
  },
  {
    day: "Thursday", type: "Training Day", typeColor: "#fb923c",
    total: { cal: 2650, protein: 178, carbs: 285, fats: 68 },
    meals: [
      { time: "7:00 AM", name: "Breakfast", emoji: "🌅", items: ["Overnight oats (100g)", "Whey protein (30g)", "Mixed berries (100g)", "Chia seeds (15g)"], cal: 640, protein: 45, carbs: 78, fats: 12 },
      { time: "10:30 AM", name: "Mid-Morning", emoji: "🍌", items: ["Banana", "Hard boiled eggs (2)", "Rice cakes (2)"], cal: 320, protein: 18, carbs: 42, fats: 8 },
      { time: "1:00 PM", name: "Lunch", emoji: "☀️", items: ["Tuna (200g canned)", "Whole grain pasta (120g)", "Cherry tomatoes", "Olive oil, basil"], cal: 580, protein: 52, carbs: 68, fats: 12 },
      { time: "4:00 PM", name: "Pre-Workout", emoji: "⚡", items: ["Whey + dextrose shake", "Banana", "Espresso shot"], cal: 320, protein: 25, carbs: 50, fats: 2 },
      { time: "7:30 PM", name: "Post-Workout", emoji: "💪", items: ["200g chicken thigh", "Sweet potato mash", "Green beans", "Butter (10g)"], cal: 550, protein: 45, carbs: 42, fats: 22 },
      { time: "9:30 PM", name: "Evening", emoji: "🌙", items: ["Low-fat cottage cheese", "Flaxseeds (10g)"], cal: 240, protein: 22, carbs: 10, fats: 8 },
    ],
  },
  {
    day: "Friday", type: "Training Day", typeColor: "#f472b6",
    total: { cal: 2700, protein: 180, carbs: 290, fats: 70 },
    meals: [
      { time: "7:00 AM", name: "Breakfast", emoji: "🌅", items: ["Protein pancakes (3)", "Maple syrup (light)", "Whey shake", "Berries"], cal: 680, protein: 50, carbs: 75, fats: 14 },
      { time: "10:30 AM", name: "Mid-Morning", emoji: "🥛", items: ["Milk (300ml)", "Banana", "Protein bar"], cal: 360, protein: 28, carbs: 45, fats: 9 },
      { time: "1:00 PM", name: "Lunch", emoji: "☀️", items: ["200g sirloin steak", "150g white rice", "Corn on the cob", "Side salad"], cal: 640, protein: 58, carbs: 72, fats: 16 },
      { time: "4:00 PM", name: "Pre-Workout", emoji: "⚡", items: ["Whey protein", "Rice cakes with jam", "Banana"], cal: 330, protein: 26, carbs: 52, fats: 2 },
      { time: "7:30 PM", name: "Post-Workout", emoji: "💪", items: ["Chicken stir-fry 200g", "Egg noodles 100g", "Mixed veg", "Teriyaki sauce"], cal: 530, protein: 46, carbs: 56, fats: 14 },
      { time: "9:30 PM", name: "Evening", emoji: "🌙", items: ["Casein shake (40g)", "1 tbsp almond butter"], cal: 280, protein: 32, carbs: 10, fats: 10 },
    ],
  },
  {
    day: "Saturday", type: "Active Rest", typeColor: "#fbbf24",
    total: { cal: 2300, protein: 160, carbs: 240, fats: 72 },
    meals: [
      { time: "9:00 AM", name: "Brunch", emoji: "☀️", items: ["Eggs Benedict (2)", "Smoked salmon", "Whole grain toast", "Fresh juice"], cal: 720, protein: 42, carbs: 58, fats: 28 },
      { time: "1:00 PM", name: "Lunch", emoji: "🥗", items: ["Large grilled chicken salad", "Quinoa (80g)", "Feta (30g)", "Tahini dressing"], cal: 480, protein: 45, carbs: 38, fats: 16 },
      { time: "4:00 PM", name: "Snack", emoji: "🍎", items: ["Protein shake", "Fruit bowl (200g)", "Handful walnuts"], cal: 340, protein: 28, carbs: 38, fats: 10 },
      { time: "7:30 PM", name: "Dinner", emoji: "🍽️", items: ["Grilled sea bass 200g", "Roasted Mediterranean veg", "New potatoes 150g", "Herb butter"], cal: 560, protein: 42, carbs: 52, fats: 18 },
      { time: "10:00 PM", name: "Evening", emoji: "🌙", items: ["Casein shake", "Low-fat yogurt"], cal: 200, protein: 28, carbs: 14, fats: 4 },
    ],
  },
  {
    day: "Sunday", type: "Rest Day", typeColor: "#34d399",
    total: { cal: 2000, protein: 148, carbs: 195, fats: 65 },
    meals: [
      { time: "9:00 AM", name: "Breakfast", emoji: "🌅", items: ["Veggie omelette (4 eggs)", "Whole grain toast", "Avocado (1/2)", "Coffee"], cal: 580, protein: 38, carbs: 38, fats: 26 },
      { time: "1:00 PM", name: "Lunch", emoji: "☀️", items: ["Homemade chicken soup", "Sourdough bread (2 slices)", "Side salad"], cal: 480, protein: 38, carbs: 52, fats: 12 },
      { time: "4:00 PM", name: "Snack", emoji: "🍵", items: ["Cottage cheese (150g)", "Berries", "Green tea"], cal: 180, protein: 18, carbs: 18, fats: 3 },
      { time: "7:00 PM", name: "Dinner", emoji: "🍽️", items: ["200g turkey breast", "Roasted sweet potato", "Steamed broccoli", "Gravy (light)"], cal: 520, protein: 48, carbs: 58, fats: 10 },
      { time: "9:00 PM", name: "Evening", emoji: "🌙", items: ["Casein shake (30g)", "Chamomile tea"], cal: 140, protein: 24, carbs: 6, fats: 2 },
    ],
  },
];

export default function DietPlan() {
  const navigate = useNavigate();
  const { dark, toggleTheme, T } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const day = WEEK_PLAN[activeDay];

  const css = generateCSS(T, dark) + `
    .root{min-height:100vh;background:${T.bg};color:${T.text};font-family:${FONT.body};opacity:${mounted?1:0};transition:opacity 0.7s,background 0.5s,color 0.5s;position:relative;overflow-x:hidden;}

    .header{display:flex;align-items:center;justify-content:space-between;padding:24px 40px;border-bottom:1px solid ${T.glassBorder};background:${dark?"rgba(7,8,15,0.88)":"rgba(242,244,252,0.88)"};backdrop-filter:blur(30px);position:sticky;top:0;z-index:50;}
    .h-logo{font-family:${FONT.display};font-size:20px;font-weight:800;color:${T.text};}
    .h-logo span{color:${T.accent};}

    .content{max-width:1100px;margin:0 auto;padding:32px 40px;position:relative;z-index:1;}
    .page-title{font-family:${FONT.display};font-size:32px;font-weight:800;letter-spacing:-0.02em;color:${T.text};margin-bottom:6px;}
    .page-title span{background:linear-gradient(135deg,${T.purple},${T.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .page-sub{font-size:14px;color:${T.textSub};margin-bottom:28px;}

    .day-tabs{display:flex;gap:8px;margin-bottom:28px;overflow-x:auto;padding-bottom:4px;}
    .day-tab{padding:11px 18px;border-radius:13px;border:1.5px solid ${T.glassBorder};background:${T.glass};backdrop-filter:blur(20px);cursor:pointer;font-size:13px;font-weight:700;color:${T.textSub};transition:all 0.25s;white-space:nowrap;font-family:${FONT.body};}
    .day-tab:hover{color:${T.text};border-color:${T.glassBorderHover};}
    .day-tab.active{color:#fff;border-color:transparent;box-shadow:0 4px 16px rgba(0,0,0,0.2);}

    .day-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;animation:fadeUp 0.5s ease both;}
    .day-title{font-family:${FONT.display};font-size:28px;font-weight:800;color:${T.text};}
    .day-type{padding:7px 16px;border-radius:99px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;}

    .macro-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;animation:fadeUp 0.5s ease 0.05s both;}
    .mc{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;padding:16px;backdrop-filter:blur(28px);text-align:center;}
    .mc-l{font-size:10px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:${T.textMuted};margin-bottom:6px;}
    .mc-v{font-family:${FONT.display};font-size:22px;font-weight:800;}
    .mc-u{font-size:11px;color:${T.textSub};font-weight:500;}

    .main-grid{display:grid;grid-template-columns:1fr 300px;gap:20px;}
    .meal-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:20px;backdrop-filter:blur(28px);margin-bottom:12px;overflow:hidden;transition:all 0.3s;animation:fadeUp 0.5s ease both;cursor:pointer;}
    .meal-card:hover{border-color:${T.glassBorderHover};}
    .meal-card.expanded{border-color:var(--mc)35;}
    .mc-header{padding:18px 22px;display:flex;align-items:center;justify-content:space-between;}
    .mc-left{display:flex;align-items:center;gap:12px;}
    .mc-emoji{font-size:22px;}
    .mc-time{font-size:11px;color:${T.textMuted};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;}
    .mc-name{font-family:${FONT.display};font-size:15px;font-weight:800;color:${T.text};}
    .mc-right{display:flex;align-items:center;gap:12px;}
    .mc-cal-badge{padding:5px 12px;border-radius:99px;font-size:12px;font-weight:800;font-family:${FONT.display};}
    .mc-chevron{font-size:13px;color:${T.textMuted};transition:transform 0.3s;}
    .mc-chevron.open{transform:rotate(180deg);}

    .mc-body{padding:0 22px 18px;animation:fadeUp 0.3s ease both;}
    .meal-items{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
    .meal-item{display:flex;align-items:center;gap:10px;font-size:13px;color:${T.textSub};}
    .meal-item-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .meal-macros{display:flex;gap:10px;}
    .mm-chip{padding:4px 11px;border-radius:99px;font-size:11px;font-weight:700;}

    .tip-card{background:${T.glass};border:1px solid ${T.glassBorder};border-radius:18px;padding:20px;backdrop-filter:blur(28px);margin-bottom:14px;}
    .tip-title{font-family:${FONT.display};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.textMuted};margin-bottom:14px;}
    .tip-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid ${T.glassBorder};font-size:12px;color:${T.textSub};line-height:1.55;}
    .tip-row:last-child{border-bottom:none;}

    @media(max-width:900px){.main-grid{grid-template-columns:1fr;}.macro-row{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.content{padding:20px 16px;}.day-header{flex-direction:column;align-items:flex-start;}.macro-row{grid-template-columns:repeat(2,1fr);}}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="bg-image-layer"><img src={BG_IMAGES.diet} alt="" loading="lazy" /></div>
        <div className="orb orb-1" /><div className="orb orb-2" />

        <div className="header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <div className="h-logo">AshFit<span>Verse</span></div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-thumb">{dark ? "🌙" : "☀️"}</div>
          </button>
        </div>

        <div className="content">
          <div className="page-title" style={{ animation: "fadeUp 0.6s ease both" }}>Weekly Diet <span>Plan</span></div>
          <div className="page-sub" style={{ animation: "fadeUp 0.6s ease 0.05s both" }}>
            A personalised 7-day meal plan optimised for muscle gain — 2,400 kcal average · 165g protein
          </div>

          <div className="day-tabs" style={{ animation: "fadeUp 0.6s ease 0.08s both" }}>
            {WEEK_PLAN.map((d, i) => (
              <button key={i} className={`day-tab ${activeDay === i ? "active" : ""}`}
                style={activeDay === i ? { background: `linear-gradient(135deg,${d.typeColor},${d.typeColor}bb)` } : {}}
                onClick={() => { setActiveDay(i); setExpandedMeal(null); }}>
                {d.day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="day-header">
            <div><div className="day-title">{day.day}</div></div>
            <div className="day-type" style={{ background: `${day.typeColor}18`, color: day.typeColor, border: `1px solid ${day.typeColor}35` }}>{day.type}</div>
          </div>

          <div className="macro-row">
            {[
              { l: "Total Calories", v: day.total.cal, u: "kcal", c: T.accent },
              { l: "Protein", v: day.total.protein, u: "g", c: "#4f8ef7" },
              { l: "Carbohydrates", v: day.total.carbs, u: "g", c: T.purple },
              { l: "Fats", v: day.total.fats, u: "g", c: T.orange },
            ].map((m, i) => (
              <div key={i} className="mc">
                <div className="mc-l">{m.l}</div>
                <div className="mc-v" style={{ color: m.c }}>{m.v}</div>
                <div className="mc-u">{m.u}</div>
              </div>
            ))}
          </div>

          <div className="main-grid">
            <div>
              {day.meals.map((meal, mi) => (
                <div key={mi} className={`meal-card ${expandedMeal === mi ? "expanded" : ""}`}
                  style={{ "--mc": day.typeColor, animationDelay: `${mi * 0.06}s` }}
                  onClick={() => setExpandedMeal(expandedMeal === mi ? null : mi)}>
                  <div className="mc-header">
                    <div className="mc-left">
                      <span className="mc-emoji">{meal.emoji}</span>
                      <div>
                        <div className="mc-time">{meal.time}</div>
                        <div className="mc-name">{meal.name}</div>
                      </div>
                    </div>
                    <div className="mc-right">
                      <span className="mc-cal-badge" style={{ background: `${day.typeColor}18`, color: day.typeColor }}>{meal.cal} kcal</span>
                      <span className={`mc-chevron ${expandedMeal === mi ? "open" : ""}`}>▼</span>
                    </div>
                  </div>
                  {expandedMeal === mi && (
                    <div className="mc-body">
                      <ul className="meal-items">
                        {meal.items.map((item, ii) => (
                          <li key={ii} className="meal-item">
                            <div className="meal-item-dot" style={{ background: day.typeColor }} />{item}
                          </li>
                        ))}
                      </ul>
                      <div className="meal-macros">
                        <span className="mm-chip" style={{ background: "#4f8ef720", color: "#4f8ef7" }}>P {meal.protein}g</span>
                        <span className="mm-chip" style={{ background: "#a78bfa20", color: "#a78bfa" }}>C {meal.carbs}g</span>
                        <span className="mm-chip" style={{ background: "#fb923c20", color: "#fb923c" }}>F {meal.fats}g</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="tip-card">
                <div className="tip-title">Daily Guidelines</div>
                {[
                  { icon: "💧", text: "Drink 3–4 litres of water throughout the day" },
                  { icon: "⏰", text: "Eat every 3–4 hours to maintain energy levels" },
                  { icon: "🥩", text: "Prioritise protein in every meal" },
                  { icon: "🥦", text: "Fill half your plate with vegetables" },
                  { icon: "🚫", text: "Avoid processed foods and refined sugars" },
                ].map((t, i, a) => (
                  <div key={i} className="tip-row" style={{ borderColor: i < a.length - 1 ? T.glassBorder : "transparent" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span><span>{t.text}</span>
                  </div>
                ))}
              </div>

              <div className="tip-card">
                <div className="tip-title">Supplements</div>
                {[
                  { icon: "🟡", name: "Creatine", dose: "5g daily", time: "Any time" },
                  { icon: "🔵", name: "Whey Protein", dose: "30–40g", time: "Post-workout" },
                  { icon: "🟠", name: "Vitamin D3", dose: "2000 IU", time: "With food" },
                  { icon: "🐟", name: "Omega-3", dose: "2g EPA/DHA", time: "With meals" },
                ].map((s, i, a) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{s.time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{s.dose}</span>
                  </div>
                ))}
              </div>

              <div className="tip-card">
                <div className="tip-title">Week Summary</div>
                {[
                  { k: "Avg Calories", v: "2,414 kcal", c: T.accent },
                  { k: "Avg Protein", v: "166g / day", c: "#4f8ef7" },
                  { k: "Training Days", v: "4 days", c: T.purple },
                  { k: "Rest Days", v: "3 days", c: T.green },
                ].map((r, i, a) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.glassBorder}` : "none", fontSize: 13 }}>
                    <span style={{ color: T.textSub }}>{r.k}</span>
                    <span style={{ fontWeight: 800, fontFamily: FONT.display, color: r.c }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}