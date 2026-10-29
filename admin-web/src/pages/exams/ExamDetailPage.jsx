import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Undo2, Eye, EyeOff } from 'lucide-react';
import { useExam, usePublishExam, useUnpublishExam, useExamResults, usePublishResults, useUnpublishResults } from '../../hooks/useExams';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';

const STATUS_COLORS = { draft: 'draft', published: 'published', cancelled: 'error' };
const EXAM_TYPE_LABELS = {
  practice: 'Practice', unit_test: 'Unit Test', mid_term: 'Mid Term',
  final: 'Final', mock: 'Mock',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs text-text-muted w-36 shrink-0">{label}</span>
      <span className="text-sm text-text-primary">{value ?? '—'}</span>
    </div>
  );
}

function ResultsTab({ examId }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [publishingResults, setPublishingResults] = useState(false);
  const [unpublishingResults, setUnpublishingResults] = useState(false);

  const { data, isLoading, isError, refetch } = useExamResults(examId, { page, limit: 20 });
  const publishResults = usePublishResults();
  const unpublishResults = useUnpublishResults();

  const results = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const meta = data?.meta ?? {};

  const confirmPublishResults = async () => {
    try {
      await publishResults.mutateAsync(examId);
      toast.success('Results published.');
      setPublishingResults(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to publish results.');
    }
  };

  const confirmUnpublishResults = async () => {
    try {
      await unpublishResults.mutateAsync(examId);
      toast.success('Results unpublished.');
      setUnpublishingResults(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to unpublish results.');
    }
  };

  const columns = [
    {
      header: 'Student',
      accessorKey: 'studentId',
      cell: (v) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{v?.name ?? '—'}</p>
          <p className="text-xs text-text-muted">{v?.email ?? ''}</p>
        </div>
      ),
    },
    { header: 'Score', accessorKey: 'obtainedMarks', cell: (v, row) => `${v ?? 0} / ${row.totalMarks ?? '—'}` },
    { header: '%', accessorKey: 'percentage', cell: (v) => v != null ? `${v.toFixed(1)}%` : '—' },
    { header: 'Correct', accessorKey: 'correctAnswers' },
    { header: 'Wrong', accessorKey: 'wrongAnswers' },
    { header: 'Unanswered', accessorKey: 'unanswered' },
    {
      header: 'Status',
      accessorKey: 'isPublished',
      cell: (v) => <Badge variant={v ? 'published' : 'draft'}>{v ? 'Published' : 'Hidden'}</Badge>,
    },
  ];

  if (isError) return <ErrorState title="Failed to load results" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {meta.resultsPublished ? (
          <Button size="sm" variant="outline" onClick={() => setUnpublishingResults(true)}>
            <EyeOff size={14} /> Unpublish Results
          </Button>
        ) : (
          <Button size="sm" onClick={() => setPublishingResults(true)} disabled={results.length === 0}>
            <Eye size={14} /> Publish Results
          </Button>
        )}
        {results.length > 0 && (
          <span className="text-xs text-text-muted">{results.length} result{results.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <Table columns={columns} data={results} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={publishingResults} onClose={() => setPublishingResults(false)} title="Publish Results" confirm confirmLabel="Publish" onConfirm={confirmPublishResults} loading={publishResults.isPending}>
        <p className="text-sm text-text-muted">Make all results visible to students?</p>
      </Modal>

      <Modal open={unpublishingResults} onClose={() => setUnpublishingResults(false)} title="Unpublish Results" confirm confirmLabel="Unpublish" confirmVariant="danger" onConfirm={confirmUnpublishResults} loading={unpublishResults.isPending}>
        <p className="text-sm text-text-muted">Hide results from students?</p>
      </Modal>
    </div>
  );
}

export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  const { data: exam, isLoading, isError, refetch } = useExam(id);
  const publishExam = usePublishExam();
  const unpublishExam = useUnpublishExam();

  const confirmPublish = async () => {
    try {
      await publishExam.mutateAsync(id);
      toast.success('Exam published.');
      setPublishing(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Publish failed.');
    }
  };

  const confirmUnpublish = async () => {
    try {
      await unpublishExam.mutateAsync(id);
      toast.success('Exam unpublished.');
      setUnpublishing(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Unpublish failed.');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (isError || !exam) return <ErrorState title="Exam not found" onRetry={refetch} />;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/exams')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Exams
        </button>
        <div className="flex-1" />
        {exam.status !== 'published' && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/exams/${id}/edit`)}>
            <Pencil size={14} /> Edit
          </Button>
        )}
        {exam.status === 'draft' && (
          <Button size="sm" onClick={() => setPublishing(true)}>
            <Send size={14} /> Publish
          </Button>
        )}
        {exam.status === 'published' && (
          <Button size="sm" variant="outline" onClick={() => setUnpublishing(true)}>
            <Undo2 size={14} /> Unpublish
          </Button>
        )}
      </div>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{exam.name}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {EXAM_TYPE_LABELS[exam.examType] ?? exam.examType} · {exam.academicSession}
            </p>
          </div>
          <Badge variant={STATUS_COLORS[exam.status] ?? 'info'}>{exam.status}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {['overview', 'results'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <InfoRow label="Batch" value={exam.batchId?.name} />
          <InfoRow label="Subject" value={exam.subjectId?.name} />
          <InfoRow label="Teachers" value={exam.teacherIds?.map((t) => t.name).join(', ') || '—'} />
          <InfoRow label="Start Time" value={fmt(exam.startTime)} />
          <InfoRow label="End Time" value={fmt(exam.endTime)} />
          <InfoRow label="Duration" value={`${exam.durationMinutes} minutes`} />
          <InfoRow label="Total Marks" value={exam.totalMarks} />
          <InfoRow label="Marks / Question" value={exam.marksPerQuestion} />
          <InfoRow label="Negative Marking" value={exam.negativeMarking ? `Yes (−${exam.negativeMarks} per wrong)` : 'No'} />
          <InfoRow label="Questions" value={exam.questionIds?.length ?? 0} />
          {exam.instructions && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-muted mb-1">Instructions</p>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{exam.instructions}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'results' && <ResultsTab examId={id} />}

      <Modal open={publishing} onClose={() => setPublishing(false)} title="Publish Exam" confirm confirmLabel="Publish" onConfirm={confirmPublish} loading={publishExam.isPending}>
        <p className="text-sm text-text-muted">Publish <strong className="text-text-primary">{exam.name}</strong>? Questions will be snapshotted and the exam becomes read-only.</p>
      </Modal>

      <Modal open={unpublishing} onClose={() => setUnpublishing(false)} title="Unpublish Exam" confirm confirmLabel="Unpublish" confirmVariant="danger" onConfirm={confirmUnpublish} loading={unpublishExam.isPending}>
        <p className="text-sm text-text-muted">Unpublish <strong className="text-text-primary">{exam.name}</strong>? The question snapshot will be cleared.</p>
      </Modal>
    </div>
  );
}
