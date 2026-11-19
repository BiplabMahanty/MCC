import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import colors from '../../theme/colors';

function toDate(timeValue) {
  const [hours, minutes] = String(timeValue || '00:00')
    .split(':')
    .map(Number);
  const value = new Date();
  value.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
  return value;
}

function toTimeString(value) {
  return [value.getHours(), value.getMinutes()]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export default function TimePicker({ label, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  function handleChange(event, selected) {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'dismissed' || !selected) return;
    }
    if (selected) onChange(toTimeString(selected));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value ? `currently ${value}` : 'not selected'}`}
        onPress={() => setOpen(true)}
        style={[styles.button, error && styles.buttonError]}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || 'Select time (IST)'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {open ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode="time"
          value={toDate(value)}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
  button: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonError: { borderColor: colors.error },
  text: { color: colors.black, fontSize: 16 },
  placeholder: { color: colors.mutedText },
  error: { color: colors.error, fontSize: 12 },
});
