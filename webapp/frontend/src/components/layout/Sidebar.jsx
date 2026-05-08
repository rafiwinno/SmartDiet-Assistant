import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/profile", label: "Profil" },
  { to: "/history", label: "Riwayat" },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 w-56 h-screen bg-stone-900 flex flex-col px-4 py-6 z-50">
      {/* Logo */}
      <div className="mb-8 px-1.5">
        <span className="text-xl font-semibold tracking-tight">
          <span className="text-green-400">Smart</span>
          <span className="text-white">Diet</span>
        </span>
        <p className="text-xs text-stone-500 mt-0.5">Assistant</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all
              ${
                isActive
                  ? "bg-stone-700 text-white font-medium"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User strip */}
      <div className="border-t border-stone-700 pt-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-green-900 border border-green-700 flex items-center justify-center text-xs font-medium text-green-400 shrink-0">
          AN
        </div>
        <div>
          <p className="text-sm font-medium text-stone-200">Popon</p>
          <p className="text-xs text-stone-500">1480 kcal hari ini</p>
        </div>
      </div>
    </aside>
  );
}
