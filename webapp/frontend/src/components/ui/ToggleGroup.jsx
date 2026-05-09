export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex bg-stone-100 rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer
            ${
              value === opt.value
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
