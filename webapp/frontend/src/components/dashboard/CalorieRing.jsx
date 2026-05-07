export default function CalorieRing({ consumed = 0, target = 2000 }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(consumed / target, 1)
  const offset = circumference - progress * circumference
  const remaining = Math.max(target - consumed, 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem', background: '#fff', border: '0.5px solid #E0DED6', borderRadius: '12px' }}>
      <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
        <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#F1EFE8" strokeWidth="7" />
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#639922" strokeWidth="7"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '19px', fontWeight: '500', lineHeight: 1 }}>{consumed}</span>
          <span style={{ fontSize: '10px', color: '#888780', marginTop: '2px' }}>kcal</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>Kalori hari ini</p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[
            { label: 'Target', value: target, color: '#2C2C2A' },
            { label: 'Dikonsumsi', value: consumed, color: '#3B6D11' },
            { label: 'Sisa', value: remaining, color: '#2C2C2A' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '18px', fontWeight: '500', color }}>{value}</span>
              <span style={{ fontSize: '12px', color: '#888780' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}