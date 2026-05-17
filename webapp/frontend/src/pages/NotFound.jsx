import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-bold text-stone-200 leading-none mb-4">404</p>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-stone-400 mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        { <Button onClick={() => navigate('/')}>
          Kembali ke Dashboard
        </Button> }
      </div>
    </div>
  )
}