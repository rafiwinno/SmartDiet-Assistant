export default function AIRecommendCard({ recommendation = null, onViewMenu }) {
  if (!recommendation) return null

  return (
    <div className="bg-stone-100 rounded-xl px-5 py-4 flex items-start gap-3">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 text-base">
        ✦
      </div>
      <div>
        <p className="text-sm font-medium mb-1">Rekomendasi makan malam</p>
        <p className="text-sm text-stone-500 leading-relaxed">{recommendation}</p>
        <button
          onClick={onViewMenu}
          className="mt-2 text-xs font-medium text-green-700 hover:text-green-800 bg-transparent border-none cursor-pointer p-0"
        >
          Lihat menu lengkap →
        </button>
      </div>
    </div>
  )
}