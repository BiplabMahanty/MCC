import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import RelationSelectField from '../../admin/components/RelationSelectField';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import { useSchedule, useSaveSchedule } from '../hooks/useSchedule';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_RE = /^\d{2}:\d{2}$/;

function validate(v) {
  const errors = {};
  if (!v.batchId) errors.batchId = 'Batch is required.';
  if (!v.subjectId) errors.subjectId = 'Subject is required.';
  if (!v.teacherId) errors.teacherId = 'Teacher is required.';
  if (v.dayOfWeek === null) errors.dayOfWeek = 'Select a day.';
  if (!TIME_RE.test(v.startTime)) errors.startTime = 'Use HH:MM format (e.g. 09:00).';
  if (!TIME_RE.test(v.endTime)) errors.endTime = 'Use HH:MM format (e.g. 10:30).';
  if (!errors.startTime && !errors.endTime && v.startTime >= v.endTime)
    errors.endTime = 'End time must be after start time.';
  return errors;
}

function DayPill({ label, selected, onPress }) {
  return (
    <Pressable
      style={[styles.dayPill, selected && styles.dayPillSelected]}
      onPress={onPress}
    >
      <Text style={[styles.dayPillText, selected && styles.dayPillTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FormBody({ record, id, navigation }) {
  const [values, setValues] = useState({
    batchId: record?.batchId?._id ?? record?.batchId ?? '',
    subjectId: record?.subjectId?._id ?? record?.subjectId ?? '',
    teacherId: record?.teacherId?._id ?? record?.teacherId ?? '',
    dayOfWeek: record?.dayOfWeek ?? null,
    startTime: record?.startTime ?? '',
    endTime: record?.endTime ?? '',
    room: record?.room ?? '',
    isActive: record?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  const batchesQuery = useAdminOptions('batches');
  const subjectsQuery = useAdminOptions('subjects');
  const teachersQuery = useAdminOptions('teachers');
  const saveMutation = useSaveSchedule(id);

  function set(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit() {
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await saveMutation.mutateAsync({
        batchId: values.batchId,
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime,
        endTime: values.endTime,
        room: values.room.trim(),
        isActive: values.isActive,
      });
      navigation.goBack();
    } catch (e) {
      if (Array.isArray(e.details)) {
        setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      } else {
        Alert.alert('Error', e.message);
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AdminHeader
          title={id ? 'Edit Slot' : 'Add Schedule Slot'}
          subtitle="Fill in the class time details."
          onBack={navigation.goBack}
        />

        <View style={styles.form}>
          <RelationSelectField
            label="Batch *"
            value={values.batchId}
            options={batchesQuery.data?.data ?? []}
            error={errors.batchId}
            onChange={(v) => set('batchId', v)}
          />

          <RelationSelectField
            label="Subject *"
            value={values.subjectId}
            options={subjectsQuery.data?.data ?? []}
            error={errors.subjectId}
            onChange={(v) => set('subjectId', v)}
          />

          <RelationSelectField
            label="Teacher *"
            value={values.teacherId}
            options={teachersQuery.data?.data ?? []}
            error={errors.teacherId}
            onChange={(v) => set('teacherId', v)}
          />

          {/* Day of week */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Day of Week *</Text>
            <View style={styles.pillRow}>
              {DAYS.map((d, i) => (
                <DayPill
                  key={d}
                  label={d}
                  selected={values.dayOfWeek === i}
                  onPress={() => set('dayOfWeek', i)}
                />
              ))}
            </View>
            {errors.dayOfWeek ? <Text style={styles.fieldError}>{errors.dayOfWeek}</Text> : null}
          </View>

          {/* Time row */}
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <AppInput
                label="Start Time *"
                placeholder="09:00"
                value={values.startTime}
                onChangeText={(v) => set('startTime', v)}
                error={errors.startTime}
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.timeField}>
              <AppInput
                label="End Time *"
                placeholder="10:30"
                value={values.endTime}
                onChangeText={(v) => set('endTime', v)}
                error={errors.endTime}
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <AppInput
            label="Room (optional)"
            placeholder="e.g. Room 101"
            value={values.room}
            onChangeText={(v) => set('room', v)}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={60}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchLabel}>Active</Text>
              <Text style={styles.switchHint}>Inactive slots are hidden from teachers and students.</Text>
            </View>
            <Switch
              value={values.isActive}
              onValueChange={(v) => set('isActive', v)}
              thumbColor={colors.white}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {saveMutation.error ? (
          <Text style={styles.submitError}>{saveMutation.error.message}</Text>
        ) : null}

        <AppButton
          label={saveMutation.isPending ? 'Saving…' : id ? 'Save Changes' : 'Save Schedule'}
          disabled={saveMutation.isPending}
          onPress={submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ScheduleFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const scheduleQuery = useSchedule(id);

  if (id && scheduleQuery.isPending) {
    return <Screen><Loader message="Loading slot…" /></Screen>;
  }

  if (id && scheduleQuery.error) {
    return (
      <Screen>
        <ErrorState
          message={scheduleQuery.error.message}
          onRetry={scheduleQuery.refetch}
          retrying={scheduleQuery.isFetching}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <FormBody
        record={scheduleQuery.data?.data}
        id={id}
        navigation={navigation}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 22, paddingBottom: 28 },
  form: { gap: 16 },

  fieldGroup: { gap: 7 },
  fieldLabel: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
  fieldError: { color: colors.error, fontSize: 12 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayPillSelected: { backgroundColor: colors.dashGreen, borderColor: colors.dashGreen },
  dayPillText: { fontSize: 13, fontWeight: '700', color: colors.mutedText },
  dayPillTextSelected: { color: colors.white },

  timeRow: { flexDirection: 'row', gap: 12 },
  timeField: { flex: 1 },

  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    padding: 14,
  },
  switchCopy: { flex: 1, gap: 4 },
  switchLabel: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
  switchHint: { color: colors.mutedText, fontSize: 12, lineHeight: 17 },

  submitError: {
    backgroundColor: colors.errorSurface,
    borderRadius: 10,
    color: colors.error,
    fontSize: 13,
    padding: 12,
  },
});
