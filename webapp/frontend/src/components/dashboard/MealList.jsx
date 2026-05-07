const MEAL_COLORS = {
  breakfast: '#BA7517',
  lunch:     '#639922',
  snack:     '#185FA5',
  dinner:    '#993556',
}

const MEAL_LABELS = {
  breakfast: 'Sarapan',
  lunch:     'Makan Siang',
  snack:     'Camilan',
  dinner:    'Makan Malam',
}

export default function MealList({ meals = [], onAddMeal }) {
  return (
    <div>
      <div style={{ background: '#fff', border: '0.5px solid #E0DED6', borderRadius: '12px', overflow: 'hidden' }}>
        {meals.length === 0 && (
          <p style={{ padding: '1rem 1.25rem', fontSize: '13px', color: '#888780' }}>
            Belum ada makanan yang dicatat hari ini.
          </p>
        )}
        {meals.map((meal, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px',
            borderBottom: i < meals.length - 1 ? '0.5px solid #F1EFE8' : 'none',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: MEAL_COLORS[meal.type] || '#888780', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>{MEAL_LABELS[meal.type] || meal.type}</p>
              <p style={{ fontSize: '12px', color: '#888780', marginTop: '1px' }}>{meal.description}</p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#888780' }}>{meal.kcal} kcal</span>
          </div>
        ))}
      </div>

      <button
        onClick={onAddMeal}
        style={{
          width: '100%', marginTop: '10px', padding: '10px',
          fontSize: '13px', background: 'none',
          border: '0.5px dashed #B4B2A9', borderRadius: '8px',
          color: '#888780', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '6px',
          fontFamily: 'inherit',
        }}
      >
        + Catat makanan
      </button>
    </div>
  )
}