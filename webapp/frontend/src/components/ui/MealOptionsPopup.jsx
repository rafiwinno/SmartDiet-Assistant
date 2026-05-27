import { useState } from 'react'
import { chooseMealOption } from '../../services/api'

const MEAL_META = {
  breakfast: { label: 'Sarapan',     icon: '🌅', header: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700'   },
  lunch:     { label: 'Makan Siang', icon: '☀️',  header: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'     },
  dinner:    { label: 'Makan Malam', icon: '🌙', header: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
}

function toTitle(str) {
  return (str || 'Unknown').replace(/\b\w/g, c => c.toUpperCase())
}

function FoodItem({ item }) {
  const g   = parseFloat(item.recommended_grams) || 0
  const cal = parseFloat(item.estimated_calories) || 0
  const p   = ((parseFloat(item.protein_per_100g) || 0) * g / 100).toFixed(1)
  const c   = ((parseFloat(item.carbs_per_100g)   || 0) * g / 100).toFixed(1)
  const f   = ((parseFloat(item.fat_per_100g)     || 0) * g / 100).toFixed(1)
  const hasNut = parseFloat(item.protein_per_100g) > 0 ||
                 parseFloat(item.fat_per_100g)     > 0 ||
                 parseFloat(item.carbs_per_100g)   > 0

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-stone-100 first:border-t-0">
      {/* Kiri: nama + makro — flex-1 agar mengisi sisa ruang */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 line-clamp-1 leading-snug">
          {toTitle(item.food)}
        </p>
        <p className="text-xs text-stone-400 mt-0.5 leading-snug">
          {hasNut ? `P ${p}g · K ${c}g · L ${f}g` : 'Nutrisi tidak tersedia'}
        </p>
      </div>

      {/* Kanan: porsi + kalori — lebar tetap 64px, tidak bisa mengecil */}
      <div className="w-16 shrink-0 text-right">
        <p className="text-sm font-semibold text-stone-700 leading-snug">
          {g > 0 ? `${g}g` : '—'}
        </p>
        <p className="text-xs text-stone-400 mt-0.5 leading-snug">
          {cal > 0 ? `${Math.round(cal)} kcal` : '—'}
        </p>
      </div>
    </div>
  )
}

function MealSection({ type, items }) {
  // DEFAULT: collapsed — user buka sendiri
  const [open, setOpen] = useState(false)
  const { label, icon, header, border, badge } = MEAL_META[type]
  const totalCal = Math.round(
    items.reduce((s, i) => s + (parseFloat(i.estimated_calories) || 0), 0)
  )

  return (
    <div className={`rounded-xl border ${border} overflow-hidden`}>
      {/* Header — bisa diklik */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${header} cursor-pointer`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-base leading-none">{icon}</span>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
            {label}
          </span>
          <span className="text-xs font-medium text-stone-600 truncate">
            {totalCal > 0 ? `${totalCal} kcal` : '—'} · {items.length} menu
          </span>
        </div>
        <span className="text-stone-400 text-xs shrink-0 ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {/* Daftar makanan */}
      {open && (
        <div className="bg-white">
          {items.length === 0
            ? <p className="text-xs text-stone-400 px-4 py-3">Tidak ada data.</p>
            : items.map((item, i) => <FoodItem key={i} item={item} />)
          }
        </div>
      )}
    </div>
  )
}

export default function MealOptionsPopup({ sessionId, options, onClose, onChosen }) {
  const [activeTab, setActiveTab] = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const opt = options[activeTab]

  const handleChoose = async () => {
    setLoading(true)
    setError('')
    try {
      await chooseMealOption(sessionId, opt.option_number, {
        breakfast: opt.breakfast,
        lunch:     opt.lunch,
        dinner:    opt.dinner,
      })
      onChosen(opt)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? 'Gagal menyimpan pilihan.' : (d || 'Gagal menyimpan pilihan.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header popup */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-stone-800">Pilih Menu Hari Ini 🍽️</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-stone-400">
            AI menyiapkan 3 pilihan menu berdasarkan target nutrisimu.
          </p>

          {/* Tab 3 opsi */}
          <div className="flex gap-2 mt-3">
            {options.map((o, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold
                  transition-all cursor-pointer
                  ${activeTab === i
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                  }`}
              >
                Opsi {i + 1}
                <span className="block font-normal opacity-80 mt-0.5">
                  {Math.round(parseFloat(o.total_calories) || 0)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Konten — scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
          {['breakfast', 'lunch', 'dinner'].map(type => (
            <MealSection
              key={`${type}-${activeTab}`}
              type={type}
              items={opt[type] || []}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-stone-100 shrink-0">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">
              ⚠️ {error}
            </p>
          )}
          <button
            onClick={handleChoose}
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold
              rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan pilihan...' : `Konfirmasi Opsi ${activeTab + 1}`}
          </button>
          <p className="text-xs text-stone-400 text-center mt-2">
            Menu yang dipilih akan dijadikan panduan makan untuk hari ini.
          </p>
        </div>

      </div>
    </div>
  )
}