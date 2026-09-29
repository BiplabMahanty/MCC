import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AppButton from '../../../components/common/AppButton';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useExam, usePublishExam, useUnpublishExam } from '../hooks/useExams';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

export default function ExamDetailScreen({ navigation, route }) {
  const { role, id } = route.params;
  const {
    data: exam,
    isPending,
    error,
    refetch,
    isFetching,
  } = useExam(role, id);
  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();

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

  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  async function handlePublish() {
    try {
      await publishMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function handleUnpublish() {
    try {
      await unpublishMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={exam.subjectId?.name}
          title={exam.name}
        />

        <View style={styles.card}>
          <Row label="Type" value={exam.examType?.replace('_', ' ')} />
          <Row label="Session" value={exam.academicSession} />
          <Row label="Batch" value={exam.batchId?.name} />
          <Row label="Subject" value={exam.subjectId?.name} />
          <Row
            label="Start"
            value={
              exam.startTime ? new Date(exam.startTime).toLocaleString() : '—'
            }
          />
          <Row
            label="End"
            value={exam.endTime ? new Date(exam.endTime).toLocaleString() : '—'}
          />
          <Row label="Duration" value={`${exam.durationMinutes} minutes`} />
          <Row label="Total marks" value={exam.totalMarks} />
          <Row label="Marks / question" value={exam.marksPerQuestion} />
          <Row
            label="Negative marking"
            value={
              exam.negativeMarking ? `−${exam.negativeMarks} per wrong` : 'No'
            }
          />
          <Row
            label="Questions"
            value={exam.questions?.length ?? exam.questionIds?.length ?? 0}
          />
          <Row label="Status" value={exam.status?.toUpperCase()} />
        </View>

        {exam.instructions ? (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{exam.instructions}</Text>
          </View>
        ) : null}

        {isAdmin && exam.status === 'draft' && (
          <AppButton
            disabled={publishMutation.isPending}
            label={publishMutation.isPending ? 'Publishing…' : 'Publish exam'}
            onPress={handlePublish}
          />
        )}

        {isAdmin && exam.status === 'published' && (
          <AppButton
            disabled={unpublishMutation.isPending}
            label={
              unpublishMutation.isPending ? 'Unpublishing…' : 'Unpublish exam'
            }
            onPress={handleUnpublish}
          />
        )}

        {isAdmin && exam.status === 'draft' && (
          <AppButton
            label="Edit exam"
            onPress={() =>
              navigation.navigate('ExamForm', {
                role,
                id,
                prefill: {
                  name: exam.name,
                  examType: exam.examType,
                  academicSession: exam.academicSession,
                  batchId: exam.batchId?._id,
                  subjectId: exam.subjectId?._id,
                  durationMinutes: exam.durationMinutes,
                  totalMarks: exam.totalMarks,
                  marksPerQuestion: exam.marksPerQuestion,
                  negativeMarks: exam.negativeMarks,
                  instructions: exam.instructions,
                  questionIds: exam.questionIds ?? [],
                },
              })
            }
          />
        )}

        {isStudent && exam.status === 'published' && (
          <AppButton
            label="Start exam"
            onPress={() => navigation.navigate('ExamInstructions', { id })}
          />
        )}

        {!isAdmin && !isStudent && (
          <AppButton
            label="Open analytics"
            onPress={() =>
              navigation.navigate('TeacherExamAnalytics', {
                examId: id,
                examName: exam.name,
              })
            }
          />
        )}
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
    gap: 2,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  rowLabel: { color: colors.mutedText, fontSize: 14 },
  rowValue: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
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
});
