import { Pressable, StyleSheet, Text } from 'react-native';

import colors from '../../../theme/colors';

export default function SummaryCard({ label, value, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 7,
    minHeight: 105,
    padding: 16,
  },
  pressed: { opacity: 0.75 },
  value: { color: colors.primary, fontSize: 25, fontWeight: '900' },
  label: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
});
