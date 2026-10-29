import { useState } from 'react';
import { Bell, Send, CheckCheck } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useNotifications, useMarkRead, useSendAnnouncement } from '../../hooks/useNotifications';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_COLORS = {
  announcement: 'info',
  exam: 'warning',
  assignment: 'active',
  fee: 'error',
  result: 'success',
};

const ROLE_OPTIONS = ['admin', 'teacher', 'student'];
const TYPE_OPTIONS = ['announcement', 'exam', 'assignment', 'fee', 'result'];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function AnnouncementModal({ open, onClose }) {
  const { toast } = useToast();
  const send = useSendAnnouncement();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', body: '', type: 'announcement', roles: [] },
  });

  const onSubmit = async (values) => {
    if (!values.roles.length) return;
    try {
      const res = await send.mutateAsync(values);
      toast.success(`Announcement sent to ${res.data?.created ?? '?'} recipient(s).`);
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to send announcement.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Announcement" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Title *</label>
          <input
            {...register('title', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' }, maxLength: { value: 160, message: 'Max 160 chars' } })}
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Announcement title"
          />
          {errors.title && <p className="text-xs text-error mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Message *</label>
          <textarea
            {...register('body', { required: 'Required', maxLength: { value: 2000, message: 'Max 2000 chars' } })}
            rows={4}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            placeholder="Write your message..."
          />
          {errors.body && <p className="text-xs text-error mt-1">{errors.body.message}</p>}
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
            <select
              {...register('type')}
              className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand capitalize"
            >
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-text-muted mb-1">Send to *</label>
            <Controller
              name="roles"
              control={control}
              rules={{ validate: (v) => v.length > 0 || 'Select at least one role' }}
              render={({ field }) => (
                <div className="flex gap-2 flex-wrap mt-1">
                  {ROLE_OPTIONS.map((role) => (
                    <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value.includes(role)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...field.value, role]
                            : field.value.filter((r) => r !== role);
                          field.onChange(next);
                        }}
                        className="accent-brand"
                      />
                      <span className="text-sm capitalize text-text-primary">{role}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.roles && <p className="text-xs text-error mt-1">{errors.roles.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={send.isPending}>Cancel</Button>
          <Button type="submit" loading={send.isPending}>
            <Send size={14} /> Send
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkRead();

  const unread = notifications.filter((n) => !n.readAt);

  const handleMarkRead = async (id) => {
    try {
      await markRead.mutateAsync(id);
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(unread.map((n) => markRead.mutateAsync(n._id)));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  if (isError) return <ErrorState title="Failed to load notifications" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand text-white text-xs font-semibold">
              {unread.length}
            </span>
          )}
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={markRead.isPending}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>
        <Button size="sm" onClick={() => setAnnounceOpen(true)}>
          <Send size={14} /> Send Announcement
        </Button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner /></div>}

      {!isLoading && notifications.length === 0 && (
        <EmptyState
          icon={<Bell size={32} className="text-text-muted" />}
          title="No notifications"
          description="You have no notifications yet."
        />
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${!n.readAt ? 'bg-brand/5' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium truncate ${!n.readAt ? 'text-text-primary' : 'text-text-muted'}`}>
                    {n.title}
                  </p>
                  <Badge variant={TYPE_COLORS[n.type] ?? 'info'}>{n.type}</Badge>
                  {!n.readAt && <span className="h-2 w-2 rounded-full bg-brand shrink-0" />}
                </div>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-text-muted mt-1">{fmt(n.createdAt)}</p>
              </div>
              {!n.readAt && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  disabled={markRead.isPending}
                  className="shrink-0 text-xs text-brand hover:underline mt-0.5"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AnnouncementModal open={announceOpen} onClose={() => setAnnounceOpen(false)} />
    </div>
  );
}
