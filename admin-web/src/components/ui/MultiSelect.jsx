import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

export default function MultiSelect({ label, options = [], value = [], onChange, max, error, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, id]);
    }
  };

  const selected = options.filter((o) => value.includes(o.value));

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && <label className="text-sm font-medium text-text-primary">{label}{max ? ` (max ${max})` : ''}</label>}
      <div
        className={cn(
          'min-h-9 w-full rounded-lg border bg-white px-3 py-1.5 text-sm cursor-pointer flex flex-wrap gap-1 items-center',
          'focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent',
          error ? 'border-error' : 'border-border',
        )}
        onClick={() => setOpen((o) => !o)}
      >
        {selected.length === 0 && <span className="text-text-muted">{placeholder}</span>}
        {selected.map((o) => (
          <span key={o.value} className="flex items-center gap-1 bg-brand-light text-brand text-xs px-2 py-0.5 rounded-md">
            {o.label}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(o.value); }}>
              <X size={10} />
            </button>
          </span>
        ))}
        <ChevronDown size={14} className="ml-auto text-text-muted shrink-0" />
      </div>

      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.length === 0 && <p className="px-3 py-2 text-sm text-text-muted">No options</p>}
            {options.map((o) => {
              const checked = value.includes(o.value);
              const disabled = !checked && max && value.length >= max;
              return (
                <div
                  key={o.value}
                  onClick={() => !disabled && toggle(o.value)}
                  className={cn(
                    'px-3 py-2 text-sm flex items-center gap-2 cursor-pointer',
                    checked ? 'bg-brand-light text-brand' : 'hover:bg-surface text-text-primary',
                    disabled && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <input type="checkbox" readOnly checked={checked} className="accent-brand" />
                  {o.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
