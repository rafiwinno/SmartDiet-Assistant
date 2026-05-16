import { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getCurrentUser } from "../services/api";

// ─── Local sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
      {children}
    </p>
  );
}

function CalorieTarget({ calories, macros }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-5">
        Target harian
      </p>
      <div className="flex items-center gap-8">
        {/* Calorie circle — static display */}
        <div
          className="relative shrink-0 rounded-full flex flex-col items-center justify-center bg-stone-50 border-4 border-green-500"
          style={{ width: 112, height: 112 }}
        >
          <span className="text-2xl font-semibold leading-none text-stone-800">
            {calories}
          </span>
          <span className="text-xs text-stone-400 mt-1">kcal / hari</span>
        </div>

        {/* Macro targets */}
        <div className="flex flex-col gap-3 flex-1">
          {[
            {
              label: "Protein",
              value: macros.protein,
              unit: "g",
              color: "text-orange-500",
            },
            {
              label: "Karbo",
              value: macros.carbs,
              unit: "g",
              color: "text-amber-500",
            },
            {
              label: "Lemak",
              value: macros.fat,
              unit: "g",
              color: "text-blue-500",
            },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-stone-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>
                {value}
                <span className="font-normal text-stone-400 text-xs ml-1">
                  {unit}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DailyProgress({ currentDay, totalDays, currentStreak, onFinishDay }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-1">
              Progres Harian
            </p>
            <p className="text-2xl font-semibold text-stone-800 leading-none">
              Hari ke-{currentDay}
              <span className="text-base font-normal text-stone-400 ml-1">
                dari {totalDays}
              </span>
            </p>
            <p className="text-xs text-stone-400 mt-1.5">
              {totalDays - currentDay} hari tersisa untuk mencapai target
            </p>

            {/* Streak badge */}
            {currentStreak > 0 && (
              <div
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1
                bg-emerald-100 border border-emerald-500 rounded-full"
              >
                <span className="text-emerald-500 text-xs font-semibold">
                  Streak {currentStreak} Hari 🔥🔥🔥
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={currentDay >= totalDays}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600
              hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all cursor-pointer"
          >
            Selesai Hari Ini
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mt-4 flex-wrap">
          {Array.from({ length: totalDays }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full min-w-1 transition-all
                ${
                  i < currentDay
                    ? "bg-green-500"
                    : i === currentDay
                      ? "bg-green-200"
                      : "bg-stone-100"
                }`}
            />
          ))}
        </div>
      </Card>

      {/* Confirm modal — unchanged */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <p className="text-base font-semibold text-stone-800 mb-1">
              Selesaikan hari ini?
            </p>
            <p className="text-sm text-stone-500 mb-5">
              Kamu akan menandai hari ke-{currentDay + 1} sebagai selesai.
              Progres akan bertambah menjadi hari ke-{currentDay + 1} dari{" "}
              {totalDays}.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  onFinishDay();
                  setShowConfirm(false);
                }}
              >
                Ya, selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const MEAL_TYPES = {
  breakfast: "Sarapan",
  lunch: "Makan Siang",
  dinner: "Makan Malam",
};

const MEAL_COLORS = {
  breakfast: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "bg-amber-100 text-amber-700",
  },
  lunch: {
    bg: "bg-green-50",
    border: "border-green-200",
    label: "bg-green-100 text-green-700",
  },
  dinner: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "bg-purple-100 text-purple-700",
  },
};

function MealRecommendCard({ type, items = [], totalCalories }) {
  const [expanded, setExpanded] = useState(false);
  const { bg, border, label } = MEAL_COLORS[type];

  return (
    <div
      className={`${bg} border ${border} rounded-xl overflow-hidden transition-all`}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer bg-transparent"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${label}`}
          >
            {MEAL_TYPES[type]}
          </span>
          <span className="text-sm text-stone-500">{totalCalories} kcal</span>
        </div>
        <span className="text-stone-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 pb-4 flex flex-col gap-2 border-t border-opacity-50"
          style={{ borderColor: "inherit" }}
        >
          {items.length === 0 ? (
            <p className="text-sm text-stone-400 pt-3">
              Rekomendasi AI belum tersedia.
            </p>
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-none"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    {item.food_name}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-stone-700">
                    {item.quantity_g}g
                  </p>
                  <p className="text-xs text-stone-400">{item.calories} kcal</p>
                </div>
              </div>
            ))
          )}

          {/* Macro summary row */}
          {items.length > 0 && (
            <div className="flex gap-4 pt-1">
              {[
                {
                  label: "P",
                  value: items
                    .reduce((s, i) => s + (i.protein_g ?? 0), 0)
                    .toFixed(1),
                  color: "text-orange-500",
                },
                {
                  label: "C",
                  value: items
                    .reduce((s, i) => s + (i.carbs_g ?? 0), 0)
                    .toFixed(1),
                  color: "text-amber-500",
                },
                {
                  label: "F",
                  value: items
                    .reduce((s, i) => s + (i.fat_g ?? 0), 0)
                    .toFixed(1),
                  color: "text-blue-500",
                },
              ].map(({ label, value, color }) => (
                <span key={label} className="text-xs text-stone-400">
                  {label}{" "}
                  <span className={`font-semibold ${color}`}>{value}g</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WaterTracker({ glasses, target, onAdd }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-800">Asupan air</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {glasses} dari {target} gelas ·{" "}
            {Math.round((glasses / target) * 100)}%
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
          onClick={onAdd}
        >
          + Tambah
        </Button>
      </div>
      <div className="flex gap-1.5 mt-1 flex-wrap">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 min-w-6 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all
              ${i < glasses ? "bg-blue-500 text-white" : "bg-stone-100 text-stone-300"}`}
          >
            {i < glasses ? "●" : "○"}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({
  user = getCurrentUser(),
  currentDay = 3,
  totalDays = 41,
  calorieTarget = 2000,
  macroTargets = { protein: 120, carbs: 250, fat: 65 },
  recommendations = {
    breakfast: {
      totalCalories: 480,
      items: [
        {
          food_name: "Oatmeal",
          quantity_g: 80,
          calories: 296,
          protein_g: 10.6,
          carbs_g: 53.6,
          fat_g: 5.6,
        },
        {
          food_name: "Telur rebus",
          quantity_g: 100,
          calories: 155,
          protein_g: 13,
          carbs_g: 1.1,
          fat_g: 11,
        },
        {
          food_name: "Pisang",
          quantity_g: 100,
          calories: 89,
          protein_g: 1.1,
          carbs_g: 23,
          fat_g: 0.3,
        },
      ],
    },
    lunch: {
      totalCalories: 650,
      items: [
        {
          food_name: "Nasi merah",
          quantity_g: 150,
          calories: 165,
          protein_g: 3.8,
          carbs_g: 35,
          fat_g: 1.3,
        },
        {
          food_name: "Ayam panggang",
          quantity_g: 200,
          calories: 330,
          protein_g: 56,
          carbs_g: 0,
          fat_g: 9,
        },
        {
          food_name: "Sayur tumis",
          quantity_g: 100,
          calories: 55,
          protein_g: 2,
          carbs_g: 8,
          fat_g: 2,
        },
        {
          food_name: "Tempe goreng",
          quantity_g: 50,
          calories: 100,
          protein_g: 9.5,
          carbs_g: 8,
          fat_g: 3.8,
        },
      ],
    },
    dinner: {
      totalCalories: 520,
      items: [
        {
          food_name: "Ikan bakar",
          quantity_g: 200,
          calories: 220,
          protein_g: 44,
          carbs_g: 0,
          fat_g: 4,
        },
        {
          food_name: "Nasi merah",
          quantity_g: 100,
          calories: 110,
          protein_g: 2.5,
          carbs_g: 23,
          fat_g: 0.9,
        },
        {
          food_name: "Brokoli kukus",
          quantity_g: 150,
          calories: 51,
          protein_g: 4.5,
          carbs_g: 9,
          fat_g: 0.5,
        },
        {
          food_name: "Tahu goreng",
          quantity_g: 100,
          calories: 139,
          protein_g: 9.5,
          carbs_g: 3.9,
          fat_g: 9.9,
        },
      ],
    },
  },
  water = { glasses: 5, target: 8 },
  onFinishDay = () => {},
  onAddWater = () => {},
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
          Selamat datang, {user.name}!
        </h1>
        <p className="text-sm text-stone-400 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Daily progress */}
      <DailyProgress
        currentDay={currentDay}
        totalDays={totalDays}
        currentStreak={3}
        onFinishDay={onFinishDay}
      />

      {/* Calorie & macro targets */}
      <div>
        <SectionLabel>Target nutrisi</SectionLabel>
        <CalorieTarget calories={calorieTarget} macros={macroTargets} />
      </div>

      {/* AI meal recommendations */}
      <div>
        <SectionLabel>Rekomendasi menu hari ini ✦</SectionLabel>
        <div className="flex flex-col gap-3">
          {["breakfast", "lunch", "dinner"].map((type) => (
            <MealRecommendCard
              key={type}
              type={type}
              items={recommendations[type]?.items ?? []}
              totalCalories={recommendations[type]?.totalCalories ?? 0}
            />
          ))}
        </div>
      </div>

      {/* Water tracker
      <div>
        <SectionLabel>Asupan air</SectionLabel>
        <WaterTracker
          glasses={water.glasses}
          target={water.target}
          onAdd={onAddWater}
        />
      </div> */}
    </div>
  );
}
