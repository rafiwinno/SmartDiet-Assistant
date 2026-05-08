import { useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

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

const GOALS = [
  {
    value: "lose",
    label: "Turunkan berat badan",
    desc: "Defisit kalori terkontrol",
  },
  {
    value: "maintain",
    label: "Pertahankan berat",
    desc: "Seimbang sesuai kebutuhan",
  },
  {
    value: "gain",
    label: "Naikkan berat badan",
    desc: "Surplus kalori untuk massa otot",
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

const STEPS = [
  "Data diri",
  "Aktivitas & tujuan",
  "Pantangan & alergi",
  "Ringkasan",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-stone-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", suffix }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function OptionCard({ selected, onClick, label, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer
        ${
          selected
            ? "border-green-500 bg-green-50 ring-1 ring-green-500"
            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        }`}
    >
      <p
        className={`text-sm font-medium ${selected ? "text-green-800" : "text-stone-800"}`}
      >
        {label}
      </p>
      {desc && <p className="text-xs text-stone-400 mt-0.5">{desc}</p>}
    </button>
  );
}

function TagToggle({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm border transition-all cursor-pointer
        ${
          selected
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
        }`}
    >
      {label}
    </button>
  );
}

function StepIndicator({ current, total, labels }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                ${
                  i < current
                    ? "bg-green-600 text-white"
                    : i === current
                      ? "bg-stone-800 text-white"
                      : "bg-stone-200 text-stone-400"
                }`}
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
                className={`flex-1 h-px mx-2 mb-5 ${i < current ? "bg-green-400" : "bg-stone-200"}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function StepPersonal({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Data diri</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Informasi dasar untuk menghitung kebutuhan kalorimu
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldLabel required>Nama lengkap</FieldLabel>
          <TextInput
            value={data.name}
            onChange={(v) => onChange("name", v)}
            placeholder="Nama kamu"
          />
        </div>

        <div>
          <FieldLabel required>Usia</FieldLabel>
          <TextInput
            value={data.age}
            onChange={(v) => onChange("age", v)}
            placeholder="25"
            type="number"
            suffix="tahun"
          />
        </div>

        <div>
          <FieldLabel required>Jenis kelamin</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "male", label: "Laki-laki" },
              { value: "female", label: "Perempuan" },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={data.gender === opt.value}
                onClick={() => onChange("gender", opt.value)}
              />
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
}

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

      <div>
        <FieldLabel required>Tingkat aktivitas</FieldLabel>
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

      <div>
        <FieldLabel required>Tujuan utama</FieldLabel>
        <div className="flex flex-col gap-2">
          {GOALS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              desc={opt.desc}
              selected={data.goal === opt.value}
              onClick={() => onChange("goal", opt.value)}
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
  const ACTIVITY_LABEL =
    ACTIVITY_LEVELS.find((a) => a.value === data.activityLevel)?.label ?? "—";
  const GOAL_LABEL = GOALS.find((g) => g.value === data.goal)?.label ?? "—";

  const rows = [
    { label: "Nama", value: data.name || "—" },
    { label: "Usia", value: data.age ? `${data.age} tahun` : "—" },
    {
      label: "Jenis kelamin",
      value:
        data.gender === "male"
          ? "Laki-laki"
          : data.gender === "female"
            ? "Perempuan"
            : "—",
    },
    { label: "Berat badan", value: data.weight ? `${data.weight} kg` : "—" },
    { label: "Tinggi badan", value: data.height ? `${data.height} cm` : "—" },
    { label: "Tingkat aktivitas", value: ACTIVITY_LABEL },
    { label: "Tujuan", value: GOAL_LABEL },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">
          Ringkasan profil
        </h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Periksa kembali sebelum menyimpan
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
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
      </div>

      {(data.dietary?.length > 0 || data.allergies?.length > 0) && (
        <div className="bg-white border border-stone-200 rounded-xl px-5 py-4 shadow-sm">
          {data.dietary?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                Pantangan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.dietary.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
                  >
                    {d}
                  </span>
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
                  <span
                    key={a}
                    className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <p className="text-sm font-medium text-green-800 mb-0.5">
          Siap disimpan
        </p>
        <p className="text-xs text-green-700">
          Profil ini akan digunakan untuk menghitung BMR, TDEE, dan rekomendasi
          menu harianmu.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL = {
  name: "",
  age: "",
  gender: "",
  weight: "",
  height: "",
  activityLevel: "",
  goal: "",
  dietary: [],
  allergies: [],
  otherAllergies: "",
};

export default function Profile({ onSave = () => {} }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);

  const update = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const canNext = () => {
    if (step === 0)
      return data.name && data.age && data.gender && data.weight && data.height;
    if (step === 1) return data.activityLevel && data.goal;
    return true;
  };

  const handleSave = () => onSave(data);

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800">Profil saya</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Lengkapi data untuk hasil rekomendasi terbaik
        </p>
      </div>

      <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

      {/* Step content */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 shadow-sm min-h-64">
        {step === 0 && <StepPersonal data={data} onChange={update} />}
        {step === 1 && <StepActivity data={data} onChange={update} />}
        {step === 2 && <StepDietary data={data} onChange={update} />}
        {step === 3 && <StepSummary data={data} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="px-5 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Kembali
        </button>

        <span className="text-xs text-stone-400">
          {step + 1} / {STEPS.length}
        </span>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Lanjut
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all cursor-pointer"
          >
            Simpan profil
          </button>
        )}
      </div>
    </div>
  );
}
