const TOTAL_CUPS = 8;

export default function WaterTracker({ glasses = 0, target = 8, onAdd }) {
  const pct = Math.round((glasses / target) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-800">Asupan air</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {glasses} dari {target} gelas · {pct}%
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-3.5 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          + Tambah
        </button>
      </div>

      {/* Cup grid */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {Array.from({ length: TOTAL_CUPS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 min-w-6 h-7 rounded-md flex items-center justify-center text-sm transition-all
              ${
                i < glasses
                  ? "bg-blue-500 text-white"
                  : "bg-stone-100 text-stone-300"
              }`}
          >
            💧
          </div>
        ))}
      </div>

      <div className="h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
