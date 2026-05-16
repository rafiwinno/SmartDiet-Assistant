import { useNavigate } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Rekomendasi Menu Harian",
    desc: "Dapatkan rekomendasi sarapan, makan siang, dan makan malam yang disesuaikan dengan kebutuhan kalori, pantangan, dan preferensi makanmu setiap hari.",
    img: "/public/images/feature-recommendation.png",
  },
  {
    title: "Kalkulasi Nutrisi Otomatis",
    desc: "BMR dan TDEE dihitung otomatis berdasarkan data tubuhmu. Target kalori harian dan makronutrien — protein, karbo, lemak — langsung tersedia tanpa perhitungan manual.",
    img: "/public/images/feature-nutrition.png",
  },
  {
    title: "Pelacak Progres & Streak",
    desc: "Pantau perjalananmu hari per hari. Sistem streak memotivasimu untuk tetap konsisten, dan progres harian membantumu melihat seberapa jauh kamu sudah melangkah.",
    img: "/public/images/feature-progress.png",
  },
  {
    title: "Database Makanan",
    desc: "Tersedia ribuan data makanan lengkap dengan kandungan protein, karbohidrat, dan lemak untuk bantu atur pola makanmu lebih mudah.",
    img: "/public/images/feature-database.png",
  },
];

const ARTICLES = [
  {
    tag: "Nutrisi",
    tagClass: "bg-emerald-100 text-emerald-700",
    title: "Mengenal Makronutrien: Protein, Karbo, dan Lemak",
    desc: "Pelajari fungsi masing-masing makronutrien dan bagaimana keseimbangannya mempengaruhi kesehatan dan berat badanmu.",
    date: "12 April 2026",
    read: "5 menit",
  },
  {
    tag: "Diet",
    tagClass: "bg-sky-100 text-sky-700",
    title: "Defisit Kalori: Cara Aman Menurunkan Berat Badan",
    desc: "Defisit kalori adalah kunci penurunan berat badan — tapi seberapa besar defisit yang aman dan efektif untuk tubuhmu?",
    date: "28 April 2026",
    read: "7 menit",
  },
  {
    tag: "Gaya Hidup",
    tagClass: "bg-orange-100 text-orange-700",
    title: "Membangun Kebiasaan Makan Sehat yang Bertahan Lama",
    desc: "Bukan soal diet ketat — ini soal membangun sistem kebiasaan kecil yang berdampak besar pada kesehatan jangka panjang.",
    date: "5 Mei 2026",
    read: "6 menit",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ onLogin }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md
      border-b border-stone-100 flex items-center justify-between px-16 h-16"
    >
      <span className="text-xl font-bold tracking-tight font-serif">
        <span className="text-teal-600">Smart</span>
        <span className="text-slate-800">Diet</span>
      </span>
      <div className="flex items-center gap-4">
        <button
          onClick={onLogin}
          className="px-5 py-2 text-sm font-semibold text-white
            bg-teal-600 hover:bg-teal-700 rounded-lg transition-all cursor-pointer border-none"
        >
          Masuk / Daftar
        </button>
      </div>
    </nav>
  );
}

function HeroSection({ onLogin }) {
  return (
    <section
      className="min-h-screen flex items-center bg-gradient-to-br
      from-teal-50 via-white to-emerald-50 pt-16"
    >
      <div className="max-w-7xl mx-auto px-16 w-full">
        <div className="grid grid-cols-2 gap-16 items-center min-h-[calc(100vh-64px)]">
          {/* Left — image */}
          <div className="relative">
            <div
              className="absolute -top-8 -left-8 w-64 h-64 bg-teal-100
              rounded-full opacity-50 blur-3xl"
            />
            <div
              className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-100
              rounded-full opacity-60 blur-2xl"
            />
            <div
              className="relative bg-white rounded-3xl overflow-hidden
              shadow-2xl border border-stone-100 aspect-square w-96 h-96 mx-auto"
            >
              <img
                src="/public/images/hero.jpg"
                alt="SmartDiet ilustrasi"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.classList.add(
                    "flex",
                    "items-center",
                    "justify-center",
                    "bg-gradient-to-br",
                    "from-teal-50",
                    "to-emerald-100",
                  );
                  e.target.insertAdjacentHTML(
                    "afterend",
                    `<div class="text-center p-8">
                      <p class="text-6xl mb-4">🥗</p>
                      <p class="text-teal-700 font-semibold text-lg">Ganti dengan gambarmu</p>
                      <p class="text-stone-400 text-sm mt-1">src: /images/hero-placeholder.png</p>
                    </div>`,
                  );
                }}
              />
            </div>
          </div>

          {/* Right — content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-bold text-slate-900 leading-tight font-serif">
              Makan Lebih Cerdas,{" "}
              <span className="text-teal-600">Hidup Lebih Sehat</span>
            </h1>

            <p className="text-lg text-stone-500 leading-relaxed">
              SmartDiet membantu kamu merencanakan pola makan harian dengan
              rekomendasi menu personal yang disesuaikan dengan tubuh, tujuan,
              dan kebiasaanmu.
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onLogin}
                className="px-8 py-3.5 text-base font-semibold text-white
                  bg-teal-600 hover:bg-teal-700 rounded-xl transition-all cursor-pointer border-none"
              >
                Mulai Sekarang — Gratis
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("fitur")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-3.5 text-base font-medium text-stone-600
                  bg-white hover:bg-stone-50 border border-stone-200
                  rounded-xl transition-all cursor-pointer"
              >
                Lihat fitur
              </button>
            </div>

            {/* Stats */}
            {/* <div className="flex gap-8 pt-6 mt-2 border-t border-stone-100">
              {[
                { value: '10.000+', label: 'Pengguna aktif'     },
                { value: '500+',    label: 'Menu makanan lokal' },
                { value: '98%',     label: 'Kepuasan pengguna'  },
              ].map(stat => (
                <div key={stat.value}>
                  <p className="text-2xl font-bold text-teal-600 font-serif">{stat.value}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="bg-teal-600 py-20 px-8 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed font-serif italic">
          "Kesehatan bukan tentang angka di timbangan — ini tentang membangun
          hubungan yang sehat dengan makanan, setiap hari."
        </p>
        <p className="text-sm text-white/60 mt-6 font-medium uppercase tracking-widest">
          — Filosofi SmartDiet
        </p>
      </div>
    </section>
  );
}

function FeatureRow({ feature, index }) {
  const isEven = index % 2 === 0;
  const imgSide = isEven ? "order-1" : "order-2";
  const textSide = isEven ? "order-2" : "order-1";
  const bgColor = isEven ? "bg-white" : "bg-stone-50";

  return (
    <section className={`${bgColor} py-24 px-16`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-20 items-center">
          {/* Image */}
          <div className={`${imgSide} relative`}>
            <div
              className={`absolute -top-6 -left-6 w-48 h-48 rounded-full blur-2xl opacity-40
              ${isEven ? "bg-teal-100" : "bg-emerald-100"}`}
            />
            <div
              className="relative bg-white rounded-3xl overflow-hidden
              shadow-xl border border-stone-100 aspect-video"
            >
              <img
                src={feature.img}
                alt={feature.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.classList.add(
                    "flex",
                    "items-center",
                    "justify-center",
                    "bg-gradient-to-br",
                    isEven ? "from-teal-50" : "from-emerald-50",
                    "to-white",
                  );
                  e.target.insertAdjacentHTML(
                    "afterend",
                    `<div class="text-center p-8">
                      <p class="text-stone-400 text-sm">${feature.img}</p>
                    </div>`,
                  );
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div className={`${textSide} flex flex-col gap-5`}>
            <h3 className="text-3xl font-bold text-slate-900 font-serif leading-snug">
              {feature.title}
            </h3>
            <p className="text-base text-stone-500 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <div id="fitur">
      <div className="bg-white py-16 px-8 text-center border-b border-stone-100">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">
          Fitur utama
        </p>
        <h2 className="text-4xl font-bold text-slate-900 font-serif mb-4">
          Semua yang kamu butuhkan
        </h2>
        <p className="text-base text-stone-500 max-w-md mx-auto leading-relaxed">
          Dari kalkulasi kalori hingga rekomendasi menu harian — SmartDiet hadir
          sebagai pendamping nutrisi personalmu.
        </p>
      </div>
      {FEATURES.map((f, i) => (
        <FeatureRow key={i} feature={f} index={i} />
      ))}
    </div>
  );
}

function ArticlesSection() {
  return (
    <section
      id="artikel"
      className="bg-gradient-to-b from-teal-50 to-white py-24 px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">
            Artikel
          </p>
          <h2 className="text-4xl font-bold text-slate-900 font-serif">
            Edukasi diet & nutrisi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((a, i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div
                className="h-44 bg-gradient-to-br from-teal-400 to-emerald-500
                flex items-center justify-center"
              >
                <span className="text-6xl font-bold font-serif text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-6">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${a.tagClass}`}
                >
                  {a.tag}
                </span>
                <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2.5">
                  {a.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed mb-4">
                  {a.desc}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span>{a.date}</span>
                  <span>·</span>
                  <span>{a.read} baca</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onLogin }) {
  return (
    <section className="bg-teal-600 py-24 px-8 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-4xl font-bold text-white font-serif mb-4 leading-tight">
          Mulai perjalanan dietmu hari ini
        </h2>
        <p className="text-base text-white/70 mb-10 leading-relaxed">
          Bergabunglah dengan ribuan pengguna yang sudah merasakan manfaat pola
          makan yang lebih terencana.
        </p>
        <button
          onClick={onLogin}
          className="px-10 py-4 text-base font-semibold text-teal-700
            bg-white hover:bg-teal-50 rounded-xl transition-all cursor-pointer border-none"
        >
          Daftar Sekarang — Gratis
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 px-16 py-12 border-t border-white/5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-lg font-bold font-serif">
            <span className="text-teal-400">Smart</span>
            <span className="text-white">Diet</span>
          </span>
          <p className="text-xs text-white/25 mt-1.5">
            Asisten nutrisi harian berbasis AI — CC26-PSU214
          </p>
        </div>
        <p className="text-xs text-white/20">
          © 2026 SmartDiet. Dibuat untuk Capstone CC26-PSU214.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");

  return (
    <div className="font-sans">
      <Navbar onLogin={goLogin} />
      <HeroSection onLogin={goLogin} />
      <QuoteSection />
      <FeaturesSection />
      <ArticlesSection />
      <CTASection onLogin={goLogin} />
      <Footer />
    </div>
  );
}
