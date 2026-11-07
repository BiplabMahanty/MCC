import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Spinner from './Spinner';
import client from '../../api/client';

export default function QuestionSetSelector({ value, onChange, subjectId }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['question-sets-select', search, subjectId, page],
    queryFn: () =>
      client.get('/admin/question-sets', {
        params: { page, limit: 10, ...(search && { search }), ...(subjectId && { subjectId }) },
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  const sets = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border bg-surface flex items-center gap-2">
        <Search size={14} className="text-text-muted shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search question sets..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        )}
        {!isLoading && sets.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No question sets found.</p>
        )}
        {sets.map((set) => (
          <label key={set._id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface transition-colors ${value === set._id ? 'bg-brand/5' : ''}`}>
            <input
              type="radio"
              name="questionSet"
              value={set._id}
              checked={value === set._id}
              onChange={() => onChange(set._id)}
              className="mt-0.5 accent-brand"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium">{set.name}</p>
              {set.description && (
                <p className="text-xs text-text-muted line-clamp-1">{set.description}</p>
              )}
              <p className="text-xs text-text-muted mt-1">{set.totalQuestions} questions</p>
            </div>
          </label>
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs text-brand disabled:opacity-40">← Prev</button>
          <span className="text-xs text-text-muted">Page {page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="text-xs text-brand disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
