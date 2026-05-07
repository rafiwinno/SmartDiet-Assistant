import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F8F5' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '2rem 2.5rem',
       //maxWidth: '860px',
      }}>
        <Outlet />
      </main>
    </div>
  )
}