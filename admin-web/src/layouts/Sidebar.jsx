import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { NAV } from '../routes/nav.js';

const cn = (...a) => twMerge(clsx(a));

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();

  const isActive = (path) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-brand flex flex-col transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
          // Mobile: slide in/out
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3 shrink-0 border-b border-white/10">
          {!collapsed && (
            <span className="text-white font-bold text-sm truncate">Coaching Admin</span>
          )}
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 ml-auto"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-thin">
          {NAV.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.section}
                </p>
              )}
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <div key={item.path} className="relative group px-2">
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-white/15 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                    {/* Tooltip in collapsed mode */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                          {item.label}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
