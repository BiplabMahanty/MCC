import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface mb-4">
        <Icon size={24} className="text-text-muted" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs mb-4">{description}</p>}
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
