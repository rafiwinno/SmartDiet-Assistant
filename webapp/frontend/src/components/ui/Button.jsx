const VARIANTS = {
  primary: "bg-green-600 text-white border-transparent hover:bg-green-700",
  secondary: "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
  ghost:
    "bg-transparent text-stone-400 border-transparent hover:text-stone-600 hover:bg-stone-100",
  danger: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-medium border rounded-lg transition-all cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
