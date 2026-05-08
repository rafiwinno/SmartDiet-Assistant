const MACRO_CONFIG = {
  protein: {
    label: "Protein",
    unit: "g",
    bar: "bg-orange-500",
    border: "border-t-orange-500",
  },
  carbs: {
    label: "Karbo",
    unit: "g",
    bar: "bg-amber-500",
    border: "border-t-amber-500",
  },
  fat: {
    label: "Lemak",
    unit: "g",
    bar: "bg-blue-500",
    border: "border-t-blue-500",
  },
};

export default function MacroCard({
  type = "protein",
  consumed = 0,
  target = 100,
}) {
  const { label, unit, bar, border, icon } = MACRO_CONFIG[type];
  const pct = Math.min(Math.round((consumed / target) * 100), 100);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-stone-200 border-t-4 ${border} p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-stone-800 leading-none">
        {consumed}
        <span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-stone-400 mt-1">
        Target {target}
        {unit}
      </p>
      <div className="h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-stone-400 mt-1.5 text-right">{pct}%</p>
    </div>
  );
}
