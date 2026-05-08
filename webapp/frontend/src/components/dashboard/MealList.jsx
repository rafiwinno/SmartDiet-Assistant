const MEAL_META = {
  breakfast: { label: "Sarapan", color: "bg-amber-100 text-amber-700" },
  lunch: { label: "Makan Siang", color: "bg-green-100 text-green-700" },
  snack: { label: "Camilan", color: "bg-blue-100 text-blue-700" },
  dinner: { label: "Makan Malam", color: "bg-purple-100 text-purple-700" },
};

export default function MealList({ meals = [], onAddMeal }) {
  const total = meals.reduce((sum, m) => sum + m.kcal, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div>
          <p className="text-sm font-semibold text-stone-800">
            Makanan hari ini
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {meals.length} item tercatat
          </p>
        </div>
        <span className="text-sm font-semibold text-stone-700">
          {total} kcal
        </span>
      </div>

      {/* Meal rows */}
      {meals.length === 0 && (
        <p className="px-5 py-4 text-sm text-stone-400">
          Belum ada makanan yang dicatat.
        </p>
      )}
      {meals.map((meal, i) => {
        const meta = MEAL_META[meal.type] ?? {
          label: meal.type,
          color: "bg-stone-100 text-stone-600",
        };
        return (
          <div
            key={i}
            className={`flex items-center gap-3 px-5 py-3.5 ${i < meals.length - 1 ? "border-b border-stone-100" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.color}`}
            >
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">{meta.label}</p>
              <p className="text-xs text-stone-400 truncate mt-0.5">
                {meal.description}
              </p>
            </div>
            <span className="text-sm font-semibold text-stone-600 shrink-0">
              {meal.kcal}{" "}
              <span className="text-xs font-normal text-stone-400">kcal</span>
            </span>
          </div>
        );
      })}

      {/* Add button */}
      <div className="px-5 py-3 border-t border-stone-100">
        <button
          onClick={onAddMeal}
          className="w-full py-2 text-sm text-stone-400 border border-dashed border-stone-300 rounded-lg hover:bg-stone-50 hover:text-stone-600 transition-colors cursor-pointer bg-transparent"
        >
          + Catat makanan
        </button>
      </div>
    </div>
  );
}
