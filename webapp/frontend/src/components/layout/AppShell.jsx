import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "../../services/api";

function TopBar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userName = user.name;

  return (
    <div className="fixed top-4 right-0 left-56 h-14 flex items-center justify-end px-10 z-40 pointer-events-none">
      <button
        onClick={() => navigate("/account")}
        className="pointer-events-auto flex items-center gap-2.5 px-3 py-2
          bg-white border border-stone-200 rounded-xl shadow-sm
          hover:bg-stone-50 transition-all cursor-pointer"
      >
        <img
          src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${userName}`}
          alt="avatar"
          className="w-7 h-7 rounded-full bg-stone-100 shrink-0"
        />
        <span className="text-sm font-medium text-stone-700">{userName}</span>
      </button>
    </div>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  const isDashboard = pathname === "/";

  return (
    <div className="flex min-h-screen bg-stone-100">
      <Sidebar />
      {isDashboard && <TopBar />}
      <main className={`flex-1 ml-56 px-10 py-8`}>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
