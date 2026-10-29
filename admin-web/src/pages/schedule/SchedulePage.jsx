import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from '../../hooks/useSchedules';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import client from '../../api/client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_OPTIONS = DAYS.map((d, i) => ({ value: String(i), label: d }));
const DAY_FILTER_OPTIONS = [{ value: '', label: 'All Days' }, ...DAY_OPTIONS];

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

function ScheduleForm({ open, onClose, schedule }) {
  const isEdit = !!schedule;
  const { toast } = useToast();
  const create = useCreateSchedule();
  const update = useUpdateSchedule();
  const { data: batches = [] } = useBatchOptions();
  const { data: subjects = [] } = useSubjectOptions();
  const { data: teachers = [] } = useTeacherOptions();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { isActive: true },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      reset({
        batchId: schedule.batchId?._id ?? schedule.batchId ?? '',
        subjectId: schedule.subjectId?._id ?? schedule.subjectId ?? '',
        teacherId: schedule.teacherId?._id ?? schedule.teacherId ?? '',
        dayOfWeek: String(schedule.dayOfWeek ?? 1),
        startTime: schedule.startTime ?? '',
        endTime: schedule.endTime ?? '',
        room: schedule.room ?? '',
        isActive: schedule.isActive ?? true,
      });
    } else {
      reset({ batchId: '', subjectId: '', teacherId: '', dayOfWeek: '1', startTime: '', endTime: '', room: '', isActive: true });
    }
  }, [open, schedule]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        dayOfWeek: Number(values.dayOfWeek),
        room: values.room || undefined,
      };
      if (isEdit) {
        await update.mutateAsync({ id: schedule._id, data: payload });
        toast.success('Schedule updated.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Schedule created.');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Something went wrong.';
      // Surface 409 overlap errors clearly
      if (err.response?.status === 409) {
        toast.error(`Conflict: ${msg}`);
      } else {
        toast.error(msg);
      }
    }
  };

  const batchOptions = batches.map((b) => ({ value: b._id, label: b.name }));
  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));
  const teacherOptions = teachers.map((t) => ({ value: t._id, label: t.name }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Schedule' : 'Add Schedule'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Batch *" options={batchOptions} placeholder="Select batch" error={errors.batchId?.message}
              {...register('batchId', { required: 'Batch is required' })} />
            <Select label="Subject *" options={subjectOptions} placeholder="Select subject" error={errors.subjectId?.message}
              {...register('subjectId', { required: 'Subject is required' })} />
            <Select label="Teacher *" options={teacherOptions} placeholder="Select teacher" error={errors.teacherId?.message}
              {...register('teacherId', { required: 'Teacher is required' })} />
            <Select label="Day *" options={DAY_OPTIONS} error={errors.dayOfWeek?.message}
              {...register('dayOfWeek', { required: 'Day is required' })} />
            <Input label="Start Time *" type="time" error={errors.startTime?.message}
              {...register('startTime', { required: 'Start time is required' })} />
            <Input label="End Time *" type="time" error={errors.endTime?.message}
              {...register('endTime', { required: 'End time is required' })} />
            <Input label="Room" placeholder="Room 101" {...register('room')} />
          </div>
          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Schedule'}</Button>
        </div>
      </form>
    </Modal>
  );
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function SchedulePage() {
  const { toast } = useToast();
  const [batchFilter, setBatchFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const deleteSchedule = useDeleteSchedule();
  const { data: batches = [] } = useBatchOptions();

  const params = {
    page, limit: 20,
    ...(batchFilter && { batchId: batchFilter }),
    ...(dayFilter !== '' && { dayOfWeek: dayFilter }),
    ...(statusFilter !== '' && { isActive: statusFilter }),
  };

  const { data, isLoading, isError, refetch } = useSchedules(params);
  const schedules = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleFilter = useCallback((v) => { setStatusFilter(v); setPage(1); }, []);

  const confirmDelete = async () => {
    try {
      await deleteSchedule.mutateAsync(deleting._id);
      toast.success('Schedule deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const columns = [
    {
      header: 'Day',
      accessorKey: 'dayOfWeek',
      cell: (v) => <span className="font-medium text-text-primary">{DAYS[v] ?? v}</span>,
    },
    {
      header: 'Time',
      accessorKey: 'startTime',
      cell: (v, row) => `${v} – ${row.endTime}`,
    },
    { header: 'Batch', accessorKey: 'batchId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Subject', accessorKey: 'subjectId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Teacher', accessorKey: 'teacherId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Room', accessorKey: 'room', cell: (v) => v || <span className="text-text-muted">—</span> },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditing(row); setFormOpen(true); }}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleting(row)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (isError) return <ErrorState title="Failed to load schedules" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={dayFilter} onChange={(e) => { setDayFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          {DAY_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => handleFilter(f.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Schedule
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} schedule{pagination.total !== 1 ? 's' : ''} found</p>}

      <Table columns={columns} data={schedules} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <ScheduleForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} schedule={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Schedule" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteSchedule.isPending}>
        <p className="text-sm text-text-muted">
          Delete <strong className="text-text-primary">{DAYS[deleting?.dayOfWeek]} {deleting?.startTime}–{deleting?.endTime}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
