export default function WaterTracker({ glasses = 0, target = 8, onAdd }) {
  const pct = Math.round((glasses / target) * 100)

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DED6', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{glasses} dari {target} gelas</p>
        <div style={{ height: '6px', background: '#E0DED6', borderRadius: '6px', marginTop: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#378ADD', borderRadius: '6px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
      <button
        onClick={onAdd}
        style={{
          padding: '7px 14px', fontSize: '13px', fontWeight: '500',
          background: '#E6F1FB', color: '#185FA5',
          border: '0.5px solid #B5D4F4', borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        + Tambah
      </button>
    </div>
  )
}