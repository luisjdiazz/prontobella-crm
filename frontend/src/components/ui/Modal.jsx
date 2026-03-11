import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, autoClose = 0 }) {
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl p-6 w-full max-w-md animate-in">
        {title && (
          <h3 className="font-heading text-xl font-semibold text-primary mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
