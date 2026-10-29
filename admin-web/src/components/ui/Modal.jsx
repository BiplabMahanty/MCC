import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

const cn = (...args) => twMerge(clsx(args));

export default function Modal({
  open,
  onClose,
  title,
  children,
  confirm = false,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  loading = false,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-card rounded-xl shadow-xl border border-border', sizes[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {confirm && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
            <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
