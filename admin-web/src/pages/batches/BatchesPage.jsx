import { useState, useCallback, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from '../../hooks/useAcademic';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import MultiSelect from '../../components/ui/MultiSelect';
import SearchInput from '../../components/ui/SearchInput';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import useDebounce from '../../hooks/useDebounce';
import client from '../../api/client';

function useCourseOptions() {
  return useQuery({
    queryKey: ['courses-select'],
    queryFn: () => client.get('/admin/courses', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
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

function BatchForm({ open, onClose, batch }) {
  const isEdit = !!batch;
  const { toast } = useToast();
  const create = useCreateBatch();
  const update = useUpdateBatch();
  const { data: courses = [] } = useCourseOptions();
  const { data: teachers = [] } = useTeacherOptions();
  const [teacherIds, setTeacherIds] = useState([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { isActive: true } });

  useEffect(() => {
    if (!open) return;
    if (batch) {
      reset({
        name: batch.name ?? '', code: batch.code ?? '', courseId: batch.courseId?._id ?? batch.courseId ?? '',
        academicSession: batch.academicSession ?? '', startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
        endDate: batch.endDate ? batch.endDate.slice(0, 10) : '', capacity: batch.capacity ?? '',
        isActive: batch.isActive ?? true,
      });
      setTeacherIds(batch.teacherIds?.map((t) => t._id ?? t) ?? []);
    } else {
      reset({ name: '', code: '', courseId: '', academicSession: '', startDate: '', endDate: '', capacity: '', isActive: true });
      setTeacherIds([]);
    }
  }, [open, batch]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        code: values.code.toUpperCase(),
        capacity: values.capacity ? Number(values.capacity) : undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        teacherIds,
      };
      if (isEdit) {
        await update.mutateAsync({ id: batch._id, data: payload });
        toast.success('Batch updated.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Batch created.');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  const courseOptions = courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }));
  const teacherOptions = teachers.map((t) => ({ value: t._id, label: t.name }));
  const isActive = watch('isActive');

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Batch' : 'Add Batch'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Batch Name *" placeholder="Batch A 2025" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input label="Code *" placeholder="BATCH-A" error={errors.code?.message}
              {...register('code', { required: 'Code is required' })} />
            <Select label="Course *" options={courseOptions} placeholder="Select course" error={errors.courseId?.message}
              {...register('courseId', { required: 'Course is required' })} />
            <Input label="Academic Session" placeholder="2025-26"
              {...register('academicSession')} />
            <Input label="Start Date" type="date" {...register('startDate')} />
            <Input label="End Date" type="date" error={errors.endDate?.message}
              {...register('endDate')} />
            <Input label="Capacity" type="number" placeholder="30" error={errors.capacity?.message}
              {...register('capacity', { min: { value: 1, message: 'Min 1' }, max: { value: 10000, message: 'Max 10000' } })} />
          </div>
          <MultiSelect label="Assign Teachers" options={teacherOptions} value={teacherIds} onChange={setTeacherIds} max={50} placeholder="Select teachers..." />
          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Batch'}</Button>
        </div>
      </form>
    </Modal>
  );
}

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function BatchesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteBatch = useDeleteBatch();
  const { data: courses = [] } = useCourseOptions();

  const params = {
    page, limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filter !== '' && { isActive: filter }),
    ...(courseFilter && { courseId: courseFilter }),
  };

  const { data, isLoading, isError, refetch } = useBatches(params);
  const batches = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleFilter = useCallback((v) => { setFilter(v); setPage(1); }, []);

  const confirmDelete = async () => {
    try {
      await deleteBatch.mutateAsync(deleting._id);
      toast.success('Batch deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const courseSelectOptions = [{ value: '', label: 'All Courses' }, ...courses.map((c) => ({ value: c._id, label: c.name }))];

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: (v, row) => (
      <div>
        <p className="font-medium text-text-primary text-sm">{v}</p>
        <p className="text-xs text-text-muted">{row.code}</p>
      </div>
    )},
    { header: 'Course', accessorKey: 'courseId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Session', accessorKey: 'academicSession', cell: (v) => v || <span className="text-text-muted">—</span> },
    { header: 'Teachers', accessorKey: 'teacherIds', cell: (v) => v?.length ?? 0 },
    { header: 'Status', accessorKey: 'isActive', cell: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', accessorKey: '_id', cell: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors"><Pencil size={14} /></button>
        <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  if (isError) return <ErrorState title="Failed to load batches" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search batches..." className="sm:w-64" />
        <select
          value={courseFilter}
          onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {courseSelectOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => handleFilter(f.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Batch
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} batch{pagination.total !== 1 ? 'es' : ''} found</p>}

      <Table columns={columns} data={batches} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <BatchForm open={formOpen} onClose={() => setFormOpen(false)} batch={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Batch" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteBatch.isPending}>
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <strong className="text-text-primary">{deleting?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
