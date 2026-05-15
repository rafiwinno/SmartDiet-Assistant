import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import History from "./pages/History";
import LoginPage from "./pages/LoginPage";
import Account from "./pages/Account";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import { isLoggedIn } from "./services/api";
import { useNutrition } from "./hooks/useNutrition";

// ─── Wrapper Profile: sambungkan onSave ke API ────────────────────────────────
function ProfileWithAPI() {
  const { updateProfile, loading } = useNutrition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSave = async (data) => {
    try {
      const res = await updateProfile(data);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan profil");
    }
  };

  if (result) {
    return (
      <div className="max-w-sm">
        <Card>
          <div className="text-center">
            <p className="text-4xl mb-3">🎯</p>
            <h2 className="text-lg font-semibold text-stone-800 mb-4">
              Profil tersimpan!
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "BMR", value: result.bmr, color: "text-blue-600" },
                { label: "TDEE", value: result.tdee, color: "text-purple-600" },
                {
                  label: "Target",
                  value: result.calorie_target,
                  color: "text-green-600",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-stone-50 rounded-xl p-3">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mb-4">kcal/hari</p>
            <Button variant="secondary" onClick={() => setResult(null)}>
              Edit profil
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 max-w-lg bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}
      <Profile onSave={handleSave} />
      {loading && (
        <p className="mt-3 text-sm text-stone-400">
          ⏳ Menyimpan dan menghitung...
        </p>
      )}
    </>
  );
}

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileWithAPI />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
