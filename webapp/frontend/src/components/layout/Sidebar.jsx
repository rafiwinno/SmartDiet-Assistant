// Update: menu "Nutrisi"

import { NavLink } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/api";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/profile", label: "Profil", icon: "◉" },
  { to: "/history", label: "Riwayat", icon: "◷" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initials = user?.name?.slice(0, 2).toUpperCase() || "??";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 w-56 h-screen bg-stone-900 flex flex-col px-4 py-6 z-50">
      {/* Logo */}
      <div className="mb-8 px-1.5">
        <span className="text-xl font-semibold tracking-tight">
          <span className="text-blue-400">Smart</span>
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

      {/* logout */}
      <div className="border-t border-stone-700 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm
            text-stone-400 hover:bg-stone-800 hover:text-red-400 transition-all cursor-pointer"
        >
          {/* Logout icon — door with arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
