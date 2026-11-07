import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';

export default function QuestionSetListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['question-sets', search, page],
    queryFn: () =>
      client.get('/admin/question-sets', {
        params: { page, limit: 20, ...(search && { search }) },
      }).then((r) => r.data),
  });

  const sets = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleDelete = async (id) => {
    if (!confirm('Delete this question set?')) return;
    try {
      await client.delete(`/admin/question-sets/${id}`);
      toast.success('Question set deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Question Sets</h1>
        <Button onClick={() => navigate('/question-sets/create')}>
          <Plus size={16} /> Create Set
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-text-muted" />
          <Input
            placeholder="Search sets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Questions</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Subject</th>
                <th className="text-right py-3 px-4 font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set._id} className="border-b border-border hover:bg-surface">
                  <td className="py-3 px-4 text-text-primary">{set.name}</td>
                  <td className="py-3 px-4 text-text-muted">{set.totalQuestions}</td>
                  <td className="py-3 px-4 text-text-muted">{set.subjectId?.name}</td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/question-sets/${set._id}`)}
                      className="p-2 hover:bg-surface rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-brand" />
                    </button>
                    <button
                      onClick={() => handleDelete(set._id)}
                      className="p-2 hover:bg-surface rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sets.length === 0 && (
          <p className="text-center py-8 text-text-muted">No question sets found.</p>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm text-brand disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-brand disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
