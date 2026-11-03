import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../../../theme/colors';

export default function ExamReplicaModal({
  visible,
  exam,
  onClose,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    name: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    durationMinutes: '',
    totalMarks: '',
    marksPerQuestion: '',
    negativeMarking: false,
    negativeMarks: '',
    instructions: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exam && visible) {
      const startDateTime = exam.startTime ? new Date(exam.startTime) : new Date();
      const endDateTime = exam.endTime ? new Date(exam.endTime) : new Date();

      setFormData({
        name: `${exam.name} (Copy)`,
        startDateTime,
        endDateTime,
        durationMinutes: String(exam.durationMinutes || ''),
        totalMarks: String(exam.totalMarks || ''),
        marksPerQuestion: String(exam.marksPerQuestion || ''),
        negativeMarking: exam.negativeMarking || false,
        negativeMarks: String(exam.negativeMarks || ''),
        instructions: exam.instructions || '',
      });
      setErrors({});
    }
  }, [exam, visible]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(formData.startDateTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      handleChange('startDateTime', newDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.startDateTime);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleChange('startDateTime', newDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(formData.endDateTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      handleChange('endDateTime', newDate);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.endDateTime);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleChange('endDateTime', newDate);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Exam name is required';
    if (formData.endDateTime <= formData.startDateTime) {
      newErrors.endDateTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: formData.name,
      startTime: formData.startDateTime.toISOString(),
      endTime: formData.endDateTime.toISOString(),
    };

    if (formData.durationMinutes) payload.durationMinutes = Number(formData.durationMinutes);
    if (formData.totalMarks) payload.totalMarks = Number(formData.totalMarks);
    if (formData.marksPerQuestion) payload.marksPerQuestion = Number(formData.marksPerQuestion);
    if (formData.negativeMarking !== exam?.negativeMarking) payload.negativeMarking = formData.negativeMarking;
    if (formData.negativeMarks) payload.negativeMarks = Number(formData.negativeMarks);
    if (formData.instructions !== exam?.instructions) payload.instructions = formData.instructions;

    try {
      await onSubmit(payload);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to duplicate exam');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} disabled={loading} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Duplicate Exam</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Exam Name Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exam Details</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Exam Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter new exam name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(v) => handleChange('name', v)}
                editable={!loading}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          </View>

          {/* Date & Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.card}>
              {/* Start Date & Time */}
              <View style={styles.dateTimeGroup}>
                <Text style={styles.label}>Start Date & Time *</Text>
                <View style={styles.dateTimeRow}>
                  <Pressable
                    style={[styles.dateTimeBtn, { flex: 1, marginRight: 8 }]}
                    onPress={() => setShowStartDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={styles.dateTimeBtnLabel}>📅</Text>
                    <Text style={styles.dateTimeBtnText}>{formatDate(formData.startDateTime)}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.dateTimeBtn, { flex: 1 }]}
                    onPress={() => setShowStartTimePicker(true)}
                    disabled={loading}
                  >
                    <Text style={styles.dateTimeBtnLabel}>🕐</Text>
                    <Text style={styles.dateTimeBtnText}>{formatTime(formData.startDateTime)}</Text>
                  </Pressable>
                </View>
              </View>

              {/* End Date & Time */}
              <View style={[styles.dateTimeGroup, { marginTop: 16 }]}>
                <Text style={styles.label}>End Date & Time *</Text>
                <View style={styles.dateTimeRow}>
                  <Pressable
                    style={[styles.dateTimeBtn, { flex: 1, marginRight: 8 }]}
                    onPress={() => setShowEndDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={styles.dateTimeBtnLabel}>📅</Text>
                    <Text style={styles.dateTimeBtnText}>{formatDate(formData.endDateTime)}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.dateTimeBtn, { flex: 1 }]}
                    onPress={() => setShowEndTimePicker(true)}
                    disabled={loading}
                  >
                    <Text style={styles.dateTimeBtnLabel}>🕐</Text>
                    <Text style={styles.dateTimeBtnText}>{formatTime(formData.endDateTime)}</Text>
                  </Pressable>
                </View>
              </View>
              {errors.endDateTime && <Text style={styles.errorText}>{errors.endDateTime}</Text>}
            </View>
          </View>

          {/* Exam Configuration Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <View style={styles.card}>
              {/* Duration */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 60"
                  placeholderTextColor="#999"
                  value={formData.durationMinutes}
                  onChangeText={(v) => handleChange('durationMinutes', v)}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              {/* Total Marks */}
              <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                <Text style={styles.label}>Total Marks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 100"
                  placeholderTextColor="#999"
                  value={formData.totalMarks}
                  onChangeText={(v) => handleChange('totalMarks', v)}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              {/* Marks Per Question */}
              <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                <Text style={styles.label}>Marks Per Question</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1"
                  placeholderTextColor="#999"
                  value={formData.marksPerQuestion}
                  onChangeText={(v) => handleChange('marksPerQuestion', v)}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>

              {/* Negative Marking */}
              <View style={[styles.switchRow, { marginTop: 12 }]}>
                <Text style={styles.label}>Negative Marking</Text>
                <Switch
                  value={formData.negativeMarking}
                  onValueChange={(v) => handleChange('negativeMarking', v)}
                  disabled={loading}
                  trackColor={{ false: '#ddd', true: colors.primary }}
                />
              </View>

              {/* Negative Marks */}
              {formData.negativeMarking && (
                <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>Negative Marks</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 0.25"
                    placeholderTextColor="#999"
                    value={formData.negativeMarks}
                    onChangeText={(v) => handleChange('negativeMarks', v)}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Enter exam instructions (optional)"
                placeholderTextColor="#999"
                value={formData.instructions}
                onChangeText={(v) => handleChange('instructions', v)}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>
          </View>

          {/* Create Button at End */}
          <View style={styles.buttonSection}>
            <Pressable
              style={[styles.createBtn, loading && styles.createBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.createBtnText}>
                {loading ? '⏳ Creating...' : '✓ Create Duplicate'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.startDateTime}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={formData.startDateTime}
            mode="time"
            display="spinner"
            onChange={handleStartTimeChange}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={formData.endDateTime}
            mode="date"
            display="spinner"
            onChange={handleEndDateChange}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={formData.endDateTime}
            mode="time"
            display="spinner"
            onChange={handleEndTimeChange}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.black,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    fontWeight: '500',
  },
  textarea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  dateTimeGroup: {
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
    gap: 8,
  },
  dateTimeBtnLabel: {
    fontSize: 16,
  },
  dateTimeBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.black,
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  buttonSection: {
    paddingVertical: 24,
    paddingHorizontal: 0,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
