import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable style={styles.value}>
        {value || 'Not provided'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 5,
    paddingVertical: 13,
  },
  label: { color: colors.mutedText, fontSize: 12, fontWeight: '700' },
  value: { color: colors.black, fontSize: 16, fontWeight: '600' },
});
