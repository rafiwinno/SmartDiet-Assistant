
export const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS = {
  sedentary:   'Tidak aktif',
  light:       'Aktivitas ringan',
  moderate:    'Aktivitas sedang',
  active:      'Aktivitas tinggi',
  very_active: 'Sangat aktif',
}

export const GOAL_LABELS = {
  lose:     'Turunkan berat badan',
  maintain: 'Pertahankan berat',
  gain:     'Naikkan berat badan',
}

// Distribusi makro per goal (% dari total kalori)
const MACRO_DIST = {
  lose:     { protein: 0.35, carbs: 0.40, fat: 0.25 },
  maintain: { protein: 0.25, carbs: 0.50, fat: 0.25 },
  gain:     { protein: 0.30, carbs: 0.50, fat: 0.20 },
}


 // Hitung target makro (gram) dari calorie_target dan goal
 
export function calcMacroTargets(calorieTarget, goal) {
  const dist = MACRO_DIST[goal] || MACRO_DIST.maintain
  return {
    protein: Math.round((calorieTarget * dist.protein) / 4),
    carbs:   Math.round((calorieTarget * dist.carbs)   / 4),
    fat:     Math.round((calorieTarget * dist.fat)     / 9),
  }
}

// Warna untuk setiap makro (dipakai di chart)
export const MACRO_COLORS = {
  protein: '#ea580c',
  carbs:   '#d97706',
  fat:     '#2563eb',
}

// Kategori makanan untuk filter di NutritionDetail
export const FOOD_CATEGORIES = [
  { value: '',          label: 'Semua' },
  { value: 'grains',    label: 'Karbohidrat' },
  { value: 'protein',   label: 'Protein' },
  { value: 'vegetable', label: 'Sayuran' },
  { value: 'fruit',     label: 'Buah' },
  { value: 'dairy',     label: 'Susu & Dairy' },
  { value: 'snack',     label: 'Camilan' },
]