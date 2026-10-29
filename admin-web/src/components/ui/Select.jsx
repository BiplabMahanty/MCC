import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, id, ...props },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'h-9 w-full rounded-lg border bg-white px-3 text-sm text-text-primary',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error focus:ring-error' : 'border-border',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

export default Select;
