export default function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}) {
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
