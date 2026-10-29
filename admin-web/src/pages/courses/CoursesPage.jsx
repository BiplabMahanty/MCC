import { useState, useCallback, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../../hooks/useAcademic';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import SearchInput from '../../components/ui/SearchInput';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import useDebounce from '../../hooks/useDebounce';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

function CourseForm({ open, onClose, course }) {
  const isEdit = !!course;
  const { toast } = useToast();
  const create = useCreateCourse();
  const update = useUpdateCourse();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { isActive: true } });

  useEffect(() => {
    if (!open) return;
    if (course) {
      reset({ name: course.name ?? '', code: course.code ?? '', description: course.description ?? '', isActive: course.isActive ?? true });
    } else {
      reset({ name: '', code: '', description: '', isActive: true });
    }
  }, [open, course]);

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, code: values.code.toUpperCase() };
      if (isEdit) {
        await update.mutateAsync({ id: course._id, data: payload });
        toast.success('Course updated.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Course created.');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  const isActive = watch('isActive');

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Course' : 'Add Course'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">
          <Input label="Course Name *" placeholder="Foundation Mathematics" error={errors.name?.message}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
          <Input label="Code *" placeholder="MATH-FDN" error={errors.code?.message}
            {...register('code', { required: 'Code is required' })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">Description</label>
            <textarea
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
              {...register('description')}
            />
          </div>
          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Course'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function CoursesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteCourse = useDeleteCourse();

  const params = {
    page, limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filter !== '' && { isActive: filter }),
  };

  const { data, isLoading, isError, refetch } = useCourses(params);
  const courses = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleFilter = useCallback((v) => { setFilter(v); setPage(1); }, []);

  const confirmDelete = async () => {
    try {
      await deleteCourse.mutateAsync(deleting._id);
      toast.success('Course deleted.');
      setDeleting(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        toast.error('Cannot delete: this course still has active batches or subjects.');
      } else {
        toast.error(err.response?.data?.message ?? 'Delete failed.');
      }
    }
  };

  const columns = [
    { header: 'Name', accessorKey: 'name', cell: (v, row) => (
      <div>
        <p className="font-medium text-text-primary text-sm">{v}</p>
        <p className="text-xs text-text-muted">{row.code}</p>
      </div>
    )},
    { header: 'Description', accessorKey: 'description', cell: (v) => v || <span className="text-text-muted">—</span> },
    { header: 'Status', accessorKey: 'isActive', cell: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', accessorKey: '_id', cell: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors"><Pencil size={14} /></button>
        <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  if (isError) return <ErrorState title="Failed to load courses" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search courses..." className="sm:w-72" />
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => handleFilter(f.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Course
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} course{pagination.total !== 1 ? 's' : ''} found</p>}

      <Table columns={columns} data={courses} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <CourseForm open={formOpen} onClose={() => setFormOpen(false)} course={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Course" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteCourse.isPending}>
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <strong className="text-text-primary">{deleting?.name}</strong>?
          This will fail if the course has existing batches or subjects.
        </p>
      </Modal>
    </div>
  );
}
