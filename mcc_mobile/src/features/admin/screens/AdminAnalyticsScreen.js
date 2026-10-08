import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { useAdminAnalytics } from '../hooks/useAdminDashboard';

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function AdminAnalyticsScreen() {
  const { data, error, isFetching, isPending, refetch } = useAdminAnalytics();
  const analytics = data?.data;

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }>
        <View>
          <Text style={styles.eyebrow}>ADMIN ANALYTICS</Text>
          <Text style={styles.title}>Institute performance</Text>
          <Text style={styles.subtitle}>
            Results, batches, teachers, and exam performance in one view.
          </Text>
        </View>
        {isPending ? <Loader message="Loading analytics…" /> : null}
        {error ? (
          <ErrorState
            message={error.message}
            onRetry={refetch}
            retrying={isFetching}
          />
        ) : null}
        {analytics ? (
          <>
            <View style={styles.grid}>
              <Metric label="Students" value={analytics.summary.students} />
              <Metric label="Exams" value={analytics.summary.exams} />
              <Metric
                label="Submissions"
                value={analytics.summary.submissions}
              />
              <Metric
                label="Average score"
                value={`${analytics.summary.averagePercentage}%`}
              />
              <Metric
                label="Highest marks"
                value={analytics.summary.highestMarks}
              />
              <Metric label="Teachers" value={analytics.summary.teachers} />
            </View>

            <Text style={styles.sectionTitle}>Batch performance</Text>
            {analytics.batchAnalytics.length ? (
              analytics.batchAnalytics.map((batch) => (
                <View key={batch.batchId} style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{batch.batchName}</Text>
                    <Text style={styles.rowMeta}>
                      {batch.batchCode} · {batch.submissions} submissions
                    </Text>
                  </View>
                  <Text style={styles.rowValue}>
                    {batch.averagePercentage}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No completed exam results yet.</Text>
            )}

            <Text style={styles.sectionTitle}>Teacher workload</Text>
            {analytics.teacherAnalytics.length ? (
              analytics.teacherAnalytics.map((teacher) => (
                <View key={teacher.teacherId} style={styles.row}>
                  <Text style={styles.rowTitle}>{teacher.teacherName}</Text>
                  <Text style={styles.rowValue}>
                    {teacher.assignedExams} exams
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No teacher exam assignments yet.</Text>
            )}

            <Text style={styles.sectionTitle}>Performance reports</Text>
            {analytics.performanceReports.map((report) => (
              <View key={report.examId} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{report.examName}</Text>
                  <Text style={styles.rowMeta}>
                    {report.submissions} submissions · top {report.highestMarks}
                  </Text>
                </View>
                <Text style={styles.rowValue}>{report.averagePercentage}%</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 28 },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.black,
    fontSize: 27,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: '29%',
    padding: 14,
  },
  metricValue: { color: colors.black, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: colors.mutedText, fontSize: 11 },
  sectionTitle: {
    color: colors.black,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.black, fontSize: 14, fontWeight: '800' },
  rowMeta: { color: colors.mutedText, fontSize: 12, marginTop: 3 },
  rowValue: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  empty: { color: colors.mutedText, fontSize: 13 },
});
