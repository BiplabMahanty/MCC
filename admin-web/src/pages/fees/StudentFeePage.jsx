import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStudentFeeAdmin } from '../../hooks/useFees';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';

const STATUS_COLORS = { pending: 'pending', paid: 'success', partial: 'warning', waived: 'info', overdue: 'error' };

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function StudentFeePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useStudentFeeAdmin(studentId);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (isError || !data) return <ErrorState title="Failed to load student fees" onRetry={refetch} />;

  const { records = [], payments = [], summary = {} } = data;

  return (
    <div className="max-w-3xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Due', value: `₹${summary.totalDue?.toFixed(2) ?? 0}` },
          { label: 'Total Paid', value: `₹${summary.totalPaid?.toFixed(2) ?? 0}` },
          { label: 'Balance', value: `₹${summary.balance?.toFixed(2) ?? 0}` },
          { label: 'Overdue', value: summary.overdueCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-xl font-semibold text-text-primary mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Records */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Fee Records</p>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No fee records found.</p>
        ) : (
          <div className="divide-y divide-border">
            {records.map((r) => (
              <div key={r._id} className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.label}</p>
                  <p className="text-xs text-text-muted">{r.feePlanId?.name} · Due {fmt(r.dueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-primary">₹{r.paidAmount} / ₹{r.amount}</span>
                  <Badge variant={STATUS_COLORS[r.status] ?? 'info'}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Payment History</p>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No payments recorded.</p>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p._id} className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-text-primary">₹{p.amount}</p>
                  <p className="text-xs text-text-muted">{p.method} · {fmt(p.paidAt)}</p>
                  {p.reference && <p className="text-xs text-text-muted">Ref: {p.reference}</p>}
                </div>
                <p className="text-xs text-text-muted">{p.receiptNumber}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
