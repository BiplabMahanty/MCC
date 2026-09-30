import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import colors from '../../theme/colors';

// Converts separate date string (YYYY-MM-DD) and time string (HH:MM) to a Date object.
function toDate(dateStr, timeStr) {
  if (!dateStr) return new Date();
  const base = timeStr ? `${dateStr}T${timeStr}:00.000Z` : `${dateStr}T00:00:00.000Z`;
  const d = new Date(base);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function DateTimePickerField({
  label,
  dateValue,
  timeValue,
  onChangeDateStr,
  onChangeTimeStr,
  error,
  dateOnly = false,
}) {
  const [mode, setMode] = useState(null); // 'date' | 'time' | null

  const displayText = dateOnly
    ? dateValue || 'Tap to select'
    : dateValue && timeValue
      ? `${dateValue}  ${timeValue} UTC`
      : dateValue
        ? dateValue
        : 'Tap to select';

  function handleChange(event, selected) {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setMode(null);
        return;
      }
      if (mode === 'date') {
        if (selected) {
          onChangeDateStr(selected.toISOString().slice(0, 10));
        }
        if (dateOnly) {
          setMode(null);
        } else {
          setMode('time');
        }
        return;
      }
      if (mode === 'time') {
        if (selected) {
          onChangeTimeStr(selected.toISOString().slice(11, 16));
        }
        setMode(null);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setMode('date')}
        style={[styles.button, error && styles.buttonError]}
      >
        <Text style={[styles.text, !dateValue && styles.placeholder]}>
          {displayText}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode !== null && (
        <DateTimePicker
          display="default"
          mode={mode}
          onChange={handleChange}
          value={toDate(dateValue, timeValue)}
        />
      )}
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
