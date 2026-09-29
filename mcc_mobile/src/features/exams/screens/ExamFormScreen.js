import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import RelationSelectField from '../../admin/components/RelationSelectField';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import { useExamDraft } from '../context/ExamDraftContext';
import { useCreateExam, useUpdateExam } from '../hooks/useExams';

const EXAM_TYPES = [
  { _id: 'practice', name: 'Practice' },
  { _id: 'unit_test', name: 'Unit Test' },
  { _id: 'mid_term', name: 'Mid Term' },
  { _id: 'final', name: 'Final' },
  { _id: 'mock', name: 'Mock' },
];

function toIso(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '';
  const d = new Date(`${dateStr}T${timeStr}:00.000Z`);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function ExamFormScreen({ navigation, route }) {
  const { id, prefill } = route.params ?? {};
  const isEdit = !!id;

  const { draft, setField, initDraft, resetDraft } = useExamDraft();

  // For edit mode: seed the draft once from prefill on mount.
  // For create mode: the draft already holds defaults (or whatever the user
  // previously typed before opening QuestionPicker), so we leave it alone.
  useEffect(() => {
    if (isEdit && prefill) {
      initDraft(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Intentionally empty deps: we only want this to run once on mount.
  // Running it again would overwrite the draft while QuestionPicker is open.

  const [errors, setErrors] = useState({});

  const batches = useAdminOptions('batches');
  const subjects = useAdminOptions('subjects');

  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const saving = createMutation.isPending || updateMutation.isPending;

  function validate() {
    const e = {};
    if (!draft.name.trim()) e.name = 'Required';
    if (!draft.examType) e.examType = 'Required';
    if (!draft.academicSession.trim()) e.academicSession = 'Required';
    if (!draft.batchId) e.batchId = 'Required';
    if (!draft.subjectId) e.subjectId = 'Required';
    if (!draft.durationMinutes || isNaN(Number(draft.durationMinutes)))
      e.durationMinutes = 'Enter a number';
    if (!draft.startDate || !draft.startTime)
      e.startTime = 'Required (YYYY-MM-DD and HH:MM)';
    if (!draft.endDate || !draft.endTime)
      e.endTime = 'Required (YYYY-MM-DD and HH:MM)';
    if (!draft.totalMarks || isNaN(Number(draft.totalMarks)))
      e.totalMarks = 'Enter a number';
    if (!draft.marksPerQuestion || isNaN(Number(draft.marksPerQuestion)))
      e.marksPerQuestion = 'Enter a number';
    if (draft.questionIds.length === 0)
      e.questionIds = 'Select at least one question';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const body = {
      name: draft.name.trim(),
      examType: draft.examType,
      academicSession: draft.academicSession.trim(),
      batchId: draft.batchId,
      subjectId: draft.subjectId,
      questionIds: draft.questionIds,
      durationMinutes: Number(draft.durationMinutes),
      startTime: toIso(draft.startDate, draft.startTime),
      endTime: toIso(draft.endDate, draft.endTime),
      totalMarks: Number(draft.totalMarks),
      marksPerQuestion: Number(draft.marksPerQuestion),
      negativeMarking: Number(draft.negativeMarks) > 0,
      negativeMarks: Number(draft.negativeMarks),
      instructions: draft.instructions.trim(),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, body });
      } else {
        await createMutation.mutateAsync(body);
      }
      resetDraft();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', e.message);
    }
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AdminHeader
          onBack={() => {
            resetDraft();
            navigation.goBack();
          }}
          subtitle={
            isEdit ? 'Update exam details.' : 'Fill in the exam details.'
          }
          title={isEdit ? 'Edit exam' : 'Create exam'}
        />

        <AppInput
          error={errors.name}
          label="Exam name"
          onChangeText={(v) => setField('name', v)}
          placeholder="e.g. Unit Test 1"
          value={draft.name}
        />

        <RelationSelectField
          error={errors.examType}
          label="Exam type"
          onChange={(v) => setField('examType', v)}
          options={EXAM_TYPES}
          value={draft.examType}
        />

        <AppInput
          error={errors.academicSession}
          label="Academic session"
          onChangeText={(v) => setField('academicSession', v)}
          placeholder="e.g. 2025-26"
          value={draft.academicSession}
        />

        <RelationSelectField
          error={errors.batchId}
          label="Batch"
          onChange={(v) => setField('batchId', v)}
          options={batches.data?.data ?? []}
          value={draft.batchId}
        />

        <RelationSelectField
          error={errors.subjectId}
          label="Subject"
          onChange={(v) => setField('subjectId', v)}
          options={subjects.data?.data ?? []}
          value={draft.subjectId}
        />

        <AppInput
          error={errors.durationMinutes}
          keyboardType="numeric"
          label="Duration (minutes)"
          onChangeText={(v) => setField('durationMinutes', v)}
          placeholder="e.g. 60"
          value={draft.durationMinutes}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput
              error={errors.startTime}
              label="Start date (YYYY-MM-DD)"
              onChangeText={(v) => setField('startDate', v)}
              placeholder="2025-12-01"
              value={draft.startDate}
            />
          </View>
          <View style={styles.half}>
            <AppInput
              label="Start time (HH:MM UTC)"
              onChangeText={(v) => setField('startTime', v)}
              placeholder="09:00"
              value={draft.startTime}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput
              error={errors.endTime}
              label="End date (YYYY-MM-DD)"
              onChangeText={(v) => setField('endDate', v)}
              placeholder="2025-12-01"
              value={draft.endDate}
            />
          </View>
          <View style={styles.half}>
            <AppInput
              label="End time (HH:MM UTC)"
              onChangeText={(v) => setField('endTime', v)}
              placeholder="10:00"
              value={draft.endTime}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput
              error={errors.totalMarks}
              keyboardType="numeric"
              label="Total marks"
              onChangeText={(v) => setField('totalMarks', v)}
              placeholder="100"
              value={draft.totalMarks}
            />
          </View>
          <View style={styles.half}>
            <AppInput
              error={errors.marksPerQuestion}
              keyboardType="numeric"
              label="Marks / question"
              onChangeText={(v) => setField('marksPerQuestion', v)}
              placeholder="2"
              value={draft.marksPerQuestion}
            />
          </View>
        </View>

        <AppInput
          keyboardType="numeric"
          label="Negative marks (0 = disabled)"
          onChangeText={(v) => setField('negativeMarks', v)}
          placeholder="0.5"
          value={draft.negativeMarks}
        />

        <AppInput
          label="Instructions (optional)"
          multiline
          numberOfLines={4}
          onChangeText={(v) => setField('instructions', v)}
          placeholder="Write exam instructions here…"
          style={styles.multiline}
          value={draft.instructions}
        />

        <View style={styles.questionSection}>
          <Text style={styles.sectionLabel}>
            Questions selected: {draft.questionIds.length}
          </Text>
          {errors.questionIds ? (
            <Text style={styles.fieldError}>{errors.questionIds}</Text>
          ) : null}
          <AppButton
            label="Pick questions from bank"
            onPress={() =>
              navigation.navigate('QuestionPicker', {
                subjectId: draft.subjectId,
              })
            }
          />
        </View>

        <AppButton
          disabled={saving}
          label={saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create exam'}
          onPress={handleSave}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  multiline: { height: 100, textAlignVertical: 'top' },
  questionSection: { gap: 8 },
  sectionLabel: { color: colors.black, fontSize: 14, fontWeight: '700' },
  fieldError: { color: colors.error, fontSize: 12 },
});
