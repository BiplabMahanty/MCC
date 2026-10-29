import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const Textarea = forwardRef(function Textarea({ label, error, className, id, rows = 4, ...props }, ref) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-y',
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

export default Textarea;
