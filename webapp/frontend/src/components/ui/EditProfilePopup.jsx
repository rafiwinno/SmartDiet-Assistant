// EditProfilePopup.jsx
// Popup untuk mengganti nama, usia, dan jenis kelamin
// Muncul saat klik "Edit profil" di halaman Akun

import { useState }     from 'react'
import FieldLabel       from './FieldLabel'
import TextInput        from './TextInput'
import OptionCard       from './OptionCard'
import Button           from './Button'
import { updateBasicProfile } from '../../services/api'

export default function EditProfilePopup({ profile, onClose, onSaved }) {
  const [name,    setName]    = useState(profile?.name    || '')
  const [age,     setAge]     = useState(profile?.age     || '')
  const [gender,  setGender]  = useState(profile?.gender  || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const canSave = name.trim() && age && gender &&
                  parseInt(age) > 0 && parseInt(age) < 120

  const handleSave = async () => {
    if (!canSave) return
    setLoading(true)
    setError('')
    try {
      await updateBasicProfile({ name: name.trim(), age, gender })
      onSaved({ name: name.trim(), age: parseInt(age), gender })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail)
        ? 'Data tidak valid. Periksa kembali.'
        : (detail || 'Gagal menyimpan. Coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">Edit Profil</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Nama */}
          <div>
            <FieldLabel required>Nama lengkap</FieldLabel>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="Masukkan nama kamu"
            />
          </div>

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
              ].map(opt => (
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

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Batal
            </Button>
            <Button
              fullWidth
              disabled={!canSave || loading}
              onClick={handleSave}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>

        </div>

      </div>
    </div>
  )
}