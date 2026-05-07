export default function AIRecommendCard({ recommendation = null, onViewMenu }) {
  if (!recommendation) return null

  return (
    <div style={{ background: '#F1EFE8', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: 34, height: 34, background: '#fff', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '16px',
      }}>✦</div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>Rekomendasi makan malam</p>
        <p style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.5' }}>{recommendation}</p>
        <button
          onClick={onViewMenu}
          style={{ marginTop: '8px', fontSize: '12px', fontWeight: '500', color: '#3B6D11', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Lihat menu lengkap →
        </button>
      </div>
    </div>
  )
}