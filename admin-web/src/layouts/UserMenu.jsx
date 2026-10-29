import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import useAuth from '../auth/useAuth.jsx';
import Avatar from '../components/ui/Avatar';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface transition-colors"
      >
        <Avatar name={user?.name} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-text-primary leading-none">{user?.name}</p>
          <p className="text-[10px] text-text-muted capitalize">{user?.role}</p>
        </div>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-surface transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
