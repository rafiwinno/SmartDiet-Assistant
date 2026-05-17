import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import OptionCard from './OptionCard'
import FieldLabel from './FieldLabel'
import TextInput  from './TextInput'
import Button     from './Button'
import { saveOnboardingData } from '../../services/api'

export default function OnboardingPopup({ onComplete }) {
  const navigate            = useNavigate()
  const [age,     setAge]   = useState('')
  const [gender,  setGender]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const canSave = age && gender && parseInt(age) > 0 && parseInt(age) < 120

  const handleSave = async () => {
    if (!canSave) return
    setLoading(true)
    setError('')
    try {
      await saveOnboardingData({ age, gender })

      onComplete()
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError('Data tidak valid. Pastikan usia dan jenis kelamin sudah diisi.')
      } else {
        setError(detail || 'Gagal menyimpan. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-blue-500 px-6 pt-6 pb-5">
          <p className="text-2xl mb-1">👋</p>
          <h2 className="text-lg font-semibold text-white">Satu langkah lagi!</h2>
          <p className="text-sm text-blue-100 mt-0.5">
            Lengkapi data diri untuk hasil yang lebih akurat
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Usia */}
          <div>
            <FieldLabel required>Usia</FieldLabel>
            <TextInput
              value={age}
              onChange={setAge}
              placeholder="Masukkan usiamu"
              type="number"
              suffix="tahun"
            />
          </div>

          {/* Jenis kelamin */}
          <div>
            <FieldLabel required>Jenis kelamin</FieldLabel>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { value: 'male',   label: 'Laki-laki' },
                { value: 'female', label: 'Perempuan' },
              ].map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={gender === opt.value}
                  onClick={() => setGender(opt.value)}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <Button
            fullWidth
            disabled={!canSave || loading}
            onClick={handleSave}
          >
            {loading ? '⏳ Menyimpan...' : 'Mulai perjalananku →'}
          </Button>

          <p className="text-xs text-stone-400 text-center -mt-2">
            Data ini digunakan untuk menghitung kebutuhan kalori harianmu
          </p>
        </div>

      </div>
    </div>
  )
}