// Kartu satu waktu makan (sarapan/siang/malam)
// Berisi daftar NutritionCard, mengikuti design system yang ada

import NutritionCard from './NutritionCard'

const MEAL_META = {
  breakfast: { label: 'Sarapan',     emoji: '🌅', topBorder: 'border-t-amber-400',  badge: 'bg-amber-50 text-amber-700'   },
  lunch:     { label: 'Makan Siang', emoji: '☀️',  topBorder: 'border-t-green-400',  badge: 'bg-green-50 text-green-700'   },
  dinner:    { label: 'Makan Malam', emoji: '🌙',  topBorder: 'border-t-blue-400',   badge: 'bg-blue-50 text-blue-700'     },
  snack:     { label: 'Camilan',     emoji: '🍎',  topBorder: 'border-t-purple-400', badge: 'bg-purple-50 text-purple-700' },
}

export default function MealCard({
  mealType,
  items     = [],
  onDelete,       
  className = '',
}) {
  const meta          = MEAL_META[mealType] || MEAL_META.breakfast
  const totalCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0)

  return (
    <div className={`bg-white border border-stone-200 border-t-4 ${meta.topBorder} rounded-2xl shadow-sm overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{meta.emoji}</span>
          <p className="text-sm font-semibold text-stone-800">{meta.label}</p>
          <span className="text-xs text-stone-400">·  {items.length} item</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
          {totalCalories} kcal
        </span>
      </div>

      {/* Daftar makanan */}
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4 italic">Belum ada makanan</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <NutritionCard
                key={item.id || i}
                foodName={item.food_name}
                quantityG={item.quantity_g}
                calories={item.calories}
                proteinG={item.protein_g || 0}
                carbsG={item.carbs_g    || 0}
                fatG={item.fat_g        || 0}
                onDelete={onDelete ? () => onDelete(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}