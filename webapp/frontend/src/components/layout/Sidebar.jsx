// Update: menu "Nutrisi" 

import { NavLink } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/api";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",    icon: "◈" },
  { to: "/profile",   label: "Profil",       icon: "◉" },
  { to: "/nutrition", label: "Nutrisi",      icon: "◎" },
  { to: "/history",   label: "Riwayat",      icon: "◷" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const user      = getCurrentUser();
  const initials  = user?.name?.slice(0, 2).toUpperCase() || "??";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
              ${isActive
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

      {/* User strip + logout */}
      <div className="border-t border-stone-700 pt-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-900 border border-green-700 flex items-center justify-center text-xs font-medium text-green-400 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-200 truncate">{user?.name || 'User'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-stone-500 hover:text-stone-300 px-1 transition-colors cursor-pointer"
        >
          Keluar →
        </button>
      </div>
    </aside>
  );
}