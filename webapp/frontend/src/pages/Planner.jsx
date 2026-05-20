import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FieldLabel from "../components/ui/FieldLabel";
import TextInput from "../components/ui/TextInput";
import OptionCard from "../components/ui/OptionCard";
import TagToggle from "../components/ui/TagToggle";
import Badge from "../components/ui/Badge";
import { getActivePlan, saveProfile, createPlan } from "../services/api";
import { calcMacroTargets } from "../constants/nutrition";

const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Tidak aktif",
    desc: "Kerja kantoran, jarang olahraga",
  },
  { value: "light", label: "Ringan", desc: "Olahraga ringan 1–3x seminggu" },
  { value: "moderate", label: "Sedang", desc: "Olahraga 3–5x seminggu" },
  { value: "active", label: "Aktif", desc: "Olahraga intensif 6–7x seminggu" },
  {
    value: "very_active",
    label: "Sangat aktif",
    desc: "Atlet atau kerja fisik berat",
  },
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Bebas gluten",
  "Bebas laktosa",
  "Bebas kacang",
];
const COMMON_ALLERGIES = [
  "Kacang tanah",
  "Susu",
  "Telur",
  "Ikan",
  "Udang",
  "Kedelai",
  "Gandum",
];

// PERUBAHAN: step sekarang 3 langkah (tanpa step Data Diri)
const STEPS = ["Aktivitas & tujuan", "Pantangan & alergi", "Ringkasan"];

// PERUBAHAN: BB, TB, target BB dipindah ke step ini (penambahan, bukan mengganti)
function StepActivity({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">
          Aktivitas & tujuan
        </h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Mempengaruhi perhitungan TDEE dan target kalori harianmu
        </p>
      </div>

      {/* BARU: BB, TB, target BB di step ini */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel required>Berat badan</FieldLabel>
          <TextInput
            value={data.weight}
            onChange={(v) => onChange("weight", v)}
            placeholder="65"
            type="number"
            suffix="kg"
          />
        </div>
        <div>
          <FieldLabel required>Tinggi badan</FieldLabel>
          <TextInput
            value={data.height}
            onChange={(v) => onChange("height", v)}
            placeholder="170"
            type="number"
            suffix="cm"
          />
        </div>
        <div>
          <FieldLabel required>Target Berat Badan</FieldLabel>
          <TextInput
            value={data.targetWeight}
            onChange={(v) => onChange("targetWeight", v)}
            placeholder="60"
            type="number"
            suffix="kg"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVELS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              desc={opt.desc}
              selected={data.activityLevel === opt.value}
              onClick={() => onChange("activityLevel", opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepDietary({ data, onChange }) {
  const toggle = (field, value) => {
    const current = data[field] ?? [];
    onChange(
      field,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">
          Pantangan & alergi
        </h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Opsional — digunakan untuk menyaring rekomendasi menu
        </p>
      </div>
      <div>
        <FieldLabel>Pantangan makan</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {DIETARY_RESTRICTIONS.map((item) => (
            <TagToggle
              key={item}
              label={item}
              selected={(data.dietary ?? []).includes(item)}
              onClick={() => toggle("dietary", item)}
            />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Alergi makanan</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {COMMON_ALLERGIES.map((item) => (
            <TagToggle
              key={item}
              label={item}
              selected={(data.allergies ?? []).includes(item)}
              onClick={() => toggle("allergies", item)}
            />
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-3">Tidak ada dalam daftar?</p>
        <div className="mt-1.5">
          <TextInput
            value={data.otherAllergies ?? ""}
            onChange={(v) => onChange("otherAllergies", v)}
            placeholder="Ketik alergi lainnya, pisahkan dengan koma"
          />
        </div>
      </div>
    </div>
  );
}

function StepSummary({ data }) {
  const actLabel =
    ACTIVITY_LEVELS.find((a) => a.value === data.activityLevel)?.label ?? "—";
  const goalLabel = {
    lose: "Turun berat badan",
    maintain: "Jaga berat badan",
    gain: "Naik berat badan",
  };
  const rows = [
    { label: "Berat badan", value: data.weight ? `${data.weight} kg` : "—" },
    { label: "Tinggi badan", value: data.height ? `${data.height} cm` : "—" },
    {
      label: "Target berat badan",
      value: data.targetWeight ? `${data.targetWeight} kg` : "—",
    },
    { label: "Tingkat aktivitas", value: actLabel },
    {
      label: "Tujuan diet",
      value: goalLabel[deriveGoal(data.weight, data.targetWeight)],
    },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Ringkasan plan</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Periksa kembali sebelum menyimpan
        </p>
      </div>
      <Card padding={false}>
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-3 ${i < rows.length - 1 ? "border-b border-stone-100" : ""}`}
          >
            <span className="text-sm text-stone-500">{row.label}</span>
            <span className="text-sm font-medium text-stone-800">
              {row.value}
            </span>
          </div>
        ))}
      </Card>
      {(data.dietary?.length > 0 || data.allergies?.length > 0) && (
        <Card>
          {data.dietary?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                Pantangan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.dietary.map((d) => (
                  <Badge key={d} variant="stone">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.allergies?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                Alergi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.allergies.map((a) => (
                  <Badge key={a} variant="red">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-blue-800 mb-0.5">
          Siap disimpan
        </p>
        <p className="text-xs text-blue-700">
          Profil ini akan digunakan untuk menghitung BMR, TDEE, dan membuat plan
          diet barumu.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({ current, labels }) {
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
              ${i < current ? "bg-blue-500 text-white" : i === current ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-400"}`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs whitespace-nowrap ${i === current ? "text-stone-700 font-medium" : "text-stone-400"}`}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 mb-5 ${i < current ? "bg-blue-400" : "bg-stone-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const INITIAL = {
  weight: "",
  height: "",
  targetWeight: "",
  activityLevel: "",
  dietary: [],
  allergies: [],
  otherAllergies: "",
};

function deriveGoal(weight, targetWeight) {
  const w = parseFloat(weight);
  const t = parseFloat(targetWeight);
  if (!w || !t) return "maintain";
  if (t < w) return "lose";
  if (t > w) return "gain";
  return "maintain";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Planner() {
  const [view, setView] = useState("idle"); // 'idle' | 'warning' | 'form' | 'success'
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [existingPlan, setExistingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

  // Cek apakah sudah ada plan aktif
  const handleAddPlan = async () => {
    try {
      const plan = await getActivePlan();
      setExistingPlan(plan);
      setView("warning"); // sudah ada plan → tampilkan warning
    } catch {
      setView("form"); // belum ada plan → langsung ke form
    }
  };

  const handleConfirmNew = async () => {
    // User konfirmasi → lanjut ke form (backend akan deactivate saat POST /diet-plans)
    setView("form");
  };

  const canNext = () => {
    if (step === 0)
      return (
        data.weight && data.height && data.targetWeight && data.activityLevel
      );
    return true;
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Simpan profil & hitung BMR/TDEE
      const profileResult = await saveProfile(data);
      // 2. Buat plan baru (backend otomatis nonaktifkan plan lama di sini)
      const planResult = await createPlan();
      setResult({ profile: profileResult, plan: planResult });
      setView("success");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError("Data tidak lengkap. Pastikan semua field sudah diisi.");
      } else {
        setError(detail || "Gagal menyimpan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Tampilan awal (idle) ─────────────────────────────────────────────────
  if (view === "idle") {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Kelola plan diet-mu di sini
          </p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <button
            onClick={handleAddPlan}
            className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 border-dashed
              flex items-center justify-center text-3xl text-blue-400
              hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer mb-4"
          >
            +
          </button>
          <p className="text-sm font-medium text-stone-700 mb-1">Tambah Plan</p>
          <p className="text-xs text-stone-400">
            Buat plan baru untuk memulai perjalanan dietmu
          </p>
        </div>
      </div>
    );
  }

  // ─── Warning popup (sudah ada plan aktif) ────────────────────────────────
  if (view === "warning") {
    return (
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
        </div>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="text-2xl mb-3">⚠️</div>
            <p className="text-base font-semibold text-stone-800 mb-2">
              Kamu masih punya plan aktif
            </p>
            <p className="text-sm text-stone-500 mb-1">
              Plan{" "}
              <span className="font-medium text-stone-700">
                "{existingPlan?.name}"
              </span>{" "}
              akan ditandai sebagai{" "}
              <span className="font-medium text-red-500">tidak selesai</span>{" "}
              dan tidak bisa diubah lagi.
            </p>
            <p className="text-sm text-stone-500 mb-5">
              Plan tersebut akan tetap tersimpan di riwayatmu di halaman
              History.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setView("idle")}
              >
                Batal
              </Button>
              <Button fullWidth onClick={handleConfirmNew}>
                Ya, buat plan baru
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sukses ───────────────────────────────────────────────────────────────
  // ─── Sukses ───────────────────────────────────────────────────────────────
  if (view === "success" && result) {
    const plan = result.plan;
    const profile = result.profile;

    const macros = plan.calorie_target
      ? calcMacroTargets(plan.calorie_target, plan.goal)
      : { protein: "—", carbs: "—", fat: "—" };

    const startDate = new Date(plan.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const deficitColor = plan.calorie_deficit
      ? plan.calorie_deficit > 0
        ? "text-rose-500"
        : "text-blue-600"
      : "text-stone-400";

    const deficitLabel = plan.calorie_deficit
      ? plan.calorie_deficit > 0
        ? `−${plan.calorie_deficit} kcal`
        : `+${Math.abs(plan.calorie_deficit)} kcal`
      : "—";

    const ACTIVITY_LABEL = {
      sedentary: "Tidak aktif",
      light: "Ringan",
      moderate: "Sedang",
      active: "Aktif",
      very_active: "Sangat aktif",
    };

    const goal = deriveGoal(data.weight, data.targetWeight);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        {/* Modal */}
        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(0,0,0,0.22)] animate-in fade-in zoom-in-95 duration-300">
          {/* Background glows */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[320px_1fr]">
            {/* LEFT PANEL */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-blue-500 to-teal-500 px-6 py-6 text-white">
              <div className="absolute inset-0 bg-black/[0.03]" />

              <div className="relative flex h-full flex-col">
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/20 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-500">
                    ✓
                  </div>
                </div>

                {/* Title */}
                <div className="mt-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] font-semibold tracking-wide">
                    <div className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" />
                    PLAN AKTIF
                  </div>

                  <h2 className="mt-4 text-3xl font-black leading-tight">
                    Plan Berhasil Dibuat
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Program diet kamu sudah siap dimulai. Tinggal konsisten dan
                    ikuti target harianmu ✨
                  </p>
                </div>

                {/* Plan Name */}
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Nama Plan
                  </p>

                  <p className="mt-2 text-lg font-bold">{plan.name}</p>
                </div>

                {/* Calories */}
                <div className="mt-4 rounded-2xl bg-white text-stone-900 p-5 shadow-xl">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
                    Target Kalori
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <h3 className="text-4xl font-black tracking-tight text-blue-600">
                      {plan.calorie_target}
                    </h3>

                    <span className="mb-1 text-sm text-stone-400">kcal</span>
                  </div>
                </div>

                {/* Quote */}
                <div className="mt-auto pt-5">
                  <p className="text-xs leading-relaxed text-white/75 italic">
                    “Konsistensi kecil setiap hari menghasilkan perubahan
                    besar.”
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="px-6 py-6">
              {/* Top meta */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Mulai",
                    value: startDate,
                  },
                  {
                    label: "Durasi",
                    value: "30 Hari",
                  },
                  {
                    label: "Selesai",
                    value: plan.estimated_end_date,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
                      {label}
                    </p>

                    <p className="mt-1.5 text-sm font-bold text-stone-800 leading-snug">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                {/* Macros */}
                <div className="rounded-3xl border border-stone-100 bg-stone-50/70 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">
                      Makronutrien
                    </h3>

                    <span className="text-[10px] text-stone-400">
                      Daily Intake
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: "Protein",
                        value: macros.protein,
                        unit: "g",
                        color: "text-orange-500",
                        bg: "bg-orange-50",
                      },
                      {
                        label: "Karbo",
                        value: macros.carbs,
                        unit: "g",
                        color: "text-amber-500",
                        bg: "bg-amber-50",
                      },
                      {
                        label: "Lemak",
                        value: macros.fat,
                        unit: "g",
                        color: "text-sky-500",
                        bg: "bg-sky-50",
                      },
                    ].map(({ label, value, unit, color, bg }) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${bg}`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-stone-700">
                            {label}
                          </p>

                          <p className="text-[10px] text-stone-400">per hari</p>
                        </div>

                        <div className="flex items-end gap-1">
                          <p className={`text-2xl font-black ${color}`}>
                            {value}
                          </p>

                          <span className="mb-0.5 text-xs text-stone-400">
                            {unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weight Info */}
                <div className="rounded-3xl border border-stone-100 bg-stone-50/70 p-5">
                  <h3 className="text-sm font-bold text-stone-800">
                    Progress Target
                  </h3>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: "Berat Saat Ini",
                        value: plan.weight_at_start
                          ? `${plan.weight_at_start} kg`
                          : "—",
                      },
                      {
                        label: "Target Berat",
                        value: plan.target_weight_kg
                          ? `${plan.target_weight_kg} kg`
                          : "—",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl bg-white px-4 py-4 shadow-sm"
                      >
                        <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
                          {label}
                        </p>

                        <p className="mt-2 text-2xl font-black text-stone-800">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal Badge */}
              <div className="mt-5 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
                    Goal
                  </p>

                  <p className="mt-3 text-2xl font-black tracking-widest text-stone-800">
                    {
                      {
                        lose: "Cutting",
                        maintain: "Maintain",
                        gain: "Bulking",
                      }[goal]
                    }
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className="mt-5 flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  className="h-11 rounded-2xl border-stone-200 text-sm hover:bg-stone-100"
                  onClick={() => {
                    setView("idle");
                    setData(INITIAL);
                    setStep(0);
                  }}
                >
                  Tutup
                </Button>

                <Button
                  fullWidth
                  className="h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-sm shadow-lg hover:opacity-95"
                  onClick={() => navigate("/")}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form 3 langkah ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800">Planner</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Lengkapi data untuk hasil rekomendasi terbaik
        </p>
      </div>

      <StepIndicator current={step} labels={STEPS} />

      <Card className="min-h-64">
        {step === 0 && <StepActivity data={data} onChange={update} />}
        {step === 1 && <StepDietary data={data} onChange={update} />}
        {step === 2 && <StepSummary data={data} />}
      </Card>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-5">
        <Button
          variant="secondary"
          onClick={() => (step === 0 ? setView("idle") : setStep((s) => s - 1))}
        >
          Kembali
        </Button>
        <span className="text-xs text-stone-400">
          {step + 1} / {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
            Lanjut
          </Button>
        ) : (
          <Button disabled={loading} onClick={handleSave}>
            {loading ? "⏳ Menyimpan..." : "Simpan & buat plan"}
          </Button>
        )}
      </div>
    </div>
  );
}
