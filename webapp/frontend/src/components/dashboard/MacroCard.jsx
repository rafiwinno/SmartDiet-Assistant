const MACRO_CONFIG = {
  protein: { label: 'Protein', unit: 'g', color: '#D85A30' },
  carbs:   { label: 'Karbo',   unit: 'g', color: '#BA7517' },
  fat:     { label: 'Lemak',   unit: 'g', color: '#185FA5' },
}

export default function MacroCard({ type = 'protein', consumed = 0, target = 100 }) {
  const { label, unit, color } = MACRO_CONFIG[type]
  const pct = Math.min(Math.round((consumed / target) * 100), 100)

  return (
    <div style={{ background: '#F9F8F5', borderRadius: '8px', padding: '14px' }}>
      <p style={{ fontSize: '11px', color: '#888780', fontWeight: '500', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: '500', lineHeight: 1 }}>
        {consumed}<span style={{ fontSize: '11px', color: '#888780', marginLeft: '2px' }}>{unit} / {target}{unit}</span>
      </p>
      <div style={{ height: '4px', background: '#E0DED6', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}