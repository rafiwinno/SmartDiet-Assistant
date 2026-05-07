import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard'  },
  { to: '/profile',  label: 'Profil'     },
  { to: '/history',  label: 'Riwayat'    },
]

const linkStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 14px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: isActive ? '500' : '400',
  color: isActive ? '#3B6D11' : '#5F5E5A',
  background: isActive ? '#EAF3DE' : 'transparent',
  transition: 'all 0.15s ease',
})

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '220px',
      height: '100vh',
      background: '#FFFFFF',
      borderRight: '0.5px solid #E0DED6',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ marginBottom: '2rem', padding: '0 6px' }}>
        <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#3B6D11',
          letterSpacing: '-0.02em',
        }}>
          nutri<span style={{ color: '#2C2C2A' }}>wise</span>
        </span>
        <p style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
          Asisten nutrisi harian
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user strip */}
      <div style={{
        borderTop: '0.5px solid #E0DED6',
        paddingTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: '#EAF3DE',
          border: '0.5px solid #C0DD97',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '500', color: '#3B6D11',
          flexShrink: 0,
        }}>
          AN
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#2C2C2A' }}>Popon</p>
          <p style={{ fontSize: '11px', color: '#888780' }}>1480 kcal hari ini</p>
        </div>
      </div>
    </aside>
  )
}