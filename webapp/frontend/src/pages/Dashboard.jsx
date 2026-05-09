import { useState } from 'react'
import Card        from '../components/ui/Card'
import Button      from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'

// ─── Local sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
      {children}
    </p>
  )
}

function CalorieRing({ consumed, target }) {
  const radius        = 48
  const circumference = 2 * Math.PI * radius
  const progress      = Math.min(consumed / target, 1)
  const offset        = circumference - progress * circumference
  const remaining     = Math.max(target - consumed, 0)
  const pct           = Math.round(progress * 100)

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-5">
        Ringkasan harian
      </p>
      <div className="flex items-center gap-8">
        <div className="relative shrink-0" style={{ width: 112, height: 112 }}>
          <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="9" />
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#16a34a" strokeWidth="9"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold leading-none text-stone-800">{consumed}</span>
            <span className="text-xs text-stone-400 mt-1">kcal</span>
            <span className="text-xs font-medium text-green-600 mt-0.5">{pct}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {[
            { label: 'Target harian', value: target,    color: 'text-stone-800' },
            { label: 'Dikonsumsi',    value: consumed,  color: 'text-green-600' },
            { label: 'Sisa',          value: remaining, color: 'text-stone-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-stone-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>
                {value} <span className="font-normal text-stone-400 text-xs">kcal</span>
              </span>
            </div>
          ))}
          <ProgressBar value={consumed} max={target} color="#16a34a" />
        </div>
      </div>
    </Card>
  )
}

const MACRO_CONFIG = {
  protein: { label: 'Protein', unit: 'g', color: '#ea580c', border: 'border-t-orange-500' },
  carbs:   { label: 'Karbo',   unit: 'g', color: '#d97706', border: 'border-t-amber-500'  },
  fat:     { label: 'Lemak',   unit: 'g', color: '#2563eb', border: 'border-t-blue-500'   },
}

function MacroCard({ type, consumed, target }) {
  const { label, unit, color, border } = MACRO_CONFIG[type]
  const pct = Math.min(Math.round((consumed / target) * 100), 100)

  return (
    <Card className={`border-t-4 ${border}`}>
      <p className="text-xs font-medium text-stone-400 mb-3">{label}</p>
      <p className="text-2xl font-semibold text-stone-800 leading-none">
        {consumed}
        <span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-stone-400 mt-1">Target {target}{unit}</p>
      <ProgressBar value={consumed} max={target} color={color} className="mt-3" />
      <p className="text-xs text-stone-400 mt-1.5 text-right">{pct}%</p>
    </Card>
  )
}

const MEAL_META = {
  breakfast: { label: 'Sarapan',     color: 'bg-amber-100 text-amber-700'   },
  lunch:     { label: 'Makan Siang', color: 'bg-green-100 text-green-700'   },
  snack:     { label: 'Camilan',     color: 'bg-blue-100 text-blue-700'     },
  dinner:    { label: 'Makan Malam', color: 'bg-purple-100 text-purple-700' },
}

function MealList({ meals, onAddMeal }) {
  const total = meals.reduce((sum, m) => sum + m.kcal, 0)

  return (
    <Card padding={false}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div>
          <p className="text-sm font-semibold text-stone-800">Makanan hari ini</p>
          <p className="text-xs text-stone-400 mt-0.5">{meals.length} item tercatat</p>
        </div>
        <span className="text-sm font-semibold text-stone-700">{total} kcal</span>
      </div>
      {meals.length === 0 && (
        <p className="px-5 py-4 text-sm text-stone-400">Belum ada makanan yang dicatat.</p>
      )}
      {meals.map((meal, i) => {
        const meta = MEAL_META[meal.type] ?? { label: meal.type, color: 'bg-stone-100 text-stone-600' }
        return (
          <div key={i} className={`flex items-center gap-3 px-5 py-3.5 ${i < meals.length - 1 ? 'border-b border-stone-100' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${meta.color}`}>
              {meta.label.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">{meta.label}</p>
              <p className="text-xs text-stone-400 truncate mt-0.5">{meal.description}</p>
            </div>
            <span className="text-sm font-semibold text-stone-600 shrink-0">
              {meal.kcal} <span className="text-xs font-normal text-stone-400">kcal</span>
            </span>
          </div>
        )
      })}
      <div className="px-5 py-3 border-t border-stone-100">
        <Button variant="ghost" fullWidth onClick={onAddMeal}
          className="border border-dashed border-stone-300">
          + Catat makanan
        </Button>
      </div>
    </Card>
  )
}

function WaterTracker({ glasses, target, onAdd }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-800">Asupan air</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {glasses} dari {target} gelas · {Math.round((glasses / target) * 100)}%
          </p>
        </div>
        <Button variant="secondary" size="sm"
          className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
          onClick={onAdd}>
          + Tambah
        </Button>
      </div>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} className={`flex-1 min-w-6 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all
            ${i < glasses ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-300'}`}>
            {i < glasses ? '●' : '○'}
          </div>
        ))}
      </div>
      <ProgressBar value={glasses} max={target} color="#3b82f6" className="mt-3" />
    </Card>
  )
}

function AIRecommendCard({ recommendation, onViewMenu }) {
  if (!recommendation) return null
  return (
    <div className="bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-2xl px-5 py-4 flex items-start gap-3">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-green-100 text-lg">
        ✦
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-green-900 mb-1">Rekomendasi AI</p>
        <p className="text-sm text-green-800 leading-relaxed">{recommendation}</p>
        <Button variant="ghost" size="sm" onClick={onViewMenu}
          className="mt-1.5 text-green-700 hover:text-green-900 underline underline-offset-2 px-0">
          Lihat menu lengkap →
        </Button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard({
  userName       = 'Popon',
  calories       = { consumed: 1480, target: 2000 },
  macros         = {
    protein: { consumed: 72,  target: 120 },
    carbs:   { consumed: 190, target: 250 },
    fat:     { consumed: 38,  target: 65  },
  },
  meals          = [
    { type: 'breakfast', description: 'Oatmeal, pisang, telur rebus',   kcal: 420 },
    { type: 'lunch',     description: 'Nasi ayam, sayur bening, tempe', kcal: 680 },
    { type: 'snack',     description: 'Yogurt, kacang campur',          kcal: 380 },
  ],
  water          = { glasses: 5, target: 8 },
  recommendation = 'Kamu masih butuh 520 kcal dan 48 g protein. Kami sarankan ikan bakar dengan sayuran kukus dan nasi merah.',
  onAddMeal      = () => {},
  onAddWater     = () => {},
  onViewMenu     = () => {},
}) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium text-stone-800">Selamat pagi, {userName}!</h1>
        <p className="text-sm text-stone-400 mt-0.5 capitalize">{today}</p>
      </div>

      <div>
        <SectionLabel>Ringkasan harian</SectionLabel>
        <CalorieRing consumed={calories.consumed} target={calories.target} />
      </div>

      <div>
        <SectionLabel>Makronutrien</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          <MacroCard type="protein" consumed={macros.protein.consumed} target={macros.protein.target} />
          <MacroCard type="carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
          <MacroCard type="fat"     consumed={macros.fat.consumed}     target={macros.fat.target}     />
        </div>
      </div>

      <div>
        <SectionLabel>Makanan hari ini</SectionLabel>
        <MealList meals={meals} onAddMeal={onAddMeal} />
      </div>

      <div>
        <SectionLabel>Asupan air</SectionLabel>
        <WaterTracker glasses={water.glasses} target={water.target} onAdd={onAddWater} />
      </div>

      <div>
        <SectionLabel>Rekomendasi AI</SectionLabel>
        <AIRecommendCard recommendation={recommendation} onViewMenu={onViewMenu} />
      </div>
    </div>
  )
}