import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import colors from '../../theme/colors';

// Converts separate date string (YYYY-MM-DD) and time string (HH:MM) to a Date object.
// Treated as IST (UTC+5:30) — no Z suffix so the picker shows local time.
function toDate(dateStr, timeStr) {
  if (!dateStr) return new Date();
  const base = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  const d = new Date(base);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Format a Date to IST date string YYYY-MM-DD
function toISTDateStr(d) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA gives YYYY-MM-DD
}

// Format a Date to IST time string HH:MM
function toISTTimeStr(d) {
  return d.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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
      ? `${dateValue}  ${timeValue} IST`
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
          onChangeDateStr(toISTDateStr(selected));
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
          onChangeTimeStr(toISTTimeStr(selected));
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
