import {
  Users, GraduationCap, BookOpen, Layers, BookMarked, FileText,
  Clock, Bell, CalendarDays, TrendingUp, ArrowRight, UserPlus,
  CalendarPlus, ClipboardPlus, Sparkles,
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4"><Skeleton className="mb-3 h-3 w-16" /><Skeleton className="h-7 w-12" /></div>
      ))}
    </div>
  );
}

const quickActions = [
  { label: 'Add student', href: '/students/new', icon: UserPlus, tone: 'bg-icon-bg-green text-icon-green' },
  { label: 'Plan a class', href: '/schedule', icon: CalendarPlus, tone: 'bg-icon-bg-blue text-icon-blue' },
  { label: 'Create question', href: '/questions/new', icon: ClipboardPlus, tone: 'bg-icon-bg-purple text-icon-purple' },
];

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardHome();
  if (isError) return <ErrorState title="Failed to load dashboard" onRetry={refetch} />;

  const stats = data?.stats ?? {};
  const classes = data?.todayClasses ?? [];
  const exam = data?.upcomingExam ?? null;
  const unread = data?.unreadNotifications ?? 0;

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-brand to-[#24784b] px-6 py-6 text-white shadow-lg shadow-brand/10 md:px-8 md:py-7">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-100"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><Sparkles size={15} /></span>MCC Administration</div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Good morning, Admin</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/80">Here&apos;s what&apos;s happening across your coaching centre today. Keep your students, classes, and exams moving forward.</p>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[28px] border-white/10" /><div className="pointer-events-none absolute -bottom-28 right-24 h-52 w-52 rounded-full border-[22px] border-white/5" />
      </section>

      {isLoading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Students" value={fmt(stats.students)} icon={Users} iconBg="bg-icon-bg-green" iconColor="text-icon-green" />
          <StatCard label="Teachers" value={fmt(stats.teachers)} icon={GraduationCap} iconBg="bg-icon-bg-blue" iconColor="text-icon-blue" />
          <StatCard label="Courses" value={fmt(stats.courses)} icon={BookOpen} iconBg="bg-icon-bg-purple" iconColor="text-icon-purple" />
          <StatCard label="Batches" value={fmt(stats.batches)} icon={Layers} iconBg="bg-icon-bg-orange" iconColor="text-icon-orange" />
          <StatCard label="Subjects" value={fmt(stats.subjects)} icon={BookMarked} iconBg="bg-icon-bg-pink" iconColor="text-icon-pink" />
          <StatCard label="Questions" value={fmt(stats.questions)} icon={FileText} iconBg="bg-icon-bg-teal" iconColor="text-icon-teal" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Today&apos;s classes" subtitle={new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })} action={<CalendarDays size={16} className="text-icon-blue" />} />
          <CardBody>
            {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : classes.length === 0 ? <p className="py-6 text-center text-sm text-text-muted">No classes scheduled today.</p> : (
              <ul className="space-y-2">{classes.map((c, i) => {
                const status = classStatus(c.startTime, c.endTime);
                return <li key={i} className="flex items-start justify-between gap-2 border-b border-border py-2 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{c.subject}</p><p className="text-xs text-text-muted">{c.batch} · {c.startTime}–{c.endTime}{c.room ? ` · ${c.room}` : ''}</p></div>{status === 'ongoing' && <Badge variant="success">Ongoing</Badge>}{status === 'upcoming' && <Badge variant="info">Upcoming</Badge>}</li>;
              })}</ul>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card><CardHeader title="Quick actions" subtitle="Common tasks at a glance" /><CardBody className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">{quickActions.map(({ label, href, icon: Icon, tone }) => <a key={label} href={href} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-light/40"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon size={17} /></span><span className="flex-1 text-sm font-medium text-text-primary">{label}</span><ArrowRight size={15} className="text-text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" /></a>)}</CardBody></Card>

          <Card><CardHeader title="Upcoming exam" action={<Clock size={16} className="text-icon-orange" />} /><CardBody>{isLoading ? <Skeleton className="h-16 w-full" /> : exam ? <div className="space-y-1"><p className="text-sm font-semibold text-text-primary">{exam.name}</p><p className="text-xs text-text-muted">{exam.subject} · {exam.batch}</p><p className="text-xs text-text-muted">{new Date(exam.startTime).toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p><Badge variant="draft" className="mt-1 capitalize">{exam.examType?.replace('_', ' ')}</Badge></div> : <p className="py-4 text-center text-sm text-text-muted">No upcoming exams.</p>}</CardBody></Card>

          <Card><CardHeader title="Notifications" action={<Bell size={16} className="text-icon-purple" />} /><CardBody>{isLoading ? <Skeleton className="h-8 w-full" /> : <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-icon-bg-purple"><Bell size={18} className="text-icon-purple" /></div><div><p className="text-2xl font-bold text-text-primary">{unread}</p><p className="text-xs text-text-muted">unread notification{unread !== 1 ? 's' : ''}</p></div>{unread > 0 && <a href="/notifications" className="ml-auto flex items-center gap-1 text-xs text-brand hover:underline">View <TrendingUp size={12} /></a>}</div>}</CardBody></Card>
        </div>
      </div>
    </div>
  );
}
