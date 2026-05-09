const VARIANTS = {
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  stone: "bg-stone-100 text-stone-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function Badge({ children, variant = "stone", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
