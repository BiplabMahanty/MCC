import {
  Users, GraduationCap, BookOpen, Layers,
  BookMarked, FileText, DollarSign, Clock,
  Bell, CalendarDays, TrendingUp,
} from 'lucide-react';
import { useDashboardHome } from '../../hooks/useDashboard';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';

function fmt(n = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function fmtCurrency(n = 0) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function classStatus(startTime, endTime) {
  const now = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(); start.setHours(sh, sm, 0, 0);
  const end = new Date(); end.setHours(eh, em, 0, 0);
  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'done';
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4">
          <Skeleton className="h-3 w-16 mb-3" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardHome();

  if (isError) return <ErrorState title="Failed to load dashboard" onRetry={refetch} />;

  const stats = data?.stats ?? {};
  const fee = data?.feeSummary ?? {};
  const classes = data?.todayClasses ?? [];
  const exam = data?.upcomingExam ?? null;
  const unread = data?.unreadNotifications ?? 0;

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      {isLoading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Students"  value={fmt(stats.students)}  icon={Users}         iconBg="bg-icon-bg-green"  iconColor="text-icon-green" />
          <StatCard label="Teachers"  value={fmt(stats.teachers)}  icon={GraduationCap} iconBg="bg-icon-bg-blue"   iconColor="text-icon-blue" />
          <StatCard label="Courses"   value={fmt(stats.courses)}   icon={BookOpen}      iconBg="bg-icon-bg-purple" iconColor="text-icon-purple" />
          <StatCard label="Batches"   value={fmt(stats.batches)}   icon={Layers}        iconBg="bg-icon-bg-orange" iconColor="text-icon-orange" />
          <StatCard label="Subjects"  value={fmt(stats.subjects)}  icon={BookMarked}    iconBg="bg-icon-bg-pink"   iconColor="text-icon-pink" />
          <StatCard label="Questions" value={fmt(stats.questions)} icon={FileText}      iconBg="bg-icon-bg-teal"   iconColor="text-icon-teal" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Fee Summary */}
        <Card>
          <CardHeader
            title="Fee Collection"
            subtitle={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            action={<DollarSign size={16} className="text-icon-green" />}
          />
          <CardBody className="space-y-3">
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total Fees</span>
                  <span className="font-semibold text-text-primary">{fmtCurrency(fee.totalFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Collected</span>
                  <span className="font-semibold text-success">{fmtCurrency(fee.totalCollected)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Pending</span>
                  <span className="font-semibold text-error">{fmtCurrency(fee.pendingAmount)}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-border rounded-full h-2 mt-1">
                  <div
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: fee.totalFees > 0 ? `${Math.min(100, (fee.totalCollected / fee.totalFees) * 100).toFixed(1)}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {fee.pendingStudents} student{fee.pendingStudents !== 1 ? 's' : ''} with pending fees
                </p>
              </>
            )}
          </CardBody>
        </Card>

        {/* Today's Classes */}
        <Card>
          <CardHeader
            title="Today's Classes"
            subtitle={new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })}
            action={<CalendarDays size={16} className="text-icon-blue" />}
          />
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No classes scheduled today.</p>
            ) : (
              <ul className="space-y-2">
                {classes.map((c, i) => {
                  const status = classStatus(c.startTime, c.endTime);
                  return (
                    <li key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-border last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{c.subject}</p>
                        <p className="text-xs text-text-muted">{c.batch} · {c.startTime}–{c.endTime}{c.room ? ` · ${c.room}` : ''}</p>
                      </div>
                      {status === 'ongoing' && <Badge variant="success">Ongoing</Badge>}
                      {status === 'upcoming' && <Badge variant="info">Upcoming</Badge>}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Right column — Upcoming Exam + Notifications */}
        <div className="space-y-4">
          {/* Upcoming Exam */}
          <Card>
            <CardHeader title="Upcoming Exam" action={<Clock size={16} className="text-icon-orange" />} />
            <CardBody>
              {isLoading ? <Skeleton className="h-16 w-full" /> : exam ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">{exam.name}</p>
                  <p className="text-xs text-text-muted">{exam.subject} · {exam.batch}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(exam.startTime).toLocaleString('default', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <Badge variant="draft" className="mt-1 capitalize">{exam.examType?.replace('_', ' ')}</Badge>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No upcoming exams.</p>
              )}
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader title="Notifications" action={<Bell size={16} className="text-icon-purple" />} />
            <CardBody>
              {isLoading ? <Skeleton className="h-8 w-full" /> : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-icon-bg-purple shrink-0">
                    <Bell size={18} className="text-icon-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">{unread}</p>
                    <p className="text-xs text-text-muted">unread notification{unread !== 1 ? 's' : ''}</p>
                  </div>
                  {unread > 0 && (
                    <a href="/notifications" className="ml-auto text-xs text-brand hover:underline flex items-center gap-1">
                      View <TrendingUp size={12} />
                    </a>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
