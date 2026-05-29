import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import Card  from '../components/ui/Card'
import { getPlanDetail } from '../services/api'

// ─── Data placeholder untuk chart ────────────────────────────────────────────
// AI Engineer: ganti PLACEHOLDER_DATA dengan data real dari API saat integrasi.
// Caranya:
// 1. Buat endpoint GET /v1/diet-plans/{planId}/stats di backend
// 2. Return array { label, calories, protein, carbs, fat } per hari
// 3. Ganti baris setChartData(PLACEHOLDER_DATA) di useEffect di bawah
//    dengan: const data = await getPlanStats(planId); setChartData(data)
const PLACEHOLDER_DATA = [
  { label: 'Sen', calories: 1820, protein: 88,  carbs: 220, fat: 52 },
  { label: 'Sel', calories: 2100, protein: 102, carbs: 260, fat: 61 },
  { label: 'Rab', calories: 1650, protein: 75,  carbs: 195, fat: 44 },
  { label: 'Kam', calories: 1480, protein: 72,  carbs: 190, fat: 38 },
  { label: 'Jum', calories: 1950, protein: 95,  carbs: 240, fat: 57 },
  { label: 'Sab', calories: 2200, protein: 110, carbs: 275, fat: 65 },
  { label: 'Min', calories: 1780, protein: 85,  carbs: 215, fat: 49 },
]

const METRICS = [
  { key: 'calories', label: 'Kalori',  unit: 'kcal', color: '#3b82f6' },
  { key: 'protein',  label: 'Protein', unit: 'g',    color: '#ea580c' },
  { key: 'carbs',    label: 'Karbo',   unit: 'g',    color: '#d97706' },
  { key: 'fat',      label: 'Lemak',   unit: 'g',    color: '#7c3aed' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-stone-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-stone-500">{p.name}</span>
          </div>
          <span className="font-medium text-stone-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, avg, unit, color }) {
  return (
    <Card>
      <p className="text-xs font-medium text-stone-400 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-stone-800 leading-none">
        {avg}<span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <div className="mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full w-2/3" style={{ background: color }} />
      </div>
    </Card>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-stone-500
        hover:text-blue-500 transition-colors cursor-pointer group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="group-hover:-translate-x-0.5 transition-transform">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Kembali
    </button>
  )
}

export default function HistoryDetail() {
  const { planId } = useParams()
  const navigate   = useNavigate()

  const [plan,       setPlan]       = useState(null)

  const [chartData,  setChartData]  = useState(PLACEHOLDER_DATA)
  const [activeKeys, setActiveKeys] = useState(['calories'])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    getPlanDetail(parseInt(planId))
      .then(data => setPlan(data))
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false))

    // AI Engineer: uncomment baris di bawah saat data real sudah tersedia
    // getPlanStats(planId).then(data => setChartData(data))
  // FIX: tambah navigate ke dependency array
  }, [planId, navigate])

  const toggleMetric = key => {
    setActiveKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    )
  }

  const averages = METRICS.reduce((acc, m) => {
    acc[m.key] = Math.round(chartData.reduce((s, d) => s + d[m.key], 0) / chartData.length)
    return acc
  }, {})

  if (loading) return <p className="text-sm text-stone-400 text-center py-12">Memuat...</p>
  if (!plan)   return null

  const progress  = Math.min(plan.days_elapsed, plan.estimated_days)
  const createdAt = new Date(plan.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate('/history')} />
        <div className="text-right">
          <h1 className="text-lg font-semibold text-stone-800">{plan.name}</h1>
          <p className="text-xs text-stone-400 mt-0.5">Mulai {createdAt}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {plan.is_active
          ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Aktif</span>
          : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Selesai</span>
        }
        {plan.calorie_target && (
          <span className="text-xs text-stone-400">{plan.calorie_target} kcal/hari</span>
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-800">Progress</p>
          <span className="text-sm font-semibold text-blue-500">
            {progress}/{plan.estimated_days} hari
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${(progress / plan.estimated_days) * 100}%` }}
          />
        </div>
        {/* AI Engineer: total_days saat ini default 30.
            Untuk mengganti: tambah kolom total_days di tabel diet_plans,
            isi saat membuat plan, dan backend akan return nilai tersebut
            di field total_days pada response GET /diet-plans/{id} */}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(m => (
          <StatCard key={m.key} label={`Rata-rata ${m.label}`}
            avg={averages[m.key]} unit={m.unit} color={m.color} />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-stone-800">Tren nutrisi mingguan</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {METRICS.map(m => (
            <button key={m.key} type="button" onClick={() => toggleMetric(m.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
                ${activeKeys.includes(m.key) ? 'text-white border-transparent' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'}`}
              style={activeKeys.includes(m.key) ? { background: m.color, borderColor: m.color } : {}}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Hanya BarChart */}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.filter(m => activeKeys.includes(m.key)).map(m => (
              <Bar key={m.key} dataKey={m.key} name={m.label}
                fill={m.color} radius={[4, 4, 0, 0]} maxBarSize={32} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  )
}