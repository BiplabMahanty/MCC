import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Ban, History, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useFeePlan, useFeeRecords, useRecordPayment, useWaiveRecord, useRecordPayments, useMarkOverdue } from '../../hooks/useFees';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';

const STATUS_COLORS = { pending: 'pending', paid: 'success', partial: 'warning', waived: 'info', overdue: 'error' };
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];
const RECORD_STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Waived', value: 'waived' },
];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function PaymentModal({ record, onClose }) {
  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { paidAt: new Date().toISOString().slice(0, 10), method: 'cash' },
  });

  const remaining = record ? record.amount - record.paidAmount : 0;

  const onSubmit = async (values) => {
    try {
      await recordPayment.mutateAsync({
        feeRecordId: record._id,
        amount: Number(values.amount),
        paidAt: new Date(values.paidAt).toISOString(),
        method: values.method,
        reference: values.reference || undefined,
        note: values.note || undefined,
      });
      toast.success('Payment recorded.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to record payment.');
    }
  };

  return (
    <Modal open={!!record} onClose={onClose} title="Record Payment" size="md">
      {record && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <div className="space-y-4">
            <div className="bg-surface rounded-lg p-3 text-sm space-y-1">
              <p className="text-text-muted">Student: <span className="text-text-primary font-medium">{record.studentId?.name ?? '—'}</span></p>
              <p className="text-text-muted">Label: <span className="text-text-primary">{record.label}</span></p>
              <p className="text-text-muted">Remaining: <span className="text-text-primary font-medium">₹{remaining.toFixed(2)}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount (₹) *" type="number" step="0.01" placeholder={remaining.toFixed(2)} error={errors.amount?.message}
                {...register('amount', { required: 'Amount required', min: { value: 0.01, message: 'Min 0.01' }, max: { value: remaining + 0.01, message: `Max ₹${remaining.toFixed(2)}` } })} />
              <Input label="Payment Date *" type="date" error={errors.paidAt?.message}
                {...register('paidAt', { required: 'Date required' })} />
              <Select label="Method *" options={PAYMENT_METHODS} error={errors.method?.message}
                {...register('method', { required: true })} />
              <Input label="Reference" placeholder="UTR / Cheque no." {...register('reference')} />
            </div>
            <Textarea label="Note" placeholder="Optional note..." rows={2} {...register('note')} />
          </div>
          <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Record Payment</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function WaiveModal({ record, onClose }) {
  const { toast } = useToast();
  const waiveRecord = useWaiveRecord();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await waiveRecord.mutateAsync({ recordId: record._id, note: values.note });
      toast.success('Record waived.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to waive record.');
    }
  };

  return (
    <Modal open={!!record} onClose={onClose} title="Waive Fee Record" size="sm">
      {record && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Waive <strong className="text-text-primary">{record.label}</strong> for <strong className="text-text-primary">{record.studentId?.name}</strong>?</p>
            <Textarea label="Note (optional)" placeholder="Reason for waiver..." rows={2} {...register('note')} />
          </div>
          <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="danger" loading={isSubmitting}>Waive</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function PaymentHistoryModal({ record, onClose }) {
  const { data, isLoading } = useRecordPayments(record?._id);
  const payments = data?.payments ?? [];

  return (
    <Modal open={!!record} onClose={onClose} title="Payment History" size="md">
      {isLoading && <div className="flex justify-center py-6"><Spinner size="sm" /></div>}
      {!isLoading && payments.length === 0 && (
        <p className="text-sm text-text-muted text-center py-6">No payments recorded yet.</p>
      )}
      {!isLoading && payments.length > 0 && (
        <div className="divide-y divide-border">
          {payments.map((p) => (
            <div key={p._id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">₹{p.amount}</p>
                <p className="text-xs text-text-muted">{p.method} · {fmt(p.paidAt)}</p>
                {p.reference && <p className="text-xs text-text-muted">Ref: {p.reference}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">{p.receiptNumber}</p>
                <p className="text-xs text-text-muted">by {p.recordedBy?.name ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function FeePlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [payingRecord, setPayingRecord] = useState(null);
  const [waivingRecord, setWaivingRecord] = useState(null);
  const [historyRecord, setHistoryRecord] = useState(null);

  const markOverdue = useMarkOverdue();
  const { data: plan, isLoading: planLoading, isError: planError, refetch: refetchPlan } = useFeePlan(id);
  const { data: recordsData, isLoading: recordsLoading, isError: recordsError, refetch: refetchRecords } = useFeeRecords(id, {
    page, limit: 20,
    ...(statusFilter && { status: statusFilter }),
  });

  const records = recordsData?.records ?? [];
  const pagination = recordsData?.pagination ?? {};

  const handleMarkOverdue = async () => {
    try {
      const res = await markOverdue.mutateAsync();
      toast.success(`${res.updated} record${res.updated !== 1 ? 's' : ''} marked overdue.`);
      refetchRecords();
    } catch {
      toast.error('Failed to mark overdue.');
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
    { header: 'Label', accessorKey: 'label' },
    { header: 'Due Date', accessorKey: 'dueDate', cell: (v) => fmt(v) },
    { header: 'Amount', accessorKey: 'amount', cell: (v) => `₹${v}` },
    { header: 'Paid', accessorKey: 'paidAmount', cell: (v) => `₹${v}` },
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
          {['pending', 'partial', 'overdue'].includes(row.status) && (
            <button onClick={() => setPayingRecord(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="Record Payment">
              <CreditCard size={14} />
            </button>
          )}
          {['pending', 'partial', 'overdue'].includes(row.status) && (
            <button onClick={() => setWaivingRecord(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-warning transition-colors" title="Waive">
              <Ban size={14} />
            </button>
          )}
          <button onClick={() => setHistoryRecord(row)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface hover:text-brand transition-colors" title="Payment History">
            <History size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (planLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (planError || !plan) return <ErrorState title="Fee plan not found" onRetry={refetchPlan} />;

  const { summary } = plan;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/fees')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Fee Plans
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{plan.name}</h1>
            <p className="text-sm text-text-muted mt-0.5">{plan.batchId?.name} · {plan.type?.replace('_', ' ')}</p>
          </div>
          <Badge variant={plan.isActive ? 'active' : 'inactive'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
        </div>
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Records', value: summary.totalRecords },
              { label: 'Paid', value: summary.paidRecords },
              { label: 'Pending', value: summary.pendingRecords },
              { label: 'Overdue', value: summary.overdueRecords },
            ].map((s) => (
              <div key={s.label} className="bg-surface rounded-lg p-3">
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-xl font-semibold text-text-primary mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Records */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {RECORD_STATUS_FILTERS.map((f) => (
              <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === f.value ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleMarkOverdue} loading={markOverdue.isPending} className="sm:ml-auto">
            <AlertTriangle size={14} /> Mark Overdue
          </Button>
        </div>

        {recordsError ? (
          <ErrorState title="Failed to load records" onRetry={refetchRecords} />
        ) : (
          <>
            <Table columns={columns} data={records} loading={recordsLoading} />
            {pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      <PaymentModal record={payingRecord} onClose={() => setPayingRecord(null)} />
      <WaiveModal record={waivingRecord} onClose={() => setWaivingRecord(null)} />
      <PaymentHistoryModal record={historyRecord} onClose={() => setHistoryRecord(null)} />
    </div>
  );
}
