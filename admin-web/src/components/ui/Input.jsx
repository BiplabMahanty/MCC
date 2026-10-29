import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const Input = forwardRef(function Input({ label, error, className, id, ...props }, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-9 w-full rounded-lg border bg-white px-3 text-sm text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error focus:ring-error' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

export default Input;
