export default function CalorieRing({ consumed = 0, target = 2000 }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const offset = circumference - progress * circumference;
  const remaining = Math.max(target - consumed, 0);
  const pct = Math.round(progress * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-5">
        Ringkasan harian
      </p>
      <div className="flex items-center gap-8">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: 112, height: 112 }}>
          <svg
            width="112"
            height="112"
            viewBox="0 0 112 112"
            className="-rotate-90"
          >
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#e7e5e4"
              strokeWidth="9"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#16a34a"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold leading-none text-stone-800">
              {consumed}
            </span>
            <span className="text-xs text-stone-400 mt-1">kcal</span>
            <span className="text-xs font-medium text-green-600 mt-0.5">
              {pct}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4 flex-1">
          {[
            {
              label: "Target harian",
              value: target,
              unit: "kcal",
              color: "text-stone-800",
            },
            {
              label: "Dikonsumsi",
              value: consumed,
              unit: "kcal",
              color: "text-green-600",
            },
            {
              label: "Sisa",
              value: remaining,
              unit: "kcal",
              color: "text-stone-800",
            },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-stone-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>
                {value}{" "}
                <span className="font-normal text-stone-400 text-xs">
                  {unit}
                </span>
              </span>
            </div>
          ))}
          {/* Progress bar */}
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
