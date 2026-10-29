import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

export function Card({ className, children }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between px-5 py-4 border-b border-border', className)}>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
