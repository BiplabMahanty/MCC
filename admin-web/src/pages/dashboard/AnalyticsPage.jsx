import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAnalytics } from '../../hooks/useDashboard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import {
  Users, GraduationCap, Layers, FileText,
  TrendingUp, Award,
} from 'lucide-react';

function fmt(n = 0, decimals = 0) {
  return Number(n).toFixed(decimals);
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({});

  const { data, isLoading, isError, refetch } = useAnalytics(applied);

  const apply = () => setApplied({ ...(from && { from }), ...(to && { to }) });
  const clear = () => { setFrom(''); setTo(''); setApplied({}); };

  if (isError) return <ErrorState title="Failed to load analytics" onRetry={refetch} />;

  const s = data?.summary ?? {};
  const batches = data?.batchAnalytics ?? [];
  const teachers = data?.teacherAnalytics ?? [];
  const exams = data?.performanceReports ?? [];

  return (
    <div className="space-y-6">

      {/* Date range filter */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <button
              onClick={apply}
              className="h-9 px-4 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
            >
              Apply
            </button>
            {(applied.from || applied.to) && (
              <button
                onClick={clear}
                className="h-9 px-4 border border-border text-sm text-text-muted rounded-lg hover:bg-surface transition-colors"
              >
                Clear
              </button>
            )}
            {data?.cached && (
              <Badge variant="info" className="ml-auto">Cached</Badge>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Summary metrics */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <Skeleton className="h-3 w-16 mb-3" /><Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Students"    value={s.students}    icon={Users}         iconBg="bg-icon-bg-green"  iconColor="text-icon-green" />
          <StatCard label="Teachers"    value={s.teachers}    icon={GraduationCap} iconBg="bg-icon-bg-blue"   iconColor="text-icon-blue" />
          <StatCard label="Batches"     value={s.batches}     icon={Layers}        iconBg="bg-icon-bg-orange" iconColor="text-icon-orange" />
          <StatCard label="Exams"       value={s.exams}       icon={FileText}      iconBg="bg-icon-bg-purple" iconColor="text-icon-purple" />
          <StatCard label="Submissions" value={s.submissions} icon={TrendingUp}    iconBg="bg-icon-bg-teal"   iconColor="text-icon-teal" />
          <StatCard label="Avg Score"   value={`${fmt(s.averagePercentage, 1)}%`} icon={Award} iconBg="bg-icon-bg-pink" iconColor="text-icon-pink" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Batch Performance Chart */}
        <Card>
          <CardHeader title="Batch Performance" subtitle="Average score % per batch" />
          <CardBody>
            {isLoading ? <Skeleton className="h-56 w-full" /> : batches.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-10">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={batches} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="batchName" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Avg Score']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                  <Bar dataKey="averagePercentage" fill="#1A5C38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Teacher Workload Chart */}
        <Card>
          <CardHeader title="Teacher Workload" subtitle="Assigned exams per teacher" />
          <CardBody>
            {isLoading ? <Skeleton className="h-56 w-full" /> : teachers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-10">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teachers} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="teacherName" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [v, 'Exams']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  />
                  <Bar dataKey="assignedExams" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Exam Performance Table */}
      <Card>
        <CardHeader title="Exam Performance" subtitle="Top exams by average score" />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : exams.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">No exam data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    {['Exam', 'Type', 'Date', 'Submissions', 'Avg %', 'Highest'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">{e.examName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="draft" className="capitalize">{e.examType?.replace('_', ' ') || '—'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {e.startTime ? new Date(e.startTime).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-primary">{e.submissions}</td>
                      <td className="px-4 py-3">
                        <span className={e.averagePercentage >= 60 ? 'text-success font-medium' : 'text-error font-medium'}>
                          {fmt(e.averagePercentage, 1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-primary">{e.highestMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
