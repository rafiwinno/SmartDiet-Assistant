export default function OptionCard({ selected, onClick, label, desc }) {
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
