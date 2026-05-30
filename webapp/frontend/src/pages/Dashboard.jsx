import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Card                    from '../components/ui/Card'
import Button                  from '../components/ui/Button'
import { getCurrentUser, getDashboardData, completeDay, getMealOptions, getMealHistory } from '../services/api'
import MealOptionsPopup from '../components/ui/MealOptionsPopup'


// ─── Local sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
      {children}
    </p>
  )
}

function CalorieTarget({ calories, macros }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-5">
        Target harian
      </p>
      <div className="flex items-center gap-8">
        <div
          className="relative shrink-0 rounded-full flex flex-col items-center justify-center bg-stone-50 border-4 border-blue-500"
          style={{ width: 112, height: 112 }}
        >
          <span className="text-2xl font-semibold leading-none text-stone-800">
            {calories}
          </span>
          <span className="text-xs text-stone-400 mt-1">kcal / hari</span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {[
            { label: 'Protein', value: macros.protein, unit: 'g', color: 'text-orange-500' },
            { label: 'Karbo',   value: macros.carbs,   unit: 'g', color: 'text-amber-500'  },
            { label: 'Lemak',   value: macros.fat,     unit: 'g', color: 'text-blue-500'   },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-stone-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>
                {value}
                <span className="font-normal text-stone-400 text-xs ml-1">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function DailyProgress({ plan }) {
  const currentDay  = plan.days_elapsed ?? 0
  const totalDays   = plan.estimated_days || plan.total_days || 30
  const streak      = plan.current_streak

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-1">
            Progres Harian
          </p>
          <p className="text-2xl font-semibold text-stone-800 leading-none">
            Hari ke-{currentDay + 1}
            <span className="text-base font-normal text-stone-400 ml-1">
              dari {totalDays}
            </span>
          </p>
          <p className="text-xs text-stone-400 mt-1.5">
            {totalDays - currentDay} hari tersisa untuk mencapai target
          </p>
          {streak > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1
              bg-blue-100 border border-blue-500 rounded-full">
              <span className="text-blue-600 text-xs font-semibold">
                Streak {streak} hari 🔥
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mt-4 flex-wrap">
        {Array.from({ length: totalDays }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full min-w-1 transition-all
              ${i < currentDay   ? 'bg-blue-500'
              : i === currentDay ? 'bg-blue-200'
              :                    'bg-stone-100'}`}
          />
        ))}
      </div>
    </Card>
  )
}

const MEAL_TYPES  = { breakfast: 'Sarapan', lunch: 'Makan Siang', dinner: 'Makan Malam' }
const MEAL_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }
const MEAL_COLORS = {
  breakfast: { bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'bg-amber-100 text-amber-700'   },
  lunch:     { bg: 'bg-blue-50',  border: 'border-blue-200',  label: 'bg-blue-100 text-blue-700'   },
  dinner:    { bg: 'bg-purple-50', border: 'border-purple-200', label: 'bg-purple-100 text-purple-700' },
}


function MealRecommendCard({ type, items = [], totalCalories }) {
  const [expanded, setExpanded] = useState(false)
  const { bg, border, label }   = MEAL_COLORS[type]

  return (
    <div className={`${bg} border ${border} rounded-xl overflow-hidden transition-all`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer bg-transparent"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{MEAL_ICONS[type]}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${label}`}>
            {MEAL_TYPES[type]}
          </span>
          <span className="text-sm text-stone-500">{totalCalories} kcal</span>
        </div>
        <span className="text-stone-400 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-stone-200">
          {items.map((item, i) => (
            <div key={i}
              className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-none">
              <div>
                <p className="text-sm font-medium text-stone-800">{item.food_name}</p>
                {item.notes && (
                  <p className="text-xs text-stone-400 mt-0.5">{item.notes}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold text-stone-700">{item.quantity_g}g</p>
                <p className="text-xs text-stone-400">{item.calories} kcal</p>
              </div>
            </div>
          ))}
          {items.length > 0 && (
            <div className="flex gap-4 pt-1">
              {[
                { label: 'P', value: items.reduce((s, i) => s + (i.protein_g ?? 0), 0).toFixed(1), color: 'text-orange-500' },
                { label: 'C', value: items.reduce((s, i) => s + (i.carbs_g   ?? 0), 0).toFixed(1), color: 'text-amber-500'  },
                { label: 'F', value: items.reduce((s, i) => s + (i.fat_g     ?? 0), 0).toFixed(1), color: 'text-blue-500'   },
              ].map(({ label, value, color }) => (
                <span key={label} className="text-xs text-stone-400">
                  {label} <span className={`font-semibold ${color}`}>{value}g</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100
        flex items-center justify-center text-3xl mb-5">
        🥗
      </div>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">
        Mulai perjalanan diet-mu
      </h2>
      <p className="text-sm text-stone-400 mb-8 max-w-xs leading-relaxed">
        Buat plan pertamamu untuk mendapatkan rekomendasi menu harian yang dipersonalisasi
      </p>
      <button
        onClick={() => navigate('/planner')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600
          text-white text-sm font-medium rounded-xl transition-all shadow-sm
          hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      >
        Buat Plan Sekarang →
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const user = getCurrentUser()

  const [plan,          setPlan]          = useState(null)
  const [calorieTarget, setCalorieTarget] = useState(null)
  const [macroTargets,  setMacroTargets]  = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [hasActivePlan, setHasActivePlan] = useState(false)
  const [mealPopup,     setMealPopup]     = useState(null)
  const [loadingMeal,   setLoadingMeal]   = useState(false)
  const [todayMeals,    setTodayMeals]    = useState({ breakfast: [], lunch: [], dinner: [] })

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const todayISO = new Date().toISOString().split('T')[0]

  const fetchTodayMeals = async () => {
    const history = await getMealHistory(todayISO)
    if (!history?.logs) return
    const grouped = { breakfast: [], lunch: [], dinner: [] }
    history.logs.forEach(log => {
      if (grouped[log.meal_type]) grouped[log.meal_type].push(log)
    })
    setTodayMeals(grouped)
  }

  useEffect(() => {
    getDashboardData()
      .then(({ plan, profile }) => {
        setPlan(plan)
        setHasActivePlan(true)
        setCalorieTarget(profile.calorie_target ?? 2000)
        if (plan?.protein_target) {
          setMacroTargets({
            protein: plan.protein_target,
            fat:     plan.fat_target,
            carbs:   plan.carbs_target,
          })
        }
        return getMealHistory(todayISO)
      })
      .then(history => {
        if (!history?.logs) return
        const grouped = { breakfast: [], lunch: [], dinner: [] }
        history.logs.forEach(log => {
          if (grouped[log.meal_type]) grouped[log.meal_type].push(log)
        })
        setTodayMeals(grouped)
      })
      .catch(() => {
        setHasActivePlan(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const hasPickedToday   = Object.values(todayMeals).some(arr => arr.length > 0)
  const alreadyDoneToday = plan?.last_completed_date === new Date().toISOString().split('T')[0]

  const [showConfirm, setShowConfirm] = useState(false)
  const [completing,  setCompleting]  = useState(false)
  const [actionError, setActionError] = useState('')

  const handleFinishDay = async () => {
  setCompleting(true)
  setActionError('')
  try {
    const updated = await completeDay()
    setPlan(updated)
    setShowConfirm(false)
  } catch (err) {
    setActionError(err.response?.data?.detail || 'Gagal menyelesaikan hari ini')
  } finally {
    setCompleting(false)
  }
}

  const handleGetRecommendation = async () => {
  setLoadingMeal(true)
  try {
    const data = await getMealOptions()
    setMealPopup({ sessionId: data.session_id, options: data.options })
  } catch (err) {
    console.error('getMealOptions error:', err.response?.data || err.message)
  } finally {
    setLoadingMeal(false)
  }
}

  const currentDay = plan?.days_elapsed ?? 0
  const totalDays  = plan?.estimated_days || 30

const smartButton = alreadyDoneToday
  ? {
      label: 'Selesai ✓',
      disabled: true,
      color:
        'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed',
      onClick: null,
    }
  : hasPickedToday
  ? {
      label: 'Selesai Hari Ini',
      disabled: completing,
      color:
        'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200',
      onClick: () => setShowConfirm(true),
    }
  : {
      label: loadingMeal ? '⏳ Memuat...' : '🍽️ Rekomendasi Menu',
      disabled: loadingMeal,
      color:
        'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md transition-all duration-200',
      onClick: handleGetRecommendation,
    }



  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-stone-400">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-stone-800">
          Selamat datang, {user?.name}!
        </h1>
        <p className="text-sm text-stone-400 mt-0.5 capitalize">{today}</p>
      </div>

      {!hasActivePlan ? <EmptyState /> : (
        <>
          <DailyProgress plan={plan} />

          <button
            onClick={smartButton.onClick}
            disabled={smartButton.disabled}
            className={`w-full py-3 rounded-xl text-sm font-semibold
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${smartButton.color}`}
          >
            {smartButton.label}
          </button>

          {actionError && (
            <p className="text-xs text-red-500 -mt-2">{actionError}</p>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <p className="text-base font-semibold text-stone-800 mb-1">
                  Selesaikan hari ini?
                </p>
                <p className="text-sm text-stone-500 mb-5">
                  Kamu akan menandai hari ke-{currentDay + 1} sebagai selesai.
                  Progres akan bertambah menjadi hari ke-{currentDay + 2} dari {totalDays}.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" fullWidth
                    onClick={() => setShowConfirm(false)}
                    disabled={completing}>
                    Batal
                  </Button>
                  <Button fullWidth onClick={handleFinishDay} disabled={completing}>
                    {completing ? 'Menyimpan...' : 'Ya, selesai'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {calorieTarget && macroTargets && (
            <div>
              <SectionLabel>Target nutrisi</SectionLabel>
              <CalorieTarget
                calories={calorieTarget}
                macros={macroTargets}
              />
            </div>
          )}

          <div>
            <SectionLabel>Rekomendasi menu hari ini ✦</SectionLabel>
            <p className="text-xs text-stone-400 mb-3">
              {Object.values(todayMeals).every(arr => arr.length === 0)
                ? 'Belum ada menu dipilih untuk hari ini'
                : 'Menu yang kamu pilih untuk hari ini'}
            </p>
            <div className="flex flex-col gap-3">
              {['breakfast', 'lunch', 'dinner'].map(type => (
                <MealRecommendCard
                  key={type}
                  type={type}
                  items={todayMeals[type] ?? []}
                  totalCalories={(todayMeals[type] ?? []).reduce((s, i) => s + (i.calories || 0), 0)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Popup rekomendasi menu */}
      {mealPopup && (
        <MealOptionsPopup
          sessionId={mealPopup.sessionId}
          options={mealPopup.options}
          onClose={() => setMealPopup(null)}
          onChosen={async () => {
            setMealPopup(null)
            await fetchTodayMeals()
          }}
          forToday={true}
        />
      )}
    </div>
  )
}