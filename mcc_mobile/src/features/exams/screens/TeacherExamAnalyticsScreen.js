import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import {
  useExamAnalytics,
  useExamMonitor,
  useTeacherExamResults,
} from '../hooks/useExams';

const TABS = ['Monitor', 'Results', 'Analytics'];

// ── Monitor tab ───────────────────────────────────────────────────────────────

function MonitorTab({ examId }) {
  const { data, isPending, error, refetch, isFetching } =
    useExamMonitor(examId);

  if (isPending)
    return <ActivityIndicator style={styles.center} color={colors.primary} />;
  if (error)
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
        retrying={isFetching}
      />
    );

  const rows = [
    { label: 'Total students', value: data.totalStudents, accent: false },
    { label: 'Not started', value: data.notStarted, accent: false },
    { label: 'In progress', value: data.inProgress, accent: true },
    { label: 'Submitted', value: data.submitted, accent: false },
    { label: 'Auto-submitted', value: data.autoSubmitted, accent: false },
  ];

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.monitorHero}>
        <Text style={styles.monitorExam}>{data.examName}</Text>
        <View
          style={[
            styles.statusPill,
            data.status === 'published' && styles.statusPillActive,
          ]}
        >
          <Text style={styles.statusPillText}>{data.status}</Text>
        </View>
      </View>
      {rows.map((r) => (
        <View
          key={r.label}
          style={[styles.monitorRow, r.accent && styles.monitorRowAccent]}
        >
          <Text
            style={[styles.monitorLabel, r.accent && styles.monitorLabelAccent]}
          >
            {r.label}
          </Text>
          <Text
            style={[styles.monitorValue, r.accent && styles.monitorValueAccent]}
          >
            {r.value}
          </Text>
        </View>
      ))}
      <Text style={styles.pollNote}>Auto-refreshes every 15 seconds</Text>
    </ScrollView>
  );
}

// ── Results tab ───────────────────────────────────────────────────────────────

function ResultsTab({ examId }) {
  const {
    data,
    isPending,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useTeacherExamResults(examId, {});

  if (isPending)
    return <ActivityIndicator style={styles.center} color={colors.primary} />;
  if (error)
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
        retrying={isFetching}
      />
    );

  const results = data.pages.flatMap((p) => p.data);

  return (
    <FlatList
      data={results}
      keyExtractor={(r) => r._id}
      contentContainerStyle={styles.tabContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No results yet.</Text>}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.3}
      renderItem={({ item: r }) => (
        <View style={styles.resultRow}>
          <View style={styles.resultLeft}>
            <Text style={styles.resultName}>{r.studentId?.name ?? '—'}</Text>
            <Text style={styles.resultSub}>{r.studentId?.email ?? ''}</Text>
          </View>
          <View style={styles.resultRight}>
            <Text style={styles.resultMarks}>
              {r.obtainedMarks}/{r.totalMarks}
            </Text>
            <Text style={styles.resultPct}>{r.percentage}%</Text>
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>{r.grade}</Text>
            </View>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{r.rank ?? '—'}</Text>
          </View>
        </View>
      )}
    />
  );
}

// ── Analytics tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ examId }) {
  const { data, isPending, error, refetch, isFetching } =
    useExamAnalytics(examId);

  if (isPending)
    return <ActivityIndicator style={styles.center} color={colors.primary} />;
  if (error)
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
        retrying={isFetching}
      />
    );

  if (data.totalSubmissions === 0) {
    return (
      <View style={[styles.tabContent, styles.center]}>
        <Text style={styles.emptyText}>No submissions yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Summary */}
      <View style={styles.summaryGrid}>
        {[
          { label: 'Submissions', value: data.totalSubmissions },
          { label: 'Average', value: `${data.averageMarks}` },
          { label: 'Avg %', value: `${data.averagePercentage}%` },
          { label: 'Highest', value: data.highestMarks },
          { label: 'Lowest', value: data.lowestMarks },
        ].map((s) => (
          <View key={s.label} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Grade distribution */}
      <Text style={styles.sectionTitle}>Grade Distribution</Text>
      <View style={styles.gradeGrid}>
        {Object.entries(data.gradeDistribution).map(([grade, count]) => (
          <View key={grade} style={styles.gradeCard}>
            <Text style={styles.gradeCardGrade}>{grade}</Text>
            <Text style={styles.gradeCardCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Topic-wise */}
      <Text style={styles.sectionTitle}>Topic-wise Accuracy</Text>
      {data.topicWise.map((t) => (
        <View key={t.topic} style={styles.topicRow}>
          <View style={styles.topicLeft}>
            <Text style={styles.topicName}>{t.topic}</Text>
            <Text style={styles.topicSub}>
              {t.correct}/{t.attempted} correct · {t.totalQuestions} questions
            </Text>
          </View>
          <Text style={styles.topicAccuracy}>{t.accuracy}%</Text>
        </View>
      ))}

      {/* Question-wise */}
      <Text style={styles.sectionTitle}>Question-wise Accuracy</Text>
      {data.questionWise.map((q) => (
        <View key={q.index} style={styles.qRow}>
          <Text style={styles.qIndex}>Q{q.index + 1}</Text>
          <View style={styles.qBar}>
            <View style={[styles.qBarFill, { width: `${q.accuracy}%` }]} />
          </View>
          <Text style={styles.qAccuracy}>{q.accuracy}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TeacherExamAnalyticsScreen({ navigation, route }) {
  const { examId, examName } = route.params;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Screen>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {examName ?? 'Exam'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, activeTab === i && styles.tabTextActive]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 0 && <MonitorTab examId={examId} />}
      {activeTab === 1 && <ResultsTab examId={examId} />}
      {activeTab === 2 && <AnalyticsTab examId={examId} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.black, fontSize: 22, fontWeight: '900' },
  headerTitle: {
    color: colors.black,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1.5,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.black, borderColor: colors.black },
  tabText: { color: colors.mutedText, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.white },
  tabContent: { gap: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.mutedText, textAlign: 'center', marginTop: 40 },
  pollNote: { color: colors.mutedText, fontSize: 11, textAlign: 'center' },
  // Monitor
  monitorHero: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 16,
    gap: 8,
    padding: 20,
  },
  monitorExam: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  statusPill: {
    backgroundColor: colors.darkNeutral,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusPillActive: { backgroundColor: colors.primary },
  statusPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  monitorRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  monitorRowAccent: { backgroundColor: '#FFF7ED', borderColor: colors.primary },
  monitorLabel: { color: colors.mutedText, fontSize: 14 },
  monitorLabelAccent: { color: colors.primary, fontWeight: '700' },
  monitorValue: { color: colors.black, fontSize: 22, fontWeight: '900' },
  monitorValueAccent: { color: colors.primary },
  // Results
  resultRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  resultLeft: { flex: 1 },
  resultName: { color: colors.black, fontSize: 14, fontWeight: '800' },
  resultSub: { color: colors.mutedText, fontSize: 12 },
  resultRight: { alignItems: 'flex-end', gap: 2 },
  resultMarks: { color: colors.black, fontSize: 15, fontWeight: '900' },
  resultPct: { color: colors.mutedText, fontSize: 12 },
  gradePill: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradePillText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  rankBadge: {
    backgroundColor: colors.lightNeutral,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankText: { color: colors.black, fontSize: 13, fontWeight: '900' },
  // Analytics
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: '28%',
    padding: 14,
  },
  summaryValue: { color: colors.black, fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: colors.mutedText, fontSize: 11 },
  sectionTitle: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gradeCard: {
    alignItems: 'center',
    backgroundColor: colors.lightNeutral,
    borderRadius: 10,
    flex: 1,
    gap: 2,
    minWidth: '18%',
    padding: 12,
  },
  gradeCardGrade: { color: colors.black, fontSize: 16, fontWeight: '900' },
  gradeCardCount: { color: colors.mutedText, fontSize: 13 },
  topicRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  topicLeft: { flex: 1 },
  topicName: { color: colors.black, fontSize: 14, fontWeight: '800' },
  topicSub: { color: colors.mutedText, fontSize: 12 },
  topicAccuracy: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  qRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  qIndex: { color: colors.mutedText, fontSize: 12, width: 28 },
  qBar: {
    backgroundColor: colors.border,
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  qBarFill: { backgroundColor: colors.primary, borderRadius: 4, height: 8 },
  qAccuracy: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
});
