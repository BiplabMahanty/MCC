import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const cn = (...a) => twMerge(clsx(a));

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () =>
    setCollapsed((v) => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-200',
          'lg:ml-60',
          collapsed && 'lg:ml-16'
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
