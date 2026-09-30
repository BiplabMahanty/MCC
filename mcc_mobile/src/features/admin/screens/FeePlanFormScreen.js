import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Loader from '../../../components/common/Loader';
import ErrorState from '../../../components/common/ErrorState';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import DateTimePickerField from '../../../components/common/DateTimePickerField';
import RelationSelectField from '../components/RelationSelectField';
import colors from '../../../theme/colors';
import { useCreateFeePlan, useFeePlan, useUpdateFeePlan, useBatchOptions } from '../hooks/useFees';

const FEE_TYPES = [
  { value: 'monthly',   label: 'Monthly',   icon: '📅' },
  { value: 'quarterly', label: 'Quarterly', icon: '📆' },
  { value: 'yearly',    label: 'Yearly',    icon: '🗓️' },
  { value: 'one_time',  label: 'One-Time',  icon: '💵' },
  { value: 'custom',    label: 'Custom',    icon: '⚙️' },
];

function InstallmentEditor({ installments, onChange }) {
  function add() {
    onChange([...installments, { label: '', amount: '', dueDate: '' }]);
  }
  function remove(i) {
    onChange(installments.filter((_, idx) => idx !== i));
  }
  function update(i, field, value) {
    onChange(installments.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.installmentHeader}>
        <Text style={styles.fieldLabel}>Installments *</Text>
        <Pressable onPress={add} style={styles.addInstBtn}>
          <Text style={styles.addInstBtnText}>+ Add</Text>
        </Pressable>
      </View>
      {installments.length === 0 ? (
        <Text style={styles.emptyHint}>No installments yet. Tap + Add.</Text>
      ) : null}
      {installments.map((item, i) => (
        <View key={i} style={styles.installmentRow}>
          <View style={styles.installmentFields}>
            <AppInput
              label={`#${i + 1} Label`}
              placeholder="e.g. 1st Installment"
              value={item.label}
              onChangeText={(v) => update(i, 'label', v)}
            />
            <View style={styles.twoCol}>
              <View style={styles.flex1}>
                <AppInput
                  label="Amount (₹)"
                  inputMode="decimal"
                  placeholder="0"
                  value={item.amount}
                  onChangeText={(v) => update(i, 'amount', v)}
                />
              </View>
              <View style={styles.flex1}>
                <DateTimePickerField
                  dateOnly
                  label="Due Date"
                  dateValue={item.dueDate}
                  onChangeDateStr={(v) => update(i, 'dueDate', v)}
                />
              </View>
            </View>
          </View>
          <Pressable onPress={() => remove(i)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function FeePlanForm({ editing, record, navigation }) {
  const batchQuery = useBatchOptions();
  const batches = batchQuery.data?.data ?? [];

  const [batchId, setBatchId] = useState(record?.batchId?._id ?? record?.batchId ?? '');
  const [name, setName] = useState(record?.name ?? '');
  const [type, setType] = useState(record?.type ?? 'monthly');
  const [amount, setAmount] = useState(record?.amount ? String(record.amount) : '');
  const [startDate, setStartDate] = useState(record?.startDate ? String(record.startDate).slice(0, 10) : '');
  const [endDate, setEndDate] = useState(record?.endDate ? String(record.endDate).slice(0, 10) : '');
  const [installments, setInstallments] = useState(
    record?.installments?.map((i) => ({
      label: i.label,
      amount: String(i.amount),
      dueDate: String(i.dueDate).slice(0, 10),
    })) ?? [],
  );
  const [description, setDescription] = useState(record?.description ?? '');
  const [isActive, setIsActive] = useState(record?.isActive ?? true);
  const [errors, setErrors] = useState({});

  const createMutation = useCreateFeePlan();
  const updateMutation = useUpdateFeePlan(record?._id);
  const saveMutation = editing ? updateMutation : createMutation;

  const isRecurring = ['monthly', 'quarterly', 'yearly'].includes(type);
  const isOneTime = type === 'one_time';
  const isCustom = type === 'custom';

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Plan name is required.';
    if (!editing && !batchId) e.batchId = 'Batch is required.';
    if (isCustom) {
      if (!installments.length) e.installments = 'Add at least one installment.';
    } else {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
        e.amount = 'Enter a valid amount.';
      if (isRecurring) {
        if (!startDate) e.startDate = 'Start date is required.';
        if (!endDate) e.endDate = 'End date is required.';
        if (startDate && endDate && endDate <= startDate)
          e.endDate = 'End date must be after start date.';
      }
      if (isOneTime && !startDate) e.startDate = 'Due date is required.';
    }
    return e;
  }

  async function submit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const body = { name: name.trim(), description: description.trim(), isActive };
    if (!editing) { body.batchId = batchId; body.type = type; }

    if (isCustom) {
      body.installments = installments.map((i) => ({
        label: i.label.trim(),
        amount: parseFloat(i.amount),
        dueDate: i.dueDate,
      }));
    } else {
      body.amount = parseFloat(amount);
      if (isRecurring) { body.startDate = startDate; body.endDate = endDate; }
      if (isOneTime) { body.startDate = startDate; }
    }

    try {
      await saveMutation.mutateAsync(body);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save failed', err.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── GREEN HEADER ── */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={styles.headerTop}>
              <Pressable onPress={navigation.goBack} style={styles.backBtn}>
                <Text style={styles.backText}>‹ Back</Text>
              </Pressable>
            </View>
            <View style={styles.headerIconRow}>
              <View style={styles.headerIconCircle}>
                <Text style={styles.headerIcon}>{editing ? '✏️' : '💳'}</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>{editing ? 'Edit Fee Plan' : 'Add Fee Plan'}</Text>
                <Text style={styles.headerSub}>Required fields are validated before saving</Text>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.waveBump} />
        </View>

        {/* ── FORM BODY ── */}
        <View style={styles.formBody}>
          <View style={styles.section}>
            <AppInput
              label="Plan Name *"
              placeholder="e.g. Monthly Tuition - Batch A"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              error={errors.name}
            />

            {!editing ? (
              <RelationSelectField
                label="Batch *"
                value={batchId}
                options={batches}
                error={errors.batchId}
                onChange={(v) => { setBatchId(v); setErrors((e) => ({ ...e, batchId: undefined })); }}
              />
            ) : null}

            {/* Fee Type selector */}
            {!editing ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Fee Type *</Text>
                <View style={styles.typeGrid}>
                  {FEE_TYPES.map((t) => {
                    const selected = type === t.value;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() => setType(t.value)}
                        style={[styles.typeCard, selected && styles.typeCardSelected]}
                      >
                        <Text style={styles.typeIcon}>{t.icon}</Text>
                        <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.readonlyRow}>
                <Text style={styles.fieldLabel}>Fee Type</Text>
                <View style={styles.readonlyValue}>
                  <Text style={styles.readonlyText}>
                    {FEE_TYPES.find((t) => t.value === type)?.icon}{'  '}
                    {FEE_TYPES.find((t) => t.value === type)?.label ?? type}
                  </Text>
                </View>
              </View>
            )}

            {/* Dynamic fields */}
            {isCustom ? (
              <>
                <InstallmentEditor installments={installments} onChange={setInstallments} />
                {errors.installments ? <Text style={styles.errorText}>{errors.installments}</Text> : null}
              </>
            ) : (
              <>
                <AppInput
                  label="Amount (₹) *"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={(v) => { setAmount(v); setErrors((e) => ({ ...e, amount: undefined })); }}
                  error={errors.amount}
                />
                <DateTimePickerField
                  dateOnly
                  label={isOneTime ? 'Due Date *' : 'Start Date *'}
                  dateValue={startDate}
                  onChangeDateStr={(v) => { setStartDate(v); setErrors((e) => ({ ...e, startDate: undefined })); }}
                  error={errors.startDate}
                />
                {isRecurring ? (
                  <DateTimePickerField
                    dateOnly
                    label="End Date *"
                    dateValue={endDate}
                    onChangeDateStr={(v) => { setEndDate(v); setErrors((e) => ({ ...e, endDate: undefined })); }}
                    error={errors.endDate}
                  />
                ) : null}
              </>
            )}

            <AppInput
              label="Description"
              placeholder="Optional notes"
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.multiline}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.switchLabel}>Active</Text>
                <Text style={styles.switchHint}>Inactive plans are hidden from new records.</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                thumbColor={colors.white}
                trackColor={{ false: colors.border, true: colors.dashGreen }}
              />
            </View>
          </View>

          {saveMutation.error ? (
            <Text style={styles.submitError}>{saveMutation.error.message}</Text>
          ) : null}

          <AppButton
            label={saveMutation.isPending ? 'Saving…' : 'Save Fee Plan'}
            onPress={submit}
            disabled={saveMutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function FeePlanFormScreen({ navigation, route }) {
  const { id } = route.params ?? {};
  const editing = Boolean(id);
  const planQuery = useFeePlan(id);

  if (editing && planQuery.isPending) {
    return (
      <View style={styles.loaderRoot}>
        <StatusBar style="dark" />
        <Loader message="Loading fee plan…" />
      </View>
    );
  }
  if (editing && planQuery.error) {
    return (
      <View style={styles.loaderRoot}>
        <ErrorState message={planQuery.error.message} onRetry={planQuery.refetch} retrying={planQuery.isFetching} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <FeePlanForm editing={editing} record={planQuery.data?.data} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  loaderRoot: { flex: 1, backgroundColor: colors.dashBg, justifyContent: 'center' },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Header
  header: { backgroundColor: colors.dashGreen, paddingBottom: 24 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: { marginTop: 8 },
  backBtn: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  waveBump: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Form body
  formBody: { padding: 16, gap: 20 },
  section: { gap: 16 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: colors.dashText },

  // Type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.dashCard,
  },
  typeCardSelected: { backgroundColor: colors.dashGreen, borderColor: colors.dashGreen },
  typeIcon: { fontSize: 16 },
  typeLabel: { fontSize: 13, fontWeight: '700', color: colors.dashSubText },
  typeLabelSelected: { color: '#fff' },

  // Installments
  installmentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addInstBtn: {
    backgroundColor: colors.dashGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addInstBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  emptyHint: { fontSize: 13, color: colors.dashSubText, textAlign: 'center', paddingVertical: 10 },
  installmentRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  installmentFields: { flex: 1, gap: 8 },
  twoCol: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  removeBtnText: { color: colors.error, fontSize: 14, fontWeight: '900' },
  errorText: { fontSize: 12, color: colors.error },

  // Readonly
  readonlyRow: { gap: 7 },
  readonlyValue: {
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  readonlyText: { fontSize: 15, color: colors.dashSubText },

  multiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dashCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    gap: 16,
  },
  switchCopy: { flex: 1, gap: 4 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: colors.dashText },
  switchHint: { fontSize: 12, color: colors.dashSubText, lineHeight: 17 },
  submitError: {
    backgroundColor: colors.errorSurface,
    borderRadius: 10,
    color: colors.error,
    fontSize: 13,
    padding: 12,
  },
});
