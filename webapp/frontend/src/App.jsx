import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell        from "./components/layout/AppShell";
import Dashboard       from "./pages/Dashboard";
import Planner         from "./pages/Planner";
import History         from "./pages/History";
import HistoryDetail   from "./pages/HistoryDetail";
import LoginPage       from "./pages/LoginPage";
import Account         from "./pages/Account";
import LandingPage     from "./pages/LandingPage";
import NotFound        from "./pages/NotFound";
import OnboardingPopup from "./components/ui/OnboardingPopup";
import Card            from "./components/ui/Card";
import Button          from "./components/ui/Button";
import { isLoggedIn, getProfile } from "./services/api";
import { useEffect }              from "react";

// ─── OnboardingGate ───────────────────────────────────────────────────────────
// Muncul sekali setelah register jika age/gender belum diisi
function OnboardingGate({ children }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checked, setChecked] = useState(!isLoggedIn());

  useEffect(() => {
    if (!isLoggedIn()) return;
    getProfile()
      .then((profile) => {
        setNeedsOnboarding(!profile.age || !profile.gender);
        setChecked(true);
      })
      .catch(() => {
        setNeedsOnboarding(true);
        setChecked(true);
      });
  }, []);

  if (!checked) return null;

  return (
    <>
      {children}
      {needsOnboarding && isLoggedIn() && (
        <OnboardingPopup onComplete={() => setNeedsOnboarding(false)} />
      )}
    </>
  );
}

// ─── ProtectedRoute ────────────
function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OnboardingGate>
                <AppShell />
              </OnboardingGate>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"         element={<Dashboard />}     />
          <Route path="planner"           element={<Planner />}       />
          <Route path="history"           element={<History />}       />
          <Route path="history/:planId"   element={<HistoryDetail />} />
          <Route path="account"           element={<Account />}       />
          <Route path="*"                 element={<NotFound />}      />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}