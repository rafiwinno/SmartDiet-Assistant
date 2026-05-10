// Halaman pencarian & detail nutrisi makanan dari dataset
// Menggunakan recharts (package.json) untuk visualisasi

import { useState, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import Card        from '../components/ui/Card'
import Button      from '../components/ui/Button'
import TextInput   from '../components/ui/TextInput'
import Badge       from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import ToggleGroup from '../components/ui/ToggleGroup'
import { searchFoods, logMeal } from '../services/api'
import { FOOD_CATEGORIES, MACRO_COLORS } from '../constants/nutrition'

// Warna kategori untuk badge
const CAT_BADGE = {
  grains:    'amber',
  protein:   'green',
  vegetable: 'green',
  fruit:     'blue',
  dairy:     'stone',
  snack:     'red',
}

// Label kategori
const CAT_LABEL = {
  grains:    'Karbohidrat',
  protein:   'Protein',
  vegetable: 'Sayuran',
  fruit:     'Buah',
  dairy:     'Dairy',
  snack:     'Camilan',
}

// ─── Panel detail satu makanan ────────────────────────────────────────────────
function FoodDetailPanel({ food, onClose, onLog }) {
  const [qty,      setQty]      = useState(food.serving_size_g || 100)
  const [mealType, setMealType] = useState('lunch')
  const [logged,   setLogged]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  // Hitung nutrisi berdasarkan qty yang diinput
  const factor   = qty / 100
  const calories = Math.round(food.calories_per_100g * factor)
  const protein  = +(food.protein_g * factor).toFixed(1)
  const carbs    = +(food.carbs_g   * factor).toFixed(1)
  const fat      = +(food.fat_g     * factor).toFixed(1)

  // Data untuk radar chart
  const radarData = [
    { subject: 'Protein', value: Math.round((food.protein_g / 30) * 100) },
    { subject: 'Karbo',   value: Math.round((food.carbs_g   / 60) * 100) },
    { subject: 'Lemak',   value: Math.round((food.fat_g     / 30) * 100) },
    { subject: 'Serat',   value: Math.round(((food.fiber_g || 0) / 10) * 100) },
    { subject: 'Kalori',  value: Math.round((food.calories_per_100g / 400) * 100) },
  ]

  // Data untuk bar chart
  const barData = [
    { name: 'Protein', gram: protein,  fill: MACRO_COLORS.protein },
    { name: 'Karbo',   gram: carbs,    fill: MACRO_COLORS.carbs   },
    { name: 'Lemak',   gram: fat,      fill: MACRO_COLORS.fat     },
  ]

  const handleLog = async () => {
    setLoading(true)
    try {
      await logMeal({
        food_id:   food.id,
        food_name: food.name,
        meal_type: mealType,
        quantity_g: qty,
        calories,
        protein_g:  protein,
        carbs_g:    carbs,
        fat_g:      fat,
        log_date:   new Date().toISOString().slice(0, 10),
      })
      setLogged(true)
      if (onLog) onLog()
    } catch (err) {
      alert('Gagal mencatat makanan. Pastikan kamu sudah login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-stone-800">{food.name}</h2>
          <Badge variant={CAT_BADGE[food.category] || 'stone'} className="mt-1">
            {CAT_LABEL[food.category] || food.category}
          </Badge>
        </div>
        <button onClick={onClose} className="text-stone-300 hover:text-stone-500 text-xl cursor-pointer">×</button>
      </div>

      {/* Kalori besar */}
      <div className="bg-green-50 rounded-xl p-4 text-center mb-4">
        <p className="text-3xl font-bold text-green-600">{calories}</p>
        <p className="text-xs text-stone-400 mt-1">kcal per {qty}g</p>
      </div>

      {/* Input porsi */}
      <div className="mb-4">
        <p className="text-xs font-medium text-stone-500 mb-1.5">Porsi (gram)</p>
        <TextInput
          type="number"
          value={String(qty)}
          onChange={(v) => setQty(Number(v) || 0)}
          suffix="g"
        />
      </div>

      {/* Progress makro */}
      <div className="mb-4 space-y-2">
        <ProgressBar value={protein} max={50}  color={MACRO_COLORS.protein} className="h-2" />
        <div className="flex justify-between text-xs text-stone-400 -mt-1">
          <span>Protein</span><span>{protein}g</span>
        </div>
        <ProgressBar value={carbs}   max={100} color={MACRO_COLORS.carbs}   className="h-2" />
        <div className="flex justify-between text-xs text-stone-400 -mt-1">
          <span>Karbo</span><span>{carbs}g</span>
        </div>
        <ProgressBar value={fat}     max={50}  color={MACRO_COLORS.fat}     className="h-2" />
        <div className="flex justify-between text-xs text-stone-400 -mt-1">
          <span>Lemak</span><span>{fat}g</span>
        </div>
      </div>

      {/* Radar chart */}
      <div className="mb-4">
        <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">Profil Nutrisi</p>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
            <PolarGrid stroke="#e7e5e4" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#a8a29e' }} />
            <Radar dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Catat ke log */}
      {logged ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
          <p className="text-sm font-semibold text-green-700">✓ Berhasil dicatat!</p>
          <button onClick={() => setLogged(false)} className="text-xs text-green-500 underline mt-1 cursor-pointer">
            Catat lagi
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500">Catat ke waktu makan</p>
          <ToggleGroup
            value={mealType}
            onChange={setMealType}
            options={[
              { value: 'breakfast', label: 'Pagi'  },
              { value: 'lunch',     label: 'Siang' },
              { value: 'dinner',    label: 'Malam' },
              { value: 'snack',     label: 'Snack' },
            ]}
          />
          <Button fullWidth onClick={handleLog} disabled={loading || qty <= 0}>
            {loading ? '⏳ Mencatat...' : '+ Catat Makanan Ini'}
          </Button>
        </div>
      )}
    </Card>
  )
}

// ─── Halaman utama NutritionDetail ───────────────────────────────────────────
export default function NutritionDetail() {
  const [query,        setQuery]        = useState('')
  const [category,     setCategory]     = useState('')
  const [foods,        setFoods]        = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [loading,      setLoading]      = useState(false)

  // Fetch saat pertama kali load dan saat filter berubah
  useEffect(() => {
    const timer = setTimeout(() => { fetchFoods() }, 300) // debounce 300ms
    return () => clearTimeout(timer)
  }, [query, category])

  const fetchFoods = async () => {
    setLoading(true)
    try {
      const data = await searchFoods(query, category)
      setFoods(data.data || [])
    } catch {
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Detail Nutrisi</h1>
        <p className="text-sm text-stone-400 mt-0.5">Cari makanan dan lihat kandungan nutrisinya</p>
      </div>

      <div className="flex gap-6">
        {/* Panel kiri: search + daftar makanan */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Search & filter */}
          <Card>
            <div className="flex flex-col gap-3">
              <TextInput
                value={query}
                onChange={setQuery}
                placeholder="Cari makanan... (contoh: nasi, ayam, pisang)"
              />
              <div className="flex flex-wrap gap-2">
                {FOOD_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer
                      ${category === cat.value
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Daftar makanan */}
          <Card padding={false}>
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">Hasil Pencarian</p>
              <span className="text-xs text-stone-400">
                {loading ? 'Mencari...' : `${foods.length} makanan`}
              </span>
            </div>

            {foods.length === 0 && !loading ? (
              <p className="px-5 py-8 text-sm text-stone-400 text-center">
                {query ? `Tidak ada hasil untuk "${query}"` : 'Ketik nama makanan untuk mencari'}
              </p>
            ) : (
              <div className="divide-y divide-stone-100">
                {foods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-stone-50 transition-colors cursor-pointer
                      ${selectedFood?.id === food.id ? 'bg-green-50' : ''}`}
                  >
                    {/* Ikon kategori */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                      bg-${CAT_BADGE[food.category] || 'stone'}-100 text-${CAT_BADGE[food.category] || 'stone'}-700`}>
                      {food.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{food.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {food.calories_per_100g} kcal/100g ·
                        P {food.protein_g}g · K {food.carbs_g}g · L {food.fat_g}g
                      </p>
                    </div>
                    <Badge variant={CAT_BADGE[food.category] || 'stone'}>
                      {CAT_LABEL[food.category] || food.category}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Panel kanan: detail makanan yang dipilih */}
        {selectedFood && (
          <div className="w-72 shrink-0">
            <FoodDetailPanel
              food={selectedFood}
              onClose={() => setSelectedFood(null)}
              onLog={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  )
}