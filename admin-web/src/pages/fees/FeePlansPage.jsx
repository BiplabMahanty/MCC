import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useFeePlans, useCreateFeePlan, useUpdateFeePlan, useDeleteFeePlan } from '../../hooks/useFees';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Checkbox from '../../components/ui/Checkbox';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import client from '../../api/client';

const FEE_TYPES = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom Installments' },
];

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

function useBatchOptions() {
  return useQuery({
    queryKey: ['batches-select'],
    queryFn: () => client.get('/admin/batches', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

function FeePlanForm({ open, onClose, plan }) {
  const isEdit = !!plan;
  const { toast } = useToast();
  const create = useCreateFeePlan();
  const update = useUpdateFeePlan();
  const { data: batches = [] } = useBatchOptions();

  const { register, handleSubmit, reset, watch, control, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'monthly', isActive: true, installments: [{ label: '', amount: '', dueDate: '' }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'installments' });
  const feeType = watch('type');
  const isActive = watch('isActive');

  useEffect(() => {
    if (!open) return;
    if (plan) {
      reset({
        name: plan.name ?? '',
        batchId: plan.batchId?._id ?? plan.batchId ?? '',
        type: plan.type ?? 'monthly',
        amount: plan.amount ?? '',
        startDate: plan.startDate ? plan.startDate.slice(0, 10) : '',
        endDate: plan.endDate ? plan.endDate.slice(0, 10) : '',
        description: plan.description ?? '',
        isActive: plan.isActive ?? true,
        installments: plan.installments?.length
          ? plan.installments.map((i) => ({ label: i.label, amount: i.amount, dueDate: i.dueDate?.slice(0, 10) ?? '' }))
          : [{ label: '', amount: '', dueDate: '' }],
      });
    } else {
      reset({ name: '', batchId: '', type: 'monthly', amount: '', startDate: '', endDate: '', description: '', isActive: true, installments: [{ label: '', amount: '', dueDate: '' }] });
    }
  }, [open, plan]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        type: values.type,
        description: values.description || undefined,
        isActive: values.isActive,
      };
      if (!isEdit) {
        payload.batchId = values.batchId;
        if (values.type === 'custom') {
          payload.installments = values.installments.map((i) => ({
            label: i.label,
            amount: Number(i.amount),
            dueDate: new Date(i.dueDate).toISOString(),
          }));
        } else {
          payload.amount = Number(values.amount);
          if (values.type !== 'one_time') {
            payload.startDate = new Date(values.startDate).toISOString();
            payload.endDate = new Date(values.endDate).toISOString();
          }
        }
        await create.mutateAsync(payload);
        toast.success('Fee plan created.');
      } else {
        await update.mutateAsync({ id: plan._id, data: { name: payload.name, description: payload.description, isActive: payload.isActive } });
        toast.success('Fee plan updated.');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  const batchOptions = batches.map((b) => ({ value: b._id, label: b.name }));
  const needsAmount = feeType !== 'custom';
  const needsDates = feeType !== 'custom' && feeType !== 'one_time';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Fee Plan' : 'Create Fee Plan'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Plan Name *" placeholder="Annual Fee 2025" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            {!isEdit && (
              <Select label="Batch *" options={batchOptions} placeholder="Select batch" error={errors.batchId?.message}
                {...register('batchId', { required: 'Batch is required' })} />
            )}
            {!isEdit && (
              <Select label="Fee Type *" options={FEE_TYPES} error={errors.type?.message}
                {...register('type', { required: true })} />
            )}
            {!isEdit && needsAmount && (
              <Input label="Amount (₹) *" type="number" step="0.01" placeholder="5000" error={errors.amount?.message}
                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Min 0.01' } })} />
            )}
            {!isEdit && needsDates && (
              <>
                <Input label="Start Date *" type="date" error={errors.startDate?.message}
                  {...register('startDate', { required: 'Start date required' })} />
                <Input label="End Date *" type="date" error={errors.endDate?.message}
                  {...register('endDate', { required: 'End date required' })} />
              </>
            )}
          </div>

          {!isEdit && feeType === 'custom' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">Installments</p>
                <button type="button" onClick={() => append({ label: '', amount: '', dueDate: '' })}
                  className="text-xs text-brand hover:underline">+ Add</button>
              </div>
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-3 gap-2 items-end">
                  <Input label={i === 0 ? 'Label' : ''} placeholder="1st Installment"
                    {...register(`installments.${i}.label`, { required: true })} />
                  <Input label={i === 0 ? 'Amount (₹)' : ''} type="number" step="0.01" placeholder="2000"
                    {...register(`installments.${i}.amount`, { required: true, min: 0.01 })} />
                  <div className="flex items-end gap-1">
                    <Input label={i === 0 ? 'Due Date' : ''} type="date"
                      {...register(`installments.${i}.dueDate`, { required: true })} />
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="mb-0.5 p-1.5 text-error hover:bg-error-surface rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Textarea label="Description" placeholder="Optional notes..." rows={2} {...register('description')} />
          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Plan'}</Button>
        </div>
      </form>
    </Modal>
  );
}

const TYPE_LABELS = { one_time: 'One Time', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly', custom: 'Custom' };

export default function FeePlansPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const deleteFeePlan = useDeleteFeePlan();
  const { data: batches = [] } = useBatchOptions();

  const params = {
    page, limit: 20,
    ...(filter !== '' && { isActive: filter }),
    ...(batchFilter && { batchId: batchFilter }),
  };

  const { data, isLoading, isError, refetch } = useFeePlans(params);
  const plans = data?.plans ?? [];
  const pagination = data?.pagination ?? {};

  const confirmDelete = async () => {
    try {
      await deleteFeePlan.mutateAsync(deleting._id);
      toast.success('Fee plan deleted.');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  const columns = [
    {
      header: 'Plan',
      accessorKey: 'name',
      cell: (v, row) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{v}</p>
          <p className="text-xs text-text-muted">{TYPE_LABELS[row.type] ?? row.type}</p>
        </div>
      ),
    },
    { header: 'Batch', accessorKey: 'batchId', cell: (v) => v?.name ?? <span className="text-text-muted">—</span> },
    { header: 'Amount', accessorKey: 'amount', cell: (v, row) => row.type === 'custom' ? `${row.installments?.length ?? 0} installments` : v != null ? `₹${v}` : '—' },
    { header: 'Status', accessorKey: 'isActive', cell: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge> },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/fees/${row._id}`)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="View Records">
            <Eye size={14} />
          </button>
          <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-error-surface hover:text-error transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (isError) return <ErrorState title="Failed to load fee plans" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="sm:ml-auto" size="sm">
          <Plus size={16} /> Add Fee Plan
        </Button>
      </div>

      {!isLoading && <p className="text-xs text-text-muted">{pagination.total ?? 0} plan{pagination.total !== 1 ? 's' : ''} found</p>}

      <Table columns={columns} data={plans} loading={isLoading} />

      {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <FeePlanForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} plan={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Fee Plan" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete} loading={deleteFeePlan.isPending}>
        <p className="text-sm text-text-muted">Delete <strong className="text-text-primary">{deleting?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
