export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}
      <input
        className={`px-4 py-3 rounded-xl border-2 font-body text-base
          bg-surface text-text placeholder:text-text-light
          focus:outline-none focus:border-primary transition-colors
          ${error ? 'border-danger' : 'border-gray-200'}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
