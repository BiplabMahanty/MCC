import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendDown }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {trend != null && (
          <p className={cn('flex items-center gap-1 text-xs mt-1 font-medium', trendDown ? 'text-error' : 'text-success')}>
            {trendDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {trend} this month
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('p-2.5 rounded-lg shrink-0', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      )}
    </div>
  );
}
