export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
