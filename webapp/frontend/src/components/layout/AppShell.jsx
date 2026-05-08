import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <Sidebar />
      <main className="flex-1 ml-56 px-10 py-8">
        <Outlet />
      </main>
    </div>
  )
}