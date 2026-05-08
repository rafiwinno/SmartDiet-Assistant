import CalorieRing from "../components/dashboard/CalorieRing";
import MacroCard from "../components/dashboard/MacroCard";
import MealList from "../components/dashboard/MealList";
import WaterTracker from "../components/dashboard/WaterTracker";
import AIRecommendCard from "../components/dashboard/AIRecommendCard";

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
    {children}
  </p>
);

export default function Dashboard({
  userName = "Popon",
  calories = { consumed: 1480, target: 2000 },
  macros = {
    protein: { consumed: 72, target: 120 },
    carbs: { consumed: 190, target: 250 },
    fat: { consumed: 38, target: 65 },
  },
  meals = [
    {
      type: "breakfast",
      description: "Oatmeal, pisang, telur rebus",
      kcal: 420,
    },
    { type: "lunch", description: "Nasi ayam, sayur bening, tempe", kcal: 680 },
    { type: "snack", description: "Yogurt, kacang campur", kcal: 380 },
  ],
  // water          = { glasses: 5, target: 8 },
  recommendation = "Kamu masih butuh 520 kcal dan 48 g protein. Kami sarankan ikan bakar dengan sayuran kukus dan nasi merah.",
  onAddMeal = () => {},
  onAddWater = () => {},
  onViewMenu = () => {},
}) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-stone-800">
          Selamat pagi, {userName}!
        </h1>
        <p className="text-sm text-stone-400 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Calories */}
      <div>
        <SectionLabel>Ringkasan harian</SectionLabel>
        <CalorieRing consumed={calories.consumed} target={calories.target} />
      </div>

      {/* Macros */}
      <div>
        <SectionLabel>Makronutrien</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          <MacroCard
            type="protein"
            consumed={macros.protein.consumed}
            target={macros.protein.target}
          />
          <MacroCard
            type="carbs"
            consumed={macros.carbs.consumed}
            target={macros.carbs.target}
          />
          <MacroCard
            type="fat"
            consumed={macros.fat.consumed}
            target={macros.fat.target}
          />
        </div>
      </div>

      {/* Meals */}
      <div>
        <SectionLabel>Makanan hari ini</SectionLabel>
        <MealList meals={meals} onAddMeal={onAddMeal} />
      </div>

      {/* Water */}
      {/* <div>
        <SectionLabel>Asupan air</SectionLabel>
        <WaterTracker glasses={water.glasses} target={water.target} onAdd={onAddWater} />
      </div> */}

      {/* AI Recommendation */}
      <div>
        <SectionLabel>Rekomendasi AI</SectionLabel>
        <AIRecommendCard
          recommendation={recommendation}
          onViewMenu={onViewMenu}
        />
      </div>
    </div>
  );
}
