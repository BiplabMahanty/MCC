import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAttendance, useBatchStudents, useMarkAttendance } from '../../hooks/useAttendance';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import client from '../../api/client';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];
const STATUS_COLORS = { present: 'success', absent: 'error', late: 'warning', excused: 'info' };

function useBatchOptions() {
  return useQuery({
    queryKey: ['batches-select'],
    queryFn: () =>
      client.get('/admin/batches', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function MarkAttendanceModal({ open, onClose, batchId, batchName }) {
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO);
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});

  const { data: students = [], isLoading } = useBatchStudents(batchId);
  const markAttendance = useMarkAttendance();

  // Pre-fill all present when students load
  const initStatuses = (list) => {
    const s = {};
    list.forEach((st) => { s[st._id] = 'present'; });
    setStatuses(s);
    setNotes({});
  };

  // Reset when modal opens
  useState(() => {
    if (open && students.length) initStatuses(students);
  }, [open]);

  const setAll = (status) => {
    const s = {};
    students.forEach((st) => { s[st._id] = status; });
    setStatuses(s);
  };

  const handleSubmit = async () => {
    if (!batchId || !date) return;
    const entries = students.map((st) => ({
      studentId: st._id,
      status: statuses[st._id] ?? 'absent',
      ...(notes[st._id] ? { note: notes[st._id] } : {}),
    }));
    try {
      await markAttendance.mutateAsync({ batchId, date: new Date(date).toISOString(), entries });
      toast.success('Attendance saved.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save attendance.');
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === 'present').length;
  const absentCount = Object.values(statuses).filter((s) => s === 'absent').length;

  return (
    <Modal open={open} onClose={onClose} title={`Mark Attendance — ${batchName ?? ''}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-text-muted mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div className="flex items-center gap-1 mt-5">
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => setAll(s)}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:bg-surface capitalize transition-colors">
                All {s}
              </button>
            ))}
          </div>
          <div className="mt-5 text-xs text-text-muted ml-auto">
            {presentCount} present · {absentCount} absent
          </div>
        </div>

        {isLoading && <div className="flex justify-center py-8"><Spinner size="sm" /></div>}
        {!isLoading && students.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No active students in this batch.</p>
        )}
        {!isLoading && students.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-border border border-border rounded-xl">
            {students.map((st) => (
              <div key={st._id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{st.name}</p>
                  <p className="text-xs text-text-muted">{st.studentProfile?.studentCode ?? st.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setStatuses((prev) => ({ ...prev, [st._id]: s }))}
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize transition-colors border ${
                        statuses[st._id] === s
                          ? s === 'present' ? 'bg-success-surface text-success border-success/30'
                          : s === 'absent' ? 'bg-error-surface text-error border-error/30'
                          : s === 'late' ? 'bg-warning-surface text-warning border-warning/30'
                          : 'bg-info-surface text-info border-info/30'
                          : 'border-border text-text-muted hover:bg-surface'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  value={notes[st._id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [st._id]: e.target.value }))}
                  placeholder="Note"
                  className="w-24 h-7 rounded border border-border px-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose} disabled={markAttendance.isPending}>Cancel</Button>
        <Button onClick={handleSubmit} loading={markAttendance.isPending} disabled={students.length === 0}>
          Save Attendance
        </Button>
      </div>
    </Modal>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function SummaryBar({ entries = [] }) {
  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  entries.forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });
  const total = entries.length;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(counts).map(([s, n]) => (
        <Badge key={s} variant={STATUS_COLORS[s]}>{s}: {n}</Badge>
      ))}
      <span className="text-xs text-text-muted">/ {total}</span>
    </div>
  );
}

export default function AttendancePage() {
  const { toast } = useToast();
  const [batchId, setBatchId] = useState('');
  const [month, setMonth] = useState(currentMonth());
  const [markOpen, setMarkOpen] = useState(false);

  const { data: batches = [] } = useBatchOptions();
  const selectedBatch = batches.find((b) => b._id === batchId);

  const params = {
    ...(batchId && { batchId }),
    ...(month && { month }),
  };

  const { data: records = [], isLoading, isError, refetch } = useAttendance(params);

  if (isError) return <ErrorState title="Failed to load attendance" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <select value={batchId} onChange={(e) => setBatchId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">Select Batch</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand" />
        <Button
          onClick={() => setMarkOpen(true)}
          disabled={!batchId}
          className="sm:ml-auto"
          size="sm"
        >
          <ClipboardList size={16} /> Mark Attendance
        </Button>
      </div>

      {!batchId && (
        <EmptyState title="Select a batch" description="Choose a batch above to view or mark attendance." />
      )}

      {batchId && isLoading && (
        <div className="flex justify-center py-16"><Spinner /></div>
      )}

      {batchId && !isLoading && records.length === 0 && (
        <EmptyState title="No attendance records" description="No attendance has been marked for this batch and month yet." />
      )}

      {batchId && !isLoading && records.length > 0 && (
        <div className="space-y-2">
          {records.map((rec) => (
            <div key={rec._id} className="bg-card border border-border rounded-xl px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-text-primary">{fmt(rec.date)}</p>
                <p className="text-xs text-text-muted mt-0.5">{rec.entries.length} students</p>
              </div>
              <SummaryBar entries={rec.entries} />
            </div>
          ))}
        </div>
      )}

      <MarkAttendanceModal
        open={markOpen}
        onClose={() => setMarkOpen(false)}
        batchId={batchId}
        batchName={selectedBatch?.name}
      />
    </div>
  );
}
