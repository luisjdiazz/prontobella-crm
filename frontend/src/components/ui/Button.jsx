const variants = {
  primary: 'bg-primary text-white hover:bg-primary-deep',
  secondary: 'bg-secondary text-white hover:bg-secondary-deep',
  outline: 'border-2 border-primary text-primary hover:bg-primary-soft',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'text-primary hover:bg-primary-soft',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`font-body font-medium rounded-xl transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
