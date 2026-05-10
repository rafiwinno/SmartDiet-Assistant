// Kartu info nutrisi satu makanan

export default function NutritionCard({
  foodName,
  quantityG,
  calories,
  proteinG  = 0,
  carbsG    = 0,
  fatG      = 0,
  onDelete,       
  className = '',
}) {
  return (
    <div className={`bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>

      {/* Header: nama makanan + tombol hapus */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-stone-800 leading-tight">{foodName}</p>
          <p className="text-xs text-stone-400 mt-0.5">{quantityG}g</p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none ml-2 cursor-pointer"
            title="Hapus"
          >
            ×
          </button>
        )}
      </div>

      {/* Kalori */}
      <p className="text-xl font-bold text-green-600 leading-none mb-3">
        {calories}
        <span className="text-xs font-normal text-stone-400 ml-1">kcal</span>
      </p>

      {/* Grid makro */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="text-center bg-orange-50 rounded-lg py-1.5">
          <p className="text-[10px] font-medium text-orange-500 uppercase tracking-wide">Protein</p>
          <p className="text-xs font-bold text-orange-700">{proteinG}g</p>
        </div>
        <div className="text-center bg-amber-50 rounded-lg py-1.5">
          <p className="text-[10px] font-medium text-amber-500 uppercase tracking-wide">Karbo</p>
          <p className="text-xs font-bold text-amber-700">{carbsG}g</p>
        </div>
        <div className="text-center bg-blue-50 rounded-lg py-1.5">
          <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wide">Lemak</p>
          <p className="text-xs font-bold text-blue-700">{fatG}g</p>
        </div>
      </div>

    </div>
  )
}