import CalorieRing       from '../components/dashboard/CalorieRing'
import MacroCard         from '../components/dashboard/MacroCard'
import MealList          from '../components/dashboard/MealList'
import WaterTracker      from '../components/dashboard/WaterTracker'
import AIRecommendCard   from '../components/dashboard/AIRecommendCard'

const label = (text) => (
  <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888780', marginBottom: '10px' }}>
    {text}
  </p>
)

export default function Dashboard({
  userName        = 'Popon',
  calories        = { consumed: 1480, target: 2000 },
  macros          = { protein: { consumed: 72, target: 120 }, carbs: { consumed: 190, target: 250 }, fat: { consumed: 38, target: 65 } },
  meals           = [
    { type: 'breakfast', description: 'Oatmeal, pisang, telur rebus',       kcal: 420 },
    { type: 'lunch',     description: 'Nasi ayam, sayur bening, tempe',     kcal: 680 },
    { type: 'snack',     description: 'Yogurt, kacang campur',              kcal: 380 },
  ],
  water           = { glasses: 5, target: 8 },
  recommendation  = 'Kamu masih butuh 520 kcal dan 48 g protein. Kami sarankan ikan bakar dengan sayuran kukus dan nasi merah.',
  onAddMeal       = () => {},
  onAddWater      = () => {},
  onViewMenu      = () => {},
}) {
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '500' }}>Hai, {userName}!</h1>
        <p style={{ fontSize: '13px', color: '#888780', marginTop: '2px', textTransform: 'capitalize' }}>{today}</p>
      </div>

      {/* Calories */}
      <div>
        {label('Ringkasan harian')}
        <CalorieRing consumed={calories.consumed} target={calories.target} />
      </div>

      {/* Macros */}
      <div>
        {label('Makronutrien')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <MacroCard type="protein" consumed={macros.protein.consumed} target={macros.protein.target} />
          <MacroCard type="carbs"   consumed={macros.carbs.consumed}   target={macros.carbs.target}   />
          <MacroCard type="fat"     consumed={macros.fat.consumed}      target={macros.fat.target}     />
        </div>
      </div>

      {/* Meals */}
      <div>
        {label('Makanan hari ini')}
        <MealList meals={meals} onAddMeal={onAddMeal} />
      </div>

      {/* Water */}
      <div>
        {label('Asupan air')}
        <WaterTracker glasses={water.glasses} target={water.target} onAdd={onAddWater} />
      </div>

      {/* AI Recommendation */}
      <div>
        {label('Rekomendasi AI')}
        <AIRecommendCard recommendation={recommendation} onViewMenu={onViewMenu} />
      </div>

    </div>
  )
}