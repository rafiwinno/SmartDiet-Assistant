export default function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-stone-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}