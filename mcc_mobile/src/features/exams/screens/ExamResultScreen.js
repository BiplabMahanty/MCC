import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AppButton from '../../../components/common/AppButton';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { useAttempt } from '../hooks/useExamAttempt';
import { useStudentResult } from '../hooks/useExams';

function StatCard({ label, value, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>
        {label}
      </Text>
    </View>
  );
}

function GradeBadge({ grade }) {
  return (
    <View style={styles.gradeBadge}>
      <Text style={styles.gradeText}>{grade}</Text>
    </View>
  );
}

export default function ExamResultScreen({ navigation, route }) {
  const { examId } = route.params;
  const attemptQuery = useAttempt(examId);
  const resultQuery = useStudentResult(examId);

  const loading = attemptQuery.isPending;
  if (loading)
    return (
      <Screen>
        <Loader message="Loading result…" />
      </Screen>
    );

  const attempt = attemptQuery.data?.attempt;
  const exam = attemptQuery.data?.exam;
  const result = resultQuery.data; // may be null if not yet published

  const submitted =
    attempt?.status === 'submitted' || attempt?.status === 'auto_submitted';

  // Use published result if available, otherwise fall back to attempt scores
  const scores = result ?? attempt;
  const isPublished = !!result;

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            {attempt?.status === 'auto_submitted'
              ? 'Auto-submitted'
              : 'Submitted'}
          </Text>
          <Text style={styles.heroExam}>{exam?.name}</Text>

          {submitted && (
            <>
              <Text style={styles.heroScore}>
                {scores.obtainedMarks} / {scores.totalMarks}
              </Text>
              <Text style={styles.heroPercent}>{scores.percentage}%</Text>
              {isPublished && result.grade && (
                <GradeBadge grade={result.grade} />
              )}
            </>
          )}
        </View>

        {/* Rank (only when published) */}
        {isPublished && result.rank && (
          <View style={styles.rankCard}>
            <Text style={styles.rankLabel}>Your Rank</Text>
            <Text style={styles.rankValue}>#{result.rank}</Text>
          </View>
        )}

        {/* Stats grid */}
        {submitted && (
          <View style={styles.grid}>
            <StatCard label="Total" value={scores.totalQuestions} />
            <StatCard label="Attempted" value={scores.attempted} />
            <StatCard label="Correct" accent value={scores.correct} />
            <StatCard label="Wrong" value={scores.wrong} />
            <StatCard label="Unanswered" value={scores.unanswered} />
          </View>
        )}

        {/* Result not yet published notice */}
        {submitted && !isPublished && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingText}>
              Your result has been submitted. Grade and rank will appear once
              the Admin publishes results.
            </Text>
          </View>
        )}

        {!submitted && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingText}>
              Your exam is being evaluated. Check back shortly.
            </Text>
          </View>
        )}

        <AppButton
          label="Back to exams"
          onPress={() => navigation.popToTop()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 20,
    gap: 6,
    padding: 28,
  },
  heroLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroExam: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroScore: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 8,
  },
  heroPercent: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  gradeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  gradeText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  rankCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 20,
  },
  rankLabel: { color: colors.mutedText, fontSize: 13 },
  rankValue: { color: colors.black, fontSize: 36, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: '28%',
    padding: 16,
  },
  statCardAccent: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
  },
  statValue: { color: colors.black, fontSize: 26, fontWeight: '900' },
  statValueAccent: { color: colors.success },
  statLabel: { color: colors.mutedText, fontSize: 12 },
  statLabelAccent: { color: colors.success },
  pendingCard: {
    backgroundColor: colors.warningSurface,
    borderRadius: 14,
    padding: 20,
  },
  pendingText: {
    color: colors.warning,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
