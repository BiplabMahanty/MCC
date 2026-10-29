import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Send, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useExams, useDeleteExam, usePublishExam, useUnpublishExam } from '../../hooks/useExams';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import client from '../../api/client';

const STATUS_COLORS = { draft: 'draft', published: 'published', cancelled: 'error' };
const EXAM_TYPE_LABELS = {
  practice: 'Practice', unit_test: 'Unit Test', mid_term: 'Mid Term',
  final: 'Final', mock: 'Mock',
};
const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Cancelled', value: 'cancelled' },
];

function useBatchOptions() {
  return useQuery({
    queryKey: ['batches-select'],
    queryFn: () => client.get('/admin/batches', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}
function useSubjectOptions() {
  return useQuery({
    queryKey: ['subjects-select'],
    queryFn: () => client.get('/admin/subjects', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ExamListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [batchId, setBatchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [unpublishing, setUnpublishing] = useState(null);

  const deleteExam = useDeleteExam();
  const publishExam = usePublishExam();
  const unpublishExam = useUnpublishExam();
  const { data: batches = [] } = useBatchOptions();
  const { data: subjects = [] } = useSubjectOptions();

  const params = {
    page, limit: 20,
    ...(status && { status }),
    ...(batchId && { batchId }),
    ...(subjectId && { subjectId }),
  };

  const { data, isLoading, isError, refetch } = useExams(params);
  const exams = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const confirmDelete = async () => {
    try {
      await deleteExam.mutateAsync(deleting._id);
      toast.success('Exam deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const confirmPublish = async () => {
    try {
      await publishExam.mutateAsync(publishing._id);
      toast.success('Exam published.');
      setPublishing(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Publish failed.');
    }
  };

  const confirmUnpublish = async () => {
    try {
      await unpublishExam.mutateAsync(unpublishing._id);
      toast.success('Exam unpublished.');
      setUnpublishing(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Unpublish failed.');
    }
  };

  const columns = [
    {
      header: 'Exam',
      accessorKey: 'name',
      cell: (v, row) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{v}</p>
          <p className="text-xs text-text-muted">{EXAM_TYPE_LABELS[row.examType] ?? row.examType} · {row.academicSession}</p>
        </div>
      ),
    },
    { header: 'Batch', accessorKey: 'batchId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Subject', accessorKey: 'subjectId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Start', accessorKey: 'startTime', cell: (v) => <span className="text-xs">{fmt(v)}</span> },
    { header: 'Duration', accessorKey: 'durationMinutes', cell: (v) => `${v} min` },
    { header: 'Marks', accessorKey: 'totalMarks' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (v) => <Badge variant={STATUS_COLORS[v] ?? 'info'}>{v}</Badge>,
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/exams/${row._id}`)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="View">
            <Eye size={14} />
          </button>
          {row.status !== 'published' && (
            <button onClick={() => navigate(`/exams/${row._id}/edit`)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="Edit">
              <Pencil size={14} />
            </button>
          )}
          {row.status === 'draft' && (
            <button onClick={() => setPublishing(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-success transition-colors" title="Publish">
              <Send size={14} />
            </button>
          )}
          {row.status === 'published' && (
            <button onClick={() => setUnpublishing(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-warning transition-colors" title="Unpublish">
              <Undo2 size={14} />
            </button>
          )}
          {row.status !== 'published' && (
            <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isError) return <ErrorState title="Failed to load exams" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <select value={batchId} onChange={(e) => { setBatchId(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${status === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => navigate('/exams/new')} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Exam
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} exam{pagination.total !== 1 ? 's' : ''} found</p>}

      <Table columns={columns} data={exams} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Exam" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteExam.isPending}>
        <p className="text-sm text-text-muted">Delete <strong className="text-text-primary">{deleting?.name}</strong>? This cannot be undone.</p>
      </Modal>

      <Modal open={!!publishing} onClose={() => setPublishing(null)} title="Publish Exam" confirm confirmLabel="Publish" onConfirm={confirmPublish} loading={publishExam.isPending}>
        <p className="text-sm text-text-muted">Publish <strong className="text-text-primary">{publishing?.name}</strong>? Questions will be snapshotted and the exam becomes read-only.</p>
      </Modal>

      <Modal open={!!unpublishing} onClose={() => setUnpublishing(null)} title="Unpublish Exam" confirm confirmLabel="Unpublish" confirmVariant="danger" onConfirm={confirmUnpublish} loading={unpublishExam.isPending}>
        <p className="text-sm text-text-muted">Unpublish <strong className="text-text-primary">{unpublishing?.name}</strong>? The question snapshot will be cleared and the exam returns to draft.</p>
      </Modal>
    </div>
  );
}
