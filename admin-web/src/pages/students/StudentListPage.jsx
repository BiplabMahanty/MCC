import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useStudents, useDeleteStudent } from '../../hooks/useStudents';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SearchInput from '../../components/ui/SearchInput';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import StudentForm from './StudentForm';
import useDebounce from '../../hooks/useDebounce';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function StudentListPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteStudent = useDeleteStudent();

  const params = {
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filter !== '' && { isActive: filter }),
  };

  const { data, isLoading, isError, refetch } = useStudents(params);
  const students = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleFilter = useCallback((v) => { setFilter(v); setPage(1); }, []);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (s) => { setEditing(s); setFormOpen(true); };

  const confirmDelete = async () => {
    try {
      await deleteStudent.mutateAsync(deleting._id);
      toast.success('Student deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const columns = [
    {
      header: 'Student',
      accessorKey: 'name',
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.profileImage?.url} size="sm" />
          <div>
            <p className="font-medium text-text-primary text-sm">{row.name}</p>
            <p className="text-xs text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Code', accessorKey: 'studentCode' },
    {
      header: 'Batch',
      accessorKey: 'batchId',
      cell: (_, row) => row.batchId?.name ?? <span className="text-text-muted">—</span>,
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
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (isError) return <ErrorState title="Failed to load students" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search students..." className="sm:w-72" />
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilter(f.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Student
        </Button>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-text-muted">
          {pagination.total ?? 0} student{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Table */}
      <Table columns={columns} data={students} loading={isLoading} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {/* Create / Edit form */}
      <StudentForm open={formOpen} onClose={() => setFormOpen(false)} student={editing} />

      {/* Delete confirm */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Student"
        confirm
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        loading={deleteStudent.isPending}
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <strong className="text-text-primary">{deleting?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
