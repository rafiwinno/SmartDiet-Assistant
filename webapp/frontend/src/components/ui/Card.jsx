export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`bg-white border border-stone-200 rounded-2xl shadow-sm ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
