import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import DateTimePickerField from '../../../components/common/DateTimePickerField';
import colors from '../../../theme/colors';

const METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordPaymentModal({ visible, record, onClose, onSubmit, loading }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [paidAt, setPaidAt] = useState(today());
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  const remaining = record ? record.amount - record.paidAmount : 0;

  function reset() {
    setAmount('');
    setMethod('cash');
    setPaidAt(today());
    setReference('');
    setNote('');
    setErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  function validate() {
    const e = {};
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) e.amount = 'Enter a valid amount.';
    else if (num > remaining + 0.01) e.amount = `Cannot exceed remaining ₹${remaining}.`;
    if (!paidAt || !/^\d{4}-\d{2}-\d{2}$/.test(paidAt)) e.paidAt = 'Use YYYY-MM-DD format.';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await onSubmit({
        feeRecordId: record._id,
        amount: parseFloat(amount),
        paidAt,
        method,
        reference: reference.trim(),
        note: note.trim(),
      });
      reset();
    } catch (err) {
      Alert.alert('Payment failed', err.message);
    }
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Record Payment</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.close}>Cancel</Text>
            </Pressable>
          </View>

          {record ? (
            <View style={styles.recordInfo}>
              <Text style={styles.recordLabel}>{record.label}</Text>
              <Text style={styles.recordMeta}>
                Due ₹{record.amount}  •  Paid ₹{record.paidAmount}  •  Remaining ₹{remaining}
              </Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            <AppInput
              label="Amount (₹) *"
              inputMode="decimal"
              placeholder={`Max ₹${remaining}`}
              value={amount}
              onChangeText={(v) => { setAmount(v); setErrors((e) => ({ ...e, amount: undefined })); }}
              error={errors.amount}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Payment Method *</Text>
              <View style={styles.pillRow}>
                {METHODS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMethod(m)}
                    style={[styles.pill, method === m && styles.pillSelected]}
                  >
                    <Text style={[styles.pillText, method === m && styles.pillTextSelected]}>
                      {m.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <DateTimePickerField
              dateOnly
              label="Payment Date *"
              dateValue={paidAt}
              onChangeDateStr={(v) => { setPaidAt(v); setErrors((e) => ({ ...e, paidAt: undefined })); }}
              error={errors.paidAt}
            />

            <AppInput
              label="Reference / Transaction ID"
              placeholder="Optional"
              value={reference}
              onChangeText={setReference}
            />

            <AppInput
              label="Note"
              placeholder="Optional"
              value={note}
              onChangeText={setNote}
              multiline
              style={styles.multiline}
            />

            <AppButton
              label={loading ? 'Saving…' : 'Record Payment'}
              onPress={handleSubmit}
              disabled={loading}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '900', color: colors.black },
  close: { fontSize: 14, fontWeight: '800', color: colors.primary },
  recordInfo: {
    backgroundColor: colors.lightNeutral,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  recordLabel: { fontSize: 14, fontWeight: '800', color: colors.darkNeutral },
  recordMeta: { fontSize: 12, color: colors.mutedText },
  form: { gap: 16, paddingBottom: 16 },
  fieldGroup: { gap: 7 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: colors.darkNeutral },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  pillSelected: { backgroundColor: colors.black, borderColor: colors.black },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.mutedText },
  pillTextSelected: { color: colors.white },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
