import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getCurrentUser } from "../services/api";

// ─── Avatar presets ───────────────────────────────────────────────────────────

const AVATAR_PRESETS = [
  "nutriwise",
  "healthy",
  "active",
  "balance",
  "fresh",
  "green",
  "vital",
  "strong",
];

function avatarUrl(seed) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarPicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <img
          src={avatarUrl(selected)}
          alt="avatar"
          className="w-24 h-24 rounded-full bg-stone-100 border-4 border-white shadow-md"
        />
        <button
          onClick={() => setOpen((v) => !v)}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 rounded-full
            flex items-center justify-center text-white text-xs shadow cursor-pointer
            hover:bg-green-700 transition-all"
        >
          ✎
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-4 gap-2 p-3 bg-white border border-stone-200 rounded-xl shadow-lg">
          {AVATAR_PRESETS.map((seed) => (
            <button
              key={seed}
              onClick={() => {
                onChange(seed);
                setOpen(false);
              }}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                ${selected === seed ? "border-green-500" : "border-transparent hover:border-stone-300"}`}
            >
              <img src={avatarUrl(seed)} alt={seed} className="w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
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
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-none">
      <div
        className="w-7 h-7 rounded-full bg-green-50 border border-green-200
        flex items-center justify-center text-xs font-semibold text-green-600 shrink-0"
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-800">{plan.label}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {plan.duration} hari · selesai {plan.finishedAt}
        </p>
      </div>
      <Badge variant="green">Selesai</Badge>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Account({
  profile = {
    name: getCurrentUser().name,
    email: `${getCurrentUser().name}@gmail.com`,
    age: 24,
    gender: "Laki-laki",
    weight_kg: 68,
    height_cm: 172,
    activity_level: "Sedang",
    goal: "Turunkan berat badan",
    calorie_target: 1800,
  },
  milestones = {
    currentStreak: 5,
    longestStreak: 12,
    plansFinished: 2,
    totalDaysLogged: 38,
  },
  planHistory = [
    { label: "Program pertama", duration: 30, finishedAt: "12 Mar 2026" },
    { label: "Program kedua", duration: 41, finishedAt: "28 Apr 2026" },
  ],
  onEditProfile = () => {},
}) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatar_seed") ?? "nutriwise",
  );

  const handleAvatarChange = (seed) => {
    setAvatar(seed);
    localStorage.setItem("avatar_seed", seed);
  };

  const GENDER_MAP = { male: "Laki-laki", female: "Perempuan" };
  const ACTIVITY_MAP = {
    sedentary: "Tidak aktif",
    light: "Ringan",
    moderate: "Sedang",
    active: "Aktif",
    very_active: "Sangat aktif",
  };
  const GOAL_MAP = {
    lose: "Turunkan berat badan",
    maintain: "Pertahankan berat",
    gain: "Naikkan berat badan",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Akun saya</h1>
        <p className="text-sm text-stone-400 mt-0.5">Profil dan pencapaianmu</p>
      </div>

      {/* Avatar + name */}
      <Card>
        <div className="flex flex-col items-center gap-3 py-2">
          <AvatarPicker selected={avatar} onChange={handleAvatarChange} />
          <div className="text-center">
            <p className="text-lg font-semibold text-stone-800">
              {profile.name}
            </p>
            <p className="text-sm text-stone-400">{profile.email}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            Edit profil
          </Button>
        </div>
      </Card>

      {/* Basic info */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
          Data diri
        </p>
        <Card padding={false}>
          <div className="px-5">
            <InfoRow
              label="Usia"
              value={profile.age ? `${profile.age} tahun` : null}
            />
            <InfoRow
              label="Jenis kelamin"
              value={GENDER_MAP[profile.gender] ?? profile.gender}
            />
            <InfoRow
              label="Berat badan"
              value={profile.weight_kg ? `${profile.weight_kg} kg` : null}
            />
            <InfoRow
              label="Tinggi badan"
              value={profile.height_cm ? `${profile.height_cm} cm` : null}
            />
            <InfoRow
              label="Tingkat aktivitas"
              value={
                ACTIVITY_MAP[profile.activity_level] ?? profile.activity_level
              }
            />
            <InfoRow
              label="Tujuan"
              value={GOAL_MAP[profile.goal] ?? profile.goal}
            />
            <InfoRow
              label="Target kalori"
              value={
                profile.calorie_target
                  ? `${profile.calorie_target} kcal/hari`
                  : null
              }
            />
          </div>
        </Card>
      </div>

      {/* Milestones */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
          Pencapaian
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MilestoneCard
            label="Streak terpanjang"
            value={milestones.longestStreak}
            unit="hari"
            desc="Hari berturut-turut terbaik"
            color="text-green-600"
          />
          <MilestoneCard
            label="Streak saat ini"
            value={milestones.currentStreak}
            unit="hari"
            desc="Terus pertahankan!"
            color="text-amber-500"
          />
          <MilestoneCard
            label="Program selesai"
            value={milestones.plansFinished}
            unit="program"
            desc="Total program yang dituntaskan"
            color="text-blue-500"
          />
          <MilestoneCard
            label="Total hari tercatat"
            value={milestones.totalDaysLogged}
            unit="hari"
            desc="Sejak pertama kali bergabung"
            color="text-purple-500"
          />
        </div>
      </div>

      {/* Plan history */}
      {planHistory.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-stone-400 mb-2.5">
            Riwayat program
          </p>
          <Card padding={false}>
            <div className="px-5">
              {planHistory.map((plan, i) => (
                <PlanHistoryRow key={i} plan={plan} index={i} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
