import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NAV } from '../routes/nav.js';
import UserMenu from './UserMenu';
import Breadcrumb from '../components/ui/Breadcrumb';

function getRouteInfo(pathname) {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)) {
        return { label: item.label, section: group.section };
      }
    }
  }
  return { label: 'Page', section: '' };
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { label, section } = getRouteInfo(pathname);

  const crumbs = [
    { label: 'Home', href: '/dashboard' },
    ...(section && section !== 'Dashboard' ? [{ label: section }] : []),
    { label },
  ];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-text-primary truncate">{label}</h1>
          <div className="hidden sm:block">
            <Breadcrumb items={crumbs} />
          </div>
        </div>
      </div>
      <UserMenu />
    </header>
  );
}
