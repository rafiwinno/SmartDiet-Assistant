export default function TagToggle({ label, selected, onClick }) {
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
