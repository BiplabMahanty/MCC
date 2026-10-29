import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { useExam, useCreateExam, useUpdateExam } from '../../hooks/useExams';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Checkbox from '../../components/ui/Checkbox';
import MultiSelect from '../../components/ui/MultiSelect';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import client from '../../api/client';

const EXAM_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final' },
  { value: 'mock', label: 'Mock' },
];
const DIFFICULTIES = { easy: 'success', medium: 'warning', hard: 'error' };

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
function useTeacherOptions() {
  return useQuery({
    queryKey: ['teachers-select'],
    queryFn: () => client.get('/admin/teachers', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

function QuestionPicker({ selectedIds, onChange, subjectId }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['questions-pick', search, subjectId, page],
    queryFn: () =>
      client.get('/admin/questions', {
        params: { page, limit: 10, isActive: 'true', ...(search && { search }), ...(subjectId && { subjectId }) },
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  const questions = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const toggle = (q) => {
    if (selectedIds.includes(q._id)) {
      onChange(selectedIds.filter((id) => id !== q._id));
    } else {
      onChange([...selectedIds, q._id]);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border bg-surface flex items-center gap-2">
        <Search size={14} className="text-text-muted shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search questions..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        <span className="text-xs text-text-muted">{selectedIds.length} selected</span>
      </div>
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        )}
        {!isLoading && questions.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No questions found.</p>
        )}
        {questions.map((q) => {
          const firstText = q.content?.find((b) => b.type === 'text');
          const checked = selectedIds.includes(q._id);
          return (
            <label key={q._id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface transition-colors ${checked ? 'bg-brand/5' : ''}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(q)} className="mt-0.5 accent-brand" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary line-clamp-1">{firstText?.value ?? '(no text)'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {q.topic && <span className="text-xs text-text-muted">{q.topic}</span>}
                  {q.difficulty && <Badge variant={DIFFICULTIES[q.difficulty]} className="text-xs">{q.difficulty}</Badge>}
                </div>
              </div>
            </label>
          );
        })}
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

function toLocalDatetimeValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ExamFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: exam, isLoading: examLoading } = useExam(id);
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const { data: batches = [] } = useBatchOptions();
  const { data: subjects = [] } = useSubjectOptions();
  const { data: teachers = [] } = useTeacherOptions();

  const [questionIds, setQuestionIds] = useState([]);
  const [teacherIds, setTeacherIds] = useState([]);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [watchedSubjectId, setWatchedSubjectId] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { negativeMarking: false, negativeMarks: 0 },
  });

  const subjectIdValue = watch('subjectId');

  useEffect(() => {
    setWatchedSubjectId(subjectIdValue || '');
  }, [subjectIdValue]);

  useEffect(() => {
    if (!isEdit || !exam) return;
    reset({
      name: exam.name ?? '',
      examType: exam.examType ?? '',
      academicSession: exam.academicSession ?? '',
      batchId: exam.batchId?._id ?? exam.batchId ?? '',
      subjectId: exam.subjectId?._id ?? exam.subjectId ?? '',
      durationMinutes: exam.durationMinutes ?? '',
      startTime: toLocalDatetimeValue(exam.startTime),
      endTime: toLocalDatetimeValue(exam.endTime),
      totalMarks: exam.totalMarks ?? '',
      marksPerQuestion: exam.marksPerQuestion ?? '',
      negativeMarking: exam.negativeMarking ?? false,
      negativeMarks: exam.negativeMarks ?? 0,
      instructions: exam.instructions ?? '',
    });
    setNegativeMarking(exam.negativeMarking ?? false);
    setQuestionIds(exam.questionIds?.map((q) => q._id ?? q) ?? []);
    setTeacherIds(exam.teacherIds?.map((t) => t._id ?? t) ?? []);
  }, [isEdit, exam]);

  const onSubmit = async (values) => {
    if (questionIds.length === 0) {
      toast.error('Add at least one question.');
      return;
    }
    try {
      const payload = {
        ...values,
        durationMinutes: Number(values.durationMinutes),
        totalMarks: Number(values.totalMarks),
        marksPerQuestion: Number(values.marksPerQuestion),
        negativeMarks: Number(values.negativeMarks ?? 0),
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
        questionIds,
        teacherIds,
      };
      if (isEdit) {
        await updateExam.mutateAsync({ id, data: payload });
        toast.success('Exam updated.');
      } else {
        const created = await createExam.mutateAsync(payload);
        toast.success('Exam created.');
        navigate(`/exams/${created._id}`, { replace: true });
        return;
      }
      navigate(`/exams/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  if (isEdit && examLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  const batchOptions = batches.map((b) => ({ value: b._id, label: b.name }));
  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));
  const teacherOptions = teachers.map((t) => ({ value: t._id, label: t.name }));

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => navigate('/exams')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Back to Exams
      </button>

      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Exam Name *" placeholder="Unit Test 1" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Select label="Exam Type *" options={EXAM_TYPES} placeholder="Select type" error={errors.examType?.message}
              {...register('examType', { required: 'Type is required' })} />
            <Input label="Academic Session *" placeholder="2025-26" error={errors.academicSession?.message}
              {...register('academicSession', { required: 'Session is required' })} />
            <Select label="Batch *" options={batchOptions} placeholder="Select batch" error={errors.batchId?.message}
              {...register('batchId', { required: 'Batch is required' })} />
            <Select label="Subject *" options={subjectOptions} placeholder="Select subject" error={errors.subjectId?.message}
              {...register('subjectId', { required: 'Subject is required' })} />
          </div>
          <MultiSelect label="Assign Teachers" options={teacherOptions} value={teacherIds} onChange={setTeacherIds} max={10} placeholder="Select teachers..." />
        </div>

        {/* Schedule */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Start Time *" type="datetime-local" error={errors.startTime?.message}
              {...register('startTime', { required: 'Start time is required' })} />
            <Input label="End Time *" type="datetime-local" error={errors.endTime?.message}
              {...register('endTime', { required: 'End time is required' })} />
            <Input label="Duration (minutes) *" type="number" placeholder="60" error={errors.durationMinutes?.message}
              {...register('durationMinutes', { required: 'Duration is required', min: { value: 1, message: 'Min 1' }, max: { value: 600, message: 'Max 600' } })} />
          </div>
        </div>

        {/* Marking */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Marking Scheme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Total Marks *" type="number" placeholder="100" error={errors.totalMarks?.message}
              {...register('totalMarks', { required: 'Total marks required', min: { value: 1, message: 'Min 1' } })} />
            <Input label="Marks per Question *" type="number" step="0.5" placeholder="2" error={errors.marksPerQuestion?.message}
              {...register('marksPerQuestion', { required: 'Required', min: { value: 0.5, message: 'Min 0.5' } })} />
            {negativeMarking && (
              <Input label="Negative Marks" type="number" step="0.25" placeholder="0.5" error={errors.negativeMarks?.message}
                {...register('negativeMarks', { min: { value: 0, message: 'Min 0' } })} />
            )}
          </div>
          <Checkbox
            label="Enable negative marking"
            checked={negativeMarking}
            onChange={(e) => { setNegativeMarking(e.target.checked); setValue('negativeMarking', e.target.checked); if (!e.target.checked) setValue('negativeMarks', 0); }}
          />
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Instructions</h2>
          <Textarea label="Exam Instructions" placeholder="Write instructions for students..." rows={4}
            {...register('instructions')} />
        </div>

        {/* Questions */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Questions</h2>
            <span className="text-xs text-text-muted">{questionIds.length} selected</span>
          </div>
          <QuestionPicker selectedIds={questionIds} onChange={setQuestionIds} subjectId={watchedSubjectId} />
          {questionIds.length === 0 && (
            <p className="text-xs text-error">At least one question is required to save.</p>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => navigate('/exams')} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Exam'}</Button>
        </div>
      </form>
    </div>
  );
}
