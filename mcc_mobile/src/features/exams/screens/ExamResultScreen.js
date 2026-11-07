import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { useAttempt } from '../hooks/useExamAttempt';
import { useStudentResult } from '../hooks/useExams';

function StatCard({ label, value, tone = 'default' }) {
  return (
    <View style={[styles.statCard, styles[`statCard${tone}`]]}>
      <Text style={[styles.statValue, styles[`statValue${tone}`]]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, styles[`statLabel${tone}`]]}>
        {label}
      </Text>
    </View>
  );
}

function ActionButton({ label, onPress, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.actionButton,
        secondary && styles.actionButtonSecondary,
        hovered && styles.actionButtonHovered,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text
        style={[styles.actionLabel, secondary && styles.actionLabelSecondary]}
      >
        {label}
      </Text>
      <Text
        style={[styles.actionArrow, secondary && styles.actionArrowSecondary]}
      >
        ›
      </Text>
    </Pressable>
  );
}

export default function ExamResultScreen({ navigation, route }) {
  const { examId } = route.params;
  const attemptQuery = useAttempt(examId);
  const resultQuery = useStudentResult(examId);

  const handleRefresh = () => {
    attemptQuery.refetch();
    resultQuery.refetch();
  };

  if (attemptQuery.isPending) {
    return (
      <Screen fullBleed>
        <Loader message="Loading result…" />
      </Screen>
    );
  }

  const attempt = attemptQuery.data?.attempt;
  const exam = attemptQuery.data?.exam;
  const result = resultQuery.data;
  const submitted =
    attempt?.status === 'submitted' || attempt?.status === 'auto_submitted';
  const scores = result ?? attempt;
  const isPublished = !!result;
  const percentage = Number(scores?.percentage ?? 0);

  return (
    <Screen fullBleed>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={attemptQuery.isPending || resultQuery.isPending}
            onRefresh={handleRefresh}
            tintColor={colors.dashGreen}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({ pressed, hovered }) => [
              styles.backButton,
              hovered && styles.headerButtonHovered,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Text style={styles.backText}>‹</Text>
            <Text style={styles.backLabel}>Exam result</Text>
          </Pressable>
          <View style={styles.headerStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatusText}>
              {attempt?.status === 'auto_submitted'
                ? 'Auto-submitted'
                : 'Submitted'}
            </Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {exam?.name}
          </Text>
          <Text style={styles.headerSubtitle}>Performance overview</Text>
        </View>

        {submitted ? (
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.eyebrow}>Overall score</Text>
                <Text style={styles.heroScore}>
                  {scores?.obtainedMarks ?? 0}
                  <Text style={styles.heroScoreDenominator}>
                    {' '}
                    / {scores?.totalMarks ?? 0}
                  </Text>
                </Text>
              </View>
              {isPublished && result.grade ? (
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeLabel}>GRADE</Text>
                  <Text style={styles.gradeText}>{result.grade}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(Math.max(percentage, 0), 100)}%` },
                ]}
              />
            </View>
            <View style={styles.heroFooter}>
              <Text style={styles.percentValue}>{percentage}%</Text>
              <Text style={styles.percentCaption}>of the total marks</Text>
            </View>
          </View>
        ) : null}

        {isPublished && result.rank ? (
          <View style={styles.rankCard}>
            <View style={styles.rankIcon}>
              <Text style={styles.rankIconText}>#</Text>
            </View>
            <View style={styles.rankCopy}>
              <Text style={styles.rankLabel}>Your rank</Text>
              <Text style={styles.rankHint}>Based on published results</Text>
            </View>
            <Text style={styles.rankValue}>#{result.rank}</Text>
          </View>
        ) : null}

        {submitted ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance breakdown</Text>
              <Text style={styles.sectionSubtitle}>
                A quick look at your attempt
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <StatCard label="Total" value={scores?.totalQuestions ?? 0} />
              <StatCard label="Attempted" value={scores?.attempted ?? 0} />
              <StatCard
                label="Correct"
                value={scores?.correct ?? 0}
                tone="Success"
              />
              <StatCard label="Wrong" value={scores?.wrong ?? 0} tone="Error" />
              <StatCard
                label="Unanswered"
                value={scores?.unanswered ?? 0}
                tone="Warning"
              />
              {scores?.negativeMarks ? (
                <StatCard
                  label="Negative"
                  value={scores?.negativeMarks ?? 0}
                  tone="Error"
                />
              ) : null}
            </View>
          </View>
        ) : null}

        {submitted && !isPublished ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Result pending publication</Text>
            <Text style={styles.noticeText}>
              Your result has been submitted. Grade and rank will appear once
              the Admin publishes results.
            </Text>
          </View>
        ) : null}

        {!submitted ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Evaluation in progress</Text>
            <Text style={styles.noticeText}>
              Your exam is being evaluated. Check back shortly.
            </Text>
          </View>
        ) : null}

        <View style={styles.actionsSection}>
          {submitted ? (
            <ActionButton
              label="Review answers"
              onPress={() => navigation.navigate('ExamReview', { examId })}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 7, paddingBottom: 36 },
  header: {
    backgroundColor: colors.dashGreen,
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerButtonHovered: { backgroundColor: 'rgba(255,255,255,0.12)' },
  headerButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ scale: 0.98 }],
  },
  backText: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 28,
    fontWeight: '300',
  },
  backLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '800',
  },
  headerStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 8,
  },
  statusDot: {
    backgroundColor: colors.dashGreenAccent,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  headerStatusText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 5,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 18,
    marginHorizontal: 20,
    borderColor: colors.border,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroScore: {
    color: colors.black,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 5,
  },
  heroScoreDenominator: {
    color: colors.mutedText,
    fontSize: 22,
    fontWeight: '700',
  },
  gradeBadge: {
    alignItems: 'center',
    backgroundColor: colors.dashUp,
    borderRadius: 16,
    minWidth: 68,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  gradeLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gradeText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 1,
  },
  progressTrack: {
    backgroundColor: colors.dashBg,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: '100%',
  },
  heroFooter: { alignItems: 'baseline', flexDirection: 'row', gap: 8 },
  percentValue: { color: colors.primary, fontSize: 24, fontWeight: '900' },
  percentCaption: { color: colors.mutedText, fontSize: 12 },
  rankCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
  },
  rankIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningSurface,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  rankIconText: { color: colors.warning, fontSize: 21, fontWeight: '900' },
  rankCopy: { flex: 1, marginLeft: 12 },
  rankLabel: { color: colors.black, fontSize: 16, fontWeight: '900' },
  rankHint: { color: colors.mutedText, fontSize: 11, marginTop: 3 },
  rankValue: { color: colors.black, fontSize: 27, fontWeight: '900' },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 16,
  },
  sectionHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 13,
  },
  sectionTitle: { color: colors.black, fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { color: colors.mutedText, fontSize: 12, marginTop: 3 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
  },
  statCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.dashBg,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 92,
    padding: 12,
  },
  statCardSuccess: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
  },
  statCardError: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
  },
  statCardWarning: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warning,
  },
  statValue: { color: colors.black, fontSize: 23, fontWeight: '900' },
  statValueSuccess: { color: colors.success },
  statValueError: { color: colors.error },
  statValueWarning: { color: colors.warning },
  statLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  statLabelSuccess: { color: colors.success },
  statLabelError: { color: colors.error },
  statLabelWarning: { color: colors.warning },
  noticeCard: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warning,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 16,
  },
  noticeTitle: { color: colors.warning, fontSize: 14, fontWeight: '900' },
  noticeText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
  actionsSection: { gap: 10, paddingHorizontal: 20, paddingTop: 2 },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.dashUp,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  actionButtonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.dashUp,
    borderWidth: 1.5,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  actionButtonHovered: {
    backgroundColor: colors.dashGreen,
    borderColor: colors.dashGreen,
    elevation: 3,
    opacity: 0.9,
  },
  actionButtonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  actionLabel: { color: colors.white, fontSize: 16, fontWeight: '900' },
  actionLabelSecondary: { color: colors.dashUp },
  actionArrow: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
    marginTop: -2,
  },
  actionArrowSecondary: { color: colors.dashUp },
});
