import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card      from '../components/ui/Card'
import Button    from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'
import FieldLabel from '../components/ui/FieldLabel'
import { login, register } from '../services/api'

export default function LoginPage() {
  const navigate              = useNavigate()
  const [mode,    setMode]    = useState('login')
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (field, val) => { setForm(p => ({ ...p, [field]: val })); setError('') }

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Email dan password wajib diisi'); return }
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!form.name) { setError('Nama wajib diisi'); setLoading(false); return }
        await register(form.name, form.email, form.password)
        await login(form.email, form.password)
      } else {
        await login(form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-3xl font-semibold tracking-tight">
            <span className="text-green-500">Smart</span>
            <span className="text-stone-800">Diet</span>
          </p>
          <p className="text-sm text-stone-400 mt-1">AI Meal Planning Assistant</p>
        </div>

        <Card>
          {/* Toggle */}
          <div className="flex bg-stone-100 rounded-lg p-1 mb-6">
            {[['login','Masuk'], ['register','Daftar']].map(([m, label]) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer
                  ${mode === m ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <FieldLabel required>Nama lengkap</FieldLabel>
                <TextInput value={form.name} onChange={v => set('name', v)} placeholder="Nama kamu" />
              </div>
            )}
            <div>
              <FieldLabel required>Email</FieldLabel>
              <TextInput value={form.email} onChange={v => set('email', v)} placeholder="email@example.com" type="email" />
            </div>
            <div>
              <FieldLabel required>Password</FieldLabel>
              <TextInput value={form.password} onChange={v => set('password', v)} placeholder="••••••••" type="password" />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <Button fullWidth disabled={loading} onClick={handleSubmit}>
              {loading ? '⏳ Memproses...' : mode === 'login' ? 'Masuk' : 'Buat akun'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}