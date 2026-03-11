import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, autoClose = 0 }) {
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ touchAction: 'none' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-md max-h-[85vh] scroll-area safe-bottom">
        {title && (
          <h3 className="font-heading text-xl font-semibold text-primary mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
