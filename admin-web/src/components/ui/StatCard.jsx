import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendDown }) {
  return (
    <div className="group bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md">
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-text-primary mt-1">{value}</p>
        {trend != null && (
          <p className={cn('flex items-center gap-1 text-xs mt-1 font-medium', trendDown ? 'text-error' : 'text-success')}>
            {trendDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {trend} this month
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      )}
    </div>
  );
}
