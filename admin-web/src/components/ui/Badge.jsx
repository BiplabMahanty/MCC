import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const variants = {
  active: 'bg-success-surface text-success',
  inactive: 'bg-surface text-text-muted border border-border',
  success: 'bg-success-surface text-success',
  warning: 'bg-warning-surface text-warning',
  error: 'bg-error-surface text-error',
  info: 'bg-icon-bg-blue text-icon-blue',
  draft: 'bg-icon-bg-orange text-icon-orange',
  published: 'bg-brand-light text-brand',
  pending: 'bg-warning-surface text-warning',
  paid: 'bg-success-surface text-success',
  overdue: 'bg-error-surface text-error',
  waived: 'bg-surface text-text-muted',
};

export default function Badge({ variant = 'active', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.active,
        className
      )}
    >
      {children}
    </span>
  );
}
