import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AppButton from '../../../components/common/AppButton';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useExam } from '../hooks/useExams';
import { useStartAttempt } from '../hooks/useExamAttempt';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function ExamInstructionsScreen({ navigation, route }) {
  const { id } = route.params;
  const {
    data: exam,
    isPending,
    error,
    refetch,
    isFetching,
  } = useExam('student', id);
  const startMutation = useStartAttempt();

  if (isPending)
    return (
      <Screen>
        <Loader message="Loading exam…" />
      </Screen>
    );
  if (error)
    return (
      <Screen>
        <ErrorState
          message={error.message}
          onRetry={refetch}
          retrying={isFetching}
        />
      </Screen>
    );

  async function handleStart() {
    try {
      await startMutation.mutateAsync(id);
      navigation.replace('ExamEngine', { examId: id });
    } catch (e) {
      Alert.alert('Cannot start exam', e.message);
    }
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle="Read carefully before starting"
          title={exam.name}
        />

        <View style={styles.card}>
          <Row label="Duration" value={`${exam.durationMinutes} minutes`} />
          <Row label="Total marks" value={exam.totalMarks} />
          <Row label="Marks / question" value={exam.marksPerQuestion} />
          <Row
            label="Negative marking"
            value={
              exam.negativeMarking ? `−${exam.negativeMarks} per wrong` : 'None'
            }
          />
          <Row label="Questions" value={exam.questions?.length ?? 0} />
        </View>

        {exam.instructions ? (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{exam.instructions}</Text>
          </View>
        ) : null}

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠ Once started, the timer cannot be paused. The exam will
            auto-submit when time expires.
          </Text>
        </View>

        <AppButton
          disabled={startMutation.isPending}
          label={startMutation.isPending ? 'Starting…' : 'Start exam'}
          onPress={handleStart}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32 },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  label: { color: colors.mutedText, fontSize: 14 },
  value: { color: colors.black, fontSize: 14, fontWeight: '700' },
  instructions: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  instructionsTitle: { color: colors.black, fontSize: 16, fontWeight: '800' },
  instructionsText: { color: colors.darkNeutral, fontSize: 14, lineHeight: 22 },
  warning: {
    backgroundColor: colors.warningSurface,
    borderRadius: 12,
    padding: 14,
  },
  warningText: { color: colors.warning, fontSize: 13, lineHeight: 20 },
});
