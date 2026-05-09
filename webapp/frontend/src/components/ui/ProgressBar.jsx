export default function ProgressBar({
  value = 0,
  max = 100,
  color = "#16a34a",
  className = "",
}) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div
      className={`h-1.5 bg-stone-100 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
