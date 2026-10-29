import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useQuestions, useDeleteQuestion } from '../../hooks/useQuestions';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/ui/SearchInput';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import useDebounce from '../../hooks/useDebounce';
import client from '../../api/client';

const DIFFICULTY_COLORS = { easy: 'success', medium: 'warning', hard: 'error' };
const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];
const DIFFICULTIES = [
  { label: 'All Difficulties', value: '' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

function useSubjectOptions() {
  return useQuery({
    queryKey: ['subjects-select'],
    queryFn: () => client.get('/admin/subjects', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

export default function QuestionListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteQuestion = useDeleteQuestion();
  const { data: subjects = [] } = useSubjectOptions();

  const params = {
    page, limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filter !== '' && { isActive: filter }),
    ...(difficulty && { difficulty }),
    ...(subjectId && { subjectId }),
  };

  const { data, isLoading, isError, refetch } = useQuestions(params);
  const questions = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);

  const confirmDelete = async () => {
    try {
      await deleteQuestion.mutateAsync(deleting._id);
      toast.success('Question deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const subjectOptions = [{ value: '', label: 'All Subjects' }, ...subjects.map((s) => ({ value: s._id, label: s.name }))];

  const columns = [
    {
      header: 'Question',
      accessorKey: 'content',
      cell: (v) => {
        const first = v?.find((b) => b.type === 'text');
        return <p className="text-sm text-text-primary line-clamp-2">{first?.value ?? '(no text)'}</p>;
      },
    },
    { header: 'Subject', accessorKey: 'subjectId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Topic', accessorKey: 'topic', cell: (v) => v || <span className="text-text-muted">—</span> },
    {
      header: 'Difficulty',
      accessorKey: 'difficulty',
      cell: (v) => v ? <Badge variant={DIFFICULTY_COLORS[v]}>{v}</Badge> : null,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/questions/${row._id}`)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors">
            <Eye size={14} />
          </button>
          <button onClick={() => navigate(`/questions/${row._id}/edit`)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (isError) return <ErrorState title="Failed to load questions" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search questions..." className="sm:w-64" />
        <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          {subjectOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          {DIFFICULTIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => navigate('/questions/new')} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Question
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} question{pagination.total !== 1 ? 's' : ''} found</p>}

      <Table columns={columns} data={questions} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Question" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteQuestion.isPending}>
        <p className="text-sm text-text-muted">Are you sure you want to delete this question? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
