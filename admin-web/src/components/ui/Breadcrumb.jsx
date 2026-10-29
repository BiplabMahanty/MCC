import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-text-muted" />}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-text-primary font-medium' : 'text-text-muted'}>
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="text-text-muted hover:text-brand transition-colors">
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
