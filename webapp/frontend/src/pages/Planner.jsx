import { useState } from 'react'
import Button    from '../components/ui/Button'
import Card      from '../components/ui/Card'
import FieldLabel from '../components/ui/FieldLabel'
import TextInput  from '../components/ui/TextInput'
import OptionCard from '../components/ui/OptionCard'
import TagToggle  from '../components/ui/TagToggle'
import Badge      from '../components/ui/Badge'
import { getActivePlan, saveProfile, createPlan } from '../services/api'

const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Tidak aktif',   desc: 'Kerja kantoran, jarang olahraga'    },
  { value: 'light',       label: 'Ringan',         desc: 'Olahraga ringan 1–3x seminggu'      },
  { value: 'moderate',    label: 'Sedang',         desc: 'Olahraga 3–5x seminggu'             },
  { value: 'active',      label: 'Aktif',          desc: 'Olahraga intensif 6–7x seminggu'    },
  { value: 'very_active', label: 'Sangat aktif',   desc: 'Atlet atau kerja fisik berat'       },
]

const GOALS = [
  { value: 'lose',     label: 'Turunkan berat badan', desc: 'Defisit kalori terkontrol'         },
  { value: 'maintain', label: 'Pertahankan berat',    desc: 'Seimbang sesuai kebutuhan'         },
  { value: 'gain',     label: 'Naikkan berat badan',  desc: 'Surplus kalori untuk massa otot'  },
]

const DIETARY_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Bebas gluten', 'Bebas laktosa', 'Bebas kacang']
const COMMON_ALLERGIES     = ['Kacang tanah', 'Susu', 'Telur', 'Ikan', 'Udang', 'Kedelai', 'Gandum']

// PERUBAHAN: step sekarang 3 langkah (tanpa step Data Diri)
const STEPS = ['Aktivitas & tujuan', 'Pantangan & alergi', 'Ringkasan']

// PERUBAHAN: BB, TB, target BB dipindah ke step ini (penambahan, bukan mengganti)
function StepActivity({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Aktivitas & tujuan</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Mempengaruhi perhitungan TDEE dan target kalori harianmu
        </p>
      </div>

      {/* BARU: BB, TB, target BB di step ini */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel required>Berat badan</FieldLabel>
          <TextInput value={data.weight} onChange={v => onChange('weight', v)}
            placeholder="65" type="number" suffix="kg" />
        </div>
        <div>
          <FieldLabel required>Tinggi badan</FieldLabel>
          <TextInput value={data.height} onChange={v => onChange('height', v)}
            placeholder="170" type="number" suffix="cm" />
        </div>
        <div>
          <FieldLabel required>Target Berat Badan</FieldLabel>
          <TextInput value={data.targetWeight} onChange={v => onChange('targetWeight', v)}
            placeholder="60" type="number" suffix="kg" />
        </div>
      </div>

      <div>
        <FieldLabel required>Tingkat aktivitas</FieldLabel>
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVELS.map(opt => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.activityLevel === opt.value}
              onClick={() => onChange('activityLevel', opt.value)} />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required>Tujuan utama</FieldLabel>
        <div className="flex flex-col gap-2">
          {GOALS.map(opt => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.goal === opt.value}
              onClick={() => onChange('goal', opt.value)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepDietary({ data, onChange }) {
  const toggle = (field, value) => {
    const current = data[field] ?? []
    onChange(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Pantangan & alergi</h2>
        <p className="text-sm text-stone-400 mt-0.5">Opsional — digunakan untuk menyaring rekomendasi menu</p>
      </div>
      <div>
        <FieldLabel>Pantangan makan</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {DIETARY_RESTRICTIONS.map(item => (
            <TagToggle key={item} label={item} selected={(data.dietary ?? []).includes(item)}
              onClick={() => toggle('dietary', item)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Alergi makanan</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {COMMON_ALLERGIES.map(item => (
            <TagToggle key={item} label={item} selected={(data.allergies ?? []).includes(item)}
              onClick={() => toggle('allergies', item)} />
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-3">Tidak ada dalam daftar?</p>
        <div className="mt-1.5">
          <TextInput value={data.otherAllergies ?? ''} onChange={v => onChange('otherAllergies', v)}
            placeholder="Ketik alergi lainnya, pisahkan dengan koma" />
        </div>
      </div>
    </div>
  )
}

function StepSummary({ data }) {
  const actLabel  = ACTIVITY_LEVELS.find(a => a.value === data.activityLevel)?.label ?? '—'
  const goalLabel = GOALS.find(g => g.value === data.goal)?.label ?? '—'
  const rows = [
    { label: 'Berat badan',        value: data.weight       ? `${data.weight} kg`       : '—' },
    { label: 'Tinggi badan',       value: data.height       ? `${data.height} cm`       : '—' },
    { label: 'Target berat badan', value: data.targetWeight ? `${data.targetWeight} kg` : '—' },
    { label: 'Tingkat aktivitas',  value: actLabel                                            },
    { label: 'Tujuan',             value: goalLabel                                           },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Ringkasan plan</h2>
        <p className="text-sm text-stone-400 mt-0.5">Periksa kembali sebelum menyimpan</p>
      </div>
      <Card padding={false}>
        {rows.map((row, i) => (
          <div key={i}
            className={`flex items-center justify-between px-5 py-3 ${i < rows.length - 1 ? 'border-b border-stone-100' : ''}`}>
            <span className="text-sm text-stone-500">{row.label}</span>
            <span className="text-sm font-medium text-stone-800">{row.value}</span>
          </div>
        ))}
      </Card>
      {(data.dietary?.length > 0 || data.allergies?.length > 0) && (
        <Card>
          {data.dietary?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Pantangan</p>
              <div className="flex flex-wrap gap-1.5">
                {data.dietary.map(d => <Badge key={d} variant="stone">{d}</Badge>)}
              </div>
            </div>
          )}
          {data.allergies?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Alergi</p>
              <div className="flex flex-wrap gap-1.5">
                {data.allergies.map(a => <Badge key={a} variant="red">{a}</Badge>)}
              </div>
            </div>
          )}
        </Card>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-blue-800 mb-0.5">Siap disimpan</p>
        <p className="text-xs text-blue-700">
          Profil ini akan digunakan untuk menghitung BMR, TDEE, dan membuat plan diet barumu.
        </p>
      </div>
    </div>
  )
}

function StepIndicator({ current, labels }) {
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
              ${i < current ? 'bg-blue-500 text-white' : i === current ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${i === current ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 ${i < current ? 'bg-blue-400' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

const INITIAL = {
  weight: '', height: '', targetWeight: '',
  activityLevel: '', goal: '',
  dietary: [], allergies: [], otherAllergies: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Planner() {
  const [view,        setView]        = useState('idle')      // 'idle' | 'warning' | 'form' | 'success'
  const [step,        setStep]        = useState(0)
  const [data,        setData]        = useState(INITIAL)
  const [existingPlan, setExistingPlan] = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [result,      setResult]      = useState(null)

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }))

  // Cek apakah sudah ada plan aktif
  const handleAddPlan = async () => {
    try {
      const plan = await getActivePlan()
      setExistingPlan(plan)
      setView('warning')  // sudah ada plan → tampilkan warning
    } catch {
      setView('form')     // belum ada plan → langsung ke form
    }
  }

  const handleConfirmNew = async () => {
    // User konfirmasi → lanjut ke form (backend akan deactivate saat POST /diet-plans)
    setView('form')
  }

  const canNext = () => {
    if (step === 0) return data.weight && data.height && data.targetWeight && data.activityLevel && data.goal
    return true
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Simpan profil & hitung BMR/TDEE
      const profileResult = await saveProfile(data)
      // 2. Buat plan baru (backend otomatis nonaktifkan plan lama di sini)
      const planResult    = await createPlan()
      setResult({ profile: profileResult, plan: planResult })
      setView('success')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError('Data tidak lengkap. Pastikan semua field sudah diisi.')
      } else {
        setError(detail || 'Gagal menyimpan. Coba lagi.')
      }    } finally {
      setLoading(false)
    }
  }

  // ─── Tampilan awal (idle) ─────────────────────────────────────────────────
  if (view === 'idle') {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
          <p className="text-sm text-stone-400 mt-0.5">Kelola plan diet-mu di sini</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <button
            onClick={handleAddPlan}
            className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 border-dashed
              flex items-center justify-center text-3xl text-blue-400
              hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer mb-4"
          >
            +
          </button>
          <p className="text-sm font-medium text-stone-700 mb-1">Tambah Plan</p>
          <p className="text-xs text-stone-400">Buat plan baru untuk memulai perjalanan dietmu</p>
        </div>
      </div>
    )
  }

  // ─── Warning popup (sudah ada plan aktif) ────────────────────────────────
  if (view === 'warning') {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
        </div>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="text-2xl mb-3">⚠️</div>
            <p className="text-base font-semibold text-stone-800 mb-2">
              Kamu masih punya plan aktif
            </p>
            <p className="text-sm text-stone-500 mb-1">
              Plan <span className="font-medium text-stone-700">"{existingPlan?.name}"</span> akan
              ditandai sebagai <span className="font-medium text-red-500">tidak selesai</span> dan
              tidak bisa diubah lagi.
            </p>
            <p className="text-sm text-stone-500 mb-5">
              Plan tersebut akan tetap tersimpan di riwayatmu di halaman History.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setView('idle')}>
                Batal
              </Button>
              <Button fullWidth onClick={handleConfirmNew}>
                Ya, buat plan baru
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Sukses ───────────────────────────────────────────────────────────────
  if (view === 'success' && result) {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
        </div>
        <div className="max-w-sm">
          <Card>
            <div className="text-center">
              <p className="text-4xl mb-3">🎯</p>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Plan berhasil dibuat!</h2>
              <p className="text-sm text-stone-400 mb-4">
                {result.plan?.name}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'BMR',    value: result.profile?.bmr,            color: 'text-blue-600'   },
                  { label: 'TDEE',   value: result.profile?.tdee,           color: 'text-purple-600' },
                  { label: 'Target', value: result.profile?.calorie_target, color: 'text-blue-500'   },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-stone-50 rounded-xl p-3">
                    <p className={`text-lg font-bold ${color}`}>{value ? Math.round(value) : '—'}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mb-4">kcal/hari</p>
              <Button variant="secondary" onClick={() => { setView('idle'); setData(INITIAL); setStep(0) }}>
                Kembali ke Planner
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Form 3 langkah ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
        <p className="text-sm text-stone-400 mt-0.5">Lengkapi data untuk hasil rekomendasi terbaik</p>
      </div>

      <StepIndicator current={step} labels={STEPS} />

      <Card className="min-h-64">
        {step === 0 && <StepActivity  data={data} onChange={update} />}
        {step === 1 && <StepDietary  data={data} onChange={update} />}
        {step === 2 && <StepSummary  data={data} />}
      </Card>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-5">
        <Button
          variant="secondary"
          onClick={() => step === 0 ? setView('idle') : setStep(s => s - 1)}
        >
          Kembali
        </Button>
        <span className="text-xs text-stone-400">{step + 1} / {STEPS.length}</span>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Lanjut</Button>
        ) : (
          <Button disabled={loading} onClick={handleSave}>
            {loading ? '⏳ Menyimpan...' : 'Simpan & buat plan'}
          </Button>
        )}
      </div>
    </div>
  )
}