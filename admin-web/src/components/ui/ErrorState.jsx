import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-surface mb-4">
        <AlertCircle size={24} className="text-error" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs mb-4">{description}</p>}
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
