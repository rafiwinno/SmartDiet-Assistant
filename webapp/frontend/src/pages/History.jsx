import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Badge                   from '../components/ui/Badge'
import { getPlans }            from '../services/api'

// const GOAL_LABEL = {
//   lose    : 'Turun berat badan',
//   maintain: 'Pertahankan berat',
//   gain    : 'Naik berat badan',
// }

// const GOAL_BADGE = { lose: 'blue', maintain: 'green', gain: 'amber' }

function PlanCard({ plan, onClick }) {
  const createdAt = new Date(plan.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const endedAt = plan.ended_at
    ? new Date(plan.ended_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const progress = Math.min(plan.days_elapsed, plan.estimated_days)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-stone-200 rounded-2xl p-5
        hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">{plan.name}</p>
          <p className="text-xs text-stone-400 mt-0.5">Mulai {createdAt}</p>
        </div>
        <div className="ml-3 shrink-0">
          {plan.is_active
            ? <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Aktif</span>
            : <span className="text-xs font-medium px-2 py-1 rounded-full bg-stone-100 text-stone-400">Selesai</span>
          }
        </div>
      </div>

      {/* <div className="flex items-center gap-3 mb-3">
        {plan.goal && (
          <Badge variant={GOAL_BADGE[plan.goal] || 'stone'}>
            {GOAL_LABEL[plan.goal] || plan.goal}
          </Badge>
        )}
        {plan.calorie_target && (
          <span className="text-xs text-stone-400">{plan.calorie_target} kcal/hari</span>
        )}
      </div> */}

      {/* Progress bar hari */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${(progress / plan.estimated_days) * 100}%` }}
          />
        </div>
        <span className="text-xs text-stone-400 shrink-0">
          {progress}/{plan.estimated_days}hari
        </span>
      </div>

      {endedAt && !plan.is_active && (
        <p className="text-xs text-stone-400 mt-2">Berakhir {endedAt}</p>
      )}

      <div className="flex justify-end mt-2">
        <span className="text-xs text-stone-300 group-hover:text-blue-400 transition-colors">
          Lihat riwayat →
        </span>
      </div>
    </button>
  )
}

export default function History() {
  const navigate         = useNavigate()
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlans()
      .then(data => setPlans(data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">History</h1>
        <p className="text-sm text-stone-400 mt-0.5">Riwayat plan diet yang pernah kamu jalankan</p>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400 text-center py-12">Memuat riwayat...</p>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-medium text-stone-600 mb-1">Belum ada plan</p>
          <p className="text-xs text-stone-400">Buat plan pertamamu di halaman Planner</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => navigate(`/history/${plan.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}