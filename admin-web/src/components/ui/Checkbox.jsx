import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const Checkbox = forwardRef(function Checkbox({ label, error, className, id, ...props }, ref) {
  const checkId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={checkId} className={cn('flex items-center gap-2 cursor-pointer', props.disabled && 'opacity-50 cursor-not-allowed')}>
        <input
          ref={ref}
          type="checkbox"
          id={checkId}
          className={cn(
            'h-4 w-4 rounded border-border text-brand',
            'focus:ring-2 focus:ring-brand focus:ring-offset-1',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

export default Checkbox;
