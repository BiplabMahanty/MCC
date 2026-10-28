import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { ContentRenderer } from '../../questions/components/QuestionRenderer';
import StudentPageHeader from '../../portal/components/StudentPageHeader';
import { useAttemptReview } from '../hooks/useExamAttempt';

const VERDICT_CONFIG = {
  correct: { bg: colors.successSurface, border: colors.success, label: '✓ Correct', labelColor: colors.success },
  wrong: { bg: colors.errorSurface, border: colors.error, label: '✗ Wrong', labelColor: colors.error },
  unanswered: { bg: colors.warningSurface, border: colors.warning, label: '— Skipped', labelColor: colors.warning },
};

function OptionRow({ option, index, isSelected, isCorrect }) {
  const bg = isCorrect
    ? colors.successSurface
    : isSelected
    ? colors.errorSurface
    : colors.white;
  const border = isCorrect
    ? colors.success
    : isSelected
    ? colors.error
    : colors.border;
  const labelColor = isCorrect ? colors.success : isSelected ? colors.error : colors.mutedText;

  return (
    <View style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.optionLabel, { color: labelColor }]}>
        {String.fromCharCode(65 + index)}
        {isCorrect ? ' ✓' : isSelected ? ' ✗' : ''}
      </Text>
      <View style={styles.optionContent}>
        <ContentRenderer blocks={option?.content} />
      </View>
    </View>
  );
}

function QuestionCard({ item, number }) {
  const cfg = VERDICT_CONFIG[item.verdict];
  return (
    <View style={[styles.card, { borderColor: cfg.border }]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.qNumCircle}>
          <Text style={styles.qNum}>{number}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.topic}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.difficulty}</Text>
        </View>
        <View style={[styles.verdictBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <Text style={[styles.verdictText, { color: cfg.labelColor }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Question content */}
      <View style={styles.questionContent}>
        <ContentRenderer blocks={item.content} />
      </View>

      {/* Options */}
      <View style={styles.options}>
        {(item.options ?? []).map((opt, i) => (
          <OptionRow
            key={opt?._id ?? i}
            option={opt}
            index={i}
            isCorrect={i === item.correctOptionIndex}
            isSelected={i === item.selectedOptionIndex && i !== item.correctOptionIndex}
          />
        ))}
      </View>

      {/* Legend when wrong */}
      {item.verdict === 'wrong' && (
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            Your answer:{' '}
            <Text style={{ color: colors.error, fontWeight: '700' }}>
              {String.fromCharCode(65 + item.selectedOptionIndex)}
            </Text>
            {'   '}Correct answer:{' '}
            <Text style={{ color: colors.success, fontWeight: '700' }}>
              {String.fromCharCode(65 + item.correctOptionIndex)}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ExamReviewScreen({ navigation, route }) {
  const { examId } = route.params;
  const { data, isPending, error, refetch, isFetching } = useAttemptReview(examId);

  if (isPending)
    return (
      <Screen>
        <Loader message="Loading review…" />
      </Screen>
    );

  if (error)
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={refetch} retrying={isFetching} />
      </Screen>
    );

  return (
    <Screen>
      <StatusBar style="dark" />
      <StudentPageHeader
        title="Answer Review"
        subtitle={data.examName}
        onBack={navigation.goBack}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary strip */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: colors.successSurface }]}>
            <Text style={[styles.summaryVal, { color: colors.success }]}>{data.correct}</Text>
            <Text style={[styles.summaryLbl, { color: colors.success }]}>Correct</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: colors.errorSurface }]}>
            <Text style={[styles.summaryVal, { color: colors.error }]}>{data.wrong}</Text>
            <Text style={[styles.summaryLbl, { color: colors.error }]}>Wrong</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: colors.warningSurface }]}>
            <Text style={[styles.summaryVal, { color: colors.warning }]}>{data.unanswered}</Text>
            <Text style={[styles.summaryLbl, { color: colors.warning }]}>Skipped</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: colors.dashBg }]}>
            <Text style={styles.summaryVal}>{data.obtainedMarks}/{data.totalMarks}</Text>
            <Text style={styles.summaryLbl}>Marks</Text>
          </View>
        </View>

        {/* Question cards */}
        {data.questions.map((q) => (
          <QuestionCard key={q.index} item={q} number={q.index + 1} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 16, paddingBottom: 40 },

  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 2,
  },
  summaryVal: { fontSize: 18, fontWeight: '900', color: colors.dashText },
  summaryLbl: { fontSize: 10, fontWeight: '600', color: colors.mutedText },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qNumCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dashBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNum: { fontSize: 13, fontWeight: '900', color: colors.dashText },
  metaRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.mutedText, textTransform: 'capitalize' },
  metaDot: { fontSize: 11, color: colors.mutedText },
  verdictBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verdictText: { fontSize: 11, fontWeight: '800' },

  questionContent: { paddingBottom: 4 },

  options: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    gap: 10,
  },
  optionLabel: { fontSize: 14, fontWeight: '900', minWidth: 24 },
  optionContent: { flex: 1 },

  legend: {
    backgroundColor: colors.dashBg,
    borderRadius: 8,
    padding: 10,
  },
  legendText: { fontSize: 13, color: colors.dashText },
});
