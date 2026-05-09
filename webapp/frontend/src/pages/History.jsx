import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card        from '../components/ui/Card'
import Badge       from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import ToggleGroup from '../components/ui/ToggleGroup'

const DAILY_DATA = [
  { label: 'Sen', calories: 1820, protein: 88,  carbs: 220, fat: 52 },
  { label: 'Sel', calories: 2100, protein: 102, carbs: 260, fat: 61 },
  { label: 'Rab', calories: 1650, protein: 75,  carbs: 195, fat: 44 },
  { label: 'Kam', calories: 1480, protein: 72,  carbs: 190, fat: 38 },
  { label: 'Jum', calories: 1950, protein: 95,  carbs: 240, fat: 57 },
  { label: 'Sab', calories: 2200, protein: 110, carbs: 275, fat: 65 },
  { label: 'Min', calories: 1780, protein: 85,  carbs: 215, fat: 49 },
]

const WEEKLY_DATA = [
  { label: 'Minggu 1', calories: 1750, protein: 82, carbs: 210, fat: 48 },
  { label: 'Minggu 2', calories: 1900, protein: 91, carbs: 235, fat: 54 },
  { label: 'Minggu 3', calories: 2050, protein: 99, carbs: 252, fat: 60 },
  { label: 'Minggu 4', calories: 1860, protein: 89, carbs: 228, fat: 51 },
]

const TARGETS = { calories: 2000, protein: 120, carbs: 250, fat: 65 }

const METRICS = [
  { key: 'calories', label: 'Kalori',  unit: 'kcal', color: '#16a34a' },
  { key: 'protein',  label: 'Protein', unit: 'g',    color: '#ea580c' },
  { key: 'carbs',    label: 'Karbo',   unit: 'g',    color: '#d97706' },
  { key: 'fat',      label: 'Lemak',   unit: 'g',    color: '#2563eb' },
]

const CustomTooltip = ({ active, payload, label }) => {
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

// ─── Local sub-components ────────────────────────────────────────────────────

function StatCard({ label, avg, target, unit, color }) {
  const delta = avg - target
  const over  = delta > 0

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-stone-400">{label}</p>
        <Badge variant={over ? 'red' : 'green'}>
          {over ? '+' : ''}{delta} {unit}
        </Badge>
      </div>
      <p className="text-2xl font-semibold text-stone-800 leading-none">
        {avg}<span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-stone-400 mt-1">Target {target} {unit}</p>
      <ProgressBar value={avg} max={target} color={color} className="mt-3" />
    </Card>
  )
}

function MealLogRow({ day }) {
  const over = day.calories > TARGETS.calories
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-stone-100 last:border-none">
      <p className="w-10 shrink-0 text-sm font-semibold text-stone-700 text-center">{day.label}</p>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-stone-400">P {day.protein}g · C {day.carbs}g · F {day.fat}g</span>
          <span className={`text-xs font-semibold ${over ? 'text-red-500' : 'text-green-600'}`}>
            {day.calories} kcal
          </span>
        </div>
        <ProgressBar value={day.calories} max={TARGETS.calories} color={over ? '#f87171' : '#16a34a'} />
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function History({ dailyData = DAILY_DATA, weeklyData = WEEKLY_DATA }) {
  const [range,      setRange]      = useState('daily')
  const [chartType,  setChartType]  = useState('bar')
  const [activeKeys, setActiveKeys] = useState(['calories'])

  const data = range === 'daily' ? dailyData : weeklyData

  const averages = METRICS.reduce((acc, m) => {
    acc[m.key] = Math.round(data.reduce((sum, d) => sum + d[m.key], 0) / data.length)
    return acc
  }, {})

  const toggleMetric = (key) => {
    setActiveKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    )
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Riwayat & progres</h1>
        <p className="text-sm text-stone-400 mt-0.5">Pantau tren nutrisi harianmu</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(m => (
          <StatCard key={m.key} label={`Rata-rata ${m.label}`}
            avg={averages[m.key]} target={TARGETS[m.key]}
            unit={m.unit} color={m.color} />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <p className="text-sm font-semibold text-stone-800">Tren nutrisi</p>
          <div className="flex gap-2">
            <ToggleGroup value={range} onChange={setRange}
              options={[{ value: 'daily', label: 'Mingguan' }, { value: 'weekly', label: 'Bulanan' }]} />
            <ToggleGroup value={chartType} onChange={setChartType}
              options={[{ value: 'bar', label: 'Batang' }, { value: 'line', label: 'Garis' }]} />
          </div>
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

        <ResponsiveContainer width="100%" height={240}>
          <ChartComponent data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.filter(m => activeKeys.includes(m.key)).map(m =>
              chartType === 'line' ? (
                <Line key={m.key} type="monotone" dataKey={m.key} name={m.label}
                  stroke={m.color} strokeWidth={2} dot={{ r: 3, fill: m.color }} activeDot={{ r: 5 }} />
              ) : (
                <Bar key={m.key} dataKey={m.key} name={m.label}
                  fill={m.color} radius={[4, 4, 0, 0]} maxBarSize={32} />
              )
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </Card>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-sm font-semibold text-stone-800">Log harian</p>
          <p className="text-xs text-stone-400 mt-0.5">Rincian per hari vs target</p>
        </div>
        {dailyData.map((day, i) => <MealLogRow key={i} day={day} />)}
      </Card>
    </div>
  )
}