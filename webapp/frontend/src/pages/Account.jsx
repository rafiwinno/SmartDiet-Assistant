import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card   from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge  from "../components/ui/Badge";
import { getCurrentUser, getProfile, getPlans } from "../services/api";

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-stone-500
        hover:text-blue-500 transition-colors cursor-pointer group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="group-hover:-translate-x-0.5 transition-transform">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Kembali
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-none">
      <span className="text-sm text-stone-400">{label}</span>
      <span className="text-sm font-medium text-stone-800">{value || "—"}</span>
    </div>
  );
}

function MilestoneCard({ label, value, unit, desc, color = "text-green-600" }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col gap-1">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-3xl font-bold leading-none ${color}`}>
        {value}
        <span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
    </div>
  );
}

function PlanHistoryRow({ plan, index }) {
  const endedAt = plan.ended_at
    ? new Date(plan.ended_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-none">
      <div className="w-7 h-7 rounded-full bg-green-50 border border-green-200
        flex items-center justify-center text-xs font-semibold text-green-600 shrink-0">
        {index + 1}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-800">{plan.name}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {plan.days_elapsed ?? 30} hari · selesai {endedAt}
        </p>
      </div>
      <Badge variant="green">Selesai</Badge>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getPlans()])
      .then(([prof, planList]) => {
        setProfile(prof);
        setPlans(planList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const user = getCurrentUser();

  const GENDER_MAP = { male: "Laki-laki", female: "Perempuan" };

  // Milestone numbers derived from real plan data
  const currentStreak   = plans.find(p => p.is_active)?.current_streak  ?? 0;
  const longestStreak   = Math.max(0, ...plans.map(p => p.longest_streak ?? 0));
  const plansFinished   = plans.filter(p => !p.is_active && p.ended_at).length;
  const totalDaysLogged = plans.reduce((sum, p) => sum + (p.days_elapsed ?? 0), 0);

  // Plan history: all inactive plans
  const planHistory = plans.filter(p => !p.is_active && p.ended_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-stone-400">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate(-1)} />
        <div className="text-right">
          <h1 className="text-xl font-semibold text-stone-800">Akun saya</h1>
          <p className="text-sm text-stone-400 mt-0.5">Profil dan pencapaianmu</p>
        </div>
      </div>

      {/* Avatar + name */}
      <Card>
        <div className="flex flex-col items-center gap-3 py-2">
          <img
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.name}`}
            alt="avatar"
            className="w-24 h-24 rounded-full bg-stone-100 border-4 border-white shadow-md"
          />
          <div className="text-center">
            <p className="text-lg font-semibold text-stone-800">{user?.name ?? "—"}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>
            Edit profil
          </Button>
        </div>
      </Card>

      {/* Data diri */}
      {profile && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
            Data diri
          </p>
          <Card padding={false}>
            <div className="px-5">
              <InfoRow label="Usia"          value={profile.age       ? `${profile.age} tahun` : null} />
              <InfoRow label="Jenis kelamin" value={GENDER_MAP[profile.gender] ?? profile.gender}       />
              <InfoRow label="Berat badan"   value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
              <InfoRow label="Tinggi badan"  value={profile.height_cm ? `${profile.height_cm} cm` : null} />
            </div>
          </Card>
        </div>
      )}

      {/* Pencapaian */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
          Pencapaian
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MilestoneCard label="Streak terpanjang"   value={longestStreak}   unit="hari"    desc="Hari berturut-turut terbaik"    color="text-green-600"  />
          <MilestoneCard label="Streak saat ini"     value={currentStreak}   unit="hari"    desc="Terus pertahankan!"             color="text-amber-500"  />
          <MilestoneCard label="Program selesai"     value={plansFinished}   unit="program" desc="Total program yang dituntaskan" color="text-blue-500"   />
          <MilestoneCard label="Total hari tercatat" value={totalDaysLogged} unit="hari"    desc="Sejak pertama kali bergabung"   color="text-purple-500" />
        </div>
      </div>

      {/* Riwayat program */}
      {planHistory.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
            Riwayat program
          </p>
          <Card padding={false}>
            <div className="px-5">
              {planHistory.map((plan, i) => (
                <PlanHistoryRow key={plan.id} plan={plan} index={i} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}