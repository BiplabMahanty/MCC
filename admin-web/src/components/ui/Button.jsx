import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';

const cn = (...args) => twMerge(clsx(args));

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand',
  secondary: 'bg-white text-text-primary border border-border hover:bg-surface focus-visible:ring-brand',
  danger: 'bg-error text-white hover:bg-red-800 focus-visible:ring-error',
  ghost: 'text-text-primary hover:bg-surface focus-visible:ring-brand',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}
